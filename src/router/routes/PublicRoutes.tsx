import React from 'react';
import { Route, Navigate } from 'react-router-dom';

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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/instructor/register" element={<RegisterPage />} />
      <Route path="/instructors/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<RegisterPage />} />
      <Route path="/auth/verify-email" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
    </>
  );
};

export const PublicMainRoutes = () => {
  return (
    <>
      <Route path="/" element={<HomePage />} />
      
      {/* Course Discovery */}
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />
      <Route path="/courses" element={<CourseListPage />} />
      <Route path="/category/:slug" element={<CategoryDetailPage />} />
      <Route path="/roadmaps" element={<RoadmapsPage />} />
      <Route path="/roadmaps/:roadmapId" element={<RoadmapDetailPage />} />
      <Route path="/instructors" element={<InstructorsPage />} />
      <Route path="/search" element={<SearchPage />} />

      {/* Legal & Static Pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/privacy" element={<Navigate to="/legal" replace />} />
    </>
  );
};
