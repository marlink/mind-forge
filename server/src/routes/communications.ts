import { Router } from 'express';
import {
  createCommunication,
  getCommunications,
  getCommunication,
  updateCommunication,
  deleteCommunication,
  markAsRead,
  getUnreadCount,
} from '../controllers/communicationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Communication routes
router.post('/', createCommunication);
router.get('/', getCommunications);
router.get('/unread', getUnreadCount);
router.get('/:id', getCommunication);
router.put('/:id', updateCommunication);
router.delete('/:id', deleteCommunication);
router.post('/:id/read', markAsRead);

export { router as communicationRoutes };

