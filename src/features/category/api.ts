import { apiFetch, devLog, config, ApiError } from '@/shared/lib/api-client';
import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';

export const categoryApi = {
async getCategories(): Promise<any[]> {
  devLog('Catalog', 'Get list of course categories');
  return apiFetch<any[]>('/categories');
  },

async getCategoriesWithCount(): Promise<{name: string, count: number}[]> {
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
    // Mock fallback
  }
};
