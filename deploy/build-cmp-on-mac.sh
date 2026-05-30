#!/usr/bin/env bash
# Build CMP on Mac, then upload .next to the Spark server.
# Usage (on Mac):
#   cd AVision-WIngYipSt
#   SERVER=interlv@223.123.193.29 bash deploy/build-cmp-on-mac.sh
set -euo pipefail

SERVER="${SERVER:?Set SERVER=user@host (e.g. interlv@223.123.193.29)}"
REMOTE_DIR="${REMOTE_DIR:-Documents/avision/CCTVCMP-linux}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/CCTVCMP-linux"

echo "[1/4] npm install..."
npm install

echo "[2/4] prisma generate..."
npx prisma generate

echo "[3/4] next build..."
npm run build

echo "[4/4] Upload .next to server..."
rsync -avz --delete .next/ "${SERVER}:${REMOTE_DIR}/.next/"

echo ""
echo "Done. On the server run:"
echo "  bash ~/Documents/AVision-WIngYipSt/deploy/start-cmp.sh"
