# FlagForge Node.js SDK

> Server-side SDK for [FlagForge](https://github.com/aditi3175/feature-flag-platform) — a modern feature flag & A/B testing platform.

[![npm version](https://img.shields.io/npm/v/flagforge-node-sdk.svg)](https://www.npmjs.com/package/flagforge-node-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Zero-latency evaluation** — flags are cached in memory
- 🎯 **Deterministic hashing** — consistent variant assignment per user
- 🔀 **Multivariate flags** — support for A/B/n testing with JSON variants
- 🔄 **Auto-polling** — keeps flags synced with configurable intervals
- 📊 **Built-in analytics** — evaluation events tracked automatically
- 🛡️ **Offline resilient** — gracefully handles network failures
- 📦 **TypeScript-first** — full type definitions included

## Installation

```bash
npm install flagforge-node-sdk
```

## Quick Start

```typescript
import { FlagForgeClient } from 'flagforge-node-sdk';

// 1. Initialize the client
const client = new FlagForgeClient({
  apiKey: 'your-project-api-key',
  apiUrl: 'https://your-flagforge-server.com', // default: http://localhost:4000
  refreshInterval: 60000, // poll every 60s (default)
});

await client.init();

// 2. Evaluate a boolean flag
const { enabled } = client.getVariant('dark-mode', 'user-123');

if (enabled) {
  // Show dark mode
}

// 3. Evaluate a multivariate flag (A/B test)
const { value, variantId } = client.getVariant('checkout-button', 'user-123', 'blue');

console.log(`Showing ${value} button (variant: ${variantId})`);
// Output: "Showing green button (variant: variant-b)"

// 4. Cleanup when done
client.close();
```

## API Reference

### `new FlagForgeClient(config)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `apiKey` | `string` | *required* | Your project API key from the FlagForge dashboard |
| `apiUrl` | `string` | `http://localhost:4000` | URL of your FlagForge server |
| `refreshInterval` | `number` | `60000` | Polling interval in ms (set to `0` to disable) |

### `client.init()`

Fetches all flags from the server and starts background polling. **Must be called before evaluating flags.**

```typescript
await client.init();
```

### `client.getVariant(flagKey, userId, defaultValue?)`

Evaluates a flag for a specific user. Works for both boolean and multivariate flags.

| Parameter | Type | Description |
|-----------|------|-------------|
| `flagKey` | `string` | The flag key |
| `userId` | `string` | Unique user identifier |
| `defaultValue` | `any` | Fallback value if flag not found (default: `null`) |

**Returns:** `EvaluationResult`

```typescript
interface EvaluationResult {
  enabled: boolean;     // Whether the flag is on for this user
  value: any;           // The variant value (true/false for boolean, any for multivariate)
  variantId?: string;   // The matched variant ID (multivariate only)
  reason: string;       // Why this result was returned
}
```

**Example:**
```typescript
// Boolean flag
const { enabled } = client.getVariant('new-checkout', 'user-42');

// Multivariate flag with fallback
const { value } = client.getVariant('pricing-tier', 'user-42', 'free');
```

### `client.close()`

Stops background polling. Call this when shutting down your server.

### Events

```typescript
client.on('update', () => {
  console.log('Flags refreshed from server');
});

client.on('error', (err) => {
  console.error('Failed to refresh flags:', err);
});
```

## How It Works

### Deterministic Hashing

FlagForge uses a deterministic hash of `userId + flagKey` to assign users to variants. This means:

- ✅ Same user always sees the same variant
- ✅ No database lookups required
- ✅ Works offline after initial fetch
- ✅ Consistent across server restarts

### Evaluation Order

1. **Kill Switch** — if flag is disabled, return off variant
2. **Blocked Users** — if user is in block list, return off variant
3. **Allowed Users** — if user is in allow list, return on/default variant
4. **Percentage Rollout** — hash user into a bucket (0-99) and match against variant percentages

## Express.js Example

```typescript
import express from 'express';
import { FlagForgeClient } from 'flagforge-node-sdk';

const app = express();
const flags = new FlagForgeClient({ apiKey: process.env.FLAGFORGE_API_KEY! });

// Initialize flags before starting server
flags.init().then(() => {
  app.get('/api/pricing', (req, res) => {
    const userId = req.user.id;
    const { value } = flags.getVariant('pricing-page', userId, 'default');

    res.json({ layout: value });
  });

  app.listen(3000, () => console.log('Server running'));
});
```

## License

MIT © FlagForge Team
