import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

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

import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import { useApp } from '@/app/AppContext';

// Simple placeholder components for missing pages until they are migrated
const HomePage = () => <div className="p-10 text-center"><h1 className="text-3xl font-bold">Trang Chủ (Đang cập nhật)</h1></div>;
const ExplorePage = () => <div className="p-10 text-center"><h1 className="text-3xl font-bold">Khám Phá (Đang cập nhật)</h1></div>;

function AppRoutes() {
  const { isLoggedIn, currentUser, enrolledCourseIds, courses, favorites } = useApp();
  const navigate = useNavigate();

  const navigateTo = (path: string) => {
    navigate(path.startsWith('/') ? path : `/${path}`);
  };

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<AuthScreens />} />
      <Route path="/register" element={<AuthScreens />} />
      
      {/* Main Layout Routes (Navbar + Footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/courses" element={<CourseListPage />} />
        
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
        
        <Route path="/my-courses" element={
          isLoggedIn ? <MyCoursesPage /> : <Navigate to="/login" replace />
        } />

        <Route path="/instructors/:instructorId" element={
          // @ts-ignore
          <InstructorProfile 
            instructorId={null} 
            onBack={() => navigate(-1)} 
            onViewCourse={() => {}} 
            renderCourseCard={() => <></>} 
          />
        } />
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
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
