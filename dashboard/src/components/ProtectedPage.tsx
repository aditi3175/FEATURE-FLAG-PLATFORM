import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl p-12 text-center max-w-md border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-purple-500/20 border border-purple-500/30">
            <LogIn className="w-8 h-8 text-purple-400" strokeWidth={2} />
          </div>
          
          <h2 className="text-2xl font-semibold mb-3 text-white tracking-tight">
            Login to your account
          </h2>
          
          <p className="text-sm mb-6 text-slate-400">
            Please sign in to access this page and view your data
          </p>

          <p className="text-xs text-slate-500">
            Click the <strong className="text-purple-400">Login</strong> button in the top right corner to continue
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
