# FlagForge SDK

JavaScript/TypeScript SDK for FlagForge feature flag platform.

## Installation

```bash
npm install @flagforge/sdk
```

## Quick Start

```typescript
import FlagForgeSDK from '@flagforge/sdk';

// Initialize SDK with your project API key
const sdk = new FlagForgeSDK({
  apiKey: 'your-project-api-key-here',
  apiUrl: 'http://localhost:4000', // optional, defaults to localhost
});

// Initialize and fetch flags
await sdk.init();

// Check if a flag is enabled for a user
const userId = 'user-123';

if (sdk.isEnabled('new-checkout-flow', userId)) {
  // Show new checkout flow
  console.log('New checkout is enabled!');
} else {
  // Show old checkout flow
  console.log('Using legacy checkout');
}
```

## Configuration Options

```typescript
interface FlagForgeConfig {
  apiKey: string;              // Required: Your project API key
  apiUrl?: string;             // Optional: API base URL (default: http://localhost:4000)
  pollingInterval?: number;    // Optional: Auto-refresh interval in ms (default: 60000)
}
```

## API Reference

### `new FlagForgeSDK(config)`

Creates a new SDK instance.

**Parameters:**
- `config: FlagForgeConfig` - Configuration object

**Example:**
```typescript
const sdk = new FlagForgeSDK({
  apiKey: 'abc123...',
  pollingInterval: 30000, // Refresh every 30 seconds
});
```

### `init(): Promise<void>`

Initialize the SDK by fetching all flags. Must be called before using `isEnabled()`.

**Example:**
```typescript
await sdk.init();
```

### `isEnabled(flagKey, userId): boolean`

Check if a flag is enabled for a specific user.

**Parameters:**
- `flagKey: string` - The flag key
- `userId: string` - The user identifier

**Returns:** `boolean` - true if enabled, false otherwise

**Example:**
```typescript
if (sdk.isEnabled('dark-mode', 'user-456')) {
  enableDarkMode();
}
```

### `evaluate(flagKey, userId): EvaluationResult`

Get detailed evaluation result including the reason.

**Parameters:**
- `flagKey: string` - The flag key
- `userId: string` - The user identifier

**Returns:** `EvaluationResult` - Object with `enabled` and `reason`

**Example:**
```typescript
const result = sdk.evaluate('premium-features', 'user-789');
console.log(result);
// { enabled: true, reason: 'WHITELISTED' }
// or
// { enabled: false, reason: 'PERCENTAGE_EXCLUDED (score: 67, threshold: 50)' }
```

### `refresh(): Promise<void>`

Manually refresh flags from the server.

**Example:**
```typescript
await sdk.refresh();
```

### `destroy(): void`

Stop polling and clean up resources.

**Example:**
```typescript
sdk.destroy();
```

## How It Works

### Deterministic Evaluation

The SDK uses the same MD5 hashing algorithm as the backend to ensure consistency:

1. **Kill Switch**: If the flag's global status is OFF, everyone gets false
2. **Blocked Users**: Users in the blocked list always get false
3. **Whitelisted Users**: Users in the allowed list always get true
4. **Percentage Rollout**: Hash userId + flagKey to get a score (0-99), compare with rollout percentage

This means **the same user will always get the same result** for a given flag configuration.

### Local Evaluation

Flags are fetched once during `init()` and evaluated locally. This provides:
- **Fast evaluation** (no network request per check)
- **Offline capability** (flags cached in memory)
- **Consistency** (same algorithm as server)

### Auto-Refresh

By default, the SDK polls for flag updates every 60 seconds. You can customize this:

```typescript
const sdk = new FlagForgeSDK({
  apiKey: 'abc123...',
  pollingInterval: 30000, // 30 seconds
});

// Or disable polling
const sdkNoPolling = new FlagForgeSDK({
  apiKey: 'abc123...',
  pollingInterval: 0, // Disabled
});
```

## React Example

```tsx
import { useEffect, useState } from 'react';
import FlagForgeSDK from '@flagforge/sdk';

const sdk = new FlagForgeSDK({ apiKey: 'your-key' });

function App() {
  const [initialized, setInitialized] = useState(false);
  const userId = 'current-user-id';

  useEffect(() => {
    sdk.init().then(() => setInitialized(true));
    return () => sdk.destroy();
  }, []);

  if (!initialized) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {sdk.isEnabled('new-ui', userId) ? (
        <NewUI />
      ) : (
        <LegacyUI />
      )}
    </div>
  );
}
```

## Browser Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>FlagForge Demo</title>
</head>
<body>
  <h1 id="title">Loading...</h1>

  <script type="module">
    import FlagForgeSDK from './node_modules/@flagforge/sdk/dist/index.js';

    const sdk = new FlagForgeSDK({
      apiKey: 'your-api-key-here',
      apiUrl: 'http://localhost:4000',
    });

    await sdk.init();

    const userId = 'demo-user';
    const title = document.getElementById('title');

    if (sdk.isEnabled('welcome-message', userId)) {
      title.textContent = '🎉 Welcome to the new experience!';
    } else {
      title.textContent = 'Welcome';
    }
  </script>
</body>
</html>
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions.

```typescript
import FlagForgeSDK, { FlagForgeConfig, EvaluationResult } from '@flagforge/sdk';

const config: FlagForgeConfig = {
  apiKey: 'abc123',
};

const sdk = new FlagForgeSDK(config);
const result: EvaluationResult = sdk.evaluate('flag-key', 'user-id');
```

## License

MIT
