export function formatCurrency(
  value: number | string | null | undefined,
  currency = "VND"
): string {
  let amount = 0;
  if (typeof value === "number") {
    amount = value;
  } else if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    amount = parseFloat(cleaned);
  }
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

/**
 * Generate clean Vietnamese-friendly URL slug from string
 */
export function generateSlug(value: string): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Format total seconds to mm:ss or hh:mm:ss string
 */
export function formatDuration(totalSeconds: number | string | null | undefined): string {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  return [
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

/**
 * Parse mm:ss or hh:mm:ss or seconds string to total seconds integer
 */
export function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr || !durationStr.trim()) return 0;
  const parts = durationStr.trim().split(':').map(p => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

/**
 * Universal Mapper for Lesson Object to guarantee durationSeconds is always an integer number
 */
export function mapLesson(apiLesson: any): any {
  if (!apiLesson) return null;
  const rawSec = apiLesson.durationSeconds ?? apiLesson.video_duration_seconds ?? apiLesson.duration_seconds ?? apiLesson.duration ?? 0;
  const safeSec = Math.max(0, Math.floor(Number(rawSec) || 0));
  return {
    id: apiLesson.id,
    course_id: apiLesson.course_id ?? apiLesson.courseId,
    course_section_id: apiLesson.course_section_id ?? apiLesson.sectionId ?? apiLesson.section_id,
    title: apiLesson.title || '',
    slug: apiLesson.slug || '',
    lesson_type: apiLesson.lesson_type ?? apiLesson.type ?? 'video',
    type: apiLesson.lesson_type ?? apiLesson.type ?? 'video',
    content: apiLesson.content || '',
    video_url: apiLesson.video_url ?? apiLesson.videoUrl ?? '',
    video_name: apiLesson.video_name ?? apiLesson.videoName ?? '',
    video_size: apiLesson.video_size ?? apiLesson.videoSize ?? '',
    durationSeconds: safeSec,
    video_duration_seconds: safeSec,
    duration_seconds: safeSec,
    is_preview: Boolean(apiLesson.is_preview ?? apiLesson.isPreview ?? false),
    preview_type: apiLesson.preview_type ?? apiLesson.previewType ?? 'none',
    status: apiLesson.status || 'published',
    sort_order: Number(apiLesson.sort_order ?? apiLesson.sortOrder ?? 1),
    resources: apiLesson.resources ?? apiLesson.assets ?? []
  };
}

/**
 * Check if video URL is YouTube or Vimeo
 */
export function isYouTubeOrVimeoUrl(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url || '');
}

/**
 * Extract duration in seconds from local File object using HTMLVideoElement
 */
export async function getVideoDurationSecondsFromFile(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('video/')) {
      reject(new Error("File không phải là định dạng video hợp lệ."));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration);
      cleanup();

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Không đọc được thời lượng video."));
        return;
      }

      resolve(duration);
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Không thể đọc metadata của video."));
    };

    video.src = objectUrl;
  });
}

/**
 * Extract duration in seconds from direct Video URL (mp4, webm, etc.) using HTMLVideoElement
 */
export async function getVideoDurationSecondsFromUrl(url: string): Promise<number> {
  if (!url || isYouTubeOrVimeoUrl(url)) {
    throw new Error("Không thể tự đọc thời lượng từ liên kết này");
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration);
      cleanup();

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Không đọc được thời lượng video."));
        return;
      }

      resolve(duration);
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Không thể đọc metadata của video từ liên kết này."));
    };

    video.src = url;
  });
}

/**
 * Resolve relative or absolute media path to full public media URL or backend URL
 */
export function resolveMediaUrl(path?: string | null): string {
  if (!path) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800';
  if (path.startsWith('blob:') || path.startsWith('data:')) return path;
  if (/^https?:\/\//i.test(path)) {
    if (path.includes('localhost:3000') || path.includes('127.0.0.1:3000')) {
      return path.replace(/http:\/\/(localhost|127\.0\.0\.1):3000/i, 'http://127.0.0.1:8000');
    }
    return path;
  }

  let cleanPath = path.replace(/^\/+/, '');

  // Strip accidental inner /courses/ in thumbnail paths
  if (cleanPath.startsWith('thumbnails/courses/')) {
    cleanPath = cleanPath.replace('thumbnails/courses/', 'thumbnails/');
  }
  if (cleanPath.startsWith('demo/courses/')) {
    cleanPath = cleanPath.replace('demo/courses/', 'thumbnails/');
  }

  // If path is a mindhub-media asset (thumbnails, videos, demo)
  if (cleanPath.startsWith('thumbnails/') || cleanPath.startsWith('videos/') || cleanPath.startsWith('demo/')) {
    return `https://mindhub.io.vn/mindhub-media/${cleanPath}`;
  }

  const backendBase = 'http://127.0.0.1:8000';
  if (cleanPath.startsWith('storage/')) {
    return `${backendBase}/${cleanPath}`;
  }
  return `${backendBase}/storage/${cleanPath}`;
}

