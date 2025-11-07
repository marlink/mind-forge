import { Router } from 'express';
import {
  getSession,
  updateSession,
  deleteSession,
  addSessionActivity,
  updateSessionActivity,
  deleteSessionActivity,
  getSessionAttendance,
  createAttendance,
  updateAttendance,
} from '../controllers/sessionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Session routes
router.get('/:id', getSession);
router.put('/:id', authenticate, authorize('FACILITATOR', 'ADMIN'), updateSession);
router.delete('/:id', authenticate, authorize('FACILITATOR', 'ADMIN'), deleteSession);

// Session activities
router.post('/:id/activities', authenticate, authorize('FACILITATOR', 'ADMIN'), addSessionActivity);
router.put('/:id/activities/:activityId', authenticate, authorize('FACILITATOR', 'ADMIN'), updateSessionActivity);
router.delete('/:id/activities/:activityId', authenticate, authorize('FACILITATOR', 'ADMIN'), deleteSessionActivity);

// Session attendance
router.get('/:id/attendance', getSessionAttendance);
router.post('/:id/attendance', authenticate, authorize('FACILITATOR', 'ADMIN'), createAttendance);
router.put('/:id/attendance/:attendanceId', authenticate, authorize('FACILITATOR', 'ADMIN'), updateAttendance);

export { router as sessionRoutes };

