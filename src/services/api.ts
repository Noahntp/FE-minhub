import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { MockDB } from './mockDb';
import { SYSTEM_ROLE_USERS } from '@/shared/data';

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

export class ApiError extends Error {
  status: number;
  errors?: any;
  constructor(message: string, status: number, errors?: any) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

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

  let response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });
  } catch (netErr) {
    devLog('Network Error', String(netErr), { url });
    throw new Error('Không thể kết nối đến máy chủ Backend.');
  }

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
    throw new ApiError(errMsg, response.status, errJson?.errors);
  }

  // Handle No Content / Empty HTTP 204 response safely
  if (response.status === 204) {
    return { success: true } as unknown as T;
  }

  const json = await response.json();
  // Unwrap Laravel ApiResponse envelope: { success, data, message }
  if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
    if (json.data && typeof json.data === 'object') {
      if (json.pagination && !(json.data as any).pagination) {
        (json.data as any).pagination = json.pagination;
      }
      if (json.meta && !(json.data as any).meta) {
        (json.data as any).meta = json.meta;
      }
    }
    return json.data as T;
  }
  return json as T;
}

async function apiFetchEnvelope<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T; meta?: any }> {
  if (config.mode === 'mock') {
    throw new Error('apiFetchEnvelope called while in mock mode.');
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

  let response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });
  } catch (netErr) {
    devLog('Network Error', String(netErr), { url });
    throw new Error('Không thể kết nối đến máy chủ Backend.');
  }

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
    throw new ApiError(errMsg, response.status, errJson?.errors);
  }

  if (response.status === 204) {
    return { data: [] as unknown as T };
  }

  const json = await response.json();
  if (json && typeof json === 'object' && 'data' in json) {
    return {
      data: json.data as T,
      meta: json.meta,
    };
  }
  return { data: json as T };
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
    const res = await apiFetch<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      user: res.user,
      token: res.token || ''
    };
  },

  /** POST /auth/login */
  async login(payload: any): Promise<{ user: User; token: string }> {
    devLog('Auth', 'Login credentials authentication', { email: payload.email });
    const res = await apiFetch<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });
    const token = res.access_token || '';
    if (token) {
      this.setAuthToken(token);
    }
    return {
      user: res.user,
      token: token,
    };
  },

  /** GET /auth/google/redirect */
  async getGoogleRedirectUrl(): Promise<string> {
    devLog('Auth', 'Get Google OAuth redirect authorization URL');
    const res = await apiFetch<{ url: string }>('/auth/google/redirect');
    return res.url;
  },

  /** POST /auth/forgot-password */
  async requestPasswordReset(email: string): Promise<any> {
    devLog('Auth', 'Request password reset', { email });
    return apiFetch<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /** POST /auth/reset-password */
  async resetPassword(payload: any): Promise<any> {
    devLog('Auth', 'Reset password', { email: payload.email });
    return apiFetch<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** POST /auth/logout */
  async logout(): Promise<{ success: boolean }> {
    devLog('Auth', 'Logout active session requests');
    try {
      await apiFetch<any>('/auth/logout', {
        method: 'POST',
      });
    } catch (e) {
      console.error('Backend logout failed, clearing locally', e);
    }
    this.setAuthToken(null);
    return { success: true };
  },

  /** GET /auth/me */
  async getCurrentUser(): Promise<User> {
    devLog('Auth', 'Get currently authenticated user via session token');
    const res = await apiFetch<{ user: User }>('/auth/me');
    return res.user;
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
    return this.requestPasswordReset(email);
  },

  /** POST /auth/verify-email/resend */
  async resendVerificationEmail(email: string, purpose: string = 'verify_email'): Promise<{ success: boolean; message: string }> {
    devLog('Auth', 'Resend email verification notification mail', { email, purpose });
    if (config.mode === 'mock') {
      return { success: true, message: 'Đã gửi mã xác minh email giả lập.' };
    }
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
    if (config.mode === 'mock') {
      return { success: true, ticket: 'mock-ticket-code' };
    }
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
    if (config.mode === 'mock') {
      const dbUsers = MockDB.getState().users;
      const matched = dbUsers[0];
      this.setAuthToken('mock-google-token');
      return { user: matched, token: 'mock-google-token' };
    }
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
    if (config.mode === 'api') {
      try {
        const categories = await apiFetch<any[]>('/categories');
        if (Array.isArray(categories)) {
          return categories.map((cat: any) => ({
            name: cat.name || '',
            count: cat.courses_count ?? cat.count ?? 0,
          }));
        }
        return [];
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
    if (!userId || userId === 'u-guest') {
      return [];
    }
    if (config.mode === 'api') {
      try {
        return await apiFetch<any[]>('/me/courses');
      } catch(e) {
        return [];
      }
    }
    return [];
  },

  async getUserActivities(userId: string): Promise<any[]> {
    if (!userId || userId === 'u-guest') {
      return [];
    }
    if (config.mode === 'api') {
      try {
        return await apiFetch<any[]>('/learning-logs/my');
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
        return await apiFetch<Course[]>(`/courses?instructor_id=${instructorId}`);
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

  /** GET /courses (sorted by popularity as bestseller fallback) */
  async getBestsellerCourses(): Promise<Course[]> {
    devLog('Catalog', 'Fetch best-selling courses');
    if (config.mode === 'api') {
      try {
        const allCourses = await apiFetch<Course[]>('/courses');
        if (Array.isArray(allCourses)) {
          return allCourses.slice().sort((a: any, b: any) => ((b.enrollments_count || b.students || 0) - (a.enrollments_count || a.students || 0)));
        }
        return [];
      } catch (e) {
        console.warn('Failed to fetch bestseller courses', e);
        return [];
      }
    }
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
  async getPublicInstructorCourses(instructorId: string, filters?: any): Promise<Course[]> {
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

  /** POST /instructor/profile/avatar */
  async uploadInstructorAvatar(file: File): Promise<any> {
    devLog('Instructor', 'Upload instructor profile avatar', { fileName: file.name, size: file.size });
    const formData = new FormData();
    formData.append('avatar', file);
    return apiFetch<any>('/instructor/profile/avatar', {
      method: 'POST',
      body: formData,
    });
  },

  /** GET /instructor/profile/notification-preferences */
  async getInstructorNotificationPreferences(): Promise<any> {
    devLog('Instructor', 'Fetch notification preferences');
    return apiFetch<any>('/instructor/profile/notification-preferences');
  },

  /** PATCH /instructor/profile/notification-preferences */
  async updateInstructorNotificationPreferences(payload: { email_notifications?: boolean; sms_alerts?: boolean }): Promise<any> {
    devLog('Instructor', 'Update notification preferences', payload);
    return apiFetch<any>('/instructor/profile/notification-preferences', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /** POST /instructor/profile/password/send-otp */
  async sendChangePasswordOtp(payload: { currentPassword?: string; current_password?: string; password?: string; passwordConfirmation?: string; password_confirmation?: string }): Promise<{ success: boolean; message: string; data?: { expires_in: number; resend_after: number; masked_email: string } }> {
    devLog('Instructor', 'Send password change OTP', payload);
    return apiFetch<any>('/instructor/profile/password/send-otp', {
      method: 'POST',
      body: JSON.stringify({
        current_password: payload.currentPassword || payload.current_password,
        password: payload.password,
        password_confirmation: payload.passwordConfirmation || payload.password_confirmation,
      }),
    });
  },

  /** PATCH /instructor/profile/password */
  async changeInstructorPassword(payload: { currentPassword?: string; current_password?: string; password?: string; passwordConfirmation?: string; password_confirmation?: string; otp: string }): Promise<any> {
    devLog('Instructor', 'Change account password with OTP', payload);
    return apiFetch<any>('/instructor/profile/password', {
      method: 'PATCH',
      body: JSON.stringify({
        current_password: payload.currentPassword || payload.current_password,
        password: payload.password,
        password_confirmation: payload.passwordConfirmation || payload.password_confirmation,
        otp: payload.otp,
      }),
    });
  },

  /** GET /instructor/profile/sessions */
  async getInstructorSessions(): Promise<any> {
    devLog('Instructor', 'Fetch active sessions list');
    return apiFetch<any>('/instructor/profile/sessions');
  },

  /** DELETE /instructor/profile/sessions/others */
  async revokeOtherInstructorSessions(): Promise<any> {
    devLog('Instructor', 'Revoke other active sessions');
    return apiFetch<any>('/instructor/profile/sessions/others', {
      method: 'DELETE',
    });
  },

  /** DELETE /instructor/profile/sessions/:id */
  async revokeInstructorSession(sessionId: string): Promise<any> {
    devLog('Instructor', `Revoke session ${sessionId}`);
    return apiFetch<any>(`/instructor/profile/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  /** GET /instructor/profile/privacy */
  async getInstructorPrivacySettings(): Promise<any> {
    devLog('Instructor', 'Fetch privacy settings');
    return apiFetch<any>('/instructor/profile/privacy');
  },

  /** GET /instructor/profile/account-status */
  async getInstructorAccountStatus(): Promise<any> {
    devLog('Instructor', 'Fetch account status details');
    return apiFetch<any>('/instructor/profile/account-status');
  },

  /** PATCH /instructor/profile/privacy */
  async updateInstructorPrivacySettings(payload: any): Promise<any> {
    devLog('Instructor', 'Update privacy settings', payload);
    return apiFetch<any>('/instructor/profile/privacy', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /** GET /instructor/notifications */
  async getInstructorNotifications(): Promise<any> {
    devLog('Instructor', 'Fetch instructor system notifications');
    return apiFetch<any>('/instructor/notifications');
  },

  /** GET /instructor/notifications/unread-count */
  async getInstructorUnreadNotificationCount(): Promise<{ unread_count: number }> {
    devLog('Instructor', 'Fetch unread notification count');
    try {
      const res = await apiFetch<any>('/instructor/notifications/unread-count');
      const count = res?.data?.unread_count ?? res?.unread_count ?? (typeof res === 'number' ? res : 0);
      return { unread_count: Math.max(0, Number(count) || 0) };
    } catch {
      return { unread_count: 0 };
    }
  },

  /** PATCH /instructor/notifications/{id}/read */
  async markInstructorNotificationAsRead(id: number | string): Promise<any> {
    devLog('Instructor', `Mark notification ${id} as read`);
    return apiFetch<any>(`/instructor/notifications/${id}/read`, { method: 'PATCH' });
  },

  /** PATCH /instructor/notifications/read-all */
  async markAllInstructorNotificationsAsRead(): Promise<any> {
    devLog('Instructor', 'Mark all notifications as read');
    return apiFetch<any>('/instructor/notifications/read-all', { method: 'PATCH' });
  },

  /** POST /instructor/courses */
  async createCourseDraftLegacy(course: Course): Promise<Course> {
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

  async submitCourseToAdminVerificationLegacy(courseId: string): Promise<{ success: boolean }> {
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

  /** GET /instructor/courses - Paginated list of courses owned by logged-in instructor */
  async getInstructorCourses(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
    sort?: string;
  }): Promise<{ data: any[]; meta?: any }> {
    devLog('Instructor', 'Get instructor courses list with params', params);
    if (config.mode === 'api') {
      const query = new URLSearchParams();
      if (params) {
        if (params.page && params.page > 0) query.append('page', params.page.toString());
        if (params.per_page && params.per_page > 0) query.append('per_page', params.per_page.toString());
        if (params.status && params.status !== 'all') {
          let statusVal = params.status;
          if (statusVal === 'active') statusVal = 'published';
          if (statusVal === 'pending') statusVal = 'pending_review';
          query.append('status', statusVal);
        }
        if (params.search && params.search.trim()) query.append('search', params.search.trim());
        if (params.sort && params.sort !== 'all') {
          let sortVal = params.sort;
          if (sortVal === 'updated_desc') sortVal = 'newest';
          if (sortVal === 'updated_asc') sortVal = 'oldest';
          query.append('sort', sortVal);
        }
      }
      return apiFetchEnvelope<any[]>(`/instructor/courses?${query.toString()}`);
    }
    return { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } };
  },

  /** GET /instructor/dashboard */
  async getInstructorDashboard(params?: any): Promise<any> {
    devLog('Instructor', 'Get dashboard overview stats', params);
    const query = new URLSearchParams();
    if (params) {
      if (params.month) query.append('month', params.month.toString());
      if (params.year) query.append('year', params.year.toString());
      if (params.date_from) query.append('date_from', params.date_from);
      if (params.date_to) query.append('date_to', params.date_to);
    }
    return apiFetch<any>(`/instructor/dashboard?${query.toString()}`);
  },

  /** GET /instructor/dashboard/revenue-chart */
  async getInstructorRevenueChart(paramsOrId?: any, params?: any): Promise<any> {
    let actualParams = params;
    if (paramsOrId && typeof paramsOrId === 'object') {
      actualParams = paramsOrId;
    }
    devLog('Instructor', 'Get revenue chart', actualParams);
    if (config.mode === 'api') {
      const query = new URLSearchParams();
      if (actualParams) {
        if (actualParams.preset) query.append('preset', actualParams.preset);
        if (actualParams.period) query.append('period', actualParams.period);
        if (actualParams.startDate) query.append('date_from', actualParams.startDate);
        if (actualParams.endDate) query.append('date_to', actualParams.endDate);
        if (actualParams.date_from) query.append('date_from', actualParams.date_from);
        if (actualParams.date_to) query.append('date_to', actualParams.date_to);
        if (actualParams.group_by) query.append('group_by', actualParams.group_by);
        if (actualParams.courseId || actualParams.course_id) query.append('course_id', (actualParams.courseId || actualParams.course_id).toString());
      }
      return apiFetch<any>(`/instructor/dashboard/revenue-chart?${query.toString()}`);
    }
    return [];
  },

  /** GET /instructor/dashboard/enrollment-chart */
  async getInstructorEnrollmentChart(paramsOrId?: any, params?: any): Promise<any> {
    let actualParams = params;
    if (paramsOrId && typeof paramsOrId === 'object') {
      actualParams = paramsOrId;
    }
    devLog('Instructor', 'Get enrollment chart', actualParams);
    if (config.mode === 'api') {
      const query = new URLSearchParams();
      if (actualParams) {
        if (actualParams.preset) query.append('preset', actualParams.preset);
        if (actualParams.period) query.append('period', actualParams.period);
        if (actualParams.startDate) query.append('date_from', actualParams.startDate);
        if (actualParams.endDate) query.append('date_to', actualParams.endDate);
        if (actualParams.date_from) query.append('date_from', actualParams.date_from);
        if (actualParams.date_to) query.append('date_to', actualParams.date_to);
        if (actualParams.group_by) query.append('group_by', actualParams.group_by);
        if (actualParams.courseId || actualParams.course_id) query.append('course_id', (actualParams.courseId || actualParams.course_id).toString());
      }
      return apiFetch<any>(`/instructor/dashboard/enrollment-chart?${query.toString()}`);
    }
    return [];
  },

  /** GET /instructor/revenues/top-courses */
  async getInstructorTopCourses(instructorIdOrParams?: any, params?: any): Promise<any> {
    let actualParams = params;
    if (instructorIdOrParams && typeof instructorIdOrParams === 'object') {
      actualParams = instructorIdOrParams;
    }
    devLog('Instructor', 'Get top courses', actualParams);
    if (config.mode === 'api') {
      const query = new URLSearchParams();
      if (actualParams) {
        if (actualParams.limit) query.append('limit', actualParams.limit.toString());
        if (actualParams.preset) query.append('preset', actualParams.preset);
        if (actualParams.startDate) query.append('date_from', actualParams.startDate);
        if (actualParams.endDate) query.append('date_to', actualParams.endDate);
        if (actualParams.date_from) query.append('date_from', actualParams.date_from);
        if (actualParams.date_to) query.append('date_to', actualParams.date_to);
      }
      return apiFetch<any>(`/instructor/dashboard/top-courses?${query.toString()}`);
    }
    return [];
  },

  /** GET /instructor/dashboard/incomplete-courses */
  async getInstructorIncompleteCourses(params?: any): Promise<any[]> {
    devLog('Instructor', 'Get dashboard incomplete courses', params);
    if (config.mode === 'api') {
      return apiFetch<any[]>(`/instructor/dashboard/incomplete-courses`);
    }
    return [];
  },

  /** GET /instructor/dashboard/alerts */
  async getInstructorDashboardAlerts(params?: any): Promise<any[]> {
    devLog('Instructor', 'Get dashboard alerts/notifications', params);
    if (config.mode === 'api') {
      const query = new URLSearchParams();
      if (params && params.limit) {
        query.append('limit', params.limit.toString());
      }
      return apiFetch<any[]>(`/instructor/dashboard/alerts?${query.toString()}`);
    }
    return [];
  },

  /** GET /instructor/questions?status=unanswered */
  async getInstructorUnansweredQuestions(params?: any): Promise<any> {
    devLog('Instructor', 'Get dashboard unanswered questions', params);
    if (config.mode === 'api') {
      const query = new URLSearchParams();
      query.append('status', 'unanswered');
      if (params) {
        if (params.course_id) query.append('course_id', params.course_id.toString());
        if (params.lesson_id) query.append('lesson_id', params.lesson_id.toString());
        if (params.page) query.append('page', params.page.toString());
        if (params.per_page) query.append('per_page', params.per_page.toString());
        if (params.search) query.append('search', params.search);
      }
      return apiFetch<any>(`/instructor/questions?${query.toString()}`);
    }
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
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
  async getInstructorLearners(params?: any): Promise<any> {
    devLog('Instructor', `Query all learners for instructor`);
    const q = new URLSearchParams();
    if (params) {
      if (params.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params.status && params.status !== 'all') q.set('status', String(params.status));
      if (params.search) q.set('search', String(params.search));
      if (params.preset && params.preset !== '30d') q.set('preset', String(params.preset));
      if (params.date_from) q.set('date_from', String(params.date_from));
      if (params.date_to) q.set('date_to', String(params.date_to));
      if (params.page) q.set('page', String(params.page));
      if (params.per_page) q.set('per_page', String(params.per_page));
    }
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    if (config.mode === 'api') return apiFetch<any>(`/instructor/learners${queryStr}`);
    return { data: [], meta: { total: 0, current_page: 1, last_page: 1 } };
  },

  /** GET /instructor/learners/{id} */
  async getInstructorLearnerDetails(enrollmentId: number | string): Promise<any> {
    devLog('Instructor', `Query learner details for enrollment ${enrollmentId}`);
    if (config.mode === 'api') return apiFetch<any>(`/instructor/learners/${enrollmentId}`);
    return { data: null };
  },

  /** GET /instructor/courses/{courseId}/analytics */
  async getCourseEngagementAnalytics(courseId: string): Promise<any> {
    devLog('Instructor', `Calculate drop-offs, daily watchtime frequency graphs: ${courseId}`);
    return apiFetch<any>(`/instructor/courses/${courseId}/analytics`);
  },

  // ==========================================
  // MODULE: INSTRUCTOR COURSE BUILDER & MEDIA
  // ==========================================

  /** POST /instructor/media/upload */
  async uploadInstructorFile(file: File, type: string = 'course_media'): Promise<{ url: string; path?: string }> {
    devLog('Instructor', 'Upload media file', { fileName: file.name, type });
    if (config.mode === 'api') {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await apiFetch<any>('/instructor/media/upload', {
        method: 'POST',
        body: formData,
      });
      return { 
        url: res?.url || res?.data?.url || res?.file_url || '',
        path: res?.path || res?.data?.path || ''
      };
    }
    return { url: URL.createObjectURL(file) };
  },

  /** POST /instructor/courses/draft */
  async createCourseDraft(payload: any): Promise<any> {
    devLog('Instructor', 'Create course draft', payload);
    if (config.mode === 'api') {
      const backendPayload: any = {
        title: payload.title || 'Khóa học chưa đặt tên',
      };
      if (payload.slug) backendPayload.slug = payload.slug;
      if (payload.category_id || payload.categoryId) {
        backendPayload.category_ids = [Number(payload.category_id || payload.categoryId)];
      }
      if (payload.level) backendPayload.level = payload.level;
      if (payload.language) backendPayload.language = payload.language;
      if (payload.subtitle || payload.short_description) {
        backendPayload.short_description = payload.subtitle ?? payload.short_description;
      }
      if (payload.description) backendPayload.description = payload.description;
      if (payload.price !== undefined) {
        backendPayload.price = typeof payload.price === 'number' ? payload.price : parseFloat(payload.price || 0);
      }
      if (payload.salePrice !== undefined || payload.sale_price !== undefined) {
        const sp = payload.salePrice ?? payload.sale_price;
        backendPayload.sale_price = sp !== null && sp !== undefined ? parseFloat(sp) : null;
      }
      if (payload.image || payload.thumbnail_url) {
        backendPayload.thumbnail_url = payload.image ?? payload.thumbnail_url;
      }
      if (payload.introVideoUrl || payload.intro_video_url) {
        backendPayload.intro_video_url = payload.introVideoUrl ?? payload.intro_video_url;
      }
      if (payload.requirements) {
        backendPayload.requirements = Array.isArray(payload.requirements) ? JSON.stringify(payload.requirements) : payload.requirements;
      }
      if (payload.willLearn || payload.outcomes) {
        const out = payload.willLearn ?? payload.outcomes;
        backendPayload.outcomes = Array.isArray(out) ? JSON.stringify(out) : out;
      }

      return apiFetch<any>('/instructor/courses/draft', {
        method: 'POST',
        body: JSON.stringify(backendPayload),
      });
    }
    return { id: 'course-' + Date.now(), ...payload };
  },

  /** PATCH /instructor/courses/{id}/draft */
  async updateCourseDraft(id: string | number, payload: any): Promise<any> {
    devLog('Instructor', `Update course draft ID ${id}`, payload);
    if (config.mode === 'api') {
      const backendPayload: any = {};
      if (payload.title !== undefined) backendPayload.title = payload.title;
      if (payload.slug !== undefined) backendPayload.slug = payload.slug || undefined;
      if (payload.category_id !== undefined || payload.categoryId !== undefined) {
        const catId = payload.category_id || payload.categoryId;
        if (catId) backendPayload.category_ids = [Number(catId)];
      }
      if (payload.level !== undefined) backendPayload.level = payload.level;
      if (payload.language !== undefined) backendPayload.language = payload.language;
      if (payload.subtitle !== undefined || payload.short_description !== undefined) {
        backendPayload.short_description = payload.subtitle ?? payload.short_description;
      }
      if (payload.description !== undefined) backendPayload.description = payload.description;
      if (payload.price !== undefined) {
        backendPayload.price = typeof payload.price === 'number' ? payload.price : parseFloat(payload.price || 0);
      }
      if (payload.salePrice !== undefined || payload.sale_price !== undefined) {
        const sp = payload.salePrice ?? payload.sale_price;
        backendPayload.sale_price = sp !== null && sp !== undefined ? parseFloat(sp) : null;
      }
      if (payload.image !== undefined || payload.thumbnail_url !== undefined) {
        backendPayload.thumbnail_url = payload.image ?? payload.thumbnail_url;
      }
      if (payload.introVideoUrl !== undefined || payload.intro_video_url !== undefined) {
        backendPayload.intro_video_url = payload.introVideoUrl ?? payload.intro_video_url;
      }
      if (payload.requirements !== undefined) {
        backendPayload.requirements = Array.isArray(payload.requirements) ? JSON.stringify(payload.requirements) : payload.requirements;
      }
      if (payload.willLearn !== undefined || payload.outcomes !== undefined) {
        const out = payload.willLearn ?? payload.outcomes;
        backendPayload.outcomes = Array.isArray(out) ? JSON.stringify(out) : out;
      }

      return apiFetch<any>(`/instructor/courses/${id}/draft`, {
        method: 'PATCH',
        body: JSON.stringify(backendPayload),
      });
    }
    return { id, ...payload };
  },

  /** GET /instructor/courses/{id} */
  async getCourseDetail(id: string | number): Promise<any> {
    devLog('Instructor', `Get course detail ID ${id}`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${id}`);
    }
    return null;
  },

  /** GET /instructor/courses/{id}/content */
  async getCourseContent(id: string | number): Promise<any> {
    devLog('Instructor', `Get course content ID ${id}`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${id}/content`);
    }
    return null;
  },

  /** GET /instructor/courses/{courseId}/checklist */
  async getCourseChecklist(courseId: string | number): Promise<any> {
    devLog('Instructor', `Get course checklist ID ${courseId}`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${courseId}/checklist`);
    }
    return {
      checklist_progress: 100,
      missing_items: [],
      completed_items: ['Thông tin cơ bản', 'Mục tiêu & yêu cầu', 'Giá bán', 'Nội dung & bài học'],
      is_ready_for_review: true,
    };
  },

  /** POST /instructor/courses/{id}/submit */
  async submitCourseToAdminVerification(id: string | number): Promise<any> {
    devLog('Instructor', `Submit course ID ${id} for admin review`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${id}/submit`, {
        method: 'POST',
      });
    }
    return { success: true };
  },

  /** POST /instructor/sections */
  async createSection(payload: any): Promise<any> {
    devLog('Instructor', 'Create section', payload);
    if (config.mode === 'api') {
      return apiFetch<any>('/instructor/sections', {
        method: 'POST',
        body: JSON.stringify({
          course_id: Number(payload.course_id || payload.courseId),
          title: payload.title,
          sort_order: payload.sort_order || payload.orderIndex || 1,
        }),
      });
    }
    return { id: 'sec-' + Date.now(), ...payload };
  },

  /** PATCH /instructor/sections/{id} */
  async updateSection(id: string | number, payload: any): Promise<any> {
    devLog('Instructor', `Update section ID ${id}`, payload);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/sections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: payload.title,
          sort_order: payload.sort_order || payload.orderIndex,
        }),
      });
    }
    return { id, ...payload };
  },

  /** DELETE /instructor/sections/{id} */
  async deleteSection(id: string | number): Promise<any> {
    devLog('Instructor', `Delete section ID ${id}`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/sections/${id}`, {
        method: 'DELETE',
      });
    }
    return { success: true };
  },

  /** POST /instructor/lessons */
  async createLesson(payload: any): Promise<any> {
    devLog('Instructor', 'Create lesson', payload);
    if (config.mode === 'api') {
      return apiFetch<any>('/instructor/lessons', {
        method: 'POST',
        body: JSON.stringify({
          course_id: Number(payload.course_id || payload.courseId),
          course_section_id: Number(payload.course_section_id || payload.sectionId),
          title: payload.title,
          lesson_type: payload.lesson_type || payload.type || 'video',
          sort_order: payload.sort_order || payload.orderIndex || 1,
          is_preview: payload.is_preview ?? payload.isPreview ?? false,
          video_url: payload.video_url || payload.videoUrl || undefined,
          video_duration_seconds: payload.video_duration_seconds ?? payload.duration_seconds ?? undefined,
          content: payload.content || payload.docContent || undefined,
        }),
      });
    }
    return { id: 'les-' + Date.now(), ...payload };
  },

  /** PATCH /instructor/lessons/{id} */
  async updateLesson(id: string | number, payload: any): Promise<any> {
    devLog('Instructor', `Update lesson ID ${id}`, payload);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/lessons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: payload.title,
          lesson_type: payload.lesson_type || payload.type,
          sort_order: payload.sort_order || payload.orderIndex,
          is_preview: payload.is_preview ?? payload.isPreview,
          video_url: payload.video_url ?? payload.videoUrl,
          video_duration_seconds: payload.video_duration_seconds ?? payload.duration_seconds,
          content: payload.content ?? payload.docContent,
        }),
      });
    }
    return { id, ...payload };
  },

  /** DELETE /instructor/lessons/{id} */
  async deleteLesson(id: string | number): Promise<any> {
    devLog('Instructor', `Delete lesson ID ${id}`);
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/lessons/${id}`, {
        method: 'DELETE',
      });
    }
    return { success: true };
  },

  /** POST /instructor/lessons/{id}/video */
  async uploadLessonVideo(id: string | number, videoFile: File, durationSeconds?: number): Promise<any> {
    devLog('Instructor', `Upload video for lesson ID ${id}`);
    if (config.mode === 'api') {
      const formData = new FormData();
      formData.append('video', videoFile);
      if (durationSeconds) formData.append('video_duration_seconds', durationSeconds.toString());
      return apiFetch<any>(`/instructor/lessons/${id}/video`, {
        method: 'POST',
        body: formData,
      });
    }
    return { video_url: URL.createObjectURL(videoFile) };
  },

  /** POST /instructor/lessons/{id}/assets */
  async uploadLessonAsset(id: string | number, assetFile: File, title?: string): Promise<any> {
    devLog('Instructor', `Upload asset for lesson ID ${id}`);
    if (config.mode === 'api') {
      const formData = new FormData();
      formData.append('file', assetFile);
      if (title) formData.append('title', title);
      return apiFetch<any>(`/instructor/lessons/${id}/assets`, {
        method: 'POST',
        body: formData,
      });
    }
    return { file_url: URL.createObjectURL(assetFile), file_name: assetFile.name };
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
  async updateInstructorSectionDetails(id: string, payload: any): Promise<any> {
    devLog('Instructor', `Modifying structure of section: ${id}`, payload);
    return apiFetch<any>(`/instructor/sections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /** DELETE /instructor/sections/{id} */
  async deleteInstructorSectionDetails(id: string): Promise<{ success: boolean }> {
    devLog('Instructor', `Remove section folder block entirely: ${id}`);
    return apiFetch<{ success: boolean }>(`/instructor/sections/${id}`, { method: 'DELETE' });
  },

  /** GET /instructor/discount-codes/summary */
  async getInstructorCouponSummary(params?: { course_id?: number | string }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.course_id && params.course_id !== 'all') query.append('course_id', String(params.course_id));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<any>(`/instructor/discount-codes/summary${qs}`);
  },

  /** GET /instructor/discount-codes/course-options */
  async getInstructorCouponCourseOptions(): Promise<any[]> {
    return apiFetch<any[]>('/instructor/discount-codes/course-options');
  },

  /** GET /instructor/discount-codes */
  async getInstructorCoupons(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    type?: string;
    course_id?: number | string;
    search?: string;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.type && params.type !== 'all') query.append('type', params.type);
    if (params?.course_id && params.course_id !== 'all') query.append('course_id', String(params.course_id));
    if (params?.search) query.append('search', params.search);
    
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<any>(`/instructor/discount-codes${qs}`);
  },

  /** GET /instructor/discount-codes/{id} */
  async getInstructorCouponDetail(id: number | string): Promise<any> {
    return apiFetch<any>(`/instructor/discount-codes/${id}`);
  },

  /** POST /instructor/discount-codes */
  async createInstructorCoupon(payload: any): Promise<any> {
    return apiFetch<any>('/instructor/discount-codes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** PATCH /instructor/discount-codes/{id} */
  async updateInstructorCoupon(id: number | string, payload: any): Promise<any> {
    return apiFetch<any>(`/instructor/discount-codes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /** PATCH /instructor/discount-codes/{id}/enable */
  async enableInstructorCoupon(id: number | string): Promise<any> {
    return apiFetch<any>(`/instructor/discount-codes/${id}/enable`, {
      method: 'PATCH',
    });
  },

  /** PATCH /instructor/discount-codes/{id}/disable */
  async disableInstructorCoupon(id: number | string): Promise<any> {
    return apiFetch<any>(`/instructor/discount-codes/${id}/disable`, {
      method: 'PATCH',
    });
  },

  /** DELETE /instructor/discount-codes/{id} */
  async deleteInstructorCoupon(id: number | string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/instructor/discount-codes/${id}`, { method: 'DELETE' });
  },

  /** Legacy helper methods mapping */
  async getInstructorPromoCoupons(): Promise<any[]> {
    return this.getInstructorCoupons();
  },

  async createPromoCoupon(payload: any): Promise<any> {
    return this.createInstructorCoupon(payload);
  },

  async getCouponDetails(id: string): Promise<any> {
    return this.getInstructorCouponDetail(id);
  },

  async updatePromoCouponDetails(id: string, payload: any): Promise<any> {
    return this.updateInstructorCoupon(id, payload);
  },

  async deletePromoCoupon(id: string): Promise<{ success: boolean }> {
    return this.deleteInstructorCoupon(id);
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

  async uploadLessonVideoWithProgress(
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
  async getInstructorWithdrawalSummary(): Promise<any> {
    devLog('Instructor', 'Get withdrawal summary');
    return apiFetch<any>('/instructor/withdrawals/summary');
  },

  async getInstructorBalance(instructorId?: string): Promise<any> {
    devLog('Instructor', 'Get withdrawal summary for balance');
    return apiFetch<any>('/instructor/withdrawals/summary');
  },

  async getInstructorPayoutAccounts(params?: any): Promise<any> {
    devLog('Instructor', 'Get payout accounts');
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return apiFetch<any>(`/instructor/payout-accounts${queryString}`);
  },

  async getDefaultInstructorPayoutAccount(): Promise<any> {
    devLog('Instructor', 'Get default payout account');
    return apiFetch<any>('/instructor/payout-accounts/default');
  },

  async getInstructorPayoutAccount(instructorId?: string): Promise<any> {
    devLog('Instructor', 'Get default payout account');
    return apiFetch<any>('/instructor/payout-accounts/default');
  },

  async setDefaultInstructorPayoutAccount(accountId: string | number): Promise<any> {
    devLog('Instructor', 'Set default payout account', { accountId });
    return apiFetch<any>(`/instructor/payout-accounts/${accountId}/set-default`, {
      method: 'PATCH',
    });
  },

  async createInstructorPayoutAccount(payload: any): Promise<any> {
    devLog('Instructor', 'Create payout account', payload);
    return apiFetch<any>('/instructor/payout-accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async sendInstructorPayoutAccountOtp(accountId: string | number, payload: any): Promise<any> {
    devLog('Instructor', 'Send payout account OTP', payload);
    const id = accountId ? accountId : 0;
    return apiFetch<any>(`/instructor/payout-accounts/${id}/send-change-otp`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyInstructorPayoutAccountChange(accountId: string | number, otp: string): Promise<any> {
    devLog('Instructor', 'Verify payout account change OTP', { accountId, otp });
    const id = accountId ? accountId : 0;
    return apiFetch<any>(`/instructor/payout-accounts/${id}/verify-change`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  },

  async revealInstructorPayoutAccount(accountId: string | number, payload: { password?: string }): Promise<any> {
    devLog('Instructor', 'Reveal payout account number', { accountId });
    return apiFetch<any>(`/instructor/payout-accounts/${accountId}/reveal`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateInstructorPayoutAccount(idOrInstructorId: string | number, payload: any): Promise<any> {
    devLog('Instructor', 'Update payout account', payload);
    // If first argument is numeric ID, route to PATCH /instructor/payout-accounts/:id
    // Otherwise if it's instructorId string or payload has id, handle gracefully
    const accountId = typeof payload?.id === 'number' || typeof payload?.id === 'string' 
      ? payload.id 
      : idOrInstructorId;
    
    if (accountId && (typeof accountId === 'number' || !isNaN(Number(accountId)))) {
      return apiFetch<any>(`/instructor/payout-accounts/${accountId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }

    return apiFetch<any>('/instructor/payout-accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getInstructorWithdrawals(arg1?: any, arg2?: any): Promise<any> {
    devLog('Instructor', 'Get withdrawals list');
    let params: any = {};
    if (typeof arg1 === 'object' && arg1 !== null) {
      params = arg1;
    } else if (typeof arg2 === 'object' && arg2 !== null) {
      params = arg2;
    }
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('per_page', String(params.limit));
    if (params.per_page) query.set('per_page', String(params.per_page));
    if (params.status && params.status !== 'all') query.set('status', String(params.status));
    if (params.date_from) query.set('date_from', String(params.date_from));
    if (params.date_to) query.set('date_to', String(params.date_to));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<any>(`/instructor/withdrawals${queryString}`);
  },

  async getInstructorWithdrawal(withdrawalId: string | number): Promise<any> {
    devLog('Instructor', 'Get withdrawal detail', { withdrawalId });
    return apiFetch<any>(`/instructor/withdrawals/${withdrawalId}`);
  },

  async requestInstructorEarlyWithdrawalOtp(payload: { amount: number; payout_account_id?: number | string }): Promise<any> {
    devLog('Instructor', 'Request early withdrawal OTP', payload);
    return apiFetch<any>('/instructor/early-withdrawals/request-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createInstructorEarlyWithdrawal(payload: { amount: number; payout_account_id?: number | string; otp: string }): Promise<any> {
    devLog('Instructor', 'Create early withdrawal', payload);
    return apiFetch<any>('/instructor/early-withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createInstructorWithdrawal(arg1: any, arg2?: any): Promise<any> {
    const payload = typeof arg1 === 'object' ? arg1 : arg2;
    devLog('Instructor', 'Create withdrawal', payload);
    return apiFetch<any>('/instructor/withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async cancelInstructorWithdrawal(withdrawalId: string | number): Promise<any> {
    devLog('Instructor', 'Cancel withdrawal request', { withdrawalId });
    return apiFetch<any>(`/instructor/early-withdrawals/${withdrawalId}/cancel`, {
      method: 'PATCH',
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

  async getInstructorQuestions(arg1?: any, arg2?: any): Promise<any> {
    if (config.mode === 'api') {
      const params = typeof arg1 === 'object' ? (arg1 || {}) : (arg2 || {});
      const q = new URLSearchParams();
      if (params.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params.courseId && params.courseId !== 'all') q.set('course_id', String(params.courseId));
      if (params.lesson_id && params.lesson_id !== 'all') q.set('lesson_id', String(params.lesson_id));
      if (params.lessonId && params.lessonId !== 'all') q.set('lesson_id', String(params.lessonId));
      if (params.status && params.status !== 'all') q.set('status', String(params.status));
      if (params.filter && params.filter !== 'all') q.set('status', String(params.filter));
      if (params.search && params.search.trim()) q.set('search', params.search.trim());
      if (params.sort) q.set('sort', params.sort);
      if (params.page) q.set('page', String(params.page));
      if (params.per_page || params.limit) q.set('per_page', String(params.per_page || params.limit));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/questions${queryString}`);
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
  },

  // --- NEW INSTRUCTOR COURSE/SECTION/LESSON/ASSET ENDPOINTS ---
  async getInstructorCoursesList(): Promise<any[]> {
    if (config.mode === 'api') {
      return apiFetch<any[]>('/instructor/courses');
    }
    return (await MockDB.getCourses()).map(c => ({ id: c.id, title: c.title, ...c }));
  },

  async getInstructorCourse(id: string): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${id}`);
    }
    return await MockDB.getCourseById(id);
  },

  async createInstructorCourse(payload: any): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>('/instructor/courses', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    const newCourse: Course = {
      id: 'course-' + Date.now(),
      title: payload.title,
      subtitle: payload.short_description || '',
      description: payload.description || '',
      category: 'Development',
      subcategory: '',
      instructorId: 'u-1',
      instructorName: 'Instructor Test',
      instructorTitle: 'Giảng viên MindHub',
      instructorAvatar: 'https://ui-avatars.com/api/?name=Instructor',
      instructorBio: '',
      price: payload.price || 0,
      salePrice: payload.sale_price || null,
      rating: 5.0,
      reviewCount: 0,
      enrolledCount: 0,
      completionRate: 100,
      image: payload.thumbnail_url || '',
      chapters: [],
      reviews: [],
      faqs: [],
      requirements: payload.requirements || [],
      willLearn: payload.outcomes || [],
      status: payload.status || 'draft'
    };
    const current = MockDB.getState().courses;
    MockDB.commit({ courses: [...current, newCourse] });
    return newCourse;
  },

  async updateInstructorCourse(id: string, payload: any): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
    }
    const current = MockDB.getState().courses;
    const existing = current.find(c => c.id === id);
    if (!existing) throw new Error('Course not found');
    const updated = {
      ...existing,
      title: payload.title !== undefined ? payload.title : existing.title,
      price: payload.price !== undefined ? payload.price : existing.price,
      salePrice: payload.sale_price !== undefined ? payload.sale_price : existing.salePrice,
      image: payload.thumbnail_url !== undefined ? payload.thumbnail_url : existing.image,
      requirements: payload.requirements !== undefined ? payload.requirements : existing.requirements,
      willLearn: payload.outcomes !== undefined ? payload.outcomes : existing.willLearn,
      status: payload.status !== undefined ? payload.status : existing.status,
      subtitle: payload.short_description !== undefined ? payload.short_description : existing.subtitle,
      description: payload.description !== undefined ? payload.description : existing.description
    };
    MockDB.commit({ courses: current.map(c => c.id === id ? updated : c) });
    return updated;
  },

  async submitInstructorCourseReview(id: string): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${id}/submit`, { method: 'POST' });
    }
    const current = MockDB.getState().courses;
    MockDB.commit({ courses: current.map(c => c.id === id ? { ...c, status: 'pending' as const } : c) });
    return { success: true };
  },

  async deleteInstructorCourse(id: string | number): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${id}`, {
        method: 'DELETE'
      });
    }
    const current = MockDB.getState().courses;
    MockDB.commit({ courses: current.filter(c => c.id !== id) });
    return { success: true };
  },

  async hideInstructorCourse(id: string | number): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${id}/hide`, {
        method: 'PATCH'
      });
    }
    const current = MockDB.getState().courses;
    MockDB.commit({ courses: current.map(c => c.id === id ? { ...c, status: 'hidden' as const } : c) });
    return { success: true };
  },

  async unhideInstructorCourse(id: string | number): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${id}/unhide`, {
        method: 'PATCH'
      });
    }
    const current = MockDB.getState().courses;
    MockDB.commit({ courses: current.map(c => c.id === id ? { ...c, status: 'published' as const } : c) });
    return { success: true };
  },

  async getInstructorCourseSections(courseId: string): Promise<any[]> {
    if (config.mode === 'api') {
      return apiFetch<any[]>(`/instructor/courses/${courseId}/sections`);
    }
    const course = await MockDB.getCourseById(courseId);
    if (!course) return [];
    return (course.chapters || []).map((ch, idx) => ({
      id: ch.id,
      course_id: courseId,
      title: ch.title,
      description: '',
      sort_order: idx + 1,
      status: 'active'
    }));
  },

  async createInstructorCourseSection(courseId: string, payload: any): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/courses/${courseId}/sections`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    const current = MockDB.getState().courses;
    const course = current.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');
    const newSection = {
      id: 'sec-' + Date.now(),
      title: payload.title,
      lessons: []
    };
    const updated = {
      ...course,
      chapters: [...(course.chapters || []), newSection]
    };
    MockDB.commit({ courses: current.map(c => c.id === courseId ? updated : c) });
    return {
      id: newSection.id,
      course_id: courseId,
      title: newSection.title,
      description: payload.description || '',
      sort_order: (course.chapters || []).length + 1,
      status: 'active'
    };
  },

  async updateCourseSection(sectionId: string, payload: any): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/sections/${sectionId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
    }
    const current = MockDB.getState().courses;
    let found = false;
    const updatedCourses = current.map(course => {
      const chs = course.chapters || [];
      if (chs.some(ch => ch.id === sectionId)) {
        found = true;
        return {
          ...course,
          chapters: chs.map(ch => ch.id === sectionId ? { ...ch, title: payload.title } : ch)
        };
      }
      return course;
    });
    if (found) {
      MockDB.commit({ courses: updatedCourses });
    }
    return { id: sectionId, title: payload.title };
  },

  async deleteCourseSection(sectionId: string): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/sections/${sectionId}`, {
        method: 'DELETE'
      });
    }
    const current = MockDB.getState().courses;
    const updatedCourses = current.map(course => {
      const chs = course.chapters || [];
      if (chs.some(ch => ch.id === sectionId)) {
        return {
          ...course,
          chapters: chs.filter(ch => ch.id !== sectionId)
        };
      }
      return course;
    });
    MockDB.commit({ courses: updatedCourses });
    return { success: true };
  },

  async getCourseLessons(courseId: string): Promise<any[]> {
    if (config.mode === 'api') {
      return apiFetch<any[]>(`/instructor/courses/${courseId}/lessons`);
    }
    const course = await MockDB.getCourseById(courseId);
    if (!course) return [];
    const list: any[] = [];
    (course.chapters || []).forEach(ch => {
      (ch.lessons || []).forEach((les, idx) => {
        list.push({
          id: les.id,
          course_id: courseId,
          course_section_id: ch.id,
          title: les.title,
          lesson_type: les.type === 'doc' ? 'doc' : 'video',
          content: les.content || les.docContent || '',
          video_url: les.videoUrl || '',
          video_duration_seconds: 600,
          is_preview: les.isPreview || false,
          status: 'active',
          sort_order: idx + 1
        });
      });
    });
    return list;
  },

  async getLessonAssets(lessonId: string): Promise<any[]> {
    if (config.mode === 'api') {
      return apiFetch<any[]>(`/instructor/lessons/${lessonId}/assets`);
    }
    const current = MockDB.getState().courses;
    let res: any[] = [];
    current.forEach(c => {
      (c.chapters || []).forEach(ch => {
        (ch.lessons || []).forEach(l => {
          if (l.id === lessonId && l.resources) {
            res = l.resources.map((r, idx) => ({
              id: r.id || `res-${idx}`,
              lesson_id: lessonId,
              title: r.title || 'Tài nguyên',
              file_url: r.url || '',
              file_name: r.title || 'file.pdf',
              file_type: 'pdf',
              file_size: 1024 * 1024,
              note: ''
            }));
          }
        });
      });
    });
    return res;
  },

  async createLessonAsset(lessonId: string | number, payload: any): Promise<any> {
    if (config.mode === 'api') {
      if (payload.file instanceof File) {
        const formData = new FormData();
        formData.append('file', payload.file);
        if (payload.title) formData.append('title', payload.title);
        if (payload.note) formData.append('note', payload.note);
        return apiFetch<any>(`/instructor/lessons/${lessonId}/assets`, {
          method: 'POST',
          body: formData,
        });
      }
      return apiFetch<any>(`/instructor/lessons/${lessonId}/assets`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    const current = MockDB.getState().courses;
    const newRes: Resource = {
      id: 'res-' + Date.now(),
      title: payload.title || payload.file_name || 'Tài nguyên',
      url: payload.file_url || '',
      size: '1.2 MB'
    };
    const updatedCourses = current.map(c => ({
      ...c,
      chapters: (c.chapters || []).map(ch => ({
        ...ch,
        lessons: (ch.lessons || []).map(l => {
          if (l.id === lessonId) {
            return {
              ...l,
              resources: [...(l.resources || []), newRes]
            };
          }
          return l;
        })
      }))
    }));
    MockDB.commit({ courses: updatedCourses });
    return {
      id: newRes.id,
      lesson_id: lessonId,
      ...payload
    };
  },

  async deleteLessonAsset(assetId: string): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/assets/${assetId}`, {
        method: 'DELETE'
      });
    }
    const current = MockDB.getState().courses;
    const updatedCourses = current.map(c => ({
      ...c,
      chapters: (c.chapters || []).map(ch => ({
        ...ch,
        lessons: (ch.lessons || []).map(l => ({
          ...l,
          resources: (l.resources || []).filter(r => r.id !== assetId)
        }))
      }))
    }));
    MockDB.commit({ courses: updatedCourses });
    return { success: true };
  },

  // --- INSTRUCTOR QUESTIONS & DISCUSSIONS API ---
  async getInstructorQuestionSummary(params?: { course_id?: string | number; lesson_id?: string | number }): Promise<any> {
    if (config.mode === 'api') {
      const q = new URLSearchParams();
      if (params?.course_id) q.set('course_id', String(params.course_id));
      if (params?.lesson_id) q.set('lesson_id', String(params.lesson_id));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/questions/summary${queryString}`);
    }
    return {
      success: true,
      data: { total_questions: 174, unanswered_questions: 18, answered_questions: 156, comments_today: 32, starred: 12 }
    };
  },

  async getInstructorQuestionCourseOptions(): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/questions/course-options`);
    }
    return { success: true, data: [] };
  },

  async getInstructorQuestionLessonOptions(course_id?: string | number): Promise<any> {
    if (config.mode === 'api') {
      const q = course_id && course_id !== 'all' ? `?course_id=${course_id}` : '';
      return apiFetch<any>(`/instructor/questions/lesson-options${q}`);
    }
    return { success: true, data: [] };
  },

  async getInstructorQuestion(id: string | number): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/questions/${id}`);
    }
    return { success: true, data: null };
  },

  async replyInstructorQuestion(id: string | number, payload: { content: string; is_official?: boolean; notify_learner?: boolean } | string): Promise<any> {
    if (config.mode === 'api') {
      const bodyData = typeof payload === 'string' 
        ? { content: payload, is_official: true, notify_learner: true } 
        : payload;
      return apiFetch<any>(`/instructor/questions/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
    }
    return { success: true };
  },

  async starInstructorQuestion(id: string | number): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/questions/${id}/star`, { method: 'POST' });
    }
    return { success: true };
  },

  async unstarInstructorQuestion(id: string | number): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/questions/${id}/star`, { method: 'DELETE' });
    }
    return { success: true };
  },

  async updateInstructorQuestionStatus(id: string | number, status: string): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/questions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    }
    return { success: true };
  },

  async updateInstructorQuestionReply(questionId: string | number, replyId: string | number, payload: { content: string; is_official?: boolean }): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/questions/${questionId}/replies/${replyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    return { success: true };
  },

  async deleteInstructorQuestionReply(questionId: string | number, replyId: string | number): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/questions/${questionId}/replies/${replyId}`, {
        method: 'DELETE'
      });
    }
    return { success: true };
  },

  async deleteInstructorQuestion(id: string | number): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/questions/${id}`, {
        method: 'DELETE'
      });
    }
    return { success: true };
  },

  async hideInstructorQuestion(id: string | number): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>(`/instructor/questions/${id}/hide`, {
        method: 'PATCH'
      });
    }
    return { success: true };
  },

  async getInstructorLearnersSummary(params?: { course_id?: string | number; status?: string; preset?: string; date_from?: string; date_to?: string }): Promise<any> {
    if (config.mode === 'api') {
      const q = new URLSearchParams();
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params?.status && params.status !== 'all') q.set('status', String(params.status));
      if (params?.preset && params.preset !== '30d') q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/learners/summary${queryString}`);
    }
    return { success: true, data: null };
  },

  async getInstructorLearnersChart(params?: { course_id?: string | number; status?: string; days?: number; preset?: string; date_from?: string; date_to?: string }): Promise<any> {
    if (config.mode === 'api') {
      const q = new URLSearchParams();
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params?.status && params.status !== 'all') q.set('status', String(params.status));
      if (params?.preset && params.preset !== '30d') q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      if (params?.days) q.set('days', String(params.days));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/learners/chart${queryString}`);
    }
    return { success: true, data: null };
  },

  async exportInstructorLearners(params?: { course_id?: string | number; status?: string; search?: string; preset?: string; date_from?: string; date_to?: string }): Promise<any> {
    if (config.mode === 'api') {
      const q = new URLSearchParams();
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params?.status && params.status !== 'all') q.set('status', String(params.status));
      if (params?.search) q.set('search', String(params.search));
      if (params?.preset && params.preset !== '30d') q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/learners/export${queryString}`);
    }
    return { success: true };
  },

  async getInstructorRevenueSummary(params?: { preset?: string; date_from?: string; date_to?: string; course_id?: string | number }): Promise<any> {
    if (config.mode === 'api') {
      const q = new URLSearchParams();
      if (params?.preset) q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/revenues/summary${queryString}`);
    }
    return { success: true, data: null };
  },

  async getInstructorRevenueCourseBreakdown(params?: { preset?: string; date_from?: string; date_to?: string }): Promise<any> {
    if (config.mode === 'api') {
      const q = new URLSearchParams();
      if (params?.preset) q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/revenues/course-breakdown${queryString}`);
    }
    return { success: true, data: null };
  },

  async getInstructorRevenueDetails(params?: { page?: number; per_page?: number; preset?: string; date_from?: string; date_to?: string; course_id?: string | number; status?: string; search?: string }): Promise<any> {
    if (config.mode === 'api') {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.per_page) q.set('per_page', String(params.per_page));
      if (params?.preset) q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params?.status && params.status !== 'all') q.set('status', String(params.status));
      if (params?.search) q.set('search', String(params.search));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/revenues/details${queryString}`);
    }
    return { success: true, data: null };
  },

  async exportInstructorRevenues(params?: { preset?: string; date_from?: string; date_to?: string; course_id?: string | number }): Promise<any> {
    if (config.mode === 'api') {
      const q = new URLSearchParams();
      if (params?.preset) q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/revenues/export${queryString}`);
    }
    return { success: true };
  },

  // --- ACCOUNT ALIASES & AVATAR PRESET MANAGEMENT ---
  async getAccountProfile(): Promise<any> {
    return this.getInstructorProfile();
  },

  async updateAccountProfile(payload: any): Promise<any> {
    return this.updateInstructorProfile(payload);
  },

  async uploadAccountAvatar(file: File): Promise<any> {
    return this.uploadInstructorAvatar(file);
  },

  async selectAccountAvatarPreset(presetId: string): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>('/account/avatar/preset', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset_id: presetId })
      });
    }
    return { success: true };
  },

  async deleteAccountAvatar(): Promise<any> {
    if (config.mode === 'api') {
      return apiFetch<any>('/account/avatar', {
        method: 'DELETE'
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
