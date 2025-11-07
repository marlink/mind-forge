# Local PostgreSQL Setup (No Docker)

## Option 1: Install PostgreSQL via Homebrew (macOS)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database and user
createuser -s mindforge
createdb mindforge_dev -O mindforge

# Set password (optional)
psql -d mindforge_dev -c "ALTER USER mindforge WITH PASSWORD 'mindforge_dev_password';"
```

## Option 2: Install PostgreSQL via Official Installer

1. Download from: https://www.postgresql.org/download/macosx/
2. Run the installer
3. Set up a database:
   ```bash
   createdb mindforge_dev
   ```

## Configure Environment

Update `server/.env`:
```env
DATABASE_URL="postgresql://mindforge:mindforge_dev_password@localhost:5432/mindforge_dev?schema=public"
```

## Quick Start Without Database (Development Mode)

If you just want to preview the frontend without backend:

1. Start only the frontend:
   ```bash
   cd client
   npm run dev
   ```

2. The frontend will run on http://localhost:3000
   - Some features requiring backend will show errors
   - But you can see the UI and navigation

## Alternative: Use a Cloud Database

- **Supabase** (Free tier): https://supabase.com
- **Neon** (Free tier): https://neon.tech
- **Railway** (Free tier): https://railway.app

Just update DATABASE_URL in `server/.env` with the connection string.

