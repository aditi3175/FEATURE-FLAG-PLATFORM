import React, { useState, useEffect } from 'react';
import {  
  Activity, 
  BarChart, 
  Clock, 
  Users, 
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import GlowingDot from '../components/GlowingDot';
import { ProjectAPI, TokenService } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface AnalyticsData {
  metrics: {
    total: number;
    activeFlags: number;
    successRate: string;
    avgLatency: number;
  };
  trendData: { label: string; value: number }[];
  topFlags: { name: string; count: number; percent: number }[];
  envDist: { name: string; count: number; color: string; width: number }[];
}

const Analytics = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [dateRange, setDateRange] = useState('7d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await ProjectAPI.getProjects();
      setProjects(data);
      if (data.length > 0) {
        const saved = localStorage.getItem('selectedProjectId');
        const match = saved && data.find((p: any) => p.id === saved);
        setSelectedProjectId(match ? saved : data[0].id);
      } else setLoading(false);
    } catch (err) {
      console.error('Failed to fetch projects', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) fetchAnalytics();
  }, [selectedProjectId, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${selectedProjectId}/analytics?period=${dateRange}`, {
        headers: { ...TokenService.getAuthHeader() }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xs text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-2">Analytics Dashboard</h2>
        <p className="text-xs text-gray-500">Create a project to start tracking analytics</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Analytics</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded">
              <GlowingDot active={true} size="sm" />
              <span className="text-xs font-medium text-emerald-400">Live</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">Real-time feature flag metrics • Auto-refresh every 10s</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={selectedProjectId}
            onChange={(e) => { setSelectedProjectId(e.target.value); localStorage.setItem('selectedProjectId', e.target.value); }}
            className="px-3 py-2 rounded-lg bento-surface text-xs text-white focus:outline-none focus:border-white/10"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-lg bento-surface text-xs text-white focus:outline-none focus:border-white/10"
          >
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>
        </div>
      </div>

      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Evaluations" 
              value={data.metrics.total.toLocaleString()} 
              icon={Activity} 
              trend="+12.5%" 
              trendUp={true}
            />
            <MetricCard 
              title="Active Flags" 
              value={data.metrics.activeFlags} 
              icon={BarChart} 
              trend="—" 
              trendUp={false}
            />
            <MetricCard 
              title="Latency" 
              value={`${data.metrics.avgLatency}ms`} 
              icon={Clock} 
              trend="-2ms" 
              trendUp={true}
            />
            <MetricCard 
              title="Success Rate" 
              value={data.metrics.successRate} 
              icon={Users} 
              trend="-0.1%" 
              trendUp={false}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Area Chart */}
            <div className="lg:col-span-2 bento-surface inner-glow rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <BarChart className="w-4 h-4 text-[#f59e0b]" strokeWidth={2} />
                Evaluation Volume
              </h3>
              <div className="h-64">
                {data.trendData && data.trendData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trendData}>
                      <defs>
                        <linearGradient id="goldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#d97706" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bento-surface rounded-lg px-3 py-2 border border-white/10">
                                <div className="text-xs text-gray-500">{payload[0].payload.label}</div>
                                <div className="text-sm font-medium text-white">{payload[0].value}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fill="url(#goldAreaGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-4">
              {/* Top Flags */}
              <div className="bento-surface inner-glow rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">Top Flags</h3>
                <div className="space-y-3">
                  {data.topFlags.map((flag, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white font-mono">{flag.name}</span>
                        <span className="text-gray-500">{flag.count}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full accent-gold" 
                          style={{ width: `${flag.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {data.topFlags.length === 0 && (
                    <p className="text-xs text-gray-600">No data</p>
                  )}
                </div>
              </div>

              {/* Environment Dist */}
              <div className="bento-surface inner-glow rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">Environment Traffic</h3>
                <div className="flex h-2 rounded-full overflow-hidden mb-3">
                  {data.envDist.map((env, i) => (
                    <div 
                      key={i}
                      className="h-full" 
                      style={{ width: `${env.width}%`, backgroundColor: env.color }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {data.envDist.map((env, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: env.color }} />
                      <span className="text-xs text-gray-400">{env.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

const MetricCard = ({ title, value, icon: Icon, trend, trendUp }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bento-surface inner-glow rounded-xl p-4"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="p-2 rounded-md bg-white/[0.03] border border-white/5">
        <Icon className="w-3.5 h-3.5 text-[#f59e0b]" strokeWidth={2} />
      </div>
      <div className={`flex items-center text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-gray-500'}`}>
        {trendUp ? <TrendingUp className="w-3 h-3 mr-0.5" strokeWidth={2} /> : <TrendingDown className="w-3 h-3 mr-0.5" strokeWidth={2} />}
        {trend}
      </div>
    </div>
    <div className="text-xs text-gray-500 mb-1">{title}</div>
    <div className="text-2xl font-semibold text-white tracking-tight">{value}</div>
  </motion.div>
);

export default Analytics;
