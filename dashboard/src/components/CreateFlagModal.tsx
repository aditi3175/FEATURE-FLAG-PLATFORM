import { useState, useEffect } from 'react';
import { X, Loader2, Flag, AlertTriangle, Shield, Check, Info } from 'lucide-react';

interface CreateFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FlagFormData) => Promise<void>;
  initialData?: FlagFormData | null;
}

export interface FlagFormData {
  id?: string;
  key: string;
  description: string;
  environment: string;
  status: boolean;
  rolloutPercentage: number;
  targetingRules: {
    allowedUsers: string[];
  };
}

export default function CreateFlagModal({ isOpen, onClose, onSubmit, initialData }: CreateFlagModalProps) {
  const [formData, setFormData] = useState<FlagFormData>({
    key: '',
    description: '',
    environment: 'Production',
    status: true,
    rolloutPercentage: 100,
    targetingRules: {
      allowedUsers: []
    }
  });

  // Load initial data when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        key: '',
        description: '',
        environment: 'Production',
        status: true,
        rolloutPercentage: 100,
        targetingRules: { allowedUsers: [] }
      });
    }
  }, [initialData, isOpen]);
  
  const [targetingInput, setTargetingInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key.trim()) {
      setError('Flag key is required');
      return;
    }

    // Validate slug format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.key)) {
      setError('Key must be lowercase, numbers, and hyphens only (e.g., new-feature-v1)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        key: '',
        description: '',
        environment: 'Production',
        status: true,
        rolloutPercentage: 100,
        targetingRules: { allowedUsers: [] }
      });
      setTargetingInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flag');
    } finally {
      setLoading(false);
    }
  };

  const addTargetUser = () => {
    if (!targetingInput.trim()) return;
    
    const users = targetingInput.split(',').map(u => u.trim()).filter(Boolean);
    
    setFormData(prev => ({
      ...prev,
      targetingRules: {
        allowedUsers: [...new Set([...prev.targetingRules.allowedUsers, ...users])]
      }
    }));
    setTargetingInput('');
  };

  const removeTargetUser = (userToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      targetingRules: {
        allowedUsers: prev.targetingRules.allowedUsers.filter(u => u !== userToRemove)
      }
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/70 backdrop-blur-sm">
      <div className="bento-surface inner-glow rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-white/5">
        {/* Header */}
        <div className="p-5 border-b border-white/5 sticky top-0 bento-surface backdrop-blur-xl z-10 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold mb-0.5 text-white">
              {initialData ? 'Edit Feature Flag' : 'Create Feature Flag'}
            </h2>
            <p className="text-xs text-gray-500">
              {initialData ? 'Update your feature configuration' : 'Configure your new feature rollout'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          {/* 1. Basic Info */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#f59e0b]">
              <Flag className="w-3.5 h-3.5" strokeWidth={2} /> Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">Flag Key</label>
                <input
                  type="text"
                  value={formData.key}
                  disabled={!!initialData}
                  onChange={(e) => {
                    // Auto-slugify: lowercase, spaces to hyphens, remove special chars
                    const val = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-')     // Spaces to hyphens
                      .replace(/[^a-z0-9-]/g, ''); // Remove non-alphanumeric (except hyphen)
                    
                    setFormData({ ...formData, key: val });
                    setError(null);
                  }}
                  placeholder="e.g. new-checkout-flow"
                  className={`w-full px-3 py-2 rounded-lg bento-surface border-white/5 focus:outline-none focus:border-[#f59e0b]/30 font-mono text-xs transition-all text-white placeholder-gray-600 ${initialData ? 'cursor-not-allowed opacity-50' : ''}`}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-[10px] text-gray-600">
                    Unique key (lowercase, numbers, hyphens only)
                  </p>
                  {formData.key && (
                    <p className="text-[10px] font-mono text-[#f59e0b]">
                      isEnabled('{formData.key}')
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">Environment</label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bento-surface border-white/5 text-white text-xs focus:outline-none focus:border-[#f59e0b]/30 transition-all"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Development">Development</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this feature do?"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bento-surface border-white/5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#f59e0b]/30 transition-all resize-none"
              />
            </div>
          </section>

          {/* 2. Status & Rollout */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#f59e0b]">
              <Shield className="w-3.5 h-3.5" strokeWidth={2} /> Status & Rollout
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bento-surface border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-400">Feature Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: !formData.status })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      formData.status ? 'bg-emerald-500' : 'bg-gray-700'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      formData.status ? 'translate-x-5' : 'translate-x-0.5'
                    }`}/>
                  </button>
                </div>
                <p className="text-[10px] text-gray-600">
                  {formData.status ? 'Enabled - Users will see this feature' : 'Disabled - Feature is hidden'}
                </p>
              </div>

              <div className="p-3 rounded-lg bento-surface border border-white/5">
                <label className="text-xs font-medium mb-1.5 block text-gray-400">
                  Rollout: {formData.rolloutPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.rolloutPercentage}
                  onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#f59e0b]"
                />
                <p className="text-[10px] text-gray-600 mt-1">
                  {formData.rolloutPercentage}% of users will see this feature
                </p>
              </div>
            </div>
          </section>

          {/* 3. Targeting Rules */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#f59e0b]">
              <Info className="w-3.5 h-3.5" strokeWidth={2} /> User Targeting (Optional)
            </h3>

            <div className="p-3 rounded-lg bento-surface border border-white/5">
              <label className="block text-xs font-medium mb-1.5 text-gray-400">
                Allowed Users
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={targetingInput}
                  onChange={(e) => setTargetingInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTargetUser();
                    }
                  }}
                  placeholder="user@example.com (comma-separated)"
                  className="flex-1 px-3 py-2 rounded-lg bento-surface border-white/5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#f59e0b]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={addTargetUser}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all accent-gold text-white hover:opacity-90"
                >
                  Add
                </button>
              </div>

              {formData.targetingRules.allowedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.targetingRules.allowedUsers.map((user) => (
                    <div
                      key={user}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] text-xs"
                    >
                      <span>{user}</span>
                      <button
                        type="button"
                        onClick={() => removeTargetUser(user)}
                        className="hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" strokeWidth={2} />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all text-gray-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'accent-gold text-white hover:opacity-90'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                  {initialData ? 'Update Flag' : 'Create Flag'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
