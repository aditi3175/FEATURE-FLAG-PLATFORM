import { useState } from 'react';
import { User, Key, Copy, RotateCw, Trash2, Check, Bell, Shield } from 'lucide-react';
import ProtectedPage from '../components/ProtectedPage';
import { useAuth } from '../context/AuthContext';

import { ProjectAPI } from '../services/api';

export default function Settings() {
  const { user } = useAuth();
  const [apiKey] = useState('fgk_live_9a7b8c6d5e4f3g2h1i0j');
  const [copied, setCopied] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotateKey = () => {
    alert('API Key rotation would happen here');
  };

  const handleDeleteProject = () => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      alert('Project deletion would happen here');
    }
  };

  return (
    <ProtectedPage>
      <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 
          className="text-4xl font-semibold mb-2"
          style={{ 
            color: '#1a1512',
            letterSpacing: '-0.02em'
          }}
        >
          Settings
        </h1>
        <p style={{ color: '#736a62', letterSpacing: '0.02em' }}>
          Manage your account and project configuration
        </p>
      </div>

      {/* Account Section */}
      <section
        className="rounded-xl p-6 border"
        style={{ 
          backgroundColor: '#ffffff',
          borderColor: '#f3f4f6'
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5" style={{ color: '#a67c52' }} strokeWidth={1.5} />
          <div>
            <h2 className="text-xl font-semibold" style={{ color: '#1a1512' }}>
              Account
            </h2>
            <p className="text-sm" style={{ color: '#736a62' }}>
              Your personal information
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Profile Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
              Full Name
            </label>
            <input
              type="text"
              value={user?.name || ''}
              readOnly
              className="w-full px-4 py-3 rounded-xl border"
              style={{
                backgroundColor: '#f5f5f0',
                borderColor: '#e5e7eb',
                color: '#736a62',
                cursor: 'not-allowed'
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full px-4 py-3 rounded-xl border"
              style={{
                backgroundColor: '#f5f5f0',
                borderColor: '#e5e7eb',
                color: '#736a62',
                cursor: 'not-allowed'
              }}
            />
          </div>
        </div>
      </section>

      {/* Project Configuration */}
      <section
        className="rounded-xl p-6 border"
        style={{ 
          backgroundColor: '#ffffff',
          borderColor: '#f3f4f6'
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5" style={{ color: '#a67c52' }} strokeWidth={1.5} />
          <div>
            <h2 className="text-xl font-semibold" style={{ color: '#1a1512' }}>
              Project Configuration
            </h2>
            <p className="text-sm" style={{ color: '#736a62' }}>
              Manage your project settings and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" style={{ color: '#736a62' }} strokeWidth={1.5} />
              <div>
                <p className="font-medium" style={{ color: '#1a1512' }}>
                  Email Notifications
                </p>
                <p className="text-sm" style={{ color: '#736a62' }}>
                  Receive updates about flag changes
                </p>
              </div>
            </div>
            
            {/* Custom Toggle Switch */}
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className="relative rounded-full transition-all duration-200"
              style={{
                width: '52px',
                height: '28px',
                backgroundColor: emailNotifications ? '#a67c52' : '#e5e7eb'
              }}
            >
              <div
                className="absolute top-1 rounded-full bg-white transition-all duration-200 shadow-sm"
                style={{
                  width: '20px',
                  height: '20px',
                  left: emailNotifications ? '28px' : '4px'
                }}
              />
            </button>
          </div>

          {/* Two-Factor Auth Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" style={{ color: '#736a62' }} strokeWidth={1.5} />
              <div>
                <p className="font-medium" style={{ color: '#1a1512' }}>
                  Two-Factor Authentication
                </p>
                <p className="text-sm" style={{ color: '#736a62' }}>
                  Add an extra layer of security
                </p>
              </div>
            </div>
            
            {/* Custom Toggle Switch */}
            <button
              onClick={() => setTwoFactorAuth(!twoFactorAuth)}
              className="relative rounded-full transition-all duration-200"
              style={{
                width: '52px',
                height: '28px',
                backgroundColor: twoFactorAuth ? '#a67c52' : '#e5e7eb'
              }}
            >
              <div
                className="absolute top-1 rounded-full bg-white transition-all duration-200 shadow-sm"
                style={{
                  width: '20px',
                  height: '20px',
                  left: twoFactorAuth ? '28px' : '4px'
                }}
              />
            </button>
          </div>
        </div>
      </section>

      {/* API Keys Information */}
      <section
        className="rounded-xl p-6 border"
        style={{ 
          backgroundColor: '#ffffff',
          borderColor: '#f3f4f6'
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Key className="w-5 h-5" style={{ color: '#a67c52' }} strokeWidth={1.5} />
          <div>
            <h2 className="text-xl font-semibold" style={{ color: '#1a1512' }}>
              API Keys
            </h2>
            <p className="text-sm" style={{ color: '#736a62' }}>
              Manage authentication for your applications
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-gray-50 text-gray-600 text-sm">
          <p>
            API keys are unique to each project. To view or rotate an API key, please visit the <strong>Project Details</strong> page for the specific project you want to configure.
          </p>
        </div>
      </section>

      {/* Danger Zone */}
      <section
        className="rounded-xl p-6 border"
        style={{ 
          backgroundColor: '#ffffff',
          borderColor: '#fca5a5'
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Trash2 className="w-5 h-5" style={{ color: '#b91c1c' }} strokeWidth={1.5} />
          <div>
            <h2 className="text-xl font-semibold" style={{ color: '#991b1b' }}>
              Danger Zone
            </h2>
            <p className="text-sm" style={{ color: '#736a62' }}>
              Irreversible and destructive actions
            </p>
          </div>
        </div>

        <div 
          className="p-4 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: '#fef2f2',
            borderColor: '#fca5a5'
          }}
        >
          <div>
            <h4 className="font-semibold text-red-900">Delete All Projects</h4>
            <p className="text-sm text-red-600">
              Permanently delete ALL your projects and flags. This cannot be undone.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('WARNING: Are you sure you want to delete ALL projects? This will wipe all data and invalidate all API keys.')) {
                 ProjectAPI.deleteAllProjects()
                   .then(() => window.location.href = '/')
                   .catch(err => alert('Failed to delete projects: ' + err.message));
              }
            }}
            className="px-4 py-2 rounded-xl font-medium transition-all"
            style={{
              backgroundColor: '#b91c1c',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#991b1b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
            }}
          >
            Delete All Projects
          </button>
        </div>
      </section>
    </div>
    </ProtectedPage>
  );
}
