import { Request, Response } from 'express';
import prisma from '../config/database';
import { invalidateFlag } from '../services/cache';
import { logAudit, computeChanges } from '../services/auditService';

/**
 * Get all flags for a specific project
 * GET /api/projects/:projectId/flags
 */
export async function getFlagsByProject(req: Request, res: Response): Promise<void> {
  try {
    const projectId = req.params.projectId as string;

    // Verify user owns the project
    if (req.user) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      if (project.userId !== req.user.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    const environment = req.query.env as string | undefined;

    // Build filter
    const where: any = { projectId };
    if (environment) {
      where.environment = environment;
    }

    const flags = await prisma.flag.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(flags);
  } catch (error) {
    console.error('Error fetching flags:', error);
    res.status(500).json({ error: 'Failed to fetch flags' });
  }
}

/**
 * Create a new flag for a specific project
 * POST /api/projects/:projectId/flags
 */
  /**
 * Create a new flag for a specific project
 * POST /api/projects/:projectId/flags
 */
export async function createFlag(req: Request, res: Response): Promise<void> {
  try {
    const projectId = req.params.projectId as string;
    const { key, description, status, rolloutPercentage, targetingRules, environment, type, variants, defaultVariantId, offVariantId } = req.body;

    // Validation
    if (!key) {
      res.status(400).json({ error: 'Flag key is required' });
      return;
    }

    // Validate key format (slug)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(key)) {
      res.status(400).json({ 
        error: 'Flag key must be a valid slug (lowercase, hyphens, no spaces)' 
      });
      return;
    }

    if (rolloutPercentage !== undefined && (rolloutPercentage < 0 || rolloutPercentage > 100)) {
      res.status(400).json({ error: 'rolloutPercentage must be between 0 and 100' });
      return;
    }

    const validEnvs = ['Development', 'Staging', 'Production'];
    const env = environment || 'Production';
    if (!validEnvs.includes(env)) {
      res.status(400).json({ error: 'Invalid environment' });
      return;
    }

    // Verify user owns the project
    if (req.user) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      if (project.userId !== req.user.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    const flag = await prisma.flag.create({
      data: {
        projectId,
        key,
        description: description || '',
        status: status !== undefined ? status : true,
        rolloutPercentage: rolloutPercentage !== undefined ? rolloutPercentage : 0,
        environment: env,
        targetingRules: targetingRules || {},
        type: type || 'BOOLEAN',
        variants: variants || [],
        defaultVariantId: defaultVariantId,
        offVariantId: offVariantId
      } as any, 
    });

    // Audit log — fire and forget
    if (req.user) {
      logAudit({
        projectId,
        userId: req.user.userId,
        action: 'flag.created',
        entityId: flag.id,
        entityName: flag.key,
        changes: { after: flag },
      });
    }

    res.status(201).json(flag);
  } catch (error: any) {
    console.error('Error creating flag:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Flag with this key already exists in the project' });
      return;
    }

    res.status(500).json({ error: 'Failed to create flag' });
  }
}

/**
 * Update a flag
 * PATCH /api/flags/:flagId
 */
export async function updateFlag(req: Request, res: Response): Promise<void> {
  try {
    const flagId = req.params.flagId as string;
    const { key, description, status, rolloutPercentage, targetingRules, environment, type, variants, defaultVariantId, offVariantId } = req.body;

    // Validation
    if (rolloutPercentage !== undefined && (rolloutPercentage < 0 || rolloutPercentage > 100)) {
      res.status(400).json({ error: 'rolloutPercentage must be between 0 and 100' });
      return;
    }

    // Validate key format if provided
    if (key !== undefined) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(key)) {
        res.status(400).json({ 
          error: 'Flag key must be a valid slug (lowercase, hyphens, no spaces)' 
        });
        return;
      }
    }

    // Get flag to verify ownership
    const existingFlag = await prisma.flag.findUnique({
      where: { id: flagId },
      include: { project: true },
    });

    if (!existingFlag) {
      res.status(404).json({ error: 'Flag not found' });
      return;
    }

    // Verify user owns the project
    if (req.user && existingFlag.project.userId !== req.user.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (key !== undefined) updateData.key = key;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (rolloutPercentage !== undefined) updateData.rolloutPercentage = rolloutPercentage;
    if (targetingRules !== undefined) updateData.targetingRules = targetingRules;
    if (environment !== undefined) updateData.environment = environment;
    if (type !== undefined) updateData.type = type;
    if (variants !== undefined) updateData.variants = variants;
    if (defaultVariantId !== undefined) updateData.defaultVariantId = defaultVariantId;
    if (offVariantId !== undefined) updateData.offVariantId = offVariantId;

    const flag = await prisma.flag.update({
      where: { id: flagId },
      data: updateData,
    });

    // Invalidate cache after update
    await invalidateFlag(flag.projectId, flag.key);

    // Audit log — fire and forget
    if (req.user) {
      const isToggle = Object.keys(updateData).length === 1 && updateData.status !== undefined;
      logAudit({
        projectId: flag.projectId,
        userId: req.user.userId,
        action: isToggle ? 'flag.toggled' : 'flag.updated',
        entityId: flag.id,
        entityName: flag.key,
        changes: computeChanges(existingFlag as any, flag as any),
      });
    }

    res.json(flag);
  } catch (error: any) {
    console.error('Error updating flag:', error);

    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Flag not found' });
      return;
    }

    res.status(500).json({ error: 'Failed to update flag' });
  }
}

/**
 * Delete a flag
 * DELETE /api/flags/:flagId
 */
export async function deleteFlag(req: Request, res: Response): Promise<void> {
  try {
    const flagId = req.params.flagId as string;

    // Get flag to verify ownership
    const flag = await prisma.flag.findUnique({
      where: { id: flagId },
      include: { project: true },
    });

    if (!flag) {
      res.status(404).json({ error: 'Flag not found' });
      return;
    }

    // Verify user owns the project
    if (req.user && flag.project.userId !== req.user.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await invalidateFlag(flag.projectId, flag.key);

    await prisma.flag.delete({
      where: { id: flagId },
    });

    // Audit log — fire and forget
    if (req.user) {
      logAudit({
        projectId: flag.projectId,
        userId: req.user.userId,
        action: 'flag.deleted',
        entityId: flag.id,
        entityName: flag.key,
        changes: { before: flag },
      });
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting flag:', error);

    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Flag not found' });
      return;
    }

    res.status(500).json({ error: 'Failed to delete flag' });
  }
}

/**
 * Get a single flag by ID
 * GET /api/flags/:flagId
 */
export async function getFlagById(req: Request, res: Response): Promise<void> {
  try {
    const flagId = req.params.flagId as string;

    const flag = await prisma.flag.findUnique({
      where: { id: flagId },
      include: { project: true },
    });

    if (!flag) {
      res.status(404).json({ error: 'Flag not found' });
      return;
    }

    // Verify user owns the project
    if (req.user && flag.project.userId !== req.user.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(flag);
  } catch (error) {
    console.error('Error fetching flag:', error);
    res.status(500).json({ error: 'Failed to fetch flag' });
  }
}

/**
 * Promote a flag to a different environment
 * POST /api/flags/:flagId/promote
 */
export async function promoteFlag(req: Request, res: Response): Promise<void> {
  try {
    const flagId = req.params.flagId as string;
    const { targetEnvironment } = req.body;

    const validEnvs = ['Development', 'Staging', 'Production'];
    if (!targetEnvironment || !validEnvs.includes(targetEnvironment)) {
      res.status(400).json({ error: 'Invalid target environment. Must be Development, Staging, or Production.' });
      return;
    }

    // Get the source flag
    const sourceFlag = await prisma.flag.findUnique({
      where: { id: flagId },
      include: { project: true },
    });

    if (!sourceFlag) {
      res.status(404).json({ error: 'Flag not found' });
      return;
    }

    // Verify ownership
    if (req.user && sourceFlag.project.userId !== req.user.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    if (sourceFlag.environment === targetEnvironment) {
      res.status(400).json({ error: 'Flag is already in this environment' });
      return;
    }

    // Check if this flag key already exists in the target env
    const existingFlag = await prisma.flag.findUnique({
      where: {
        projectId_key_environment: {
          projectId: sourceFlag.projectId,
          key: sourceFlag.key,
          environment: targetEnvironment,
        },
      },
    });

    let promotedFlag;
    if (existingFlag) {
      // Update existing flag in target env
      promotedFlag = await prisma.flag.update({
        where: { id: existingFlag.id },
        data: {
          description: sourceFlag.description,
          type: sourceFlag.type,
          status: sourceFlag.status,
          rolloutPercentage: sourceFlag.rolloutPercentage,
          targetingRules: sourceFlag.targetingRules as any,
          variants: sourceFlag.variants as any,
          defaultVariantId: sourceFlag.defaultVariantId,
          offVariantId: sourceFlag.offVariantId,
        },
      });
    } else {
      // Create new flag in target env
      promotedFlag = await prisma.flag.create({
        data: {
          projectId: sourceFlag.projectId,
          key: sourceFlag.key,
          description: sourceFlag.description,
          type: sourceFlag.type,
          status: sourceFlag.status,
          rolloutPercentage: sourceFlag.rolloutPercentage,
          environment: targetEnvironment,
          targetingRules: sourceFlag.targetingRules as any,
          variants: sourceFlag.variants as any,
          defaultVariantId: sourceFlag.defaultVariantId,
          offVariantId: sourceFlag.offVariantId,
        },
      });
    }

    // Audit log
    logAudit({
      projectId: sourceFlag.projectId,
      userId: req.user?.userId || '',
      action: 'flag.promoted',
      entityType: 'flag',
      entityId: promotedFlag.id,
      entityName: promotedFlag.key,
      changes: {
        from: sourceFlag.environment,
        to: targetEnvironment,
        existed: !!existingFlag,
      },
    });

    res.json({
      message: `Flag "${sourceFlag.key}" promoted from ${sourceFlag.environment} → ${targetEnvironment}`,
      flag: promotedFlag,
    });
  } catch (error) {
    console.error('Error promoting flag:', error);
    res.status(500).json({ error: 'Failed to promote flag' });
  }
}

