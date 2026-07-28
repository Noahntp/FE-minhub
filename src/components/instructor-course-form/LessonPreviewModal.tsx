import React, { useEffect, useRef } from 'react';
import { X, Video, FileText, AlertTriangle } from 'lucide-react';

interface LessonPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  lessonType: 'video' | 'doc';
  videoUrl?: string | null;
  content?: string | null;
  durationStr?: string;
  isPreview?: boolean;
}

export default function LessonPreviewModal({
  isOpen,
  onClose,
  title,
  lessonType,
  videoUrl,
  content,
  durationStr,
  isPreview
}: LessonPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoUrl && videoRef.current) {
      videoRef.current.load();
    }
  }, [isOpen, videoUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 text-xs font-sans text-stone-850">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100 text-emerald-800 text-[9.5px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                Xem trước bài học
              </span>
              {isPreview && (
                <span className="bg-purple-100 text-purple-800 text-[9.5px] font-bold px-2 py-0.5 rounded-full">
                  Học thử miễn phí
                </span>
              )}
            </div>
            <h3 className="text-sm font-black text-stone-900">{title || 'Bài học chưa có tiêu đề'}</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer text-stone-500 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video / Content Display */}
        {lessonType === 'video' ? (
          <div className="space-y-3">
            {videoUrl ? (
              <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-md flex items-center justify-center">
                <video 
                  key={videoUrl}
                  ref={videoRef}
                  controls 
                  playsInline 
                  preload="metadata"
                  className="w-full h-full object-contain"
                >
                  <source src={videoUrl} type="video/mp4" />
                  Trình duyệt không hỗ trợ phát video.
                </video>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-stone-200 rounded-2xl text-center space-y-2 bg-slate-50">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-bold text-stone-700">Bài học này chưa có video để xem trước.</p>
                <p className="text-[10px] text-stone-400">Vui lòng tải lên file video trong mục chỉnh sửa bài học.</p>
              </div>
            )}
            {durationStr && durationStr !== '00:00' && (
              <p className="text-[10.5px] font-bold text-stone-500 text-right">
                Thời lượng: <span className="font-mono text-stone-700">{durationStr}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border min-h-[160px]">
            <h4 className="font-extrabold text-stone-800 flex items-center gap-1.5 border-b pb-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Nội dung bài đọc
            </h4>
            <div className="text-[11px] text-stone-700 leading-relaxed whitespace-pre-wrap">
              {content || 'Chưa có nội dung lý thuyết.'}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end border-t pt-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2 bg-slate-800 hover:bg-stone-900 text-white font-black rounded-xl cursor-pointer"
          >
            Đóng xem trước
          </button>
        </div>
      </div>
    </div>
  );
}
