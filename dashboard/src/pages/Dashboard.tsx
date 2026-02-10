import { useState } from 'react';
import { FolderPlus, Search, Folder, Flag, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects] = useState([]); // Empty for now - will be populated with API data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 
          className="text-4xl font-semibold mb-2"
          style={{ 
            color: '#1a1512',
            letterSpacing: '-0.02em'
          }}
        >
          Projects
        </h1>
        <p 
          style={{ 
            color: '#736a62',
            letterSpacing: '0.02em'
          }}
        >
          Manage your feature flag projects
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Projects"
          value={projects.length}
          icon={Folder}
          subtitle="Active projects"
        />
        <StatCard
          title="Active Flags"
          value="0"
          icon={Flag}
          subtitle="Across all projects"
        />
        <StatCard
          title="Evaluations"
          value="0"
          icon={Activity}
          subtitle="Last 24 hours"
        />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
          strokeWidth={1.5}
          style={{ color: '#736a62' }}
        />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border rounded-xl transition-all focus:outline-none focus:ring-2"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            color: '#1a1512',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#a67c52';
            e.target.style.boxShadow = '0 0 0 3px rgba(166, 124, 82, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div 
          className="flex flex-col items-center justify-center py-24 rounded-xl border shadow-sm"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#f3f4f6'
          }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: '#f5f5f0' }}
          >
            <FolderPlus 
              className="w-10 h-10" 
              strokeWidth={1.5}
              style={{ color: '#a67c52' }}
            />
          </div>
          <h3 
            className="text-2xl font-semibold mb-2"
            style={{ 
              color: '#1a1512',
              letterSpacing: '-0.02em'
            }}
          >
            No projects yet
          </h3>
          <p 
            className="mb-8 text-center max-w-md"
            style={{ 
              color: '#736a62',
              letterSpacing: '0.02em'
            }}
          >
            Get started by creating your first feature flag project
          </p>
          <button 
            className="px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
            style={{
              backgroundColor: '#a67c52',
              color: '#ffffff',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#956b47';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#a67c52';
            }}
          >
            Create Project
          </button>
        </div>
      )}
    </div>
  );
}
