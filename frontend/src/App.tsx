import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { useHealthCheck } from './hooks/useHealthCheck';
import { 
  Sparkles, 
  Layers, 
  Sliders, 
  Clock, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Terminal
} from 'lucide-react';

export const App: React.FC = () => {
  const { data: health, loading: healthLoading, error: healthError } = useHealthCheck();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 sm:pb-24 border-b border-slate-900 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Phase 1 Initialized — Project Scaffolding & Setup</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
              DIGITAL WELLNESS HUB
            </h1>
            
            <p className="text-xl sm:text-2xl text-emerald-400 font-semibold mb-6 tracking-wide">
              Your Digital Life. Your Rules.
            </p>

            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              An evidence-informed, privacy-respecting platform engineered for university students to reclaim focus, configure devices intentionally, and overcome digital fatigue.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/resources">
                <Button size="lg" className="shadow-lg shadow-emerald-900/30">
                  Explore Resources <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/guides">
                <Button variant="secondary" size="lg">
                  Device Setup Guides
                </Button>
              </Link>
            </div>

            {/* Live API Health Check Indicator */}
            <div className="mt-12 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" /> API Gateway Status:
              </span>
              {healthLoading ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> Connecting...
                </span>
              ) : health ? (
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Healthy ({health.service} v{health.version})
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Offline ({healthError || 'Server not started'})
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Core Pillars Feature Grid */}
        <section className="py-16 sm:py-24 bg-slate-950">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Designed for Intentional Study & Mental Clarity
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-3">
                No invasive device monitoring or punitive lockdowns. Modular tools built on cognitive science and student autonomy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:border-slate-700 transition-all group">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Resource Comparisons</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Compare Free, Paid, Freemium, and Open-Source productivity and wellness tools with transparent privacy audits.
                </p>
              </Card>

              <Card className="hover:border-slate-700 transition-all group">
                <div className="h-12 w-12 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-5 group-hover:bg-teal-500/20 transition-colors">
                  <Sliders className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Device Configurations</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Interactive step-by-step tutorials to configure iOS/Android focus filters, scheduled grayscale, and notification triage.
                </p>
              </Card>

              <Card className="hover:border-slate-700 transition-all group">
                <div className="h-12 w-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:bg-cyan-500/20 transition-colors">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Focus & Screen-Time</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Customizable deep-work interval timer paired with intention setting, mindful distraction logs, and Recharts trends.
                </p>
              </Card>

              <Card className="hover:border-slate-700 transition-all group">
                <div className="h-12 w-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:bg-indigo-500/20 transition-colors">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Wellness Challenges</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Micro-challenges designed for student routines: phone-free mornings, digital sunset rituals, and streak rewards.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Architectural Tech Stack Badge Section */}
        <section className="py-12 bg-slate-900/50 border-t border-slate-900">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-slate-300">Phase 0 Architecture:</span>
                <span>Modular Monolith • Node/Express • React/Vite • PostgreSQL/Prisma</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">React 18</span>
                <span className="bg-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">TypeScript 5</span>
                <span className="bg-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">Tailwind CSS 3</span>
                <span className="bg-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">Prisma 5</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default App;
