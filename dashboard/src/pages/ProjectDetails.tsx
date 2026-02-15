import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flag, Plus, ArrowLeft, Search, MoreVertical, Loader2, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedPage from '../components/ProtectedPage';
import CreateFlagModal from '../components/CreateFlagModal';
import DeleteFlagDialog from '../components/DeleteFlagDialog';
import GlowingDot from '../components/GlowingDot';
import Sparkline from '../components/Sparkline';
import type { FlagFormData } from '../components/CreateFlagModal';
import { ProjectAPI, FlagAPI } from '../services/api';

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingFlag, setDeletingFlag] = useState<FlagType | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Mock sparkline data
  const generateSparklineData = () => Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));

  useEffect(() => {
    if (projectId) fetchProjectData();
  }, [projectId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const projectData = await ProjectAPI.getProject(projectId!);
      const flagsData = await FlagAPI.getFlags(projectId!);
      setProject(projectData);
      setFlags(flagsData);
    } catch (err) {
      console.error('Failed to fetch project data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFlag = async (data: FlagFormData) => {
    if (!projectId) return;
    try {
      if (editingFlag) {
        const updated = await FlagAPI.updateFlag(editingFlag.id, data);
        setFlags(flags.map(f => f.id === updated.id ? updated : f));
      } else {
        const newFlag = await FlagAPI.createFlag(projectId, data);
        setFlags([newFlag, ...flags]);
      }
      setEditingFlag(null);
      setIsCreateModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleEditFlag = (flag: FlagType) => {
    setEditingFlag(flag);
    setIsCreateModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteFlag = async () => {
    if (!deletingFlag) return;
    try {
      await FlagAPI.deleteFlag(deletingFlag.id);
      setFlags(flags.filter(f => f.id !== deletingFlag.id));
      setDeletingFlag(null);
    } catch (err) {
      console.error('Failed to delete flag', err);
    }
  };

  const toggleMenu = (flagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === flagId ? null : flagId);
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
          <Loader2 className="w-4 h-4 animate-spin text-[#f59e0b]" strokeWidth={2} />
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">{project?.name}</h1>
              <p className="text-xs text-gray-500">Manage feature flags and rollouts</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingFlag(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg accent-gold text-white text-xs font-medium hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            Create Flag
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search flags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bento-surface border border-white/5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#f59e0b]/30 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Production', 'Staging', 'Development'].map(env => (
              <button
                key={env}
                onClick={() => setEnvFilter(env)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  envFilter === env
                    ? 'accent-gold text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        {/* Flags Table */}
        {filteredFlags.length > 0 ? (
          <div className="bento-surface inner-glow rounded-xl overflow-hidden border border-white/5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flag</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Env</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rollout</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-2 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredFlags.map((flag) => (
                  <motion.tr
                    key={flag.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-white font-medium">{flag.key}</div>
                      {flag.description && <div className="text-xs text-gray-600 truncate max-w-xs mt-0.5">{flag.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GlowingDot active={flag.status} size="sm" />
                        <span className="text-xs text-gray-400">{flag.status ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-gray-400 border border-white/5">
                        {flag.environment}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full accent-gold" style={{ width: `${flag.rolloutPercentage}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{flag.rolloutPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Sparkline data={generateSparklineData()} height={24} width={60} />
                    </td>
                    <td className="px-2 py-3">
                      <div className="relative" ref={openMenuId === flag.id ? menuRef : null}>
                        <button 
                          onClick={(e) => toggleMenu(flag.id, e)}
                          className="p-1 rounded hover:bg-white/5 text-gray-600 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" strokeWidth={2} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {openMenuId === flag.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.1 }}
                              className="absolute right-0 top-8 w-40 glass-surface border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
                            >
                              <button
                                onClick={() => handleEditFlag(flag)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
                                <span>Edit Flag</span>
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingFlag(flag);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5"
                              >
                                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                                <span>Delete Flag</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bento-surface inner-glow rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-3">
              <Flag className="w-6 h-6 text-[#f59e0b]" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">No flags found</h3>
            <p className="text-xs text-gray-500 mb-4">
              {searchQuery || envFilter !== 'All' 
                ? 'Try adjusting your filters' 
                : 'Create your first feature flag to get started'}
            </p>
            {(!searchQuery && envFilter === 'All') && (
              <button
                onClick={() => {
                  setEditingFlag(null);
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg accent-gold text-white text-xs font-medium hover:opacity-90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                Create Flag
              </button>
            )}
          </div>
        )}
      </motion.div>

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

      <DeleteFlagDialog
        isOpen={!!deletingFlag}
        onClose={() => setDeletingFlag(null)}
        onConfirm={handleDeleteFlag}
        flagKey={deletingFlag?.key || ''}
      />
    </ProtectedPage>
  );
}
