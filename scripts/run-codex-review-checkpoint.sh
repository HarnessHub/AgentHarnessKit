#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REVIEW_FILE="${AGENT_HARNESS_KIT_REVIEW_FILE:-$ROOT_DIR/.codex-review}"
REVIEW_PROOF_FILE="${AGENT_HARNESS_KIT_REVIEW_PROOF_FILE:-$ROOT_DIR/.codex-review-proof}"
BASE_REF="${AGENT_HARNESS_KIT_REVIEW_BASE_REF:-upstream/main}"
PLACEHOLDER_TEXT="${AGENT_HARNESS_KIT_REVIEW_PLACEHOLDER:-native /review has not been run yet}"
BRANCH_NAME="$(git branch --show-current 2>/dev/null || true)"
HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || echo "uncommitted")"

upsert_review_line() {
  local key="$1"
  local value="$2"
  local tmp_file
  tmp_file="$(mktemp)"
  if [[ -f "$REVIEW_FILE" ]]; then
    awk -v key="$key" -v value="$value" '
      BEGIN { updated = 0 }
      $0 ~ ("^" key ":") {
        print key ": " value
        updated = 1
        next
      }
      { print }
      END {
        if (!updated) {
          print key ": " value
        }
      }
    ' "$REVIEW_FILE" >"$tmp_file"
  else
    printf '%s: %s\n' "$key" "$value" >"$tmp_file"
  fi
  mv "$tmp_file" "$REVIEW_FILE"
}

build_diff_summary() {
  local compare_ref="$1"
  if git rev-parse --verify "$compare_ref" >/dev/null 2>&1; then
    git diff --stat "$compare_ref"...HEAD
    return 0
  fi
  if git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
    git diff --stat HEAD~1...HEAD
    return 0
  fi
  echo "No comparison base available."
}

write_review_proof() {
  cat >"$REVIEW_PROOF_FILE" <<EOF
branch=${BRANCH_NAME:-detached-head}
head_sha=$HEAD_SHA
base_ref=$BASE_REF
generated_at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF
}

if [[ ! -f "$REVIEW_FILE" ]]; then
  diff_summary="$(build_diff_summary "$BASE_REF")"
  cat >"$REVIEW_FILE" <<EOF
scope reviewed: branch ${BRANCH_NAME:-detached-head}
head reviewed: $HEAD_SHA
findings: no findings
remaining risks: $PLACEHOLDER_TEXT

diff summary:
$diff_summary
EOF
  echo "Created review checkpoint template at $REVIEW_FILE"
else
  echo "Review checkpoint already exists at $REVIEW_FILE"
  upsert_review_line "scope reviewed" "branch ${BRANCH_NAME:-detached-head}"
  upsert_review_line "head reviewed" "$HEAD_SHA"
fi

write_review_proof
echo "Refreshed review proof at $REVIEW_PROOF_FILE for HEAD $HEAD_SHA"

cat <<EOF

Next steps:
1. Run the native review flow for the current branch changes.
2. Replace the placeholder text in $REVIEW_FILE with the actual review findings and remaining risks.
3. Run ./scripts/run-agent-preflight.sh or push again after the review note is complete.
EOF
