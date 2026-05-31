#!/usr/bin/env bash
# Recreate avision-cmp with mobile push support (HTTP).
set -euo pipefail

REPO="${REPO:-/home/interlv/Documents/AVision-WIngYipSt}"
CMP_DATA_DIR="${CMP_DATA_DIR:-/home/interlv/Documents/AVision-WIngYipSt-data/cmp/images}"
CMP_URL="${CMP_URL:-http://wingyip.axoncase.com:3002}"
EXPO_ACCESS_TOKEN="${EXPO_ACCESS_TOKEN:?Set EXPO_ACCESS_TOKEN before running}"

mkdir -p "$CMP_DATA_DIR"

echo "Stopping old container..."
docker stop avision-cmp 2>/dev/null || true
docker rm avision-cmp 2>/dev/null || true

echo "Removing stale node_modules volume (fixes npm idealTree errors)..."
docker volume rm avision-cmp-node-modules 2>/dev/null || true

echo "Starting fresh build (5–15 min)..."
docker run -d --name avision-cmp --restart unless-stopped \
  --network host \
  -v "$REPO/CCTVCMP-linux:/app" \
  -v "$CMP_DATA_DIR:/data/cmp/images" \
  -v avision-cmp-node-modules:/app/node_modules \
  -e "DATABASE_URL=postgresql://cmp:cmp@127.0.0.1:5432/cmp?schema=public" \
  -e "DIRECT_URL=postgresql://cmp:cmp@127.0.0.1:5432/cmp?schema=public" \
  -e "JWT_SECRET=local-dev-jwt-secret-please-change-32chars" \
  -e "EDGE_API_KEY=axonedge852852" \
  -e "NEXTAUTH_URL=${CMP_URL}" \
  -e "EXPO_ACCESS_TOKEN=${EXPO_ACCESS_TOKEN}" \
  -e "IMAGE_STORAGE_PATH=/data/cmp/images" \
  -e "EDGE_ANALYZE_URL=http://127.0.0.1:3001/api/analyze-image" \
  node:20-bookworm-slim \
  sh -lc 'set -e
    apt-get update -qq
    apt-get install -y -qq --no-install-recommends openssl ca-certificates
    test -w /data/cmp/images
    cd /app
    npm cache clean --force
    npm install
    npx prisma migrate deploy
    npm run build
    npm start'

echo ""
echo "CMP rebuilding. Watch: docker logs -f avision-cmp"
echo "URL: ${CMP_URL}"
echo "Image data: ${CMP_DATA_DIR}"
