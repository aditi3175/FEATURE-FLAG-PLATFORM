import { hashUserFlag } from '../utils/hash';

export interface TargetingRules {
  allowed_users?: string[];
  blocked_users?: string[];
}

export interface Variant {
  id: string;
  name: string;
  value: any;
  rolloutPercentage: number;
}

export interface FlagData {
  key: string;
  type: 'BOOLEAN' | 'MULTIVARIATE';
  status: boolean;
  rolloutPercentage: number;
  targetingRules: TargetingRules;
  variants?: Variant[];
  defaultVariantId?: string | null;
  offVariantId?: string | null;
}

export interface EvaluationResult {
  enabled: boolean;
  variantId?: string | null;
  value?: any;
  reason: string;
}

/**
 * Core flag evaluation engine - stateless and deterministic
 */
export function evaluateFlag(flagData: FlagData, userId: string): EvaluationResult {
  // Step 1: Check global kill switch
  if (!flagData.status) {
    const offVariant = flagData.variants?.find(v => v.id === flagData.offVariantId);
    return {
      enabled: false,
      value: offVariant?.value ?? false,
      variantId: offVariant?.id,
      reason: 'KILL_SWITCH',
    };
  }

  // Step 2: Check if user is blocked
  if (flagData.targetingRules.blocked_users?.includes(userId)) {
     const offVariant = flagData.variants?.find(v => v.id === flagData.offVariantId);
    return {
      enabled: false,
      value: offVariant?.value ?? false,
      variantId: offVariant?.id,
      reason: 'BLOCKED_USER',
    };
  }

  // Step 3: Check whitelist (allowed users)
  if (flagData.targetingRules.allowed_users?.includes(userId)) {
    const onVariant = flagData.variants?.find(v => v.id === flagData.defaultVariantId);
    return {
      enabled: true,
      value: onVariant?.value ?? true,
      variantId: onVariant?.id,
      reason: 'WHITELISTED',
    };
  }

  // Step 4: Percentage-based rollout using deterministic hashing
  const hashScore = hashUserFlag(userId, flagData.key); // 0-100

  // 4a. Handle BOOLEAN Flags
  if (flagData.type === 'BOOLEAN' || !flagData.variants?.length) {
    if (hashScore < flagData.rolloutPercentage) {
      return {
        enabled: true,
        value: true,
        reason: `PERCENTAGE_ROLLOUT (score: ${hashScore}, threshold: ${flagData.rolloutPercentage})`,
      };
    }
    return {
      enabled: false,
      value: false,
      reason: `PERCENTAGE_EXCLUDED (score: ${hashScore}, threshold: ${flagData.rolloutPercentage})`,
    };
  }

  // 4b. Handle MULTIVARIATE Flags
  // Use bucket hashing to serve variants based on their rolloutPercentage
  let cumulative = 0;
  for (const variant of flagData.variants) {
    cumulative += variant.rolloutPercentage;
    if (hashScore < cumulative) {
      return {
        enabled: true,
        value: variant.value,
        variantId: variant.id,
        reason: `VARIANT_ROLLOUT (variant: ${variant.id}, score: ${hashScore})`,
      };
    }
  }

  // Fallback if hash exceeds all variant ranges (shouldn't happen if they sum to 100)
  // or serve default/off variant
  const defaultVar = flagData.variants.find(v => v.id === flagData.defaultVariantId) || flagData.variants[0];
  return {
    enabled: true, // It's "enabled" just fallthrough
    value: defaultVar?.value,
    variantId: defaultVar?.id,
    reason: 'FALLBACK_DEFAULT',
  };
}
