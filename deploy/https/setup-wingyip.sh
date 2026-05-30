#!/usr/bin/env bash
# Enable HTTPS for wingyip.axoncase.com (edge) and cmp.wingyip.axoncase.com (CMP).
set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
EDGE_DOMAIN=wingyip.axoncase.com
CMP_DOMAIN=cmp.wingyip.axoncase.com
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-admin@axoncase.com}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run: sudo LETSENCRYPT_EMAIL=you@axoncase.com bash $0" >&2
  exit 1
fi

echo "DNS check (must be 223.123.193.29 or your current public IP):"
EDGE_IP=$(dig +short "$EDGE_DOMAIN" A | tail -1)
CMP_IP=$(dig +short "$CMP_DOMAIN" A | tail -1)
echo "  $EDGE_DOMAIN -> ${EDGE_IP:-MISSING}"
echo "  $CMP_DOMAIN -> ${CMP_IP:-MISSING — add this A record in DNS}"

if [[ -z "$CMP_IP" ]]; then
  echo ""
  echo "Add DNS:  cmp.wingyip.axoncase.com  A  $EDGE_IP"
  echo "Then re-run this script."
  exit 1
fi

if ! command -v caddy >/dev/null 2>&1; then
  echo "Installing Caddy..."
  apt-get update -qq
  apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq
  apt-get install -y -qq caddy
fi

install -d -m 755 /etc/caddy
cp "$REPO/deploy/https/Caddyfile.wingyip" /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile

if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q 'Status: active'; then
  ufw allow 80/tcp
  ufw allow 443/tcp
fi

systemctl enable caddy
systemctl reload caddy 2>/dev/null || systemctl restart caddy

echo ""
echo "Caddy started. When certs are issued (may take 1–2 min):"
echo "  Edge: https://${EDGE_DOMAIN}/"
echo "  CMP:  https://${CMP_DOMAIN}/"
echo ""
echo "Update CMP container:"
echo "  docker update --no-restart avision-cmp  # not supported for env"
echo "  Recreate avision-cmp with: -e NEXTAUTH_URL=https://${CMP_DOMAIN}"
echo ""
echo "Update app.config.json:"
echo '  "url": "https://cmp.wingyip.axoncase.com/api/webhook/edge-report"'
echo ""
echo "Logs: journalctl -u caddy -f"
