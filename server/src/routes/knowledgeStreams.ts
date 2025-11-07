import { Router } from 'express';
import {
  getAllKnowledgeStreams,
  getKnowledgeStream,
  assignStreamToStudent,
  getStudentKnowledgeStreams,
} from '../controllers/knowledgeStreamController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Knowledge stream routes
router.get('/knowledge-streams', getAllKnowledgeStreams);
router.get('/knowledge-streams/:id', getKnowledgeStream);

// Student knowledge stream routes
router.post('/students/:studentId/knowledge-streams', authenticate, authorize('FACILITATOR', 'ADMIN'), assignStreamToStudent);
router.get('/students/:studentId/knowledge-streams', getStudentKnowledgeStreams);

export { router as knowledgeStreamRoutes };

