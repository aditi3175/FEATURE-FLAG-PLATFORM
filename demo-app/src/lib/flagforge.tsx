import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

// Types
export interface Flag {
  key: string;
  status: boolean;
  rolloutPercentage: number;
  targetingRules: Record<string, any>; // JSONB from backend
}

interface FlagForgeContextType {
  flags: Record<string, boolean>; // Pre-evaluated flags
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  userId: string;
  setUserId: (id: string) => void;
  apiKey: string;
}

// Context
const FlagForgeContext = createContext<FlagForgeContextType | undefined>(undefined);

// Provider Props
interface FlagForgeProviderProps {
  apiKey: string;
  initialUserId?: string;
  apiBaseUrl?: string; // For flexibility
  children: ReactNode;
}

// murmur3-like hashing for rollout (simplified for demo)
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Evaluate a single flag locally
function evaluateFlag(flag: Flag, userId: string): boolean {
  // 1. Global Kill Switch
  if (!flag.status) return false;

  // 2. Targeting Rules (Simplified: specific users)
  if (flag.targetingRules?.allowedUsers) {
    const allowedUsers = flag.targetingRules.allowedUsers as string[];
    if (allowedUsers.includes(userId)) return true;
  }
  
  // 3. Percentage Rollout
  if (flag.rolloutPercentage === 100) return true;
  if (flag.rolloutPercentage === 0) return false;
  
  // Consistent hashing: hash(userId + flagKey) % 100
  const hash = simpleHash(`${userId}:${flag.key}`);
  const normalized = hash % 100;
  
  return normalized < flag.rolloutPercentage;
}

export function FlagForgeProvider({ 
  apiKey, 
  initialUserId = 'user-' + Math.random().toString(36).substring(7),
  apiBaseUrl = 'http://localhost:4000/api/v1/sdk', // Updated port to 4000
  environment = 'Production',
  children 
}: FlagForgeProviderProps & { environment?: string }) { // Add prop to type
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [rawFlags, setRawFlags] = useState<Flag[]>([]); // Store raw flags for re-evaluation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState(initialUserId);

  // Fetch flags from backend
  const fetchFlags = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${apiBaseUrl}/flags?environment=${environment}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch flags: ${response.statusText}`);
      }

      const data = await response.json();
      // data format: { projectId, projectName, flags: Flag[] }
      
      if (data.flags) {
        setRawFlags(data.flags);
      }
    } catch (err) {
      console.error('FlagForge Error:', err);
      // Don't break the app, just use defaults (false)
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchFlags();
  }, [apiKey]);

  // Re-evaluate when userId or rawFlags change
  useEffect(() => {
    if (rawFlags.length > 0) {
      const evaluated: Record<string, boolean> = {};
      rawFlags.forEach(flag => {
        const res = evaluateFlag(flag, userId);
        evaluated[flag.key] = res;
        
        // Fire and forget analytics event
        fetch(`${apiBaseUrl}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            flagKey: flag.key,
            result: res,
            userId: userId,
            environment: (window as any).__FLAGFORGE_ENV__ || 'Production' // simplistic env passing
          })
        }).catch(e => console.error('Analytics failed', e));
      });
      setFlags(evaluated);
    }
  }, [userId, rawFlags]);

  return (
    <FlagForgeContext.Provider value={{ 
      flags, 
      loading, 
      error, 
      refresh: fetchFlags,
      userId,
      setUserId,
      apiKey
    }}>
      {children}
    </FlagForgeContext.Provider>
  );
}

// Hook
export function useFlag(key: string, defaultValue: boolean = false): boolean {
  const context = useContext(FlagForgeContext);
  if (!context) {
    console.warn('useFlag must be used within a FlagForgeProvider');
    return defaultValue;
  }
  
  // If loading, returning defaultValue prevents flickering if we want safe defaults
  // Or we could expose loading state. For simplicity, return default if not found.
  return context.flags[key] ?? defaultValue;
}

// Hook to access the full context (for debug panel)
export function useFlagForge() {
  const context = useContext(FlagForgeContext);
  if (!context) {
    throw new Error('useFlagForge must be used within a FlagForgeProvider');
  }
  return context;
}
