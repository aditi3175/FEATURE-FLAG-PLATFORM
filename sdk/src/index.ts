export interface FlagForgeConfig {
  apiKey: string;
  apiUrl?: string;
  pollingInterval?: number; // milliseconds, default: 60000 (1 minute)
}

export interface Variant {
  id: string;
  value: string;
  weight: number;
}

export interface FlagData {
  key: string;
  status: boolean;
  rolloutPercentage: number;
  type?: 'BOOLEAN' | 'MULTIVARIATE';
  variants?: Variant[];
  defaultVariantId?: string;
  offVariantId?: string;
  targetingRules: {
    allowed_users?: string[];
    blocked_users?: string[];
  };
}

export interface EvaluationResult {
  enabled: boolean;
  reason: string;
  variant?: string;
}

/**
 * FlagForge SDK for feature flag evaluation
 * 
 * @example
 * ```typescript
 * const sdk = new FlagForgeSDK({
 *   apiKey: 'your-project-api-key',
 *   apiUrl: 'https://api.flagforge.com', // optional,
 * });
 * 
 * await sdk.init();
 * 
 * if (sdk.isEnabled('new-feature', 'user-123')) {
 *   // Show new feature
 * }
 * ```
 */
export class FlagForgeSDK {
  private config: FlagForgeConfig;
  private flags: Map<string, FlagData> = new Map();
  private pollingTimer?: NodeJS.Timeout;
  private initialized = false;
  private listeners: Set<() => void> = new Set();

  constructor(config: FlagForgeConfig) {
    this.config = {
      apiUrl: 'http://localhost:4000',
      pollingInterval: 60000, // 1 minute
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error('FlagForge: apiKey is required');
    }
  }

  /**
   * Initialize the SDK by fetching all flags
   * Call this before using isEnabled()
   */
  async init(): Promise<void> {
    try {
      await this.refresh();
      this.initialized = true;

      // Start polling for updates
      if (this.config.pollingInterval && this.config.pollingInterval > 0) {
        this.startPolling();
      }
    } catch (error) {
      console.error('FlagForge: Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Check if a flag is enabled for a specific user
   * 
   * @param flagKey - The flag key
   * @param userId - The user identifier
   * @returns true if flag is enabled, false otherwise
   */
  isEnabled(flagKey: string, userId: string): boolean {
    if (!this.initialized) {
      console.warn('FlagForge: SDK not initialized. Call init() first. Returning false.');
      return false;
    }

    const flag = this.flags.get(flagKey);
    
    if (!flag) {
      console.warn(`FlagForge: Flag "${flagKey}" not found. Returning false.`);
      return false;
    }

    const result = this.evaluateFlag(flag, userId);
    
    // Log evaluation to analytics
    this.logEvaluation(flagKey, result.enabled, userId);
    
    return result.enabled;
  }

  /**
   * Get the variant value for a multivariate flag
   * Returns the variant value string, or the defaultValue if flag is not found/disabled
   */
  getVariant(flagKey: string, userId: string, defaultValue: string = ''): string {
    if (!this.initialized) {
      console.warn('FlagForge: SDK not initialized. Call init() first.');
      return defaultValue;
    }

    const flag = this.flags.get(flagKey);
    if (!flag) {
      console.warn(`FlagForge: Flag "${flagKey}" not found.`);
      return defaultValue;
    }

    const result = this.evaluateFlag(flag, userId);
    this.logEvaluation(flagKey, result.enabled, userId);

    if (!result.enabled || !result.variant) {
      return defaultValue;
    }

    return result.variant;
  }

  /**
   * Get detailed evaluation result including reason
   * Useful for debugging
   */
  evaluate(flagKey: string, userId: string): EvaluationResult {
    if (!this.initialized) {
      return { enabled: false, reason: 'SDK_NOT_INITIALIZED' };
    }

    const flag = this.flags.get(flagKey);
    
    if (!flag) {
      return { enabled: false, reason: 'FLAG_NOT_FOUND' };
    }

    return this.evaluateFlag(flag, userId);
  }

  /**
   * Manually refresh flags from the server
   */
  async refresh(): Promise<void> {
    try {
      const response = await this.fetchFlags();
      
      if (response.ok) {
        const flags: FlagData[] = await response.json();
        
        // Update local cache
        this.flags.clear();
        flags.forEach((flag) => {
          this.flags.set(flag.key, flag);
        });
        
        console.log(`FlagForge: Loaded ${flags.length} flags`);
        
        // Notify listeners of flag changes (for React integration)
        this.notifyListeners();
      } else {
        throw new Error(`Failed to fetch flags: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('FlagForge: Failed to refresh flags:', error);
      throw error;
    }
  }

  /**
   * Stop polling for flag updates
   */
  destroy(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = undefined;
    }
    this.initialized = false;
    this.flags.clear();
  }

  /**
   * Local flag evaluation using the same algorithm as the backend
   */
  private evaluateFlag(flag: FlagData, userId: string): EvaluationResult {
    // Step 1: Check global kill switch
    if (!flag.status) {
      return { enabled: false, reason: 'KILL_SWITCH' };
    }

    // Step 2: Check if user is blocked
    if (flag.targetingRules.blocked_users?.includes(userId)) {
      return { enabled: false, reason: 'BLOCKED_USER' };
    }

    // Step 3: Check whitelist
    if (flag.targetingRules.allowed_users?.includes(userId)) {
      return { enabled: true, reason: 'WHITELISTED' };
    }

    // Step 4: Percentage-based rollout
    const hashScore = this.hashUserFlag(userId, flag.key);
    
    if (hashScore < flag.rolloutPercentage) {
      // For multivariate flags, determine which variant the user gets
      let variant: string | undefined;
      if (flag.type === 'MULTIVARIATE' && flag.variants && flag.variants.length > 0) {
        variant = this.selectVariant(flag.variants, userId, flag.key);
      }

      return {
        enabled: true,
        reason: `PERCENTAGE_ROLLOUT (score: ${hashScore}, threshold: ${flag.rolloutPercentage})`,
        variant,
      };
    }

    // Return off variant for multivariate flags
    let offVariant: string | undefined;
    if (flag.type === 'MULTIVARIATE' && flag.offVariantId && flag.variants) {
      const off = flag.variants.find(v => v.id === flag.offVariantId);
      if (off) offVariant = off.value;
    }

    return {
      enabled: false,
      reason: `PERCENTAGE_EXCLUDED (score: ${hashScore}, threshold: ${flag.rolloutPercentage})`,
      variant: offVariant,
    };
  }

  /**
   * Select a variant for a user based on weighted distribution
   */
  private selectVariant(variants: Variant[], userId: string, flagKey: string): string {
    const hash = this.hashUserFlag(userId, flagKey + ':variant');
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += (variant.weight / totalWeight) * 100;
      if (hash < cumulative) {
        return variant.value;
      }
    }
    
    // Fallback to last variant
    return variants[variants.length - 1].value;
  }

  /**
   * Browser-compatible deterministic hash function
   * Returns a number between 0-99 for percentage-based rollout
   */
  private hashUserFlag(userId: string, flagKey: string): number {
    const seed = `${userId}:${flagKey}`;
    let hash = 0;
    
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Ensure positive and return 0-99
    return Math.abs(hash) % 100;
  }

  /**
   * Subscribe to flag changes (for React integration)
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.unsubscribe(listener);
  }

  /**
   * Unsubscribe from flag changes
   */
  unsubscribe(listener: () => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of flag changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Log flag evaluation to analytics backend
   */
  private logEvaluation(flagKey: string, result: boolean, userId: string): void {
    // Fire and forget - don't block flag evaluation on analytics
    const url = `${this.config.apiUrl}/api/v1/sdk/events`;
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
      },
      body: JSON.stringify({
        flagKey,
        result,
        userId,
        environment: 'Production',
      }),
    }).catch((error) => {
      // Silently fail analytics - don't impact user experience
      console.debug('FlagForge: Analytics logging failed:', error);
    });
  }

  /**
   * Fetch flags from the API
   */
  private async fetchFlags(): Promise<Response> {
    const url = `${this.config.apiUrl}/api/v1/sdk/flags`;
    
    return fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
      },
    });
  }

  /**
   * Start polling for flag updates
   */
  private startPolling(): void {
    this.pollingTimer = setInterval(() => {
      this.refresh().catch((error) => {
        console.error('FlagForge: Polling failed:', error);
      });
    }, this.config.pollingInterval);
  }
}

export default FlagForgeSDK;
