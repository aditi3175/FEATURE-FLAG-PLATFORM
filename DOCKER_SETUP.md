# Docker Setup Guide for FlagForge

This guide will help you set up PostgreSQL and Redis using Docker for local development.

## Prerequisites

- ✅ Docker Desktop installed and running on your computer

## Step-by-Step Setup

### Step 1: Start Docker Containers

Open a terminal in the project root directory and run:

```bash
docker-compose up -d
```

This command will:
- Download PostgreSQL 16 and Redis 7 images (first time only)
- Start both containers in the background
- Create persistent volumes for data storage

**Expected output:**
```
Creating network "feature-flag_default" with the default driver
Creating flagforge-postgres ... done
Creating flagforge-redis    ... done
```

### Step 2: Verify Containers Are Running

```bash
docker-compose ps
```

You should see both containers with status "Up":
```
NAME                 STATUS
flagforge-postgres   Up (healthy)
flagforge-redis      Up (healthy)
```

### Step 3: Check Environment Variables

The `.env` file has been updated with the correct connection strings:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flagforge?schema=public"
REDIS_URL="redis://localhost:6379"
```

### Step 4: Run Database Migrations

```bash
cd server
npm run prisma:migrate
```

Follow the prompts and enter a migration name (e.g., "init").

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "flagforge"

✔ Enter a name for the new migration: … init
Applying migration `20260208_init`

The following migration(s) have been created and applied:
migrations/
  └─ 20260208_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

### Step 5: Start the Backend Server

```bash
npm run dev
```

You should now see:
```
🚀 Server running on http://localhost:4000
📊 Health check: http://localhost:4000/health
✅ Redis connected successfully
```

### Step 6: Start the Dashboard

In a new terminal:
```bash
cd dashboard
npm run dev
```

Dashboard will be available at: http://localhost:5173

---

## Useful Docker Commands

### View Container Logs
```bash
# PostgreSQL logs
docker logs flagforge-postgres

# Redis logs
docker logs flagforge-redis

# Follow logs in real-time
docker logs -f flagforge-postgres
```

### Stop Containers
```bash
docker-compose stop
```

### Start Containers (after stopping)
```bash
docker-compose start
```

### Stop and Remove Containers
```bash
docker-compose down
```

### Stop and Remove Containers + Delete Data
```bash
docker-compose down -v
```

### Access PostgreSQL Shell
```bash
docker exec -it flagforge-postgres psql -U postgres -d flagforge
```

Common psql commands:
- `\dt` - List all tables
- `\d projects` - Describe projects table
- `SELECT * FROM projects;` - Query projects
- `\q` - Quit

### Access Redis CLI
```bash
docker exec -it flagforge-redis redis-cli
```

Common Redis commands:
- `PING` - Test connection (should return PONG)
- `KEYS *` - List all keys
- `GET flag:project-id:flag-key` - Get cached flag
- `FLUSHALL` - Clear entire cache
- `exit` - Quit

---

## Troubleshooting

### Port Already in Use

**Error:**
```
Error: bind: address already in use
```

**Solution:**
Check if PostgreSQL or Redis is already running on your machine:
```bash
# Windows
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# Stop Docker containers and kill processes using those ports
```

### Container Won't Start

**Solution:**
```bash
# View detailed logs
docker-compose logs

# Restart containers
docker-compose restart
```

### Database Connection Refused

**Solution:**
1. Make sure Docker containers are running: `docker-compose ps`
2. Check if port 5432 is accessible: `telnet localhost 5432`
3. Verify `.env` file has correct `DATABASE_URL`

### Redis Connection Error

**Solution:**
1. Check Redis container: `docker ps | grep redis`
2. Test Redis: `docker exec -it flagforge-redis redis-cli ping`
3. Restart Redis: `docker-compose restart redis`

---

## What's Running?

| Service | Container Name | Port | Credentials |
|---------|----------------|------|-------------|
| PostgreSQL | flagforge-postgres | 5432 | user: `postgres`, password: `postgres` |
| Redis | flagforge-redis | 6379 | No password |

---

## Data Persistence

Your data is stored in Docker volumes:
- `feature-flag_postgres_data` - All database tables and records
- `feature-flag_redis_data` - Redis cache

Data persists even after stopping containers. Only `docker-compose down -v` will delete it.

---

## Development Workflow

1. **Start Docker:** `docker-compose up -d`
2. **Run migrations (first time):** `cd server && npm run prisma:migrate`
3. **Start backend:** `npm run dev`
4. **Start dashboard:** `cd dashboard && npm run dev`
5. **Stop Docker when done:** `docker-compose stop`

Next day:
1. **Start Docker:** `docker-compose start`
2. **Start backend & dashboard** (skip migrations)

---

## Success! ✅

Your local development environment is now fully configured with:
- ✅ PostgreSQL running in Docker
- ✅ Redis running in Docker
- ✅ Database schema created
- ✅ Backend server connected
- ✅ Ready for development!

Happy coding! 🚀
