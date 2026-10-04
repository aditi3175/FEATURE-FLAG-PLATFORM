import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Replace the real Prisma client with a mock, so no database is needed
const { createMany } = vi.hoisted(() => ({ createMany: vi.fn() }));
vi.mock('../src/config/database', () => ({
  default: { evaluationEvent: { createMany } },
}));

import {
  recordEvent,
  flushEvents,
  getEventBufferStats,
  _resetEventBufferForTests,
  BATCH_SIZE,
  FLUSH_INTERVAL_MS,
  MAX_BUFFERED,
} from '../src/services/eventBuffer';

const makeEvent = (i: number) => ({
  projectId: 'p1',
  flagKey: 'flag',
  result: true,
  environment: 'Production',
  userId: `user-${i}`,
  latency: 500,
  timestamp: new Date(),
});

beforeEach(() => {
  _resetEventBufferForTests();
  createMany.mockReset();
  createMany.mockResolvedValue({ count: 0 });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  _resetEventBufferForTests();
});

describe('eventBuffer', () => {
  it('writes events in batches instead of one INSERT per event', async () => {
    for (let i = 0; i < 1200; i++) recordEvent(makeEvent(i));
    await flushEvents();

    const batchSizes = createMany.mock.calls.map(call => call[0].data.length);
    expect(batchSizes).toEqual([BATCH_SIZE, BATCH_SIZE, 200]);
    expect(getEventBufferStats()).toMatchObject({ written: 1200, batches: 3, pending: 0 });
  });

  it('flushes a partial batch when the interval timer fires', async () => {
    vi.useFakeTimers();
    for (let i = 0; i < 10; i++) recordEvent(makeEvent(i));
    expect(createMany).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(FLUSH_INTERVAL_MS);

    expect(createMany).toHaveBeenCalledTimes(1);
    expect(createMany.mock.calls[0][0].data).toHaveLength(10);
  });

  it('keeps events and retries after a failed write', async () => {
    createMany.mockRejectedValueOnce(new Error('database down'));
    for (let i = 0; i < 3; i++) recordEvent(makeEvent(i));

    await flushEvents();
    expect(getEventBufferStats()).toMatchObject({ written: 0, failedFlushes: 1, pending: 3 });

    await flushEvents();
    expect(getEventBufferStats()).toMatchObject({ written: 3, pending: 0 });
  });

  it('caps memory by dropping the oldest events when the database is stuck', async () => {
    createMany.mockImplementation(() => new Promise(() => {})); // never finishes
    const total = MAX_BUFFERED + 600;
    for (let i = 0; i < total; i++) recordEvent(makeEvent(i));

    // The first batch is "in flight"; everything else waits, up to the cap
    const stats = getEventBufferStats();
    expect(stats.pending).toBe(MAX_BUFFERED);
    expect(stats.dropped).toBe(total - BATCH_SIZE - MAX_BUFFERED);
  });
});
