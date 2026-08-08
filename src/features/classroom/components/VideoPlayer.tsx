import React, { useRef, useEffect } from 'react';
import { Lesson } from '@/shared/types';
import { PlayCircle } from 'lucide-react';

interface VideoPlayerProps {
  activeLesson: Lesson | null;
  onEnded?: () => void;
  onProgress90?: () => void;
  onTimeUpdate?: (currentTimeSeconds: number) => void;
}

export function VideoPlayer({ activeLesson, onEnded, onProgress90, onTimeUpdate }: VideoPlayerProps) {
  const fallbackVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
  const hasTriggered90Ref = useRef(false);

  useEffect(() => {
    hasTriggered90Ref.current = false;
  }, [activeLesson?.id]);

  if (!activeLesson) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-800">
        <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-sm font-semibold">Vui lòng chọn bài học</p>
      </div>
    );
  }

  const videoSrc = activeLesson.videoUrl || fallbackVideoUrl;

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
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

  return (
    <div className="w-full aspect-video bg-black rounded-2xl relative flex items-center justify-center overflow-hidden border border-slate-800 shadow-md">
      <video
        key={activeLesson.id || 'default-lesson'}
        controls
        className="w-full h-full object-contain"
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
        autoPlay={false}
        poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80"
      >
        <source src={videoSrc} type="video/mp4" />
        Trình duyệt của bạn không hỗ trợ thẻ video.
      </video>
    </div>
  );
}
