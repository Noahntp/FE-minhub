import React, { useState, useEffect } from 'react';
import { X, PlayCircle, BookOpen, CheckCircle2, ShoppingCart, Sparkles, Star, Users, ArrowRight, ShieldCheck, Flame, Loader2 } from 'lucide-react';
import { useApp, TrialLessonItem } from '@/app/AppContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/shared/lib/api-client';
import { resolveMediaUrl } from '@/shared/lib/media-url';
import Hls from 'hls.js';

const FALLBACK_SAMPLE_VIDEOS = [
  'https://mindhub.io.vn/videos/laravel-rest-api/laravel-rest-api-01-rest-api-la-gi-trong-laravel.mp4',
  'https://mindhub.io.vn/videos/ai-learning/ai-learning-01-ai-trong-hoc-tap-la-gi.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://vjs.zencdn.net/v/oceans.mp4'
];

export function TrialPreviewModal() {
  const { trialModalOpen, closeTrialModal, activeTrialLesson, setActiveTrialLesson } = useApp();
  const navigate = useNavigate();

  const [trialLessonsList, setTrialLessonsList] = useState<TrialLessonItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [videoSrc, setVideoSrc] = useState<string>('');

  // Fetch real trial lessons from Backend API /api/courses/preview-lessons
  useEffect(() => {
    if (!trialModalOpen) return;

    setIsLoading(true);
    apiFetch<any>('/courses/preview-lessons')
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          const mapped: TrialLessonItem[] = list.map((item: any) => ({
            id: String(item.id),
            title: item.title || 'Bài học xem thử',
            duration: item.duration || '12:30',
            videoUrl: item.stream_url || item.video_url || item.videoUrl || FALLBACK_SAMPLE_VIDEOS[0],
            courseTitle: item.course_title || item.courseTitle || 'Khóa học chất lượng cao',
            courseId: String(item.course_id || item.courseId || 'react-nextjs-master'),
            instructorName: item.instructor_name || item.instructorName || 'Giảng viên MindHub',
          }));
          setTrialLessonsList(mapped);

          if (!activeTrialLesson) {
            setActiveTrialLesson(mapped[0]);
          }
        }
      })
      .catch(() => { })
      .finally(() => {
        setIsLoading(false);
      });
  }, [trialModalOpen]);

  // Update active video source and resolve URLs safely
  const currentLesson = activeTrialLesson || (trialLessonsList.length > 0 ? trialLessonsList[0] : null);

  useEffect(() => {
    if (currentLesson?.videoUrl) {
      const rawUrl = currentLesson.videoUrl.trim();
      if (rawUrl.includes('gtv-videos-bucket') || rawUrl.includes('seed-bunny')) {
        setVideoSrc(FALLBACK_SAMPLE_VIDEOS[0]);
      } else if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        setVideoSrc(rawUrl);
      } else if (rawUrl.startsWith('/')) {
        setVideoSrc(`${window.location.origin}${rawUrl}`);
      } else {
        setVideoSrc(FALLBACK_SAMPLE_VIDEOS[0]);
      }
    } else {
      setVideoSrc(FALLBACK_SAMPLE_VIDEOS[0]);
    }
  }, [currentLesson?.videoUrl]);

  const isIframe = Boolean(
    videoSrc && (
      videoSrc.includes('iframe.mediadelivery.net') ||
      videoSrc.includes('youtube.com') ||
      videoSrc.includes('/embed/')
    )
  );

  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hls: Hls | null = null;

    if (videoRef.current && videoSrc) {
      if (videoSrc.includes('.m3u8') && Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(videoRef.current);
      } else {
        videoRef.current.src = videoSrc;
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoSrc]);

  if (!trialModalOpen) return null;

  const displayList = trialLessonsList.length > 0 ? trialLessonsList : [
    {
      id: 'trial-fallback-1',
      title: currentLesson?.title || 'React 18 & Next.js 15: Giới thiệu App Router & Server Components',
      duration: currentLesson?.duration || '12:40',
      videoUrl: FALLBACK_SAMPLE_VIDEOS[0],
      courseTitle: currentLesson?.courseTitle || 'React 18 & Next.js 15: Xây dựng Web App chuyên nghiệp',
      courseId: currentLesson?.courseId || 'react-nextjs-master',
      instructorName: currentLesson?.instructorName || 'Nguyễn Thị Lan',
    }
  ];

  const handleEnrollOrBuy = () => {
    closeTrialModal();
    const targetCourse = currentLesson?.courseId || 'react-nextjs-master';
    navigate(`/courses/${targetCourse}`);
  };

  const handleVideoError = () => {
    // If local demo video fails to load in dev, fallback seamlessly to public sample MP4
    setVideoSrc(FALLBACK_SAMPLE_VIDEOS[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Học Thử Miễn Phí (Free Trial Preview)
                </h2>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Trải nghiệm 0đ
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Khám phá bài học thực tế từ chuyên gia trước khi quyết định tham gia khóa học.
              </p>
            </div>
          </div>

          <button
            onClick={closeTrialModal}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Video Player & Playlist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">

          {/* Left / Top: Video Player & Details */}
          <div className="lg:col-span-8 p-5 space-y-4 bg-slate-950 flex flex-col">

            {/* HTML5 Video Player or Bunny CDN Stream Iframe */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center">
              {isIframe ? (
                <iframe
                  key={videoSrc}
                  src={videoSrc}
                  loading="lazy"
                  className="w-full h-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              ) : videoSrc ? (
                <video
                  ref={videoRef}
                  key={videoSrc}
                  controls
                  autoPlay
                  playsInline
                  onError={handleVideoError}
                  className="w-full h-full object-contain bg-black"
                  poster="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80"
                >
                  <source src={videoSrc} type="video/mp4" />
                  Trình duyệt của bạn không hỗ trợ phát video HTML5.
                </video>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                  <span>Đang tải video xem thử...</span>
                </div>
              )}
            </div>

            {/* Video Meta Info */}
            <div className="space-y-2 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug">
                  {currentLesson?.title || 'Bài học xem thử miễn phí'}
                </h3>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-300" /> Bản Học Thử Miễn Phí
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                  <span>{currentLesson?.courseTitle || 'Khóa học chất lượng cao'}</span>
                </div>
                {currentLesson?.instructorName && (
                  <div className="flex items-center gap-1">
                    <span>• Giảng viên: <strong className="text-slate-200">{currentLesson.instructorName}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button Box */}
            <div className="mt-auto pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left text-xs text-slate-300 space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Bao gồm lộ trình bài tập & tài liệu PDF trọn đời</span>
                </div>
                <div className="text-slate-400 text-[11px]">Cam kết hoàn tiền trong 7 ngày nếu không hài lòng</div>
              </div>

              <button
                onClick={handleEnrollOrBuy}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Đăng ký xem trọn bộ khóa học</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right / Bottom: Playlist of Trial Lessons */}
          <div className="lg:col-span-4 p-4 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 space-y-3 flex flex-col">

            <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                <span>Danh sách bài học thử ({displayList.length})</span>
              </span>
              <span className="text-[10px] text-emerald-400">Miễn phí 100%</span>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
                <p>Đang tải bài học thử từ hệ thống...</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[340px] pr-1">
                {displayList.map((item) => {
                  const isActive = item.id === currentLesson?.id || item.title === currentLesson?.title;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTrialLesson(item)}
                      className={`w-full p-3 rounded-xl text-left text-xs transition-all flex items-start gap-3 border cursor-pointer ${isActive
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-white shadow-md'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="font-bold line-clamp-2 leading-tight">
                          {item.title}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-emerald-400 font-semibold">{item.duration}</span>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Học thử</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">
                Thích bài giảng này? Nhấn <strong className="text-white">Đăng ký xem trọn bộ</strong> để bắt đầu lộ trình.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
