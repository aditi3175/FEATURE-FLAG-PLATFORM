# FlagForge Benchmarks

Local load tests measuring the effect of three backend changes: Redis caching, batched analytics writes, and moving analytics aggregation into SQL. Every number here comes from the commands in [How to reproduce](#how-to-reproduce).

> These are **local load tests on a single laptop**, not production traffic. Absolute numbers depend on hardware; the before/after ratios are the meaningful part.

## Environment

| | |
| --- | --- |
| CPU | 12th Gen Intel Core i5-12500H (12 cores, 16 threads) |
| RAM | 16 GB |
| OS | Windows, Docker Desktop |
| Node.js | v22.18.0 |
| PostgreSQL | 16 (postgres:16-alpine, Docker) |
| Redis | 7 (redis:7-alpine, Docker) |
| Load generator | autocannon, running on the same machine |

The server ran as a production build (`npm run build && npm start`), not in dev/watch mode.

## Methodology

- **Load:** `autocannon -c 50 -d 20`, i.e. 50 concurrent connections for 20 seconds.
- **Warm-up:** each benchmark was run twice and the second run was recorded.
- **Cache off:** the same build started with `DISABLE_CACHE=true`, which runs the server without Redis.
- **Data:** a seeded benchmark project with 50 Production flags (every 5th is a 3-variant A/B/n test). The analytics benchmark adds 1,000,000 synthetic evaluation events spread over 7 days.
- **Caveat:** the load generator, server, PostgreSQL and Redis all shared one machine, so they competed for CPU. Real deployments would separate them.

---

## 1. SDK config endpoint: Redis caching

`GET /api/v1/sdk/flags` is the endpoint every SDK polls. Each request resolves the API key to a project, then loads all 50 flags for the environment. With caching, both lookups are served from Redis.

| | Throughput | Avg latency |
| --- | --- | --- |
| Cache off (PostgreSQL only) | 861 req/s | 57.6 ms |
| Cache on (Redis) | 2,987 req/s | 16.3 ms |
| **Change** | **3.5x** | **−72%** |

## 2. Flag evaluation endpoint: caching + batched writes

`POST /api/v1/sdk/evaluate` evaluates one flag for one user on the server and records an analytics event.

| Stage | Throughput | Avg latency | p99 latency |
| --- | --- | --- | --- |
| Baseline: no cache, one INSERT per request | 706 req/s | 70.4 ms | — |
| + Redis cache (reads cached, still one INSERT per request) | 825 req/s | 60.2 ms | 97 ms |
| + Batched writes (event buffer + `createMany`) | 3,380 req/s | 14.3 ms | 45 ms |
| **Change vs. cache-only** | **4.1x** | **−76%** | **−54%** |

Caching alone helped only 17% because the per-request INSERT remained the bottleneck. Removing it from the request path gave the large jump.

### Database writes during the batched run

From `GET /health` after the benchmark:

```json
{
  "written": 67631,
  "batches": 208,
  "dropped": 0,
  "failedFlushes": 0,
  "pending": 0
}
```

67,631 events were written in **208 INSERT statements** (≈325 rows each) instead of 67,631. No events were dropped and no writes failed.

## 3. Analytics endpoint: SQL aggregation

`GET /api/projects/:id/analytics?period=7d` on a project with **1,000,000 events**.

- **Before:** loaded every event in the period into Node with `findMany` and counted in JavaScript.
- **After:** `COUNT`, `GROUP BY`, `AVG` and `date_trunc` in PostgreSQL, with independent queries run in parallel.

| Run | Before | After |
| --- | --- | --- |
| 1 | 122,173 ms | 941 ms |
| 2 | 60,448 ms | 666 ms |
| 3 | 73,072 ms | 659 ms |
| 4 | 84,879 ms | 650 ms |
| 5 | 60,596 ms | 664 ms |
| **Median** | **73,072 ms** | **664 ms** |

Roughly **110x faster** (median to median). The "before" timings vary widely because Node was holding a million rows in memory. The first "after" run was slower because the database caches were cold.

## 4. Bucketing correctness

Not a performance benchmark, but measured the same way: by running the test suite (`npm test`).

| | Before | After |
| --- | --- | --- |
| Users assigned differently by server vs. SDK (boolean flag, 30% rollout, 100,000 users) | 42.0% | 0% |
| Rollout error at 10 / 30 / 50 / 90% targets (100,000 users) | — | under 0.3 percentage points |

Before the fix, the server hashed with MD5 while both SDKs used a different string hash. All three now share one MurmurHash3 implementation, and the parity test enforces it.

---

## How to reproduce

From the repo root (PowerShell syntax; bash is similar):

```powershell
docker compose up -d
cd server
npm install
npm run build
node dist/scripts/seed_benchmark.js     # 50 flags, API key ff_bench_local_key
npm start
```

**SDK config endpoint** (in a second terminal):

```powershell
npx autocannon -c 50 -d 20 -H "x-api-key=ff_bench_local_key" http://localhost:4000/api/v1/sdk/flags
```

**Evaluate endpoint:**

```powershell
npx autocannon -c 50 -d 20 -m POST -H "x-api-key=ff_bench_local_key" -H "content-type=application/json" -i bench/evaluate-body.json http://localhost:4000/api/v1/sdk/evaluate
```

**Cache off:** stop the server, then start it with `$env:DISABLE_CACHE="true"; npm start`. Run `Remove-Item Env:DISABLE_CACHE` afterwards.

**Analytics on 1M events:**

```powershell
node dist/scripts/seed_events.js        # inserts 1,000,000 synthetic events

$login = Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/auth/login -ContentType "application/json" -Body '{"email":"bench@flagforge.local","password":"bench-password-123"}'
$token = $login.token
$projectId = "<Project ID printed by seed_benchmark>"

1..5 | % { (Measure-Command { Invoke-RestMethod -Uri "http://localhost:4000/api/projects/$projectId/analytics?period=7d" -Headers @{ Authorization = "Bearer $token" } }).TotalMilliseconds }
```

**Bucketing tests:**

```powershell
npm test
```

The benchmark account (`bench@flagforge.local`) and API key are for local testing only.