import React, { useRef, useEffect, useState } from 'react';
import { Lesson } from '@/shared/types';
import { PlayCircle, Loader2 } from 'lucide-react';
import { classroomApi } from '../api';
import { apiFetch } from '@/shared/lib/api-client';
import { resolveMediaUrl } from '@/shared/lib/media-url';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { useVideoProgressTracker } from '../hooks/useVideoProgressTracker';
import bunnyVideosData from '@/shared/data/bunny_videos.json';

const DEFAULT_REAL_COURSE_STREAM = 'https://iframe.mediadelivery.net/embed/724015/7247d775-163c-4ece-a986-71dc6e03ab1a?autoplay=true&loop=false&muted=false&preload=true&responsive=true';

const BUNNY_TITLE_MAP: Record<string, string> = {};
Object.values(bunnyVideosData).forEach((vids: any) => {
  if (Array.isArray(vids)) {
    vids.forEach((v: any) => {
      if (v.title && v.video_id) {
        const normKey = v.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        BUNNY_TITLE_MAP[normKey] = `https://iframe.mediadelivery.net/embed/724015/${v.video_id}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;
      }
    });
  }
});

interface VideoPlayerProps {
  activeLesson: Lesson | null;
  onEnded?: () => void;
  onProgress90?: () => void;
  onTimeUpdate?: (currentTimeSeconds: number) => void;
  onDurationChange?: (durationSeconds: number, durationFormatted: string) => void;
}

const formatSecToMinSec = (sec: number) => {
  if (isNaN(sec) || sec <= 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export function VideoPlayer({ activeLesson, onEnded, onProgress90, onTimeUpdate, onDurationChange }: VideoPlayerProps) {
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(false);
  const [initialStartTime, setInitialStartTime] = useState<number>(0);
  const [watermark, setWatermark] = useState<{ text: string; opacity?: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const hasSeekedInitialRef = useRef(false);
  const hasTriggered90Ref = useRef(false);
  const lastSavedSecondRef = useRef(0);

  const numericLessonId = activeLesson ? parseInt(String(activeLesson.id).replace(/\D/g, ''), 10) : NaN;

  const lessonDuration = (activeLesson as any)?.video_duration_seconds || (activeLesson as any)?.duration_seconds;

  const { trackTimeUpdate, trackPauseOrSeek } = useVideoProgressTracker({
    lessonId: activeLesson ? String(activeLesson.id) : undefined,
    durationSeconds: typeof lessonDuration === 'number' && lessonDuration > 0 ? lessonDuration : undefined,
  });

  // Helper to save video progress to both API and localStorage
  const saveProgress = (seconds: number) => {
    const sec = Math.floor(seconds);
    if (sec <= 0) return; // Avoid wiping resume position on initial video mount
    lastSavedSecondRef.current = sec;

    if (!isNaN(numericLessonId) && numericLessonId > 0) {
      localStorage.setItem(`mindhub_video_time_${numericLessonId}`, String(sec));
      if (activeLesson) {
        const cId = (activeLesson as any).course_id || (activeLesson as any).courseId;
        if (cId) {
          localStorage.setItem(`mindhub_last_lesson_${cId}`, String(activeLesson.id));
        }
      }
      const duration = (activeLesson as any)?.video_duration_seconds || (activeLesson as any)?.duration_seconds;
      const boundedSec = (typeof duration === 'number' && duration > 0) ? Math.min(sec, duration) : sec;
      classroomApi.saveVideoPlaybackRatio(String(numericLessonId), boundedSec, duration).catch(() => {});
    }
  };

  // Keyboard Shortcuts: F (fullscreen), Space (play/pause), Left/Right Arrows (+-5s)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input, textarea, [contenteditable="true"]'))
      ) {
        return;
      }

      // F or f -> Fullscreen toggle
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (containerRef.current) {
          if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen?.().catch(() => {});
          } else {
            document.exitFullscreen?.().catch(() => {});
          }
        }
      }

      // Space -> Toggle Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
          } else {
            videoRef.current.pause();
          }
        } else if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'togglePlay' }), '*');
        }
      }

      // ArrowLeft -> Rewind 5s
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) {
          const targetTime = Math.max(0, videoRef.current.currentTime - 5);
          videoRef.current.currentTime = targetTime;
          saveProgress(targetTime);
        } else if (iframeRef.current?.contentWindow) {
          const currentSaved = parseInt(localStorage.getItem(`mindhub_video_time_${numericLessonId}`) || '0', 10);
          const targetTime = Math.max(0, currentSaved - 5);
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'seek', value: targetTime }), '*');
          saveProgress(targetTime);
        }
      }

      // ArrowRight -> Forward 5s
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        const duration = (activeLesson as any)?.video_duration_seconds || (activeLesson as any)?.duration_seconds || 600;
        if (videoRef.current) {
          const targetTime = Math.min(videoRef.current.duration || duration, videoRef.current.currentTime + 5);
          videoRef.current.currentTime = targetTime;
          saveProgress(targetTime);
        } else if (iframeRef.current?.contentWindow) {
          const currentSaved = parseInt(localStorage.getItem(`mindhub_video_time_${numericLessonId}`) || '0', 10);
          const targetTime = Math.min(duration, currentSaved + 5);
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'seek', value: targetTime }), '*');
          saveProgress(targetTime);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [numericLessonId, activeLesson]);

  // 1. Listen for postMessage from Bunny CDN player / Embed iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }
        if (!data || typeof data !== 'object') return;

        const evtName = data.event || data.type || data.name;
        const curTime = typeof data.currentTime === 'number' ? data.currentTime : (typeof data.data?.currentTime === 'number' ? data.data.currentTime : (typeof data.current_time === 'number' ? data.current_time : undefined));
        const dur = typeof data.duration === 'number' ? data.duration : (typeof data.data?.duration === 'number' ? data.data.duration : undefined);

        if (typeof dur === 'number' && dur > 0) {
          if (onDurationChange) {
            onDurationChange(dur, formatSecToMinSec(dur));
          }
        }

        if (typeof curTime === 'number' && curTime >= 0) {
          trackTimeUpdate(curTime);
          if (onTimeUpdate) {
            onTimeUpdate(curTime);
          }
          saveProgress(curTime);

          if (typeof dur === 'number' && dur > 0 && !hasTriggered90Ref.current) {
            const ratio = curTime / dur;
            if (ratio >= 0.9) {
              hasTriggered90Ref.current = true;
              if (onProgress90) {
                onProgress90();
              }
            }
          }
        }

        if (evtName === 'ended' || data.event === 'ended') {
          trackPauseOrSeek();
          if (onEnded) {
            onEnded();
          }
        } else if (evtName === 'pause' || data.event === 'pause') {
          trackPauseOrSeek();
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [numericLessonId, onTimeUpdate, onProgress90, onEnded, onDurationChange, trackTimeUpdate, trackPauseOrSeek]);

  // 2. Fallback Active Heartbeat Tracker for Iframe Playback
  useEffect(() => {
    if (isNaN(numericLessonId) || numericLessonId <= 0) return;

    // Tick every 4 seconds to sync progress continuously
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const savedTimeStr = localStorage.getItem(`mindhub_video_time_${numericLessonId}`);
        const currentSaved = savedTimeStr ? parseInt(savedTimeStr, 10) : 0;
        const lessonDurationSec = (activeLesson as any)?.video_duration_seconds || (activeLesson as any)?.duration_seconds || 600;
        
        if (currentSaved >= lessonDurationSec) {
          return;
        }

        const nextSec = Math.min(currentSaved + 4, lessonDurationSec);
        
        localStorage.setItem(`mindhub_video_time_${numericLessonId}`, String(nextSec));
        classroomApi.saveVideoPlaybackRatio(String(numericLessonId), nextSec, lessonDurationSec).catch(() => {});
        trackTimeUpdate(nextSec);
        if (onTimeUpdate) onTimeUpdate(nextSec);

        // Check 90% progress threshold
        if (lessonDurationSec > 0 && nextSec >= lessonDurationSec * 0.9 && !hasTriggered90Ref.current) {
          hasTriggered90Ref.current = true;
          if (onProgress90) {
            onProgress90();
          }
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [numericLessonId, activeLesson, onTimeUpdate, onProgress90, trackTimeUpdate]);

  useEffect(() => {
    hasTriggered90Ref.current = false;
    hasSeekedInitialRef.current = false;
    lastSavedSecondRef.current = 0;

    if (!activeLesson) {
      setVideoSrc('');
      setInitialStartTime(0);
      return;
    }

    // 0. Resolve saved playback position immediately before loading any player
    let startSec = 0;
    const progressSec = (activeLesson as any)?.progress?.current_second ?? (activeLesson as any)?.current_second;
    if (typeof progressSec === 'number' && progressSec > 0) {
      startSec = progressSec;
    }
    if (!isNaN(numericLessonId) && numericLessonId > 0) {
      const localSaved = localStorage.getItem(`mindhub_video_time_${numericLessonId}`);
      if (localSaved) {
        const parsed = parseInt(localSaved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          startSec = Math.max(startSec, parsed);
        }
      }
    }
    setInitialStartTime(startSec);

    // 1. Direct check with BUNNY_TITLE_MAP (matches real Bunny lecture video)
    const normTitle = (activeLesson.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const directBunnyEmbed = BUNNY_TITLE_MAP[normTitle];
    if (directBunnyEmbed) {
      setVideoSrc(directBunnyEmbed);
      return;
    }

    // 2. If activeLesson already has a direct valid working videoUrl (like real Bunny embed or mp4)
    if (
      activeLesson.videoUrl &&
      !activeLesson.videoUrl.includes('seed-bunny') &&
      !activeLesson.videoUrl.includes('placeholder')
    ) {
      setVideoSrc(resolveMediaUrl(activeLesson.videoUrl));
      return;
    }

    // 3. If activeLesson has video_id
    if ((activeLesson as any).video_id && !String((activeLesson as any).video_id).includes('seed-bunny')) {
      setVideoSrc(`https://iframe.mediadelivery.net/embed/724015/${(activeLesson as any).video_id}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`);
      return;
    }

    // 4. Fetch secure video stream from Backend API for real lesson
    if (!isNaN(numericLessonId) && numericLessonId > 0) {
      setIsLoadingVideo(true);
      classroomApi.getSecureLessonContent(String(numericLessonId))
        .then(async (lessonData: any) => {
          const item = lessonData?.data || lessonData;
          const backendSec = item?.progress?.current_second ?? item?.current_second;
          if (typeof backendSec === 'number' && backendSec > 0) {
            setInitialStartTime(prev => Math.max(prev, backendSec));
            localStorage.setItem(`mindhub_video_time_${numericLessonId}`, String(backendSec));
          }

          const endpoint = item?.video_access_endpoint || `/learn/lessons/${numericLessonId}/video-url`;
          try {
            const streamRes = await apiFetch<any>(endpoint);
            const streamUrl = streamRes?.stream_url || streamRes?.data?.stream_url || item?.video_url;
            if (
              streamUrl &&
              !streamUrl.includes('seed-bunny')
            ) {
              setVideoSrc(resolveMediaUrl(streamUrl));
              return;
            }
          } catch (eStream) {
            if (
              item?.video_url &&
              !item?.video_url.includes('seed-bunny')
            ) {
              setVideoSrc(resolveMediaUrl(item.video_url));
              return;
            }
          }
          
          if (
            activeLesson.videoUrl &&
            !activeLesson.videoUrl.includes('seed-bunny')
          ) {
            setVideoSrc(resolveMediaUrl(activeLesson.videoUrl));
          } else {
            setVideoSrc(DEFAULT_REAL_COURSE_STREAM);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch secure video stream:', err);
          if (
            activeLesson.videoUrl &&
            !activeLesson.videoUrl.includes('seed-bunny')
          ) {
            setVideoSrc(resolveMediaUrl(activeLesson.videoUrl));
          } else {
            setVideoSrc(DEFAULT_REAL_COURSE_STREAM);
          }
        })
        .finally(() => setIsLoadingVideo(false));

      // Fetch dynamic watermark info for copyright protection
      classroomApi.getLiveWatermarkMetadata(String(numericLessonId))
        .then((res: any) => {
          const wm = res?.data || res;
          if (wm?.text) {
            setWatermark({
              text: wm.text,
              opacity: wm.opacity ?? 0.25,
            });
          }
        })
        .catch(() => {
          setWatermark(null);
        });
    } else if (
      activeLesson.videoUrl &&
      !activeLesson.videoUrl.includes('seed-bunny')
    ) {
      setVideoSrc(resolveMediaUrl(activeLesson.videoUrl));
    } else {
      setVideoSrc(DEFAULT_REAL_COURSE_STREAM);
    }
  }, [activeLesson?.id, numericLessonId]);

  const normalizedSrc = (() => {
    if (!videoSrc) return '';
    let url = videoSrc;
    if (url.includes('.b-cdn.net/') && url.includes('/playlist.m3u8')) {
      const match = url.match(/\.b-cdn\.net\/([^\/]+)\/playlist\.m3u8/);
      if (match && match[1]) {
        url = `https://iframe.mediadelivery.net/embed/724015/${match[1]}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;
      }
    }
    if (url.includes('iframe.mediadelivery.net')) {
      if (!url.includes('responsive=true')) {
        url += `${url.includes('?') ? '&' : '?'}responsive=true`;
      }
      if (initialStartTime > 0 && !url.includes('t=')) {
        url += `&t=${Math.floor(initialStartTime)}`;
      }
    }
    return url;
  })();

  const isIframeEmbed = Boolean(
    normalizedSrc && (
      normalizedSrc.includes('iframe.mediadelivery.net') ||
      normalizedSrc.includes('youtube.com') ||
      normalizedSrc.includes('/embed/')
    )
  );

  // Seek Bunny iframe player to initialStartTime if iframe was ready
  useEffect(() => {
    if (initialStartTime > 0 && isIframeEmbed && iframeRef.current?.contentWindow) {
      const sendSeek = () => {
        try {
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: 'seek', value: initialStartTime }),
            '*'
          );
        } catch (e) {}
      };
      sendSeek();
      const timer = setTimeout(sendSeek, 1200);
      return () => clearTimeout(timer);
    }
  }, [initialStartTime, isIframeEmbed, normalizedSrc]);

  // Sync on page reload / unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoRef.current && !isNaN(numericLessonId) && numericLessonId > 0) {
        const sec = Math.floor(videoRef.current.currentTime);
        if (sec > 0) {
          localStorage.setItem(`mindhub_video_time_${numericLessonId}`, String(sec));
          classroomApi.saveVideoPlaybackRatio(String(numericLessonId), sec).catch(() => {});
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [numericLessonId]);

  if (!activeLesson) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-800">
        <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-sm font-semibold">Vui lòng chọn bài học</p>
      </div>
    );
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const curTime = video.currentTime;
    trackTimeUpdate(curTime);
    if (onTimeUpdate) {
      onTimeUpdate(curTime);
    }

    // Save progress periodically every 5 seconds
    const curSec = Math.floor(curTime);
    if (Math.abs(curSec - lastSavedSecondRef.current) >= 5) {
      saveProgress(curSec);
    }

    if (video.duration > 0 && !hasTriggered90Ref.current) {
      const ratio = curTime / video.duration;
      if (ratio >= 0.9) {
        hasTriggered90Ref.current = true;
        if (onProgress90) {
          onProgress90();
        }
      }
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration > 0 && onDurationChange) {
      onDurationChange(video.duration, formatSecToMinSec(video.duration));
    }
    if (!hasSeekedInitialRef.current && initialStartTime > 0 && initialStartTime < video.duration) {
      video.currentTime = initialStartTime;
      hasSeekedInitialRef.current = true;
    }
  };

  const handlePause = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    trackPauseOrSeek();
    saveProgress(e.currentTarget.currentTime);
  };

  const handleSeeked = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    trackPauseOrSeek();
    saveProgress(e.currentTarget.currentTime);
  };

  const handleEndedInternal = () => {
    trackPauseOrSeek();
    if (videoRef.current) {
      saveProgress(videoRef.current.duration || 0);
    }
    if (onEnded) {
      onEnded();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl"
      style={{ paddingTop: '56.25%' }}
    >
      {isLoadingVideo ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-950">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-xs font-bold text-slate-300">Đang tải luồng video bài học...</p>
        </div>
      ) : isIframeEmbed ? (
        <iframe
          ref={iframeRef}
          key={normalizedSrc}
          src={normalizedSrc}
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
        />
      ) : videoSrc ? (
        <video
          ref={videoRef}
          key={videoSrc}
          controls
          className="absolute inset-0 w-full h-full object-contain bg-black"
          onEnded={handleEndedInternal}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPause={handlePause}
          onSeeked={handleSeeked}
          autoPlay={false}
          poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80"
        >
          <source src={videoSrc} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center bg-slate-950">
          <PlayCircle className="w-12 h-12 opacity-40 text-slate-500" />
          <p className="text-xs font-semibold text-slate-400">Bài học chưa có video hoặc video đang được cập nhật.</p>
        </div>
      )}
      {/* Watermark Overlay for Content Protection (Fixed Top-Left, Submerged High-Contrast Text) */}
      {watermark?.text && (
        <div 
          className="absolute top-2.5 left-3 sm:top-3.5 sm:left-4 pointer-events-none select-none z-[9999] font-mono text-[11px] sm:text-xs font-bold text-slate-900/40 tracking-wider transition-opacity"
          style={{ 
            opacity: watermark.opacity ?? 0.4,
            textShadow: '0 0 2px rgba(255,255,255,0.8), 0 1px 2px rgba(255,255,255,0.6)'
          }}
        >
          {watermark.text}
        </div>
      )}
    </div>
  );
}
