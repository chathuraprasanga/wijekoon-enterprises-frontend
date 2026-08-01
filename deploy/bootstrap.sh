#!/usr/bin/env bash
# One-time VPS setup. Run this ONCE from your local machine (like deploy.sh) —
# it SSHes into the VPS and does the setup there. Not run on every deploy.
set -euo pipefail

# ---- CONFIGURE ME (keep in sync with deploy.sh) ------------------------
VPS_USER="root"
VPS_HOST="158.220.104.6"
VPS_REPO_PATH="/home/deploy/wijekoon-enterprises-frontend"
DOMAIN="we-app.xcorpion.xyz"
# -------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Copying nginx config to VPS"
scp "${SCRIPT_DIR}/nginx.conf" "${VPS_USER}@${VPS_HOST}:/tmp/${DOMAIN}.conf"

ssh "${VPS_USER}@${VPS_HOST}" bash -s <<EOF
set -euo pipefail

if ! command -v docker &>/dev/null; then
  echo "==> Installing Docker"
  curl -fsSL https://get.docker.com | sh
fi

if ! docker compose version &>/dev/null; then
  echo "ERROR: docker compose plugin not available after Docker install." >&2
  exit 1
fi

echo "==> Installing nginx site config for ${DOMAIN}"
mv "/tmp/${DOMAIN}.conf" "/etc/nginx/sites-available/${DOMAIN}"
ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
nginx -t
systemctl reload nginx

if ! command -v certbot &>/dev/null; then
  echo "==> Installing certbot"
  apt-get update -y
  apt-get install -y certbot python3-certbot-nginx
fi

echo "==> Requesting HTTPS certificate for ${DOMAIN}"
echo "    (DNS A record for ${DOMAIN} must already point at this VPS)"
certbot --nginx -d "${DOMAIN}"

echo ""
if [ ! -f "${VPS_REPO_PATH}/.env.prod" ]; then
  echo "REMINDER: .env.prod does not exist yet at ${VPS_REPO_PATH}/.env.prod"
  echo "Create it manually (BASE_URL=https://we-server.xcorpion.xyz) before running deploy.sh."
fi

echo "==> Bootstrap complete."
EOF
