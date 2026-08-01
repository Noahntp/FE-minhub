import React, { useState, useEffect } from 'react';
import { Lock, Mail, Phone, User, Check, RefreshCw, Loader2 } from 'lucide-react';
import { profileApi } from '@/features/profile/api';

interface PersonalInformationCardProps {
  currentUser: any;
  onProfileUpdated: (updatedUser: any) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const PersonalInformationCard: React.FC<PersonalInformationCardProps> = ({
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

  // Sync form state if currentUser prop changes
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
    showToast('Đã hủy bỏ mọi thay đổi.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      showToast('Họ và tên không được để trống.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await profileApi.updateAccountProfile({
        full_name: form.fullName.trim(),
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null
      });

      const updatedData = res?.data || res;

      onProfileUpdated({
        ...currentUser,
        name: form.fullName.trim(),
        full_name: form.fullName.trim(),
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null
      });

      showToast('Cập nhật thông tin cá nhân thành công!');
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật thông tin cá nhân.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isInstructor = currentUser?.role === 'instructor';
  const roleLabel = isInstructor ? 'Giảng viên' : currentUser?.role === 'admin' ? 'Quản trị viên' : 'Học viên';

  return (
    <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs mb-6">
      <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a] mb-5 pb-2 border-b border-[#e7e8ed]">
        Thông tin cá nhân
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-[#121b4b]">
        {/* 2-Column Grid on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Họ và tên */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider block">
              Họ và tên *
            </label>
            <input
              required
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleInputChange}
              placeholder="Nguyễn Văn A"
              className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]"
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider block">
              Số điện thoại
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="0900 000 000"
              className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]"
            />
          </div>

          {/* Email Readonly */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider block">
              Email * (Chỉ đọc)
            </label>
            <div className="relative">
              <input
                readOnly
                type="email"
                value={form.email}
                className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl bg-slate-50/80 font-medium text-[#737373] cursor-not-allowed pr-10"
              />
              <Lock className="w-4 h-4 text-[#a3a3a3] absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Vai trò hiện tại */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider block">
              Vai trò hệ thống
            </label>
            <div className="px-3.5 py-2.5 border border-[#dbdde4] rounded-xl bg-slate-50/80 font-bold text-[#06091a] flex items-center justify-between">
              <span>{roleLabel}</span>
              <span className="text-[10px] uppercase tracking-wider bg-slate-200 text-[#595959] px-2 py-0.5 rounded font-extrabold">Read-only</span>
            </div>
          </div>
        </div>

        {/* Giới thiệu ngắn với character counter */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider">
              Giới thiệu ngắn về bản thân
            </label>
            <span className="text-[10px] text-[#737373] font-medium">
              {form.bio.length} / 500 ký tự
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={500}
            name="bio"
            value={form.bio}
            onChange={handleInputChange}
            placeholder="Chia sẻ một chút thông tin ngắn về công việc, sở thích hoặc định hướng học tập của bạn..."
            className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a] leading-relaxed resize-y"
          />
        </div>

        {/* Form Submit & Cancel Controls */}
        <div className="pt-4 border-t border-[#e7e8ed] flex items-center justify-end gap-3">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-[#dbdde4] text-[#595959] hover:bg-slate-50 rounded-xl transition-all cursor-pointer font-bold bg-white text-xs"
            >
              Hủy thay đổi
            </button>
          )}

          <button
            type="submit"
            disabled={!isDirty || saving}
            className="px-5 py-2 bg-[#007A64] hover:bg-[#006653] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};
