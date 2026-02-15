import { motion, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Code, Zap, Shield, Terminal } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
        <a href="#docs" className="hover:text-white transition-colors">Docs</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
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
          <>
            <button 
              onClick={() => navigate('/app/dashboard')}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/app/dashboard')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 transition-all animate-pulse-subtle"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

const Hero = () => {
  const navigate = useNavigate();
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
          <button 
            onClick={() => navigate('/app/dashboard')}
            className="px-8 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Create Free Account
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText('npm install flagforge');
              // Optional: Add toast notification here
            }}
            className="px-8 py-4 rounded-xl bg-white/5 text-white font-medium text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group active:scale-95"
          >
            <Terminal className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            <span>npm install flagforge</span>
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
      <Footer />
    </div>
  );
}
