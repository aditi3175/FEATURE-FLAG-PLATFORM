import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { invalidateFlag } from '../services/cache';

const router = Router();

/**
 * POST /api/flags - Create a new flag
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { projectId, key, description, status, rolloutPercentage, targetingRules } = req.body;

    // Validation
    if (!projectId || !key) {
      return res.status(400).json({ error: 'projectId and key are required' });
    }

    if (rolloutPercentage !== undefined && (rolloutPercentage < 0 || rolloutPercentage > 100)) {
      return res.status(400).json({ error: 'rolloutPercentage must be between 0 and 100' });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const flag = await prisma.flag.create({
      data: {
        projectId,
        key,
        description: description || '',
        status: status !== undefined ? status : true,
        rolloutPercentage: rolloutPercentage !== undefined ? rolloutPercentage : 0,
        targetingRules: targetingRules || {},
      },
    });

    res.status(201).json(flag);
  } catch (error: any) {
    console.error('Error creating flag:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Flag with this key already exists in the project' });
    }
    
    res.status(500).json({ error: 'Failed to create flag' });
  }
});

/**
 * GET /api/flags - List flags (optionally filtered by projectId)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    const where = projectId ? { projectId: projectId as string } : {};

    const flags = await prisma.flag.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: { name: true },
        },
      },
    });

    res.json(flags);
  } catch (error) {
    console.error('Error fetching flags:', error);
    res.status(500).json({ error: 'Failed to fetch flags' });
  }
});

/**
 * GET /api/flags/:id - Get flag details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const flag = await prisma.flag.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    res.json(flag);
  } catch (error) {
    console.error('Error fetching flag:', error);
    res.status(500).json({ error: 'Failed to fetch flag' });
  }
});

/**
 * PATCH /api/flags/:id - Update flag
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { key, description, status, rolloutPercentage, targetingRules } = req.body;

    // Validation
    if (rolloutPercentage !== undefined && (rolloutPercentage < 0 || rolloutPercentage > 100)) {
      return res.status(400).json({ error: 'rolloutPercentage must be between 0 and 100' });
    }

    // Build update data
    const updateData: any = {};
    if (key !== undefined) updateData.key = key;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (rolloutPercentage !== undefined) updateData.rolloutPercentage = rolloutPercentage;
    if (targetingRules !== undefined) updateData.targetingRules = targetingRules;

    const flag = await prisma.flag.update({
      where: { id },
      data: updateData,
    });

    // Invalidate cache after update
    await invalidateFlag(flag.projectId, flag.key);

    res.json(flag);
  } catch (error: any) {
    console.error('Error updating flag:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Flag not found' });
    }
    
    res.status(500).json({ error: 'Failed to update flag' });
  }
});

/**
 * DELETE /api/flags/:id - Delete flag
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const flag = await prisma.flag.findUnique({ where: { id } });
    
    if (flag) {
      await invalidateFlag(flag.projectId, flag.key);
    }

    await prisma.flag.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting flag:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Flag not found' });
    }
    
    res.status(500).json({ error: 'Failed to delete flag' });
  }
});

export default router;
