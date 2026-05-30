#!/usr/bin/env bash
# Install Caddy and enable HTTPS for PPE-UI (:3000) and CMP (:3002).
#
# Usage:
#   sudo EDGE_DOMAIN=edge.example.com CMP_DOMAIN=cmp.example.com \
#        LETSENCRYPT_EMAIL=you@example.com \
#        bash deploy/https/install-https-caddy.sh
#
# Prerequisites:
#   - Two hostnames with DNS A records pointing to this server's public IP
#   - Ports 80 and 443 forwarded to this host
#   - Docker containers avision-ui and avision-cmp already running

set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
EDGE_DOMAIN="${EDGE_DOMAIN:?Set EDGE_DOMAIN e.g. edge.example.com}"
CMP_DOMAIN="${CMP_DOMAIN:?Set CMP_DOMAIN e.g. cmp.example.com}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:?Set LETSENCRYPT_EMAIL for Lets Encrypt account}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run with sudo." >&2
  exit 1
fi

echo "[1/5] Installing Caddy..."
if ! command -v caddy >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq
  apt-get install -y -qq caddy
fi

echo "[2/5] Writing Caddyfile..."
install -d -m 755 /etc/caddy
sed -e "s|__EDGE_DOMAIN__|${EDGE_DOMAIN}|g" \
    -e "s|__CMP_DOMAIN__|${CMP_DOMAIN}|g" \
    -e "s|__LETSENCRYPT_EMAIL__|${LETSENCRYPT_EMAIL}|g" \
    "$REPO/deploy/https/Caddyfile.template" > /etc/caddy/Caddyfile

caddy validate --config /etc/caddy/Caddyfile

echo "[3/5] Opening firewall (ufw) if active..."
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow 80/tcp
  ufw allow 443/tcp
fi

echo "[4/5] Starting Caddy..."
systemctl enable caddy
systemctl reload caddy 2>/dev/null || systemctl restart caddy

echo "[5/5] Post-install checklist"
cat <<EOF

HTTPS installed. Verify:

  curl -sI https://${EDGE_DOMAIN}/api/health
  curl -sI https://${CMP_DOMAIN}/

Update CMP (docker) NEXTAUTH_URL — recreate container with:
  NEXTAUTH_URL=https://${CMP_DOMAIN}

Update edge app.config.json centralServer:
  "url": "https://${CMP_DOMAIN}/api/webhook/edge-report"

Open in browser:
  Edge UI: https://${EDGE_DOMAIN}/
  CMP:     https://${CMP_DOMAIN}/

Logs: journalctl -u caddy -f

EOF
