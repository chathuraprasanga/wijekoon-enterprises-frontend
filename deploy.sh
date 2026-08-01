#!/usr/bin/env bash
set -euo pipefail

# ---- CONFIGURE ME -----------------------------------------------------
VPS_USER="root"
VPS_HOST="158.220.104.6"
VPS_REPO_PATH="/home/deploy/wijekoon-enterprises-frontend"
BRANCH="main"
# -------------------------------------------------------------------------

ssh "${VPS_USER}@${VPS_HOST}" bash -s <<EOF
set -euo pipefail

cd "${VPS_REPO_PATH}"

echo "==> Fetching latest ${BRANCH}"
git fetch origin
git checkout "${BRANCH}"
git pull origin "${BRANCH}"

if [ ! -f ".env.prod" ]; then
  echo "ERROR: .env.prod not found on the VPS." >&2
  echo "Create it once manually before deploying (see deploy/bootstrap.sh notes)." >&2
  exit 1
fi

echo "==> Building and starting container"
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Pruning dangling images"
docker image prune -f

echo "==> Deploy complete"
docker compose -f docker-compose.prod.yml ps
EOF
