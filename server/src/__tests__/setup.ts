import express from 'express';
import cors from 'cors';
import { errorHandler } from '../middleware/errorHandler.js';
import { authRoutes } from '../routes/auth.js';
import { bootcampRoutes } from '../routes/bootcamps.js';
import { userRoutes } from '../routes/users.js';
import { sessionRoutes } from '../routes/sessions.js';
import { progressRoutes } from '../routes/progress.js';
import { knowledgeStreamRoutes } from '../routes/knowledgeStreams.js';
import { communicationRoutes } from '../routes/communications.js';
import { discussionRoutes } from '../routes/discussions.js';

export function createTestApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/bootcamps', bootcampRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api', progressRoutes);
  app.use('/api', knowledgeStreamRoutes);
  app.use('/api/communications', communicationRoutes);
  app.use('/api', discussionRoutes);

  // Error handling
  app.use(errorHandler);

  return app;
}

