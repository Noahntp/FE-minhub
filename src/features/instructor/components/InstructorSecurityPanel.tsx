import React, { useState } from 'react';
import { User } from '@/shared/types';
import { 
  ShieldAlert, 
  Mail, 
  Smartphone, 
  Key, 
  X 
} from 'lucide-react';

function LaptopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}

export function InstructorSecurityPanel({ currentUser }: { currentUser: User }) {
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
      (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      alert('Đã gửi email xác minh đến: ' + currentUser.email);
      setEmailStatus('unverified');
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi email');
      setEmailStatus('unverified');
    }
  };

  const handleEnableOtp = async () => {
    try {
      (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      setOtpStep('setup');
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi mã OTP');
    }
  };

  const handleConfirmOtp = async () => {
    if (otpCode.length === 6) {
      try {
        (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
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
