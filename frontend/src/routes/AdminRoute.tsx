import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Compass } from 'lucide-react';

export const AdminRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse mb-4">
          <Compass className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400">Verifying authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">403 — Administrator Access Required</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          You are signed in as a student (<span className="text-emerald-400">{user?.email}</span>), which does not have administrative privileges.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          Return to Student Dashboard
        </a>
      </div>
    );
  }

  return <Outlet />;
};
