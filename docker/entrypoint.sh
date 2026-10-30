#!/bin/sh
# Starts as root only to give /data to the user the app runs as: PUID/PGID (default 1000,
# Unraid uses 99/100), then drops to that user. Started with --user, it runs as that user directly.
set -e
if [ "$(id -u)" = "0" ]; then
  PUID=${PUID:-1000}
  PGID=${PGID:-1000}
  if [ "$(id -u node)" != "$PUID" ] || [ "$(id -g node)" != "$PGID" ]; then
    groupmod -o -g "$PGID" node
    usermod -o -u "$PUID" -g "$PGID" node
  fi
  mkdir -p /data/uploads /data/backups
  # dumps contain password hashes: owner only
  chmod 700 /data/backups
  # only when an owner differs (e.g. after "docker exec" as root): chown over many screenshots takes a while
  for dir in /data /data/uploads /data/backups; do
    if [ "$(stat -c %u:%g "$dir")" != "$PUID:$PGID" ]; then
      chown -R "$PUID:$PGID" /data
      break
    fi
  done
  exec su-exec node "$@"
fi
exec "$@"
