import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';

const router = Router();

// Basic health check
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness check (checks database connection)
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
      },
    });
  } catch (error) {
    logger.error('Readiness check failed', { error });
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'error',
      },
    });
  }
});

// Liveness check
router.get('/live', (_req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRoutes };

