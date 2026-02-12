import { useState } from 'react';
import { LogIn, User, LogOut, X, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup';

export default function AuthButton() {
  const { isAuthenticated, user, login, signup, logout, error: authError } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);
    
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      setShowAuthModal(false);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: '#f5f5f0' }}>
          <User className="w-4 h-4" style={{ color: '#a67c52' }} strokeWidth={1.5} />
          <span className="text-sm font-medium" style={{ color: '#1a1512' }}>
            {user.name}
          </span>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 border"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            color: '#736a62'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#a67c52';
            e.currentTarget.style.color = '#a67c52';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.color = '#736a62';
          }}
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
        className="px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2"
        style={{
          backgroundColor: '#a67c52',
          color: '#ffffff'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#956b47';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#a67c52';
        }}
      >
        <LogIn className="w-4 h-4" strokeWidth={1.5} />
        Login
      </button>

      {/* Auth Modal (Login/Signup) */}
      {showAuthModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="rounded-2xl p-8 max-w-md w-full mx-4 relative"
            style={{
              backgroundColor: '#ffffff'
            }}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg transition-all"
              style={{ color: '#736a62' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1a1512' }}>
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm" style={{ color: '#736a62' }}>
                {authMode === 'login' 
                  ? 'Sign in to your FlagForge account' 
                  : 'Get started with FlagForge'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field - only for signup */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: '#e5e7eb',
                      color: '#1a1512'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#a67c52';
                      e.target.style.boxShadow = '0 0 0 3px rgba(166, 124, 82, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: '#e5e7eb',
                    color: '#1a1512'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#a67c52';
                    e.target.style.boxShadow = '0 0 0 3px rgba(166, 124, 82, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: '#e5e7eb',
                    color: '#1a1512'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#a67c52';
                    e.target.style.boxShadow = '0 0 0 3px rgba(166, 124, 82, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Error Alert */}
              {localError && (
                <div 
                  className="p-4 rounded-xl border flex items-start gap-3"
                  style={{
                    backgroundColor: '#fef2f2',
                    borderColor: '#fca5a5'
                  }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#b91c1c' }} strokeWidth={1.5} />
                  <p className="text-sm" style={{ color: '#991b1b' }}>
                    {localError}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: isSubmitting ? '#d4af8e' : '#a67c52',
                  color: '#ffffff',
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#956b47';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#a67c52';
                  }
                }}
              >
                {authMode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" strokeWidth={1.5} />
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" strokeWidth={1.5} />
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

            {/* Toggle between login and signup */}
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: '#736a62' }}>
                {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                {' '}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="font-semibold transition-colors"
                  style={{ color: '#a67c52' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#956b47';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#a67c52';
                  }}
                >
                  {authMode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
