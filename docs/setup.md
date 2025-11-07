# Development Setup Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose
- PostgreSQL (or use Docker Compose)

## Initial Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
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

3. **Start Docker services**
   ```bash
   docker-compose up -d
   ```

4. **Set up database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

## Development Workflow

- Backend API: `http://localhost:3001`
- Frontend App: `http://localhost:3000`
- Prisma Studio: `npm run db:studio` (in server directory)

## Project Structure

- `client/` - Next.js frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and utilities

