import { Router } from 'express';
import {
  getAllBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  enrollInBootcamp,
} from '../controllers/bootcampController.js';
import {
  getBootcampSessions,
  createSession,
} from '../controllers/sessionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllBootcamps);

// Bootcamp sessions routes (must come before /:id to avoid route conflicts)
router.get('/:bootcampId/sessions', getBootcampSessions);
router.post('/:bootcampId/sessions', authenticate, authorize('FACILITATOR', 'ADMIN'), createSession);

// Protected routes
router.post('/', authenticate, authorize('FACILITATOR', 'ADMIN'), createBootcamp);
router.put('/:id', authenticate, authorize('FACILITATOR', 'ADMIN'), updateBootcamp);
router.post('/:id/enroll', authenticate, enrollInBootcamp);

// Public routes (must come after more specific routes)
router.get('/:id', getBootcamp);

export { router as bootcampRoutes };

