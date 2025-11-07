# Quick Start Guide (No Docker)

## Frontend Only (Quick Preview)

The frontend is now running! You can preview it at:
- **http://localhost:3000**

Note: Backend features (login, registration, data) won't work without a database.

## Full Setup (With Database)

### Option 1: Install PostgreSQL Locally (macOS)

```bash
# Install via Homebrew
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb mindforge_dev

# Update server/.env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/mindforge_dev?schema=public"
```

### Option 2: Use Cloud Database (Easiest)

1. Sign up for free at:
   - **Supabase**: https://supabase.com (recommended)
   - **Neon**: https://neon.tech
   - **Railway**: https://railway.app

2. Copy the connection string to `server/.env`:
   ```env
   DATABASE_URL="your-cloud-database-url"
   ```

3. Run migrations:
   ```bash
   cd server
   npm run db:generate
   npm run db:migrate
   npm run db:seed  # Optional: adds test data
   ```

### Option 3: Use Existing PostgreSQL

If you already have PostgreSQL installed:
```bash
createdb mindforge_dev
# Update DATABASE_URL in server/.env
```

## Start Servers

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend (already running)
npm run dev:client
```

## Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Test Accounts (after seeding)

- Admin: `admin@mindforge.com` / `password123`
- Facilitator: `sarah.chen@mindforge.com` / `password123`
- Student: `alex.johnson@email.com` / `password123`

