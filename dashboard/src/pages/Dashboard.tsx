import { useState, useEffect } from 'react';
import { FolderPlus, Search, Folder, Flag, Activity, X, Loader2, Pencil, Trash2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import { ProjectAPI } from '../services/api';

interface Project {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
  _count: {
    flags: number;
  };
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await ProjectAPI.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const newProject = await ProjectAPI.createProject(newProjectName.trim());
      setProjects([newProject, ...projects]);
      setShowCreateModal(false);
      setNewProjectName('');
      // Auto-navigate to the new project
      window.location.href = `/project/${newProject.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      setDeleting(true);
      await ProjectAPI.deleteProject(selectedProject.id);
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setShowDeleteModal(false);
      setSelectedProject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setEditProjectName(project.name);
    setShowEditModal(true);
  };

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !editProjectName.trim()) return;

    try {
      setCreating(true);
      setError(null);
      const updatedProject = await ProjectAPI.updateProject(selectedProject.id, editProjectName.trim());
      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      setShowEditModal(false);
      setSelectedProject(null);
      setEditProjectName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setCreating(false);
    }
  };

  const totalFlags = projects.reduce((sum, p) => sum + (p._count?.flags || 0), 0);

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
          value={totalFlags}
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#a67c52' }} />
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
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
            onClick={() => setShowCreateModal(true)}
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

      {/* Projects Grid */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Project Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all hover:border-solid"
            style={{
              borderColor: '#e5e7eb',
              backgroundColor: '#ffffff',
              minHeight: '180px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#a67c52';
              e.currentTarget.style.backgroundColor = '#f5f5f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            <FolderPlus className="w-8 h-8" style={{ color: '#a67c52' }} strokeWidth={1.5} />
            <span className="font-medium" style={{ color: '#1a1512' }}>New Project</span>
          </button>

          {/* Existing Projects */}
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => window.location.href = `/project/${project.id}`}
              className="border rounded-xl p-6 transition-all hover:shadow-md relative group cursor-pointer"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#e5e7eb',
                minHeight: '180px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#a67c52';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <Folder className="w-6 h-6" style={{ color: '#a67c52' }} strokeWidth={1.5} />
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#f5f5f0', color: '#736a62' }}>
                    {project._count?.flags || 0} flags
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#1a1512' }}>
                {project.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: '#736a62' }}>
                Created {new Date(project.createdAt).toLocaleDateString()}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(project);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    color: '#736a62'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#a67c52';
                    e.currentTarget.style.color = '#a67c52';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#736a62';
                  }}
                >
                  <Pencil className="w-4 h-4" strokeWidth={1.5} />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(project);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    color: '#dc2626'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#dc2626';
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="rounded-2xl p-8 max-w-md w-full mx-4 relative"
            style={{ backgroundColor: '#ffffff' }}
          >
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewProjectName('');
                setError(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg transition-all"
              style={{ color: '#736a62' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1a1512' }}>
                Create New Project
              </h2>
              <p className="text-sm" style={{ color: '#736a62' }}>
                Start managing feature flags for your application
              </p>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: '#e5e7eb',
                    color: '#1a1512'
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

              {error && (
                <div
                  className="mb-4 p-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: '#fef2f2',
                    color: '#991b1b'
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: creating ? '#d4af8e' : '#a67c52',
                  color: '#ffffff',
                  opacity: creating ? 0.7 : 1,
                  cursor: creating ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!creating) {
                    e.currentTarget.style.backgroundColor = '#956b47';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!creating) {
                    e.currentTarget.style.backgroundColor = '#a67c52';
                  }
                }}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4" strokeWidth={1.5} />
                    Create Project
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="rounded-2xl p-8 max-w-md w-full mx-4 relative"
            style={{ backgroundColor: '#ffffff' }}
          >
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedProject(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg transition-all"
              style={{ color: '#736a62' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1a1512' }}>
                Delete Project
              </h2>
              <p className="text-sm" style={{ color: '#736a62' }}>
                Are you sure you want to delete <strong>{selectedProject.name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProject(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all border"
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e5e7eb',
                  color: '#736a62'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: deleting ? '#fca5a5' : '#dc2626',
                  color: '#ffffff',
                  cursor: deleting ? 'not-allowed' : 'pointer'
                }}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="rounded-2xl p-8 max-w-md w-full mx-4 relative"
            style={{ backgroundColor: '#ffffff' }}
          >
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedProject(null);
                setEditProjectName('');
                setError(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-lg transition-all"
              style={{ color: '#736a62' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1a1512' }}>
                Edit Project
              </h2>
              <p className="text-sm" style={{ color: '#736a62' }}>
                Update the name of your project
              </p>
            </div>

            <form onSubmit={handleUpdateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: '#e5e7eb',
                    color: '#1a1512'
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

              {error && (
                <div
                  className="mb-4 p-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: '#fef2f2',
                    color: '#991b1b'
                  }}
                >
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProject(null);
                    setEditProjectName('');
                    setError(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all border"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    color: '#736a62'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: creating ? '#d4af8e' : '#a67c52',
                    color: '#ffffff',
                    opacity: creating ? 0.7 : 1,
                    cursor: creating ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!creating) {
                      e.currentTarget.style.backgroundColor = '#956b47';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!creating) {
                      e.currentTarget.style.backgroundColor = '#a67c52';
                    }
                  }}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4" strokeWidth={1.5} />
                      Update Project
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
