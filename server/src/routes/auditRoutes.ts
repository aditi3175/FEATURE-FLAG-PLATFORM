import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * GET /api/projects/:projectId/audit-logs
 * Returns paginated audit logs for a project, newest first.
 */
router.get('/projects/:projectId/audit-logs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const action = req.query.action as string | undefined;

    // Verify user owns the project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (req.user && project.userId !== req.user.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Build where clause
    const where: any = { projectId };
    if (action) {
      where.action = action;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
