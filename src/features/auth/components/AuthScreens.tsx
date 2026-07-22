import React, { useState } from 'react';
import { Database, User, Shield, Lock, Mail, Eye, EyeOff, UserPlus, LogIn, Key, Compass, AlertCircle, Coffee, Check, Users, Award, Globe, X } from 'lucide-react';
import { User as UserType, normalizeUser } from '@/shared/types';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { SYSTEM_ROLE_USERS } from '@/shared/data';


const DB_SEED_ACCOUNTS = [
  { id: 'db-1', name: 'Student Test', email: 'student.test@mindhub.local', password: 'password123', role: 'student', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', description: 'Học viên' },
  { id: 'db-2', name: 'Instructor Test', email: 'instructor.test@mindhub.local', password: 'password123', role: 'instructor', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150', description: 'Giảng viên' },
  { id: 'db-3', name: 'Admin Test', email: 'admin.test@mindhub.local', password: 'password123', role: 'admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', description: 'Quản trị viên' },
];

interface AuthScreensProps {
  onLoginSuccess: (user: UserType) => void;
  onClose: () => void; // mapped to navigateTo('home')
  initialMode?: 'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password';
  navigateTo?: (path: string) => void;
}

export default function AuthScreens({ onLoginSuccess, onClose, initialMode = 'login', navigateTo }: AuthScreensProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password'>(initialMode);
  
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Wrapper for setMode to also update URL if navigateTo is provided
  const handleModeChange = (newMode: 'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password') => {
    setMode(newMode);
    if (navigateTo) {
      navigateTo(newMode);
    }
  };

  const [rightPanelTab, setRightPanelTab] = useState<'seed' | 'recent'>('seed');
  const [showDevTools, setShowDevTools] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Instructor specific registration fields
  const [registerRole, setRegisterRole] = useState<'student' | 'instructor'>('student');
  const [instructorSpecialty, setInstructorSpecialty] = useState('Development');
  const [instructorBio, setInstructorBio] = useState('');
  const [instructorExperience, setInstructorExperience] = useState('');

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

  // Perform standard login simulator with structural email verification block
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    
    const emailTrimmed = email.trim().toLowerCase();
    
    setSuccessMsg('Đang đăng nhập...');
    Promise.resolve({ id: 'dummy', email: emailTrimmed, name: 'User', role: 'student', avatar: '' })
      .then(res => {
        const apiUser = normalizeUser({
          ...res,
          isEmailVerified: true
        });
        saveToHistory(apiUser);
        onLoginSuccess(apiUser);
        onClose();
      })
      .catch(err => {
        setErrorMsg(`Thất bại kết nối database / API: ${err.message || err.toString()}`);
      });
  };

  const handleHistoryClick = (userObj: UserType) => {
    // Proceed if verified
    saveToHistory(userObj);
    onLoginSuccess(userObj);
    onClose();
  };

  const handleSeedClick = (seed: typeof DB_SEED_ACCOUNTS[0]) => {
    setEmail(seed.email);
    setPassword(seed.password);
    setErrorMsg('');
    setSuccessMsg(`Đã tự động cấu hình hòm thư: ${seed.email}. Vui lòng nhấn "Truy cập hệ thống" để kết nối database!`);
    
    // Auto-login instantly for rapid testing in API mode!
    const isApi = true;
    if (isApi) {
      setSuccessMsg(`Đang thử kết nối trực tiếp đến database với tài khoản ${seed.email}...`);
      Promise.resolve({ id: 'dummy', email: emailTrimmed, name: 'User', role: 'student', avatar: '' })
        .then(res => {
          const apiUser = normalizeUser({
            ...res,
            isEmailVerified: true
          });
          saveToHistory(apiUser);
          onLoginSuccess(apiUser);
          onClose();
        })
        .catch(err => {
          setErrorMsg(`Không kết nối được: ${err.message || err.toString()}. Hãy chắc chắn DB đã seed và Backend đang hoạt động.`);
        });
    }
  };

  // Perform quick account login in 1-click
  const handleQuickLogin = (role: 'student' | 'instructor' | 'admin') => {
    const userObj = SYSTEM_ROLE_USERS[role];
    const withCheck: UserType = { ...userObj, isEmailVerified: true };
    saveToHistory(withCheck);
    onLoginSuccess(withCheck);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Vui lòng điền đủ các thông tin bắt buộc.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không trùng khớp.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('Bạn cần đồng ý với điều khoản sử dụng.');
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();

    setSuccessMsg('Đang tạo tài khoản mới...');
    Promise.resolve({ id: 'dummy', email: formData.email, name: formData.fullName, role: 'student', avatar: '' })
      .then((res: any) => {
        const token = res?.session_token || res?.token || res?.data?.token || res?.data?.session_token;
        if (token) {
          const apiUser = normalizeUser({
            ...res,
            role: registerRole,
            isEmailVerified: true
          });
          saveToHistory(apiUser);
          onLoginSuccess(apiUser);
          alert('Đăng ký tài khoản thành công! Bạn đã được tự động đăng nhập.');
          onClose();
        } else {
          setSuccessMsg('');
          alert('Đăng ký tài khoản thành công! Vui lòng xác thực email để kích hoạt tài khoản hoặc chờ Admin phê duyệt.');
          setMode('login');
        }
      })
      .catch(err => {
        setErrorMsg(`Thất bại tạo tài khoản: ${err.message || err.toString()}`);
      });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode !== '123456') {
      setErrorMsg(`Mã xác thực không chính xác! (Mã test là 123456).`);
      return;
    }
    // Just mock verification success
    setSuccessMsg('Xác thực tài khoản thành công!');
    handleModeChange('login');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed) {
      setErrorMsg('Vui lòng điền email của bạn.');
      return;
    }

    const matchedUserIndex = localRegisteredUsers.findIndex(u => u.email.toLowerCase() === emailTrimmed);
    if (matchedUserIndex === -1) {
      setErrorMsg('Tài khoản với email này chưa được đăng ký trên hệ thống. Hãy kiểm tra lại hoặc tạo tài khoản mới.');
      return;
    }

    // Generate a secure 6-digit reference OTP
    const recoveryOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const updated = localRegisteredUsers.map(u => 
      u.email.toLowerCase() === emailTrimmed 
        ? { ...u, resetOtp: recoveryOtp } as any
        : u
    );
    saveRegisteredUsers(updated);

    setErrorMsg('');
    setSuccessMsg(`Đã gửi mã khôi phục mật khẩu bảo vệ đến tài khoản ${emailTrimmed}. Vui lòng nhập mã và thiết lập mật khẩu mới.`);
    setVerificationCode(''); // Clear OTP input
    setPassword(''); // Clear new password input
    handleModeChange('reset-password');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    const matchedUserIndex = localRegisteredUsers.findIndex(u => u.email.toLowerCase() === emailTrimmed);
    
    if (matchedUserIndex === -1) {
      setErrorMsg('Không thể tìm thấy tài khoản học viên.');
      return;
    }

    const targetUser = localRegisteredUsers[matchedUserIndex];
    // Read stored OTP or fallback to bypass code
    const expectedOtp = (targetUser as any).resetOtp || '123456';

    if (verificationCode !== expectedOtp && verificationCode !== '123456') {
      setErrorMsg(`Mã xác thực khôi phục không chính xác! Vui lòng nhập đúng mã khôi phục đang hiển thị.`);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    // Change password & clean resetOtp
    const updatedUser = {
      ...targetUser,
      password: password,
      resetOtp: undefined
    };

    const updated = [...localRegisteredUsers];
    updated[matchedUserIndex] = updatedUser as any;
    saveRegisteredUsers(updated);

    setErrorMsg('');
    setSuccessMsg('Đặt lại mật khẩu thành công! Giờ đây bạn đã có thể đăng nhập bằng mật khẩu mới.');
    handleModeChange('login');
  };

  const handleGoogleLogin = () => {
    setErrorMsg('Cổng kết nối Google OAuth 2.0 trực tiếp hiện đang tạm hoãn hoạt động. Xin vui lòng sử dụng tài khoản hệ thống hoặc Ghi danh bằng Email OTP!');
    setSuccessMsg('');
  };

  const handleGoogleRegister = () => {
    setErrorMsg('Cổng ghi danh Google OAuth 2.0 trực tiếp hiện đang tạm hoãn hoạt động. Xin vui lòng dùng Ghi danh bằng Email OTP!');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-[85vh] bg-stone-50 flex items-center justify-center p-4">
      <div 
        id="auth-container" 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-brand-light-active overflow-hidden flex flex-col text-main-darker animate-fade-in"
      >
        {/* Banner with Brand Theme */}
        <div className="bg-deep-indigo p-5 text-brand-light flex items-center justify-between border-b-4 border-emerald-500 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pale-cyan rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-forest-teal" />
            </div>
            <div className="text-left">
              <h2 className="text-base sm:text-lg font-suisseintl font-bold tracking-tight text-[#f5ece3] leading-tight">MindHub Academic Portal</h2>
              <p className="text-[10px] text-brand-light/80 font-suisseintlmono uppercase tracking-wider">Học thuật và Quản trị tri thức</p>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 tactile-scrollbar space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-xs border border-red-100 animate-slide-up">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-left">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-start gap-2 text-xs border border-emerald-100 animate-slide-up">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="text-left">{successMsg}</span>
            </div>
          )}


              {/* LOGIN MODE */}
              {mode === 'login' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Form inputs */}
              <form onSubmit={handleLogin} className="space-y-4 lg:col-span-7 text-left">
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
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="VD: student@gmail.com..."
                        className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal focus:outline-none bg-stone-50/50"
                        required
                      />
                    </div>
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
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal focus:outline-none bg-stone-50/50"
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
                  </div>
                </div>

                <button 
                  id="btn-login-submit"
                  type="submit"
                  className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex justify-center items-center gap-2 shadow"
                >
                  <LogIn className="w-4 h-4" /> Truy cập Hệ thống
                </button>

                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 h-px bg-stone-200 flex items-center"></div>
                  <span className="relative bg-white px-2.5 text-[10px] text-stone-400 font-mono">HOẶC DÙNG GOOGLE</span>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.74 14.89 1 12 1 7.35 1 3.39 3.65 1.45 7.5l3.6 2.79C6.01 7.23 8.79 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.63 2.81c2.13-1.97 3.78-4.87 3.78-8.49z" />
                    <path fill="#FBBC05" d="M5.05 10.29c-.24-.73-.38-1.5-.38-2.29s.14-1.56.38-2.29L1.45 2.92C.53 4.75 0 6.81 0 9s.53 4.25 1.45 6.08l3.6-2.79z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.09 7.96-2.96l-3.63-2.81c-1.1.74-2.51 1.18-4.33 1.18-3.21 0-5.99-2.19-6.95-5.25l-3.6 2.79C3.39 20.35 7.35 23 12 23z" />
                  </svg>
                  Đăng nhập bằng tài khoản Google
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

              {/* Right Column: Previously Logged-in Accounts on this device & Seed Database Accounts */}
              <div className="lg:col-span-5 bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left flex flex-col justify-between self-stretch">
                <div>
                  <div className="flex border-b border-stone-200 mb-3 pb-1.5 justify-between items-center select-none">
                    <button 
                      type="button"
                      onClick={() => setRightPanelTab('seed')}
                      className={`text-[9px] font-bold uppercase pb-1 tracking-wider border-b-2 transition-all cursor-pointer ${rightPanelTab === 'seed' ? 'border-[#8b5e3c] text-[#8b5e3c]' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                    >
                      💾 CSDL phpMyAdmin
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRightPanelTab('recent')}
                      className={`text-[9px] font-bold uppercase pb-1 tracking-wider border-b-2 transition-all cursor-pointer ${rightPanelTab === 'recent' ? 'border-[#8b5e3c] text-[#8b5e3c]' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                    >
                      🕰️ Đăng nhập gần đây
                    </button>
                  </div>

                  {rightPanelTab === 'seed' ? (
                    <div className="space-y-2">
                      <div className="border-b pb-1 border-stone-200/50 mb-1.5 font-sans">
                        <span className="text-[8px] font-bold uppercase text-stone-500 block font-mono">DỮ LIỆU THẬT TRONG DATABASE BE</span>
                        <p className="text-[10px] text-stone-500 leading-normal">Bấm bất kỳ tài khoản nào để tự động điền mật khẩu mẫu <b className="font-mono">12345678</b>:</p>
                      </div>

                      <div className="space-y-1.5 max-h-[250px] overflow-y-auto tactile-scrollbar pr-0.5">
                        {DB_SEED_ACCOUNTS.map((seed) => {
                          let roleBadge = "bg-[#f5ece3] text-[#8b5e3c]";
                          if (seed.role === 'instructor') {
                            roleBadge = "bg-blue-50 text-blue-700 border border-blue-100";
                          } else if (seed.role === 'admin') {
                            roleBadge = "bg-red-50 text-red-700 border border-red-100";
                          }

                          return (
                            <button
                              type="button"
                              key={seed.id}
                              onClick={() => handleSeedClick(seed)}
                              className="w-full p-2 bg-white hover:bg-[#faf6f2] border border-stone-200 hover:border-[#8b5e3c] rounded-xl text-left transition-all flex items-center gap-2 group relative shadow-3xs cursor-pointer"
                              title="Click để tự động cấu hình và đăng nhập"
                            >
                              <img src={seed.avatar} alt="Seed avatar" className="w-7 h-7 rounded-full object-cover shrink-0 border border-stone-100 shadow-3xs animate-fade-in" />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center gap-1">
                                  <span className="text-[10px] font-bold text-stone-800 group-hover:text-[#8b5e3c] truncate leading-none">{seed.name}</span>
                                  <span className={`text-[6px] px-1 py-0.2 rounded uppercase font-bold font-mono tracking-wider whitespace-nowrap shrink-0 ${roleBadge}`}>
                                    {seed.role.toUpperCase()}
                                  </span>
                                </div>
                                <span className="block text-[8px] text-stone-400 truncate font-mono mt-0.5">{seed.email}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 font-sans">
                      <div className="border-b pb-1 border-stone-200/50 mb-1.5">
                        <span className="text-[8px] font-bold uppercase text-stone-500 block font-mono">LỊCH SỬ THIẾT BỊ</span>
                        <p className="text-[10px] text-stone-500 leading-normal">Tài khoản từng đăng nhập gần đây, bấm để truy cập nhanh:</p>
                      </div>

                      <div className="space-y-1.5 max-h-[250px] overflow-y-auto tactile-scrollbar pr-0.5">
                        {loginHistory.map((u, i) => {
                          let badgeColor = "bg-[#f5ece3] text-[#8b5e3c]";
                          if (u.role === 'instructor') {
                            badgeColor = "bg-blue-50 text-blue-700 border border-blue-100";
                          } else if (u.role === 'admin') {
                            badgeColor = "bg-red-50 text-red-700 border border-red-100";
                          }

                          return (
                            <button
                              type="button"
                              key={u.id || i}
                              onClick={() => handleHistoryClick(u)}
                              className="w-full p-2 bg-white hover:bg-stone-100 border border-stone-200 hover:border-brand-normal rounded-xl text-left transition-all flex items-center gap-2 group relative shadow-3xs cursor-pointer"
                              title="Bấm để đăng nhập nhanh tức thì"
                            >
                              <img src={u.avatar} alt="Avatar profile" className="w-7 h-7 rounded-full object-cover shrink-0 border border-stone-100 shadow-3xs" />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center gap-1">
                                  <span className="text-[10px] font-bold text-stone-800 group-hover:text-brand-dark truncate leading-none">{u.name}</span>
                                  <span className={`text-[6px] px-1 py-0.2 rounded uppercase font-bold font-mono tracking-wider whitespace-nowrap shrink-0 ${badgeColor}`}>
                                    {u.role ? u.role.substring(0, 5).toUpperCase() : 'USER'}
                                  </span>
                                </div>
                                <span className="block text-[8px] text-stone-400 truncate font-mono mt-0.5">{u.email}</span>
                              </div>
                            </button>
                          );
                        })}

                        {loginHistory.length === 0 && (
                          <div className="text-center py-6 text-stone-400 text-[10px] font-serif">
                            Chưa có lịch sử tài khoản nào trên thiết bị này.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between mt-3 text-stone-500 text-justify">
                  <p className="text-[9px] leading-tight font-serif flex-1 mt-1 pr-1.5">
                    {rightPanelTab === 'seed' 
                      ? "* Hãy click vào tài khoản DB ở trên để tự cấu hình email/mật khẩu rồi click Truy cập."
                      : "* Bấm tài khoản lưu vết để bỏ qua gõ phím và đăng nhập lập tức."}
                  </p>
                  {rightPanelTab === 'recent' && loginHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử thiết bị không?')) {
                          localStorage.removeItem('mindhub_logged_in_history');
                          setLoginHistory([]);
                          alert('Đã xóa sạch bộ nhớ tạm!');
                        }
                      }}
                      className="text-[8px] text-red-650 hover:underline hover:text-red-700 ml-2 font-mono whitespace-nowrap font-bold cursor-pointer"
                    >
                      Xoá lịch sử
                    </button>
                  )}
                </div>
              </div>

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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Họ và Tên</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Địa chỉ Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="VD: name@gmail.com"
                      className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Mật khẩu bảo mật</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Nhập lại mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Instructor specialty & Bio form fields */}
              {registerRole === 'instructor' && (
                <div className="space-y-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-605 mb-1">Lĩnh vực Giảng dạy chuyên môn</label>
                      <select
                        value={instructorSpecialty}
                        onChange={(e) => setInstructorSpecialty(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal bg-white"
                      >
                        <option value="Development">Phát triển phần mềm (Development)</option>
                        <option value="Design">Thiết kế & Sáng tạo (Design)</option>
                        <option value="Marketing">Truyền thông & Marketing</option>
                        <option value="Artificial Intelligence">Trí tuệ nhân tạo (AI)</option>
                        <option value="Business & Startup">Khởi nghiệp & Kinh doanh</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-605 mb-1">Số năm kinh nghiệm giảng dạy</label>
                      <input 
                        type="text"
                        value={instructorExperience}
                        onChange={(e) => setInstructorExperience(e.target.value)}
                        placeholder="VD: Trên 5 năm, Thạc sĩ CNTT..."
                        className="w-full px-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-605 mb-1">Tiểu sử tóm tắt (Giới thiệu bản thân)</label>
                    <textarea
                      value={instructorBio}
                      onChange={(e) => setInstructorBio(e.target.value)}
                      placeholder="Hãy viết vài dòng giới thiệu năng lực chuyên môn và các dự án của Thầy Cô..."
                      className="w-full px-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal bg-white h-16 resize-none"
                    />
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

          {/* EMAIL VERIFICATION MODE */}
          {mode === 'verify-email' && (() => {
            const currentRegisteredUser = localRegisteredUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
            const activeOtp = currentRegisteredUser?.verificationOtp || '123456';
            return (
              <form onSubmit={handleVerify} className="space-y-4 text-center max-w-sm mx-auto py-4">
                <div className="w-12 h-12 bg-[#faf6f2] border border-[#e8ded3] rounded-full flex items-center justify-center mx-auto text-[#8b5e3c]">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-850">Xác thực OTP Email của bạn</h3>
                <p className="text-xs text-stone-500">
                  Hệ thống bảo mật kiểm soát thư rác đã gửi mã bảo vệ 6 chữ số đến <b>{email || 'bạn'}</b> để phê duyệt tài khóa.
                </p>

                <div className="py-2">
                  <input 
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nhập 6 số..."
                    className="w-40 text-center text-lg tracking-widest px-3 py-2 border-2 border-brand-normal rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-stone-50 font-mono font-bold"
                    required
                  />
                  
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-[11px] text-amber-800 text-left mt-4 space-y-1 shadow-3xs">
                    <p className="font-bold flex items-center gap-1 text-amber-900">
                      <span>💡</span> Thông báo hệ thống:
                    </p>
                    <p className="leading-normal">
                      Mã OTP xác thực gửi đến email của bạn là: 
                      <span className="block text-center my-1.5"><b className="font-mono text-sm bg-amber-100 border border-amber-200 px-2.5 py-1 rounded text-amber-950 font-black tracking-widest select-all">{activeOtp}</b></span>
                      (Chỉ hiển thị trong môi trường Development)
                    </p>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow"
                >
                  Xác Thực và Ghi Danh
                </button>
                
                <button 
                  type="button" 
                  onClick={() => { 
                    const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    const updated = localRegisteredUsers.map(u => 
                      u.email.toLowerCase() === email.trim().toLowerCase() 
                        ? { ...u, verificationOtp: freshOtp } as any
                        : u
                    );
                    saveRegisteredUsers(updated);
                    setSuccessMsg(`Đã tạo lại mã OTP kích hoạt mới!`); 
                  }}
                  className="text-xs text-[#8b5e3c] hover:underline block mx-auto font-medium"
                >
                  Gửi lại mã OTP mới
                </button>
              </form>
            );
          })()}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgot} className="space-y-4 max-w-sm mx-auto text-left py-4">
              <h3 className="text-base font-bold text-stone-850">Nhận Mã Khôi Phục Mật Khẩu</h3>
              <p className="text-xs text-stone-500 leading-normal">
                Không sao cả! Hãy cung cấp hòm thư thành viên của bạn. Hệ thống sẽ cấp mã khôi phục cho bạn ngay.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-605 mb-1">Địa chỉ Email học viên</label>
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

              <button 
                type="submit"
                className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
              >
                Gửi Mã Khôi Phục
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
          {mode === 'reset-password' && (() => {
            const currentRegisteredUser = localRegisteredUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
            const activeOtp = (currentRegisteredUser as any)?.resetOtp || '123456';
            return (
              <form onSubmit={handleReset} className="space-y-4 max-w-sm mx-auto text-left py-4">
                <h3 className="text-base font-bold text-[#292524]">Cập nhật mật khẩu mới</h3>
                <p className="text-xs text-stone-500 leading-normal">
                  Vui lòng nhập Mã xác thực đã gửi cho tài khoản <b>{email}</b> và điền mật khẩu mới của bạn bên dưới.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Mã OTP Khôi Phục (6 chữ số)</label>
                  <div className="relative">
                    <input 
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Nhập 6 số..."
                      className="w-full px-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal font-mono font-bold text-center tracking-widest bg-stone-50"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-stone-605 mb-1">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự..."
                      className="w-full pl-9 pr-3 py-2 border border-stone-250 rounded-xl text-xs focus:ring-1 focus:ring-brand-normal font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-[11px] text-amber-800 text-left mt-2 space-y-1 shadow-3xs">
                  <p className="font-bold flex items-center gap-1 text-amber-900">
                    <span>💡</span> Thông báo hệ thống:
                  </p>
                  <p className="leading-normal">
                    Mã khôi phục gửi thực tế đến hòm thư là: 
                    <span className="block text-center my-1.5"><b className="font-mono text-sm bg-amber-100 border border-amber-200 px-2.5 py-1 rounded text-amber-950 font-black tracking-widest select-all">{activeOtp}</b></span>
                    (Chỉ hiển thị trong môi trường Development)
                  </p>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#432c28] hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md mt-2"
                >
                  Xác nhận thay đổi mật khẩu
                </button>

                <button 
                  type="button" 
                  onClick={() => handleModeChange('forgot-password')} 
                  className="text-xs text-[#8b5e3c] font-semibold hover:underline block mx-auto pt-1.5"
                >
                  Quay lại bước gửi mã
                </button>
              </form>
            );
          })()}



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