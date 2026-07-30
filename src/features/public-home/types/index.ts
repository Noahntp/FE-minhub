export interface PublicCourse {
  id: number | string;
  slug: string;
  title: string;
  instructorName: string;
  instructorAvatar?: string | null;
  thumbnailUrl: string | null;
  rating: number | null;
  reviewCount: number;
  studentCount: number;
  price: number;
  originalPrice: number | null;
  level: string;
  categoryName: string;
  isFeatured?: boolean;
  badge: string | null;
}

export interface PublicCategory {
  id: number | string;
  slug: string;
  name: string;
  courseCount: number;
  iconName: string;
  color?: string;
  bgColor?: string;
}

export interface PublicTestimonial {
  id: number | string;
  name: string;
  role: string;
  avatarUrl: string | null;
  rating: number;
  comment: string;
}

export interface PublicArticle {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  categoryName: string;
  publishedAt: string;
}

export interface PublicStat {
  id: string;
  value: string;
  label: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
}

export interface TrustedCompany {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface PublicHomeData {
  stats: PublicStat[];
  categories: PublicCategory[];
  featuredCourses: PublicCourse[];
  testimonials: PublicTestimonial[];
  articles: PublicArticle[];
  companies: TrustedCompany[];
}

export interface NewsletterFormState {
  email: string;
  loading: boolean;
  submitted: boolean;
  error: string | null;
  successMessage: string | null;
}
