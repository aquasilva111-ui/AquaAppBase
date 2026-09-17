#!/usr/bin/env bash
set -euo pipefail
export PORT="${PORT:-8080}"
cd /workspace
exec npm run dev
