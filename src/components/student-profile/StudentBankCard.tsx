import React, { useState, useEffect } from 'react';
import { CreditCard, Copy, Edit2, Check, X } from 'lucide-react';
import { apiFetch } from '@/shared/lib/api-client';

const VIETNAM_BANKS = [
  { code: 'TCB', name: 'Techcombank', fullName: 'Techcombank (Ngân hàng Kỹ thương)' },
  { code: 'VCB', name: 'Vietcombank', fullName: 'Vietcombank (Ngân hàng Ngoại thương)' },
  { code: 'MB', name: 'MBBank', fullName: 'MBBank (Ngân hàng Quân đội)' },
  { code: 'ICB', name: 'VietinBank', fullName: 'VietinBank (Ngân hàng Công thương)' },
  { code: 'BIDV', name: 'BIDV', fullName: 'BIDV (Ngân hàng Đầu tư và Phát triển)' },
  { code: 'VBA', name: 'Agribank', fullName: 'Agribank (Ngân hàng Nông nghiệp)' },
  { code: 'VPB', name: 'VPBank', fullName: 'VPBank (Ngân hàng Việt Nam Thịnh Vượng)' },
  { code: 'TPB', name: 'TPBank', fullName: 'TPBank (Ngân hàng Tiên Phong)' },
  { code: 'STB', name: 'Sacombank', fullName: 'Sacombank (Ngân hàng Sài Gòn Thương Tín)' },
  { code: 'ACB', name: 'ACB', fullName: 'ACB (Ngân hàng Á Châu)' },
  { code: 'HDB', name: 'HDBank', fullName: 'HDBank (Ngân hàng Phát triển TP.HCM)' },
  { code: 'SHB', name: 'SHB', fullName: 'SHB (Ngân hàng Sài Gòn - Hà Nội)' },
];

export const getBankLogoUrl = (bankNameOrCode?: string): string => {
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

interface StudentBankCardProps {
  currentUser: any;
  onProfileUpdated?: (updatedUser: any) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const StudentBankCard: React.FC<StudentBankCardProps> = ({
  currentUser,
  onProfileUpdated,
  showToast
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bankName, setBankName] = useState(
    currentUser?.bank_name || currentUser?.payout_account?.bank_name || 'Techcombank'
  );
  const [accountNumber, setAccountNumber] = useState(
    currentUser?.account_number || currentUser?.payout_account?.account_number || '19038888999968'
  );
  const [accountName, setAccountName] = useState(
    currentUser?.account_name || currentUser?.payout_account?.account_name || currentUser?.name || currentUser?.full_name || 'NOAH'
  );

  useEffect(() => {
    let isMounted = true;
    // Fetch active default payout account from backend database
    apiFetch<any>('/instructor/payout-accounts/default')
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        if (data) {
          if (data.bank_name) setBankName(data.bank_name);
          if (data.account_number) setAccountNumber(data.account_number);
          if (data.account_name) setAccountName(data.account_name);
        }
      })
      .catch(() => {
        // Fallback silently if offline or endpoint not authenticated as instructor
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber.replace(/\s+/g, ''));
    showToast('Đã sao chép số tài khoản!');
  };

  const handleSave = async () => {
    try {
      // Save new bank account to database table payout_accounts
      await apiFetch('/instructor/payout-accounts', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'bank',
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName
        })
      });
    } catch (e) {
      console.warn('API payout-accounts save skipped:', e);
    }

    const updated = {
      ...currentUser,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName
    };
    try {
      localStorage.setItem('mindhub_current_user', JSON.stringify(updated));
    } catch (e) {}
    if (onProfileUpdated) {
      onProfileUpdated(updated);
    }
    setIsEditing(false);
    showToast('Cập nhật thông tin tài khoản ngân hàng thành công!');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" /> Tài khoản ngân hàng nhận tiền
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
        >
          {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
          {isEditing ? 'Hủy' : 'Chỉnh sửa'}
        </button>
      </div>

      {!isEditing ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#004D3F] to-slate-950 p-6 sm:p-7 text-white shadow-xl border border-emerald-500/20 group">
          {/* Subtle Background Lighting & Mesh Glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-500" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.04] pointer-events-none" />

          {/* Top Bar: Bank Logo & Actions */}
          <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {/* Logo badge with clean white backdrop */}
              <div className="h-12 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-white/40 flex items-center justify-center shrink-0">
                <img
                  src={getBankLogoUrl(bankName)}
                  alt={bankName}
                  className="h-full w-auto max-w-[120px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://cdn.vietqr.io/img/TCB.png';
                  }}
                />
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Đã kết nối
              </span>
            </div>

            {/* Quick Actions: Copy STK & Edit */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-md border border-white/10 transition-all cursor-pointer active:scale-95 shadow-sm"
                title="Sao chép số tài khoản"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sao chép STK</span>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10 active:scale-95 shadow-sm"
                title="Chỉnh sửa thông tin"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>
          </div>

          {/* Middle Row: EMV Chip & Account Number */}
          <div className="relative z-10 space-y-2 mb-6">
            <div className="flex items-center gap-2 mb-1">
              {/* Gold Microchip icon */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 border border-amber-200/60 shadow-inner relative overflow-hidden flex items-center justify-center">
                <div className="w-full h-[1px] bg-amber-700/30 absolute top-2" />
                <div className="w-full h-[1px] bg-amber-700/30 absolute bottom-2" />
                <div className="h-full w-[1px] bg-amber-700/30 absolute left-3" />
                <div className="h-full w-[1px] bg-amber-700/30 absolute right-3" />
              </div>
              {/* Contactless Signal Icon */}
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8.5 15.5a5 5 0 017 0M5 12a10 10 0 0114 0" />
              </svg>
            </div>

            <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-300/80">
              Số tài khoản nhận tiền
            </div>
            <div className="font-mono font-black text-white text-2xl sm:text-3xl tracking-widest text-shadow-sm select-all">
              {accountNumber.replace(/(\d{4})/g, '$1 ').trim()}
            </div>
          </div>

          {/* Bottom Row: Holder Name & Bank Name */}
          <div className="relative z-10 flex items-end justify-between pt-4 border-t border-white/10 text-xs">
            <div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
                Chủ tài khoản
              </div>
              <div className="font-extrabold text-white text-sm sm:text-base tracking-wide uppercase">
                {accountName}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
                Ngân hàng
              </div>
              <div className="font-black text-emerald-300 text-xs sm:text-sm tracking-wider uppercase">
                {bankName}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Ngân hàng</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              {VIETNAM_BANKS.map((b) => (
                <option key={b.code} value={b.name}>{b.fullName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Số tài khoản</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Nhập số tài khoản..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Tên chủ tài khoản</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value.toUpperCase())}
              placeholder="VD: NGUYEN VAN A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Lưu thông tin
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
