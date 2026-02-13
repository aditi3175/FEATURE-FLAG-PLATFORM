import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart, 
  Clock, 
  Filter, 
  Users, 
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { ProjectAPI, FlagAPI, TokenService } from '../services/api';

const API_BASE_URL = 'http://localhost:4000';

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
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Projects on Mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await ProjectAPI.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
      setLoading(false);
    }
  };

  // 2. Fetch Analytics when Project or Date Range changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchAnalytics();
    }
  }, [selectedProjectId, dateRange]);

  // 3. Auto-refresh polling - fetch new data every 10 seconds
  useEffect(() => {
    if (!selectedProjectId) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [selectedProjectId, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${selectedProjectId}/analytics?period=${dateRange}`, {
        headers: {
          ...TokenService.getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-stone-100 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-stone-100 rounded-xl"></div>
      </div>
    );
  }

  // Empty State: No Projects
  if (projects.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-[#2c2420] mb-2">Analytics Dashboard</h2>
        <p className="text-[#5e4b35]">Create a project to start tracking analytics.</p>
      </div>
    );
  }

  // Empty State: No Data
  if (data && data.metrics.total === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2c2420] mb-2">Analytics Dashboard</h1>
            <p className="text-[#5e4b35]">Real-time insights into your feature flag usage.</p>
          </div>
          <div className="flex gap-4">
             <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[#e8dccb] bg-[#f5f5f0] text-[#2c2420] focus:ring-2 focus:ring-[#a67c52] outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-[#f5f5f0] border border-[#e8dccb] rounded-2xl p-12 text-center">
          <div className="bg-[#e8dccb] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="w-8 h-8 text-[#a67c52]" />
          </div>
          <h3 className="text-xl font-bold text-[#2c2420] mb-2">No Data Received Yet</h3>
          <p className="text-[#5e4b35] max-w-md mx-auto mb-6">
            We haven't detected any flag evaluations for this project yet. Integrate the SDK and trigger your first flag to see real-time analytics.
          </p>
          <div className="bg-white/50 inline-block px-4 py-2 rounded-lg text-sm text-[#8c6b4a]">
            SDK connected? Check your API key in Project Details.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#2c2420] mb-2">Analytics Dashboard</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          </div>
          <p className="text-[#5e4b35]">Real-time insights into your feature flag usage. Auto-refreshes every 10s.</p>
        </div>
        
        <div className="flex gap-4">
          {/* Project Selector */}
          <div className="relative">
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="pl-4 pr-10 py-2.5 rounded-xl border border-[#e8dccb] bg-white text-[#2c2420] font-medium shadow-sm focus:ring-2 focus:ring-[#a67c52]/20 outline-none appearance-none hover:border-[#a67c52] transition-colors cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>Project: {p.name}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Clock className="w-4 h-4 absolute left-3 top-3.5 text-[#8c6b4a]" />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-[#e8dccb] bg-white text-[#2c2420] font-medium shadow-sm focus:ring-2 focus:ring-[#a67c52]/20 outline-none appearance-none hover:border-[#a67c52] transition-colors cursor-pointer"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {data && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard 
              title="Total Evaluations" 
              value={data.metrics.total.toLocaleString()} 
              icon={Activity} 
              trend="+12.5%" 
              trendUp={true} 
            />
            <MetricCard 
              title="Active Flags" 
              value={data.metrics.activeFlags.toString()} 
              icon={TrendingUp} 
              trend="0" 
              trendUp={true} 
            />
            <MetricCard 
              title="Avg. Latency" 
              value={`${data.metrics.avgLatency}ms`} 
              icon={BarChart} 
              trend="-5ms" 
              trendUp={true} 
            />
            <MetricCard 
              title="Success Rate" 
              value={`${data.metrics.successRate}%`} 
              icon={Users} 
              trend="-0.1%" 
              trendUp={false} 
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e8dccb] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-[#2c2420] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#a67c52]" />
                  Evaluation Volume
                </h3>
              </div>
              
              <div className="h-64 flex items-end justify-center gap-2">
                {data.trendData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center h-full text-[#8c6b4a] text-sm">
                    No data available for this period
                  </div>
                ) : (
                  data.trendData.map((item, i) => {
                    // Calculate height: scale relative to max, but cap at 70% for single points
                    const maxValue = Math.max(...data.trendData.map(d => d.value), 1);
                    const ratio = item.value / maxValue;
                    const maxHeight = data.trendData.length === 1 ? 140 : 200; // 140px for single bar, 200px for multiple
                    const heightPx = Math.max(ratio * maxHeight, 60); // Min 60px
                    
                    return (
                      <div 
                        key={i} 
                        className="flex flex-col justify-end group relative"
                        style={{ 
                          flex: data.trendData.length === 1 ? '0 0 120px' : '1',
                          maxWidth: data.trendData.length === 1 ? '120px' : 'none'
                        }}
                      >
                        <div 
                          className="w-full bg-[#a67c52] hover:bg-[#8c5e3c] rounded-t-lg transition-all duration-300 relative shadow-md"
                          style={{ height: `${heightPx}px` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2c2420] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {item.value} calls
                          </div>
                        </div>
                        <div className="text-xs text-[#8c6b4a] mt-2 text-center truncate font-medium">
                          {item.label}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-8">
              
              {/* Top Flags */}
              <div className="bg-white rounded-2xl border border-[#e8dccb] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#2c2420] mb-6">Top Flags by Volume</h3>
                <div className="space-y-4">
                  {data.topFlags.map((flag, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#2c2420]">{flag.name}</span>
                        <span className="text-[#8c6b4a]">{flag.count}</span>
                      </div>
                      <div className="h-2 bg-[#f0e6d9] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#a67c52] rounded-full" 
                          style={{ width: `${flag.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {data.topFlags.length === 0 && (
                    <p className="text-sm text-[#8c6b4a]">No flags evaluated yet.</p>
                  )}
                </div>
              </div>

              {/* Environment Distribution */}
              <div className="bg-white rounded-2xl border border-[#e8dccb] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#2c2420] mb-6">Traffic by Environment</h3>
                <div className="flex h-4 rounded-full overflow-hidden mb-4">
                  {data.envDist.map((env, i) => (
                    <div 
                      key={i}
                      className="h-full" 
                      style={{ width: `${env.width}%`, backgroundColor: env.color }}
                    ></div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {data.envDist.map((env, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: env.color }}></div>
                      <span className="text-sm text-[#5e4b35]">{env.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper Component for Metric Cards
const MetricCard = ({ title, value, icon: Icon, trend, trendUp }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-[#e8dccb] shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-[#faf9f6] rounded-xl text-[#a67c52]">
        <Icon className="w-5 h-5" />
      </div>
      <div className={`flex items-center text-xs font-bold ${trendUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-lg`}>
        {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {trend}
      </div>
    </div>
    <div className="text-sm text-[#8c6b4a] font-medium mb-1">{title}</div>
    <div className="text-2xl font-bold text-[#2c2420]">{value}</div>
  </div>
);

export default Analytics;
