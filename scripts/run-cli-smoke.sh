#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Smoke check: scaffold files are present."
test -f AGENTS.md
test -f CLAUDE.md
test -f package.json
test -f scripts/codex-pm.mjs
test -f scripts/run-agent-preflight.sh
test -f scripts/run-codex-review-checkpoint.sh
test -f .githooks/pre-push
test -f openspec/README.md
test -f openspec/specs/README.md
test -f openspec/changes/README.md
test -f superpowers/README.md
echo "Smoke check passed."
