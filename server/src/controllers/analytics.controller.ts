import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Get all projects for the user
    const projects = await prisma.project.findMany({
      where: { userId },
      select: { id: true }
    });

    const projectIds = projects.map(p => p.id);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Independent queries run in parallel
    const [totalEvaluations, recentEvaluations, evaluationsByEnv, avgLatencyResult] = await Promise.all([
      prisma.evaluationEvent.count({
        where: { projectId: { in: projectIds } }
      }),
      prisma.evaluationEvent.count({
        where: { projectId: { in: projectIds }, timestamp: { gte: twentyFourHoursAgo } }
      }),
      prisma.evaluationEvent.groupBy({
        by: ['environment'],
        where: { projectId: { in: projectIds } },
        _count: true
      }),
      prisma.evaluationEvent.aggregate({
        where: { projectId: { in: projectIds }, latency: { gt: 0 } }, // only events with a measured latency
        _avg: { latency: true }
      }),
    ]);

    // latency is stored in microseconds; return milliseconds
    const avgUs = avgLatencyResult._avg.latency;
    const avgResponseTime = avgUs ? Number((avgUs / 1000).toFixed(2)) : null;

    res.json({
      totalEvaluations,
      recentEvaluations,
      evaluationsByEnvironment: evaluationsByEnv.reduce((acc, item) => {
        acc[item.environment] = item._count;
        return acc;
      }, {} as Record<string, number>),
      avgResponseTime
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
