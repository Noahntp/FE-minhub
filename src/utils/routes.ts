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
  profile: (userId: string | number) => `/profile/${userId}`,
  
  // Instructor Workspace
  instructorDashboard: (userId: string | number) => `/instructor/${userId}/dashboard`,
  
  // Admin Workspace
  adminDashboard: (userId: string | number) => `/admin/${userId}/dashboard`,
  
  // Public Instructor Profile
  publicInstructor: (userId: string | number) => `/instructors/${userId}`,

  // Instructor Packages
  instructorPackages: (userId: string | number) => `/instructor/${userId}/course-credit-packages`,
  instructorPackageDetail: (userId: string | number, packageId: string) => `/instructor/${userId}/course-credit-packages/${packageId}`,
  instructorPackageCheckout: (userId: string | number, packageId: string) => `/instructor/${userId}/course-credit-packages/${packageId}/checkout`,
  
  // Instructor Transactions
  instructorTransactions: (userId: string | number) => `/instructor/${userId}/course-credit-transactions`,
};

/**
 * Common Role Labels mapping
 */
export const RoleLabels: Record<string, string> = {
  student: 'Học viên',
  learner: 'Học viên',
  instructor: 'Giảng viên',
  admin: 'Quản trị viên'
};
