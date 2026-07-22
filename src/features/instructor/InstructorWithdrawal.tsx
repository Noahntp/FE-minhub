import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, Wallet, Landmark, 
  History, AlertCircle, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';

interface InstructorWithdrawalProps {
  instructorId: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const InstructorWithdrawal: React.FC<InstructorWithdrawalProps> = ({ instructorId }) => {
  const [balance, setBalance] = useState<any>({
    withdrawableBalance: 0,
    totalPendingWithdrawal: 0,
    totalWithdrawn: 0,
    lastWithdrawal: null
  });
  
  const [payoutAccount, setPayoutAccount] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balanceRes, accountRes, withdrawalsRes] = await Promise.all([
        Promise.resolve((Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any)),
        Promise.resolve((Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any)),
        Promise.resolve((Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any))
      ]);
      
      setBalance(balanceRes);
      setPayoutAccount(accountRes.data);
      if (accountRes.data) {
        setAccountForm({
          bankName: accountRes.data.bankName,
          accountName: accountRes.data.accountName,
          accountNumber: accountRes.data.accountNumber,
          branch: accountRes.data.branch || ''
        });
      }
      setWithdrawals(withdrawalsRes.data);
      setMeta(withdrawalsRes.meta);
    } catch (error) {
      console.error('Error fetching withdrawal data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (instructorId) {
      fetchData();
    }
  }, [instructorId, meta.page, meta.limit]);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      if (res.success) {
        setPayoutAccount(res.data);
        setIsEditingAccount(false);
      }
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess(false);

    if (!payoutAccount) {
      setWithdrawError('Vui lòng cập nhật thông tin tài khoản nhận tiền trước khi rút.');
      return;
    }

    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Số tiền không hợp lệ.');
      return;
    }

    if (amount > balance.withdrawableBalance) {
      setWithdrawError('Số tiền rút vượt quá số dư khả dụng.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      if (res.success) {
        setWithdrawSuccess(true);
        setWithdrawAmount('');
        setWithdrawNote('');
        fetchData(); // Refresh data to update balance and history
      } else {
        setWithdrawError(res.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (error: any) {
      setWithdrawError(error.message || 'Lỗi kết nối.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setMeta({ ...meta, page: newPage });
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><Clock className="w-3 h-3"/> Chờ xử lý</span>;
      case 'approved': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3"/> Đã duyệt</span>;
      case 'processing': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><Activity className="w-3 h-3"/> Đang chuyển tiền</span>;
      case 'paid': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3"/> Đã thanh toán</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><XCircle className="w-3 h-3"/> Từ chối</span>;
      default: return <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded text-[10px] font-bold uppercase w-fit">{status}</span>;
    }
  };

  if (loading && !balance.withdrawableBalance && withdrawals.length === 0) {
    return <div className="p-10 text-center text-stone-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs text-left">
      <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-2">
        <Wallet className="w-5 h-5 text-emerald-600" /> Quản Lý Rút Tiền
      </h3>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-5 rounded-xl shadow-md relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block relative z-10">Số Dư Có Thể Rút</span>
          <span className="text-3xl font-black block mt-2 relative z-10">{formatVND(balance.withdrawableBalance)}</span>
        </div>
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Đang Chờ Xử Lý</span>
          <span className="text-xl font-bold text-stone-800 block mt-2">{formatVND(balance.totalPendingWithdrawal)}</span>
        </div>
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Tổng Đã Rút</span>
          <span className="text-xl font-bold text-stone-800 block mt-2">{formatVND(balance.totalWithdrawn)}</span>
        </div>
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Lần Rút Gần Nhất</span>
          <span className="text-sm font-bold text-stone-800 block mt-2">
            {balance.lastWithdrawal ? formatDate(balance.lastWithdrawal.createdAt) : 'Chưa có dữ liệu'}
          </span>
          <span className="text-xs text-stone-500 block mt-1">
            {balance.lastWithdrawal ? formatVND(balance.lastWithdrawal.amount) : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PAYOUT ACCOUNT */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden h-fit">
          <div className="p-4 border-b bg-stone-50 flex justify-between items-center">
            <h4 className="font-bold text-stone-800 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" /> Thông tin Nhận tiền
            </h4>
            {!isEditingAccount && (
              <button 
                onClick={() => setIsEditingAccount(true)}
                className="text-[10px] font-bold uppercase text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded"
              >
                Cập nhật
              </button>
            )}
          </div>
          
          <div className="p-5">
            {isEditingAccount ? (
              <form onSubmit={handleUpdateAccount} className="space-y-4">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Ngân hàng thụ hưởng</label>
                  <input type="text" required value={accountForm.bankName} onChange={e => setAccountForm({...accountForm, bankName: e.target.value})} placeholder="VD: Vietcombank, Techcombank..." className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Tên chủ tài khoản</label>
                  <input type="text" required value={accountForm.accountName} onChange={e => setAccountForm({...accountForm, accountName: e.target.value.toUpperCase()})} placeholder="NGUYEN VAN A" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 uppercase" />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Số tài khoản</label>
                  <input type="text" required value={accountForm.accountNumber} onChange={e => setAccountForm({...accountForm, accountNumber: e.target.value})} placeholder="Nhập số tài khoản" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Chi nhánh (Không bắt buộc)</label>
                  <input type="text" value={accountForm.branch} onChange={e => setAccountForm({...accountForm, branch: e.target.value})} placeholder="VD: Chi nhánh Hà Nội" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                  <button type="button" onClick={() => setIsEditingAccount(false)} className="px-4 py-2 border rounded-lg font-bold text-stone-600 hover:bg-stone-50">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Lưu thông tin</button>
                </div>
              </form>
            ) : payoutAccount ? (
              <div className="space-y-4">
                <div className="flex gap-4 items-center p-4 border border-emerald-100 bg-emerald-50/50 rounded-xl">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-black text-lg text-stone-800 tracking-tight">{payoutAccount.bankName}</h5>
                    <p className="font-bold text-stone-500">{payoutAccount.accountNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Chủ tài khoản</span>
                    <span className="font-bold text-stone-700">{payoutAccount.accountName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Chi nhánh</span>
                    <span className="font-bold text-stone-700">{payoutAccount.branch || 'Không có'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-stone-500 bg-stone-50 rounded-lg border border-dashed">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-stone-400" />
                <p className="font-bold mb-2">Chưa thiết lập tài khoản nhận tiền</p>
                <button onClick={() => setIsEditingAccount(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Thêm tài khoản ngay</button>
              </div>
            )}
          </div>
        </div>

        {/* WITHDRAW FORM */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden h-fit">
          <div className="p-4 border-b bg-stone-50 flex justify-between items-center">
            <h4 className="font-bold text-stone-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Tạo Yêu cầu Rút tiền
            </h4>
          </div>
          <div className="p-5">
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block font-bold text-stone-600 mb-1">Số tiền muốn rút (VNĐ)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    required 
                    min="100000"
                    step="10000"
                    value={withdrawAmount} 
                    onChange={e => setWithdrawAmount(e.target.value)} 
                    placeholder="Tối thiểu 100.000đ" 
                    className="w-full border p-3 pl-10 text-lg font-bold rounded-lg focus:ring-2 focus:ring-emerald-500" 
                  />
                  <DollarSign className="w-5 h-5 text-stone-400 absolute left-3 top-3.5" />
                </div>
                {withdrawAmount && !isNaN(Number(withdrawAmount)) && (
                  <p className="text-emerald-600 font-bold mt-1 text-[11px]">
                    Thực tế nhận: {formatVND(Number(withdrawAmount))}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block font-bold text-stone-600 mb-1">Ghi chú (Không bắt buộc)</label>
                <textarea 
                  value={withdrawNote} 
                  onChange={e => setWithdrawNote(e.target.value)} 
                  placeholder="Ghi chú thêm cho quản trị viên..." 
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 min-h-[80px] resize-y" 
                />
              </div>

              {withdrawError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="font-bold">{withdrawError}</p>
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="font-bold">Đã tạo yêu cầu rút tiền thành công. Vui lòng chờ quản trị viên xử lý.</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || balance.withdrawableBalance <= 0 || !payoutAccount}
                className="w-full py-3 bg-stone-800 text-white rounded-lg font-bold text-sm hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Rút tiền'}
              </button>
              
              {balance.withdrawableBalance <= 0 && (
                <p className="text-center text-stone-500 text-[10px] mt-2 font-bold">Số dư khả dụng bằng 0, không thể rút.</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* WITHDRAWAL HISTORY */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-stone-50 flex justify-between items-center">
          <h4 className="font-bold text-stone-800 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" /> Lịch sử Rút tiền
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-xs text-stone-500 uppercase">
              <tr>
                <th className="px-4 py-3 border-b">Mã YC</th>
                <th className="px-4 py-3 border-b">Ngày yêu cầu</th>
                <th className="px-4 py-3 border-b text-right">Số tiền</th>
                <th className="px-4 py-3 border-b">Ghi chú</th>
                <th className="px-4 py-3 border-b">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y text-stone-700 font-medium">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-stone-500">Chưa có lịch sử rút tiền.</td>
                </tr>
              ) : (
                withdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[10px] text-stone-500">#{String(w.id).slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(w.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-black text-stone-800">{formatVND(w.amount)}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-stone-500">{w.note || '-'}</td>
                    <td className="px-4 py-3">
                      {getStatusBadge(w.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center bg-stone-50">
            <span className="text-xs text-stone-500 font-semibold">Trang {meta.page} / {meta.totalPages}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page <= 1}
                className="p-1.5 border rounded bg-white text-stone-600 disabled:opacity-50 hover:bg-stone-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="p-1.5 border rounded bg-white text-stone-600 disabled:opacity-50 hover:bg-stone-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
