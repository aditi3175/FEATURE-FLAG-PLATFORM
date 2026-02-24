<div align="center">

# ⚡ FlagForge

### Release with Confidence, Not Chaos.

A modern, production-ready **feature flag & A/B testing platform** for high-velocity engineering teams.  
Decouple deploy from release and ship faster with safety.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![npm](https://img.shields.io/npm/v/flagforge-node-sdk?label=SDK&color=CB3837&logo=npm)](https://www.npmjs.com/package/flagforge-node-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

![Landing Page](screenshots/landing.png)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🚩 **Feature Flags** | Toggle features on/off instantly — no deploys needed |
| 🔀 **Multivariate (A/B/n)** | Test multiple variants with weighted rollouts |
| 🎯 **User Targeting** | Allowlist/blocklist specific users per flag |
| 📊 **Real-time Analytics** | Live evaluation metrics, top flags, and latency tracking |
| 📝 **Audit Logs** | Full timeline of every change with before/after diffs |
| 🔑 **Per-project API Keys** | Isolated projects with auto-generated secure keys |
| ⌨️ **Command Palette** | ⌘K to search flags, navigate, and take actions instantly |
| 📦 **Published SDK** | [`flagforge-node-sdk`](https://www.npmjs.com/package/flagforge-node-sdk) on npm |
| 🛡️ **Kill Switch** | Emergency off-switch for any feature, instantly |
| ⚡ **Redis Caching** | Sub-millisecond flag evaluation with automatic invalidation |

---

## 🖼️ Screenshots

<details>
<summary><b>📋 Project Dashboard</b> — Manage all your feature flag projects</summary>
<br>

![Dashboard](screenshots/dashboard.png)

</details>

<details>
<summary><b>📊 Analytics</b> — Real-time evaluation metrics with trend graphs</summary>
<br>

![Analytics](screenshots/analytics.png)

</details>

<details>
<summary><b>🔧 SDK Setup</b> — One-click API key copy & code examples</summary>
<br>

![SDK Setup](screenshots/sdk-setup.png)

</details>

<details>
<summary><b>📐 Navigation</b> — Clean sidebar with all sections</summary>
<br>

![Sidebar](screenshots/sidebar.png)

</details>

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
│    Dashboard    │─────▶│    Backend API   │◀────▶│  PostgreSQL │
│  (React + Vite) │      │(Express + Prisma)│      │  (Flags DB)  │
└─────────────────┘      └────────┬─────────┘      └──────────────┘
                                  │
                           ┌──────┴──────┐
                           │    Redis    │
                           │   (Cache)   │
                           └──────┬──────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    flagforge-node-sdk     │
                    │  (npm published SDK)      │
                    └───────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **Redis** 6+

### 1. Clone & Install

```bash
git clone https://github.com/aditi3175/feature-flag-platform.git
cd feature-flag-platform

# Install server
cd server && npm install

# Install dashboard
cd ../dashboard && npm install
```

### 2. Configure Environment

```bash
# In /server, copy and edit .env
cp .env.example .env
```

```env
PORT=4000
DATABASE_URL="postgresql://postgres:password@localhost:5432/flagforge"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
```

### 3. Setup Database

```bash
cd server
npx prisma db push
```

### 4. Start Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Dashboard
cd dashboard && npm run dev
```

### 5. Open Dashboard

Visit **http://localhost:5173** → Create an account → Create a project → Start managing flags!

---

## 📦 SDK Usage

Install the published SDK:

```bash
npm install flagforge-node-sdk
```

```typescript
import { FlagForgeClient } from 'flagforge-node-sdk';

const client = new FlagForgeClient({
  apiKey: 'ff_prod_...',           // from dashboard
  apiUrl: 'http://localhost:4000',
  refreshInterval: 60000,          // poll every 60s
});

await client.init();

// Boolean flag
const { enabled } = client.getVariant('dark-mode', 'user-123');

// Multivariate A/B test
const { value, variantId } = client.getVariant('checkout-btn', 'user-123', 'blue');
console.log(`Showing ${value} button`);

client.close();
```

---

## 🗂️ Project Structure

```
feature-flag-platform/
├── server/                 # Backend API
│   ├── src/
│   │   ├── controllers/    # Flag, Project, Auth controllers
│   │   ├── services/       # Evaluator, Cache, Audit logging
│   │   ├── routes/         # REST API routes
│   │   ├── middleware/     # Auth middleware (JWT)
│   │   └── config/        # Database & Redis config
│   └── prisma/            # Schema & migrations
├── dashboard/             # Frontend (React + Vite)
│   └── src/
│       ├── pages/         # Dashboard, Analytics, AuditLog, SDK, Settings
│       ├── components/    # Sidebar, CommandBar, Layout
│       ├── services/      # API client
│       └── context/       # Auth context
├── sdk-node/              # Published Node.js SDK
│   └── src/
│       └── FlagForgeClient.ts
└── demo-app/              # Example integration
```

---

## 🎓 How It Works

### Deterministic Flag Evaluation

FlagForge uses **MurmurHash-style hashing** for consistent variant assignment:

```
1. seed = userId + ":" + flagKey
2. hash = murmurHash(seed)
3. bucket = hash % 100
4. if bucket < rolloutPercentage → ENABLED
```

**Guarantees:** Same user always gets the same result. No database lookups at evaluation time. Works offline.

### Evaluation Priority

```
1. Kill Switch OFF    →  return false
2. User in Blocklist  →  return false
3. User in Allowlist  →  return true
4. Percentage Rollout →  hash-based bucketing
```

### Caching Strategy

- **Redis TTL**: 5 minutes
- **Auto-invalidation**: on flag update/delete
- **Fallback**: PostgreSQL on cache miss

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js · Express · TypeScript |
| **Database** | PostgreSQL · Prisma ORM |
| **Cache** | Redis (ioredis) |
| **Frontend** | React 18 · Vite · TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Auth** | JWT (bcrypt + jsonwebtoken) |
| **SDK** | TypeScript → CommonJS (npm published) |
| **Animations** | Framer Motion |

---

## 📈 Roadmap

- [x] Core flag evaluation engine
- [x] REST API with JWT auth
- [x] Premium dashboard UI (Linear-inspired dark theme)
- [x] Boolean & Multivariate flags
- [x] Real-time analytics with trend graphs
- [x] Audit logs with before/after diffs
- [x] Command palette (⌘K)
- [x] Published Node.js SDK on npm
- [x] Multi-environment support (Dev/Staging/Prod)
- [ ] Environment promotion (copy flags between envs)
- [ ] WebSocket real-time flag updates
- [ ] Team roles & collaboration
- [ ] Scheduled flag rollouts
- [ ] Advanced targeting (user attributes & segments)

---

## 📝 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ⚡ for safer, faster feature releases**

[Dashboard](http://localhost:5173) · [SDK on npm](https://www.npmjs.com/package/flagforge-node-sdk) · [Report Bug](https://github.com/aditi3175/feature-flag-platform/issues)

</div>
