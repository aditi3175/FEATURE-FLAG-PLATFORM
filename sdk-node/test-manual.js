
const { FlagForgeClient } = require('./dist');

async function testSDK() {
  console.log('--- Starting SDK Test ---');

  // 1. Initialize Client
  // Note: Ensure your server is running on localhost:4000
  const client = new FlagForgeClient({
    apiKey: 'test-api-key', // Replace with a valid key from your DB
    refreshInterval: 5000 
  });

  try {
    console.log('Initializing...');
    await client.init();
    console.log('SDK Initialized!');

    // 2. Test Evaluation
    // Use a flag key that exists in your DB
    const flagKey = 'new-feature-v1'; 
    const userId = 'user-123';

    console.log(`Evaluating flag "${flagKey}" for user "${userId}"...`);
    const result = client.getVariant(flagKey, userId, false);
    
    console.log('Evaluation Result:', JSON.stringify(result, null, 2));

    // 3. Test Hashing Consistency
    console.log('Testing consistency...');
    const result2 = client.getVariant(flagKey, userId, false);
    if (result.variantId === result2.variantId) {
        console.log('PASS: Consistent assignment');
    } else {
        console.error('FAIL: Inconsistent assignment');
    }

  } catch (error) {
    console.error('SDK Test Failed:', error.message);
  } finally {
    client.close();
  }
}

testSDK();
