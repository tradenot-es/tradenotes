#!/usr/bin/env bash
# Update tradenot.es on the server: pull, rebuild, restart, wait for the health check.
# Run in /opt/tradenotes (the clone of tradenot-es/tradenotes, branch eigenes-backend).
# Database migrations run automatically when the app starts.
set -euo pipefail
cd "$(dirname "$0")/.."

git pull --ff-only
docker compose build app
docker compose up -d

for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/health >/dev/null; then
    echo "tradenot.es is up ($(git rev-parse --short HEAD))"
    exit 0
  fi
  sleep 2
done
echo "health check failed, last log lines:" >&2
docker compose logs --tail 50 app >&2
exit 1
