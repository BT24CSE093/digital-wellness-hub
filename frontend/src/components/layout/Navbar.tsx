import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getComparisonIds } from '../../features/comparison/utils/comparisonStorage';
import {
  RadioTower,
  BookOpen,
  Clock,
  Award,
  Shield,
  Layers,
  LayoutDashboard,
  LogOut,
  User,
  SlidersHorizontal,
  Trophy,
  ChevronDown,
  Sparkles,
  Calendar,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [compareCount, setCompareCount] = useState<number>(0);

  // Dropdown states
  const [exploreOpen, setExploreOpen] = useState(false);
  const [wellnessOpen, setWellnessOpen] = useState(false);

  const exploreRef = useRef<HTMLDivElement>(null);
  const wellnessRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCompareCount(getComparisonIds().length);
    const handleSync = () => {
      setCompareCount(getComparisonIds().length);
    };
    window.addEventListener('dwh_comparison_updated', handleSync);
    return () => window.removeEventListener('dwh_comparison_updated', handleSync);
  }, []);

  useEffect(() => {
    setExploreOpen(false);
    setWellnessOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
      if (wellnessRef.current && !wellnessRef.current.contains(e.target as Node)) {
        setWellnessOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isExploreActive = ['/resources', '/compare', '/guides'].some((path) =>
    location.pathname.startsWith(path)
  );
  const isWellnessActive = ['/focus', '/screen-time', '/planner', '/assessment'].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo - OffGrid Campus */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-400 transition-all">
            <RadioTower className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base">OffGrid</span>
              <span className="font-semibold tracking-wider text-emerald-400 text-xs uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                Campus
              </span>
            </div>
            <span className="text-[10px] text-[#8b949e] font-mono -mt-0.5">Digital Wellness Hub</span>
          </div>
        </Link>

        {/* Grouped Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium text-[#c9d1d9]">
          {/* Group 1: Explore Dropdown */}
          <div className="relative" ref={exploreRef}>
            <button
              onClick={() => {
                setExploreOpen(!exploreOpen);
                setWellnessOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                isExploreActive
                  ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                  : 'hover:text-white hover:bg-[#21262d]'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Explore</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`} />
            </button>

            {exploreOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-xl p-2 animate-fade-in z-50">
                <Link
                  to="/resources"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#21262d] hover:text-emerald-400 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400">Resource Directory</span>
                    <p className="text-[11px] text-[#8b949e] line-clamp-1">Curated focus & privacy tools</p>
                  </div>
                </Link>

                <Link
                  to="/compare"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#21262d] hover:text-emerald-400 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-0.5">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-400">Compare Tools</span>
                      {compareCount > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {compareCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8b949e] line-clamp-1">Side-by-side feature matrix</p>
                  </div>
                </Link>

                <Link
                  to="/guides"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#21262d] hover:text-emerald-400 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-0.5">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400">Device Setup Guides</span>
                    <p className="text-[11px] text-[#8b949e] line-clamp-1">Native iOS, Android & PC setups</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Group 2: Student Wellness Suite Dropdown */}
          <div className="relative" ref={wellnessRef}>
            <button
              onClick={() => {
                setWellnessOpen(!wellnessOpen);
                setExploreOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                isWellnessActive
                  ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                  : 'hover:text-white hover:bg-[#21262d]'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Wellness Tools</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${wellnessOpen ? 'rotate-180' : ''}`} />
            </button>

            {wellnessOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-xl p-2 animate-fade-in z-50">
                <Link
                  to="/focus"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#21262d] hover:text-emerald-400 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400">Focus Timer</span>
                    <p className="text-[11px] text-[#8b949e] line-clamp-1">Pomodoro with intention setting</p>
                  </div>
                </Link>

                <Link
                  to="/screen-time"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#21262d] hover:text-emerald-400 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400">Screen Time Logs</span>
                    <p className="text-[11px] text-[#8b949e] line-clamp-1">Reflective daily logging & charts</p>
                  </div>
                </Link>

                <Link
                  to="/planner"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#21262d] hover:text-emerald-400 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400">Daily Planner</span>
                    <p className="text-[11px] text-[#8b949e] line-clamp-1">Intentional day architecting</p>
                  </div>
                </Link>

                <Link
                  to="/assessment"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#21262d] hover:text-emerald-400 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400">Self-Assessment</span>
                    <p className="text-[11px] text-[#8b949e] line-clamp-1">Holistic wellness tier score</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Group 3: Challenges */}
          <Link
            to="/challenges"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              location.pathname.startsWith('/challenges')
                ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                : 'hover:text-white hover:bg-[#21262d]'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Challenges</span>
          </Link>

          {/* Group 4: Community */}
          <Link
            to="/community"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              location.pathname.startsWith('/community')
                ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                : 'hover:text-white hover:bg-[#21262d]'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Community</span>
          </Link>

          {/* Group 5: Authenticated links */}
          {isAuthenticated && (
            <>
              <Link
                to="/achievements"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  location.pathname === '/achievements'
                    ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'hover:text-white hover:bg-[#21262d]'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Badges</span>
              </Link>
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  location.pathname === '/dashboard'
                    ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'hover:text-white hover:bg-[#21262d]'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </>
          )}

          {/* Admin link */}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 transition-colors font-semibold"
            >
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#21262d] border border-[#30363d] text-xs">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-white">{user?.firstName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#30363d] text-[#8b949e] font-mono">
                  {user?.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#8b949e] hover:text-rose-400 px-3 py-1.5 rounded-xl hover:bg-[#21262d] transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="text-xs sm:text-sm font-medium text-[#c9d1d9] hover:text-white px-3.5 py-1.5 rounded-xl hover:bg-[#21262d] transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/auth/register"
                className="text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded-xl shadow-xs transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
