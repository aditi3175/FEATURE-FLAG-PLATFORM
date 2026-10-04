import prisma from '../config/database';

/**
 * Buffers evaluation events in memory and writes them to PostgreSQL in batches.
 *
 * Before: every flag evaluation did its own INSERT, so the database write
 * became the bottleneck of the evaluate endpoint.
 * Now: events are flushed with one createMany() every second, or as soon as
 * BATCH_SIZE events are waiting, whichever comes first.
 *
 * Trade-off (worth knowing for interviews): events still in memory are lost
 * if the process crashes, so at most ~1 second of analytics can disappear.
 * That's acceptable for analytics, not for something like payments. A durable
 * queue (Redis Streams, BullMQ, Kafka) would remove that risk at the cost of
 * more infrastructure.
 */

export interface EvaluationEventInput {
  projectId: string;
  flagKey: string;
  result: boolean;
  environment: string;
  userId: string;
  latency: number; // server processing time in microseconds (0 if unknown)
  timestamp: Date;
}

export const FLUSH_INTERVAL_MS = 1000;
export const BATCH_SIZE = 500;
// Hard cap so memory stays bounded if the database is down for a long time.
// When exceeded, the oldest events are dropped.
export const MAX_BUFFERED = 50_000;

let buffer: EvaluationEventInput[] = [];
let flushing: Promise<void> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const stats = { written: 0, batches: 0, dropped: 0, failedFlushes: 0 };

function ensureTimer(): void {
  if (timer) return;
  timer = setInterval(() => {
    void flushEvents();
  }, FLUSH_INTERVAL_MS);
  timer.unref?.(); // don't keep the process alive just for this timer
}

function enforceCap(): void {
  if (buffer.length > MAX_BUFFERED) {
    const overflow = buffer.length - MAX_BUFFERED;
    buffer.splice(0, overflow);
    stats.dropped += overflow;
  }
}

/**
 * Queue an event. Never blocks and never throws.
 */
export function recordEvent(event: EvaluationEventInput): void {
  ensureTimer();
  buffer.push(event);
  enforceCap();
  if (buffer.length >= BATCH_SIZE) void flushEvents();
}

/**
 * Write all buffered events. Only one flush runs at a time; calling this
 * while a flush is in progress returns that same flush.
 */
export function flushEvents(): Promise<void> {
  if (flushing) return flushing;
  if (buffer.length === 0) return Promise.resolve();

  flushing = (async () => {
    while (buffer.length > 0) {
      const batch = buffer.splice(0, BATCH_SIZE);
      try {
        await prisma.evaluationEvent.createMany({ data: batch });
        stats.written += batch.length;
        stats.batches++;
      } catch (error) {
        // Put the batch back at the front and retry on the next interval
        stats.failedFlushes++;
        console.error('Failed to flush evaluation events:', error);
        buffer.unshift(...batch);
        enforceCap();
        break;
      }
    }
  })().finally(() => {
    flushing = null;
  });

  return flushing;
}

/**
 * Flush everything that's left. Call on shutdown (SIGINT/SIGTERM).
 */
export async function shutdownEventBuffer(): Promise<void> {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  for (let attempt = 0; attempt < 3 && (buffer.length > 0 || flushing); attempt++) {
    await flushEvents();
  }
}

export function getEventBufferStats() {
  return { ...stats, pending: buffer.length };
}

/** Test helper: reset all state between tests. */
export function _resetEventBufferForTests(): void {
  if (timer) clearInterval(timer);
  timer = null;
  buffer = [];
  flushing = null;
  stats.written = 0;
  stats.batches = 0;
  stats.dropped = 0;
  stats.failedFlushes = 0;
}
