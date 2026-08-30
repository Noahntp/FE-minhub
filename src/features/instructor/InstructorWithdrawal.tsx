import React, { useState, useEffect, useCallback, useRef } from 'react';
import { instructorApi } from '@/features/instructor/api';
import { authApi } from '@/features/auth/api';
import { 
  Wallet, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, ChevronDown,
  Sparkles, X, Loader2, ShieldCheck, Eye, EyeOff, Lock,
  Building2, Info, Calendar, Zap, ArrowRight, Bell, HelpCircle
} from 'lucide-react';

const VIETNAM_BANKS = [
  { code: 'TCB', name: 'Techcombank', fullName: 'Techcombank (Ngân hàng Kỹ thương)' },
  { code: 'VCB', name: 'Vietcombank', fullName: 'Vietcombank (Ngân hàng Ngoại thương)' },
  { code: 'MB', name: 'MBBank', fullName: 'MBBank (Ngân hàng Quân đội)' },
  { code: 'ICB', name: 'VietinBank', fullName: 'VietinBank (Ngân hàng Công thương)' },
  { code: 'BIDV', name: 'BIDV', fullName: 'BIDV (Ngân hàng Đầu tư & Phát triển)' },
  { code: 'VBA', name: 'Agribank', fullName: 'Agribank (Ngân hàng Nông nghiệp)' },
  { code: 'VPB', name: 'VPBank', fullName: 'VPBank (Ngân hàng Việt Nam Thịnh Vượng)' },
  { code: 'TPB', name: 'TPBank', fullName: 'TPBank (Ngân hàng Tiên Phong)' },
  { code: 'ACB', name: 'ACB', fullName: 'ACB (Ngân hàng Á Châu)' },
  { code: 'STB', name: 'Sacombank', fullName: 'Sacombank (Ngân hàng Sài Gòn Thương Tín)' },
  { code: 'VIB', name: 'VIB', fullName: 'VIB (Ngân hàng Quốc tế)' },
  { code: 'HDB', name: 'HDBank', fullName: 'HDBank (Ngân hàng Phát triển TP.HCM)' },
  { code: 'MSB', name: 'MSB', fullName: 'MSB (Ngân hàng Hàng hải)' },
  { code: 'OCB', name: 'OCB', fullName: 'OCB (Ngân hàng Phương Đông)' },
  { code: 'LPB', name: 'LPBank', fullName: 'LPBank (Ngân hàng Lộc Phát)' },
  { code: 'SHB', name: 'SHB', fullName: 'SHB (Ngân hàng Sài Gòn - Hà Nội)' },
  { code: 'SeAB', name: 'SeABank', fullName: 'SeABank (Ngân hàng Đông Nam Á)' },
  { code: 'EIB', name: 'Eximbank', fullName: 'Eximbank (Ngân hàng Xuất Nhập Khẩu)' },
];

interface InstructorPaymentSummary {
  page_title?: string;
  pending_revenue: number;
  available_balance: number;
  reserved_balance: number;
  scheduled_payout: number;
  early_withdrawable_balance: number;
  total_paid: number;
  blocked_amount: number;
  minimum_payout: number;
  minimum_early_withdrawal: number;
  has_active_early_withdrawal: boolean;
  early_withdrawal_requests_remaining: number;
  next_early_withdrawal_available_at: string | null;
  automatic_payout_window: {
    from: string;
    to: string;
  } | null;
  payout_account_verified: boolean;
  blocked_reason: string | null;
  payout_account: any | null;
}

const PAYOUT_STATUS_LABELS: Record<string, { label: string; style: string }> = {
  initial: { label: 'Khởi tạo', style: 'bg-slate-100 text-slate-700 border-slate-200' },
  ready_to_pay: { label: 'Sẵn sàng thanh toán', style: 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20' },
  queued: { label: 'Đang chờ chuyển', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'Đang xử lý', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  paid: { label: 'Đã thanh toán', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed: { label: 'Thanh toán thất bại', style: 'bg-rose-50 text-rose-700 border-rose-200' },
  blocked: { label: 'Tạm giữ kiểm tra', style: 'bg-amber-50 text-amber-800 border-amber-200' },
  cancelled: { label: 'Đã hủy', style: 'bg-slate-100 text-slate-600 border-slate-200' },

  // Early withdrawal statuses
  pending: { label: 'Chờ duyệt', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Đã duyệt', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  rejected: { label: 'Bị từ chối', style: 'bg-rose-50 text-rose-700 border-rose-200' },
};

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

interface InstructorWithdrawalProps {
  instructorId?: string;
}

export const InstructorWithdrawal: React.FC<InstructorWithdrawalProps> = () => {
  // Hybrid Payment Summary state
  const [summary, setSummary] = useState<InstructorPaymentSummary>({
    pending_revenue: 0,
    available_balance: 0,
    reserved_balance: 0,
    scheduled_payout: 0,
    early_withdrawable_balance: 0,
    total_paid: 0,
    blocked_amount: 0,
    minimum_payout: 200000,
    minimum_early_withdrawal: 200000,
    has_active_early_withdrawal: false,
    early_withdrawal_requests_remaining: 2,
    next_early_withdrawal_available_at: null,
    automatic_payout_window: null,
    payout_account_verified: false,
    blocked_reason: null,
    payout_account: null,
  });

  // Active Payout Account state
  const [activePayoutAccount, setActivePayoutAccount] = useState<any | null>(null);
  
  // Reveal Account Number state
  const [revealedAccountNumber, setRevealedAccountNumber] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRevealingAccount, setIsRevealingAccount] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearRevealedAccount = useCallback(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    setRevealedAccountNumber(null);
    setIsRevealed(false);
  }, []);

  // Clear revealed account state on unmount
  useEffect(() => {
    return () => {
      clearRevealedAccount();
    };
  }, [clearRevealedAccount]);

  const handleToggleAccountNumber = () => {
    if (isRevealed) {
      // If currently revealed, mask immediately with 0 API calls
      clearRevealedAccount();
      return;
    }

    // Check if payout account is verified/active
    if (!summary.payout_account_verified && activePayoutAccount?.status !== 'active') {
      setToast({ message: 'Bạn cần xác minh tài khoản nhận tiền trước.', type: 'error' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    // Open Password confirmation modal to authenticate before revealing
    setConfirmPassword('');
    setPasswordError(null);
    setIsPasswordModalOpen(true);
  };

  const handleConfirmPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmPassword.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu xác nhận.');
      return;
    }

    if (!activePayoutAccount?.id) {
      setPasswordError('Không tìm thấy tài khoản nhận tiền.');
      return;
    }

    setIsRevealingAccount(true);
    setPasswordError(null);

    try {
      const res = await instructorApi.revealInstructorPayoutAccount(activePayoutAccount.id, {
        password: confirmPassword,
      });

      const fullNumber = res.data?.account_number || res.account_number;
      if (!fullNumber) {
        throw new Error('Không thể hiển thị số tài khoản.');
      }

      setRevealedAccountNumber(fullNumber);
      setIsRevealed(true);
      setIsPasswordModalOpen(false);
      setConfirmPassword('');
      setToast({ message: 'Xác thực thành công. Số tài khoản hiển thị trong 30 giây.', type: 'success' });
      setTimeout(() => setToast(null), 4000);

      // Auto mask after 30s
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
      revealTimerRef.current = setTimeout(() => {
        clearRevealedAccount();
        setToast({ message: 'Đã tự động ẩn số tài khoản để bảo mật.', type: 'success' });
        setTimeout(() => setToast(null), 4000);
      }, 30000);
    } catch (err: any) {
      if (err.status === 422 || err.code === 422) {
        setPasswordError(err.message || 'Mật khẩu xác nhận không chính xác.');
      } else if (err.status === 409) {
        setPasswordError(err.message || 'Tài khoản chưa được xác minh hoặc đang bị khóa.');
      } else if (err.status === 429) {
        setPasswordError('Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.');
      } else {
        setPasswordError(err.message || 'Không thể hiển thị số tài khoản. Vui lòng thử lại.');
      }
    } finally {
      setIsRevealingAccount(false);
    }
  };

  // History Tab & Pagination
  const [historyTab, setHistoryTab] = useState<'automatic' | 'early'>('automatic');
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, perPage: 10, total: 0 });

  // General Loading & Toast state
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Early Withdrawal Drawer & Form State
  const [isEarlyDrawerOpen, setIsEarlyDrawerOpen] = useState(false);
  const [earlyAmount, setEarlyAmount] = useState('');
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [earlyFormError, setEarlyFormError] = useState<string | null>(null);
  const [requestingOtp, setRequestingOtp] = useState(false);

  // Early Withdrawal OTP Modal State
  const [isEarlyOtpModalOpen, setIsEarlyOtpModalOpen] = useState(false);
  const [earlyOtpCode, setEarlyOtpCode] = useState('');
  const [earlyOtpError, setEarlyOtpError] = useState<string | null>(null);
  const [submittingEarlyWithdrawal, setSubmittingEarlyWithdrawal] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300);
  const [resendTimer, setResendTimer] = useState(60);
  const [maskedEmail, setMaskedEmail] = useState('');

  // Account Change OTP Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    provider: 'bank',
    bankName: 'Techcombank – Ngân hàng TMCP Kỹ thương Việt Nam',
    accountName: '',
    accountNumber: '',
    branch: 'Chi nhánh Hà Nội',
  });
  const [isAccountOtpModalOpen, setIsAccountOtpModalOpen] = useState(false);
  const [accountOtpCode, setAccountOtpCode] = useState('');
  const [accountOtpError, setAccountOtpError] = useState<string | null>(null);
  const [verifyingAccountOtp, setVerifyingAccountOtp] = useState(false);

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const formatVND = (amount: number | string | null | undefined) => {
    const num = Number(amount || 0);
    const safeNum = Number.isFinite(num) ? num : 0;
    return new Intl.NumberFormat('vi-VN').format(safeNum) + 'đ';
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  // OTP Countdown timer
  useEffect(() => {
    if (!isEarlyOtpModalOpen && !isAccountOtpModalOpen) return;
    const interval = setInterval(() => {
      setOtpTimer(prev => (prev > 0 ? prev - 1 : 0));
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEarlyOtpModalOpen, isAccountOtpModalOpen]);

  // Fetch Payment Summary & Payout Accounts
  const fetchSummaryAndAccounts = useCallback(async () => {
    try {
      const [summaryRes, accountsRes] = await Promise.allSettled([
        instructorApi.getInstructorWithdrawalSummary(),
        instructorApi.getInstructorPayoutAccounts()
      ]);

      if (summaryRes.status === 'fulfilled') {
        const resData = summaryRes.value?.data || summaryRes.value;
        if (resData && typeof resData === 'object') {
          setSummary({
            pending_revenue: Number(resData.pending_revenue ?? 0),
            available_balance: Number(resData.available_balance ?? resData.available_revenue ?? 0),
            reserved_balance: Number(resData.reserved_balance ?? 0),
            scheduled_payout: Number(resData.scheduled_payout ?? resData.pending_withdraw_amount ?? 0),
            early_withdrawable_balance: Number(resData.early_withdrawable_balance ?? resData.available_balance ?? 0),
            total_paid: Number(resData.total_paid ?? resData.paid_withdraw_amount ?? 0),
            blocked_amount: Number(resData.blocked_amount ?? 0),
            minimum_payout: Number(resData.minimum_payout ?? 200000),
            minimum_early_withdrawal: Number(resData.minimum_early_withdrawal ?? 200000),
            has_active_early_withdrawal: Boolean(resData.has_active_early_withdrawal),
            early_withdrawal_requests_remaining: Number(resData.early_withdrawal_requests_remaining ?? 2),
            next_early_withdrawal_available_at: resData.next_early_withdrawal_available_at || null,
            automatic_payout_window: resData.automatic_payout_window || null,
            payout_account_verified: Boolean(resData.payout_account_verified ?? (resData.payout_account ? true : false)),
            blocked_reason: resData.blocked_reason || null,
            payout_account: resData.payout_account || null,
          });

          if (resData.payout_account) {
            setActivePayoutAccount(resData.payout_account);
          }
        }
      }

      if (accountsRes.status === 'fulfilled') {
        const list = accountsRes.value?.data || accountsRes.value;
        if (Array.isArray(list)) {
          const defaultAcc = list.find((a: any) => a.is_default) || list[0] || null;
          if (defaultAcc) {
            setActivePayoutAccount(defaultAcc);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch summary/accounts:', err);
    }
  }, []);

  // Fetch History List (Automatic Payouts or Early Withdrawals)
  const fetchHistoryList = useCallback(async (page = 1, tab = historyTab, status = statusFilter) => {
    setLoadingList(true);
    try {
      const typeParam = tab === 'automatic' ? 'automatic_payout' : 'early_withdrawal';
      const res = await instructorApi.getInstructorWithdrawals({ 
        page, 
        per_page: meta.perPage,
        type: typeParam,
        status: status !== 'all' ? status : undefined
      });

      const dataObj = res?.items ? res : (res?.data?.items ? res.data : (res?.data || res));
      const items = Array.isArray(dataObj) ? dataObj : (dataObj?.items || []);
      const paginationMeta = res?.meta || res?.pagination || dataObj?.pagination || {};

      setHistoryItems(items);
      setMeta({
        currentPage: paginationMeta.current_page || page,
        lastPage: paginationMeta.last_page || 1,
        perPage: paginationMeta.per_page || meta.perPage,
        total: paginationMeta.total || items.length,
      });
    } catch (err) {
      console.warn('Failed to fetch history list:', err);
      setHistoryItems([]);
    } finally {
      setLoadingList(false);
    }
  }, [meta.perPage, historyTab, statusFilter]);

  // Initial Load
  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await Promise.all([
        fetchSummaryAndAccounts(),
        fetchHistoryList(1)
      ]);
      setLoading(false);
    };
    initLoad();
  }, [fetchSummaryAndAccounts, fetchHistoryList]);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      fetchSummaryAndAccounts();
      fetchHistoryList(1, historyTab, statusFilter);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchSummaryAndAccounts, fetchHistoryList, historyTab, statusFilter]);

  // Handle Tab Change
  const handleTabChange = (tab: 'automatic' | 'early') => {
    setHistoryTab(tab);
    fetchHistoryList(1, tab, statusFilter);
  };

  // Open Early Withdrawal Drawer
  const handleOpenEarlyDrawer = () => {
    if (!summary.payout_account_verified) {
      showToast('Vui lòng cập nhật và xác minh tài khoản nhận tiền trước.', 'error');
      return;
    }
    if (summary.early_withdrawable_balance < summary.minimum_early_withdrawal) {
      showToast(`Số dư khả dụng chưa đạt mức tối thiểu (${formatVND(summary.minimum_early_withdrawal)}).`, 'error');
      return;
    }
    if (summary.has_active_early_withdrawal) {
      showToast('Bạn đang có một yêu cầu thanh toán sớm đang được xử lý.', 'error');
      return;
    }
    if (summary.early_withdrawal_requests_remaining <= 0) {
      showToast('Bạn đã dùng hết 2 lượt thanh toán sớm trong tháng này.', 'error');
      return;
    }
    setEarlyAmount(String(summary.early_withdrawable_balance));
    setConfirmTerms(false);
    setEarlyFormError(null);
    setIsEarlyDrawerOpen(true);
  };

  // Set Full Balance
  const setFullBalance = () => {
    setEarlyAmount(String(summary.early_withdrawable_balance));
    setEarlyFormError(null);
  };

  // Step 1: Request Early Withdrawal OTP
  const handleRequestEarlyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(earlyAmount);
    if (!amountNum || isNaN(amountNum)) {
      setEarlyFormError('Vui lòng nhập số tiền hợp lệ.');
      return;
    }
    if (amountNum < summary.minimum_early_withdrawal) {
      setEarlyFormError(`Số tiền tối thiểu là ${formatVND(summary.minimum_early_withdrawal)}.`);
      return;
    }
    if (amountNum > summary.early_withdrawable_balance) {
      setEarlyFormError(`Số tiền vượt quá số dư khả dụng (${formatVND(summary.early_withdrawable_balance)}).`);
      return;
    }
    if (!confirmTerms) {
      setEarlyFormError('Vui lòng tick chọn xác nhận điều kiện thanh toán sớm.');
      return;
    }

    setRequestingOtp(true);
    setEarlyFormError(null);

    try {
      const res = await authApi.requestInstructorEarlyWithdrawalOtp({
        amount: amountNum,
        payout_account_id: activePayoutAccount?.id,
      });
      const resData = res?.data || res;

      setMaskedEmail(resData?.masked_email || 'in****@mindhub.test');
      setOtpTimer(resData?.expires_in || 300);
      setResendTimer(resData?.resend_after || 60);
      setEarlyOtpCode('');
      setEarlyOtpError(null);

      setIsEarlyDrawerOpen(false);
      setIsEarlyOtpModalOpen(true);
      showToast('Mã OTP xác nhận đã được gửi tới email của bạn.');
    } catch (err: any) {
      setEarlyFormError(err.message || 'Lỗi gửi mã OTP thanh toán sớm.');
    } finally {
      setRequestingOtp(false);
    }
  };

  // Step 2: Confirm Early Withdrawal with OTP
  const handleConfirmEarlyWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingEarlyWithdrawal) return;

    if (!earlyOtpCode || earlyOtpCode.trim().length !== 6) {
      setEarlyOtpError('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }

    setSubmittingEarlyWithdrawal(true);
    setEarlyOtpError(null);

    try {
      await instructorApi.createInstructorEarlyWithdrawal({
        amount: Number(earlyAmount),
        payout_account_id: activePayoutAccount?.id,
        otp: earlyOtpCode.trim(),
      });

      showToast('Tạo yêu cầu thanh toán sớm thành công!');
      setIsEarlyOtpModalOpen(false);

      // Refetch data cleanly without page reload
      await Promise.all([
        fetchSummaryAndAccounts(),
        fetchHistoryList(1)
      ]);
    } catch (err: any) {
      setEarlyOtpError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setSubmittingEarlyWithdrawal(false);
    }
  };

  // Cancel Early Withdrawal Request
  const handleCancelEarlyWithdrawal = async (id: number | string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu thanh toán sớm này?')) return;

    setCancellingId(id);
    try {
      await instructorApi.cancelInstructorWithdrawal(id);
      showToast('Đã hủy yêu cầu thanh toán sớm.');
      await Promise.all([
        fetchSummaryAndAccounts(),
        fetchHistoryList(meta.currentPage)
      ]);
    } catch (err: any) {
      showToast(err.message || 'Không thể hủy yêu cầu.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  // View Detail Modal
  const handleViewDetail = async (id: number | string) => {
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await instructorApi.getInstructorWithdrawal(id);
      setSelectedItem(res?.data || res);
    } catch (err: any) {
      showToast('Không thể tải chi tiết đợt thanh toán.', 'error');
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Payout Account OTP Update Submit
  const handleSaveAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.accountNumber.trim()) {
      showToast('Vui lòng nhập số tài khoản ngân hàng.', 'error');
      return;
    }
    if (!accountForm.accountName.trim()) {
      showToast('Vui lòng nhập tên chủ tài khoản.', 'error');
      return;
    }

    setSavingAccount(true);
    try {
      const payload = {
        provider: accountForm.provider,
        account_number: accountForm.accountNumber.trim(),
        account_name: accountForm.accountName.trim().toUpperCase(),
        branch_name: accountForm.branch.trim(),
        bank_name: accountForm.bankName,
      };

      const otpRes = await authApi.sendInstructorPayoutAccountOtp(activePayoutAccount?.id || 0, payload);
      const resData = otpRes?.data || otpRes;

      setMaskedEmail(resData?.masked_email || 'in****@mindhub.test');
      setOtpTimer(resData?.expires_in || 300);
      setResendTimer(resData?.resend_after || 60);
      setAccountOtpCode('');
      setAccountOtpError(null);

      setIsAccountModalOpen(false);
      setIsAccountOtpModalOpen(true);
      showToast('Mã OTP xác minh đã được gửi đến email của bạn.');
    } catch (err: any) {
      showToast(err.message || 'Lỗi gửi mã OTP.', 'error');
    } finally {
      setSavingAccount(false);
    }
  };

  // Verify Account OTP
  const handleVerifyAccountOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountOtpCode || accountOtpCode.trim().length !== 6) {
      setAccountOtpError('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }

    setVerifyingAccountOtp(true);
    setAccountOtpError(null);

    try {
      const res = await instructorApi.verifyInstructorPayoutAccountChange(activePayoutAccount?.id || 0, accountOtpCode.trim());
      showToast('Cập nhật tài khoản nhận tiền thành công!');
      setIsAccountOtpModalOpen(false);
      await fetchSummaryAndAccounts();
    } catch (err: any) {
      setAccountOtpError(err.message || 'Mã OTP không hợp lệ.');
    } finally {
      setVerifyingAccountOtp(false);
    }
  };

  // Computed Early Withdrawal button state
  const isEarlyButtonDisabled = 
    !summary.payout_account_verified ||
    summary.early_withdrawable_balance < summary.minimum_early_withdrawal ||
    summary.has_active_early_withdrawal ||
    summary.early_withdrawal_requests_remaining <= 0 ||
    Boolean(summary.next_early_withdrawal_available_at);

  const earlyButtonDisabledReason = !summary.payout_account_verified
    ? 'Cần xác minh tài khoản nhận tiền'
    : summary.early_withdrawable_balance < summary.minimum_early_withdrawal
    ? 'Chưa đủ mức tối thiểu (200.000đ)'
    : summary.has_active_early_withdrawal
    ? 'Đang có yêu cầu thanh toán sớm chờ duyệt'
    : summary.early_withdrawal_requests_remaining <= 0
    ? 'Đã dùng hết 2 lượt thanh toán sớm tháng này'
    : summary.next_early_withdrawal_available_at
    ? 'Cần chờ 7 ngày từ yêu cầu trước'
    : '';

  return (
    <div className="w-full text-left space-y-6 pb-12 font-sans bg-[#f8fafc] min-h-screen">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#121b4b] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-100/10">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* HEADER TRANG HYBRID */}
      <div className="flex justify-between items-start pt-2">
        <div>
          <h1 className="text-2xl font-black text-[#06091a] tracking-tight">Thanh toán giảng viên</h1>
          <p className="text-xs font-medium text-[#737373] mt-1">Theo dõi thanh toán tự động theo kỳ hàng tháng và gửi yêu cầu thanh toán sớm khi cần.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="p-2.5 rounded-xl bg-white border border-[#e7e8ed] text-[#595959] hover:bg-slate-50 transition-colors relative cursor-pointer shadow-sm">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0066FF] rounded-full"></span>
          </button>
          <button type="button" className="p-2.5 rounded-xl bg-white border border-[#e7e8ed] text-[#595959] hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HELPER: Format bank name cleanly */}
      {/* SECTION A: 4 DASHBOARD SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Số dư khả dụng */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3.5 h-full">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              Số dư khả dụng <Info className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-lg font-black text-blue-600 tracking-tight mt-0.5 truncate">
              {formatVND(summary.available_balance)}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5 truncate">Sẵn sàng giải ngân</span>
          </div>
        </div>

        {/* Card 2: Khoản đã lên lịch */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3.5 h-full">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              Khoản đã lên lịch <Info className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-lg font-black text-indigo-600 tracking-tight mt-0.5 truncate">
              {formatVND(summary.scheduled_payout)}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5 truncate">Đã gom cho kỳ tự động</span>
          </div>
        </div>

        {/* Card 3: Tổng đã thanh toán */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3.5 h-full">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              Tổng đã thanh toán <Info className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-lg font-black text-emerald-600 tracking-tight mt-0.5 truncate">
              {formatVND(summary.total_paid)}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5 truncate">Đã giải ngân qua ngân hàng</span>
          </div>
        </div>

        {/* Card 4: Đang tạm giữ */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3.5 h-full">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              Đang tạm giữ <Info className="w-3 h-3 text-slate-400" />
            </span>
            <div className="text-lg font-black text-rose-600 tracking-tight mt-0.5 truncate">
              {formatVND(summary.blocked_amount)}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5 truncate">Bảo lưu do chưa đủ điều kiện</span>
          </div>
        </div>

      </div>

      {/* SECTION C: CARD TÀI KHOẢN NHẬN TIỀN (NGAY DƯỚI 4 THẺ THÔNG SỐ TỔNG QUAN) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">Tài khoản nhận tiền (Bank Transfer)</h2>
          </div>
          <button 
            type="button"
            onClick={() => {
              if (activePayoutAccount) {
                setAccountForm({
                  provider: activePayoutAccount.provider || 'bank',
                  bankName: (activePayoutAccount.bank_name && activePayoutAccount.bank_name.toLowerCase() !== 'ngân hàng') ? activePayoutAccount.bank_name : 'Techcombank',
                  accountName: activePayoutAccount.account_name || activePayoutAccount.account_holder_name || '',
                  accountNumber: activePayoutAccount.account_number || '',
                  branch: activePayoutAccount.branch_name || 'Chi nhánh Hà Nội',
                });
              }
              setIsAccountModalOpen(true);
            }}
            className="px-3.5 py-1.5 border border-blue-200 text-blue-600 hover:bg-blue-50/60 font-bold rounded-xl transition-all text-xs cursor-pointer bg-white shadow-2xs"
          >
            Cập nhật tài khoản
          </button>
        </div>

        {activePayoutAccount ? (
          <div className="flex items-center gap-4">
            <div className="w-24 h-12 rounded-xl border border-slate-200/90 bg-white flex items-center justify-center shrink-0 p-2 shadow-2xs overflow-hidden">
              <img 
                src={getBankLogoUrl(activePayoutAccount.bank_name || activePayoutAccount.bank_code || activePayoutAccount.provider_label)} 
                alt={activePayoutAccount.bank_name || 'Bank Logo'} 
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fallbackEl = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                  if (fallbackEl) fallbackEl.classList.remove('hidden');
                }}
              />
              <span className="hidden text-[11px] font-black tracking-wider text-rose-600 uppercase">
                {activePayoutAccount.bank_code || 'BANK'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-6 gap-y-2 text-xs font-semibold text-slate-800 flex-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Ngân hàng</span>
                <span className="font-extrabold text-slate-900 text-xs block mt-0.5">
                  {(activePayoutAccount.bank_name && activePayoutAccount.bank_name.toLowerCase() !== 'ngân hàng')
                    ? activePayoutAccount.bank_name
                    : (activePayoutAccount.provider_label && activePayoutAccount.provider_label.toLowerCase() !== 'ngân hàng' ? activePayoutAccount.provider_label : (activePayoutAccount.provider || 'MBBank'))}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Chủ tài khoản</span>
                <span className="font-extrabold text-slate-900 text-xs block mt-0.5 uppercase">
                  {activePayoutAccount.account_name || activePayoutAccount.account_holder_name || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Số tài khoản</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-black text-slate-900 text-xs">
                    {isRevealed && revealedAccountNumber
                      ? revealedAccountNumber
                      : (activePayoutAccount.account_number_masked || '********6789')}
                  </span>
                  <button 
                    type="button" 
                    aria-label={isRevealed ? "Ẩn số tài khoản" : "Hiển thị số tài khoản"}
                    title={isRevealed ? "Ẩn số tài khoản" : "Hiển thị số tài khoản"}
                    onClick={handleToggleAccountNumber} 
                    disabled={isRevealingAccount}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50"
                  >
                    {isRevealingAccount ? (
                      <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    ) : isRevealed ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Trạng thái xác minh</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex items-center font-black border px-2.5 py-0.5 rounded-full text-[10px] ${
                    summary.payout_account_verified || activePayoutAccount.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {summary.payout_account_verified || activePayoutAccount.status === 'active' ? 'Đã xác minh OTP Email' : 'Chưa xác minh'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-500">
            <p>Chưa cài đặt tài khoản nhận tiền.</p>
          </div>
        )}
      </div>

      {/* SECTION B & D: 2 ACTION BANNERS (KỲ THANH TOÁN TỰ ĐỘNG + YÊU CẦU THANH TOÁN SỚM) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* KỲ THANH TOÁN TỰ ĐỘNG */}
        <div className="lg:col-span-6 bg-gradient-to-br from-blue-50/80 via-indigo-50/20 to-white rounded-2xl border border-blue-100/90 p-5 shadow-2xs flex flex-col justify-between gap-4 h-full">
          <div className="flex justify-between items-center pb-3 border-b border-blue-100/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-2xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">Kỳ thanh toán tự động tiếp theo</h2>
                <span className="text-[11px] font-semibold text-slate-500 block">Luồng thanh toán mặc định hằng tháng</span>
              </div>
            </div>
            <span className={`px-3 py-1 border font-extrabold text-xs rounded-xl shadow-2xs ${
              (summary.available_balance + summary.scheduled_payout) >= (summary.minimum_payout || 200000)
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white border-blue-200 text-blue-600'
            }`}>
              Mức tối thiểu: {formatVND(summary.minimum_payout || 200000)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngày thanh toán dự kiến</span>
              <span className="font-extrabold text-slate-800 text-xs block mt-1">
                {summary.automatic_payout_window 
                  ? `Từ ${formatDate(summary.automatic_payout_window.from)} đến ${formatDate(summary.automatic_payout_window.to)}` 
                  : 'Từ 05 đến 10 tháng sau'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số tiền dự kiến gom</span>
              <span className="font-black text-blue-600 text-base block mt-0.5">
                {formatVND(summary.available_balance + summary.scheduled_payout)}
              </span>
            </div>
          </div>
        </div>

        {/* YÊU CẦU THANH TOÁN SỚM */}
        <div className="lg:col-span-6 bg-gradient-to-br from-amber-50/80 via-orange-50/20 to-white rounded-2xl border border-amber-200/80 p-5 shadow-2xs flex flex-col justify-between gap-4 h-full">
          <div className="flex justify-between items-center pb-3 border-b border-amber-200/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-2xs">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">Yêu cầu thanh toán sớm</h2>
                <span className="text-[11px] font-semibold text-slate-500 block">Nhận tiền trước kỳ thanh toán tự động</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-100/80 text-amber-900 font-extrabold text-[10px] rounded-xl border border-amber-200/60">
              Lượt còn lại: {summary.early_withdrawal_requests_remaining}/2
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số dư có thể yêu cầu</span>
              <span className="font-black text-amber-600 text-lg block mt-0.5">{formatVND(summary.early_withdrawable_balance)}</span>
            </div>
            <div className="text-right">
              <button
                type="button"
                disabled={isEarlyButtonDisabled}
                onClick={handleOpenEarlyDrawer}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl transition-all shadow-sm text-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                title={earlyButtonDisabledReason}
              >
                <span>Yêu cầu thanh toán sớm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {isEarlyButtonDisabled && earlyButtonDisabledReason && (
                <span className="text-[9.5px] text-amber-800 font-medium block mt-1 text-right">{earlyButtonDisabledReason}</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION E: BẢNG LỊCH SỬ THANH TOÁN (2 TABS: PAYOUT TỰ ĐỘNG & THANH TOÁN SỚM) */}
      <div className="bg-white rounded-2xl border border-[#e7e8ed] shadow-sm overflow-hidden space-y-3">
        
        {/* TABS & FILTER BAR */}
        <div className="p-4 border-b border-[#e7e8ed] flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleTabChange('automatic')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                historyTab === 'automatic'
                  ? 'bg-white text-[#0066FF] shadow-xs'
                  : 'text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Thanh toán tự động (Hàng tháng)
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('early')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                historyTab === 'early'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Yêu cầu thanh toán sớm
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#737373]">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                fetchHistoryList(1, historyTab, e.target.value);
              }}
              className="px-3 py-1.5 border border-[#dbdde4] rounded-xl text-xs font-bold bg-white text-[#06091a] focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="ready_to_pay">Sẵn sàng thanh toán</option>
              <option value="approved">Đã duyệt</option>
              <option value="processing">Đang xử lý</option>
              <option value="paid">Đã thanh toán</option>
              <option value="rejected">Bị từ chối</option>
              <option value="blocked">Tạm giữ</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* TABLE CONTENT */}
        {loadingList ? (
          <div className="py-12 text-center text-xs text-[#737373] flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
            <span>Đang tải danh sách lịch sử...</span>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#737373] space-y-1">
            <Wallet className="w-8 h-8 text-[#dbdde4] mx-auto" />
            <p className="font-bold text-[#06091a]">Chưa có dữ liệu thanh toán nào</p>
            <p className="text-[11px] text-[#a3a3a3]">
              {historyTab === 'automatic'
                ? 'Các đợt thanh toán tự động hàng tháng sẽ hiển thị tại đây.'
                : 'Các yêu cầu thanh toán sớm của bạn sẽ hiển thị tại đây.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-[#e7e8ed] text-[10px] uppercase font-extrabold text-[#737373] tracking-wider">
                  <th className="py-3 px-4">Mã giao dịch</th>
                  <th className="py-3 px-4">{historyTab === 'automatic' ? 'Kỳ doanh thu' : 'Ngày gửi'}</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Tài khoản nhận (Snapshot)</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày hoàn tất</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e8ed] font-medium text-[#121b4b]">
                {historyItems.map(item => {
                  const statusInfo = PAYOUT_STATUS_LABELS[item.status] || { label: item.status_label || item.status, style: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0066FF]">{item.code || item.display_code || `#PAY-${item.id}`}</td>
                      <td className="py-3.5 px-4 text-[#06091a] font-bold">
                        {historyTab === 'automatic'
                          ? (item.period_start && item.period_end ? `${formatDate(item.period_start)} - ${formatDate(item.period_end)}` : 'Kỳ hàng tháng')
                          : formatDate(item.requested_at || item.created_at)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-[#06091a]">{formatVND(item.amount)}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#06091a]">
                          {item.account_name_snapshot || item.account?.account_name || item.account?.account_name_snapshot || activePayoutAccount?.account_name || ''}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {item.bank_name || item.account?.bank_name || activePayoutAccount?.bank_name || 'MB Bank'} – {item.account_number_masked || item.account_number_snapshot || item.account?.account_number_snapshot_masked || activePayoutAccount?.account_number_masked || ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${statusInfo.style}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#737373] font-medium">{formatDate(item.paid_at || item.processed_at)}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button 
                          type="button"
                          onClick={() => handleViewDetail(item.id)}
                          className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer"
                        >
                          Chi tiết
                        </button>
                        {item.status === 'pending' && (
                          <button 
                            type="button"
                            disabled={cancellingId === item.id}
                            onClick={() => handleCancelEarlyWithdrawal(item.id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            {cancellingId === item.id ? 'Đang hủy...' : 'Hủy'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.lastPage > 1 && (
          <div className="p-4 border-t border-[#e7e8ed] flex justify-between items-center bg-slate-50/50 text-xs font-bold text-[#737373]">
            <span>Trang {meta.currentPage} / {meta.lastPage} ({meta.total} kết quả)</span>
            <div className="flex gap-2">
              <button 
                type="button"
                disabled={meta.currentPage === 1}
                onClick={() => fetchHistoryList(meta.currentPage - 1)}
                className="p-1.5 border border-[#dbdde4] bg-white rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                type="button"
                disabled={meta.currentPage === meta.lastPage}
                onClick={() => fetchHistoryList(meta.currentPage + 1)}
                className="p-1.5 border border-[#dbdde4] bg-white rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DRAWER: YÊU CẦU THANH TOÁN SỚM */}
      {isEarlyDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between text-left relative">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-[#e7e8ed]">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <h2 className="text-base font-black text-[#06091a]">Yêu cầu thanh toán sớm</h2>
                </div>
                <button type="button" onClick={() => setIsEarlyDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestEarlyOtp} className="space-y-4 mt-4">
                
                {/* Balance Info */}
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Số dư có thể yêu cầu</span>
                  <div className="text-xl font-black text-amber-900">{formatVND(summary.early_withdrawable_balance)}</div>
                </div>

                {/* Amount Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-[#595959]">Số tiền muốn nhận (VNĐ) *</label>
                    <button type="button" onClick={setFullBalance} className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer">
                      Thanh toán toàn bộ
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={earlyAmount ? Number(earlyAmount).toLocaleString('vi-VN') : ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setEarlyAmount(val);
                      setEarlyFormError(null);
                    }}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold text-sm text-[#06091a]"
                  />
                  <span className="text-[10px] text-[#a3a3a3] font-medium block">
                    Tối thiểu: {formatVND(summary.minimum_early_withdrawal)}
                  </span>
                </div>

                {/* Bank Readonly Snapshot */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#595959]">Tài khoản nhận tiền (Default Verified)</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-xs text-[#06091a] flex items-center gap-3">
                    <img 
                      src={getBankLogoUrl(activePayoutAccount?.bank_name || activePayoutAccount?.bank_code || activePayoutAccount?.provider_label)} 
                      alt="Bank logo" 
                      className="w-12 h-6 object-contain shrink-0 bg-white rounded p-0.5 border border-slate-200/80" 
                    />
                    <div>
                      <div className="font-bold">{activePayoutAccount?.provider_label || activePayoutAccount?.bank_name || 'Techcombank'}</div>
                      <div className="text-[11px] font-mono text-[#737373] mt-0.5">{activePayoutAccount?.account_number_masked || '********6789'} ({activePayoutAccount?.account_name})</div>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-2 pt-2">
                  <input 
                    type="checkbox"
                    id="confirmTerms"
                    checked={confirmTerms}
                    onChange={e => setConfirmTerms(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="confirmTerms" className="text-[11px] text-[#737373] font-medium leading-tight cursor-pointer">
                    Tôi đã rà soát thông tin tài khoản và đồng ý phân bổ doanh thu cho đợt thanh toán sớm này.
                  </label>
                </div>

                {earlyFormError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{earlyFormError}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-[#e7e8ed] flex gap-3">
                  <button type="button" onClick={() => setIsEarlyDrawerOpen(false)} className="flex-1 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 rounded-xl font-bold text-xs cursor-pointer">
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    disabled={requestingOtp || !confirmTerms}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {requestingOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Gửi mã OTP Email</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL OTP THANH TOÁN SỚM */}
      {isEarlyOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-left relative">
            <button type="button" onClick={() => setIsEarlyOtpModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#e7e8ed]">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#06091a]">Xác nhận OTP Thanh toán sớm</h3>
                <p className="text-[11px] text-[#737373] font-medium">Mã OTP đã gửi đến email <span className="font-bold text-stone-900">{maskedEmail}</span></p>
              </div>
            </div>

            <form onSubmit={handleConfirmEarlyWithdrawalSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Mã OTP 6 chữ số *</label>
                <input 
                  type="text"
                  maxLength={6}
                  value={earlyOtpCode}
                  onChange={e => {
                    setEarlyOtpCode(e.target.value.replace(/\D/g, ''));
                    setEarlyOtpError(null);
                  }}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono font-bold text-center tracking-[0.5em] text-lg text-[#06091a] bg-slate-50/50"
                  autoFocus
                />
                <div className="flex items-center justify-between text-[11px] font-medium text-[#737373] mt-1">
                  <span>Hạn dùng mã: <strong className="text-stone-900 font-mono">{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</strong></span>
                  {resendTimer > 0 ? (
                    <span>Gửi lại sau <strong>{resendTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestEarlyOtp}
                      disabled={requestingOtp}
                      className="text-amber-600 font-bold hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {requestingOtp ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                    </button>
                  )}
                </div>
              </div>

              {earlyOtpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{earlyOtpError}</span>
                </div>
              )}

              <div className="pt-4 border-t border-[#e7e8ed] flex gap-3 justify-end">
                <button type="button" onClick={() => setIsEarlyOtpModalOpen(false)} className="px-4 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer">
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={submittingEarlyWithdrawal || earlyOtpCode.length !== 6}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingEarlyWithdrawal && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xác nhận & Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CẬP NHẬT TÀI KHOẢN VÀ MODAL DETAIL */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-left relative">
            <button type="button" onClick={() => setIsAccountModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#e7e8ed]">
              <div className="p-3 bg-blue-50 text-[#0066FF] rounded-2xl border border-blue-100">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#06091a]">Cập nhật tài khoản nhận tiền</h3>
                <p className="text-[11px] text-[#737373] font-medium">Yêu cầu xác thực OTP email bảo mật</p>
              </div>
            </div>
            <form onSubmit={handleSaveAccountSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Ngân hàng *</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-4 flex items-center justify-center shrink-0">
                    <img 
                      src={getBankLogoUrl(accountForm.bankName)} 
                      alt="Bank logo" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <select 
                    value={accountForm.bankName}
                    onChange={e => setAccountForm(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full pl-12 pr-9 py-2.5 bg-white border border-[#dbdde4] rounded-xl font-bold text-xs text-[#06091a] focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none"
                  >
                    {VIETNAM_BANKS.map((b) => (
                      <option key={b.code} value={b.name}>
                        {b.fullName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Số tài khoản *</label>
                <input 
                  type="text" 
                  value={accountForm.accountNumber}
                  onChange={e => setAccountForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl font-mono font-bold text-xs text-[#06091a]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Tên chủ tài khoản *</label>
                <input 
                  type="text" 
                  value={accountForm.accountName}
                  onChange={e => setAccountForm(prev => ({ ...prev, accountName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl font-bold text-xs text-[#06091a] uppercase"
                />
              </div>

              <div className="pt-4 border-t border-[#e7e8ed] flex gap-3 justify-end">
                <button type="button" onClick={() => setIsAccountModalOpen(false)} className="px-4 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer">
                  Hủy
                </button>
                <button type="submit" disabled={savingAccount} className="px-5 py-2.5 bg-[#0066FF] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50">
                  {savingAccount ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
                  Gửi mã OTP Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC THỰC OTP THAY ĐỔI TÀI KHOẢN NHẬN TIỀN */}
      {isAccountOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-left relative">
            <button 
              type="button" 
              onClick={() => setIsAccountOtpModalOpen(false)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#e7e8ed]">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#06091a]">Xác thực OTP thay đổi tài khoản</h3>
                <p className="text-[11px] text-[#737373] font-medium">Mã OTP đã được gửi đến email <strong>{maskedEmail}</strong></p>
              </div>
            </div>

            <form onSubmit={handleVerifyAccountOtpSubmit} className="space-y-4">
              <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl space-y-1.5 text-xs text-blue-900">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Thông tin tài khoản nhận tiền mới:</span>
                </div>
                <div className="space-y-0.5 text-[11px] text-blue-800 font-medium pl-5">
                  <div>• Ngân hàng: <strong>{accountForm.bankName}</strong></div>
                  <div>• Số tài khoản: <strong className="font-mono">{accountForm.accountNumber}</strong></div>
                  <div>• Tên chủ tài khoản: <strong>{accountForm.accountName.toUpperCase()}</strong></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-[#595959]">Nhập mã OTP 6 chữ số *</label>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    Hiệu lực: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex justify-center items-center gap-2 relative my-2">
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const digit = accountOtpCode[idx] || '';
                    const isCurrent = accountOtpCode.length === idx;
                    const isFilled = Boolean(digit);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          const inputEl = document.getElementById('account-otp-real-input');
                          if (inputEl) inputEl.focus();
                        }}
                        className={`w-11 h-13 rounded-xl border-2 flex items-center justify-center text-xl font-mono font-black transition-all cursor-pointer select-none shadow-sm ${
                          isCurrent
                            ? 'border-emerald-600 ring-4 ring-emerald-500/20 bg-emerald-50/50 text-emerald-950 scale-105'
                            : isFilled
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-slate-50/50 text-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        {digit || <span className="text-slate-300 font-light text-sm">•</span>}
                      </div>
                    );
                  })}
                  <input 
                    id="account-otp-real-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    value={accountOtpCode}
                    onChange={(e) => {
                      setAccountOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setAccountOtpError(null);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    required
                  />
                </div>
              </div>

              {accountOtpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{accountOtpError}</span>
                </div>
              )}

              <div className="pt-4 border-t border-[#e7e8ed] flex gap-3 justify-end items-center">
                <button 
                  type="button" 
                  onClick={() => setIsAccountOtpModalOpen(false)} 
                  className="px-4 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={verifyingAccountOtp || accountOtpCode.length !== 6}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {verifyingAccountOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xác nhận & Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC THỰC MẬT KHẨU ĐỂ HIỂN THỊ SỐ TÀI KHOẢN */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-left relative">
            <button 
              type="button" 
              onClick={() => setIsPasswordModalOpen(false)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#e7e8ed]">
              <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl border border-slate-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#06091a]">Xác thực tài khoản</h3>
                <p className="text-[11px] text-[#737373] font-medium">Nhập mật khẩu để hiển thị số tài khoản đầy đủ</p>
              </div>
            </div>

            <form onSubmit={handleConfirmPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[#595959]">Mật khẩu đăng nhập của bạn *</label>
                <input 
                  type="password"
                  autoFocus
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="Nhập mật khẩu đăng nhập"
                  className="w-full px-3.5 py-2.5 border border-[#dbdde4] rounded-xl font-bold text-xs text-[#06091a]"
                  required
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="pt-4 border-t border-[#e7e8ed] flex gap-3 justify-end items-center">
                <button 
                  type="button" 
                  onClick={() => setIsPasswordModalOpen(false)} 
                  className="px-4 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isRevealingAccount || !confirmPassword.trim()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isRevealingAccount && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xác nhận hiển thị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT ĐỢT THANH TOÁN */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 text-left relative max-h-[90vh] overflow-y-auto">
            <button 
              type="button" 
              onClick={() => setIsDetailModalOpen(false)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#e7e8ed]">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#06091a]">
                  Chi tiết {selectedItem?.code || selectedItem?.display_code || `#PAY-${selectedItem?.id}`}
                </h3>
                <p className="text-[11px] text-[#737373] font-medium">Báo cáo doanh thu & thông tin giải ngân</p>
              </div>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center text-xs text-[#737373] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
                <span>Đang tải chi tiết giao dịch...</span>
              </div>
            ) : selectedItem ? (
              <div className="space-y-5 text-xs font-semibold text-[#121b4b]">
                
                {/* General Info */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Loại giao dịch</span>
                    <span className="font-extrabold text-slate-900 text-xs block mt-0.5">
                      {selectedItem.type === 'early_withdrawal' ? 'Yêu cầu thanh toán sớm' : 'Kỳ thanh toán tự động'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trạng thái</span>
                    <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded-full border mt-0.5 ${
                      PAYOUT_STATUS_LABELS[selectedItem.status]?.style || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {PAYOUT_STATUS_LABELS[selectedItem.status]?.label || selectedItem.status}
                    </span>
                  </div>
                  {selectedItem.payout_mode && (
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phương thức chi trả</span>
                      <span className="font-bold text-slate-900 text-xs block mt-0.5">
                        {selectedItem.payout_mode === 'auto' ? 'Tự động' : (selectedItem.payout_mode === 'manual' ? 'Thủ công' : 'Không xác định')}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số tiền giải ngân</span>
                    <span className="font-black text-blue-600 text-base block mt-0.5">{formatVND(selectedItem.amount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngày tạo yêu cầu</span>
                    <span className="font-bold text-slate-900 text-xs block mt-0.5">{formatDate(selectedItem.requested_at || selectedItem.created_at)}</span>
                  </div>
                </div>

                {/* Bank Account Snapshot */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tài khoản nhận tiền (Snapshot)</span>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">Chủ tài khoản:</span>
                      <span className="font-extrabold text-slate-900">{selectedItem.account_name_snapshot || selectedItem.account?.account_name || 'NGUYỄN VĂN A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">Ngân hàng:</span>
                      <span className="font-extrabold text-slate-900">{selectedItem.bank_name || selectedItem.account?.bank_name || 'Techcombank'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10.5px]">Số tài khoản:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedItem.account_number_snapshot || '****6789'}</span>
                    </div>
                    {selectedItem.paid_at && (
                      <div>
                        <span className="text-slate-500 block text-[10.5px]">Ngày hoàn tất:</span>
                        <span className="font-extrabold text-emerald-600">{formatDate(selectedItem.paid_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Associated Revenues list if present */}
                {selectedItem.revenues && selectedItem.revenues.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Doanh thu phân bổ ({selectedItem.revenues.length} khóa học)</span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                          <tr>
                            <th className="p-2.5">Khóa học</th>
                            <th className="p-2.5 text-right">Số tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {selectedItem.revenues.map((rev: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2.5 text-slate-900 font-bold">{rev.course_title || rev.course?.title || `Khóa học #${rev.course_id}`}</td>
                              <td className="p-2.5 text-right font-black text-blue-600">{formatVND(rev.instructor_amount || rev.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button type="button" onClick={() => setIsDetailModalOpen(false)} className="px-5 py-2.5 bg-[#0066FF] hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs">
                    Đóng
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};
