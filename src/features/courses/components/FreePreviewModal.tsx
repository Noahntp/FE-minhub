import React, { useState, useRef, useEffect } from 'react';
import { X, Lock, Play, FileText, Video, ShoppingBag, BookOpen, Sparkles, RefreshCw, Info } from 'lucide-react';
import { Course, Lesson } from '@/shared/types';
import { resolveMediaUrl } from '@/shared/utils/format';

interface FreePreviewModalProps {
  previewLesson: { lesson: Lesson; course: Course };
  onClose: () => void;
  onBuyNow: (courseId: string) => void;
}

export function FreePreviewModal({ previewLesson, onClose, onBuyNow }: FreePreviewModalProps) {
  const { lesson, course } = previewLesson;
  const [isLocked, setIsLocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const resolvedVideoUrl = resolveMediaUrl(lesson.videoUrl || (lesson as any).video_url) || "https://www.w3schools.com/html/mov_bbb.mp4";

  useEffect(() => {
    if (videoRef.current && resolvedVideoUrl) {
      videoRef.current.load();
    }
  }, [resolvedVideoUrl]);

  // Helper to format VND currency safely
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Reset lock state when previewing a new lesson
  useEffect(() => {
    setIsLocked(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [previewLesson]);

  const limitSeconds = course.freeVideoDuration || 30;

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.currentTime >= limitSeconds) {
      video.pause();
      setIsLocked(true);
      // Double guarantee time locked
      video.currentTime = limitSeconds;
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#fefdfb] border border-[#e8ded3] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scaleIn">
        
        {/* Header bar */}
        <div className="p-4 md:p-5 border-b border-[#e8ded3] bg-[#faf6f2] flex justify-between items-center shrink-0">
          <div className="space-y-1 text-left min-w-0 pr-4">
            <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-amber-800 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Học thử Miễn phí • Trải nghiệm chất lượng</span>
            </div>
            <h3 className="font-display font-extrabold text-stone-900 text-xs md:text-sm truncate">
              {lesson.title}
            </h3>
            <p className="text-[10px] text-stone-500 truncate">
              Khóa học: {course.title} • {course.instructorName}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 p-1.5 rounded-full transition-all shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Course FAQ section preview info info-bar inside */}
        <div className="bg-[#fff9f2] text-[#8b5e3c] border-b border-[#ffd9b3]/40 p-2.5 px-4 text-[10.5px] text-left font-medium flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 animate-pulse" />
            <span className="flex items-center gap-1">Giảng viên cấu hình mở khóa bài học thử tự do <Sparkles className="w-3 h-3 text-amber-500 inline shrink-0" /></span>
          </div>
          <span className="text-[9px] bg-amber-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {lesson.type === 'video' ? `Video học thử ${limitSeconds}s` : 'Full Tài liệu'}
          </span>
        </div>

        {/* Core display area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 bg-stone-50/50">
          {lesson.type === 'video' ? (
            <div className="space-y-4">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-lg border border-stone-200">
                
                {/* Embedded HTML5 Video player */}
                <video
                  ref={videoRef}
                  key={resolvedVideoUrl}
                  controls
                  autoPlay
                  preload="metadata"
                  playsInline
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onError={(e) => {
                    const v = e.currentTarget;
                    console.error('[Preview Video Error Details]', {
                      networkState: v.networkState,
                      readyState: v.readyState,
                      error: v.error ? { code: v.error.code, message: v.error.message } : null,
                      src: resolvedVideoUrl,
                    });
                  }}
                >
                  <source src={resolvedVideoUrl} type={resolvedVideoUrl.endsWith('.webm') ? 'video/webm' : resolvedVideoUrl.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
                  Trình duyệt không hỗ trợ xem video này.
                </video>

                {/* Locked limit overlays */}
                {isLocked && (
                  <div className="absolute inset-0 bg-stone-950/98 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center z-20 text-white animate-fadeIn">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center mb-3 animate-bounce">
                      <Lock className="w-6 h-6 text-amber-500" />
                    </div>
                    <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest mb-1">
                      Giới hạn học thử miễn phí đã đạt
                    </span>
                    <h4 className="font-display font-extrabold text-sm md:text-base leading-snug max-w-md">
                      Bạn đã xem qua hết {limitSeconds} giây học thử!
                    </h4>
                    <p className="text-[11px] text-stone-400 max-w-md mt-1.5 leading-relaxed">
                      Để tham gia trao đổi thảo luận Q&A trực tiếp, làm các Quiz trắc nghiệm thẩm định kỹ năng, nhận full slide giáo trình, và sở hữu Chứng chỉ điện tử được ký độc quyền bởi {course.instructorName}, hãy sở hữu khóa học này ngay hôm nay.
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onBuyNow(course.id)}
                        className="bg-amber-500 hover:bg-amber-600 text-stone-950 py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-stone-950" />
                        Mua Ngay giá ưu đãi {formatVND(course.salePrice || course.price)}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLocked(false);
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                            videoRef.current.play().catch(() => {});
                          }
                        }}
                        className="text-stone-300 hover:text-white border border-stone-700 hover:bg-white/5 py-2 px-4 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-stone-350 shrink-0" />
                        <span>Xem Lại Học Thử</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white border rounded-xl p-3.5 space-y-1.5 text-left text-xs leading-relaxed text-stone-700">
                <p className="font-semibold text-stone-900 border-b pb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-normal"></span>
                  Nội dung Tóm tắt bài giảng học thử:
                </p>
                <p className="text-[11.5px] italic text-stone-550">
                  {lesson.content || "Nội dung học đang được mô tả chi tiết bằng slide trực ban từ Khoa học MindHub."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Document Lesson View */}
              <div className="bg-white border rounded-2xl p-5 md:p-6 shadow-sm text-left max-w-xl mx-auto space-y-4">
                <div className="flex items-center gap-2 border-b pb-3 text-xs font-bold text-stone-500">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>NỘI DUNG TÀI LIỆU CHUYÊN SÂU (.DOC)</span>
                  <span className="ml-auto px-2 py-0.5 rounded bg-emerald-150 text-emerald-800 text-[10px] uppercase font-bold">
                    PREVIEW FULL DOCUMENT
                  </span>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed text-xs md:text-[13px] text-stone-820 font-sans space-y-3 pt-1">
                  {lesson.docContent || lesson.content || "Giảng viên đang soạn thảo nội dung hoàn chỉnh cho tài liệu đọc này."}
                </div>

                <div className="bg-emerald-50/50 border border-emerald-150 rounded-xl p-3 text-[11px] text-emerald-850 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <b>Lưu ý:</b> Đây là tài liệu đọc mẫu được mở khóa miễn phí. Bạn hoàn toàn có thể ghi danh để được mở khóa toàn hệ thống các tài liệu, bài tập thực hành đồ án đỉnh cao đi kèm.
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => onBuyNow(course.id)}
                  className="bg-stone-900 hover:bg-black text-white py-3 px-8 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  Ghi danh full để xem trọn gói bài học
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info lock down */}
        <div className="p-4 text-xs font-medium bg-stone-150 border-t text-stone-500 shrink-0 select-none text-center">
          Khóa học thuộc sở hữu bản quyền của Giảng viên • Bảo đảm chất lượng đào tạo bởi MindHub
        </div>

      </div>
    </div>
  );
}
