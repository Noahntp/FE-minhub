import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, ShieldCheck, 
  Activity, Calendar, Clock, Edit2, 
  Save, X, CheckCircle2, Loader2 
} from 'lucide-react';

export interface InstructorData {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'pending' | string;
  email_verified_at: string | null;
  last_login_at: string | null;
}

interface InstructorProfileProps {
  initialData: InstructorData;
  onSubmit: (data: InstructorData) => void;
  [key: string]: any;
}

export const InstructorProfile: React.FC<InstructorProfileProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<InstructorData>(initialData);
  const [isDirty, setIsDirty] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<'email' | 'phone' | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setIsDirty(hasChanged);
  }, [formData, initialData]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, full_name: e.target.value });
  };

  const openEditModal = async (field: 'email' | 'phone') => {
    setEditingField(field);
    setTempValue(formData[field]);
    setOtp(new Array(6).fill(''));
    setIsModalOpen(true);
    // Gọi API gửi OTP thực tế ở đây nếu cần thiết:
    // (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingField(null);
  };

  const handleOtpChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirmModal = async () => {
    if (!editingField || otp.join('').length !== 6) return;
    
    setIsVerifying(true);
    try {
      const otpString = otp.join('');
      // GỌI API THẬT
      (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      
      // Nếu API báo OK, ta update giao diện (lúc này chỉ là update local state, 
      // khi bấm 'Lưu thay đổi' thì mới submit toàn bộ profile)
      setFormData({ ...formData, [editingField]: tempValue });
      alert("Xác thực thành công!");
      closeModal();
    } catch (error: any) {
      alert(error.message || "Mã OTP không chính xác hoặc đã hết hạn!");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = () => {
    if (isDirty) {
      onSubmit(formData);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
      
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Thông tin tài khoản</h2>
          <p className="text-slate-500 mt-1 text-sm">Quản lý và cập nhật thông tin cá nhân của bạn</p>
        </div>
        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold flex items-center gap-2">
          <ShieldCheck size={16} />
          {formData.role === 'instructor' ? 'Giảng viên' : formData.role}
        </span>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User size={18} className="text-slate-400" />
            Họ và tên
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={handleNameChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail size={18} className="text-slate-400" />
              Địa chỉ Email
            </label>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 group">
              <span className="text-slate-700 font-medium">{formData.email}</span>
              <button
                onClick={() => openEditModal('email')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1.5 transition-colors opacity-90 group-hover:opacity-100"
              >
                <Edit2 size={14} />
                Thay đổi
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Phone size={18} className="text-slate-400" />
              Số điện thoại
            </label>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 group">
              <span className="text-slate-700 font-medium">{formData.phone}</span>
              <button
                onClick={() => openEditModal('phone')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1.5 transition-colors opacity-90 group-hover:opacity-100"
              >
                <Edit2 size={14} />
                Thay đổi
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14}/> Trạng thái tài khoản
            </span>
            <div className="flex items-center mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5
                ${formData.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${formData.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                {formData.status === 'active' ? 'Đang hoạt động' : 'Vô hiệu hóa'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14}/> Xác thực Email
            </span>
            <p className="text-sm font-semibold text-slate-700">{formatDate(formData.email_verified_at)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5 sm:col-span-2 lg:col-span-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14}/> Đăng nhập cuối
            </span>
            <p className="text-sm font-semibold text-slate-700">{formatDate(formData.last_login_at)}</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            disabled={!isDirty}
            onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all
              ${isDirty 
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Save size={18} />
            Lưu thay đổi
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
            />
            
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
              >
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800">
                    Thay đổi {editingField === 'email' ? 'Email' : 'Số điện thoại'}
                  </h3>
                  <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-6 space-y-8">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      {editingField === 'email' ? 'Nhập Email mới' : 'Nhập Số điện thoại mới'}
                    </label>
                    <input
                      type={editingField === 'email' ? 'email' : 'tel'}
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
                      placeholder={`Ví dụ: ${editingField === 'email' ? 'email@example.com' : '0987654321'}`}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700 text-center block">
                      Mã xác thực OTP (6 chữ số)
                    </label>
                    <div className="flex items-center justify-between gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold text-slate-800 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmModal}
                    disabled={otp.join('').length !== 6 || !tempValue || isVerifying}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {isVerifying ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                    {isVerifying ? 'Đang xác thực...' : 'Xác nhận thay đổi'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
