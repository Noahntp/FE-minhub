import { api } from "@/lib/api";

export interface CourseInstructor {
  id: number;
  full_name: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  intro_video_url?: string | null;
  price: number | string;
  sale_price?: number | string | null;
  level: string;
  status: string;
  total_duration_seconds?: number;
  instructor?: CourseInstructor;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export async function getCourses(
  params?: Record<string, string | number>,
): Promise<Course[]> {
  const response = await api.get<
    Course[] | PaginatedResponse<Course>
  >("/courses", {
    params,
  });

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.data ?? [];
}

export async function getFeaturedCourses(): Promise<Course[]> {
  const response = await api.get<
    Course[] | { data: Course[] }
  >("/courses/featured");

  return Array.isArray(response.data)
    ? response.data
    : response.data.data ?? [];
}

export async function getLatestCourses(): Promise<Course[]> {
  const response = await api.get<
    Course[] | { data: Course[] }
  >("/courses/latest");

  return Array.isArray(response.data)
    ? response.data
    : response.data.data ?? [];
}

export async function getCourseBySlug(
  slug: string,
): Promise<Course> {
  const response = await api.get<
    Course | { data: Course }
  >(`/courses/${encodeURIComponent(slug)}`);

  return "data" in response.data
    ? response.data.data
    : response.data;
}

export async function getMyCourses(): Promise<Course[]> {
  const response = await api.get<
    Course[] | { data: Course[] }
  >("/me/courses");

  return Array.isArray(response.data)
    ? response.data
    : response.data.data ?? [];
}

export async function getInstructorCourses(): Promise<Course[]> {
  const response = await api.get<
    Course[] | { data: Course[] }
  >("/instructor/courses");

  return Array.isArray(response.data)
    ? response.data
    : response.data.data ?? [];
}
