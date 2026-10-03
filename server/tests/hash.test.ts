import { describe, it, expect } from 'vitest';
import { murmur3, hashUserFlag } from '../src/utils/hash';

const N = 100_000;
const USERS = Array.from({ length: N }, (_, i) => `user-${i}`);

describe('murmur3', () => {
  it('matches the official MurmurHash3 x86_32 reference values', () => {
    expect(murmur3('')).toBe(0);
    expect(murmur3('', 1)).toBe(0x514e28b7);
    expect(murmur3('hello')).toBe(613153351);
    expect(murmur3('The quick brown fox jumps over the lazy dog')).toBe(0x2e4ff723);
  });
});

describe('hashUserFlag', () => {
  it('always returns an integer bucket from 0 to 99', () => {
    for (const u of USERS.slice(0, 10_000)) {
      const b = hashUserFlag(u, 'some-flag');
      expect(Number.isInteger(b) && b >= 0 && b <= 99).toBe(true);
    }
  });

  it('is deterministic: same user + flag always gives the same bucket', () => {
    for (const u of USERS.slice(0, 10_000)) {
      expect(hashUserFlag(u, 'some-flag')).toBe(hashUserFlag(u, 'some-flag'));
    }
  });

  it('spreads 100K users evenly across all 100 buckets', () => {
    const buckets = new Array(100).fill(0);
    for (const u of USERS) buckets[hashUserFlag(u, 'new-checkout')]++;
    // Expected 1,000 users per bucket. Allow +/-15%.
    expect(Math.min(...buckets)).toBeGreaterThanOrEqual(850);
    expect(Math.max(...buckets)).toBeLessThanOrEqual(1150);
  });

  it('enables close to the target percentage of users', () => {
    for (const target of [10, 30, 50, 90]) {
      const enabled = USERS.filter(u => hashUserFlag(u, 'new-checkout') < target).length;
      const actual = (enabled / N) * 100;
      console.log(`rollout ${target}% -> actual ${actual.toFixed(2)}% (error ${(actual - target).toFixed(2)} pts)`);
      expect(Math.abs(actual - target)).toBeLessThan(0.5);
    }
  });

  it('assigns buckets independently per flag (no correlated rollouts)', () => {
    // Users who got flag A at 30% should get flag B at ~30%, not all or none of them.
    const inA = USERS.filter(u => hashUserFlag(u, 'flag-a') < 30);
    const alsoInB = inA.filter(u => hashUserFlag(u, 'flag-b') < 30).length;
    const rate = (alsoInB / inA.length) * 100;
    expect(Math.abs(rate - 30)).toBeLessThan(1.5);
  });
});
