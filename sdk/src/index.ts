import * as crypto from 'crypto';

export interface FlagForgeConfig {
  apiKey: string;
  apiUrl?: string;
  pollingInterval?: number; // milliseconds, default: 60000 (1 minute)
}

export interface FlagData {
  key: string;
  status: boolean;
  rolloutPercentage: number;
  targetingRules: {
    allowed_users?: string[];
    blocked_users?: string[];
  };
}

export interface EvaluationResult {
  enabled: boolean;
  reason: string;
}

/**
 * FlagForge SDK for feature flag evaluation
 * 
 * @example
 * ```typescript
 * const sdk = new FlagForgeSDK({
 *   apiKey: 'your-project-api-key',
 *   apiUrl: 'https://api.flagforge.com', // optional
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
    return result.enabled;
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
      return {
        enabled: true,
        reason: `PERCENTAGE_ROLLOUT (score: ${hashScore}, threshold: ${flag.rolloutPercentage})`,
      };
    }

    return {
      enabled: false,
      reason: `PERCENTAGE_EXCLUDED (score: ${hashScore}, threshold: ${flag.rolloutPercentage})`,
    };
  }

  /**
   * Deterministic hash function (MD5-based)
   * Same algorithm as backend to ensure consistency
   */
  private hashUserFlag(userId: string, flagKey: string): number {
    const seed = `${userId}:${flagKey}`;
    const hash = crypto.createHash('md5').update(seed).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16);
    return hashValue % 100;
  }

  /**
   * Fetch flags from the API
   */
  private async fetchFlags(): Promise<Response> {
    const url = `${this.config.apiUrl}/api/flags`;
    
    // In a real implementation, you'd pass the project filter via API key lookup
    // For now, we'll fetch all flags and let the server filter by project via query param
    return fetch(url, {
      headers: {
        'Content-Type': 'application/json',
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
