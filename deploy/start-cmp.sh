#!/usr/bin/env bash
# Start CMP (no npm install — uses existing node_modules volume + .next on disk).
set -euo pipefail

EXPO_ACCESS_TOKEN="${EXPO_ACCESS_TOKEN:-}"
REPO="${REPO:-/home/interlv/Documents/AVision-WIngYipSt/CCTVCMP-linux}"
CMP_DATA_DIR="${CMP_DATA_DIR:-/home/interlv/Documents/AVision-WIngYipSt-data/cmp/images}"
CMP_URL="${CMP_URL:-http://wingyip.axoncase.com:3002}"

mkdir -p "$CMP_DATA_DIR"

docker stop avision-cmp 2>/dev/null || true
docker rm avision-cmp 2>/dev/null || true

ENV_EXPO=()
if [[ -n "$EXPO_ACCESS_TOKEN" ]]; then
  ENV_EXPO=(-e "EXPO_ACCESS_TOKEN=${EXPO_ACCESS_TOKEN}")
fi

docker run -d --name avision-cmp --restart unless-stopped \
  --network host \
  -v "$REPO:/app" \
  -v "$CMP_DATA_DIR:/data/cmp/images" \
  -v avision-cmp-node-modules:/app/node_modules \
  -e "DATABASE_URL=postgresql://cmp:cmp@127.0.0.1:5432/cmp?schema=public" \
  -e "DIRECT_URL=postgresql://cmp:cmp@127.0.0.1:5432/cmp?schema=public" \
  -e "JWT_SECRET=local-dev-jwt-secret-please-change-32chars" \
  -e "EDGE_API_KEY=axonedge852852" \
  -e "NEXTAUTH_URL=${CMP_URL}" \
  -e "IMAGE_STORAGE_PATH=/data/cmp/images" \
  -e "EDGE_ANALYZE_URL=http://127.0.0.1:3001/api/analyze-image" \
  "${ENV_EXPO[@]}" \
  node:20-bookworm-slim \
  sh -lc 'set -e
    apt-get update -qq
    apt-get install -y -qq --no-install-recommends openssl ca-certificates
    test -w /data/cmp/images
    cd /app
    npm start'

echo "CMP starting. Logs: docker logs -f avision-cmp"
echo "URL: ${CMP_URL}"
echo "Image data: ${CMP_DATA_DIR}"
