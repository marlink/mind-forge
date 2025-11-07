# MindForge Learning Program - MVP Platform

> **Stop Teaching for Tests. Start Teaching for Brains.**

A modern learning platform that replaces traditional semester-based education with intensive one-week learning sprints focused on cognitive development and independent thinking.

## 🚀 Quick Start

See [QUICK_START.md](./QUICK_START.md) for immediate setup instructions.

## 📋 Current Status

**Phase 6 Production Readiness - Complete** ✅

### Backend (Complete)
- ✅ Authentication system (register, login, JWT)
- ✅ Bootcamp management (CRUD, enrollment)
- ✅ Session management (11 endpoints)
- ✅ Progress tracking (5 endpoints)
- ✅ Knowledge streams (4 endpoints)
- ✅ Communication system (7 endpoints)
- ✅ Discussion features (5 endpoints)
- ✅ User management (profiles, role-based access)
- ✅ Database schema (Prisma with PostgreSQL)
- ✅ Comprehensive test suite
- ✅ **40+ API endpoints implemented**
- ✅ **Production security (helmet, rate limiting)**
- ✅ **Structured logging (Winston)**
- ✅ **Error tracking (Sentry)**
- ✅ **Health checks and monitoring**

### Frontend (In Progress)
- ✅ Authentication pages (login, register)
- ✅ Bootcamp catalog and detail pages
- ✅ Role-based dashboards (Student, Parent, Facilitator, Admin)
- ✅ Communication inbox page
- ✅ Session detail page
- ✅ Progress visualization components
- ✅ Reusable UI component library
- ✅ **Production optimizations (security headers, compression)**
- ⏳ Session calendar view
- ⏳ Enhanced bootcamp management pages

**See [FRONTEND_STATUS.md](./FRONTEND_STATUS.md) and [NEXT_SESSION.md](./NEXT_SESSION.md) for detailed status.**
**See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for production deployment guide.**

## Project Structure

```
mindforge-mvp/
├── client/          # Next.js frontend application
├── server/          # Node.js/Express backend API
├── shared/          # Shared TypeScript types and utilities
├── docs/            # Documentation
└── tests/           # Test configurations
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Auth**: JWT
- **Development**: Docker Compose, ESLint, Prettier

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose
- PostgreSQL (or use Docker Compose)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mindforge-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `server/.env`:
   ```env
   DATABASE_URL="postgresql://mindforge:mindforge_dev_password@localhost:5432/mindforge_dev?schema=public"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN="http://localhost:3000"
   ```

   Create `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   ```

4. **Start Docker services**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations and seed**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed  # Populates database with test data
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API at `http://localhost:3001`
   - Frontend app at `http://localhost:3000`

## Development

### Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client
- `npm run dev:server` - Start only the server
- `npm run build` - Build all workspaces
- `npm run lint` - Lint all workspaces
- `npm run test` - Run tests in all workspaces
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data
- `npm run db:studio` - Open Prisma Studio

### Workspace Structure

- **client/**: Next.js application with App Router
- **server/**: Express.js API with Prisma ORM
- **shared/**: Shared TypeScript types and utilities

## Documentation

- [Quick Start Guide](./QUICK_START.md) - Immediate setup instructions
- [Production Deployment](./PRODUCTION_DEPLOYMENT.md) - Production deployment guide
- [Session Summary](./SESSION_SUMMARY.md) - Current status and next steps
- [End of Session Report](./END_OF_SESSION.md) - Latest session accomplishments
- [Development Roadmap](./ROADMAP.md) - Feature development plan
- [Setup Guide](./docs/setup.md) - Detailed development setup instructions
- [API Documentation](./docs/api.md) - API endpoint documentation

## Next Steps

1. **Testing & Validation** - Test all implemented features
2. **Core Features** - Session management, progress tracking, knowledge streams
3. **Communication** - Messaging, notifications, discussions
4. **Frontend Enhancements** - Improved UI/UX, additional pages
5. **Advanced Features** - Virtual classroom, AI personalization, payments

See [ROADMAP.md](./ROADMAP.md) for detailed development plan.

## License

Private - All Rights Reserved

