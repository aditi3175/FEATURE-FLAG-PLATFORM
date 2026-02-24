import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenService } from '../services/api';
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface AuditEntry {
  id: string;
  projectId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  changes: Record<string, any>;
  timestamp: string;
  user: { id: string; name: string; email: string };
}

interface Project {
  id: string;
  name: string;
}

const ACTION_CONFIG: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  'flag.created': { icon: Plus, label: 'Flag Created', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  'flag.updated': { icon: Pencil, label: 'Flag Updated', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  'flag.deleted': { icon: Trash2, label: 'Flag Deleted', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  'flag.toggled': { icon: ToggleLeft, label: 'Flag Toggled', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  'project.created': { icon: Plus, label: 'Project Created', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  'project.updated': { icon: Pencil, label: 'Project Updated', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  'project.deleted': { icon: Trash2, label: 'Project Deleted', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/projects`, {
          headers: { ...TokenService.getAuthHeader() },
        });
        if (!res.ok) return;
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !selectedProject) {
          const saved = localStorage.getItem('selectedProjectId');
          const match = saved && data.find((p: any) => p.id === saved);
          setSelectedProject(match ? saved : data[0].id);
        }
      } catch { /* ignore */ }
    }
    fetchProjects();
  }, []);

  // Fetch audit logs
  const fetchLogs = useCallback(async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (filterAction) params.set('action', filterAction);

      const res = await fetch(
        `${API_BASE_URL}/api/projects/${selectedProject}/audit-logs?${params}`,
        { headers: { ...TokenService.getAuthHeader() } }
      );
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setLogs(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProject, page, filterAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const renderChangeDiff = (changes: Record<string, any>, action: string) => {
    if (!changes || Object.keys(changes).length === 0) return null;

    // For created/deleted, show snapshot
    if (action === 'flag.created' && changes.after) {
      return (
        <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <p className="text-[10px] uppercase tracking-wider text-emerald-400/60 mb-2 font-semibold">Created With</p>
          <div className="space-y-1">
            {Object.entries(changes.after).filter(([k]) => !['id', 'projectId', 'createdAt', 'updatedAt'].includes(k)).map(([key, val]) => (
              <div key={key} className="flex items-start gap-2 text-xs">
                <span className="text-gray-500 min-w-[100px]">{key}:</span>
                <span className="text-gray-300 font-mono text-[11px]">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (action === 'flag.deleted' && changes.before) {
      return (
        <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
          <p className="text-[10px] uppercase tracking-wider text-red-400/60 mb-2 font-semibold">Deleted Flag</p>
          <div className="space-y-1">
            <div className="flex items-start gap-2 text-xs">
              <span className="text-gray-500">key:</span>
              <span className="text-gray-300 font-mono">{changes.before.key}</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <span className="text-gray-500">environment:</span>
              <span className="text-gray-300 font-mono">{changes.before.environment}</span>
            </div>
          </div>
        </div>
      );
    }

    // For updates/toggles, show diff
    return (
      <div className="mt-3 space-y-2">
        {Object.entries(changes).map(([key, val]: [string, any]) => (
          <div key={key} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold">{key}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-red-400/80 line-through font-mono bg-red-500/5 px-1.5 py-0.5 rounded">
                {typeof val.from === 'object' ? JSON.stringify(val.from) : String(val.from)}
              </span>
              <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
              <span className="text-emerald-400 font-mono bg-emerald-500/5 px-1.5 py-0.5 rounded">
                {typeof val.to === 'object' ? JSON.stringify(val.to) : String(val.to)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            Audit Log
          </h1>
          <p className="text-xs text-gray-500 mt-1">Track every change made to your feature flags</p>
        </div>
        <div className="text-xs text-gray-500">
          {total} total entries
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Project Select */}
        <select
          value={selectedProject}
          onChange={(e) => { setSelectedProject(e.target.value); localStorage.setItem('selectedProjectId', e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#1a1a1a]">{p.name}</option>
          ))}
        </select>

        {/* Action Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          >
            <option value="" className="bg-[#1a1a1a]">All Actions</option>
            <option value="flag.created" className="bg-[#1a1a1a]">Flag Created</option>
            <option value="flag.updated" className="bg-[#1a1a1a]">Flag Updated</option>
            <option value="flag.toggled" className="bg-[#1a1a1a]">Flag Toggled</option>
            <option value="flag.deleted" className="bg-[#1a1a1a]">Flag Deleted</option>
            <option value="project.created" className="bg-[#1a1a1a]">Project Created</option>
            <option value="project.updated" className="bg-[#1a1a1a]">Project Updated</option>
            <option value="project.deleted" className="bg-[#1a1a1a]">Project Deleted</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="w-10 h-10 text-gray-700 mb-3" />
            <p className="text-sm text-gray-500">No audit entries yet</p>
            <p className="text-xs text-gray-600 mt-1">Changes to flags will appear here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => {
              const config = ACTION_CONFIG[log.action] || ACTION_CONFIG['flag.updated'];
              const Icon = config.icon;
              const isExpanded = expandedId === log.id;

              return (
                <div
                  key={log.id}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="relative pl-12 pr-4 py-3 rounded-xl hover:bg-white/[0.02] transition-all cursor-pointer group"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-2.5 top-4 w-[18px] h-[18px] rounded-full border ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-2.5 h-2.5 ${config.color}`} strokeWidth={2.5} />
                  </div>

                  {/* Content */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-white font-medium font-mono bg-white/5 px-1.5 py-0.5 rounded">
                          {log.entityName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <User className="w-3 h-3" />
                          <span>{log.user?.name || 'System'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{timeAgo(log.timestamp)}</span>
                        </div>
                      </div>

                      {/* Expanded diff */}
                      {isExpanded && renderChangeDiff(log.changes, log.action)}
                    </div>

                    {/* Expand hint */}
                    <div className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                      {isExpanded ? 'collapse' : 'expand'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
