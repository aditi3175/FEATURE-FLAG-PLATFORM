import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import CommandBar from './CommandBar';
import { useAuth } from '../context/AuthContext';
import AuthButton from './AuthButton';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Command Bar - Global */}
      <CommandBar />
      
      {/* Sidebar - Collapsed Rail */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Minimal */}
        <div className="h-12 border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xs text-gray-500 font-medium tracking-wide">FLAGFORGE</h2>
            <div className="text-xs text-gray-600 px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono">
              ⌘K to search
            </div>
          </div>
          
          {/* User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bento-surface">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-medium text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-white font-medium">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <AuthButton />
            )}
          </div>
        </div>

        {/* Main Content - 12 Column Grid */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
