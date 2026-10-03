/**
 * Shared bucketing hash for FlagForge.
 *
 * IMPORTANT: This exact file is copied into three places:
 *   server/src/utils/hash.ts, sdk-node/src/hash.ts, sdk/src/hash.ts
 * The server and both SDKs MUST bucket users identically, so keep the copies
 * identical. server/tests/parity.test.ts fails if they ever drift apart.
 *
 * Algorithm: MurmurHash3 (x86, 32-bit) over the UTF-8 bytes of the input.
 * Pure JavaScript with no Node 'crypto' dependency, so it also runs in browsers.
 */
export function murmur3(key: string, seed = 0): number {
  const bytes = new TextEncoder().encode(key);
  const len = bytes.length;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let h = seed >>> 0;

  // Body: process 4 bytes at a time
  const nblocks = len >> 2;
  for (let i = 0; i < nblocks; i++) {
    const j = i * 4;
    let k = bytes[j] | (bytes[j + 1] << 8) | (bytes[j + 2] << 16) | (bytes[j + 3] << 24);
    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, c2);
    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = (Math.imul(h, 5) + 0xe6546b64) | 0;
  }

  // Tail: the remaining 1-3 bytes
  const tail = nblocks * 4;
  const rem = len & 3;
  if (rem > 0) {
    let k = 0;
    if (rem === 3) k ^= bytes[tail + 2] << 16;
    if (rem >= 2) k ^= bytes[tail + 1] << 8;
    k ^= bytes[tail];
    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, c2);
    h ^= k;
  }

  // Finalization: mix the bits so similar inputs give very different outputs
  h ^= len;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;

  return h >>> 0; // unsigned 32-bit integer
}

/**
 * Deterministic bucket (0-99) for a user + flag combination.
 * The same userId and flagKey always produce the same bucket.
 */
export function hashUserFlag(userId: string, flagKey: string): number {
  return murmur3(`${userId}:${flagKey}`) % 100;
}

/**
 * Check if a percentage value is valid (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}
