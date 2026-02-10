# Production Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:

- [ ] A PostgreSQL database (RDS, DigitalOcean, Supabase, etc.)
- [ ] A Redis instance (Redis Cloud, Upstash, AWS ElastiCache, etc.)
- [ ] A hosting platform for the backend (Heroku, Railway, DigitalOcean, AWS, etc.)
- [ ] A static hosting service for the dashboard (Vercel, Netlify, Cloudflare Pages, etc.)

---

## Step 1: Prepare Production Database

### Option A: DigitalOcean Managed PostgreSQL

1. Create a managed PostgreSQL cluster
2. Note the connection string
3. Configure firewall rules to allow your backend server

### Option B: AWS RDS

1. Launch RDS PostgreSQL instance
2. Configure security groups
3. Get connection endpoint

### Option C: Supabase

1. Create new project
2. Go to Settings → Database
3. Copy connection string

---

## Step 2: Setup Production Redis

### Option A: Redis Cloud

1. Create free account at redis.com/try-free
2. Create new database
3. Copy connection string

### Option B: Upstash

1. Create free account at upstash.com
2. Create Redis database
3. Copy REST URL or Redis URL

---

## Step 3: Deploy Backend

### Option A: Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create flagforge-api

# Set environment variables
heroku config:set DATABASE_URL="postgresql://..."
heroku config:set REDIS_URL="redis://..."
heroku config:set NODE_ENV="production"
heroku config:set CORS_ORIGIN="https://your-dashboard.vercel.app"

# Deploy
git push heroku main

# Run migrations
heroku run npm run prisma:deploy
```

### Option B: Railway

1. Connect GitHub repository
2. Set environment variables in dashboard:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `NODE_ENV=production`
   - `CORS_ORIGIN`
3. Railway auto-deploys on git push
4. Run migrations from terminal

### Option C: DigitalOcean App Platform

1. Create new app from GitHub
2. Select `server/` as source directory
3. Set build command: `npm install && npm run build`
4. Set run command: `npm start`
5. Add environment variables
6. Deploy

---

## Step 4: Deploy Dashboard

### Option A: Vercel (Recommended)

```bash
cd dashboard

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://flagforge-api.herokuapp.com

# Deploy to production
vercel --prod
```

### Option B: Netlify

```bash
cd dashboard

# Build
npm run build

# Deploy via Netlify CLI
netlify deploy --prod --dir=dist

# Or use Netlify UI:
# 1. Drag & drop 'dist' folder
# 2. Set environment variable VITE_API_URL
```

### Option C: AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Configure CloudFront distribution
# Point to S3 bucket
```

---

## Step 5: Environment Variables Reference

### Backend (.env)

```env
# Server
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"

# Redis
REDIS_URL="rediss://default:password@host:port"

# CORS - Set to your dashboard URL
CORS_ORIGIN="https://your-dashboard.vercel.app"
```

### Dashboard (.env)

```env
# API URL - Set to your backend URL
VITE_API_URL=https://flagforge-api.herokuapp.com
```

---

## Step 6: Post-Deployment Checklist

- [ ] Backend health check working: `https://your-api.com/health`
- [ ] Database migrations applied successfully
- [ ] Dashboard loads and can create projects
- [ ] API key generation works
- [ ] Flag creation, editing, and deletion works
- [ ] SDK can connect and evaluate flags
- [ ] Redis caching is working (check logs)
- [ ] CORS is configured correctly
- [ ] SSL/TLS certificates are valid

---

## Step 7: Monitoring & Logging

### Add Logging Service

**Option 1: Logtail/Papertrail**
```typescript
// server/src/index.ts
import { Logtail } from '@logtail/node';

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
```

**Option 2: Sentry for Error Tracking**
```bash
npm install @sentry/node

# Initialize in server/src/index.ts
```

### Health Monitoring

Set up uptime monitoring:
- UptimeRobot
- Pingdom
- StatusCake

Monitor endpoint: `https://your-api.com/health`

---

## Step 8: Performance Optimization

### Backend

1. **Enable connection pooling** (already configured in Prisma)
2. **Add rate limiting**
   ```bash
   npm install express-rate-limit
   ```
3. **Enable compression**
   ```bash
   npm install compression
   ```

### Dashboard

1. **Enable code splitting** (Vite does this by default)
2. **Add service worker** for offline support
3. **Optimize images** and assets

---

## Step 9: Security Best Practices

- [ ] Use HTTPS everywhere
- [ ] Rotate API keys regularly
- [ ] Set up database backups
- [ ] Enable Redis persistence
- [ ] Use environment-specific API keys
- [ ] Implement rate limiting on evaluation endpoint
- [ ] Add request validation
- [ ] Enable CORS only for trusted origins
- [ ] Keep dependencies updated

---

## Step 10: SDK Distribution

### Publish to npm

```bash
cd sdk

# Login to npm
npm login

# Publish (update version in package.json first)
npm publish --access public
```

### Private Installation

If not publishing to npm, users can install from GitHub:

```bash
npm install git+https://github.com/yourusername/flagforge.git#main:sdk
```

---

## Troubleshooting

### Database Connection Issues

```
Error: P1001: Can't reach database server
```

**Solution:**
- Check DATABASE_URL format
- Verify SSL mode (`?sslmode=require` for cloud providers)
- Check firewall rules
- Ensure IP whitelist includes your server

### Redis Connection Issues

```
Error: ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
- Verify REDIS_URL format
- Check if Redis requires password
- Use `rediss://` for SSL connections

### CORS Errors

```
Access to fetch at 'https://api...' from origin 'https://dashboard...' has been blocked by CORS
```

**Solution:**
- Set CORS_ORIGIN environment variable on backend
- Ensure it matches your dashboard URL exactly
- Restart backend after changing environment variables

---

## Cost Estimation

### Free Tier Hosting (Good for MVP)

| Service | Provider | Cost |
|---------|----------|------|
| Backend | Railway Free | $0 |
| Database | Supabase Free | $0 |
| Redis | Upstash Free | $0 |
| Dashboard | Vercel Free | $0 |
| **Total** | | **$0/month** |

### Production Scale

| Service | Provider | Cost |
|---------|----------|------|
| Backend | Railway Pro | $5-20/mo |
| Database | DigitalOcean | $15/mo |
| Redis | Redis Cloud | $7/mo |
| Dashboard | Vercel Pro | $20/mo |
| **Total** | | **~$50/month** |

---

## Backup & Recovery

### Database Backups

**Automated backups:**
- Most managed PostgreSQL services include daily backups
- Retention: 7-30 days

**Manual backup:**
```bash
# Dump database
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Redis Persistence

Enable in Redis Cloud/Upstash dashboard:
- RDB snapshots (every 6 hours)
- AOF (append-only file)

---

## Scaling Considerations

### When to scale:

- **> 1000 requests/second**: Add load balancer, multiple backend instances
- **> 10,000 flags**: Optimize Redis memory, consider sharding
- **> 1M evaluations/day**: Add CDN for SDK, consider edge computing

### Horizontal Scaling

```
Load Balancer
    ├── Backend Instance 1 ────┐
    ├── Backend Instance 2 ────┤
    └── Backend Instance 3 ────┤
                                ▼
                        Shared PostgreSQL
                        Shared Redis
```

---

## Success! 🎉

Your FlagForge platform is now in production!

**Next steps:**
1. Create your first project
2. Integrate SDK into your application
3. Start rolling out features safely
4. Monitor usage and performance
