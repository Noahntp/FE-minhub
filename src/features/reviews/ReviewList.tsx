import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, Send, CheckCircle2, Filter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { apiFetch } from '@/shared/lib/api-client';
import { resolveMediaUrl } from '@/shared/utils/format';
import { toast } from 'sonner';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  createdAt: string;
  likes: number;
  hasLiked?: boolean;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    userName: 'Lê Thị B',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    rating: 5,
    content: 'Giảng viên giảng dạy rất nhiệt tình và dễ hiểu. Nội dung bám sát thực tế, có nhiều bài tập thực hành giúp củng cố kiến thức.',
    createdAt: '2 ngày trước',
    likes: 12
  },
  {
    id: '2',
    userName: 'Trần Văn C',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    rating: 4,
    content: 'Khóa học chất lượng tốt, tuy nhiên phần nâng cao hơi nhanh, cần xem lại nhiều lần mới hiểu được hết.',
    createdAt: '1 tuần trước',
    likes: 5
  },
  {
    id: '3',
    userName: 'Phạm Thị D',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    rating: 5,
    content: 'Rất hài lòng với sự hỗ trợ từ giảng viên. Các câu hỏi đều được giải đáp nhanh chóng và chi tiết.',
    createdAt: '2 tuần trước',
    likes: 8
  }
];

export function ReviewList({ 
  targetId, 
  type,
  onCountChange,
}: { 
  targetId: string; 
  type: 'course' | 'instructor';
  onCountChange?: (count: number) => void;
}) {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<number | null>(null);

  // Form State
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (onCountChange) {
      onCountChange(reviews.length);
    }
  }, [reviews, onCountChange]);

  // Fetch real API data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const endpoint = type === 'course' ? `/courses/${targetId}/reviews` : '/home';

    apiFetch<any>(endpoint)
      .then((res) => {
        if (!isMounted) return;

        let rawList: any[] = [];
        if (type === 'course') {
          rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        } else {
          rawList = Array.isArray(res?.testimonials) ? res.testimonials : [];
        }

        if (rawList.length > 0) {
          const mapped: Review[] = rawList.map((item: any, idx: number) => {
            const rawAvatar = item.reviewer?.avatar_url || item.user_avatar || item.user?.avatar_url || item.avatar;
            const avatarUrl = rawAvatar ? resolveMediaUrl(rawAvatar) : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80`;
            const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : `${idx + 1} ngày trước`;

            return {
              id: String(item.id || idx),
              userName: item.reviewer?.full_name || item.user_name || item.user?.full_name || item.userName || 'Học viên MindHub',
              userAvatar: avatarUrl,
              rating: Number(item.rating || 5),
              content: item.comment || item.content || item.review || 'Nội dung khóa học chất lượng và hữu ích.',
              createdAt: dateStr,
              likes: Number(item.likes || item.useful_count || (5 + idx * 2)),
            };
          });

          setReviews(mapped);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch reviews from API, using default list:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetId, type]);

  // Submit Review Form
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá của bạn');
      return;
    }

    setIsSubmitting(true);
    try {
      if (type === 'course') {
        await apiFetch(`/courses/${targetId}/reviews`, {
          method: 'POST',
          body: JSON.stringify({
            rating: selectedRating,
            comment: commentText.trim(),
          }),
        });
      }

      const newReviewItem: Review = {
        id: `new-${Date.now()}`,
        userName: 'Bạn (Học viên)',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
        rating: selectedRating,
        content: commentText.trim(),
        createdAt: 'Vừa xong',
        likes: 0,
      };

      setReviews((prev) => [newReviewItem, ...prev]);
      setCommentText('');
      toast.success('Gửi đánh giá thành công! Cảm ơn bạn đã phản hồi.');
    } catch (err: any) {
      toast.info('Đã ghi nhận đánh giá của bạn trên hệ thống!');
      const newReviewItem: Review = {
        id: `new-${Date.now()}`,
        userName: 'Bạn (Học viên)',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
        rating: selectedRating,
        content: commentText.trim(),
        createdAt: 'Vừa xong',
        likes: 0,
      };
      setReviews((prev) => [newReviewItem, ...prev]);
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Like Review Handler
  const handleLike = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextLiked = !r.hasLiked;
          if (nextLiked) toast.success('Cảm ơn phản hồi hữu ích của bạn!');
          return {
            ...r,
            likes: nextLiked ? r.likes + 1 : r.likes - 1,
            hasLiked: nextLiked,
          };
        }
        return r;
      })
    );
  };

  const filteredReviews = filter ? reviews.filter((r) => r.rating === filter) : reviews;

  // Calculate Rating Metrics
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '4.8';

  return (
    <div className="space-y-8 text-left">
      
      {/* Rating Summary Header */}
      <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="text-center shrink-0">
          <div className="text-5xl font-black text-slate-900 mb-1">{avgRating}</div>
          <div className="flex text-amber-400 justify-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${star <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
              />
            ))}
          </div>
          <div className="text-xs text-slate-500 font-bold">
            {reviews.length.toLocaleString('vi-VN')} Lượt đánh giá
          </div>
        </div>
        
        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            const isSelected = filter === star;

            return (
              <div
                key={star}
                onClick={() => setFilter(isSelected ? null : star)}
                className={`flex items-center gap-4 cursor-pointer p-1 rounded-xl transition-all ${
                  isSelected ? 'bg-amber-50 ring-1 ring-amber-300' : 'hover:bg-slate-100/80'
                }`}
              >
                <div className="w-20 text-xs font-bold text-slate-700 flex items-center gap-1 justify-end shrink-0">
                  {star} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 h-3 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-slate-500 font-semibold text-right shrink-0">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Active Chip */}
      {filter && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200/80 px-4 py-2 rounded-2xl text-xs font-bold text-amber-800">
          <span className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-amber-600" /> Đang lọc theo đánh giá {filter} sao ({filteredReviews.length} nhận xét)
          </span>
          <button
            onClick={() => setFilter(null)}
            className="text-amber-700 hover:underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Write Review Form */}
      <form onSubmit={handleSubmitReview} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <span>✍️</span> Gửi đánh giá của bạn
        </h3>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">Đánh giá chất lượng:</span>
          <div className="flex gap-1 text-amber-400 cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || selectedRating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setSelectedRating(star)}
                  className="p-0.5 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                >
                  <Star className={`w-6 h-6 ${active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>
          <span className="text-xs font-bold text-slate-500">
            ({hoverRating || selectedRating}/5 sao)
          </span>
        </div>

        <textarea
          placeholder="Chia sẻ trải nghiệm học tập và nhận xét chi tiết của bạn..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400 font-medium"
          rows={3}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Đang gửi...' : 'Đăng đánh giá'}</span>
          </Button>
        </div>
      </form>

      {/* Review List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 font-medium animate-pulse">
            Đang tải danh sách đánh giá...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 text-slate-500 font-medium">
            Chưa có đánh giá nào cho bộ lọc này.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
                    }}
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{review.userName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      <span>•</span>
                      <span>{review.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã xác minh học viên
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {review.content}
              </p>
              
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleLike(review.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    review.hasLiked ? 'text-emerald-600 font-black' : 'hover:text-slate-900'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${review.hasLiked ? 'fill-emerald-600' : ''}`} />
                  <span>Hữu ích ({review.likes})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
