import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthGuestGuard, PublicStorefrontGuard } from '../RouteGuards';

// Lazy Loaded Pages
const HomePage = React.lazy(() => import('@/features/home/HomePage').then((m) => ({ default: m.default })));
const CourseDetailPage = React.lazy(() => import('@/features/courses/CourseDetailPage').then((m) => ({ default: m.default })));
const CourseListPage = React.lazy(() => import('@/features/courses/CourseListPage').then((m) => ({ default: m.default })));
const CategoryDetailPage = React.lazy(() => import('@/features/category/CategoryDetailPage').then((m) => ({ default: m.default })));
const RoadmapsPage = React.lazy(() => import('@/features/roadmaps/RoadmapsPage').then((m) => ({ default: m.default })));
const RoadmapDetailPage = React.lazy(() => import('@/features/roadmaps/RoadmapDetailPage').then((m) => ({ default: m.default })));
const InstructorsPage = React.lazy(() => import('@/features/instructor/InstructorsPage').then((m) => ({ default: m.default })));
const SearchPage = React.lazy(() => import('@/features/search/SearchPage').then((m) => ({ default: m.default })));
const AboutPage = React.lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.default })));
const ServicesPage = React.lazy(() => import('@/pages/ServicesPage').then((m) => ({ default: m.default })));
const ContactPage = React.lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.default })));
const LegalPage = React.lazy(() => import('@/pages/LegalPage').then((m) => ({ default: m.default })));
const FAQPage = React.lazy(() => import('@/pages/FAQPage').then((m) => ({ default: m.default })));
const PricingPage = React.lazy(() => import('@/pages/PricingPage').then((m) => ({ default: m.default })));

// Auth Pages (some are public but don't use MainLayout)
const LoginPage = React.lazy(() => import('@/features/auth/LoginPage').then((m) => ({ default: m.default })));
const RegisterPage = React.lazy(() => import('@/features/auth/RegisterPage').then((m) => ({ default: m.default })));
const ForgotPasswordPage = React.lazy(() => import('@/features/auth/ForgotPasswordPage').then((m) => ({ default: m.default })));
const ResetPasswordPage = React.lazy(() => import('@/features/auth/ResetPasswordPage').then((m) => ({ default: m.default })));
const GoogleCallbackPage = React.lazy(() => import('@/features/auth/GoogleCallbackPage').then((m) => ({ default: m.default })));

export const PublicAuthRoutes = () => {
  return (
    <>
      <Route path="/login" element={<AuthGuestGuard><LoginPage /></AuthGuestGuard>} />
      <Route path="/register" element={<AuthGuestGuard><RegisterPage /></AuthGuestGuard>} />
      <Route path="/become-instructor" element={<AuthGuestGuard><RegisterPage /></AuthGuestGuard>} />
      <Route path="/instructor/register" element={<AuthGuestGuard><RegisterPage /></AuthGuestGuard>} />
      <Route path="/instructors/register" element={<AuthGuestGuard><RegisterPage /></AuthGuestGuard>} />
      <Route path="/verify-email" element={<AuthGuestGuard><RegisterPage /></AuthGuestGuard>} />
      <Route path="/auth/verify-email" element={<AuthGuestGuard><RegisterPage /></AuthGuestGuard>} />
      <Route path="/forgot-password" element={<AuthGuestGuard><ForgotPasswordPage /></AuthGuestGuard>} />
      <Route path="/reset-password" element={<AuthGuestGuard><ResetPasswordPage /></AuthGuestGuard>} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
    </>
  );
};

export const PublicMainRoutes = () => {
  return (
    <>
      <Route path="/" element={<PublicStorefrontGuard><HomePage /></PublicStorefrontGuard>} />
      
      {/* Course Discovery */}
      <Route path="/courses/:courseId" element={<PublicStorefrontGuard><CourseDetailPage /></PublicStorefrontGuard>} />
      <Route path="/courses" element={<PublicStorefrontGuard><CourseListPage /></PublicStorefrontGuard>} />
      <Route path="/category/:slug" element={<PublicStorefrontGuard><CategoryDetailPage /></PublicStorefrontGuard>} />
      <Route path="/roadmaps" element={<PublicStorefrontGuard><RoadmapsPage /></PublicStorefrontGuard>} />
      <Route path="/roadmaps/:roadmapId" element={<PublicStorefrontGuard><RoadmapDetailPage /></PublicStorefrontGuard>} />
      <Route path="/instructors" element={<PublicStorefrontGuard><InstructorsPage /></PublicStorefrontGuard>} />
      <Route path="/search" element={<PublicStorefrontGuard><SearchPage /></PublicStorefrontGuard>} />

      {/* Legal & Static Pages */}
      <Route path="/about" element={<PublicStorefrontGuard><AboutPage /></PublicStorefrontGuard>} />
      <Route path="/services" element={<PublicStorefrontGuard><ServicesPage /></PublicStorefrontGuard>} />
      <Route path="/contact" element={<PublicStorefrontGuard><ContactPage /></PublicStorefrontGuard>} />
      <Route path="/legal" element={<PublicStorefrontGuard><LegalPage /></PublicStorefrontGuard>} />
      <Route path="/faq" element={<PublicStorefrontGuard><FAQPage /></PublicStorefrontGuard>} />
      <Route path="/pricing" element={<PublicStorefrontGuard><PricingPage /></PublicStorefrontGuard>} />
      <Route path="/privacy" element={<Navigate to="/legal" replace />} />
    </>
  );
};
