import React, { useState, useEffect } from 'react';
import { X, Video, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { InstructorVideoUploader } from './InstructorUploaders';
import { 
  formatDuration, 
  parseDurationToSeconds, 
  generateSlug 
} from '@/shared/utils/format';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    slug: string;
    lesson_type: 'video' | 'doc';
    content: string;
    video_url: string;
    video_duration_seconds: number;
    is_preview: boolean;
    status: string;
    sort_order: number;
  }) => void;
  initialData?: {
    title: string;
    slug: string;
    lesson_type: 'video' | 'doc';
    content: string;
    video_url: string;
    video_duration_seconds: number;
    is_preview: boolean;
    status: string;
    sort_order: number;
  } | null;
}

export default function LessonModal({ isOpen, onClose, onSave, initialData }: LessonModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const [lessonType, setLessonType] = useState<'video' | 'doc'>('video');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [durationStr, setDurationStr] = useState<string>('00:00');
  const [isDurationAuto, setIsDurationAuto] = useState<boolean>(false);
  const [isReadingMetadata, setIsReadingMetadata] = useState<boolean>(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [status, setStatus] = useState('active');
  const [sortOrder, setSortOrder] = useState(1);

  // Complete reset or populate state when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const loadedTitle = initialData.title || '';
      const loadedSlug = initialData.slug || generateSlug(loadedTitle);
      setTitle(loadedTitle);
      setSlug(loadedSlug);
      setIsSlugManuallyEdited(!!initialData.slug);
      
      setLessonType(initialData.lesson_type || 'video');
      setContent(initialData.content || '');
      setVideoUrl(initialData.video_url || '');
      
      const seconds = initialData.video_duration_seconds || 0;
      setDurationSeconds(seconds);
      setDurationStr(formatDuration(seconds));
      setIsDurationAuto(seconds > 0);
      setMetadataError(null);
      setSlugError(null);
      
      setIsPreview(initialData.is_preview || false);
      setStatus(initialData.status || 'active');
      setSortOrder(initialData.sort_order || 1);
    } else {
      // Complete reset for Create Lesson Mode
      setTitle('');
      setSlug('');
      setIsSlugManuallyEdited(false);
      
      setLessonType('video');
      setContent('');
      setVideoUrl('');
      setDurationSeconds(0);
      setDurationStr('00:00');
      setIsDurationAuto(false);
      setIsReadingMetadata(false);
      setMetadataError(null);
      setSlugError(null);
      
      setIsPreview(false);
      setStatus('active');
      setSortOrder(1);
    }
  }, [initialData, isOpen]);

  // Sync title changes to slug if user hasn't edited slug manually
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyEdited) {
      setSlug(val.trim() ? generateSlug(val) : '');
    }
  };

  // Track manual slug modifications
  const handleSlugChange = (val: string) => {
    setSlug(val);
    setIsSlugManuallyEdited(true);
    if (slugError) setSlugError(null);
  };

  // Handle Video URL Change from uploader
  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    setMetadataError(null);

    if (!url || !url.trim()) {
      setDurationSeconds(0);
      setDurationStr('00:00');
      setIsDurationAuto(false);
      setIsReadingMetadata(false);
    }
  };

  // Handle duration extracted directly from local file selection
  const handleDurationExtracted = (sec: number) => {
    if (sec > 0) {
      setDurationSeconds(sec);
      setDurationStr(formatDuration(sec));
      setIsDurationAuto(true);
      setMetadataError(null);
      setIsReadingMetadata(false);
    } else {
      setDurationSeconds(0);
      setDurationStr('00:00');
      setIsDurationAuto(false);
      setIsReadingMetadata(false);
    }
  };

  // Handle Manual Duration Input
  const handleManualDurationChange = (val: string) => {
    setDurationStr(val);
    const parsedSec = parseDurationToSeconds(val);
    setDurationSeconds(parsedSec);
    setIsDurationAuto(false);
  };

  if (!isOpen) return null;

  const isSubmitDisabled = isReadingMetadata || !title.trim() || (
    lessonType === 'video' 
      ? (!videoUrl || !videoUrl.trim() || videoUrl.startsWith('blob:') || durationSeconds <= 0 || !!metadataError)
      : false
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    let finalSeconds = durationSeconds;
    if (lessonType === 'video' && finalSeconds <= 0 && durationStr) {
      finalSeconds = parseDurationToSeconds(durationStr);
    }

    const finalSlug = slug.trim() || generateSlug(title);

    onSave({
      title: title.trim(),
      slug: finalSlug,
      lesson_type: lessonType,
      content,
      video_url: videoUrl,
      video_duration_seconds: lessonType === 'video' ? finalSeconds : 0,
      is_preview: isPreview,
      status,
      sort_order: sortOrder
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-xs font-sans text-stone-850">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-sm font-black text-stone-900">{initialData ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}</h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Title & Slug Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Tiêu đề bài học *</label>
              <input 
                type="text" 
                required 
                value={title} 
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tiêu đề bài học"
                className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Đường dẫn (slug)</label>
              <input 
                type="text" 
                value={slug} 
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="duong-dan-bai-hoc"
                className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/20 focus:outline-none focus:border-emerald-500 font-mono text-[10.5px]"
              />
              {slugError && (
                <p className="text-[9.5px] font-bold text-rose-500 mt-1">{slugError}</p>
              )}
            </div>
          </div>

          {/* Lesson Type & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Loại bài học</label>
              <select 
                value={lessonType} 
                onChange={(e) => setLessonType(e.target.value as any)}
                className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none cursor-pointer"
              >
                <option value="video">Video bài giảng</option>
                <option value="doc">Bài đọc lý thuyết (HTML/Markdown)</option>
              </select>
            </div>
            {lessonType === 'video' && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                  <label className="text-[10.5px] font-bold text-stone-600 whitespace-nowrap">Thời lượng</label>
                  {isDurationAuto && durationSeconds > 0 && !!videoUrl && (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                      Tự động lấy từ video
                    </span>
                  )}
                </div>
                <input 
                  type="text" 
                  value={isReadingMetadata ? 'Đang đọc thời lượng...' : durationStr} 
                  onChange={(e) => handleManualDurationChange(e.target.value)}
                  readOnly={isDurationAuto || isReadingMetadata}
                  placeholder="08:45"
                  className={`w-full text-[11px] font-semibold rounded-xl px-3 py-2 border focus:outline-none transition-all ${
                    isDurationAuto && durationSeconds > 0 && !!videoUrl
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800 font-bold' 
                      : 'bg-slate-50/20 border-slate-200 text-stone-700'
                  }`}
                />
                <p className="text-[9.5px] text-stone-400 font-medium mt-1">
                  {isDurationAuto && durationSeconds > 0 && !!videoUrl ? 'Đã tự động đọc từ video' : 'Định dạng mm:ss hoặc hh:mm:ss'}
                </p>
              </div>
            )}
          </div>

          {/* Conditional Input for Video */}
          {lessonType === 'video' && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border">
              <InstructorVideoUploader 
                value={videoUrl} 
                onChange={(url) => handleVideoUrlChange(url)}
                onDurationExtracted={handleDurationExtracted}
                type="lesson_video" 
                label="Tải lên Video bài học"
              />
              {metadataError && (
                <div className="text-[9.5px] font-medium text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>{metadataError}</span>
                </div>
              )}
            </div>
          )}

          {/* Conditional Input for Doc */}
          {lessonType === 'doc' && (
            <div>
              <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Nội dung bài viết (Markdown/HTML)</label>
              <textarea 
                rows={6} 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung bài viết hướng dẫn..."
                className="w-full text-[11px] font-medium text-stone-700 border border-slate-200 rounded-xl p-2.5 bg-slate-50/20 focus:outline-none"
              />
            </div>
          )}

          {/* Status & Free Preview Checkbox Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <label className="block text-[10.5px] font-bold text-stone-600 mb-1">Trạng thái</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-[11px] font-semibold text-stone-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none cursor-pointer"
              >
                <option value="active">Hoạt động công khai (Active)</option>
                <option value="draft">Bản nháp (Draft)</option>
              </select>
            </div>
            <div className="flex items-center pt-2 sm:pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isPreview} 
                  onChange={(e) => setIsPreview(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-bold text-stone-750 text-[11px]">Học thử miễn phí (Preview)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-bold text-stone-600 cursor-pointer"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitDisabled} 
              className="px-5 py-2 bg-[#10b981] hover:bg-emerald-600 disabled:opacity-50 text-white font-black rounded-xl cursor-pointer transition-all"
            >
              Lưu lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
