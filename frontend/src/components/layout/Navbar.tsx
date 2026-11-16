import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getComparisonIds } from '../../features/comparison/utils/comparisonStorage';
import {
  Compass,
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
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [compareCount, setCompareCount] = useState<number>(0);

  useEffect(() => {
    setCompareCount(getComparisonIds().length);
    const handleSync = () => {
      setCompareCount(getComparisonIds().length);
    };
    window.addEventListener('dwh_comparison_updated', handleSync);
    return () => window.removeEventListener('dwh_comparison_updated', handleSync);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600/30 transition-colors">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-base">Digital Wellness Hub</span>
            <span className="hidden sm:inline-block ml-2 text-xs text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50">
              v0.1
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link to="/resources" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
            <Layers className="h-4 w-4" /> Resources
          </Link>
          <Link to="/compare" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
            <SlidersHorizontal className="h-4 w-4" /> Compare
            {compareCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                {compareCount}
              </span>
            )}
          </Link>
          <Link to="/guides" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
            <BookOpen className="h-4 w-4" /> Guides
          </Link>
          <Link to="/focus" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
            <Clock className="h-4 w-4" /> Focus
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/screen-time" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                Screen Time
              </Link>
              <Link to="/planner" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                Planner
              </Link>
              <Link to="/assessment" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                Assessment
              </Link>
              <Link to="/achievements" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                <Trophy className="h-4 w-4" /> Achievements
              </Link>
              <Link to="/community" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                Community
              </Link>
              <Link to="/dashboard" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            </>
          )}

          <Link to="/challenges" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
            <Award className="h-4 w-4" /> Challenges
          </Link>

          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium text-slate-200">{user?.firstName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                  {user?.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
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
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/auth/register"
                className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
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
