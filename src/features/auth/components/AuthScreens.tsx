import { ApiError } from "@/shared/lib/api-client";
import React, { useState, useRef, useEffect } from 'react';
import { Database, User, Shield, Lock, Mail, Phone, Eye, EyeOff, UserPlus, LogIn, Key, Compass, AlertCircle, Coffee, Check, Users, Award, Globe, X, Briefcase, GraduationCap, FileText, ChevronDown } from 'lucide-react';
import { User as UserType, normalizeUser } from '@/shared/types';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { SYSTEM_ROLE_USERS } from '@/shared/data';
import { authApi } from '@/features/auth/api';
import { getDashboardRouteByRole } from '@/router/routes';
import { validateEmail, validatePassword, validatePhone, extractApiErrors } from '@/shared/utils/validate';

const DB_SEED_ACCOUNTS = [
  { id: 'db-1', name: 'Student Test', email: 'learner1@mindhub.test', password: '12345678', role: 'student', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', description: 'Học viên' },
  { id: 'db-2', name: 'Instructor Test', email: 'instructor1@mindhub.test', password: '12345678', role: 'instructor', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150', description: 'Giảng viên' },
  { id: 'db-3', name: 'Admin Test', email: 'admin@mindhub.test', password: '12345678', role: 'admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', description: 'Quản trị viên' },
];

interface AuthScreensProps {
  onLoginSuccess: (user: UserType) => void;
  onClose: () => void; // mapped to navigateTo('home')
  initialMode?: 'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password';
  initialRole?: 'student' | 'instructor';
  initialEmail?: string;
  initialToken?: string;
  initialSuccessMsg?: string;
  initialErrorMsg?: string;
  navigateTo?: (path: string) => void;
}

export default function AuthScreens({ onLoginSuccess, onClose, initialMode = 'login', initialRole = 'student', initialEmail = '', initialToken = '', initialSuccessMsg = '', initialErrorMsg = '', navigateTo }: AuthScreensProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password'>(initialMode);
  
  React.useEffect(() => {
    setMode(initialMode);
    if (initialRole) setRegisterRole(initialRole);
    if (initialEmail) setEmail(initialEmail);
    if (initialToken) setResetToken(initialToken);
  }, [initialMode, initialRole, initialEmail, initialToken]);

  // Wrapper for setMode to also update URL if navigateTo is provided
  const handleModeChange = (newMode: 'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password') => {
    setMode(newMode);
    if (navigateTo) {
      if (newMode === 'reset-password') {
        const params = new URLSearchParams();
        if (email) params.set('email', email.trim());
        const tokenToUse = resetToken || verificationCode;
        if (tokenToUse) params.set('token', tokenToUse);
        const queryStr = params.toString();
        navigateTo(queryStr ? `reset-password?${queryStr}` : 'reset-password');
      } else {
        navigateTo(newMode);
      }
    }
  };

  const [rightPanelTab, setRightPanelTab] = useState<'seed' | 'recent'>('seed');
  const [showDevTools, setShowDevTools] = useState(false);
  
  // Form fields
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState(() => initialEmail || localStorage.getItem('mindhub_pending_verify_email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState(initialToken);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState(initialErrorMsg || '');
  const [successMsg, setSuccessMsg] = useState(initialSuccessMsg || '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Instructor specific registration fields
  const [registerRole, setRegisterRole] = useState<'student' | 'instructor'>(initialRole);
  const [phone, setPhone] = useState(() => localStorage.getItem('mindhub_pending_verify_phone') || '');
  const [instructorSpecialty, setInstructorSpecialty] = useState('Development');
  const [instructorBio, setInstructorBio] = useState('');
  const [instructorExperience, setInstructorExperience] = useState('');
  const [isEditingContact, setIsEditingContact] = useState(false);

  // OTP Channel & Resend countdown states
  const [otpChannel, setOtpChannel] = useState<'email' | 'sms'>('email');
  const [resendCountdown, setResendCountdown] = useState<number>(60);

  // Countdown timer for resending OTP (60s)
  useEffect(() => {
    let interval: any = null;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCountdown]);

  // Cuộn thông minh đến ô nhập liệu bị lỗi đầu tiên
  const scrollToFirstError = (errors: Record<string, string>) => {
    setTimeout(() => {
      const fieldToIdMap: Record<string, string> = {
        name: 'register-input-name',
        email: 'register-input-email',
        password: 'register-input-password',
        confirmPassword: 'register-input-confirm-password',
        phone: 'register-input-phone',
        bio: 'register-input-bio',
      };

      const keys = ['name', 'email', 'password', 'confirmPassword', 'phone', 'bio'];
      for (const k of keys) {
        if (errors[k]) {
          const el = document.getElementById(fieldToIdMap[k]);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
            return;
          }
        }
      }

      // Nếu là lỗi chung hoặc không match trường cụ thể -> Cuộn đến thông báo lỗi
      const banner = document.getElementById('auth-error-banner');
      if (banner) {
        banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (formContainerRef.current) {
        formContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  // Local database of registered users with email verification states
  const [localRegisteredUsers, setLocalRegisteredUsers] = useState<UserType[]>(() => {
    const stored = localStorage.getItem('mindhub_registered_users_db');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Lỗi phân tích cú pháp CSDL tài khoản:', e);
      }
    }
    // Seed standard verified users by default
    const seeded: UserType[] = [
      { ...SYSTEM_ROLE_USERS.student, isEmailVerified: true },
      { ...SYSTEM_ROLE_USERS.instructor, isEmailVerified: true },
      { ...SYSTEM_ROLE_USERS.admin, isEmailVerified: true }
    ];
    // Attach default password to the seeded objects for smooth logic
    seeded.forEach((u: any) => { u.password = 'password123'; });
    localStorage.setItem('mindhub_registered_users_db', JSON.stringify(seeded));
    return seeded;
  });

  const saveRegisteredUsers = (updatedList: UserType[]) => {
    setLocalRegisteredUsers(updatedList);
    localStorage.setItem('mindhub_registered_users_db', JSON.stringify(updatedList));
  };

  // Load / Prepopulate logged-in accounts history on this device (localStorage)
  const [loginHistory, setLoginHistory] = useState<UserType[]>(() => {
    const stored = localStorage.getItem('mindhub_logged_in_history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Lỗi phân tích cú pháp lịch sử đăng nhập:', e);
      }
    }
    // Pre-create/populate standard accounts of each role on this device as requested
    const defaultHistory = [
      { ...SYSTEM_ROLE_USERS.student, isEmailVerified: true, password: 'password123' },
      { ...SYSTEM_ROLE_USERS.instructor, isEmailVerified: true, password: 'password123' },
      { ...SYSTEM_ROLE_USERS.admin, isEmailVerified: true, password: 'password123' }
    ] as any[];
    localStorage.setItem('mindhub_logged_in_history', JSON.stringify(defaultHistory));
    return defaultHistory;
  });

  // Save successful logins to device history
  const saveToHistory = (user: UserType) => {
    setLoginHistory(prev => {
      const base = prev.filter(u => u.email !== user.email && u.id !== user.id);
      const updated = [user, ...base];
      localStorage.setItem('mindhub_logged_in_history', JSON.stringify(updated));
      return updated;
    });
  };

  const mapAuthError = (err: any) => {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return 'Email hoặc mật khẩu không chính xác.';
      } else if (err.status === 403) {
        return err.message || 'Tài khoản chưa được xác thực email. Vui lòng kiểm tra email để kích hoạt.';
      } else if (err.status === 422) {
        const firstErr = err.errors ? Object.values(err.errors)[0] : null;
        return Array.isArray(firstErr) ? firstErr[0] : (err.message || 'Dữ liệu đăng nhập không hợp lệ.');
      } else if (err.status === 429) {
        return 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.';
      } else if (err.status === 500) {
        return 'Máy chủ đang gặp lỗi. Vui lòng thử lại sau.';
      }
      return err.message || 'Có lỗi xảy ra, vui lòng thử lại.';
    }
    return err.message || 'Không thể kết nối đến máy chủ Backend.';
  };

  // Perform standard login simulator with structural email verification block
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    let hasError = false;
    const newFieldErrors: Record<string, string> = {};

    const emailErr = validateEmail(email);
    if (emailErr) {
      newFieldErrors.email = emailErr;
      hasError = true;
    }
    const passErr = validatePassword(password);
    if (passErr) {
      newFieldErrors.password = passErr;
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      setErrorMsg('Vui lòng kiểm tra lại các trường không hợp lệ.');
      return;
    }
    
    const emailTrimmed = email.trim().toLowerCase();
    
    setIsSubmitting(true);
    setSuccessMsg('Đang đăng nhập...');
    setErrorMsg('');
    authApi.login({ email: emailTrimmed, password })
      .then(res => {
        const rawUser = res.user || res;
        const apiUser = normalizeUser({
          ...rawUser,
          isEmailVerified: true
        });
        saveToHistory(apiUser);
        onLoginSuccess(apiUser);
        if (navigateTo) {
          navigateTo(getDashboardRouteByRole(apiUser.role));
        } else {
          onClose();
        }
      })
      .catch(err => {
        setIsSubmitting(false);
        setSuccessMsg('');
        const extracted = extractApiErrors(err);
        if (Object.keys(extracted).length > 0) {
          setFieldErrors(extracted);
          setErrorMsg('Dữ liệu đăng nhập không hợp lệ.');
        } else {
          setErrorMsg(mapAuthError(err));
        }
      });
  };

  const handleHistoryClick = (userObj: UserType) => {
    saveToHistory(userObj);
    onLoginSuccess(userObj);
    onClose();
    if (navigateTo) {
      navigateTo(getDashboardRouteByRole(userObj.role));
    }
  };

  const handleSeedClick = (seed: typeof DB_SEED_ACCOUNTS[0]) => {
    setEmail(seed.email);
    setPassword(seed.password);
    setErrorMsg('');
    setSuccessMsg(`Đã điền tài khoản mẫu: ${seed.email}. Đang kết nối xác thực...`);
    
    authApi.login({ email: seed.email, password: seed.password })
      .then(res => {
        const apiUser = normalizeUser({
          ...res.user,
          isEmailVerified: true
        });
        saveToHistory(apiUser);
        onLoginSuccess(apiUser);
        if (navigateTo) {
          navigateTo(getDashboardRouteByRole(apiUser.role));
        } else {
          onClose();
        }
      })
      .catch(err => {
        setSuccessMsg('');
        setErrorMsg(mapAuthError(err));
      });
  };

  // Perform quick account login by populating form and executing API login
  const handleQuickLogin = (role: 'student' | 'instructor' | 'admin') => {
    const matchedSeed = DB_SEED_ACCOUNTS.find(s => s.role === role);
    if (matchedSeed) {
      handleSeedClick(matchedSeed);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFieldErrors({});
    let hasError = false;
    const newFieldErrors: Record<string, string> = {};

    if (!name || name.trim().length < 2) {
      newFieldErrors.name = 'Họ và tên phải có ít nhất 2 ký tự.';
      hasError = true;
    }
    const emailErr = validateEmail(email);
    if (emailErr) {
      newFieldErrors.email = emailErr;
      hasError = true;
    }
    const passErr = validatePassword(password);
    if (passErr) {
      newFieldErrors.password = passErr;
      hasError = true;
    }
    if (password !== confirmPassword) {
      newFieldErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp.';
      hasError = true;
    }
    if (registerRole === 'instructor') {
      const phoneErr = validatePhone(phone);
      if (phoneErr) {
        newFieldErrors.phone = phoneErr;
        hasError = true;
      }
      if (instructorBio && instructorBio.trim().length > 0 && instructorBio.trim().length < 30) {
        newFieldErrors.bio = 'Tiểu sử giới thiệu bản thân cần ít nhất 30 ký tự để Admin xét duyệt.';
        hasError = true;
      }
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      setErrorMsg('Vui lòng kiểm tra lại các trường thông tin không hợp lệ.');
      scrollToFirstError(newFieldErrors);
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('Bạn cần đồng ý với các điều khoản và chính sách sử dụng để tiếp tục.');
      const agreeEl = document.getElementById('agree');
      if (agreeEl) {
        agreeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        agreeEl.focus();
      }
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();

    let expYears: number | undefined = undefined;
    if (registerRole === 'instructor' && instructorExperience.trim() !== '') {
      const parsed = parseInt(instructorExperience.trim(), 10);
      if (!isNaN(parsed) && parsed >= 0) {
        expYears = parsed;
      }
    }

    setIsSubmitting(true);
    setSuccessMsg('Đang đăng ký tài khoản và gửi mã OTP xác thực...');
    authApi.register({ 
      full_name: name.trim(), 
      email: emailTrimmed, 
      phone: phone.trim() || undefined,
      password,
      password_confirmation: confirmPassword,
      role: registerRole,
      expertise: registerRole === 'instructor' ? instructorSpecialty : undefined,
      bio: registerRole === 'instructor' ? instructorBio : undefined,
      experience_years: registerRole === 'instructor' ? expYears : undefined
    })
      .then((res: any) => {
        setIsSubmitting(false);
        try {
          localStorage.removeItem('mindhub_user_notifications');
          localStorage.removeItem('mindhub_purchased_courses_data');
          localStorage.removeItem('mindhub_enrolled_courses');
          localStorage.setItem('mindhub_pending_verify_email', emailTrimmed);
          if (phone.trim()) {
            localStorage.setItem('mindhub_pending_verify_phone', phone.trim());
          }
        } catch (e) {}
        setPassword('');
        setConfirmPassword('');
        setErrorMsg('');
        if (res?.verify_url) {
          setVerifyUrl(res.verify_url);
        }
        if (res?.otp_code) {
          setVerificationCode(res.otp_code);
        }
        setResendCountdown(60);
        setOtpChannel('email');
        setSuccessMsg(
          'Đăng ký tài khoản thành công! Mã OTP xác thực 6 chữ số đã được gửi tới email ' + emailTrimmed + '.'
        );
        handleModeChange('verify-email');
      })
      .catch(err => {
        setIsSubmitting(false);
        setSuccessMsg('');
        const extracted = extractApiErrors(err);
        if (Object.keys(extracted).length > 0) {
          setFieldErrors(extracted);
          setErrorMsg('Dữ liệu đăng ký không hợp lệ.');
          scrollToFirstError(extracted);
        } else {
          const mapped = mapAuthError(err);
          setErrorMsg(mapped);
          const fallbackErrors: Record<string, string> = {};
          if (mapped.toLowerCase().includes('email')) {
            fallbackErrors.email = mapped;
          } else if (mapped.toLowerCase().includes('số điện thoại') || mapped.toLowerCase().includes('phone')) {
            fallbackErrors.phone = mapped;
          }
          scrollToFirstError(fallbackErrors);
        }
      });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const activeIdentifier = otpChannel === 'sms' ? phone.trim() : email.trim();
    if (!activeIdentifier) {
      setErrorMsg(
        otpChannel === 'sms'
          ? 'Vui lòng cung cấp số điện thoại đã đăng ký để xác thực OTP.'
          : 'Vui lòng cung cấp địa chỉ email đã đăng ký để xác thực OTP.'
      );
      setIsEditingContact(true);
      return;
    }

    if (!verificationCode || verificationCode.trim().length < 6) {
      setErrorMsg('Vui lòng nhập đầy đủ mã OTP xác thực 6 chữ số.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('Đang kích hoạt tài khoản trong hệ thống...');

    authApi.verifyOtp({ 
      email: email.trim().toLowerCase() || undefined, 
      phone: phone.trim() || undefined,
      otp: verificationCode.trim() 
    })
      .then(() => {
        setIsSubmitting(false);
        try {
          localStorage.removeItem('mindhub_pending_verify_email');
          localStorage.removeItem('mindhub_pending_verify_phone');
        } catch (e) {}
        setSuccessMsg(
          otpChannel === 'sms'
            ? 'Xác thực tài khoản qua Số điện thoại thành công! Đang chuyển tới Đăng nhập...'
            : 'Xác thực tài khoản qua Email thành công! Đang chuyển tới Đăng nhập...'
        );
        setTimeout(() => {
          handleModeChange('login');
        }, 1000);
      })
      .catch((err: any) => {
        setIsSubmitting(false);
        setErrorMsg(err?.message || 'Mã OTP xác thực không chính xác hoặc đã hết hạn.');
      });
  };

  const handleResendVerifyOtp = async (overrideChannel?: 'email' | 'sms') => {
    const channelToUse = overrideChannel || otpChannel;
    const activeIdentifier = channelToUse === 'sms' ? phone.trim() : email.trim();
    
    if (channelToUse === 'sms' && !phone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại trước khi gửi mã OTP qua SMS.');
      setIsEditingContact(true);
      return;
    }
    if (channelToUse === 'email' && !email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email trước khi gửi mã OTP.');
      setIsEditingContact(true);
      return;
    }
    if (resendCountdown > 0) {
      return;
    }

    setResendingEmail(true);
    setErrorMsg('');
    setSuccessMsg(channelToUse === 'sms' ? 'Đang gửi mã OTP qua tin nhắn SMS...' : 'Đang gửi mã OTP qua email...');
    try {
      const res = await authApi.resendVerifyOtp({
        email: email.trim().toLowerCase() || undefined,
        phone: phone.trim() || undefined,
        channel: channelToUse,
      });
      if (res?.otp_code) {
        setVerificationCode(res.otp_code);
      }
      setResendCountdown(60);
      if (overrideChannel) {
        setOtpChannel(overrideChannel);
      }
      setSuccessMsg(
        channelToUse === 'sms'
          ? `Mã OTP mới đã được gửi tới số điện thoại ${phone.trim()} qua tin nhắn SMS!`
          : `Mã OTP mới đã được gửi tới email ${email.trim()}! Vui lòng kiểm tra hộp thư của bạn.`
      );
    } catch (err: any) {
      setSuccessMsg('');
      setErrorMsg(err.message || 'Không thể gửi lại mã OTP xác thực.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed) {
      setErrorMsg('Vui lòng điền email của bạn.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('Đang gửi yêu cầu khôi phục mật khẩu...');
    authApi.requestPasswordReset(emailTrimmed)
      .then((res: any) => {
        setIsSubmitting(false);
        if (res?.reset_token) {
          setResetToken(res.reset_token);
          setVerificationCode(res.reset_token);
        }
        setSuccessMsg('Mã OTP khôi phục 6 số đã được gửi tới email của bạn (bao gồm cả thư rác / Spam). Vui lòng nhập mã OTP và đặt lại mật khẩu mới.');
        handleModeChange('reset-password');
      })
      .catch(err => {
        setIsSubmitting(false);
        setSuccessMsg('');
        setErrorMsg(mapAuthError(err));
      });
  };

  const handleResendVerifyEmail = async () => {
    if (!email) {
      setErrorMsg('Vui lòng nhập email của bạn trước khi gửi lại.');
      return;
    }
    setResendingEmail(true);
    setErrorMsg('');
    setSuccessMsg('Đang gửi lại email xác thực...');
    try {
      await authApi.resendVerificationEmail(email.trim().toLowerCase());
      setSuccessMsg('Đã gửi lại email xác thực thành công! Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư rác / Spam).');
    } catch (err: any) {
      setSuccessMsg('');
      setErrorMsg(err.message || 'Không thể gửi lại email xác thực.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    const tokenToUse = resetToken || verificationCode;
    
    if (!emailTrimmed) {
      setErrorMsg('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    if (!tokenToUse) {
      setErrorMsg('Vui lòng cung cấp mã Token / OTP đặt lại mật khẩu.');
      return;
    }

    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không trùng khớp với mật khẩu mới.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('Đang cập nhật mật khẩu mới...');

    authApi.resetPassword({
      email: emailTrimmed,
      token: tokenToUse,
      password,
      password_confirmation: confirmPassword
    })
      .then(() => {
        setIsSubmitting(false);
        setPassword('');
        setConfirmPassword('');
        setResetToken('');
        setVerificationCode('');
        setSuccessMsg('Đặt lại mật khẩu thành công! Đang chuyển sang màn hình đăng nhập...');
        setTimeout(() => {
          handleModeChange('login');
        }, 1500);
      })
      .catch(err => {
        setIsSubmitting(false);
        setSuccessMsg('');
        setErrorMsg(mapAuthError(err));
      });
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setErrorMsg('');
    setSuccessMsg('Đang kết nối Google OAuth 2.0...');
    authApi.getGoogleRedirectUrl()
      .then(url => {
        if (url) {
          window.location.assign(url);
        } else {
          setGoogleLoading(false);
          setSuccessMsg('');
          setErrorMsg('Đăng nhập Google chưa được cấu hình trên máy chủ.');
        }
      })
      .catch(err => {
        setGoogleLoading(false);
        setSuccessMsg('');
        if (err instanceof ApiError && err.status === 503) {
          setErrorMsg('Đăng nhập Google chưa được cấu hình trên máy chủ.');
        } else {
          setErrorMsg(err.message || 'Không thể kết nối đến Google OAuth 2.0.');
        }
      });
  };

  const handleGoogleRegister = handleGoogleLogin;

  return (
    <div className="min-h-[85vh] bg-stone-50 flex items-center justify-center p-4">
      <div 
        id="auth-container" 
        className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-brand-light-active overflow-hidden flex flex-col text-main-darker animate-fade-in"
      >
        {/* Banner with Brand Theme */}
        <div className="bg-gradient-to-r from-[#061913] via-[#082a20] to-[#04120d] p-4 sm:p-5 text-white flex items-center justify-between border-b-4 border-emerald-500 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">MindHub Academic Portal</h2>
              <p className="text-[10px] text-emerald-400/90 font-semibold uppercase tracking-wider">Học thuật và Quản trị tri thức</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-xs font-bold text-white/90 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Về trang chủ <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Container with Custom Scrolls */}
        <div ref={formContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 tactile-scrollbar space-y-4">
          
          {errorMsg && (
            <div id="auth-error-banner" className="p-3 bg-red-50 text-red-700 rounded-lg flex flex-col gap-2 text-xs border border-red-100 animate-slide-up">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-left">{errorMsg}</span>
              </div>
              {errorMsg.toLowerCase().includes('xác thực') && (
                <button
                  type="button"
                  onClick={handleResendVerifyEmail}
                  disabled={resendingEmail}
                  className="self-start ml-6 text-xs font-bold text-red-800 underline hover:text-red-950 cursor-pointer disabled:opacity-50"
                >
                  {resendingEmail ? 'Đang gửi lại...' : 'Gửi lại email xác thực'}
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-start gap-2 text-xs border border-emerald-100 animate-slide-up">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="text-left">{successMsg}</span>
            </div>
          )}

          {verifyUrl && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-1.5 text-xs text-amber-900 animate-slide-up">
              <span className="font-bold flex items-center gap-1">💡 Liên kết xác thực email (Dev Mode):</span>
              <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] underline break-all bg-amber-100 p-1.5 rounded text-amber-950">
                {verifyUrl}
              </a>
            </div>
          )}


              {/* LOGIN MODE */}
              {mode === 'login' && (
            <div>
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <h3 className="text-base font-bold text-stone-850 flex items-center gap-1.5 border-b pb-2 mb-3">
                    Đăng Nhập Thành Viên
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-605 mb-1">Địa chỉ Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({...prev, email: ''})) }}
                        placeholder="VD: student@gmail.com..."
                        className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:ring-1 focus:outline-none bg-stone-50/50 ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-stone-250 focus:ring-brand-normal'}`}
                        required
                      />
                    </div>
                    {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 font-medium">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-semibold text-stone-605">Mật khẩu</label>
                      <button 
                        type="button" 
                        onClick={() => handleModeChange('forgot-password')} 
                        className="text-xs text-brand-normal hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({...prev, password: ''})) }}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-9 py-2 border rounded-xl text-xs focus:ring-1 focus:outline-none bg-stone-50/50 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-stone-250 focus:ring-brand-normal'}`}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-red-500 text-[10px] mt-1 font-medium">{fieldErrors.password}</p>}
                  </div>
                </div>

                <button 
                  id="btn-login-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex justify-center items-center gap-2 shadow ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" /> Truy cập Hệ thống
                    </>
                  )}
                </button>

                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 h-px bg-stone-200 flex items-center"></div>
                  <span className="relative bg-white px-2.5 text-[10px] text-stone-400 font-mono">HOẶC DÙNG GOOGLE</span>
                </div>

                <button 
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleLogin}
                  className={`w-full border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 ${googleLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {googleLoading ? (
                    <div className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.74 14.89 1 12 1 7.35 1 3.39 3.65 1.45 7.5l3.6 2.79C6.01 7.23 8.79 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.63 2.81c2.13-1.97 3.78-4.87 3.78-8.49z" />
                      <path fill="#FBBC05" d="M5.05 10.29c-.24-.73-.38-1.5-.38-2.29s.14-1.56.38-2.29L1.45 2.92C.53 4.75 0 6.81 0 9s.53 4.25 1.45 6.08l3.6-2.79z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.63-2.81c-1.1.74-2.51 1.18-4.33 1.18-3.21 0-5.99-2.19-6.95-5.25l-3.6 2.79C3.39 20.35 7.35 23 12 23z" />
                    </svg>
                  )}
                  {googleLoading ? 'Đang kết nối Google...' : 'Đăng nhập bằng tài khoản Google'}
                </button>

                <div className="text-center pt-1 border-t border-stone-100 mt-2">
                  <p className="text-xs text-stone-500">
                    Bạn mới biết đến MindHub?{' '}
                    <button type="button" onClick={() => handleModeChange('register')} className="text-[#8b5e3c] font-bold hover:underline">
                      Đăng ký thành viên
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* REGISTER MODE - Optimized as an Elegant 2-Column form on wider screens */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-left">
              <div>
                <h3 className="text-base font-bold text-stone-850 flex items-center gap-1.5 border-b pb-2">
                  Đăng Ký Tài Khoản Mới
                </h3>
                <p className="text-[11px] text-stone-500 mt-1">Cơ hội trải nghiệm học tập đỉnh cao tại hòn đảo tri thức của chúng tôi.</p>
              </div>

              {/* Tab Selector for Student vs Instructor Registration */}
              <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setRegisterRole('student')}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                    registerRole === 'student'
                      ? 'bg-white text-[#432c28] shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  🎓 Đăng ký Học viên
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('instructor')}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                    registerRole === 'instructor'
                      ? 'bg-[#432c28] text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-[#432c28]'
                  }`}
                >
                  👨‍🏫 Đăng ký Giảng viên
                </button>
              </div>

              {registerRole === 'instructor' && (
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#8b5e3c]">Chế độ Đăng ký Đối tác Giảng dạy</span>
                  <p className="text-[11px] text-stone-500">Form này dành riêng cho các Thầy cô muốn phát triển và xuất bản học liệu trực tuyến trên MindHub.</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">
                    Họ và Tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      id="register-input-name"
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setFieldErrors(prev => ({...prev, name: ''})) }}
                      onBlur={() => {
                        if (!name || name.trim().length < 2) {
                          setFieldErrors(prev => ({...prev, name: 'Họ và tên phải có ít nhất 2 ký tự.'}));
                        }
                      }}
                      placeholder="VD: Nguyễn Văn A"
                      className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:ring-1 focus:outline-none ${fieldErrors.name ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-stone-250 focus:ring-brand-normal'}`}
                      required
                    />
                  </div>
                  {fieldErrors.name && <p className="text-red-500 text-[10px] mt-1 font-medium">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">
                    Địa chỉ Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      id="register-input-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({...prev, email: ''})) }}
                      onBlur={() => {
                        const err = validateEmail(email);
                        if (err) setFieldErrors(prev => ({...prev, email: err}));
                      }}
                      placeholder="VD: name@gmail.com"
                      className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:ring-1 focus:outline-none ${fieldErrors.email ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-stone-250 focus:ring-brand-normal'}`}
                      required
                    />
                  </div>
                  {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 font-medium">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">
                    Mật khẩu bảo mật (tối thiểu 8 ký tự) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      id="register-input-password"
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({...prev, password: ''})) }}
                      onBlur={() => {
                        const err = validatePassword(password);
                        if (err) setFieldErrors(prev => ({...prev, password: err}));
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:ring-1 focus:outline-none ${fieldErrors.password ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-stone-250 focus:ring-brand-normal'}`}
                      required
                    />
                  </div>
                  {fieldErrors.password && <p className="text-red-500 text-[10px] mt-1 font-medium">{fieldErrors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">
                    Nhập lại mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      id="register-input-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(prev => ({...prev, confirmPassword: ''})) }}
                      onBlur={() => {
                        if (password && confirmPassword && password !== confirmPassword) {
                          setFieldErrors(prev => ({...prev, confirmPassword: 'Mật khẩu xác nhận không trùng khớp.'}));
                        }
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:ring-1 focus:outline-none ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-stone-250 focus:ring-brand-normal'}`}
                      required
                    />
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 font-medium">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>

              {/* Instructor specialty & Bio form fields */}
              {registerRole === 'instructor' && (
                <div className="space-y-3.5 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 shadow-sm transition-all">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 pb-2 border-b border-emerald-200/60">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thông tin bổ sung Giảng viên</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Số điện thoại xác thực liên hệ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none z-10" />
                      <input 
                        id="register-input-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setFieldErrors(prev => ({...prev, phone: ''})) }}
                        onBlur={() => {
                          const err = validatePhone(phone);
                          if (err) setFieldErrors(prev => ({...prev, phone: err}));
                        }}
                        onKeyDown={(e) => {
                          if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="VD: 0987654321"
                        className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 bg-white transition-all shadow-none ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50' : 'border-stone-250 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                        required
                      />
                    </div>
                    {fieldErrors.phone && <p className="text-red-500 text-[10px] mt-1 font-medium">{fieldErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Lĩnh vực Giảng dạy chuyên môn
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none z-10" />
                      <select
                        value={instructorSpecialty}
                        onChange={(e) => setInstructorSpecialty(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 border border-stone-250 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-all appearance-none cursor-pointer"
                      >
                        <option value="Development">Phát triển phần mềm (Software Development)</option>
                        <option value="Design">Thiết kế & Sáng tạo (UI/UX, Graphic)</option>
                        <option value="Marketing">Truyền thông & Marketing Digital</option>
                        <option value="Artificial Intelligence">Trí tuệ nhân tạo (AI & Data Science)</option>
                        <option value="Business & Startup">Khởi nghiệp & Quản trị Kinh doanh</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none z-10" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Số năm kinh nghiệm giảng dạy
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none z-10" />
                      <input 
                        type="number"
                        min="0"
                        max="80"
                        value={instructorExperience}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, '');
                          if (onlyNums === '') {
                            setInstructorExperience('');
                          } else {
                            const val = parseInt(onlyNums, 10);
                            setInstructorExperience(val > 80 ? '80' : String(val));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="VD: 5 (nhập số năm)"
                        className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-all shadow-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tiểu sử tóm tắt (Giới thiệu bản thân)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none z-10" />
                      <textarea
                        id="register-input-bio"
                        value={instructorBio}
                        onChange={(e) => {
                          setInstructorBio(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, bio: '' }));
                        }}
                        placeholder="Hãy viết vài dòng giới thiệu năng lực chuyên môn và các dự án tiêu biểu của Thầy Cô..."
                        className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white h-20 resize-none transition-all shadow-none ${
                          fieldErrors.bio ? 'border-red-500 bg-red-50' : 'border-stone-250'
                        }`}
                      />
                    </div>
                    {fieldErrors.bio && (
                      <p className="text-red-500 text-[10px] mt-1 font-medium">{fieldErrors.bio}</p>
                    )}
                  </div>
                </div>
              )}

               <div className="flex items-start gap-2 bg-stone-50 p-3 rounded-xl border">
                <input 
                  type="checkbox"
                  id="agree"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 shadow-sm rounded border-stone-300 text-[#8b5e3c] focus:ring-[#8b5e3c] cursor-pointer"
                />
                <label htmlFor="agree" className="text-[11px] text-stone-600 leading-normal select-none">
                  Tôi đã đọc và hoàn toàn đồng ý tuân thủ với các{' '}
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-mindhub-legal', { detail: { tab: 'terms' } }))}
                    className="font-bold text-[#8b5e3c] underline hover:text-black cursor-pointer"
                  >
                    Điều khoản sử dụng
                  </button>
                  ,{' '}
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-mindhub-legal', { detail: { tab: 'privacy' } }))}
                    className="font-bold text-[#8b5e3c] underline hover:text-black cursor-pointer"
                  >
                    Chính sách bảo mật
                  </button>{' '}
                  và{' '}
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-mindhub-legal', { detail: { tab: 'refund' } }))}
                    className="font-bold text-[#8b5e3c] underline hover:text-black cursor-pointer"
                  >
                    Chính sách hoàn học phí
                  </button>{' '}
                  của nền tảng học tập MindHub.
                </label>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex justify-center items-center gap-2 shadow"
              >
                <UserPlus className="w-4 h-4" /> Đăng Ký Tài Khoản & Gửi OTP Xác Thực
              </button>

              <div className="relative my-2.5 flex items-center justify-center">
                <div className="absolute inset-0 h-px bg-stone-200 flex items-center"></div>
                <span className="relative bg-white px-2.5 text-[10px] text-stone-400 font-mono">HOẶC GHI DANH NHANH</span>
              </div>

              <button 
                type="button"
                onClick={handleGoogleRegister}
                className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.74 14.89 1 12 1 7.35 1 3.39 3.65 1.45 7.5l3.6 2.79C6.01 7.23 8.79 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.63 2.81c2.13-1.97 3.78-4.87 3.78-8.49z" />
                  <path fill="#FBBC05" d="M5.05 10.29c-.24-.73-.38-1.5-.38-2.29s.14-1.56.38-2.29L1.45 2.92C.53 4.75 0 6.81 0 9s.53 4.25 1.45 6.08l3.6-2.79z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.63-2.81c-1.1.74-2.51 1.18-4.33 1.18-3.21 0-5.99-2.19-6.95-5.25l-3.6 2.79C3.39 20.35 7.35 23 12 23z" />
                </svg>
                Đăng ký thành viên bằng tài khoản Google
              </button>

              <div className="text-center pt-2 border-t border-stone-105 mt-2">
                <p className="text-xs text-stone-505">
                  Đã có tài khoản thành viên?{' '}
                  <button type="button" onClick={() => handleModeChange('login')} className="text-[#8b5e3c] font-black hover:underline">
                    Quay về Đăng nhập
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* EMAIL & SMS OTP VERIFICATION MODE */}
          {mode === 'verify-email' && (
            <form onSubmit={handleVerify} className="space-y-4 text-center max-w-sm mx-auto py-4">
              {/* Channel Selector Tab ALWAYS visible */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpChannel('email');
                    setErrorMsg('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    otpChannel === 'email'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-4 h-4 text-emerald-600" /> Xác thực qua Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpChannel('sms');
                    setErrorMsg('');
                    if (!phone.trim()) {
                      setIsEditingContact(true);
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    otpChannel === 'sms'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Phone className="w-4 h-4 text-emerald-600" /> Nhập OTP qua SMS
                </button>
              </div>

              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                {otpChannel === 'sms' ? <Phone className="w-7 h-7" /> : <Mail className="w-7 h-7" />}
              </div>
              
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {otpChannel === 'sms' ? 'Xác thực OTP qua Số điện thoại (SMS)' : 'Xác thực OTP qua Email'}
                </h3>
                
                {/* Contact info or Edit form */}
                {otpChannel === 'sms' ? (
                  !phone.trim() || isEditingContact ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-slate-600">Vui lòng nhập số điện thoại để nhận mã xác thực SMS:</p>
                      <div className="flex gap-1.5 justify-center max-w-xs mx-auto">
                        <input
                          type="tel"
                          placeholder="Ví dụ: 0901234567"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            localStorage.setItem('mindhub_pending_verify_phone', e.target.value);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none bg-white font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!phone.trim()) {
                              setErrorMsg('Vui lòng nhập số điện thoại hợp lệ.');
                              return;
                            }
                            setIsEditingContact(false);
                            handleResendVerifyOtp('sms');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                        >
                          Gửi mã SMS
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Mã OTP bảo vệ 6 chữ số đã được gửi tới SĐT:
                      </p>
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold text-emerald-900 my-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{phone}</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingContact(true)}
                          className="text-emerald-700 hover:underline text-[11px] font-extrabold ml-1 cursor-pointer"
                        >
                          [Đổi SĐT]
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  !email.trim() || isEditingContact ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-slate-600">Vui lòng nhập email đăng ký của bạn để xác thực:</p>
                      <div className="flex gap-1.5 justify-center max-w-xs mx-auto">
                        <input
                          type="email"
                          placeholder="email@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            localStorage.setItem('mindhub_pending_verify_email', e.target.value);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none bg-white font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!email.trim()) {
                              setErrorMsg('Vui lòng nhập email hợp lệ.');
                              return;
                            }
                            setIsEditingContact(false);
                            handleResendVerifyOtp('email');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                        >
                          Gửi mã Email
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Mã OTP bảo vệ 6 chữ số đã được gửi tới email:
                      </p>
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold text-emerald-900 my-1">
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingContact(true)}
                          className="text-emerald-700 hover:underline text-[11px] font-extrabold ml-1 cursor-pointer"
                        >
                          [Đổi Email]
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="py-2 space-y-3">
                <div className="flex justify-center items-center gap-2 sm:gap-2.5 relative my-2">
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const digit = verificationCode[idx] || '';
                    const isCurrent = verificationCode.length === idx;
                    const isFilled = Boolean(digit);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          const inputEl = document.getElementById('otp-real-input');
                          if (inputEl) inputEl.focus();
                        }}
                        className={`w-11 h-13 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center text-xl sm:text-2xl font-mono font-black transition-all cursor-pointer select-none shadow-sm ${
                          isCurrent
                            ? 'border-emerald-600 ring-4 ring-emerald-500/20 bg-emerald-50/50 text-emerald-950 scale-105'
                            : isFilled
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-slate-50/50 text-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        {digit || <span className="text-slate-300 font-light text-sm">•</span>}
                      </div>
                    );
                  })}
                  <input 
                    id="otp-real-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    required
                  />
                </div>

                {verificationCode && (
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Mã OTP đang nhập: <b className="font-mono text-emerald-700 font-black tracking-widest">{verificationCode}</b>
                  </p>
                )}
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex justify-center items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Xác Thực và Kích Hoạt Tài Khoản
              </button>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleResendVerifyOtp()}
                  disabled={resendingEmail || resendCountdown > 0}
                  className={`font-bold transition-colors ${
                    resendCountdown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-emerald-700 hover:underline cursor-pointer'
                  }`}
                >
                  {resendingEmail
                    ? 'Đang gửi lại...'
                    : resendCountdown > 0
                    ? `Gửi lại sau (${resendCountdown}s)`
                    : 'Gửi lại mã OTP mới'}
                </button>

                <button 
                  type="button" 
                  onClick={() => handleModeChange('login')} 
                  className="text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
                >
                  Quay lại Đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgot} className="space-y-4 max-w-sm mx-auto text-left py-4">
              <h3 className="text-base font-bold text-stone-850">Nhận Mã Khôi Phục Mật Khẩu</h3>
              <p className="text-xs text-stone-500 leading-normal">
                Không sao cả! Hãy cung cấp địa chỉ email tài khoản của bạn. Hệ thống sẽ gửi liên kết hướng dẫn khôi phục mật khẩu.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Địa chỉ Email tài khoản</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: user@domain.com"
                    className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal focus:outline-none"
                    required
                  />
                </div>
              </div>

              {resetToken && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 text-left space-y-2">
                  <p className="font-semibold text-amber-900 flex items-center gap-1">
                    <span>💡</span> Token đặt lại mật khẩu đã sẵn sàng (Dev Mode):
                  </p>
                  <p className="font-mono text-[10px] break-all bg-amber-100 p-1.5 rounded border border-amber-200 text-amber-950">{resetToken}</p>
                  <button
                    type="button"
                    onClick={() => handleModeChange('reset-password')}
                    className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all shadow-sm"
                  >
                    Chuyển sang Đặt lại mật khẩu ngay →
                  </button>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Đặt Lại Mật Khẩu'}
              </button>

              <button 
                type="button" 
                onClick={() => handleModeChange('login')} 
                className="text-xs text-[#8b5e3c] font-semibold hover:underline block mx-auto pt-1.5"
              >
                Quay lại đăng nhập
              </button>
            </form>
          )}

          {/* RESET PASSWORD MODE */}
          {mode === 'reset-password' && (
            <form onSubmit={handleReset} className="space-y-4 max-w-sm mx-auto text-left py-4">
              <h3 className="text-base font-bold text-[#292524]">Cập nhật mật khẩu mới</h3>
              <p className="text-xs text-stone-500 leading-normal">
                Điền mật khẩu mới và nhập lại để xác nhận cho tài khoản <b>{email || 'của bạn'}</b>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: user@domain.com"
                    className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center justify-between">
                  <span>Mã OTP Khôi Phục (6 chữ số)</span>
                  {resetToken && (
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Đã tự điền OTP từ email
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                  <input 
                    type="text"
                    maxLength={6}
                    value={resetToken || verificationCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setResetToken(val);
                      setVerificationCode(val);
                    }}
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-2.5 border border-stone-250 rounded-xl text-sm font-mono font-bold tracking-widest text-center focus:ring-1 focus:ring-brand-normal bg-stone-50"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Mật khẩu mới (tối thiểu 8 ký tự)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu từ 8 ký tự..."
                    className="w-full pl-9 pr-10 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal font-mono"
                    required
                    minLength={8}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal font-mono"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận thay đổi mật khẩu'}
              </button>

              <button 
                type="button" 
                onClick={() => handleModeChange('forgot-password')} 
                className="text-xs text-[#8b5e3c] font-semibold hover:underline block mx-auto pt-1.5"
              >
                Quay lại bước gửi yêu cầu
              </button>
            </form>
          )}



        </div>

        {/* Modal footer controls */}
        <div className="bg-stone-50 border-t border-stone-200/80 p-4 shrink-0 flex justify-between items-center text-[10px] text-stone-400">
          <span className="flex items-center gap-1 font-mono"><Shield className="w-3 h-3 text-emerald-600" /> 2-FACTOR SECURED</span>
          <button type="button" onClick={onClose} className="text-[#8b5e3c] hover:text-black font-bold">
            Đóng cửa sổ [Esc]
          </button>
        </div>
      </div>
    </div>
  );
}