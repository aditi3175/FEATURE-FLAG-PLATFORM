import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AuthAPI, TokenService } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string } | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-login on mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const token = TokenService.getToken();
      
      if (token) {
        try {
          const userData = await AuthAPI.getCurrentUser();
          setUser({ id: userData.id, name: userData.name, email: userData.email });
          setIsAuthenticated(true);
        } catch (err: any) {
          // Only clear token on auth errors (401/403), not on network/server errors
          if (err.message === 'Failed to get user data') {
            // Could be 401 (invalid token) or server error
            // Try to decode the token to preserve session during cold starts
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              // Check if token is expired
              if (payload.exp && payload.exp * 1000 > Date.now()) {
                // Token is still valid, server might just be cold-starting
                setUser({ id: payload.userId, name: payload.email?.split('@')[0] || 'User', email: payload.email });
                setIsAuthenticated(true);
              } else {
                // Token is actually expired
                TokenService.removeToken();
              }
            } catch {
              TokenService.removeToken();
            }
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await AuthAPI.login(email, password);
      
      TokenService.setToken(response.token);
      setUser({ id: response.user.id, name: response.user.name, email: response.user.email });
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await AuthAPI.signup(name, email, password);
      
      TokenService.setToken(response.token);
      setUser({ id: response.user.id, name: response.user.name, email: response.user.email });
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    TokenService.removeToken();
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
