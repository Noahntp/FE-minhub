import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Star, Users, Heart, ShoppingCart, Flame, Sparkles, GraduationCap, Clock, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/shared/lib/api-client';
import { useApp } from '@/app/AppContext';
import { resolveMediaUrl } from '@/shared/utils/format';

export interface HomeCourseItem {
  id: string;
  realId?: number;
  title: string;
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao' | 'Mọi trình độ';
  thumbnail: string;
  rating: number;
  reviewCount: number;
  studentCount: string;
  rawStudentCount?: number;
  completedStudentCount?: number;
  completionRate?: number;
  averageProgress?: number;
  hasCertificate?: boolean;
  certificateName?: string;
  publishedAt?: string;
  versionTag?: string;
  instructorName: string;
  instructorAvatar: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  isFree?: boolean;
  isNew?: boolean;
  isHot?: boolean;
  durationSeconds?: number;
  campaign_type?: 'discount' | 'trial' | null;
  has_trial?: boolean;
  hasTrial?: boolean;
  isTrial?: boolean;
}

export function isCourseTrialEligible(course?: any): boolean {
  if (!course) return false;
  if (course.campaign_type === 'trial' || course.coupon?.campaign_type === 'trial') return true;
  if (course.has_trial === true || course.hasTrial === true || course.isTrial === true) return true;
  const price = Number(course.price ?? 0);
  const salePrice = course.sale_price !== null && course.sale_price !== undefined ? Number(course.sale_price) : undefined;
  if (price > 0 && salePrice === 0) return true;
  return false;
}

export function isPermanentFreeCourse(course?: any): boolean {
  if (!course) return false;
  const price = Number(course.price ?? 0);
  const isExplicitFree = Boolean(course.isFree || course.is_free);
  return (price === 0 || isExplicitFree) && !isCourseTrialEligible(course);
}

interface HomeCourseCardProps {
  course: HomeCourseItem;
  tagVariant?: 'hot' | 'new' | 'discount' | 'none';
  hideThumbnailTag?: boolean;
  showCompletionProgress?: boolean;
  showProofBadge?: boolean;
}

export function HomeCourseCard({
  course,
  tagVariant,
  hideThumbnailTag = false,
  showCompletionProgress = false,
  showProofBadge = false,
}: HomeCourseCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites, setFavorites, currentUser, isLoggedIn, enrolledCourseIds } = useApp();

  const isEnrolled = Boolean(
    isLoggedIn &&
    ((course as any)?.is_enrolled ||
      (course as any)?.isEnrolled ||
      enrolledCourseIds?.some(
        (id) =>
          String(id) === String(course.id) ||
          String(id) === String((course as any).slug) ||
          String(id) === String(course.realId)
      ))
  );

  const releaseProofText = course.publishedAt
    ? (course.publishedAt.startsWith('Ra mắt') || course.publishedAt.startsWith('Vừa')
        ? course.publishedAt
        : `Ra mắt: ${course.publishedAt}`)
    : 'Vừa ra mắt gần đây';

  const releaseVersion = course.versionTag || 'Giáo trình 2026';

  const completionRate =
    course.completionRate !== undefined && course.completionRate !== null
      ? Math.min(100, Math.max(0, Math.round(course.completionRate)))
      : course.completedStudentCount && course.rawStudentCount && course.rawStudentCount > 0
      ? Math.min(100, Math.max(0, Math.round((course.completedStudentCount / course.rawStudentCount) * 100)))
      : course.averageProgress !== undefined && course.averageProgress !== null
      ? Math.min(100, Math.max(0, Math.round(course.averageProgress)))
      : null;

  const completedCountDisplay = course.completedStudentCount
    ? (course.completedStudentCount >= 1000
        ? (course.completedStudentCount / 1000).toFixed(1).replace('.0', '') + 'K'
        : course.completedStudentCount.toLocaleString('vi-VN'))
    : null;

  const isWishlisted =
    favorites.includes(course.id) ||
    (course.realId ? favorites.includes(String(course.realId)) : false);

  // Bỏ toàn bộ nhãn trên thumbnail nếu hideThumbnailTag = true hoặc tagVariant = 'none'
  const effectiveVariant =
    hideThumbnailTag || tagVariant === 'none'
      ? undefined
      : tagVariant ||
        (course.isHot
          ? 'hot'
          : course.isNew
          ? 'new'
          : course.discountBadge
          ? 'discount'
          : undefined);

  // Chỉ hiển thị số học viên, lượt đánh giá và rating khi có dữ liệu ý nghĩa (> 0)
  const hasRatings = Boolean(course.reviewCount && course.reviewCount > 0 && course.rating && course.rating > 0);
  const hasStudents = Boolean(course.rawStudentCount && course.rawStudentCount > 0);
  const hasMeaningfulStats = hasRatings || hasStudents;

  const courseTarget = (course as any).slug || course.id;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thực hiện chức năng này.');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    if (currentUser?.role === 'admin') {
      toast.error('Tài khoản Quản trị viên (Admin) không sử dụng danh sách yêu thích.');
      return;
    }

    const targetId = course.realId || (course as any).course_id || course.id;
    const nextState = !isWishlisted;

    if (nextState) {
      toast.success(`Đã thêm "${course.title}" vào danh sách yêu thích!`);
      setFavorites((prev) => [...prev.filter((id) => id !== course.id), course.id]);

      if (targetId && !isNaN(Number(targetId))) {
        try {
          await apiFetch('/wishlists', {
            method: 'POST',
            body: JSON.stringify({ course_id: Number(targetId) }),
          });
        } catch (err) {
          console.warn('Could not add to wishlist on backend:', err);
        }
      }
    } else {
      toast.info(`Đã xóa khỏi danh sách yêu thích.`);
      setFavorites((prev) => prev.filter((id) => id !== course.id && id !== String(targetId)));

      if (targetId && !isNaN(Number(targetId))) {
        try {
          await apiFetch(`/wishlists/${targetId}`, { method: 'DELETE' });
        } catch (err) {
          console.warn('Could not remove from wishlist on backend:', err);
        }
      }
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thực hiện chức năng này.');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    if (currentUser?.role === 'admin') {
      toast.error('Tài khoản Quản trị viên (Admin) không thực hiện mua khóa học.');
      return;
    }

    if (isEnrolled) {
      navigate(`/learn/${courseTarget}`);
      return;
    }

    const isTrial = isCourseTrialEligible(course);
    const isFree = isPermanentFreeCourse(course);

    if (isTrial) {
      const numericTargetId = Number(course.realId || (course as any).course_id || course.id);
      if (numericTargetId && !isNaN(numericTargetId)) {
        apiFetch<any>('/orders', {
          method: 'POST',
          body: JSON.stringify({ course_id: numericTargetId }),
        })
          .then(() => {
            toast.success(`Đăng ký học thử khóa học thành công: ${course.title}`);
            navigate(`/learn/${courseTarget}`);
          })
          .catch((err: any) => {
            toast.error(err?.message || 'Không thể đăng ký học thử lúc này.');
          });
      } else {
        navigate(`/learn/${courseTarget}`);
      }
      return;
    }

    if (isFree) {
      toast.info('Khóa học miễn phí đang được đồng bộ cổng ghi danh tự động. Đang chuyển tới trang chi tiết...');
      navigate(`/courses/${courseTarget}`);
      return;
    }

    toast.success(`Đang mở trang thanh toán cho khóa học: ${course.title}`);
    navigate(`/checkout?courseId=${courseTarget}`);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Thumbnail Container */}
      <Link to={`/courses/${courseTarget}`} className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 block">
        <img
          src={resolveMediaUrl(course.thumbnail)}
          alt={course.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top-Left Single Tag & Top-Right Heart Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          
          {/* Top-Left: Render ONLY 1 Tag based on Section Type */}
          <div className="pointer-events-auto">
            {effectiveVariant === 'hot' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md bg-amber-500 text-white tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>HOT</span>
              </span>
            )}

            {effectiveVariant === 'new' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md bg-sky-500 text-white tracking-wider">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                <span>NEW</span>
              </span>
            )}

            {effectiveVariant === 'discount' && course.discountBadge && !course.isFree && (
              <span className="inline-flex items-center text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md bg-rose-600 text-white tracking-wider">
                {course.discountBadge}
              </span>
            )}
          </div>

          {/* Top-Right: Heart Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
              isWishlisted
                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                : 'bg-white/90 text-slate-600 hover:bg-white hover:text-rose-500'
            }`}
            title="Thêm vào danh sách yêu thích"
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${
                isWishlisted ? 'fill-rose-500 stroke-rose-500' : ''
              }`}
            />
          </button>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Title */}
          <Link to={`/courses/${courseTarget}`}>
            <h3 className="font-bold text-slate-800 text-base line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors mb-2 min-h-[2.75rem]">
              {course.title}
            </h3>
          </Link>

          {/* Rating & Students - Chỉ hiển thị khi có dữ liệu đủ ý nghĩa (> 0), ẩn nếu chưa có */}
          {hasMeaningfulStats ? (
            <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-3 min-h-[1.25rem] flex-wrap">
              {hasRatings && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-bold text-slate-700">{course.rating.toFixed(1)}</span>
                  <span className="text-slate-400">({course.reviewCount})</span>
                </div>
              )}
              {hasRatings && hasStudents && <span className="text-slate-300">•</span>}
              {hasStudents && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{course.studentCount} học viên</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 min-h-[1.25rem]">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-100 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Khóa học mới xuất bản</span>
              </span>
            </div>
          )}

          {/* Minh chứng Khóa học mới (Gọn gàng, 1 dòng thanh lịch, không bị tràn viền) */}
          {showProofBadge && (
            <div className="mb-3 px-2 py-1.5 rounded-lg bg-sky-50/80 border border-sky-100/90 flex items-center justify-between gap-1 text-[11px] transition-all">
              <div className="flex items-center gap-1 font-bold text-sky-900 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="whitespace-nowrap font-bold text-[11px]">{releaseProofText}</span>
              </div>
              <span className="shrink-0 text-[10px] font-black text-sky-700 bg-sky-100/90 px-1.5 py-0.5 rounded border border-sky-200/60 uppercase tracking-wider shadow-2xs whitespace-nowrap">
                2026
              </span>
            </div>
          )}

          {/* Instructor Info */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <img
              src={course.instructorAvatar}
              alt={course.instructorName}
              className="w-6 h-6 rounded-full object-cover border border-slate-200"
            />
            <span className="text-xs text-slate-600 font-medium truncate">
              {course.instructorName}
            </span>
          </div>

          {/* Completion Progress Bar - Vị trí: ngay bên dưới thông tin Giảng viên, trước phần giá và nút hành động */}
          {showCompletionProgress && (
            <div className="mt-2.5 p-2 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1.5 transition-all">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{isEnrolled ? 'Tiến độ học tập của bạn' : 'Tiến độ hoàn thành'}</span>
                </span>
                <span className="font-black text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded text-[11px]">
                  {completionRate ?? 0}%
                </span>
              </div>

              {/* Progress Track & Color Bar */}
              <div className="w-full h-1.5 bg-slate-200/90 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(completionRate ?? 0, 4))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-0.5">
                <span>Tổng: <strong className="text-slate-700">{course.studentCount}</strong> học viên</span>
                <span className="text-emerald-700 font-semibold">
                  {completedCountDisplay ? `${completedCountDisplay} đã xong` : `${completionRate ?? 0}% hoàn thành`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section: Price & Action */}
        <div className="pt-3 border-t border-slate-100 space-y-3 mt-auto">
          
          {/* Price Display */}
          <div className="flex items-baseline justify-between">
            {isCourseTrialEligible(course) ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-emerald-600">0đ</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Học thử miễn phí
                </span>
              </div>
            ) : isPermanentFreeCourse(course) ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-emerald-600">0đ</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Miễn phí
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-rose-600">
                  {formatPrice(course.price)}
                </span>
                {course.originalPrice && course.originalPrice > course.price && (
                  <span className="text-xs text-slate-400 line-through font-normal">
                    {formatPrice(course.originalPrice)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Nút Mua ngay / Học ngay (Chuẩn Full Width Không Vỡ Chữ) */}
          {isEnrolled ? (
            <button
              onClick={handleBuyNow}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-slate-900/20 active:scale-[0.98] transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Vào học</span>
            </button>
          ) : (
            <button
              onClick={handleBuyNow}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
            >
              {isCourseTrialEligible(course) ? (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Học thử ngay</span>
                </>
              ) : isPermanentFreeCourse(course) ? (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Xem khóa học</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Mua ngay</span>
                </>
              )}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
