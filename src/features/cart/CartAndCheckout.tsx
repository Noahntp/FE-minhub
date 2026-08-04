import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Building2,
  Check,
  RotateCcw,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';
import { Course, Order, Coupon } from '@/shared/types';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { SYSTEM_COUPONS, INITIAL_COURSES } from '@/shared/data';
import { FALLBACK_COURSES_MAP } from '@/features/courses/hooks/useCourseDetail';
import { toast } from 'sonner';

export function resolveCourseById(id: string, allCourses: Course[] = []): Course {
  if (!id) {
    return {
      id: 'react-zero-hero',
      title: 'React.js From Zero to Hero',
      subtitle: 'Học React.js bài bản từ cơ bản đến nâng cao với Redux Toolkit, React Query & TailwindCSS.',
      price: 1299000,
      salePrice: 909300,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      instructorName: 'Nguyễn Văn A',
      instructorTitle: 'Giảng viên',
      instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      rating: 4.9,
      reviewCount: 1250,
      enrolledCount: 31200,
      category: 'Development',
      level: 'Intermediate',
      status: 'active',
    } as Course;
  }

  let found = allCourses.find((c) => String(c.id) === String(id) || c.slug === id);
  if (found) return found;

  found = INITIAL_COURSES.find((c) => String(c.id) === String(id) || c.slug === id);
  if (found) return found;

  const fallback = FALLBACK_COURSES_MAP[id];
  if (fallback) {
    return {
      id: id,
      title: fallback.title || 'React.js From Zero to Hero',
      subtitle: fallback.subtitle || '',
      description: fallback.description || '',
      category: fallback.category || 'Development',
      subcategory: fallback.subcategory || 'Frontend',
      instructorId: fallback.instructorId || 'inst-1',
      instructorName: fallback.instructorName || 'Nguyễn Văn A',
      instructorTitle: fallback.instructorTitle || 'Giảng viên',
      instructorAvatar: fallback.instructorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      price: fallback.price || 1299000,
      salePrice: fallback.salePrice || 909300,
      rating: fallback.rating || 4.9,
      reviewCount: fallback.reviewCount || 1234,
      enrolledCount: fallback.enrolledCount || 12400,
      image: fallback.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      status: 'active',
    } as Course;
  }

  const readableTitle = id
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    id: id,
    title: `Khóa học ${readableTitle}`,
    subtitle: `Khóa học ${readableTitle} từ cơ bản đến nâng cao`,
    description: `<p>Khóa học ${readableTitle} chất lượng cao tại MindHub.</p>`,
    category: 'Development',
    subcategory: 'General',
    instructorId: 'inst-1',
    instructorName: 'Nguyễn Văn A',
    instructorTitle: 'Giảng viên',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 1299000,
    salePrice: 909300,
    rating: 4.8,
    reviewCount: 850,
    enrolledCount: 3200,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    status: 'active',
  } as Course;
}

interface CartAndCheckoutProps {
  wishlistCourseIds: string[];
  allCourses: Course[];
  enrolledCourseIds: string[];
  onEnrollSuccess: (courseIds: string[], order: Order) => void;
  onClose: () => void;
  onToggleFavorite: (courseId: string) => void;
  onEnterLesson: (course: Course) => void;
  initialCourseId?: string | null;
}

export default function CartAndCheckout({
  wishlistCourseIds,
  allCourses,
  enrolledCourseIds,
  onEnrollSuccess,
  onClose,
  onToggleFavorite,
  onEnterLesson,
  initialCourseId = null,
}: CartAndCheckoutProps) {
  const navigate = useNavigate();

  const effectiveAllCourses = useMemo(() => {
    const map = new Map<string, Course>();
    (allCourses || []).forEach((c) => map.set(String(c.id), c));
    (INITIAL_COURSES || []).forEach((c) => {
      if (!map.has(String(c.id))) map.set(String(c.id), c);
    });
    return Array.from(map.values());
  }, [allCourses]);

  const [checkoutCourse, setCheckoutCourse] = useState<Course>(() => {
    return resolveCourseById(initialCourseId || 'react-zero-hero', effectiveAllCourses);
  });

  useEffect(() => {
    if (initialCourseId) {
      setCheckoutCourse(resolveCourseById(initialCourseId, effectiveAllCourses));
    }
  }, [initialCourseId, effectiveAllCourses]);

  // Buyer Form States
  const [buyerName, setBuyerName] = useState('Nguyễn Văn B');
  const [buyerEmail, setBuyerEmail] = useState('student@example.com');
  const [buyerPhone, setBuyerPhone] = useState('0987654321');
  const [saveInfo, setSaveInfo] = useState(true);

  // Payment Method State: 'momo' | 'bank' | 'card'
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'bank' | 'card'>('momo');

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Flow phase: 'form' | 'success'
  const [phase, setPhase] = useState<'form' | 'success'>('form');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Price calculations
  const originalPrice = (checkoutCourse as any).originalPrice || Math.round(checkoutCourse.price * 1.4);
  const salePrice = checkoutCourse.salePrice || checkoutCourse.price;
  const initialDiscountAmount = originalPrice - salePrice;
  const initialDiscountPercent = Math.round((initialDiscountAmount / originalPrice) * 100);

  const couponDiscountAmount = activeDiscount
    ? Math.round((salePrice * activeDiscount.percent) / 100)
    : 0;

  const finalTotal = salePrice - couponDiscountAmount;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá.');
      return;
    }

    const saved = localStorage.getItem('mindhub_coupons');
    let couponsList: Coupon[] = SYSTEM_COUPONS;
    if (saved) {
      try {
        couponsList = JSON.parse(saved);
      } catch (err) {}
    }

    const matched = couponsList.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (matched) {
      setActiveDiscount({ code: matched.code, percent: matched.discount });
      setCouponSuccess(`Đã áp dụng mã ${matched.code}: Giảm ${matched.discount}%`);
      toast.success(`Đã áp dụng mã ${matched.code}: Giảm ${matched.discount}%`);
    } else {
      setCouponError('Mã giảm giá không chính xác hoặc đã hết hạn.');
      toast.error('Mã giảm giá không chính xác hoặc đã hết hạn.');
    }
  };

  const handleStartPayment = () => {
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin người mua.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const orderId = 'MH-' + Math.floor(100000 + Math.random() * 900000);
      const order: Order = {
        id: orderId,
        date: new Date().toISOString().split('T')[0],
        courses: [
          {
            id: checkoutCourse.id,
            title: checkoutCourse.title,
            price: finalTotal,
          },
        ],
        discountAmount: initialDiscountAmount + couponDiscountAmount,
        total: finalTotal,
        status: 'success',
        paymentMethod:
          paymentMethod === 'momo'
            ? 'Ví MoMo'
            : paymentMethod === 'bank'
            ? 'Thẻ ATM nội địa / Internet Banking'
            : 'Thẻ quốc tế (Visa/Mastercard)',
      };

      setCompletedOrder(order);
      setPhase('success');
      onEnrollSuccess([checkoutCourse.id], order);
      toast.success('Thanh toán và đăng ký khóa học thành công!');
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      
      {/* CENTERED CONTAINER */}
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. BREADCRUMB */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Thanh toán</span>
        </nav>

        {/* 2. PAGE HEADER */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Thanh toán
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Xác nhận thông tin và hoàn tất thanh toán để sở hữu khóa học này.
          </p>
        </div>

        {/* 3. STEP PROGRESS INDICATOR */}
        <div className="flex items-center justify-center max-w-2xl mx-auto py-2">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              1
            </div>
            <span className="text-xs font-bold text-slate-900">Thông tin đơn hàng</span>
          </div>

          <div className="w-16 sm:w-28 h-0.5 bg-slate-200 mx-3" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                phase === 'success'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </div>
            <span
              className={`text-xs font-semibold ${
                phase === 'success' ? 'text-slate-900 font-bold' : 'text-slate-500'
              }`}
            >
              Thanh toán
            </span>
          </div>

          <div className="w-16 sm:w-28 h-0.5 bg-slate-200 mx-3" />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                phase === 'success'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </div>
            <span
              className={`text-xs font-semibold ${
                phase === 'success' ? 'text-emerald-600 font-bold' : 'text-slate-500'
              }`}
            >
              Hoàn tất
            </span>
          </div>
        </div>

        {/* 4. PHASE CONDITION: FORM VS RECEIPT SUCCESS */}
        {phase === 'success' ? (
          /* SUCCESS SCREEN RECEIPT */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                Thanh toán thành công!
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                Cảm ơn bạn đã đăng ký khóa học. Mã đơn hàng của bạn là{' '}
                <span className="font-bold text-slate-900">{completedOrder?.id}</span>.
              </p>
            </div>

            {/* Course Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-left flex items-center gap-4">
              <img
                src={checkoutCourse.image}
                alt={checkoutCourse.title}
                className="w-20 aspect-video rounded-xl object-cover shrink-0 border"
              />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {checkoutCourse.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Giảng viên: {checkoutCourse.instructorName}
                </p>
                <div className="text-xs font-extrabold text-blue-600 mt-1">
                  Đã thanh toán: {formatVND(finalTotal)}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate(`/learn/${checkoutCourse.id}`)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm inline-flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Bắt đầu học ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/my-courses')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-sm transition-colors cursor-pointer"
              >
                Về khóa học của tôi
              </button>
            </div>
          </div>
        ) : (
          /* FORM PHASE: 2-COLUMN MAIN LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: MAIN FORM SECTIONS */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* SECTION 1: KHÓA HỌC */}
              <div className="space-y-3">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  1. Khóa học
                </h2>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Course Thumbnail */}
                    <div className="relative w-36 sm:w-44 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200/60">
                      <img
                        src={checkoutCourse.image}
                        alt={checkoutCourse.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                          <div className="w-0 h-0 border-y-4 border-y-transparent border-l-8 border-l-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="space-y-1.5">
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {checkoutCourse.title}
                      </h3>

                      <div className="flex items-center gap-2">
                        <img
                          src={
                            checkoutCourse.instructorAvatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'
                          }
                          alt={checkoutCourse.instructorName}
                          className="w-5 h-5 rounded-full object-cover border"
                        />
                        <span className="text-xs text-slate-600 font-semibold">
                          {checkoutCourse.instructorName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Giảng viên</span>
                      </div>

                      {/* Metadata badges */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          {checkoutCourse.level || 'Intermediate'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          82 bài học
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          18 giờ 20 phút
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Tag Right */}
                  <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <span className="text-xs text-slate-400 line-through font-medium">
                        {formatVND(originalPrice)}
                      </span>
                      <span className="bg-rose-100 text-rose-600 text-[11px] font-extrabold px-1.5 py-0.5 rounded">
                        -{initialDiscountPercent}%
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                      {formatVND(salePrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: THÔNG TIN NGƯỜI MUA */}
              <div className="space-y-3">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  2. Thông tin người mua
                </h2>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Field 1: Họ và tên */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Họ và tên</label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                        placeholder="Nhập họ tên"
                      />
                    </div>

                    {/* Field 2: Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Email</label>
                      <input
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                        placeholder="Nhập địa chỉ email"
                      />
                    </div>

                    {/* Field 3: Số điện thoại */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Số điện thoại</label>
                      <input
                        type="text"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  {/* Save info checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-600 font-semibold">
                      Lưu thông tin cho lần mua sau
                    </span>
                  </label>
                </div>
              </div>

              {/* SECTION 3: PHƯƠNG THỨC THANH TOÁN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    3. Phương thức thanh toán
                  </h2>
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    Thanh toán được bảo mật và mã hóa
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                  
                  {/* Option 1: Ví MoMo */}
                  <div
                    onClick={() => setPaymentMethod('momo')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      paymentMethod === 'momo'
                        ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'momo' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {paymentMethod === 'momo' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      {/* MoMo Logo Badge */}
                      <div className="w-10 h-10 rounded-xl bg-pink-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                        momo
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Ví điện tử (MoMo)</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Thanh toán nhanh với ví MoMo</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Hoàn tiền trong 7 ngày
                    </span>
                  </div>

                  {/* Option 2: Thẻ ATM nội địa */}
                  <div
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      paymentMethod === 'bank'
                        ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'bank' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {paymentMethod === 'bank' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Thẻ ATM nội địa / Internet Banking</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Hỗ trợ tất cả ngân hàng nội địa</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Hoàn tiền trong 7 ngày
                    </span>
                  </div>

                  {/* Option 3: Thẻ quốc tế Visa/Mastercard */}
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'card' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Thẻ quốc tế (Visa, Mastercard, JCB)</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Thanh toán bằng thẻ quốc tế</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Hoàn tiền trong 7 ngày
                    </span>
                  </div>

                  {/* Footer note */}
                  <div className="pt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Mọi giao dịch đều được bảo mật tuyệt đối theo tiêu chuẩn PCI-DSS.</span>
                  </div>

                </div>
              </div>

              {/* TRUST BADGES ROW (3 COLUMNS BELOW FORM) */}
              <div className="bg-white/80 rounded-2xl border border-slate-200/70 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">Bảo mật tuyệt đối</h5>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      Thông tin của bạn được mã hóa và bảo vệ an toàn
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">Thanh toán an toàn</h5>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      Hỗ trợ bởi các cổng thanh toán uy tín
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">Hoàn tiền dễ dàng</h5>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      Cam kết hoàn tiền trong 7 ngày nếu không hài lòng
                    </p>
                  </div>
                </div>
              </div>

              {/* BOTTOM NAVIGATION ACTIONS */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => navigate('/cart')}
                  className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại giỏ hàng</span>
                </button>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] text-slate-500 font-medium block">Tổng thanh toán:</span>
                    <span className="text-lg font-black text-rose-600">{formatVND(finalTotal)}</span>
                  </div>

                  <button
                    onClick={handleStartPayment}
                    disabled={isProcessing}
                    className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isProcessing ? 'Đang xử lý...' : 'Tiến hành thanh toán'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: SIDEBAR ORDER SUMMARY */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
              
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Đơn hàng của bạn
                  </h3>
                  <button
                    onClick={() => navigate('/cart')}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Sửa giỏ hàng
                  </button>
                </div>

                {/* Selected Item Preview */}
                <div className="flex items-center gap-3">
                  <img
                    src={checkoutCourse.image}
                    alt={checkoutCourse.title}
                    className="w-16 aspect-video rounded-lg object-cover shrink-0 border"
                  />
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">
                      {checkoutCourse.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {checkoutCourse.instructorName}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs font-medium text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span>Giá gốc</span>
                    <span className="font-bold text-slate-900">{formatVND(originalPrice)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Giảm giá (-{initialDiscountPercent}%)</span>
                    <span className="font-bold text-rose-600">-{formatVND(initialDiscountAmount)}</span>
                  </div>

                  {activeDiscount && (
                    <div className="flex items-center justify-between text-emerald-600 font-semibold">
                      <span>Mã giảm giá ({activeDiscount.code})</span>
                      <span>-{formatVND(couponDiscountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Coupon Input Form */}
                <form onSubmit={handleApplyCoupon} className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Áp dụng
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] font-semibold text-rose-600">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] font-semibold text-emerald-600">{couponSuccess}</p>
                  )}
                </form>

                {/* Subtotal & Final Total */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span>Tạm tính</span>
                    <span className="font-bold text-slate-900">{formatVND(finalTotal)}</span>
                  </div>

                  <div className="flex items-start justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block">
                        Tổng thanh toán
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Đã bao gồm VAT (nếu có)
                      </span>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-rose-600">
                      {formatVND(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Green 7-Day Money Back Guarantee Card */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-extrabold text-emerald-900">
                      Cam kết hoàn tiền 7 ngày
                    </h5>
                    <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                      Học không hài lòng? MindHub cam kết hoàn tiền 100% trong vòng 7 ngày.
                    </p>
                  </div>
                </div>

                {/* "Khi bạn mua khóa học, bạn sẽ nhận được:" list */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Khi bạn mua khóa học, bạn sẽ nhận được:
                  </h4>

                  <ul className="space-y-2 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Truy cập trọn đời khóa học</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Học trên mọi thiết bị</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Tài liệu & code thực hành</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Hỗ trợ giảng viên</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Cập nhật nội dung miễn phí</span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
