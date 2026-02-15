import { NavLink, useLocation } from 'react-router-dom';
import { Flag, BarChart, Settings, Code, LayoutGrid } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: LayoutGrid, label: 'Projects', path: '/app/dashboard' },
    { icon: BarChart, label: 'Analytics', path: '/app/analytics' },
    { icon: Code, label: 'SDK', path: '/app/sdk' },
    { icon: Settings, label: 'Settings', path: '/app/settings' },
  ];

  return (
    <div
      className="h-full border-r border-white/5 bg-[#0a0a0a] transition-all duration-200 relative group"
      style={{ width: isExpanded ? '200px' : '60px' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Section */}
      <div className="h-12 flex items-center justify-center border-b border-white/5">
        <div className="w-8 h-8 rounded-lg accent-gold flex items-center justify-center">
          <Flag className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-4 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all relative
                ${isActive 
                  ? 'bg-white/5 text-white' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                }
              `}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 w-0.5 h-5 accent-gold rounded-r" />
              )}

              {/* Icon */}
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />

              {/* Label - Only visible when expanded */}
              {isExpanded && (
                <span className="text-xs font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status - Bottom */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <div className="bento-surface rounded-lg p-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-dot-active" />
            {isExpanded && (
              <span className="text-xs text-gray-400">All systems operational</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
