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
        } catch (err) {
          // Token invalid, clear it
          TokenService.removeToken();
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
