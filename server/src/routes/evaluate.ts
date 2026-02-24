import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { getFlag } from '../services/cache';
import { evaluateFlag } from '../services/evaluator';

const router = Router();

/**
 * POST /api/evaluate - Evaluate a flag for a user (SDK endpoint)
 * 
 * Body:
 *   - apiKey: string (required)
 *   - flagKey: string (required)
 *   - userId: string (required)
 *   - context: object (optional, for future use)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { apiKey, flagKey, userId, context } = req.body;

    // Validation
    if (!apiKey || !flagKey || !userId) {
      return res.status(400).json({
        error: 'apiKey, flagKey, and userId are required',
      });
    }

    // Find project by API key
    const project = await prisma.project.findUnique({
      where: { apiKey },
    });

    if (!project) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Get flag (from cache or database)
    const flag = await getFlag(project.id, flagKey);

    if (!flag) {
      return res.status(404).json({
        enabled: false,
        reason: 'FLAG_NOT_FOUND',
      });
    }

    // Evaluate flag
    const startTime = Date.now();
    const result = evaluateFlag(
      {
        key: flag.key,
        type: flag.type,
        status: flag.status,
        rolloutPercentage: flag.rolloutPercentage,
        targetingRules: flag.targetingRules as any,
        variants: flag.variants as any,
        defaultVariantId: flag.defaultVariantId,
        offVariantId: flag.offVariantId
      },
      userId
    );
    const latency = Date.now() - startTime;

    // Log evaluation event asynchronously (don't block response)
    prisma.evaluationEvent.create({
      data: {
        projectId: project.id,
        flagKey: flag.key,
        result: result.enabled,
        environment: 'Production', // Default for legacy endpoint
        userId: userId,
        latency: latency,
        timestamp: new Date()
      }
    }).catch(err => console.error('Failed to log evaluation event:', err));

    res.json(result);
  } catch (error) {
    console.error('Error evaluating flag:', error);
    res.status(500).json({
      enabled: false,
      reason: 'EVALUATION_ERROR',
    });
  }
});

export default router;
