#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Running agent preflight in $ROOT_DIR"
npm run build
npm test
echo "Agent preflight passed."
