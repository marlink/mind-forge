# Quick Database Setup (No Docker Required)

## ⚡ Fastest Option: Cloud Database (Recommended)

### 1. Supabase (Free, 2 minutes)

1. Go to https://supabase.com
2. Click "Start your project" → Sign up (free)
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)
6. Update `server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
7. Run migrations:
   ```bash
   cd server
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

**Done!** Your database is ready in 2 minutes.

---

## Option 2: Install PostgreSQL Locally (macOS)

### Using Homebrew

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb mindforge_dev

# Create user (optional)
createuser -s mindforge
psql -d mindforge_dev -c "ALTER USER mindforge WITH PASSWORD 'mindforge_dev_password';"

# Update server/.env
DATABASE_URL="postgresql://mindforge:mindforge_dev_password@localhost:5432/mindforge_dev?schema=public"
```

### Using Official Installer

1. Download: https://www.postgresql.org/download/macosx/
2. Run installer
3. Create database:
   ```bash
   createdb mindforge_dev
   ```
4. Update `server/.env`:
   ```env
   DATABASE_URL="postgresql://$(whoami)@localhost:5432/mindforge_dev?schema=public"
   ```

### Run Migrations

```bash
cd server
npm run db:generate
npm run db:migrate
npm run db:seed  # Optional: adds test data
```

---

## Option 3: Other Cloud Databases

### Neon (Free tier)
- https://neon.tech
- Copy connection string to `server/.env`

### Railway (Free tier)
- https://railway.app
- Create PostgreSQL → Copy connection string

---

## Verify Setup

```bash
# Check database connection
curl http://localhost:3001/health

# Should return: {"status":"ok",...}
```

---

## Troubleshooting

### "Can't reach database server"
- PostgreSQL is not running
- Check: `brew services list` (if using Homebrew)
- Start: `brew services start postgresql@15`

### "Database does not exist"
- Create it: `createdb mindforge_dev`

### "Authentication failed"
- Check username/password in `DATABASE_URL`
- Default macOS user: your username (no password needed)

---

## After Setup

Restart your backend server:
```bash
npm run dev:server
```

Your app should now work with full database functionality! 🎉

