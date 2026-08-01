import { apiFetch, devLog, config, ApiError } from '@/shared/lib/api-client';
import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';

export const homeApi = {
async getHomepageData(): Promise<any> {
  devLog('Catalog', 'Get homepage catalog metrics, sliders, and categories');
  return apiFetch<any>('/home');
  }
};
