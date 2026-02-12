import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import FlagForgeSDK from './index';

/**
 * FlagForge React Context
 */
interface FlagForgeContextValue {
  sdk: FlagForgeSDK | null;
  loading: boolean;
  error: Error | null;
}

const FlagForgeContext = createContext<FlagForgeContextValue | undefined>(undefined);

/**
 * Props for FlagForgeProvider
 */
export interface FlagForgeProviderProps {
  apiKey: string;
  apiUrl?: string;
  pollingInterval?: number;
  children: ReactNode;
}

/**
 * FlagForge Provider Component
 * 
 * Wraps your app and initializes the SDK with the provided API key.
 * Manages loading and error states automatically.
 * 
 * @example
 * ```tsx
 * <FlagForgeProvider apiKey="ff_prod_...">
 *   <App />
 * </FlagForgeProvider>
 * ```
 */
export function FlagForgeProvider({ 
  apiKey, 
  apiUrl = 'http://localhost:4000',
  pollingInterval = 60000,
  children 
}: FlagForgeProviderProps) {
  const [sdk, setSdk] = useState<FlagForgeSDK | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const sdkRef = useRef<FlagForgeSDK | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeSDK() {
      try {
        setLoading(true);
        setError(null);

        // Create new SDK instance
        const newSdk = new FlagForgeSDK({
          apiKey,
          apiUrl,
          pollingInterval,
        });

        // Initialize and fetch flags
        await newSdk.init();

        if (mounted) {
          sdkRef.current = newSdk;
          setSdk(newSdk);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize SDK'));
          setLoading(false);
        }
      }
    }

    initializeSDK();

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (sdkRef.current) {
        sdkRef.current.destroy();
        sdkRef.current = null;
      }
    };
  }, [apiKey, apiUrl, pollingInterval]);

  return (
    <FlagForgeContext.Provider value={{ sdk, loading, error }}>
      {children}
    </FlagForgeContext.Provider>
  );
}

/**
 * Hook to access the FlagForge SDK instance
 * 
 * @throws Error if used outside FlagForgeProvider
 */
function useFlagForgeContext(): FlagForgeContextValue {
  const context = useContext(FlagForgeContext);
  
  if (context === undefined) {
    throw new Error('useFlagForgeContext must be used within a FlagForgeProvider');
  }
  
  return context;
}

/**
 * Hook to check if a feature flag is enabled
 * 
 * Automatically triggers a re-render when the flag value changes during polling.
 * 
 * @param flagKey - The key of the feature flag
 * @param userId - The user identifier for targeted rollouts
 * @returns The current state of the flag (enabled/disabled)
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isNewFeatureEnabled = useFlag('new-feature', 'user-123');
 *   
 *   return (
 *     <div>
 *       {isNewFeatureEnabled && <NewFeature />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFlag(flagKey: string, userId: string): boolean {
  const { sdk, loading } = useFlagForgeContext();
  const [flagValue, setFlagValue] = useState<boolean>(false);

  useEffect(() => {
    if (!sdk || loading) {
      setFlagValue(false);
      return;
    }

    // Get initial value
    const initialValue = sdk.isEnabled(flagKey, userId);
    setFlagValue(initialValue);

    // Subscribe to flag changes
    const unsubscribe = sdk.subscribe(() => {
      const newValue = sdk.isEnabled(flagKey, userId);
      setFlagValue(newValue);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [sdk, loading, flagKey, userId]);

  return flagValue;
}

/**
 * Hook to check if FlagForge is still loading
 * 
 * @example
 * ```tsx
 * function App() {
 *   const isLoading = useFlagForgeLoading();
 *   
 *   if (isLoading) {
 *     return <LoadingSpinner />;
 *   }
 *   
 *   return <YourApp />;
 * }
 * ```
 */
export function useFlagForgeLoading(): boolean {
  const { loading } = useFlagForgeContext();
  return loading;
}

/**
 * Hook to access any SDK error
 * 
 * @example
 * ```tsx
 * function App() {
 *   const error = useFlagForgeError();
 *   
 *   if (error) {
 *     return <ErrorMessage error={error} />;
 *   }
 *   
 *   return <YourApp />;
 * }
 * ```
 */
export function useFlagForgeError(): Error | null {
  const { error } = useFlagForgeContext();
  return error;
}

export default FlagForgeProvider;
