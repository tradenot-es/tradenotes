#!/usr/bin/env bash
# Daily backup of tradenot.es: database dump plus the screenshot volume, kept for 14 days.
# The privacy policy promises that deleted data is gone from backups after 14 days, so keep
# KEEP_DAYS in sync with it. Cron (as root, daily at 03:15):
#   15 3 * * * /opt/tradenotes/deploy/backup.sh >> /var/log/tradenotes-backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_DIR=${BACKUP_DIR:-/opt/tradenotes-backups}
KEEP_DAYS=14
stamp=$(date +%Y-%m-%d_%H%M)
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

docker compose exec -T db pg_dump -U tradenotes -d tradenotes --format=custom > "$BACKUP_DIR/db_$stamp.dump"
docker run --rm -v tradenotes_uploads:/data:ro -v "$BACKUP_DIR":/backup alpine \
  tar czf "/backup/uploads_$stamp.tar.gz" -C /data .

find "$BACKUP_DIR" -type f \( -name 'db_*.dump' -o -name 'uploads_*.tar.gz' \) -mtime +$((KEEP_DAYS - 1)) -delete
echo "$(date -Is) backup ok: db_$stamp.dump, uploads_$stamp.tar.gz"
