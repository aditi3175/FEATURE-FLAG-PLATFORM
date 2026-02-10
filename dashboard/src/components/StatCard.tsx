import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
}

export default function StatCard({ title, value, icon: Icon, subtitle }: StatCardProps) {
  return (
    <div 
      className="rounded-xl p-6 shadow-sm border transition-shadow duration-300 hover:shadow-md"
      style={{ 
        backgroundColor: '#ffffff',
        borderColor: '#f3f4f6'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p 
            className="text-sm font-medium mb-1 uppercase"
            style={{ 
              color: '#736a62',
              letterSpacing: '0.02em'
            }}
          >
            {title}
          </p>
          <h3 
            className="text-3xl font-semibold"
            style={{ color: '#1a1512' }}
          >
            {value}
          </h3>
        </div>
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: '#f5f5f0' }}
        >
          <Icon 
            className="w-6 h-6" 
            strokeWidth={1.5}
            style={{ color: '#a67c52' }}
          />
        </div>
      </div>
      {subtitle && (
        <p className="text-sm" style={{ color: '#736a62' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
