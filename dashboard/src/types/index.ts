export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
  userId: string;
}

export type FlagType = 'BOOLEAN' | 'MULTIVARIATE';

export interface Variant {
  id: string;
  name: string;
  value: any;
  rolloutPercentage: number;
}

export interface TargetingRule {
  allowed_users?: string[];
  blocked_users?: string[];
}

export interface Flag {
  id: string;
  projectId: string;
  key: string;
  description: string;
  type: FlagType;
  status: boolean;
  rolloutPercentage: number;
  environment: string;
  targetingRules: TargetingRule;
  variants: Variant[];
  defaultVariantId?: string;
  offVariantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
