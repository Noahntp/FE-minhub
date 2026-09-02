import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Film, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { instructorApi } from '@/features/instructor/api';
import { getVideoDurationSecondsFromFile, resolveMediaUrl } from '@/shared/utils/format';

interface UploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

// 1. Image Uploader
export const InstructorImageUploader: React.FC<UploaderProps> = ({ value, onChange, label }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);

  const resolvedImageUrl = previewUrl || resolveMediaUrl(value);

  const processFile = async (file: File) => {
    lastFileRef.current = file;
    setError(null);
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp'];
    const hasValidExt = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    
    if (!allowedMimes.includes(file.type.toLowerCase()) && !hasValidExt) {
      setError('Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh không được vượt quá 5MB.');
      return;
    }

    const localBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(localBlobUrl);

    try {
      setUploading(true);
      setProgress(0);
      const res = await instructorApi.uploadInstructorFileWithProgress(
        file, 
        'course_thumbnail',
        (pct) => setProgress(pct)
      );
      if (res && res.url) {
        setProgress(100);
        onChange(res.url);
        if (localBlobUrl) {
          URL.revokeObjectURL(localBlobUrl);
        }
        setPreviewUrl(null);
      } else {
        throw new Error('Không nhận được URL ảnh từ máy chủ.');
      }
    } catch (e: any) {
      console.error('[Upload Thumbnail Error]', e);
      let errorMsg = 'Tải lên thất bại. Vui lòng thử lại.';
      if (e.status === 413) {
        errorMsg = 'Ảnh vượt quá dung lượng máy chủ cho phép.';
      } else if (e.status === 422) {
        errorMsg = e.message || 'Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP (tối đa 5MB).';
      } else if (e.status === 401) {
        errorMsg = 'Phiên đăng nhập đã hết hạn.';
      } else if (e.status === 403) {
        errorMsg = 'Bạn không có quyền cập nhật khóa học này.';
      } else if (e.status === 500) {
        errorMsg = 'Máy chủ không thể lưu ảnh. Vui lòng thử lại.';
      } else if (e.message) {
        errorMsg = e.message;
      }
      setError(errorMsg);
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lastFileRef.current) {
      processFile(lastFileRef.current);
    }
  };

  return (
    <div className="space-y-2 text-left">
      {label && <label className="block text-[10.5px] font-bold text-stone-600 mb-1">{label}</label>}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          uploading ? 'border-emerald-300 bg-emerald-50/20 pointer-events-none' : 'border-slate-200 hover:bg-slate-50'
        }`}
      >
        {resolvedImageUrl ? (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <img src={resolvedImageUrl} alt="Preview" className="w-full max-h-32 object-cover rounded-lg border" />
            <div className="flex items-center justify-between pt-1">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-emerald-700 hover:underline font-bold text-[10px] cursor-pointer"
              >
                Thay đổi ảnh
              </button>
              <button 
                type="button" 
                onClick={() => onChange('')}
                className="text-rose-500 hover:underline font-bold text-[10px] cursor-pointer"
              >
                Xóa ảnh
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
            <p className="text-[10px] text-stone-500 font-bold">Kéo thả ảnh bìa hoặc Click chọn</p>
            <p className="text-[8.5px] text-stone-400">JPG, PNG, WEBP tối đa 5MB</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
          className="hidden" 
          accept="image/*" 
        />
      </div>

      {uploading && (
        <div className="space-y-1 bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5">
          <div className="flex justify-between text-[10px] font-bold text-stone-700">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              {progress >= 100 ? 'Đang xử lý trên máy chủ...' : `Đang tải ảnh lên... ${progress}%`}
            </span>
            <span className="text-emerald-600 font-black">{progress}%</span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-200" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
          {lastFileRef.current && (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[9.5px] font-extrabold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Thử lại
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// 2. Video Uploader (Real Progress + Retry)
export const InstructorVideoUploader: React.FC<UploaderProps & { 
  type: 'course_intro_video' | 'lesson_video';
  onDurationExtracted?: (seconds: number) => void;
}> = ({ value, onChange, label, type, onDurationExtracted }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeBlobUrlRef = useRef<string | null>(null);
  const lastFileRef = useRef<File | null>(null);

  const currentDisplayUrl = previewBlobUrl || value;
  
  // Do not use the image fallback for videos
  let resolvedVideoUrl = '';
  if (currentDisplayUrl && currentDisplayUrl.trim() !== '') {
    resolvedVideoUrl = resolveMediaUrl(currentDisplayUrl);
    if (resolvedVideoUrl.includes('images.unsplash.com')) {
      resolvedVideoUrl = currentDisplayUrl; 
    }
  }

  // Convert YouTube links to embed links if necessary
  const isYouTube = resolvedVideoUrl && (resolvedVideoUrl.includes('youtube.com') || resolvedVideoUrl.includes('youtu.be'));
  const getYoutubeEmbedUrl = (url: string) => {
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(ytRegex);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
  };
  
  if (isYouTube) {
    resolvedVideoUrl = getYoutubeEmbedUrl(resolvedVideoUrl);
  }

  // Call video.load() when resolved URL changes
  useEffect(() => {
    if (videoRef.current && resolvedVideoUrl) {
      videoRef.current.load();
    }
  }, [resolvedVideoUrl]);

  // Clean up blob URL on unmount or before creating new one
  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, []);

  const handleClearVideo = () => {
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    setPreviewBlobUrl(null);
    lastFileRef.current = null;
    setError(null);
    onChange('');
  };

  const processFile = async (file: File) => {
    lastFileRef.current = file;
    setError(null);
    if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type) && !/\.(mp4|mov|webm)$/i.test(file.name)) {
      setError('Chỉ chấp nhận định dạng MP4, MOV hoặc WEBM.');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setError('Dung lượng video không được vượt quá 200MB.');
      return;
    }

    // Revoke previous blob URL if any
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
    }
    const newBlobUrl = URL.createObjectURL(file);
    activeBlobUrlRef.current = newBlobUrl;
    setPreviewBlobUrl(newBlobUrl);

    if (onDurationExtracted) {
      getVideoDurationSecondsFromFile(file)
        .then((sec) => onDurationExtracted(sec))
        .catch((err) => console.warn('Could not extract duration:', err));
    }

    try {
      setUploading(true);
      setProgress(0);

      // Real progress tracking from XMLHttpRequest upload
      const res = await instructorApi.uploadInstructorFileWithProgress(
        file, 
        type, 
        (pct) => setProgress(pct)
      );

      setProgress(100);

      // Once backend upload succeeds, switch to Backend URL and revoke blob URL
      setTimeout(() => {
        if (activeBlobUrlRef.current) {
          URL.revokeObjectURL(activeBlobUrlRef.current);
          activeBlobUrlRef.current = null;
        }
        setPreviewBlobUrl(null);
        onChange(res.url);
        setUploading(false);
      }, 300);
    } catch (e: any) {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
      setPreviewBlobUrl(null);
      setUploading(false);

      let msg = 'Tải video thất bại. Vui lòng thử lại.';
      if (e?.status === 413) {
        msg = 'Video vượt quá dung lượng cho phép của máy chủ (tối đa 200MB).';
      } else if (e?.status === 422) {
        msg = e.message || 'Định dạng video không hợp lệ.';
      } else if (e?.message) {
        msg = e.message;
      }

      setError(msg);
      if (!value) {
        onChange('');
        if (onDurationExtracted) onDurationExtracted(0);
      }
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lastFileRef.current) {
      processFile(lastFileRef.current);
    }
  };

  return (
    <div className="space-y-2 text-left">
      {label && <label className="block text-[10.5px] font-bold text-stone-600 mb-1">{label}</label>}
      <div 
        onClick={() => {
          if (!uploading) fileInputRef.current?.click();
        }}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
          uploading ? 'border-emerald-300 bg-emerald-50/20 cursor-wait' : 'border-slate-200 hover:bg-slate-50 cursor-pointer'
        }`}
      >
        {resolvedVideoUrl ? (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video max-h-36 bg-black rounded-lg overflow-hidden border">
              {isYouTube ? (
                <iframe
                  key={resolvedVideoUrl}
                  src={resolvedVideoUrl}
                  title="YouTube video player"
                  className="w-full h-full object-contain"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  ref={videoRef}
                  key={resolvedVideoUrl}
                  controls 
                  preload="metadata"
                  playsInline
                  className="w-full h-full object-contain"
                >
                  <source 
                    src={resolvedVideoUrl} 
                    type={resolvedVideoUrl.endsWith('.webm') ? 'video/webm' : resolvedVideoUrl.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} 
                  />
                  Trình duyệt không hỗ trợ phát định dạng video này.
                </video>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 border-t pt-2">
              <button 
                type="button" 
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors disabled:opacity-50"
              >
                Thay đổi video
              </button>
              <button 
                type="button" 
                disabled={uploading}
                onClick={handleClearVideo}
                className="text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg font-bold text-[10px] cursor-pointer transition-colors disabled:opacity-50"
              >
                Xóa video
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <Film className="w-6 h-6 text-stone-400 mx-auto mb-1" />
            <p className="text-[10px] text-stone-500 font-bold">Kéo thả file video hoặc Click chọn</p>
            <p className="text-[8.5px] text-stone-400">MP4, MOV, WEBM tối đa 200MB</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
          className="hidden" 
          accept="video/*" 
        />
      </div>

      {uploading && (
        <div className="space-y-1.5 bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-stone-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              {progress >= 100 ? 'Đang xử lý trên máy chủ...' : `Đang tải video lên... ${progress}%`}
            </span>
            <span className="text-emerald-700 font-black">{progress}%</span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-150" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
          {lastFileRef.current && (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[9.5px] font-extrabold cursor-pointer shrink-0 ml-2"
            >
              <RefreshCw className="w-3 h-3" /> Thử lại
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// 3. Asset Uploader (Real Progress + Retry)
interface AssetUploaderProps {
  onAssetUploaded: (asset: { file_url: string; file_name: string; file_type: string; file_size: number; file?: File }) => void;
  label?: string;
}

export const InstructorAssetUploader: React.FC<AssetUploaderProps> = ({ onAssetUploaded, label }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);

  const processFile = async (file: File) => {
    lastFileRef.current = file;
    setError(null);

    const allowedExts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'zip', 'rar', '7z', 'jpg', 'jpeg', 'png', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExts.includes(ext)) {
      setError('Định dạng tài liệu không được hỗ trợ (chấp nhận PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV, ZIP, RAR, 7Z, JPG, PNG).');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Dung lượng tài liệu không được vượt quá 50MB.');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      const res = await instructorApi.uploadInstructorFileWithProgress(
        file, 
        'lesson_asset',
        (pct) => setProgress(pct)
      );
      setProgress(100);
      onAssetUploaded({
        file,
        file_url: res.url,
        file_name: file.name,
        file_type: ext || 'pdf',
        file_size: file.size
      });
    } catch (e: any) {
      let msg = 'Tải lên tài liệu thất bại.';
      if (e?.status === 413) {
        msg = 'Tệp vượt quá dung lượng máy chủ cho phép (tối đa 50MB).';
      } else if (e?.status === 422) {
        msg = e.errors?.file?.[0] || e.message || 'Định dạng tài liệu không được hỗ trợ.';
      } else if (e?.status === 401) {
        msg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (e?.status === 403) {
        msg = 'Bạn không có quyền thêm tài liệu vào bài học này.';
      } else if (e?.status === 404) {
        msg = 'Không tìm thấy bài học.';
      } else if (e?.status === 500) {
        msg = 'Máy chủ không thể lưu tài liệu. Vui lòng thử lại sau.';
      } else if (e?.message) {
        msg = e.message;
      }
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lastFileRef.current) {
      processFile(lastFileRef.current);
    }
  };

  return (
    <div className="space-y-1.5 text-left">
      {label && <label className="block text-[10.5px] font-bold text-stone-600 mb-1">{label}</label>}
      <button 
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full bg-[#f0fdf4] hover:bg-[#e6f4ea] text-[#10b981] border border-emerald-100 py-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <Upload className="w-3.5 h-3.5" /> 
        {uploading ? `Đang tải đính kèm (${progress}%)...` : 'Tải tài liệu đính kèm'}
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
        className="hidden" 
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.rar,.7z,.jpg,.jpeg,.png,.webp"
      />
      {uploading && (
        <div className="w-full bg-emerald-100 rounded-full h-1 overflow-hidden mt-1">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-150" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between text-[9.5px] text-rose-500 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200 mt-1">
          <span>{error}</span>
          {lastFileRef.current && (
            <button
              type="button"
              onClick={handleRetry}
              className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-extrabold cursor-pointer shrink-0 ml-2"
            >
              Thử lại
            </button>
          )}
        </div>
      )}
    </div>
  );
};
