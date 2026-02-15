import React from 'react';

interface GlowingDotProps {
  active: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GlowingDot: React.FC<GlowingDotProps> = ({ 
  active, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  return (
    <div 
      className={`rounded-full ${sizeClasses[size]} ${className} ${
        active ? 'bg-emerald-500 status-dot-active' : 'bg-gray-600 status-dot-inactive'
      }`}
      style={{
        boxShadow: active 
          ? '0 0 8px rgba(34, 197, 94, 0.5), 0 0 16px rgba(34, 197, 94, 0.3)'
          : '0 0 4px rgba(100, 100, 100, 0.2)'
      }}
    />
  );
};

export default GlowingDot;
