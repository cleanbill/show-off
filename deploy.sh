#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"

if [[ ! -f "$ENV_FILE" ]]; then
    echo "Error: $ENV_FILE not found in $(pwd)" >&2
    exit 1
fi

if [[ ! -f "Dockerfile" ]]; then
    echo "Error: Dockerfile not found in $(pwd)" >&2
    exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${DEPLOY_HOST:?DEPLOY_HOST must be set in $ENV_FILE}"
: "${DEPLOY_DIR:?DEPLOY_DIR must be set in $ENV_FILE}"
IMAGE_NAME="${DOCKER_IMAGE:-immich-clock:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-immich_clock}"

echo "==> 1/4 Building Docker image ($IMAGE_NAME)..."
docker build -t "$IMAGE_NAME" .

echo "==> 2/4 Ensuring $DEPLOY_DIR exists on $DEPLOY_HOST..."
ssh "$DEPLOY_HOST" "mkdir -p '$DEPLOY_DIR'"

echo "==> 3/4 Copying $ENV_FILE and docker-compose.yml to $DEPLOY_HOST:$DEPLOY_DIR..."
scp "$ENV_FILE" "$DEPLOY_HOST:$DEPLOY_DIR/.env"
ssh "$DEPLOY_HOST" "chmod 600 '$DEPLOY_DIR/.env'"

ssh "$DEPLOY_HOST" "cat > '$DEPLOY_DIR/docker-compose.yml'" <<EOF
services:
  immich-clock:
    image: ${IMAGE_NAME}
    container_name: ${CONTAINER_NAME}
    restart: unless-stopped
    network_mode: host
    env_file:
      - .env
EOF

echo "==> 4/4 Streaming image to $DEPLOY_HOST and restarting container..."
docker save "$IMAGE_NAME" | gzip | ssh "$DEPLOY_HOST" "gunzip | docker load"

ssh "$DEPLOY_HOST" "cd '$DEPLOY_DIR' && docker compose up -d --force-recreate && docker image prune -f"

echo "==> Done! App deployed to $DEPLOY_HOST"
