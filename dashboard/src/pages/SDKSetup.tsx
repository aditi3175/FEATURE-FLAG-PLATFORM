import { useState, useEffect } from 'react';
import { Terminal, Key, Copy, CheckCircle, Code2, RotateCw, Eye, EyeOff, Loader2 } from 'lucide-react';
import ProtectedPage from '../components/ProtectedPage';
import { ProjectAPI } from '../services/api';

type Framework = 'react' | 'nodejs' | 'javascript';

interface Project {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
}

export default function SDKSetup() {
  const [activeTab, setActiveTab] = useState<Framework>('react');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await ProjectAPI.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const maskKey = (key: string) => {
    const prefix = key.substring(0, 10);
    return `${prefix}••••••••••••`;
  };

  const getCodeSnippets = (apiKey: string) => ({
    react: {
      install: 'npm install @flagforge/react-sdk',
      setup: `import { FlagForgeProvider } from '@flagforge/react-sdk';

function App() {
  return (
    <FlagForgeProvider apiKey="${apiKey}">
      <YourApp />
    </FlagForgeProvider>
  );
}`,
      usage: `import { useFlag } from '@flagforge/react-sdk';

function Feature() {
  const { isEnabled, loading } = useFlag('new-feature');
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {isEnabled ? <NewFeature /> : <OldFeature />}
    </div>
  );
}`
    },
    nodejs: {
      install: 'npm install @flagforge/node-sdk',
      setup: `const { FlagForge } = require('@flagforge/node-sdk');

const client = new FlagForge({
  apiKey: '${apiKey}'
});

await client.initialize();`,
      usage: `// Check if feature is enabled for a user
const isEnabled = await client.isEnabled(
  'new-feature',
  { userId: 'user-123' }
);

if (isEnabled) {
  // Execute new feature code
} else {
  // Execute old feature code
}`
    },
    javascript: {
      install: 'npm install @flagforge/js-sdk',
      setup: `import FlagForge from '@flagforge/js-sdk';

const client = new FlagForge({
  apiKey: '${apiKey}'
});

client.initialize();`,
      usage: `// Evaluate a feature flag
const isEnabled = client.evaluate('new-feature', {
  userId: 'user-123',
  context: {
    email: 'user@example.com'
  }
});

if (isEnabled) {
  document.getElementById('new-feature').style.display = 'block';
}`
    }
  });

  if (loading) {
    return (
      <ProtectedPage>
        <div className="p-10 flex items-center justify-center" style={{ backgroundColor: '#f5f5f0', minHeight: '100vh' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#a67c52' }} />
        </div>
      </ProtectedPage>
    );
  }

  if (projects.length === 0) {
    return (
      <ProtectedPage>
        <div className="p-10 flex items-center justify-center" style={{ backgroundColor: '#f5f5f0', minHeight: '100vh' }}>
          <div className="text-center max-w-md">
            <div 
              className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: '#f0ebe3' }}
            >
              <Key className="w-10 h-10" style={{ color: '#a67c52' }} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1a1512' }}>
              No Projects Yet
            </h2>
            <p className="mb-6" style={{ color: '#736a62' }}>
              Create a project first to get your API key and start integrating FlagForge
            </p>
            <button
              className="px-6 py-3 rounded-xl font-semibold transition-all"
              style={{
                backgroundColor: '#a67c52',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#956b47';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#a67c52';
              }}
              onClick={() => window.location.href = '/'}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  const codeSnippets = selectedProject ? getCodeSnippets(selectedProject.apiKey) : getCodeSnippets('');

  return (
    <ProtectedPage>
      <div className="p-10" style={{ backgroundColor: '#f5f5f0', minHeight: '100vh' }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a1512', letterSpacing: '-0.02em' }}>
                SDK Setup
              </h1>
              <p className="text-sm" style={{ color: '#736a62' }}>
                Integrate FlagForge into your application
              </p>
            </div>
            
            {/* Connection Status Badge */}
            <div 
              className="px-4 py-2 rounded-xl flex items-center gap-2"
              style={{
                backgroundColor: '#f0ebe3',
                border: '1px solid #d4c5b0'
              }}
            >
              <CheckCircle className="w-4 h-4" style={{ color: '#8b7355' }} strokeWidth={1.5} />
              <span className="text-sm font-medium" style={{ color: '#8b7355' }}>
                Ready for Integration
              </span>
            </div>
          </div>

          {/* Project Selector */}
          {projects.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
                Select Project
              </label>
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const project = projects.find(p => p.id === e.target.value);
                  setSelectedProject(project || null);
                }}
                className="px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e5e7eb',
                  color: '#1a1512',
                  minWidth: '300px'
                }}
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* API Key Section */}
        {selectedProject && (
          <div className="mb-8">
            <div 
              className="rounded-2xl p-8"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Key className="w-6 h-6" style={{ color: '#a67c52' }} strokeWidth={1.5} />
                <h2 className="text-xl font-semibold" style={{ color: '#1a1512' }}>
                  Your API Key
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1a1512' }}>
                    {selectedProject.name}
                  </label>
                  <div className="flex gap-3">
                    <div 
                      className="flex-1 px-4 py-3 rounded-xl border font-mono text-sm flex items-center gap-3"
                      style={{
                        backgroundColor: '#f5f5f0',
                        borderColor: '#e5e7eb',
                        color: '#736a62'
                      }}
                    >
                      <span className="flex-1">
                        {showApiKey ? selectedProject.apiKey : maskKey(selectedProject.apiKey)}
                      </span>
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-1 rounded-lg transition-colors"
                        style={{ color: '#736a62' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e5e7eb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedProject.apiKey)}
                      className="px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
                      style={{
                        backgroundColor: apiKeyCopied ? '#22c55e' : '#a67c52',
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        if (!apiKeyCopied) {
                          e.currentTarget.style.backgroundColor = '#956b47';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!apiKeyCopied) {
                          e.currentTarget.style.backgroundColor = '#a67c52';
                        }
                      }}
                    >
                      {apiKeyCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {apiKeyCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Installation Guide */}
        <div className="mb-8">
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="w-6 h-6" style={{ color: '#a67c52' }} strokeWidth={1.5} />
              <h2 className="text-xl font-semibold" style={{ color: '#1a1512' }}>
                Installation
              </h2>
            </div>

            <div 
              className="rounded-xl p-4 font-mono text-sm"
              style={{
                backgroundColor: '#2c2420',
                color: '#f5f5f0'
              }}
            >
              {codeSnippets[activeTab].install}
            </div>
          </div>
        </div>

        {/* Implementation Steps */}
        <div>
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Code2 className="w-6 h-6" style={{ color: '#a67c52' }} strokeWidth={1.5} />
              <h2 className="text-xl font-semibold" style={{ color: '#1a1512' }}>
                Implementation
              </h2>
            </div>

            {/* Framework Tabs */}
            <div className="flex gap-2 mb-6 border-b" style={{ borderColor: '#e5e7eb' }}>
              {(['react', 'nodejs', 'javascript'] as Framework[]).map((framework) => (
                <button
                  key={framework}
                  onClick={() => setActiveTab(framework)}
                  className="px-4 py-2 font-medium transition-all"
                  style={{
                    color: activeTab === framework ? '#a67c52' : '#736a62',
                    borderBottom: activeTab === framework ? '2px solid #a67c52' : '2px solid transparent',
                    marginBottom: '-1px'
                  }}
                >
                  {framework === 'react' ? 'React' : framework === 'nodejs' ? 'Node.js' : 'JavaScript'}
                </button>
              ))}
            </div>

            {/* Code Examples */}
            <div className="space-y-6">
              {/* Setup */}
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#1a1512' }}>
                  1. Initialize the SDK
                </h3>
                <div 
                  className="rounded-xl p-4 font-mono text-sm whitespace-pre-wrap"
                  style={{
                    backgroundColor: '#2c2420',
                    color: '#f5f5f0'
                  }}
                >
                  {codeSnippets[activeTab].setup}
                </div>
              </div>

              {/* Usage */}
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#1a1512' }}>
                  2. Use Feature Flags
                </h3>
                <div 
                  className="rounded-xl p-4 font-mono text-sm whitespace-pre-wrap"
                  style={{
                    backgroundColor: '#2c2420',
                    color: '#f5f5f0'
                  }}
                >
                  {codeSnippets[activeTab].usage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
