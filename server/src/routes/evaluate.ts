import { Router, Request, Response } from 'express';
import { handleEvaluation } from './sdk';

const router = Router();

/**
 * POST /api/evaluate - Legacy evaluation endpoint (kept for backward compatibility)
 *
 * Body:
 *   - apiKey: string (required)
 *   - flagKey: string (required)
 *   - userId: string (required)
 *   - environment: string (optional, default Production)
 *
 * Same logic as POST /api/v1/sdk/evaluate, but the API key is sent in the body.
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const body = req.body ?? {};
  await handleEvaluation(res, body.apiKey, body);
});

export default router;
