import { apiFetch } from '@/shared/lib/api-client';

export interface NextLearningPathItem {
  id: number;
  title: string;
  slug: string;
  level: string;
  path_reason?: string;
}

export const roadmapsApi = {
  async getMyCourses(): Promise<any[]> {
    try {
      const res = await apiFetch<any>('/me/courses');
      return Array.isArray(res) ? res : res?.data || [];
    } catch (e) {
      console.warn('Could not fetch my courses for roadmap:', e);
      return [];
    }
  },

  async getNextLearningPath(categoryId?: number): Promise<any[]> {
    try {
      const query = categoryId ? `?category_id=${categoryId}` : '';
      const res = await apiFetch<any>(`/me/learning-path/next${query}`);
      return Array.isArray(res) ? res : res?.data || [];
    } catch (e) {
      console.warn('Could not fetch next learning path from backend:', e);
      return [];
    }
  },

  async getCatalogCourses(): Promise<any[]> {
    try {
      const res = await apiFetch<any>('/courses');
      return Array.isArray(res) ? res : res?.data || [];
    } catch (e) {
      console.warn('Could not fetch catalog courses:', e);
      return [];
    }
  },

  async getCategories(): Promise<any[]> {
    try {
      const res = await apiFetch<any>('/categories');
      return Array.isArray(res) ? res : res?.data || [];
    } catch (e) {
      console.warn('Could not fetch categories for roadmap:', e);
      return [];
    }
  },

  async getLearningLogs(): Promise<any[]> {
    try {
      const res = await apiFetch<any>('/learning-logs/my');
      return Array.isArray(res) ? res : res?.data || [];
    } catch (e) {
      console.warn('Could not fetch learning logs:', e);
      return [];
    }
  },

  async getStats(): Promise<any> {
    try {
      const res = await apiFetch<any>('/home');
      return res?.stats || null;
    } catch (e) {
      console.warn('Could not fetch roadmap stats:', e);
      return null;
    }
  },
};
