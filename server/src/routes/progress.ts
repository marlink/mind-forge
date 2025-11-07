import { Router } from 'express';
import {
  getStudentProgress,
  createProgress,
  getBootcampProgress,
  getAllRubrics,
  getRubricBySkill,
} from '../controllers/progressController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Student progress routes
router.get('/students/:studentId/progress', getStudentProgress);

// Progress record routes
router.post('/progress', authenticate, authorize('FACILITATOR', 'ADMIN'), createProgress);

// Bootcamp progress routes
router.get('/bootcamps/:bootcampId/progress', getBootcampProgress);

// Rubric routes
router.get('/rubrics', getAllRubrics);
router.get('/rubrics/:skill', getRubricBySkill);

export { router as progressRoutes };

