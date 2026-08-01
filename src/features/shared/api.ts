import { apiFetch, devLog, config, ApiError } from '@/shared/lib/api-client';
import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';

export const sharedApi = {
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

async getUserActivities(userId: string): Promise<any[]> {
    if (!userId || userId === 'u-guest') {
      return [];
    }
    try {
              return await apiFetch<any[]>('/learning-logs/my');
            } catch(e) {
              return [];
            }
  },

async getAutocompleteSuggestions(query: string): Promise<string[]> {
  devLog('Catalog', `Get index search hints for query: "${query}"`);
  return apiFetch<string[]>(`/search/suggestions?q=${encodeURIComponent(query)}`);
  },

async getFeaturedInstructors(): Promise<any[]> {
  devLog('Catalog', 'Get list of top-rated platform experts');
  return apiFetch<any[]>('/instructors/featured');
  },

async getMyWishlist(): Promise<Course[]> {
  devLog('Wishlist', 'Get bookmarks under active account');
  return apiFetch<Course[]>('/wishlists');
  },

async addToWishlist(courseId: string): Promise<{ success: boolean }> {
  devLog('Wishlist', `Add course ID ${courseId} to wishlist`);
  return apiFetch<{ success: boolean }>('/wishlists', {
          method: 'POST',
          body: JSON.stringify({ course_id: courseId }),
        });
  },

async removeFromWishlist(courseId: string): Promise<{ success: boolean }> {
  devLog('Wishlist', `Evict course ID ${courseId} list item`);
  return apiFetch<{ success: boolean }>(`/wishlists/${courseId}`, {
          method: 'DELETE',
        });
  },

async getLearningDashboardStats(): Promise<any> {
  devLog('Learning', 'Calculate metrics, active days, hours studied, completion milestones');
  return apiFetch<any>('/me/learning-dashboard');
  },

async getMyLearningAlerts(): Promise<any[]> {
  devLog('Learning', 'Search for system and deadline alerts');
  return apiFetch<any[]>('/me/dynamic-alerts');
  },

async getNextPathGoal(): Promise<any> {
  devLog('Learning', 'Recommend following milestone based on historical studies');
  return apiFetch<any>('/me/learning-path/next');
  },

async getRuleBasedRecommendations(): Promise<Course[]> {
  devLog('Learning', 'Fetch dynamic rule-based personalized suggestions');
  return apiFetch<Course[]>('/me/recommendations/rule-based');
  },

async getMyStudyLogs(): Promise<any[]> {
  devLog('Learning', 'Get active study engagement logs history');
  return apiFetch<any[]>('/learning-logs/my');
  },

async submitQuizAttemptAnswers(quizId: string, answers: Record<string, string | number[]>): Promise<any> {
  devLog('Assessment', `Submitting test answers sheet evaluation to Quiz ID: ${quizId}`, answers);
  return apiFetch<any>(`/quizzes/${quizId}/attempts`, {
          method: 'POST',
          body: JSON.stringify({ answers }),
        });
  },

async getQuizAttemptDetails(attemptId: string): Promise<any> {
  devLog('Assessment', `Retrace diagnostic evaluation worksheet: ${attemptId}`);
  return apiFetch<any>(`/quiz-attempts/${attemptId}`);
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

async sendContactMessage(payload: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean; message?: string }> {
  devLog('Contact', 'Gửi tin nhắn liên hệ', payload);
  return apiFetch<{ success: boolean; message?: string }>('/contact', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
  }
};
