#!/usr/bin/env bash
# Start CMP (no npm install — uses existing node_modules volume + .next on disk).
set -euo pipefail

EXPO_ACCESS_TOKEN="${EXPO_ACCESS_TOKEN:-}"
REPO="${REPO:-/home/interlv/Documents/avision/CCTVCMP-linux}"
CMP_URL="${CMP_URL:-http://wingyip.axoncase.com:3002}"

docker stop avision-cmp 2>/dev/null || true
docker rm avision-cmp 2>/dev/null || true

ENV_EXPO=()
if [[ -n "$EXPO_ACCESS_TOKEN" ]]; then
  ENV_EXPO=(-e "EXPO_ACCESS_TOKEN=${EXPO_ACCESS_TOKEN}")
fi

docker run -d --name avision-cmp --restart unless-stopped \
  --network host \
  -v "$REPO:/app" \
  -v avision-cmp-node-modules:/app/node_modules \
  -e "DATABASE_URL=postgresql://cmp:cmp@127.0.0.1:5432/cmp?schema=public" \
  -e "DIRECT_URL=postgresql://cmp:cmp@127.0.0.1:5432/cmp?schema=public" \
  -e "JWT_SECRET=local-dev-jwt-secret-please-change-32chars" \
  -e "EDGE_API_KEY=axonedge852852" \
  -e "NEXTAUTH_URL=${CMP_URL}" \
  -e "EDGE_ANALYZE_URL=http://127.0.0.1:3001/api/analyze-image" \
  "${ENV_EXPO[@]}" \
  node:18-bullseye-slim \
  sh -lc 'cd /app && npm start'

echo "CMP starting. Logs: docker logs -f avision-cmp"
echo "URL: ${CMP_URL}"
