# MindForge MVP - File Structure Reference

## Root Directory

```
mindforge-mvp/
├── .editorconfig          # Editor configuration
├── .eslintrc.json         # ESLint configuration
├── .gitignore             # Git ignore rules
├── .prettierrc            # Prettier configuration
├── docker-compose.yml     # Docker services (PostgreSQL, Redis)
├── package.json           # Root workspace configuration
├── README.md              # Main project README
├── QUICK_START.md         # Quick setup guide
├── SESSION_SUMMARY.md     # Current status and next steps
├── ROADMAP.md             # Development roadmap
├── SETUP_COMPLETE.md      # Initial setup completion notes
├── tsconfig.json          # Root TypeScript configuration
│
├── client/                # Next.js Frontend Application
│   ├── app/               # Next.js App Router pages
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Homepage
│   │   ├── globals.css    # Global styles
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   ├── bootcamps/     # Bootcamp pages
│   │   │   ├── page.tsx   # Bootcamp catalog
│   │   │   └── [id]/      # Bootcamp detail page
│   │   └── dashboard/     # User dashboard
│   ├── next.config.js     # Next.js configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── postcss.config.js  # PostCSS configuration
│   ├── tsconfig.json      # TypeScript configuration
│   ├── package.json       # Frontend dependencies
│   └── README.md          # Frontend README
│
├── server/                # Express.js Backend API
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   ├── controllers/  # Business logic controllers
│   │   │   ├── authController.ts
│   │   │   ├── bootcampController.ts
│   │   │   └── userController.ts
│   │   ├── routes/        # API route definitions
│   │   │   ├── auth.ts
│   │   │   ├── bootcamps.ts
│   │   │   └── users.ts
│   │   ├── middleware/    # Express middleware
│   │   │   ├── auth.ts    # Authentication middleware
│   │   │   └── errorHandler.ts
│   │   └── lib/           # Utility libraries
│   │       └── prisma.ts  # Prisma client instance
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── tsconfig.json      # TypeScript configuration
│   ├── package.json       # Backend dependencies
│   ├── env.example.txt    # Environment variables template
│   └── README.md          # Backend README
│
├── shared/                # Shared TypeScript Package
│   ├── src/
│   │   ├── index.ts       # Main exports
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── tsconfig.json      # TypeScript configuration
│   ├── package.json       # Shared package dependencies
│   └── README.md          # Shared package README
│
├── docs/                  # Documentation
│   ├── setup.md           # Development setup guide
│   └── api.md             # API documentation
│
└── tests/                 # Test Configurations
    └── jest.config.js     # Jest configuration
```

## Key Files to Know

### Configuration Files
- `package.json` (root) - Workspace configuration, scripts
- `docker-compose.yml` - Local development services
- `tsconfig.json` (root) - Base TypeScript config
- `.env` files - Environment variables (not in repo)

### Backend Entry Points
- `server/src/index.ts` - Express server starts here
- `server/prisma/schema.prisma` - Database schema definition
- `server/src/controllers/` - Business logic
- `server/src/routes/` - API endpoints

### Frontend Entry Points
- `client/app/layout.tsx` - Root layout component
- `client/app/page.tsx` - Homepage
- `client/app/*/page.tsx` - Route pages

### Database
- `server/prisma/schema.prisma` - All models defined here
- Run `npm run db:generate` after schema changes
- Run `npm run db:migrate` to apply changes

## Important Notes

1. **Environment Variables**: Never commit `.env` files
2. **Database Changes**: Always run migrations after schema changes
3. **Type Generation**: Prisma auto-generates TypeScript types
4. **Hot Reload**: Both frontend and backend support hot reload
5. **Ports**: Backend (3001), Frontend (3000), PostgreSQL (5432), Redis (6379)

