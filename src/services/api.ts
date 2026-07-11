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
const initialMode = (import.meta as any).env?.VITE_API_MODE === 'api' ? 'api' : 'mock';
const initialBaseUrl = localStorage.getItem('mindhub_api_base_url') || (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

const config: ApiConfig = {
  mode: initialMode,
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
  headers.set('Accept', 'application/json');
  
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

  const json = await response.json();
  // Unwrap Laravel ApiResponse envelope: { success, data, message }
  if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
    return json.data as T;
  }
  return json as T;
}

export const ApiService = {
  // -------------------------------------------------------------
  // SYSTEM & CONNECTION UTILS
  // -------------------------------------------------------------
  getConfig() {
        // BACKEND_MISSING
    return { ...config };
  },

  setMode(mode: 'mock' | 'api') {
      // BACKEND_MISSING
    config.mode = mode;
    localStorage.setItem('mindhub_api_mode', mode);
    devLog('Config', `Changed API mode to: ${mode}`, { mode });
    window.dispatchEvent(new CustomEvent('mindhub-api-mode-changed', { detail: mode }));
  },

  setBaseUrl(url: string) {
      // BACKEND_MISSING
    config.baseUrl = url;
    localStorage.setItem('mindhub_api_base_url', url);
    devLog('Config', 'Changed API Base URL', { url });
    window.dispatchEvent(new CustomEvent('mindhub-api-base-url-changed', { detail: url }));
  },

  setAuthToken(token: string | null) {
      // BACKEND_MISSING
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
      // BACKEND_MISSING
    try {
      return JSON.parse(localStorage.getItem('mindhub_virtual_api_logs') || '[]');
    } catch {
      return [];
    }
  },

  clearVirtualLogs() {
      // BACKEND_MISSING
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
  devLog('Auth', 'Register new user', { email: payload.email, role: payload.role });
  const endpoint = payload.role === 'instructor' ? '/auth/register/instructor' : '/auth/register/learner';
  const res = await apiFetch<{ user: User; token: string }>(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  this.setAuthToken(res.token);
  return res;
  },

  /** POST /auth/login */
  async login(payload: any): Promise<{ user: User; token: string }> {
  devLog('Auth', 'Login credentials authentication', { email: payload.email });
  const res = await apiFetch<{ user: User; token: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  this.setAuthToken(res.token);
  return res;
  },

  /** POST /auth/logout */
  async logout(): Promise<{ success: boolean }> {
  devLog('Auth', 'Logout active session requests');
  const res = await apiFetch<{ success: boolean }>('/auth/logout', {
          method: 'POST',
        });
  this.setAuthToken(null);
  return res;
  },

  /** POST /auth/logout-all */
  async logoutAll(): Promise<{ success: boolean }> {
      // BACKEND_MISSING
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
      // BACKEND_MISSING
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
      // BACKEND_MISSING
    devLog('Auth', 'Fetch active browser sessions');
    if (config.mode === 'api') {
      return apiFetch<any[]>('/auth/sessions');
    }
    return [{ id: 'sess-1', device: 'Chrome / Windows', ip_address: '127.0.0.1', is_current: true, last_active: 'Vừa xong' }];
  },

  /** DELETE /auth/sessions/{sessionId} */
  async revokeSession(sessionId: string): Promise<{ success: boolean }> {
      // BACKEND_MISSING
    devLog('Auth', `Revoking specific session ID: ${sessionId}`);
    if (config.mode === 'api') {
      return apiFetch<{ success: boolean }>(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
    }
    return { success: true };
  },

  /** POST /auth/forgot-password */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  devLog('Auth', 'Send password reset link to', { email });
  return apiFetch<{ success: boolean; message: string }>('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
  },

  /** POST /auth/reset-password */
  async resetPassword(payload: any): Promise<{ success: boolean; message: string }> {
  devLog('Auth', 'Submit password reset request');
  return apiFetch<{ success: boolean; message: string }>('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
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
  const res = await apiFetch<{ user: User; token: string }>('/auth/google', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
  this.setAuthToken(res.token);
  return res;
  },

  // ==========================================
  // MODULE 2. PUBLIC CATALOG & COURSE DISCOVERY
  // ==========================================

  /** GET /home */
  async getHomepageData(): Promise<any> {
  devLog('Catalog', 'Get homepage catalog metrics, sliders, and categories');
  return apiFetch<any>('/home');
  },

  /** GET /categories */
  async getCategories(): Promise<any[]> {
  devLog('Catalog', 'Get list of course categories');
  return apiFetch<any[]>('/categories');
  },

  // Get category counts
  async getCategoriesWithCount(): Promise<{name: string, count: number}[]> {
      // BACKEND_MISSING
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
      // BACKEND_MISSING
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
      // BACKEND_MISSING
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
      // BACKEND_MISSING
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
  },

  /** GET /courses/featured */
  async getFeaturedCourses(): Promise<Course[]> {
  devLog('Catalog', 'Fetch highly rated featured courses');
  return apiFetch<Course[]>('/courses/featured');
  },

  /** GET /courses/bestsellers */
  async getBestsellerCourses(): Promise<Course[]> {
      // BACKEND_MISSING
    devLog('Catalog', 'Fetch best-selling courses');
    if (config.mode === 'api') return apiFetch<Course[]>('/courses/bestsellers');
    return (await MockDB.getCourses()).filter(c => c.isBestseller);
  },

  /** GET /courses/latest */
  async getLatestCourses(): Promise<Course[]> {
  devLog('Catalog', 'Fetch newly published curriculum');
  return apiFetch<Course[]>('/courses/latest');
  },

  /** GET /courses/sort */
  async getFilteredSortedCourses(params: any): Promise<Course[]> {
  devLog('Catalog', 'Sort course directory dynamically', params);
  const qParams = new URLSearchParams(params).toString();
  return apiFetch<Course[]>(`/courses/sort?${qParams}`);
  },

  /** GET /courses/{slug} */
  async getCourseBySlug(slug: string): Promise<Course> {
  devLog('Catalog', `View public course node payload with slug: ${slug}`);
  return apiFetch<Course>(`/courses/${slug}`);
  },

  /** GET /courses/{id}/outline */
  async getCourseOutline(id: string): Promise<any> {
  devLog('Catalog', `Fetch Syllabus/Outline structure for syllabus ID: ${id}`);
  return apiFetch<any>(`/courses/${id}/outline`);
  },

  /** GET /courses/{id}/reviews */
  async getCourseReviews(id: string): Promise<any[]> {
  devLog('Catalog', `Fetch student evaluations and written reviews for course: ${id}`);
  return apiFetch<any[]>(`/courses/${id}/reviews`);
  },

  /** POST /courses/{id}/reviews */
  async postCourseReview(id: string, payload: any): Promise<any> {
  devLog('Catalog', `Submit review to course: ${id}`, payload);
  return apiFetch<any>(`/courses/${id}/reviews`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

  /** GET /courses/{id}/faqs */
  async getCourseFAQs(id: string): Promise<any[]> {
  devLog('Catalog', `Get detailed FAQ questions for Course ID: ${id}`);
  return apiFetch<any[]>(`/courses/${id}/faqs`);
  },

  /** GET /courses/{id}/questions */
  async getCourseQuestions(id: string, isInternal?: boolean): Promise<any[]> {
      // BACKEND_MISSING
    devLog('Catalog', `Get Q&A questions for Course ID: ${id}, isInternal: ${isInternal}`);
    if (config.mode === 'api') {
      const qs = isInternal !== undefined ? `?isInternal=${isInternal}` : '';
      return apiFetch<any[]>(`/courses/${id}/questions${qs}`);
    }
    return [];
  },

  /** POST /courses/{id}/questions */
  async addCourseQuestion(id: string, payload: { authorId: string; content: string; isInternal: boolean; lessonId?: string }): Promise<any> {
      // BACKEND_MISSING
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
      // BACKEND_MISSING
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
  return apiFetch<Course[]>(`/courses/${courseId}/related`);
  },

  /** GET /lessons/{id}/preview */
  async getFreeLessonPreview(lessonId: string): Promise<any> {
  devLog('Catalog', `Attempting free sample preview for Lesson ID: ${lessonId}`);
  return apiFetch<any>(`/lessons/${lessonId}/preview`);
  },

  /** GET /search/suggestions */
  async getAutocompleteSuggestions(query: string): Promise<string[]> {
  devLog('Catalog', `Get index search hints for query: "${query}"`);
  return apiFetch<string[]>(`/search/suggestions?q=${encodeURIComponent(query)}`);
  },

  /** GET /instructors/featured */
  async getFeaturedInstructors(): Promise<any[]> {
  devLog('Catalog', 'Get list of top-rated platform experts');
  return apiFetch<any[]>('/instructors/featured');
  },

  /** GET /instructors/{id} */
  async getPublicInstructorProfile(instructorId: string): Promise<any> {
  devLog('Catalog', `View public professional page/bio for trainer ID: ${instructorId}`);
  return apiFetch<any>(`/instructors/${instructorId}`);
  },

  /** GET /instructors/{id}/courses */
  async getInstructorCourses(instructorId: string, filters?: any): Promise<Course[]> {
      // BACKEND_MISSING
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
  return apiFetch<User>('/users/me');
  },

  /** PATCH /users/me */
  async updateMyProfile(payload: Partial<User>): Promise<User> {
  devLog('Profile', 'Sync personal bio and name traits', payload);
  return apiFetch<User>('/users/me', {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

  /** POST /users/me/account-requests */
  async createAccountRequest(payload: Omit<AccountRequest, 'id' | 'timestamp' | 'status'>): Promise<AccountRequest> {
      // BACKEND_MISSING
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
  return apiFetch<{ success: boolean; message: string }>('/users/me/password', {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

  // Hàm Gửi mã OTP (Khi bấm nút Thay đổi Email/Phone)
  async sendOtpForContactChange(field: 'email' | 'phone', newValue: string): Promise<{ success: boolean; message: string }> {
      // BACKEND_MISSING
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
      // BACKEND_MISSING
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
  return apiFetch<Course[]>('/wishlists');
  },

  /** POST /wishlists */
  async addToWishlist(courseId: string): Promise<{ success: boolean }> {
  devLog('Wishlist', `Add course ID ${courseId} to wishlist`);
  return apiFetch<{ success: boolean }>('/wishlists', {
          method: 'POST',
          body: JSON.stringify({ course_id: courseId }),
        });
  },

  /** DELETE /wishlists/{courseId} */
  async removeFromWishlist(courseId: string): Promise<{ success: boolean }> {
  devLog('Wishlist', `Evict course ID ${courseId} list item`);
  return apiFetch<{ success: boolean }>(`/wishlists/${courseId}`, {
          method: 'DELETE',
        });
  },

  // ==========================================
  // MODULE 5. STUDENT LEARNING COGNITION HUB
  // ==========================================

  /** GET /me/courses */
  async getMyEnrolledCourses(): Promise<Course[]> {
  devLog('Learning', 'Get my bought/enrolled courses library');
  return apiFetch<Course[]>('/me/courses');
  },

  /** GET /me/learning-dashboard */
  async getLearningDashboardStats(): Promise<any> {
  devLog('Learning', 'Calculate metrics, active days, hours studied, completion milestones');
  return apiFetch<any>('/me/learning-dashboard');
  },

  /** GET /me/dynamic-alerts */
  async getMyLearningAlerts(): Promise<any[]> {
  devLog('Learning', 'Search for system and deadline alerts');
  return apiFetch<any[]>('/me/dynamic-alerts');
  },

  /** GET /me/learning-path/next */
  async getNextPathGoal(): Promise<any> {
  devLog('Learning', 'Recommend following milestone based on historical studies');
  return apiFetch<any>('/me/learning-path/next');
  },

  /** GET /me/recommendations/rule-based */
  async getRuleBasedRecommendations(): Promise<Course[]> {
  devLog('Learning', 'Fetch dynamic rule-based personalized suggestions');
  return apiFetch<Course[]>('/me/recommendations/rule-based');
  },

  /** GET /learn/resume */
  async getResumeBookmarkNode(): Promise<any> {
  devLog('Learning', 'Locate last watched session pointer');
  return apiFetch<any>('/learn/resume');
  },

  /** GET /learn/courses/{id}/outline */
  async getStudentCourseOutline(courseId: string): Promise<any> {
  devLog('Learning', `Retrieve syllabus framework with checkmarks for Course: ${courseId}`);
  return apiFetch<any>(`/learn/courses/${courseId}/outline`);
  },

  /** GET /learn/courses/{id}/progress */
  async getStudentCourseProgress(courseId: string): Promise<any> {
  devLog('Learning', `Pull complete detailed study data node: ${courseId}`);
  return apiFetch<any>(`/learn/courses/${courseId}/progress`);
  },

  /** GET /learn/lessons/{id} */
  async getSecureLessonContent(lessonId: string): Promise<Lesson> {
  devLog('Learning', `Get secure media payload and attachments for Lesson: ${lessonId}`);
  return apiFetch<Lesson>(`/learn/lessons/${lessonId}`);
  },

  /** GET /learn/lessons/{id}/check-access */
  async verifyClassroomAccess(lessonId: string): Promise<{ has_access: boolean }> {
  devLog('Learning', `Assert system eligibility node of Lesson ID: ${lessonId}`);
  return apiFetch<{ has_access: boolean }>(`/learn/lessons/${lessonId}/check-access`);
  },

  /** PATCH /learn/lessons/{id}/complete */
  async markLessonAsComplete(lessonId: string): Promise<{ success: boolean }> {
  devLog('Learning', `Setting milestone checkmark to Lesson: ${lessonId}`);
  return apiFetch<{ success: boolean }>(`/learn/lessons/${lessonId}/complete`, { method: 'PATCH' });
  },

  /** GET /learn/lessons/{id}/next */
  async getNextLessonNode(lessonId: string): Promise<any> {
  devLog('Learning', `Find following lesson after node ${lessonId}`);
  return apiFetch<any>(`/learn/lessons/${lessonId}/next`);
  },

  /** PATCH /learn/lessons/{id}/progress */
  async saveVideoPlaybackRatio(lessonId: string, currentSeconds: number): Promise<{ success: boolean }> {
  devLog('Learning', `Syncing video playback bookmark: ${lessonId}`, { seconds: currentSeconds });
  return apiFetch<{ success: boolean }>(`/learn/lessons/${lessonId}/progress`, {
          method: 'PATCH',
          body: JSON.stringify({ current_time: currentSeconds }),
        });
  },

  /** POST /learn/assets/{assetId}/signed-url */
  async generateSignedAssetUrl(assetId: string): Promise<{ signedUrl: string }> {
  devLog('Learning', `Signing secure credential attachment download token for Asset ${assetId}`);
  return apiFetch<{ signedUrl: string }>(`/learn/assets/${assetId}/signed-url`, { method: 'POST' });
  },

  /** GET /learn/assets/{id}/download */
  async downloadResourceAsset(assetId: string): Promise<any> {
  devLog('Learning', `Download resource payload for asset node: ${assetId}`);
  return apiFetch<any>(`/learn/assets/${assetId}/download`);
  },

  /** GET /learn/lessons/{lessonId}/watermark-info */
  async getLiveWatermarkMetadata(lessonId: string): Promise<{ text: string; alpha: number }> {
  devLog('Learning', `Pull licensing watermark to overlay video player of lesson: ${lessonId}`);
  return apiFetch<{ text: string; alpha: number }>(`/learn/lessons/${lessonId}/watermark-info`);
  },

  /** GET /learning-logs/my */
  async getMyStudyLogs(): Promise<any[]> {
  devLog('Learning', 'Get active study engagement logs history');
  return apiFetch<any[]>('/learning-logs/my');
  },

  /** GET /lessons/{id}/comments */
  async getLessonComments(lessonId: string): Promise<any[]> {
  devLog('Learning', `Fetch comments stream for Lesson ID: ${lessonId}`);
  return apiFetch<any[]>(`/lessons/${lessonId}/comments`);
  },

  /** POST /lessons/{id}/comments */
  async addLessonComment(lessonId: string, content: string): Promise<any> {
  devLog('Learning', `Post comment to active Lesson ${lessonId}`, { content });
  return apiFetch<any>(`/lessons/${lessonId}/comments`, {
          method: 'POST',
          body: JSON.stringify({ content }),
        });
  },

  /** POST /comments/{id}/replies */
  async replyToLessonComment(commentId: string, content: string): Promise<any> {
  devLog('Learning', `Post nested thread replies to comment node ${commentId}`, { content });
  return apiFetch<any>(`/comments/${commentId}/replies`, {
          method: 'POST',
          body: JSON.stringify({ content }),
        });
  },

  /** GET /courses/{id}/completion-status */
  async getCourseCertificateStatus(courseId: string): Promise<{ certified: boolean; certificate_url?: string }> {
  devLog('Learning', `Check validation for Graduation status on course: ${courseId}`);
  return apiFetch<any>(`/courses/${courseId}/completion-status`);
  },

  // ==========================================
  // MODULE 6. QUIZ & ASSESSMENTS
  // ==========================================

  /** POST /quizzes/{id}/attempts */
  async submitQuizAttemptAnswers(quizId: string, answers: Record<string, string | number[]>): Promise<any> {
  devLog('Assessment', `Submitting test answers sheet evaluation to Quiz ID: ${quizId}`, answers);
  return apiFetch<any>(`/quizzes/${quizId}/attempts`, {
          method: 'POST',
          body: JSON.stringify({ answers }),
        });
  },

  /** GET /quiz-attempts/{id} */
  async getQuizAttemptDetails(attemptId: string): Promise<any> {
  devLog('Assessment', `Retrace diagnostic evaluation worksheet: ${attemptId}`);
  return apiFetch<any>(`/quiz-attempts/${attemptId}`);
  },

  // ==========================================
  // MODULE 7. ORDERS & TRANSACTIONS
  // ==========================================

  /** POST /orders */
  async createCheckoutOrder(courseIds: string[]): Promise<any> {
  devLog('Orders', 'Assembling payment carts into transaction invoice', courseIds);
  return apiFetch<any>('/orders', {
          method: 'POST',
          body: JSON.stringify({ course_ids: courseIds }),
        });
  },

  /** POST /orders/apply-coupon */
  async applyCouponCode(couponCode: string, orderId: string): Promise<any> {
  devLog('Orders', `Apply coupon "${couponCode}" discount trigger to Order ID: ${orderId}`);
  return apiFetch<any>('/orders/apply-coupon', {
          method: 'POST',
          body: JSON.stringify({ code: couponCode, order_id: orderId }),
        });
  },

  /** GET /orders/my */
  async getMyOrdersHistory(): Promise<any[]> {
  devLog('Orders', 'Fetch past buy transactions listing');
  return apiFetch<any[]>('/orders/my');
  },

  /** GET /orders/{id} */
  async getOrderBillReceipt(orderId: string): Promise<any> {
  devLog('Orders', `Query specific purchase record details: ${orderId}`);
  return apiFetch<any>(`/orders/${orderId}`);
  },

  /** PATCH /orders/{orderId}/cancel */
  async cancelTicketOrder(orderId: string): Promise<{ success: boolean; message: string }> {
  devLog('Orders', `Cancel transaction ID: ${orderId}`);
  return apiFetch<{ success: boolean; message: string }>(`/orders/${orderId}/cancel`, { method: 'PATCH' });
  },

  /** POST /orders/{orderId}/retry-payment */
  async retryPaymentGateway(orderId: string): Promise<any> {
  devLog('Orders', `Reprocess credit clearance for Order ID: ${orderId}`);
  return apiFetch<any>(`/orders/${orderId}/retry-payment`, { method: 'POST' });
  },

  /** POST /payments */
  async submitManualPaymentProof(payload: FormData): Promise<{ success: boolean }> {
  devLog('Orders', 'Submit manual bank transfer photo proof');
  return apiFetch<{ success: boolean }>('/payments', {
          method: 'POST',
          body: payload, // Transmit as raw FormData mapping multipart/form-data
        });
  },

  async createVNPayGatewayUrl(orderId: string): Promise<{ paymentUrl: string }> {
  devLog('Orders', `Redirect to VNPay gateway portal checkouts for Order ${orderId}`);
  return apiFetch<{ paymentUrl: string }>('/payments/vnpay/create', {
          method: 'POST',
          body: JSON.stringify({ order_id: orderId }),
        });
  },

  /** GET /payments/vnpay-return */
  async parseVNPayCallback(vnpayParams: string): Promise<any> {
  devLog('Orders', 'Processing VNPay return callback payload token check');
  return apiFetch<any>(`/payments/vnpay-return?${vnpayParams}`);
  },

  /** POST /payments/webhook */
  async hookPaymentStatusBackground(payload: any): Promise<any> {
  devLog('Orders', 'Incoming transaction webhook notifier payload');
  return apiFetch<any>('/payments/webhook', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

  // ==========================================
  // MODULE 8. INSTRUCTOR STUDIO CONTROLS
  // ==========================================

  /** GET /instructor/profile or /users/:id */
  async getInstructorProfile(instructorId?: string): Promise<any> {
  devLog('Instructor', 'Fetch professional trainer profile details', { instructorId });
  if (instructorId) {
          return apiFetch<any>(`/users/${instructorId}`);
        }
  return apiFetch<any>('/instructor/profile');
  },

  /** PATCH /instructor/profile */
  async updateInstructorProfile(payload: any): Promise<any> {
  devLog('Instructor', 'Sync public teacher bio credentials', payload);
  return apiFetch<any>('/instructor/profile', {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

  /** POST /instructor/courses */
  async createCourseDraft(course: Course): Promise<Course> {
  devLog('Instructor', 'Create course draft workspace container', { id: course.id, title: course.title });
  return apiFetch<Course>('/instructor/courses', {
          method: 'POST',
          body: JSON.stringify(course),
        });
  },

  /** PATCH /instructor/courses/{id} */
  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
  devLog('Instructor', `Update syllabus fields: ${courseId}`, courseData);
  return apiFetch<Course>(`/instructor/courses/${courseId}`, {
          method: 'PATCH',
          body: JSON.stringify(courseData),
        });
  },

  /** DELETE /instructor/courses/{id} -> Mapping backward compatibility with standard deleteCourse */
  async deleteCourse(courseId: string): Promise<{ success: boolean }> {
      // BACKEND_MISSING
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
  return apiFetch<any>(`/instructor/courses/${courseId}/checklist`);
  },

  /** GET /instructor/courses/{id}/review-notes */
  async getAdminSubmissionReviewNotes(courseId: string): Promise<any[]> {
  devLog('Instructor', `Read audit feedback and issues left by Administrator on: ${courseId}`);
  return apiFetch<any[]>(`/instructor/courses/${courseId}/review-notes`);
  },

  async submitCourseToAdminVerification(courseId: string): Promise<{ success: boolean }> {
  devLog('Instructor', `Lock blueprint of workspace ${courseId} and submit to moderators`);
  return apiFetch<any>(`/instructor/courses/${courseId}/submit`, { method: 'POST' });
  },

  /** GET /instructor/{id}/enrollment-stats */
  async getInstructorEnrollmentStats(instructorId: string): Promise<{ totalEnrollments: number }> {
      // BACKEND_MISSING
    devLog('Instructor', `Get enrollment stats for instructor ${instructorId}`);
    if (config.mode === 'api') {
      return apiFetch<{ totalEnrollments: number }>(`/instructor/${instructorId}/enrollment-stats`);
    }
    // Mock
    // Mock
    const courses = (await MockDB.getCourses()).filter((c: any) => c.instructorId === instructorId && c.status !== 'deleted');
    const total = courses.reduce((sum: number, c: any) => sum + (c.enrolledCount || 0), 0);
    return { totalEnrollments: total };
  },

  /** GET /instructor/{id}/revenue-chart */
  async getInstructorRevenueChart(instructorId: string, params: { timeUnit: string, startDate?: string, endDate?: string, courseId?: string }): Promise<any[]> {
      // BACKEND_MISSING
    devLog('Instructor', `Get revenue chart for instructor ${instructorId}`, params);
    if (config.mode === 'api') {
      const query = new URLSearchParams();
      query.append('timeUnit', params.timeUnit);
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      if (params.courseId) query.append('courseId', params.courseId);
      return apiFetch<any[]>(`/instructor/${instructorId}/revenue-chart?${query.toString()}`);
    }
    return [];
  },


  /** GET /instructor/{id}/enrollment-chart */
  async getInstructorEnrollmentChart(instructorId: string, params: { timeUnit: string, startDate?: string, endDate?: string, courseId?: string }): Promise<any[]> {
  devLog('Instructor', `Get enrollment chart for instructor ${instructorId}`, params);
  const query = new URLSearchParams();
  query.append('timeUnit', params.timeUnit);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.courseId) query.append('courseId', params.courseId);
  return apiFetch<any[]>(`/instructor/${instructorId}/enrollment-chart?${query.toString()}`);
  },

  /** GET /instructor/{id}/top-courses-enrollment */
  async getInstructorTopCourses(instructorId: string, params: { limit?: number, startDate?: string, endDate?: string, status?: string }): Promise<any[]> {
      // BACKEND_MISSING
    devLog('Instructor', `Get top courses for instructor ${instructorId}`);
    if (config.mode === 'api') {
      const query = new URLSearchParams();
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      if (params.status) query.append('status', params.status);
      return apiFetch<any[]>(`/instructor/${instructorId}/top-courses?${query.toString()}`);
    }
    return [];
  },

  /** GET /instructor/{id}/revenue-stats */
  async getInstructorRevenueStats(instructorId: string, params: any): Promise<{ totalRevenue: number, totalGross: number, totalPlatformFee: number, totalTransactions: number, totalStudentsPaid: number }> {
      // BACKEND_MISSING
    devLog('Instructor', `Get revenue stats for instructor ${instructorId}`, params);
    if (config.mode === 'api') {
      const query = new URLSearchParams();
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      return apiFetch<any>(`/instructor/${instructorId}/revenue-stats?${query.toString()}`);
    }
    // Mock
    return {
      totalRevenue: 0,
      totalGross: 0,
      totalPlatformFee: 0,
      totalTransactions: 0,
      totalStudentsPaid: 0
    };
  },

  /** GET /instructor/{id}/enrollments */
  async getInstructorEnrollments(instructorId: string, params: any): Promise<{ data: any[], meta: any }> {
  devLog('Instructor', `Get enrollments for instructor ${instructorId} with params`, params);
  const query = new URLSearchParams();
  if (params.courseId) query.append('courseId', params.courseId);
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.minProgress !== undefined) query.append('minProgress', params.minProgress);
  if (params.maxProgress !== undefined) query.append('maxProgress', params.maxProgress);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  return apiFetch<{ data: any[], meta: any }>(`/instructor/${instructorId}/enrollments?${query.toString()}`);
  },

  /** GET /instructor/{id}/revenues */
  async getInstructorRevenues(instructorId: string, params: any): Promise<{ data: any[], meta: any }> {
  devLog('Instructor', `Get revenues list for instructor ${instructorId}`, params);
  const query = new URLSearchParams();
  if (params.courseId) query.append('courseId', params.courseId);
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  return apiFetch<any>(`/instructor/${instructorId}/revenues?${query.toString()}`);
  },

  /** POST /admin/courses/{id}/approve */
  async approveCourse(courseId: string): Promise<{ success: boolean }> {
  devLog('Admin', `Approve course ID: ${courseId}`);
  return apiFetch<any>(`/admin/courses/${courseId}/approve`, { method: 'PATCH' });
  },

  /** POST /admin/courses/{id}/reject */
  async rejectCourse(courseId: string, reason: string): Promise<{ success: boolean }> {
  devLog('Admin', `Reject course ID: ${courseId} with reason: ${reason}`);
  return apiFetch<any>(`/admin/courses/${courseId}/reject`, { 
          method: 'PATCH',
          body: JSON.stringify({ reason }) 
        });
  },

  /** GET /instructor/courses/{id}/learners */
  async getInstructorCourseStudentsList(courseId: string): Promise<any[]> {
  devLog('Instructor', `Query enrolled learner names and active hours for course ${courseId}`);
  return apiFetch<any[]>(`/instructor/courses/${courseId}/learners`);
  },

  /** GET /instructor/learners */
  async getInstructorLearners(params: any): Promise<any> {
      // BACKEND_MISSING
    devLog('Instructor', `Query all learners for instructor`);
    const queryStr = new URLSearchParams(params).toString();
    if (config.mode === 'api') return apiFetch<any>(`/instructor/learners?${queryStr}`);
    return { data: { stats: { total_enrollments: 0, learning_count: 0, completed_count: 0 }, list: { data: [], totalPages: 1 } } };
  },

  /** GET /instructor/learners/{id}/details */
  async getInstructorLearnerDetails(enrollmentId: number): Promise<any> {
      // BACKEND_MISSING
    devLog('Instructor', `Query learner details for enrollment ${enrollmentId}`);
    if (config.mode === 'api') return apiFetch<any>(`/instructor/learners/${enrollmentId}/details`);
    return { data: null };
  },

  /** GET /instructor/courses/{courseId}/analytics */
  async getCourseEngagementAnalytics(courseId: string): Promise<any> {
  devLog('Instructor', `Calculate drop-offs, daily watchtime frequency graphs: ${courseId}`);
  return apiFetch<any>(`/instructor/courses/${courseId}/analytics`);
  },

  /** GET /instructor/courses/{courseId}/learner-risk */
  async getDropoutRiskAnalytics(courseId: string): Promise<any[]> {
  devLog('Instructor', `Running Dropout Predictive heuristics model over students in ${courseId}`);
  return apiFetch<any[]>(`/instructor/courses/${courseId}/learner-risk`);
  },

  /** GET /instructor/courses/{id}/dashboard */
  async getStudioDashboardStats(courseId?: string): Promise<any> {
  devLog('Instructor', 'Query financial statistics and student enrollment graphs', { id: courseId });
  const url = courseId ? `/instructor/courses/${courseId}/dashboard` : '/instructor/courses/dashboard';
  return apiFetch<any>(url);
  },

  /** GET /instructor/lessons */
  async getInstructorLessons(): Promise<Lesson[]> {
  devLog('Instructor', 'Fetch all managed classroom content items');
  return apiFetch<Lesson[]>('/instructor/lessons');
  },

  /** POST /instructor/lessons */
  async createCourseSectionLesson(payload: any): Promise<Lesson> {
  devLog('Instructor', 'Create section lesson resource', payload);
  return apiFetch<Lesson>('/instructor/lessons', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

  /** GET /instructor/lessons/{id} */
  async getInstructorLessonDetails(id: string): Promise<Lesson> {
  devLog('Instructor', `View detailed settings metadata for Lesson node: ${id}`);
  return apiFetch<Lesson>(`/instructor/lessons/${id}`);
  },

  /** PUT/PATCH /instructor/lessons/{id} */
  async updateInstructorLesson(id: string, payload: any): Promise<Lesson> {
  devLog('Instructor', `Update lesson metadata nodes of Lesson: ${id}`, payload);
  return apiFetch<Lesson>(`/instructor/lessons/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

  /** DELETE /instructor/lessons/{id} */
  async deleteInstructorLesson(id: string): Promise<{ success: boolean }> {
  devLog('Instructor', `Delete Lesson node: ${id} from workspace`);
  return apiFetch<{ success: boolean }>(`/instructor/lessons/${id}`, { method: 'DELETE' });
  },

  /** POST /instructor/lessons/{id}/assets */
  async uploadLessonAttachmentFile(lessonId: string, payload: FormData): Promise<any> {
  devLog('Instructor', `Upload document attachment to Lesson placeholder: ${lessonId}`);
  return apiFetch<any>(`/instructor/lessons/${lessonId}/assets`, {
          method: 'POST',
          body: payload, // Send as FormData directly
        });
  },

  /** PATCH /instructor/lessons/{id}/preview */
  async toggleLessonPublicSample(lessonId: string, isPreviewable: boolean): Promise<any> {
  devLog('Instructor', `Updating sample allowance flag on Lesson: ${lessonId}`, { isPreviewable });
  return apiFetch<any>(`/instructor/lessons/${lessonId}/preview`, {
          method: 'PATCH',
          body: JSON.stringify({ is_free_preview: isPreviewable }),
        });
  },

  /** GET /instructor/quizzes */
  async getInstructorQuizzes(): Promise<any[]> {
  devLog('Instructor', 'List quizzes available for inclusion');
  return apiFetch<any[]>('/instructor/quizzes');
  },

  /** POST /instructor/quizzes */
  async createQuizDraft(quizPayload: any): Promise<any> {
  devLog('Instructor', 'Instantiate a quiz worksheet template', quizPayload);
  return apiFetch<any>('/instructor/quizzes', {
          method: 'POST',
          body: JSON.stringify(quizPayload),
        });
  },

  /** GET/PUT/PATCH/DELETE /instructor/quizzes/{id} */
  async manageQuizWorksheet(id: string, action: 'GET' | 'PUT' | 'PATCH' | 'DELETE', payload?: any): Promise<any> {
  devLog('Instructor', `Quiz operations pipeline [${action}] to ID: ${id}`);
  return apiFetch<any>(`/instructor/quizzes/${id}`, {
          method: action,
          body: payload ? JSON.stringify(payload) : undefined,
        });
  },

  /** GET /instructor/sections */
  async getCourseSections(): Promise<Section[]> {
  devLog('Instructor', 'Sync sections of managed drafts');
  return apiFetch<any[]>('/instructor/sections');
  },

  /** POST /instructor/sections */
  async createCourseSection(payload: any): Promise<any> {
  devLog('Instructor', 'Write section block into workbook', payload);
  return apiFetch<any>('/instructor/sections', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

  /** GET /instructor/sections/{id} */
  async getSectionDetails(id: string): Promise<any> {
  devLog('Instructor', `Retrieve setting details on section: ${id}`);
  return apiFetch<any>(`/instructor/sections/${id}`);
  },

  /** PUT / PATCH /instructor/sections/{id} */
  async updateSection(id: string, payload: any): Promise<any> {
  devLog('Instructor', `Modifying structure of section: ${id}`, payload);
  return apiFetch<any>(`/instructor/sections/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

  /** DELETE /instructor/sections/{id} */
  async deleteSection(id: string): Promise<{ success: boolean }> {
  devLog('Instructor', `Remove section folder block entirely: ${id}`);
  return apiFetch<{ success: boolean }>(`/instructor/sections/${id}`, { method: 'DELETE' });
  },

  /** GET /instructor/coupons */
  async getInstructorPromoCoupons(): Promise<any[]> {
  devLog('Instructor', 'Fetch all discount campaigns under teacher authorship');
  return apiFetch<any[]>('/instructor/coupons');
  },

  /** POST /instructor/coupons */
  async createPromoCoupon(payload: any): Promise<any> {
  devLog('Instructor', 'Inject new coupon discount rule properties', payload);
  return apiFetch<any>('/instructor/coupons', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

  /** GET /instructor/coupons/{id} */
  async getCouponDetails(id: string): Promise<any> {
  devLog('Instructor', `Retrieve stats for coupon campaign ID: ${id}`);
  return apiFetch<any>(`/instructor/coupons/${id}`);
  },

  /** PATCH /instructor/coupons/{id} */
  async updatePromoCouponDetails(id: string, payload: any): Promise<any> {
  devLog('Instructor', `Altering active properties / limits of coupon Node: ${id}`, payload);
  return apiFetch<any>(`/instructor/coupons/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

  /** DELETE /instructor/coupons/{id} */
  async deletePromoCoupon(id: string): Promise<{ success: boolean }> {
  devLog('Instructor', `Evoking coupon system code cancel: ${id}`);
  return apiFetch<{ success: boolean }>(`/instructor/coupons/${id}`, { method: 'DELETE' });
  },

  /** POST /instructor/course-announcements */
  async sendBulkCourseAnnouncement(payload: any): Promise<any> {
  devLog('Instructor', 'Dispatch announcements notifications thread to subscribed students', payload);
  return apiFetch<any>('/instructor/course-announcements', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

  /** GET /instructor/revenue */
  async getRevenueReportsSummary(): Promise<any> {
  devLog('Instructor', 'Fetch sales distributions and ledger reports');
  return apiFetch<any>('/instructor/revenue');
  },

  /** GET /instructor/reports/completion-rate */
  async getCompletionRatesReport(): Promise<any[]> {
  devLog('Instructor', 'Compile average lessons completed statistics across student population');
  return apiFetch<any[]>('/instructor/reports/completion-rate');
  },

  /** GET /instructor/reports/inactive-learners */
  async getInactiveStudentsRiskList(): Promise<any[]> {
  devLog('Instructor', 'Query for users with zero classroom logins (> 14 days)');
  return apiFetch<any[]>('/instructor/reports/inactive-learners');
  },

  /** POST /instructor/withdrawals */
  async submitBalancePayoutRequest(payload: Partial<PayoutRequest>): Promise<PayoutRequest> {
  devLog('Instructor', 'Submitting finance balance payout request', payload);
  return apiFetch<PayoutRequest>('/instructor/withdrawals', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

  // ==========================================
  // MODULE 9. ADMINISTRATIVE CONTROLS
  // ==========================================

  /** GET /admin/roles */
  async getRolesList(): Promise<any[]> {
  devLog('Admin', 'Query complete role models system directories');
  return apiFetch<any[]>('/admin/roles');
  },

  /** POST /admin/roles */
  async createAdminRole(payload: any): Promise<any> {
  devLog('Admin', 'Adding role privilege node', payload);
  return apiFetch<any>('/admin/roles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

  /** GET /admin/roles/{id} */
  async getRoleDefinitionDetails(id: string): Promise<any> {
  devLog('Admin', `View permissions dictionary configured under tag: ${id}`);
  return apiFetch<any>(`/admin/roles/${id}`);
  },

  /** PUT / PATCH /admin/roles/{id} */
  async updateRoleDefinitionDetails(id: string, payload: any): Promise<any> {
  devLog('Admin', `Modifying privilege mask of role: ${id}`, payload);
  return apiFetch<any>(`/admin/roles/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

  /** DELETE /admin/roles/{id} */
  async deleteAdminRole(id: string): Promise<{ success: boolean }> {
  devLog('Admin', `Revoke role template: ${id}`);
  return apiFetch<{ success: boolean }>(`/admin/roles/${id}`, { method: 'DELETE' });
  },

  /** GET /admin/users */
  async getPlatformUsersList(): Promise<User[]> {
  devLog('Admin', 'Fetch full index directory of users registrations');
  return apiFetch<User[]>('/admin/users');
  },

  /** POST /admin/users */
  async createPlatformUserAccount(payload: any): Promise<User> {
  devLog('Admin', 'Creating account from backend control panels', payload);
  return apiFetch<User>('/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

  /** GET /admin/users/{id} */
  async getPlatformUserDetail(id: string): Promise<User> {
  devLog('Admin', `View general history and order logs for User: ${id}`);
  return apiFetch<User>(`/admin/users/${id}`);
  },

  /** PUT / PATCH /admin/users/{id} */
  async updatePlatformUserCredentials(id: string, payload: any): Promise<User> {
  devLog('Admin', `Overriding role or credential details of user: ${id}`, payload);
  return apiFetch<User>(`/admin/users/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

  /** DELETE /admin/users/{id} */
  async deactivatePlatformUserAccount(id: string): Promise<{ success: boolean }> {
  devLog('Admin', `Invoking ban/deactivation command on account ID: ${id}`);
  return apiFetch<{ success: boolean }>(`/admin/users/${id}`, { method: 'DELETE' });
  },

  /** GET /admin/test */
  async verifyAdminAuthConnection(): Promise<{ authenticated: boolean; system_healthy: boolean }> {
  devLog('Admin', 'Ping admin authentication status connection test sequence');
  return apiFetch<any>('/admin/test');
  },

  // ==========================================
  // RETRO-SUPPORT / BACKWARD COMPATABILITY INTEGRATIONS
  // ==========================================
  async updateCourseChapters(courseId: string, chapters: Chapter[]): Promise<{ success: boolean; chapters: Chapter[] }> {
  devLog('Chapters', `Bulk Sync Curriculum for course ${courseId}`, chapters);
  return apiFetch<{ success: boolean; chapters: Chapter[] }>(`/courses/${courseId}/chapters`, {
          method: 'POST',
          body: JSON.stringify({ chapters }),
        });
  },

  async uploadLessonVideo(
    file: File, 
    onProgress: (progress: number, status: string) => void,
    lessonId: string = 'new'
  ): Promise<{ success: boolean; videoUrl: string; duration: string }> {
  devLog('Media', 'Upload direct video file request', { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(2)} MB` });
  const formData = new FormData();
  formData.append('video', file);
  return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${config.baseUrl}/instructor/lessons/${lessonId}/video`);
          
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
  },

  async updateStudentProgress(courseId: string, progress: Partial<StudentProgress>): Promise<Partial<StudentProgress>> {
  devLog('Progress', `Sync student study session for: ${courseId}`, progress);
  return apiFetch<StudentProgress>(`/progress/${courseId}`, {
          method: 'PATCH',
          body: JSON.stringify(progress),
        });
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
  return apiFetch<{ success: boolean; message: string }>('/role-requests/admin', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
  },

  /** POST /roles/request-instructor */
  async requestInstructorRole(payload: any): Promise<{ success: boolean; message: string }> {
  devLog('Auth', 'Request Instructor Role', payload);
  return apiFetch<{ success: boolean; message: string }>('/me/instructor-upgrade', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
  },

  /** GET /roles/requests */
  async getInstructorRequests(): Promise<InstructorRequest[]> {
  devLog('Auth', 'Get Instructor Requests');
  const data = await apiFetch<any>('/admin/instructor-upgrade-requests');
  return data.requests || data || [];
  },

  /** POST /roles/resolve */
  async resolveInstructorRequest(payload: { requestId: string; action: 'approve' | 'reject'; rejectionReason?: string }): Promise<{ success: boolean; message: string }> {
  devLog('Auth', 'Resolve Instructor Request', payload);
  return apiFetch<{ success: boolean; message: string }>(`/admin/instructor-upgrade-requests/${payload.requestId}/${payload.action}`, {
          method: 'PATCH',
          body: JSON.stringify(payload.action === 'reject' ? { reason: payload.rejectionReason } : {})
        });
  },

  /** POST /roles/request-leave-instructor */
  async requestLeaveInstructorRole(payload: { userId: string; fullName: string; email: string; reason: string }): Promise<{ success: boolean; message: string }> {
  devLog('Auth', 'Request Leave Instructor Role', payload);
  return apiFetch<{ success: boolean; message: string }>('/roles/request-leave-instructor', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
  },

  /** GET /admin/users/:userId/courses */
  async getInstructorCoursesByAdmin(userId: string): Promise<Course[]> {
      // BACKEND_MISSING
    devLog('Admin', 'Get instructor courses', { userId });
    if (config.mode === 'api') {
      const data = await apiFetch<any>(`/admin/users/${userId}/courses`);
      return data.courses || [];
    }
    return []; // mock courses handled locally in UI or fallback
  },

  /** POST /admin/users/:userId/lock */
  async toggleUserLockAdmin(userId: string, action: 'lock' | 'unlock'): Promise<{ success: boolean; message: string; status: string }> {
      // BACKEND_MISSING
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
      // BACKEND_MISSING
    devLog('Admin', 'Fetch account requests');
    if (config.mode === 'api') {
      return apiFetch<AccountRequest[]>('/admin/account-requests');
    }
    return MockDB.getAccountRequests();
  },

  /** PATCH /admin/account-requests/:requestId/resolve */
  async resolveAccountRequest(requestId: string, action: 'approved' | 'rejected'): Promise<{ success: boolean; message: string }> {
      // BACKEND_MISSING
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
      // BACKEND_MISSING
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
      // BACKEND_MISSING
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
  return apiFetch<{ success: boolean; message: string }>(`/admin/courses/${courseId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
  },

  /** POST /contact */
  async sendContactMessage(payload: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean; message?: string }> {
  devLog('Contact', 'Gửi tin nhắn liên hệ', payload);
  return apiFetch<{ success: boolean; message?: string }>('/contact', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
  },

  
  // ================= PAYOUT & BALANCE API =================
  async getInstructorBalance(instructorId: string): Promise<any> {
  devLog('Instructor', 'Get balance');
  return apiFetch<any>(`/instructor/course-credits`);
  },

  async getInstructorPayoutAccount(instructorId: string): Promise<any> {
  devLog('Instructor', 'Get payout account');
  return apiFetch<any>(`/instructor/payout-account`);
  },

  async updateInstructorPayoutAccount(instructorId: string, payload: any): Promise<any> {
  devLog('Instructor', 'Update payout account', payload);
  return apiFetch<any>(`/instructor/payout-account`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
  },

  async getInstructorWithdrawals(instructorId: string, params?: any): Promise<{ data: any[], meta: any }> {
      // BACKEND_MISSING
    devLog('Instructor', 'Get withdrawals');
    const query = new URLSearchParams(params).toString();
    if (config.mode === 'api') {
      return apiFetch<{ data: any[], meta: any }>(`/instructor/withdrawals?${query}`);
    }
    return {
      data: [
        { id: 'w1', instructorId, amount: 5000000, status: 'completed', requestedAt: new Date(Date.now() - 86400000 * 5).toISOString(), processedAt: new Date(Date.now() - 86400000 * 4).toISOString(), notes: 'Thanh toán tuần 1', payoutMethod: { type: 'bank_transfer', bankName: 'VCB' } },
        { id: 'w2', instructorId, amount: 2000000, status: 'pending', requestedAt: new Date().toISOString(), payoutMethod: { type: 'bank_transfer', bankName: 'VCB' } }
      ],
      meta: { current_page: 1, last_page: 1, total: 2 }
    };
  },

  async createInstructorWithdrawal(instructorId: string, payload: any): Promise<any> {
  devLog('Instructor', 'Create withdrawal', payload);
  return apiFetch<any>(`/instructor/withdrawals`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

  // ================= TRANSACTIONS API =================
  async getInstructorTransactions(instructorId: string, params: any): Promise<any> {
  devLog('Instructor', 'Get transaction history');
  const query = new URLSearchParams(params).toString();
  return apiFetch<any>(`/instructor/credit-transactions?${query}`);
  },

  async getInstructorTransactionDetails(transactionId: string | number): Promise<any> {
  devLog('Instructor', 'Get transaction details');
  return apiFetch<any>(`/instructor/transactions/${transactionId}/details`);
  },

  // ================= Q&A API =================
  async getInstructorQAStats(instructorId: string): Promise<any> {
      // BACKEND_MISSING
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/${instructorId}/qa-stats`);
    }
    return { unansweredCount: 0 };
  },

  async getInstructorQuestions(instructorId: string, params: any): Promise<any> {
      // BACKEND_MISSING
    if (config.mode === 'api') {
      const query = new URLSearchParams();
      if (params.filter) query.append('filter', params.filter);
      if (params.courseId) query.append('courseId', params.courseId);
      if (params.lessonId) query.append('lessonId', params.lessonId);
      if (params.timeRange) query.append('timeRange', params.timeRange);
      if (params.search) query.append('search', params.search);
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      return apiFetch<any>(`/instructor/${instructorId}/questions?${query.toString()}`);
    }
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  },

  async replyToQuestion(instructorId: string, questionId: string, payload: any): Promise<any> {
      // BACKEND_MISSING
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/${instructorId}/questions/${questionId}/reply`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    return { success: true };
  }
};


// Declared helper interface for sections array
interface Section {
  id: string;
  title: string;
  course_id: string;
  order: number;
}
