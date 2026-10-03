import { hashUserFlag } from './hash';

export interface FlagForgeConfig {
  apiKey: string;
  apiUrl?: string;
  pollingInterval?: number; // milliseconds, default: 60000 (1 minute)
}

export interface Variant {
  id: string;
  name?: string;
  value: string;
  weight?: number;
  rolloutPercentage?: number;
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
  private pollingTimer?: ReturnType<typeof setInterval>;
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
   * Local flag evaluation. Follows exactly the same rules as the server's
   * evaluateFlag() and uses the same shared hash, so a user gets the same
   * result whether a flag is evaluated here, in the Node SDK, or on the server.
   */
  private evaluateFlag(flag: FlagData, userId: string): EvaluationResult {
    const variantValue = (id?: string) => flag.variants?.find(v => v.id === id)?.value;

    // Step 1: Global kill switch
    if (!flag.status) {
      return { enabled: false, reason: 'KILL_SWITCH', variant: variantValue(flag.offVariantId) };
    }

    // Step 2: Blocked users
    if (flag.targetingRules?.blocked_users?.includes(userId)) {
      return { enabled: false, reason: 'BLOCKED_USER', variant: variantValue(flag.offVariantId) };
    }

    // Step 3: Allowed users
    if (flag.targetingRules?.allowed_users?.includes(userId)) {
      return { enabled: true, reason: 'WHITELISTED', variant: variantValue(flag.defaultVariantId) };
    }

    // Step 4: Percentage rollout using the shared deterministic hash
    const score = hashUserFlag(userId, flag.key);

    // 4a. Boolean flags
    if (flag.type === 'BOOLEAN' || !flag.variants?.length) {
      const enabled = score < flag.rolloutPercentage;
      return { enabled, reason: enabled ? 'ROLLOUT_MATCH' : 'ROLLOUT_MISS' };
    }

    // 4b. Multivariate flags: each variant owns a slice of the 0-99 range
    let cumulative = 0;
    for (const variant of flag.variants) {
      cumulative += variant.rolloutPercentage ?? 0;
      if (score < cumulative) {
        return { enabled: true, reason: 'VARIANT_MATCH', variant: variant.value };
      }
    }

    // Fallback if variant percentages don't add up to 100
    const fallback = flag.variants.find(v => v.id === flag.defaultVariantId) ?? flag.variants[0];
    return { enabled: true, reason: 'FALLBACK', variant: fallback.value };
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
