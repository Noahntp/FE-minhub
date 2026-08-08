import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { apiFetch } from '@/shared/lib/api-client';

export default function VNPayReturnPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    const transactionStatus = searchParams.get('vnp_TransactionStatus');

    if (responseCode === '00' || transactionStatus === '00') {
      setStatus('success');
      setMessage('Thanh toán thành công! Khóa học đã được thêm vào tài khoản của bạn.');
    } else if (responseCode || transactionStatus) {
      setStatus('failed');
      setMessage('Thanh toán thất bại hoặc giao dịch bị hủy.');
    } else {
      setStatus('failed');
      setMessage('Không tìm thấy thông tin xác thực giao dịch.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-stone-200">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 text-stone-600">
            <Loader className="w-12 h-12 animate-spin text-amber-600" />
            <h2 className="text-xl font-bold font-display">Đang xử lý...</h2>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 text-emerald-700">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
            <h2 className="text-2xl font-bold font-display text-emerald-800">Thanh toán Thành công!</h2>
            <p className="text-sm font-medium text-stone-600">{message}</p>
            <button 
              onClick={() => onNavigate('/my-courses')}
              className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all"
            >
              Vào Học Ngay
            </button>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="flex flex-col items-center gap-4 text-red-700">
            <XCircle className="w-16 h-16 text-red-500" />
            <h2 className="text-2xl font-bold font-display text-red-800">Thanh toán Thất bại</h2>
            <p className="text-sm font-medium text-stone-600">{message}</p>
            <button 
              onClick={() => onNavigate('/')}
              className="mt-4 px-6 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl shadow transition-all"
            >
              Về Trang Chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
