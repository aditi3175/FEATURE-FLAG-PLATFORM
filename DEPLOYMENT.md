# Deployment

The live demo runs entirely on free tiers:

| Part | Host | Notes |
| --- | --- | --- |
| Dashboard | Vercel | Static React build |
| API | Render (free web service) | Sleeps after 15 min idle; first request takes ~1 min to wake |
| PostgreSQL | Neon (free) | Serverless Postgres, scales to zero when idle |
| Redis | Upstash (free) | Used as a cache only; the API still works without it |

All three backend services run in the same region (Singapore) to keep latency between them low.

## API on Render

| Setting | Value |
| --- | --- |
| Root directory | `server` |
| Build command | `npm install && npm run build` |
| Start command | `npm start` (runs `prisma migrate deploy`, then starts the server) |
| Health check path | `/health` |

Environment variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon connection string (includes `sslmode=require`) |
| `REDIS_URL` | Upstash Redis URL (`rediss://…`, TLS) |
| `JWT_SECRET` | Long random string |
| `FRONTEND_URL` | The Vercel dashboard URL |
| `NODE_VERSION` | `22` |

Migrations run automatically on every start. On shutdown (deploys and idle spin-down), the server receives SIGTERM and flushes buffered analytics events before exiting.

## Dashboard on Vercel

Root directory `dashboard`, framework preset Vite. The API URL is set with an environment variable pointing at the Render service.

## Demo data

`server/src/scripts/seed_demo.ts` creates the public demo account and resets its flags and a week of events. To reset the live demo, run it locally with `DATABASE_URL` pointing at Neon:

```powershell
cd server
npm run build
$env:DATABASE_URL="<Neon connection string>"
node dist/scripts/seed_demo.js
Remove-Item Env:DATABASE_URL
```

Benchmark scripts (`seed_benchmark`, `seed_events`) are for local use only: 1M events would exceed Neon's free 0.5 GB storage.

## Free tier limits to keep in mind

- **Render:** 750 free instance hours per month across the workspace; services sleep after 15 minutes idle.
- **Neon:** 0.5 GB storage and 100 compute-hours per project per month.
- **Upstash:** 256 MB and 500K commands per month.
