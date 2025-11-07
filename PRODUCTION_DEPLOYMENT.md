# Production Deployment Guide - MindForge MVP

This guide covers deploying MindForge to production environments.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Production database (PostgreSQL)
- Redis instance (optional but recommended)
- Domain name with SSL certificate
- Environment variables configured

## 🚀 Quick Start

### 1. Install Production Dependencies

```bash
cd server
npm install
```

This will install:
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `winston` - Structured logging
- `@sentry/node` - Error tracking
- `compression` - Response compression

### 2. Configure Environment Variables

Create `server/.env` with production values:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://user:password@host:5432/mindforge?schema=public"
REDIS_URL="redis://your-redis-host:6379"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="https://yourdomain.com"
LOG_LEVEL="info"
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"  # Optional
APP_VERSION="1.0.0"  # Optional
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

### 3. Build and Run with Docker

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Run database migrations
docker-compose -f docker-compose.prod.yml run server npm run db:migrate

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Verify Deployment

```bash
# Health check
curl http://localhost:3001/health

# Readiness check (includes database)
curl http://localhost:3001/health/ready

# Liveness check
curl http://localhost:3001/health/live
```

## 🔒 Security Features Implemented

### Server Security
- ✅ **Helmet** - Security headers (CSP, XSS protection, etc.)
- ✅ **Rate Limiting** - API and auth endpoint protection
- ✅ **CORS** - Configured for production domain
- ✅ **Request ID** - Request tracing
- ✅ **Compression** - Response compression

### Client Security
- ✅ **Security Headers** - HSTS, X-Frame-Options, etc.
- ✅ **Powered-By Header** - Removed
- ✅ **Image Optimization** - AVIF/WebP support

## 📊 Monitoring & Logging

### Logging
- **Development**: Console logs with colors
- **Production**: File logs (`logs/error.log`, `logs/combined.log`)
- **Structured Logging**: JSON format with request IDs

### Error Tracking
- **Sentry Integration**: Automatic error reporting
- **Performance Monitoring**: 10% sample rate in production
- **Profiling**: Enabled for performance analysis

### Health Checks
- `/health` - Basic health check
- `/health/ready` - Readiness (checks database)
- `/health/live` - Liveness probe

## 🐳 Docker Deployment

### Production Docker Compose

The `docker-compose.prod.yml` file includes:
- PostgreSQL with health checks
- Redis with health checks
- Server with health checks
- Client application
- Network isolation
- Volume persistence

### Manual Docker Build

```bash
# Build server
docker build -t mindforge-server:latest -f server/Dockerfile .

# Build client
docker build -t mindforge-client:latest -f client/Dockerfile .

# Run server
docker run -d \
  --name mindforge-server \
  -p 3001:3001 \
  --env-file server/.env \
  mindforge-server:latest

# Run client
docker run -d \
  --name mindforge-client \
  -p 3000:3000 \
  --env-file client/.env.local \
  mindforge-client:latest
```

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) includes:

1. **Test Job**
   - Runs on push/PR to main/develop
   - Sets up PostgreSQL and Redis
   - Runs tests
   - Type checking
   - Linting

2. **Build Job**
   - Runs on main branch
   - Builds server and client
   - Creates Docker images

## 📝 Database Migrations

### Production Migration Process

```bash
# Generate Prisma Client
npm run db:generate --workspace=server

# Run migrations
npm run db:migrate --workspace=server

# Or with Docker
docker-compose -f docker-compose.prod.yml run server npm run db:migrate
```

### Migration Best Practices
- Always backup database before migrations
- Test migrations in staging first
- Use transaction-safe migrations
- Monitor migration execution

## 🔧 Production Optimizations

### Server
- ✅ Compression middleware
- ✅ Connection pooling (Prisma)
- ✅ Graceful shutdown handling
- ✅ Error tracking (Sentry)
- ✅ Structured logging

### Client
- ✅ Next.js production optimizations
- ✅ Image optimization
- ✅ Code splitting
- ✅ Security headers

## 📈 Performance Monitoring

### Metrics to Monitor
- API response times
- Database query performance
- Error rates
- Request rates
- Memory usage
- CPU usage

### Recommended Tools
- **Sentry** - Error tracking and performance
- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **Datadog/New Relic** - APM

## 🛡️ Security Checklist

- [ ] JWT_SECRET is at least 32 characters
- [ ] Database credentials are secure
- [ ] CORS_ORIGIN is set to production domain
- [ ] SSL/TLS certificates configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Error messages don't leak sensitive info
- [ ] Logs don't contain sensitive data
- [ ] Dependencies are up to date
- [ ] Environment variables are secure

## 🔄 Deployment Workflow

1. **Pre-deployment**
   ```bash
   npm run test
   npm run type-check
   npm run lint
   npm run build
   ```

2. **Database Migration**
   ```bash
   npm run db:migrate --workspace=server
   ```

3. **Build Docker Images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

4. **Deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. **Verify**
   ```bash
   curl http://localhost:3001/health/ready
   ```

6. **Rollback** (if needed)
   ```bash
   docker-compose -f docker-compose.prod.yml down
   # Restore previous version
   ```

## 📚 Additional Resources

- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/performance-and-optimization)

## 🆘 Troubleshooting

### Server won't start
- Check environment variables
- Verify database connection
- Check logs: `docker-compose logs server`

### Database connection errors
- Verify DATABASE_URL format
- Check database is accessible
- Verify credentials

### Health check fails
- Check `/health/ready` endpoint
- Verify database connection
- Check application logs

### High memory usage
- Review Prisma query patterns
- Check for memory leaks
- Consider connection pooling

---

**Last Updated**: $(date)
**Status**: Production Ready ✅

