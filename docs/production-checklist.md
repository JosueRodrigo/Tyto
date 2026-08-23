# Production checklist

## Before deployment

- Pin a released Tyto image instead of `latest`.
- Set `APP_ENV=production`, `APP_DEBUG=false`, and a unique `APP_KEY`.
- Replace every placeholder password and Reverb credential.
- Configure a real mail transport when email alerts are enabled.
- Back up PostgreSQL and the persistent `storage` volume.
- Restrict database and Redis ports to the private network.

## Deploy

```bash
cp .env.prod.example .env
docker compose pull
docker compose up -d
```

The application container runs database migrations before serving traffic. Horizon, the scheduler, and Reverb run as separate services and must remain active.

## Verify

```bash
docker compose ps
docker compose logs --tail=100 app horizon schedule-worker reverb
curl --fail https://tyto.example.com/api/health/live
docker compose exec app php artisan tyto:doctor
```

The readiness endpoint requires the operational diagnostics PR and reports HTTP 503 if the database, cache, scheduler, worker, or storage is unhealthy.

## Rollback

1. Restore the previous pinned image tag.
2. Run `docker compose up -d`.
3. Restore the database only when a migration is not backward compatible.
4. Repeat the verification commands above.

Never use `migrate:rollback` automatically in production; application and database rollback compatibility must be assessed per release.
