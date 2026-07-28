import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Smartphone, Laptop, Loader2, X, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { ApiService } from '../../services/api';

interface SecurityTabProps {
  currentUser: any;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  currentUser,
  showToast
}) => {
  // Password form states & toggles
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // OTP Modal states
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Sessions state
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'public',
    show_email: false,
    show_phone: false,
    show_social_links: true
  });

  // OTP Timer countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Load active sessions & privacy options
  useEffect(() => {
    const loadSessions = async () => {
      setLoadingSessions(true);
      try {
        const res = await ApiService.getInstructorSessions();
        const data = res?.data || res;
        if (Array.isArray(data)) {
          setSessionsList(data);
        }
      } catch (err) {
        console.warn('Failed to fetch active sessions:', err);
      } finally {
        setLoadingSessions(false);
      }
    };

    const loadPrivacy = async () => {
      try {
        const res = await ApiService.getInstructorPrivacySettings();
        const data = res?.data || res;
        if (data) {
          setPrivacySettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Failed to fetch privacy settings:', err);
      }
    };

    loadSessions();
    loadPrivacy();
  }, []);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-red-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
    return { score: 3, label: 'Mạnh', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Vui lòng điền đầy đủ thông tin mật khẩu.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu mới và xác nhận mật khẩu không khớp.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Mật khẩu mới phải có từ 8 ký tự trở lên.', 'error');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await ApiService.sendChangePasswordOtp({
        currentPassword,
        password: newPassword,
        passwordConfirmation: confirmPassword
      });

      const masked = res?.data?.masked_email || 'us****@mindhub.test';
      const countdown = res?.data?.resend_after || 60;

      setMaskedEmail(masked);
      setResendCountdown(countdown);
      setOtpCode('');
      setShowOtpModal(true);
      showToast(res.message || 'Mã OTP đã được gửi đến email của bạn.');
    } catch (err: any) {
      showToast(err.message || 'Lỗi gửi mã OTP xác minh.', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      setOtpError('Vui lòng nhập đúng 6 chữ số OTP.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await ApiService.changeInstructorPassword({
        currentPassword,
        password: newPassword,
        passwordConfirmation: confirmPassword,
        otp: cleanOtp
      });

      showToast('Đổi mật khẩu thành công!');
      setShowOtpModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpCode('');
    } catch (err: any) {
      setOtpError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleRevokeOtherSessions = async () => {
    setRevokingSessions(true);
    try {
      await ApiService.revokeOtherInstructorSessions();
      showToast('Đã đăng xuất khỏi tất cả thiết bị khác.');
      const res = await ApiService.getInstructorSessions();
      if (res?.data) setSessionsList(res.data);
    } catch (err: any) {
      showToast(err.message || 'Lỗi đăng xuất thiết bị khác.', 'error');
    } finally {
      setRevokingSessions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-left relative">
            <button
              type="button"
              onClick={() => setShowOtpModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 text-[#007A64] rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#06091a]">Xác minh OTP Email</h3>
                <p className="text-[11px] text-[#737373] font-medium">Bảo mật 2 lớp cho đổi mật khẩu</p>
              </div>
            </div>

            <p className="text-xs text-[#595959] leading-relaxed mb-4">
              Mã OTP 6 chữ số đã được gửi tới địa chỉ email: <strong className="text-[#06091a] font-bold">{maskedEmail}</strong>.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Mã OTP (6 chữ số) *</label>
                <input
                  autoFocus
                  required
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007A64] bg-white font-mono font-black text-center text-xl tracking-[8px] text-[#06091a]"
                />
                {otpError && (
                  <p className="text-[11px] text-red-600 font-bold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {otpError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#737373] font-medium">Chưa nhận được mã?</span>
                <button
                  type="button"
                  disabled={resendCountdown > 0 || isSendingOtp}
                  onClick={handleRequestOtp}
                  className="text-[#007A64] font-bold hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {resendCountdown > 0 ? `Gửi lại sau ${resendCountdown}s` : 'Gửi lại mã OTP'}
                </button>
              </div>

              <div className="pt-4 border-t border-[#e7e8ed] flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="px-4 py-2 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpCode.length !== 6}
                  className="px-5 py-2 bg-[#007A64] hover:bg-[#006653] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Xác nhận đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section 1: Form Đổi mật khẩu */}
      <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a] mb-4 pb-2 border-b border-[#e7e8ed]">
          Đổi mật khẩu bảo mật
        </h2>

        <form onSubmit={handleRequestOtp} className="space-y-4 text-xs font-semibold max-w-md text-[#121b4b]">
          {/* Current Password */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#595959]">Mật khẩu hiện tại *</label>
            <div className="relative">
              <input
                required
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-3 text-[#737373] hover:text-[#06091a] cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#595959]">Mật khẩu mới *</label>
            <div className="relative">
              <input
                required
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-3 text-[#737373] hover:text-[#06091a] cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength meter */}
            {newPassword && (
              <div className="pt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 transition-all ${strength.score >= 1 ? strength.color : 'bg-transparent'}`}></div>
                  <div className={`h-full flex-1 transition-all ${strength.score >= 2 ? strength.color : 'bg-transparent'}`}></div>
                  <div className={`h-full flex-1 transition-all ${strength.score >= 3 ? strength.color : 'bg-transparent'}`}></div>
                </div>
                <span className="text-[10px] font-bold text-[#737373]">{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#595959]">Xác nhận mật khẩu mới *</label>
            <div className="relative">
              <input
                required
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-3 text-[#737373] hover:text-[#06091a] cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSendingOtp || !currentPassword || !newPassword || !confirmPassword}
              className="px-5 py-2.5 bg-[#007A64] hover:bg-[#006653] text-white rounded-xl transition-all shadow-2xs font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5 text-xs"
            >
              {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Gửi mã OTP qua Email
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Phiên đăng nhập hiện tại */}
      <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#e7e8ed]">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a]">
              Phiên đăng nhập thiết bị
            </h2>
            <p className="text-[11px] text-[#737373] font-medium mt-0.5">
              Danh sách thiết bị đang có quyền truy cập vào tài khoản của bạn
            </p>
          </div>
          {sessionsList.length > 1 && (
            <button
              type="button"
              disabled={revokingSessions}
              onClick={handleRevokeOtherSessions}
              className="text-[11px] font-bold text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              {revokingSessions ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
              Đăng xuất thiết bị khác
            </button>
          )}
        </div>

        {loadingSessions ? (
          <div className="p-6 text-center text-[#737373] text-xs font-medium bg-slate-50 rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#007A64] mb-2" />
            Đang tải danh sách thiết bị...
          </div>
        ) : (
          <div className="space-y-2.5">
            {(sessionsList.length > 0 ? sessionsList : [
              {
                id: 'current',
                device: 'Chrome Browser',
                platform: 'Windows 11',
                ip_address: '127.0.0.1',
                last_activity_at: 'Vừa hoạt động xong',
                is_current: true
              }
            ]).map((session) => (
              <div key={session.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-[#dbdde4] flex justify-between items-center text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg border border-[#e7e8ed] text-[#007A64] shrink-0 mt-0.5">
                    {session.platform?.toLowerCase().includes('android') || session.platform?.toLowerCase().includes('ios') ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Laptop className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[#06091a]">{session.device} ({session.platform})</p>
                    <p className="text-[10px] text-[#737373] mt-0.5 font-medium">
                      IP: {session.ip_address || '127.0.0.1'} • {session.is_current ? 'Vừa hoạt động' : session.last_activity_at}
                    </p>
                  </div>
                </div>
                {session.is_current ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-250 px-2.5 py-0.5 rounded-lg shrink-0">
                    Thiết bị này
                  </span>
                ) : (
                  <span className="text-[10px] text-[#737373] font-medium shrink-0">
                    Đã đăng nhập
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
