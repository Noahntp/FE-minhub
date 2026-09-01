import React from 'react';
import { Route, Navigate, useLocation } from 'react-router-dom';

const MyCoursesPage = React.lazy(() => import('@/features/courses/MyCoursesPage').then((m) => ({ default: m.default })));
const FavoritesPage = React.lazy(() => import('@/features/courses/FavoritesPage').then((m) => ({ default: m.default })));
const AchievementsPage = React.lazy(() => import('@/features/profile/AchievementsPage').then((m) => ({ default: m.default })));
const NotificationPage = React.lazy(() => import('@/features/notifications/NotificationPage').then((m) => ({ default: m.default })));
const CertificateCenterPage = React.lazy(() => import('@/features/certificates/CertificateCenterPage').then((m) => ({ default: m.default })));
const PurchaseHistoryPage = React.lazy(() => import('@/features/purchase-history/PurchaseHistoryPage').then((m) => ({ default: m.default })));
const ClassroomPage = React.lazy(() => import('@/features/classroom/ClassroomPage').then((m) => ({ default: m.default })));
const ProfilePage = React.lazy(() => import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));

interface LearnerRoutesProps {
  isLoggedIn: boolean;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  navigateTo: (path: string) => void;
  handleLogout: () => void;
}

export const LearnerRoutes = ({ isLoggedIn, currentUser, setCurrentUser, navigateTo, handleLogout }: LearnerRoutesProps) => {
  const location = useLocation();

  const protectedRoute = (element: React.ReactNode) => {
    return isLoggedIn ? element : <Navigate to="/login" state={{ from: location.pathname }} replace />;
  };

  return (
    <>
      {/* Learning & Classroom */}
      <Route path="/learn/:courseId" element={protectedRoute(<ClassroomPage />)} />
      <Route path="/learning/:courseId" element={protectedRoute(<ClassroomPage />)} />
      <Route path="/lessons/:courseId" element={protectedRoute(<ClassroomPage />)} />
      <Route path="/learn/lessons/:courseId" element={protectedRoute(<ClassroomPage />)} />
      
      {/* Dashboard & Profile */}
      <Route path="/my-courses" element={protectedRoute(<MyCoursesPage />)} />
      <Route path="/favorites" element={protectedRoute(<FavoritesPage />)} />
      <Route path="/achievements" element={protectedRoute(<AchievementsPage />)} />
      <Route path="/notifications" element={protectedRoute(<NotificationPage />)} />
      <Route path="/certificates" element={protectedRoute(<CertificateCenterPage />)} />
      <Route path="/purchase-history" element={protectedRoute(<PurchaseHistoryPage />)} />
      
      <Route path="/settings" element={<Navigate to="/profile" replace />} />
      <Route path="/profile/:userId?" element={
        isLoggedIn ? (
          <ProfilePage
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            navigateTo={navigateTo}
            onLogout={handleLogout}
          />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
    </>
  );
};
