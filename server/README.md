# FlagForge Backend

Feature flag management backend with PostgreSQL and Redis.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis instance

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp ../.env.example ../.env
   ```
   
   Update `.env` with your database and Redis connection strings:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/flagforge"
   REDIS_URL="redis://localhost:6379"
   PORT=4000
   CORS_ORIGIN="http://localhost:5173"
   ```

3. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `DELETE /api/projects/:id` - Delete project

### Flags
- `POST /api/flags` - Create flag
- `GET /api/flags?projectId=xxx` - List flags
- `GET /api/flags/:id` - Get flag details
- `PATCH /api/flags/:id` - Update flag
- `DELETE /api/flags/:id` - Delete flag

### Evaluation
- `POST /api/evaluate` - Evaluate flag for user
  ```json
  {
    "apiKey": "project-api-key",
    "flagKey": "feature-name",
    "userId": "user-123"
  }
  ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
