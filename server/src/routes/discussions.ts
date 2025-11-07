import { Router } from 'express';
import {
  getBootcampDiscussions,
  createDiscussion,
  getDiscussion,
  updateDiscussion,
  deleteDiscussion,
} from '../controllers/discussionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Bootcamp-specific routes
router.get('/bootcamps/:bootcampId/discussions', authenticate, getBootcampDiscussions);
router.post('/bootcamps/:bootcampId/discussions', authenticate, authorize('FACILITATOR', 'ADMIN'), createDiscussion);

// Discussion routes
router.get('/discussions/:id', authenticate, getDiscussion);
router.put('/discussions/:id', authenticate, authorize('FACILITATOR', 'ADMIN'), updateDiscussion);
router.delete('/discussions/:id', authenticate, authorize('FACILITATOR', 'ADMIN'), deleteDiscussion);

export { router as discussionRoutes };

