# MindForge Server

Express.js backend API for the MindForge Learning Program.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

3. Generate Prisma Client:
   ```bash
   npm run db:generate
   ```

4. Run migrations:
   ```bash
   npm run db:migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

