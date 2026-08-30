import React, { useRef, useEffect, useState } from 'react';
import { Lesson } from '@/shared/types';
import { PlayCircle, Loader2 } from 'lucide-react';
import { classroomApi } from '../api';
import { apiFetch } from '@/shared/lib/api-client';
import { resolveMediaUrl } from '@/shared/lib/media-url';
import { useVideoProgressTracker } from '../hooks/useVideoProgressTracker';

interface VideoPlayerProps {
  activeLesson: Lesson | null;
  onEnded?: () => void;
  onProgress90?: () => void;
  onTimeUpdate?: (currentTimeSeconds: number) => void;
}

export function VideoPlayer({ activeLesson, onEnded, onProgress90, onTimeUpdate }: VideoPlayerProps) {
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(false);
  const hasTriggered90Ref = useRef(false);

  useEffect(() => {
    hasTriggered90Ref.current = false;
    if (!activeLesson) {
      setVideoSrc('');
      return;
    }

    // If activeLesson already has a direct valid videoUrl
    if (activeLesson.videoUrl && !activeLesson.videoUrl.includes('w3schools') && !activeLesson.videoUrl.includes('mov_bbb') && !activeLesson.videoUrl.includes('BigBuckBunny')) {
      setVideoSrc(resolveMediaUrl(activeLesson.videoUrl));
      return;
    }

    // Fetch secure video stream from Backend API for real lesson
    const numericLessonId = parseInt(String(activeLesson.id).replace(/\D/g, ''), 10);
    if (!isNaN(numericLessonId) && numericLessonId > 0) {
      setIsLoadingVideo(true);
      classroomApi.getSecureLessonContent(String(numericLessonId))
        .then(async (lessonData: any) => {
          const item = lessonData?.data || lessonData;
          const endpoint = item?.video_access_endpoint || `/learn/lessons/${numericLessonId}/video-url`;
          try {
            const streamRes = await apiFetch<any>(endpoint);
            const streamUrl = streamRes?.stream_url || streamRes?.data?.stream_url || item?.video_url;
            if (streamUrl) {
              setVideoSrc(resolveMediaUrl(streamUrl));
              return;
            }
          } catch (eStream) {
            if (item?.video_url) {
              setVideoSrc(resolveMediaUrl(item.video_url));
              return;
            }
          }
          if (activeLesson.videoUrl && !activeLesson.videoUrl.includes('w3schools') && !activeLesson.videoUrl.includes('mov_bbb')) {
            setVideoSrc(resolveMediaUrl(activeLesson.videoUrl));
          } else {
            setVideoSrc('');
          }
        })
        .catch((err) => {
          console.warn('Could not fetch secure video stream:', err);
          if (activeLesson.videoUrl && !activeLesson.videoUrl.includes('w3schools') && !activeLesson.videoUrl.includes('mov_bbb')) {
            setVideoSrc(resolveMediaUrl(activeLesson.videoUrl));
          } else {
            setVideoSrc('');
          }
        })
        .finally(() => setIsLoadingVideo(false));
    } else if (activeLesson.videoUrl && !activeLesson.videoUrl.includes('w3schools') && !activeLesson.videoUrl.includes('mov_bbb')) {
      setVideoSrc(resolveMediaUrl(activeLesson.videoUrl));
    } else {
      setVideoSrc('');
    }
  }, [activeLesson?.id]);

  if (!activeLesson) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-800">
        <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-sm font-semibold">Vui lòng chọn bài học</p>
      </div>
    );
  }

  const { trackTimeUpdate, trackPauseOrSeek } = useVideoProgressTracker({
    lessonId: activeLesson?.id,
  });

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    trackTimeUpdate(video.currentTime);
    if (onTimeUpdate) {
      onTimeUpdate(video.currentTime);
    }
    if (video.duration > 0 && !hasTriggered90Ref.current) {
      const ratio = video.currentTime / video.duration;
      if (ratio >= 0.9) {
        hasTriggered90Ref.current = true;
        if (onProgress90) {
          onProgress90();
        }
      }
    }
  };

  const handlePauseOrSeek = () => {
    trackPauseOrSeek();
  };

  return (
    <div className="w-full aspect-video bg-black rounded-2xl relative flex items-center justify-center overflow-hidden border border-slate-800 shadow-md">
      {isLoadingVideo ? (
        <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-xs font-bold text-slate-300">Đang tải luồng video bài học...</p>
        </div>
      ) : videoSrc ? (
        <video
          key={videoSrc}
          controls
          className="w-full h-full object-contain"
          onEnded={() => {
            handlePauseOrSeek();
            if (onEnded) onEnded();
          }}
          onPause={handlePauseOrSeek}
          onSeeked={handlePauseOrSeek}
          onTimeUpdate={handleTimeUpdate}
          autoPlay={false}
          poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80"
        >
          <source src={videoSrc} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
          <PlayCircle className="w-12 h-12 opacity-40 text-slate-500" />
          <p className="text-xs font-semibold text-slate-400">Bài học chưa có video hoặc video đang được cập nhật.</p>
        </div>
      )}
    </div>
  );
}
