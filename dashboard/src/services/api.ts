const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  token: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Token management
export const TokenService = {
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  removeToken(): void {
    localStorage.removeItem('auth_token');
  },

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Auth API
export const AuthAPI = {
  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    return response.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        ...TokenService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user data');
    }

    const data = await response.json();
    return data.user;
  },
};

// Project API
export const ProjectAPI = {
  async createProject(name: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...TokenService.getAuthHeader(),
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create project');
    }

    return response.json();
  },

  async getProjects(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: {
        ...TokenService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    return response.json();
  },

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: { ...TokenService.getAuthHeader() },
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
  },

  async deleteAllProjects(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'DELETE',
      headers: { ...TokenService.getAuthHeader() },
    });

    if (!response.ok) {
      throw new Error('Failed to delete all projects');
    }
  },

  async getProject(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      headers: { ...TokenService.getAuthHeader() },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }

    return response.json();
  },

  async updateProject(id: string, name: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...TokenService.getAuthHeader(),
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update project');
    }

    return response.json();
  },
};

// Flag API
export const FlagAPI = {
  async getFlags(projectId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/flags`, {
      headers: { ...TokenService.getAuthHeader() },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch flags');
    }

    return response.json();
  },

  async createFlag(projectId: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/flags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...TokenService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create flag');
    }

    return response.json();
  },

  async updateFlag(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/flags/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...TokenService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update flag');
    }

    return response.json();
  },

  async deleteFlag(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/flags/${id}`, {
      method: 'DELETE',
      headers: { ...TokenService.getAuthHeader() },
    });

    if (!response.ok) {
      throw new Error('Failed to delete flag');
    }
  },
};

// Analytics API
export const AnalyticsAPI = {
  async getStats(): Promise<any> {
    // Check if user is logged in before fetching
    const token = TokenService.getToken();
    if (!token) return { totalEvaluations: 0, recentEvaluations: 0, evaluationsByEnvironment: {}, avgResponseTime: null };

    const response = await fetch(`${API_BASE_URL}/api/analytics/stats`, {
      headers: { ...TokenService.getAuthHeader() },
    });

    if (!response.ok) {
      // If endpoint doesn't exist yet or fails, return empty stats
      console.warn('Analytics endpoint failed, using default stats');
      return { totalEvaluations: 0, recentEvaluations: 0, evaluationsByEnvironment: {}, avgResponseTime: null };
    }

    return response.json();
  },
};
