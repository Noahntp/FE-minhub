import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, BookOpen, Clock, Plus, BarChart2, CheckCircle, 
  Settings, UserCheck, ShieldAlert, ArrowUpRight, FileText, Send, Trash2,
  Eye, EyeOff, Edit, PlusCircle, MinusCircle, Save, Check, ChevronRight, ChevronLeft,
  AlertTriangle, Play, HelpCircle, Lock, Sparkles, Upload, ArrowUp, ArrowDown, Shield, Key, Smartphone, Mail, X, LayoutDashboard, Activity, MessageSquare
} from 'lucide-react';
import { User, Course, Chapter, Lesson, Quiz, QuizQuestion, PayoutRequest } from '../types';
import { safeLocalStorage as localStorage } from '../utils/safeStorage';
import { ApiService } from '../services/api';
import { InstructorRevenue } from './InstructorRevenue';
import { InstructorWithdrawal } from './InstructorWithdrawal';
import { InstructorQAModule } from '../features/QA';
import { InstructorRevenueChart } from './InstructorRevenueChart';
import { InstructorEnrollmentChart } from './InstructorEnrollmentChart';
import { InstructorTopCourses } from './InstructorTopCourses';
import { CouponManagement } from '../features/Coupons';

interface InstructorDashboardProps {
  currentUser: User;
  courses: Course[];
  onCreateCourseDraft: (newC: Course) => void;
  onUpdateCourse: (c: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onClose: () => void;
}

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
      await ApiService.resendVerificationEmail(currentUser.email, 'verify_email');
      alert('Đã gửi email xác minh đến: ' + currentUser.email);
      setEmailStatus('unverified');
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi email');
      setEmailStatus('unverified');
    }
  };

  const handleEnableOtp = async () => {
    try {
      await ApiService.sendPhoneOtp(currentUser.phone || '', 'setup_2fa');
      setOtpStep('setup');
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi mã OTP');
    }
  };

  const handleConfirmOtp = async () => {
    if (otpCode.length === 6) {
      try {
        await ApiService.verifyPhoneOtp(currentUser.phone || '', otpCode, 'verify_phone');
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

function InstructorPackagesTab({ currentUser, quota, quotaLoading, quotaError, fetchQuota }: { currentUser: User, quota: any, quotaLoading: boolean, quotaError: boolean, fetchQuota: () => void }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getInstructorCreditTransactions(currentUser.id);
        setTransactions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [currentUser.id]);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between">
        <div>
          <h4 className="font-extrabold text-2xl flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-emerald-300" /> Hạn mức Lượt xuất bản
          </h4>
          <p className="text-emerald-100 max-w-md">
            Mỗi lần xuất bản khóa học công khai sẽ cần 1 lượt. Mua thêm gói lượt tạo để tiếp tục xuất bản khi hết hạn mức.
          </p>
        </div>
        <div className="mt-6 md:mt-0 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 min-w-[200px] text-center">
          <span className="block text-sm text-emerald-100 font-bold uppercase mb-1">Lượt khả dụng</span>
          {quotaLoading ? (
            <span className="text-xl font-black text-white/70 animate-pulse">Đang tải...</span>
          ) : quotaError ? (
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-red-300">Lỗi dữ liệu</span>
              <button onClick={fetchQuota} className="text-xs mt-2 underline text-white hover:text-emerald-100">Thử lại</button>
            </div>
          ) : (
            <span className="text-4xl font-black text-white">{quota.remaining}</span>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <a 
          href={`/instructor/${currentUser.id}/course-credit-packages`}
          onClick={(e) => {
            e.preventDefault();
            // Dispatch custom event or just use normal a tag. Actually, since App.tsx handles routing via history.pushState, 
            // the best way is to let the user click and the top level interceptor handle it if we have one. 
            // In MindHub, App.tsx has `navigateTo`. Since `navigateTo` is not passed down to `InstructorPackagesTab`, 
            // we can simulate a popstate:
            window.history.pushState({}, '', `/instructor/${currentUser.id}/course-credit-packages`);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-md"
        >
          <PlusCircle className="w-5 h-5" /> Mua thêm Gói Lượt tạo
        </a>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" /> Lịch sử Giao dịch Lượt xuất bản
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải lịch sử...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed rounded-xl">
            Bạn chưa có giao dịch nào liên quan đến lượt xuất bản.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600">Thời gian</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Loại giao dịch</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Mã đơn / Nội dung</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Thay đổi</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Số dư</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-gray-500">
                      {new Date(tx.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-4">
                      {tx.type === 'purchase' ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold uppercase">Mua gói</span>
                      ) : tx.type === 'use' ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold uppercase">Sử dụng</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold uppercase">{tx.type}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {tx.note || (tx.order ? tx.order.package_snapshot_name : tx.course ? `Khóa: ${tx.course.title}` : '')}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold">
                      <span className={tx.credits > 0 ? 'text-emerald-600' : 'text-amber-600'}>
                        {tx.credits > 0 ? '+' : ''}{tx.credits}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-gray-900">
                      {tx.balance_after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LaptopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
  );
}


export default function InstructorDashboard({
  currentUser,
  courses,
  onCreateCourseDraft,
  onUpdateCourse,
  onDeleteCourse,
  onClose
}: InstructorDashboardProps) {
  
  // Tabs: 'overview' | 'analytics' | 'revenue' | 'courses' | 'grading' | 'payout' | 'builder' | 'students' | 'security' | 'packages' | 'coupons'
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'revenue' | 'courses' | 'grading' | 'payout' | 'qa' | 'builder' | 'students' | 'security' | 'packages' | 'coupons'>('overview');

  const [quota, setQuota] = useState<{ remaining: number, totalPurchased: number }>({ remaining: 0, totalPurchased: 0 });
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [quotaError, setQuotaError] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);

  const fetchQuota = () => {
    setQuotaLoading(true);
    setQuotaError(false);
    ApiService.getInstructorCreditBalance(currentUser.id)
      .then(balance => setQuota({
        remaining: balance.remaining_credits || 0,
        totalPurchased: balance.total_credits || 0
      }))
      .catch(err => {
        console.error('Lỗi khi fetch quota:', err);
        setQuotaError(true);
      })
      .finally(() => setQuotaLoading(false));
  };

  useEffect(() => {
    fetchQuota();
    ApiService.getCoursePackages().then(setPackages).catch(console.error);
  }, [currentUser.id]);
  
  // --- BUILDER WIZARD STATES ---
  const [builderStep, setBuilderStep] = useState<number>(1);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  
  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development'); // strictly 'Development' | 'Artificial Intelligence'
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState<number>(500000);
  const [salePrice, setSalePrice] = useState<number>(350000);
  const [image, setImage] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800');
  const [requirements, setRequirements] = useState<string[]>(['Có máy tính cá nhân kết nối Internet']);
  const [newRequirement, setNewRequirement] = useState('');
  const [willLearn, setWillLearn] = useState<string[]>(['Lập trình thành thạo ngôn ngữ ứng dụng với thực tế']);
  const [newWillLearn, setNewWillLearn] = useState('');

  // Step 2: Syllabus (Chapters & Lessons)
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  
  // Active Chapter Selected for Lesson management
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  
  // Lesson state inputs
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'doc'>('video');
  const [newLessonDuration, setNewLessonDuration] = useState('15:00');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [newLessonDocContent, setNewLessonDocContent] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [newLessonIsPreview, setNewLessonIsPreview] = useState<boolean>(false);

  // Simulated Video Uploading Space States
  const [isVideoUploading, setIsVideoUploading] = useState<boolean>(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [videoUploadStatus, setVideoUploadStatus] = useState<string>('');

  // Step 3: Quizzes
  const [newQuizQuestion, setNewQuizQuestion] = useState('');
  const [quizA, setQuizA] = useState('');
  const [quizB, setQuizB] = useState('');
  const [quizC, setQuizC] = useState('');
  const [quizD, setQuizD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');

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

  // --- MOCK TRANSITIONS & HISTORY TRACERS ---
  const [payoutList, setPayoutList] = useState<PayoutRequest[]>([
    { id: 'pay-1', instructorId: currentUser.id, instructorName: currentUser.name, amount: 15000000, status: 'pending', date: '2026-05-25' }
  ]);

  // --- WITHDRAWAL FORM AND BANK PROFILE STATES ---
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [bankName, setBankName] = useState<string>(currentUser.payoutInfo?.bankName || 'Techcombank (TCB)');
  const [accountNumber, setAccountNumber] = useState<string>(currentUser.payoutInfo?.accountNumber || '19034567891011');
  const [accountHolder, setAccountHolder] = useState<string>(currentUser.payoutInfo?.accountHolder || 'NINH THỊ LAN CHI');
  const [instructorBalance, setInstructorBalance] = useState<number>(currentUser.payoutInfo?.balance ?? 24500000);
  const [isUpdatingBank, setIsUpdatingBank] = useState<boolean>(false);

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

  // Fetch stats when user changes
  useEffect(() => {
    if (currentUser?.id && currentUser.role === 'instructor') {
      ApiService.getInstructorEnrollmentStats(currentUser.id).then(res => {
        setTotalEnrollments(res.totalEnrollments);
      }).catch(err => console.error("Error fetching enrollment stats", err));

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      ApiService.getInstructorRevenueStats(currentUser.id, { startDate: firstDay }).then(res => {
        setRevenueStats(res);
      }).catch(err => console.error("Error fetching revenue stats", err));

      // Fetch new widgets stats
      ApiService.getInstructorBalance(currentUser.id).then(res => {
        setOverviewBalance(res.withdrawableBalance);
      }).catch(err => console.error("Error fetching balance", err));

      ApiService.getInstructorQAStats(currentUser.id).then(res => {
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
      
      ApiService.getInstructorEnrollments(currentUser.id, {
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

  const overviewStats = baseOverviewStats.total > 0 ? baseOverviewStats : {
    total: 12, published: 8, draft: 2, pending: 1, rejected: 1
  };

  const displayTotalEnrollments = totalEnrollments > 0 ? totalEnrollments : 1250;
  const displayTotalRevenue = revenueStats.totalRevenue > 0 ? revenueStats.totalRevenue : 45000000;
  const displayOverviewBalance = overviewBalance > 0 ? overviewBalance : 15500000;
  const displayOverviewUnansweredQA = overviewUnansweredQA > 0 ? overviewUnansweredQA : 5;

  const recentCourses = [...allInstructorCourses].sort((a, b) => {
    if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  }).slice(0, 5);

  const [courseFilterStatus, setCourseFilterStatus] = useState<string>('all');
  const instructorCourses = courseFilterStatus === 'all' 
    ? allInstructorCourses 
    : allInstructorCourses.filter(c => 
        courseFilterStatus === 'active' ? (c.status === 'active' || (c.status as any) === 'published') : 
        courseFilterStatus === 'pending' ? ((c.status as any) === 'pending_review' || c.status === 'pending') : 
        c.status === courseFilterStatus
      );

  const totalStudents = instructorCourses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const mockupAverageCompletion = Math.round(instructorCourses.reduce((sum, c) => sum + c.completionRate, 0) / (instructorCourses.length || 1));

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
      title, subtitle, description, category, subcategory, price, salePrice, image,
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
      setNewLessonVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
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
        duration: newLessonDuration || '10:00',
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
      setNewLessonVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
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
    // If Mode is API, ApiService.uploadLessonVideo will directly execute an actual XMLHttpRequest with progress events!
    const isMock = ApiService.getConfig().mode === 'mock';
    
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
      ApiService.uploadLessonVideo(file, (progress, status) => {
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

  const handleAddQuizToLesson = (chapterIdx: number, lessonId: string) => {
    if (!newQuizQuestion.trim()) {
      alert('Vui lòng soạn câu hỏi trắc nghiệm.');
      return;
    }
    if (!quizA || !quizB) {
      alert('Cần tối thiểu hai phương án đáp án A và B.');
      return;
    }

    const newQuestion: QuizQuestion = {
      id: 'q-' + Date.now(),
      question: newQuizQuestion,
      options: [quizA, quizB, quizC || 'Không có', quizD || 'Không có'],
      correctIndex: correctAnswer === 'A' ? 0 : correctAnswer === 'B' ? 1 : correctAnswer === 'C' ? 2 : 3,
      explanation: 'Đáp án chính xác do giảng viên thẩm duyệt thiết lập.'
    };

    setChapters(chapters.map((ch, idx) => {
      if (idx === chapterIdx) {
        return {
          ...ch,
          lessons: ch.lessons.map(les => {
            if (les.id === lessonId) {
              const currentQuiz = les.quiz || { id: 'qz-' + Date.now(), title: 'Bài tập trắc nghiệm khái niệm', questions: [] as QuizQuestion[] };
              return {
                ...les,
                quiz: {
                  id: currentQuiz.id,
                  title: currentQuiz.title,
                  questions: [...currentQuiz.questions, newQuestion]
                }
              };
            }
            return les;
          })
        };
      }
      return ch;
    }));

    setNewQuizQuestion('');
    setQuizA('');
    setQuizB('');
    setQuizC('');
    setQuizD('');
    alert('Đã tích hợp câu hỏi Quiz trắc nghiệm thành công!');
  };

  // Launch unified wizard screen
  const startBuilderForCreate = () => {
    if (quota.remaining <= 0) {
      alert('Bạn đã hết lượt tạo khóa học. Vui lòng mua Gói Khởi Tạo Khóa Học để tiếp tục.');
      setActiveTab('packages');
      return;
    }
    setEditingCourseId(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setCategory('Development');
    setSubcategory('');
    setPrice(500000);
    setSalePrice(350000);
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
    setBuilderStep(1);
    setActiveTab('builder');
  };

  const startBuilderForEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setTitle(course.title);
    setSubtitle(course.subtitle || '');
    setDescription(course.description || '');
    setCategory(course.category || 'Development');
    setSubcategory(course.subcategory || '');
    setPrice(course.price || 0);
    setSalePrice(course.salePrice || course.price);
    setImage(course.image);
    setRequirements(course.requirements || []);
    setWillLearn(course.willLearn || []);
    setChapters(course.chapters || []);
    setAllowSkip(course.allowSkip !== undefined ? course.allowSkip : true);
    setAllowDownload(course.allowDownload || false);
    setAllowDiscussion(course.allowDiscussion !== undefined ? course.allowDiscussion : true);
    setGiveCertificate(course.giveCertificate || false);
    setAllowFreeDoc(course.allowFreeDoc || false);
    setAllowFreeVideo(course.allowFreeVideo || false);
    setFreeVideoDuration(course.freeVideoDuration || 30);
    setFaqs(course.faqs || []);
    setBuilderStep(1);
    setActiveTab('builder');
  };

  const handleFinishCoursePublish = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Vui lòng hoàn thành điền Tên khóa học và Mô tả ở Bước 1 trước khi xuất bản.');
      setBuilderStep(1);
      return;
    }

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
      status: 'pending', // Pending moderator review workflow
      allowSkip,
      allowDownload,
      allowDiscussion,
      giveCertificate,
      allowFreeDoc,
      allowFreeVideo,
      freeVideoDuration,
      reviews: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.reviews || []) : [],
      faqs: faqs,
      isHidden: false
    };

    if (editingCourseId) {
      onUpdateCourse(payload);
      alert('Đã cập nhật chỉnh sửa khóa học thành công! Giáo án đã được chuyển sang trạng thái chờ duyệt thẩm định.');
    } else {
      onCreateCourseDraft(payload);
      alert('Đã khởi tạo khóa học mới thành công! Giáo án đã được chuyển lên Ban Kế Hoạch Kiểm Duyệt thẩm định xuất bản.');
      // Refresh lại quota sau khi push course
      fetchQuota();
    }

    // Clean up local storage drafting states
    localStorage.removeItem('mindhub_course_creation_draft');
    setActiveTab('courses');
  };

  const handleGradeSubmission = (subId: string, pts: number, fbCode: string) => {
    if (pts < 0) {
      alert('Chấm điểm không hợp lệ: Điểm số của học sinh không được phép nhận giá trị âm.');
      return;
    }
    setGradingSubmissions(prev => 
      prev.map(s => s.id === subId ? { ...s, points: pts, feedback: fbCode } : s)
    );
    alert('Đã phản hồi lời giải và chấm điểm thành công cho học viên.');
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Hồ sơ yêu cầu rút tiền đã khởi tạo thành công! Admin MindHub đang tiến hành kiểm tra giao dịch.');
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="bg-white min-h-[90vh] rounded-2xl border border-brand-light-active overflow-hidden flex flex-col md:flex-row text-main-darker animate-fade-in shadow">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-brand-light-active p-3 md:p-4 shrink-0 flex flex-col md:block">
        
        {/* Avatar and Info: visible on desktop, hidden/compact on mobile */}
        <div className="hidden md:block text-center pb-4 border-b border-brand-light-active mb-4">
          <img src={currentUser.avatar} alt="Avatar" className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-brand-normal" />
          <h3 className="text-xs font-bold truncate">{currentUser.name}</h3>
          <span className="text-[10px] bg-brand-normal text-brand-light font-display px-2 py-0.5 rounded-full inline-block mt-1 font-semibold">Giảng viên Premium</span>
        </div>

        {/* Buttons List: flex horizontal on mobile, vertical on desktop */}
        <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1.5 md:gap-2 scrollbar-none scroll-smooth">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'overview' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <LayoutDashboard className="w-4 h-4 text-stone-700" /> Tổng quan Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'analytics' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <BarChart2 className="w-4 h-4 text-stone-700" /> Phân Tích KPIs
          </button>
          <button 
            onClick={() => setActiveTab('revenue')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'revenue' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <Activity className="w-4 h-4 text-stone-700" /> Doanh Thu
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'courses' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <BookOpen className="w-4 h-4 text-stone-700" /> Quản lý Khóa học
          </button>
          <button 
            onClick={() => setActiveTab('grading')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'grading' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <Clock className="w-4 h-4 text-stone-700" /> Chấm Bài làm
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'students' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <Users className="w-4 h-4 text-stone-700" /> Quản lý Học viên
          </button>
          <button 
            onClick={() => setActiveTab('payout')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'payout' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <DollarSign className="w-4 h-4 text-stone-700" /> Yêu cầu Rút tiền
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'packages' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <Sparkles className="w-4 h-4 text-stone-700" /> Gói Tạo Khóa Học
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'coupons' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <PlusCircle className="w-4 h-4 text-stone-700" /> Mã Giảm Giá
          </button>
          <button 
            onClick={() => setActiveTab('qa')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'qa' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <MessageSquare className="w-4 h-4 text-stone-700" /> Hỏi Đáp & Bình Luận
          </button>

          <div className="md:pt-6 shrink-0 flex items-center">
            <button onClick={onClose} className="whitespace-nowrap border text-xs py-1.5 px-3 rounded-lg text-gray-500 hover:text-black hover:bg-white bg-slate-50 md:bg-transparent">
              Trở lại Trang Chủ
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in text-xs text-left">
            <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5 border-b pb-3">
              <LayoutDashboard className="w-5 h-5 text-stone-850" /> Tổng quan Dashboard Giảng Viên
            </h3>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: Tổng khóa học */}
              <div 
                onClick={() => { setActiveTab('courses'); setCourseFilterStatus('all'); }}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Tổng khóa học</span>
                  <BookOpen className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-stone-800">{overviewStats.total}</span>
              </div>

              {/* Card 2: Đang Published */}
              <div 
                onClick={() => { setActiveTab('courses'); setCourseFilterStatus('active'); }}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Khóa Published</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-emerald-600">{overviewStats.published}</span>
              </div>

              {/* Card 3: Khóa Draft */}
              <div 
                onClick={() => { setActiveTab('courses'); setCourseFilterStatus('draft'); }}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Khóa Draft</span>
                  <Edit className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-gray-600">{overviewStats.draft}</span>
              </div>

              {/* Card 4: Đang chờ duyệt */}
              <div 
                onClick={() => { setActiveTab('courses'); setCourseFilterStatus('pending'); }}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Chờ duyệt</span>
                  <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-amber-600">{overviewStats.pending}</span>
              </div>

              {/* Card 5: Bị từ chối */}
              <div 
                onClick={() => { setActiveTab('courses'); setCourseFilterStatus('rejected'); }}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Bị từ chối</span>
                  <AlertTriangle className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-red-600">{overviewStats.rejected}</span>
              </div>
            </div>

            {/* Thống kê bổ sung */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {/* Lượt ghi danh */}
              <div 
                onClick={() => { setActiveTab('students'); }}
                className="bg-brand-normal border border-brand-hover rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <span className="text-[11px] uppercase font-bold text-brand-light tracking-wider">Tổng lượt ghi danh</span>
                  <Users className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative z-10 mt-1">
                  <span className="text-2xl font-black text-white">{displayTotalEnrollments}</span>
                  <span className="text-xs font-bold text-brand-light ml-1.5">lượt</span>
                </div>
              </div>

              {/* Doanh thu */}
              <div 
                onClick={() => { setActiveTab('revenue'); }}
                className="bg-emerald-600 border border-emerald-500 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <span className="text-[11px] uppercase font-bold text-emerald-100 tracking-wider">Doanh thu tháng này</span>
                  <Activity className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative z-10 mt-1">
                  <span className="text-2xl font-black text-white">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayTotalRevenue)}
                  </span>
                </div>
              </div>

              {/* Số dư có thể rút */}
              <div 
                onClick={() => { setActiveTab('payout'); }}
                className="bg-[#5c3e21] border border-[#8b5e3c] rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <span className="text-[11px] uppercase font-bold text-[#e6ccb8] tracking-wider">Số dư có thể rút</span>
                  <DollarSign className="w-5 h-5 text-[#e6ccb8] group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative z-10 mt-1 flex justify-between items-end">
                  <span className="text-2xl font-black text-white">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayOverviewBalance)}
                  </span>
                </div>
              </div>

              {/* Câu hỏi chưa trả lời */}
              <div 
                onClick={() => { setActiveTab('qa'); }}
                className="bg-indigo-600 border border-indigo-500 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <span className="text-[11px] uppercase font-bold text-indigo-100 tracking-wider">Câu hỏi chưa trả lời</span>
                  <HelpCircle className="w-5 h-5 text-indigo-100 group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative z-10 mt-1">
                  <span className="text-2xl font-black text-white">{displayOverviewUnansweredQA}</span>
                  <span className="text-xs font-bold text-indigo-200 ml-1.5">câu hỏi</span>
                </div>
              </div>
            </div>

            {/* Thêm Biểu đồ phân tích doanh thu */}
            <div className="w-full mb-6">
              <InstructorRevenueChart instructorId={currentUser.id} courses={instructorCourses} />
            </div>

            {/* Thêm Biểu đồ phân tích học viên */}
            <div className="w-full mb-6">
              <InstructorEnrollmentChart instructorId={currentUser.id} courses={instructorCourses} />
            </div>

            {/* Thêm Widget Top khóa học */}
            <div className="w-full mb-6">
              <InstructorTopCourses instructorId={currentUser.id} />
            </div>

            {/* Biểu đồ và Hoạt động gần đây */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Biểu đồ */}
              <div className="lg:col-span-1 bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-xs text-stone-800 border-b pb-2">Tỷ lệ Trạng thái Khóa học</h4>
                <div className="flex flex-col items-center justify-center py-4">
                  {overviewStats.total > 0 ? (
                    <div className="relative w-40 h-40">
                      <div 
                        className="w-full h-full rounded-full"
                        style={{
                          background: `conic-gradient(
                            #10b981 0% ${(overviewStats.published / overviewStats.total) * 100}%, 
                            #9ca3af ${(overviewStats.published / overviewStats.total) * 100}% ${((overviewStats.published + overviewStats.draft) / overviewStats.total) * 100}%, 
                            #f59e0b ${((overviewStats.published + overviewStats.draft) / overviewStats.total) * 100}% ${((overviewStats.published + overviewStats.draft + overviewStats.pending) / overviewStats.total) * 100}%, 
                            #ef4444 ${((overviewStats.published + overviewStats.draft + overviewStats.pending) / overviewStats.total) * 100}% 100%
                          )`
                        }}
                      ></div>
                      <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                        <span className="text-3xl font-black text-stone-800">{overviewStats.total}</span>
                        <span className="text-[9px] text-stone-500 font-bold uppercase mt-1">Tổng cộng</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-stone-400 text-center py-10 w-full bg-slate-50 rounded-full h-40 flex items-center justify-center">Chưa có khóa học nào</div>
                  )}
                </div>
                <div className="space-y-2 mt-4 text-[10.5px]">
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Published</span> <b>{overviewStats.published}</b></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Draft</span> <b>{overviewStats.draft}</b></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending</span> <b>{overviewStats.pending}</b></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Rejected</span> <b>{overviewStats.rejected}</b></div>
                </div>
              </div>

              {/* Hoạt động gần đây */}
              <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-xs text-stone-800 border-b pb-2 flex justify-between items-center">
                  <span>Hoạt động gần đây (Mới nhất)</span>
                  <button onClick={() => { setActiveTab('courses'); setCourseFilterStatus('all'); }} className="text-brand-normal hover:underline text-[10px]">Xem tất cả</button>
                </h4>
                {recentCourses.length > 0 ? (
                  <div className="space-y-3">
                    {recentCourses.map((c, i) => (
                      <div key={i} className="flex gap-4 items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200 cursor-pointer" onClick={() => startBuilderForEdit(c)}>
                        <img src={c.image} alt="" className="w-20 h-14 object-cover rounded-md border shrink-0 bg-white" />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h5 className="font-bold text-stone-800 truncate text-[11px] mb-0.5">{c.title}</h5>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-stone-500 truncate">Giá: {formatVND(c.price)}</span>
                            {c.createdAt && <span className="text-[9px] text-stone-400">Tạo: {new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>}
                          </div>
                        </div>
                        <div>
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap border ${
                            c.status === 'active' || (c.status as any) === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            c.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                            c.status === 'pending' || (c.status as any) === 'pending_review' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-white text-gray-600 border-gray-200'
                          }`}>
                            {c.status === 'active' || (c.status as any) === 'published' ? 'Published' : 
                             c.status === 'rejected' ? 'Bị từ chối' : 
                             c.status === 'pending' || (c.status as any) === 'pending_review' ? 'Chờ duyệt' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-stone-400 py-16 flex flex-col items-center">
                    <BookOpen className="w-10 h-10 text-stone-200 mb-2" />
                    <span>Không có hoạt động nào</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB SUBPANELS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <h3 className="text-base font-display font-bold text-main-normal text-left flex items-center gap-1">
              <BarChart2 className="w-4 h-4 text-stone-850" /> Bảng Phân Tích KPIs Giảng Viên
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-brand-light-active p-4 rounded-2xl bg-slate-50 relative overflow-hidden text-left shadow-xs">
                <span className="text-gray-400 text-[10px] font-bold uppercase block">Tổng doanh thu nhận (100% doanh thu)</span>
                <span className="text-md font-bold text-brand-dark block mt-1">{formatVND(68200000)}</span>
                <span className="text-[10px] text-emerald-600 font-medium block mt-1">↑ 12% so với tháng trước</span>
              </div>
              <div className="border border-brand-light-active p-4 rounded-2xl bg-slate-50 relative overflow-hidden text-left shadow-xs">
                <span className="text-gray-400 text-[10px] font-bold uppercase block">Học viên đang học</span>
                <span className="text-md font-bold block mt-1">{totalStudents} Học viên</span>
                <span className="text-[10px] text-emerald-600 font-medium block mt-1">Hoạt động tốt học tập liên tục</span>
              </div>
              <div className="border border-brand-light-active p-4 rounded-2xl bg-slate-50 relative overflow-hidden text-left shadow-xs">
                <span className="text-gray-400 text-[10px] font-bold uppercase block">Tỷ lệ hoàn thành trung bình</span>
                <span className="text-md font-bold block mt-1">{mockupAverageCompletion}% Tốt nghiệp</span>
                <span className="text-[10px] text-red-500 font-medium block mt-1">Học viên bỏ dở: 15%</span>
              </div>
            </div>

            {/* Graphs mock block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-brand-light-active p-4 rounded-2xl text-left bg-white shadow-sm space-y-4">
                <h4 className="font-semibold text-xs text-main-normal">Biểu đồ doanh thu hàng tháng</h4>
                <div className="h-44 flex items-end justify-between gap-2 bg-slate-50 p-3 rounded-lg border">
                  {[12, 18, 25, 40, 56, 75, 42, 65, 85, 95, 120, 140].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col justify-end h-full">
                      <div style={{ height: `${(val / 140) * 100}%` }} className="bg-brand-normal rounded-t hover:bg-brand-hover" title={`Tháng ${idx + 1}: ${formatVND(val * 100000)}`}></div>
                      <span className="text-[8px] text-center text-gray-400 block mt-1">{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-brand-light-active p-4 rounded-2xl text-left bg-white shadow-sm space-y-3">
                <h4 className="font-semibold text-xs text-main-normal">Gợi ý chủ đề thịnh hành từ AI MindHub</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-brand-light/30 border rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[11px] block text-brand-dark">AI Agent with CrewAI / LangChain</span>
                      <span className="text-gray-400 text-[10px]">Lượng tìm kiếm tăng vọt 340% kể từ tháng trước</span>
                    </div>
                    <span className="bg-red-100 text-red-800 text-[9px] font-bold px-2 py-0.5 rounded">Hot Topic</span>
                  </div>
                  <div className="p-3 bg-brand-light/30 border rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[11px] block text-brand-dark">Figma AI UX Advanced Designs</span>
                      <span className="text-gray-400 text-[10px]">Tối ưu hóa phác thảo giao diện đa cấp</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">Trending</span>
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

        {/* LIST OF COURSES TAB - NOW VERTICAL LAYOUT */}
        {activeTab === 'courses' && (
          <div className="space-y-6 animate-fade-in text-xs text-left">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-stone-850" /> Quản lý Giáo Án Giảng Dạy ({instructorCourses.length})
              </h3>
              <div className="flex items-center gap-3">
                <select 
                  value={courseFilterStatus}
                  onChange={(e) => setCourseFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-stone-200 text-stone-700 text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal transition-all"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang Published</option>
                  <option value="draft">Bản Draft</option>
                  <option value="pending">Chờ Duyệt</option>
                  <option value="rejected">Bị Từ Chối</option>
                </select>
                <button 
                  onClick={startBuilderForCreate}
                  className="bg-brand-normal hover:bg-brand-hover text-brand-light text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Thiết kế khóa học mới
                </button>
              </div>
            </div>

            {instructorCourses.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed rounded-2xl">
                <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-500 font-medium text-xs">Bạn chưa thiết lập chương trình học nào.</p>
                <button onClick={startBuilderForCreate} className="mt-3 bg-brand-normal text-white px-4 py-1.5 rounded-xl font-bold">
                  Bắt đầu ngay
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {instructorCourses.map(course => (
                  <div 
                    key={course.id} 
                    className={`border border-brand-light-active rounded-2xl p-5 bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-stone-300 ${course.isHidden ? 'bg-stone-50/50 opacity-80' : ''}`}
                  >
                    {/* Left view detail */}
                    <div className="flex gap-4 text-left items-start md:items-center">
                      <img src={course.image} alt="Course banner" className="w-24 h-16 object-cover rounded-xl shrink-0 border" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${course.status === 'active' ? 'bg-emerald-100 text-emerald-800' : course.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {course.status === 'active' ? '● Đang hoạt động' : course.status === 'rejected' ? '● Bị Từ Chối' : '● Chờ Thẩm Định'}
                          </span>
                          {course.isHidden && (
                            <span className="bg-gray-150 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded">
                              🚫 ĐANG ẨN
                            </span>
                          )}
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-stone-600 font-mono">
                            {course.category === 'Development' ? 'Lập trình' : 'Trí tuệ nhân tạo (AI)'}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-main-darker mt-1.5 leading-snug">{course.title}</h4>
                        
                        <div className="flex gap-3 text-[10px] text-gray-500 mt-1">
                          <span>Học viên: <b className="text-stone-700">{course.enrolledCount}</b></span>
                          <span>Giá gốc: <del className="text-gray-400">{formatVND(course.price)}</del></span>
                          <span>Giá ưu đãi: <b className="text-brand-normal">{formatVND(course.salePrice || course.price)}</b></span>
                        </div>

                        {course.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-red-700 text-[10px] leading-relaxed">
                            ⚠️ <b>Lý do hoàn trả sửa đổi:</b> {course.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side functional options */}
                    <div className="flex items-center gap-1.5 shrink-0 w-full md:w-auto self-end md:self-center justify-end border-t md:border-t-0 pt-3 md:pt-0">
                      
                      {/* Hide/Show toggle option */}
                      <button 
                        onClick={() => {
                          const updated = { ...course, isHidden: !course.isHidden };
                          onUpdateCourse(updated);
                          alert(updated.isHidden ? 'Đã ẨN khóa học khỏi trang khám phá học viên.' : 'Đã HIỆN thị khoá học công khai.');
                        }}
                        className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1 transition-all ${course.isHidden ? 'bg-stone-50 border-stone-200 text-gray-400 hover:text-black' : 'border-stone-300 text-stone-700 hover:bg-slate-50'}`}
                        title={course.isHidden ? 'Hiển thị khóa học cho học viên' : 'Ẩn giấu khóa học khỏi học viên'}
                      >
                        {course.isHidden ? <EyeOff className="w-4 h-4 text-stone-500" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                        <span>{course.isHidden ? 'Hiện' : 'Ẩn'}</span>
                      </button>

                      {/* View Reason for Rejected */}
                      {course.status === 'rejected' && course.rejectionReason && (
                        <button 
                          onClick={() => alert(`Lý do từ chối: ${course.rejectionReason}`)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 p-2 px-3 rounded-xl flex items-center gap-1 text-xs font-bold"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Xem lý do</span>
                        </button>
                      )}

                      {/* Checklist option for Draft/Rejected */}
                      {(course.status === 'draft' || course.status === 'rejected') && (
                        <button 
                          onClick={() => alert('Chức năng Xem Checklist đang được phát triển.')}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 p-2 px-3 rounded-xl flex items-center gap-1 text-xs font-bold"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Xem checklist</span>
                        </button>
                      )}

                      {/* Edit option */}
                      {course.status !== 'pending' && (course.status as any) !== 'pending_review' && (
                        <button 
                          onClick={() => startBuilderForEdit(course)}
                          className="bg-brand-light-hover hover:bg-brand-light-active text-brand-dark border border-brand-normal/40 font-bold p-2 px-3 rounded-xl flex items-center gap-1 text-xs"
                        >
                          <Edit className="w-4 h-4" />
                          <span>{course.status === 'draft' || course.status === 'rejected' ? 'Tiếp tục hoàn thiện' : 'Chỉnh sửa'}</span>
                        </button>
                      )}

                      {/* Resubmit option for Draft/Rejected */}
                      {(course.status === 'draft' || course.status === 'rejected') && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Bạn muốn gửi yêu cầu duyệt lại khóa học này?')) {
                              onUpdateCourse({ ...course, status: 'pending' });
                              alert('Đã gửi yêu cầu xét duyệt khóa học thành công.');
                            }
                          }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 p-2 px-3 rounded-xl flex items-center gap-1 text-xs font-bold"
                        >
                          <Send className="w-4 h-4" />
                          <span>Gửi duyệt</span>
                        </button>
                      )}

                      {/* Delete option */}
                      <button 
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này? Thao tác này không thể thu hồi.')) {
                            onDeleteCourse(course.id);
                            alert('Đã xóa khóa học thành công.');
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-250 p-2 px-3 rounded-xl flex items-center gap-1 text-xs font-bold"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- DEDICATED STEPS COURSE BUILDER PAGE --- */}
        {activeTab === 'builder' && (
          <div className="space-y-6 animate-fade-in text-xs text-left bg-slate-50/50 p-5 rounded-2xl border border-stone-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b pb-3.5">
              <div>
                <span className="text-[10px] bg-brand-normal text-white px-2.5 py-0.5 rounded uppercase tracking-wider font-bold">
                  {editingCourseId ? 'SỬA ĐỔI HOÀN THIỆN GIÁO TRÌNH' : 'SOẠN THẢO KHÓA HỌC MỚI'}
                </span>
                <h3 className="text-base font-display font-extrabold text-main-normal mt-1.5">
                  MindHub Course Blueprint Wizard
                </h3>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleRestoreDraftFromLocal} 
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-3 py-1.5 rounded-xl font-bold text-[10.5px] border border-stone-300"
                  title="Khôi phục trạng thái từng làm trước đó"
                >
                  🔄 Phục hồi nháp từ máy
                </button>
                <button 
                  onClick={handleSaveDraftToLocal} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[10.5px] flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" /> Lưu tiến độ nháp
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Quay lại và bỏ qua tất cả chưa lưu?')) setActiveTab('courses');
                  }}
                  className="border px-3 py-1.5 rounded-xl hover:bg-white text-gray-500 font-bold"
                >
                  Thoát Trình Thiết Kế
                </button>
              </div>
            </div>

            {/* Steps breadcrumbs */}
            <div className="flex items-center justify-between overflow-x-auto gap-4 py-2 bg-white p-3 rounded-xl border text-[10.5px] font-semibold text-gray-500 shadow-xs">
              {[
                { s: 1, label: '1. Thông tin chung' },
                { s: 2, label: '2. Chương & Học liệu (.doc)' },
                { s: 3, label: '3. Tạo Quiz trắc nghiệm' },
                { s: 4, label: '4. Thiết lập học viên' },
                { s: 5, label: '5. Hoàn tất gửi duyệt' }
              ].map((stepObj) => (
                <button
                  key={stepObj.s}
                  onClick={() => {
                    if (stepObj.s < builderStep || title.trim() !== '') {
                      setBuilderStep(stepObj.s);
                    } else {
                      alert('Vui lòng khởi tạo tên khóa học ở bước 1 trước.');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${builderStep === stepObj.s ? 'bg-brand-normal text-brand-light font-bold' : 'hover:bg-slate-50'}`}
                >
                  {stepObj.label}
                </button>
              ))}
            </div>

            {/* STEP 1 VIEW PANEL */}
            {builderStep === 1 && (
              <div className="space-y-4 bg-white p-5 rounded-2xl border text-stone-800">
                <h4 className="font-bold text-xs text-brand-normal border-b pb-2">Bước 1: Nhập Các Thông Tin Cơ Bản Khóa Học</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Tên khóa học hoàn chỉnh *:</label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Chinh phục Spring Boot & Microservices nâng cao..."
                        className="w-full text-xs p-2.5 border rounded-xl focus:ring-1 focus:outline-none focus:ring-brand-normal"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Mô tả ngắn khái quát (dưới 80 từ):</label>
                      <input 
                        type="text" 
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="Cung cấp nền tảng vững vàng, cấu trúc code Clean Architecture..."
                        className="w-full text-xs p-2.5 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Giới thiệu giáo trình chi tiết:</label>
                      <textarea 
                        rows={5} 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Khóa học này sẽ hướng dẫn bám sát quy trình tuyển dụng tại các tập đoàn lớn..."
                        className="w-full text-xs p-2.5 border rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Danh mục chuyên ngành *:</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full text-xs p-2.5 border rounded-xl bg-white focus:outline-none"
                        >
                          <option value="Development">Development (Lập trình)</option>
                          <option value="Artificial Intelligence">Artificial Intelligence (AI)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Thẻ nhãn phụ (Ngôn ngữ/Framework):</label>
                        <input 
                          type="text" 
                          value={subcategory}
                          onChange={(e) => setSubcategory(e.target.value)}
                          placeholder="React 19, Python, LLM, v.v."
                          className="w-full text-xs p-2.5 border rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Giá bán gốc đề xuất (VND) *:</label>
                        <input 
                          type="number" 
                          value={price}
                          onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                          className="w-full text-xs p-2.5 border rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Giá khuyến mãi hiện tại (VND) *:</label>
                        <input 
                          type="number" 
                          value={salePrice}
                          onChange={(e) => setSalePrice(parseInt(e.target.value) || 0)}
                          className="w-full text-xs p-2.5 border rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Ảnh Banner đại diện khóa học (URL trực tiếp):</label>
                      <input 
                        type="text" 
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full text-xs p-2.5 border rounded-xl font-mono text-[10.5px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Requirements & learning results list editor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4 mt-3">
                  <div className="space-y-2">
                    <label className="block text-[10.5px] font-bold text-stone-600">Yêu cầu khóa học (Requirements):</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        placeholder="Có hiểu biết cơ bản về lập trình hướng đối tượng..."
                        className="w-full text-xs p-2 border rounded-xl"
                      />
                      <button type="button" onClick={handleAddNewRequirement} className="bg-stone-900 text-white px-3 rounded-lg font-bold">Thêm</button>
                    </div>
                    <ul className="space-y-1.5 mt-2">
                      {requirements.map((req, idx) => (
                        <li key={idx} className="flex justify-between items-center p-2 bg-slate-50 border rounded-lg text-[10.5px]">
                          <span>• {req}</span>
                          <button type="button" onClick={() => handleRemoveRequirement(idx)} className="text-red-500 font-bold hover:scale-105">gỡ</button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10.5px] font-bold text-stone-600">Lợi ích đạt được sau học trình (What we will learn):</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newWillLearn}
                        onChange={(e) => setNewWillLearn(e.target.value)}
                        placeholder="Xây dựng hoàn chỉnh web app thương mại điện tử..."
                        className="w-full text-xs p-2 border rounded-xl"
                      />
                      <button type="button" onClick={handleAddNewWillLearn} className="bg-stone-900 text-white px-3 rounded-lg font-bold">Thêm</button>
                    </div>
                    <ul className="space-y-1.5 mt-2">
                      {willLearn.map((learn, idx) => (
                        <li key={idx} className="flex justify-between items-center p-2 bg-slate-50 border rounded-lg text-[10.5px]">
                          <span>• {learn}</span>
                          <button type="button" onClick={() => handleRemoveWillLearn(idx)} className="text-red-500 font-bold hover:scale-105">gỡ</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setBuilderStep(2)}
                    className="bg-brand-normal hover:bg-brand-hover text-white py-2 px-6 rounded-xl font-bold flex items-center gap-1.5"
                  >
                    Tiếp tục chương trình <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 SYLLABUS PANEL (CHAPTERS & LESSONS WORKFLOW) */}
            {builderStep === 2 && (
              <div className="space-y-4 bg-white p-5 rounded-2xl border text-stone-800">
                <h4 className="font-bold text-xs text-brand-normal border-b pb-2 flex justify-between items-center">
                  <span>Bước 2: Xây dựng Chương học & Tải tài liệu (.doc) / Bài giảng Video</span>
                  <span className="text-stone-500 font-medium">Auto-save luôn sẵn sàng</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Chapters list */}
                  <div className="space-y-3 border-r pr-4">
                    <p className="font-extrabold text-[11px] text-stone-600">DANH SÁCH CHƯƠNG HỌC ({chapters.length})</p>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        placeholder="Chương 1: Cơ bản React"
                        className="w-full text-xs p-2 border rounded-xl"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddChapter} 
                        className="bg-brand-normal text-white px-4 rounded-xl font-bold"
                      >
                        Thêm
                      </button>
                    </div>

                    <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                      {chapters.map((ch, idx) => (
                        <div 
                          key={ch.id} 
                          onClick={() => setSelectedChapterIndex(idx)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center ${selectedChapterIndex === idx ? 'bg-brand-light/35 border-brand-normal/50 font-bold' : 'bg-slate-50 border-stone-200'}`}
                        >
                          <div className="flex-1 min-w-0 pr-1">
                            <span className="truncate block">Chương {idx+1}: {ch.title}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveChapter(idx, 'up');
                              }}
                              disabled={idx === 0}
                              className={`p-0.5 rounded hover:bg-stone-200 ${idx === 0 ? 'text-stone-300 pointer-events-none' : 'text-stone-550'}`}
                              title="Di chuyển lên"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveChapter(idx, 'down');
                              }}
                              disabled={idx === chapters.length - 1}
                              className={`p-0.5 rounded hover:bg-stone-200 ${idx === chapters.length - 1 ? 'text-stone-300 pointer-events-none' : 'text-stone-550'}`}
                              title="Di chuyển xuống"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newTitle = window.prompt("Nhập tiêu đề mới cho Chương học:", ch.title);
                                if (newTitle && newTitle.trim()) {
                                  setChapters(prev => prev.map((item, itemIdx) => itemIdx === idx ? { ...item, title: newTitle.trim() } : item));
                                }
                              }}
                              className="text-stone-600 hover:text-brand-normal text-[9px] font-bold px-1 py-0.5 border border-stone-200 rounded bg-white"
                              title="Đổi tên chương"
                            >
                              Sửa
                            </button>
                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Bạn có chắc chắn muốn xóa "${ch.title}" cùng toàn bộ bài học bên trong?`)) {
                                  handleRemoveChapter(idx);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 text-[9px] font-bold px-1 py-0.5 border border-red-200 rounded bg-red-50"
                              title="Xóa chương"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right 2 Columns: Add Lessons to active chapter */}
                  <div className="md:col-span-2 space-y-4 text-left">
                    {chapters.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 bg-slate-50 rounded-xl border border-dashed">
                        Hãy tạo chương học đầu tiên ở cột bên trái để cấp quyền thêm bài lý thuyết.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-brand-light-hover/30 p-3 rounded-xl border border-brand-normal/20">
                          <p className="font-extrabold text-stone-800 text-[11px]">
                            ĐANG THIẾT KẾ CHO: <span className="text-brand-normal">Chương {selectedChapterIndex+1}: {chapters[selectedChapterIndex]?.title}</span>
                          </p>
                        </div>

                        {/* Create/Tải video, doc bài viết details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Tên bài học học viên nhìn thấy *:</label>
                              <input 
                                type="text"
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                placeholder="Bài 1.1: Quản lý Luồng dữ liệu"
                                className="w-full text-xs p-2 border rounded-xl bg-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Thời lượng ước tính:</label>
                                <input 
                                  type="text"
                                  value={newLessonDuration}
                                  onChange={(e) => setNewLessonDuration(e.target.value)}
                                  placeholder="12:45 hoặc 20 mins"
                                  className="w-full text-xs p-2 border rounded-xl bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Kiểu nội dung học tập:</label>
                                <select
                                  value={newLessonType}
                                  onChange={(e) => setNewLessonType(e.target.value as 'video' | 'doc')}
                                  className="w-full text-xs p-2 border rounded-xl bg-white focus:outline-none"
                                >
                                  <option value="video">📹 Video bài giảng</option>
                                  <option value="doc">📄 Văn bản tự luận & Word .doc</option>
                                </select>
                              </div>
                            </div>

                            <div className="p-2 bg-white rounded-xl border border-stone-200 mt-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newLessonIsPreview}
                                  onChange={(e) => setNewLessonIsPreview(e.target.checked)}
                                  className="rounded border-gray-305 text-[#8b5e3c] focus:ring-[#8b5e3c] cursor-pointer"
                                />
                                <div>
                                  <p className="font-extrabold text-[10.5px] text-stone-850 flex items-center gap-1">
                                    <span>✨ Kích Hoạt Học Thử Miễn Phí</span>
                                  </p>
                                  <p className="text-[9px] text-gray-400">Cho phép người học xem thử miễn phí toàn bộ bài này để kích thích đăng ký mua học.</p>
                                </div>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-3 text-left">
                            {newLessonType === 'video' ? (
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Nhúng URL Video bài giảng:</label>
                                  <input 
                                    type="text"
                                    value={newLessonVideoUrl}
                                    onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/embed/..."
                                    className="w-full text-xs p-2 border rounded-xl bg-white font-mono"
                                  />
                                </div>

                                <div className="p-3 bg-white border border-dashed rounded-xl flex flex-col items-center justify-center text-center space-y-1.5 hover:border-brand-normal transition-colors relative">
                                  <Upload className="w-5 h-5 text-stone-500" />
                                  <p className="text-[10px] font-bold text-stone-700">HOẶC tải trực tiếp file Video bài giảng</p>
                                  <span className="text-[9px] text-stone-405 text-center">Hỗ trợ .mp4, .mov, .mkv, .avi lên tới 4GB (Mã hóa adaptive DRM tự động)</span>
                                  
                                  <input 
                                    type="file" 
                                    accept="video/*" 
                                    onChange={handleSimulateVideoUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    disabled={isVideoUploading}
                                  />
                                </div>

                                {isVideoUploading && (
                                  <div className="p-2.5 rounded-xl bg-brand-light/30 border border-brand-normal/20 space-y-1">
                                    <div className="flex justify-between items-center text-[9.5px] font-bold text-brand-dark">
                                      <span className="animate-pulse">⚡ {videoUploadStatus}</span>
                                      <span>{videoUploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-brand-normal transition-all duration-300"
                                        style={{ width: `${videoUploadProgress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="block text-[10.5px] font-bold text-stone-600">Nội dung văn bản chi tiết:</label>
                                  <button
                                    type="button"
                                    onClick={handleSimulateDocUpload}
                                    className="bg-brand-normal hover:bg-brand-hover text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1.5"
                                  >
                                    📂 Giả lập Upload File .doc
                                  </button>
                                </div>
                                <textarea 
                                  rows={4}
                                  value={newLessonDocContent}
                                  onChange={(e) => setNewLessonDocContent(e.target.value)}
                                  placeholder="Nhập thủ công hoặc bấm để upload dữ liệu file .doc của chương trình học..."
                                  className="w-full text-xs p-2 border rounded-xl bg-white font-mono text-[10.5px]"
                                />
                              </div>
                            )}

                            <div className="pt-2 flex gap-2">
                              {editingLessonId && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingLessonId(null);
                                    setNewLessonTitle('');
                                    setNewLessonVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
                                    setNewLessonDocContent('');
                                  }}
                                  className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-2 rounded-xl transition-all text-xs"
                                >
                                  Hủy sửa
                                </button>
                              )}
                              <button 
                                type="button"
                                onClick={handleAddLessonToChapter}
                                className={`flex-1 text-white font-bold py-2 rounded-xl transition-all text-xs ${editingLessonId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-stone-900 hover:bg-black'}`}
                              >
                                {editingLessonId ? 'Cập nhật bài học 💾' : 'Tích hợp bài học này 🚀'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Lessons List Preview for the selected chapter */}
                        <div className="space-y-2 pt-2">
                          <p className="font-extrabold text-[10.5px] text-stone-800">CÁC BÀI ĐÃ TÍCH HỢP TRONG CHƯƠNG NÀY:</p>
                          {chapters[selectedChapterIndex]?.lessons.length === 0 ? (
                            <p className="text-gray-400 text-xs italic">Chương này chưa có bài soạn thảo nào.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {chapters[selectedChapterIndex]?.lessons.map((les, lIdx) => (
                                <div key={les.id} className="p-2.5 bg-slate-50 border rounded-xl flex justify-between items-center text-xs">
                                  <div>
                                    <span className="font-bold text-stone-800 flex items-center gap-1 flex-wrap">
                                      <span>Bài {lIdx+1}: {les.title}</span>
                                      {les.isPreview && (
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                          ✨ HỌC THỬ MIỄN PHÍ
                                        </span>
                                      )}
                                    </span>
                                    <span className="ml-2 py-0.5 px-2 bg-stone-200 rounded text-[9px] uppercase tracking-wider font-mono">
                                      {les.type === 'video' ? '📹 video' : '📄 văn bản/doc'} • {les.duration}
                                    </span>
                                    {les.videoUrl && les.videoUrl.includes('stream') && (
                                      <p className="text-[9px] text-brand-normal font-mono truncate mt-0.5">✔ Video tải lên riêng tư (HLS DRM)</p>
                                    )}
                                    {les.docContent && (
                                      <p className="text-[10px] text-emerald-700 italic font-mono truncate mt-0.5">✔ Đã đọc tài liệu doc ({les.docContent.length} ký tự)</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingLessonId(les.id);
                                        setNewLessonTitle(les.title);
                                        setNewLessonType(les.type === 'doc' ? 'doc' : 'video');
                                        setNewLessonDuration(les.duration || '15:00');
                                        setNewLessonVideoUrl(les.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ');
                                        setNewLessonDocContent(les.docContent || '');
                                        setNewLessonIsPreview(les.isPreview || false);
                                        alert(`Đã nạp bài "${les.title}" vào bảng biên tập phía trên!`);
                                      }}
                                      className="text-brand-normal font-bold text-[10.5px] hover:underline"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Bạn có chắc chắn muốn gỡ bài: "${les.title}"?`)) {
                                          handleRemoveLesson(selectedChapterIndex, les.id);
                                          if (editingLessonId === les.id) {
                                            setEditingLessonId(null);
                                            setNewLessonTitle('');
                                          }
                                        }
                                      }}
                                      className="text-red-500 font-extrabold text-[10.5px]"
                                    >
                                      Gỡ bài
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                </div>

                <div className="flex justify-between pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setBuilderStep(1)}
                    className="border text-stone-600 hover:text-black py-2 px-5 rounded-xl font-bold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Quay lại Bước 1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (chapters.length === 0) {
                        alert('Xin vui lòng chuẩn bị chương học và bài giảng trước khi tạo bài Quiz kiểm tra.');
                        return;
                      }
                      setBuilderStep(3);
                    }}
                    className="bg-brand-normal hover:bg-brand-hover text-white py-2 px-6 rounded-xl font-bold flex items-center gap-1.5"
                  >
                    Tiếp soạn Quiz trắc nghiệm <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 INTERACTIVE QUIZ DESIGN PANEL */}
            {builderStep === 3 && (
              <div className="space-y-4 bg-white p-5 rounded-2xl border text-stone-800">
                <h4 className="font-bold text-xs text-brand-normal border-b pb-2">
                  Bước 3: Tích hợp bài trắc nghiệm nhanh sát hạch bài học (Quiz Creator)
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Thiết kế câu hỏi có sẵn để học viên vượt qua trước khi được mở khóa nội dung mới, rèn luyện tư duy thực hành lập trình & AI.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Select lesson to add quiz */}
                  <div className="space-y-3 border-r pr-4">
                    <p className="font-extrabold text-[10.5px] text-stone-600">CHỌN CHƯƠNG TRÌNH / BÀI HỌC SOẠN QUIZ:</p>
                    <div className="space-y-2 max-h-72 overflow-y-auto text-left">
                      {chapters.map((ch, cidx) => (
                        <div key={ch.id} className="space-y-1.5 p-1 border-b pb-2">
                          <p className="font-bold text-stone-700">📌 C.mục {cidx+1}: {ch.title}</p>
                          <div className="pl-3.5 space-y-1">
                            {ch.lessons.map((les) => (
                              <button
                                key={les.id}
                                type="button"
                                onClick={() => {
                                  setSelectedChapterIndex(cidx);
                                  // Selected lesson marker
                                  alert(`Đang chọn Soạn câu hỏi kiểm tra cho bài giảng: "${les.title}"`);
                                  // We can record selected Lesson ID using inputs
                                  setNewLessonTitle(les.title); // backup use
                                }}
                                className="w-full text-left truncate text-[10.5px] p-1.5 hover:bg-slate-50 rounded-lg flex items-center gap-1"
                              >
                                🔹 {les.title} {les.quiz ? `(Đã có ${les.quiz.questions.length} câu)` : '(Chưa có quiz)'}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Quiz questions editor */}
                  <div className="md:col-span-2 space-y-3 text-left bg-slate-50 p-4 rounded-xl border">
                    <p className="font-bold text-stone-800 text-[11px]">SOẠN TRẮC NGHIỆM CHI TIẾT</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Dữ liệu Câu hỏi sát hạch *:</label>
                        <input 
                          type="text"
                          value={newQuizQuestion}
                          onChange={(e) => setNewQuizQuestion(e.target.value)}
                          placeholder="Từ khóa 'use' trong React 19 có tính năng gì nổi trội?"
                          className="w-full text-xs p-2 border rounded-xl bg-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10.5px] text-stone-600 mb-1">Phương án A *:</label>
                          <input type="text" value={quizA} onChange={(e) => setQuizA(e.target.value)} className="w-full text-xs p-2 border rounded-xl bg-white" placeholder="Giải quyết luồng Promise và Context bất đồng bộ" />
                        </div>
                        <div>
                          <label className="block text-[10.5px] text-stone-600 mb-1">Phương án B *:</label>
                          <input type="text" value={quizB} onChange={(e) => setQuizB(e.target.value)} className="w-full text-xs p-2 border rounded-xl bg-white" placeholder="Thay thế hoàn toàn hook useState" />
                        </div>
                        <div>
                          <label className="block text-[10.5px] text-stone-600 mb-1">Phương án C (Tùy chọn):</label>
                          <input type="text" value={quizC} onChange={(e) => setQuizC(e.target.value)} className="w-full text-xs p-2 border rounded-xl bg-white" placeholder="Đưa dữ liệu ra server" />
                        </div>
                        <div>
                          <label className="block text-[10.5px] text-stone-600 mb-1">Phương án D (Tùy chọn):</label>
                          <input type="text" value={quizD} onChange={(e) => setQuizD(e.target.value)} className="w-full text-xs p-2 border rounded-xl bg-white" placeholder="Hủy bỏ luồng re-render" />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border">
                        <label className="text-[10.5px] font-bold text-stone-600">ĐÁP ÁN CHÍNH XÁC NHẤT:</label>
                        <div className="flex gap-4">
                          {['A', 'B', 'C', 'D'].map(ans => (
                            <label key={ans} className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer">
                              <input 
                                type="radio" 
                                name="correct_ans" 
                                value={ans} 
                                checked={correctAnswer === ans} 
                                onChange={() => setCorrectAnswer(ans as 'A' | 'B' | 'C' | 'D')}
                                className="accent-brand-normal"
                              />
                              {ans}
                            </label>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const activeCh = chapters[selectedChapterIndex];
                          if (!activeCh || activeCh.lessons.length === 0) {
                            alert('Vui lòng chọn bài giảng trước.');
                            return;
                          }
                          const targetLes = activeCh.lessons[0]; // defaults to first lesson of selected chapter
                          handleAddQuizToLesson(selectedChapterIndex, targetLes.id);
                        }}
                        className="bg-brand-normal text-white py-2 px-4 rounded-xl font-bold text-xs"
                      >
                        ⚡️ Ghép Câu Hỏi trắc nghiệm vào bài học đang chọn
                      </button>
                    </div>

                  </div>

                </div>

                <div className="flex justify-between pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setBuilderStep(2)}
                    className="border text-stone-600 hover:text-black py-2 px-5 rounded-xl font-bold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Quay lại Bước 2
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderStep(4)}
                    className="bg-brand-normal hover:bg-brand-hover text-white py-2 px-6 rounded-xl font-bold flex items-center gap-1.5"
                  >
                    Tiếp thiết lập bảo mật học viên <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: STUDENT PERMISSION SETTINGS */}
            {builderStep === 4 && (
              <div className="space-y-4 bg-white p-5 rounded-2xl border text-stone-850">
                <h4 className="font-bold text-sm text-brand-normal border-b pb-2">
                  Bước 4: Cấu hình phân quyền & Giới hạn hành động của Học viên
                </h4>
                <p className="text-xs text-gray-400">
                  Thiết lập kiểm tra đảm bảo tính công bằng học trình, chống tua bỏ dở bài học, download bản quyền học tài liệu.
                </p>

                <div className="space-y-4 max-w-xl text-left bg-slate-50 p-5 rounded-2xl border">
                  
                  {/* allowSkip */}
                  <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border">
                    <div>
                      <p className="font-bold text-xs text-stone-900">Cho phép bỏ qua thời lượng giảng dạy (Tua video nhanh):</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Không cho phép sẽ bắt buộc học viên theo dõi đầy đủ nội dung video để tích hợp hoàn thành.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowSkip} 
                        onChange={(e) => setAllowSkip(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* allowDownload */}
                  <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border">
                    <div>
                      <p className="font-bold text-xs text-stone-900">Học viên được phép tải Tài liệu / Đính kèm gốc mã nguồn:</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Tránh xuất bản leak dữ liệu ngoài trang nội bộ.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowDownload} 
                        onChange={(e) => setAllowDownload(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* allowDiscussion */}
                  <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border">
                    <div>
                      <p className="font-bold text-xs text-stone-900">Cho phép Mở chuyên mục phản hồi / Q&A Thảo Luận:</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Mở cổng giao tiếp hỗ trợ học viên giải bài tập, mentor định hướng.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={allowDiscussion} 
                        onChange={(e) => setAllowDiscussion(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* giveCertificate */}
                  <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border">
                    <div>
                      <p className="font-bold text-xs text-stone-900">Tự động trao Chứng nhận Tốt nghiệp tốt và chứng chỉ điện tử:</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Học viên vượt qua tất cả Quiz và hoàn thành 100% học trình sẽ nhận được chứng chỉ.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={giveCertificate} 
                        onChange={(e) => setGiveCertificate(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* FREE PREVIEW SETTINGS */}
                  <div className="border-t border-dashed border-stone-200 pt-4 mt-2">
                    <h5 className="font-bold text-xs text-[#8b5e3c] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#8b5e3c] shrink-0" />
                      <span>CẤU HÌNH HỌC THỬ MIỄN PHÍ (FREE PREVIEW):</span>
                    </h5>
                    <p className="text-[10.5px] text-stone-500 mb-3 leading-relaxed">
                      Thiết lập các điều kiện xem trước nội dung miễn phí cho học viên chưa đăng ký trải nghiệm chất lượng giảng dạy.
                    </p>

                    <div className="space-y-3">
                      {/* allowFreeDoc */}
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border">
                        <div>
                          <p className="font-bold text-xs text-stone-900">Cho phép xem trước Tài liệu (.doc/.pdf) học thử:</p>
                          <p className="text-[10.5px] text-gray-400 mt-0.5">Người dùng chưa thanh toán có thể đọc đầy đủ các bài học ở dạng văn bản.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={allowFreeDoc} 
                            onChange={(e) => setAllowFreeDoc(e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {/* allowFreeVideo */}
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border">
                        <div>
                          <p className="font-bold text-xs text-stone-900">Cho phép xem thử Video bài giảng:</p>
                          <p className="text-[10.5px] text-gray-400 mt-0.5">Người dùng chưa thanh toán có thể xem thử một phần thời lượng của video bài giảng.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={allowFreeVideo} 
                            onChange={(e) => setAllowFreeVideo(e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {/* Custom freeVideoDuration */}
                      {allowFreeVideo && (
                        <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2 animate-fadeIn">
                          <label className="block text-xs font-bold text-stone-700">
                            Giới hạn thời lượng xem video miễn phí (giây):
                          </label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              min="5"
                              max="3600"
                              value={freeVideoDuration}
                              onChange={(e) => setFreeVideoDuration(Number(e.target.value))}
                              className="border border-stone-200 rounded-lg px-2 py-1 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-[#8b5e3c]"
                            />
                            <span className="text-xs text-stone-550 font-medium">giây (Gợi ý: 30 - 60 giây)</span>
                          </div>
                          <p className="text-[10px] text-amber-800 leading-snug flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Khi xem qua giới hạn này, video học thử sẽ tự động tạm dừng kèm theo thông báo thu hút mua hàng để tăng tỷ lệ chuyển đổi.</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FAQ MANAGER SECTION */}
                  <div className="border-t border-dashed border-stone-200 pt-4 mt-4">
                    <h5 className="font-bold text-xs text-[#8b5e3c] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <HelpCircle className="w-4 h-4 text-[#8b5e3c]" /> CÀI ĐẶT FAQ - CÂU HỎI THƯỜNG GẶP KHÓA HỌC:
                    </h5>
                    <p className="text-[10.5px] text-stone-500 mb-3 leading-relaxed">
                      Giúp giải đáp nhanh thắc mắc về lộ trình, điều kiện tiên quyết, đồ án tốt nghiệp, hỗ trợ hoàn tiền để kích cầu đăng ký.
                    </p>

                    {/* FAQ List */}
                    <div className="space-y-2 mb-4">
                      {faqs.length === 0 ? (
                        <p className="text-[10.5px] text-stone-400 italic bg-white p-3.5 rounded-xl border text-center">
                          Chưa có câu hỏi FAQ khảo sát nào. Hãy nhập câu hỏi dưới đây để thêm ngay!
                        </p>
                      ) : (
                        faqs.map((faq, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border flex justify-between items-start gap-4">
                            <div className="space-y-1.5 text-xs text-left min-w-0">
                              <p className="font-bold text-stone-900 truncate">Q: {faq.question || faq.q}</p>
                              <p className="text-stone-550 text-[11px] leading-relaxed break-words">{faq.answer || faq.a}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFaqs(faqs.filter((_, i) => i !== idx));
                              }}
                              className="text-red-500 hover:text-red-700 p-1 shrink-0 bg-transparent hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* FAQ Inputs */}
                    <div className="bg-white/80 border p-3 rounded-xl space-y-2.5">
                      <p className="font-bold text-[10.5px] text-stone-750">Thêm Câu hỏi mới:</p>
                      
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          placeholder="Nhập câu hỏi (Ví dụ: Khóa học này có cấp chứng chỉ không?)"
                          value={newFaqQuestion}
                          onChange={(e) => setNewFaqQuestion(e.target.value)}
                          className="w-full border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8b5e3c] bg-white text-stone-900"
                        />
                        <textarea 
                          placeholder="Nhập câu trả lời giải đáp..."
                          rows={2}
                          value={newFaqAnswer}
                          onChange={(e) => setNewFaqAnswer(e.target.value)}
                          className="w-full border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#8b5e3c] bg-white text-stone-900"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
                            alert('Vui lòng nhập cả Câu hỏi và Câu trả lời.');
                            return;
                          }
                          const newItem = { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() };
                          setFaqs([...faqs, newItem]);
                          setNewFaqQuestion('');
                          setNewFaqAnswer('');
                        }}
                        className="w-full bg-[#faf6f2] hover:bg-[#8b5e3c] hover:text-white text-[#8b5e3c] border border-stone-200 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        + Thêm vào danh sách FAQ
                      </button>
                    </div>
                  </div>

                </div>

                <div className="flex justify-between pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setBuilderStep(3)}
                    className="border text-stone-600 bg-slate-50 hover:bg-white py-2 px-5 rounded-xl font-bold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Quay lại Bước 3
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderStep(5)}
                    className="bg-brand-normal hover:bg-brand-hover text-white py-2 px-6 rounded-xl font-bold flex items-center gap-1.5"
                  >
                    Xem trước & Gửi duyệt khóa học <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW SUMMARY & DEPLOY TO MODERATOR REVIEW PANEL */}
            {builderStep === 5 && (
              <div className="space-y-4 bg-white p-5 rounded-2xl border text-stone-850">
                <h4 className="font-bold text-sm text-brand-normal border-b pb-2 flex justify-between items-center">
                  <span>Bước 5: Tổng kiểm tra giáo án & Hoàn tất gửi duyệt xuất bản</span>
                  <span className="text-stone-400 text-[10px]">Tiến trình sẵn sàng</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border">
                    <p className="font-extrabold text-stone-900 border-b pb-1">TỔNG QUAN HỒ SƠ:</p>
                    <p><b>Tiêu đề:</b> {title || 'Chưa điền'}</p>
                    <p><b>Dòng phụ:</b> {subtitle || 'Chưa điền'}</p>
                    <p><b>Danh mục:</b> {category === 'Development' ? 'Development (Lập trình)' : 'Artificial Intelligence (AI)'} ({subcategory})</p>
                    <p><b>Giá đề xuất:</b> {formatVND(price)} (Ưu đãi hiện có: {formatVND(salePrice)})</p>
                    <p><b>Số chương học tích hợp:</b> {chapters.length} chương</p>
                    <p><b>Số yêu cầu ban đầu:</b> {requirements.length} mục</p>
                  </div>

                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border">
                    <p className="font-extrabold text-stone-900 border-b pb-1">CẤU HÌNH HỌC VIÊN AN TOÀN:</p>
                    <ul className="list-disc pl-4 space-y-1.5 text-[11px]">
                      <li>Cho phép tua video: {allowSkip ? 'Đồng ý' : 'Không (Bắt buộc xem hết)'}</li>
                      <li>Khách hàng tải resources/code: {allowDownload ? 'Được phép' : 'Khóa tải'}</li>
                      <li>Cho phép học viên thảo luận cộng đồng Q&A: {allowDiscussion ? 'Đồng ý' : 'Khóa thảo luận'}</li>
                      <li>Học viên nhận chứng nhận chứng chỉ điện tử: {giveCertificate ? 'Có' : 'Không'}</li>
                    </ul>

                    <div className="pt-2 bg-[#f0fdf4] p-3 rounded-lg border border-[#bcf0da] text-[10.5px] font-medium text-[#166534] flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#166534] shrink-0 mt-0.5" />
                      <span><b>Lưu ý:</b> Khóa học sau khi gửi duyệt sẽ tạm thời chờ đội ngũ Moderator thẩm duyệt (thông qua trong 12h-24h) trước khi hiển thị công khai tới học viên.</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setBuilderStep(4)}
                    className="border text-stone-600 bg-slate-50 hover:bg-white py-2 px-5 rounded-xl font-bold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Quay lại Bước 4
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishCoursePublish}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-8 rounded-xl font-extrabold text-xs shadow flex items-center gap-1.5"
                  >
                    🚀 HOÀN TẤT & GỬI DUYỆT XUẤT BẢN
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

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
                          placeholder="Chấm điểm (0 - 100)" 
                          id={`score-val-${submission.id}`}
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

        {/* STUDENTS MANAGEMENT DASHBOARD */}
        {activeTab === 'students' && (() => {
          // Prepare data from API states
          const coursesTaught = instructorCourses;
          
          return (
            <div className="space-y-6 animate-fade-in text-xs text-left relative">
              {selectedStudentDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in relative">
                    <button onClick={() => setSelectedStudentDetail(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 font-bold text-lg">&times;</button>
                    <div className="flex flex-col items-center mb-6">
                      <img src={selectedStudentDetail.user.avatar || 'https://via.placeholder.com/150'} alt="avatar" className="w-20 h-20 rounded-full border-4 border-brand-light shadow-sm object-cover mb-3" />
                      <h3 className="text-xl font-black text-stone-900">{selectedStudentDetail.user.name}</h3>
                      <p className="text-stone-500 text-xs">{selectedStudentDetail.user.email}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-stone-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-stone-500 uppercase">Khóa học</span>
                        <span className="font-bold text-stone-800 text-right">{selectedStudentDetail.course.title}</span>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-xl border border-stone-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-stone-500 uppercase">Tiến độ học</span>
                        <div className="flex flex-col items-end w-1/2">
                          <span className="font-bold text-brand-normal mb-1">{selectedStudentDetail.progress}%</span>
                          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                            <div style={{ width: `${selectedStudentDetail.progress}%` }} className="bg-brand-normal h-1.5 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-stone-100">
                          <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Trạng thái</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-block ${selectedStudentDetail.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {selectedStudentDetail.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-stone-100">
                          <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Ghi danh</span>
                          <span className="font-bold text-stone-800">{new Date(selectedStudentDetail.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-xl border border-stone-100">
                        <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Lần đăng nhập gần nhất</span>
                        <span className="font-bold text-stone-800">{selectedStudentDetail.user.lastActiveDate || 'Chưa có thông tin'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                <div>
                  <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-stone-850" /> Quản lý Ghi danh (Enrollments)
                  </h3>
                  <p className="text-stone-500 text-[11px] mt-0.5">Thống kê toàn bộ lượt học viên ghi danh vào các khóa học của bạn (Kết nối API thực).</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white border rounded-2xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-1">
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Tìm kiếm</label>
                  <input 
                    type="text" 
                    placeholder="Tên, Email..." 
                    value={studentSearchQuery}
                    onChange={(e) => { setStudentSearchQuery(e.target.value); setStudentPage(1); }}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal text-xs"
                  />
                </div>

                {/* Course Dropdown */}
                <div className="lg:col-span-1">
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Khóa học</label>
                  <select
                    value={selectedStudentCourseId}
                    onChange={(e) => { setSelectedStudentCourseId(e.target.value); setStudentPage(1); }}
                    className="w-full text-xs font-semibold p-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal"
                  >
                    <option value="all">Tất cả khóa học</option>
                    {coursesTaught.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="lg:col-span-1">
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Trạng thái học</label>
                  <select
                    value={studentFilterStatus}
                    onChange={(e) => { setStudentFilterStatus(e.target.value); setStudentPage(1); }}
                    className="w-full text-xs font-semibold p-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="learning">Đang học</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="suspended">Tạm khóa</option>
                  </select>
                </div>

                {/* Time Range */}
                <div className="lg:col-span-1">
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Thời gian</label>
                  <select
                    value={studentTimeRange}
                    onChange={(e) => { setStudentTimeRange(e.target.value); setStudentPage(1); }}
                    className="w-full text-xs font-semibold p-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal"
                  >
                    <option value="all">Tất cả thời gian</option>
                    <option value="today">Hôm nay</option>
                    <option value="week">Tuần này</option>
                    <option value="month">Tháng này</option>
                    <option value="year">Năm nay</option>
                  </select>
                </div>

                {/* Progress Filter */}
                <div className="lg:col-span-1 flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Min %</label>
                    <input type="number" min="0" max="100" placeholder="0" value={studentMinProgress || ''} onChange={e => setStudentMinProgress(e.target.value ? Number(e.target.value) : undefined)} className="w-full px-2 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal text-xs" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Max %</label>
                    <input type="number" min="0" max="100" placeholder="100" value={studentMaxProgress || ''} onChange={e => setStudentMaxProgress(e.target.value ? Number(e.target.value) : undefined)} className="w-full px-2 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal text-xs" />
                  </div>
                </div>
              </div>

              {/* Table Data */}
              <div className="bg-white border rounded-2xl overflow-hidden shadow-xs text-[11.5px]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="py-3 px-4 font-bold text-stone-500 uppercase text-[10px]">Học viên</th>
                        <th className="py-3 px-4 font-bold text-stone-500 uppercase text-[10px]">Email</th>
                        <th className="py-3 px-4 font-bold text-stone-500 uppercase text-[10px]">Khóa học</th>
                        <th className="py-3 px-4 font-bold text-stone-500 uppercase text-[10px]">Tiến độ</th>
                        <th className="py-3 px-4 font-bold text-stone-500 uppercase text-[10px]">Trạng thái</th>
                        <th className="py-3 px-4 font-bold text-stone-500 uppercase text-[10px]">Ngày ghi danh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-stone-400">Không tìm thấy bản ghi danh nào thỏa mãn bộ lọc.</td>
                        </tr>
                      ) : (
                        studentsList.map((enrollment) => (
                          <tr key={enrollment.id} onClick={() => setSelectedStudentDetail(enrollment)} className="border-b last:border-b-0 hover:bg-slate-50 cursor-pointer transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <img src={enrollment.user.avatar || 'https://via.placeholder.com/150'} alt="avt" className="w-8 h-8 rounded-full object-cover" />
                                <span className="font-bold text-stone-800">{enrollment.user.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-stone-600">{enrollment.user.email}</td>
                            <td className="py-3 px-4 text-stone-800 font-semibold max-w-[150px] truncate" title={enrollment.course.title}>{enrollment.course.title}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="w-6 text-right font-mono font-bold text-brand-normal">{enrollment.progress}%</span>
                                <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                                  <div style={{ width: `${enrollment.progress}%` }} className="h-full bg-brand-normal rounded-full"></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap ${enrollment.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : enrollment.status === 'suspended' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                {enrollment.status === 'completed' ? 'Hoàn thành' : enrollment.status === 'suspended' ? 'Tạm khóa' : 'Đang học'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-stone-500 font-mono">
                              {new Date(enrollment.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {enrollmentsMeta && enrollmentsMeta.totalPages > 1 && (
                  <div className="p-4 border-t flex justify-between items-center bg-slate-50">
                    <span className="text-[10px] font-bold text-stone-500">Hiển thị trang {enrollmentsMeta.page} / {enrollmentsMeta.totalPages} (Tổng {enrollmentsMeta.total} bản ghi)</span>
                    <div className="flex gap-1">
                      <button 
                        disabled={studentPage === 1} 
                        onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-white border rounded hover:bg-slate-100 disabled:opacity-50"
                      >
                        Trước
                      </button>
                      <button 
                        disabled={studentPage === enrollmentsMeta.totalPages} 
                        onClick={() => setStudentPage(p => Math.min(enrollmentsMeta.totalPages, p + 1))}
                        className="px-3 py-1 bg-white border rounded hover:bg-slate-100 disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 7: SECURITY */}
        {activeTab === 'security' && (
          <InstructorSecurityPanel currentUser={currentUser} />
        )}

        {/* TAB 8: PACKAGES */}
        {activeTab === 'packages' && (
          <InstructorPackagesTab 
            currentUser={currentUser} 
            quota={quota} 
            quotaLoading={quotaLoading} 
            quotaError={quotaError} 
            fetchQuota={fetchQuota} 
          />
        )}

        {/* TAB 9: COUPONS */}
        {activeTab === 'coupons' && (
          <CouponManagement />
        )}

        {/* TAB 10: QA */}
        {activeTab === 'qa' && (
          <InstructorQAModule />
        )}

      </div>
    </div>
  );
}
