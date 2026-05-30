#!/usr/bin/env bash
# Recreate avision-cmp with HTTPS NEXTAUTH_URL for cmp.wingyip.axoncase.com
set -euo pipefail

CMP_URL="${CMP_URL:-https://cmp.wingyip.axoncase.com}"
REPO="${REPO:-/home/interlv/Documents/avision}"

docker stop avision-cmp 2>/dev/null || true
docker rm avision-cmp 2>/dev/null || true

docker run -d --name avision-cmp --restart unless-stopped \
  --network host \
  -v "$REPO/CCTVCMP-linux:/app" \
  -v avision-cmp-node-modules:/app/node_modules \
  -e "DATABASE_URL=postgresql://cmp:cmp@127.0.0.1:5432/cmp?schema=public" \
  -e "DIRECT_URL=postgresql://cmp:cmp@127.0.0.1:5432/cmp?schema=public" \
  -e "JWT_SECRET=local-dev-jwt-secret-please-change-32chars" \
  -e "EDGE_API_KEY=axonedge852852" \
  -e "NEXTAUTH_URL=${CMP_URL}" \
  -e "EDGE_ANALYZE_URL=http://127.0.0.1:3001/api/analyze-image" \
  node:20-bookworm-slim \
  sh -lc 'apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && npm install && npm run db:push && npm run build && npm start'

echo "CMP starting with NEXTAUTH_URL=${CMP_URL}"
echo "Logs: docker logs -f avision-cmp"
