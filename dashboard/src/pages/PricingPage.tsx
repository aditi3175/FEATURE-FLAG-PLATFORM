import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, CreditCard, Shield, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AuthButton from '../components/AuthButton';

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();

  const plans = [
    {
      name: "Developer",
      price: isAnnual ? "0" : "0",
      description: "Perfect for side projects and learning.",
      features: [
        "Up to 3 projects",
        "5,000 requests/month",
        "1 team member",
        "Basic boolean flags",
        "Community support"
      ],
      notIncluded: [
        "Multivariate flags",
        "Analytics dashboard",
        "Role-based access",
        "SLA Support"
      ],
      cta: "Start for Free",
      popular: false,
      color: "blue"
    },
    {
      name: "Startup",
      price: isAnnual ? "29" : "39",
      description: "For growing teams shipping daily.",
      features: [
        "Unlimited projects",
        "1M requests/month",
        "5 team members",
        "All flag types",
        "Analytics dashboard",
        "Email support",
        "30-day improved retention"
      ],
      notIncluded: [
        "Role-based access",
        "SLA Support",
        "SSO / SAML"
      ],
      cta: "Start Free Trial",
      popular: true,
      color: "purple"
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with strict compliance.",
      features: [
        "Unlimited everything",
        "Custom request limits",
        "Unlimited seats",
        "RBAC & Audit logs",
        "SSO / SAML",
        "Dedicated success manager",
        "99.99% SLA"
      ],
      notIncluded: [],
      cta: "Contact Sales",
      popular: false,
      color: "emerald"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans pb-20">
      {/* Navbar Placeholder - Should match LandingPage or import it if modular */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-black/50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-display">FlagForge</span>
        </div>
        <div className="flex items-center gap-6">
           <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Home</Link>
           <AuthButton />
        </div>
      </nav>

      <div className="pt-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Start free, scale when you need to. No hidden fees or surprise overages.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <motion.div
                className="absolute top-1 left-1 w-5 h-5 rounded-full bg-indigo-500 shadow-sm"
                animate={{ x: isAnnual ? 28 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-gray-500'}`}>
              Yearly <span className="text-emerald-500 text-xs ml-1">(Save 20%)</span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-2xl border ${
                plan.popular ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10 bg-[#0a0a0a]'
              } hover:border-white/20 transition-all group`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20">
                  Most Popular
                </div>
              )}

              <div className="text-left mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 h-10">{plan.description}</p>
              </div>

              <div className="text-left mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price === "Custom" ? "Custom" : `$${plan.price}`}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-gray-500">/mo</span>
                  )}
                </div>
                {isAnnual && plan.price !== "Custom" && (
                  <div className="text-xs text-emerald-500 mt-1">Billed annually</div>
                )}
              </div>

              <div className="space-y-4 mb-8 text-left">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className={`w-4 h-4 mt-0.5 text-${plan.color}-400 shrink-0`} />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                    <X className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <AuthButton
                mode="signup"
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25 text-white' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {plan.cta}
              </AuthButton>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-20 py-12 border-t border-white/10 text-center">
            <h3 className="text-xl font-bold mb-4">Enterprise Features</h3>
            <div className="flex flex-wrap justify-center gap-8 text-gray-400">
                <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> SOC2 Compliance</div>
                <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Invoice Billing</div>
                <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Dedicated Support</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
