import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { getDashboardRouteByRole } from './routes';

export const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
  </div>
);

/**
 * Normalizes role string to canonical 'admin' | 'instructor' | 'learner'
 */
export function normalizeRole(role?: string): 'admin' | 'instructor' | 'learner' {
  if (!role) return 'learner';
  const lower = String(role).toLowerCase().trim();
  if (lower === 'admin') return 'admin';
  if (lower === 'instructor') return 'instructor';
  return 'learner';
}

/**
 * Guard for specific workspaces (Admin -> only admin, Instructor -> only instructor).
 * Blocks cross-role access and unauthenticated access.
 */
export const WorkspaceRouteGuard: React.FC<{
  allowedRole: 'admin' | 'instructor';
  children: React.ReactNode;
}> = ({ allowedRole, children }) => {
  const { isLoggedIn, currentUser, isInitializingAuth } = useApp();
  const location = useLocation();

  if (isInitializingAuth) {
    return <PageLoader />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  const role = normalizeRole(currentUser?.role);

  if (role !== allowedRole) {
    // Cross-role redirect:
    // If admin attempts to visit instructor -> redirect to admin dashboard
    // If instructor attempts to visit admin -> redirect to instructor dashboard
    // If learner attempts to visit admin/instructor -> redirect to 403
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === 'instructor') {
      return <Navigate to="/instructor/dashboard" replace />;
    }
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

/**
 * Guard for learner-only protected features (/my-courses, /learn/*, /favorites, /profile, etc.).
 * Admin & Instructor are NOT allowed to access learner protected features.
 */
export const LearnerProtectedGuard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isLoggedIn, currentUser, isInitializingAuth } = useApp();
  const location = useLocation();

  if (isInitializingAuth) {
    return <PageLoader />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  const role = normalizeRole(currentUser?.role);

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (role === 'instructor') {
    return <Navigate to="/instructor/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Guard for public storefront routes (/, /courses, /category, /instructors, /cart, etc.).
 * - Guests (not logged in): allowed.
 * - Learners: allowed.
 * - Admin: strictly redirected to /admin/dashboard.
 * - Instructor: strictly redirected to /instructor/dashboard.
 */
export const PublicStorefrontGuard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isLoggedIn, currentUser, isInitializingAuth } = useApp();

  if (isInitializingAuth) {
    return <PageLoader />;
  }

  if (isLoggedIn) {
    const role = normalizeRole(currentUser?.role);
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === 'instructor') {
      return <Navigate to="/instructor/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

/**
 * Guard for authentication pages (/login, /register, /forgot-password, /reset-password).
 * If already logged in, automatically redirects to user's assigned workspace:
 * - Admin -> /admin/dashboard
 * - Instructor -> /instructor/dashboard
 * - Learner -> /
 */
export const AuthGuestGuard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isLoggedIn, currentUser, isInitializingAuth } = useApp();

  if (isInitializingAuth) {
    return <PageLoader />;
  }

  if (isLoggedIn) {
    const target = getDashboardRouteByRole(currentUser?.role);
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};
