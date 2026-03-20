#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Smoke check: scaffold files are present."
test -f AGENTS.md
test -f CLAUDE.md
test -f package.json
echo "Smoke check passed."
