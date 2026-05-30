#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SYSTEMD_DIR="/etc/systemd/system"
RUN_USER="${SUDO_USER:-$USER}"

echo "[1/5] Building local artifacts..."
(cd "$REPO/cloud" && npm install && npm run build)
(cd "$REPO/ppe-ui" && npm install && npx react-scripts build)

echo "[2/5] Generating nginx config for this repo..."
sed "s|__REPO_ROOT__|$REPO|g" "$REPO/deploy/edge-nginx-local.conf.template" > "$REPO/deploy/edge-nginx-local.conf"
/usr/sbin/nginx -t -c "$REPO/deploy/edge-nginx-local.conf"

echo "[3/5] Installing local service units..."
sed -e "s|EDGE_REPO=.*|EDGE_REPO=$REPO|" \
    -e "s|^User=.*|User=$RUN_USER|" \
    -e "s|^Group=.*|Group=$RUN_USER|" \
    "$REPO/deploy/edge-ui-local.service" > /tmp/edge-ui-local.service
sed -e "s|/home/iris/Documents/development/edge-linux|$REPO|g" \
    "$REPO/deploy/edge-cloud-local.service" > /tmp/edge-cloud-local.service

sudo install -m 644 /tmp/edge-cloud-local.service "$SYSTEMD_DIR/edge-cloud-local.service"
sudo install -m 644 /tmp/edge-ui-local.service "$SYSTEMD_DIR/edge-ui-local.service"
sudo install -m 644 "$REPO/deploy/edge-linux-local.target" "$SYSTEMD_DIR/edge-linux-local.target"

echo "[4/5] Installing sudoers rule for VPN/Tailscale management..."
sudo install -m 440 "$REPO/deploy/sudoers-edge-python-vpn" /etc/sudoers.d/edge-python-vpn
sudo visudo -cf /etc/sudoers.d/edge-python-vpn

echo "[5/5] Reloading systemd and enabling services..."
sudo systemctl daemon-reload
sudo systemctl enable edge-cloud-local edge-ui-local edge-linux-local.target

# Stop the old Python service if it exists
sudo systemctl disable edge-python-local 2>/dev/null || true
sudo systemctl stop edge-python-local 2>/dev/null || true

# Stop plain 'serve' if it was bound to 3000
sudo systemctl stop edge-ui-local 2>/dev/null || true

sudo systemctl restart edge-cloud-local edge-ui-local
sudo systemctl start edge-linux-local.target

echo ""
echo "Done. Remote access: open only port 3000 (UI + API + go2rtc are proxied)."
echo "  http://<tailscale-or-lan-ip>:3000"
echo ""
echo "Check status with:"
echo "  systemctl status edge-cloud-local --no-pager"
echo "  systemctl status edge-ui-local --no-pager"
echo "  systemctl status edge-linux-local.target --no-pager"
