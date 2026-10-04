/**
 * Seeds a benchmark project with a fixed API key and 50 Production flags
 * (every 5th one is a 3-variant A/B/n test). Safe to run multiple times.
 *
 *   npm run build
 *   node dist/scripts/seed_benchmark.js
 */
import 'dotenv/config';
import prisma from '../config/database';

const API_KEY = 'ff_bench_local_key';
const FLAG_COUNT = 50;

async function main() {
  // Placeholder password: this account is only an owner for the benchmark data
  // and is not meant to log in.
  const user = await prisma.user.upsert({
    where: { email: 'bench@flagforge.local' },
    update: {},
    create: { name: 'Benchmark', email: 'bench@flagforge.local', password: 'not-a-login-account' },
  });

  const project = await prisma.project.upsert({
    where: { apiKey: API_KEY },
    update: {},
    create: { name: 'Benchmark Project', apiKey: API_KEY, userId: user.id },
  });

  for (let i = 1; i <= FLAG_COUNT; i++) {
    const isAbTest = i % 5 === 0;
    await prisma.flag.upsert({
      where: {
        projectId_key_environment: { projectId: project.id, key: `bench-flag-${i}`, environment: 'Production' },
      },
      update: {},
      create: {
        projectId: project.id,
        key: `bench-flag-${i}`,
        environment: 'Production',
        type: isAbTest ? 'MULTIVARIATE' : 'BOOLEAN',
        rolloutPercentage: 30,
        targetingRules: { allowed_users: ['vip-1'], blocked_users: ['banned-1'] },
        variants: isAbTest
          ? [
            { id: 'a', name: 'Control', value: 'control', rolloutPercentage: 50 },
            { id: 'b', name: 'Variant B', value: 'b', rolloutPercentage: 30 },
            { id: 'c', name: 'Variant C', value: 'c', rolloutPercentage: 20 },
          ]
          : [],
        defaultVariantId: isAbTest ? 'a' : null,
        offVariantId: isAbTest ? 'a' : null,
      },
    });
  }

  console.log(`Seeded project "${project.name}" with ${FLAG_COUNT} flags. API key: ${API_KEY}`);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
