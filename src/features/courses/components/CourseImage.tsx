import { resolveMediaUrl } from "@/shared/lib/media-url";

interface CourseImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function CourseImage({
  src,
  alt,
  className,
}: CourseImageProps) {
  return (
    <img
      src={resolveMediaUrl(src)}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src =
          "/images/course-placeholder.svg";
      }}
    />
  );
}
