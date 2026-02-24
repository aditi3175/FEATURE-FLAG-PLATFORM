
import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';

export interface FlagForgeConfig {
  apiKey: string;
  apiUrl?: string;
  refreshInterval?: number; // ms, default 60000
}

export interface Flag {
  key: string;
  type: 'BOOLEAN' | 'MULTIVARIATE';
  status: boolean;
  rolloutPercentage: number;
  targetingRules: {
    allowed_users?: string[];
    blocked_users?: string[];
  };
  variants?: Array<{
    id: string;
    value: any;
    name: string;
    rolloutPercentage: number;
  }>;
  defaultVariantId?: string | null;
  offVariantId?: string | null;
}

export interface EvaluationResult {
  enabled: boolean;
  value: any;
  variantId?: string | null;
  reason: string;
}

export class FlagForgeClient extends EventEmitter {
  private config: FlagForgeConfig;
  private client: AxiosInstance;
  private flags: Map<string, Flag>;
  private timer?: NodeJS.Timeout;

  constructor(config: FlagForgeConfig) {
    super();
    this.config = {
      apiUrl: 'http://localhost:4000',
      refreshInterval: 60000,
      ...config
    };
    this.flags = new Map();
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: { 'x-api-key': this.config.apiKey }
    });
  }

  async init(): Promise<void> {
    await this.refreshFlags();
    if (this.config.refreshInterval && this.config.refreshInterval > 0) {
      this.timer = setInterval(() => this.refreshFlags(), this.config.refreshInterval);
    }
  }

  private async refreshFlags() {
    try {
      const response = await this.client.get('/api/v1/sdk/flags');
      const flagsList: Flag[] = response.data;
      
      this.flags.clear();
      flagsList.forEach(flag => this.flags.set(flag.key, flag));
      this.emit('update');
    } catch (error) {
      console.error('FlagForge SDK: Failed to refresh flags', error);
      this.emit('error', error);
    }
  }

  getVariant(flagKey: string, userId: string, defaultValue: any = null): EvaluationResult {
    const flag = this.flags.get(flagKey);

    if (!flag) {
      return { enabled: false, value: defaultValue, reason: 'FLAG_NOT_FOUND' };
    }

    // 1. Kill Switch
    if (!flag.status) {
       return this.getOffVariant(flag, 'KILL_SWITCH', defaultValue);
    }

    // 2. Targeting Rules
    if (flag.targetingRules?.blocked_users?.includes(userId)) {
      return this.getOffVariant(flag, 'BLOCKED_USER', defaultValue);
    }
    if (flag.targetingRules?.allowed_users?.includes(userId)) {
       return this.getDefaultVariant(flag, 'WHITELISTED', defaultValue);
    }

    // 3. Rollout
    const hashVal = this.hash(userId, flagKey);
    
    // Boolean Logic
    if (flag.type === 'BOOLEAN' || !flag.variants?.length) {
      if (hashVal < flag.rolloutPercentage) {
        return { enabled: true, value: true, reason: 'ROLLOUT_MATCH' };
      }
      return { enabled: false, value: false, reason: 'ROLLOUT_MISS' };
    }

    // Multivariate Logic
    let cumulative = 0;
    if (flag.variants) {
        for (const variant of flag.variants) {
        cumulative += variant.rolloutPercentage;
        if (hashVal < cumulative) {
            return {
            enabled: true,
            value: variant.value,
            variantId: variant.id,
            reason: 'VARIANT_MATCH'
            };
        }
        }
    }

    return this.getDefaultVariant(flag, 'FALLBACK', defaultValue);
  }

  // Helpers
  private getOffVariant(flag: Flag, reason: string, defaultValue: any): EvaluationResult {
    const variant = flag.variants?.find(v => v.id === flag.offVariantId);
    return {
      enabled: false,
      value: variant ? variant.value : (flag.type === 'BOOLEAN' ? false : defaultValue),
      variantId: variant?.id,
      reason
    };
  }

  private getDefaultVariant(flag: Flag, reason: string, defaultValue: any): EvaluationResult {
    const variant = flag.variants?.find(v => v.id === flag.defaultVariantId);
     return {
      enabled: true,
      value: variant ? variant.value : (flag.type === 'BOOLEAN' ? true : defaultValue),
      variantId: variant?.id,
      reason
    };
  }

  private hash(userId: string, key: string): number {
    const seed = `${userId}:${key}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // overflow
    }
    return Math.abs(hash) % 100;
  }

  close() {
    if (this.timer) clearInterval(this.timer);
  }
}
