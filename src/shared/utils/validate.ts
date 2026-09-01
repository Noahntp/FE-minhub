import { ApiError } from '@/shared/lib/api-client';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(0|\+84)[1-9][0-9]{8}$/;

export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') return 'Email không được để trống.';
  if (!EMAIL_REGEX.test(email)) return 'Email không đúng định dạng.';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password || password.trim() === '') return 'Mật khẩu không được để trống.';
  if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone || phone.trim() === '') return 'Số điện thoại không được để trống.';
  if (!PHONE_REGEX.test(phone)) return 'Số điện thoại không hợp lệ (VD: 0912345678).';
  return null;
};

/**
 * Mảng lỗi trả về từ API dạng { errors: { email: ["..."], name: ["..."] } } 
 * sẽ được bóc tách ra Record<string, string> cho frontend form error.
 */
export const extractApiErrors = (err: any): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  
  if (err instanceof ApiError && err.errors) {
    Object.keys(err.errors).forEach((key) => {
      const msgs = err.errors[key];
      if (Array.isArray(msgs) && msgs.length > 0) {
        fieldErrors[key] = msgs[0];
      } else if (typeof msgs === 'string') {
        fieldErrors[key] = msgs;
      }
    });
  }
  
  return fieldErrors;
};
