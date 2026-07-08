import { Course, Chapter, Lesson, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '../types';
import { safeLocalStorage as localStorage } from '../utils/safeStorage';
import { MockDB } from './mockDb';
import { SYSTEM_ROLE_USERS } from '../data';

/**
 * MindHub API Service Configuration and Integration Layer
 * 
 * This service is designed to serve as the unified bridge between the React frontend 
 * and your real Laravel / PHP backend (supporting nearly 100 API endpoints).
 * 
 * HOW TO INTEGRATE WITH REAL BACKEND:
 * 1. Set the VITE_API_MODE environment variable to "api" (or toggle via the Developer Panel in the UI).
 * 2. Configure VITE_API_BASE_URL in your `.env` or `.env.local` file:
 *    - Laravel Development Server (php artisan serve): http://localhost:8000/api
 *    - Laragon Virtual Host Setup: http://mindhub.test/api
 *    - Laragon Default Subdirectory Setup: http://localhost/MindHub/public/api
 * 3. Keep the payload formats here synchronized with your database migrations and Laravel controllers.
 */

export interface ApiConfig {
  mode: 'mock' | 'api';
  baseUrl: string;
  authToken?: string;
  isLogEnabled: boolean;
}

// Read configuration from local storage or environment variables
const initialMode = 'mock';
const initialBaseUrl = localStorage.getItem('mindhub_api_base_url') || (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

const config: ApiConfig = {
  mode: 'mock',
  baseUrl: initialBaseUrl,
  authToken: localStorage.getItem('mindhub_api_token') || undefined,
  isLogEnabled: true,
};

// Simplified Dev Live Logger inside Admin/Instructor dashboard console
const devLog = (category: string, action: string, payload?: any) => {
  if (config.isLogEnabled) {
    console.log(
      `%c[API ${config.mode.toUpperCase()}] %c${category} -> ${action}`,
      'color: #8b5e3c; font-weight: bold;',
      'color: #10b981;',
      payload || ''
    );
    // Append to virtual logger for developer console in dashboards
    try {
      const logs = JSON.parse(localStorage.getItem('mindhub_virtual_api_logs') || '[]');
      const newLog = {
        id: 'log-' + Date.now() + Math.random().toString(36).substr(2, 4),
        time: new Date().toLocaleTimeString(),
        mode: config.mode,
        category,
        action,
        payload: payload ? JSON.stringify(payload, null, 2) : 'No payload',
      };
      localStorage.setItem('mindhub_virtual_api_logs', JSON.stringify([newLog, ...logs].slice(0, 100)));
    } catch (e) {
      /* ignore storage errors */
    }
  }
};

/**
 * Universal Unified HTTP Client Utility with Automatic Authorization header injection
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (config.mode === 'mock') {
    throw new Error('apiFetch called while in mock mode.');
  }

  const url = `${config.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const headers = new Headers(options.headers || {});
  
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (config.authToken) {
    headers.set('Authorization', `Bearer ${config.authToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errText = await response.text();
    let errJson;
    try {
      errJson = JSON.parse(errText);
    } catch {
      /* ignore */
    }
    const errMsg = errJson?.message || errJson?.error || `HTTP error! status: ${response.status}`;
    devLog('Error Response', errMsg, { status: response.status, url });
    throw new Error(errMsg);
  }

  // Handle No Content / Empty HTTP 204 response safely
  if (response.status === 204) {
    return { success: true } as unknown as T;
  }

  return response.json() as Promise<T>;
}

export const ApiService = {
  // -------------------------------------------------------------
  // SYSTEM & CONNECTION UTILS
  // -------------------------------------------------------------
  getConfig() {
    return { ...config };
  },

  setMode(mode: 'mock' | 'api') {
    config.mode = 'mock';
    localStorage.setItem('mindhub_api_mode', 'mock');
    devLog('Config', 'Changed API mode (forced to mock)', { mode: 'mock' });
    window.dispatchEvent(new CustomEvent('mindhub-api-mode-changed', { detail: 'mock' }));
  },

  setBaseUrl(url: string) {
    config.baseUrl = url;
    localStorage.setItem('mindhub_api_base_url', url);
    devLog('Config', 'Changed API Base URL', { url });
    window.dispatchEvent(new CustomEvent('mindhub-api-base-url-changed', { detail: url }));
  },

  setAuthToken(token: string | null) {
    if (token) {
      config.authToken = token;
      localStorage.setItem('mindhub_api_token', token);
    } else {
      config.authToken = undefined;
      localStorage.removeItem('mindhub_api_token');
    }
    devLog('Config', 'Token authorization updated', { hasToken: !!token });
  },

  getVirtualLogs(): Array<{ id: string; time: string; mode: string; category: string; action: string; payload: string }> {
    try {
      return JSON.parse(localStorage.getItem('mindhub_virtual_api_logs') || '[]');
    } catch {
      return [];
    }
  },

  clearVirtualLogs() {
    localStorage.setItem('mindhub_virtual_api_logs', '[]');
  },

  async testConnection(customUrl?: string): Promise<{ success: boolean; message: string; latency?: number }> {
    const targetUrl = (customUrl || config.baseUrl).replace(/\/$/, '');
    const startTime = Date.now();
    try {
      // Let's do a fast GET request with a small timeout to verify connectivity and CORS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      const response = await fetch(`${targetUrl}/courses`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;
      
      return { 
        success: response.ok || response.status < 500, 
        message: `Kết nối thành công! Mã phản hồi HTTP: ${response.status}.`,
        latency
      };
    } catch (e: any) {
      const latency = Date.now() - startTime;
      console.warn('API connection test failed:', e);
      let errMsg = 'Không thể kết nối. Máy chủ backend chưa phản hồi hoặc chặn CORS.';
      if (e.name === 'AbortError') {
        errMsg = 'Yêu cầu hết thời gian chờ (Timeout).';
      } else if (e.message) {
        errMsg = `Lỗi kết nối: ${e.message}`;
      }
      return { 
        success: false, 
        message: errMsg,
        latency
      };
    }
  },

  // ==========================================
  // MODULE 1. AUTHENTICATION & SESSIONS
  // ==========================================
  
  /** POST /auth/register */
  async register(payload: any): Promise<{ user: User; token: string }> {
    devLog('Auth', 'Register new student', { email: payload.email });
    if (config.mode === 'api') {
      const res = await apiFetch<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      this.setAuthToken(res.token);
      return res;
    }
    const users = MockDB.getState().users;
    let newUser = { id: 'u-' + Date.now(), name: payload.name, email: payload.email, role: 'student', bio: '' };
    MockDB.commit({ users: [...users, newUser as any] });
    return { user: newUser as any, token: 'mock-token' };
  },

  /** POST /auth/login */
  async login(payload: any): Promise<{ user: User; token: string }> {
    devLog('Auth', 'Login credentials authentication', { email: payload.email });
    if (config.mode === 'api') {
      const res = await apiFetch<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      this.setAuthToken(res.token);
      return res;
    }
    const users = MockDB.getState().users;
    let user = users.find(u => u.email === payload.email);
    if (!user) {
      const sysUsers = Object.values(SYSTEM_ROLE_USERS);
      user = sysUsers.find(u => u.email === payload.email);
      if (user) {
        MockDB.commit({ users: [...users, user] });
      } else {
        throw new Error('Email hoặc mật khẩu không chính xác.');
      }
    }
    return { user, token: 'mock-token' };
  },

  /** POST /auth/logout */
  async logout(): Promise<{ success: boolean }> {
    devLog('Auth', 'Logout active session requests');
    if (config.mode === 'api') {
      const res = await apiFetch<{ success: boolean }>('/auth/logout', {
        method: 'POST',
      });
      this.setAuthToken(null);
      return res;
    }
    this.setAuthToken(null);
    return { success: true };
  },

  /** POST /auth/logout-all */
  async logoutAll(): Promise<{ success: boolean }> {
    devLog('Auth', 'Terminate all active device sessions');
    if (config.mode === 'api') {
      const res = await apiFetch<{ success: boolean }>('/auth/logout-all', { method: 'POST' });
      this.setAuthToken(null);
      return res;
    }
    return { success: true };
  },

  /** POST /auth/refresh */
  async refreshToken(): Promise<{ token: string }> {
    devLog('Auth', 'Request Token Refresh rotation');
    if (config.mode === 'api') {
      const res = await apiFetch<{ token: string }>('/auth/refresh', { method: 'POST' });
      this.setAuthToken(res.token);
      return res;
    }
    return { token: 'mock-refreshed-token' };
  },

  /** GET /auth/sessions */
  async getSessions(): Promise<any[]> {
    devLog('Auth', 'Fetch active browser sessions');
    if (config.mode === 'api') {
      return apiFetch<any[]>('/auth/sessions');
    }
    return [{ id: 'sess-1', device: 'Chrome / Windows', ip_address: '127.0.0.1', is_current: true, last_active: 'Vừa xong' }];
  },

  /** DELETE /auth/sessions/{sessionId} */
  async revokeSession(sessionId: string): Promise<{ success: boolean }> {
    devLog('Auth', `Revoking specific session ID: ${sessionId}`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
    }
    return { success: true };
  },

  /** POST /auth/forgot-password */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    devLog('Auth', 'Send password reset link to', { email });
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    }
    return { success: true, message: 'Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn.' };
  },

  /** POST /auth/reset-password */
  async resetPassword(payload: any): Promise<{ success: boolean; message: string }> {
    devLog('Auth', 'Submit password reset request');
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return { success: true, message: 'Mật khẩu đã được đặt lại thành công.' };
  },

  /** POST /auth/verify-email/resend */
  async resendVerificationEmail(email: string, purpose: string = 'verify_email'): Promise<{ success: boolean; message: string }> {
    devLog('Auth', 'Resend email verification notification mail', { email, purpose });
    try {
      const res = await fetch('http://localhost:3000/api/auth/email/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi gửi email xác minh');
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Lỗi gửi email xác minh');
    }
  },

  /** POST /auth/email/verify */
  async verifyEmailOtp(email: string, purpose: string, token: string): Promise<{ success: boolean, ticket?: string }> {
    devLog('Auth', `Verify email with Token: ${token}`);
    try {
      const res = await fetch('http://localhost:3000/api/auth/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose, token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xác minh email');
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Lỗi xác minh email');
    }
  },

  /** POST /auth/google */
  async authWithGoogle(token: string): Promise<{ user: User; token: string }> {
    devLog('Auth', 'Google OAuth single-sign-on integration');
    if (config.mode === 'api') {
      const res = await apiFetch<{ user: User; token: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      this.setAuthToken(res.token);
      return res;
    }
    return { user: { id: 'u-google', name: 'Google Student', email: 'student@gmail.com', role: 'student' } as any, token: 'mock-google-token' };
  },

  // ==========================================
  // MODULE 2. PUBLIC CATALOG & COURSE DISCOVERY
  // ==========================================

  /** GET /home */
  async getHomepageData(): Promise<any> {
    devLog('Catalog', 'Get homepage catalog metrics, sliders, and categories');
    if (config.mode === 'api') {
      return apiFetch<any>('/home');
    }
    return { banner: [], categories: [], featured_courses: [], latest_courses: [] };
  },

  /** GET /categories */
  async getCategories(): Promise<any[]> {
    devLog('Catalog', 'Get list of course categories');
    if (config.mode === 'api') {
      return apiFetch<any[]>('/categories');
    }
    return [];
  },

  // Get category counts
  async getCategoriesWithCount(): Promise<{name: string, count: number}[]> {
    if (config.mode === 'api') {
      try {
        return await apiFetch<{name: string, count: number}[]>('/courses/categories');
      } catch (e) {
        console.warn('Failed to fetch categories', e);
        return [];
      }
    }
    // Mock fallback
    return [
      { name: 'Development', count: 12 },
      { name: 'Design', count: 8 },
      { name: 'Marketing', count: 5 },
      { name: 'Artificial Intelligence', count: 10 },
      { name: 'Data Science', count: 3 }
    ];
  },

  async getUserEnrollments(userId: string): Promise<any[]> {
    if (config.mode === 'api') {
      try {
        return await apiFetch<any[]>(`/users/${userId}/enrollments`);
      } catch(e) {
        return [];
      }
    }
    return [];
  },

  async getUserActivities(userId: string): Promise<any[]> {
    if (config.mode === 'api') {
      try {
        return await apiFetch<any[]>(`/users/${userId}/activities`);
      } catch(e) {
        return [];
      }
    }
    return [];
  },

  /** GET /courses (search and filters) */
  async getPublicCoursesByInstructor(instructorId: string): Promise<Course[]> {
    const start = Date.now();
    try {
      if (config.mode === 'api') {
        const response = await fetch(`${config.baseUrl}/courses/instructor/${instructorId}`);
        if (!response.ok) throw new Error('API fetch failed');
        return await response.json();
      }
      // Mock logic
      const allCourses = await MockDB.getCourses();
      // Match by instructorId
      return allCourses.filter(c => 
        c.instructorId === instructorId && 
        c.status === 'active' && 
        !c.isHidden
      );
    } catch (err) {
      return (await MockDB.getCourses()).filter(c => 
        c.instructorId === instructorId && 
        c.status === 'active' && 
        !c.isHidden
      );
    } finally {
      devLog('API', `getCoursesByInstructor(${instructorId})`, { duration: Date.now() - start });
    }
  },

  async getCourses(filters?: any): Promise<Course[]> {
    devLog('Catalog', 'Fetch all active public courses', filters);
    if (config.mode === 'api') {
      let endpoint = '/courses';
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined && filters[key] !== null) {
            queryParams.append(key, String(filters[key]));
          }
        });
        const queryStr = queryParams.toString();
        if (queryStr) endpoint += `?${queryStr}`;
      }
      return apiFetch<Course[]>(endpoint);
    }
    return MockDB.getCourses();
  },

  /** GET /courses/featured */
  async getFeaturedCourses(): Promise<Course[]> {
    devLog('Catalog', 'Fetch highly rated featured courses');
    if (config.mode === 'api') return apiFetch<Course[]>('/courses/featured');
    return (await MockDB.getCourses()).filter(c => c.isFeatured);
  },

  /** GET /courses/bestsellers */
  async getBestsellerCourses(): Promise<Course[]> {
    devLog('Catalog', 'Fetch best-selling courses');
    if (config.mode === 'api') return apiFetch<Course[]>('/courses/bestsellers');
    return (await MockDB.getCourses()).filter(c => c.isBestseller);
  },

  /** GET /courses/latest */
  async getLatestCourses(): Promise<Course[]> {
    devLog('Catalog', 'Fetch newly published curriculum');
    if (config.mode === 'api') return apiFetch<Course[]>('/courses/latest');
    return [];
  },

  /** GET /courses/sort */
  async getFilteredSortedCourses(params: any): Promise<Course[]> {
    devLog('Catalog', 'Sort course directory dynamically', params);
    if (config.mode === 'api') {
      const qParams = new URLSearchParams(params).toString();
      return apiFetch<Course[]>(`/courses/sort?${qParams}`);
    }
    return [];
  },

  /** GET /courses/{slug} */
  async getCourseBySlug(slug: string): Promise<Course> {
    devLog('Catalog', `View public course node payload with slug: ${slug}`);
    if (config.mode === 'api') return apiFetch<Course>(`/courses/${slug}`);
    throw new Error('Course slug lookup requires backend API mode.');
  },

  /** GET /courses/{id}/outline */
  async getCourseOutline(id: string): Promise<any> {
    devLog('Catalog', `Fetch Syllabus/Outline structure for syllabus ID: ${id}`);
    if (config.mode === 'api') return apiFetch<any>(`/courses/${id}/outline`);
    return { sections: [] };
  },

  /** GET /courses/{id}/reviews */
  async getCourseReviews(id: string): Promise<any[]> {
    devLog('Catalog', `Fetch student evaluations and written reviews for course: ${id}`);
    if (config.mode === 'api') return apiFetch<any[]>(`/courses/${id}/reviews`);
    return [];
  },

  /** POST /courses/{id}/reviews */
  async postCourseReview(id: string, payload: any): Promise<any> {
    devLog('Catalog', `Submit review to course: ${id}`, payload);
    if (config.mode === 'api') {
      return apiFetch<any>(`/courses/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return { id: 'rev-1', rating: payload.rating, comment: payload.comment, user: { name: 'Người dùng hiện tại' } };
  },

  /** GET /courses/{id}/faqs */
  async getCourseFAQs(id: string): Promise<any[]> {
    devLog('Catalog', `Get detailed FAQ questions for Course ID: ${id}`);
    if (config.mode === 'api') return apiFetch<any[]>(`/courses/${id}/faqs`);
    return [];
  },

  /** GET /courses/{id}/questions */
  async getCourseQuestions(id: string, isInternal?: boolean): Promise<any[]> {
    devLog('Catalog', `Get Q&A questions for Course ID: ${id}, isInternal: ${isInternal}`);
    if (config.mode === 'api') {
      const qs = isInternal !== undefined ? `?isInternal=${isInternal}` : '';
      return apiFetch<any[]>(`/courses/${id}/questions${qs}`);
    }
    return [];
  },

  /** POST /courses/{id}/questions */
  async addCourseQuestion(id: string, payload: { authorId: string; content: string; isInternal: boolean; lessonId?: string }): Promise<any> {
    devLog('Catalog', `Add Q&A question to Course ID: ${id}`, payload);
    if (config.mode === 'api') {
      return apiFetch<any>(`/courses/${id}/questions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return { ...payload, id: 'q-mock', createdAt: new Date().toISOString(), status: 'open' };
  },

  /** POST /courses/{id}/questions/{questionId}/answers */
  async answerCourseQuestion(id: string, questionId: string, payload: { authorId: string; content: string }): Promise<any> {
    devLog('Catalog', `Answer Q&A question ID: ${questionId} on Course ID: ${id}`, payload);
    if (config.mode === 'api') {
      return apiFetch<any>(`/courses/${id}/questions/${questionId}/answers`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return { ...payload, id: 'a-mock', createdAt: new Date().toISOString() };
  },

  /** GET /courses/{courseId}/related */
  async getRelatedCourses(courseId: string): Promise<Course[]> {
    devLog('Catalog', `Recommended related modules for course: ${courseId}`);
    if (config.mode === 'api') return apiFetch<Course[]>(`/courses/${courseId}/related`);
    return [];
  },

  /** GET /lessons/{id}/preview */
  async getFreeLessonPreview(lessonId: string): Promise<any> {
    devLog('Catalog', `Attempting free sample preview for Lesson ID: ${lessonId}`);
    if (config.mode === 'api') return apiFetch<any>(`/lessons/${lessonId}/preview`);
    return { id: lessonId, isFree: true, videoUrl: '' };
  },

  /** GET /search/suggestions */
  async getAutocompleteSuggestions(query: string): Promise<string[]> {
    devLog('Catalog', `Get index search hints for query: "${query}"`);
    if (config.mode === 'api') return apiFetch<string[]>(`/search/suggestions?q=${encodeURIComponent(query)}`);
    return [];
  },

  /** GET /instructors/featured */
  async getFeaturedInstructors(): Promise<any[]> {
    devLog('Catalog', 'Get list of top-rated platform experts');
    if (config.mode === 'api') return apiFetch<any[]>('/instructors/featured');
    return [];
  },

  /** GET /instructors/{id} */
  async getPublicInstructorProfile(instructorId: string): Promise<any> {
    devLog('Catalog', `View public professional page/bio for trainer ID: ${instructorId}`);
    if (config.mode === 'api') return apiFetch<any>(`/instructors/${instructorId}`);
    return { name: 'Thầy Giáo Linh', bio: 'Giảng viên Yoga & Thiền Định 8 năm kinh nghiệm.' };
  },

  /** GET /instructors/{id}/courses */
  async getInstructorCourses(instructorId: string, filters?: any): Promise<Course[]> {
    devLog('Catalog', `Fetch courses for instructor ID: ${instructorId}`, filters);
    if (config.mode === 'api') {
      let endpoint = `/instructors/${instructorId}/courses`;
      if (filters) {
        const queryParams = new URLSearchParams();
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined && filters[key] !== null) {
            queryParams.append(key, String(filters[key]));
          }
        });
        const queryStr = queryParams.toString();
        if (queryStr) endpoint += `?${queryStr}`;
      }
      return apiFetch<Course[]>(endpoint);
    }
    return [];
  },

  // ==========================================
  // MODULE 3. USER PROFILE MANAGEMENT
  // ==========================================

  /** GET /users/me */
  async getMyProfile(): Promise<User> {
    devLog('Profile', 'Fetch currently authenticated profile state node');
    if (config.mode === 'api') return apiFetch<User>('/users/me');
    
    const users = MockDB.getState().users;
    // We just mock grabbing the first authenticated user or student for now if token exists
    const user = users.find(u => (u.role as string) !== 'guest') || users[0];
    return user;
  },

  /** PATCH /users/me */
  async updateMyProfile(payload: Partial<User>): Promise<User> {
    devLog('Profile', 'Sync personal bio and name traits', payload);
    if (config.mode === 'api') {
      return apiFetch<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
    const myProfile = await ApiService.getMyProfile();
    return MockDB.updateUser(myProfile.id, payload) as Promise<User>;
  },

  /** GET /instructor/profile */
  async getInstructorProfile(): Promise<any> {
    devLog('Profile', 'Fetch instructor professional details');
    if (config.mode === 'api') return apiFetch<any>('/instructor/profile');
    
    // Mock data
    return {
      bio: "Tôi là giảng viên backend, có kinh nghiệm xây dựng REST API, Laravel và MySQL...",
      expertise: "Laravel, PHP, MySQL, API Design",
      experience_years: 6,
      level: "Senior Backend Instructor"
    };
  },

  /** PATCH /instructor/profile */
  async updateInstructorProfile(payload: any): Promise<any> {
    devLog('Profile', 'Update instructor professional details', payload);
    if (config.mode === 'api') {
      return apiFetch<any>('/instructor/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
    return new Promise(resolve => setTimeout(() => resolve(payload), 500));
  },

  /** POST /users/me/account-requests */
  async createAccountRequest(payload: Omit<AccountRequest, 'id' | 'timestamp' | 'status'>): Promise<AccountRequest> {
    devLog('Profile', 'Request account closure', payload);
    if (config.mode === 'api') {
      return apiFetch<AccountRequest>('/users/me/account-requests', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    
    const req: AccountRequest = {
      ...payload,
      id: 'req-' + Date.now(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    return MockDB.createAccountRequest(req);
  },

  /** PATCH /users/me/password */
  async changeMyPassword(payload: any): Promise<{ success: boolean; message: string }> {
    devLog('Profile', 'Submit credential security mutation request');
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
    return { success: true, message: 'Mật khẩu của bạn đã được thay đổi thành công.' };
  },

  // Hàm Gửi mã OTP (Khi bấm nút Thay đổi Email/Phone)
  async sendOtpForContactChange(field: 'email' | 'phone', newValue: string): Promise<{ success: boolean; message: string }> {
    devLog('Profile', `Gửi mã OTP để thay đổi ${field} thành ${newValue}`);
    if (config.mode === 'api') {
      // Endpoint này CẦN ĐƯỢC BACKEND HỖ TRỢ, tạm giả lập request
      // return apiFetch<{ success: boolean; message: string }>('/auth/send-otp', {
      //   method: 'POST',
      //   body: JSON.stringify({ field, value: newValue }),
      // });
      return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'OTP đã được gửi' }), 1000));
    }
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'OTP đã được gửi (Mock)' }), 500));
  },

  // Hàm Xác nhận mã OTP
  async verifyOtpContactChange(field: 'email' | 'phone', newValue: string, otp: string): Promise<{ success: boolean }> {
    devLog('Profile', `Xác nhận OTP ${otp} cho ${field}: ${newValue}`);
    if (config.mode === 'api') {
      // Endpoint này CẦN ĐƯỢC BACKEND HỖ TRỢ, tạm giả lập request
      // return apiFetch<{ success: boolean }>('/auth/verify-otp-change-contact', {
      //   method: 'POST',
      //   body: JSON.stringify({ field, value: newValue, otp_code: otp }),
      // });
      return new Promise((resolve, reject) => setTimeout(() => {
        if (otp === '123456') resolve({ success: true });
        else reject(new Error('Mã OTP không hợp lệ (Mã test là 123456)'));
      }, 1000));
    }
    return new Promise((resolve, reject) => setTimeout(() => {
      if (otp === '123456') resolve({ success: true });
      else reject(new Error('Mã OTP không hợp lệ (Mã test là 123456)'));
    }, 500));
  },

  // ==========================================
  // MODULE 4. WISHLIST UTILITIES
  // ==========================================

  /** GET /wishlists */
  async getMyWishlist(): Promise<Course[]> {
    devLog('Wishlist', 'Get bookmarks under active account');
    if (config.mode === 'api') return apiFetch<Course[]>('/wishlists');
    return [];
  },

  /** POST /wishlists */
  async addToWishlist(courseId: string): Promise<{ success: boolean }> {
    devLog('Wishlist', `Add course ID ${courseId} to wishlist`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>('/wishlists', {
        method: 'POST',
        body: JSON.stringify({ course_id: courseId }),
      });
    }
    return { success: true };
  },

  /** DELETE /wishlists/{courseId} */
  async removeFromWishlist(courseId: string): Promise<{ success: boolean }> {
    devLog('Wishlist', `Evict course ID ${courseId} list item`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>(`/wishlists/${courseId}`, {
        method: 'DELETE',
      });
    }
    return { success: true };
  },

  // ==========================================
  // MODULE 5. STUDENT LEARNING COGNITION HUB
  // ==========================================

  /** GET /me/courses */
  async getMyEnrolledCourses(): Promise<Course[]> {
    devLog('Learning', 'Get my bought/enrolled courses library');
    if (config.mode === 'api') return apiFetch<Course[]>('/me/courses');
    return [];
  },

  /** GET /me/learning-dashboard */
  async getLearningDashboardStats(): Promise<any> {
    devLog('Learning', 'Calculate metrics, active days, hours studied, completion milestones');
    if (config.mode === 'api') return apiFetch<any>('/me/learning-dashboard');
    return { totalCourses: 0, completedLessons: 0, studyHours: 0, streakDays: 1 };
  },

  /** GET /me/dynamic-alerts */
  async getMyLearningAlerts(): Promise<any[]> {
    devLog('Learning', 'Search for system and deadline alerts');
    if (config.mode === 'api') return apiFetch<any[]>('/me/dynamic-alerts');
    return [];
  },

  /** GET /me/learning-path/next */
  async getNextPathGoal(): Promise<any> {
    devLog('Learning', 'Recommend following milestone based on historical studies');
    if (config.mode === 'api') return apiFetch<any>('/me/learning-path/next');
    return { recommended_course: null, reason: 'Hãy bắt đầu khóa học đầu tiên' };
  },

  /** GET /me/recommendations/rule-based */
  async getRuleBasedRecommendations(): Promise<Course[]> {
    devLog('Learning', 'Fetch dynamic rule-based personalized suggestions');
    if (config.mode === 'api') return apiFetch<Course[]>('/me/recommendations/rule-based');
    return [];
  },

  /** GET /learn/resume */
  async getResumeBookmarkNode(): Promise<any> {
    devLog('Learning', 'Locate last watched session pointer');
    if (config.mode === 'api') return apiFetch<any>('/learn/resume');
    return null;
  },

  /** GET /learn/courses/{id}/outline */
  async getStudentCourseOutline(courseId: string): Promise<any> {
    devLog('Learning', `Retrieve syllabus framework with checkmarks for Course: ${courseId}`);
    if (config.mode === 'api') return apiFetch<any>(`/learn/courses/${courseId}/outline`);
    return { sections: [] };
  },

  /** GET /learn/courses/{id}/progress */
  async getStudentCourseProgress(courseId: string): Promise<any> {
    devLog('Learning', `Pull complete detailed study data node: ${courseId}`);
    if (config.mode === 'api') return apiFetch<any>(`/learn/courses/${courseId}/progress`);
    return { completed_count: 0, total_lessons: 0, percentage: 0 };
  },

  /** GET /learn/lessons/{id} */
  async getSecureLessonContent(lessonId: string): Promise<Lesson> {
    devLog('Learning', `Get secure media payload and attachments for Lesson: ${lessonId}`);
    if (config.mode === 'api') return apiFetch<Lesson>(`/learn/lessons/${lessonId}`);
    throw new Error('Secure classroom payload requires active API authentication.');
  },

  /** GET /learn/lessons/{id}/check-access */
  async verifyClassroomAccess(lessonId: string): Promise<{ has_access: boolean }> {
    devLog('Learning', `Assert system eligibility node of Lesson ID: ${lessonId}`);
    if (config.mode === 'api') return apiFetch<{ has_access: boolean }>(`/learn/lessons/${lessonId}/check-access`);
    return { has_access: true };
  },

  /** PATCH /learn/lessons/{id}/complete */
  async markLessonAsComplete(lessonId: string): Promise<{ success: boolean }> {
    devLog('Learning', `Setting milestone checkmark to Lesson: ${lessonId}`);
    if (config.mode === 'api') return apiFetch<{ success: boolean }>(`/learn/lessons/${lessonId}/complete`, { method: 'PATCH' });
    return { success: true };
  },

  /** GET /learn/lessons/{id}/next */
  async getNextLessonNode(lessonId: string): Promise<any> {
    devLog('Learning', `Find following lesson after node ${lessonId}`);
    if (config.mode === 'api') return apiFetch<any>(`/learn/lessons/${lessonId}/next`);
    return null;
  },

  /** PATCH /learn/lessons/{id}/progress */
  async saveVideoPlaybackRatio(lessonId: string, currentSeconds: number): Promise<{ success: boolean }> {
    devLog('Learning', `Syncing video playback bookmark: ${lessonId}`, { seconds: currentSeconds });
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>(`/learn/lessons/${lessonId}/progress`, {
        method: 'PATCH',
        body: JSON.stringify({ current_time: currentSeconds }),
      });
    }
    return { success: true };
  },

  /** POST /learn/assets/{assetId}/signed-url */
  async generateSignedAssetUrl(assetId: string): Promise<{ signedUrl: string }> {
    devLog('Learning', `Signing secure credential attachment download token for Asset ${assetId}`);
    if (config.mode === 'api') {
      return apiFetch<{ signedUrl: string }>(`/learn/assets/${assetId}/signed-url`, { method: 'POST' });
    }
    return { signedUrl: '#' };
  },

  /** GET /learn/assets/{id}/download */
  async downloadResourceAsset(assetId: string): Promise<any> {
    devLog('Learning', `Download resource payload for asset node: ${assetId}`);
    if (config.mode === 'api') return apiFetch<any>(`/learn/assets/${assetId}/download`);
    return { success: true };
  },

  /** GET /learn/lessons/{lessonId}/watermark-info */
  async getLiveWatermarkMetadata(lessonId: string): Promise<{ text: string; alpha: number }> {
    devLog('Learning', `Pull licensing watermark to overlay video player of lesson: ${lessonId}`);
    if (config.mode === 'api') return apiFetch<{ text: string; alpha: number }>(`/learn/lessons/${lessonId}/watermark-info`);
    return { text: 'STUDENT_MOCK', alpha: 0.15 };
  },

  /** GET /learning-logs/my */
  async getMyStudyLogs(): Promise<any[]> {
    devLog('Learning', 'Get active study engagement logs history');
    if (config.mode === 'api') return apiFetch<any[]>('/learning-logs/my');
    return [];
  },

  /** GET /lessons/{id}/comments */
  async getLessonComments(lessonId: string): Promise<any[]> {
    devLog('Learning', `Fetch comments stream for Lesson ID: ${lessonId}`);
    if (config.mode === 'api') return apiFetch<any[]>(`/lessons/${lessonId}/comments`);
    return [];
  },

  /** POST /lessons/{id}/comments */
  async addLessonComment(lessonId: string, content: string): Promise<any> {
    devLog('Learning', `Post comment to active Lesson ${lessonId}`, { content });
    if (config.mode === 'api') {
      return apiFetch<any>(`/lessons/${lessonId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    }
    return { id: 'mc-1', content, user: { name: 'Người dùng hiện tại' }, created_at: 'Vừa xong' };
  },

  /** POST /comments/{id}/replies */
  async replyToLessonComment(commentId: string, content: string): Promise<any> {
    devLog('Learning', `Post nested thread replies to comment node ${commentId}`, { content });
    if (config.mode === 'api') {
      return apiFetch<any>(`/comments/${commentId}/replies`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    }
    return { id: 'mc-rep-1', content, user: { name: 'Người dùng hiện tại' }, created_at: 'Vừa xong' };
  },

  /** GET /courses/{id}/completion-status */
  async getCourseCertificateStatus(courseId: string): Promise<{ certified: boolean; certificate_url?: string }> {
    devLog('Learning', `Check validation for Graduation status on course: ${courseId}`);
    if (config.mode === 'api') return apiFetch<any>(`/courses/${courseId}/completion-status`);
    return { certified: false };
  },

  // ==========================================
  // MODULE 6. QUIZ & ASSESSMENTS
  // ==========================================

  /** POST /quizzes/{id}/attempts */
  async submitQuizAttemptAnswers(quizId: string, answers: Record<string, string | number[]>): Promise<any> {
    devLog('Assessment', `Submitting test answers sheet evaluation to Quiz ID: ${quizId}`, answers);
    if (config.mode === 'api') {
      return apiFetch<any>(`/quizzes/${quizId}/attempts`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
    }
    return { score: 100, pass: true, correctCount: 5, totalQuestions: 5 };
  },

  /** GET /quiz-attempts/{id} */
  async getQuizAttemptDetails(attemptId: string): Promise<any> {
    devLog('Assessment', `Retrace diagnostic evaluation worksheet: ${attemptId}`);
    if (config.mode === 'api') return apiFetch<any>(`/quiz-attempts/${attemptId}`);
    return { score: 100, answersChecked: [] };
  },

  // ==========================================
  // MODULE 7. ORDERS & TRANSACTIONS
  // ==========================================

  /** POST /orders */
  async createCheckoutOrder(courseIds: string[]): Promise<any> {
    devLog('Orders', 'Assembling payment carts into transaction invoice', courseIds);
    if (config.mode === 'api') {
      return apiFetch<any>('/orders', {
        method: 'POST',
        body: JSON.stringify({ course_ids: courseIds }),
      });
    }
    return { id: 'ord-mock', status: 'pending', total: 0 };
  },

  /** POST /orders/apply-coupon */
  async applyCouponCode(couponCode: string, orderId: string): Promise<any> {
    devLog('Orders', `Apply coupon "${couponCode}" discount trigger to Order ID: ${orderId}`);
    if (config.mode === 'api') {
      return apiFetch<any>('/orders/apply-coupon', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode, order_id: orderId }),
      });
    }
    return { success: true, discountAmount: 50000, finalTotal: 150000 };
  },

  /** GET /orders/my */
  async getMyOrdersHistory(): Promise<any[]> {
    devLog('Orders', 'Fetch past buy transactions listing');
    if (config.mode === 'api') return apiFetch<any[]>('/orders/my');
    return [];
  },

  /** GET /orders/{id} */
  async getOrderBillReceipt(orderId: string): Promise<any> {
    devLog('Orders', `Query specific purchase record details: ${orderId}`);
    if (config.mode === 'api') return apiFetch<any>(`/orders/${orderId}`);
    return {};
  },

  /** PATCH /orders/{orderId}/cancel */
  async cancelTicketOrder(orderId: string): Promise<{ success: boolean; message: string }> {
    devLog('Orders', `Cancel transaction ID: ${orderId}`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>(`/orders/${orderId}/cancel`, { method: 'PATCH' });
    }
    return { success: true, message: 'Đã hủy đơn hàng.' };
  },

  /** POST /orders/{orderId}/retry-payment */
  async retryPaymentGateway(orderId: string): Promise<any> {
    devLog('Orders', `Reprocess credit clearance for Order ID: ${orderId}`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/orders/${orderId}/retry-payment`, { method: 'POST' });
    }
    return { success: true };
  },

  /** POST /payments */
  async submitManualPaymentProof(payload: FormData): Promise<{ success: boolean }> {
    devLog('Orders', 'Submit manual bank transfer photo proof');
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>('/payments', {
        method: 'POST',
        body: payload, // Transmit as raw FormData mapping multipart/form-data
      });
    }
    return { success: true };
  },

  async createVNPayGatewayUrl(orderId: string): Promise<{ paymentUrl: string }> {
    devLog('Orders', `Redirect to VNPay gateway portal checkouts for Order ${orderId}`);
    if (config.mode === 'api') {
      return apiFetch<{ paymentUrl: string }>('/payments/vnpay/create', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId }),
      });
    }
    // Mock local redirect format for testing
    return { paymentUrl: `/?route=vnpay-return&vnp_TxnRef=${orderId}&vnp_ResponseCode=00` };
  },

  /** GET /payments/vnpay-return */
  async parseVNPayCallback(vnpayParams: string): Promise<any> {
    devLog('Orders', 'Processing VNPay return callback payload token check');
    if (config.mode === 'api') {
      return apiFetch<any>(`/payments/vnpay-return?${vnpayParams}`);
    }
    return { success: true };
  },

  /** POST /payments/webhook */
  async hookPaymentStatusBackground(payload: any): Promise<any> {
    devLog('Orders', 'Incoming transaction webhook notifier payload');
    if (config.mode === 'api') {
      return apiFetch<any>('/payments/webhook', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return { received: true };
  },

  // ==========================================
  // MODULE 8. INSTRUCTOR STUDIO CONTROLS
  // ==========================================

  /** GET /instructor/profile or /users/:id */
  async getInstructorProfile(instructorId?: string): Promise<any> {
    devLog('Instructor', 'Fetch professional trainer profile details', { instructorId });
    if (config.mode === 'api') {
      if (instructorId) {
        return apiFetch<any>(`/users/${instructorId}`);
      }
      return apiFetch<any>('/instructor/profile');
    }
    return { id: instructorId || 'inst-1', name: 'Thầy Giáo Mơ', bio: 'Nhà thiền tu', title: 'Chuyên gia Đào tạo', role: 'instructor', email: 'instructor@mindhub.edu.vn', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150' };
  },

  /** PATCH /instructor/profile */
  async updateInstructorProfile(payload: any): Promise<any> {
    devLog('Instructor', 'Sync public teacher bio credentials', payload);
    if (config.mode === 'api') {
      return apiFetch<any>('/instructor/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
    return payload;
  },

  /** POST /instructor/courses */
  async createCourseDraft(course: Course): Promise<Course> {
    devLog('Instructor', 'Create course draft workspace container', { id: course.id, title: course.title });
    if (config.mode === 'api') {
      return apiFetch<Course>('/instructor/courses', {
        method: 'POST',
        body: JSON.stringify(course),
      });
    }
    return MockDB.createCourseDraft(course);
  },

  /** PATCH /instructor/courses/{id} */
  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
    devLog('Instructor', `Update syllabus fields: ${courseId}`, courseData);
    if (config.mode === 'api') {
      return apiFetch<Course>(`/instructor/courses/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify(courseData),
      });
    }
    return MockDB.updateCourse(courseId, courseData) as Promise<Course>;
  },

  /** DELETE /instructor/courses/{id} -> Mapping backward compatibility with standard deleteCourse */
  async deleteCourse(courseId: string): Promise<{ success: boolean }> {
    devLog('Instructor', `Delete draft course: ${courseId}`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>(`/instructor/courses/${courseId}`, {
        method: 'DELETE',
      });
    }
    return { success: true };
  },

  /** GET /instructor/courses/{courseId}/checklist */
  async getCoursePublishChecklist(courseId: string): Promise<{ valid: boolean; warnings: string[] }> {
    devLog('Instructor', `Retrieve sanity check audit report before publishing Course ID: ${courseId}`);
    if (config.mode === 'api') return apiFetch<any>(`/instructor/courses/${courseId}/checklist`);
    return { valid: true, warnings: [] };
  },

  /** GET /instructor/courses/{id}/review-notes */
  async getAdminSubmissionReviewNotes(courseId: string): Promise<any[]> {
    devLog('Instructor', `Read audit feedback and issues left by Administrator on: ${courseId}`);
    if (config.mode === 'api') return apiFetch<any[]>(`/instructor/courses/${courseId}/review-notes`);
    return [];
  },

  async submitCourseToAdminVerification(courseId: string): Promise<{ success: boolean }> {
    devLog('Instructor', `Lock blueprint of workspace ${courseId} and submit to moderators`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${courseId}/submit`, { method: 'POST' });
    }
    await MockDB.submitCourseForReview(courseId);
    return { success: true };
  },

  /** POST /admin/courses/{id}/approve */
  async approveCourse(courseId: string): Promise<{ success: boolean }> {
    devLog('Admin', `Approve course ID: ${courseId}`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/admin/courses/${courseId}/approve`, { method: 'POST' });
    }
    await MockDB.approveCourse(courseId);
    return { success: true };
  },

  /** POST /admin/courses/{id}/reject */
  async rejectCourse(courseId: string, reason: string): Promise<{ success: boolean }> {
    devLog('Admin', `Reject course ID: ${courseId} with reason: ${reason}`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/admin/courses/${courseId}/reject`, { 
        method: 'POST',
        body: JSON.stringify({ reason }) 
      });
    }
    await MockDB.rejectCourse(courseId, reason);
    return { success: true };
  },

  /** GET /instructor/courses/{id}/learners */
  async getInstructorCourseStudentsList(courseId: string): Promise<any[]> {
    devLog('Instructor', `Query enrolled learner names and active hours for course ${courseId}`);
    if (config.mode === 'api') return apiFetch<any[]>(`/instructor/courses/${courseId}/learners`);
    return [];
  },

  /** GET /instructor/courses/{courseId}/analytics */
  async getCourseEngagementAnalytics(courseId: string): Promise<any> {
    devLog('Instructor', `Calculate drop-offs, daily watchtime frequency graphs: ${courseId}`);
    if (config.mode === 'api') return apiFetch<any>(`/instructor/courses/${courseId}/analytics`);
    return { watchtimeDistribution: [], averageCompletionPercent: 0 };
  },

  /** GET /instructor/courses/{courseId}/learner-risk */
  async getDropoutRiskAnalytics(courseId: string): Promise<any[]> {
    devLog('Instructor', `Running Dropout Predictive heuristics model over students in ${courseId}`);
    if (config.mode === 'api') return apiFetch<any[]>(`/instructor/courses/${courseId}/learner-risk`);
    return [];
  },

  /** GET /instructor/courses/{id}/dashboard */
  async getStudioDashboardStats(courseId?: string): Promise<any> {
    devLog('Instructor', 'Query financial statistics and student enrollment graphs', { id: courseId });
    const url = courseId ? `/instructor/courses/${courseId}/dashboard` : '/instructor/courses/dashboard';
    if (config.mode === 'api') return apiFetch<any>(url);
    return { revenueTotal: 15400000, studentsCount: 240, ratingAverage: 4.85 };
  },

  /** GET /instructor/lessons */
  async getInstructorLessons(): Promise<Lesson[]> {
    devLog('Instructor', 'Fetch all managed classroom content items');
    if (config.mode === 'api') return apiFetch<Lesson[]>('/instructor/lessons');
    return [];
  },

  /** POST /instructor/lessons */
  async createCourseSectionLesson(payload: any): Promise<Lesson> {
    devLog('Instructor', 'Create section lesson resource', payload);
    if (config.mode === 'api') {
      return apiFetch<Lesson>('/instructor/lessons', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return payload;
  },

  /** GET /instructor/lessons/{id} */
  async getInstructorLessonDetails(id: string): Promise<Lesson> {
    devLog('Instructor', `View detailed settings metadata for Lesson node: ${id}`);
    if (config.mode === 'api') return apiFetch<Lesson>(`/instructor/lessons/${id}`);
    throw new Error('Lesson query requires API Mode.');
  },

  /** PUT/PATCH /instructor/lessons/{id} */
  async updateInstructorLesson(id: string, payload: any): Promise<Lesson> {
    devLog('Instructor', `Update lesson metadata nodes of Lesson: ${id}`, payload);
    if (config.mode === 'api') {
      return apiFetch<Lesson>(`/instructor/lessons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
    return payload;
  },

  /** DELETE /instructor/lessons/{id} */
  async deleteInstructorLesson(id: string): Promise<{ success: boolean }> {
    devLog('Instructor', `Delete Lesson node: ${id} from workspace`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>(`/instructor/lessons/${id}`, { method: 'DELETE' });
    }
    return { success: true };
  },

  /** POST /instructor/lessons/{id}/assets */
  async uploadLessonAttachmentFile(lessonId: string, payload: FormData): Promise<any> {
    devLog('Instructor', `Upload document attachment to Lesson placeholder: ${lessonId}`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/lessons/${lessonId}/assets`, {
        method: 'POST',
        body: payload, // Send as FormData directly
      });
    }
    return { id: 'as-1', name: 'File-dinh-kem.pdf', size: '1.2MB' };
  },

  /** PATCH /instructor/lessons/{id}/preview */
  async toggleLessonPublicSample(lessonId: string, isPreviewable: boolean): Promise<any> {
    devLog('Instructor', `Updating sample allowance flag on Lesson: ${lessonId}`, { isPreviewable });
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/lessons/${lessonId}/preview`, {
        method: 'PATCH',
        body: JSON.stringify({ is_free_preview: isPreviewable }),
      });
    }
    return { success: true };
  },

  /** GET /instructor/quizzes */
  async getInstructorQuizzes(): Promise<any[]> {
    devLog('Instructor', 'List quizzes available for inclusion');
    if (config.mode === 'api') return apiFetch<any[]>('/instructor/quizzes');
    return [];
  },

  /** POST /instructor/quizzes */
  async createQuizDraft(quizPayload: any): Promise<any> {
    devLog('Instructor', 'Instantiate a quiz worksheet template', quizPayload);
    if (config.mode === 'api') {
      return apiFetch<any>('/instructor/quizzes', {
        method: 'POST',
        body: JSON.stringify(quizPayload),
      });
    }
    return quizPayload;
  },

  /** GET/PUT/PATCH/DELETE /instructor/quizzes/{id} */
  async manageQuizWorksheet(id: string, action: 'GET' | 'PUT' | 'PATCH' | 'DELETE', payload?: any): Promise<any> {
    devLog('Instructor', `Quiz operations pipeline [${action}] to ID: ${id}`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/quizzes/${id}`, {
        method: action,
        body: payload ? JSON.stringify(payload) : undefined,
      });
    }
    return { success: true, quiz: payload };
  },

  /** GET /instructor/sections */
  async getCourseSections(): Promise<Section[]> {
    devLog('Instructor', 'Sync sections of managed drafts');
    if (config.mode === 'api') return apiFetch<any[]>('/instructor/sections');
    return [];
  },

  /** POST /instructor/sections */
  async createCourseSection(payload: any): Promise<any> {
    devLog('Instructor', 'Write section block into workbook', payload);
    if (config.mode === 'api') {
      return apiFetch<any>('/instructor/sections', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return payload;
  },

  /** GET /instructor/sections/{id} */
  async getSectionDetails(id: string): Promise<any> {
    devLog('Instructor', `Retrieve setting details on section: ${id}`);
    if (config.mode === 'api') return apiFetch<any>(`/instructor/sections/${id}`);
    return {};
  },

  /** PUT / PATCH /instructor/sections/{id} */
  async updateSection(id: string, payload: any): Promise<any> {
    devLog('Instructor', `Modifying structure of section: ${id}`, payload);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/sections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
    return payload;
  },

  /** DELETE /instructor/sections/{id} */
  async deleteSection(id: string): Promise<{ success: boolean }> {
    devLog('Instructor', `Remove section folder block entirely: ${id}`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>(`/instructor/sections/${id}`, { method: 'DELETE' });
    }
    return { success: true };
  },

  /** GET /instructor/coupons */
  async getInstructorPromoCoupons(): Promise<any[]> {
    devLog('Instructor', 'Fetch all discount campaigns under teacher authorship');
    if (config.mode === 'api') return apiFetch<any[]>('/instructor/coupons');
    return [];
  },

  /** POST /instructor/coupons */
  async createPromoCoupon(payload: any): Promise<any> {
    devLog('Instructor', 'Inject new coupon discount rule properties', payload);
    if (config.mode === 'api') {
      return apiFetch<any>('/instructor/coupons', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return payload;
  },

  /** GET /instructor/coupons/{id} */
  async getCouponDetails(id: string): Promise<any> {
    devLog('Instructor', `Retrieve stats for coupon campaign ID: ${id}`);
    if (config.mode === 'api') return apiFetch<any>(`/instructor/coupons/${id}`);
    return {};
  },

  /** PATCH /instructor/coupons/{id} */
  async updatePromoCouponDetails(id: string, payload: any): Promise<any> {
    devLog('Instructor', `Altering active properties / limits of coupon Node: ${id}`, payload);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/coupons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
    return payload;
  },

  /** DELETE /instructor/coupons/{id} */
  async deletePromoCoupon(id: string): Promise<{ success: boolean }> {
    devLog('Instructor', `Evoking coupon system code cancel: ${id}`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>(`/instructor/coupons/${id}`, { method: 'DELETE' });
    }
    return { success: true };
  },

  /** POST /instructor/course-announcements */
  async sendBulkCourseAnnouncement(payload: any): Promise<any> {
    devLog('Instructor', 'Dispatch announcements notifications thread to subscribed students', payload);
    if (config.mode === 'api') {
      return apiFetch<any>('/instructor/course-announcements', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return { success: true };
  },

  /** GET /instructor/revenue */
  async getRevenueReportsSummary(): Promise<any> {
    devLog('Instructor', 'Fetch sales distributions and ledger reports');
    if (config.mode === 'api') return apiFetch<any>('/instructor/revenue');
    return { earningsTotal: 15400000, ledger: [] };
  },

  /** GET /instructor/reports/completion-rate */
  async getCompletionRatesReport(): Promise<any[]> {
    devLog('Instructor', 'Compile average lessons completed statistics across student population');
    if (config.mode === 'api') return apiFetch<any[]>('/instructor/reports/completion-rate');
    return [];
  },

  /** GET /instructor/reports/inactive-learners */
  async getInactiveStudentsRiskList(): Promise<any[]> {
    devLog('Instructor', 'Query for users with zero classroom logins (> 14 days)');
    if (config.mode === 'api') return apiFetch<any[]>('/instructor/reports/inactive-learners');
    return [];
  },

  /** POST /instructor/withdrawals */
  async submitBalancePayoutRequest(payload: Partial<PayoutRequest>): Promise<PayoutRequest> {
    devLog('Instructor', 'Submitting finance balance payout request', payload);
    if (config.mode === 'api') {
      return apiFetch<PayoutRequest>('/instructor/withdrawals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return payload as any;
  },

  // ==========================================
  // MODULE 9. ADMINISTRATIVE CONTROLS
  // ==========================================

  /** GET /admin/roles */
  async getRolesList(): Promise<any[]> {
    devLog('Admin', 'Query complete role models system directories');
    if (config.mode === 'api') return apiFetch<any[]>('/admin/roles');
    return [];
  },

  /** POST /admin/roles */
  async createAdminRole(payload: any): Promise<any> {
    devLog('Admin', 'Adding role privilege node', payload);
    if (config.mode === 'api') {
      return apiFetch<any>('/admin/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return payload;
  },

  /** GET /admin/roles/{id} */
  async getRoleDefinitionDetails(id: string): Promise<any> {
    devLog('Admin', `View permissions dictionary configured under tag: ${id}`);
    if (config.mode === 'api') return apiFetch<any>(`/admin/roles/${id}`);
    return {};
  },

  /** PUT / PATCH /admin/roles/{id} */
  async updateRoleDefinitionDetails(id: string, payload: any): Promise<any> {
    devLog('Admin', `Modifying privilege mask of role: ${id}`, payload);
    if (config.mode === 'api') {
      return apiFetch<any>(`/admin/roles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
    return payload;
  },

  /** DELETE /admin/roles/{id} */
  async deleteAdminRole(id: string): Promise<{ success: boolean }> {
    devLog('Admin', `Revoke role template: ${id}`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>(`/admin/roles/${id}`, { method: 'DELETE' });
    }
    return { success: true };
  },

  /** GET /admin/users */
  async getPlatformUsersList(): Promise<User[]> {
    devLog('Admin', 'Fetch full index directory of users registrations');
    if (config.mode === 'api') return apiFetch<User[]>('/admin/users');
    return [];
  },

  /** POST /admin/users */
  async createPlatformUserAccount(payload: any): Promise<User> {
    devLog('Admin', 'Creating account from backend control panels', payload);
    if (config.mode === 'api') {
      return apiFetch<User>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return payload;
  },

  /** GET /admin/users/{id} */
  async getPlatformUserDetail(id: string): Promise<User> {
    devLog('Admin', `View general history and order logs for User: ${id}`);
    if (config.mode === 'api') return apiFetch<User>(`/admin/users/${id}`);
    throw new Error('User node details require active API connection.');
  },

  /** PUT / PATCH /admin/users/{id} */
  async updatePlatformUserCredentials(id: string, payload: any): Promise<User> {
    devLog('Admin', `Overriding role or credential details of user: ${id}`, payload);
    if (config.mode === 'api') {
      return apiFetch<User>(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
    return payload;
  },

  /** DELETE /admin/users/{id} */
  async deactivatePlatformUserAccount(id: string): Promise<{ success: boolean }> {
    devLog('Admin', `Invoking ban/deactivation command on account ID: ${id}`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>(`/admin/users/${id}`, { method: 'DELETE' });
    }
    return { success: true };
  },

  /** GET /admin/test */
  async verifyAdminAuthConnection(): Promise<{ authenticated: boolean; system_healthy: boolean }> {
    devLog('Admin', 'Ping admin authentication status connection test sequence');
    if (config.mode === 'api') return apiFetch<any>('/admin/test');
    return { authenticated: true, system_healthy: true };
  },

  // ==========================================
  // RETRO-SUPPORT / BACKWARD COMPATABILITY INTEGRATIONS
  // ==========================================
  async updateCourseChapters(courseId: string, chapters: Chapter[]): Promise<{ success: boolean; chapters: Chapter[] }> {
    devLog('Chapters', `Bulk Sync Curriculum for course ${courseId}`, chapters);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; chapters: Chapter[] }>(`/courses/${courseId}/chapters`, {
        method: 'POST',
        body: JSON.stringify({ chapters }),
      });
    }
    return { success: true, chapters };
  },

  async uploadLessonVideo(
    file: File, 
    onProgress: (progress: number, status: string) => void
  ): Promise<{ success: boolean; videoUrl: string; duration: string }> {
    devLog('Media', 'Upload direct video file request', { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(2)} MB` });
    
    if (config.mode === 'api') {
      // Real API Mode: uploads using multipart/form-data
      const formData = new FormData();
      formData.append('video', file);
      
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${config.baseUrl}/media/upload-video`);
        
        if (config.authToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${config.authToken}`);
        }
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete, 'Đang gửi từng cụm byte lên Cloud Storage...');
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } catch (err) {
              reject(new Error('Invalid response payload from media server.'));
            }
          } else {
            reject(new Error(`Tải video lỗi: status code ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Mất kết nối tới máy chủ lưu trữ HLS.'));
        xhr.send(formData);
      });
    }

    // Return simulation
    return new Promise((resolve) => {
      resolve({
        success: true,
        videoUrl: `https://mindhub-cdn.example.com/videos/${Date.now()}_stream/adaptive.m3u8`,
        duration: '12:45'
      });
    });
  },

  async updateStudentProgress(courseId: string, progress: Partial<StudentProgress>): Promise<Partial<StudentProgress>> {
    devLog('Progress', `Sync student study session for: ${courseId}`, progress);
    if (config.mode === 'api') {
      return apiFetch<StudentProgress>(`/progress/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify(progress),
      });
    }
    return progress;
  },

  /** POST /auth/send-phone-otp */
  async sendPhoneOtp(phone: string, purpose: string = 'verify_phone'): Promise<{ success: boolean; message: string }> {
    devLog('Auth', 'Send Phone OTP', { phone, purpose });
    try {
      const res = await fetch('http://localhost:3000/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi gửi OTP');
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Lỗi gửi OTP');
    }
  },

  /** POST /auth/verify-phone-otp */
  async verifyPhoneOtp(phone: string, otp: string, purpose: string = 'verify_phone'): Promise<{ success: boolean, ticket?: string }> {
    devLog('Auth', 'Verify Phone OTP', { phone, otp, purpose });
    try {
      const res = await fetch('http://localhost:3000/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, purpose })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Mã OTP không chính xác');
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Mã OTP không chính xác');
    }
  },

  /** POST /role-requests/admin */
  async requestAdminRole(payload: any): Promise<{ success: boolean; message: string }> {
    devLog('Auth', 'Request Admin Role', payload);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>('/role-requests/admin', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    return { success: true, message: 'Yêu cầu quyền Admin hệ thống đã được gửi đến Super Admin.' };
  },

  /** POST /roles/request-instructor */
  async requestInstructorRole(payload: any): Promise<{ success: boolean; message: string }> {
    devLog('Auth', 'Request Instructor Role', payload);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>('/roles/request-instructor', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    
    // Fallback for mock mode
    const requests = JSON.parse(localStorage.getItem('mindhub_instructor_requests') || '[]');
    requests.push({
      ...payload,
      id: 'req-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('mindhub_instructor_requests', JSON.stringify(requests));
    
    // Update current user locally
    const userStr = localStorage.getItem('mindhub_current_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.roleRequestStatus = 'pending_instructor';
      localStorage.setItem('mindhub_current_user', JSON.stringify(user));
    }
    return { success: true, message: 'Yêu cầu trở thành giảng viên đã được gửi đi.' };
  },

  /** GET /roles/requests */
  async getInstructorRequests(): Promise<InstructorRequest[]> {
    devLog('Auth', 'Get Instructor Requests');
    if (config.mode === 'api') {
      const data = await apiFetch<any>('/roles/requests');
      return data.requests || [];
    }
    return JSON.parse(localStorage.getItem('mindhub_instructor_requests') || '[]');
  },

  /** POST /roles/resolve */
  async resolveInstructorRequest(payload: { requestId: string; action: 'approve' | 'reject'; rejectionReason?: string }): Promise<{ success: boolean; message: string }> {
    devLog('Auth', 'Resolve Instructor Request', payload);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>('/roles/resolve', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    
    // Fallback mock mode
    let requests = JSON.parse(localStorage.getItem('mindhub_instructor_requests') || '[]');
    const index = requests.findIndex((r: any) => r.id === payload.requestId);
    if (index >= 0) {
      requests[index].status = payload.action === 'approve' ? 'approved' : 'rejected';
      requests[index].rejectionReason = payload.rejectionReason;
      requests[index].reviewedAt = new Date().toISOString();
      localStorage.setItem('mindhub_instructor_requests', JSON.stringify(requests));
      
      // We would ideally update the user's role here, but we don't have the full users DB in mock mode easily available.
      // Assuming the user logs out and in, or their current user state handles it.
    }
    return { success: true, message: payload.action === 'approve' ? 'Đã phê duyệt yêu cầu giảng viên.' : 'Đã từ chối yêu cầu.' };
  },

  /** POST /roles/request-leave-instructor */
  async requestLeaveInstructorRole(payload: { userId: string; fullName: string; email: string; reason: string }): Promise<{ success: boolean; message: string }> {
    devLog('Auth', 'Request Leave Instructor Role', payload);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>('/roles/request-leave-instructor', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    
    // Fallback mock mode
    const requests = JSON.parse(localStorage.getItem('mindhub_instructor_requests') || '[]');
    requests.push({
      ...payload,
      id: 'req-leave-' + Date.now(),
      status: 'pending',
      requestType: 'leave_instructor',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('mindhub_instructor_requests', JSON.stringify(requests));
    
    // Update locally
    const userStr = localStorage.getItem('mindhub_current_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.roleRequestStatus = 'pending_leave_instructor';
      localStorage.setItem('mindhub_current_user', JSON.stringify(user));
    }
    return { success: true, message: 'Yêu cầu rời vai trò giảng viên đã được gửi đi.' };
  },

  /** GET /admin/users/:userId/courses */
  async getInstructorCoursesByAdmin(userId: string): Promise<Course[]> {
    devLog('Admin', 'Get instructor courses', { userId });
    if (config.mode === 'api') {
      const data = await apiFetch<any>(`/admin/users/${userId}/courses`);
      return data.courses || [];
    }
    return []; // mock courses handled locally in UI or fallback
  },

  /** POST /admin/users/:userId/lock */
  async toggleUserLockAdmin(userId: string, action: 'lock' | 'unlock'): Promise<{ success: boolean; message: string; status: string }> {
    devLog('Admin', `Toggle user lock: ${action}`, { userId });
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string; status: string }>(`/admin/users/${userId}/lock`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
    }
    return { 
      success: true, 
      message: action === 'lock' ? 'Tài khoản đã bị khóa.' : 'Tài khoản đã được mở khóa.', 
      status: action === 'lock' ? 'locked' : 'active' 
    };
  },

  /** GET /admin/account-requests */
  async getAccountRequests(): Promise<AccountRequest[]> {
    devLog('Admin', 'Fetch account requests');
    if (config.mode === 'api') {
      return apiFetch<AccountRequest[]>('/admin/account-requests');
    }
    return MockDB.getAccountRequests();
  },

  /** PATCH /admin/account-requests/:requestId/resolve */
  async resolveAccountRequest(requestId: string, action: 'approved' | 'rejected'): Promise<{ success: boolean; message: string }> {
    devLog('Admin', 'Resolve account request', { requestId, action });
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>(`/admin/account-requests/${requestId}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ action })
      });
    }
    await MockDB.updateAccountRequest(requestId, { status: action });
    return { success: true, message: 'Đã duyệt yêu cầu thành công' };
  },

  /** PATCH /admin/orders/:orderId/status */
  async updateOrderStatus(orderId: string, status: 'success' | 'pending' | 'failed'): Promise<{ success: boolean; message: string }> {
    devLog('Admin', `Update order status to ${status}`, { orderId });
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
    // Optional: we can add this to mock DB if needed
    return { success: true, message: 'Cập nhật trạng thái đơn hàng thành công' };
  },

  /** PATCH /admin/payout-requests/:requestId/resolve */
  async resolvePayoutRequest(requestId: string, action: 'completed' | 'rejected'): Promise<{ success: boolean; message: string }> {
    devLog('Admin', `Resolve payout request to ${action}`, { requestId });
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>(`/admin/payout-requests/${requestId}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ action })
      });
    }
    await MockDB.updatePayoutRequest(requestId, { status: action });
    return { success: true, message: 'Duyệt yêu cầu rút tiền thành công' };
  },

  /** PATCH /admin/courses/:courseId/status */
  async updateCourseStatusAdmin(courseId: string, status: string): Promise<{ success: boolean; message: string }> {
    devLog('Admin', `Update course status to ${status}`, { courseId });
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message: string }>(`/admin/courses/${courseId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
    return { success: true, message: 'Đã cập nhật trạng thái khóa học.' };
  },

  /** POST /contact */
  async sendContactMessage(payload: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean; message?: string }> {
    devLog('Contact', 'Gửi tin nhắn liên hệ', payload);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean; message?: string }>('/contact', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    // Mock
    return { success: true, message: 'Mock: Đã gửi liên hệ' };
  },

  /** GET /packages */
  async getCoursePackages(): Promise<any[]> {
    devLog('Packages', 'Get course creation packages');
    if (config.mode === 'api') {
      return apiFetch<any[]>('/packages');
    }
    // Mock packages
    return [
      { id: 'pkg-1', name: 'Gói Trải Nghiệm', price: 200000, credits: 1, status: 'active', sort_order: 1 },
      { id: 'pkg-2', name: 'Gói Tiêu Chuẩn', price: 500000, credits: 3, status: 'active', sort_order: 2 },
      { id: 'pkg-3', name: 'Gói Chuyên Nghiệp', price: 1500000, credits: 10, status: 'active', sort_order: 3 }
    ];
  },

  async getPackageById(packageId: string): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/packages/${packageId}`);
    }
    const packages = await this.getCoursePackages();
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) throw new Error('Không tìm thấy gói');
    return pkg;
  },

  async createPackageOrder(payload: { userId: string, packageId: string, couponCode?: string }): Promise<any> {
    devLog('Payments', 'Create package order', payload);
    if (config.mode === 'api') {
      return apiFetch<any>('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    // Mock order creation
    const pkg = await this.getPackageById(payload.packageId);
    const newOrder = {
      id: 'ord-' + Date.now(),
      order_code: 'PKG-MOCK-' + Date.now(),
      amount: pkg.price,
      package_snapshot_name: pkg.name,
      package_snapshot_credits: pkg.credits,
      status: 'pending'
    };
    await MockDB.createPackageOrder(newOrder);
    return {
      success: true,
      order: newOrder
    };
  },

  async confirmPackagePayment(payload: { orderCode: string, paymentMethod: string }): Promise<any> {
    devLog('Payments', 'Confirm package payment', payload);
    if (config.mode === 'api') {
      return apiFetch<any>('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    // Mock confirmation
    let quota = await MockDB.getInstructorQuota();
    const order = await MockDB.getPackageOrder(payload.orderCode);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }
    if (order.status === 'paid') {
      return { success: true, order };
    }
    
    quota.remaining += order.package_snapshot_credits;
    quota.totalPurchased += order.package_snapshot_credits;
    await MockDB.updateInstructorQuota(quota);
    
    const updatedOrder = await MockDB.updatePackageOrder(payload.orderCode, { 
      status: 'paid', 
      paymentMethod: payload.paymentMethod 
    });
    
    return { success: true, order: updatedOrder };
  },

  async getInstructorCreditBalance(instructorId: string): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/credits/balance/${instructorId}`);
    }
    // Mock balance
    const quota = await MockDB.getInstructorQuota();
    return {
      total_credits: quota.totalPurchased,
      used_credits: quota.totalPurchased - quota.remaining,
      remaining_credits: quota.remaining
    };
  },

  async getInstructorCreditTransactions(instructorId: string): Promise<any[]> {
    if (config.mode === 'api') {
      return apiFetch<any[]>(`/credits/transactions/${instructorId}`);
    }
    return [];
  },

  async getInstructorPackageOrders(instructorId: string): Promise<any[]> {
    if (config.mode === 'api') {
      return apiFetch<any[]>(`/credits/orders/${instructorId}`);
    }
    return [];
  },

  async getAdminPackageOrders(): Promise<any[]> {
    if (config.mode === 'api') {
      return apiFetch<any[]>('/credits/admin/orders');
    }
    return [];
  }
};


// Declared helper interface for sections array
interface Section {
  id: string;
  title: string;
  course_id: string;
  order: number;
}
