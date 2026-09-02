import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { LearnerProtectedGuard } from '../RouteGuards';

const MyCoursesPage = React.lazy(() => import('@/features/courses/MyCoursesPage').then((m) => ({ default: m.default })));
const FavoritesPage = React.lazy(() => import('@/features/courses/FavoritesPage').then((m) => ({ default: m.default })));
const AchievementsPage = React.lazy(() => import('@/features/profile/AchievementsPage').then((m) => ({ default: m.default })));
const NotificationPage = React.lazy(() => import('@/features/notifications/NotificationPage').then((m) => ({ default: m.default })));
const CertificateCenterPage = React.lazy(() => import('@/features/certificates/CertificateCenterPage').then((m) => ({ default: m.default })));
const PurchaseHistoryPage = React.lazy(() => import('@/features/purchase-history/PurchaseHistoryPage').then((m) => ({ default: m.default })));
const ClassroomPage = React.lazy(() => import('@/features/classroom/ClassroomPage').then((m) => ({ default: m.default })));
const ProfilePage = React.lazy(() => import('@/features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));

interface LearnerRoutesProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  navigateTo: (path: string) => void;
  handleLogout: () => void;
}

export const LearnerRoutes = ({ currentUser, setCurrentUser, navigateTo, handleLogout }: LearnerRoutesProps) => {
  return (
    <>
      {/* Learning & Classroom */}
      <Route path="/learn/:courseId" element={<LearnerProtectedGuard><ClassroomPage /></LearnerProtectedGuard>} />
      <Route path="/learning/:courseId" element={<LearnerProtectedGuard><ClassroomPage /></LearnerProtectedGuard>} />
      <Route path="/lessons/:courseId" element={<LearnerProtectedGuard><ClassroomPage /></LearnerProtectedGuard>} />
      <Route path="/learn/lessons/:courseId" element={<LearnerProtectedGuard><ClassroomPage /></LearnerProtectedGuard>} />
      
      {/* Dashboard & Profile */}
      <Route path="/my-courses" element={<LearnerProtectedGuard><MyCoursesPage /></LearnerProtectedGuard>} />
      <Route path="/favorites" element={<LearnerProtectedGuard><FavoritesPage /></LearnerProtectedGuard>} />
      <Route path="/achievements" element={<LearnerProtectedGuard><AchievementsPage /></LearnerProtectedGuard>} />
      <Route path="/notifications" element={<LearnerProtectedGuard><NotificationPage /></LearnerProtectedGuard>} />
      <Route path="/certificates" element={<LearnerProtectedGuard><CertificateCenterPage /></LearnerProtectedGuard>} />
      <Route path="/purchase-history" element={<LearnerProtectedGuard><PurchaseHistoryPage /></LearnerProtectedGuard>} />
      
      <Route path="/settings" element={<Navigate to="/profile" replace />} />
      <Route path="/profile/:userId?" element={
        <LearnerProtectedGuard>
          <ProfilePage
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            navigateTo={navigateTo}
            onLogout={handleLogout}
          />
        </LearnerProtectedGuard>
      } />
    </>
  );
};
