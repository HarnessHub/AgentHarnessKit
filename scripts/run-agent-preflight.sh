#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ "${AGENT_HARNESS_KIT_PREFLIGHT_ACTIVE:-0}" == "1" ]]; then
  echo "Agent preflight is already running; skipping recursive invocation."
  exit 0
fi
export AGENT_HARNESS_KIT_PREFLIGHT_ACTIVE=1

REVIEW_FILE="${AGENT_HARNESS_KIT_REVIEW_FILE:-$ROOT_DIR/.codex-review}"
REVIEW_PROOF_FILE="${AGENT_HARNESS_KIT_REVIEW_PROOF_FILE:-$ROOT_DIR/.codex-review-proof}"
BASE_REF="${AGENT_HARNESS_KIT_PREFLIGHT_BASE_REF:-upstream/main}"
PLACEHOLDER_TEXT="${AGENT_HARNESS_KIT_REVIEW_PLACEHOLDER:-native /review has not been run yet}"
RUN_SMOKE="${AGENT_HARNESS_KIT_PREFLIGHT_RUN_SMOKE:-0}"
ENFORCE_ISSUE_STATE="${AGENT_HARNESS_KIT_PREFLIGHT_ENFORCE_ISSUE_STATE:-0}"
CHECK_DELIVERY_STATE="${AGENT_HARNESS_KIT_PREFLIGHT_CHECK_DELIVERY_STATE:-0}"
ALLOW_READY_TO_DELIVER="${AGENT_HARNESS_KIT_PREFLIGHT_ALLOW_READY_TO_DELIVER:-0}"
BUILD_COMMAND="${AGENT_HARNESS_KIT_PREFLIGHT_BUILD_COMMAND:-npm run build}"
TEST_COMMAND="${AGENT_HARNESS_KIT_PREFLIGHT_TEST_COMMAND:-npm test}"
SMOKE_COMMAND="${AGENT_HARNESS_KIT_PREFLIGHT_SMOKE_COMMAND:-./scripts/run-cli-smoke.sh}"
ORIGIN_URL="${AGENT_HARNESS_KIT_PREFLIGHT_ORIGIN_URL:-$(git remote get-url origin 2>/dev/null || true)}"
UPSTREAM_URL="${AGENT_HARNESS_KIT_PREFLIGHT_UPSTREAM_URL:-$(git remote get-url upstream 2>/dev/null || true)}"
CURRENT_BRANCH="${AGENT_HARNESS_KIT_PREFLIGHT_CURRENT_BRANCH:-$(git branch --show-current 2>/dev/null || true)}"

extract_repo() {
  local remote_url="$1"
  if [[ "$remote_url" =~ github\.com[:/]([^/]+)/([^/.]+?)(\.git)?$ ]]; then
    echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    return 0
  fi
  return 1
}

extract_owner() {
  local remote_url="$1"
  if [[ "$remote_url" =~ github\.com[:/]([^/]+)/[^/]+(\.git)?$ ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi
  return 1
}

read_review_proof_value() {
  local key="$1"
  sed -n "s/^${key}=//p" "$REVIEW_PROOF_FILE" | head -n 1
}

read_review_value() {
  local key="$1"
  sed -n "s/^${key}: //p" "$REVIEW_FILE" | head -n 1
}

check_review_note() {
  if [[ ! -f "$REVIEW_FILE" ]]; then
    echo "Preflight failed: missing .codex-review"
    exit 1
  fi

  if ! grep -Eq '^scope reviewed:' "$REVIEW_FILE" \
    || ! grep -Eq '^head reviewed:' "$REVIEW_FILE" \
    || ! grep -Eq '^findings:' "$REVIEW_FILE" \
    || ! grep -Eq '^remaining risks:' "$REVIEW_FILE"; then
    echo "Preflight failed: .codex-review exists but is incomplete"
    exit 1
  fi

  if grep -Fq "$PLACEHOLDER_TEXT" "$REVIEW_FILE"; then
    echo "Preflight failed: .codex-review still contains the checkpoint placeholder"
    exit 1
  fi
}

check_review_proof() {
  local current_head
  local current_branch
  local proof_head
  local proof_branch
  local reviewed_head

  if [[ ! -f "$REVIEW_PROOF_FILE" ]]; then
    echo "Preflight failed: missing .codex-review-proof"
    exit 1
  fi

  current_head="$(git rev-parse HEAD)"
  current_branch="$CURRENT_BRANCH"
  proof_head="$(read_review_proof_value head_sha)"
  proof_branch="$(read_review_proof_value branch)"

  if [[ -z "$proof_head" ]]; then
    echo "Preflight failed: .codex-review-proof is missing head_sha"
    exit 1
  fi

  if [[ "$proof_head" != "$current_head" ]]; then
    echo "Preflight failed: .codex-review-proof does not match the current HEAD"
    exit 1
  fi

  if [[ -n "$current_branch" ]] && [[ -n "$proof_branch" ]] && [[ "$proof_branch" != "$current_branch" ]]; then
    echo "Preflight failed: .codex-review-proof was generated for a different branch"
    exit 1
  fi

  reviewed_head="$(read_review_value "head reviewed")"
  if [[ -z "$reviewed_head" ]]; then
    echo "Preflight failed: .codex-review is missing head reviewed"
    exit 1
  fi

  if [[ "$reviewed_head" != "$current_head" ]]; then
    echo "Preflight failed: .codex-review does not record the current HEAD"
    exit 1
  fi
}

check_branch_freshness() {
  if [[ "${BYPASS_BRANCH_FRESHNESS_CHECK:-}" == "1" ]]; then
    echo "Bypassing branch freshness check because BYPASS_BRANCH_FRESHNESS_CHECK=1"
    return 0
  fi

  if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
    echo "Skipping branch freshness check: base ref $BASE_REF is unavailable"
    return 0
  fi

  if ! git merge-base --is-ancestor "$BASE_REF" HEAD; then
    echo "Preflight failed: current branch does not contain the latest $BASE_REF"
    exit 1
  fi
}

check_issue_state() {
  local output
  local status

  set +e
  output="$(node "$ROOT_DIR/scripts/codex-pm.mjs" issue-state-check 2>&1)"
  status=$?
  set -e

  if [[ $status -eq 0 ]]; then
    echo "$output"
    return 0
  fi

  echo "$output"
  if [[ "$ENFORCE_ISSUE_STATE" == "1" ]]; then
    exit 1
  fi
  echo "Continuing without enforced issue-state check. Set AGENT_HARNESS_KIT_PREFLIGHT_ENFORCE_ISSUE_STATE=1 to require it."
}

check_delivery_state() {
  local output
  local status
  local args=()

  if [[ "$CHECK_DELIVERY_STATE" != "1" ]]; then
    echo "Skipping delivery-state check. Set AGENT_HARNESS_KIT_PREFLIGHT_CHECK_DELIVERY_STATE=1 to enable it."
    return 0
  fi

  if [[ "$ALLOW_READY_TO_DELIVER" == "1" ]]; then
    args+=("--allow-ready-to-deliver")
  fi

  set +e
  output="$(node "$ROOT_DIR/scripts/codex-pm.mjs" delivery-state-check "${args[@]}" 2>&1)"
  status=$?
  set -e

  echo "$output"
  if [[ $status -ne 0 ]]; then
    exit 1
  fi
}

check_merged_pr_branch_reuse() {
  local owner
  local base_repo
  local merged_pr_json

  if [[ -z "$CURRENT_BRANCH" ]]; then
    return 0
  fi

  if ! command -v gh >/dev/null 2>&1; then
    echo "Skipping merged-branch check: gh is unavailable"
    return 0
  fi

  if ! owner="$(extract_owner "$ORIGIN_URL")" || ! base_repo="$(extract_repo "$UPSTREAM_URL")"; then
    echo "Skipping merged-branch check: GitHub remotes are unavailable"
    return 0
  fi

  merged_pr_json="$(
    gh pr list \
      --repo "$base_repo" \
      --head "$owner:$CURRENT_BRANCH" \
      --state merged \
      --json number,url \
      2>/dev/null || true
  )"

  if [[ "$merged_pr_json" != "[]" ]] && [[ -n "$merged_pr_json" ]]; then
    echo "Preflight failed: the current branch already has a merged PR in $base_repo"
    echo "Create a new branch from $BASE_REF for follow-up work instead of continuing on $CURRENT_BRANCH."
    exit 1
  fi
}

run_local_pr_closure_check() {
  local changed_files
  local pr_body
  local body_input=()

  if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
    echo "Skipping PR closure sync check: base ref $BASE_REF is unavailable"
    return 0
  fi

  changed_files="$(git diff --name-only "$BASE_REF"...HEAD)"
  if [[ -z "$changed_files" ]]; then
    return 0
  fi

  if ! command -v gh >/dev/null 2>&1; then
    echo "Skipping PR closure sync check: gh is unavailable"
    return 0
  fi

  pr_body="$(gh pr view --json body --jq .body 2>/dev/null || true)"
  if [[ -z "$pr_body" ]]; then
    echo "Skipping PR closure sync check: PR body is unavailable"
    return 0
  fi

  while IFS= read -r changed_path; do
    [[ -n "$changed_path" ]] || continue
    body_input+=("--changed-file" "$changed_path")
  done <<< "$changed_files"

  node "$ROOT_DIR/scripts/codex-pm.mjs" verify-pr-closure-sync --pr-body "$pr_body" "${body_input[@]}"
}

echo "Running agent preflight in $ROOT_DIR"

check_branch_freshness
check_merged_pr_branch_reuse
check_review_note
check_review_proof
check_issue_state
check_delivery_state

echo "Running build"
bash -lc "$BUILD_COMMAND"

echo "Running tests"
bash -lc "$TEST_COMMAND"

echo "Running local PR closure sync check if PR body is available"
run_local_pr_closure_check

if [[ "$RUN_SMOKE" == "1" ]]; then
  echo "Running CLI smoke validation"
  bash -lc "$SMOKE_COMMAND"
fi

echo "Agent preflight passed."
