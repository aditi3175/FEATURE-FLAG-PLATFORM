import { Request, Response } from 'express';
import prisma from '../config/database';
import { getProjectByApiKey, isValidEnvironment } from '../services/cache';
import { recordEvent } from '../services/eventBuffer';

const MAX_EVENTS_PER_REQUEST = 1000;
const MAX_STRING_LENGTH = 200;
const MAX_EVENT_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Project analytics for the dashboard.
 * GET /api/projects/:projectId/analytics?period=24h|7d|30d
 *
 * All aggregation happens in PostgreSQL (COUNT, GROUP BY, AVG, date_trunc)
 * instead of loading every event into Node and counting in JavaScript, so
 * memory use stays flat no matter how many events a project has.
 */
export const getProjectAnalytics = async (req: Request, res: Response): Promise<void> => {
  const projectId = req.params.projectId as string;
  const period = (req.query.period as string) || '7d';

  try {
    // Ownership check: users can only see analytics for their own projects
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.userId !== req.user?.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const now = new Date();
    const startDate = new Date();
    if (period === '24h') startDate.setHours(now.getHours() - 24);
    else if (period === '30d') startDate.setDate(now.getDate() - 30);
    else startDate.setDate(now.getDate() - 7);

    const where = { projectId, timestamp: { gte: startDate } };
    const bucketUnit = period === '24h' ? 'hour' : 'day';

    // Independent queries run in parallel
    const [total, successCount, topFlagRows, envRows, latencyAgg, activeFlagRows, trendRows] = await Promise.all([
      prisma.evaluationEvent.count({ where }),
      prisma.evaluationEvent.count({ where: { ...where, result: true } }),
      prisma.evaluationEvent.groupBy({
        by: ['flagKey'],
        where,
        _count: { _all: true },
        orderBy: { _count: { flagKey: 'desc' } },
        take: 5,
      }),
      prisma.evaluationEvent.groupBy({
        by: ['environment'],
        where,
        _count: { _all: true },
      }),
      prisma.evaluationEvent.aggregate({
        where: { ...where, latency: { gt: 0 } }, // only events with a measured latency
        _avg: { latency: true },
      }),
      prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(DISTINCT flag_key)::int AS count
        FROM evaluation_events
        WHERE project_id = ${projectId} AND "timestamp" >= ${startDate}`,
      prisma.$queryRaw<{ bucket: Date; value: number }[]>`
        SELECT date_trunc(${bucketUnit}, "timestamp") AS bucket, COUNT(*)::int AS value
        FROM evaluation_events
        WHERE project_id = ${projectId} AND "timestamp" >= ${startDate}
        GROUP BY bucket
        ORDER BY bucket`,
    ]);

    const activeFlags = activeFlagRows[0]?.count ?? 0;
    const successRate = total ? ((successCount / total) * 100).toFixed(1) : '0';

    // Stored in microseconds; returned in milliseconds for the dashboard
    const avgLatencyUs = latencyAgg._avg.latency;
    const avgLatency = avgLatencyUs ? Number((avgLatencyUs / 1000).toFixed(2)) : 0;

    const trendData = trendRows.map(row => {
      const bucket = new Date(row.bucket);
      const label = period === '24h'
        ? `${bucket.getHours()}:00`
        : bucket.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { label, value: row.value };
    });

    const topFlags = topFlagRows.map(row => ({
      name: row.flagKey,
      count: row._count._all,
      percent: total ? (row._count._all / total) * 100 : 0,
    }));

    const envCounts: Record<string, number> = { Production: 0, Staging: 0, Development: 0 };
    for (const row of envRows) {
      if (envCounts[row.environment] !== undefined) envCounts[row.environment] = row._count._all;
    }
    const envDist = [
      { name: 'Production', count: envCounts.Production, color: '#a67c52', width: (envCounts.Production / (total || 1)) * 100 },
      { name: 'Staging', count: envCounts.Staging, color: '#d4bba3', width: (envCounts.Staging / (total || 1)) * 100 },
      { name: 'Development', count: envCounts.Development, color: '#e5e7eb', width: (envCounts.Development / (total || 1)) * 100 },
    ];

    res.json({
      metrics: { total, activeFlags, successRate, avgLatency },
      trendData,
      topFlags,
      envDist,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

/**
 * Log an event manually from the dashboard / Postman (authenticated).
 */
export const logEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, flagKey, result, environment, userId } = req.body ?? {};

    if (typeof projectId !== 'string' || typeof flagKey !== 'string' || !flagKey) {
      res.status(400).json({ error: 'projectId and flagKey are required' });
      return;
    }

    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { userId: true } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (project.userId !== req.user?.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    recordEvent({
      projectId,
      flagKey,
      result: typeof result === 'boolean' ? result : true,
      environment: isValidEnvironment(environment) ? environment : 'Production',
      userId: typeof userId === 'string' && userId ? userId : 'anonymous',
      latency: 0,
      timestamp: new Date(),
    });

    res.status(202).json({ success: true });
  } catch (error) {
    console.error('Log event error:', error);
    res.status(500).json({ error: 'Failed to log' });
  }
};

/**
 * Accept the timestamp the SDK recorded (events are batched, so they can
 * arrive a few seconds late), but only if it's sane.
 */
function parseEventTime(value: unknown): Date {
  if (typeof value === 'string' || typeof value === 'number') {
    const t = new Date(value);
    const age = Date.now() - t.getTime();
    if (!Number.isNaN(t.getTime()) && age >= -60_000 && age <= MAX_EVENT_AGE_MS) return t;
  }
  return new Date();
}

/**
 * Log events from the SDKs (public endpoint, API key auth).
 * POST /api/v1/sdk/events
 *
 * Accepts a batch:   { "events": [ { flagKey, result, userId, environment, timestamp }, ... ] }
 * or a single event: { flagKey, result, userId, environment }   (older SDK versions)
 *
 * Events are queued in the event buffer and written in batches, so this
 * responds 202 Accepted without waiting for the database.
 */
export const logSdkEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      res.status(401).json({ error: 'Missing API Key' });
      return;
    }

    const body = req.body ?? {};
    const incoming: any[] = Array.isArray(body.events) ? body.events : [body];

    if (incoming.length === 0 || incoming.length > MAX_EVENTS_PER_REQUEST) {
      res.status(400).json({ error: `Send between 1 and ${MAX_EVENTS_PER_REQUEST} events per request` });
      return;
    }

    const project = await getProjectByApiKey(apiKey); // cached
    if (!project) {
      res.status(401).json({ error: 'Invalid API Key' });
      return;
    }

    let accepted = 0;
    for (const e of incoming) {
      if (!e || typeof e.flagKey !== 'string' || !e.flagKey || e.flagKey.length > MAX_STRING_LENGTH) continue;

      const userId = typeof e.userId === 'string' && e.userId ? e.userId.slice(0, MAX_STRING_LENGTH) : 'anonymous';

      recordEvent({
        projectId: project.id,
        flagKey: e.flagKey,
        result: typeof e.result === 'boolean' ? e.result : true,
        environment: isValidEnvironment(e.environment) ? e.environment : 'Production',
        userId,
        latency: 0, // client-reported latency isn't trusted
        timestamp: parseEventTime(e.timestamp),
      });
      accepted++;
    }

    res.status(202).json({ accepted, rejected: incoming.length - accepted });
  } catch (error) {
    console.error('SDK Log Error:', error);
    res.status(500).json({ error: 'Failed to log events' });
  }
};
