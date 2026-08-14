import React, { useState, useEffect } from 'react';
import { Briefcase, Globe, Facebook, Linkedin, Youtube, Check, Loader2, Award, CreditCard, Copy } from 'lucide-react';
import { instructorApi } from '@/features/instructor/api';

const getBankLogoUrl = (bankNameOrCode?: string): string => {
  if (!bankNameOrCode) return 'https://cdn.vietqr.io/img/TCB.png';
  const str = bankNameOrCode.toLowerCase();
  if (str.includes('techcom') || str.includes('tcb')) return 'https://cdn.vietqr.io/img/TCB.png';
  if (str.includes('vietcom') || str.includes('vcb')) return 'https://cdn.vietqr.io/img/VCB.png';
  if (str.includes('mb') || str.includes('quân đội')) return 'https://cdn.vietqr.io/img/MB.png';
  if (str.includes('vietin') || str.includes('icb') || str.includes('công thương')) return 'https://cdn.vietqr.io/img/ICB.png';
  if (str.includes('bidv') || str.includes('đầu tư')) return 'https://cdn.vietqr.io/img/BIDV.png';
  if (str.includes('agri') || str.includes('nông nghiệp') || str.includes('vba')) return 'https://cdn.vietqr.io/img/VBA.png';
  if (str.includes('acb') || str.includes('á châu')) return 'https://cdn.vietqr.io/img/ACB.png';
  if (str.includes('vpbank') || str.includes('vpb') || str.includes('thịnh vượng')) return 'https://cdn.vietqr.io/img/VPB.png';
  if (str.includes('tpbank') || str.includes('tpb') || str.includes('tiên phong')) return 'https://cdn.vietqr.io/img/TPB.png';
  if (str.includes('sacom') || str.includes('stb')) return 'https://cdn.vietqr.io/img/STB.png';
  if (str.includes('vib')) return 'https://cdn.vietqr.io/img/VIB.png';
  if (str.includes('msb') || str.includes('hàng hải')) return 'https://cdn.vietqr.io/img/MSB.png';
  if (str.includes('ocb') || str.includes('phương đông')) return 'https://cdn.vietqr.io/img/OCB.png';
  if (str.includes('hdbank') || str.includes('hdb')) return 'https://cdn.vietqr.io/img/HDB.png';
  if (str.includes('shb')) return 'https://cdn.vietqr.io/img/SHB.png';
  if (str.includes('lpb') || str.includes('liên việt') || str.includes('lpbank')) return 'https://cdn.vietqr.io/img/LPB.png';
  if (str.includes('exim') || str.includes('eib')) return 'https://cdn.vietqr.io/img/EIB.png';
  return 'https://cdn.vietqr.io/img/TCB.png';
};

interface ProfessionalProfileTabProps {
  currentUser: any;
  onProfileUpdated: (updatedUser: any) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const ProfessionalProfileTab: React.FC<ProfessionalProfileTabProps> = ({
  currentUser,
  onProfileUpdated,
  showToast
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    expertise: currentUser?.expertise || 'Lập trình Web',
    experienceYears: currentUser?.experience_years || 5,
    bio: currentUser?.bio || '',
    website: currentUser?.website || 'https://mindhub.vn',
    facebook: currentUser?.facebook || 'https://facebook.com/mindhub',
    linkedin: currentUser?.linkedin || 'https://linkedin.com/in/mindhub',
    youtube: currentUser?.youtube || 'https://youtube.com/@mindhub'
  });

  const [bankInfo, setBankInfo] = useState({
    bankName: currentUser?.bank_name || currentUser?.payout_account?.bank_name || 'Techcombank',
    accountNumber: currentUser?.account_number || currentUser?.payout_account?.account_number || '1903 8888 9999 68',
    accountName: currentUser?.account_name || currentUser?.payout_account?.account_name || currentUser?.full_name || 'NGUYEN VAN A'
  });

  const [initialForm, setInitialForm] = useState({ ...form });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await instructorApi.getInstructorProfile(currentUser?.id);
        const data = res?.data || res;
        if (data) {
          const profile = data.profile || data;
          const social = data.social_links || {};

          const loaded = {
            expertise: data.expertise || profile.expertise || 'Lập trình Web',
            experienceYears: profile.experience_years || 5,
            bio: data.bio || profile.bio || '',
            website: social.website || '',
            facebook: social.facebook || '',
            linkedin: social.linkedin || '',
            youtube: social.youtube || ''
          };
          setForm(loaded);
          setInitialForm(loaded);
          if (data.bank_name || data.account_number || data.payout_account) {
            setBankInfo({
              bankName: data.bank_name || data.payout_account?.bank_name || 'Techcombank',
              accountNumber: data.account_number || data.payout_account?.account_number || '1903 8888 9999 68',
              accountName: data.account_name || data.payout_account?.account_name || data.full_name || 'NGUYEN VAN A'
            });
          }
        }
      } catch (err) {
        console.warn('Fallback to current user context for professional profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const isDirty = 
    form.expertise.trim() !== initialForm.expertise.trim() ||
    Number(form.experienceYears) !== Number(initialForm.experienceYears) ||
    form.bio.trim() !== initialForm.bio.trim() ||
    form.website.trim() !== initialForm.website.trim() ||
    form.facebook.trim() !== initialForm.facebook.trim() ||
    form.linkedin.trim() !== initialForm.linkedin.trim() ||
    form.youtube.trim() !== initialForm.youtube.trim();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setForm({ ...initialForm });
    showToast('Đã hủy bỏ mọi thay đổi.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await instructorApi.updateInstructorProfile({
        expertise: form.expertise,
        bio: form.bio,
        social_links: {
          website: form.website,
          facebook: form.facebook,
          linkedin: form.linkedin,
          youtube: form.youtube
        }
      });

      const updatedData = res?.data || res;

      setInitialForm({ ...form });
      onProfileUpdated({
        ...currentUser,
        ...(typeof updatedData === 'object' ? updatedData : {}),
        expertise: form.expertise,
        bio: form.bio,
        website: form.website,
        facebook: form.facebook,
        linkedin: form.linkedin,
        youtube: form.youtube
      });
      showToast('Cập nhật hồ sơ chuyên môn giảng viên thành công!');
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật hồ sơ chuyên môn.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e7e8ed] p-12 text-center text-[#737373] text-xs font-medium shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#007A64] mb-2" />
        Đang tải hồ sơ chuyên môn giảng viên...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Thông tin nghề nghiệp */}
      <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a] mb-4 pb-2 border-b border-[#e7e8ed]">
          Thông tin nghề nghiệp & Chuyên môn
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-[#121b4b]">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider block">
              Lĩnh vực chuyên môn *
            </label>
            <input
              required
              type="text"
              name="expertise"
              value={form.expertise}
              onChange={handleInputChange}
              placeholder="Ví dụ: Laravel, React, Mobile App Development"
              className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#595959] tracking-wider block">
              Số năm kinh nghiệm
            </label>
            <input
              type="number"
              min={0}
              max={80}
              name="experienceYears"
              value={form.experienceYears}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Giới thiệu chuyên sâu */}
      <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#e7e8ed]">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a]">
            Giới thiệu giảng viên / Tiểu sử
          </h2>
          <span className="text-[10px] text-[#737373] font-medium">
            {form.bio.length} / 1000 ký tự
          </span>
        </div>

        <textarea
          rows={5}
          maxLength={1000}
          name="bio"
          value={form.bio}
          onChange={handleInputChange}
          placeholder="Mô tả quá trình làm việc, kinh nghiệm giảng dạy và sứ mệnh của bạn..."
          className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-xs text-[#06091a] leading-relaxed resize-y"
        />
      </div>

      {/* Section 3: Liên kết mạng xã hội */}
      <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a] mb-4 pb-2 border-b border-[#e7e8ed]">
          Liên kết mạng xã hội & Website
        </h2>

        <div className="space-y-3 text-xs font-semibold text-[#121b4b]">
          {/* Website */}
          <div className="flex gap-2">
            <div className="w-[120px] shrink-0 border border-[#dbdde4] rounded-xl px-3.5 py-2.5 bg-slate-50 flex items-center gap-1.5 text-[#737373]">
              <Globe className="w-3.5 h-3.5 text-[#007A64]" /> Website
            </div>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
              className="flex-1 px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]"
            />
          </div>

          {/* Facebook */}
          <div className="flex gap-2">
            <div className="w-[120px] shrink-0 border border-[#dbdde4] rounded-xl px-3.5 py-2.5 bg-slate-50 flex items-center gap-1.5 text-[#737373]">
              <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
            </div>
            <input
              type="url"
              name="facebook"
              value={form.facebook}
              onChange={handleInputChange}
              placeholder="https://facebook.com/user"
              className="flex-1 px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]"
            />
          </div>

          {/* LinkedIn */}
          <div className="flex gap-2">
            <div className="w-[120px] shrink-0 border border-[#dbdde4] rounded-xl px-3.5 py-2.5 bg-slate-50 flex items-center gap-1.5 text-[#737373]">
              <Linkedin className="w-3.5 h-3.5 text-blue-700" /> LinkedIn
            </div>
            <input
              type="url"
              name="linkedin"
              value={form.linkedin}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/user"
              className="flex-1 px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]"
            />
          </div>

          {/* YouTube */}
          <div className="flex gap-2">
            <div className="w-[120px] shrink-0 border border-[#dbdde4] rounded-xl px-3.5 py-2.5 bg-slate-50 flex items-center gap-1.5 text-[#737373]">
              <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube
            </div>
            <input
              type="url"
              name="youtube"
              value={form.youtube}
              onChange={handleInputChange}
              placeholder="https://youtube.com/@channel"
              className="flex-1 px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Tài khoản ngân hàng nhận thanh toán */}
      <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a] mb-4 pb-2 border-b border-[#e7e8ed] flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#007A64]" /> Tài khoản ngân hàng nhận thanh toán
        </h2>
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-[#e7e8ed] flex items-center gap-4">
          <div className="w-28 h-18 sm:w-32 sm:h-20 rounded-xl bg-white p-2.5 border border-[#dbdde4] shadow-2xs flex items-center justify-center shrink-0">
            <img
              src={getBankLogoUrl(bankInfo.bankName)}
              alt={bankInfo.bankName}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cdn.vietqr.io/img/TCB.png';
              }}
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-xs font-black text-[#007A64] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/80 inline-block">
              {bankInfo.bankName}
            </div>
            <div className="font-mono font-black text-[#06091a] text-base sm:text-lg tracking-wider flex items-center gap-2">
              <span>{bankInfo.accountNumber}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(bankInfo.accountNumber.replace(/\s+/g, ''));
                  showToast('Đã sao chép số tài khoản!');
                }}
                className="p-1 rounded text-[#737373] hover:text-[#007A64] transition-colors cursor-pointer"
                title="Sao chép STK"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs font-semibold text-[#595959] uppercase">
              {bankInfo.accountName}
            </div>
          </div>
        </div>
      </div>

        {/* Submit Controls */}
        <div className="pt-5 mt-4 border-t border-[#e7e8ed] flex items-center justify-end gap-3">
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
            {saving ? 'Đang lưu...' : 'Cập nhật hồ sơ chuyên môn'}
          </button>
        </div>
    </form>
  );
};
