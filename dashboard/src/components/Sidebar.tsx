import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Code2, 
  Settings,
  Coffee
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Projects' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/sdk', icon: Code2, label: 'SDK' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside 
      className="w-64 h-screen flex flex-col sticky top-0"
      style={{ backgroundColor: '#2c2420' }}
    >
      {/* Logo */}
      <div 
        className="p-6"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#a67c52' }}
          >
            <Coffee className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white" style={{ letterSpacing: '0.02em' }}>
              FlagForge
            </h1>
            <p className="text-xs" style={{ color: '#736a62' }}>
              Feature Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: isActive ? '#a67c52' : 'transparent',
                color: isActive ? '#ffffff' : '#736a62',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#736a62';
                }
              }}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-medium" style={{ letterSpacing: '0.02em' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div 
        className="p-4"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <div 
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        >
          <div className="relative flex h-2.5 w-2.5">
            <span 
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ 
                backgroundColor: '#fbbf24',
                filter: 'sepia(0.5)'
              }}
            />
            <span 
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: '#f59e0b' }}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-white" style={{ letterSpacing: '0.02em' }}>
              System Operational
            </p>
            <p className="text-xs" style={{ color: '#736a62' }}>
              All services running
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
