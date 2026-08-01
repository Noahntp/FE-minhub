import { apiFetch, devLog, config, ApiError } from '@/shared/lib/api-client';
import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';

export const coursesApi = {
async testConnection(customUrl?: string): Promise<{ success: boolean; message: string; latency?: number }> {
    const targetUrl = (customUrl || config.baseUrl).replace(/\/$/, '');
    const startTime = Date.now();
    try {
      // Let's do a fast GET request with a small timeout to verify connectivity and CORS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      const response = await fetch(`${targetUrl}/courses`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;
      
      return { 
        success: response.ok || response.status < 500, 
        message: `Kết nối thành công! Mã phản hồi HTTP: ${response.status}.`,
        latency
      };
    } catch (e: any) {
      const latency = Date.now() - startTime;
      console.warn('API connection test failed:', e);
      let errMsg = 'Không thể kết nối. Máy chủ backend chưa phản hồi hoặc chặn CORS.';
      if (e.name === 'AbortError') {
        errMsg = 'Yêu cầu hết thời gian chờ (Timeout).';
      } else if (e.message) {
        errMsg = `Lỗi kết nối: ${e.message}`;
      }
      return { 
        success: false, 
        message: errMsg,
        latency
      };
    }
  },

async getUserEnrollments(userId: string): Promise<any[]> {
    if (!userId || userId === 'u-guest') {
      return [];
    }
    try {
              return await apiFetch<any[]>('/me/courses');
            } catch(e) {
              return [];
            }
  },

async getPublicCoursesByInstructor(instructorId: string): Promise<Course[]> {
    const start = Date.now();
    try {
      return await apiFetch<Course[]>(`/courses?instructor_id=${instructorId}`);
      // Mock logic
      // Match by instructorId
    } catch (err) {
      throw err;
    } finally {
      devLog('API', `getCoursesByInstructor(${instructorId})`, { duration: Date.now() - start });
    }
  },

async getCourses(filters?: any): Promise<Course[]> {
  devLog('Catalog', 'Fetch all active public courses', filters);
  let endpoint = '/courses';
  if (filters) {
          const queryParams = new URLSearchParams();
          Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null) {
              queryParams.append(key, String(filters[key]));
            }
          });
          const queryStr = queryParams.toString();
          if (queryStr) endpoint += `?${queryStr}`;
        }
  return apiFetch<Course[]>(endpoint);
  },

async getFeaturedCourses(): Promise<Course[]> {
  devLog('Catalog', 'Fetch highly rated featured courses');
  return apiFetch<Course[]>('/courses/featured');
  },

async getBestsellerCourses(): Promise<Course[]> {
    devLog('Catalog', 'Fetch best-selling courses');
    try {
              const allCourses = await apiFetch<Course[]>('/courses');
              if (Array.isArray(allCourses)) {
                return allCourses.slice().sort((a: any, b: any) => ((b.enrollments_count || b.students || 0) - (a.enrollments_count || a.students || 0)));
              }
              return [];
            } catch (e) {
              console.warn('Failed to fetch bestseller courses', e);
              return [];
            }
  },

async getLatestCourses(): Promise<Course[]> {
  devLog('Catalog', 'Fetch newly published curriculum');
  return apiFetch<Course[]>('/courses/latest');
  },

async getFilteredSortedCourses(params: any): Promise<Course[]> {
  devLog('Catalog', 'Sort course directory dynamically', params);
  const qParams = new URLSearchParams(params).toString();
  return apiFetch<Course[]>(`/courses/sort?${qParams}`);
  },

async getCourseBySlug(slug: string): Promise<Course> {
  devLog('Catalog', `View public course node payload with slug: ${slug}`);
  return apiFetch<Course>(`/courses/${slug}`);
  },

async getCourseOutline(id: string): Promise<any> {
  devLog('Catalog', `Fetch Syllabus/Outline structure for syllabus ID: ${id}`);
  return apiFetch<any>(`/courses/${id}/outline`);
  },

async getCourseReviews(id: string): Promise<any[]> {
  devLog('Catalog', `Fetch student evaluations and written reviews for course: ${id}`);
  return apiFetch<any[]>(`/courses/${id}/reviews`);
  },

async postCourseReview(id: string, payload: any): Promise<any> {
  devLog('Catalog', `Submit review to course: ${id}`, payload);
  return apiFetch<any>(`/courses/${id}/reviews`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

async getCourseFAQs(id: string): Promise<any[]> {
  devLog('Catalog', `Get detailed FAQ questions for Course ID: ${id}`);
  return apiFetch<any[]>(`/courses/${id}/faqs`);
  },

async getCourseQuestions(id: string, isInternal?: boolean): Promise<any[]> {
      // BACKEND_MISSING
    devLog('Catalog', `Get Q&A questions for Course ID: ${id}, isInternal: ${isInternal}`);
    const qs = isInternal !== undefined ? `?isInternal=${isInternal}` : '';
      return apiFetch<any[]>(`/courses/${id}/questions${qs}`);
  },

async addCourseQuestion(id: string, payload: { authorId: string; content: string; isInternal: boolean; lessonId?: string }): Promise<any> {
      // BACKEND_MISSING
    devLog('Catalog', `Add Q&A question to Course ID: ${id}`, payload);
    return apiFetch<any>(`/courses/${id}/questions`, {
              method: 'POST',
              body: JSON.stringify(payload),
            });
  },

async answerCourseQuestion(id: string, questionId: string, payload: { authorId: string; content: string }): Promise<any> {
      // BACKEND_MISSING
    devLog('Catalog', `Answer Q&A question ID: ${questionId} on Course ID: ${id}`, payload);
    return apiFetch<any>(`/courses/${id}/questions/${questionId}/answers`, {
              method: 'POST',
              body: JSON.stringify(payload),
            });
  },

async getRelatedCourses(courseId: string): Promise<Course[]> {
  devLog('Catalog', `Recommended related modules for course: ${courseId}`);
  return apiFetch<Course[]>(`/courses/${courseId}/related`);
  },

async getPublicInstructorCourses(instructorId: string, filters?: any): Promise<Course[]> {
      // BACKEND_MISSING
    devLog('Catalog', `Fetch courses for instructor ID: ${instructorId}`, filters);
    let endpoint = `/instructors/${instructorId}/courses`;
      if (filters) {
              const queryParams = new URLSearchParams();
              Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null) {
                  queryParams.append(key, String(filters[key]));
                }
              });
              const queryStr = queryParams.toString();
              if (queryStr) endpoint += `?${queryStr}`;
            }
      return apiFetch<Course[]>(endpoint);
  },

async getMyEnrolledCourses(): Promise<Course[]> {
  devLog('Learning', 'Get my bought/enrolled courses library');
  return apiFetch<Course[]>('/me/courses');
  },

async getCourseCertificateStatus(courseId: string): Promise<{ certified: boolean; certificate_url?: string }> {
  devLog('Learning', `Check validation for Graduation status on course: ${courseId}`);
  return apiFetch<any>(`/courses/${courseId}/completion-status`);
  },

async approveCourse(courseId: string): Promise<{ success: boolean }> {
  devLog('Admin', `Approve course ID: ${courseId}`);
  return apiFetch<any>(`/admin/courses/${courseId}/approve`, { method: 'PATCH' });
  },

async rejectCourse(courseId: string, reason: string): Promise<{ success: boolean }> {
  devLog('Admin', `Reject course ID: ${courseId} with reason: ${reason}`);
  return apiFetch<any>(`/admin/courses/${courseId}/reject`, { 
          method: 'PATCH',
          body: JSON.stringify({ reason }) 
        });
  },

async updateCourseChapters(courseId: string, chapters: Chapter[]): Promise<{ success: boolean; chapters: Chapter[] }> {
  devLog('Chapters', `Bulk Sync Curriculum for course ${courseId}`, chapters);
  return apiFetch<{ success: boolean; chapters: Chapter[] }>(`/courses/${courseId}/chapters`, {
          method: 'POST',
          body: JSON.stringify({ chapters }),
        });
  },

async updateCourseStatusAdmin(courseId: string, status: string): Promise<{ success: boolean; message: string }> {
  devLog('Admin', `Update course status to ${status}`, { courseId });
  return apiFetch<{ success: boolean; message: string }>(`/admin/courses/${courseId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
  }
};
