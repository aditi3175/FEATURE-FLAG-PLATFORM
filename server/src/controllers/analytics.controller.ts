import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Get all projects for the user
    const projects = await prisma.project.findMany({
      where: { userId },
      select: { id: true }
    });

    const projectIds = projects.map(p => p.id);

    // Get total evaluation count across all user's projects
    const totalEvaluations = await prisma.evaluationEvent.count({
      where: {
        projectId: { in: projectIds }
      }
    });

    // Get evaluations in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvaluations = await prisma.evaluationEvent.count({
      where: {
        projectId: { in: projectIds },
        timestamp: { gte: twentyFourHoursAgo }
      }
    });

    // Get evaluations by environment
    const evaluationsByEnv = await prisma.evaluationEvent.groupBy({
      by: ['environment'],
      where: {
        projectId: { in: projectIds }
      },
      _count: true
    });

    // Calculate average response time (latency)
    const avgLatencyResult = await prisma.evaluationEvent.aggregate({
      where: {
        projectId: { in: projectIds },
        latency: { gt: 0 } // Only consider events with recorded latency
      },
      _avg: {
        latency: true
      }
    });
    
    const avgResponseTime = avgLatencyResult._avg.latency ? Math.round(avgLatencyResult._avg.latency) : null;

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
