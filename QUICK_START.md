# Quick Start Guide - MindForge MVP

## 🚀 Getting Started (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

**Create `server/.env`:**
```env
DATABASE_URL="postgresql://mindforge:mindforge_dev_password@localhost:5432/mindforge_dev?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

**Create `client/.env.local`:**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Start Services
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Initialize database
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Prisma Studio: `npm run db:studio` (in server directory)

## 📋 Common Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:client       # Start frontend only
npm run dev:server       # Start backend only

# Database
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Prisma Studio

# Building
npm run build            # Build all packages
npm run lint             # Lint all packages
npm run type-check       # Type check all packages
```

## 🧪 Test the Application

### Using Seed Data
After running `npm run db:seed`, you can use these test accounts (password: `password123`):
- **Admin**: `admin@mindforge.com`
- **Facilitator**: `sarah.chen@mindforge.com`
- **Parent**: `david.johnson@email.com`
- **Student**: `alex.johnson@email.com`

### Manual Testing
1. **Register a user**: http://localhost:3000/register
2. **Login**: http://localhost:3000/login
3. **Browse bootcamps**: http://localhost:3000/bootcamps
4. **View dashboard**: http://localhost:3000/dashboard

### Running Tests
```bash
# Run server tests
npm run test --workspace=server

# Run all tests
npm run test
```

## 🐛 Troubleshooting

**Database connection issues:**
- Ensure Docker containers are running: `docker-compose ps`
- Check DATABASE_URL in `server/.env`

**Port already in use:**
- Change PORT in `server/.env` or kill existing process

**Prisma errors:**
- Run `npm run db:generate` after schema changes
- Check `server/prisma/schema.prisma` for syntax errors

## 📚 Next Steps

- **New Session?** Start with [NEXT_SESSION.md](./NEXT_SESSION.md)
- **Detailed Status**: See [SESSION_SUMMARY.md](./SESSION_SUMMARY.md)
- **Latest Session**: See [END_OF_SESSION.md](./END_OF_SESSION.md)

