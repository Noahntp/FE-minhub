const SERVER_HOST = "62.171.157.22";

export function resolveMediaUrl(
  value?: string | null,
): string {
  if (!value) {
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800";
  }

  const normalized = value.trim();

  if (!normalized) {
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800";
  }

  if (
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return normalized;
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    try {
      const url = new URL(normalized);

      if (url.hostname === SERVER_HOST) {
        return url.pathname + url.search;
      }

      return normalized;
    } catch {
      return normalized;
    }
  }

  let cleanPath = normalized.replace(/^\/+/, '');

  if (cleanPath.startsWith('thumbnails/courses/')) {
    cleanPath = cleanPath.replace('thumbnails/courses/', 'thumbnails/');
  }
  if (cleanPath.startsWith('demo/courses/')) {
    cleanPath = cleanPath.replace('demo/courses/', 'thumbnails/');
  }

  if (cleanPath.startsWith('thumbnails/') || cleanPath.startsWith('videos/') || cleanPath.startsWith('demo/')) {
    return `https://mindhub.io.vn/mindhub-media/${cleanPath}`;
  }

  if (cleanPath.startsWith("storage/")) {
    return `http://127.0.0.1:8000/${cleanPath}`;
  }

  return `http://127.0.0.1:8000/storage/${cleanPath}`;
}
