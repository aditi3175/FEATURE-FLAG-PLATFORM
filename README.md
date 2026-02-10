# FlagForge - Feature Flag Management Platform 🚩

A production-ready feature flag management platform that enables safe feature rollouts, A/B testing, and instant rollbacks without code redeployment.

## 🎯 Features

- **Feature Flags**: Toggle features on/off instantly without deploying
- **Percentage Rollout**: Gradually roll out features to a percentage of users
- **User Targeting**: Whitelist/blacklist specific users
- **Kill Switch**: Emergency off-switch for any feature
- **A/B Testing**: Run experiments with deterministic user assignment
- **Real-time Updates**: Changes propagate through Redis caching
- **Beautiful Dashboard**: Modern React UI for managing flags
- **JavaScript SDK**: Easy integration with any application

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐
│  Dashboard      │─────▶│   Backend    │◀────▶│  PostgreSQL │
│  (React + Vite) │      │ (Node/Express)│      │  (Flags DB) │
└─────────────────┘      └──────┬───────┘      └─────────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │    Redis    │
                         │   (Cache)   │
                         └─────────────┘
                                ▲
                                │
                         ┌──────┴──────┐
                         │     SDK     │
                         │  Evaluation │
                         └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd "Feature Flag"

# Install all dependencies
cd server && npm install
cd ../dashboard && npm install
cd ../sdk && npm install && npm run build
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env`:
```env
# Server
PORT=4000
NODE_ENV=development

# Database (update with your credentials)
DATABASE_URL="postgresql://postgres:password@localhost:5432/flagforge"

# Redis
REDIS_URL="redis://localhost:6379"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

### 3. Setup Database

```bash
cd server
npm run prisma:migrate
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Dashboard:**
```bash
cd dashboard
npm run dev
```

### 5. Access Dashboard

Open http://localhost:5173 in your browser.

1. Create a new project
2. Copy the API key
3. Create your first feature flag
4. Use the SDK to evaluate flags

## 📚 Documentation

### Backend API

See [server/README.md](server/README.md) for:
- API endpoints reference
- Database schema
- Environment configuration

### Frontend Dashboard

See [dashboard/](dashboard/) for:
- React component structure
- Routing setup
- API client usage

### JavaScript SDK

See [sdk/README.md](sdk/README.md) for:
- Installation instructions
- API reference
- Integration examples

## 🔧 Development

### Project Structure

```
Feature Flag/
├── server/              # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── services/    # Business logic (cache, evaluator)
│   │   ├── config/      # Database & Redis config
│   │   └── utils/       # Utilities (hashing)
│   └── prisma/          # Database schema
├── dashboard/           # Frontend UI (React + Vite)
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # Reusable components
│       └── api/         # API client
└── sdk/                 # JavaScript SDK
    └── src/
        └── index.ts     # SDK implementation
```

### Running Tests

```bash
# Backend tests (when implemented)
cd server
npm test

# Frontend tests (when implemented)
cd dashboard
npm test
```

## 🌐 Production Deployment

### Backend

1. **Build:**
   ```bash
   cd server
   npm run build
   ```

2. **Deploy to your platform** (Heroku, AWS, DigitalOcean, etc.)
   - Set environment variables
   - Run `npm run prisma:deploy` for migrations
   - Start with `npm start`

### Dashboard

1. **Build:**
   ```bash
   cd dashboard
   npm run build
   ```

2. **Deploy `dist/` folder** to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting

3. **Set environment variable:**
   ```env
   VITE_API_URL=https://your-api-domain.com
   ```

### Database & Redis

- **PostgreSQL**: Use managed service (RDS, DigitalOcean, Supabase)
- **Redis**: Use managed service (Redis Cloud, Upstash, AWS ElastiCache)

## 🎓 How It Works

### Deterministic Flag Evaluation

FlagForge uses **MD5 hashing** to consistently assign users to flag variations:

```
1. Concatenate: seed = userId + ":" + flagKey
2. Hash: hash = md5(seed)
3. Normalize: score = parseInt(hash.substring(0, 8), 16) % 100
4. Compare: if score < rolloutPercentage → ENABLED
```

This ensures:
- ✅ Same user always gets same result
- ✅ Stateless evaluation (no session tracking)
- ✅ Predictable distribution

### Evaluation Priority

1. **Kill Switch** - If flag.status = false, return OFF
2. **Blocked Users** - If user in blocklist, return OFF
3. **Whitelisted Users** - If user in allowlist, return ON
4. **Percentage Rollout** - Hash-based evaluation

### Caching Strategy

- **Redis TTL**: 5 minutes
- **Cache Invalidation**: On flag update/delete
- **Fallback**: Fetch from PostgreSQL on cache miss

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis (ioredis) |
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| SDK | TypeScript (compiles to CommonJS) |

## 📈 Roadmap

- [x] Core flag evaluation engine
- [x] REST API
- [x] Dashboard UI
- [x] JavaScript SDK
- [ ] Metrics & Analytics
- [ ] Audit logs
- [ ] Environment support (dev/staging/prod)
- [ ] WebSocket real-time updates
- [ ] Advanced targeting (user attributes, segments)
- [ ] Scheduled rollouts

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ for safer feature releases**
