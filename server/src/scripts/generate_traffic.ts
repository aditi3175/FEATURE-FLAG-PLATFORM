import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000/api/evaluate';

async function generateTraffic() {
  try {
    // 1. Get a project and flag
    const project = await prisma.project.findFirst({
      include: { flags: true }
    });

    if (!project || project.flags.length === 0) {
      console.log('No project or flags found. Please create one in the dashboard first.');
      return;
    }

    const flag = project.flags[0];
    const apiKey = project.apiKey;

    console.log(`Generating traffic for Project: ${project.name}, Flag: ${flag.key}`);

    // 2. Make requests
    for (let i = 0; i < 5; i++) {
      try {
        const start = Date.now();
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey,
            flagKey: flag.key,
            userId: `test-user-${i}`,
            context: { plan: 'premium' }
          })
        });

        const duration = Date.now() - start;
        
        if (response.ok) {
          console.log(`Request ${i + 1}: Success (${duration}ms)`);
        } else {
          console.error(`Request ${i + 1} failed: ${response.status}`);
        }
        
        // Add a small delay
        await new Promise(r => setTimeout(r, 100));
      } catch (err: any) {
        console.error(`Request ${i + 1} failed:`, err.message);
      }
    }

    console.log('Traffic generation complete!');
  } catch (err) {
    console.error('Script error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

generateTraffic();
