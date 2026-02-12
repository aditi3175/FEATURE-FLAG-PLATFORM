import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as projectController from '../controllers/projectController';
import { getProjectAnalytics } from '../controllers/analyticsController';
import * as flagController from '../controllers/flagController';

const router = Router();

// Project routes
router.post('/projects', authMiddleware, projectController.createProject);
router.get('/projects', authMiddleware, projectController.getProjects);
router.get('/projects/:projectId', authMiddleware, projectController.getProjectById);
router.patch('/projects/:projectId', authMiddleware, projectController.updateProject);
router.get('/projects/:projectId/analytics', authMiddleware, getProjectAnalytics);
router.delete('/projects', authMiddleware, projectController.deleteAllProjects);
router.delete('/projects/:projectId', authMiddleware, projectController.deleteProject);

// Project-scoped flag routes
router.get('/projects/:projectId/flags', authMiddleware, flagController.getFlagsByProject);
router.post('/projects/:projectId/flags', authMiddleware, flagController.createFlag);

// Flag routes
router.get('/flags/:flagId', authMiddleware, flagController.getFlagById);
router.patch('/flags/:flagId', authMiddleware, flagController.updateFlag);
router.delete('/flags/:flagId', authMiddleware, flagController.deleteFlag);

export default router;
