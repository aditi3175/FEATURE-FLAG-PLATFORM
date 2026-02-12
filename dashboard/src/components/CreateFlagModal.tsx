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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div 
        className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10 flex items-center justify-between" style={{ borderColor: '#e5e7eb' }}>
          <div>
            <h2 className="text-2xl font-semibold mb-1" style={{ color: '#1a1512' }}>
              {initialData ? 'Edit Feature Flag' : 'Create Feature Flag'}
            </h2>
            <p className="text-sm" style={{ color: '#736a62' }}>
              {initialData ? 'Update your feature configuration' : 'Configure your new feature rollout'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: '#736a62' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* 1. Basic Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: '#a67c52' }}>
              <Flag className="w-4 h-4" /> Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1512' }}>Flag Key</label>
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
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 font-mono text-sm transition-all ${initialData ? 'cursor-not-allowed opacity-75' : ''}`}
                  style={{ 
                    borderColor: error && formData.key === '' ? '#ef4444' : '#e5e7eb', 
                    color: initialData ? '#7d7d7d' : '#1a1512',
                    backgroundColor: initialData ? '#f3f4f6' : '#f9f9f9'
                  }}
                  onFocus={(e) => {
                    if (!initialData) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#a67c52';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(166, 124, 82, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs" style={{ color: '#736a62' }}>
                    Unique key (lowercase, numbers, hyphens only)
                  </p>
                  {formData.key && (
                    <p className="text-xs font-mono" style={{ color: '#a67c52' }}>
                      isEnabled('{formData.key}')
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1512' }}>Environment</label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 appearance-none bg-white"
                  style={{ borderColor: '#e5e7eb', color: '#1a1512' }}
                >
                  <option value="Development">Development</option>
                  <option value="Staging">Staging</option>
                  <option value="Production">Production</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1512' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this feature do?"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 resize-none"
                style={{ borderColor: '#e5e7eb', color: '#1a1512' }}
              />
            </div>
          </section>

          <hr className="border-t" style={{ borderColor: '#f3f4f6' }} />

          {/* 2. Rollout Strategy */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: '#a67c52' }}>
              <Shield className="w-4 h-4" /> Rollout Strategy
            </h3>

            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
              <div>
                <h4 className="font-medium mb-1" style={{ color: '#1a1512' }}>Global Kill Switch</h4>
                <p className="text-sm" style={{ color: '#736a62' }}>Master toggle to enable/disable this feature</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: !formData.status })}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${formData.status ? 'bg-[#a67c52]' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.status ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className={`${!formData.status && 'opacity-50 pointer-events-none transition-opacity'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium" style={{ color: '#1a1512' }}>Percentage Rollout</label>
                <div className="px-2 py-1 rounded bg-[#f5f5f0] text-sm font-mono font-bold" style={{ color: '#a67c52' }}>
                  {formData.rolloutPercentage}%
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.rolloutPercentage}
                onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #a67c52 0%, #a67c52 ${formData.rolloutPercentage}%, #e5e7eb ${formData.rolloutPercentage}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#736a62' }}>
                <span>0% (Off)</span>
                <span>50%</span>
                <span>100% (All Users)</span>
              </div>
            </div>
          </section>

          <hr className="border-t" style={{ borderColor: '#f3f4f6' }} />

          {/* 3. Targeting Rules */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: '#a67c52' }}>
              <AlertTriangle className="w-4 h-4" /> Targeting Rules
            </h3>
            
            <div className="bg-[#f5f5f0] rounded-xl p-4 border" style={{ borderColor: '#e5e5e0' }}>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
                Specific User IDs
                <span className="ml-2 text-xs font-normal opacity-70">(Overrides percentage rollout)</span>
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={targetingInput}
                  onChange={(e) => setTargetingInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetUser())}
                  placeholder="Enter user IDs (comma separated)"
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm"
                  style={{ borderColor: '#e5e7eb' }}
                />
                <button
                  type="button"
                  onClick={addTargetUser}
                  disabled={!targetingInput.trim()}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-white border hover:bg-gray-50 disabled:opacity-50"
                  style={{ borderColor: '#e5e7eb', color: '#1a1512' }}
                >
                  Add
                </button>
              </div>

              {formData.targetingRules.allowedUsers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.targetingRules.allowedUsers.map(user => (
                    <span 
                      key={user} 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white border"
                      style={{ borderColor: '#d4c5b0', color: '#1a1512' }}
                    >
                      {user}
                      <button onClick={() => removeTargetUser(user)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm italic opacity-50 flex items-center justify-center gap-2">
                  <Info className="w-4 h-4" /> No specific users targeted
                </div>
              )}
            </div>
          </section>

          {/* Footer Actions */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white" style={{ borderColor: '#e5e7eb' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#e5e7eb', color: '#736a62' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-medium text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              style={{ backgroundColor: '#a67c52' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Flag')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
