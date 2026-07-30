import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import { useApp } from '@/app/AppContext';

// Loading Fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-normal"></div>
  </div>
);

// Lazy Loaded Pages
const HomePage = React.lazy(() => import('@/features/home/HomePage').then(m => ({ default: m.default })));
const CourseDetailPage = React.lazy(() => import('@/features/courses/CourseDetailPage').then(m => ({ default: m.default })));
const CourseListPage = React.lazy(() => import('@/features/courses/CourseListPage').then(m => ({ default: m.default })));
const CategoryDetailPage = React.lazy(() => import('@/features/category/CategoryDetailPage').then(m => ({ default: m.default })));
const RoadmapsPage = React.lazy(() => import('@/features/roadmaps/RoadmapsPage').then(m => ({ default: m.default })));
const RoadmapDetailPage = React.lazy(() => import('@/features/roadmaps/RoadmapDetailPage').then(m => ({ default: m.default })));
const InstructorsPage = React.lazy(() => import('@/features/instructor/InstructorsPage').then(m => ({ default: m.default })));
const MyCoursesPage = React.lazy(() => import('@/features/courses/MyCoursesPage').then(m => ({ default: m.default })));
const FavoritesPage = React.lazy(() => import('@/features/courses/FavoritesPage').then(m => ({ default: m.default })));
const AchievementsPage = React.lazy(() => import('@/features/profile/AchievementsPage').then(m => ({ default: m.default })));
const NotificationPage = React.lazy(() => import('@/features/notifications/NotificationPage').then(m => ({ default: m.default })));
const LearningCalendarPage = React.lazy(() => import('@/features/calendar/LearningCalendarPage').then(m => ({ default: m.default })));
const CertificateCenterPage = React.lazy(() => import('@/features/certificates/CertificateCenterPage').then(m => ({ default: m.default })));
const PurchaseHistoryPage = React.lazy(() => import('@/features/purchase-history/PurchaseHistoryPage').then(m => ({ default: m.default })));
const SettingsPage = React.lazy(() => import('@/features/settings/SettingsPage').then(m => ({ default: m.default })));
const SearchPage = React.lazy(() => import('@/features/search/SearchPage').then(m => ({ default: m.default })));
const AboutPage = React.lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.default })));
const ContactPage = React.lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.default })));
const LegalPage = React.lazy(() => import('@/pages/LegalPage').then(m => ({ default: m.default })));
const FAQPage = React.lazy(() => import('@/pages/FAQPage').then(m => ({ default: m.default })));
const PricingPage = React.lazy(() => import('@/pages/PricingPage').then(m => ({ default: m.default })));
const ClassroomPage = React.lazy(() => import('@/features/classroom/ClassroomPage').then(m => ({ default: m.default })));
const ProfilePage = React.lazy(() => import('@/features/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AuthScreens = React.lazy(() => import('@/features/auth/components/AuthScreens').then(m => ({ default: m.default })));
const CartAndCheckout = React.lazy(() => import('@/features/cart/CartAndCheckout').then(m => ({ default: m.default })));
const VNPayReturnPage = React.lazy(() => import('@/features/cart/VNPayReturnPage').then(m => ({ default: m.default })));
const InstructorDashboard = React.lazy(() => import('@/features/instructor/InstructorDashboard').then(m => ({ default: m.default })));
const AdminDashboard = React.lazy(() => import('@/features/admin/AdminDashboard').then(m => ({ default: m.default })));
const InstructorProfilePage = React.lazy(() => import('@/features/instructor/InstructorProfilePage').then(m => ({ default: m.default })));
const InstructorCoursesPage = React.lazy(() => import('@/features/instructor/components/InstructorCoursesPage').then(m => ({ default: m.default })));
const ForbiddenPage = React.lazy(() => import('@/features/errors/ForbiddenPage').then(m => ({ default: m.ForbiddenPage })));
const ServerErrorPage = React.lazy(() => import('@/features/errors/ServerErrorPage').then(m => ({ default: m.ServerErrorPage })));
const NotFoundPage = React.lazy(() => import('@/features/errors/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Helper component to pass params and course card to InstructorCoursesPage
const InstructorCoursesPageWrapper = () => {
  const { instructorId } = useParams<{ instructorId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  
  // Lazy load CourseCard to prevent circular dependencies in router
  const CourseCard = React.lazy(() => import('@/features/courses/components/CourseCard').then(m => ({ default: m.CourseCard })));
  
  return (
    <Suspense fallback={<PageLoader />}>
      {instructorId && currentUser ? (
        <InstructorCoursesPage 
          instructorId={instructorId}
          navigateTo={(path) => navigate(path.startsWith('/') ? path : `/${path}`)}
          // @ts-ignore
          renderCourseCard={(course) => <CourseCard key={course.id} course={course} />}
          currentUser={currentUser}
        />
      ) : <PageLoader />}
    </Suspense>
  );
};

function AppRoutes() {
  const { isLoggedIn: rawIsLoggedIn, currentUser: rawCurrentUser, enrolledCourseIds, courses, favorites } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPreview = import.meta.env.VITE_ADMIN_PREVIEW === 'true';
  const isLoggedIn = isAdminPreview ? true : rawIsLoggedIn;
  const currentUser = isAdminPreview 
    ? {
        id: "1",
        name: "Admin Preview",
        email: "admin@preview.com",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
        role: 'admin' as const,
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        interestedTopics: [],
        notificationSettings: {
          email: true,
          push: true,
          app: true,
          scheduleReminders: true
        }
      }
    : rawCurrentUser;

  const navigateTo = (path: string) => {
    navigate(path.startsWith('/') ? path : `/${path}`);
  };

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
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
            <Route path="/my-courses" element={isLoggedIn ? <MyCoursesPage /> : <Navigate to="/login" replace />} />
            <Route path="/favorites" element={isLoggedIn ? <FavoritesPage /> : <Navigate to="/login" replace />} />
            <Route path="/achievements" element={isLoggedIn ? <AchievementsPage /> : <Navigate to="/login" replace />} />
            <Route path="/notifications" element={isLoggedIn ? <NotificationPage /> : <Navigate to="/login" replace />} />
            <Route path="/calendar" element={isLoggedIn ? <LearningCalendarPage /> : <Navigate to="/login" replace />} />
            <Route path="/certificates" element={isLoggedIn ? <CertificateCenterPage /> : <Navigate to="/login" replace />} />
            <Route path="/purchase-history" element={isLoggedIn ? <PurchaseHistoryPage /> : <Navigate to="/login" replace />} />
            <Route path="/settings" element={isLoggedIn ? <SettingsPage /> : <Navigate to="/login" replace />} />
            
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
            <Route path="/instructors/:instructorId/courses" element={<InstructorCoursesPageWrapper />} />
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
      </Suspense>
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
