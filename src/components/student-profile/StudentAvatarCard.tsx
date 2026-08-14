import React, { useRef, useState } from 'react';
import { Camera, Trash2, Loader2, User, Sparkles } from 'lucide-react';
import { profileApi } from '@/features/profile/api';

interface StudentAvatarCardProps {
  currentAvatarUrl?: string | null;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onAvatarUpdated: (newAvatarUrl: string | null) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const PRESET_OPTIONS = [
  { id: 'avatar_01', name: 'MindHub Teal', color: 'bg-emerald-600' },
  { id: 'avatar_02', name: 'Deep Indigo', color: 'bg-indigo-700' },
  { id: 'avatar_03', name: 'Sky Blue', color: 'bg-sky-600' },
  { id: 'avatar_04', name: 'Purple Vivid', color: 'bg-purple-600' },
  { id: 'avatar_05', name: 'Amber Glow', color: 'bg-amber-600' },
];

export const StudentAvatarCard: React.FC<StudentAvatarCardProps> = ({
  currentAvatarUrl,
  userName = 'Người dùng',
  userEmail = '',
  userRole = 'student',
  onAvatarUpdated,
  showToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectingPreset, setSelectingPreset] = useState<string | null>(null);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0284c7&color=fff&bold=true`;
  const displayAvatar = currentAvatarUrl || fallbackAvatar;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Dung lượng ảnh tối đa là 5MB.', 'error');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast('Định dạng ảnh không hợp lệ. Vui lòng chọn JPG, PNG hoặc WEBP.', 'error');
      return;
    }

    setUploading(true);
    try {
      const res = await profileApi.uploadAccountAvatar(file);
      const newUrl = res?.data?.avatar_url || res?.data?.avatar || res?.avatar_url || res?.avatar;
      if (newUrl) {
        onAvatarUpdated(newUrl);
        showToast('Cập nhật ảnh đại diện thành công!');
      } else {
        showToast('Tải ảnh đại diện hoàn tất.');
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể tải ảnh đại diện.', 'error');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSelectPreset = async (presetId: string) => {
    setSelectingPreset(presetId);
    try {
      const res = await profileApi.selectAccountAvatarPreset(presetId);
      const newUrl = res?.data?.avatar_url || res?.data?.avatar;
      if (newUrl) {
        onAvatarUpdated(newUrl);
      }
      showToast('Cập nhật ảnh đại diện mẫu thành công!');
    } catch (err: any) {
      showToast(err.message || 'Không thể cập nhật ảnh mẫu.', 'error');
    } finally {
      setSelectingPreset(null);
    }
  };

  const handleDeleteAvatar = async () => {
    setDeleting(true);
    try {
      await profileApi.deleteAccountAvatar();
      onAvatarUpdated(null);
      showToast('Đã xóa ảnh đại diện!');
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa ảnh đại diện.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          Ảnh đại diện & Tài khoản
        </h2>
        <span className="text-[11px] font-bold text-slate-400">JPG, PNG hoặc WEBP</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Display */}
        <div className="relative group shrink-0">
          <img
            src={displayAvatar}
            alt={userName}
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackAvatar;
            }}
            className="w-28 h-28 rounded-full object-cover border-4 border-slate-50 shadow-md bg-slate-100"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-white border border-slate-200 p-2 rounded-full shadow-md hover:bg-slate-50 transition-all cursor-pointer text-slate-700 hover:text-emerald-600 disabled:opacity-50"
            title="Đổi ảnh đại diện"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Camera className="w-4 h-4" />}
          </button>
        </div>

        {/* Info & Actions */}
        <div className="flex-1 w-full text-center sm:text-left space-y-4">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-bold text-slate-900">{userName}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {userRole === 'instructor' ? 'Giảng viên' : userRole === 'admin' ? 'Quản trị viên' : 'Học viên'}
              </span>
            </div>
            {userEmail && <p className="text-xs text-slate-500 font-medium mt-0.5">{userEmail}</p>}
          </div>

          {/* Upload / Delete Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <button
              type="button"
              disabled={uploading || deleting || Boolean(selectingPreset)}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {uploading ? 'Đang tải lên...' : 'Tải ảnh từ máy'}
            </button>

            {currentAvatarUrl && (
              <button
                type="button"
                disabled={deleting || uploading || Boolean(selectingPreset)}
                onClick={handleDeleteAvatar}
                className="px-3.5 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Xóa ảnh
              </button>
            )}
          </div>

          {/* Avatar Preset Options */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block mb-2">
              Hoặc chọn avatar có sẵn:
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              {PRESET_OPTIONS.map((preset) => {
                const isLoadingThis = selectingPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={Boolean(selectingPreset) || uploading || deleting}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`w-8 h-8 rounded-full ${preset.color} text-white font-bold text-xs flex items-center justify-center shadow-sm hover:scale-110 transition-all cursor-pointer border-2 border-white relative disabled:opacity-50`}
                    title={preset.name}
                  >
                    {isLoadingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>{preset.id.split('_')[1]}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
