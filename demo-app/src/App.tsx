import { useState } from 'react';
import { 
  Zap, 
  Shield, 
  Layout, 
  Check, 
  RefreshCw, 
  Moon, 
  Sun,
  X
} from 'lucide-react';
import { FlagForgeProvider, useFlag, useVariant, useFlagForgeLoading } from '../../sdk/src/react';

// API Key from environment variable (stored in .env file, not committed to git)
// To set up: Copy .env.example to .env and add your API key from FlagForge Dashboard
const DEMO_API_KEY = import.meta.env.VITE_FLAGFORGE_API_KEY || 'REPLACE_WITH_YOUR_API_KEY'; 

function AppContent() {
  const [userId, setUserId] = useState('user-demo-123');
  const loading = useFlagForgeLoading();
  
  // Feature Flags - now with userId parameter
  const showPromoBanner = useFlag('promo-banner', userId);
  const showProPlan = useFlag('show-pro-plan', userId);
  const isBetaTester = useFlag('beta-tester', userId);
  const enableNewsletter = useFlag('enable-newsletter', userId);

  // A/B Testing - Multivariate Flags
  const buttonColor = useVariant('button-color', userId, 'default');

  // Local state for UI
  const [darkMode, setDarkMode] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(true);

  // Apply dark mode class
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  const toggleDarkMode = () => setDarkMode(!darkMode);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] text-[#1a1512]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-[#a67c52]" />
          <p>Connecting to FlagForge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#1a1512] text-[#f5f5f0]' : 'bg-[#f5f5f0] text-[#1a1512]'}`}>
      
      {/* 1. Feature Flag: Promo Banner */}
      {showPromoBanner && (
        <div className="bg-[#a67c52] text-white py-2 px-4 text-center text-sm font-medium animate-fade-in relative">
          <span>✨ Limited Time Offer: Get 50% off all plans!</span>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs opacity-75 border px-1 rounded">Flag: promo-banner</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className={`w-8 h-8 ${darkMode ? 'text-[#a67c52]' : 'text-[#a67c52]'}`} />
          <span className="text-xl font-bold tracking-tight">ClientDemo</span>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[#a67c52] transition-colors">Features</a>
          <a href="#" className="hover:text-[#a67c52] transition-colors">Pricing</a>
          
          {/* 2. Feature Flag: Dark Mode Toggle (Beta Feature) */}
          {isBetaTester ? (
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-[#2c2420] hover:bg-[#3d322c]' : 'bg-[#e5e5e0] hover:bg-[#d4d4d0]'}`}
              title="Beta Feature: Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-[#a67c52]" /> : <Moon className="w-5 h-5 text-[#a67c52]" />}
            </button>
          ) : (
            <div className="text-xs opacity-40 italic" title="Enable 'beta-tester' flag to see this">
              Theme locked
            </div>
          )}

          <button className="bg-[#1a1512] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#2c2420] transition-colors dark:bg-[#f5f5f0] dark:text-[#1a1512]">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a67c52]/10 text-[#a67c52] text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>Powered by FlagForge</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Feature Management <br/>
            <span className="text-[#a67c52]">Made Simple.</span>
          </h1>
          <p className={`text-xl mb-10 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-[#736a62]'}`}>
            Ship faster with confidence. Separate deployment from release and manage features with total control.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="bg-[#a67c52] text-white px-8 py-4 rounded-xl font-semibold btn-hover-effect hover:shadow-lg hover:bg-[#956b47] transition-all">
              Get Started
            </button>
            <button className={`px-8 py-4 rounded-xl font-semibold border transition-all ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-[#d4c5b0] hover:bg-white'}`}>
              View Documentation
            </button>
          </div>
        </div>

        {/* A/B Testing Section */}
        <div className={`mb-16 p-8 rounded-2xl border ${darkMode ? 'bg-[#211b17] border-gray-800' : 'bg-white border-[#e5e5e0]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">A/B Test</div>
            <h3 className="text-lg font-bold">CTA Button Experiment</h3>
          </div>
          <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-[#736a62]'}`}>
            This button's style changes based on which variant the user is assigned to via the <code className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs">button-color</code> multivariate flag. Change the User ID in the debug panel to see different variants!
          </p>
          
          <div className="flex items-center gap-6 flex-wrap">
            {buttonColor === 'green' ? (
              <button className="px-8 py-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                🟢 Get Started — Variant A
              </button>
            ) : buttonColor === 'purple' ? (
              <button className="px-8 py-4 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20">
                🟣 Get Started — Variant B
              </button>
            ) : buttonColor === 'orange' ? (
              <button className="px-8 py-4 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                🟠 Get Started — Variant C
              </button>
            ) : (
              <button className="px-8 py-4 rounded-xl font-semibold text-white bg-[#a67c52] hover:bg-[#956b47] transition-all">
                Get Started — Default
              </button>
            )}

            <div className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-[#999]'}`}>
              <div>User: <span className="text-[#a67c52]">{userId}</span></div>
              <div>Assigned: <span className={buttonColor !== 'default' ? 'text-purple-500 font-bold' : 'text-red-400'}>{buttonColor}</span></div>
              <div className="mt-1 opacity-60">Flag: button-color (Multivariate)</div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Plan */}
          <div className={`p-8 rounded-2xl border transition-all hover:shadow-lg ${darkMode ? 'bg-[#211b17] border-gray-800' : 'bg-white border-[#e5e5e0]'}`}>
            <h3 className="text-xl font-semibold mb-2">Starter</h3>
            <div className="text-4xl font-bold mb-6">$0</div>
            <ul className="space-y-4 mb-8">
              {['Up to 1,000 MAU', '2 Projects', 'Basic Targeting', 'Community Support'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm opacity-80">
                  <Check className="w-4 h-4 text-[#a67c52]" /> {feat}
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-xl font-medium border transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-[#e5e5e0] hover:bg-[#f5f5f0]'}`}>
              Current Plan
            </button>
          </div>

          {/* Standard Plan */}
          <div className={`p-8 rounded-2xl border-2 border-[#a67c52] relative transform scale-105 shadow-xl ${darkMode ? 'bg-[#2c2420]' : 'bg-[#fffbf7]'}`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#a67c52] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Popular
            </div>
            <h3 className="text-xl font-semibold mb-2">Growth</h3>
            <div className="text-4xl font-bold mb-6">$49</div>
            <ul className="space-y-4 mb-8">
              {['Up to 10,000 MAU', 'Unlimited Projects', 'Advanced Rules', 'Email Support'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm opacity-80">
                  <Check className="w-4 h-4 text-[#a67c52]" /> {feat}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl font-medium bg-[#a67c52] text-white hover:bg-[#956b47] transition-colors">
              Upgrade Now
            </button>
          </div>

          {/* 3. Feature Flag: Pro Plan (Controlled by show-pro-plan) */}
          {showProPlan ? (
            <div className={`p-8 rounded-2xl border transition-all hover:shadow-lg relative overflow-hidden ${darkMode ? 'bg-[#211b17] border-gray-800' : 'bg-white border-[#e5e5e0]'}`}>
              <div className="absolute top-4 right-4 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200">
                Flag: show-pro-plan
              </div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                Pro <Shield className="w-4 h-4 text-purple-500" />
              </h3>
              <div className="text-4xl font-bold mb-6">$99</div>
              <ul className="space-y-4 mb-8">
                {['Unlimited MAU', 'SSO & SAML', 'Audit Logs', 'Priority Support'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm opacity-80">
                    <Check className="w-4 h-4 text-purple-500" /> {feat}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-medium border transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-[#e5e5e0] hover:bg-[#f5f5f0]'}`}>
                Contact Sales
              </button>
            </div>
          ) : (
            <div className={`p-8 rounded-2xl border flex items-center justify-center opacity-50 border-dashed ${darkMode ? 'border-gray-800' : 'border-[#e5e5e0]'}`}>
              <div className="text-center">
                <p className="text-sm font-medium mb-1">More plans coming soon</p>
                <p className="text-xs">Enable 'show-pro-plan' to see Pro tier</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. Feature Flag: Newsletter Popup */}
      {enableNewsletter && showNewsletter && (
        <div className="fixed bottom-6 right-6 md:right-auto md:left-1/2 md:-translate-x-1/2 bg-white dark:bg-[#2c2420] p-6 rounded-2xl shadow-2xl border border-[#e5e5e0] dark:border-[#3d322c] w-full max-w-sm z-40 animate-slide-up">
          <button 
            onClick={() => setShowNewsletter(false)}
            className="absolute top-2 right-2 p-1 opacity-50 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-4">
            <div className="bg-[#a67c52]/10 p-3 rounded-xl">
              <Zap className="w-6 h-6 text-[#a67c52]" />
            </div>
            <div>
              <h4 className="font-bold mb-1">Stay updated</h4>
              <p className="text-sm opacity-70 mb-3">Get the latest features and updates delivered to your inbox.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter email" 
                  className="flex-1 px-3 py-2 rounded-lg border text-sm bg-transparent"
                />
                <button className="bg-[#a67c52] text-white px-3 py-2 rounded-lg text-sm font-medium">
                  Subscribe
                </button>
              </div>
              <div className="mt-2 text-[10px] opacity-50">Flag: enable-newsletter</div>
            </div>
          </div>
        </div>
      )}

      {/* DEBUG PANEL */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-black/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-white/10 w-80">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">FlagForge Debug</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 block">
                Current User ID
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/10 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-[#a67c52]"
                />
                <button 
                  onClick={() => setUserId('user-' + Math.random().toString(36).substring(7))}
                  className="bg-white/10 px-2 py-1 rounded text-xs hover:bg-white/20"
                >
                  Random
                </button>
              </div>
            </div>

            <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 block">
                Active Flags
              </label>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono bg-white/5 px-2 py-1 rounded">
                  <span className="opacity-80">promo-banner</span>
                  <span className={showPromoBanner ? 'text-green-400' : 'text-red-400'}>
                    {showPromoBanner.toString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono bg-white/5 px-2 py-1 rounded">
                  <span className="opacity-80">show-pro-plan</span>
                  <span className={showProPlan ? 'text-green-400' : 'text-red-400'}>
                    {showProPlan.toString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono bg-white/5 px-2 py-1 rounded">
                  <span className="opacity-80">beta-tester</span>
                  <span className={isBetaTester ? 'text-green-400' : 'text-red-400'}>
                    {isBetaTester.toString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono bg-white/5 px-2 py-1 rounded">
                  <span className="opacity-80">enable-newsletter</span>
                  <span className={enableNewsletter ? 'text-green-400' : 'text-red-400'}>
                    {enableNewsletter.toString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                  <span className="opacity-80">button-color</span>
                  <span className="text-purple-400">
                    {buttonColor || 'default'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <FlagForgeProvider apiKey={DEMO_API_KEY} apiUrl="https://flagforge-api.onrender.com">
      <AppContent />
    </FlagForgeProvider>
  );
}
