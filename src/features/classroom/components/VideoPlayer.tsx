import React from 'react';
import { Lesson } from '@/shared/types';
import { PlayCircle } from 'lucide-react';

interface VideoPlayerProps {
  activeLesson: Lesson | null;
  onEnded?: () => void;
}

export function VideoPlayer({ activeLesson, onEnded }: VideoPlayerProps) {
  if (!activeLesson) {
    return (
      <div className="w-full aspect-video bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
        <p>Vui lòng chọn bài học</p>
      </div>
    );
  }

  // If there's a videoUrl and it's an mp4, use standard video player
  // Otherwise, fallback to a placeholder
  const isVideo = activeLesson.type === 'video' || activeLesson.videoUrl;

  return (
    <div className="w-full aspect-video bg-black relative flex items-center justify-center overflow-hidden">
      {isVideo && activeLesson.videoUrl ? (
        <video 
          key={activeLesson.id} // Ensure video re-mounts on lesson change
          controls 
          className="w-full h-full object-contain"
          onEnded={onEnded}
          autoPlay
        >
          <source src={activeLesson.videoUrl} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      ) : (
        <div className="text-center p-6 text-slate-300">
          <PlayCircle className="w-16 h-16 mb-4 opacity-50 mx-auto" />
          <h3 className="text-xl font-bold mb-2">{activeLesson.title}</h3>
          <p className="text-sm opacity-80">
            {activeLesson.type === 'quiz' ? 'Bài kiểm tra / Quiz' 
              : activeLesson.type === 'assignment' ? 'Bài tập / Assignment' 
              : 'Tài liệu / Document'}
          </p>
          {activeLesson.type !== 'video' && (
            <button 
              className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium"
              onClick={onEnded}
            >
              Hoàn thành bài học
            </button>
          )}
        </div>
      )}
    </div>
  );
}
