# CI/CD Setup Complete ✅

## GitHub Actions Workflow

The CI/CD pipeline is configured and will automatically run on:
- ✅ Push to `main` or `develop` branches
- ✅ Pull requests to `main` or `develop` branches

### Workflow Jobs

1. **Test Job** (runs on all pushes/PRs)
   - Sets up PostgreSQL and Redis services
   - Installs dependencies
   - Generates Prisma Client
   - Runs database migrations
   - Executes test suite
   - Type checking
   - Linting

2. **Build Job** (runs only on `main` branch)
   - Builds server TypeScript
   - Builds client Next.js app
   - Creates Docker images
   - Uploads build artifacts

### View Workflow Runs

Check workflow status at:
**https://github.com/marlink/mind-forge/actions**

### Triggering the Workflow

The workflow will automatically trigger on:
- Next push to the repository
- Any pull request
- Manual trigger (via GitHub Actions UI)

---

## Deployment Setup

### Option 1: Docker Compose (Recommended for Quick Start)

```bash
# 1. Clone repository
git clone https://github.com/marlink/mind-forge.git
cd mind-forge

# 2. Set up environment variables
cp server/env.example.txt server/.env
# Edit server/.env with your production values

cp client/.env.example client/.env.local 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > client/.env.local

# 3. Build and start
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 4. Run migrations
docker-compose -f docker-compose.prod.yml run server npm run db:migrate

# 5. Verify
curl http://localhost:3001/health/ready
```

### Option 2: Manual Deployment

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for detailed instructions.

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy client
cd client
vercel
```

#### Railway/Render (Backend)
- Connect your GitHub repository
- Set environment variables
- Deploy automatically on push

---

## Environment Variables Required

### Server (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - At least 32 characters
- `CORS_ORIGIN` - Your frontend URL
- `REDIS_URL` - Redis connection (optional)
- `SENTRY_DSN` - Sentry error tracking (optional)

### Client (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

---

## Next Steps

1. ✅ CI/CD is configured and will run automatically
2. Set up environment variables
3. Deploy using Docker Compose or your preferred platform
4. Monitor workflow runs at: https://github.com/marlink/mind-forge/actions

---

**Status**: ✅ CI/CD Configured and Ready

