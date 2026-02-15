import express from 'express';
import { getAnalytics } from '../controllers/analytics.controller';
import { authMiddleware as authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Get analytics stats
router.get('/stats', authenticate, getAnalytics);

export default router;
