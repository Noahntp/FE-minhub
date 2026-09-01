import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, Sparkles, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { apiFetch } from '@/shared/lib/api-client';
import { toast } from 'sonner';

interface CourseReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string | number;
  courseTitle?: string;
  initialRating?: number;
  initialComment?: string;
  onSuccess?: (newReview: { rating: number; comment: string }) => void;
}

const RATING_DESCRIPTIONS = [
  { star: 1, text: 'Rất tệ 😟', hint: 'Khóa học không đáp ứng kỳ vọng' },
  { star: 2, text: 'Tạm ổn 😐', hint: 'Khóa học cần cải thiện nhiều' },
  { star: 3, text: 'Khá hay 🙂', hint: 'Nội dung ở mức trung bình khá' },
  { star: 4, text: 'Rất tốt 😃', hint: 'Khóa học chất lượng, giảng viên tận tâm' },
  { star: 5, text: 'Tuyệt đỉnh! 😍', hint: 'Vượt ngoài mong đợi, vô cùng hữu ích' },
];

export function CourseReviewModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  initialRating = 5,
  initialComment = '',
  onSuccess,
}: CourseReviewModalProps) {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>(initialComment);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating || 5);
      setComment(initialComment || '');
      setIsSubmitting(false);
    }
  }, [isOpen, initialRating, initialComment]);

  const activeStar = hoverRating || rating;
  const currentDesc = RATING_DESCRIPTIONS.find((r) => r.star === activeStar) || RATING_DESCRIPTIONS[4];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung nhận xét của bạn');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch(`/courses/${courseId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          content: comment.trim(),
          comment: comment.trim(),
        }),
      });

      toast.success('Gửi đánh giá khóa học thành công! Cảm ơn bạn đã phản hồi.');
      if (onSuccess) {
        onSuccess({ rating, comment: comment.trim() });
      }
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 text-left"
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-[#022822] via-[#043e34] to-[#022822] p-6 text-white overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-amber-300 shadow-inner">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">
                      Đánh Giá Khóa Học
                    </h3>
                    <p className="text-xs text-emerald-200/80 font-medium line-clamp-1">
                      {courseTitle || 'Chia sẻ cảm nhận học tập của bạn'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Star Rating Section */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-center space-y-3">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Mức độ hài lòng của bạn
                </label>

                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 hover:scale-125 transition-transform duration-150 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= activeStar
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Dynamic Rating Label */}
                <div className="h-6 flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-slate-800 animate-fade-in">
                    {currentDesc.text}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {currentDesc.hint}
                  </span>
                </div>
              </div>

              {/* Review Textarea */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Nhận xét chi tiết</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {comment.length}/2000 ký tự
                  </span>
                </label>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm học tập, sự tận tâm của giảng viên, chất lượng bài tập và tài liệu khóa học..."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <Button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/10 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi đánh giá</span>
                    </>
                  )}
                </Button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
