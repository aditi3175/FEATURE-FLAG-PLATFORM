import { useState } from 'react';
import { createPortal } from 'react-dom';
import { LogIn, User, LogOut, X, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup';

interface AuthButtonProps {
  className?: string;
  children?: React.ReactNode;
  mode?: 'login' | 'signup';
}

export default function AuthButton({ className, children, mode = 'login' }: AuthButtonProps) {
  const { isAuthenticated, user, login, signup, logout, error: authError } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(mode);
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

  // Use props if provided, otherwise default logic
  const handleClick = () => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  if (isAuthenticated && user) {
    // If custom children provided (like in Hero), we might still want to redirect to dashboard
    // instead of showing logout.
    if (children) {
        return (
            <a href="/app/dashboard" className={className}>
                {children}
            </a>
        );
    }
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700">
          <User className="w-4 h-4 text-purple-400" strokeWidth={2} />
          <span className="text-sm font-medium text-white">
            {user.name}
          </span>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 border border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:border-purple-500/50 hover:text-white"
        >
          <LogOut className="w-4 h-4" strokeWidth={2} />
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={className || "px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105"}
      >
        {children || (
            <>
                <LogIn className="w-4 h-4" strokeWidth={2} />
                Login
            </>
        )}
      </button>

      {/* Auth Modal (Login/Signup) */}
      {showAuthModal && createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl p-8 max-w-md w-full mx-4 relative border border-slate-700/50 bg-slate-800/90 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg transition-all text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-white">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-slate-400">
                {authMode === 'login' 
                  ? 'Sign in to your FlagForge account' 
                  : 'Get started with FlagForge'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field - only for signup */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Error Alert */}
              {localError && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" strokeWidth={2} />
                  <p className="text-sm text-red-300">
                    {localError}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
                }`}
              >
                {authMode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" strokeWidth={2} />
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" strokeWidth={2} />
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

            {/* Toggle between login and signup */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                {' '}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {authMode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
