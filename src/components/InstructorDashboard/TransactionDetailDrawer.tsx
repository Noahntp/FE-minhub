import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, XCircle, FileText, User, CreditCard, Calendar, Activity, BookOpen } from 'lucide-react';
import { ApiService } from '../../services/api';

interface TransactionDetailDrawerProps {
  transactionId: number | string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionDetailDrawer({ transactionId, isOpen, onClose }: TransactionDetailDrawerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !transactionId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await ApiService.getInstructorTransactionDetails(transactionId);
        if (res?.success || res?.data?.success) {
          setData(res.data?.data || res.data || res);
        }
      } catch (err) {
        console.error('Failed to fetch transaction details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [transactionId, isOpen]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const getStatusInfo = (status: string) => {
    if (status === 'success' || status === 'paid' || status === 'available') {
      return { icon: <CheckCircle className="w-5 h-5 text-emerald-600" />, text: 'Thành công', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    }
    if (status === 'pending' || status === 'processing') {
      return { icon: <Clock className="w-5 h-5 text-amber-600" />, text: 'Đang xử lý', color: 'text-amber-600', bg: 'bg-amber-50' };
    }
    return { icon: <XCircle className="w-5 h-5 text-red-600" />, text: 'Thất bại', color: 'text-red-600', bg: 'bg-red-50' };
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-stone-800">Chi tiết giao dịch</h2>
            <p className="text-sm text-stone-500 font-mono mt-1">Mã: {data?.order_code || data?.transaction_id || `TXN-${transactionId}`}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-500">
              <Activity className="w-8 h-8 animate-spin mb-4 text-brand-normal" />
              <p>Đang tải thông tin giao dịch...</p>
            </div>
          ) : data ? (
            <div className="space-y-8 animate-fade-in text-left">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${getStatusInfo(data.status).bg} border-current/20`}>
                {getStatusInfo(data.status).icon}
                <div>
                  <p className={`font-bold ${getStatusInfo(data.status).color}`}>{getStatusInfo(data.status).text}</p>
                  <p className="text-sm text-stone-600 mt-1">
                    Giao dịch thực hiện lúc: {new Date(data.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Thông tin thanh toán */}
              <div className="bg-stone-50 p-5 rounded-2xl border">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-stone-400" /> Phân bổ doanh thu
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-stone-200 border-dashed">
                    <span className="text-stone-500">Giá gốc (Gross)</span>
                    <span className="font-medium text-stone-800">{formatCurrency(data.gross_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-stone-200 border-dashed">
                    <span className="text-stone-500">Phí nền tảng</span>
                    <span className="font-medium text-red-600">-{formatCurrency(data.platform_fee_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-stone-200 border-dashed">
                    <span className="text-stone-500">Giảm giá / Voucher</span>
                    <span className="font-medium text-amber-600">-{formatCurrency(data.discount_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-stone-800">Thu nhập thực nhận</span>
                    <span className="text-xl font-bold text-emerald-600">{formatCurrency(data.instructor_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin Khóa học & Người mua */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-stone-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Khóa học
                  </h3>
                  <div className="flex items-center gap-3">
                    {data.course_thumbnail ? (
                       <img src={data.course_thumbnail} alt="" className="w-16 h-12 rounded-lg object-cover shadow-sm" />
                    ) : (
                       <div className="w-16 h-12 rounded-lg bg-stone-100 flex items-center justify-center"><BookOpen className="w-5 h-5 text-stone-400" /></div>
                    )}
                    <div>
                      <p className="font-bold text-stone-800 line-clamp-2">{data.course_title}</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-stone-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" /> Người mua
                  </h3>
                  <div className="flex items-center gap-3">
                    <img 
                      src={data.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user_name || 'User')}&background=random`} 
                      alt="" 
                      className="w-12 h-12 rounded-full border shadow-sm"
                    />
                    <div>
                      <p className="font-bold text-stone-800">{data.user_name}</p>
                      <p className="text-xs text-stone-500">{data.user_email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lịch sử giao dịch Timeline */}
              <div>
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-stone-400" /> Nhật ký giao dịch
                </h3>
                <div className="relative border-l-2 border-stone-200 ml-3 pl-5 space-y-6">
                  {data.timeline?.map((event: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-[29px] p-1 rounded-full border-2 border-white
                        ${event.status === 'success' ? 'bg-emerald-500 text-white' : 'bg-stone-300'}
                      `}>
                        {event.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full" />}
                      </span>
                      <p className="font-semibold text-stone-800">{event.title}</p>
                      <p className="text-sm text-stone-500">{event.time}</p>
                      {event.note && (
                        <p className="text-sm text-stone-600 mt-1 bg-stone-50 p-2 rounded-lg border">{event.note}</p>
                      )}
                    </div>
                  ))}

                  {/* Fallback Timeline nếu API không trả về mảng timeline chi tiết */}
                  {!data.timeline && (
                    <>
                      <div className="relative">
                        <span className="absolute -left-[29px] p-1 bg-stone-300 rounded-full border-2 border-white">
                          <div className="w-3 h-3 rounded-full" />
                        </span>
                        <p className="font-semibold text-stone-800">Đơn hàng được tạo</p>
                        <p className="text-sm text-stone-500">{new Date(data.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="relative">
                        <span className={`absolute -left-[29px] p-1 rounded-full border-2 border-white
                          ${data.status === 'success' || data.status === 'available' || data.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}
                        `}>
                          <CheckCircle className="w-3 h-3" />
                        </span>
                        <p className="font-semibold text-stone-800">
                          Cập nhật trạng thái: {getStatusInfo(data.status).text}
                        </p>
                        <p className="text-sm text-stone-500">{data.updated_at ? new Date(data.updated_at).toLocaleString('vi-VN') : new Date(data.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-stone-500">
              Không tìm thấy thông tin chi tiết.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
