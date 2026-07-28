/**
 * Centralized Route Helpers for MindHub
 * 
 * Ensures consistent URLs across the application for profiles and workspaces,
 * standardizing around standard database IDs (`users.id`).
 */

export const AppRoutes = {
  // Public routes
  home: '/',
  login: '/login',
  register: '/register',
  explore: '/explore',
  
  // Authenticated Profile Route
  profile: (userId?: string | number) => `/profile${userId ? `/${userId}` : ''}`,
  
  // Instructor Workspace
  instructorDashboard: () => `/instructor/dashboard`,
  instructorCourses: () => `/instructor/courses`,
  instructorCourseCreate: () => `/instructor/courses/create`,
  instructorCourseEdit: (courseId: string | number) => `/instructor/courses/${courseId}/edit`,
  
  // Admin Workspace
  adminDashboard: (userId?: string | number) => `/admin${userId ? `/${userId}` : ''}/dashboard`,
  
  // Public Instructor Profile
  publicInstructor: (userId: string | number) => `/instructors/${userId}`,
  
  // Public Instructor Courses
  publicInstructorCourses: (userId: string | number) => `/instructors/${userId}/courses`,

  // Instructor Transactions
  instructorTransactions: () => `/instructor/transactions`,

  // Instructor Q&A Questions
  instructorQuestions: (questionId?: string | number) => `/instructor/questions${questionId ? `/${questionId}` : ''}`,

  // Instructor Student Management
  instructorStudents: (studentId?: string | number) => `/instructor/students${studentId ? `/${studentId}` : ''}`,

  // Instructor Discount Codes / Coupons
  instructorDiscountCodes: () => `/instructor/discount-codes`,

  // Instructor Profile / Account Center
  instructorProfile: (tab?: string) => `/instructor/profile${tab ? `?tab=${tab}` : ''}`,
};

export const ROUTES = {
  home: '/',
  profile: '/account/profile',
  instructor: {
    dashboard: '/instructor/dashboard',
    profile: '/instructor/profile',
    courses: '/instructor/courses',
    payouts: '/instructor/withdrawals',
  },
  admin: {
    dashboard: '/admin/dashboard',
  }
};

/**
 * Helper to resolve the correct dashboard URL according to user role
 */
export function getDashboardRouteByRole(role?: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'instructor':
      return '/instructor/dashboard';
    case 'student':
    case 'learner':
    default:
      return '/dashboard';
  }
}

/**
 * Common Role Labels mapping
 */
export const RoleLabels: Record<string, string> = {
  student: 'Học viên',
  learner: 'Học viên',
  instructor: 'Giảng viên',
  admin: 'Quản trị viên'
};
