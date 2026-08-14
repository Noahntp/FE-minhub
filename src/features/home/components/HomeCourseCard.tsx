import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Users, Heart, ShoppingCart, Flame, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/shared/lib/api-client';
import { useApp } from '@/app/AppContext';

export interface HomeCourseItem {
  id: string;
  realId?: number;
  title: string;
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao' | 'Mọi trình độ';
  thumbnail: string;
  rating: number;
  reviewCount: number;
  studentCount: string;
  instructorName: string;
  instructorAvatar: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  isFree?: boolean;
  isNew?: boolean;
  isHot?: boolean;
  durationSeconds?: number;
}

interface HomeCourseCardProps {
  course: HomeCourseItem;
  tagVariant?: 'hot' | 'new' | 'discount';
}

export function HomeCourseCard({ course, tagVariant }: HomeCourseCardProps) {
  const navigate = useNavigate();
  const { favorites, setFavorites, currentUser } = useApp();

  const isWishlisted =
    favorites.includes(course.id) ||
    (course.realId ? favorites.includes(String(course.realId)) : false);

  // Determine which single tag to show on top-left of thumbnail
  const effectiveVariant =
    tagVariant ||
    (course.isHot
      ? 'hot'
      : course.isNew
      ? 'new'
      : course.discountBadge
      ? 'discount'
      : undefined);

  const courseTarget = (course as any).slug || course.id;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

    if (currentUser?.role === 'admin') {
      toast.error('Tài khoản Quản trị viên (Admin) không thực hiện mua khóa học.');
      return;
    }

    if (course.isFree || course.price === 0) {
      toast.success(`Đăng ký tham gia khóa học miễn phí thành công: ${course.title}`);
      navigate(`/learn/${courseTarget}`);
    } else {
      toast.success(`Đang mở trang thanh toán cho khóa học: ${course.title}`);
      navigate(`/checkout?courseId=${courseTarget}`);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Thumbnail Container */}
      <Link to={`/courses/${courseTarget}`} className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 block">
        <img
          src={course.thumbnail}
          alt={course.title}
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

          {/* Rating & Students */}
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-700">{course.rating.toFixed(1)}</span>
              <span className="text-slate-400">({course.reviewCount})</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.studentCount} học viên</span>
            </div>
          </div>

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
        </div>

        {/* Bottom Section: Price & Action */}
        <div className="pt-3 border-t border-slate-100 space-y-3 mt-auto">
          
          {/* Price Display */}
          <div className="flex items-baseline justify-between">
            {course.isFree || course.price === 0 ? (
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
          <button
            onClick={handleBuyNow}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{course.isFree ? 'Đăng ký học ngay' : 'Mua ngay'}</span>
          </button>

        </div>
      </div>
    </div>
  );
}
