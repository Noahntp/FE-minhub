import React, { useRef, useState } from 'react';
import { Camera, Trash2, Loader2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { profileApi } from '@/features/profile/api';

interface AvatarSectionProps {
  currentAvatarUrl?: string | null;
  userName?: string;
  onAvatarUpdated: (newAvatarUrl: string | null) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const PRESET_OPTIONS = [
  { id: 'avatar_01', name: 'MindHub Teal', color: 'bg-[#007A64]' },
  { id: 'avatar_02', name: 'Navy Blue', color: 'bg-[#121b4b]' },
  { id: 'avatar_03', name: 'Sky Blue', color: 'bg-[#0284c7]' },
  { id: 'avatar_04', name: 'Purple Gradient', color: 'bg-[#7c3aed]' },
  { id: 'avatar_05', name: 'Amber Gold', color: 'bg-[#d97706]' },
];

export const AvatarSection: React.FC<AvatarSectionProps> = ({
  currentAvatarUrl,
  userName = 'User',
  onAvatarUpdated,
  showToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectingPreset, setSelectingPreset] = useState<string | null>(null);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=007A64&color=fff&bold=true`;
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
        const cacheBustedUrl = newUrl.includes('?') ? `${newUrl}&v=${Date.now()}` : `${newUrl}?v=${Date.now()}`;
        onAvatarUpdated(cacheBustedUrl);
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
    <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs mb-6">
      <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a] mb-4 pb-2 border-b border-[#e7e8ed]">
        Ảnh đại diện tài khoản
      </h2>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar Display Card */}
        <div className="flex flex-col items-center text-center shrink-0 w-full md:w-44 p-3 bg-slate-50/60 rounded-xl border border-[#e7e8ed]">
          <div className="relative mb-2.5">
            <img
              src={displayAvatar}
              alt={userName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackAvatar;
              }}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm bg-white"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white border border-[#dbdde4] p-1.5 rounded-full shadow-xs hover:bg-slate-50 cursor-pointer text-[#007A64] disabled:opacity-50"
              title="Tải ảnh mới từ máy"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[10px] text-[#737373] leading-relaxed">
            JPG, PNG hoặc WEBP.<br />Tối đa 5MB.
          </p>
        </div>

        {/* Action Controls & Preset Grid */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={uploading || deleting || Boolean(selectingPreset)}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#007A64] hover:bg-[#006653] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {uploading ? 'Đang tải lên...' : 'Tải ảnh từ máy'}
            </button>

            {currentAvatarUrl && (
              <button
                type="button"
                disabled={deleting || uploading || Boolean(selectingPreset)}
                onClick={handleDeleteAvatar}
                className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Xóa ảnh đại diện
              </button>
            )}
          </div>

          {/* Avatar Preset Whitelist Grid */}
          <div className="pt-3 border-t border-[#e7e8ed]">
            <span className="text-[11px] font-bold text-[#595959] block mb-2">
              Chọn ảnh đại diện mẫu có sẵn:
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              {PRESET_OPTIONS.map((preset) => {
                const isLoadingThis = selectingPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={Boolean(selectingPreset) || uploading || deleting}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`w-9 h-9 rounded-full ${preset.color} text-white font-bold text-xs flex items-center justify-center shadow-2xs hover:scale-105 transition-all cursor-pointer border-2 border-white relative group disabled:opacity-50`}
                    title={preset.name}
                  >
                    {isLoadingThis ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>P{preset.id.split('_')[1]}</span>
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
