import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { useHealthCheck } from './hooks/useHealthCheck';
import { InteractiveToolFinder } from './components/InteractiveToolFinder';
import { 
  Layers, 
  Sliders, 
  Clock, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Terminal,
  RadioTower,
  BookOpen,
} from 'lucide-react';

export const App: React.FC = () => {
  const { data: health, loading: healthLoading, error: healthError } = useHealthCheck();

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#e6edf3]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-16 pb-16 sm:pb-20 border-b border-[#30363d] bg-[#161b22]">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-4xl">
            {/* Campus Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold mb-6">
              <RadioTower className="h-4 w-4" />
              <span>OffGrid Campus • Student Digital Wellness Hub</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
              Take back control of your <span className="text-emerald-400">attention</span>.
            </h1>
            
            <p className="text-xl sm:text-2xl text-emerald-400/90 font-medium mb-4 tracking-wide">
              Your Digital Life. Your Rules.
            </p>

            <p className="text-[#8b949e] text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              An evidence-informed, privacy-respecting platform engineered for university students to reclaim deep study focus, configure devices intentionally, and step off the algorithmic treadmill.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/resources">
                <Button size="lg" variant="primary">
                  Explore Tool Directory <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/guides">
                <Button variant="secondary" size="lg">
                  <BookOpen className="h-4 w-4 mr-1 text-[#8b949e]" />
                  Native Device Guides
                </Button>
              </Link>
            </div>

            {/* Live Gateway Indicator */}
            <div className="mt-10 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-[#8b949e]">
              <span className="font-semibold text-[#c9d1d9] flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" /> System:
              </span>
              {healthLoading ? (
                <span className="text-amber-400 flex items-center gap-1">
                  Connecting...
                </span>
              ) : health ? (
                <span className="text-emerald-400 flex items-center gap-1 font-mono font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Online (v{health.version})
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Offline ({healthError || 'Starting...'})
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Interactive Tool Finder Widget Section */}
        <section className="py-12 bg-[#0d1117] border-b border-[#30363d]">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <InteractiveToolFinder />
          </div>
        </section>

        {/* Core Pillars Feature Grid */}
        <section className="py-16 sm:py-20 bg-[#161b22] border-b border-[#30363d]">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Built on Cognitive Science & Student Autonomy
              </h2>
              <p className="text-[#8b949e] text-sm sm:text-base mt-2">
                No invasive monitoring or punitive blockers. Practical tools to help you design a sustainable daily tech rhythm.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:border-[#58a6ff]/40 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Verified Resource Directory</h3>
                <p className="text-[#8b949e] text-xs sm:text-sm leading-relaxed">
                  Compare Free, Freemium, and Open-Source wellness tools with zero marketing bias and clear device compatibility.
                </p>
              </Card>

              <Card className="hover:border-[#58a6ff]/40 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center justify-center mb-4 group-hover:bg-[#30363d] transition-colors">
                  <Sliders className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Native Device Guides</h3>
                <p className="text-[#8b949e] text-xs sm:text-sm leading-relaxed">
                  Step-by-step setup tutorials for iOS, Android, macOS & Windows focus filters, grayscale, and scheduled downtime.
                </p>
              </Card>

              <Card className="hover:border-[#58a6ff]/40 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center justify-center mb-4 group-hover:bg-[#30363d] transition-colors">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Focus Sprint Timer</h3>
                <p className="text-[#8b949e] text-xs sm:text-sm leading-relaxed">
                  Customizable deep-work interval timer paired with intention setting, mindful distraction logs, and Recharts trends.
                </p>
              </Card>

              <Card className="hover:border-[#58a6ff]/40 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center justify-center mb-4 group-hover:bg-[#30363d] transition-colors">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Habit Challenges</h3>
                <p className="text-[#8b949e] text-xs sm:text-sm leading-relaxed">
                  Micro-challenges designed for student routines: phone-free mornings, digital sunset rituals, and streak rewards.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section className="py-8 bg-[#0d1117]">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8b949e]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-[#c9d1d9]">Architecture:</span>
                <span>Modular Monolith • Node/Express • React/Vite • PostgreSQL/Prisma</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="bg-[#161b22] border border-[#30363d] px-2 py-0.5 rounded text-[#8b949e]">React 18</span>
                <span className="bg-[#161b22] border border-[#30363d] px-2 py-0.5 rounded text-[#8b949e]">TypeScript</span>
                <span className="bg-[#161b22] border border-[#30363d] px-2 py-0.5 rounded text-[#8b949e]">Tailwind CSS</span>
                <span className="bg-[#161b22] border border-[#30363d] px-2 py-0.5 rounded text-[#8b949e]">Prisma</span>
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
