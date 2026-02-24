import { motion, useMotionValue } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Code, Zap, Shield, Terminal, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthButton from '../components/AuthButton';

// Glowing background effect component
const GlowBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]"
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
      />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
    </div>
  );
};

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-black/50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white font-display">FlagForge</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <button
            onClick={() => navigate('/app/dashboard')}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition-all flex items-center gap-2"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <AuthButton />
        )}
      </div>
    </nav>
  );
};

const Hero = () => {
  const [copied, setCopied] = useState(false);
  
  return (
    <section className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-amber-500 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          v2.0 is now live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 pb-2">
          Release with Confidence,<br />Not Chaos.
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          The feature management platform for high-velocity engineering teams. 
          Decouple deploy from release and ship faster with safety.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <div className="hidden sm:block">
             <AuthButton 
               mode="signup"
               className="px-8 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
             >
               Create Free Account
             </AuthButton>
          </div>
          
          <button 
            onClick={() => {
              navigator.clipboard.writeText('npm install flagforge');
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-8 py-4 rounded-xl bg-white/5 text-white font-medium text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group active:scale-95 relative"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-500" />
            ) : (
              <Terminal className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            )}
            <span>{copied ? 'Copied!' : 'npm install flagforge'}</span>
            
            {/* Toast/Tooltip Effect */}
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -20 }}
                exit={{ opacity: 0 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold"
              >
                Copied!
              </motion.div>
            )}
          </button>
        </div>
      </motion.div>

      {/* Dashboard Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="mt-20 w-full max-w-6xl rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-purple-500/10 overflow-hidden relative group perspective-1000"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20 pointer-events-none" />
        
        {/* Mock Dashboard UI */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
          </div>
          <div className="text-xs text-gray-500 font-mono">dashboard / production</div>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0c0c0c]">
          {/* Stat Card Mock */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400 font-medium">Total Requests</span>
              <BarChartIcon className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">2.4M</div>
            <div className="text-xs text-emerald-500 flex items-center gap-1">
              <span className="w-full bg-emerald-500/20 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-emerald-500"
                />
              </span>
              +12%
            </div>
          </div>
          
          {/* Active Flags Mock */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden group-hover:border-purple-500/30 transition-colors duration-500">
            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-sm text-gray-400 font-medium">Active Flags</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-500">Live</span>
              </div>
            </div>
            <div className="space-y-3 relative z-10">
              {['dark_mode_v2', 'new_checkout_flow', 'ai_assistant_beta'].map((flag) => (
                <div key={flag} className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-gray-300">{flag}</span>
                  </div>
                  <div className="text-[10px] text-gray-600">100%</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Latency Mock */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400 font-medium">Avg Latency</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">24ms</div>
            <div className="h-8 flex items-end gap-1">
              {[40, 65, 30, 50, 80, 45, 60, 35, 55, 70].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                  className="flex-1 bg-white/10 rounded-t-sm hover:bg-amber-500 hover:shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all cursor-crosshair"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const Features = () => {
  const customEase = [0.17, 0.55, 0.55, 1] as const;
  
  const cards = [
    {
      title: "Define",
      description: "Create flags in seconds with our auto-slugging dashboard. Type-safe and validated.",
      icon: Code,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20"
    },
    {
      title: "Integrate",
      description: "Simple SDK integration for React, Node, Python, and Go. Zero-latency caching.",
      icon: Terminal,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20"
    },
    {
      title: "Control",
      description: "Gradual rollouts, kill-switches, and real-time analytics. You are in command.",
      icon: Shield,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20"
    }
  ];

  return (
    <section id="features" className="py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Designed for Speed</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Built by engineers, for engineers. Every interaction is optimized for developer happiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: customEase }}
              className={`p-8 rounded-2xl bg-[#0c0c0c] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className={`w-12 h-12 rounded-lg ${card.bg} border ${card.border} flex items-center justify-center mb-6`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {card.description}
              </p>
              
              <div className="mt-6 flex items-center text-sm font-medium text-gray-500 group-hover:text-white transition-colors cursor-pointer">
                Learn more <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 border-t border-white/5 bg-black text-center relative z-10">
    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="text-xl font-bold text-white">FlagForge</span>
      </div>
      
      <p className="text-gray-500 text-sm mb-8">
        &copy; {new Date().getFullYear()} FlagForge Inc. All rights reserved.
      </p>
      
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <a href="#" className="hover:text-white transition-colors">Privacy</a>
        <a href="#" className="hover:text-white transition-colors">Terms</a>
        <a href="#" className="hover:text-white transition-colors">Twitter</a>
        <a href="#" className="hover:text-white transition-colors">GitHub</a>
      </div>
    </div>
  </footer>
);

const InteractiveDemo = () => {
  const [flags, setFlags] = useState({
    promoBanner: true,
    darkMode: false,
    newPricing: false,
  });
  const [testUserId, setTestUserId] = useState('user-123');

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const flagConfigs = [
    { key: 'promoBanner' as const, label: 'promo-banner', description: 'Show promotional banner', activeBg: 'bg-amber-500/10 border border-amber-500/20', activeText: 'text-amber-400' },
    { key: 'darkMode' as const, label: 'dark-mode', description: 'Enable dark mode theme', activeBg: 'bg-purple-500/10 border border-purple-500/20', activeText: 'text-purple-400' },
    { key: 'newPricing' as const, label: 'new-pricing', description: 'Show new pricing tier', activeBg: 'bg-emerald-500/10 border border-emerald-500/20', activeText: 'text-emerald-400' },
  ];

  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400 mb-4">
            🎮 Interactive Demo
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Try It Yourself</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Toggle the flags below and watch the app change in real-time. No signup required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Live Preview + SDK Code */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Live Preview</div>
            <div
              className={`rounded-2xl border overflow-hidden transition-all duration-500 ${
                flags.darkMode
                  ? 'bg-[#0c0c0c] border-white/10'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Mock Browser Bar */}
              <div className={`flex items-center gap-2 px-4 py-2.5 border-b transition-colors duration-500 ${
                flags.darkMode ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50'
              }`}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                </div>
                <div className={`flex-1 text-center text-xs font-mono transition-colors duration-500 ${
                  flags.darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  mystore.com/products
                </div>
              </div>

              {/* Mock App Content */}
              <div className="p-6">
                {/* Promo Banner */}
                <motion.div
                  initial={false}
                  animate={{
                    height: flags.promoBanner ? 'auto' : 0,
                    opacity: flags.promoBanner ? 1 : 0,
                    marginBottom: flags.promoBanner ? 16 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg px-4 py-2.5 text-white text-sm font-medium flex items-center justify-between">
                    <span>🔥 Summer Sale — 50% off all plans!</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Limited</span>
                  </div>
                </motion.div>

                {/* Product Card */}
                <div className="flex gap-4">
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 transition-colors duration-500 ${
                    flags.darkMode ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    📦
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-base font-bold transition-colors duration-500 ${
                      flags.darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Pro Starter Kit
                    </h3>
                    <p className={`text-xs mt-1 transition-colors duration-500 ${
                      flags.darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Everything you need to ship fast
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <motion.span
                        key={flags.newPricing ? 'new' : 'old'}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-lg font-bold transition-colors duration-500 ${
                          flags.darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {flags.newPricing ? '$19/mo' : '$29/mo'}
                      </motion.span>
                      {flags.newPricing && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium border border-emerald-500/20"
                        >
                          34% off
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button className={`w-full mt-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-500 ${
                  flags.darkMode
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}>
                  Get Started →
                </button>
              </div>
            </div>

            {/* Evaluation Tester */}
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-2 mb-3 font-medium">🧪 Test Evaluation</div>
            <div className="rounded-xl bg-[#0c0c0c] border border-white/5 p-5">
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-600 uppercase tracking-wider mb-1 block">User ID</label>
                  <input
                    type="text"
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    placeholder="user-123"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-600 uppercase tracking-wider mb-1 block">Flag</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-amber-400">
                    promo-banner
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  flags.promoBanner ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {flags.promoBanner ? '✓' : '✗'}
                </div>
                <div>
                  <div className="text-sm text-white font-medium">
                    Result: <span className={flags.promoBanner ? 'text-emerald-400' : 'text-red-400'}>{flags.promoBanner ? 'ENABLED' : 'DISABLED'}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    bucket: {Math.abs((testUserId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 31) % 100)}/100 · rollout: {flags.promoBanner ? '50%' : '0%'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: SDK Code + Feature Flags */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {/* SDK Code */}
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">SDK Code</div>
            <div className="rounded-xl bg-[#0c0c0c] border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <span className="text-xs text-gray-500 font-mono">app.ts</span>
                </div>
                <span className="text-[10px] text-gray-600 font-mono">TypeScript</span>
              </div>
              <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-blue-300">promo</span>{' = '}
                  <span className="text-amber-300">client</span>
                  <span className="text-white">.getVariant(</span>
                  <span className="text-emerald-300">'promo-banner'</span>
                  <span className="text-white">, userId);</span>{'\n'}
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-blue-300">theme</span>{' = '}
                  <span className="text-amber-300">client</span>
                  <span className="text-white">.getVariant(</span>
                  <span className="text-emerald-300">'dark-mode'</span>
                  <span className="text-white">, userId);</span>{'\n'}
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-blue-300">price</span>{' = '}
                  <span className="text-amber-300">client</span>
                  <span className="text-white">.getVariant(</span>
                  <span className="text-emerald-300">'new-pricing'</span>
                  <span className="text-white">, userId);</span>{'\n\n'}
                  <span className="text-gray-500">{'// Results right now:'}</span>{'\n'}
                  <span className="text-gray-500">{'// '}</span>
                  <span className="text-white">promo</span>
                  <span className="text-gray-500">{' → '}</span>
                  <span className={flags.promoBanner ? 'text-emerald-400' : 'text-red-400'}>
                    {flags.promoBanner ? 'true' : 'false'}
                  </span>{'\n'}
                  <span className="text-gray-500">{'// '}</span>
                  <span className="text-white">theme</span>
                  <span className="text-gray-500">{' → '}</span>
                  <span className={flags.darkMode ? 'text-emerald-400' : 'text-red-400'}>
                    {flags.darkMode ? 'true' : 'false'}
                  </span>{'\n'}
                  <span className="text-gray-500">{'// '}</span>
                  <span className="text-white">price</span>
                  <span className="text-gray-500">{' → '}</span>
                  <span className={flags.newPricing ? 'text-emerald-400' : 'text-red-400'}>
                    {flags.newPricing ? 'true' : 'false'}
                  </span>
                </code>
              </pre>
            </div>

            {/* Flag Toggles */}
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-2 mb-3 font-medium">Feature Flags</div>
            <div className="space-y-3">
              {flagConfigs.map((flag) => (
                <button
                  key={flag.key}
                  onClick={() => toggleFlag(flag.key)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                    flags[flag.key]
                      ? 'bg-[#0c0c0c] border-white/10'
                      : 'bg-[#0c0c0c] border-white/5 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      flags[flag.key]
                        ? flag.activeBg
                        : 'bg-white/5 border border-white/5'
                    }`}>
                      <Code className={`w-4 h-4 transition-colors ${
                        flags[flag.key] ? flag.activeText : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <div className={`text-sm font-mono font-medium transition-colors ${
                        flags[flag.key] ? 'text-white' : 'text-gray-500'
                      }`}>
                        {flag.label}
                      </div>
                      <div className="text-xs text-gray-500">{flag.description}</div>
                    </div>
                  </div>
                  {flags[flag.key] ? (
                    <ToggleRight className="w-7 h-7 text-amber-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-gray-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Helper Icon for Bento Mock
const BarChartIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30 overflow-x-hidden font-sans">
      <GlowBackground />
      <Navbar />
      <Hero />
      <Features />
      <InteractiveDemo />
      <Footer />
    </div>
  );
}
