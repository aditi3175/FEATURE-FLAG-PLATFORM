import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  sparklineData?: number[];
}

export default function StatCard({ title, value, icon: Icon, trend, trendUp, sparklineData }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="bento-surface inner-glow rounded-lg p-4 hover:border-white/10 transition-all group"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-md bg-white/[0.03] border border-white/5">
          <Icon className="w-3.5 h-3.5 text-[#f59e0b]" strokeWidth={2} />
        </div>

        {trend && (
          <div className={`text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>

      {/* Label */}
      <div className="text-xs text-gray-500 mb-1 font-medium tracking-tight">
        {title}
      </div>

      {/* Value */}
      <div className="text-2xl font-semibold text-white tracking-tight mb-2">
        {value}
      </div>

      {/* Sparkline (if data provided) */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="h-8 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-end justify-between h-full gap-0.5">
            {sparklineData.map((val, idx) => {
              const max = Math.max(...sparklineData);
              const height = (val / max) * 100;
              return (
                <div
                  key={idx}
                  className="flex-1 accent-gold rounded-sm opacity-50"
                  style={{ height: `${height}%`, minHeight: '2px' }}
                />
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
