/**
 * Parity test: the server, the Node SDK and the browser SDK must give every
 * user exactly the same result for the same flag. If any implementation
 * drifts (different hash, different variant logic), this test fails and
 * reports what percentage of users disagree.
 */
import { describe, it, expect } from 'vitest';
import { evaluateFlag, FlagData } from '../src/services/evaluator';
import { FlagForgeClient } from '../../sdk-node/src/FlagForgeClient';
import { FlagForgeSDK } from '../../sdk/src/index';

const N = 100_000;
const USERS = Array.from({ length: N }, (_, i) => `user-${i}`);

const booleanFlag: FlagData = {
  key: 'new-checkout',
  type: 'BOOLEAN',
  status: true,
  rolloutPercentage: 30,
  targetingRules: { allowed_users: ['vip-1'], blocked_users: ['banned-1'] },
  variants: [],
};

const abFlag: FlagData = {
  key: 'checkout-button',
  type: 'MULTIVARIATE',
  status: true,
  rolloutPercentage: 100,
  targetingRules: {},
  variants: [
    { id: 'a', name: 'Blue', value: 'blue', rolloutPercentage: 50 },
    { id: 'b', name: 'Green', value: 'green', rolloutPercentage: 30 },
    { id: 'c', name: 'Red', value: 'red', rolloutPercentage: 20 },
  ],
  defaultVariantId: 'a',
  offVariantId: 'a',
};

// Load flags straight into each SDK's in-memory store (no network needed)
function nodeClient(flags: FlagData[]) {
  const client = new FlagForgeClient({ apiKey: 'test', refreshInterval: 0 });
  for (const f of flags) (client as any).flags.set(f.key, f);
  return client;
}

function browserSdk(flags: FlagData[]) {
  const sdk = new FlagForgeSDK({ apiKey: 'test', pollingInterval: 0 });
  for (const f of flags) (sdk as any).flags.set(f.key, f);
  (sdk as any).initialized = true;
  return sdk;
}

const pct = (n: number) => `${((n / N) * 100).toFixed(1)}% of ${N} users disagree`;

describe('server vs Node SDK vs browser SDK', () => {
  const node = nodeClient([booleanFlag, abFlag]);
  const browser = browserSdk([booleanFlag, abFlag]);

  it('boolean rollout: all three agree for every user', () => {
    let nodeMismatch = 0;
    let browserMismatch = 0;
    for (const u of USERS) {
      const server = evaluateFlag(booleanFlag, u).enabled;
      if (node.getVariant(booleanFlag.key, u).enabled !== server) nodeMismatch++;
      if (browser.evaluate(booleanFlag.key, u).enabled !== server) browserMismatch++;
    }
    expect(nodeMismatch, `Node SDK: ${pct(nodeMismatch)}`).toBe(0);
    expect(browserMismatch, `Browser SDK: ${pct(browserMismatch)}`).toBe(0);
  });

  it('A/B/n test: all three assign every user the same variant', () => {
    let nodeMismatch = 0;
    let browserMismatch = 0;
    const counts: Record<string, number> = {};
    for (const u of USERS) {
      const server = evaluateFlag(abFlag, u).value;
      counts[server] = (counts[server] ?? 0) + 1;
      if (node.getVariant(abFlag.key, u).value !== server) nodeMismatch++;
      if (browser.evaluate(abFlag.key, u).variant !== server) browserMismatch++;
    }
    expect(nodeMismatch, `Node SDK: ${pct(nodeMismatch)}`).toBe(0);
    expect(browserMismatch, `Browser SDK: ${pct(browserMismatch)}`).toBe(0);

    // The 50/30/20 split should hold within 1 percentage point
    expect(Math.abs((counts.blue / N) * 100 - 50)).toBeLessThan(1);
    expect(Math.abs((counts.green / N) * 100 - 30)).toBeLessThan(1);
    expect(Math.abs((counts.red / N) * 100 - 20)).toBeLessThan(1);
  });

  it('targeting rules and kill switch behave the same everywhere', () => {
    const killed = { ...booleanFlag, key: 'killed', status: false, rolloutPercentage: 100 };
    const n = nodeClient([booleanFlag, killed]);
    const b = browserSdk([booleanFlag, killed]);

    for (const [flag, user] of [[booleanFlag, 'vip-1'], [booleanFlag, 'banned-1'], [killed, 'user-1']] as const) {
      const server = evaluateFlag(flag, user).enabled;
      expect(n.getVariant(flag.key, user).enabled).toBe(server);
      expect(b.evaluate(flag.key, user).enabled).toBe(server);
    }
    expect(evaluateFlag(booleanFlag, 'vip-1').enabled).toBe(true);
    expect(evaluateFlag(booleanFlag, 'banned-1').enabled).toBe(false);
    expect(evaluateFlag(killed, 'user-1').enabled).toBe(false);
  });
});
