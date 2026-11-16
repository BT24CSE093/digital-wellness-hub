import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ShieldCheck, LogOut, CheckCircle, Layers, BookOpen, ArrowRight, Award, MessageSquare } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Admin Panel — {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Platform governance, resource verification, and content moderation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => logout()}
            className="flex items-center gap-2 hover:border-rose-500/50 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>

      {/* Content Management Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <Link
          to="/admin/resources"
          className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 hover:bg-slate-900/90 transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Layers className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Manage Resources
              </h2>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Create, review, edit, and toggle staff verification for student tools.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/guides"
          className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 hover:bg-slate-900/90 transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Manage Guides
              </h2>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Author step-by-step device configuration tutorials for iOS, Android, and desktop.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/challenges"
          className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 hover:bg-slate-900/90 transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Award className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Manage Challenges
              </h2>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Create and curate structured multi-day student wellness challenges.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/community"
          className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 hover:bg-slate-900/90 transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Community Moderation
              </h2>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review resource suggestions, convert to directory tools, and resolve reports.
            </p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Verified Tools</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-bold text-emerald-400 font-mono">8+</span>
          <p className="text-xs text-slate-500 mt-2">Active in public knowledge directory</p>
        </Card>

        <Card className="border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Device Guides</span>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-3xl font-bold text-blue-400 font-mono">6</span>
          <p className="text-xs text-slate-500 mt-2">Multi-platform tutorials available</p>
        </Card>

        <Card className="border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Your Role</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">ADMIN</span>
          <p className="text-xs text-slate-500 mt-2">Full platform administration privileges</p>
        </Card>
      </div>

      <Card className="border-slate-800">
        <h2 className="text-base font-semibold text-white mb-2">RBAC Verification Active</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          This route is protected by both client-side (<code className="text-emerald-400 font-mono text-xs">AdminRoute.tsx</code>) and server-side (<code className="text-emerald-400 font-mono text-xs">requireRole(['ADMIN'])</code>) middleware guards. Non-admin student accounts attempting to view this page receive an explicit 403 Forbidden rejection.
        </p>
      </Card>
    </div>
  );
};
