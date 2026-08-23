#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: restore.sh /backups/tyto-TIMESTAMP.sql.gz" >&2
  exit 64
fi

backup="$1"
test -f "$backup"
test "${TYTO_ALLOW_RESTORE:-false}" = "true" || {
  echo "Set TYTO_ALLOW_RESTORE=true to confirm this destructive operation." >&2
  exit 77
}

sha256sum -c "${backup}.sha256"
gzip -t "$backup"

gunzip -c "$backup" | psql \
  --host="${DB_HOST}" \
  --port="${DB_PORT:-5432}" \
  --username="${DB_USERNAME}" \
  --dbname="${DB_DATABASE}" \
  --set ON_ERROR_STOP=on \
  --single-transaction

echo "Restore completed from: ${backup}"
