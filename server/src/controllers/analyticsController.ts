import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ... (getProjectAnalytics remains the same)

export const getProjectAnalytics = async (req: Request, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string;
  const period = (req.query.period as string) || '7d';

  try {
    const now = new Date();
    const startDate = new Date();
    if (period === '24h') startDate.setHours(now.getHours() - 24);
    else if (period === '30d') startDate.setDate(now.getDate() - 30);
    else startDate.setDate(now.getDate() - 7);

    const events = await prisma.evaluationEvent.findMany({
      where: {
        projectId,
        timestamp: {
          gte: startDate
        }
      },
      select: {
        flagKey: true,
        result: true,
        environment: true,
        timestamp: true
      }
    });

    const total = events.length;
    const activeFlags = new Set(events.map((e: any) => e.flagKey)).size;
    const successCount = events.filter((e: any) => e.result).length;
    const successRate = total ? ((successCount / total) * 100).toFixed(1) : '0';
    const avgLatency = 45; 

    const trendMap: Record<string, number> = {};
    events.forEach((e: any) => {
      let key;
      if (period === '24h') {
        key = new Date(e.timestamp).getHours() + ':00';
      } else {
        key = new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      trendMap[key] = (trendMap[key] || 0) + 1;
    });
    const trendData = Object.entries(trendMap).map(([label, value]) => ({ label, value }));

    const flagCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      flagCounts[e.flagKey] = (flagCounts[e.flagKey] || 0) + 1;
    });
    const topFlags = Object.entries(flagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percent: (count / total) * 100
      }));

    const envCounts: Record<string, number> = { Production: 0, Staging: 0, Development: 0 };
    events.forEach((e: any) => {
      const wEnv = e.environment as string; // Loose type for safety
      if (envCounts[wEnv] !== undefined) envCounts[wEnv]++;
    });
    const envDist = [
      { name: 'Production', count: envCounts.Production, color: '#a67c52', width: (envCounts.Production / (total || 1)) * 100 },
      { name: 'Staging', count: envCounts.Staging, color: '#d4bba3', width: (envCounts.Staging / (total || 1)) * 100 },
      { name: 'Development', count: envCounts.Development, color: '#e5e7eb', width: (envCounts.Development / (total || 1)) * 100 }
    ];

    res.json({
      metrics: { total, activeFlags, successRate, avgLatency },
      trendData,
      topFlags,
      envDist
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Log event securely from Dashboard (if needed) but mainly for internal testing
export const logEvent = async (req: Request, res: Response): Promise<void> => {
  // ... (Same as before, mainly for manual testing via Postman with Auth)
   try {
    const { projectId, flagKey, result, environment, userId } = req.body;
    await prisma.evaluationEvent.create({
      data: { projectId, flagKey, result: result ?? true, environment: environment || 'Production', userId, timestamp: new Date() }
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log' });
  }
};

// NEW: Log event from SDK (Public Endpoint using API Key)
export const logSdkEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      res.status(401).json({ error: 'Missing API Key' });
      return;
    }

    const { flagKey, result, environment, userId } = req.body;

    // Resolve Project
    const project = await prisma.project.findUnique({
      where: { apiKey },
      select: { id: true }
    });

    if (!project) {
      res.status(401).json({ error: 'Invalid API Key' });
      return;
    }

    await prisma.evaluationEvent.create({
      data: {
        projectId: project.id,
        flagKey,
        result: result ?? true,
        environment: environment || 'Production',
        userId: userId || 'anonymous',
        latency: (req.body.latency as number) || 0,
        timestamp: new Date()
      }
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('SDK Log Error:', error);
    res.status(500).json({ error: 'Failed to log event' });
  }
};
