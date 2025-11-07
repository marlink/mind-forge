import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Get current user profile (authenticated)
router.get('/me', authenticate, getCurrentUser);

// Update current user profile (authenticated)
router.patch('/me', authenticate, updateCurrentUser);

// Get all users (admin only)
router.get('/', authenticate, authorize('ADMIN'), getAllUsers);

export { router as userRoutes };

