import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div 
          className="rounded-2xl p-12 text-center max-w-md"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#f3f4f6'
          }}
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#f5f5f0' }}
          >
            <LogIn className="w-8 h-8" style={{ color: '#a67c52' }} strokeWidth={1.5} />
          </div>
          
          <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1a1512', letterSpacing: '-0.02em' }}>
            Login to your account
          </h2>
          
          <p className="text-sm mb-6" style={{ color: '#736a62', letterSpacing: '0.02em' }}>
            Please sign in to access this page and view your data
          </p>

          <p className="text-xs" style={{ color: '#736a62' }}>
            Click the <strong style={{ color: '#a67c52' }}>Login</strong> button in the top right corner to continue
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
