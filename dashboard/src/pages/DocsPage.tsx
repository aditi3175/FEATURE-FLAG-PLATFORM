import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Code, Terminal, ChevronRight, Zap, Menu, X, Shield, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AuthButton from '../components/AuthButton';

const DocsPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    {
      title: "Getting Started",
      items: [
        { id: "introduction", title: "Introduction", icon: Zap },
        { id: "installation", title: "Installation", icon: Terminal },
        { id: "quickstart", title: "Quickstart", icon: Zap },
      ]
    },
    {
      title: "Core Concepts",
      items: [
        { id: "feature-flags", title: "Feature Flags", icon: Book },
        { id: "environments", title: "Environments", icon: Code },
        { id: "targeting", title: "Targeting Rules", icon:  Terminal }, // Using generic icon
      ]
    },
    {
      title: "SDK Reference",
      items: [
        { id: "react-sdk", title: "React SDK", icon: Code },
        { id: "node-sdk", title: "Node.js SDK", icon: Terminal },
      ]
    }
  ];

  const content = {
    introduction: (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 font-display">
                Introduction
            </h1>
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          FlagForge is a developer-first feature management platform designed to help you release code safely and faster.
          Decouple your deployment from your release and control feature rollouts with precision.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="group p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 hover:border-purple-500/50 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Safe Rollouts</h3>
                <p className="text-gray-400 leading-relaxed">Gradually release features to a percentage of users to limit blast radius. Catch bugs before they reach everyone.</p>
            </div>
            <div className="group p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 hover:border-red-500/50 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Instant Kill Switches</h3>
                <p className="text-gray-400 leading-relaxed">Turn off buggy features instantly without redeploying code. Sleep soundly knowing you can revert instantly.</p>
            </div>
        </div>
      </div>
    ),
    installation: (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">Installation</h1>
            <p className="text-lg text-gray-400">
            Get up and running with FlagForge in seconds. We support major frameworks out of the box.
            </p>
        </div>
        
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                1. Install the SDK
            </h3>
            <div className="group relative bg-[#0a0a0a] p-4 rounded-xl border border-white/10 font-mono text-sm text-gray-300 flex items-center justify-between hover:border-white/20 transition-colors">
                <div className="flex gap-2">
                    <span className="text-purple-400">$</span>
                    <span>npm install flagforge-react-sdk</span>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100">
                    Copy
                </button>
            </div>
        </div>

        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                2. Initialize the Provider
            </h3>
            <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/10 overflow-x-auto text-sm font-mono leading-relaxed relative group hover:border-white/20 transition-colors">
                <div className="absolute top-4 right-4 flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                </div>
                <div className="text-gray-400">
                    <span className="text-purple-400">import</span> {`{ FlagForgeProvider }`} <span className="text-purple-400">from</span> <span className="text-green-400">'flagforge-react-sdk'</span>;
                    <br /><br />
                    <span className="text-blue-400">const</span> <span className="text-yellow-400">App</span> = () ={`>`} (
                    <br />
                    &nbsp;&nbsp;{`<`}FlagForgeProvider <span className="text-blue-400">apiKey</span>=<span className="text-green-400">"YOUR_API_KEY"</span>{`>`}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;{`<`}YourApp /{`>`}
                    <br />
                    &nbsp;&nbsp;{`</`}FlagForgeProvider{`>`}
                    <br />
                    );
                </div>
            </div>
        </div>
      </div>
    ),
    quickstart: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">Quickstart</h1>
                <p className="text-lg text-gray-400">Follow our 3-minute guide to create your first flag and use it in your code.</p>
            </div>
            
            <div className="relative space-y-8 mt-8 pl-4">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-500 via-purple-500/20 to-transparent" />

                {[
                    { title: "Create a Project", desc: "Go to the dashboard and create a new project. You'll get two environments: Production and Development." },
                    { title: "Create a Feature Flag", desc: "Create a flag with key 'new-feature'. Set it to 'Off' initially to test the default behavior." },
                    { title: "Connect SDK", desc: "Use your Client-side SDK Key to connect your application to FlagForge." }
                ].map((step, i) => (
                    <div key={i} className="relative flex gap-6 group">
                        <div className="w-10 h-10 rounded-full bg-[#050505] border border-purple-500 text-purple-400 flex items-center justify-center font-bold shrink-0 z-10 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                            {i + 1}
                        </div>
                        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 flex-1 hover:border-white/20 transition-all group-hover:-translate-y-1">
                            <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ),
    "feature-flags": (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">Feature Flags</h1>
                <p className="text-lg text-gray-400">
                    Feature flags (toggles) allow you to modify system behavior without changing code.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 hover:border-blue-500/40 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                        <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Boolean Flags</h3>
                    <p className="text-sm text-gray-400 mb-4">Simple ON/OFF switches. The bread and butter of feature management.</p>
                    <div className="bg-[#050505] p-3 rounded-lg border border-white/5 font-mono text-xs text-blue-300">
                        useFlag('new-feature', false)
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                        <Code className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Multivariate Flags</h3>
                    <p className="text-sm text-gray-400 mb-4">Serve strings, numbers, or JSON. Perfect for A/B testing and configuration.</p>
                    <div className="bg-[#050505] p-3 rounded-lg border border-white/5 font-mono text-xs text-purple-300">
                        useVariant('button-color', 'blue')
                    </div>
                </div>
            </div>
        </div>
    ),
    environments: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">Environments</h1>
                <p className="text-lg text-gray-400">
                    Manage your flags across different stages of your deployment lifecycle.
                </p>
            </div>

            <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 shrink-0">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-500 mb-1">Security Best Practice</h4>
                        <p className="text-amber-200/70 text-sm leading-relaxed">
                            Never use the same SDK key for Development and Production. Isolating environments prevents accidental leaks of unfinished features to production users.
                        </p>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-bold mt-4 font-display">SDK Keys & Security</h3>
            <div className="grid gap-4">
                <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <h4 className="font-bold text-white">Client-side Key</h4>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">Safe for public exposure. Used in React, Vue, Mobile apps.</p>
                        <div className="inline-flex items-center px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs border border-green-500/20">
                            Public
                        </div>
                    </div>
                    <div className="w-full md:w-px h-px md:h-20 bg-white/10" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            <h4 className="font-bold text-white">Server-side Key</h4>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">Has administrative privileges. Used in Node.js, Python, Go.</p>
                        <div className="inline-flex items-center px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs border border-red-500/20">
                            Secret
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ),
    targeting: (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">Targeting Rules</h1>
                <p className="text-lg text-gray-400">
                    Control exactly who sees what feature with granular targeting rules.
                </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/10">
                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest text-xs mb-6">Rule Evaluation Flow</h3>
                <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
                    <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 w-full text-center">
                        <span className="text-purple-400 font-mono block mb-1">Context</span>
                        <span className="text-gray-400">user.email</span>
                    </div>
                     <ArrowRight className="text-gray-600 rotate-90 md:rotate-0" />
                    <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 w-full text-center">
                        <span className="text-blue-400 font-mono block mb-1">Operator</span>
                        <span className="text-gray-400">ENDS_WITH</span>
                    </div>
                     <ArrowRight className="text-gray-600 rotate-90 md:rotate-0" />
                     <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 w-full text-center">
                        <span className="text-green-400 font-mono block mb-1">Value</span>
                        <span className="text-gray-400">@company.com</span>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-bold mt-4 font-display">Rollouts</h3>
            <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/10">
                 <p className="text-gray-400 mb-4">Percentage-based rollouts allow you to gradually increase traffic to a new feature.</p>
                 
                 {/* Visualization of rollout */}
                 <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex mb-2">
                     <div className="w-[10%] bg-purple-500" />
                     <div className="w-[90%] bg-gray-800" />
                 </div>
                 <div className="flex justify-between text-xs text-gray-500 font-mono">
                     <span className="text-purple-400">10% ON</span>
                     <span>90% OFF</span>
                 </div>
            </div>
        </div>
    ),
    "react-sdk": (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">React SDK</h1>
                <p className="text-lg text-gray-400">Components and hooks for your React applications.</p>
            </div>
            
            <div className="space-y-6">
                <div className="group">
                    <div className="flex items-center gap-2 mb-3">
                        <code className="text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">useFlag</code>
                        <span className="text-gray-400 text-sm">Boolean evaluation</span>
                    </div>
                    <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/10 group-hover:border-purple-500/30 transition-colors">
                        <pre className="text-sm font-mono text-gray-300">
                            <span className="text-blue-400">const</span> showNewFeature = <span className="text-yellow-400">useFlag</span>(<span className="text-green-400">'new-feature'</span>, <span className="text-red-400">false</span>);
                        </pre>
                    </div>
                </div>

                <div className="group">
                    <div className="flex items-center gap-2 mb-3">
                         <code className="text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">useVariant</code>
                         <span className="text-gray-400 text-sm">Multivariate evaluation</span>
                    </div>
                    <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/10 group-hover:border-blue-500/30 transition-colors">
                         <pre className="text-sm font-mono text-gray-300">
                            <span className="text-blue-400">const</span> buttonColor = <span className="text-yellow-400">useVariant</span>(<span className="text-green-400">'btn-color'</span>, <span className="text-green-400">'blue'</span>);
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    ),
    "node-sdk": (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">Node.js SDK</h1>
                <p className="text-lg text-gray-400">Server-side SDK for high-performance flag evaluation in your backend services.</p>
            </div>

            <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden">
                <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    <span className="ml-4 font-mono text-xs text-gray-500">server.ts</span>
                </div>
                <div className="p-6 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300 leading-relaxed">
<span className="text-purple-400">import</span> FlagForge <span className="text-purple-400">from</span> <span className="text-green-400">'flagforge-node'</span>;

<span className="text-blue-400">const</span> client = <span className="text-blue-400">new</span> <span className="text-yellow-400">FlagForge</span>(<span className="text-green-400">'SERVER_SDK_KEY'</span>);
<span className="text-purple-400">await</span> client.<span className="text-yellow-400">waitForInitialization</span>();

<span className="text-gray-500">// Evaluate with context</span>
<span className="text-blue-400">const</span> isEnabled = <span className="text-purple-400">await</span> client.<span className="text-yellow-400">boolVariation</span>(<span className="text-green-400">'new-feature'</span>, {`{`}
    key: <span className="text-green-400">'user-123'</span>,
    email: <span className="text-green-400">'user@example.com'</span>
{`}`}, <span className="text-red-400">false</span>);
                    </pre>
                </div>
            </div>
        </div>
    )
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col md:flex-row">
      {/* Mobile Navbar with Menu Toggle */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-black/50">
          <div className="flex items-center gap-2" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold font-display">FlagForge</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
      </nav>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-black border-r border-white/5 z-40 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:block overflow-y-auto`}>
         <div className="p-6 hidden md:flex items-center gap-2 cursor-pointer mb-8" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold font-display">FlagForge Docs</span>
         </div>
         
         <div className="px-4 space-y-8 mt-20 md:mt-0">
            <div className="mb-2 px-2">
                <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group">
                    <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>
            {sections.map((section) => (
                <div key={section.title}>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">{section.title}</h4>
                    <div className="space-y-1">
                        {section.items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                    activeSection === item.id 
                                        ? 'bg-white/10 text-white' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <item.icon className="w-4 h-4 opacity-70" />
                                {item.title}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
         </div>
         
         <div className="p-4 mt-8 border-t border-white/10">
             <AuthButton className="w-full justify-center" />
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 md:pl-20 max-w-4xl mx-auto pt-24 md:pt-12 min-h-screen">
         <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
         >
             {content[activeSection as keyof typeof content] || (
                 <div className="text-center py-20 text-gray-500">
                    <h1 className="text-2xl font-bold mb-2">Coming Soon</h1>
                    <p>This documentation section is under construction.</p>
                 </div>
             )}
         </motion.div>
      </main>
    </div>
  );
};

export default DocsPage;
