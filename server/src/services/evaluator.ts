import { hashUserFlag } from '../utils/hash';

export interface TargetingRules {
  allowed_users?: string[];
  blocked_users?: string[];
}

export interface FlagData {
  key: string;
  status: boolean;
  rolloutPercentage: number;
  targetingRules: TargetingRules;
}

export interface EvaluationResult {
  enabled: boolean;
  reason: string;
}

/**
 * Core flag evaluation engine - stateless and deterministic
 * 
 * Evaluation order:
 * 1. Global Kill Switch - If flag status is false, always return OFF
 * 2. Blocked Users - If user is in blocked list, return OFF
 * 3. Whitelist Check - If user is in allowed list, return ON
 * 4. Percentage Rollout - Hash-based deterministic evaluation
 * 
 * @param flagData - The flag configuration
 * @param userId - The user identifier
 * @returns Evaluation result with reason for debugging
 */
export function evaluateFlag(flagData: FlagData, userId: string): EvaluationResult {
  // Step 1: Check global kill switch
  if (!flagData.status) {
    return {
      enabled: false,
      reason: 'KILL_SWITCH',
    };
  }

  // Step 2: Check if user is blocked
  if (flagData.targetingRules.blocked_users?.includes(userId)) {
    return {
      enabled: false,
      reason: 'BLOCKED_USER',
    };
  }

  // Step 3: Check whitelist (allowed users)
  if (flagData.targetingRules.allowed_users?.includes(userId)) {
    return {
      enabled: true,
      reason: 'WHITELISTED',
    };
  }

  // Step 4: Percentage-based rollout using deterministic hashing
  const hashScore = hashUserFlag(userId, flagData.key);
  
  if (hashScore < flagData.rolloutPercentage) {
    return {
      enabled: true,
      reason: `PERCENTAGE_ROLLOUT (score: ${hashScore}, threshold: ${flagData.rolloutPercentage})`,
    };
  }

  return {
    enabled: false,
    reason: `PERCENTAGE_EXCLUDED (score: ${hashScore}, threshold: ${flagData.rolloutPercentage})`,
  };
}
