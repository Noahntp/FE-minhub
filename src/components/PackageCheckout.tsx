import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { CourseCreditPackage, User } from '../types';
import { ShieldCheck, Tag, CreditCard, CheckCircle, Package, ArrowLeft, Loader2, Landmark, Zap, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface PackageCheckoutProps {
  packageId: string;
  currentUser: User;
  onBack: () => void;
  onSuccess: () => void;
}

export default function PackageCheckout({ packageId, currentUser, onBack, onSuccess }: PackageCheckoutProps) {
  const [pkg, setPkg] = useState<CourseCreditPackage | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [phase, setPhase] = useState<'loading' | 'checkout' | 'processing' | 'success' | 'error'>('loading');
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'momo' | 'bank_transfer'>('vnpay');
  const [couponCode, setCouponCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch package and create pending order
  useEffect(() => {
    let isMounted = true;
    const initOrder = async () => {
      try {
        setPhase('loading');
        // Retrieve package info
        const packageData = await ApiService.getPackageById(packageId);
        if (!isMounted) return;
        setPkg(packageData);

        // Create pending order
        const orderResponse = await ApiService.createPackageOrder({
          userId: currentUser.id,
          packageId: packageData.id
        });
        
        if (orderResponse.success) {
          setOrder(orderResponse.order);
          setPhase('checkout');
        } else {
          throw new Error('Không thể tạo đơn hàng.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMsg(err.message || 'Lỗi khởi tạo thanh toán.');
        setPhase('error');
      }
    };
    initOrder();
    return () => { isMounted = false; };
  }, [packageId, currentUser.id]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    // For MVP prototype: We don't implement full coupon logic here yet, 
    // but in a real app, you'd call a Backend API to re-calculate order amount.
    setErrorMsg('Mã giảm giá không khả dụng cho giao dịch mua gói lượt.');
  };

  const handleConfirmPayment = async () => {
    if (!order) return;
    try {
      setPhase('processing');
      // MOCK DELAY for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (paymentMethod === 'vnpay') {
        const { paymentUrl } = await ApiService.createVNPayGatewayUrl(order.order_code);
        window.location.href = paymentUrl;
        return; // Halt execution while page redirects
      }

      // Fallback/Mock for other methods like momo or bank_transfer
      const res = await ApiService.confirmPackagePayment({
        orderCode: order.order_code,
        paymentMethod
      });

      if (res.success) {
        setPhase('success');
      } else {
        throw new Error('Thanh toán thất bại từ cổng thanh toán.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi xác nhận thanh toán.');
      setPhase('error');
    }
  };

  if (phase === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang khởi tạo đơn hàng an toàn...</p>
      </div>
    );
  }

  if (phase === 'success') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Thanh toán thành công!</h2>
        <p className="text-lg text-gray-600 mb-8">
          Bạn đã mua thành công <strong>{pkg?.name}</strong>. Hệ thống đã cộng <strong>{pkg?.credits} lượt xuất bản khóa học</strong> vào tài khoản của bạn.
        </p>
        
        <div className="bg-gray-50 rounded-2xl p-6 text-left max-w-sm mx-auto mb-8 border border-gray-100">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Mã đơn hàng:</span>
            <span className="font-semibold text-gray-900">{order?.order_code}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Số tiền:</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(order?.amount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phương thức:</span>
            <span className="font-semibold text-gray-900 uppercase">{paymentMethod}</span>
          </div>
        </div>

        <button
          onClick={onSuccess}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
        >
          Trở về Dashboard Quản Lý
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="h-5 w-5" /> Trở về chi tiết gói
      </button>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Thanh toán an toàn</h1>

      {phase === 'error' && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button 
            onClick={() => setPhase('checkout')}
            className="text-sm font-bold bg-white text-red-600 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Col - Payment Methods & User Info */}
        <div className="flex-1 space-y-8">
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              Thông tin người mua
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 font-medium">{currentUser.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email tài khoản</label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 font-medium">{currentUser.email}</div>
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 font-bold uppercase text-sm inline-block">
                  {currentUser.role}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              Phương thức thanh toán
            </h2>
            <div className="space-y-4">
              <label 
                className={`relative flex items-center p-4 cursor-pointer rounded-2xl border-2 transition-all ${
                  paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input type="radio" name="payment" className="sr-only" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} />
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 mr-4">
                  <Landmark className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">VNPAY</h3>
                  <p className="text-sm text-gray-500">Thanh toán qua mã QR, thẻ nội địa hoặc thẻ quốc tế</p>
                </div>
                {paymentMethod === 'vnpay' && <CheckCircle className="absolute right-4 w-6 h-6 text-blue-500" />}
              </label>

              <label 
                className={`relative flex items-center p-4 cursor-pointer rounded-2xl border-2 transition-all ${
                  paymentMethod === 'momo' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input type="radio" name="payment" className="sr-only" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} />
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 mr-4">
                  <span className="font-black text-pink-600 text-xl">M</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Ví MoMo</h3>
                  <p className="text-sm text-gray-500">Thanh toán nhanh chóng qua ví điện tử MoMo</p>
                </div>
                {paymentMethod === 'momo' && <CheckCircle className="absolute right-4 w-6 h-6 text-pink-500" />}
              </label>
              
              <label 
                className={`relative flex items-center p-4 cursor-pointer rounded-2xl border-2 transition-all ${
                  paymentMethod === 'bank_transfer' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input type="radio" name="payment" className="sr-only" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 mr-4">
                  <Landmark className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Chuyển khoản Ngân hàng</h3>
                  <p className="text-sm text-gray-500">Chuyển khoản thủ công 24/7</p>
                </div>
                {paymentMethod === 'bank_transfer' && <CheckCircle className="absolute right-4 w-6 h-6 text-emerald-500" />}
              </label>
            </div>
          </section>
        </div>

        {/* Right Col - Summary */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Tóm tắt đơn hàng</h2>
            
            {/* Package Item */}
            <div className="flex gap-4 mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight mb-1">{pkg?.name}</h3>
                <div className="text-sm text-emerald-600 font-medium inline-flex items-center gap-1">
                  <Zap className="w-3 h-3" /> +{pkg?.credits} Lượt xuất bản
                </div>
              </div>
            </div>

            {/* Coupon (Mock UI) */}
            <form onSubmit={handleApplyCoupon} className="mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    placeholder="Mã giảm giá"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={phase === 'processing'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!couponCode.trim() || phase === 'processing'}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors whitespace-nowrap text-sm"
                >
                  Áp dụng
                </button>
              </div>
            </form>

            <div className="space-y-4 text-sm mb-6 border-b border-dashed border-gray-200 pb-6">
              <div className="flex justify-between text-gray-600">
                <span>Mã đơn (MOCK):</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{order?.order_code}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{formatCurrency(pkg?.price || 0)}</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
              <span className="text-3xl font-extrabold text-emerald-600">
                {formatCurrency(order?.amount || pkg?.price || 0)}
              </span>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={phase === 'processing'}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-2"
            >
              {phase === 'processing' ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" /> Đang xử lý...
                </>
              ) : (
                'Hoàn tất thanh toán'
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed">
              Bằng việc hoàn tất thanh toán, bạn đồng ý với <a href="#" className="text-emerald-600 hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-emerald-600 hover:underline">Chính sách bảo mật</a> của MindHub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
