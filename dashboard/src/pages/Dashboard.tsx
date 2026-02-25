import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Activity, Flag, Clock, Zap, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import GlowingDot from '../components/GlowingDot';
import Sparkline from '../components/Sparkline';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import ProtectedPage from '../components/ProtectedPage';
import { ProjectAPI, FlagAPI, AnalyticsAPI } from '../services/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  apiKey: string;
  createdAt: string;
  flagCount?: number;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [analytics, setAnalytics] = useState({
    totalEvaluations: 0,
    recentEvaluations: 0,
    evaluationsByEnvironment: {},
    avgResponseTime: null
  });
  const navigate = useNavigate();

  // Mock sparkline data for demo
  const generateSparklineData = () => {
    return Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));
  };

  // Calculate real statistics
  const totalFlags = projects.reduce((sum, project) => sum + (project.flagCount || 0), 0);
  // Note: Evaluations and avg response would need API endpoints to be accurate
  // For now we'll show "--" or remove these stats until backend supports them

  useEffect(() => {
    fetchProjects();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const stats = await AnalyticsAPI.getStats();
      setAnalytics(stats);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await ProjectAPI.getProjects();
      
      // Fetch flag count for each project
      const projectsWithFlagCounts = await Promise.all(
        data.map(async (project) => {
          try {
            const flags = await FlagAPI.getFlags(project.id);
            return { ...project, flagCount: flags.length };
          } catch (err) {
            console.error(`Failed to fetch flags for project ${project.id}`, err);
            return { ...project, flagCount: 0 };
          }
        })
      );
      
      setProjects(projectsWithFlagCounts);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (name: string, _description: string) => {
    try {
      await ProjectAPI.createProject(name);
      await fetchProjects(); // Refresh with flag count
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create project', err);
      throw err;
    }
  };

  const handleUpdateProject = async (name: string) => {
    if (!editingProject) return;
    try {
      await ProjectAPI.updateProject(editingProject.id, name);
      await fetchProjects(); // Refresh projects
      setEditingProject(null);
    } catch (err) {
      console.error('Failed to update project', err);
      throw err;
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    try {
      await ProjectAPI.deleteProject(deletingProject.id);
      setProjects(projects.filter(p => p.id !== deletingProject.id));
      setDeletingProject(null);
    } catch (err) {
      console.error('Failed to delete project', err);
      throw err;
    }
  };

  const handleEditClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
  };

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setDeletingProject(project);
  };

  if (loading) {
    return (
      <ProtectedPage>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Projects</h1>
            <p className="text-xs text-gray-500">Manage your feature flag projects and configurations</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg accent-gold text-white text-sm font-medium shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            New Project
          </motion.button>
        </div>

        {/* Stats Grid - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Projects"
            value={projects.length}
            icon={Flag}
            trend="+12%"
            trendUp={true}
            sparklineData={generateSparklineData()}
          />
          <StatCard
            title="Active Flags"
            value={totalFlags}
            icon={Activity}
            trend="+5"
            trendUp={true}
            sparklineData={generateSparklineData()}
          />
          <StatCard
            title="Evaluations"
            value={analytics.totalEvaluations >= 1000 ? `${(analytics.totalEvaluations / 1000).toFixed(1)}K` : analytics.totalEvaluations}
            icon={Zap}
            trend={analytics.recentEvaluations > 0 ? `+${analytics.recentEvaluations}` : "0"}
            trendUp={true}
            sparklineData={generateSparklineData()}
          />
          <StatCard
            title="Avg Response"
            value={analytics.avgResponseTime ? `${analytics.avgResponseTime}ms` : '--'}
            icon={Clock}
            trend="--"
            trendUp={true}
            sparklineData={generateSparklineData()}
          />
        </div>

        {/* Projects Bento Grid */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-surface inner-glow rounded-xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-[#f59e0b]" strokeWidth={2} />
            </div>
            <h3 className="text-base font-medium text-white mb-2">No projects yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Create your first project to start managing feature flags
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-lg accent-gold text-white text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Create Project
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', damping: 20, stiffness: 300 }}
                onClick={() => navigate(`/app/projects/${project.id}`)}
                className="bento-surface inner-glow rounded-xl p-5 cursor-pointer hover:border-white/10 transition-all group"
              >
                {/* Header with Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg accent-gold flex items-center justify-center">
                      <Flag className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#f59e0b] transition-colors">
                        {project.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Edit Button */}
                    <button
                      onClick={(e) => handleEditClick(e, project)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteClick(e, project)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                    
                    <div className="ml-1">
                      <GlowingDot active={true} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Sparkline Graph */}
                <div className="mb-4">
                  <Sparkline data={generateSparklineData()} height={32} width={120} />
                </div>

                {/* Metrics Row */}
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <div className="text-gray-500 mb-0.5">Flags</div>
                    <div className="text-white font-medium">
                      {project.flagCount ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-0.5">Env</div>
                    <div className="text-white font-medium">Prod</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-500 mb-0.5">API Key</div>
                    <div className="font-mono text-gray-600 text-[10px] truncate">
                      {project.apiKey.substring(0, 16)}...
                    </div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-5 right-5">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />

      <EditProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSubmit={handleUpdateProject}
        initialName={editingProject?.name || ''}
        projectId={editingProject?.id || ''}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteProject}
        projectName={deletingProject?.name || ''}
      />
    </ProtectedPage>
  );
}
