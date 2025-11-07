import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSentry } from './lib/sentry.js';
import { securityHeaders, compressionMiddleware, apiLimiter, requestId } from './middleware/security.js';
import { authLimiter } from './middleware/security.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { bootcampRoutes } from './routes/bootcamps.js';
import { userRoutes } from './routes/users.js';
import { sessionRoutes } from './routes/sessions.js';
import { progressRoutes } from './routes/progress.js';
import { knowledgeStreamRoutes } from './routes/knowledgeStreams.js';
import { communicationRoutes } from './routes/communications.js';
import { discussionRoutes } from './routes/discussions.js';
import logger from './lib/logger.js';

dotenv.config();

// Initialize Sentry before anything else
initSentry();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware (must be first)
app.use(securityHeaders);
app.use(compressionMiddleware);
app.use(requestId);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Health checks (before auth)
app.use('/health', healthRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bootcamps', bootcampRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api', progressRoutes);
app.use('/api', knowledgeStreamRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api', discussionRoutes);

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
  });
});

