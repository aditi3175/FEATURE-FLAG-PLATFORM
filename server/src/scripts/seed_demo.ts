/**
 * Seeds (or resets) the public demo account shown in the README, with
 * realistic flags and about a week of evaluation events.
 *
 * Safe to re-run: it wipes and recreates the demo project's flags and
 * events, which also restores the demo if a visitor changes or deletes things.
 *
 *   npm run build
 *   node dist/scripts/seed_demo.js
 *
 * Point DATABASE_URL at the production database (Neon) to seed the live demo.
 * Note: the API caches flag lists for up to 5 minutes, so the live dashboard
 * may take a few minutes to show the reset flags.
 */
import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { evaluateFlag, FlagData } from '../services/evaluator';

const DEMO_EMAIL = 'demo@flagforge.dev';
const DEMO_PASSWORD = 'flagforge-demo';
const PROJECT_NAME = 'Demo Store';
const EVENT_COUNT = 5_000;
const USER_COUNT = 2_000;
const DAYS = 7;

const DEMO_FLAGS = [
  {
    key: 'new-checkout',
    description: 'Redesigned one-page checkout, rolling out gradually',
    type: 'BOOLEAN',
    status: true,
    rolloutPercentage: 25,
    environment: 'Production',
    targetingRules: { allowed_users: ['qa-tester-1', 'qa-tester-2'], blocked_users: [] },
    variants: [],
  },
  {
    key: 'dark-mode',
    description: 'Dark theme across the storefront',
    type: 'BOOLEAN',
    status: true,
    rolloutPercentage: 100,
    environment: 'Production',
    targetingRules: {},
    variants: [],
  },
  {
    key: 'pricing-page-test',
    description: 'A/B/n test of three pricing page layouts',
    type: 'MULTIVARIATE',
    status: true,
    rolloutPercentage: 100,
    environment: 'Production',
    targetingRules: {},
    variants: [
      { id: 'control', name: 'Control', value: 'control', rolloutPercentage: 50 },
      { id: 'annual-first', name: 'Annual plan first', value: 'annual-first', rolloutPercentage: 30 },
      { id: 'comparison', name: 'Comparison table', value: 'comparison', rolloutPercentage: 20 },
    ],
    defaultVariantId: 'control',
    offVariantId: 'control',
  },
  {
    key: 'ai-recommendations',
    description: 'ML product recommendations (kill switch on after a latency spike)',
    type: 'BOOLEAN',
    status: false,
    rolloutPercentage: 50,
    environment: 'Production',
    targetingRules: {},
    variants: [],
  },
  {
    key: 'search-v2',
    description: 'New search backend, fully on in Staging',
    type: 'BOOLEAN',
    status: true,
    rolloutPercentage: 100,
    environment: 'Staging',
    targetingRules: {},
    variants: [],
  },
  {
    key: 'search-v2',
    description: 'New search backend, internal users only in Production',
    type: 'BOOLEAN',
    status: true,
    rolloutPercentage: 0,
    environment: 'Production',
    targetingRules: { allowed_users: ['employee-1', 'employee-2', 'employee-3'], blocked_users: [] },
    variants: [],
  },
] as const;

// How often each flag gets evaluated, relative to the others
const TRAFFIC_WEIGHTS: Record<string, number> = {
  'new-checkout': 30,
  'dark-mode': 25,
  'pricing-page-test': 25,
  'ai-recommendations': 10,
  'search-v2': 10,
};

function pickWeighted(): string {
  const total = Object.values(TRAFFIC_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [key, weight] of Object.entries(TRAFFIC_WEIGHTS)) {
    r -= weight;
    if (r < 0) return key;
  }
  return 'dark-mode';
}

async function main() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password, name: 'Demo User' },
    create: { name: 'Demo User', email: DEMO_EMAIL, password },
  });

  // Keep the same project (and API key) across re-runs
  let project = await prisma.project.findFirst({ where: { userId: user.id, name: PROJECT_NAME } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: PROJECT_NAME,
        apiKey: `ff_prod_${crypto.randomBytes(32).toString('hex')}`,
        userId: user.id,
      },
    });
  }

  // Reset the demo project's data
  await prisma.evaluationEvent.deleteMany({ where: { projectId: project.id } });
  await prisma.flag.deleteMany({ where: { projectId: project.id } });

  const created: any[] = [];
  for (const f of DEMO_FLAGS) {
    created.push(
      await prisma.flag.create({
        data: { ...f, projectId: project.id, targetingRules: f.targetingRules as any, variants: f.variants as any },
      })
    );
  }

  // Generate events whose results come from the real evaluator,
  // so the analytics match what the flags would actually do
  const now = Date.now();
  const events = Array.from({ length: EVENT_COUNT }, () => {
    const key = pickWeighted();
    const environment = key === 'search-v2' && Math.random() < 0.4 ? 'Staging' : 'Production';
    const flag = created.find(c => c.key === key && c.environment === environment)
      ?? created.find(c => c.key === key)!;
    const userId = `user-${Math.floor(Math.random() * USER_COUNT)}`;

    const result = evaluateFlag(
      {
        key: flag.key,
        type: flag.type,
        status: flag.status,
        rolloutPercentage: flag.rolloutPercentage,
        targetingRules: flag.targetingRules as any,
        variants: flag.variants as any,
        defaultVariantId: flag.defaultVariantId,
        offVariantId: flag.offVariantId,
      } as FlagData,
      userId
    );

    return {
      projectId: project!.id,
      flagKey: flag.key,
      result: result.enabled,
      environment: flag.environment,
      userId,
      latency: 300 + Math.floor(Math.random() * 1200), // microseconds
      timestamp: new Date(now - Math.random() * DAYS * 24 * 60 * 60 * 1000),
    };
  });

  await prisma.evaluationEvent.createMany({ data: events });

  console.log(`Demo ready: ${created.length} flags, ${EVENT_COUNT} events`);
  console.log(`  Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Project: ${PROJECT_NAME} (${project.id})`);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
