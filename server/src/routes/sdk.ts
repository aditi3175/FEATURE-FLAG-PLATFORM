import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { getFlag } from '../services/cache';
import { evaluateFlag } from '../services/evaluator';
import { logSdkEvent } from '../controllers/analyticsController';

const router = Router();

/**
 * GET /api/v1/sdk/flags - Get all flags for SDK (header-based auth)
 * 
 * Headers:
 *   - x-api-key: string (required)
 * 
 * This endpoint is called by the SDK to fetch all flags for a project
 */
router.get('/flags', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({ error: 'API key is required in x-api-key header' });
      return;
    }

    const environment = (req.query.environment as string) || 'Production';

    // Find project by API key
    const project = await prisma.project.findUnique({
      where: { apiKey },
      include: {
        flags: {
          where: {
            environment: environment,
          } as any, // Cast to any to bypass stale Prisma types
          select: {
            id: true,
            key: true,
            description: true,
            status: true,
            rolloutPercentage: true,
            targetingRules: true,
            environment: true,
          } as any,
        },
      },
    });

    if (!project) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    // Return flags for the project
    res.json({
      projectId: project.id,
      projectName: project.name,
      flags: project.flags,
    });
  } catch (error) {
    console.error('Error fetching flags for SDK:', error);
    res.status(500).json({ error: 'Failed to fetch flags' });
  }
});

/**
 * POST /api/v1/sdk/evaluate - Evaluate a single flag (backward compatibility)
 * 
 * Headers:
 *   - x-api-key: string (required)
 * 
 * Body:
 *   - flagKey: string (required)
 *   - userId: string (required)
 *   - context: object (optional)
 */
router.post('/evaluate', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const { flagKey, userId, context } = req.body;

    // Validation
    if (!apiKey) {
      res.status(401).json({ 
        enabled: false, 
        reason: 'API key is required in x-api-key header' 
      });
      return;
    }

    if (!flagKey || !userId) {
      res.status(400).json({
        enabled: false,
        reason: 'flagKey and userId are required',
      });
      return;
    }

    // Find project by API key
    const project = await prisma.project.findUnique({
      where: { apiKey },
    });

    if (!project) {
      res.status(401).json({ 
        enabled: false, 
        reason: 'Invalid API key' 
      });
      return;
    }

    // Get flag (from cache or database)
    const flag = await getFlag(project.id, flagKey);

    if (!flag) {
      res.status(404).json({
        enabled: false,
        reason: 'FLAG_NOT_FOUND',
      });
      return;
    }

    // Evaluate flag
    const result = evaluateFlag(
      {
        key: flag.key,
        status: flag.status,
        rolloutPercentage: flag.rolloutPercentage,
        targetingRules: flag.targetingRules as any,
      },
      userId
    );

    res.json(result);
  } catch (error) {
    console.error('Error evaluating flag:', error);
    res.status(500).json({
      enabled: false,
      reason: 'EVALUATION_ERROR',
    });
  }
});

router.post('/events', logSdkEvent);

export default router;
