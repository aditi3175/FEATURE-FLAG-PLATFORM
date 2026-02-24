import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flag, Plus, ArrowLeft, Search, MoreVertical, Loader2, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
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
  type: 'BOOLEAN' | 'MULTIVARIATE';
  rolloutPercentage: number;
  targetingRules: any;
  variants: any[];
  defaultVariantId?: string;
  offVariantId?: string;
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
  const [promotingFlag, setPromotingFlag] = useState<FlagType | null>(null);
  const [promoteTarget, setPromoteTarget] = useState('');
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

  const handlePromoteFlag = async () => {
    if (!promotingFlag || !promoteTarget) return;
    try {
      await FlagAPI.promoteFlag(promotingFlag.id, promoteTarget);
      setPromotingFlag(null);
      setPromoteTarget('');
      fetchProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to promote flag');
    }
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
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
                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                         flag.type === 'MULTIVARIATE' 
                           ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                           : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                       }`}>
                        {flag.type === 'MULTIVARIATE' ? 'Multi' : 'Bool'}
                      </span>
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
                                  const envs = ['Development', 'Staging', 'Production'].filter(e => e !== flag.environment);
                                  setPromotingFlag(flag);
                                  setPromoteTarget(envs[0]);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors border-t border-white/5"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                                <span>Promote</span>
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
          type: editingFlag.type,
          rolloutPercentage: editingFlag.rolloutPercentage,
          targetingRules: editingFlag.targetingRules,
          variants: editingFlag.variants,
          defaultVariantId: editingFlag.defaultVariantId,
          offVariantId: editingFlag.offVariantId
        } : null}
      />

      <DeleteFlagDialog
        isOpen={!!deletingFlag}
        onClose={() => setDeletingFlag(null)}
        onConfirm={handleDeleteFlag}
        flagKey={deletingFlag?.key || ''}
      />

      {/* Promote Flag Modal */}
      <AnimatePresence>
        {promotingFlag && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setPromotingFlag(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bento-surface border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Promote Flag</h3>
                  <p className="text-xs text-gray-500">Copy configuration to another environment</p>
                </div>
              </div>

              <div className="mb-4 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Flag</p>
                <p className="text-sm text-white font-mono">{promotingFlag.key}</p>
                <p className="text-xs text-gray-500 mt-1">Currently in <span className="text-amber-400">{promotingFlag.environment}</span></p>
              </div>

              <label className="block text-xs text-gray-400 mb-2">Promote to</label>
              <select
                value={promoteTarget}
                onChange={(e) => setPromoteTarget(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              >
                {['Development', 'Staging', 'Production']
                  .filter(e => e !== promotingFlag.environment)
                  .map(env => (
                    <option key={env} value={env} className="bg-[#1a1a1a]">{env}</option>
                  ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setPromotingFlag(null)}
                  className="flex-1 px-4 py-2 rounded-lg text-xs text-gray-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromoteFlag}
                  className="flex-1 px-4 py-2 rounded-lg text-xs font-medium accent-gold text-white hover:opacity-90 transition-all"
                >
                  Promote →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProtectedPage>
  );
}
