import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flag, Plus, ArrowLeft,Search, MoreVertical, Loader2, PlayCircle, PauseCircle, Users, AlertTriangle } from 'lucide-react';
import ProtectedPage from '../components/ProtectedPage';
import CreateFlagModal from '../components/CreateFlagModal';
import type { FlagFormData } from '../components/CreateFlagModal';
import { ProjectAPI, FlagAPI } from '../services/api';

// Define updated Flag type correctly for frontend usage
interface FlagType {
  id: string;
  key: string;
  description: string;
  environment: string;
  status: boolean;
  rolloutPercentage: number;
  targetingRules: any;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [flags, setFlags] = useState<FlagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [envFilter, setEnvFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FlagType | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{top: number, left: number} | null>(null);
  const [flagToDelete, setFlagToDelete] = useState<FlagType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      // Fetch project meta
      const projectData = await ProjectAPI.getProject(projectId!);
      setProject(projectData);
      
      // Fetch flags
      const flagsData = await FlagAPI.getFlags(projectId!);
      setFlags(flagsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFlag = async (data: FlagFormData) => {
    if (!projectId) return;
    try {
      if (editingFlag) {
        // Update existing flag
        const updated = await FlagAPI.updateFlag(editingFlag.id, data);
        setFlags(flags.map(f => f.id === updated.id ? updated : f));
      } else {
        // Create new flag
        const newFlag = await FlagAPI.createFlag(projectId, data);
        setFlags([newFlag, ...flags]);
      }
      setEditingFlag(null); // Reset editing state
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteFlag = async () => {
    if (!flagToDelete) return;
    try {
      await FlagAPI.deleteFlag(flagToDelete.id);
      setFlags(flags.filter(f => f.id !== flagToDelete.id));
      setFlagToDelete(null);
    } catch (err) {
      console.error("Failed to delete flag", err);
    }
  };

  const openCreateModal = () => {
    setEditingFlag(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (flag: FlagType) => {
    setEditingFlag(flag);
    setIsCreateModalOpen(true);
    setActiveMenuId(null);
  };

  const filteredFlags = flags.filter(flag => {
    const matchesSearch = flag.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnv = envFilter === 'All' || flag.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  if (loading) {
    return (
      <ProtectedPage>
         <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#a67c52' }} />
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-medium hover:underline mb-4"
            style={{ color: '#736a62' }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: '#1a1512' }}>{project?.name}</h1>
              <p className="text-sm" style={{ color: '#736a62' }}>Manage feature flags and configurations</p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl font-medium text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              style={{ backgroundColor: '#a67c52' }}
            >
              <Plus className="w-5 h-5" /> Create Flag
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search flags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e7eb' }}
            />
          </div>
          <div className="flex items-center gap-2 bg-white border rounded-xl p-1" style={{ borderColor: '#e5e7eb' }}>
            {['All', 'Development', 'Staging', 'Production'].map(env => (
              <button
                key={env}
                onClick={() => setEnvFilter(env)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  envFilter === env ? 'bg-[#f5f5f0] text-[#a67c52]' : 'text-[#736a62] hover:bg-gray-50'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        {/* Flag List */}
        {filteredFlags.length > 0 ? (
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
            <table className="w-full text-left">
              <thead className="bg-[#f9fafb] border-b" style={{ borderColor: '#e5e7eb' }}>
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Flag Key</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Environment</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Rollout</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Targeting</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFlags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-[#f9fafb] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-medium" style={{ color: '#1a1512' }}>{flag.key}</div>
                      {flag.description && <div className="text-xs text-gray-500 truncate max-w-xs">{flag.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {flag.status ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          <PlayCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          <PauseCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{flag.environment}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#a67c52] rounded-full" 
                            style={{ width: `${flag.rolloutPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-mono">{flag.rolloutPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {flag.targetingRules?.allowedUsers?.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600" title={flag.targetingRules.allowedUsers.join(', ')}>
                          <Users className="w-3.5 h-3.5" /> {flag.targetingRules.allowedUsers.length} users
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.right - 140 + window.scrollX });
                          setActiveMenuId(activeMenuId === flag.id ? null : flag.id);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl border border-dashed bg-[#f9fafb]" style={{ borderColor: '#e5e7eb' }}>
            <div className="w-16 h-16 bg-[#f0ebe3] rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-[#a67c52]" />
            </div>
            <h3 className="text-lg font-medium text-[#1a1512] mb-1">No flags found</h3>
            <p className="text-sm text-[#736a62] mb-6">Create your first feature flag to get started</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-lg font-medium text-white text-sm"
              style={{ backgroundColor: '#a67c52' }}
            >
              Create Flag
            </button>
          </div>
        )}

        {/* Global Dropdown Menu (Fixed Position) */}
        {activeMenuId && menuPosition && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setActiveMenuId(null)} 
            />
            <div 
              className="fixed z-50 w-36 bg-white rounded-lg shadow-xl border py-1 animate-in fade-in zoom-in-95 duration-200" 
              style={{ 
                borderColor: '#e5e7eb',
                top: menuPosition.top,
                left: menuPosition.left
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const flag = flags.find(f => f.id === activeMenuId);
                  if (flag) openEditModal(flag);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                style={{ color: '#1a1512' }}
              >
                Edit Flag
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const flag = flags.find(f => f.id === activeMenuId);
                  if (flag) {
                    setFlagToDelete(flag);
                    setActiveMenuId(null);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
              >
                Delete Flag
              </button>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {flagToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Delete Feature Flag?</h3>
              </div>
              
              <p className="text-gray-600">
                Are you sure you want to delete <span className="font-mono font-bold text-gray-800">{flagToDelete.key}</span>? 
                This action cannot be undone and may break your application if the code still references this flag.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setFlagToDelete(null)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50 font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFlag}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}

        <CreateFlagModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleSaveFlag}
          initialData={editingFlag ? {
            id: editingFlag.id,
            key: editingFlag.key,
            description: editingFlag.description,
            environment: editingFlag.environment,
            status: editingFlag.status,
            rolloutPercentage: editingFlag.rolloutPercentage,
            targetingRules: editingFlag.targetingRules
          } : null}
        />
      </div>
    </ProtectedPage>
  );
}
