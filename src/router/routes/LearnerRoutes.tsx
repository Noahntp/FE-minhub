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

const ProtectedRouteWrapper = ({ isLoggedIn, children }: { isLoggedIn: boolean, children: React.ReactNode }) => {
  const location = useLocation();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" state={{ from: location.pathname }} replace />;
};

export const LearnerRoutes = ({ isLoggedIn, currentUser, setCurrentUser, navigateTo, handleLogout }: LearnerRoutesProps) => {

  return (
    <>
      {/* Learning & Classroom */}
      <Route path="/learn/:courseId" element={<ProtectedRouteWrapper isLoggedIn={isLoggedIn}><ClassroomPage /></ProtectedRouteWrapper>} />
      <Route path="/learning/:courseId" element={<ProtectedRouteWrapper isLoggedIn={isLoggedIn}><ClassroomPage /></ProtectedRouteWrapper>} />
      <Route path="/lessons/:courseId" element={<ProtectedRouteWrapper isLoggedIn={isLoggedIn}><ClassroomPage /></ProtectedRouteWrapper>} />
      <Route path="/learn/lessons/:courseId" element={<ProtectedRouteWrapper isLoggedIn={isLoggedIn}><ClassroomPage /></ProtectedRouteWrapper>} />
      
      {/* Dashboard & Profile */}
      <Route path="/my-courses" element={<ProtectedRouteWrapper isLoggedIn={isLoggedIn}><MyCoursesPage /></ProtectedRouteWrapper>} />
      <Route path="/favorites" element={<ProtectedRouteWrapper isLoggedIn={isLoggedIn}><FavoritesPage /></ProtectedRouteWrapper>} />
      <Route path="/achievements" element={<ProtectedRouteWrapper isLoggedIn={isLoggedIn}><AchievementsPage /></ProtectedRouteWrapper>} />
      <Route path="/notifications" element={<ProtectedRouteWrapper isLoggedIn={isLoggedIn}><NotificationPage /></ProtectedRouteWrapper>} />
      <Route path="/certificates" element={<ProtectedRouteWrapper isLoggedIn={isLoggedIn}><CertificateCenterPage /></ProtectedRouteWrapper>} />
      <Route path="/purchase-history" element={<ProtectedRouteWrapper isLoggedIn={isLoggedIn}><PurchaseHistoryPage /></ProtectedRouteWrapper>} />
      
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
