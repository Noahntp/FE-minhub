import { apiFetch, devLog, config, ApiError } from '@/shared/lib/api-client';
import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';

export const profileApi = {
async getPublicInstructorProfile(instructorId: string): Promise<any> {
  devLog('Catalog', `View public professional page/bio for trainer ID: ${instructorId}`);
  return apiFetch<any>(`/instructors/${instructorId}`);
  },

async getMyProfile(): Promise<User> {
  devLog('Profile', 'Fetch currently authenticated profile state node');
  return apiFetch<User>('/users/me');
  },

async updateMyProfile(payload: Partial<User>): Promise<User> {
  devLog('Profile', 'Sync personal bio and name traits', payload);
  return apiFetch<User>('/users/me', {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

async createAccountRequest(payload: Omit<AccountRequest, 'id' | 'timestamp' | 'status'>): Promise<AccountRequest> {
      // BACKEND_MISSING
    devLog('Profile', 'Request account closure', payload);
    return apiFetch<AccountRequest>('/users/me/account-requests', {
              method: 'POST',
              body: JSON.stringify(payload)
            });
  },

async createPlatformUserAccount(payload: any): Promise<User> {
  devLog('Admin', 'Creating account from backend control panels', payload);
  return apiFetch<User>('/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

async deactivatePlatformUserAccount(id: string): Promise<{ success: boolean }> {
  devLog('Admin', `Invoking ban/deactivation command on account ID: ${id}`);
  return apiFetch<{ success: boolean }>(`/admin/users/${id}`, { method: 'DELETE' });
  },

async getAccountRequests(): Promise<AccountRequest[]> {
      // BACKEND_MISSING
    devLog('Admin', 'Fetch account requests');
    return apiFetch<AccountRequest[]>('/admin/account-requests');
  },

async resolveAccountRequest(requestId: string, action: 'approved' | 'rejected'): Promise<{ success: boolean; message: string }> {
      // BACKEND_MISSING
    devLog('Admin', 'Resolve account request', { requestId, action });
    return apiFetch<{ success: boolean; message: string }>(`/admin/account-requests/${requestId}/resolve`, {
              method: 'PATCH',
              body: JSON.stringify({ action })
            });
  },

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
    return apiFetch<any>('/account/avatar/preset', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ preset_id: presetId })
            });
  },

async deleteAccountAvatar(): Promise<any> {
    return apiFetch<any>('/account/avatar', {
              method: 'DELETE'
            });
  }
};
