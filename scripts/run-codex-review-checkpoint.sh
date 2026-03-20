#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REVIEW_FILE="${AGENT_HARNESS_KIT_REVIEW_FILE:-$ROOT_DIR/.codex-review}"
REVIEW_PROOF_FILE="${AGENT_HARNESS_KIT_REVIEW_PROOF_FILE:-$ROOT_DIR/.codex-review-proof}"
BASE_REF="${AGENT_HARNESS_KIT_REVIEW_BASE_REF:-upstream/main}"
BRANCH_NAME="$(git branch --show-current 2>/dev/null || true)"
HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || echo "uncommitted")"

cat >"$REVIEW_FILE" <<EOF
scope reviewed: branch ${BRANCH_NAME:-detached-head}
head reviewed: $HEAD_SHA
findings: no findings
remaining risks: native /review has not been run yet
EOF

cat >"$REVIEW_PROOF_FILE" <<EOF
branch=${BRANCH_NAME:-detached-head}
head_sha=$HEAD_SHA
base_ref=$BASE_REF
generated_at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

echo "Wrote review checkpoint to $REVIEW_FILE"
echo "Wrote review proof to $REVIEW_PROOF_FILE"
