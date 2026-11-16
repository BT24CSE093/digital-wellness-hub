import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../App';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { StudentDashboardPage } from '../features/dashboard/pages/StudentDashboardPage';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { AdminResourcesPage } from '../features/admin/pages/AdminResourcesPage';
import { AdminGuidesPage } from '../features/admin/pages/AdminGuidesPage';
import { ResourceListPage } from '../features/resources/pages/ResourceListPage';
import { ResourceDetailPage } from '../features/resources/pages/ResourceDetailPage';
import { ResourceComparePage } from '../features/comparison/pages/ResourceComparePage';
import { GuideListPage } from '../features/guides/pages/GuideListPage';
import { GuideDetailPage } from '../features/guides/pages/GuideDetailPage';
import { FocusTimerPage } from '../features/wellness/pages/FocusTimerPage';
import { ScreenTimePage } from '../features/wellness/pages/ScreenTimePage';
import { DailyPlannerPage } from '../features/wellness/pages/DailyPlannerPage';
import { AssessmentPage } from '../features/wellness/pages/AssessmentPage';
import {
  ChallengeListPage,
  ChallengeDetailPage,
  MyChallengesPage,
  ChallengeProgressPage,
  AchievementsPage,
  AdminChallengesPage,
} from '../features/challenges';
import {
  CommunityPage,
  FeedbackPage,
  MySubmissionsPage,
  AdminCommunityPage,
} from '../features/community';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

// Layout wrapper for general pages that include Navbar & Footer with clean neutral dark theme
const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#e6edf3]">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing View */}
      <Route path="/" element={<App />} />

      {/* Public Only Auth Views (Redirects to /dashboard if logged in) */}
      <Route element={<PublicOnlyRoute />}>
        <Route
          path="/auth/login"
          element={
            <PageShell>
              <LoginPage />
            </PageShell>
          }
        />
        <Route
          path="/auth/register"
          element={
            <PageShell>
              <RegisterPage />
            </PageShell>
          }
        />
      </Route>

      {/* Protected Student Routes (Phase 2 & Phase 4) */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <PageShell>
              <StudentDashboardPage />
            </PageShell>
          }
        />
        <Route
          path="/wellness"
          element={
            <PageShell>
              <StudentDashboardPage />
            </PageShell>
          }
        />
        <Route
          path="/focus"
          element={
            <PageShell>
              <FocusTimerPage />
            </PageShell>
          }
        />
        <Route
          path="/screen-time"
          element={
            <PageShell>
              <ScreenTimePage />
            </PageShell>
          }
        />
        <Route
          path="/planner"
          element={
            <PageShell>
              <DailyPlannerPage />
            </PageShell>
          }
        />
        <Route
          path="/assessment"
          element={
            <PageShell>
              <AssessmentPage />
            </PageShell>
          }
        />
        {/* Phase 5 Student Challenge Routes */}
        <Route
          path="/challenges/my"
          element={
            <PageShell>
              <MyChallengesPage />
            </PageShell>
          }
        />
        <Route
          path="/challenges/my/:enrollmentId"
          element={
            <PageShell>
              <ChallengeProgressPage />
            </PageShell>
          }
        />
        <Route
          path="/achievements"
          element={
            <PageShell>
              <AchievementsPage />
            </PageShell>
          }
        />
        {/* Phase 6 Community Student Routes */}
        <Route
          path="/community"
          element={
            <PageShell>
              <CommunityPage />
            </PageShell>
          }
        />
        <Route
          path="/community/feedback"
          element={
            <PageShell>
              <FeedbackPage />
            </PageShell>
          }
        />
        <Route
          path="/community/my-submissions"
          element={
            <PageShell>
              <MySubmissionsPage />
            </PageShell>
          }
        />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route
          path="/admin"
          element={
            <PageShell>
              <AdminDashboardPage />
            </PageShell>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <PageShell>
              <AdminResourcesPage />
            </PageShell>
          }
        />
        <Route
          path="/admin/guides"
          element={
            <PageShell>
              <AdminGuidesPage />
            </PageShell>
          }
        />
        <Route
          path="/admin/challenges"
          element={
            <PageShell>
              <AdminChallengesPage />
            </PageShell>
          }
        />
        <Route
          path="/admin/community"
          element={
            <PageShell>
              <AdminCommunityPage />
            </PageShell>
          }
        />
      </Route>

      {/* Public Knowledge Base Routes (Phase 3) */}
      <Route
        path="/resources"
        element={
          <PageShell>
            <ResourceListPage />
          </PageShell>
        }
      />
      <Route
        path="/resources/:id"
        element={
          <PageShell>
            <ResourceDetailPage />
          </PageShell>
        }
      />
      <Route
        path="/compare"
        element={
          <PageShell>
            <ResourceComparePage />
          </PageShell>
        }
      />
      <Route
        path="/guides"
        element={
          <PageShell>
            <GuideListPage />
          </PageShell>
        }
      />
      <Route
        path="/guides/:slug"
        element={
          <PageShell>
            <GuideDetailPage />
          </PageShell>
        }
      />

      {/* Public Challenge Library Routes (Phase 5) */}
      <Route
        path="/challenges"
        element={
          <PageShell>
            <ChallengeListPage />
          </PageShell>
        }
      />
      <Route
        path="/challenges/:id"
        element={
          <PageShell>
            <ChallengeDetailPage />
          </PageShell>
        }
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <PageShell>
            <div className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-3xl font-bold text-rose-400">404 — Page Not Found</h1>
              <p className="text-slate-400 mt-2">The requested resource could not be found.</p>
            </div>
          </PageShell>
        }
      />
    </Routes>
  );
};
