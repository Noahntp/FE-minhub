import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layouts
import MainLayout from '@/layouts/MainLayout';

// Pages
import { ProfilePage } from '@/features/profile/ProfilePage';
import CartAndCheckout from '@/features/cart/CartAndCheckout';
import VNPayReturnPage from '@/features/cart/VNPayReturnPage';
import InstructorCoursesPage from '@/features/instructor/components/InstructorCoursesPage';
import InstructorDashboard from '@/features/instructor/InstructorDashboard';
import AdminDashboard from '@/features/admin/AdminDashboard';
import { InstructorProfile } from '@/features/instructor/components/InstructorProfile';
import AuthScreens from '@/features/auth/components/AuthScreens';
import ClassroomScreen from '@/features/classroom/components/ClassroomScreen';
import CourseDetailPage from '@/features/courses/CourseDetailPage';
import CourseListPage from '@/features/courses/CourseListPage';
import MyCoursesPage from '@/features/courses/MyCoursesPage';
import ClassroomPage from '@/features/classroom/ClassroomPage';
import { NotFoundPage } from '@/features/errors/NotFoundPage';

import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import { useApp } from '@/app/AppContext';

// Simple placeholder components for missing pages until they are migrated
import HomePage from '@/features/home/HomePage';
const ExplorePage = () => <div className="p-10 text-center"><h1 className="text-3xl font-bold">Khám Phá (Đang cập nhật)</h1></div>;

import LegalPage from '@/pages/LegalPage';
import SettingsPage from '@/features/settings/SettingsPage';
import FavoritesPage from '@/features/courses/FavoritesPage';
import RoadmapsPage from '@/features/roadmaps/RoadmapsPage';
import RoadmapDetailPage from '@/features/roadmaps/RoadmapDetailPage';
import InstructorsPage from '@/features/instructor/InstructorsPage';
import AchievementsPage from '@/features/profile/AchievementsPage';
import NotificationPage from '@/features/notifications/NotificationPage';
import CertificateCenterPage from '@/features/certificates/CertificateCenterPage';
import PurchaseHistoryPage from '@/features/purchase-history/PurchaseHistoryPage';
import SearchPage from '@/features/search/SearchPage';
import CategoryDetailPage from '@/features/category/CategoryDetailPage';
import LearningCalendarPage from '@/features/calendar/LearningCalendarPage';
import InstructorProfilePage from '@/features/instructor/InstructorProfilePage';
import FAQPage from '@/pages/FAQPage';
import PricingPage from '@/pages/PricingPage';
import { ForbiddenPage } from '@/features/errors/ForbiddenPage';
import { ServerErrorPage } from '@/features/errors/ServerErrorPage';

function AppRoutes() {
  const { isLoggedIn, currentUser, enrolledCourseIds, courses, favorites } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = (path: string) => {
    navigate(path.startsWith('/') ? path : `/${path}`);
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth Routes */}
        <Route path="/login" element={<AuthScreens onLoginSuccess={() => {}} onClose={() => {}} />} />
        <Route path="/register" element={<AuthScreens onLoginSuccess={() => {}} onClose={() => {}} />} />
        
        {/* Main Layout Routes (Navbar + Footer) */}
        <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        
        {/* Course Discovery & Learning */}
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/courses" element={<CourseListPage />} />
        <Route path="/category/:slug" element={<CategoryDetailPage />} />
        <Route path="/roadmaps" element={<RoadmapsPage />} />
        <Route path="/roadmaps/:roadmapId" element={<RoadmapDetailPage />} />
        <Route path="/instructors" element={<InstructorsPage />} />
        
        {/* Personal & Account */}
        <Route path="/my-courses" element={
          isLoggedIn ? <MyCoursesPage /> : <Navigate to="/login" replace />
        } />
        <Route path="/favorites" element={
          isLoggedIn ? <FavoritesPage /> : <Navigate to="/login" replace />
        } />
        <Route path="/achievements" element={
          isLoggedIn ? <AchievementsPage /> : <Navigate to="/login" replace />
        } />
        <Route path="/notifications" element={
          isLoggedIn ? <NotificationPage /> : <Navigate to="/login" replace />
        } />

        <Route path="/calendar" element={
          isLoggedIn ? <LearningCalendarPage /> : <Navigate to="/login" replace />
        } />

        <Route path="/certificates" element={
          isLoggedIn ? <CertificateCenterPage /> : <Navigate to="/login" replace />
        } />
        <Route path="/purchase-history" element={
          isLoggedIn ? <PurchaseHistoryPage /> : <Navigate to="/login" replace />
        } />
        <Route path="/settings" element={
          isLoggedIn ? <SettingsPage /> : <Navigate to="/login" replace />
        } />
        
        {/* Search Route */}
        <Route path="/search" element={<SearchPage />} />

        {/* Legal & Static Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/privacy" element={<Navigate to="/legal" replace />} />
        
        <Route path="/cart" element={
          <CartAndCheckout 
            wishlistCourseIds={favorites}
            allCourses={courses}
            enrolledCourseIds={enrolledCourseIds}
            onEnrollSuccess={() => {}}
            onClose={() => navigate('/')}
            onToggleFavorite={() => {}}
            onEnterLesson={() => {}}
            initialCourseId={null}
          />
        } />
        <Route path="/checkout" element={<Navigate to="/cart" replace />} />
        <Route path="/vnpay-return" element={
          // @ts-ignore
          <VNPayReturnPage onNavigate={navigateTo} />
        } />
        
        {/* Protected Profile Route */}
        <Route path="/profile/:userId?" element={
          isLoggedIn ? (
            <ProfilePage 
              currentUser={currentUser} 
              setCurrentUser={() => {}} 
              navigateTo={navigateTo} 
              onLogout={() => {}} 
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/instructors/:instructorId" element={<InstructorProfilePage />} />
        <Route path="/instructors/:instructorId/courses" element={
          // @ts-ignore
          <InstructorCoursesPage 
            instructorId={""} 
            navigateTo={navigateTo} 
            renderCourseCard={() => <></>} 
            currentUser={currentUser} 
          />
        } />
      </Route>

      {/* Instructor Workspace (No Main Navbar/Footer) */}
      <Route path="/instructor/:instructorId/*" element={
        // @ts-ignore
        isLoggedIn ? <InstructorDashboard currentUser={currentUser} /> : <Navigate to="/login" replace />
      } />

      {/* Admin Workspace */}
      <Route path="/admin/:adminId/*" element={
        // @ts-ignore
        isLoggedIn && currentUser.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <Navigate to="/" replace />
        )
      } />
      
      {/* Classroom (Fullscreen Learning) */}
      <Route path="/learn/:courseId" element={
        isLoggedIn ? <ClassroomPage /> : <Navigate to="/login" replace />
      } />
      
      {/* Error Pages */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      
      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </AnimatePresence>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
