#!/bin/sh
set -eu

backup_dir="${TYTO_BACKUP_DIR:-/backups}"
retention_days="${TYTO_BACKUP_RETENTION_DAYS:-14}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="${backup_dir}/tyto-${timestamp}.sql.gz"

mkdir -p "$backup_dir"
umask 077

pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT:-5432}" \
  --username="${DB_USERNAME}" \
  --dbname="${DB_DATABASE}" \
  --no-owner \
  --no-privileges | gzip -9 > "$target"

gzip -t "$target"
sha256sum "$target" > "${target}.sha256"
find "$backup_dir" -type f -name 'tyto-*.sql.gz*' -mtime "+${retention_days}" -delete

echo "Backup created: ${target}"
