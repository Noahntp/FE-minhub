import React, { useState, useEffect } from 'react';
import { User, Lock, Settings, FileText, Check, Flame, AlertCircle, ShieldAlert, BadgeCheck, Camera, CreditCard, Mail, Smartphone, KeyRound, Loader2, ChevronRight, CheckCircle2, Clock, PlayCircle, Award } from 'lucide-react';
import { User as UserType } from '../types';
import { OTPModal } from './OTPModal';
import { ApiService } from '../services/api';
import { AppRoutes, RoleLabels } from '../utils/routes';
import { InstructorProfile } from './InstructorProfile';

const AVAILABLE_AVATARS = [
  "https://i.pravatar.cc/150?img=11",
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=33",
  "https://i.pravatar.cc/150?img=44",
  "https://i.pravatar.cc/150?img=55",
  "https://i.pravatar.cc/150?img=60",
  "https://ui-avatars.com/api/?name=User&background=random"
];

interface ProfilePageProps {
  currentUser: UserType;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserType>>;
  navigateTo: (route: string) => void;
}

export function ProfilePage({ currentUser, setCurrentUser, navigateTo }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'roles' | 'history'>('personal');
  
  // Forms state
  const [editUser, setEditUser] = useState<UserType>({ ...currentUser });
  const [saving, setSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [instructorBio, setInstructorBio] = useState(currentUser.bio || '');
  const [instructorExpertise, setInstructorExpertise] = useState(currentUser.expertise || '');
  const [instructorExperience, setInstructorExperience] = useState(currentUser.experienceYears || '');
  const [instructorPortfolio, setInstructorPortfolio] = useState(currentUser.portfolioUrl || '');
  const [leaveReason, setLeaveReason] = useState('');
  const [roleRequesting, setRoleRequesting] = useState(false);
  
  const [learningHistory, setLearningHistory] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'history') {
      ApiService.getUserActivities(currentUser.id).then(res => setLearningHistory(res));
    }
  }, [activeTab, currentUser.id]);

  // Notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // OTP Modal State
  const [showOtp, setShowOtp] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'phone'>('email');
  const [otpAction, setOtpAction] = useState<'verify_email' | 'verify_phone' | 'request_instructor' | 'request_admin' | 'change_password' | 'request_leave_instructor' | null>(null);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg('');
    } else {
      setSuccessMsg(msg);
      setErrorMsg('');
    }
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 5000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await ApiService.updateMyProfile(editUser);
      setCurrentUser(updatedUser);
      showNotification('Lưu thông tin thành công!');
    } catch (err: any) {
      showNotification('Lỗi khi lưu thông tin.', true);
    } finally {
      setSaving(false);
    }
  };

  // Start OTP Flow
  const handleOpenOtp = async (type: 'email' | 'phone', action: typeof otpAction) => {
    if (!action) return;
    setOtpType(type);
    setOtpAction(action);
    
    try {
      if (type === 'phone') {
        await ApiService.sendPhoneOtp(currentUser.phone || '', action);
      } else {
        await ApiService.resendVerificationEmail(currentUser.email, action);
      }
      setShowOtp(true);
    } catch (err: any) {
      showNotification(err.message || `Lỗi khi gửi mã ${type}.`, true);
    }
  };

  const handleVerifyOtp = async (otpCode: string): Promise<boolean> => {
    if (!otpAction) return false;
    try {
      if (otpType === 'phone') {
        const res = await ApiService.verifyPhoneOtp(currentUser.phone || '', otpCode, otpAction);
        return res.success;
      } else {
        const res = await ApiService.verifyEmailOtp(currentUser.email, otpAction, otpCode);
        return res.success;
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleResendOtp = async () => {
    if (!otpAction) return;
    if (otpType === 'phone') {
      await ApiService.sendPhoneOtp(currentUser.phone || '', otpAction);
    } else {
      await ApiService.resendVerificationEmail(currentUser.email, otpAction);
    }
  };

  const handleOtpSuccess = async () => {
    setShowOtp(false);
    
    let updatedUser = { ...currentUser };
    
    if (otpAction === 'verify_email') {
      updatedUser.isEmailVerified = true;
      showNotification('Xác minh Email thành công!');
    } else if (otpAction === 'verify_phone') {
      updatedUser.isPhoneVerified = true;
      showNotification('Xác minh Số điện thoại thành công!');
    } else if (otpAction === 'request_instructor') {
      try {
        setRoleRequesting(true);
        await ApiService.requestInstructorRole({ 
          userId: currentUser.id, 
          fullName: currentUser.name, 
          email: currentUser.email, 
          phone: currentUser.phone || editUser.phone || '', 
          bio: instructorBio,
          expertise: instructorExpertise,
          experienceYears: instructorExperience,
          portfolioUrl: instructorPortfolio
        });
        updatedUser.roleRequestStatus = 'pending_instructor';
        showNotification('Đã gửi yêu cầu đăng ký Giảng viên thành công! Vui lòng chờ phê duyệt.');
      } catch (err) {
        showNotification('Lỗi khi gửi yêu cầu.', true);
      } finally {
        setRoleRequesting(false);
      }
    } else if (otpAction === 'request_admin') {
      try {
        setRoleRequesting(true);
        await ApiService.requestAdminRole({ userId: currentUser.id });
        updatedUser.roleRequestStatus = 'pending_admin';
        showNotification('Đã gửi yêu cầu quyền Admin!');
      } catch (err) {
        showNotification('Lỗi khi gửi yêu cầu.', true);
      } finally {
        setRoleRequesting(false);
      }
    } else if (otpAction === 'request_leave_instructor') {
      try {
        setRoleRequesting(true);
        await ApiService.requestLeaveInstructorRole({
          userId: currentUser.id,
          fullName: currentUser.name,
          email: currentUser.email,
          reason: leaveReason
        });
        updatedUser.roleRequestStatus = 'pending_leave_instructor';
        showNotification('Đã gửi yêu cầu rời vai trò Giảng viên thành công! Vui lòng chờ phê duyệt.');
      } catch (err) {
        showNotification('Lỗi khi gửi yêu cầu.', true);
      } finally {
        setRoleRequesting(false);
      }
    } else if (otpAction === 'change_password') {
      try {
        setSaving(true);
        await ApiService.changeMyPassword({ oldPassword, newPassword });
        showNotification('Cập nhật mật khẩu mới thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (err: any) {
        showNotification(err.message || 'Lỗi đổi mật khẩu', true);
      } finally {
        setSaving(false);
      }
    }
    
    setCurrentUser(updatedUser);
  };

  const handleChangePasswordClick = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showNotification('Vui lòng điền đầy đủ thông tin mật khẩu!', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('Mật khẩu mới và Nhập lại mật khẩu không trùng khớp!', true);
      return;
    }
    if (currentUser.isPhoneVerified && currentUser.phone) {
      handleOpenOtp('phone', 'change_password');
    } else if (currentUser.isEmailVerified) {
      handleOpenOtp('email', 'change_password');
    } else {
      showNotification('Bạn cần xác minh Email hoặc Số điện thoại trước khi đổi mật khẩu.', true);
    }
  };

  const handleRequestRole = (roleType: 'instructor' | 'admin' | 'leave_instructor') => {
    if (!currentUser.isEmailVerified) {
      showNotification('Vui lòng xác minh Email trước khi yêu cầu cấp quyền!', true);
      setActiveTab('security');
      return;
    }
    if (!currentUser.isPhoneVerified) {
      showNotification('Vui lòng xác minh Số điện thoại trước khi yêu cầu cấp quyền!', true);
      setActiveTab('security');
      return;
    }
    // All verified, request OTP to confirm role change request
    handleOpenOtp('phone', roleType === 'instructor' ? 'request_instructor' : roleType === 'admin' ? 'request_admin' : 'request_leave_instructor');
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8 mt-16 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header / Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-black text-stone-900 tracking-tight">Cài đặt tài khoản</h1>
            <p className="text-stone-500 mt-1">Quản lý hồ sơ, bảo mật và các tùy chọn cá nhân của bạn.</p>
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="font-medium text-sm">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="font-medium text-sm">{errorMsg}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Menu */}
          <div className="lg:w-1/4 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden sticky top-24">
              
              {/* Mini Profile Card */}
              <div className="p-6 border-b border-stone-100 flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-stone-50 shadow-md"
                  />
                  {currentUser.role === 'admin' && (
                    <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white p-1 rounded-full border-2 border-white" title="Admin">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {currentUser.role === 'instructor' && (
                    <div className="absolute -bottom-1 -right-1 bg-brand-normal text-white p-1 rounded-full border-2 border-white" title="Giảng viên">
                      <BadgeCheck className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <h2 className="font-bold text-stone-900 text-lg truncate w-full">{currentUser.name}</h2>
                <p className="text-stone-500 text-sm truncate w-full">{currentUser.email}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-semibold text-stone-600">
                  {currentUser.role === 'admin' ? 'Super Admin' : currentUser.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="p-2 space-y-1">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'personal' ? 'bg-brand-light text-[#432c28]' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <User className="w-5 h-5" /> Hồ sơ cá nhân
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'security' ? 'bg-brand-light text-[#432c28]' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <div className="flex items-center gap-3"><Lock className="w-5 h-5" /> Bảo mật</div>
                  {(!currentUser.isEmailVerified || !currentUser.isPhoneVerified) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'roles' ? 'bg-brand-light text-[#432c28]' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <ShieldAlert className="w-5 h-5" /> Vai trò & Quyền
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'history' ? 'bg-brand-light text-[#432c28]' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <Clock className="w-5 h-5" /> Lịch sử học tập
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:w-3/4">
            
            {/* PERSONAL TAB */}
            {activeTab === 'personal' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* WORKSPACE NAVIGATION (Role Switcher) */}
                {(currentUser.role === 'instructor' || currentUser.role === 'admin') && (
                  <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white mb-6">
                    <div className="bg-stone-50 p-4 border-b border-stone-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#8b5e3c]" />
                        <h4 className="font-bold text-stone-900">Không gian làm việc</h4>
                      </div>
                      <div className="flex gap-1.5 text-xs font-semibold">
                        <span className="px-2.5 py-1 bg-stone-200 text-stone-700 rounded-lg">Học viên</span>
                        {currentUser.role === 'instructor' && (
                          <span className="px-2.5 py-1 bg-brand-light text-brand-normal border border-brand-light-active rounded-lg">Giảng viên</span>
                        )}
                        {currentUser.role === 'admin' && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 border border-red-200 rounded-lg">Quản trị viên</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col sm:flex-row gap-3">
                      {currentUser.role === 'instructor' && (
                        <button 
                          onClick={() => navigateTo(AppRoutes.instructorDashboard(currentUser.id))}
                          className="flex-1 flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-brand-normal hover:bg-brand-light transition-all text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-light text-[#8b5e3c] flex items-center justify-center shrink-0 border border-[#e8ded3]">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-stone-900 text-sm">Đi đến trang Giảng viên</h5>
                              <p className="text-[11px] text-stone-500">Quản lý khóa học, doanh thu</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
                        </button>
                      )}
                      {currentUser.role === 'admin' && (
                        <button 
                          onClick={() => navigateTo(AppRoutes.adminDashboard(currentUser.id))}
                          className="flex-1 flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-red-200 hover:bg-red-50 transition-all text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-stone-900 text-sm">Đi đến trang Quản trị</h5>
                              <p className="text-[11px] text-stone-500">Quản lý hệ thống, kiểm duyệt</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {currentUser.role === 'instructor' ? (
                  <>
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8 mb-6">
                      <h3 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-4 mb-6">Ảnh đại diện</h3>
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="relative">
                          <img src={editUser.avatar} alt="Current" className="w-16 h-16 rounded-full object-cover border-2 border-brand-normal" />
                          <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {AVAILABLE_AVATARS.map((av, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setEditUser({ ...editUser, avatar: av })}
                              className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${editUser.avatar === av ? 'border-brand-normal ring-2 ring-brand-light' : 'border-transparent'}`}
                            >
                              <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <InstructorProfile 
                      initialData={{
                        full_name: currentUser.name || "",
                        email: currentUser.email || "",
                        phone: currentUser.phone || "",
                        role: currentUser.role,
                        status: currentUser.status || "active",
                        email_verified_at: currentUser.isEmailVerified ? (currentUser.createdAt || new Date().toISOString()) : null,
                        last_login_at: new Date().toISOString()
                      }}
                      onSubmit={async (data) => {
                        setSaving(true);
                        try {
                          const updatedUser = {
                            ...editUser,
                            name: data.full_name,
                            phone: data.phone,
                            email: data.email
                          };
                          const res = await ApiService.updateMyProfile(updatedUser);
                          setCurrentUser(res);
                          setEditUser(res);
                          showNotification('Cập nhật hồ sơ giảng viên thành công!');
                        } catch (err: any) {
                          showNotification('Lỗi khi lưu thông tin.', true);
                        } finally {
                          setSaving(false);
                        }
                      }}
                    />
                  </>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                    <h3 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-4 mb-6">Thông tin cơ bản</h3>
                    
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      {/* Avatar selection */}
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-3">Ảnh đại diện</label>
                        <div className="flex flex-wrap gap-4 items-center">
                          <div className="relative">
                            <img src={editUser.avatar} alt="Current" className="w-16 h-16 rounded-full object-cover border-2 border-brand-normal" />
                            <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                              <Camera className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {AVAILABLE_AVATARS.map((av, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setEditUser({ ...editUser, avatar: av })}
                                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${editUser.avatar === av ? 'border-brand-normal ring-2 ring-brand-light' : 'border-transparent'}`}
                              >
                                <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-stone-700 mb-1.5">Họ và tên</label>
                          <input
                            type="text"
                            value={editUser.name}
                            onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-brand-normal focus:ring-1 focus:ring-brand-normal focus:outline-none transition-colors"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                            Email <span className="text-xs font-normal text-stone-500">(Không thể tự đổi)</span>
                          </label>
                          <input
                            type="email"
                            value={editUser.email}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Giới thiệu ngắn (Bio)</label>
                        <textarea
                          value={editUser.bio || ''}
                          onChange={(e) => setEditUser({...editUser, bio: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-normal focus:ring-1 focus:ring-brand-normal focus:outline-none transition-colors resize-none"
                          placeholder="Một vài điều về bản thân bạn..."
                        ></textarea>
                      </div>

                      <div className="pt-4 border-t border-stone-100 flex justify-end">
                        <button 
                          type="submit" 
                          disabled={saving}
                          className="bg-brand-normal hover:bg-brand-hover text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}


            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Verification Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                  <h3 className="text-xl font-bold text-stone-900 mb-2">Trạng thái xác thực</h3>
                  <p className="text-sm text-stone-500 mb-6">Xác minh tài khoản của bạn để mở khóa các tính năng như đăng ký Giảng viên.</p>

                  <div className="space-y-4">
                    {/* Email Verification */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-stone-100 bg-stone-50 gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${currentUser.isEmailVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-200 text-stone-400'}`}>
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">Địa chỉ Email</p>
                          <p className="text-sm text-stone-500 mt-0.5">{currentUser.email}</p>
                          {currentUser.isEmailVerified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác minh
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 mt-1.5">
                              <AlertCircle className="w-3.5 h-3.5" /> Chưa xác minh
                            </span>
                          )}
                        </div>
                      </div>
                      {!currentUser.isEmailVerified && (
                        <button 
                          onClick={() => handleOpenOtp('email', 'verify_email')}
                          className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap self-start sm:self-center"
                        >
                          Xác minh ngay
                        </button>
                      )}
                    </div>

                    {/* Phone Verification */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-stone-100 bg-stone-50 gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${currentUser.isPhoneVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-200 text-stone-400'}`}>
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">Số điện thoại</p>
                          <p className="text-sm text-stone-500 mt-0.5">{currentUser.phone || 'Chưa cung cấp'}</p>
                          {currentUser.isPhoneVerified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác minh
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 mt-1.5">
                              <AlertCircle className="w-3.5 h-3.5" /> Yêu cầu xác minh bằng OTP
                            </span>
                          )}
                        </div>
                      </div>
                      {!currentUser.isPhoneVerified && (
                        <div className="flex items-center gap-2 self-start sm:self-center w-full sm:w-auto">
                          {!currentUser.phone ? (
                            <input
                              type="text"
                              placeholder="Nhập SĐT..."
                              value={editUser.phone || ''}
                              onChange={e => setEditUser({...editUser, phone: e.target.value})}
                              className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:border-brand-normal focus:outline-none w-full sm:w-32"
                            />
                          ) : null}
                          <button 
                            onClick={async () => {
                              if (!currentUser.phone && !editUser.phone) {
                                showNotification('Vui lòng nhập số điện thoại trước!', true);
                                return;
                              }
                              if (!currentUser.phone && editUser.phone) {
                                // Save phone temporarily to current user state before OTP
                                setCurrentUser({...currentUser, phone: editUser.phone});
                              }
                              // Wait a tick for state update if we just set it
                              setTimeout(() => handleOpenOtp('phone', 'verify_phone'), 0);
                            }}
                            className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap"
                          >
                            Gửi mã OTP
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900">Đổi mật khẩu</h3>
                      <p className="text-sm text-stone-500">Cập nhật mật khẩu để bảo vệ tài khoản.</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1.5">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-brand-normal focus:outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1.5">Mật khẩu mới</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-brand-normal focus:outline-none"
                        placeholder="Tối thiểu 8 ký tự"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nhập lại mật khẩu mới</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-brand-normal focus:outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="pt-2">
                      <button 
                        onClick={handleChangePasswordClick}
                        className="bg-stone-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm"
                      >
                        Cập nhật mật khẩu
                      </button>
                      <p className="text-xs text-stone-400 mt-3 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Yêu cầu xác thực OTP trước khi đổi.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}


            {/* ROLES TAB */}
            {activeTab === 'roles' && (
              <div className="space-y-6 animate-fade-in">
                
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                  <h3 className="text-xl font-bold text-stone-900 mb-2">Vai trò hệ thống</h3>
                  <p className="text-sm text-stone-500 mb-6">Trạng thái quyền hạn và các yêu cầu nâng cấp tài khoản của bạn.</p>

                  <div className="p-4 rounded-xl border border-brand-light bg-[#fffbf5] flex items-start gap-4 mb-8">
                    <BadgeCheck className="w-6 h-6 text-brand-normal flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-stone-900">Quyền hiện tại: <span className="text-brand-normal">{currentUser.role === 'admin' ? 'Super Admin' : currentUser.role === 'instructor' ? 'Giảng viên' : 'Học viên'}</span></h4>
                      <p className="text-sm text-stone-600 mt-1">
                        {currentUser.role === 'student' && 'Bạn có thể tham gia các khóa học, thảo luận và mua sắm trên MindHub.'}
                        {currentUser.role === 'instructor' && 'Bạn có toàn quyền đăng tải khóa học, quản lý doanh thu và tương tác với học viên.'}
                        {currentUser.role === 'admin' && 'Bạn có quyền quản trị tối cao đối với toàn bộ hệ thống MindHub.'}
                      </p>
                    </div>
                  </div>

                  {/* Request Instructor Block */}
                  {currentUser.role === 'student' && (
                    <div className="border border-stone-200 rounded-2xl overflow-hidden mt-6">
                      <div className="bg-stone-50 p-4 border-b border-stone-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-[#8b5e3c]" />
                          <h4 className="font-bold text-stone-900">Trở thành Giảng viên MindHub</h4>
                        </div>
                        {currentUser.roleRequestStatus === 'pending_instructor' && (
                          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Đang chờ duyệt</span>
                        )}
                      </div>
                      
                      <div className="p-6">
                        {currentUser.roleRequestStatus === 'pending_instructor' ? (
                          <div className="text-center py-6">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                            </div>
                            <h5 className="font-bold text-stone-900 mb-2">Yêu cầu của bạn đang được xét duyệt</h5>
                            <p className="text-sm text-stone-500 max-w-sm mx-auto">Đội ngũ Admin sẽ kiểm tra thông tin và phản hồi lại cho bạn trong vòng 1-3 ngày làm việc.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm text-stone-600">Chia sẻ kiến thức của bạn với hàng ngàn học viên và tạo ra nguồn thu nhập thụ động.</p>
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Giới thiệu chuyên môn của bạn</label>
                              <textarea
                                rows={3}
                                value={instructorBio}
                                onChange={e => setInstructorBio(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-normal focus:ring-1 focus:outline-none"
                                placeholder="Hãy cho chúng tôi biết về kinh nghiệm và chuyên môn giảng dạy của bạn..."
                              ></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Lĩnh vực chuyên môn</label>
                                <input
                                  type="text"
                                  value={instructorExpertise}
                                  onChange={e => setInstructorExpertise(e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-brand-normal focus:ring-1 focus:outline-none"
                                  placeholder="VD: Lập trình, Thiết kế..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Năm kinh nghiệm</label>
                                <input
                                  type="text"
                                  value={instructorExperience}
                                  onChange={e => setInstructorExperience(e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-brand-normal focus:ring-1 focus:outline-none"
                                  placeholder="VD: 5 năm"
                                />
                              </div>
                            </div>
                            <div className="mt-4">
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Liên kết Portfolio / CV</label>
                              <input
                                type="text"
                                value={instructorPortfolio}
                                onChange={e => setInstructorPortfolio(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-brand-normal focus:ring-1 focus:outline-none"
                                placeholder="https://..."
                              />
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2 p-3 bg-blue-50 rounded-xl text-xs text-blue-800">
                              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                              <span>Yêu cầu xác thực Email và OTP Số điện thoại để hoàn tất.</span>
                            </div>

                            <button 
                              onClick={() => handleRequestRole('instructor')}
                              disabled={roleRequesting}
                              className="mt-4 bg-[#8b5e3c] hover:bg-[#6c482d] text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                            >
                              Gửi yêu cầu kiểm duyệt
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Instructor Profile Block */}
                  {currentUser.role === 'instructor' && (
                    <div className="border border-stone-200 rounded-2xl overflow-hidden mt-6">
                      <div className="bg-stone-50 p-4 border-b border-stone-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-[#8b5e3c]" />
                          <h4 className="font-bold text-stone-900">Thông tin Giảng viên</h4>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-stone-700 mb-1.5">Giới thiệu chuyên môn</label>
                          <textarea
                            rows={3}
                            value={instructorBio}
                            onChange={e => setInstructorBio(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-normal focus:ring-1 focus:outline-none"
                            placeholder="Hãy cho chúng tôi biết về kinh nghiệm và chuyên môn giảng dạy của bạn..."
                          ></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Lĩnh vực chuyên môn</label>
                            <input
                              type="text"
                              value={instructorExpertise}
                              onChange={e => setInstructorExpertise(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-brand-normal focus:ring-1 focus:outline-none"
                              placeholder="VD: Lập trình, Thiết kế..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Năm kinh nghiệm</label>
                            <input
                              type="text"
                              value={instructorExperience}
                              onChange={e => setInstructorExperience(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-brand-normal focus:ring-1 focus:outline-none"
                              placeholder="VD: 5 năm"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-semibold text-stone-700 mb-1.5">Liên kết Portfolio / CV</label>
                          <input
                            type="text"
                            value={instructorPortfolio}
                            onChange={e => setInstructorPortfolio(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-brand-normal focus:ring-1 focus:outline-none"
                            placeholder="https://..."
                          />
                        </div>
                        
                        <button 
                          onClick={() => {
                            alert('Lưu thông tin giảng viên thành công! (Mock)');
                          }}
                          className="mt-4 bg-[#8b5e3c] hover:bg-[#6c482d] text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                        >
                          Cập nhật Hồ sơ
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Leave Instructor Block */}
                  {currentUser.role === 'instructor' && (
                    <div className="border border-rose-200 rounded-2xl overflow-hidden mt-6 bg-rose-50/30">
                      <div className="bg-rose-50 p-4 border-b border-rose-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-rose-600" />
                          <h4 className="font-bold text-rose-900">Yêu cầu ngừng làm Giảng viên</h4>
                        </div>
                        {currentUser.roleRequestStatus === 'pending_leave_instructor' && (
                          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Đang chờ duyệt</span>
                        )}
                      </div>
                      
                      <div className="p-6">
                        {currentUser.roleRequestStatus === 'pending_leave_instructor' ? (
                          <div className="text-center py-6">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-900 mb-2">Đang chờ Admin phê duyệt</h3>
                            <p className="text-stone-500 max-w-md mx-auto">
                              Yêu cầu ngừng làm giảng viên của bạn đã được gửi và đang chờ Admin xử lý. 
                              Chúng tôi sẽ xem xét các khóa học đang hoạt động của bạn trước khi phê duyệt.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm text-stone-600">
                              Nếu bạn không còn muốn tiếp tục giảng dạy trên MindHub, bạn có thể gửi yêu cầu ngừng làm giảng viên. Xin lưu ý: Admin sẽ xem xét và quyết định trạng thái các khóa học hiện tại của bạn.
                            </p>
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Lý do ngừng giảng dạy (Bắt buộc)</label>
                              <textarea
                                rows={3}
                                value={leaveReason}
                                onChange={e => setLeaveReason(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:outline-none"
                                placeholder="Hãy cho chúng tôi biết lý do bạn muốn ngừng..."
                              ></textarea>
                            </div>
                            <button 
                              onClick={() => {
                                if (!leaveReason.trim()) {
                                  showNotification('Vui lòng nhập lý do ngừng giảng dạy', true);
                                  return;
                                }
                                handleRequestRole('leave_instructor');
                              }}
                              disabled={roleRequesting || !leaveReason.trim()}
                              className="mt-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" />
                              Gửi yêu cầu
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Request Admin Block (Demo only for student/instructor) */}
                  {currentUser.role !== 'admin' && (
                    <div className="mt-6 text-center">
                      <button 
                        onClick={() => handleRequestRole('admin')}
                        className="text-xs text-stone-400 hover:text-stone-700 underline font-medium"
                      >
                        Yêu cầu cấp quyền Admin hệ thống (Dành cho nội bộ)
                      </button>
                    </div>
                  )}
                  
                </div>
              </div>
            )}
            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
                  <h3 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-4 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" /> Lịch sử hoạt động
                  </h3>
                  
                  {learningHistory.length === 0 ? (
                    <div className="text-center py-10 bg-stone-50 rounded-xl border border-stone-100">
                      <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                      <p className="text-stone-500 font-medium">Chưa có hoạt động học tập nào được ghi nhận.</p>
                      <button 
                        onClick={() => navigateTo('home')} 
                        className="mt-4 px-6 py-2 bg-[#8b5e3c] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#724a2d] transition-all"
                      >
                        Bắt đầu học ngay
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-stone-100 ml-4 pl-6 space-y-8">
                      {learningHistory.map((activity: any, index: number) => (
                        <div key={activity.id || index} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[35px] top-1 w-8 h-8 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center shadow-sm">
                            {activity.activityType === 'course_completed' ? <Award className="w-4 h-4 text-amber-500" /> : 
                             activity.activityType === 'lesson_completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                             <PlayCircle className="w-4 h-4 text-indigo-500" />}
                          </div>
                          
                          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 hover:border-indigo-100 transition-colors">
                            <p className="text-[15px] text-stone-800">
                              {activity.activityType === 'course_completed' ? 'Hoàn thành toàn bộ khóa học' : 
                               activity.activityType === 'lesson_completed' ? 'Hoàn thành bài học trong' : 'Đã bắt đầu học'} 
                              <span className="font-bold ml-1 text-deep-indigo">
                                {activity.course?.title || activity.courseId}
                              </span>
                            </p>
                            <span className="block mt-1 text-xs text-stone-500 font-medium">
                              {new Date(activity.createdAt).toLocaleString('vi-VN', {
                                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                              })}
                            </span>
                            {activity.metadata && (
                              <div className="mt-2 text-sm text-stone-600 bg-white p-2 rounded border border-stone-100">
                                {activity.metadata}
                              </div>
                            )}
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
      </div>

      {/* Verification OTP Modal */}
      <OTPModal
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        type={otpType}
        contactInfo={otpType === 'phone' ? (currentUser.phone || editUser.phone || '') : currentUser.email}
        onVerify={handleVerifyOtp}
        onVerifySuccess={handleOtpSuccess}
        onResend={handleResendOtp}
      />
    </div>
  );
}
