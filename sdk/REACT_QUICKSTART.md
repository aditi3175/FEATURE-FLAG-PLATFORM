# FlagForge React SDK - Quick Start

## Installation

```bash
npm install @types/react
```

## React Integration

### 1. Wrap Your App with FlagForgeProvider

```tsx
import { FlagForgeProvider } from './sdk/src/react';

function App() {
  return (
    <FlagForgeProvider apiKey="ff_prod_your_api_key_here">
      <YourApp />
    </FlagForgeProvider>
  );
}
```

### 2. Use the `useFlag` Hook

```tsx
import { useFlag } from './sdk/src/react';

function MyFeature() {
  // Automatically re-renders when flag changes during polling
  const isEnabled = useFlag('my-feature-key', 'user-123');

  if (!isEnabled) {
    return <div>Feature not available</div>;
  }

  return <div>New Feature!</div>;
}
```

### 3. Handle Loading States (Optional)

```tsx
import { useFlagForgeLoading, useFlagForgeError } from './sdk/src/react';

function App() {
  const loading = useFlagForgeLoading();
  const error = useFlagForgeError();

  if (loading) {
    return <div>Loading flags...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <YourApp />;
}
```

## Features

✅ **Automatic Analytics**: Every flag evaluation is logged to `/api/v1/sdk/events`  
✅ **Auto Re-renders**: Components automatically update when flags change  
✅ **Type-Safe**: Full TypeScript support  
✅ **Loading States**: Built-in loading and error handling  
✅ **Polling**: Flags auto-refresh every 60 seconds (configurable)

## Advanced Configuration

```tsx
<FlagForgeProvider
  apiKey="ff_prod_..."
  apiUrl="https://your-api.com"  // Default: http://localhost:4000
  pollingInterval={30000}         // Default: 60000 (60s)
>
  <App />
</FlagForgeProvider>
```

## How It Works

1. **Provider initializes SDK** on mount with your API key
2. **Flags are fetched** from `/api/v1/sdk/flags` with `x-api-key` header
3. **useFlag hook** subscribes to flag changes and triggers re-renders
4. **Analytics are logged** to `/api/v1/sdk/events` automatically
5. **Polling keeps flags fresh** (every 60s by default)
