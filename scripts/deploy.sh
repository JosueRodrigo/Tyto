#!/bin/sh
set -eu

version="${1:?Usage: deploy.sh VERSION}"
health_url="${TYTO_HEALTH_URL:-https://${APP_HOSTNAME}/api/health/ready}"
lock_dir="${TYTO_DEPLOY_LOCK:-/tmp/tyto-deploy.lock}"
state_file="${TYTO_VERSION_FILE:-.tyto-version}"
previous=""
if [ -f "$state_file" ]; then
  previous="$(cat "$state_file")"
fi

if ! mkdir "$lock_dir" 2>/dev/null; then
  echo "Another Tyto deploy is running." >&2
  exit 75
fi
trap 'rmdir "$lock_dir"' EXIT INT TERM

export APP_VERSION="$version"
docker compose pull app horizon schedule-worker reverb
docker compose run --rm backup
docker compose run --rm -e IS_WORKER=true app php artisan migrate --force
docker compose up -d --remove-orphans

attempt=0
until curl --fail --silent --show-error "$health_url" >/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 12 ]; then
    if [ -n "$previous" ]; then
      echo "Readiness failed; rolling back to ${previous}." >&2
      export APP_VERSION="$previous"
      docker compose up -d --remove-orphans
    fi
    exit 1
  fi
  sleep 5
done

docker compose exec -T app php artisan tyto:doctor
printf '%s\n' "$version" > "$state_file"
echo "Tyto ${version} deployed successfully."
