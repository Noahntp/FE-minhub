import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  FileText,
  Video,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  Clock,
  User,
  Film,
  Sparkles,
  Layers,
  ChevronRight,
  Tv,
} from 'lucide-react';
import { getCourseReview, approveCourse, rejectCourse } from '@/assets/js/api/course-reviews-api';
import { showToast } from '@/assets/js/toast';
import { resolveMediaUrl } from '@/shared/lib/media-url';
import { cn } from '@/shared/lib/utils';

export default function CoursePreviewPlayer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get courseId from path (/admin/course-preview/27) or query (?course_id=27)
  const pathParts = location.pathname.split('/');
  const pathCourseId = pathParts[3] ? parseInt(pathParts[3], 10) : 0;
  const courseId = pathCourseId > 0 ? pathCourseId : parseInt(searchParams.get('course_id') || '0', 10);
  const initialLessonId = parseInt(searchParams.get('lesson_id') || '0', 10);

  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active playing item: can be 'trailer' or a lesson object
  const [activeItemType, setActiveItemType] = useState<'trailer' | 'lesson'>('lesson');
  const [activeLesson, setActiveLesson] = useState<any>(null);

  // Video player states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const controlsTimeoutRef = useRef<any>(null);

  // Accordion for sections
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // Moderation action modals
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Load course details
  useEffect(() => {
    if (!courseId) {
      setError('Không tìm thấy mã khóa học hợp lệ.');
      setLoading(false);
      return;
    }

    setLoading(true);
    getCourseReview(courseId)
      .then((res: any) => {
        if (res && res.success && res.data) {
          const data = res.data;
          setCourseData(data);

          // Expand all sections by default
          if (data.sections && data.sections.length > 0) {
            setExpandedSections(new Set(data.sections.map((s: any) => s.id)));
          }

          // Pick target lesson
          const allLessons = data.lessons || [];
          if (initialLessonId > 0) {
            const found = allLessons.find((l: any) => l.id === initialLessonId);
            if (found) {
              setActiveItemType('lesson');
              setActiveLesson(found);
              return;
            }
          }

          // Default to first lesson or trailer
          if (allLessons.length > 0) {
            setActiveItemType('lesson');
            setActiveLesson(allLessons[0]);
          } else if (data.course?.intro_video_url) {
            setActiveItemType('trailer');
          }
        } else {
          setError('Không tìm thấy thông tin khóa học.');
        }
      })
      .catch((err: any) => {
        console.error('Error fetching course preview:', err);
        setError('Không thể nạp dữ liệu khóa học để kiểm duyệt.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [courseId]);

  // Video element event listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onLoadedMetadata = () => {
      setDuration(v.duration || 0);
      setIsPlaying(!v.paused);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);

    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
    };
  }, [activeLesson, activeItemType]);

  // Handle autohide controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 3000);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekBy(10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekBy(-10);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        changeVolume(Math.min(1, volume + 0.1));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        changeVolume(Math.max(0, volume - 0.1));
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const seekBy = (sec: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + sec));
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const changeVolume = (val: number) => {
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume > 0 ? volume : 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP error:', err);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const selectLesson = (lesson: any) => {
    setActiveItemType('lesson');
    setActiveLesson(lesson);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('lesson_id', String(lesson.id));
    setSearchParams(nextParams, { replace: true });
  };

  const selectTrailer = () => {
    setActiveItemType('trailer');
    setActiveLesson(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('lesson_id');
    setSearchParams(nextParams, { replace: true });
  };

  const toggleSection = (secId: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(secId)) next.delete(secId);
      else next.add(secId);
      return next;
    });
  };

  // Moderation actions
  const handleApprove = async () => {
    setSubmittingAction(true);
    try {
      await approveCourse(courseId);
      showToast({
        type: 'success',
        title: 'Phê duyệt thành công',
        message: 'Khóa học đã được phê duyệt và xuất bản!',
      });
      setIsApproveModalOpen(false);
      setCourseData((prev: any) => ({
        ...prev,
        course: { ...prev.course, status: 'published' },
      }));
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Lỗi duyệt khóa học',
        message: err?.data?.message || 'Không thể phê duyệt khóa học.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast({
        type: 'warning',
        title: 'Thiếu lý do',
        message: 'Vui lòng nhập lý do từ chối.',
      });
      return;
    }

    setSubmittingAction(true);
    try {
      await rejectCourse(courseId, rejectReason.trim());
      showToast({
        type: 'success',
        title: 'Đã từ chối khóa học',
        message: 'Khóa học đã được chuyển sang trạng thái từ chối.',
      });
      setIsRejectModalOpen(false);
      setCourseData((prev: any) => ({
        ...prev,
        course: { ...prev.course, status: 'rejected', admin_reject_reason: rejectReason.trim() },
      }));
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Lỗi từ chối khóa học',
        message: err?.data?.message || 'Không thể từ chối khóa học.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-stone-400">Đang chuẩn bị phòng kiểm duyệt video & bài giảng...</p>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertCircle className="w-14 h-14 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Không thể tải khóa học</h2>
        <p className="text-stone-400 max-w-md mb-6">{error || 'Khóa học không tồn tại hoặc đã bị xóa.'}</p>
        <button
          onClick={() => navigate('/admin/course-reviews')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách kiểm duyệt
        </button>
      </div>
    );
  }

  const course = courseData.course || {};
  const sections = courseData.sections || [];
  const allLessons = courseData.lessons || [];

  // Determine current media source
  const currentVideoUrl = activeItemType === 'trailer'
    ? resolveMediaUrl(course.intro_video_url)
    : resolveMediaUrl(activeLesson?.video_url);

  const currentTitle = activeItemType === 'trailer'
    ? `🎬 Video Trailer Giới thiệu: ${course.title}`
    : (activeLesson?.title || 'Chưa chọn bài học');

  const isCurrentStatusApproved = course.status === 'published' || course.status === 'approved';
  const isCurrentStatusRejected = course.status === 'rejected';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="h-16 bg-stone-900 border-b border-stone-800 px-4 lg:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate('/admin/course-reviews')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all text-xs font-semibold cursor-pointer shrink-0"
            title="Quay lại danh sách kiểm duyệt"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại kiểm duyệt</span>
          </button>

          <div className="h-5 w-px bg-stone-700 hidden sm:block shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm lg:text-base font-bold text-white truncate max-w-md lg:max-w-xl">
                {course.title}
              </h1>
              <span
                className={cn(
                  'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider',
                  isCurrentStatusApproved
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700'
                    : isCurrentStatusRejected
                    ? 'bg-rose-950/80 text-rose-400 border-rose-700'
                    : 'bg-amber-950/80 text-amber-400 border-amber-700 animate-pulse'
                )}
              >
                ● {isCurrentStatusApproved ? 'Đã duyệt' : isCurrentStatusRejected ? 'Đã từ chối' : 'Chờ kiểm duyệt'}
              </span>
            </div>
            <p className="text-xs text-stone-400 truncate flex items-center gap-2">
              <span>Giảng viên: <strong className="text-stone-300">{course.instructor?.full_name || 'Chưa rõ'}</strong></span>
              <span>•</span>
              <span>Danh mục: <strong className="text-indigo-400">{course.category_name || course.categories?.[0]?.name || 'Chưa có'}</strong></span>
            </p>
          </div>
        </div>

        {/* Quick Moderation Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isCurrentStatusApproved && (
            <button
              onClick={() => setIsApproveModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer hover:scale-102"
              title="Phê duyệt khóa học này ngay lập tức"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Duyệt khóa học</span>
            </button>
          )}

          {!isCurrentStatusRejected && (
            <button
              onClick={() => setIsRejectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer hover:scale-102"
              title="Từ chối phê duyệt và gửi lý do"
            >
              <XCircle className="w-4 h-4" />
              <span>Từ chối</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Layout: Player (Left) + Playlist (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Area: Video Player & Details */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-stone-950">
          {/* Cinematic Player Screen */}
          <div
            ref={playerContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden select-none group"
          >
            {/* Watermark */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none opacity-40 hover:opacity-80 transition-opacity flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-stone-700 text-[10px] font-mono font-bold text-stone-300">
              <Tv className="w-3 h-3 text-indigo-400" />
              <span>MindHub Admin Inspector</span>
            </div>

            {/* Video Player or Fallbacks */}
            {currentVideoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={currentVideoUrl}
                  onClick={togglePlay}
                  className="w-full h-full object-contain cursor-pointer"
                  playsInline
                />

                {/* Big Center Play/Pause Indicator on Hover */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-18 h-18 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 cursor-pointer z-20"
                    aria-label="Phát video"
                  >
                    <Play className="w-8 h-8 ml-1 fill-white" />
                  </button>
                )}

                {/* YouTube-Style Controls Overlay */}
                <div
                  className={cn(
                    'absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8 pb-3 px-4 transition-opacity duration-300',
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  )}
                >
                  {/* Progress Timeline Seeker */}
                  <div className="relative w-full mb-3 flex items-center group/seeker">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeekChange}
                      className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 group-hover/seeker:h-2.5 transition-all"
                    />
                  </div>

                  {/* Bottom Toolbar Controls */}
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-3">
                      {/* Play/Pause */}
                      <button
                        onClick={togglePlay}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                        title={isPlaying ? 'Tạm dừng (Phím Space)' : 'Phát (Phím Space)'}
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                      </button>

                      {/* Rewind 10s */}
                      <button
                        onClick={() => seekBy(-10)}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer text-stone-300 hover:text-white"
                        title="Lùi 10 giây (Phím Mũi tên trái)"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* Forward 10s */}
                      <button
                        onClick={() => seekBy(10)}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer text-stone-300 hover:text-white"
                        title="Tiến 10 giây (Phím Mũi tên phải)"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      {/* Volume Slider */}
                      <div className="flex items-center gap-1.5 group/vol">
                        <button
                          onClick={toggleMute}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                          title="Bật/Tắt âm thanh (Phím M)"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-stone-200" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => changeVolume(parseFloat(e.target.value))}
                          className="w-16 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      {/* Time display */}
                      <span className="font-mono text-stone-300 text-[11px] ml-1">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Speed selector */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="px-2 py-1 rounded hover:bg-white/10 font-mono font-bold text-stone-200 cursor-pointer text-[11px]"
                          title="Tốc độ phát"
                        >
                          {playbackSpeed}x
                        </button>

                        {showSpeedMenu && (
                          <div className="absolute bottom-full right-0 mb-2 py-1 bg-stone-900 border border-stone-700 rounded-lg shadow-xl w-24 text-center z-40">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                              <button
                                key={s}
                                onClick={() => changeSpeed(s)}
                                className={cn(
                                  'w-full py-1 text-xs hover:bg-indigo-600 transition-colors cursor-pointer block',
                                  playbackSpeed === s ? 'text-indigo-400 font-bold' : 'text-stone-300'
                                )}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* PiP */}
                      <button
                        onClick={togglePiP}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer text-stone-300 hover:text-white"
                        title="Hình trong hình (Picture-in-Picture)"
                      >
                        <Tv className="w-4 h-4" />
                      </button>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer text-stone-300 hover:text-white"
                        title="Toàn màn hình (Phím F)"
                      >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : activeLesson?.type === 'document' ? (
              <div className="text-center p-8 max-w-lg">
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-xl">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{activeLesson.title}</h3>
                <p className="text-xs text-stone-400 mb-6">
                  Đây là bài học định dạng Tài liệu (Document). Giảng viên đã đính kèm các tài liệu học tập bên dưới.
                </p>
                {activeLesson.assets && activeLesson.assets.length > 0 ? (
                  <div className="space-y-2">
                    {activeLesson.assets.map((asset: any) => (
                      <a
                        key={asset.id}
                        href={resolveMediaUrl(asset.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 transition-colors text-left"
                      >
                        <span className="text-xs font-medium text-stone-200 truncate">{asset.file_name}</span>
                        <Download className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-lg text-xs text-stone-400">
                    Chưa có tệp đính kèm nào được tải lên cho bài học này.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 max-w-md">
                <Film className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-stone-300 mb-1">Chưa có video cho bài học này</h3>
                <p className="text-xs text-stone-500">
                  {activeItemType === 'trailer'
                    ? 'Khóa học này chưa được tải lên Video Trailer giới thiệu.'
                    : 'Giảng viên chưa tải lên tệp video hoặc đường dẫn video cho bài học.'}
                </p>
              </div>
            )}
          </div>

          {/* Lesson Information Box */}
          <div className="p-6 border-t border-stone-800 bg-stone-900/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase tracking-wide">
                    {activeItemType === 'trailer' ? 'Video Trailer' : (activeLesson?.type || 'Video')}
                  </span>
                  {activeLesson?.is_preview && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ★ Học thử miễn phí (Preview)
                    </span>
                  )}
                  {activeLesson?.total_duration_seconds > 0 && (
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(activeLesson.total_duration_seconds)}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{currentTitle}</h2>
                {activeLesson?.content && (
                  <div className="mt-4 p-4 rounded-xl bg-stone-900 border border-stone-800 text-sm text-stone-300 leading-relaxed prose prose-invert max-w-none">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Nội dung bài học:</h4>
                    <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Course Curriculum Playlist */}
        <div className="w-full lg:w-96 border-l border-stone-800 bg-stone-900 flex flex-col shrink-0">
          <div className="p-4 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Nội dung khóa học</h3>
            </div>
            <span className="text-xs font-mono text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
              {allLessons.length} bài học
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-800/60">
            {/* Trailer Item (If Available) */}
            {course.intro_video_url && (
              <div
                onClick={selectTrailer}
                className={cn(
                  'p-3.5 flex items-center gap-3 cursor-pointer transition-colors border-l-2',
                  activeItemType === 'trailer'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white'
                    : 'hover:bg-stone-800/60 border-transparent text-stone-300'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-900/40 border border-indigo-700/50 flex items-center justify-center shrink-0 text-indigo-400">
                  <Film className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">🎬 Video Trailer Giới thiệu</p>
                  <p className="text-[10px] text-stone-400">Xem trailer quảng bá khóa học</p>
                </div>
              </div>
            )}

            {/* Sections & Lessons */}
            {sections.map((section: any, secIdx: number) => {
              const isExpanded = expandedSections.has(section.id);
              const sectionLessons = allLessons.filter((l: any) => l.section_id === section.id);

              return (
                <div key={section.id} className="bg-stone-900">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-4 py-3 bg-stone-800/40 hover:bg-stone-800/80 transition-colors flex items-center justify-between text-left cursor-pointer border-y border-stone-800/80"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-stone-200 truncate">
                        Chương {secIdx + 1}: {section.title}
                      </p>
                      <p className="text-[10px] text-stone-500">{sectionLessons.length} bài học</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-stone-800/40">
                      {sectionLessons.map((lesson: any) => {
                        const isActive = activeItemType === 'lesson' && activeLesson?.id === lesson.id;
                        return (
                          <div
                            key={lesson.id}
                            onClick={() => selectLesson(lesson)}
                            className={cn(
                              'px-4 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-2 text-left',
                              isActive
                                ? 'bg-indigo-950/60 border-indigo-500 text-white font-semibold'
                                : 'hover:bg-stone-800/40 border-transparent text-stone-400 hover:text-stone-200'
                            )}
                          >
                            <div className="shrink-0 text-stone-500">
                              {lesson.type === 'document' ? (
                                <FileText className={cn('w-4 h-4', isActive && 'text-indigo-400')} />
                              ) : (
                                <Video className={cn('w-4 h-4', isActive && 'text-indigo-400')} />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs truncate leading-snug">{lesson.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {lesson.is_preview && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                    Học thử
                                  </span>
                                )}
                                {lesson.total_duration_seconds > 0 && (
                                  <span className="text-[10px] text-stone-500">
                                    {formatTime(lesson.total_duration_seconds)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Duyệt Khóa Học */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Xác nhận duyệt khóa học?</h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-6">
              Bạn đang duyệt khóa học <strong className="text-stone-200">"{course.title}"</strong>. Khóa học sẽ được xuất bản chính thức và thông báo cho giảng viên.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                disabled={submittingAction}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleApprove}
                disabled={submittingAction}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                {submittingAction ? 'Đang xử lý...' : 'Đồng ý duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Từ Chối Khóa Học */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mb-4 border border-rose-800">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Từ chối duyệt khóa học</h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Vui lòng cung cấp lý do cụ thể để giảng viên biết và chỉnh sửa bài học.
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập chi tiết lý do từ chối (ví dụ: Video bài học số 3 bị lỗi âm thanh, tài liệu chưa đầy đủ...)"
              className="w-full p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-indigo-500 mb-6"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                disabled={submittingAction}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleReject}
                disabled={submittingAction}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                {submittingAction ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
