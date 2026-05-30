# HTTPS for Edge PPE-UI and CMP

Both apps run on this host (Docker, `network_mode: host`):

| App | Port | Public HTTPS (after setup) |
|-----|------|----------------------------|
| PPE-UI (`avision-ui`) | 3000 | `https://<edge-domain>/` |
| CMP (`avision-cmp`) | 3002 | `https://<cmp-domain>/` |

Caddy terminates TLS on **443** and proxies to those local ports. Your existing `setupProxy.js` on the UI still handles `/api` and `/go2rtc` on port 3000; Caddy only adds HTTPS in front.

---

## Important: you need domain names

Let's Encrypt (free, trusted certificates) **does not work on a bare IP** like `223.123.193.29`.

You need two DNS names, for example:

| Hostname | Type | Value |
|----------|------|--------|
| `edge.yourcompany.com` | A | `223.123.193.29` |
| `cmp.yourcompany.com` | A | `223.123.193.29` |

Router/firewall must forward **TCP 80** and **TCP 443** to this machine (in addition to any port 3000 rules you already have; after HTTPS, browsers use 443 only).

---

## Option A — Automatic HTTPS with Caddy (recommended)

### 1. Set your domains

```bash
export EDGE_DOMAIN=edge.yourcompany.com
export CMP_DOMAIN=cmp.yourcompany.com
export LETSENCRYPT_EMAIL=admin@yourcompany.com
```

Wait until DNS resolves to your public IP:

```bash
dig +short "$EDGE_DOMAIN" A
dig +short "$CMP_DOMAIN" A
```

### 2. Install Caddy

From the repo root:

```bash
cd /home/interlv/Documents/avision   # or AVision-WIngYipSt
sudo EDGE_DOMAIN="$EDGE_DOMAIN" CMP_DOMAIN="$CMP_DOMAIN" \
     LETSENCRYPT_EMAIL="$LETSENCRYPT_EMAIL" \
     bash deploy/https/install-https-caddy.sh
```

Caddy obtains and renews certificates automatically.

### 3. Point CMP at HTTPS

Recreate `avision-cmp` with the public URL (example — adjust your `docker run` to match):

```bash
docker stop avision-cmp && docker rm avision-cmp
# ... same docker run as before, but add/change:
#   -e NEXTAUTH_URL=https://cmp.yourcompany.com
```

Or edit the env on your existing run command. **NEXTAUTH_URL must match the HTTPS URL users open**, or sign-in/cookies break.

### 4. Point Edge at HTTPS CMP webhook

In `app.config.json` (repo root):

```json
"centralServer": {
  "enabled": true,
  "url": "https://cmp.yourcompany.com/api/webhook/edge-report",
  ...
}
```

Restart `avision-cloud` after saving.

### 5. Test

```bash
curl -sI "https://${EDGE_DOMAIN}/api/health"
curl -sI "https://${CMP_DOMAIN}/"
```

Browsers:

- Edge: `https://edge.yourcompany.com`
- CMP: `https://cmp.yourcompany.com`

---

## Option B — You already have certificate files

If your IT team gave you `fullchain.pem` and `privkey.pem` (and optional `chain.pem`):

### nginx example (two server blocks)

```nginx
server {
    listen 443 ssl http2;
    server_name edge.yourcompany.com;
    ssl_certificate     /etc/ssl/certs/edge-fullchain.pem;
    ssl_certificate_key /etc/ssl/private/edge-privkey.pem;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 443 ssl http2;
    server_name cmp.yourcompany.com;
    ssl_certificate     /etc/ssl/certs/cmp-fullchain.pem;
    ssl_certificate_key /etc/ssl/private/cmp-privkey.pem;
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

Install certs under `/etc/ssl/`, run `nginx -t`, enable nginx. Same **NEXTAUTH_URL** and **app.config.json** updates as above.

### Caddy with manual certs

```caddy
edge.yourcompany.com {
    tls /path/to/fullchain.pem /path/to/privkey.pem
    reverse_proxy 127.0.0.1:3000
}
```

---

## Option C — Self-signed (IP only, internal testing)

Browsers will show a security warning unless you install your own CA.

```bash
sudo mkdir -p /etc/ssl/axon
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/axon/selfsigned.key \
  -out /etc/ssl/axon/selfsigned.crt \
  -subj "/CN=223.123.193.29"
```

Use those paths in Caddy `tls` directives or nginx `ssl_certificate` lines. Not suitable for production users.

---

## Mixed content and WebRTC

After HTTPS:

- The UI should load APIs as `https://<edge-domain>/api/...` (same origin on 443). Your `api.ts` + `setupProxy.js` already support this when `X-Forwarded-Proto: https` is set (Caddy/nginx do this automatically).
- `configRoute` returns `apiBase: https://<edge-domain>/go2rtc` when the Host header is your edge domain on port 443.
- If video fails over HTTPS, check browser console for WebRTC/WSS errors; you may need to allow UDP for go2rtc through NAT (signalling goes over HTTPS; media can use UDP).

---

## Port summary (production HTTPS)

| Port | Purpose |
|------|---------|
| 80 | HTTP → Let's Encrypt challenge + redirect to HTTPS |
| 443 | Public Edge UI + CMP (via Caddy hostnames) |
| 3000 | Local only — PPE-UI (not exposed once Caddy is used) |
| 3002 | Local only — CMP |

You can stop forwarding **3000** on the router once everything uses `https://edge.yourcompany.com`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Certificate fails | DNS not pointing to this IP; port 80 blocked |
| CMP login loops | Set `NEXTAUTH_URL` to exact HTTPS CMP URL |
| Edge empty remotely | Rebuild UI; ensure Caddy forwards `X-Forwarded-*` |
| Webhook fails | Use `https://cmp.../api/webhook/edge-report` in config |
