import { apiFetch, devLog, config, ApiError, setAuthToken } from '@/shared/lib/api-client';
import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';

export const authApi = {
async register(payload: any): Promise<{ user: User; token: string; verify_url?: string; otp_code?: string; note?: string }> {
    devLog('Auth', 'Register new user', { email: payload.email, role: payload.role });
    const endpoint = payload.role === 'instructor' ? '/auth/register/instructor' : '/auth/register/learner';
    
    const cleanPayload = { ...payload };
    if (cleanPayload.experience_years !== undefined && cleanPayload.experience_years !== null && cleanPayload.experience_years !== '') {
      const parsedExp = parseInt(String(cleanPayload.experience_years), 10);
      if (!isNaN(parsedExp) && parsedExp >= 0) {
        cleanPayload.experience_years = parsedExp;
      } else {
        delete cleanPayload.experience_years;
      }
    } else {
      delete cleanPayload.experience_years;
    }

    const res = await apiFetch<any>(endpoint, {
      method: 'POST',
      body: JSON.stringify(cleanPayload),
    });
    return {
      user: res.user,
      token: res.token || '',
      verify_url: res.verify_url,
      otp_code: res.otp_code,
      note: res.note
    };
  },

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
      setAuthToken(token);
    }
    return {
      user: res.user,
      token: token,
    };
  },

async getGoogleRedirectUrl(): Promise<string> {
    devLog('Auth', 'Get Google OAuth redirect authorization URL');
    const res = await apiFetch<{ url: string }>('/auth/google/redirect');
    return res.url;
  },

  async requestPasswordReset(email: string): Promise<any> {
    devLog('Auth', 'Request password reset', { email });
    return apiFetch<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyOtp(payload: { email: string; otp: string }): Promise<any> {
    devLog('Auth', 'Verify OTP email/phone code', payload);
    return apiFetch<any>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

async resetPassword(payload: any): Promise<any> {
    devLog('Auth', 'Reset password', { email: payload.email });
    return apiFetch<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

async logout(): Promise<{ success: boolean }> {
    devLog('Auth', 'Logout active session requests');
    try {
      await apiFetch<any>('/auth/logout', {
        method: 'POST',
      });
    } catch (e) {
      console.error('Backend logout failed, clearing locally', e);
    }
    setAuthToken(null);
    return { success: true };
  },

async getCurrentUser(): Promise<User> {
    devLog('Auth', 'Get currently authenticated user via session token');
    const res = await apiFetch<{ user: User }>('/auth/me');
    return res.user;
  },

async logoutAll(): Promise<{ success: boolean }> {
      // BACKEND_MISSING
    devLog('Auth', 'Terminate all active device sessions');
    const res = await apiFetch<{ success: boolean }>('/auth/logout-all', { method: 'POST' });
      setAuthToken(null);
      return res;
  },

async refreshToken(): Promise<{ token: string }> {
      // BACKEND_MISSING
    devLog('Auth', 'Request Token Refresh rotation');
    const res = await apiFetch<{ token: string }>('/auth/refresh', { method: 'POST' });
      setAuthToken(res.token);
      return res;
  },

async getSessions(): Promise<any[]> {
      // BACKEND_MISSING
    devLog('Auth', 'Fetch active browser sessions');
    return apiFetch<any[]>('/auth/sessions');
  },

async revokeSession(sessionId: string): Promise<{ success: boolean }> {
      // BACKEND_MISSING
    devLog('Auth', `Revoking specific session ID: ${sessionId}`);
    return apiFetch<{ success: boolean }>(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    devLog('Auth', 'Send password reset link to', { email });
    return authApi.requestPasswordReset(email);
  },

  async resendVerificationEmail(email: string, purpose: string = 'verify_email'): Promise<{ success: boolean; message: string }> {
    devLog('Auth', 'Resend email verification notification mail', { email, purpose });
    const res = await apiFetch<any>('/auth/verify-email/resend', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    });
    return {
      success: true,
      message: res.message || 'Đã gửi lại email xác thực thành công. Vui lòng kiểm tra hộp thư.',
    };
  },

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

async authWithGoogle(token: string): Promise<{ user: User; token: string }> {
    devLog('Auth', 'Google OAuth single-sign-on integration');
    const res = await apiFetch<{ user: User; token: string }>('/auth/google', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
    setAuthToken(res.token);
    return res;
  },

async changeMyPassword(payload: any): Promise<{ success: boolean; message: string }> {
  devLog('Profile', 'Submit credential security mutation request');
  return apiFetch<{ success: boolean; message: string }>('/users/me/password', {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

async sendOtpForContactChange(field: 'email' | 'phone', newValue: string): Promise<{ success: boolean; message: string }> {
      // BACKEND_MISSING
    devLog('Profile', `Gửi mã OTP để thay đổi ${field} thành ${newValue}`);
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'OTP đã được gửi' }), 1000));
  },

async verifyOtpContactChange(field: 'email' | 'phone', newValue: string, otp: string): Promise<{ success: boolean }> {
      // BACKEND_MISSING
    devLog('Profile', `Xác nhận OTP ${otp} cho ${field}: ${newValue}`);
    return new Promise((resolve, reject) => setTimeout(() => {
              if (otp === '123456') resolve({ success: true });
              else reject(new Error('Mã OTP không hợp lệ (Mã test là 123456)'));
            }, 1000));
  },

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

async sendInstructorPayoutAccountOtp(accountId: string | number, payload: any): Promise<any> {
    devLog('Instructor', 'Send payout account OTP', payload);
    const id = accountId ? accountId : 0;
    return apiFetch<any>(`/instructor/payout-accounts/${id}/send-change-otp`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

async requestInstructorEarlyWithdrawalOtp(payload: { amount: number; payout_account_id?: number | string }): Promise<any> {
    devLog('Instructor', 'Request early withdrawal OTP', payload);
    return apiFetch<any>('/instructor/early-withdrawals/request-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
