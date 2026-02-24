import { useState, useEffect } from 'react';
import { Code, Copy, Check, Terminal, FileCode, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedPage from '../components/ProtectedPage';
import { ProjectAPI } from '../services/api';

interface Project {
  id: string;
  name: string;
  apiKey: string;
}

export default function SDKSetup() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedSDK, setSelectedSDK] = useState('javascript');
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await ProjectAPI.getProjects();
      setProjects(data);
      if (data.length > 0) {
        const saved = localStorage.getItem('selectedProjectId');
        const match = saved && data.find((p: any) => p.id === saved);
        setSelectedProjectId(match ? saved : data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const apiKey = selectedProject?.apiKey || 'No project selected';

  const sdks = [
    { id: 'javascript', name: 'JavaScript', icon: '📦' },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'node', name: 'Node.js', icon: '🟢' },
    { id: 'python', name: 'Python', icon: '🐍' },
  ];

  const codeExamples: Record<string, {install: string; usage: string}> = {
    javascript: {
      install: 'npm install @flagforge/client',
      usage: `import { FlagForge } from '@flagforge/client';

const client = new FlagForge({
  apiKey: '${apiKey}',
  environment: 'production'
});

// Evaluate a flag
const isEnabled = await client.isEnabled('new-feature');

if (isEnabled) {
  console.log('Feature is ON');
}`
    },
    react: {
      install: 'npm install @flagforge/react',
      usage: `import { FlagForgeProvider, useFlag } from '@flagforge/react';

function App() {
  return (
    <FlagForgeProvider apiKey="${apiKey}">
      <MyComponent />
    </FlagForgeProvider>
  );
}

function MyComponent() {
  const { isEnabled } = useFlag('new-feature');
  
  return (
    <div>
      {isEnabled && <NewFeature />}
    </div>
  );
}`
    },
    node: {
      install: 'npm install @flagforge/node',
      usage: `const { FlagForge } = require('@flagforge/node');

const client = new FlagForge({
  apiKey: '${apiKey}',
  environment: 'production'
});

app.get('/api/data', async (req, res) => {
  const showBeta = await client.isEnabled('beta-features');
  
  res.json({ 
    data: 'value',
    beta: showBeta 
  });
});`
    },
    python: {
      install: 'pip install flagforge',
      usage: `from flagforge import Client

client = Client(
    api_key="${apiKey}",
    environment="production"
)

# Evaluate a flag
is_enabled = client.is_enabled("new-feature")

if is_enabled:
    print("Feature is ON")`
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <ProtectedPage>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-4 h-4 animate-spin text-[#f59e0b]" strokeWidth={2} />
        </div>
      </ProtectedPage>
    );
  }

  if (projects.length === 0) {
    return (
      <ProtectedPage>
        <div className="text-center py-20">
          <h2 className="text-lg font-semibold text-white mb-2">No Projects Found</h2>
          <p className="text-xs text-gray-500">Create a project first to get your API key</p>
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
        className="space-y-6 max-w-4xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">SDK Setup</h1>
            <p className="text-xs text-gray-500">Integrate FlagForge into your application</p>
          </div>
          
          {/* Project Selector */}
          <select
            value={selectedProjectId}
            onChange={(e) => { setSelectedProjectId(e.target.value); localStorage.setItem('selectedProjectId', e.target.value); }}
            className="px-4 py-2 rounded-lg bento-surface text-sm text-white focus:outline-none focus:border-white/10"
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* API Key Section */}
        <div className="bento-surface inner-glow rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-[#f59e0b]" strokeWidth={2} />
            <h2 className="text-sm font-medium text-white">API Key</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/5 font-mono text-xs text-gray-400">
              {apiKey}
            </div>
            <button
              onClick={handleCopyApiKey}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {copiedApiKey ? <Check className="w-4 h-4 text-emerald-400" strokeWidth={2} /> : <Copy className="w-4 h-4" strokeWidth={2} />}
            </button>
          </div>
          
          <p className="text-xs text-gray-600 mt-2">
            Keep your API key secure. Never commit it to version control.
          </p>
        </div>

        {/* SDK Selector */}
        <div className="flex gap-2">
          {sdks.map((sdk) => (
            <button
              key={sdk.id}
              onClick={() => setSelectedSDK(sdk.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedSDK === sdk.id 
                  ? 'bento-surface text-white' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
              }`}
            >
              <span className="mr-2">{sdk.icon}</span>
              {sdk.name}
            </button>
          ))}
        </div>

        {/* Installation */}
        <div className="bento-surface inner-glow rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#f59e0b]" strokeWidth={2} />
              <span className="text-sm font-medium text-white">Installation</span>
            </div>
            <button
              onClick={() => handleCopyCode(codeExamples[selectedSDK].install)}
              className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} /> : <Copy className="w-3.5 h-3.5" strokeWidth={2} />}
            </button>
          </div>
          
          {/* IDE-style code block */}
          <div className="relative bg-[#0a0a0a]">
            <div className="flex items-center gap-2 px-5 py-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <span className="text-xs text-gray-600 font-mono">terminal</span>
            </div>
            <div className="p-5 font-mono text-sm">
              <div className="flex items-start gap-3">
                <span className="text-gray-600 select-none">$</span>
                <code className="text-emerald-400">{codeExamples[selectedSDK].install}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bento-surface inner-glow rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#f59e0b]" strokeWidth={2} />
              <span className="text-sm font-medium text-white">Usage Example</span>
            </div>
            <button
              onClick={() => handleCopyCode(codeExamples[selectedSDK].usage)}
              className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} /> : <Copy className="w-3.5 h-3.5" strokeWidth={2} />}
            </button>
          </div>
          
          {/* IDE-style code block with line numbers */}
          <div className="relative bg-[#0a0a0a]">
            <div className="flex items-center gap-2 px-5 py-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <span className="text-xs text-gray-600 font-mono">index.{selectedSDK === 'python' ? 'py' : 'js'}</span>
            </div>
            <div className="flex">
              {/* Line Numbers */}
              <div className="px-4 py-5 border-r border-white/5 text-gray-600 font-mono text-xs select-none">
                {codeExamples[selectedSDK].usage.split('\n').map((_, i) => (
                  <div key={i} className="leading-6 text-right">{i + 1}</div>
                ))}
              </div>
              
              {/* Code */}
              <div className="flex-1 p-5">
                <pre className="font-mono text-xs leading-6">
                  <code className="text-gray-300">
                    {codeExamples[selectedSDK].usage.split('\n').map((line, i) => (
                      <div key={i}>
                        {line.includes('import') || line.includes('from') || line.includes('require') ? (
                          <span className="text-purple-400">{line}</span>
                        ) : line.includes('const') || line.includes('function') || line.includes('async') || line.includes('await') || line.includes('def') ? (
                          <span className="text-blue-400">{line}</span>
                        ) : line.includes('//') || line.includes('#') ? (
                          <span className="text-gray-600">{line}</span>
                        ) : line.includes('apiKey') || line.includes('api_key') ? (
                          <span className="text-amber-400">{line}</span>
                        ) : (
                          <span>{line}</span>
                        )}
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </ProtectedPage>
  );
}
