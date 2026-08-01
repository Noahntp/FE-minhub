import { apiFetch, devLog, config, ApiError } from '@/shared/lib/api-client';
import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';

export const adminApi = {
async getRolesList(): Promise<any[]> {
  devLog('Admin', 'Query complete role models system directories');
  return apiFetch<any[]>('/admin/roles');
  },

async createAdminRole(payload: any): Promise<any> {
  devLog('Admin', 'Adding role privilege node', payload);
  return apiFetch<any>('/admin/roles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

async getRoleDefinitionDetails(id: string): Promise<any> {
  devLog('Admin', `View permissions dictionary configured under tag: ${id}`);
  return apiFetch<any>(`/admin/roles/${id}`);
  },

async updateRoleDefinitionDetails(id: string, payload: any): Promise<any> {
  devLog('Admin', `Modifying privilege mask of role: ${id}`, payload);
  return apiFetch<any>(`/admin/roles/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

async deleteAdminRole(id: string): Promise<{ success: boolean }> {
  devLog('Admin', `Revoke role template: ${id}`);
  return apiFetch<{ success: boolean }>(`/admin/roles/${id}`, { method: 'DELETE' });
  },

async getPlatformUsersList(): Promise<User[]> {
  devLog('Admin', 'Fetch full index directory of users registrations');
  return apiFetch<User[]>('/admin/users');
  },

async getPlatformUserDetail(id: string): Promise<User> {
  devLog('Admin', `View general history and order logs for User: ${id}`);
  return apiFetch<User>(`/admin/users/${id}`);
  },

async updatePlatformUserCredentials(id: string, payload: any): Promise<User> {
  devLog('Admin', `Overriding role or credential details of user: ${id}`, payload);
  return apiFetch<User>(`/admin/users/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

async verifyAdminAuthConnection(): Promise<{ authenticated: boolean; system_healthy: boolean }> {
  devLog('Admin', 'Ping admin authentication status connection test sequence');
  return apiFetch<any>('/admin/test');
  },

async requestAdminRole(payload: any): Promise<{ success: boolean; message: string }> {
  devLog('Auth', 'Request Admin Role', payload);
  return apiFetch<{ success: boolean; message: string }>('/role-requests/admin', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
  },

async requestInstructorRole(payload: any): Promise<{ success: boolean; message: string }> {
  devLog('Auth', 'Request Instructor Role', payload);
  return apiFetch<{ success: boolean; message: string }>('/me/instructor-upgrade', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
  },

async resolveInstructorRequest(payload: { requestId: string; action: 'approve' | 'reject'; rejectionReason?: string }): Promise<{ success: boolean; message: string }> {
  devLog('Auth', 'Resolve Instructor Request', payload);
  return apiFetch<{ success: boolean; message: string }>(`/admin/instructor-upgrade-requests/${payload.requestId}/${payload.action}`, {
          method: 'PATCH',
          body: JSON.stringify(payload.action === 'reject' ? { reason: payload.rejectionReason } : {})
        });
  },

async requestLeaveInstructorRole(payload: { userId: string; fullName: string; email: string; reason: string }): Promise<{ success: boolean; message: string }> {
  devLog('Auth', 'Request Leave Instructor Role', payload);
  return apiFetch<{ success: boolean; message: string }>('/roles/request-leave-instructor', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
  },

async toggleUserLockAdmin(userId: string, action: 'lock' | 'unlock'): Promise<{ success: boolean; message: string; status: string }> {
      // BACKEND_MISSING
    devLog('Admin', `Toggle user lock: ${action}`, { userId });
    return apiFetch<{ success: boolean; message: string; status: string }>(`/admin/users/${userId}/lock`, {
              method: 'POST',
              body: JSON.stringify({ action })
            });
  },

  async getAdminCategories(params: Record<string, any> = {}): Promise<any> {
    devLog('AdminCategories', 'Fetch list of categories', params);
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const queryStr = query.toString();
    return apiFetch<any>(`/admin/categories${queryStr ? '?' + queryStr : ''}`);
  },

  async getAdminCategory(id: number | string): Promise<any> {
    devLog('AdminCategories', `Fetch detail of category ID: ${id}`);
    return apiFetch<any>(`/admin/categories/${id}`);
  },

  async createAdminCategory(payload: any): Promise<any> {
    devLog('AdminCategories', 'Create category', payload);
    return apiFetch<any>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateAdminCategory(id: number | string, payload: any): Promise<any> {
    devLog('AdminCategories', `Update category ID: ${id}`, payload);
    return apiFetch<any>(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteAdminCategory(id: number | string): Promise<any> {
    devLog('AdminCategories', `Delete category ID: ${id}`);
    return apiFetch<any>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },

  async restoreAdminCategory(id: number | string): Promise<any> {
    devLog('AdminCategories', `Restore category ID: ${id}`);
    return apiFetch<any>(`/admin/categories/${id}/restore`, {
      method: 'POST',
    });
  },

  async reorderAdminCategories(items: Array<{ id: number; sort_order: number; parent_id: number | null }>): Promise<any> {
    devLog('AdminCategories', 'Reorder categories list', items);
    return apiFetch<any>('/admin/categories/reorder', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },

  async getDashboardOverview(params: Record<string, any> = {}): Promise<any> {
    devLog('AdminDashboard', 'Fetch dashboard overview', params);
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const queryStr = query.toString();
    return apiFetch<any>(`/admin/dashboard${queryStr ? '?' + queryStr : ''}`);
  },

  async getRevenueReport(params: Record<string, any> = {}): Promise<any> {
    devLog('AdminDashboard', 'Fetch revenue report', params);
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const queryStr = query.toString();
    return apiFetch<any>(`/admin/reports/revenue${queryStr ? '?' + queryStr : ''}`);
  },

  async getTopCoursesReport(params: Record<string, any> = {}): Promise<any> {
    devLog('AdminDashboard', 'Fetch top courses report', params);
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const queryStr = query.toString();
    return apiFetch<any>(`/admin/reports/top-courses${queryStr ? '?' + queryStr : ''}`);
  },

  async getTopInstructorsReport(params: Record<string, any> = {}): Promise<any> {
    devLog('AdminDashboard', 'Fetch top instructors report', params);
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const queryStr = query.toString();
    return apiFetch<any>(`/admin/reports/instructors${queryStr ? '?' + queryStr : ''}`);
  }
};
