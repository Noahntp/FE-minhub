import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface VNPayReturnProps {
  onGoToDashboard: () => void;
}

export default function VNPayReturn({ onGoToDashboard }: VNPayReturnProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const processReturn = async () => {
      try {
        // Parse current query params
        const queryParams = new URLSearchParams(window.location.search);
        
        // Ensure this is actually a VNPay return logic
        const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');
        const orderCode = queryParams.get('vnp_TxnRef');
        
        if (!orderCode) {
          throw new Error('Không tìm thấy mã đơn hàng.');
        }

        if (vnp_ResponseCode === '00') {
          // Success
          const payload = {
            orderCode,
            paymentMethod: 'vnpay'
          };
          
          const res = await ApiService.confirmPackagePayment(payload);
          if (isMounted) {
            if (res.success) {
              setOrderInfo(res.order);
              setStatus('success');
            } else {
              throw new Error('Thanh toán thành công nhưng không thể xác nhận đơn hàng.');
            }
          }
        } else {
          // VNPay returned an error
          throw new Error('Thanh toán thất bại hoặc đã bị hủy.');
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Lỗi xử lý kết quả VNPAY.');
          setStatus('error');
        }
      }
    };
    
    // Slight delay for UX
    setTimeout(processReturn, 1000);

    return () => { isMounted = false; };
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-stone-50">
        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang xác minh giao dịch VNPAY...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-stone-50 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giao dịch thất bại</h2>
          <p className="text-gray-600 mb-8">{errorMsg}</p>
          <button
            onClick={onGoToDashboard}
            className="w-full bg-main-normal hover:bg-main-dark text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
          >
            Quay về Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-stone-50 px-4 py-16">
      <div className="bg-white p-10 rounded-3xl shadow-sm max-w-xl w-full border border-emerald-100 text-center animate-fade-in">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Thanh toán VNPAY thành công!</h2>
        <p className="text-lg text-gray-600 mb-8">
          Đơn hàng <strong>{orderInfo?.order_code}</strong> đã được thanh toán. 
          Hệ thống đã cộng <strong>{orderInfo?.package_snapshot_credits} lượt xuất bản khóa học</strong> vào tài khoản của bạn.
        </p>
        
        <button
          onClick={onGoToDashboard}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm w-full sm:w-auto"
        >
          Trở về Dashboard Quản Lý
        </button>
      </div>
    </div>
  );
}
