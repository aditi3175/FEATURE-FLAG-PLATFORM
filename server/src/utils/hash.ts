import crypto from 'crypto';

/**
 * Generates a deterministic hash score (0-99) for a given user and flag combination.
 * Uses MD5 hashing to ensure consistent results for the same input.
 * 
 * @param userId - The user identifier
 * @param flagKey - The flag key
 * @returns A number between 0 and 99 (inclusive)
 */
export function hashUserFlag(userId: string, flagKey: string): number {
  // Concatenate userId and flagKey with a separator
  const seed = `${userId}:${flagKey}`;
  
  // Generate MD5 hash
  const hash = crypto.createHash('md5').update(seed).digest('hex');
  
  // Take first 8 characters, convert to integer, and mod 100
  const hashValue = parseInt(hash.substring(0, 8), 16);
  const score = hashValue % 100;
  
  return score;
}

/**
 * Check if a percentage value is valid (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}
