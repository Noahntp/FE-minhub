import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Sparkles,
  PlayCircle,
  BookOpen,
  Award,
  Loader2,
} from 'lucide-react';
import { Course, Order, Coupon } from '@/shared/types';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { SYSTEM_COUPONS, INITIAL_COURSES } from '@/shared/data';
import { FALLBACK_COURSES_MAP } from '@/features/courses/hooks/useCourseDetail';
import { toast } from 'sonner';
import { apiFetch } from '@/shared/lib/api-client';
import { useApp } from '@/app/AppContext';

export function resolveImageUrl(url?: string): string {
  if (!url) return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `http://127.0.0.1:8000${url}`;
  return `http://127.0.0.1:8000/${url}`;
}

export function resolveCourseById(id: string, allCourses: Course[] = []): Course {
  if (!id) {
    return {
      id: 'react-zero-hero',
      title: 'React.js From Zero to Hero',
      subtitle: 'Học React.js bài bản từ cơ bản đến nâng cao với Redux Toolkit, React Query & TailwindCSS.',
      price: 1299000,
      salePrice: 909300,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      instructorName: 'Dr. Lê Quốc Khánh',
      instructorTitle: 'Cựu Kỹ sư Google Brain',
      instructorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80',
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

  const isNumeric = /^\d+$/.test(id);
  const readableTitle = isNumeric
    ? `Lập Trình Web Real-Time & Restful API`
    : id.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    id: id,
    title: readableTitle,
    subtitle: `${readableTitle} từ cơ bản đến nâng cao`,
    description: `<p>${readableTitle} chất lượng cao tại MindHub.</p>`,
    category: 'Development',
    subcategory: 'Fullstack',
    instructorId: 'inst-1',
    instructorName: 'Dr. Lê Quốc Khánh',
    instructorTitle: 'Senior Instructor',
    instructorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80',
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
  const location = useLocation();

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

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [initialCourseId]);

  useEffect(() => {
    if (initialCourseId) {
      setCheckoutCourse(resolveCourseById(initialCourseId, effectiveAllCourses));

      // Fetch dynamic course data from Backend API
      apiFetch<any>(`/courses/${initialCourseId}`)
        .then((res) => {
          const item = res?.data || res;
          if (item && (item.id || item.title)) {
            const rawPrice = Number(item.price || 0);
            const rawSalePrice = item.sale_price !== null && item.sale_price !== undefined ? Number(item.sale_price) : undefined;
            const finalPrice = rawSalePrice !== undefined && rawSalePrice < rawPrice ? rawSalePrice : rawPrice;
            const originalPrice = rawSalePrice !== undefined && rawSalePrice < rawPrice ? rawPrice : undefined;

            setCheckoutCourse({
              id: String(item.id || initialCourseId),
              title: item.title || 'Khóa học',
              subtitle: item.short_description || 'Khóa học chất lượng cao tại MindHub',
              description: item.description || '',
              price: finalPrice,
              salePrice: originalPrice ? finalPrice : undefined,
              originalPrice: originalPrice,
              image: item.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
              instructorName: item.instructor?.full_name || 'Giảng viên MindHub',
              instructorTitle: item.instructor?.expertise || 'Senior Instructor tại MindHub',
              instructorAvatar: item.instructor?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
              rating: Number(item.average_rating || 4.8),
              reviewCount: Number(item.reviews_count || 120),
              enrolledCount: Number(item.enrollments_count || 1250),
              category: 'Development',
              level: 'Intermediate',
              status: 'active',
            } as any);
          }
        })
        .catch(() => {});
    }
  }, [initialCourseId, effectiveAllCourses]);

  const { currentUser, isLoggedIn } = useApp();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // If user already owns this course, automatically redirect to course detail page
  useEffect(() => {
    if (!initialCourseId) return;

    const storedIds: string[] = JSON.parse(localStorage.getItem('mindhub_enrolled_courses') || '[]');
    const isLocalEnrolled = storedIds.some((id) => String(id) === String(initialCourseId));

    if (isLocalEnrolled) {
      toast.info('Bạn đã đăng ký khóa học này rồi. Đang chuyển tới trang chi tiết khóa học...');
      navigate(`/courses/${initialCourseId}`, { replace: true });
      return;
    }

    if (currentUser) {
      apiFetch<any>('/orders/my')
        .then((res) => {
          const myOrders = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          const alreadyPaid = myOrders.some(
            (o: any) =>
              (String(o.course_id) === String(initialCourseId) || String(o.course?.id) === String(initialCourseId)) &&
              (o.status === 'paid' || o.payment_status === 'paid')
          );
          if (alreadyPaid) {
            toast.info('Bạn đã sở hữu khóa học này rồi. Đang chuyển tới trang chi tiết khóa học...');
            navigate(`/courses/${initialCourseId}`, { replace: true });
          }
        })
        .catch(() => {});
    }
  }, [initialCourseId, currentUser, navigate]);

  // Buyer Form States initialized from logged-in user
  const [buyerName, setBuyerName] = useState(() => currentUser?.full_name || currentUser?.name || '');
  const [buyerEmail, setBuyerEmail] = useState(() => currentUser?.email || '');
  const [buyerPhone, setBuyerPhone] = useState(() => currentUser?.phone || (currentUser as any)?.phone_number || '');
  const [saveInfo, setSaveInfo] = useState(true);

  // Form error state & refs for auto-scroll + focus
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  // Strict Field Validator for Real-Time & Submit Checks
  const validateField = (field: 'name' | 'email' | 'phone', value: string): string | undefined => {
    let error: string | undefined = undefined;
    const val = (value || '').trim();

    if (field === 'name') {
      if (!val) {
        error = 'Vui lòng nhập họ và tên.';
      } else if (val.length < 2) {
        error = 'Họ và tên phải có ít nhất 2 ký tự.';
      } else if (/\d/.test(val)) {
        error = 'Họ và tên không được chứa chữ số.';
      } else if (!/^[\p{L}\s'-]+$/u.test(val)) {
        error = 'Họ và tên chỉ được chứa chữ cái (tiếng Việt/tiếng Anh).';
      }
    } else if (field === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!val) {
        error = 'Vui lòng nhập địa chỉ email.';
      } else if (!emailRegex.test(val)) {
        error = 'Địa chỉ email không đúng định dạng (Ví dụ: name@example.com).';
      }
    } else if (field === 'phone') {
      const cleanPhone = val.replace(/\s+/g, '');
      const vnPhoneRegex = /^(0|\+84)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
      if (!cleanPhone) {
        error = 'Vui lòng nhập số điện thoại liên hệ.';
      } else if (cleanPhone.length < 10) {
        error = 'Số điện thoại phải có đúng 10 chữ số.';
      } else if (!vnPhoneRegex.test(cleanPhone)) {
        error = 'Số điện thoại không hợp lệ (Phải là đầu số VN: 03, 05, 07, 08, 09).';
      }
    }

    setFormErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  // Fetch fresh logged in user profile from API /api/users/me
  useEffect(() => {
    if (currentUser) {
      if (currentUser.full_name || currentUser.name) setBuyerName(currentUser.full_name || currentUser.name);
      if (currentUser.email) setBuyerEmail(currentUser.email);
      if (currentUser.phone || (currentUser as any)?.phone_number) {
        setBuyerPhone(currentUser.phone || (currentUser as any)?.phone_number);
      }
    }

    apiFetch<any>('/users/me')
      .then((res) => {
        const u = res?.data || res;
        if (u && (u.id || u.email)) {
          if (u.full_name || u.name) setBuyerName(u.full_name || u.name);
          if (u.email) setBuyerEmail(u.email);
          if (u.phone || u.phone_number) setBuyerPhone(u.phone || u.phone_number);
        }
      })
      .catch(() => {
        apiFetch<any>('/account/profile')
          .then((res) => {
            const u = res?.data || res;
            if (u && (u.id || u.email)) {
              if (u.full_name || u.name) setBuyerName(u.full_name || u.name);
              if (u.email) setBuyerEmail(u.email);
              if (u.phone || u.phone_number) setBuyerPhone(u.phone || u.phone_number);
            }
          })
          .catch(() => {});
      });
  }, [currentUser]);

  // Payment Method State: 'sepay' | 'vnpay' (Thanh toán tự động qua VietQR hoặc Cổng VNPAY)
  const [paymentMethod, setPaymentMethod] = useState<'sepay' | 'vnpay'>('sepay');

  // SePay VietQR Modal States
  const [sepayData, setSepayData] = useState<{
    order_id: number;
    order_code: string;
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    transfer_content: string;
    qr_url: string;
  } | null>(null);
  // Flow phase: 'form' (Bước 1) | 'payment_pending' (Bước 2: Chờ chuyển khoản) | 'success' (Bước 3: Hoàn tất)
  const [phase, setPhase] = useState<'form' | 'payment_pending' | 'success'>('form');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Restore pending order on mount if student already created an order
  useEffect(() => {
    const restorePendingOrder = async () => {
      try {
        const storedStr = localStorage.getItem('mindhub_pending_order');
        if (!storedStr) return;
        const stored = JSON.parse(storedStr);
        if (!stored?.order_id) return;

        const res = await apiFetch<any>(`/orders/${stored.order_id}`);
        const orderData = res?.data || res;
        if (!orderData) return;

        if (orderData.status === 'paid' || orderData.payment_status === 'paid') {
          localStorage.removeItem('mindhub_pending_order');
          const order: Order = {
            id: String(orderData.order_code || stored.order_code || orderData.id),
            date: new Date().toISOString().split('T')[0],
            courses: [{ id: checkoutCourse.id, title: checkoutCourse.title, price: finalTotal }],
            discountAmount: initialDiscountAmount,
            total: finalTotal,
            status: 'success',
            paymentMethod: 'Chuyển khoản VietQR (MB Bank)',
          };
          saveCourseToEnrolledList(checkoutCourse);
          setCompletedOrder(order);
          setPhase('success');
          onEnrollSuccess([checkoutCourse.id], order);
        } else if (orderData.status === 'pending_payment') {
          setSepayData(stored.sepay_data || stored);
          setPhase('payment_pending');
        } else {
          localStorage.removeItem('mindhub_pending_order');
        }
      } catch (err) {
        console.warn('Cannot check pending order:', err);
      }
    };

    restorePendingOrder();
  }, [checkoutCourse.id]);

  // Price calculations
  const rawOriginalPrice = (checkoutCourse as any).originalPrice;
  const salePrice = checkoutCourse.salePrice || checkoutCourse.price;
  const hasCourseDiscount = Boolean(rawOriginalPrice && rawOriginalPrice > salePrice);
  const originalPrice = hasCourseDiscount ? rawOriginalPrice : salePrice;
  const initialDiscountAmount = hasCourseDiscount ? originalPrice - salePrice : 0;
  const initialDiscountPercent = hasCourseDiscount && originalPrice > 0 ? Math.round((initialDiscountAmount / originalPrice) * 100) : 0;

  const finalTotal = salePrice;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const [isCheckingSepay, setIsCheckingSepay] = useState(false);

  // Auto-polling order status while waiting for payment
  useEffect(() => {
    if (phase !== 'payment_pending' || !sepayData?.order_id) return;

    let isPolling = true;

    const pollOrder = async () => {
      if (!isPolling) return;
      try {
        const res = await apiFetch<any>(`/orders/${sepayData.order_id}`);
        const orderData = res?.data || res;
        if (orderData && (orderData.status === 'paid' || orderData.payment_status === 'paid')) {
          isPolling = false;
          clearInterval(intervalId);
          localStorage.removeItem('mindhub_pending_order');

          const order: Order = {
            id: String(orderData.order_code || sepayData.transfer_content || sepayData.order_id),
            date: new Date().toISOString().split('T')[0],
            courses: [
              {
                id: checkoutCourse.id,
                title: checkoutCourse.title,
                price: finalTotal,
              },
            ],
            discountAmount: initialDiscountAmount,
            total: finalTotal,
            status: 'success',
            paymentMethod: 'Chuyển khoản VietQR (MB Bank)',
          };

          saveCourseToEnrolledList(checkoutCourse);
          setCompletedOrder(order);
          setPhase('success');
          onEnrollSuccess([checkoutCourse.id], order);
          toast.success('🎉 Đã nhận được chuyển khoản! Kích hoạt khóa học thành công.');
        }
      } catch (err) {
        // Polling failure silently ignored
      }
    };

    pollOrder();
    const intervalId = setInterval(pollOrder, 1200);

    return () => {
      isPolling = false;
      clearInterval(intervalId);
    };
  }, [phase, sepayData, checkoutCourse, finalTotal, initialDiscountAmount, onEnrollSuccess]);

  const handleManualCheckPayment = async () => {
    if (!sepayData || isCheckingSepay) return;
    setIsCheckingSepay(true);

    try {
      const res = await apiFetch<any>(`/orders/${sepayData.order_id}`);
      const orderData = res?.data || res;
      if (orderData && (orderData.status === 'paid' || orderData.payment_status === 'paid')) {
        localStorage.removeItem('mindhub_pending_order');

        const order: Order = {
          id: String(orderData.order_code || sepayData.transfer_content || sepayData.order_id),
          date: new Date().toISOString().split('T')[0],
          courses: [
            {
              id: checkoutCourse.id,
              title: checkoutCourse.title,
              price: finalTotal,
            },
          ],
          discountAmount: initialDiscountAmount,
          total: finalTotal,
          status: 'success',
          paymentMethod: 'Chuyển khoản VietQR (MB Bank)',
        };

        saveCourseToEnrolledList(checkoutCourse);
        setCompletedOrder(order);
        setPhase('success');
        onEnrollSuccess([checkoutCourse.id], order);
        toast.success('🎉 Đã xác nhận giao dịch chuyển khoản thành công! Bắt đầu học ngay.');
      } else {
        toast.info('Hệ thống chưa nhận được biến động số dư từ ngân hàng. Nếu bạn vừa chuyển tiền, vui lòng đợi thêm vài giây để hệ thống tự động đồng bộ.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể kiểm tra trạng thái đơn hàng lúc này.');
    } finally {
      setIsCheckingSepay(false);
    }
  };

  const handleCancelPendingOrder = async () => {
    if (!sepayData?.order_id) {
      setPhase('form');
      localStorage.removeItem('mindhub_pending_order');
      return;
    }
    const confirmed = window.confirm('Bạn có chắc muốn hủy đơn hàng này để chọn phương thức thanh toán hoặc khóa học khác?');
    if (!confirmed) return;

    try {
      await apiFetch<any>(`/orders/${sepayData.order_id}/cancel`, { method: 'PATCH' });
      toast.info('Đã hủy đơn hàng chờ thanh toán.');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('mindhub_pending_order');
      setSepayData(null);
      setPhase('form');
    }
  };

  const saveCourseToEnrolledList = (courseItem: any) => {
    try {
      const courseId = String(courseItem.id);
      const storedIds = JSON.parse(localStorage.getItem('mindhub_enrolled_courses') || '[]');
      const updatedIds = Array.from(new Set([...storedIds, courseId]));
      localStorage.setItem('mindhub_enrolled_courses', JSON.stringify(updatedIds));

      const storedCourses = JSON.parse(localStorage.getItem('mindhub_purchased_courses_data') || '[]');
      const exists = storedCourses.some((c: any) => String(c.id) === courseId);
      if (!exists) {
        const courseObj = {
          id: courseId,
          title: courseItem.title || 'Khóa học đã đăng ký',
          category: courseItem.category || 'Lập trình',
          status: 'learning',
          badgeText: 'Đang học',
          badgeType: 'learning',
          instructorName: courseItem.instructorName || courseItem.instructor?.full_name || 'Giảng viên MindHub',
          instructorAvatar: courseItem.instructorAvatar || courseItem.instructor?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
          thumbnail: courseItem.thumbnail || courseItem.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
          progress: 0,
          lessonsCount: 40,
          duration: '12h 30m',
          buttonText: 'Tiếp tục học',
          buttonBg: 'bg-[#0f172a] text-white hover:bg-slate-800',
          hasPlayIcon: true,
        };
        storedCourses.unshift(courseObj);
        localStorage.setItem('mindhub_purchased_courses_data', JSON.stringify(storedCourses));
      }

      // Dispatch purchase notification for Navbar bell icon & Notifications page
      const notifItem = {
        id: 'notif-purchase-' + (courseItem.id || Date.now()),
        type: 'payment',
        category: 'course',
        title: '🎉 Thanh toán & Đăng ký thành công',
        message: `Chào mừng bạn đến với khóa học "${courseItem.title || 'Khóa học đã đăng ký'}". Chúng tôi đã mở khóa toàn bộ bài học và gửi email hướng dẫn cho bạn.`,
        time_ago: 'Vừa xong',
        created_at: new Date().toISOString(),
        is_read: false,
        read_at: null,
        action_url: `/learn/${courseItem.id}`
      };

      const storedNotifs = JSON.parse(localStorage.getItem('mindhub_user_notifications') || '[]');
      const notifExists = storedNotifs.some((n: any) => n.id === notifItem.id);
      if (!notifExists) {
        storedNotifs.unshift(notifItem);
        localStorage.setItem('mindhub_user_notifications', JSON.stringify(storedNotifs));
        window.dispatchEvent(new CustomEvent('mindhub_notification_updated', { detail: notifItem }));
      }
    } catch (e) {
      console.warn('Failed to save purchased course locally:', e);
    }
  };

  const handleStartPayment = async () => {
    if (isProcessing) return;

    if (!isLoggedIn || !currentUser) {
      toast.error('Vui lòng đăng nhập để tiến hành thanh toán.');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    const nameErr = validateField('name', buyerName);
    const emailErr = validateField('email', buyerEmail);
    const phoneErr = validateField('phone', buyerPhone);

    if (nameErr || emailErr || phoneErr) {
      // Auto-scroll and focus to the first invalid input
      if (nameErr && nameInputRef.current) {
        nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameInputRef.current.focus();
      } else if (emailErr && emailInputRef.current) {
        emailInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        emailInputRef.current.focus();
      } else if (phoneErr && phoneInputRef.current) {
        phoneInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneInputRef.current.focus();
      }

      toast.error('Vui lòng kiểm tra và điền chính xác thông tin người mua.');
      return;
    }

    setFormErrors({});
    setIsProcessing(true);

    try {
      const numericCourseId = Number(checkoutCourse.id) || 1;

      // 1. Post /api/orders
      const orderRes = await apiFetch<any>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          course_id: numericCourseId,
        }),
      });

      const createdOrder = orderRes?.data || orderRes;
      const orderId = createdOrder?.id;

      if (!orderId) {
        throw new Error(orderRes?.message || 'Không thể tạo đơn hàng');
      }

      if (paymentMethod === 'sepay') {
        // 2. SePay VietQR payment info
        const sepayRes = await apiFetch<any>('/payments/sepay/create', {
          method: 'POST',
          body: JSON.stringify({
            order_id: Number(orderId),
            payment_method: 'sepay',
          }),
        });

        const sData = sepayRes?.data || sepayRes;
        setSepayData(sData);
        localStorage.setItem('mindhub_pending_order', JSON.stringify({
          order_id: Number(orderId),
          order_code: sData.order_code || createdOrder?.order_code,
          sepay_data: sData,
          course_id: checkoutCourse.id,
        }));
        setPhase('payment_pending');
        toast.success('Đã tạo đơn hàng! Vui lòng quét mã VietQR để thanh toán.');
        return;
      }

      if (paymentMethod === 'vnpay') {
        // 2. Post /api/payments/vnpay/create
        const vnpayRes = await apiFetch<any>('/payments/vnpay/create', {
          method: 'POST',
          body: JSON.stringify({
            order_id: Number(orderId),
            payment_method: 'vnpay',
          }),
        });

        const paymentUrl = vnpayRes?.data?.payment_url || vnpayRes?.payment_url;

        if (paymentUrl) {
          toast.success('Tạo đơn hàng thành công! Đang chuyển hướng tới cổng thanh toán VNPAY...');
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 600);
          return;
        }
      }
    } catch (err: any) {
      console.error('Payment API error:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng đăng nhập và thử lại.');
    } finally {
      setIsProcessing(false);
    }
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
          <Link to="/courses" className="hover:text-primary transition-colors">
            Khóa học
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">
            {phase === 'payment_pending' ? 'Chờ thanh toán' : phase === 'success' ? 'Hoàn tất' : 'Thanh toán'}
          </span>
        </nav>

        {/* 2. PAGE HEADER */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {phase === 'payment_pending' ? 'Chờ thanh toán đơn hàng' : phase === 'success' ? 'Đăng ký thành công' : 'Thanh toán'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {phase === 'payment_pending'
              ? 'Quét mã VietQR chuyển khoản bằng App Ngân hàng bất kỳ để kích hoạt khóa học tự động.'
              : phase === 'success'
              ? 'Khóa học đã được thêm vào tài khoản của bạn. Chúc bạn học tập hiệu quả!'
              : 'Xác nhận thông tin và hoàn tất thanh toán để sở hữu khóa học này.'}
          </p>
        </div>

        {/* 3. STEP PROGRESS INDICATOR */}
        <div className="flex items-center justify-center max-w-2xl mx-auto py-2">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shadow-sm ${
                phase !== 'form' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
              }`}
            >
              {phase !== 'form' ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <span
              className={`text-xs font-bold ${
                phase !== 'form' ? 'text-emerald-700' : 'text-slate-900'
              }`}
            >
              Thông tin đơn hàng
            </span>
          </div>

          <div
            className={`w-16 sm:w-28 h-0.5 mx-3 transition-colors ${
              phase !== 'form' ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
          />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                phase === 'payment_pending'
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                  : phase === 'success'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {phase === 'success' ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <span
              className={`text-xs font-semibold ${
                phase === 'payment_pending'
                  ? 'text-blue-600 font-bold'
                  : phase === 'success'
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500'
              }`}
            >
              {phase === 'payment_pending' ? 'Chờ thanh toán' : 'Thanh toán'}
            </span>
          </div>

          <div
            className={`w-16 sm:w-28 h-0.5 mx-3 transition-colors ${
              phase === 'success' ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
          />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                phase === 'success'
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {phase === 'success' ? <Check className="w-3.5 h-3.5" /> : '3'}
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
          /* PREMIUM SUCCESS RECEIPT SCREEN */
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Top Celebratory Card */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden text-center space-y-5 border border-emerald-700/50">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Glowing Icon */}
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg relative border-4 border-emerald-400/40">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-200 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  Đăng ký thành công & Đã sẵn sàng vào học!
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Thanh toán hoàn tất!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg mx-auto font-medium leading-relaxed">
                  Cảm ơn bạn đã tin tưởng lựa chọn MindHub. Khóa học đã được kích hoạt trọn đời trong tài khoản của bạn.
                </p>
              </div>

              {/* Order Ref Pill */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-50 font-semibold">
                  <span>Mã đơn hàng: <strong className="text-white font-mono text-xs">{completedOrder?.id}</strong></span>
                  <button
                    onClick={() => {
                      if (completedOrder?.id) {
                        navigator.clipboard.writeText(completedOrder.id);
                        toast.success('Đã sao chép mã đơn hàng!');
                      }
                    }}
                    className="hover:text-emerald-300 transition-colors cursor-pointer underline text-[11px]"
                  >
                    Sao chép
                  </button>
                </div>
              </div>
            </div>

            {/* Receipt Details & Course Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Chi tiết đơn hàng đã mua
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  {completedOrder?.date || new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Course Detail Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200 shadow-sm">
                    <img
                      src={resolveImageUrl(checkoutCourse.image)}
                      alt={checkoutCourse.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center">
                        <div className="w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-extrabold">
                      Khóa học đã sở hữu
                    </span>
                    <h4 className="text-sm font-black text-slate-900 line-clamp-2">
                      {checkoutCourse.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Giảng viên: <span className="font-bold text-slate-800">{checkoutCourse.instructorName}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 w-full sm:w-auto">
                  <span className="text-[11px] font-semibold text-slate-400 block">Đã thanh toán</span>
                  <span className="text-lg font-black text-emerald-600">{formatVND(finalTotal)}</span>
                </div>
              </div>

              {/* Payment Summary breakdown */}
              <div className="space-y-2 text-xs border-b border-slate-100 pb-4">
                {hasCourseDiscount ? (
                  <>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Giá niêm yết:</span>
                      <span className="font-bold text-slate-700 line-through opacity-70">{formatVND(originalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Giảm giá khóa học (-{initialDiscountPercent}%):</span>
                      <span className="font-bold text-rose-600">-{formatVND(initialDiscountAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Giá khóa học:</span>
                    <span className="font-bold text-slate-700">{formatVND(salePrice)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Phương thức thanh toán:</span>
                  <span className="font-bold text-slate-900">
                    {completedOrder?.paymentMethod || (paymentMethod === 'sepay' ? 'Chuyển khoản VietQR (SePay)' : 'VNPAY Gateway')}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                  <span>Tổng tiền đã thu:</span>
                  <span className="text-emerald-600 font-black">{formatVND(finalTotal)}</span>
                </div>
              </div>

              {/* Next Steps / Privileges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Truy cập trọn đời</h5>
                    <p className="text-[11px] text-slate-500 font-medium">Học lại bất kỳ lúc nào</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
                  <Award className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Chứng chỉ uy tín</h5>
                    <p className="text-[11px] text-slate-500 font-medium">Cấp khi hoàn thành</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Hỗ trợ 24/7</h5>
                    <p className="text-[11px] text-slate-500 font-medium">Giải đáp thắc mắc bài học</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate(`/learn/${checkoutCourse.id}`)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm inline-flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Vào Học Ngay Bây Giờ</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => navigate('/my-courses')}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-slate-600" />
                  <span>Khóa học của tôi</span>
                </button>
              </div>

            </div>

          </div>
        ) : phase === 'payment_pending' && sepayData ? (
          /* STEP 2: CHỜ THANH TOÁN (VIETQR) */
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Status Header Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Đang chờ thanh toán chuyển khoản
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Đơn hàng #{sepayData.order_code || sepayData.order_id}
                </h2>
                <p className="text-xs sm:text-sm text-amber-100 font-medium">
                  Vui lòng quét mã VietQR bằng App Ngân hàng bất kỳ để hoàn tất thanh toán.
                </p>
              </div>

              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shrink-0 min-w-[170px]">
                <span className="text-[11px] font-semibold text-amber-100 uppercase tracking-wider block">
                  Tổng tiền thanh toán
                </span>
                <span className="text-2xl font-black text-white">
                  {formatVND(sepayData.amount)}
                </span>
              </div>
            </div>

            {/* 2 Columns: VietQR Details (Left) + Course Summary (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: VietQR & Banking Details (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                      VietQR
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Chuyển khoản VietQR tự động
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Hỗ trợ tất cả ứng dụng ngân hàng & ví điện tử
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code & Transfer Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                  {/* QR Image */}
                  <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <img
                      src={sepayData.qr_url}
                      alt="VietQR Code"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallbackUrl = `https://img.vietqr.io/image/MB-${sepayData.account_number}-compact2.png?amount=${sepayData.amount}&addInfo=${encodeURIComponent(sepayData.transfer_content)}&accountName=${encodeURIComponent(sepayData.account_name)}`;
                        if (target.src !== fallbackUrl) {
                          target.src = fallbackUrl;
                        }
                      }}
                      className="w-48 aspect-square object-contain rounded-xl bg-white p-2 shadow-sm border border-slate-200"
                    />
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Tự động kích hoạt sau 1-3 giây
                    </span>
                  </div>

                  {/* Transfer Details with Quick Copy */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">Ngân hàng:</span>
                      <span className="font-extrabold text-slate-900">{sepayData.bank_name}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">Số tài khoản:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-black text-blue-600 text-sm tracking-wide">{sepayData.account_number}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(sepayData.account_number);
                            toast.success('Đã sao chép số tài khoản!');
                          }}
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">Chủ tài khoản:</span>
                      <span className="font-bold text-slate-900">{sepayData.account_name}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">Số tiền thanh toán:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-black text-emerald-600 text-sm">{formatVND(sepayData.amount)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(String(Math.round(sepayData.amount)));
                            toast.success('Đã sao chép số tiền!');
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[11px]">Nội dung chuyển khoản (bắt buộc):</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-black text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 text-xs tracking-wider font-mono">
                          {sepayData.transfer_content}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(sepayData.transfer_content);
                            toast.success('Đã sao chép nội dung chuyển khoản!');
                          }}
                          className="px-2 py-1 rounded bg-rose-100 text-rose-700 text-[10px] font-bold hover:bg-rose-200 transition-colors cursor-pointer"
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicator & Action Buttons */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-center gap-2.5 p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                    </span>
                    <span>Hệ thống đang tự động lắng nghe biến động số dư từ ngân hàng...</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleManualCheckPayment}
                      disabled={isCheckingSepay}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isCheckingSepay ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang kiểm tra giao dịch...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>Tôi đã chuyển khoản, kiểm tra ngay</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelPendingOrder}
                      className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Hủy đơn / Chọn phương thức khác</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary Sidebar (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                    Khóa học đang đăng ký
                  </h3>
                  <div className="flex gap-3 items-center">
                    <img
                      src={resolveImageUrl(checkoutCourse.image)}
                      alt={checkoutCourse.title}
                      className="w-20 h-14 object-cover rounded-xl border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {checkoutCourse.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {checkoutCourse.instructorName || 'Giảng viên MindHub'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Giá khóa học:</span>
                      <span className="font-semibold">{formatVND(originalPrice)}</span>
                    </div>
                    {initialDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Giảm giá:</span>
                        <span className="font-semibold">-{formatVND(initialDiscountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-slate-100 pt-2">
                      <span>Tổng thanh toán:</span>
                      <span className="text-blue-600 font-black">{formatVND(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Support Note */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Cần hỗ trợ thanh toán?
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Nếu bạn đã chuyển tiền nhưng quá 1 phút chưa thấy kích hoạt khóa học, vui lòng chụp màn hình biên lai và liên hệ Hotline: <strong className="text-slate-800">1900 8888</strong>.
                  </p>
                </div>
              </div>

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

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Course Thumbnail */}
                    <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200/60">
                      <img
                        src={resolveImageUrl(checkoutCourse.image)}
                        alt={checkoutCourse.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80';
                        }}
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
                    {hasCourseDiscount && (
                      <div className="flex items-center sm:justify-end gap-1.5">
                        <span className="text-xs text-slate-400 line-through font-medium">
                          {formatVND(originalPrice)}
                        </span>
                        <span className="bg-rose-100 text-rose-600 text-[11px] font-extrabold px-1.5 py-0.5 rounded">
                          -{initialDiscountPercent}%
                        </span>
                      </div>
                    )}
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
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        Họ và tên <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={buyerName}
                        onChange={(e) => {
                          setBuyerName(e.target.value);
                          if (formErrors.name) validateField('name', e.target.value);
                        }}
                        onBlur={() => validateField('name', buyerName)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                          formErrors.name
                            ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 text-rose-900'
                            : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50'
                        }`}
                        placeholder="Ví dụ: Nguyễn Văn A"
                      />
                      {formErrors.name && (
                        <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                          ⚠️ {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Field 2: Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={emailInputRef}
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => {
                          setBuyerEmail(e.target.value);
                          if (formErrors.email) validateField('email', e.target.value);
                        }}
                        onBlur={() => validateField('email', buyerEmail)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                          formErrors.email
                            ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 text-rose-900'
                            : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50'
                        }`}
                        placeholder="Ví dụ: nguyen.van.a@gmail.com"
                      />
                      {formErrors.email && (
                        <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                          ⚠️ {formErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Field 3: Số điện thoại */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        Số điện thoại <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        value={buyerPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d+]/g, '');
                          setBuyerPhone(val);
                          if (formErrors.phone) validateField('phone', val);
                        }}
                        onBlur={() => validateField('phone', buyerPhone)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                          formErrors.phone
                            ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 text-rose-900'
                            : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50'
                        }`}
                        placeholder="Ví dụ: 0912345678"
                      />
                      {formErrors.phone && (
                        <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1">
                          ⚠️ {formErrors.phone}
                        </p>
                      )}
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
                  
                  {/* Option 1: SePay VietQR (Chuyển khoản VietQR tự động) */}
                  <div
                    onClick={() => !isProcessing && setPaymentMethod('sepay')}
                    className={`p-4 rounded-xl border transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300'} flex items-center justify-between gap-4 ${
                      paymentMethod === 'sepay'
                        ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'sepay' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                      }`}>
                        {paymentMethod === 'sepay' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      {/* SePay VietQR Logo Badge */}
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                        VietQR
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Chuyển khoản VietQR tự động (SePay)</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Quét mã VietQR bằng App Ngân hàng bất kỳ - Kích hoạt khóa học ngay</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Khuyên dùng
                    </span>
                  </div>

                  {/* Option 2: Cổng thanh toán VNPAY */}
                  <div
                    onClick={() => !isProcessing && setPaymentMethod('vnpay')}
                    className={`p-4 rounded-xl border transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300'} flex items-center justify-between gap-4 ${
                      paymentMethod === 'vnpay'
                        ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'vnpay' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {paymentMethod === 'vnpay' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      {/* VNPay Logo Badge */}
                      <div className="w-10 h-10 rounded-xl bg-blue-700 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-sm tracking-wider">
                        VNPAY
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Cổng thanh toán VNPAY (ATM / QR Code / Internet Banking)</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Thanh toán an toàn qua cổng VNPAY Sandbox</p>
                      </div>
                    </div>
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
                  onClick={() => navigate(-1)}
                  className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại</span>
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
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6 lg:mt-[40px]">
              
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Đơn hàng của bạn
                  </h3>
                  <button
                    onClick={() => navigate(-1)}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Đổi khóa học
                  </button>
                </div>

                {/* Selected Item Preview */}
                <div className="flex items-center gap-3">
                  <div className="w-20 aspect-video rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                    <img
                      src={resolveImageUrl(checkoutCourse.image)}
                      alt={checkoutCourse.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5 overflow-hidden flex-1 min-w-0">
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
                  {hasCourseDiscount ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Giá gốc</span>
                        <span className="font-bold text-slate-400 line-through">{formatVND(originalPrice)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Giảm giá khóa học (-{initialDiscountPercent}%)</span>
                        <span className="font-bold text-rose-600">-{formatVND(initialDiscountAmount)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>Giá khóa học</span>
                      <span className="font-bold text-slate-900">{formatVND(salePrice)}</span>
                    </div>
                  )}

                </div>

                {/* Subtotal & Final Total */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span>Tạm tính</span>
                    <span className="font-bold text-slate-900">{formatVND(salePrice)}</span>
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
