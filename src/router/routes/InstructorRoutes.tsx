import React, { Suspense } from 'react';
import { Route, Navigate, useParams, useNavigate } from 'react-router-dom';

const InstructorDashboard = React.lazy(() => import('@/features/instructor/InstructorPage'));
const InstructorProfilePage = React.lazy(() => import('@/features/instructor/InstructorProfilePage').then((m) => ({ default: m.default })));
const InstructorCoursesPage = React.lazy(() => import('@/features/instructor/components/InstructorCoursesPage').then((m) => ({ default: m.default })));

// Loading Fallback for Suspense
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-normal"></div>
  </div>
);

import { WorkspaceRouteGuard, PublicStorefrontGuard } from '../RouteGuards';

// Wrapper for Instructor Courses
const InstructorCoursesPageWrapper = ({ currentUser }: { currentUser: any }) => {
  const { instructorId } = useParams<{ instructorId: string }>();
  const navigate = useNavigate();

  const CourseCard = React.lazy(() => import('@/features/courses/components/CourseCard').then((m) => ({ default: m.CourseCard })));

  return (
    <Suspense fallback={<PageLoader />}>
      {instructorId && currentUser ? (
        <InstructorCoursesPage
          instructorId={instructorId}
          navigateTo={(path: string) => navigate(path.startsWith('/') ? path : `/${path}`)}
          renderCourseCard={(course: any) => <CourseCard key={course.id} course={course as any} />}
          currentUser={currentUser}
        />
      ) : (
        <PageLoader />
      )}
    </Suspense>
  );
};

export const InstructorMainRoutes = ({ currentUser }: { currentUser: any }) => (
  <>
    <Route
      path="/instructors/:instructorId"
      element={
        <PublicStorefrontGuard>
          <InstructorProfilePage />
        </PublicStorefrontGuard>
      }
    />
    <Route
      path="/instructors/:instructorId/courses"
      element={
        <PublicStorefrontGuard>
          <InstructorCoursesPageWrapper currentUser={currentUser} />
        </PublicStorefrontGuard>
      }
    />
  </>
);

export const InstructorWorkspaceRoutes = () => {
  return (
    <>
      <Route
        path="/instructor/*"
        element={
          <WorkspaceRouteGuard allowedRole="instructor">
            <InstructorDashboard />
          </WorkspaceRouteGuard>
        }
      />
      <Route
        path="/instructor/:instructorId/*"
        element={
          <WorkspaceRouteGuard allowedRole="instructor">
            <InstructorDashboard />
          </WorkspaceRouteGuard>
        }
      />
    </>
  );
};
