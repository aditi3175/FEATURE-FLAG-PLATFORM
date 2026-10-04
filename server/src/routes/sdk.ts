import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { getFlag, getProjectByApiKey, getSdkFlags, isValidEnvironment } from '../services/cache';
import { evaluateFlag } from '../services/evaluator';
import { logSdkEvent } from '../controllers/analyticsController';

const router = Router();

/**
 * GET /api/v1/sdk/flags - Get all flags for SDK (header-based auth)
 *
 * Headers:
 *   - x-api-key: string (required)
 * Query:
 *   - environment: Development | Staging | Production (default: Production)
 *
 * Called by the SDKs on startup and on every polling interval.
 * Response header X-Cache: HIT | MISS shows whether Redis served it.
 */
router.get('/flags', async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({ error: 'API key is required in x-api-key header' });
      return;
    }

    const environment = (req.query.environment as string) || 'Production';
    if (!isValidEnvironment(environment)) {
      res.status(400).json({ error: 'Invalid environment' });
      return;
    }

    const project = await getProjectByApiKey(apiKey);
    if (!project) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    const { flags, hit } = await getSdkFlags(project.id, environment);

    res.setHeader('X-Cache', hit ? 'HIT' : 'MISS');
    // Return flags array directly (SDK expects array, not object)
    res.json(flags);
  } catch (error) {
    console.error('Error fetching flags for SDK:', error);
    res.status(500).json({ error: 'Failed to fetch flags' });
  }
});

/**
 * Shared server-side evaluation logic, used by:
 *   POST /api/v1/sdk/evaluate  (API key in x-api-key header)
 *   POST /api/evaluate         (legacy, API key in the body)
 */
export async function handleEvaluation(
  res: Response,
  apiKey: string | undefined,
  body: { flagKey?: string; userId?: string; environment?: string }
): Promise<void> {
  try {
    const { flagKey, userId } = body;
    const environment = body.environment || 'Production';

    if (!apiKey) {
      res.status(401).json({ enabled: false, reason: 'API key is required' });
      return;
    }

    if (!flagKey || !userId) {
      res.status(400).json({ enabled: false, reason: 'flagKey and userId are required' });
      return;
    }

    if (!isValidEnvironment(environment)) {
      res.status(400).json({ enabled: false, reason: 'Invalid environment' });
      return;
    }

    const project = await getProjectByApiKey(apiKey);
    if (!project) {
      res.status(401).json({ enabled: false, reason: 'Invalid API key' });
      return;
    }

    const flag = await getFlag(project.id, flagKey, environment);
    if (!flag) {
      res.status(404).json({ enabled: false, reason: 'FLAG_NOT_FOUND' });
      return;
    }

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
        offVariantId: flag.offVariantId,
      },
      userId
    );
    const latency = Date.now() - startTime;

    // Log evaluation event asynchronously (don't block the response)
    prisma.evaluationEvent.create({
      data: {
        projectId: project.id,
        flagKey: flag.key,
        result: result.enabled,
        environment,
        userId,
        latency,
        timestamp: new Date(),
      },
    }).catch(err => console.error('Failed to log evaluation event:', err));

    res.json(result);
  } catch (error) {
    console.error('Error evaluating flag:', error);
    res.status(500).json({ enabled: false, reason: 'EVALUATION_ERROR' });
  }
}

/**
 * POST /api/v1/sdk/evaluate - Evaluate a single flag
 *
 * Headers: x-api-key (required)
 * Body: flagKey, userId (required), environment (optional)
 */
router.post('/evaluate', async (req: Request, res: Response): Promise<void> => {
  await handleEvaluation(res, req.headers['x-api-key'] as string | undefined, req.body ?? {});
});

router.post('/events', logSdkEvent);

export default router;
