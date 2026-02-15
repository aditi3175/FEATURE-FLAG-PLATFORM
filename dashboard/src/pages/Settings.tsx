import { useState } from 'react';
import { User, Key, Trash2, Shield, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedPage from '../components/ProtectedPage';
import { useAuth } from '../context/AuthContext';
import { ProjectAPI } from '../services/api';

export default function Settings() {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  return (
    <ProtectedPage>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="space-y-6 max-w-3xl"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Settings</h1>
          <p className="text-xs text-gray-500">Manage your account and project configuration</p>
        </div>

        {/* Account Section */}
        <div className="bento-surface inner-glow rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#f59e0b]" strokeWidth={2} />
            <h2 className="text-sm font-medium text-white">Account</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Full Name</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/5 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/5 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Project Configuration */}
        <div className="bento-surface inner-glow rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#f59e0b]" strokeWidth={2} />
            <h2 className="text-sm font-medium text-white">Preferences</h2>
          </div>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-gray-500" strokeWidth={2} />
                <div>
                  <p className="text-sm text-white">Email Notifications</p>
                  <p className="text-xs text-gray-600">Receive updates about flag changes</p>
                </div>
              </div>
              
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-[#f59e0b]' : 'bg-white/10'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                }`}/>
              </button>
            </div>

            {/* Two-Factor Auth */}
            <div className="flex items-center justify-between py-2 border-t border-white/5">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-500" strokeWidth={2} />
                <div>
                  <p className="text-sm text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-600">Add extra security to your account</p>
                </div>
              </div>
              
              <button
                onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  twoFactorAuth ? 'bg-[#f59e0b]' : 'bg-white/10'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  twoFactorAuth ? 'translate-x-5' : 'translate-x-0.5'
                }`}/>
              </button>
            </div>
          </div>
        </div>

        {/* API Keys Info */}
        <div className="bento-surface inner-glow rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-[#f59e0b]" strokeWidth={2} />
            <h2 className="text-sm font-medium text-white">API Keys</h2>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            API keys are unique to each project. Visit <span className="text-white font-medium">Project Details</span> to view or rotate keys for specific projects.
          </p>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-4 h-4 text-red-400" strokeWidth={2} />
            <h2 className="text-sm font-medium text-red-300">Danger Zone</h2>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/30 bg-red-500/10">
            <div>
              <h4 className="text-sm font-medium text-red-300">Delete All Projects</h4>
              <p className="text-xs text-red-400/70 mt-0.5">
                Permanently delete all projects and flags. Cannot be undone.
              </p>
            </div>

            <button
              onClick={() => {
                if (confirm('WARNING: Delete ALL projects? This will wipe all data.')) {
                  ProjectAPI.deleteAllProjects()
                    .then(() => window.location.href = '/')
                    .catch(err => alert('Failed: ' + err.message));
                }
              }}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-red-600 text-white hover:bg-red-700"
            >
              Delete All
            </button>
          </div>
        </div>
      </motion.div>
    </ProtectedPage>
  );
}
