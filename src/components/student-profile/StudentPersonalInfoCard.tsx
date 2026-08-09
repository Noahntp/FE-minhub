import React, { useState, useEffect } from 'react';
import { User, Lock, Check, Loader2, FileText, Phone, Mail } from 'lucide-react';
import { profileApi } from '@/features/profile/api';

interface StudentPersonalInfoCardProps {
  currentUser: any;
  onProfileUpdated: (updatedUser: any) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const StudentPersonalInfoCard: React.FC<StudentPersonalInfoCardProps> = ({
  currentUser,
  onProfileUpdated,
  showToast
}) => {
  const initialForm = {
    fullName: currentUser?.name || currentUser?.full_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || ''
  };

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      fullName: currentUser?.name || currentUser?.full_name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      bio: currentUser?.bio || ''
    });
  }, [currentUser]);

  const isDirty =
    form.fullName.trim() !== (currentUser?.name || currentUser?.full_name || '').trim() ||
    form.phone.trim() !== (currentUser?.phone || '').trim() ||
    form.bio.trim() !== (currentUser?.bio || '').trim();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setForm({
      fullName: currentUser?.name || currentUser?.full_name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      bio: currentUser?.bio || ''
    });
    showToast('Đã hủy bỏ thay đổi.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      showToast('Họ và tên không được để trống.', 'error');
      return;
    }

    setSaving(true);
    try {
      await profileApi.updateAccountProfile({
        full_name: form.fullName.trim(),
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null
      });

      const updated = {
        ...currentUser,
        name: form.fullName.trim(),
        full_name: form.fullName.trim(),
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null
      };

      try {
        localStorage.setItem('mindhub_current_user', JSON.stringify(updated));
      } catch (e) {}

      onProfileUpdated(updated);

      showToast('Cập nhật thông tin cá nhân thành công!');
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật thông tin cá nhân.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          Thông tin cá nhân
        </h2>
        <span className="text-[11px] font-bold text-slate-400">* Trường bắt buộc</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Grid Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Họ và tên *
            </label>
            <div className="relative">
              <input
                required
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Số điện thoại
            </label>
            <div className="relative">
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                placeholder="0900 000 000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Email Read-only */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block">
              Địa chỉ Email (Chỉ đọc)
            </label>
            <div className="relative">
              <input
                readOnly
                type="email"
                value={form.email}
                className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-500 font-medium text-sm cursor-not-allowed pr-10"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Email dùng để đăng nhập và bảo mật tài khoản. Không thể thay đổi trực tiếp.</p>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700">
              Giới thiệu ngắn (Bio)
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              {form.bio.length} / 500 ký tự
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={500}
            name="bio"
            value={form.bio}
            onChange={handleInputChange}
            placeholder="Chia sẻ một chút thông tin về bản thân, mục tiêu học tập hoặc sở thích..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-slate-800 transition-all leading-relaxed resize-y"
          />
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Hủy thay đổi
            </button>
          )}

          <button
            type="submit"
            disabled={!isDirty || saving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};
