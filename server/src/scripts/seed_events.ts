/**
 * Inserts synthetic evaluation events into the benchmark project, to test
 * how the analytics endpoint behaves with a large amount of data.
 * Run seed_benchmark first.
 *
 *   npm run build
 *   node dist/scripts/seed_events.js            (default: 1,000,000 events)
 *   node dist/scripts/seed_events.js 200000     (custom count)
 *
 * Note: this is synthetic load-test data, not real usage.
 */
import 'dotenv/config';
import prisma from '../config/database';

const API_KEY = 'ff_bench_local_key';
const TOTAL = Number(process.argv[2]) || 1_000_000;
const BATCH = 5_000;
const DAYS = 7;
const ENVIRONMENTS = ['Production', 'Production', 'Production', 'Staging', 'Development'];

async function main() {
  const project = await prisma.project.findUnique({ where: { apiKey: API_KEY } });
  if (!project) {
    console.error('Benchmark project not found. Run seed_benchmark first.');
    process.exit(1);
  }

  const now = Date.now();
  const started = Date.now();

  for (let done = 0; done < TOTAL; done += BATCH) {
    const size = Math.min(BATCH, TOTAL - done);
    const data = Array.from({ length: size }, () => ({
      projectId: project.id,
      flagKey: `bench-flag-${1 + Math.floor(Math.random() * 50)}`,
      result: Math.random() < 0.3,
      environment: ENVIRONMENTS[Math.floor(Math.random() * ENVIRONMENTS.length)],
      userId: `user-${Math.floor(Math.random() * 100_000)}`,
      latency: 200 + Math.floor(Math.random() * 1800), // microseconds
      timestamp: new Date(now - Math.random() * DAYS * 24 * 60 * 60 * 1000),
    }));
    await prisma.evaluationEvent.createMany({ data });
    process.stdout.write(`\rInserted ${done + size} / ${TOTAL}`);
  }

  console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
