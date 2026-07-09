import { INITIAL_COURSES, INITIAL_USER, SYSTEM_ROLE_USERS, INITIAL_NOTIFICATIONS, INITIAL_FAVORITES, FLAGGED_REVIEWS_MOCK, PAYOUT_REQUESTS_MOCK, INITIAL_BANNERS } from '../data';
import { Course, User, Order, Notification, AccountRequest, PayoutRequest, FlaggedItem } from '../types';
import { safeLocalStorage as localStorage } from '../utils/safeStorage';

export interface DatabaseState {
  users: User[];
  courses: Course[];
  orders: Order[];
  favorites: string[]; // array of course IDs
  cart: string[]; // array of course IDs
  enrollments: { userId: string; courseId: string; progress: number }[];
  notifications: Notification[];
  accountRequests: AccountRequest[];
  payoutRequests: PayoutRequest[];
  flaggedReviews: FlaggedItem[];
  instructorQuota: { remaining: number; totalPurchased: number };
  packageOrders: any[];
}

const DB_KEY = 'mindhub_mock_database';

// Initialize the database with mock data if it doesn't exist
const initializeDB = (): DatabaseState => {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Đảm bảo cập nhật dữ liệu khóa học mới thêm vào INITIAL_COURSES (như các mock data cho giảng viên) 
      // nếu chúng chưa có trong DB.
      const existingCourseIds = new Set(parsed.courses.map((c: any) => c.id));
      const missingCourses = INITIAL_COURSES.filter(c => !existingCourseIds.has(c.id));
      if (missingCourses.length > 0) {
        parsed.courses = [...parsed.courses, ...missingCourses];
        saveDB(parsed); // lưu lại luôn bản đã merge
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading mock DB', e);
  }

  const defaultState: DatabaseState = {
    users: [INITIAL_USER, ...Object.values(SYSTEM_ROLE_USERS)],
    courses: INITIAL_COURSES,
    orders: [],
    favorites: INITIAL_FAVORITES,
    cart: [],
    enrollments: [
      { userId: INITIAL_USER.id, courseId: 'course-1', progress: 45 },
      { userId: INITIAL_USER.id, courseId: 'course-3', progress: 100 }
    ],
    notifications: INITIAL_NOTIFICATIONS,
    accountRequests: [],
    payoutRequests: PAYOUT_REQUESTS_MOCK,
    flaggedReviews: FLAGGED_REVIEWS_MOCK,
    instructorQuota: { remaining: 0, totalPurchased: 0 },
    packageOrders: []
  };

  saveDB(defaultState);
  return defaultState;
};

const saveDB = (state: DatabaseState) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving mock DB', e);
  }
};

let dbState: DatabaseState = initializeDB();

// Helper to simulate network delay
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const MockDB = {
  getState: () => dbState,
  
  commit: (newState: Partial<DatabaseState>) => {
    dbState = { ...dbState, ...newState };
    saveDB(dbState);
  },

  // Courses
  getCourses: async () => {
    await delay();
    return [...dbState.courses];
  },
  
  getCourseById: async (id: string) => {
    await delay();
    return dbState.courses.find(c => c.id === id) || null;
  },

  getInstructorQuota: async () => {
    await delay();
    return dbState.instructorQuota;
  },

  updateInstructorQuota: async (updates: Partial<{ remaining: number; totalPurchased: number }>) => {
    await delay();
    const newQuota = { ...dbState.instructorQuota, ...updates };
    MockDB.commit({ instructorQuota: newQuota });
    return newQuota;
  },

  getPackageOrder: async (orderCode: string) => {
    await delay();
    return dbState.packageOrders.find(o => o.order_code === orderCode) || null;
  },

  createPackageOrder: async (order: any) => {
    await delay();
    const newOrder = { ...order, createdAt: new Date().toISOString() };
    MockDB.commit({ packageOrders: [newOrder, ...dbState.packageOrders] });
    return newOrder;
  },

  updatePackageOrder: async (orderCode: string, updates: any) => {
    await delay();
    const updated = dbState.packageOrders.map(o => o.order_code === orderCode ? { ...o, ...updates } : o);
    MockDB.commit({ packageOrders: updated });
    return updated.find(o => o.order_code === orderCode);
  },

  updateCourse: async (id: string, updates: Partial<Course>) => {
    await delay();
    const updatedCourses = dbState.courses.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
    MockDB.commit({ courses: updatedCourses });
    return updatedCourses.find(c => c.id === id);
  },

  createCourseDraft: async (course: Course) => {
    await delay();
    const newCourse = { ...course, status: (course.status || 'draft') as any, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    MockDB.commit({ courses: [newCourse, ...dbState.courses] });
    return newCourse;
  },

  submitCourseForReview: async (id: string) => {
    await delay();
    const updatedCourses = dbState.courses.map(c => c.id === id ? { ...c, status: 'pending' as any, updatedAt: new Date().toISOString() } : c);
    MockDB.commit({ courses: updatedCourses });
    return updatedCourses.find(c => c.id === id);
  },

  approveCourse: async (id: string) => {
    await delay();
    const updatedCourses = dbState.courses.map(c => c.id === id ? { ...c, status: 'active' as any, updatedAt: new Date().toISOString() } : c);
    MockDB.commit({ courses: updatedCourses });
    return updatedCourses.find(c => c.id === id);
  },

  rejectCourse: async (id: string, reason: string) => {
    await delay();
    const updatedCourses = dbState.courses.map(c => c.id === id ? { ...c, status: 'rejected' as any, rejectionReason: reason, updatedAt: new Date().toISOString() } : c);
    MockDB.commit({ courses: updatedCourses });
    return updatedCourses.find(c => c.id === id);
  },
  
  // Enrollments
  getEnrollmentsByUser: async (userId: string) => {
    await delay();
    const enrolledIds = dbState.enrollments.filter(e => e.userId === userId).map(e => e.courseId);
    return dbState.courses.filter(c => enrolledIds.includes(c.id));
  },
  
  enrollCourse: async (userId: string, courseId: string) => {
    await delay();
    if (!dbState.enrollments.some(e => e.userId === userId && e.courseId === courseId)) {
      MockDB.commit({
        enrollments: [...dbState.enrollments, { userId, courseId, progress: 0 }]
      });
    }
    return true;
  },

  // Favorites
  getFavorites: async () => {
    await delay();
    return dbState.courses.filter(c => dbState.favorites.includes(c.id));
  },

  toggleFavorite: async (courseId: string) => {
    await delay();
    let newFavs = [...dbState.favorites];
    if (newFavs.includes(courseId)) {
      newFavs = newFavs.filter(id => id !== courseId);
    } else {
      newFavs.push(courseId);
    }
    MockDB.commit({ favorites: newFavs });
    return newFavs;
  },

  // Orders
  getOrders: async () => {
    await delay();
    return [...dbState.orders];
  },

  createOrder: async (order: Order) => {
    await delay();
    MockDB.commit({ orders: [...dbState.orders, order] });
    return order;
  },

  // Users
  getUserById: async (id: string) => {
    await delay();
    return dbState.users.find(u => u.id === id) || null;
  },
  
  updateUser: async (id: string, updates: Partial<User>) => {
    await delay();
    const updatedUsers = dbState.users.map(u => u.id === id ? { ...u, ...updates } : u);
    MockDB.commit({ users: updatedUsers });
    return updatedUsers.find(u => u.id === id) as User;
  },
  
  // Account Requests
  getAccountRequests: async () => {
    await delay();
    return [...dbState.accountRequests];
  },
  
  updateAccountRequest: async (id: string, updates: Partial<AccountRequest>) => {
    await delay();
    const updated = dbState.accountRequests.map(r => r.id === id ? { ...r, ...updates } : r);
    MockDB.commit({ accountRequests: updated });
    return updated.find(r => r.id === id) as AccountRequest;
  },
  updatePayoutRequest: async (requestId: string, updates: Partial<PayoutRequest>) => {
    const state = MockDB.getState();
    const reqIndex = state.payoutRequests.findIndex((r: PayoutRequest) => r.id === requestId);
    if (reqIndex !== -1) {
      state.payoutRequests[reqIndex] = { ...state.payoutRequests[reqIndex], ...updates };
      MockDB.commit(state);
    }
  },

  createAccountRequest: async (request: AccountRequest) => {
    await delay();
    MockDB.commit({ accountRequests: [request, ...dbState.accountRequests] });
    return request;
  }
};
