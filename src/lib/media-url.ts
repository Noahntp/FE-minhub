const SERVER_HOST = "62.171.157.22";

export function resolveMediaUrl(
  value?: string | null,
): string {
  if (!value) {
    return "/images/course-placeholder.svg";
  }

  const normalized = value.trim();

  if (!normalized) {
    return "/images/course-placeholder.svg";
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
        // Strip out the host and port, leaving only the path so that Vite proxy can catch it
        // Example: http://62.171.157.22:8081/videos/... -> /videos/...
        return url.pathname + url.search;
      }

      return normalized;
    } catch {
      return normalized;
    }
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  if (normalized.startsWith("storage/")) {
    return `/${normalized}`;
  }

  return `/storage/${normalized}`;
}
