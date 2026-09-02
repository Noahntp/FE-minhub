import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, BookOpen, Clock, Plus, BarChart2, CheckCircle, 
  Settings, UserCheck, ShieldAlert, ArrowUpRight, FileText, Send, Trash2,
  Eye, EyeOff, Edit, PlusCircle, MinusCircle, Save, Check, ChevronRight, ChevronLeft,
  AlertTriangle, Play, HelpCircle, Lock, Sparkles, Upload, ArrowUp, ArrowDown, Shield, Key, Smartphone, Mail, X, List, AlertCircle, Search, LayoutDashboard, Activity, MessageSquare, Tag, Landmark, Bell, Filter, RotateCcw, Menu
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import SubmitErrorModal from '@/components/instructor-course-form/SubmitErrorModal';
import { resolveMediaUrl as formatResolveMediaUrl, mapLesson } from '@/shared/utils/format';
import { InstructorSidebar } from '@/components/instructor-ui/InstructorSidebar';
import { InstructorNotificationDropdown } from '@/components/instructor-ui/InstructorNotificationDropdown';
import { InstructorUserDropdown } from '@/components/instructor-ui/InstructorUserDropdown';
import { getActiveNavigationKey, getBreadcrumbLabel, InstructorNavItem } from '@/config/instructorNavigation';

// --- HELPER COMPONENT FOR THUMBNAILS WITH FALLBACK ---
const CourseThumbnail = ({ src, alt }: { src: string; alt: string }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div className="w-[88px] h-[50px] aspect-video bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-stone-400 shrink-0 select-none">
        <BookOpen className="w-5 h-5 text-stone-400" />
        <span className="text-[7.5px] font-bold text-stone-400 mt-0.5 uppercase tracking-tighter">MindHub</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className="w-[88px] h-[50px] aspect-video object-cover rounded-lg border border-slate-200/80 bg-slate-50 shrink-0"
    />
  );
};

// --- SKELETON LOADER FOR COURSE TABLE ---
const CourseTableSkeleton = () => (
  <div className="divide-y divide-slate-100 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-[88px] h-[50px] bg-slate-200 rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3.5 bg-slate-200 rounded w-2/3" />
            <div className="h-2.5 bg-slate-100 rounded w-1/3" />
          </div>
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded-full hidden md:block" />
        <div className="h-4 w-12 bg-slate-100 rounded hidden md:block" />
        <div className="h-4 w-20 bg-slate-100 rounded hidden md:block" />
        <div className="h-7 w-28 bg-slate-200 rounded-lg" />
      </div>
    ))}
  </div>
);
import { User, Course, Chapter, Lesson, Quiz, QuizQuestion, PayoutRequest } from '@/shared/types';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { sharedApi } from '@/features/shared/api';
import { authApi } from '@/features/auth/api';
import { categoryApi } from '@/features/category/api';
import { instructorApi } from '@/features/instructor/api';
import { InstructorRevenue } from './InstructorRevenue';
import { InstructorWithdrawal } from './InstructorWithdrawal';
import { InstructorQAModule } from '@/features/qa/index';
import { InstructorRevenueChart } from './InstructorRevenueChart';
import TransactionManagement from './components/TransactionManagement';
import { InstructorEnrollmentChart } from './InstructorEnrollmentChart';
import { InstructorTopCourses } from './InstructorTopCourses';
import { CouponManagement } from '@/features/coupons/index';
import CourseMediaStep from '@/components/instructor-course-form/CourseMediaStep';
import CourseCurriculumStep from '@/components/instructor-course-form/CourseCurriculumStep';
import RichTextEditor from '@/components/instructor-course-form/RichTextEditor';
import LanguageSelect from '@/components/instructor-course-form/LanguageSelect';
import StudentManagement from './components/StudentManagement';
import InstructorProfilePage from '@/components/instructor-ui/InstructorProfilePage';

interface InstructorDashboardProps {
  currentUser: User;
  onUpdateUser?: (updatedUser: User) => void;
  courses?: Course[];
  onCreateCourseDraft?: (newC: Course) => void;
  onUpdateCourse?: (c: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onClose?: () => void;
}

// --- HELPER COMPONENT FOR USER AVATAR WITH INITIALS FALLBACK ---
const UserAvatar = ({ name, src, size = 'sm' }: { name?: string; src?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const resolvedSrc = src ? formatResolveMediaUrl(src) : '';
  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-sm' : size === 'md' ? 'w-10 h-10 text-xs' : 'w-8 h-8 text-[11px]';

  const getInitials = (str?: string) => {
    if (!str) return 'GV';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (!resolvedSrc || imgError) {
    return (
      <div className={`${sizeClasses} rounded-full bg-[#007A64] text-white font-bold flex items-center justify-center shrink-0 border border-emerald-600/30 select-none`}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={name || 'Avatar'}
      onError={() => setImgError(true)}
      className={`${sizeClasses} rounded-full border border-slate-200/80 object-cover bg-slate-100 shrink-0`}
    />
  );
};

function InstructorSecurityPanel({ currentUser }: { currentUser: User }) {
  const [emailStatus, setEmailStatus] = useState(currentUser.isEmailVerified ? 'verified' : 'unverified');
  const [otpEnabled, setOtpEnabled] = useState(currentUser.isTwoFactorEnabled || false);
  const [otpStep, setOtpStep] = useState<'idle' | 'setup' | 'confirm'>('idle');
  const [otpCode, setOtpCode] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  
  const sessions = currentUser.activeSessions || [
    { id: '1', device: 'Windows PC', os: 'Windows 11', browser: 'Chrome', ip: '192.168.1.5', lastActive: 'Vừa xong', isCurrent: true },
    { id: '2', device: 'iPhone 14 Pro', os: 'iOS 16', browser: 'Safari', ip: '113.190.23.1', lastActive: '2 giờ trước', isCurrent: false }
  ];

  const handleVerifyEmail = async () => {
    setEmailStatus('pending');
    try {
      await authApi.resendVerificationEmail(currentUser.email, 'verify_email');
      alert('Đã gửi email xác minh đến: ' + currentUser.email);
      setEmailStatus('unverified');
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi email');
      setEmailStatus('unverified');
    }
  };

  const handleEnableOtp = async () => {
    try {
      await authApi.sendPhoneOtp(currentUser.phone || '', 'setup_2fa');
      setOtpStep('setup');
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi mã OTP');
    }
  };

  const handleConfirmOtp = async () => {
    if (otpCode.length === 6) {
      try {
        await authApi.verifyPhoneOtp(currentUser.phone || '', otpCode, 'verify_phone');
        setOtpEnabled(true);
        setOtpStep('idle');
        alert('Đã bật xác thực 2 lớp thành công!');
        setOtpCode('');
      } catch (err: any) {
        alert(err.message || 'Mã OTP không hợp lệ!');
      }
    } else {
      alert('Mã OTP phải có 6 chữ số!');
    }
  };

  const handleDisableOtp = () => {
    if (window.confirm('Bạn có chắc chắn muốn tắt xác thực 2 lớp? Bảo mật tài khoản sẽ giảm xuống.')) {
      setOtpEnabled(false);
      alert('Đã tắt xác thực 2 lớp.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    setPasswordMsg('');
    alert('Đổi mật khẩu thành công!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const securityLevel = (emailStatus === 'verified' ? 1 : 0) + (otpEnabled ? 1 : 0) + (currentUser.lastPasswordChange ? 1 : 0);
  const securityScore = securityLevel >= 2 ? 'Tốt' : securityLevel === 1 ? 'Khuyến nghị' : 'Cơ bản';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3 border-b pb-4">
        <ShieldAlert className="w-8 h-8 text-brand-normal" />
        <div>
          <h2 className="text-xl font-bold">Bảo mật tài khoản Giảng viên</h2>
          <p className="text-sm text-stone-500">Quản lý các thiết lập bảo mật chuyên sâu cho tài khoản giảng viên.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột chính */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Email Verification */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${emailStatus === 'verified' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Xác minh Email</h3>
                <p className="text-sm text-stone-600 mb-3">Email liên hệ và nhận thông báo chính thức.</p>
                <div className="bg-stone-50 p-3 rounded-lg border flex items-center justify-between">
                  <span className="font-medium">{currentUser.email}</span>
                  {emailStatus === 'verified' ? (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Đã xác minh</span>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">Chưa xác minh</span>
                  )}
                </div>
                {emailStatus !== 'verified' && (
                  <button 
                    onClick={handleVerifyEmail}
                    disabled={emailStatus === 'pending'}
                    className="mt-3 text-sm font-semibold text-brand-normal hover:underline disabled:opacity-50"
                  >
                    {emailStatus === 'pending' ? 'Đang gửi...' : 'Gửi lại email xác minh'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2FA OTP */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${otpEnabled ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-600'}`}>
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Xác thực 2 lớp (2FA/OTP)</h3>
                  {otpEnabled ? (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Đang bật</span>
                  ) : (
                    <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded">Đang tắt</span>
                  )}
                </div>
                <p className="text-sm text-stone-600 mt-1 mb-4">Bảo vệ tài khoản giảng viên của bạn bằng cách yêu cầu mã xác nhận từ SMS mỗi khi đăng nhập.</p>
                
                {!otpEnabled && otpStep === 'idle' && (
                  <button onClick={handleEnableOtp} className="bg-brand-normal text-brand-light font-bold py-2 px-4 rounded-lg text-sm">
                    Thiết lập Xác thực 2 lớp
                  </button>
                )}

                {otpStep === 'setup' && (
                  <div className="bg-stone-50 p-4 rounded-lg border space-y-4">
                    <p className="text-sm font-bold">Mã OTP đã được gửi về số điện thoại {currentUser.phone}</p>
                    <p className="text-sm font-bold">Nhập mã OTP gồm 6 chữ số</p>
                    <div className="flex gap-2 max-w-xs">
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-xl tracking-widest p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-normal focus:border-transparent" 
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleConfirmOtp} className="bg-brand-normal text-white font-bold py-2 px-4 rounded-lg">Xác nhận</button>
                      <button onClick={() => setOtpStep('idle')} className="bg-stone-200 text-stone-700 font-bold py-2 px-4 rounded-lg">Hủy</button>
                    </div>
                  </div>
                )}

                {otpEnabled && (
                  <button onClick={handleDisableOtp} className="bg-red-50 text-red-600 border border-red-200 font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-100">
                    Tắt Xác thực 2 lớp
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-stone-100 text-stone-600">
                <Key className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-4">Đổi mật khẩu</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Mật khẩu hiện tại</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full border rounded-lg p-2" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Mật khẩu mới</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border rounded-lg p-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Xác nhận mật khẩu</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border rounded-lg p-2" required />
                    </div>
                  </div>
                  {passwordMsg && <p className="text-xs text-red-500 font-semibold">{passwordMsg}</p>}
                  <button type="submit" className="bg-stone-800 text-white font-bold py-2 px-4 rounded-lg text-sm">Cập nhật mật khẩu</button>
                </form>
              </div>
            </div>
          </div>

        </div>

        {/* Cột phụ */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-stone-50 border rounded-xl p-5">
            <h3 className="font-bold mb-4">Tóm tắt bảo mật</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600">Mức độ</span>
                <span className={`font-bold ${securityScore === 'Tốt' ? 'text-green-600' : 'text-amber-600'}`}>{securityScore}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600">Email</span>
                <span className="font-semibold">{emailStatus === 'verified' ? 'Đã xác minh' : 'Chưa'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600">2FA / OTP</span>
                <span className="font-semibold">{otpEnabled ? 'Đã bật' : 'Chưa bật'}</span>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2"><LaptopIcon /> Phiên đăng nhập</h3>
            <div className="space-y-4">
              {sessions.map(s => (
                <div key={s.id} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-2">
                        {s.device} 
                        {s.isCurrent && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">Hiện tại</span>}
                      </p>
                      <p className="text-xs text-stone-500">{s.os} • {s.browser}</p>
                      <p className="text-xs text-stone-400 mt-1">Hoạt động: {s.lastActive} • IP: {s.ip}</p>
                    </div>
                    {!s.isCurrent && (
                      <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Đăng xuất thiết bị này">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm font-semibold text-brand-normal border border-brand-normal/20 py-2 rounded-lg hover:bg-brand-normal/5 transition-colors">
              Đăng xuất các thiết bị khác
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LaptopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
  );
}


export const COURSE_COMPLETION_STEP_MAP: Record<string, { step: number; stepName: string; focus: string }> = {
  // Step 1: Basic Info
  title: { step: 1, stepName: 'basic-info', focus: 'title' },
  course_title: { step: 1, stepName: 'basic-info', focus: 'title' },
  short_description: { step: 1, stepName: 'basic-info', focus: 'short_description' },
  course_short_description: { step: 1, stepName: 'basic-info', focus: 'short_description' },
  subtitle: { step: 1, stepName: 'basic-info', focus: 'short_description' },
  description: { step: 1, stepName: 'basic-info', focus: 'description' },
  course_description: { step: 1, stepName: 'basic-info', focus: 'description' },
  category: { step: 1, stepName: 'basic-info', focus: 'category' },
  course_category: { step: 1, stepName: 'basic-info', focus: 'category' },
  learning_outcomes: { step: 1, stepName: 'basic-info', focus: 'will_learn' },
  will_learn: { step: 1, stepName: 'basic-info', focus: 'will_learn' },
  outcomes: { step: 1, stepName: 'basic-info', focus: 'will_learn' },
  requirements: { step: 1, stepName: 'basic-info', focus: 'requirements' },

  // Step 2: Pricing
  price: { step: 2, stepName: 'pricing', focus: 'price' },
  course_price: { step: 2, stepName: 'pricing', focus: 'price' },

  // Step 3: Media
  thumbnail: { step: 3, stepName: 'media', focus: 'thumbnail' },
  thumbnail_url: { step: 3, stepName: 'media', focus: 'thumbnail' },
  course_thumbnail: { step: 3, stepName: 'media', focus: 'thumbnail' },
  intro_video: { step: 3, stepName: 'media', focus: 'intro_video' },
  intro_video_url: { step: 3, stepName: 'media', focus: 'intro_video' },

  // Step 4: Curriculum
  section: { step: 4, stepName: 'curriculum', focus: 'add-section' },
  course_section: { step: 4, stepName: 'curriculum', focus: 'add-section' },
  published_section: { step: 4, stepName: 'curriculum', focus: 'published_section' },
  published_sections: { step: 4, stepName: 'curriculum', focus: 'published_section' },
  lesson: { step: 4, stepName: 'curriculum', focus: 'add-lesson' },
  published_lesson: { step: 4, stepName: 'curriculum', focus: 'add-lesson' },
  published_lessons: { step: 4, stepName: 'curriculum', focus: 'add-lesson' },
  lesson_media: { step: 4, stepName: 'curriculum', focus: 'add-lesson' },
  curriculum: { step: 4, stepName: 'curriculum', focus: 'add-section' },
};

export default function InstructorDashboard({
  currentUser,
  onUpdateUser,
  courses: propCourses = [],
  onCreateCourseDraft,
  onUpdateCourse,
  onDeleteCourse,
  onClose
}: InstructorDashboardProps) {
  const navigate = useNavigate();
  const [coursesList, setCoursesList] = useState<Course[]>(Array.isArray(propCourses) ? propCourses : []);
  const hasFetchedCoursesRef = useRef(false);

  useEffect(() => {
    if (Array.isArray(propCourses) && propCourses.length > 0) {
      setCoursesList(propCourses);
    } else if (!hasFetchedCoursesRef.current) {
      hasFetchedCoursesRef.current = true;
      instructorApi.getInstructorCourses({ per_page: 100 })
        .then(res => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          if (Array.isArray(list)) {
            setCoursesList(list);
          }
        })
        .catch(err => {
          console.error("Error fetching instructor courses in dashboard", err);
        });
    }
  }, [propCourses]);

  const courses = Array.isArray(coursesList) ? coursesList : [];
  
  // Helper: Parse current pathname and query into route state
  const parseRouteFromLocation = () => {
    if (typeof window === 'undefined') {
      return { tab: 'overview' as const, courseId: null, step: 1, focus: null, sectionId: null, lessonId: null };
    }
    const pathname = window.location.pathname;
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const rawStep = urlParams.get('step') || '1';
    const focus = urlParams.get('focus') || urlParams.get('anchor');
    const sectionId = urlParams.get('section_id');
    const lessonId = urlParams.get('lesson_id');

    let validStep = 1;
    if (rawStep === '2' || rawStep === 'pricing' || rawStep === 'price') {
      validStep = 2;
    } else if (rawStep === '3' || rawStep === 'media' || rawStep === 'thumbnail' || rawStep === 'video') {
      validStep = 3;
    } else if (rawStep === '4' || rawStep === 'curriculum' || rawStep === 'syllabus' || rawStep === 'sections' || rawStep === 'lessons' || rawStep === 'quizzes' || rawStep === 'quiz') {
      validStep = 4;
    } else {
      const num = parseInt(rawStep, 10);
      if (num >= 1 && num <= 4) validStep = num;
    }

    if (pathname === '/instructor/courses/create') {
      return { tab: 'builder' as const, courseId: null, step: validStep, focus, sectionId, lessonId };
    }

    const editMatch = pathname.match(/\/instructor\/courses\/([^\/]+)\/edit/);
    if (editMatch) {
      return { tab: 'builder' as const, courseId: editMatch[1], step: validStep, focus, sectionId, lessonId };
    }

    if (pathname.includes('/courses')) {
      return { tab: 'courses' as const, courseId: null, step: 1, focus: null, sectionId: null, lessonId: null };
    }
    if (pathname.includes('/transactions')) {
      return { tab: 'transactions' as const, courseId: null, step: 1, focus: null, sectionId: null, lessonId: null };
    }
    if (pathname.includes('/withdrawals') || pathname.includes('/revenues')) {
      return { tab: 'payout' as const, courseId: null, step: 1, focus: null, sectionId: null, lessonId: null };
    }
    if (pathname.includes('/questions')) {
      return { tab: 'qa' as const, courseId: null, step: 1, focus: null, sectionId: null, lessonId: null };
    }
    if (pathname.includes('/discount-codes') || pathname.includes('/coupons')) {
      return { tab: 'coupons' as const, courseId: null, step: 1, focus: null, sectionId: null, lessonId: null };
    }
    if (pathname.includes('/profile') || pathname.includes('/security') || pathname.includes('/account')) {
      return { tab: 'security' as const, courseId: null, step: 1, focus: null, sectionId: null, lessonId: null };
    }

    return { tab: 'overview' as const, courseId: null, step: 1, focus: null, sectionId: null, lessonId: null };
  };

  const initialRouteState = useMemo(() => parseRouteFromLocation(), []);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons' | 'payout'>(initialRouteState.tab);
  const [builderStep, setBuilderStep] = useState<number>(initialRouteState.step);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(initialRouteState.courseId);
  const [pendingFocusTarget, setPendingFocusTarget] = useState<string | null>(initialRouteState.focus);

  const updateRouteUrl = (
    tab: string,
    courseId: string | null = null,
    step: number | string = 1,
    replace: boolean = false,
    focus: string | null = null,
    sectionId: string | number | null = null
  ) => {
    if (typeof window === 'undefined') return;
    let targetUrl = '/instructor/dashboard';
    if (tab === 'courses') {
      targetUrl = '/instructor/courses';
    } else if (tab === 'builder') {
      const stepStr = typeof step === 'number' ? (
        step === 1 ? 'basic-info' : step === 2 ? 'pricing' : step === 3 ? 'media' : 'curriculum'
      ) : step;

      let queryParams = `step=${stepStr}`;
      if (focus) queryParams += `&focus=${focus}`;
      if (sectionId) queryParams += `&section_id=${sectionId}`;

      if (courseId) {
        targetUrl = `/instructor/courses/${courseId}/edit?${queryParams}`;
      } else {
        targetUrl = `/instructor/courses/create?${queryParams}`;
      }
    } else if (tab === 'transactions') {
      targetUrl = '/instructor/transactions';
    } else if (tab === 'payout') {
      targetUrl = '/instructor/withdrawals';
    } else if (tab === 'qa') {
      targetUrl = '/instructor/questions';
    } else if (tab === 'coupons') {
      targetUrl = '/instructor/discount-codes';
    } else if (tab === 'security') {
      targetUrl = '/instructor/profile';
    } else if (tab === 'students') {
      targetUrl = '/instructor/students';
    } else if (tab === 'revenue') {
      targetUrl = '/instructor/revenue';
    }

    if (window.location.pathname + window.location.search !== targetUrl) {
      window.history.replaceState({}, '', targetUrl);
    }
  };

  const handleTabChange = (tab: 'overview' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons' | 'payout') => {
    setActiveTab(tab);
    updateRouteUrl(tab, editingCourseId, builderStep);
  };

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnreadCount = async () => {
      try {
        const res = await instructorApi.getInstructorUnreadNotificationCount();
        if (isMounted) {
          setUnreadNotificationCount(res?.unread_count ?? 0);
        }
      } catch {
        if (isMounted) setUnreadNotificationCount(0);
      }
    };
    fetchUnreadCount();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  // Auto scroll and focus handler for deep linking from Course Checklist or URL
  useEffect(() => {
    if (activeTab !== 'builder' || !pendingFocusTarget) return;

    const timer = setTimeout(() => {
      const cleanKey = pendingFocusTarget.replace(/^focus-/, '');
      const elementId = `focus-${cleanKey}`;
      const el = document.getElementById(elementId) || document.querySelector(`[data-focus-id="${cleanKey}"]`);

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        el.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2', 'rounded-xl', 'transition-all', 'duration-300');

        const focusable = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.tagName === 'BUTTON'
          ? el
          : el.querySelector('input, textarea, select, button');

        if (focusable && typeof (focusable as HTMLElement).focus === 'function') {
          (focusable as HTMLElement).focus();
        }

        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2');
          setPendingFocusTarget(null);
        }, 1500);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [activeTab, builderStep, pendingFocusTarget]);

  const activeNavKey = useMemo(() => {
    return getActiveNavigationKey(
      typeof window !== 'undefined' ? window.location.pathname : '',
      activeTab,
      builderStep
    );
  }, [activeTab, builderStep]);

  const handleSidebarNavigate = (item: InstructorNavItem) => {
    switch (item.key) {
      case 'dashboard':
        handleTabChange('overview');
        break;
      case 'courses':
        handleTabChange('courses');
        break;
      case 'create-course':
        startBuilderForCreate();
        break;
      case 'questions':
        handleTabChange('qa');
        break;
      case 'students':
        handleTabChange('students');
        break;
      case 'revenue':
        handleTabChange('revenue');
        break;
      case 'withdrawals':
        handleTabChange('payout');
        break;
      case 'discount-codes':
        handleTabChange('coupons');
        break;
      case 'profile':
        handleTabChange('security');
        break;
      default:
        handleTabChange('overview');
    }
  };
  
  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('1'); // category ID integer string
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState<number>(500000);
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  const [discountPercent, setDiscountPercent] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number>(350000);
  const [image, setImage] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800');
  const [requirements, setRequirements] = useState<string[]>(['Có máy tính cá nhân kết nối Internet']);
  const [newRequirement, setNewRequirement] = useState('');
  const [slug, setSlug] = useState('');
  const [isManualSlug, setIsManualSlug] = useState<boolean>(false);
  const [level, setLevel] = useState('beginner');
  const [language, setLanguage] = useState('vi');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [willLearn, setWillLearn] = useState<string[]>(['Lập trình thành thạo ngôn ngữ ứng dụng với thực tế']);
  const [newWillLearn, setNewWillLearn] = useState('');

  // Categories & Autosave States
  const [dbCategories, setDbCategories] = useState<{ id: number | string; name: string; slug?: string }[]>([]);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [autosaveError, setAutosaveError] = useState<string | null>(null);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [submitErrorModalState, setSubmitErrorModalState] = useState<{
    isOpen: boolean;
    title?: string;
    message?: string;
    status?: number | null;
    errors?: any;
    missingItems?: string[];
  }>({
    isOpen: false,
  });

  // Step 2: Syllabus (Chapters & Lessons)
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  
  // Active Chapter Selected for Lesson management
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  
  // Lesson state inputs
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'doc'>('video');
  const [newLessonDuration, setNewLessonDuration] = useState('15:00');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonDocContent, setNewLessonDocContent] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [newLessonIsPreview, setNewLessonIsPreview] = useState<boolean>(false);

  // Simulated Video Uploading Space States
  const [isVideoUploading, setIsVideoUploading] = useState<boolean>(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [videoUploadStatus, setVideoUploadStatus] = useState<string>('');



  // Step 4: Settings (Student permissions)
  const [allowSkip, setAllowSkip] = useState<boolean>(true);
  const [allowDownload, setAllowDownload] = useState<boolean>(false);
  const [allowDiscussion, setAllowDiscussion] = useState<boolean>(true);
  const [giveCertificate, setGiveCertificate] = useState<boolean>(false);

  // Free previews & FAQs settings
  const [allowFreeDoc, setAllowFreeDoc] = useState<boolean>(false);
  const [allowFreeVideo, setAllowFreeVideo] = useState<boolean>(false);
  const [freeVideoDuration, setFreeVideoDuration] = useState<number>(30); // duration in seconds
  const [faqs, setFaqs] = useState<any[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  

  const [gradingSubmissions, setGradingSubmissions] = useState([
    { id: 'sub-101', studentName: 'Student Test', email: 'student.test@mindhub.local', courseTitle: 'Chinh Phục React 19 & Next.js 15', lessonTitle: 'Bài tập 2.3: Validate Form Server Action', submittedValue: 'https://github.com/student/react19-form-test', points: null as number | null, feedback: '' }
  ]);

  // --- DYNAMIC STUDENT MANAGEMENT STATES ---
  const [selectedStudentCourseId, setSelectedStudentCourseId] = useState<string>('');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [studentFilterStatus, setStudentFilterStatus] = useState<string>('all');
  const [activeMessagingStudentId, setActiveMessagingStudentId] = useState<string | null>(null);
  const [directMessageText, setDirectMessageText] = useState<string>('');
  
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [enrollmentsMeta, setEnrollmentsMeta] = useState<any>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [studentPage, setStudentPage] = useState(1);
  const [studentLimit, setStudentLimit] = useState(10);
  const [studentMinProgress, setStudentMinProgress] = useState<number | undefined>();
  const [studentMaxProgress, setStudentMaxProgress] = useState<number | undefined>();
  const [studentTimeRange, setStudentTimeRange] = useState<string>('all');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);
  
  // REVENUE STATE
  const [revenueStats, setRevenueStats] = useState<{totalRevenue: number, totalGross: number, totalPlatformFee: number, totalTransactions: number, totalStudentsPaid: number}>({
    totalRevenue: 0, totalGross: 0, totalPlatformFee: 0, totalTransactions: 0, totalStudentsPaid: 0
  });
  const [overviewBalance, setOverviewBalance] = useState<number>(0);
  const [overviewUnansweredQA, setOverviewUnansweredQA] = useState<number>(0);

  // --- REAL API DASHBOARD OVERVIEW STATES ---
  const [dashboardOverview, setDashboardOverview] = useState<any>(null);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [enrollmentChartData, setEnrollmentChartData] = useState<any[]>([]);
  const [topCoursesData, setTopCoursesData] = useState<any[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<any[]>([]);
  const [incompleteCoursesData, setIncompleteCoursesData] = useState<any[]>([]);
  const [dashboardAlerts, setDashboardAlerts] = useState<any[]>([]);

  // Loading states
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);
  const [isRevenueChartLoading, setIsRevenueChartLoading] = useState(false);
  const [isEnrollmentChartLoading, setIsEnrollmentChartLoading] = useState(false);
  const [isSupportingLoading, setIsSupportingLoading] = useState(false);

  // Time filters for charts (Default to 'year' as required)
  const [revenueTimeFilter, setRevenueTimeFilter] = useState<'month' | 'week' | 'year'>('year');
  const [enrollmentTimeFilter, setEnrollmentTimeFilter] = useState<'month' | 'week' | 'year'>('year');
  const [revenueChartError, setRevenueChartError] = useState<string | null>(null);
  const [enrollmentChartError, setEnrollmentChartError] = useState<string | null>(null);

  // Helper date resolver
  const resolveDateFilter = (filterType: 'month' | 'week' | 'year') => {
    const now = new Date();
    let date_from: string;
    let date_to: string = now.toISOString().split('T')[0];

    if (filterType === 'week') {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      date_from = past.toISOString().split('T')[0];
    } else if (filterType === 'year') {
      date_from = `${now.getFullYear()}-01-01`;
    } else {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      date_from = past.toISOString().split('T')[0];
    }
    return { date_from, date_to };
  };

  // Loader functions
  const loadOverviewData = async () => {
    setIsOverviewLoading(true);
    try {
      const res = await instructorApi.getInstructorDashboard();
      setDashboardOverview(res);
    } catch (err: any) {
      console.error("Error loading dashboard overview stats:", err);
    } finally {
      setIsOverviewLoading(false);
    }
  };

  const loadRevenueChart = async (filterType: 'month' | 'week' | 'year') => {
    setIsRevenueChartLoading(true);
    setRevenueChartError(null);
    try {
      const dates = resolveDateFilter(filterType);
      const res = await instructorApi.getInstructorRevenueChart({
        ...dates,
        preset: filterType,
        period: filterType,
        group_by: filterType === 'week' ? 'day' : 'month'
      });
      const dataArr = Array.isArray(res) ? res : (res?.data || []);
      setRevenueChartData(dataArr);
    } catch (err: any) {
      console.error("Error loading revenue chart data:", err);
      setRevenueChartError(err.message || "Không thể tải biểu đồ doanh thu.");
    } finally {
      setIsRevenueChartLoading(false);
    }
  };

  const loadEnrollmentChart = async (filterType: 'month' | 'week' | 'year') => {
    setIsEnrollmentChartLoading(true);
    setEnrollmentChartError(null);
    try {
      const dates = resolveDateFilter(filterType);
      const res = await instructorApi.getInstructorEnrollmentChart({
        ...dates,
        preset: filterType,
        period: filterType,
        group_by: filterType === 'week' ? 'day' : 'month'
      });
      const dataArr = Array.isArray(res) ? res : (res?.data || []);
      setEnrollmentChartData(dataArr);
    } catch (err: any) {
      console.error("Error loading enrollment chart data:", err);
      setEnrollmentChartError(err.message || "Không thể tải biểu đồ lượt ghi danh.");
    } finally {
      setIsEnrollmentChartLoading(false);
    }
  };

  const loadSupportingSections = async () => {
    setIsSupportingLoading(true);
    await Promise.allSettled([
      instructorApi.getInstructorTopCourses({ limit: 5 }).then(res => {
        setTopCoursesData(res || []);
      }).catch(err => console.error("Error loading top courses:", err)),

      instructorApi.getInstructorUnansweredQuestions({ per_page: 3 }).then(res => {
        const questionsList = Array.isArray(res) ? res : (res?.data?.list?.data || res?.data?.items || res?.data || []);
        setUnansweredQuestions(questionsList);
      }).catch(err => console.error("Error loading unanswered questions:", err)),

      instructorApi.getInstructorIncompleteCourses().then(res => {
        setIncompleteCoursesData(res || []);
      }).catch(err => console.error("Error loading incomplete courses:", err)),

      instructorApi.getInstructorDashboardAlerts({ limit: 3 }).then(res => {
        setDashboardAlerts(res || []);
      }).catch(err => console.error("Error loading dashboard alerts:", err))
    ]);
    setIsSupportingLoading(false);
  };

  const [isAllAlertsExpanded, setIsAllAlertsExpanded] = useState(false);

  const resolveInstructorActionUrl = (actionUrl: string | null | undefined): { tab?: any; action?: () => void } | null => {
    if (!actionUrl) return null;

    const url = actionUrl.trim();

    if (url.includes('/instructor/questions')) {
      return { tab: 'qa' };
    }
    if (url.includes('/instructor/revenues')) {
      return { tab: 'revenue' };
    }
    if (url.includes('/instructor/withdrawals')) {
      return { tab: 'payout' };
    }
    if (url.includes('/instructor/courses')) {
      const courseIdMatch = url.match(/\/instructor\/courses\/(\d+)/);
      if (courseIdMatch) {
        const courseId = courseIdMatch[1];
        return { action: () => handleContinueIncompleteCourse({ id: courseId }) };
      }
      return { tab: 'courses' };
    }

    return null;
  };

  const handleAlertClick = (n: any) => {
    const target = resolveInstructorActionUrl(n.action_url);
    if (target) {
      if (target.action) {
        target.action();
      } else if (target.tab) {
        setActiveTab(target.tab);
      }
    }
  };

  const handleViewAllAlerts = async () => {
    if (isAllAlertsExpanded) {
      setIsAllAlertsExpanded(false);
      loadSupportingSections();
    } else {
      try {
        const res = await instructorApi.getInstructorDashboardAlerts({ limit: 20 });
        setDashboardAlerts(res || []);
        setIsAllAlertsExpanded(true);
      } catch (err) {
        console.error("Error fetching all alerts:", err);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'overview' && sharedApi.getConfig().mode === 'api') {
      loadOverviewData();
      loadSupportingSections();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'overview' && sharedApi.getConfig().mode === 'api') {
      loadRevenueChart(revenueTimeFilter);
    }
  }, [activeTab, revenueTimeFilter]);

  useEffect(() => {
    if (activeTab === 'overview' && sharedApi.getConfig().mode === 'api') {
      loadEnrollmentChart(enrollmentTimeFilter);
    }
  }, [activeTab, enrollmentTimeFilter]);

  // Fetch stats when user changes (Mock mode fallback only)
  useEffect(() => {
    if (currentUser?.id && currentUser.role === 'instructor' && sharedApi.getConfig().mode === 'mock') {
      instructorApi.getInstructorEnrollmentStats(currentUser.id).then(res => {
        setTotalEnrollments(res.totalEnrollments);
      }).catch(err => console.error("Error fetching enrollment stats", err));

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      instructorApi.getInstructorRevenueStats(currentUser.id, { startDate: firstDay }).then(res => {
        setRevenueStats(res);
      }).catch(err => console.error("Error fetching revenue stats", err));

      instructorApi.getInstructorQAStats(currentUser.id).then(res => {
        setOverviewUnansweredQA(res.unansweredCount);
      }).catch(err => console.error("Error fetching qa stats", err));
    }
  }, [currentUser?.id]);

  // Fetch enrollments list when filters change
  useEffect(() => {
    if (!currentUser?.id || activeTab !== 'students') return;
    
    // Debounce logic for search inside effect
    const handler = setTimeout(() => {
      let startDate, endDate;
      const now = new Date();
      if (studentTimeRange === 'today') {
        startDate = new Date(now.setHours(0,0,0,0)).toISOString();
      } else if (studentTimeRange === 'week') {
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate = new Date(firstDay.setHours(0,0,0,0)).toISOString();
      } else if (studentTimeRange === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      } else if (studentTimeRange === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      }
      
      instructorApi.getInstructorEnrollments(currentUser.id, {
        courseId: selectedStudentCourseId || 'all',
        status: studentFilterStatus,
        search: studentSearchQuery,
        minProgress: studentMinProgress,
        maxProgress: studentMaxProgress,
        startDate,
        endDate,
        page: studentPage,
        limit: studentLimit
      }).then(res => {
        setStudentsList(res.data);
        setEnrollmentsMeta(res.meta);
      }).catch(err => console.error("Error fetching enrollments", err));
    }, 500);

    return () => clearTimeout(handler);
  }, [currentUser?.id, activeTab, selectedStudentCourseId, studentFilterStatus, studentSearchQuery, studentMinProgress, studentMaxProgress, studentTimeRange, studentPage, studentLimit]);

  const allInstructorCourses = courses.filter(c => c.instructorId === currentUser.id || c.instructorName === currentUser.name);
  
  const baseOverviewStats = {
    total: allInstructorCourses.filter(c => !(c as any).deleted_at && c.status !== 'archived').length,
    published: allInstructorCourses.filter(c => !(c as any).deleted_at && (c.status === 'active' || (c.status as any) === 'published')).length,
    draft: allInstructorCourses.filter(c => !(c as any).deleted_at && c.status === 'draft').length,
    pending: allInstructorCourses.filter(c => !(c as any).deleted_at && (c.status === 'pending' || (c.status as any) === 'pending_review')).length,
    rejected: allInstructorCourses.filter(c => !(c as any).deleted_at && c.status === 'rejected').length,
  };

  const isApiMode = sharedApi.getConfig().mode === 'api';

  const overviewStats = isApiMode && dashboardOverview
    ? {
        total: dashboardOverview.course_summary?.total || 0,
        published: dashboardOverview.course_summary?.published || 0,
        draft: dashboardOverview.course_summary?.draft || 0,
        pending: dashboardOverview.course_summary?.pending_review || 0,
        rejected: dashboardOverview.course_summary?.rejected || 0,
      }
    : baseOverviewStats;

  const resolveMediaUrl = (path?: string | null): string => {
    if (!path) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800';
    return formatResolveMediaUrl(path);
  };

  const resolveAvatarUrl = (avatarUrl?: string | null, userName?: string) => {
    if (avatarUrl) {
      return resolveMediaUrl(avatarUrl);
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'HV')}&background=007A64&color=fff&bold=true`;
  };

  const formatChartPeriod = (period: string, filterType: string) => {
    if (!period) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
      const parts = period.split('-');
      return `${parts[2]}/${parts[1]}`;
    }
    if (/^\d{4}-\d{2}$/.test(period)) {
      const parts = period.split('-');
      return `T${parts[1]}`;
    }
    return period;
  };

  // --- API DATA MAPPINGS ---
  const activeRevenueChartData = useMemo(() => {
    if (isApiMode && revenueChartData.length > 0) {
      return revenueChartData.map(pt => ({
        name: pt.name || formatChartPeriod(pt.date || pt.period, revenueTimeFilter),
        value: Number(pt.value ?? pt.instructor_amount ?? 0)
      }));
    }
    return [];
  }, [isApiMode, revenueChartData, revenueTimeFilter]);

  const activeEnrollmentChartData = useMemo(() => {
    if (isApiMode && enrollmentChartData.length > 0) {
      return enrollmentChartData.map(pt => ({
        name: pt.name || formatChartPeriod(pt.date || pt.period, enrollmentTimeFilter),
        value: Number(pt.value ?? pt.enrollment_count ?? 0)
      }));
    }
    return [];
  }, [isApiMode, enrollmentChartData, enrollmentTimeFilter]);

  const displayTotalEnrollments = useMemo(() => {
    if (!isApiMode || !dashboardOverview) return totalEnrollments;
    if (enrollmentTimeFilter === 'year') {
      const yearCount = dashboardOverview.enrollment_summary?.new_this_year ?? dashboardOverview.enrollment_summary?.total_students ?? dashboardOverview.enrollment_summary?.total_enrollments;
      if (typeof yearCount === 'number' && yearCount >= 0) {
        return yearCount;
      }
      return activeEnrollmentChartData.reduce((sum, item) => sum + item.value, 0);
    }
    if (enrollmentTimeFilter === 'week') {
      return activeEnrollmentChartData.reduce((sum, item) => sum + item.value, 0);
    }
    const monthCount = dashboardOverview.enrollment_summary?.new_this_month;
    if (typeof monthCount === 'number' && monthCount > 0) {
      return monthCount;
    }
    const overallCount = dashboardOverview.enrollment_summary?.total_students ?? dashboardOverview.enrollment_summary?.total_enrollments;
    return typeof overallCount === 'number' ? overallCount : activeEnrollmentChartData.reduce((sum, item) => sum + item.value, 0);
  }, [isApiMode, dashboardOverview, enrollmentTimeFilter, activeEnrollmentChartData, totalEnrollments]);

  const displayTotalRevenue = useMemo(() => {
    if (!isApiMode || !dashboardOverview) return revenueStats.totalRevenue;
    if (revenueTimeFilter === 'year') {
      const yearAmt = parseFloat(dashboardOverview.revenue_summary?.instructor_amount_this_year || dashboardOverview.revenue_summary?.total_instructor_amount || '0');
      if (yearAmt > 0) {
        return yearAmt;
      }
      return activeRevenueChartData.reduce((sum, item) => sum + item.value, 0);
    }
    if (revenueTimeFilter === 'week') {
      return activeRevenueChartData.reduce((sum, item) => sum + item.value, 0);
    }
    const monthAmt = parseFloat(dashboardOverview.revenue_summary?.instructor_amount_this_month || '0');
    if (monthAmt > 0) {
      return monthAmt;
    }
    const totalAmt = parseFloat(dashboardOverview.revenue_summary?.total_instructor_amount || '0');
    return totalAmt > 0 ? totalAmt : activeRevenueChartData.reduce((sum, item) => sum + item.value, 0);
  }, [isApiMode, dashboardOverview, revenueTimeFilter, activeRevenueChartData, revenueStats.totalRevenue]);

  const displayOverviewBalance = isApiMode && dashboardOverview
    ? parseFloat(dashboardOverview.withdraw_summary?.available_balance || '0')
    : overviewBalance;

  const displayOverviewUnansweredQA = isApiMode
    ? (dashboardOverview?.interaction_summary?.unanswered_questions ?? unansweredQuestions.length)
    : overviewUnansweredQA;

  const revenueChangePercentage = dashboardOverview?.revenue_summary?.change_percentage;
  const enrollmentChangePercentage = dashboardOverview?.enrollment_summary?.change_percentage;

  const recentCourses = [...allInstructorCourses].sort((a, b) => {
    if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  }).slice(0, 5);

  // --- MY COURSES REAL API STATES & FILTERS ---
  const [apiCourses, setApiCourses] = useState<Course[]>([]);
  const [apiCoursesMeta, setApiCoursesMeta] = useState<{ current_page: number; last_page: number; per_page: number; total: number }>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const [courseStatusFilter, setCourseStatusFilter] = useState<string>('all');
  const [courseCategoryFilter, setCourseCategoryFilter] = useState<string>('all');
  const [courseSearchQuery, setCourseSearchQuery] = useState<string>('');
  const [debouncedCourseSearch, setDebouncedCourseSearch] = useState<string>('');
  const [courseSortBy, setCourseSortBy] = useState<string>('newest');
  const [coursePage, setCoursePage] = useState<number>(1);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Course actions state & Modals
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [courseActionLoadingId, setCourseActionLoadingId] = useState<string | null>(null);
  const [courseActionType, setCourseActionType] = useState<'hiding' | 'unhiding' | 'deleting' | null>(null);

  const [hideModalCourse, setHideModalCourse] = useState<Course | null>(null);
  const [deleteModalCourse, setDeleteModalCourse] = useState<Course | null>(null);
  const [deleteErrorSuggestHideCourse, setDeleteErrorSuggestHideCourse] = useState<{ course: Course; message: string } | null>(null);

  const showDashboardToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  const handleConfirmHide = (courseId: string | number) => {
    setCourseActionLoadingId(String(courseId));
    setCourseActionType('hiding');
    setHideModalCourse(null);
    setDeleteErrorSuggestHideCourse(null);

    instructorApi.hideInstructorCourse(courseId)
      .then(() => {
        showDashboardToast('Đã ẩn khóa học.');
        loadInstructorCoursesList();
      })
      .catch(err => {
        showDashboardToast(err.message || 'Lỗi ẩn khóa học.', 'error');
      })
      .finally(() => {
        setCourseActionLoadingId(null);
        setCourseActionType(null);
      });
  };

  const handleConfirmUnhide = (courseId: string | number) => {
    setCourseActionLoadingId(String(courseId));
    setCourseActionType('unhiding');

    instructorApi.unhideInstructorCourse(courseId)
      .then(() => {
        showDashboardToast('Đã hiện lại khóa học.');
        loadInstructorCoursesList();
      })
      .catch(err => {
        showDashboardToast(err.message || 'Lỗi hiện lại khóa học.', 'error');
      })
      .finally(() => {
        setCourseActionLoadingId(null);
        setCourseActionType(null);
      });
  };

  const handleConfirmDelete = (courseId: string | number, targetCourse: Course) => {
    setCourseActionLoadingId(String(courseId));
    setCourseActionType('deleting');
    setDeleteModalCourse(null);

    instructorApi.deleteInstructorCourse(courseId)
      .then(() => {
        showDashboardToast('Đã xóa khóa học.');
        loadInstructorCoursesList();
      })
      .catch(err => {
        if (err.status === 409 || err.code === 'COURSE_HAS_DEPENDENCIES') {
          setDeleteErrorSuggestHideCourse({
            course: targetCourse,
            message: err.message || 'Khóa học đã phát sinh học viên hoặc giao dịch nên không thể xóa. Bạn có thể ẩn khóa học thay thế.'
          });
        } else {
          showDashboardToast(err.message || 'Lỗi xóa khóa học.', 'error');
        }
      })
      .finally(() => {
        setCourseActionLoadingId(null);
        setCourseActionType(null);
      });
  };

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCourseSearch(courseSearchQuery);
      setCoursePage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [courseSearchQuery]);

  // Load categories
  useEffect(() => {
    if (activeTab === 'courses' && sharedApi.getConfig().mode === 'api') {
      categoryApi.getCategories()
        .then(res => {
          const list = Array.isArray(res) ? res : (res as any)?.data || [];
          setCategoriesList(list);
        })
        .catch(err => console.error("Error loading categories:", err));
    }
  }, [activeTab]);

  // Load instructor courses list
  const loadInstructorCoursesList = async () => {
    if (sharedApi.getConfig().mode !== 'api') return;
    setIsCoursesLoading(true);
    setCoursesError(null);
    try {
      const res: any = await instructorApi.getInstructorCourses({
        page: coursePage,
        per_page: 10,
        status: courseStatusFilter,
        search: debouncedCourseSearch,
        sort: courseSortBy,
      });

      const rawItems = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const meta = res.meta || res.data?.meta || {
        current_page: res.data?.current_page || 1,
        last_page: res.data?.last_page || 1,
        per_page: res.data?.per_page || 10,
        total: res.data?.total || rawItems.length,
      };

      const mapped = rawItems.map((item: any) => {
        const categoryName = item.categories && item.categories.length > 0
          ? item.categories[0].name
          : (item.category || 'Chưa phân loại');

        let image = item.thumbnail_url || item.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800';
        if (image && !image.startsWith('http://') && !image.startsWith('https://') && !image.startsWith('data:')) {
          const apiBase = sharedApi.getConfig().baseUrl.replace(/\/api\/?$/, '');
          image = `${apiBase}${image.startsWith('/') ? '' : '/'}${image}`;
        }

        let normalizedStatus = item.status || 'draft';
        if (normalizedStatus === 'published' || normalizedStatus === 'approved') {
          normalizedStatus = 'active';
        } else if (normalizedStatus === 'pending_review') {
          normalizedStatus = 'pending';
        }

        return {
          id: String(item.id),
          title: item.title || 'Khóa học',
          subtitle: item.short_description || '',
          description: item.description || item.short_description || '',
          category: categoryName,
          category_id: item.categories && item.categories.length > 0 ? item.categories[0].id : item.category_id,
          subcategory: '',
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price || 0),
          salePrice: item.sale_price !== null && item.sale_price !== undefined ? parseFloat(item.sale_price) : undefined,
          rating: item.rating ? parseFloat(item.rating) : 5.0,
          reviewCount: item.review_count || item.reviews_count || 0,
          enrolledCount: item.enrollment_count || item.enrollments_count || 0,
          revenue: typeof item.revenue_amount === 'number' ? item.revenue_amount : (parseFloat(item.revenue || '0') || 0),
          revenueAmount: typeof item.revenue_amount === 'number' ? item.revenue_amount : (parseFloat(item.revenue || '0') || 0),
          completionRate: item.completion_percentage || 0,
          image,
          instructorId: String(item.instructor_id || currentUser.id),
          instructorName: currentUser.name,
          instructorTitle: 'Giảng viên chuyên môn tại MindHub',
          instructorAvatar: currentUser.avatar,
          instructorBio: currentUser.bio || '',
          status: normalizedStatus as any,
          rawStatus: item.status,
          statusLabel: item.status_label,
          createdAt: item.created_at || item.createdAt,
          updatedAt: item.updated_at || item.updatedAt,
          is_featured: Boolean(item.is_featured),
          rejectionReason: item.admin_reject_reason || item.rejectionReason,
          chapters: [],
        } as Course;
      });

      let finalMapped = mapped;
      if (courseCategoryFilter !== 'all') {
        finalMapped = mapped.filter((c: any) => String(c.category_id) === String(courseCategoryFilter) || c.category === courseCategoryFilter);
      }

      setApiCourses(finalMapped);
      setApiCoursesMeta(meta);
    } catch (err: any) {
      console.error("Error loading instructor courses:", err);
      setCoursesError(err.message || "Không thể tải danh sách khóa học.");
    } finally {
      setIsCoursesLoading(false);
    }
  };

  const handleToggleCourseFeatured = async (courseId: number | string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await instructorApi.toggleCourseFeatured(Number(courseId), newStatus);
      setToastNotification({ message: newStatus ? 'Đã bật khóa học nổi bật!' : 'Đã tắt khóa học nổi bật!', type: 'success' });
      setTimeout(() => setToastNotification(null), 3000);
      loadInstructorCoursesList();
    } catch (err: any) {
      setToastNotification({ message: err.message || 'Không thể thay đổi trạng thái nổi bật.', type: 'error' });
      setTimeout(() => setToastNotification(null), 4000);
    }
  };

  useEffect(() => {
    if (activeTab === 'courses' && sharedApi.getConfig().mode === 'api') {
      loadInstructorCoursesList();
      loadOverviewData();
    }
  }, [activeTab, coursePage, courseStatusFilter, debouncedCourseSearch, courseSortBy, courseCategoryFilter]);

  // Load categories from API
  useEffect(() => {
    if (sharedApi.getConfig().mode === 'api') {
      categoryApi.getCategories().then((cats: any) => {
        const list = Array.isArray(cats) ? cats : (cats?.data || []);
        if (list.length > 0) {
          setDbCategories(list);
          if (!category || category === 'Development' || isNaN(Number(category))) {
            setCategory(String(list[0].id));
          }
        }
      }).catch(err => console.warn("Failed to fetch categories:", err));
    }
  }, []);

  // Load course details if initial route is /instructor/courses/:id/edit
  useEffect(() => {
    const initRoute = parseRouteFromLocation();
    if (initRoute.tab === 'builder' && initRoute.courseId) {
      startBuilderForEdit(initRoute.courseId, initRoute.step, initRoute.focus, initRoute.sectionId);
    }
  }, []);

  // Listen to browser Back/Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const nextState = parseRouteFromLocation();
      setActiveTab(nextState.tab);
      setBuilderStep(nextState.step);
      setEditingCourseId(nextState.courseId);
      if (nextState.tab === 'builder' && nextState.courseId) {
        startBuilderForEdit(nextState.courseId, nextState.step, nextState.focus, nextState.sectionId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Autosave effect (Debounced 1200ms)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (activeTab !== 'builder' || sharedApi.getConfig().mode !== 'api' || !title.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSavingDraft(true);
      setAutosaveError(null);
      try {
        const selectedCatInt = parseInt(String(category), 10);
        const validCategoryInt = (Number.isInteger(selectedCatInt) && selectedCatInt > 0)
          ? selectedCatInt
          : (dbCategories.length > 0 ? (parseInt(String(dbCategories[0].id), 10) || 1) : 1);

        const calcDiscountPercent = typeof discountPercent === 'number' ? discountPercent : parseInt(String(discountPercent)) || 0;
        const calcFinalPrice = (hasDiscount && calcDiscountPercent >= 1 && calcDiscountPercent <= 99)
          ? Math.round((Number(price) * (100 - calcDiscountPercent)) / 100)
          : Number(price);

        const normalizedLvl = level === 'expert' ? 'advanced' : level;
        const payload = {
          title: title.trim(),
          slug: slug.trim() || undefined,
          category_id: validCategoryInt,
          category_ids: [validCategoryInt],
          course_level: normalizedLvl,
          level: normalizedLvl,
          language,
          subtitle,
          short_description: subtitle || title.trim(),
          description,
          original_price: Number(price) || 0,
          price: Number(price) || 0,
          has_discount: hasDiscount,
          discount_percent: hasDiscount && calcDiscountPercent >= 1 && calcDiscountPercent <= 99 ? calcDiscountPercent : null,
          sale_price: calcFinalPrice,
          salePrice: calcFinalPrice,
          image,
          thumbnail_url: image || undefined,
          introVideoUrl,
          intro_video_url: introVideoUrl || undefined,
          requirements,
          willLearn,
          outcomes: willLearn,
        };

        if (editingCourseId) {
          await instructorApi.updateCourseDraft(editingCourseId, payload);
          updateRouteUrl('builder', editingCourseId, builderStep, true);
        } else {
          const res = await instructorApi.createCourseDraft(payload);
          const newId = String(res.data?.id || res.id);
          if (newId) {
            setEditingCourseId(newId);
            updateRouteUrl('builder', newId, builderStep, true);
          }
        }
        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setLastSavedTime(timeStr);
      } catch (err: any) {
        console.warn("Autosave failed:", err);
        setAutosaveError(err.message || "Tự động lưu thất bại.");
      } finally {
        setIsSavingDraft(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [title, subtitle, description, category, price, hasDiscount, discountPercent, salePrice, image, introVideoUrl, requirements, willLearn, slug, level, language, builderStep]);

  const rawInstructorCourses = courses.filter(c => c.instructorName === currentUser.name && c.status !== 'archived');
  const filteredInstructorCourses = rawInstructorCourses.filter(c => {
    if (courseSearchQuery.trim() && !c.title.toLowerCase().includes(courseSearchQuery.toLowerCase())) {
      return false;
    }
    if (courseStatusFilter === 'all') return true;
    if (courseStatusFilter === 'draft') return c.status === 'draft';
    if (courseStatusFilter === 'pending') return c.status === 'pending';
    if (courseStatusFilter === 'rejected') return c.status === 'rejected';
    if (courseStatusFilter === 'active') return c.status === 'active' && !c.isHidden;
    if (courseStatusFilter === 'hidden') return c.isHidden;
    return true;
  });

  const displayedCourses = isApiMode ? apiCourses : filteredInstructorCourses;
  const totalCoursesCount = isApiMode ? (apiCoursesMeta.total || apiCourses.length) : filteredInstructorCourses.length;
  const totalStudents = rawInstructorCourses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const mockupAverageCompletion = Math.round(rawInstructorCourses.reduce((sum, c) => sum + c.completionRate, 0) / (rawInstructorCourses.length || 1));

  // --- AUTO PROGRESS PERSISTENCE ---
  useEffect(() => {
    // Attempt auto load progress draft from localStorage
    const savedDraft = localStorage.getItem('mindhub_course_creation_draft');
    if (savedDraft) {
      try {
        const data = JSON.parse(savedDraft);
        // We do not load automatically to prevent overriding, but offer a recovery button
      } catch (err) {}
    }
  }, []);

  // Save current step variables to draft state
  const handleSaveDraftToLocal = () => {
    const draftData = {
      title, subtitle, description, category, subcategory, price, hasDiscount, discountPercent, salePrice, image,
      requirements, willLearn, chapters, allowSkip, allowDownload, allowDiscussion, giveCertificate
    };
    localStorage.setItem('mindhub_course_creation_draft', JSON.stringify(draftData));
    alert('Đã lưu nháp trạng thái hiện tại thành công vào bộ nhớ trình duyệt! Bạn có thể khôi phục tiến độ bất kỳ lúc nào.');
  };

  const handleRestoreDraftFromLocal = () => {
    const savedDraft = localStorage.getItem('mindhub_course_creation_draft');
    if (!savedDraft) {
      alert('Không tìm thấy bản nháp lưu trữ nào gần đây.');
      return;
    }
    try {
      const data = JSON.parse(savedDraft);
      setTitle(data.title || '');
      setSubtitle(data.subtitle || '');
      setDescription(data.description || '');
      setCategory(data.category || 'Development');
      setSubcategory(data.subcategory || '');
      setPrice(data.price || 500000);
      setHasDiscount(Boolean(data.hasDiscount));
      setDiscountPercent(data.discountPercent !== undefined && data.discountPercent !== null ? data.discountPercent : '');
      setSalePrice(data.salePrice || 350000);
      setImage(data.image || '');
      setRequirements(data.requirements || []);
      setWillLearn(data.willLearn || []);
      setChapters(data.chapters || []);
      setAllowSkip(data.allowSkip !== undefined ? data.allowSkip : true);
      setAllowDownload(data.allowDownload || false);
      setAllowDiscussion(data.allowDiscussion !== undefined ? data.allowDiscussion : true);
      setGiveCertificate(data.giveCertificate || false);
      alert('Đã đồng bộ và khôi phục bản nháp khóa học thành công!');
    } catch (e) {
      alert('Gặp lỗi khi giải mã bản nháp lưu trữ.');
    }
  };

  const handleAddNewRequirement = () => {
    if (!newRequirement.trim()) return;
    setRequirements([...requirements, newRequirement.trim()]);
    setNewRequirement('');
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleAddNewWillLearn = () => {
    if (!newWillLearn.trim()) return;
    setWillLearn([...willLearn, newWillLearn.trim()]);
    setNewWillLearn('');
  };

  const handleRemoveWillLearn = (idx: number) => {
    setWillLearn(willLearn.filter((_, i) => i !== idx));
  };

  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) return;
    const newCh: Chapter = {
      id: 'ch-' + Date.now(),
      title: newChapterTitle.trim(),
      lessons: []
    };
    setChapters([...chapters, newCh]);
    setSelectedChapterIndex(chapters.length);
    setNewChapterTitle('');
  };

  const handleRemoveChapter = (chapterIdx: number) => {
    setChapters(chapters.filter((_, idx) => idx !== chapterIdx));
    if (selectedChapterIndex >= chapterIdx && selectedChapterIndex > 0) {
      setSelectedChapterIndex(selectedChapterIndex - 1);
    }
  };

  const moveChapter = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === chapters.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...chapters];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setChapters(updated);
    setSelectedChapterIndex(targetIdx);
  };

  const handleAddLessonToChapter = () => {
    if (!newLessonTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài học.');
      return;
    }
    if (chapters.length === 0) {
      alert('Hãy khởi tạo ít nhất một chương học trước.');
      return;
    }

    if (editingLessonId) {
      // Edit mode: Update existing lesson
      const updated = chapters.map((ch, idx) => {
        if (idx === selectedChapterIndex) {
          return {
            ...ch,
            lessons: ch.lessons.map(l => l.id === editingLessonId ? {
              ...l,
              title: newLessonTitle.trim(),
              type: newLessonType,
              duration: newLessonDuration || '15:00',
              videoUrl: newLessonType === 'video' ? newLessonVideoUrl : undefined,
              docContent: newLessonType === 'doc' ? newLessonDocContent : undefined,
              content: newLessonType === 'doc' ? newLessonDocContent : 'Bài học video từ giảng viên.',
              isPreview: newLessonIsPreview,
            } : l)
          };
        }
        return ch;
      });

      setChapters(updated);
      setNewLessonTitle('');
      setNewLessonVideoUrl('');
      setNewLessonDocContent('');
      setNewLessonIsPreview(false);
      setEditingLessonId(null);
      alert('Đề cương bài học đã được cập nhật thành công!');
    } else {
      // Add mode: Create new lesson
      const newLesId = 'les-' + Date.now();
      const newLes: Lesson = {
        id: newLesId,
        title: newLessonTitle.trim(),
        type: newLessonType,
        duration: newLessonDuration || '00:00',
        video_duration_seconds: newLessonDuration ? (newLessonDuration.split(':').reduce((acc, time) => (60 * acc) + +time, 0)) : 0,
        videoUrl: newLessonType === 'video' ? newLessonVideoUrl : undefined,
        docContent: newLessonType === 'doc' ? newLessonDocContent : undefined,
        content: newLessonType === 'doc' ? newLessonDocContent : 'Bài học video từ giảng viên.',
        quiz: undefined,
        isPreview: newLessonIsPreview,
      };

      const updated = chapters.map((ch, idx) => {
        if (idx === selectedChapterIndex) {
          return {
            ...ch,
            lessons: [...ch.lessons, newLes]
          };
        }
        return ch;
      });

      setChapters(updated);
      setNewLessonTitle('');
      setNewLessonVideoUrl('');
      setNewLessonDocContent('');
      setNewLessonIsPreview(false);
      alert('Đã thêm bài học vào giáo trình thành công!');
    }
  };

  const handleSimulateVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVideoUploading(true);
    setVideoUploadProgress(0);
    setVideoUploadStatus('Khởi tạo kết nối lưu trữ media...');

    // If Mode is Mock, we want to simulate some progression with descriptive status.
    // If Mode is API, instructorApi.uploadLessonVideo will directly execute an actual XMLHttpRequest with progress events!
    const isMock = sharedApi.getConfig().mode === 'mock';
    
    if (isMock) {
      let currentProg = 0;
      const interval = setInterval(() => {
        currentProg += 15 + Math.floor(Math.random() * 12);
        if (currentProg >= 100) {
          currentProg = 100;
          clearInterval(interval);
          setVideoUploadProgress(100);
          setVideoUploadStatus('Đã kết hợp luồng m3u8! Đang lưu dạng Adaptive HLS...');
          
          setTimeout(() => {
            setIsVideoUploading(false);
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            setNewLessonVideoUrl(`https://mindhub-cdn.example.com/videos/${Date.now()}_${sanitizedName}/stream.m3u8`);
            setNewLessonTitle(prev => prev || file.name.substring(0, file.name.lastIndexOf('.')) || 'Bài học video mới');
            setNewLessonDuration('12:45');
            alert(`🎉 [MOCK] Đã upload video "${file.name}" thành công theo chuẩn truyền phát HLS DRM!`);
          }, 1000);
        } else {
          setVideoUploadProgress(currentProg);
          if (currentProg > 75) {
            setVideoUploadStatus(`Đang chuyển mã video adaptive... (${currentProg}%)`);
          } else if (currentProg > 40) {
            setVideoUploadStatus(`Đang truyền phân đoạn chunk video... (${currentProg}%)`);
          } else {
            setVideoUploadStatus(`Đang phân cấp bitrate tối ưu... (${currentProg}%)`);
          }
        }
      }, 200);
    } else {
      // Real API Upload
      instructorApi.uploadLessonVideoWithProgress(file, (progress, status) => {
        setVideoUploadProgress(progress);
        setVideoUploadStatus(status);
      })
      .then(res => {
        setIsVideoUploading(false);
        setNewLessonVideoUrl(res.videoUrl);
        setNewLessonTitle(prev => prev || file.name.substring(0, file.name.lastIndexOf('.')) || 'Bài học video mới');
        setNewLessonDuration(res.duration || '12:45');
        alert(`🎉 [REAL API] Đã xử lý & upload video "${file.name}" thành công! \nĐường dẫn stream: ${res.videoUrl}`);
      })
      .catch(err => {
        setIsVideoUploading(false);
        alert(`❌ Tải video lỗi: ${err.message}. \nHãy kiểm tra cấu hình CORS/Base URL ở tab Kết nối Backend API.`);
      });
    }
  };

  const handleRemoveLesson = (chapterIdx: number, lesId: string) => {
    setChapters(chapters.map((ch, idx) => {
      if (idx === chapterIdx) {
        return {
          ...ch,
          lessons: ch.lessons.filter(l => l.id !== lesId)
        };
      }
      return ch;
    }));
  };

  // Quick simulation of file upload (.doc Content template)
  const handleSimulateDocUpload = () => {
    const simulatedDocContents = 
`[TÀI LIỆU DỰ ÁN MINDHUB]
ĐỀ CƯƠNG CHI TIẾT VÀ BÀI TẬP VỀ NHÀ

1. KHÁI NIỆM TRỌNG TÂM:
Học phần này giới thiệu về các cấu trúc rèn luyện, liên hoan nâng cao hiệu năng trong viết code Javascript và kiến trúc hướng luồng.

2. CÁC BƯỚC THỰC HIỆN:
- Bước 1: Khởi tạo Project & cấu hình package.json
- Bước 2: Thiết kế sơ đồ quan hệ database thực thể
- Bước 3: Triển khai kiểm tra logic bảo mât API endpoints.

3. ĐỀ BÀI SÁT HẠCH:
Hãy viết một hàm đệ quy để giải quyết bài toán lồng thư mục và tối ưu hóa thời gian chạy O(n).`;

    setNewLessonDocContent(simulatedDocContents);
    setNewLessonType('doc');
    setNewLessonDuration('15 phút');
    alert('Đã tải lên và đọc nội dung văn bản gốc từ file Word .doc thành công!');
  };



  // Launch unified wizard screen
  const startBuilderForCreate = () => {
    setEditingCourseId(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    
    // Suggest category based on instructor expertise if matching
    let initialCatId = dbCategories.length > 0 ? String(dbCategories[0].id) : '1';
    if (currentUser?.expertise && dbCategories.length > 0) {
      const exp = currentUser.expertise.toLowerCase();
      const matched = dbCategories.find((c: any) => exp.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(exp));
      if (matched) {
        initialCatId = String(matched.id);
      }
    }
    setCategory(initialCatId);

    setSubcategory('');
    setPrice(500000);
    setHasDiscount(false);
    setDiscountPercent('');
    setSalePrice(500000);
    setImage('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800');
    setRequirements(['Có máy tính cá nhân kết nối Internet']);
    setWillLearn(['Lập trình thành thạo ngôn ngữ ứng dụng với thực tế']);
    setChapters([]);
    setAllowSkip(true);
    setAllowDownload(false);
    setAllowDiscussion(true);
    setGiveCertificate(false);
    setAllowFreeDoc(false);
    setAllowFreeVideo(false);
    setFreeVideoDuration(30);
    setFaqs([]);
    setSlug('');
    setIsManualSlug(false);
    setLevel('beginner');
    setLanguage('vi');
    setIntroVideoUrl('');
    setLastSavedTime(null);
    setAutosaveError(null);
    setBuilderStep(1);
    setActiveTab('builder');
    updateRouteUrl('builder', null, 1);
  };

  const startBuilderForEdit = async (
    courseOrId: Course | string | number,
    initialStep: number | string = 1,
    focusTarget: string | null = null,
    sectionId: string | number | null = null
  ) => {
    const courseId = typeof courseOrId === 'object' ? String(courseOrId.id) : String(courseOrId);
    const courseObj = typeof courseOrId === 'object' ? courseOrId : courses.find(c => String(c.id) === courseId);

    let targetStep = 1;
    if (typeof initialStep === 'string') {
      targetStep = initialStep === 'pricing' ? 2 : initialStep === 'media' ? 3 : initialStep === 'curriculum' ? 4 : 1;
    } else {
      targetStep = Math.max(1, Math.min(4, Number(initialStep) || 1));
    }

    setEditingCourseId(courseId);
    setBuilderStep(targetStep);
    setActiveTab('builder');
    if (focusTarget) {
      setPendingFocusTarget(focusTarget);
    }
    updateRouteUrl('builder', courseId, targetStep, false, focusTarget, sectionId);

    if (sharedApi.getConfig().mode === 'api') {
      try {
        const res = await instructorApi.getCourseDetail(courseId);
        const detail = res.data || res;
        setTitle(detail.title || courseObj?.title || '');
        setSubtitle(detail.short_description || courseObj?.subtitle || '');
        setDescription(detail.description || courseObj?.description || '');
        if (detail.categories && detail.categories.length > 0) {
          setCategory(String(detail.categories[0].id));
        } else if (detail.category_id) {
          setCategory(String(detail.category_id));
        } else {
          setCategory(courseObj?.category || '1');
        }
        const loadedPrice = typeof detail.price === 'number' ? detail.price : parseFloat(detail.price || 0);
        setPrice(loadedPrice);

        const loadedSalePrice = detail.sale_price !== null && detail.sale_price !== undefined
          ? parseFloat(detail.sale_price)
          : (courseObj?.salePrice !== undefined && courseObj?.salePrice !== null ? courseObj.salePrice : null);
        
        let loadedDiscountPercent: number | null = detail.discount_percent !== undefined && detail.discount_percent !== null
          ? Number(detail.discount_percent)
          : (courseObj?.discount_percent !== undefined && courseObj?.discount_percent !== null ? Number(courseObj.discount_percent) : null);

        if ((loadedDiscountPercent === null || loadedDiscountPercent === undefined) && loadedSalePrice !== null && loadedSalePrice < loadedPrice && loadedPrice > 0) {
          loadedDiscountPercent = Math.round(((loadedPrice - loadedSalePrice) / loadedPrice) * 100);
        }

        if (loadedDiscountPercent && loadedDiscountPercent > 0 && loadedDiscountPercent < 100) {
          setHasDiscount(true);
          setDiscountPercent(loadedDiscountPercent);
          setSalePrice(loadedSalePrice !== null ? loadedSalePrice : Math.round(loadedPrice * (100 - loadedDiscountPercent) / 100));
        } else {
          setHasDiscount(false);
          setDiscountPercent('');
          setSalePrice(loadedPrice);
        }
        setImage(detail.thumbnail_url || courseObj?.image || '');
        setIntroVideoUrl(detail.intro_video_url || courseObj?.introVideoUrl || '');
        setSlug(detail.slug || courseObj?.slug || '');
        setIsManualSlug(true);

        const rawLvl = detail.course_level || detail.level || courseObj?.level || 'beginner';
        const normalizedLvl = rawLvl === 'expert' ? 'advanced' : rawLvl;
        setLevel(normalizedLvl);

        setLanguage(detail.language || courseObj?.language || 'vi');

        let reqs = courseObj?.requirements || [];
        if (typeof detail.requirements === 'string') {
          try { reqs = JSON.parse(detail.requirements); } catch { reqs = [detail.requirements]; }
        }
        setRequirements(Array.isArray(reqs) ? reqs : []);

        let outcomes = courseObj?.willLearn || [];
        if (typeof detail.outcomes === 'string') {
          try { outcomes = JSON.parse(detail.outcomes); } catch { outcomes = [detail.outcomes]; }
        }
        setWillLearn(Array.isArray(outcomes) ? outcomes : []);

        // Load full course curriculum (sections & lessons) from Backend content API
        try {
          const contentRes = await instructorApi.getCourseContent(courseId);
          const contentData = contentRes?.data || contentRes;
          const rawSections = contentData?.sections || [];
          if (Array.isArray(rawSections) && rawSections.length > 0) {
            const loadedChapters = rawSections.map((sec: any) => ({
              id: sec.id,
              title: sec.title,
              description: sec.description || '',
              sort_order: sec.sort_order || 1,
              status: sec.status || 'published',
              lessons: (sec.lessons || []).map((les: any) => mapLesson(les))
            }));
            setChapters(loadedChapters);
          } else {
            setChapters(courseObj?.chapters || []);
          }
        } catch (contentErr) {
          console.warn("Could not fetch course content sections, using fallback:", contentErr);
          setChapters(courseObj?.chapters || []);
        }
      } catch (err) {
        console.error("Failed to load course detail for edit:", err);
      }
    } else if (courseObj) {
      setTitle(courseObj.title);
      setSubtitle(courseObj.subtitle || '');
      setDescription(courseObj.description || '');
      setCategory(courseObj.category || 'Development');
      setSubcategory(courseObj.subcategory || '');
      const loadedPrice = courseObj.price || 0;
      setPrice(loadedPrice);

      let loadedDiscountPercent = courseObj.discount_percent ?? courseObj.discountPercent ?? null;
      const loadedSalePrice = courseObj.salePrice !== undefined && courseObj.salePrice !== null ? courseObj.salePrice : loadedPrice;
      if ((loadedDiscountPercent === null || loadedDiscountPercent === undefined) && loadedSalePrice < loadedPrice && loadedPrice > 0) {
        loadedDiscountPercent = Math.round(((loadedPrice - loadedSalePrice) / loadedPrice) * 100);
      }

      if (loadedDiscountPercent && loadedDiscountPercent > 0 && loadedDiscountPercent < 100) {
        setHasDiscount(true);
        setDiscountPercent(loadedDiscountPercent);
        setSalePrice(loadedSalePrice);
      } else {
        setHasDiscount(false);
        setDiscountPercent('');
        setSalePrice(loadedPrice);
      }
      setImage(courseObj.image);
      setRequirements(courseObj.requirements || []);
      setWillLearn(courseObj.willLearn || []);
      setChapters(courseObj.chapters || []);
      setAllowSkip(courseObj.allowSkip !== undefined ? courseObj.allowSkip : true);
      setAllowDownload(courseObj.allowDownload || false);
      setAllowDiscussion(courseObj.allowDiscussion !== undefined ? courseObj.allowDiscussion : true);
      setGiveCertificate(courseObj.giveCertificate || false);
      setAllowFreeDoc(courseObj.allowFreeDoc || false);
      setAllowFreeVideo(courseObj.allowFreeVideo || false);
      setFreeVideoDuration(courseObj.freeVideoDuration || 30);
      setFaqs(courseObj.faqs || []);
      setSlug(courseObj.slug || '');
      setLevel(courseObj.level || 'beginner');
      setLanguage(courseObj.language || 'vi');
      setIntroVideoUrl(courseObj.introVideoUrl || '');
    }
  };

  const handleContinueIncompleteCourse = (ic: any) => {
    const courseId = String(ic.id);

    if (ic.status === 'rejected') {
      setCourseStatusFilter('rejected');
      setActiveTab('courses');
      return;
    }

    const nextStepObj = ic.next_step || ic.raw?.next_step;
    const firstMissingKey = Array.isArray(ic.missing_items) && ic.missing_items.length > 0
      ? (typeof ic.missing_items[0] === 'object' ? ic.missing_items[0].key : ic.missing_items[0])
      : null;

    let targetStep = 1;
    let focusTarget: string | null = null;
    let sectionId = nextStepObj?.section_id || null;

    if (nextStepObj) {
      targetStep = nextStepObj.route_step || (
        nextStepObj.step === 'pricing' ? 2 : nextStepObj.step === 'media' ? 3 : nextStepObj.step === 'curriculum' ? 4 : 1
      );
      focusTarget = nextStepObj.focus || nextStepObj.key;
    } else if (firstMissingKey && COURSE_COMPLETION_STEP_MAP[firstMissingKey]) {
      const mapped = COURSE_COMPLETION_STEP_MAP[firstMissingKey];
      targetStep = mapped.step;
      focusTarget = mapped.focus;
    }

    startBuilderForEdit(courseId, targetStep, focusTarget, sectionId);
  };

  const handleFinishCoursePublish = async () => {
    if (!title.trim() || !description.trim()) {
      setSubmitErrorModalState({
        isOpen: true,
        title: 'Thông tin chưa đầy đủ',
        message: 'Vui lòng hoàn thành điền Tên khóa học và Mô tả chi tiết ở Bước 1 trước khi gửi duyệt.',
        status: 400,
        errors: {
          title: !title.trim() ? ['Tiêu đề khóa học là bắt buộc'] : [],
          description: !description.trim() ? ['Mô tả chi tiết khóa học là bắt buộc'] : [],
        },
      });
      setBuilderStep(1);
      return;
    }

    if (sharedApi.getConfig().mode === 'api') {
      try {
        setIsSavingDraft(true);
        let courseId = editingCourseId;
        const selectedCatInt = parseInt(String(category), 10);
        const validCategoryInt = (Number.isInteger(selectedCatInt) && selectedCatInt > 0)
          ? selectedCatInt
          : (dbCategories.length > 0 ? (parseInt(String(dbCategories[0].id), 10) || 1) : 1);

        const currentDiscountPercent = typeof discountPercent === 'number' ? discountPercent : parseInt(String(discountPercent)) || 0;
        const currentFinalPrice = (hasDiscount && currentDiscountPercent >= 1 && currentDiscountPercent <= 99)
          ? Math.round((Number(price) * (100 - currentDiscountPercent)) / 100)
          : Number(price);

        const normalizedLvl = level === 'expert' ? 'advanced' : (level || 'beginner');
        const payload = {
          title: title.trim(),
          slug: slug.trim() || undefined,
          category_id: validCategoryInt,
          category_ids: [validCategoryInt],
          course_level: normalizedLvl,
          level: normalizedLvl,
          language: language || 'vi',
          short_description: subtitle || title.trim(),
          subtitle: subtitle || title.trim(),
          description: description.trim(),
          original_price: Number(price) || 0,
          price: Number(price) || 0,
          has_discount: hasDiscount,
          discount_percent: hasDiscount && currentDiscountPercent >= 1 && currentDiscountPercent <= 99 ? currentDiscountPercent : null,
          sale_price: currentFinalPrice,
          salePrice: currentFinalPrice,
          image,
          thumbnail_url: image || undefined,
          introVideoUrl,
          intro_video_url: introVideoUrl || undefined,
          requirements: Array.isArray(requirements) ? requirements.filter(Boolean).join('\n') : (requirements || ''),
          willLearn: Array.isArray(willLearn) ? willLearn.filter(Boolean).join('\n') : (willLearn || ''),
          outcomes: Array.isArray(willLearn) ? willLearn.filter(Boolean).join('\n') : (willLearn || ''),
        };

        if (!courseId) {
          const res = await instructorApi.createCourseDraft(payload);
          courseId = String(res.data?.id || res.id);
          setEditingCourseId(courseId);
        } else {
          await instructorApi.updateCourseDraft(courseId, payload);
        }

        // Synchronize chapters (sections & lessons) to Backend if present in state
        if (chapters && chapters.length > 0 && courseId) {
          for (let sIdx = 0; sIdx < chapters.length; sIdx++) {
            const ch = chapters[sIdx];
            let secId = ch.id;
            if (!secId || String(secId).startsWith('sec-') || isNaN(Number(secId))) {
              const createdSec = await instructorApi.createSection({
                course_id: Number(courseId),
                title: ch.title,
                sort_order: sIdx + 1,
              });
              secId = createdSec.data?.id || createdSec.id;
            } else {
              await instructorApi.updateSection(secId, {
                title: ch.title,
                sort_order: sIdx + 1,
              });
            }

            if (ch.lessons && ch.lessons.length > 0) {
              for (let lIdx = 0; lIdx < ch.lessons.length; lIdx++) {
                const les = ch.lessons[lIdx];
                const lessonPayload = {
                  course_id: Number(courseId),
                  course_section_id: Number(secId),
                  title: les.title,
                  lesson_type: les.lesson_type || les.type || 'video',
                  sort_order: lIdx + 1,
                  is_preview: les.is_preview ?? les.isPreview ?? false,
                  video_url: les.video_url || les.videoUrl || undefined,
                  video_duration_seconds: les.video_duration_seconds ?? (les as any).duration_seconds ?? 0,
                  content: les.content || les.docContent || undefined,
                };
                if (!les.id || String(les.id).startsWith('les-') || isNaN(Number(les.id))) {
                  await instructorApi.createLesson(lessonPayload);
                } else {
                  await instructorApi.updateLesson(les.id, lessonPayload);
                }
              }
            }
          }
        }

        await instructorApi.submitCourseToAdminVerification(courseId);
        alert('Đã gửi yêu cầu duyệt khóa học thành công! Khóa học đã được chuyển sang trạng thái Chờ duyệt (pending_review).');
        loadInstructorCoursesList();
        setActiveTab('courses');
      } catch (err: any) {
        console.error("Error submitting course for review:", err);
        setSubmitErrorModalState({
          isOpen: true,
          title: 'Gửi duyệt khóa học thất bại',
          message: err.message || 'Khóa học chưa đủ điều kiện để gửi duyệt. Vui lòng hoàn thiện các thông tin cơ bản, danh mục, chương học và bài học.',
          status: err.status || 400,
          errors: err.errors || null,
        });
      } finally {
        setIsSavingDraft(false);
      }
    } else {
      const payload: Course = {
        id: editingCourseId || 'course-' + Date.now(),
        title,
        subtitle: subtitle || 'Nhãn phụ chi tiết khóa học mới',
        description,
        category,
        subcategory: subcategory || 'Chuyên gia nâng cao',
        price,
        salePrice,
        rating: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.rating || 4.8) : 5.0,
        reviewCount: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.reviewCount || 1) : 0,
        enrolledCount: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.enrolledCount || 10) : 0,
        completionRate: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.completionRate || 92) : 0,
        image,
        instructorId: currentUser.id,
        instructorName: currentUser.name,
        instructorTitle: 'Giảng viên chuyên môn tại MindHub',
        instructorAvatar: currentUser.avatar,
        instructorBio: currentUser.bio || 'Chuyên gia giảng dạy công nghệ thực tiễn.',
        chapters,
        requirements,
        willLearn,
        status: 'pending',
        allowSkip,
        allowDownload,
        allowDiscussion,
        giveCertificate,
        allowFreeDoc,
        allowFreeVideo,
        freeVideoDuration,
        reviews: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.reviews || []) : [],
        faqs: faqs,
        isHidden: false,
        slug,
        level,
        language,
        introVideoUrl
      };

      if (editingCourseId) {
        onUpdateCourse(payload);
        alert('Đã cập nhật chỉnh sửa khóa học thành công! Giáo án đã được chuyển sang trạng thái chờ duyệt thẩm định.');
      } else {
        onCreateCourseDraft(payload);
        alert('Đã khởi tạo khóa học mới thành công! Giáo án đã được chuyển lên Ban Kế Hoạch Kiểm Duyệt thẩm định xuất bản.');
      }

      localStorage.removeItem('mindhub_course_creation_draft');
      setActiveTab('courses');
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleGradeSubmission = (submissionId: string, points: number, feedback: string) => {
    setGradingSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return { ...s, points, feedback };
      }
      return s;
    }));
    alert(`Đã chấm điểm thành công: ${points}/100!`);
  };

  const activeTopCourses = useMemo(() => {
    if (isApiMode && topCoursesData.length > 0) {
      return topCoursesData.map((c, idx) => {
        const matchingCourse = courses.find(item => String(item.id) === String(c.course_id));
        const levelLabel = c.level === 'intermediate' ? 'Trung cấp' : c.level === 'advanced' ? 'Nâng cao' : (c.level === 'beginner' ? 'Cơ bản' : (matchingCourse?.level || 'Cơ bản'));
        const enrolled = c.enrollment_count ?? c.unique_learner_count ?? c.studentCount ?? 0;
        const revSource = c.revenue ?? c.instructor_revenue ?? c.gross_revenue;
        const rawRev = typeof revSource === 'number' ? revSource : parseFloat(String(revSource || '0').replace(/[^0-9.-]/g, ''));
        const safeRev = Number.isFinite(rawRev) ? rawRev : 0;
        return {
          id: String(c.course_id),
          rank: c.rank || (idx + 1),
          title: c.title,
          level: levelLabel,
          enrolledCount: enrolled,
          revenue: safeRev,
          price: c.price || matchingCourse?.price || 0,
          image: c.thumbnail_url ? resolveMediaUrl(c.thumbnail_url) : (matchingCourse?.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800')
        };
      });
    }
    return [];
  }, [isApiMode, topCoursesData, courses]);

  const activeUnansweredQuestions = useMemo(() => {
    if (isApiMode && unansweredQuestions.length > 0) {
      return unansweredQuestions.map(q => ({
        id: String(q.id),
        userName: q.learner?.full_name || 'Học viên',
        avatar: resolveAvatarUrl(q.learner?.avatar_url, q.learner?.full_name),
        courseTitle: q.course?.title || 'Khóa học',
        question: q.content,
        time: q.created_at ? new Date(q.created_at).toLocaleDateString('vi-VN') : 'Vừa xong'
      }));
    }
    return [];
  }, [isApiMode, unansweredQuestions]);

  const activeIncompleteCourses = useMemo(() => {
    if (isApiMode && incompleteCoursesData.length > 0) {
      return incompleteCoursesData
        .filter(ic => {
          const rawMissing = ic.missing_items || [];
          const cleanMissing = rawMissing.filter((m: any) => {
            const key = typeof m === 'object' ? m.key : m;
            return key !== 'quiz' && key !== 'quizzes' && key !== 'quiz_question';
          });
          const pct = ic.completion_percent ?? ic.completion_percentage ?? 0;
          if (cleanMissing.length === 0 || pct === 100) {
            return false;
          }
          return true;
        })
        .map(ic => {
          const cleanMissing = (ic.missing_items || []).filter((m: any) => {
            const key = typeof m === 'object' ? m.key : m;
            return key !== 'quiz' && key !== 'quizzes' && key !== 'quiz_question';
          });
          const nextStepObj = (ic.next_step && ic.next_step.key !== 'quiz' && ic.next_step.key !== 'quizzes') ? ic.next_step : null;
          const pct = ic.completion_percent ?? ic.completion_percentage ?? 0;

          return {
            id: String(ic.id),
            title: ic.title,
            status: ic.status,
            progress: pct,
            completed_items: ic.completed_items ?? 0,
            total_items: ic.total_items ?? 0,
            missing_items: cleanMissing,
            next_step: nextStepObj,
            action_label: ic.action_label || (pct === 0 ? 'Bắt đầu cập nhật' : ic.status === 'rejected' ? 'Xem lý do' : pct === 100 ? 'Gửi duyệt' : 'Tiếp tục cập nhật'),
            raw: ic
          };
        });
    }
    return [];
  }, [isApiMode, incompleteCoursesData]);

  const activeNotifications = useMemo(() => {
    if (isApiMode && dashboardAlerts.length > 0) {
      return dashboardAlerts.map((n, idx) => ({
        id: String(n.id || idx),
        type: n.type,
        title: n.title || 'Thông báo',
        content: n.message || n.title,
        action_url: n.action_url || null,
        read_at: n.read_at || null,
        time: n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN') : 'Vừa xong',
        raw: n
      }));
    }
    return [];
  }, [isApiMode, dashboardAlerts]);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-main-darker animate-fade-in font-sans instructor-theme">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        
        {/* Standarized Instructor Sidebar Component */}
        <InstructorSidebar 
          activeKey={activeNavKey}
          onNavigate={handleSidebarNavigate}
          isOpenMobile={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Main Content Area Container */}
        <main className="flex-1 min-w-0 flex flex-col bg-slate-50/40">
          
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-100 px-6 flex justify-between items-center shrink-0 relative z-30 pointer-events-auto">
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-stone-600 cursor-pointer mr-1"
                aria-label="Mở menu di động"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-stone-400">Giảng viên</span>
              <ChevronRight className="w-3 h-3 text-stone-300" />
              <span className="text-xs font-extrabold text-stone-750">
                {getBreadcrumbLabel(activeNavKey)}
              </span>
            </div>
          
          <div className="flex items-center gap-4">
            <button 
              type="button"
              aria-label="Xem trang học viên"
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  navigate('/');
                }
              }}
              className="text-[10px] font-bold text-stone-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-stone-500" /> Xem trang học viên
            </button>
            
            <InstructorNotificationDropdown 
              unreadCount={unreadNotificationCount}
              onUnreadCountChange={(newCount) => setUnreadNotificationCount(newCount)}
              onViewAllNotifications={() => {
                handleTabChange('security');
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/instructor/profile?tab=notifications');
                }
              }}
            />
            
            <div className="h-8 w-[1px] bg-slate-100" />
            
            <InstructorUserDropdown
              currentUser={currentUser}
              onNavigateProfile={() => handleTabChange('security')}
              onNavigateDashboard={() => handleTabChange('overview')}
              onCloseParent={onClose}
            />
          </div>
        </header>

        {/* Vùng nội dung chính */}
        <div className="w-full p-6 space-y-6">
          
          {/* Defs for chart gradients */}
          <svg className="hidden">
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
          </svg>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in text-xs text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    Tổng quan giảng viên 👋
                  </h3>
                  <p className="text-[10px] text-stone-400 font-bold mt-1">Chào mừng bạn quay lại, {currentUser.name}!</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3">
                {/* Card 1: Tổng khóa học */}
                <div 
                  onClick={() => { setActiveTab('courses'); setCourseStatusFilter('all'); }}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Tổng khóa học</span>
                    <div className="p-1 bg-emerald-55 rounded text-emerald-600"><BookOpen className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{overviewStats.total}</h4>
                    <p className="text-[8.5px] text-emerald-650 font-bold mt-0.5">↑ 2 so với tháng trước</p>
                  </div>
                </div>

                {/* Card 2: Đang Published */}
                <div 
                  onClick={() => { setActiveTab('courses'); setCourseStatusFilter('active'); }}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Đã xuất bản</span>
                    <div className="p-1 bg-emerald-55 rounded text-emerald-600"><CheckCircle className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{overviewStats.published}</h4>
                    <p className="text-[8.5px] text-emerald-655 font-bold mt-0.5">↑ 1 so với tháng trước</p>
                  </div>
                </div>

                {/* Card 3: Khóa Draft */}
                <div 
                  onClick={() => { setActiveTab('courses'); setCourseStatusFilter('draft'); }}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-455">Bản nháp</span>
                    <div className="p-1 bg-slate-50 rounded text-stone-500"><FileText className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{overviewStats.draft}</h4>
                    <p className="text-[8.5px] text-stone-400 font-bold mt-0.5">→ 0 so với tháng trước</p>
                  </div>
                </div>

                {/* Card 4: Đang chờ duyệt */}
                <div 
                  onClick={() => { setActiveTab('courses'); setCourseStatusFilter('pending'); }}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Chờ duyệt</span>
                    <div className="p-1 bg-amber-50 rounded text-amber-600"><Clock className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{overviewStats.pending}</h4>
                    <p className="text-[8.5px] text-stone-400 font-bold mt-0.5">→ 0 so với tháng trước</p>
                  </div>
                </div>

                {/* Card 5: Bị từ chối */}
                <div 
                  onClick={() => { setActiveTab('courses'); setCourseStatusFilter('rejected'); }}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Bị từ chối</span>
                    <div className="p-1 bg-rose-50 rounded text-rose-600"><AlertCircle className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{overviewStats.rejected}</h4>
                    <p className="text-[8.5px] text-stone-400 font-bold mt-0.5">→ 0 so với tháng trước</p>
                  </div>
                </div>

                {/* Card 6: Tổng lượt học viên */}
                <div 
                  onClick={() => setActiveTab('students')}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Tổng lượt học viên</span>
                    <div className="p-1 bg-blue-50 rounded text-blue-600"><Users className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-stone-850">{formatNumber(displayTotalEnrollments)}</h4>
                    {enrollmentChangePercentage !== undefined && enrollmentChangePercentage !== null ? (
                      <p className={`text-[8.5px] font-bold mt-0.5 ${enrollmentChangePercentage >= 0 ? 'text-emerald-650' : 'text-rose-600'}`}>
                        {enrollmentChangePercentage >= 0 ? `↑ ${enrollmentChangePercentage}%` : `↓ ${Math.abs(enrollmentChangePercentage)}%`} so với kỳ trước
                      </p>
                    ) : (
                      <p className="text-[8.5px] text-stone-400 font-bold mt-0.5">—</p>
                    )}
                  </div>
                </div>

                {/* Card 7: Doanh thu tháng này */}
                <div 
                  onClick={() => setActiveTab('revenue')}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Doanh thu</span>
                    <div className="p-1 bg-emerald-55 rounded text-emerald-600"><DollarSign className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-black text-emerald-700">{formatVND(displayTotalRevenue)}</h4>
                    {revenueChangePercentage !== undefined && revenueChangePercentage !== null ? (
                      <p className={`text-[8.5px] font-bold mt-0.5 ${revenueChangePercentage >= 0 ? 'text-emerald-650' : 'text-rose-600'}`}>
                        {revenueChangePercentage >= 0 ? `↑ ${revenueChangePercentage}%` : `↓ ${Math.abs(revenueChangePercentage)}%`} so với kỳ trước
                      </p>
                    ) : (
                      <p className="text-[8.5px] text-stone-400 font-bold mt-0.5">—</p>
                    )}
                  </div>
                </div>

                {/* Card 8: Số dư có thể rút */}
                <div 
                  onClick={() => setActiveTab('payout')}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-left shadow-3xs flex flex-col justify-between h-24 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-stone-450">Số dư rút</span>
                    <div className="p-1 bg-indigo-55 rounded text-indigo-600"><Landmark className="w-3.5 h-3.5" /></div>
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-black text-indigo-700">{formatVND(displayOverviewBalance)}</h4>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveTab('payout'); }}
                      className="text-[8.5px] text-blue-600 font-bold mt-0.5 hover:underline flex items-center gap-0.5"
                    >
                      Rút tiền ngay &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Revenue chart */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                        Doanh thu {isRevenueChartLoading && <span className="text-[9px] text-stone-400 lowercase font-normal animate-pulse">(đang tải...)</span>}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-black text-stone-850">{formatVND(displayTotalRevenue)}</span>
                        {!isRevenueChartLoading && !revenueChartError && revenueChangePercentage !== undefined && revenueChangePercentage !== null && (
                          <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border ${
                            revenueChangePercentage >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {revenueChangePercentage >= 0 ? `+ ${revenueChangePercentage}%` : `${revenueChangePercentage}%`} so với kỳ trước
                          </span>
                        )}
                      </div>
                    </div>
                    <select 
                      value={revenueTimeFilter}
                      onChange={(e) => setRevenueTimeFilter(e.target.value as any)}
                      className="border border-slate-150 rounded-lg p-1 text-[9.5px] font-bold bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="year">Năm nay</option>
                      <option value="month">Tháng này</option>
                      <option value="week">Tuần này</option>
                    </select>
                  </div>
                  <div className="h-44 w-full">
                    {isRevenueChartLoading ? (
                      <div className="h-full w-full flex items-center justify-center text-stone-400 text-[11px] animate-pulse">
                        Đang tải dữ liệu biểu đồ...
                      </div>
                    ) : revenueChartError ? (
                      <div className="h-full w-full flex flex-col items-center justify-center text-stone-400 border border-dashed border-rose-200 rounded-xl bg-rose-50/30 p-4 text-center">
                        <AlertCircle className="w-6 h-6 text-rose-500 mb-1" />
                        <p className="text-[11px] font-bold text-rose-700">Không thể tải biểu đồ doanh thu.</p>
                        <button 
                          type="button"
                          onClick={() => loadRevenueChart(revenueTimeFilter)} 
                          className="mt-2 text-[10px] font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Thử lại
                        </button>
                      </div>
                    ) : activeRevenueChartData.length === 0 ? (
                      <div className="h-full w-full flex flex-col items-center justify-center text-stone-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <BarChart2 className="w-7 h-7 text-stone-300 mb-1" />
                        <p className="text-[11px] font-bold text-stone-500">Chưa có dữ liệu doanh thu trong khoảng thời gian này.</p>
                        <p className="text-[9.5px] text-stone-400 mt-0.5">Không có giao dịch doanh thu trong khoảng thời gian này.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activeRevenueChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="#a8a29e" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#a8a29e" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                          <ChartTooltip formatter={(value: any) => [formatVND(Number(value)), 'Doanh thu giảng viên']} labelStyle={{ fontSize: '9px', fontWeight: 'bold' }} contentStyle={{ fontSize: '9px' }} />
                          <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Enrollments chart */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                        Lượt ghi danh (học viên mới) {isEnrollmentChartLoading && <span className="text-[9px] text-stone-400 lowercase font-normal animate-pulse">(đang tải...)</span>}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-black text-stone-850">
                          {formatNumber(displayTotalEnrollments)}
                        </span>
                        {!isEnrollmentChartLoading && !enrollmentChartError && enrollmentChangePercentage !== undefined && enrollmentChangePercentage !== null && (
                          <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border ${
                            enrollmentChangePercentage >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {enrollmentChangePercentage >= 0 ? `+ ${enrollmentChangePercentage}%` : `${enrollmentChangePercentage}%`} so với kỳ trước
                          </span>
                        )}
                      </div>
                    </div>
                    <select 
                      value={enrollmentTimeFilter}
                      onChange={(e) => setEnrollmentTimeFilter(e.target.value as any)}
                      className="border border-slate-150 rounded-lg p-1 text-[9.5px] font-bold bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="year">Năm nay</option>
                      <option value="month">Tháng này</option>
                      <option value="week">Tuần này</option>
                    </select>
                  </div>
                  <div className="h-44 w-full">
                    {isEnrollmentChartLoading ? (
                      <div className="h-full w-full flex items-center justify-center text-stone-400 text-[11px] animate-pulse">
                        Đang tải dữ liệu biểu đồ...
                      </div>
                    ) : enrollmentChartError ? (
                      <div className="h-full w-full flex flex-col items-center justify-center text-stone-400 border border-dashed border-rose-200 rounded-xl bg-rose-50/30 p-4 text-center">
                        <AlertCircle className="w-6 h-6 text-rose-500 mb-1" />
                        <p className="text-[11px] font-bold text-rose-700">Không thể tải biểu đồ lượt ghi danh.</p>
                        <button 
                          type="button"
                          onClick={() => loadEnrollmentChart(enrollmentTimeFilter)} 
                          className="mt-2 text-[10px] font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Thử lại
                        </button>
                      </div>
                    ) : activeEnrollmentChartData.length === 0 ? (
                      <div className="h-full w-full flex flex-col items-center justify-center text-stone-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <Users className="w-7 h-7 text-stone-300 mb-1" />
                        <p className="text-[11px] font-bold text-stone-500">Chưa có lượt ghi danh trong khoảng thời gian này.</p>
                        <p className="text-[9.5px] text-stone-400 mt-0.5">Không có lượt học viên đăng ký trong khoảng thời gian này.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activeEnrollmentChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="#a8a29e" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#a8a29e" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                          <ChartTooltip formatter={(value: any) => [`${value} học viên mới`, 'Ghi danh']} labelStyle={{ fontSize: '9px', fontWeight: 'bold' }} contentStyle={{ fontSize: '9px' }} />
                          <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEnrollments)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Top Courses, QA, Incomplete & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 items-start">
                {/* Top Courses */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left space-y-3 h-auto self-start">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-extrabold text-xs text-stone-850">Top khóa học nhiều học viên</h4>
                    <button onClick={() => setActiveTab('courses')} className="text-[10px] text-blue-600 hover:underline font-bold">Xem tất cả</button>
                  </div>
                  {activeTopCourses.length === 0 ? (
                    <div className="py-8 text-center text-stone-400">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-stone-300 stroke-[1.5]" />
                      <p className="text-[11px] font-bold text-stone-500">Chưa có dữ liệu khóa học</p>
                      <p className="text-[9.5px] text-stone-400 mt-0.5">Top khóa học nhiều học viên sẽ hiển thị tại đây</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="text-stone-400 border-b">
                            <th className="py-2 text-left font-bold w-6">#</th>
                            <th className="py-2 text-left font-bold">Khóa học</th>
                            <th className="py-2 text-center font-bold">Học viên</th>
                            <th className="py-2 text-right font-bold">Doanh thu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeTopCourses.map((c, idx) => (
                            <tr key={c.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 font-bold text-stone-500">{c.rank || (idx + 1)}</td>
                              <td className="py-2.5 font-bold text-stone-800 flex items-center gap-2">
                                <img src={c.image} alt="" className="w-8 h-6 object-cover rounded border bg-white shrink-0" />
                                <div className="truncate max-w-[100px]">
                                  <p className="truncate leading-tight font-extrabold">{c.title}</p>
                                  <span className={`text-[7px] uppercase font-bold px-1 rounded inline-block mt-0.5 ${c.level === 'Cơ bản' ? 'bg-emerald-50 text-emerald-700' : c.level === 'Nâng cao' ? 'bg-purple-50 text-purple-700' : c.level === '—' ? 'bg-stone-50 text-stone-500' : 'bg-blue-50 text-blue-700'}`}>
                                    {c.level}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 text-center font-bold text-stone-750">{c.enrolledCount}</td>
                              <td className="py-2.5 text-right font-black text-emerald-650">
                                {formatVND(c.revenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Unanswered QAs */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs text-left space-y-3 h-auto self-start">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-extrabold text-xs text-stone-850 flex items-center gap-1.5">
                      <span>Câu hỏi chưa trả lời</span>
                      <span className="bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        {displayOverviewUnansweredQA}
                      </span>
                    </h4>
                    <button onClick={() => setActiveTab('qa')} className="text-[10px] text-blue-600 hover:underline font-bold">Xem tất cả</button>
                  </div>
                  <div className="space-y-3 py-1">
                    {activeUnansweredQuestions.map((q) => (
                      <div key={q.id} className="flex gap-3 items-start p-2 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-all border border-slate-100/50">
                        <img src={q.avatar} alt="" className="w-7 h-7 rounded-full border object-cover shrink-0 animate-fade-in" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-850 text-[10.5px]">{q.userName}</span>
                            <span className="text-[8px] text-stone-400 font-bold">{q.time}</span>
                          </div>
                          <p className="text-[8px] text-emerald-600 font-bold truncate mt-0.5">trong {q.courseTitle}</p>
                          <p className="text-[9.5px] text-stone-600 truncate mt-1 leading-normal font-medium">{q.question}</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 self-center" />
                      </div>
                    ))}
                    {activeUnansweredQuestions.length === 0 && (
                      <p className="text-[10px] text-stone-400 py-6 text-center">Không có câu hỏi chưa trả lời nào.</p>
                    )}
                  </div>
                  <button 
                    onClick={() => setActiveTab('qa')} 
                    className="w-full text-center py-2 border border-slate-150 rounded-xl hover:bg-slate-50 text-[10.5px] font-bold text-stone-600 transition-colors"
                  >
                    Xem tất cả câu hỏi
                  </button>
                </div>

                {/* Rightmost column: Incomplete courses & Alerts */}
                <div className="space-y-4 text-left h-auto self-start">
                  
                  {/* Khóa học cần hoàn thiện */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-extrabold text-xs text-stone-850 flex items-center gap-1.5">
                        <span>Khóa học cần hoàn thiện</span>
                        <span className="bg-amber-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded">
                          {isApiMode ? activeIncompleteCourses.length : 0}
                        </span>
                      </h4>
                      <button 
                        onClick={() => { setCourseStatusFilter('draft'); setActiveTab('courses'); }} 
                        className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Xem tất cả
                      </button>
                    </div>
                    <div className="space-y-3 py-1 max-h-[280px] overflow-y-auto pr-1">
                      {activeIncompleteCourses.slice(0, 5).map(ic => {
                        const firstMissingLabel = Array.isArray(ic.missing_items) && ic.missing_items.length > 0
                          ? (typeof ic.missing_items[0] === 'object' ? ic.missing_items[0].label : ic.missing_items[0])
                          : null;
                        const missingText = firstMissingLabel
                          ? (ic.missing_items.length === 1 
                              ? `Còn thiếu: ${firstMissingLabel}`
                              : `Còn thiếu ${ic.missing_items.length} mục (${firstMissingLabel}...)`)
                          : null;

                        return (
                          <div key={ic.id} className="space-y-1.5 p-2 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100/50">
                            <div className="flex justify-between items-center font-bold">
                              <div className="min-w-0 flex-1 pr-2">
                                <span className="text-stone-800 text-[10px] font-extrabold truncate block" title={ic.title}>{ic.title}</span>
                                {missingText && (
                                  <span className="text-[8.5px] text-amber-700 font-semibold truncate block mt-0.5" title={missingText}>
                                    {missingText}
                                  </span>
                                )}
                              </div>
                              <button 
                                onClick={() => handleContinueIncompleteCourse(ic)}
                                className="text-[9px] bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-stone-700 border border-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold shrink-0 shadow-3xs"
                              >
                                {ic.action_label}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <div className="flex-1 bg-stone-200/70 h-1.5 rounded-full overflow-hidden">
                                <div style={{ width: `${ic.progress}%` }} className="bg-emerald-500 h-full rounded-full transition-all duration-500" />
                              </div>
                              <span className="text-[8.5px] font-bold text-stone-500 font-mono shrink-0">
                                Hoàn thiện {ic.progress}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {activeIncompleteCourses.length === 0 && (
                        <p className="text-[10px] text-stone-400 text-center py-4">Không có khóa học chưa hoàn thiện nào.</p>
                      )}
                    </div>
                  </div>

                  {/* Thông báo mới */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-extrabold text-xs text-stone-850 flex items-center gap-1.5">
                        <span>Thông báo mới</span>
                        <span className="bg-blue-500 text-white font-black text-[9px] px-1.5 rounded">
                          {isApiMode ? dashboardAlerts.filter(n => !n.read_at).length : 0}
                        </span>
                      </h4>
                      <button 
                        onClick={handleViewAllAlerts} 
                        className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        {isAllAlertsExpanded ? 'Thu gọn' : 'Xem tất cả'}
                      </button>
                    </div>
                    <div className="space-y-2.5 py-1 max-h-[240px] overflow-y-auto pr-1">
                      {activeNotifications.map(n => {
                        const hasAction = Boolean(n.action_url && resolveInstructorActionUrl(n.action_url));
                        return (
                          <div 
                            key={n.id} 
                            onClick={() => hasAction && handleAlertClick(n)}
                            onKeyDown={(e) => {
                              if (hasAction && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                handleAlertClick(n);
                              }
                            }}
                            role={hasAction ? "button" : undefined}
                            tabIndex={hasAction ? 0 : undefined}
                            className={`flex gap-2 items-start text-[10px] p-2 rounded-xl border border-slate-100/50 transition-all ${
                              hasAction ? 'cursor-pointer hover:bg-slate-50 hover:border-slate-200/80 shadow-3xs' : 'bg-slate-50/30'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.read_at ? 'bg-stone-300' : 'bg-blue-500'}`} />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-stone-850 text-[10.5px] leading-snug">{n.title}</p>
                              <p className="text-stone-600 leading-normal font-medium text-[9.5px] mt-0.5">{n.content}</p>
                              <span className="text-[8px] text-stone-400 font-bold block mt-1">{n.time}</span>
                            </div>
                            {hasAction && <ChevronRight className="w-3.5 h-3.5 text-stone-400 self-center shrink-0" />}
                          </div>
                        );
                      })}
                      {activeNotifications.length === 0 && (
                        <p className="text-[10px] text-stone-400 text-center py-2">Không có thông báo mới.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}


        {/* REVENUE TAB */}
        {activeTab === 'revenue' && (
          <InstructorRevenue instructorId={currentUser?.id} courses={courses} />
        )}

        {/* LIST OF COURSES TAB */}
        {activeTab === 'courses' && (
          <div className="space-y-6 animate-fade-in text-xs text-left" id="courses-list-section">
            
            {/* Header: Title, Subtitle, Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
                  Khóa học của tôi
                </h3>
                <p className="text-[11px] text-stone-500 font-medium mt-0.5">Quản lý và theo dõi tất cả các khóa học của bạn trên MindHub.</p>
              </div>
              <button 
                onClick={startBuilderForCreate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-3xs transition-all shrink-0 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" /> Tạo khóa học mới
              </button>
            </div>

            {/* Overview cards row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 md:gap-4">
              {/* Card 1: Tất cả khóa học */}
              <button
                type="button"
                onClick={() => {
                  setCourseStatusFilter('all');
                  setCoursePage(1);
                }}
                aria-pressed={courseStatusFilter === 'all'}
                className={`relative overflow-hidden rounded-xl border p-3.5 md:p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[116px] md:min-h-[128px] ${
                  courseStatusFilter === 'all'
                    ? 'bg-slate-50/90 border-slate-400 shadow-xs ring-2 ring-slate-400/20'
                    : 'bg-white border-slate-200/80 shadow-3xs hover:-translate-y-0.5 hover:shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-slate-800 rounded-l-xl" />
                
                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] md:text-[11px] uppercase font-extrabold tracking-wider text-stone-500">
                      Tất cả khóa học
                    </p>
                    <p className="mt-2 text-2xl md:text-3xl font-black text-stone-900 tabular-nums tracking-tight">
                      {isApiMode && dashboardOverview?.course_summary ? dashboardOverview.course_summary.total : rawInstructorCourses.length}
                    </p>
                  </div>

                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-800 shadow-3xs">
                    <BookOpen className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>

                <p className="mt-2 text-[10.5px] text-stone-500 font-medium leading-tight pl-1">
                  Tổng số khóa học hiện có
                </p>
              </button>

              {/* Card 2: Published */}
              <button
                type="button"
                onClick={() => {
                  setCourseStatusFilter('published');
                  setCoursePage(1);
                }}
                aria-pressed={courseStatusFilter === 'published'}
                className={`relative overflow-hidden rounded-xl border p-3.5 md:p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[116px] md:min-h-[128px] ${
                  courseStatusFilter === 'published'
                    ? 'bg-emerald-50/60 border-emerald-400 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200/80 shadow-3xs hover:-translate-y-0.5 hover:shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 rounded-l-xl" />
                
                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] md:text-[11px] uppercase font-extrabold tracking-wider text-stone-500">
                      Published
                    </p>
                    <p className="mt-2 text-2xl md:text-3xl font-black text-emerald-700 tabular-nums tracking-tight">
                      {isApiMode && dashboardOverview?.course_summary ? ((dashboardOverview.course_summary.published || 0) + (dashboardOverview.course_summary.approved || 0)) : rawInstructorCourses.filter(c => c.status === 'active').length}
                    </p>
                  </div>

                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-emerald-700 shadow-3xs">
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>

                <p className="mt-2 text-[10.5px] text-stone-500 font-medium leading-tight pl-1">
                  Đang hiển thị cho học viên
                </p>
              </button>

              {/* Card 3: Draft */}
              <button
                type="button"
                onClick={() => {
                  setCourseStatusFilter('draft');
                  setCoursePage(1);
                }}
                aria-pressed={courseStatusFilter === 'draft'}
                className={`relative overflow-hidden rounded-xl border p-3.5 md:p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[116px] md:min-h-[128px] ${
                  courseStatusFilter === 'draft'
                    ? 'bg-slate-50/90 border-slate-400 shadow-xs ring-2 ring-slate-400/20'
                    : 'bg-white border-slate-200/80 shadow-3xs hover:-translate-y-0.5 hover:shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-slate-500 rounded-l-xl" />
                
                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] md:text-[11px] uppercase font-extrabold tracking-wider text-stone-500">
                      Draft
                    </p>
                    <p className="mt-2 text-2xl md:text-3xl font-black text-stone-700 tabular-nums tracking-tight">
                      {isApiMode && dashboardOverview?.course_summary ? (dashboardOverview.course_summary.draft || 0) : rawInstructorCourses.filter(c => c.status === 'draft').length}
                    </p>
                  </div>

                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-700 shadow-3xs">
                    <FileText className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>

                <p className="mt-2 text-[10.5px] text-stone-500 font-medium leading-tight pl-1">
                  Chưa gửi xét duyệt
                </p>
              </button>

              {/* Card 4: Pending Review */}
              <button
                type="button"
                onClick={() => {
                  setCourseStatusFilter('pending_review');
                  setCoursePage(1);
                }}
                aria-pressed={courseStatusFilter === 'pending_review'}
                className={`relative overflow-hidden rounded-xl border p-3.5 md:p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[116px] md:min-h-[128px] ${
                  courseStatusFilter === 'pending_review'
                    ? 'bg-amber-50/60 border-amber-400 shadow-xs ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200/80 shadow-3xs hover:-translate-y-0.5 hover:shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-amber-500 rounded-l-xl" />
                
                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] md:text-[11px] uppercase font-extrabold tracking-wider text-stone-500">
                      Pending Review
                    </p>
                    <p className="mt-2 text-2xl md:text-3xl font-black text-amber-700 tabular-nums tracking-tight">
                      {isApiMode && dashboardOverview?.course_summary ? (dashboardOverview.course_summary.pending_review || 0) : rawInstructorCourses.filter(c => c.status === 'pending').length}
                    </p>
                  </div>

                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-700 shadow-3xs">
                    <Clock className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>

                <p className="mt-2 text-[10.5px] text-stone-500 font-medium leading-tight pl-1">
                  Đang chờ quản trị viên duyệt
                </p>
              </button>

              {/* Card 5: Rejected */}
              <button
                type="button"
                onClick={() => {
                  setCourseStatusFilter('rejected');
                  setCoursePage(1);
                }}
                aria-pressed={courseStatusFilter === 'rejected'}
                className={`relative overflow-hidden rounded-xl border p-3.5 md:p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[116px] md:min-h-[128px] ${
                  courseStatusFilter === 'rejected'
                    ? 'bg-rose-50/60 border-rose-400 shadow-xs ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200/80 shadow-3xs hover:-translate-y-0.5 hover:shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-rose-500 rounded-l-xl" />
                
                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] md:text-[11px] uppercase font-extrabold tracking-wider text-stone-500">
                      Rejected
                    </p>
                    <p className="mt-2 text-2xl md:text-3xl font-black text-rose-600 tabular-nums tracking-tight">
                      {isApiMode && dashboardOverview?.course_summary ? (dashboardOverview.course_summary.rejected || 0) : rawInstructorCourses.filter(c => c.status === 'rejected').length}
                    </p>
                  </div>

                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center shrink-0 text-rose-600 shadow-3xs">
                    <AlertCircle className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>

                <p className="mt-2 text-[10.5px] text-stone-500 font-medium leading-tight pl-1">
                  Cần chỉnh sửa và gửi lại
                </p>
              </button>

              {/* Card 6: Hidden */}
              <button
                type="button"
                onClick={() => {
                  setCourseStatusFilter('hidden');
                  setCoursePage(1);
                }}
                aria-pressed={courseStatusFilter === 'hidden'}
                className={`relative overflow-hidden rounded-xl border p-3.5 md:p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[116px] md:min-h-[128px] ${
                  courseStatusFilter === 'hidden'
                    ? 'bg-slate-100/90 border-slate-400 shadow-xs ring-2 ring-slate-400/20'
                    : 'bg-white border-slate-200/80 shadow-3xs hover:-translate-y-0.5 hover:shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-slate-400 rounded-l-xl" />
                
                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] md:text-[11px] uppercase font-extrabold tracking-wider text-stone-500">
                      Hidden
                    </p>
                    <p className="mt-2 text-2xl md:text-3xl font-black text-slate-600 tabular-nums tracking-tight">
                      {isApiMode && dashboardOverview?.course_summary ? (dashboardOverview.course_summary.hidden || 0) : rawInstructorCourses.filter(c => c.status === 'hidden').length}
                    </p>
                  </div>

                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-600 shadow-3xs">
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>

                <p className="mt-2 text-[10.5px] text-stone-500 font-medium leading-tight pl-1">
                  Đang tạm ẩn với học viên mới
                </p>
              </button>
            </div>

            {/* Filters Row */}
            <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-3xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Trạng thái dropdown */}
                <div className="flex flex-col w-full sm:w-[150px]">
                  <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-1">Trạng thái</span>
                  <select
                    value={courseStatusFilter}
                    onChange={e => {
                      setCourseStatusFilter(e.target.value);
                      setCoursePage(1);
                    }}
                    className="w-full h-[38px] border border-slate-200 rounded-lg px-2.5 bg-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="published">Đang công khai</option>
                    <option value="draft">Đang hoàn thiện</option>
                    <option value="pending_review">Chờ duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                    <option value="hidden">Đã ẩn</option>
                  </select>
                </div>

                {/* Danh mục dropdown */}
                <div className="flex flex-col w-full sm:w-[180px]">
                  <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-1">Danh mục</span>
                  <select
                    value={courseCategoryFilter}
                    onChange={e => {
                      setCourseCategoryFilter(e.target.value);
                      setCoursePage(1);
                    }}
                    className="w-full h-[38px] border border-slate-200 rounded-lg px-2.5 bg-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer truncate"
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categoriesList.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Từ khóa */}
                <div className="flex flex-col flex-1 min-w-[200px] w-full">
                  <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-1">Từ khóa</span>
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm khóa học..."
                      value={courseSearchQuery}
                      onChange={e => setCourseSearchQuery(e.target.value)}
                      className="w-full h-[38px] border border-slate-200 rounded-lg pl-9 pr-8 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                    {courseSearchQuery && (
                      <button
                        onClick={() => setCourseSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer p-0.5"
                        title="Xóa từ khóa"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                {/* Sắp xếp */}
                <div className="flex flex-col w-full sm:w-[170px]">
                  <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider mb-1">Sắp xếp</span>
                  <select
                    value={courseSortBy}
                    onChange={e => {
                      setCourseSortBy(e.target.value);
                      setCoursePage(1);
                    }}
                    className="w-full h-[38px] border border-slate-200 rounded-lg px-2.5 bg-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="newest">Cập nhật gần nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="title_asc">Tên A–Z</option>
                    <option value="title_desc">Tên Z–A</option>
                  </select>
                </div>

                {/* Reset filter button if active */}
                {(courseStatusFilter !== 'all' || courseCategoryFilter !== 'all' || courseSearchQuery !== '' || courseSortBy !== 'newest') && (
                  <button
                    onClick={() => {
                      setCourseStatusFilter('all');
                      setCourseCategoryFilter('all');
                      setCourseSearchQuery('');
                      setCourseSortBy('newest');
                      setCoursePage(1);
                    }}
                    className="h-[38px] px-3 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                    title="Đặt lại bộ lọc"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đặt lại</span>
                  </button>
                )}

                {/* Nút filter nâng cao */}
                <button 
                  className="h-[38px] w-[38px] border border-slate-200 hover:bg-slate-50 p-2 rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  title="Bộ lọc nâng cao"
                  aria-label="Bộ lọc nâng cao"
                >
                  <Filter className="w-4 h-4 text-stone-600" />
                </button>
              </div>
            </div>

            {/* Content Row: Table (Left) & Sidebar (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Table side (span 3) */}
              <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl shadow-3xs overflow-hidden">
                {isCoursesLoading ? (
                  <CourseTableSkeleton />
                ) : coursesError ? (
                  <div className="text-center py-16 bg-slate-50 px-4 space-y-3">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
                    <div>
                      <p className="text-rose-600 font-bold text-sm">{coursesError}</p>
                      <p className="text-stone-500 font-medium text-xs mt-1">Không thể tải danh sách khóa học từ máy chủ. Vui lòng thử lại.</p>
                    </div>
                    <button 
                      onClick={() => loadInstructorCoursesList()}
                      disabled={isCoursesLoading}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-3xs inline-flex items-center gap-2"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isCoursesLoading ? 'animate-spin' : ''}`} />
                      {isCoursesLoading ? 'Đang tải...' : 'Thử lại'}
                    </button>
                  </div>
                ) : displayedCourses.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 px-4 space-y-3">
                    <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
                    <p className="text-stone-500 font-medium text-xs max-w-sm mx-auto">
                      {courseSearchQuery || courseStatusFilter !== 'all' || courseCategoryFilter !== 'all'
                        ? 'Không tìm thấy khóa học nào phù hợp với bộ lọc.'
                        : 'Bạn chưa có khóa học nào trong danh sách.'}
                    </p>
                    {(courseSearchQuery || courseStatusFilter !== 'all' || courseCategoryFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setCourseStatusFilter('all');
                          setCourseCategoryFilter('all');
                          setCourseSearchQuery('');
                          setCourseSortBy('newest');
                          setCoursePage(1);
                        }}
                        className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-stone-700 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-3xs inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Đặt lại bộ lọc
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* DESKTOP / TABLET TABLE VIEW */}
                    <div id="courses-list-section" className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 text-stone-500 border-b border-slate-100 uppercase text-[9px] tracking-wider font-extrabold">
                            <th className="py-3 px-4 min-w-[360px]">Khóa học</th>
                            <th className="py-3 px-3 w-[130px] min-w-[130px]">Trạng thái</th>
                            <th className="py-3 px-3 w-[90px] min-w-[90px] text-right">Học viên</th>
                            <th className="py-3 px-3 w-[110px] min-w-[110px] text-right">Doanh thu</th>
                            <th className="py-3 px-4 w-[110px] min-w-[110px] text-center">Cập nhật</th>
                            <th className="py-3 px-4 w-[140px] min-w-[140px] text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayedCourses.map(course => {
                            const courseLevelLabel = 
                              course.level === 'beginner' || course.level === 'Cơ bản' ? 'Cơ bản' :
                              course.level === 'expert' || course.level === 'Nâng cao' ? 'Nâng cao' : 'Trung cấp';

                            const displayStatus = (course as any).rawStatus || course.status;
                            const statusLabel = (course as any).statusLabel || (
                              displayStatus === 'published' || displayStatus === 'active' ? 'Đang công khai' :
                              displayStatus === 'rejected' ? 'Bị từ chối' :
                              displayStatus === 'draft' ? 'Bản nháp' :
                              displayStatus === 'hidden' ? 'Đã ẩn' : 'Chờ duyệt'
                            );

                            const statusBadgeClass = 
                              displayStatus === 'published' || displayStatus === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
                              displayStatus === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200/80' :
                              displayStatus === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200/80' :
                              displayStatus === 'hidden' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                              'bg-purple-50 text-purple-700 border-purple-200/80';

                            const formattedDate = course.updatedAt 
                              ? new Date(course.updatedAt).toLocaleDateString('vi-VN') 
                              : (course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : '—');

                            return (
                              <tr key={course.id} className="hover:bg-slate-50/60 transition-colors h-[76px]">
                                <td className="py-3 px-4 min-w-[360px]">
                                  <div className="flex items-center gap-3">
                                    <CourseThumbnail src={course.image} alt={course.title} />
                                    <div className="min-w-0 flex-1 overflow-hidden">
                                      <h4 
                                        title={course.title} 
                                        className="font-bold text-xs text-stone-900 line-clamp-2 break-words leading-snug hover:text-emerald-700 transition-colors cursor-pointer"
                                        onClick={() => startBuilderForEdit(course)}
                                      >
                                        {course.title}
                                      </h4>
                                      <div className="text-[11px] text-stone-500 font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                                        <span>{course.category}</span>
                                        <span>·</span>
                                        <span className="text-stone-600">{courseLevelLabel}</span>
                                        <span>·</span>
                                        <span className="font-extrabold text-stone-850 whitespace-nowrap">{formatVND(course.salePrice || course.price || 0)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                
                                <td className="py-3 px-3 w-[130px] min-w-[130px]">
                                  <span className={`inline-flex whitespace-nowrap items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border min-w-0 shrink-0 ${statusBadgeClass}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      displayStatus === 'published' || displayStatus === 'active' ? 'bg-emerald-500' :
                                      displayStatus === 'rejected' ? 'bg-rose-500' :
                                      displayStatus === 'draft' ? 'bg-amber-500' :
                                      displayStatus === 'hidden' ? 'bg-slate-400' : 'bg-purple-500'
                                    }`} />
                                    {statusLabel}
                                  </span>
                                </td>

                                <td className="py-3 px-3 w-[90px] min-w-[90px] text-right font-bold text-xs text-stone-700 tabular-nums whitespace-nowrap">
                                  {formatNumber(course.enrolledCount)}
                                </td>

                                <td className="py-3 px-3 w-[110px] min-w-[110px] text-right font-black text-xs text-emerald-700 tabular-nums whitespace-nowrap">
                                  {formatVND(course.enrolledCount * (course.salePrice || course.price || 0))}
                                </td>

                                <td className="py-3 px-4 w-[110px] min-w-[110px] text-center text-[10.5px] font-medium text-stone-500 whitespace-nowrap">
                                  {formattedDate}
                                </td>

                                <td className="py-3 px-4 w-[240px] min-w-[240px] text-center">
                                  <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                                    {(displayStatus === 'rejected' || course.status === 'rejected') && (
                                      <button 
                                        onClick={() => alert(`Lý do từ chối: ${course.rejectionReason || 'Không có lý do chi tiết.'}`)}
                                        className="h-9 min-w-[76px] px-2.5 inline-flex items-center justify-center whitespace-nowrap bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                                      >
                                        Xem lý do
                                      </button>
                                    )}

                                    {(displayStatus === 'draft' || course.status === 'draft') && (
                                      <button 
                                        onClick={() => {
                                          if (window.confirm('Bạn có muốn gửi khóa học này cho Admin duyệt không?')) {
                                            instructorApi.submitCourseToAdminVerification(course.id)
                                              .then(() => {
                                                alert('Đã gửi yêu cầu duyệt khóa học thành công!');
                                                loadInstructorCoursesList();
                                              })
                                              .catch(err => alert(err.message || 'Lỗi gửi duyệt'));
                                          }
                                        }}
                                        className="h-9 min-w-[76px] px-2.5 inline-flex items-center justify-center whitespace-nowrap bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                                      >
                                        Gửi duyệt
                                      </button>
                                    )}

                                    <button 
                                      onClick={() => startBuilderForEdit(course)}
                                      disabled={courseActionLoadingId === String(course.id)}
                                      className="h-9 min-w-[80px] px-3 inline-flex items-center justify-center whitespace-nowrap bg-white hover:bg-slate-50 text-stone-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer shadow-3xs transition-colors shrink-0 disabled:opacity-50"
                                    >
                                      Chỉnh sửa
                                    </button>

                                    {displayStatus === 'hidden' ? (
                                      <button 
                                        onClick={() => handleConfirmUnhide(course.id)}
                                        disabled={courseActionLoadingId === String(course.id)}
                                        className="h-9 px-3 inline-flex items-center justify-center gap-1.5 whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                        title="Hiện lại khóa học"
                                      >
                                        {courseActionLoadingId === String(course.id) && courseActionType === 'unhiding' ? (
                                          <div className="w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                          <Eye className="w-3.5 h-3.5" />
                                        )}
                                        Hiện lại
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => setHideModalCourse(course)}
                                        disabled={courseActionLoadingId === String(course.id)}
                                        className="h-9 px-3 inline-flex items-center justify-center gap-1.5 whitespace-nowrap bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                        title="Ẩn khóa học"
                                      >
                                        {courseActionLoadingId === String(course.id) && courseActionType === 'hiding' ? (
                                          <div className="w-3.5 h-3.5 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                          <EyeOff className="w-3.5 h-3.5" />
                                        )}
                                        Ẩn khóa học
                                      </button>
                                    )}

                                    <button 
                                      onClick={() => setDeleteModalCourse(course)}
                                      disabled={courseActionLoadingId === String(course.id)}
                                      className="w-9 h-9 inline-flex items-center justify-center text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                      title="Xóa khóa học"
                                      aria-label="Xóa khóa học"
                                    >
                                      {courseActionLoadingId === String(course.id) && courseActionType === 'deleting' ? (
                                        <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE CARD LIST VIEW (< 768px) */}
                    <div className="block md:hidden p-3 space-y-3">
                      {displayedCourses.map(course => {
                        const courseLevelLabel = 
                          course.level === 'beginner' || course.level === 'Cơ bản' ? 'Cơ bản' :
                          course.level === 'expert' || course.level === 'Nâng cao' ? 'Nâng cao' : 'Trung cấp';

                        const displayStatus = (course as any).rawStatus || course.status;
                        const statusLabel = (course as any).statusLabel || (
                          displayStatus === 'published' || displayStatus === 'active' ? 'Đang công khai' :
                          displayStatus === 'rejected' ? 'Bị từ chối' :
                          displayStatus === 'draft' ? 'Bản nháp' :
                          displayStatus === 'hidden' ? 'Đã ẩn' : 'Chờ duyệt'
                        );

                        const statusBadgeClass = 
                          displayStatus === 'published' || displayStatus === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
                          displayStatus === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200/80' :
                          displayStatus === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200/80' :
                          displayStatus === 'hidden' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                          'bg-purple-50 text-purple-700 border-purple-200/80';

                        const formattedDate = course.updatedAt 
                          ? new Date(course.updatedAt).toLocaleDateString('vi-VN') 
                          : (course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : '—');

                        return (
                          <div key={course.id} className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-3xs space-y-3">
                            <div className="flex gap-3 items-start">
                              <CourseThumbnail src={course.image} alt={course.title} />
                              <div className="min-w-0 flex-1 overflow-hidden">
                                <h4 
                                  title={course.title}
                                  className="font-bold text-xs text-stone-900 line-clamp-2 break-words leading-snug cursor-pointer hover:text-emerald-700"
                                  onClick={() => startBuilderForEdit(course)}
                                >
                                  {course.title}
                                </h4>
                                <p className="text-[11px] text-stone-500 font-medium mt-1 flex flex-wrap items-center gap-1">
                                  <span>{course.category}</span>
                                  <span>·</span>
                                  <span className="text-stone-600">{courseLevelLabel}</span>
                                </p>
                                <p className="font-extrabold text-xs text-stone-850 mt-1">
                                  {formatVND(course.salePrice || course.price || 0)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between border-t border-b border-slate-100 py-2 text-xs gap-2">
                              <span className={`inline-flex whitespace-nowrap items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  displayStatus === 'published' || displayStatus === 'active' ? 'bg-emerald-500' :
                                  displayStatus === 'rejected' ? 'bg-rose-500' :
                                  displayStatus === 'draft' ? 'bg-amber-500' :
                                  displayStatus === 'hidden' ? 'bg-slate-400' : 'bg-purple-500'
                                }`} />
                                {statusLabel}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-stone-600 font-medium tabular-nums">
                                <span>Học viên: <strong className="text-stone-800">{formatNumber(course.enrolledCount)}</strong></span>
                                <span>|</span>
                                <span>Doanh thu: <strong className="text-emerald-700 font-extrabold">{formatVND(course.enrolledCount * (course.salePrice || course.price || 0))}</strong></span>
                                <span>|</span>
                                <span>Cập nhật: <strong className="text-stone-800">{formattedDate}</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1 whitespace-nowrap">
                              {(displayStatus === 'draft' || course.status === 'draft') && (
                                <button 
                                  onClick={async () => {
                                    if (window.confirm('Bạn có muốn gửi khóa học này cho Admin duyệt không?')) {
                                      try {
                                        await instructorApi.submitCourseToAdminVerification(course.id);
                                        showDashboardToast('Đã gửi yêu cầu duyệt khóa học thành công!');
                                        loadInstructorCoursesList();
                                      } catch (err: any) {
                                        console.error("Error submitting course for review:", err);
                                        setSubmitErrorModalState({
                                          isOpen: true,
                                          title: 'Gửi duyệt khóa học thất bại',
                                          message: err.message || 'Khóa học chưa đủ điều kiện gửi duyệt.',
                                          status: err.status || 400,
                                          errors: err.errors || null,
                                        });
                                      }
                                    }
                                  }}
                                  className="h-9 min-w-[76px] px-2.5 inline-flex items-center justify-center whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold cursor-pointer shrink-0"
                                >
                                  Gửi duyệt
                                </button>
                              )}

                              <button 
                                onClick={() => startBuilderForEdit(course)}
                                disabled={courseActionLoadingId === String(course.id)}
                                className="h-9 min-w-[80px] px-3 inline-flex items-center justify-center whitespace-nowrap bg-white hover:bg-slate-50 text-stone-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer shadow-3xs shrink-0 disabled:opacity-50"
                              >
                                Chỉnh sửa
                              </button>

                              {displayStatus === 'hidden' ? (
                                <button 
                                  onClick={() => handleConfirmUnhide(course.id)}
                                  disabled={courseActionLoadingId === String(course.id)}
                                  className="h-9 px-3 inline-flex items-center justify-center gap-1.5 whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                  title="Hiện lại khóa học"
                                >
                                  {courseActionLoadingId === String(course.id) && courseActionType === 'unhiding' ? (
                                    <div className="w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                  Hiện lại
                                </button>
                              ) : (
                                <button 
                                  onClick={() => setHideModalCourse(course)}
                                  disabled={courseActionLoadingId === String(course.id)}
                                  className="h-9 px-3 inline-flex items-center justify-center gap-1.5 whitespace-nowrap bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                  title="Ẩn khóa học"
                                >
                                  {courseActionLoadingId === String(course.id) && courseActionType === 'hiding' ? (
                                    <div className="w-3.5 h-3.5 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  )}
                                  Ẩn khóa học
                                </button>
                              )}

                              <button 
                                onClick={() => setDeleteModalCourse(course)}
                                disabled={courseActionLoadingId === String(course.id)}
                                className="w-9 h-9 inline-flex items-center justify-center text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                title="Xóa khóa học"
                                aria-label="Xóa khóa học"
                              >
                                {courseActionLoadingId === String(course.id) && courseActionType === 'deleting' ? (
                                  <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                
                {/* Pagination */}
                {!isCoursesLoading && !coursesError && totalCoursesCount > 0 && (
                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-stone-600 min-h-[60px]">
                    {(() => {
                      const currentPage = isApiMode ? (apiCoursesMeta.current_page || 1) : coursePage;
                      const perPage = isApiMode ? (apiCoursesMeta.per_page || 10) : 10;
                      const total = isApiMode ? (apiCoursesMeta.total || 0) : filteredInstructorCourses.length;
                      const lastPage = isApiMode ? (apiCoursesMeta.last_page || 1) : Math.ceil(filteredInstructorCourses.length / perPage) || 1;
                    const from = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
                    const to = Math.min(currentPage * perPage, total);

                    const handlePageChange = (newPage: number) => {
                      if (newPage < 1 || newPage > lastPage || newPage === currentPage) return;
                      setCoursePage(newPage);
                      document.getElementById('courses-list-section')?.scrollIntoView({ behavior: 'smooth' });
                    };

                    const getPageNumbers = (current: number, totalPages: number) => {
                      if (totalPages <= 7) {
                        return Array.from({ length: totalPages }, (_, i) => i + 1);
                      }
                      if (current <= 4) {
                        return [1, 2, 3, 4, 5, '...', totalPages];
                      }
                      if (current >= totalPages - 3) {
                        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                      }
                      return [1, '...', current - 1, current, current + 1, '...', totalPages];
                    };

                    const pageNumbers = getPageNumbers(currentPage, lastPage);

                    return (
                      <>
                        <span className="text-xs text-stone-500 font-medium">
                          Hiển thị <strong className="text-stone-900 font-bold">{from}–{to}</strong> trên <strong className="text-stone-900 font-bold">{total}</strong> khóa học
                        </span>

                        {/* Desktop Numeric Pagination (≥ 640px) */}
                        <div className="hidden sm:flex items-center gap-1.5">
                          <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-white bg-slate-50 text-stone-700 disabled:opacity-40 disabled:hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed transition-colors text-xs font-bold"
                            title="Trang trước"
                            aria-label="Trang trước"
                          >
                            &larr;
                          </button>

                          {pageNumbers.map((p, idx) => {
                            if (p === '...') {
                              return (
                                <span key={`dots-${idx}`} className="w-8 text-center text-stone-400 font-bold select-none">
                                  ...
                                </span>
                              );
                            }
                            const isCurrent = p === currentPage;
                            return (
                              <button
                                key={`page-${p}`}
                                onClick={() => handlePageChange(p as number)}
                                className={`w-9 h-9 flex items-center justify-center border rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                                  isCurrent 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-3xs' 
                                    : 'bg-white border-slate-200 text-stone-700 hover:bg-slate-100'
                                }`}
                              >
                                {p}
                              </button>
                            );
                          })}

                          <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= lastPage}
                            className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-white bg-slate-50 text-stone-700 disabled:opacity-40 disabled:hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed transition-colors text-xs font-bold"
                            title="Trang sau"
                            aria-label="Trang sau"
                          >
                            &rarr;
                          </button>
                        </div>

                        {/* Mobile Compact Pagination (< 640px) */}
                        <div className="flex sm:hidden items-center gap-2">
                          <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="px-3 h-9 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-white bg-slate-50 text-stone-700 disabled:opacity-40 disabled:hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed transition-colors text-xs font-bold"
                          >
                            Trước
                          </button>
                          <span className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-bold text-xs text-stone-800">
                            {currentPage} / {lastPage}
                          </span>
                          <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= lastPage}
                            className="px-3 h-9 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-white bg-slate-50 text-stone-700 disabled:opacity-40 disabled:hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed transition-colors text-xs font-bold"
                          >
                            Sau
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
                )}
              </div>

              {/* Sidebar side (span 1) */}
              <div className="space-y-4 w-full">
                
                {/* Performance Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs text-left space-y-3.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h4 className="font-extrabold text-xs text-stone-900">Hiệu suất khóa học</h4>
                    <span className="text-[9px] text-stone-400 font-bold bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">7 ngày qua</span>
                  </div>

                  {(() => {
                    const enrollmentsCount = isApiMode && dashboardOverview?.enrollment_summary
                      ? (dashboardOverview.enrollment_summary.new_this_month ?? dashboardOverview.enrollment_summary.total_enrollments ?? 0)
                      : 0;
                    
                    const revenueAmount = isApiMode && dashboardOverview?.revenue_summary
                      ? parseFloat(dashboardOverview.revenue_summary.instructor_amount_this_month || '0')
                      : 0;

                    const unansweredCount = isApiMode && dashboardOverview?.interaction_summary
                      ? (dashboardOverview.interaction_summary.unanswered_questions || 0)
                      : 0;

                    const enrollChange = dashboardOverview?.enrollment_summary?.change_percentage;
                    const prevEnroll = dashboardOverview?.enrollment_summary?.previous_period_enrollments || 0;
                    
                    const revChange = dashboardOverview?.revenue_summary?.change_percentage;
                    const prevRev = parseFloat(dashboardOverview?.revenue_summary?.previous_period_instructor_amount || '0');

                    const isAllZero = enrollmentsCount === 0 && revenueAmount === 0 && unansweredCount === 0;

                    return (
                      <div className="space-y-2.5 text-[11px]">
                        {isAllZero && (
                          <p className="text-[10.5px] text-stone-400 font-medium italic text-center py-1">
                            Chưa có dữ liệu hiệu suất trong 7 ngày qua.
                          </p>
                        )}

                        <div className="flex justify-between items-center bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-stone-450 text-[9px] uppercase font-extrabold block leading-none">Lượt xem</span>
                            <span className="font-extrabold text-stone-800 text-sm mt-1 block">0</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-stone-450 text-[9px] uppercase font-extrabold block leading-none">Lượt đăng ký</span>
                            <span className="font-black text-stone-800 text-sm mt-1 block">
                              {formatNumber(enrollmentsCount)}
                            </span>
                          </div>
                          {isApiMode && enrollChange !== undefined && enrollChange !== null && (enrollmentsCount > 0 || prevEnroll > 0) && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              enrollChange >= 0
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/50'
                                : 'text-rose-700 bg-rose-50 border border-rose-200/50'
                            }`}>
                              {enrollChange >= 0 ? '↑' : '↓'} {Math.abs(enrollChange)}%
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-stone-450 text-[9px] uppercase font-extrabold block leading-none">Doanh thu</span>
                            <span className="font-black text-stone-800 text-sm mt-1 block">
                              {formatVND(revenueAmount)}
                            </span>
                          </div>
                          {isApiMode && revChange !== undefined && revChange !== null && (revenueAmount > 0 || prevRev > 0) && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              revChange >= 0
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/50'
                                : 'text-rose-700 bg-rose-50 border border-rose-200/50'
                            }`}>
                              {revChange >= 0 ? '↑' : '↓'} {Math.abs(revChange)}%
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-stone-450 text-[9px] uppercase font-extrabold block leading-none">Thắc mắc chưa trả lời</span>
                            <span className="font-black text-stone-800 text-sm mt-1 block">
                              {formatNumber(unansweredCount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Mẹo Giảng Viên */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs text-left space-y-2.5 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-emerald-100/30 rounded-full shrink-0 flex items-center justify-center text-emerald-600 text-3xl">🎓</div>
                  <h4 className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                    <span>Mẹo giảng viên</span>
                  </h4>
                  <p className="text-[10px] text-stone-600 leading-relaxed font-medium">
                    Hoàn thiện đầy đủ danh sách checklist trước khi gửi duyệt sẽ giúp nâng cao tỷ lệ phê duyệt của ban chuyên môn.
                  </p>
                  <button 
                    onClick={() => alert("Xem tài liệu hướng dẫn")}
                    className="text-[10px] text-emerald-700 hover:underline font-extrabold flex items-center gap-0.5 cursor-pointer pt-0.5"
                  >
                    Xem hướng dẫn &rarr;
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* --- DEDICATED STEPS COURSE BUILDER PAGE - MATCHES MOCKUP 3 --- */}
        {activeTab === 'builder' && (() => {
          // Calculate checklist progress dynamically aligned with Backend requirements
          const hasTitle = !!title.trim();
          const hasSlug = !!slug.trim();
          const parsedCatInt = parseInt(String(category), 10);
          const hasCategory = Number.isInteger(parsedCatInt) && parsedCatInt > 0;
          const hasLevel = !!level;
          const hasLanguage = !!language;
          const hasShortDesc = !!subtitle.trim();
          const hasDesc = !!description.trim();
          
          let totalChapters = chapters.length;
          let totalLessons = 0;
          let totalDurationSeconds = 0;
          let freePreviewsCount = 0;
          let totalAssetsCount = 0;
          let hasInvalidVideoLesson = false;
          
          chapters.forEach(ch => {
            if (ch.lessons) {
              totalLessons += ch.lessons.length;
              ch.lessons.forEach((l: any) => {
                totalDurationSeconds += l.video_duration_seconds || 0;
                if (l.is_preview) freePreviewsCount++;
                if (l.resources) totalAssetsCount += l.resources.length;
                if ((l.lesson_type === 'video' || l.type === 'video') && (!l.video_url || !l.video_url.trim() || l.video_url.startsWith('blob:'))) {
                  hasInvalidVideoLesson = true;
                }
                if ((l.lesson_type === 'video' || l.type === 'video') && (!l.video_duration_seconds || l.video_duration_seconds <= 0)) {
                  hasInvalidVideoLesson = true;
                }
              });
            }
          });

          const hasThumbnail = !!image;
          const hasIntroVideo = !!introVideoUrl;
          const hasOutcomes = willLearn.length > 0 && willLearn.some(x => x.trim().length > 0);
          const hasRequirements = requirements.length > 0 && requirements.some(x => x.trim().length > 0);
          const hasPrice = price >= 0;

          // Missing Items list
          const missingItems: string[] = [];
          if (!hasTitle) missingItems.push('Tiêu đề khóa học');
          if (!hasCategory) missingItems.push('Danh mục khóa học');
          if (!hasShortDesc) missingItems.push('Mô tả ngắn khóa học');
          if (!hasDesc) missingItems.push('Mô tả chi tiết khóa học');
          if (!hasThumbnail) missingItems.push('Thumbnail khóa học');
          if (totalChapters === 0) missingItems.push('Ít nhất 1 chương học');
          if (totalLessons === 0) missingItems.push('Ít nhất 1 bài giảng');
          if (hasInvalidVideoLesson) missingItems.push('Bài học chưa có video được tải lên hợp lệ');

          // Completed Items list
          const completedItems: string[] = [];
          if (hasTitle) completedItems.push('Tiêu đề khóa học');
          if (hasSlug) completedItems.push('Slug (đường dẫn)');
          if (hasCategory) completedItems.push('Danh mục');
          if (hasLevel) completedItems.push('Cấp độ');
          if (hasShortDesc) completedItems.push('Mô tả ngắn');
          if (hasDesc) completedItems.push('Mô tả chi tiết');
          if (hasThumbnail) completedItems.push('Thumbnail khóa học');
          if (totalChapters > 0) completedItems.push('Chương học');
          if (totalLessons > 0 && !hasInvalidVideoLesson) completedItems.push('Bài giảng hoàn chỉnh');

          const totalChecks = 8;
          const passedChecks = Math.max(0, totalChecks - missingItems.length);
          const checklistProgress = missingItems.length === 0 ? 100 : Math.min(95, Math.round((passedChecks / totalChecks) * 100));

          const handleSaveDraft = async () => {
            if (!title.trim()) {
              alert('Vui lòng nhập Tiêu đề khóa học trước khi lưu nháp.');
              return;
            }
            setIsSavingDraft(true);
            setAutosaveError(null);
            try {
              const selectedCatInt = parseInt(String(category), 10);
              const isUncategorizedPending = category === 'none_pending';
              const validCategoryInt = (Number.isInteger(selectedCatInt) && selectedCatInt > 0)
                ? selectedCatInt
                : (isUncategorizedPending ? null : (dbCategories.length > 0 ? (parseInt(String(dbCategories[0].id), 10) || 1) : 1));

              const payload = {
                title: title.trim(),
                slug: slug.trim() || undefined,
                category_id: validCategoryInt || undefined,
                category_ids: validCategoryInt ? [validCategoryInt] : [],
                level: level || 'beginner',
                language: language || 'vi',
                short_description: subtitle || title.trim(),
                subtitle: subtitle || title.trim(),
                description: description.trim(),
                price: Number(price) || 0,
                sale_price: salePrice !== null ? Number(salePrice) : undefined,
                salePrice: salePrice !== null ? Number(salePrice) : undefined,
                image,
                thumbnail_url: image || undefined,
                introVideoUrl,
                intro_video_url: introVideoUrl || undefined,
                requirements: Array.isArray(requirements) ? requirements.filter(Boolean).join('\n') : (requirements || ''),
                willLearn: Array.isArray(willLearn) ? willLearn.filter(Boolean).join('\n') : (willLearn || ''),
                outcomes: Array.isArray(willLearn) ? willLearn.filter(Boolean).join('\n') : (willLearn || ''),
              };

              if (sharedApi.getConfig().mode === 'api') {
                if (editingCourseId) {
                  await instructorApi.updateCourseDraft(editingCourseId, payload);
                } else {
                  const res = await instructorApi.createCourseDraft(payload);
                  const newId = String(res.data?.id || res.id);
                  if (newId) {
                    setEditingCourseId(newId);
                  }
                }
                loadInstructorCoursesList();
              } else {
                const mockPayload: Course = {
                  id: editingCourseId || 'course-' + Date.now(),
                  title,
                  subtitle: subtitle || 'Nhãn phụ chi tiết khóa học mới',
                  description,
                  category,
                  subcategory: subcategory || 'Chuyên gia nâng cao',
                  price,
                  salePrice,
                  rating: 5.0,
                  reviewCount: 0,
                  enrolledCount: 0,
                  completionRate: 0,
                  image,
                  instructorId: currentUser.id,
                  instructorName: currentUser.name,
                  instructorTitle: 'Giảng viên chuyên môn tại MindHub',
                  instructorAvatar: currentUser.avatar,
                  instructorBio: currentUser.bio || '',
                  chapters,
                  requirements,
                  willLearn,
                  status: 'draft',
                  allowSkip: true,
                  allowDownload: false,
                  allowDiscussion: true,
                  giveCertificate: false,
                  allowFreeDoc: false,
                  allowFreeVideo: false,
                  freeVideoDuration: 30,
                  reviews: [],
                  faqs: [],
                  isHidden: false,
                  slug,
                  level,
                  language,
                  introVideoUrl
                };
                if (editingCourseId) {
                  onUpdateCourse(mockPayload);
                } else {
                  onCreateCourseDraft(mockPayload);
                }
              }

              const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
              setLastSavedTime(timeStr);
              alert('Lưu bản nháp khóa học thành công!');
            } catch (err: any) {
              console.error('Error saving draft:', err);
              setAutosaveError(err.message || 'Có lỗi xảy ra khi lưu nháp.');
              alert('Có lỗi xảy ra khi lưu nháp: ' + (err.message || 'Vui lòng thử lại.'));
            } finally {
              setIsSavingDraft(false);
            }
          };

          const validateStep1 = () => {
            const errs: Record<string, string> = {};

            // Title
            if (!title.trim()) {
              errs.title = 'Vui lòng nhập tiêu đề khóa học.';
            } else if (title.trim().length < 5) {
              errs.title = 'Tiêu đề khóa học phải có ít nhất 5 ký tự.';
            } else if (title.trim().length > 100) {
              errs.title = 'Tiêu đề khóa học không được vượt quá 100 ký tự.';
            }

            // Slug
            if (!slug.trim()) {
              errs.slug = 'Vui lòng nhập slug đường dẫn.';
            } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
              errs.slug = 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch nối (vd: lap-trinh-python).';
            }

            // Category
            if (!category || category === '') {
              errs.category = 'Vui lòng chọn danh mục hoặc chọn "Chưa có danh mục phù hợp".';
            }

            // Level
            if (!['beginner', 'intermediate', 'advanced', 'all_levels'].includes(level)) {
              errs.level = 'Vui lòng chọn cấp độ khóa học.';
            }

            // Language
            if (!language || !language.trim()) {
              errs.language = 'Vui lòng chọn ngôn ngữ giảng dạy.';
            }

            // Short description
            if (!subtitle.trim()) {
              errs.short_description = 'Vui lòng nhập mô tả ngắn khóa học.';
            } else if (subtitle.trim().length < 10) {
              errs.short_description = 'Mô tả ngắn phải có ít nhất 10 ký tự.';
            } else if (subtitle.trim().length > 500) {
              errs.short_description = 'Mô tả ngắn không được vượt quá 500 ký tự.';
            }

            // Description
            const plainDesc = description.replace(/<[^>]+>/g, '').trim();
            if (!plainDesc) {
              errs.description = 'Vui lòng nhập mô tả chi tiết khóa học.';
            } else if (plainDesc.length < 20) {
              errs.description = 'Mô tả chi tiết phải có ít nhất 20 ký tự.';
            }

            setStep1Errors(errs);
            return {
              isValid: Object.keys(errs).length === 0,
              errors: errs,
            };
          };

          const handleNext = () => {
            if (builderStep === 1) {
              const { isValid, errors: valErrors } = validateStep1();
              if (!isValid) {
                const orderedFieldKeys = ['title', 'slug', 'category', 'level', 'language', 'short_description', 'description'];
                const firstErrorKey = orderedFieldKeys.find(key => valErrors[key]);

                if (firstErrorKey) {
                  const el = document.getElementById(`focus-${firstErrorKey}`) || document.querySelector(`[data-focus-id="${firstErrorKey}"]`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const focusable = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.tagName === 'BUTTON'
                      ? el
                      : el.querySelector('input, textarea, select, button, [contenteditable="true"]');
                    if (focusable && typeof (focusable as HTMLElement).focus === 'function') {
                      (focusable as HTMLElement).focus();
                    }
                    el.classList.add('ring-2', 'ring-red-400', 'ring-offset-2', 'rounded-xl', 'transition-all', 'duration-300');
                    setTimeout(() => {
                      el.classList.remove('ring-2', 'ring-red-400', 'ring-offset-2');
                    }, 1500);
                  }
                }
                return;
              }
            }
            if (builderStep < 4) setBuilderStep(builderStep + 1);
          };
          const handlePrev = () => {
            if (builderStep > 1) setBuilderStep(builderStep - 1);
          };

          const steps = [
            { id: 1, label: 'Thông tin cơ bản' },
            { id: 2, label: 'Giá bán' },
            { id: 3, label: 'Hình ảnh & video giới thiệu' },
            { id: 4, label: 'Nội dung & gửi duyệt' }
          ];

          return (
            <div className="space-y-6 animate-fade-in text-xs text-left bg-slate-50/50 p-5 rounded-2xl border border-stone-200 font-sans">
              
              {/* Stepper Header Bar */}
              <div className="flex justify-between items-center select-none pb-2 border-b border-slate-100">
                <button 
                  onClick={() => {
                    if (window.confirm('Quay lại danh sách khóa học và bỏ qua tất cả thay đổi chưa lưu?')) setActiveTab('courses');
                  }}
                  className="text-[10px] font-black text-stone-450 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  &larr; Quay lại khóa học
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-full shadow-3xs">
                    <div className={`w-2 h-2 rounded-full ${isSavingDraft ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                    <span className="text-stone-600 font-bold text-[10px]">
                      {isSavingDraft ? 'Đang tự động lưu nháp...' : lastSavedTime ? `Đã tự động lưu nháp lúc ${lastSavedTime}` : 'Hệ thống tự động lưu nháp'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stepper Navigation Grid */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs">
                {steps.map((stepItem, idx) => {
                  const isActive = builderStep === stepItem.id;
                  const isFinished = builderStep > stepItem.id;
                  return (
                    <React.Fragment key={stepItem.id}>
                      <button
                        type="button"
                        onClick={() => setBuilderStep(stepItem.id)}
                        className="flex items-center gap-2 cursor-pointer focus:outline-none whitespace-nowrap"
                      >
                        {isFinished ? (
                          <span className="flex items-center gap-1 text-[#10b981] font-bold">
                            <CheckCircle className="w-4 h-4 text-[#10b981] fill-[#e6f4ea] shrink-0" />
                            {stepItem.label}
                          </span>
                        ) : isActive ? (
                          <span className="flex items-center gap-1.5 text-stone-850 font-black">
                            <span className="w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[10px] font-black shadow-3xs">{stepItem.id}</span>
                            {stepItem.label}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-stone-400 font-bold hover:text-stone-600">
                            <span className="w-5 h-5 rounded-full bg-stone-50 border border-stone-200 text-stone-400 flex items-center justify-center text-[10px] font-bold">{stepItem.id}</span>
                            {stepItem.label}
                          </span>
                        )}
                      </button>
                      {idx < steps.length - 1 && (
                        <div className={`h-[1px] flex-1 min-w-[20px] ${isFinished ? 'bg-[#10b981]' : 'bg-slate-100'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Steps forms wrapper */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
                
                {/* Step 1: Basic info */}
                {builderStep === 1 && (
                  <div className="space-y-4">
                    <div className="border-b pb-2 mb-2">
                      <h2 className="text-sm font-black text-stone-850">Thông tin cơ bản</h2>
                      <p className="text-[10.5px] text-stone-400 font-medium mt-1">Cung cấp thông tin tổng quan về khóa học của bạn.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div id="focus-title" data-focus-id="title">
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Tiêu đề khóa học *</label>
                        <input 
                          type="text" 
                          value={title}
                          onChange={(e) => {
                            const val = e.target.value.slice(0, 100);
                            setTitle(val);
                            if (step1Errors.title) setStep1Errors(prev => ({ ...prev, title: '' }));
                            if (!isManualSlug) {
                              const slugified = val.toLowerCase()
                                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                                .replace(/đ/g, "d").replace(/Đ/g, "d")
                                .replace(/[^a-z0-9\s-]/g, "")
                                .trim().replace(/\s+/g, "-");
                              setSlug(slugified);
                              if (step1Errors.slug) setStep1Errors(prev => ({ ...prev, slug: '' }));
                            }
                          }}
                          placeholder="Lập trình Python cơ bản cho người mới bắt đầu"
                          className={`w-full text-[11px] font-bold text-stone-700 border rounded-xl px-3 py-2.5 bg-slate-50/20 focus:outline-none transition-colors ${
                            step1Errors.title ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-emerald-500'
                          }`}
                        />
                        {step1Errors.title && (
                          <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {step1Errors.title}
                          </p>
                        )}
                      </div>
                      <div id="focus-slug" data-focus-id="slug">
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Slug (đường dẫn) *</label>
                        <input 
                          type="text" 
                          value={slug}
                          onChange={(e) => {
                            setSlug(e.target.value);
                            setIsManualSlug(true);
                            if (step1Errors.slug) setStep1Errors(prev => ({ ...prev, slug: '' }));
                          }}
                          placeholder="lap-trinh-python-co-ban-cho-nguoi-moi-bat-dau"
                          className={`w-full text-[11px] font-bold text-stone-700 border rounded-xl px-3 py-2.5 bg-slate-50/20 focus:outline-none transition-colors ${
                            step1Errors.slug ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-emerald-500'
                          }`}
                        />
                        {step1Errors.slug && (
                          <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {step1Errors.slug}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div id="focus-category" data-focus-id="category">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-[10.5px] font-bold text-stone-600">Danh mục *</label>
                          <span 
                            title="Khóa học chưa có danh mục sẽ được Quản trị viên phân loại chính xác khi phê duyệt."
                            className="text-[9.5px] font-bold text-emerald-600 hover:text-emerald-700 cursor-help"
                          >
                            Đề xuất danh mục?
                          </span>
                        </div>
                        <select 
                          value={category}
                          onChange={(e) => {
                            setCategory(e.target.value);
                            if (step1Errors.category) setStep1Errors(prev => ({ ...prev, category: '' }));
                          }}
                          className={`w-full text-[11px] font-bold text-stone-700 border rounded-xl px-3 py-2.5 bg-white focus:outline-none cursor-pointer transition-colors ${
                            step1Errors.category ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-emerald-500'
                          }`}
                        >
                          {dbCategories.length > 0 ? (
                            dbCategories.map((cat: any) => (
                              <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                            ))
                          ) : (
                            <>
                              <option value="1">Lập trình & Công nghệ</option>
                              <option value="2">Trí tuệ nhân tạo (AI)</option>
                            </>
                          )}
                          <option value="none_pending" className="text-amber-700 font-bold bg-amber-50">
                            ⚠️ Chưa có danh mục phù hợp (Admin phân loại khi duyệt)
                          </option>
                        </select>
                        {step1Errors.category && (
                          <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {step1Errors.category}
                          </p>
                        )}
                      </div>
                      <div id="focus-level" data-focus-id="level">
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Cấp độ *</label>
                        <select 
                          value={level}
                          onChange={(e) => {
                            setLevel(e.target.value);
                            if (step1Errors.level) setStep1Errors(prev => ({ ...prev, level: '' }));
                          }}
                          className={`w-full text-[11px] font-bold text-stone-700 border rounded-xl px-3 py-2.5 bg-white focus:outline-none cursor-pointer transition-colors ${
                            step1Errors.level ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-emerald-500'
                          }`}
                        >
                          <option value="beginner">Cơ bản (Beginner)</option>
                          <option value="intermediate">Trung cấp (Intermediate)</option>
                          <option value="advanced">Nâng cao (Advanced)</option>
                          <option value="all_levels">Mọi cấp độ (All Levels)</option>
                        </select>
                        {step1Errors.level && (
                          <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {step1Errors.level}
                          </p>
                        )}
                      </div>
                      <div id="focus-language" data-focus-id="language">
                        <LanguageSelect 
                          value={language} 
                          onChange={(langCode) => {
                            setLanguage(langCode);
                            if (step1Errors.language) setStep1Errors(prev => ({ ...prev, language: '' }));
                          }}
                          error={step1Errors.language}
                        />
                      </div>
                    </div>

                    <div id="focus-short_description" data-focus-id="short_description">
                      <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Mô tả ngắn *</label>
                      <textarea 
                        rows={2}
                        value={subtitle}
                        onChange={(e) => {
                          setSubtitle(e.target.value);
                          if (step1Errors.short_description) setStep1Errors(prev => ({ ...prev, short_description: '' }));
                        }}
                        placeholder="Khóa học giúp bạn nắm vững kiến thức nền tảng Python từ cơ bản đến thực hành..."
                        className={`w-full text-[11px] font-medium text-stone-700 border rounded-xl p-3 bg-slate-50/20 focus:outline-none transition-colors ${
                          step1Errors.short_description ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-emerald-500'
                        }`}
                      />
                      {step1Errors.short_description && (
                        <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {step1Errors.short_description}
                        </p>
                      )}
                    </div>

                    <div id="focus-description" data-focus-id="description">
                      <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Mô tả chi tiết *</label>
                      <RichTextEditor
                        value={description}
                        onChange={(val) => {
                          setDescription(val);
                          if (step1Errors.description) setStep1Errors(prev => ({ ...prev, description: '' }));
                        }}
                        placeholder="Soạn thảo mục tiêu, cấu trúc nội dung và bài học chi tiết..."
                        minHeight="220px"
                        error={step1Errors.description}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Pricing */}
                {builderStep === 2 && (() => {
                  const currentDP = typeof discountPercent === 'number' ? discountPercent : parseInt(String(discountPercent)) || 0;
                  const calculatedFinalPrice = (hasDiscount && currentDP >= 1 && currentDP <= 99)
                    ? Math.round((Number(price) * (100 - currentDP)) / 100)
                    : Number(price);

                  return (
                    <div className="space-y-4">
                      <div className="border-b pb-2 mb-2">
                        <h2 className="text-sm font-black text-stone-850">Giá bán</h2>
                        <p className="text-[10.5px] text-stone-400 font-medium mt-1">Cấu hình giá cả giao dịch khóa học.</p>
                      </div>

                      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-stone-700 block">Áp dụng giá khuyến mãi</span>
                          <span className="text-[10.5px] text-stone-400 font-medium mt-0.5 block">
                            {hasDiscount ? 'Nhập tỷ lệ giảm từ 1% đến 99%.' : 'Khóa học đang bán theo giá gốc.'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !hasDiscount;
                            setHasDiscount(nextState);
                            if (!nextState) {
                              setDiscountPercent('');
                            } else if (!discountPercent || Number(discountPercent) < 1) {
                              setDiscountPercent(40);
                            }
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            hasDiscount ? 'bg-emerald-600' : 'bg-stone-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              hasDiscount ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div id="focus-price" data-focus-id="price">
                          <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Giá bán gốc (VND) *</label>
                          <input 
                            type="number" 
                            min="0"
                            value={price || ''}
                            onChange={(e) => {
                              const sanitized = e.target.value.replace(/\D/g, '');
                              const val = sanitized === '' ? 0 : parseInt(sanitized, 10);
                              setPrice(val);
                            }}
                            onKeyDown={(e) => {
                              if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="499000"
                            className="w-full text-[11px] font-bold text-stone-700 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none bg-slate-50/10 focus:border-emerald-500"
                          />
                          {(!price || price <= 0) && (
                            <p className="text-[10px] font-medium text-rose-500 mt-1">Giá bán gốc phải lớn hơn 0.</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-bold text-stone-600 mb-1.5">Phần trăm giảm giá (%)</label>
                          <input 
                            type="number" 
                            min={1}
                            max={99}
                            disabled={!hasDiscount}
                            value={hasDiscount ? discountPercent : ''}
                            onChange={(e) => {
                              if (!hasDiscount) return;
                              const valStr = e.target.value.replace(/\D/g, '');
                              if (valStr === '') {
                                setDiscountPercent('');
                                return;
                              }
                              const val = parseInt(valStr, 10);
                              setDiscountPercent(val > 99 ? 99 : val);
                            }}
                            onKeyDown={(e) => {
                              if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="Ví dụ: 40"
                            className={`w-full text-[11px] font-bold border rounded-xl px-3 py-2.5 focus:outline-none transition-colors ${
                              !hasDiscount 
                                ? 'bg-slate-100 text-stone-400 border-slate-200 cursor-not-allowed' 
                                : 'text-stone-700 border-slate-200 bg-slate-50/10 focus:border-emerald-500'
                            }`}
                          />
                          <p className="text-[10px] text-stone-400 font-medium mt-1">
                            {hasDiscount ? 'Nhập tỷ lệ giảm từ 1% đến 99%.' : 'Khóa học đang bán theo giá gốc.'}
                          </p>
                          {hasDiscount && (discountPercent === '' || Number(discountPercent) < 1 || Number(discountPercent) > 99) && (
                            <p className="text-[10px] font-medium text-rose-500 mt-1">Vui lòng nhập phần trăm từ 1% đến 99%.</p>
                          )}
                        </div>
                      </div>

                      {/* Price Preview */}
                      <div className="bg-[#e6f4ea]/40 border border-emerald-100/60 rounded-xl p-3.5 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="text-stone-500 block font-bold text-[10px]">Thực tế thanh toán:</span>
                          <span className="text-sm font-black text-emerald-600 font-sans">
                            {formatVND(calculatedFinalPrice)}
                          </span>
                        </div>
                        {hasDiscount && currentDP >= 1 && currentDP <= 99 && (
                          <div className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1 text-[10px]">
                            Đã áp dụng giảm giá -{currentDP}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Step 3: Images & Intro Video */}
                {builderStep === 3 && (
                  <CourseMediaStep 
                    image={image}
                    setImage={setImage}
                    introVideoUrl={introVideoUrl}
                    setIntroVideoUrl={setIntroVideoUrl}
                  />
                )}

                {/* Step 4: Syllabus & Submit */}
                {builderStep === 4 && (
                  <CourseCurriculumStep 
                    chapters={chapters}
                    setChapters={setChapters}
                    checklistProgress={checklistProgress}
                    missingItems={missingItems}
                    completedItems={completedItems}
                    onSubmitForReview={handleFinishCoursePublish}
                  />
                )}

              </div>

              {/* Navigation buttons */}
              {builderStep < 4 && (
                <div className="flex justify-between pt-4 border-t select-none">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={builderStep === 1}
                    className="border border-slate-200 text-stone-600 bg-white hover:bg-slate-50 font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
                  >
                    Quay lại
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#10b981] hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl flex items-center gap-1 cursor-pointer select-none shadow-3xs transition-all"
                    >
                      Tiếp theo &rarr;
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })()}
        {/* ASSIGNMENTS SUBMISSION GRADING WORKFLOW */}
        {activeTab === 'grading' && (
          <div className="space-y-6 animate-fade-in text-xs text-left">
            <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1">
              <Clock className="w-4 h-4 text-stone-850" /> Chấm Bài làm học viên
            </h3>

            <div className="space-y-3">
              {gradingSubmissions.map(submission => (
                <div key={submission.id} className="border border-brand-light-active p-4 rounded-2xl bg-slate-50 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <span className="font-bold text-main-darker block">{submission.studentName}</span>
                      <span className="text-[10px] text-gray-400">{submission.email} • {submission.courseTitle}</span>
                    </div>
                    {submission.points ? (
                      <span className="bg-emerald-100 text-emerald-850 font-bold px-3 py-1 rounded">Điểm: {submission.points}/100</span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded">Chưa chấm điểm</span>
                    )}
                  </div>

                  <div className="bg-white border p-3 rounded-xl">
                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Mã nộp bài giải:</p>
                    <p className="font-mono text-[11px] text-emerald-600 break-all">{submission.submittedValue}</p>
                  </div>

                  {submission.points === null ? (
                    <div className="space-y-2">
                      <div className="flex gap-2.5">
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          placeholder="Chấm điểm (0 - 100)" 
                          id={`score-val-${submission.id}`}
                          onKeyDown={(e) => {
                            if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className="w-32 text-xs border border-brand-light-active pl-3 py-1.5 rounded-xl bg-white" 
                        />
                        <button 
                          onClick={() => {
                            const val = parseInt((document.getElementById(`score-val-${submission.id}`) as HTMLInputElement)?.value || '95');
                            handleGradeSubmission(submission.id, val, 'Lời giải của bạn chính xác, code tối ưu dữ liệu!');
                          }}
                          className="bg-brand-normal text-white text-[11px] font-bold px-5 py-1.5 rounded-xl hover:bg-brand-hover"
                        >
                          Xác nhận Điểm & Gửi phản hồi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500 italic"><b>Nhận xét:</b> {submission.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        
        

        
        {/* WITHDRAWAL TAB */}
        {activeTab === 'payout' && (
          <InstructorWithdrawal instructorId={currentUser?.id} />
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <TransactionManagement instructorId={currentUser?.id || ''} />
        )}

        {/* STUDENTS MANAGEMENT DASHBOARD */}
        {activeTab === 'students' && (
          <StudentManagement instructorCourses={displayedCourses} />
        )}

        {/* TAB 7: SECURITY */}
        {activeTab === 'security' && (
          <InstructorProfilePage currentUser={currentUser} onUpdateUser={onUpdateUser} />
        )}

        

        {/* TAB 9: COUPONS */}
        {activeTab === 'coupons' && (
          <CouponManagement />
        )}

        {/* TAB 10: QA */}
        {activeTab === 'qa' && (
          <InstructorQAModule />
        )}

        {/* SUBMIT ERROR & VALIDATION MODAL */}
        <SubmitErrorModal
          isOpen={submitErrorModalState.isOpen}
          onClose={() => setSubmitErrorModalState(prev => ({ ...prev, isOpen: false }))}
          title={submitErrorModalState.title}
          message={submitErrorModalState.message}
          status={submitErrorModalState.status}
          errors={submitErrorModalState.errors}
          missingItems={submitErrorModalState.missingItems}
          onNavigateToStep={(step) => {
            setActiveTab('builder');
            setBuilderStep(step);
          }}
        />

        {/* Toast Overlay */}
        {toastNotification && (
          <div className="fixed bottom-6 right-6 z-[9999] animate-bounce-in">
            <div className={`px-5 py-3.5 rounded-xl shadow-xl border font-bold text-xs flex items-center gap-2.5 ${
              toastNotification.type === 'success' ? 'bg-emerald-800 text-white border-emerald-700' : 'bg-rose-800 text-white border-rose-700'
            }`}>
              <span>{toastNotification.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{toastNotification.message}</span>
            </div>
          </div>
        )}

        {/* Modal 1: Confirm Hide Course */}
        {hideModalCourse && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in text-left">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto text-xl">
                <EyeOff className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-stone-900 text-base">Ẩn khóa học?</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Khóa học <strong className="text-stone-900">"{hideModalCourse.title}"</strong> sẽ không còn hiển thị cho học viên mới. Dữ liệu học viên, doanh thu và bài học hiện tại vẫn được giữ nguyên.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setHideModalCourse(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-stone-700 font-bold text-xs cursor-pointer transition-all flex-1"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmHide(hideModalCourse.id)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-md flex-1"
                >
                  Ẩn khóa học
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Confirm Delete Course */}
        {deleteModalCourse && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in text-left">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-stone-900 text-base">Xóa khóa học?</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Hành động này chỉ áp dụng cho khóa học chưa phát sinh học viên hoặc giao dịch. Dữ liệu của <strong className="text-stone-900">"{deleteModalCourse.title}"</strong> sẽ được chuyển vào trạng thái đã xóa.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalCourse(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-stone-700 font-bold text-xs cursor-pointer transition-all flex-1"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(deleteModalCourse.id, deleteModalCourse)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-md flex-1"
                >
                  Xóa khóa học
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Suggest Hide when Delete Conflict */}
        {deleteErrorSuggestHideCourse && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in text-left">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-rose-100 shadow-2xl">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-stone-900 text-base">Không thể xóa khóa học</h3>
                <p className="text-xs text-rose-700 mt-2 leading-relaxed bg-rose-50 p-3 rounded-xl border border-rose-100">
                  {deleteErrorSuggestHideCourse.message}
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteErrorSuggestHideCourse(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-stone-700 font-bold text-xs cursor-pointer transition-all flex-1"
                >
                  Bỏ qua
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmHide(deleteErrorSuggestHideCourse.course.id)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-md flex-1"
                >
                  Ẩn khóa học thay thế
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  </div>
</div>
  );
}
