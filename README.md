# ⚡ FlagForge

### Release with Confidence, Not Chaos.

A **feature flag & A/B testing platform** inspired by LaunchDarkly.
Decouple deploy from release: roll features out to a percentage of users, run A/B/n experiments, and kill a broken feature instantly, all without redeploying.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Tested with Vitest](https://img.shields.io/badge/tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![npm](https://img.shields.io/npm/v/flagforge-node-sdk?label=SDK&color=CB3837&logo=npm)](https://www.npmjs.com/package/flagforge-node-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

![Landing Page](./screenshots/landing.png)

## 🌐 Live Demo

- **Dashboard:** [https://feature-flag-platform-delta.vercel.app](https://feature-flag-platform-delta.vercel.app)
- **API Health:** [https://flagforge-api.onrender.com/health](https://flagforge-api.onrender.com/health)

### Demo Credentials
- **Email:** `demo@flagforge.dev`
- **Password:** `flagforge-demo`

> ⚠️ **Note on Cold Starts:** The backend is hosted on Render's free tier. If the instance has spun down due to inactivity, the first request may take 30–50 seconds to wake up. Subsequent requests run with standard low latency.

## ✨ Features

| Feature | Description |
| --- | --- |
| 🚩 **Feature Flags** | Toggle features on/off instantly, no deploys needed |
| 🔀 **Multivariate (A/B/n)** | Split users across multiple variants with weighted rollouts |
| 🎯 **User Targeting** | Allowlist/blocklist specific users per flag |
| 🛡️ **Kill Switch** | Emergency off-switch for any feature |
| 🌍 **Environments** | Separate Development, Staging and Production flags, with one-click promotion between them |
| 📦 **Node & React SDKs** | Flags are evaluated locally in your app: zero network calls per flag check |
| ⚡ **Redis Caching** | SDK configs and API key lookups cached in Redis, invalidated on every change |
| 📊 **Analytics** | Evaluation counts, top flags, environment split and server latency, aggregated in PostgreSQL |
| 📝 **Audit Logs** | Timeline of every change with before/after diffs |
| 🔑 **Per-project API Keys** | Isolated projects with cryptographically random keys |
| ⌨️ **Command Palette** | ⌘K to search flags, navigate, and take actions |

## 📈 Performance

Measured with local load tests (autocannon, 50 concurrent connections). Full methodology and raw numbers in **[BENCHMARKS.md](./BENCHMARKS.md)**.

| What | Before | After | Change |
| --- | --- | --- | --- |
| SDK config endpoint throughput (Redis cache) | 861 req/s | 2,987 req/s | **3.5x** |
| Flag evaluation throughput (cache + batched writes) | 825 req/s | 3,380 req/s | **4.1x** |
| Flag evaluation p99 latency | 97 ms | 45 ms | **−54%** |
| Analytics response on 1M events (SQL aggregation) | ~73 s | 0.66 s | **~110x** |
| Users bucketed differently by server vs SDKs | 42.0% | 0% | **fixed** |

---

## 🖼️ Screenshots

**📋 Project Dashboard: manage all your feature flag projects**

![Dashboard](./screenshots/dashboard.png)

**📊 Analytics: evaluation metrics with trend graphs**

![Analytics](./screenshots/analytics.png)

**🔧 SDK Setup: one-click API key copy & code examples**

![SDK Setup](./screenshots/sdk-setup.png)

**📐 Navigation: clean sidebar with all sections**

![Sidebar](./screenshots/sidebar.png)

---

## 🏗️ Architecture

```
┌─────────────────┐  JWT   ┌──────────────────────────┐        ┌──────────────┐
│    Dashboard    │───────▶│       Backend API        │◀──────▶│  PostgreSQL  │
│  (React + Vite) │        │ (Express + Prisma + TS)  │        │ flags, events│
└─────────────────┘        │                          │        │  audit logs  │
                           │  ┌────────────────────┐  │        └──────▲───────┘
                           │  │   Event buffer     │──┼───────────────┘
                           │  │ batched createMany │  │   1 INSERT per ~500 events
                           │  └────────────────────┘  │
                           └───────┬──────────▲───────┘
                                   │          │
                            ┌──────▼──────┐   │  GET /api/v1/sdk/flags (polled, cached)
                            │    Redis    │   │  POST /api/v1/sdk/events (batched)
                            │  (cache)    │   │
                            └─────────────┘   │
                                     ┌────────┴─────────────────┐
                                     │  Node SDK  /  React SDK  │
                                     │  evaluates flags locally │
                                     └──────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Docker** (for PostgreSQL and Redis)

### 1. Clone & install

```bash
git clone https://github.com/aditi3175/FEATURE-FLAG-PLATFORM.git
cd FEATURE-FLAG-PLATFORM

cd server && npm install
cd ../dashboard && npm install
```

### 2. Start PostgreSQL and Redis

```bash
# from the repo root
docker compose up -d
```

PostgreSQL is exposed on port **5433** (to avoid clashing with a local install) and Redis on **6379**.

### 3. Configure the server

Create `server/.env`:

```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/flagforge"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
```

### 4. Set up the database

```bash
cd server
npx prisma migrate deploy
```

### 5. Run

```bash
# Terminal 1: backend
cd server && npm run dev

# Terminal 2: dashboard
cd dashboard && npm run dev
```

Visit **http://localhost:5173** → create an account → create a project → start managing flags.

### Run the tests

```bash
cd server && npm test
```

The suite covers the bucketing hash (reference values, distribution, rollout accuracy), cross-implementation parity between the server and both SDKs on 100,000 users, and the event buffer (batching, retries, memory cap).

---

## 📦 SDK Usage

### Node.js

```bash
npm install flagforge-node-sdk
```

```typescript
import { FlagForgeClient } from 'flagforge-node-sdk';

const client = new FlagForgeClient({
  apiKey: 'ff_prod_...',           // from the dashboard
  apiUrl: 'http://localhost:4000',
  refreshInterval: 60000,          // poll for changes every 60s
});

await client.init();

// Boolean flag
const { enabled } = client.getVariant('dark-mode', 'user-123');

// Multivariate A/B test
const { value } = client.getVariant('checkout-btn', 'user-123', 'blue');
console.log(`Showing ${value} button`);

client.close();
```

### React

The browser SDK and React bindings live in [`sdk/`](./sdk) (not yet published to npm).

```tsx
import { FlagForgeProvider, useFlag, useVariant } from '../sdk/src/react';

<FlagForgeProvider apiKey="ff_prod_..." apiUrl="http://localhost:4000">
  <App />
</FlagForgeProvider>

function Checkout() {
  const newCheckout = useFlag('new-checkout', userId);
  const buttonColor = useVariant('checkout-btn', userId, 'blue');
  // components re-render automatically when flags change
}
```

---

## 🎓 How It Works

### Deterministic bucketing

Every user gets a stable bucket from 0 to 99 for each flag:

```
1. seed   = userId + ":" + flagKey
2. hash   = MurmurHash3_x86_32(seed)      (pure JS, identical in server, Node SDK and browser)
3. bucket = hash % 100
4. boolean flag:      bucket < rolloutPercentage   → enabled
   multivariate flag: each variant owns a slice of 0–99 (e.g. 50 / 30 / 20)
```

- The same user always gets the same result for the same flag.
- Including the flag key in the seed makes flags independent: the users in one 30% rollout aren't the same users in every other 30% rollout.
- A parity test runs 100,000 users through all three implementations and fails if any of them disagree.

### Evaluation priority

```
1. Kill switch off    →  disabled
2. User in blocklist  →  disabled
3. User in allowlist  →  enabled
4. Percentage rollout →  hash-based bucketing
```

### Local evaluation

The SDKs download all flags for an environment once, refresh them on an interval, and evaluate every flag check in memory. A flag check never waits on the network, and if the server is unreachable the SDK keeps serving the last flags it received.

### Caching strategy

- **Cache-aside** in Redis for API key → project lookups, per-environment SDK flag lists, and single flags.
- **Invalidation after every write** (create, update, rename, delete, promote, project delete), always after the database write so a concurrent read can't re-cache stale data.
- **5 minute TTL** as a safety net.
- **Fails open:** if Redis is down, requests fall back to PostgreSQL.
- The `X-Cache: HIT | MISS` response header shows which one served a request.

### Analytics pipeline

- The browser SDK queues evaluation events and sends them in batches (every 5 s or 100 events), flushing with `keepalive` when the tab closes.
- The server buffers events in memory and writes them with one `createMany` every second or every 500 events. The buffer is capped, retries failed writes, and is flushed on shutdown.
- Dashboard metrics are computed in PostgreSQL (`COUNT`, `GROUP BY`, `date_trunc`) using the `(project_id, timestamp)` index.
- `GET /health` reports buffer stats: events written, pending, dropped and failed flushes.

---

## ⚠️ Known Limitations

Deliberate trade-offs and things not built yet:

- **Change propagation:** cache invalidation is instant, but SDKs only see changes on their next poll (up to 60 s by default). Server-Sent Events or WebSockets would make this real-time.
- **Analytics durability:** buffered events live in memory, so a crash can lose up to ~1 second of analytics. A durable queue (Redis Streams, BullMQ) would remove that risk.
- **Targeting:** only allow/block lists by user ID. No attribute-based rules or segments yet.
- **Audit logs** are deleted along with their project (cascade). They should outlive the project they describe.
- **Cache race:** a read that fetches a row just before a write can re-cache it just after invalidation. The TTL bounds this to 5 minutes; versioned keys would close it fully.

---

## 🗂️ Project Structure

```
FEATURE-FLAG-PLATFORM/
├── server/                  # Backend API
│   ├── src/
│   │   ├── controllers/     # Flags, projects, analytics
│   │   ├── services/        # Evaluator, cache, event buffer, audit log
│   │   ├── routes/          # REST API + SDK routes
│   │   ├── middleware/      # JWT auth
│   │   ├── utils/           # Shared MurmurHash3 bucketing
│   │   ├── scripts/         # Benchmark seed scripts
│   │   └── config/          # Database & Redis
│   ├── tests/               # Vitest: hash, parity, event buffer
│   ├── bench/               # Load-test request bodies
│   └── prisma/              # Schema & migrations
├── dashboard/               # Frontend (React + Vite)
├── sdk-node/                # Node.js SDK (published on npm)
├── sdk/                     # Browser SDK + React provider & hooks
└── demo-app/                # Example integration
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Backend** | Node.js · Express · TypeScript |
| **Database** | PostgreSQL · Prisma ORM |
| **Cache** | Redis (ioredis) |
| **Frontend** | React 18 · Vite · TypeScript · Tailwind CSS v4 |
| **Auth** | JWT (bcrypt + jsonwebtoken) |
| **SDKs** | TypeScript (Node SDK on npm, browser SDK with React hooks) |
| **Testing** | Vitest · autocannon (load tests) |
| **Infra** | Docker Compose |

---

## 📈 Roadmap

- [x] Core flag evaluation engine
- [x] REST API with JWT auth
- [x] Boolean & multivariate flags
- [x] Analytics with trend graphs
- [x] Audit logs with before/after diffs
- [x] Command palette (⌘K)
- [x] Node.js SDK on npm, React SDK
- [x] Multi-environment support (Dev/Staging/Prod)
- [x] Environment promotion
- [x] Redis caching with write-time invalidation
- [x] Batched analytics ingestion
- [x] Cross-SDK parity tests
- [ ] Real-time flag updates (SSE / WebSockets)
- [ ] Durable event queue
- [ ] Advanced targeting (user attributes & segments)
- [ ] Team roles & collaboration
- [ ] Scheduled flag rollouts

---

## 📝 License

MIT. See [LICENSE](./LICENSE) for details.

---

**Built with ⚡ for safer, faster feature releases**

[Live Demo](https://feature-flag-platform-delta.vercel.app) · [SDK on npm](https://www.npmjs.com/package/flagforge-node-sdk) · [Benchmarks](./BENCHMARKS.md) · [Report Bug](https://github.com/aditi3175/FEATURE-FLAG-PLATFORM/issues)