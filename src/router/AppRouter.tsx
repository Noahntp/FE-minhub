import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/app/AppContext';

// Route Modules
import { PublicAuthRoutes, PublicMainRoutes } from './routes/PublicRoutes';
import { LearnerRoutes } from './routes/LearnerRoutes';
import { InstructorMainRoutes, InstructorWorkspaceRoutes } from './routes/InstructorRoutes';
import { AdminRoutes } from './routes/AdminRoutes';
import { CartRoutes } from './routes/CartRoutes';

// Loading Fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-normal"></div>
  </div>
);

// Lazy Loaded Error Pages
const ForbiddenPage = React.lazy(() => import('@/features/errors/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })));
const ServerErrorPage = React.lazy(() => import('@/features/errors/ServerErrorPage').then((m) => ({ default: m.ServerErrorPage })));
const NotFoundPage = React.lazy(() => import('@/features/errors/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function AppRoutes() {
  const {
    isLoggedIn: rawIsLoggedIn,
    currentUser: rawCurrentUser,
    setCurrentUser,
    isInitializingAuth,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPreview = import.meta.env.VITE_ADMIN_PREVIEW === 'true';
  const isLoggedIn = isAdminPreview ? true : rawIsLoggedIn;
  const currentUser = isAdminPreview
    ? {
        id: '1',
        name: 'Admin Preview',
        email: 'admin@preview.com',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin',
        role: 'admin' as const,
      }
    : rawCurrentUser;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/login';
  };

  const navigateTo = (path: string) => {
    navigate(path.startsWith('/') ? path : `/${path}`);
  };

  if (isInitializingAuth) {
    return <PageLoader />;
  }

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          
          {/* Auth & Legacy Redirect Routes */}
          {PublicAuthRoutes()}

          {/* Main Layout Routes (Navbar + Footer) */}
          <Route element={<MainLayout />}>
            {PublicMainRoutes()}
            {LearnerRoutes({ isLoggedIn, currentUser, setCurrentUser, navigateTo, handleLogout })}
            {InstructorMainRoutes({ currentUser })}
            {CartRoutes()}
          </Route>

          {/* Instructor Workspace (No Main Navbar/Footer) */}
          {InstructorWorkspaceRoutes({ isLoggedIn, currentUser })}

          {/* Admin Workspace */}
          {AdminRoutes({ isLoggedIn, currentUser })}

          {/* Error Pages */}
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
