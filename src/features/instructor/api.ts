import { apiFetch, apiFetchEnvelope, devLog, config, ApiError } from '@/shared/lib/api-client';
import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';

export const instructorApi = {
async getInstructorProfile(instructorId?: string): Promise<any> {
    devLog('Instructor', 'Fetch professional trainer profile details', { instructorId });
    if (instructorId) {
      return apiFetch<any>(`/users/${instructorId}`);
    }
    return apiFetch<any>('/instructor/profile');
  },

async updateInstructorProfile(payload: any): Promise<any> {
    devLog('Instructor', 'Sync public teacher bio credentials', payload);
    return apiFetch<any>('/instructor/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

async uploadInstructorAvatar(file: File): Promise<any> {
    devLog('Instructor', 'Upload instructor profile avatar', { fileName: file.name, size: file.size });
    const formData = new FormData();
    formData.append('avatar', file);
    return apiFetch<any>('/instructor/profile/avatar', {
      method: 'POST',
      body: formData,
    });
  },

async getInstructorNotificationPreferences(): Promise<any> {
    devLog('Instructor', 'Fetch notification preferences');
    return apiFetch<any>('/instructor/profile/notification-preferences');
  },

async updateInstructorNotificationPreferences(payload: { email_notifications?: boolean; sms_alerts?: boolean }): Promise<any> {
    devLog('Instructor', 'Update notification preferences', payload);
    return apiFetch<any>('/instructor/profile/notification-preferences', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

async getInstructorSessions(): Promise<any> {
    devLog('Instructor', 'Fetch active sessions list');
    return apiFetch<any>('/instructor/profile/sessions');
  },

async revokeOtherInstructorSessions(): Promise<any> {
    devLog('Instructor', 'Revoke other active sessions');
    return apiFetch<any>('/instructor/profile/sessions/others', {
      method: 'DELETE',
    });
  },

async revokeInstructorSession(sessionId: string): Promise<any> {
    devLog('Instructor', `Revoke session ${sessionId}`);
    return apiFetch<any>(`/instructor/profile/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

async getInstructorPrivacySettings(): Promise<any> {
    devLog('Instructor', 'Fetch privacy settings');
    return apiFetch<any>('/instructor/profile/privacy');
  },

async getInstructorAccountStatus(): Promise<any> {
    devLog('Instructor', 'Fetch account status details');
    return apiFetch<any>('/instructor/profile/account-status');
  },

async updateInstructorPrivacySettings(payload: any): Promise<any> {
    devLog('Instructor', 'Update privacy settings', payload);
    return apiFetch<any>('/instructor/profile/privacy', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

async getInstructorNotifications(): Promise<any> {
    devLog('Instructor', 'Fetch instructor system notifications');
    return apiFetch<any>('/instructor/notifications');
  },

async getInstructorUnreadNotificationCount(): Promise<{ unread_count: number }> {
    devLog('Instructor', 'Fetch unread notification count');
    try {
      const res = await apiFetch<any>('/instructor/notifications/unread-count');
      const count = res?.data?.unread_count ?? res?.unread_count ?? (typeof res === 'number' ? res : 0);
      return { unread_count: Math.max(0, Number(count) || 0) };
    } catch {
      return { unread_count: 0 };
    }
  },

async markInstructorNotificationAsRead(id: number | string): Promise<any> {
    devLog('Instructor', `Mark notification ${id} as read`);
    return apiFetch<any>(`/instructor/notifications/${id}/read`, { method: 'PATCH' });
  },

async markAllInstructorNotificationsAsRead(): Promise<any> {
    devLog('Instructor', 'Mark all notifications as read');
    return apiFetch<any>('/instructor/notifications/read-all', { method: 'PATCH' });
  },

async createCourseDraftLegacy(course: Course): Promise<Course> {
    devLog('Instructor', 'Create course draft workspace container', { id: course.id, title: course.title });
    return apiFetch<Course>('/instructor/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    });
  },

async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
    devLog('Instructor', `Update syllabus fields: ${courseId}`, courseData);
    return apiFetch<Course>(`/instructor/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(courseData),
    });
  },

async deleteCourse(courseId: string): Promise<{ success: boolean }> {
    // BACKEND_MISSING
    devLog('Instructor', `Delete draft course: ${courseId}`);
    return apiFetch<{ success: boolean }>(`/instructor/courses/${courseId}`, {
              method: 'DELETE',
            });
  },

async getCoursePublishChecklist(courseId: string): Promise<{ valid: boolean; warnings: string[] }> {
    devLog('Instructor', `Retrieve sanity check audit report before publishing Course ID: ${courseId}`);
    return apiFetch<any>(`/instructor/courses/${courseId}/checklist`);
  },

async getAdminSubmissionReviewNotes(courseId: string): Promise<any[]> {
    devLog('Instructor', `Read audit feedback and issues left by Administrator on: ${courseId}`);
    return apiFetch<any[]>(`/instructor/courses/${courseId}/review-notes`);
  },

async submitCourseToAdminVerificationLegacy(courseId: string): Promise<{ success: boolean }> {
    devLog('Instructor', `Lock blueprint of workspace ${courseId} and submit to moderators`);
    return apiFetch<any>(`/instructor/courses/${courseId}/submit`, { method: 'POST' });
  },

async getInstructorEnrollmentStats(instructorId: string): Promise<{ totalEnrollments: number }> {
      // BACKEND_MISSING
    devLog('Instructor', `Get enrollment stats for instructor ${instructorId}`);
    return apiFetch<{ totalEnrollments: number }>(`/instructor/${instructorId}/enrollment-stats`);
    // Mock
    // Mock
  },

async getInstructorCourses(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
    sort?: string;
  }): Promise<{ data: any[]; meta?: any }> {
    devLog('Instructor', 'Get instructor courses list with params', params);
    const query = new URLSearchParams();
      if (params) {
              if (params.page && params.page > 0) query.append('page', params.page.toString());
              if (params.per_page && params.per_page > 0) query.append('per_page', params.per_page.toString());
              if (params.status && params.status !== 'all') {
                let statusVal = params.status;
                if (statusVal === 'active') statusVal = 'published';
                if (statusVal === 'pending') statusVal = 'pending_review';
                query.append('status', statusVal);
              }
              if (params.search && params.search.trim()) query.append('search', params.search.trim());
              if (params.sort && params.sort !== 'all') {
                let sortVal = params.sort;
                if (sortVal === 'updated_desc') sortVal = 'newest';
                if (sortVal === 'updated_asc') sortVal = 'oldest';
                query.append('sort', sortVal);
              }
            }
      return apiFetchEnvelope<any[]>(`/instructor/courses?${query.toString()}`);
  },

async getInstructorDashboard(params?: any): Promise<any> {
    devLog('Instructor', 'Get dashboard overview stats', params);
    const query = new URLSearchParams();
    if (params) {
      if (params.month) query.append('month', params.month.toString());
      if (params.year) query.append('year', params.year.toString());
      if (params.date_from) query.append('date_from', params.date_from);
      if (params.date_to) query.append('date_to', params.date_to);
    }
    return apiFetch<any>(`/instructor/dashboard?${query.toString()}`);
  },

async getInstructorRevenueChart(paramsOrId?: any, params?: any): Promise<any> {
    let actualParams = params;
    if (paramsOrId && typeof paramsOrId === 'object') {
      actualParams = paramsOrId;
    }
    devLog('Instructor', 'Get revenue chart', actualParams);
    const query = new URLSearchParams();
      if (actualParams) {
              if (actualParams.preset) query.append('preset', actualParams.preset);
              if (actualParams.period) query.append('period', actualParams.period);
              if (actualParams.startDate) query.append('date_from', actualParams.startDate);
              if (actualParams.endDate) query.append('date_to', actualParams.endDate);
              if (actualParams.date_from) query.append('date_from', actualParams.date_from);
              if (actualParams.date_to) query.append('date_to', actualParams.date_to);
              if (actualParams.group_by) query.append('group_by', actualParams.group_by);
              if (actualParams.courseId || actualParams.course_id) query.append('course_id', (actualParams.courseId || actualParams.course_id).toString());
            }
      return apiFetch<any>(`/instructor/dashboard/revenue-chart?${query.toString()}`);
  },

async getInstructorEnrollmentChart(paramsOrId?: any, params?: any): Promise<any> {
    let actualParams = params;
    if (paramsOrId && typeof paramsOrId === 'object') {
      actualParams = paramsOrId;
    }
    devLog('Instructor', 'Get enrollment chart', actualParams);
    const query = new URLSearchParams();
      if (actualParams) {
              if (actualParams.preset) query.append('preset', actualParams.preset);
              if (actualParams.period) query.append('period', actualParams.period);
              if (actualParams.startDate) query.append('date_from', actualParams.startDate);
              if (actualParams.endDate) query.append('date_to', actualParams.endDate);
              if (actualParams.date_from) query.append('date_from', actualParams.date_from);
              if (actualParams.date_to) query.append('date_to', actualParams.date_to);
              if (actualParams.group_by) query.append('group_by', actualParams.group_by);
              if (actualParams.courseId || actualParams.course_id) query.append('course_id', (actualParams.courseId || actualParams.course_id).toString());
            }
      return apiFetch<any>(`/instructor/dashboard/enrollment-chart?${query.toString()}`);
  },

async getInstructorTopCourses(instructorIdOrParams?: any, params?: any): Promise<any> {
    let actualParams = params;
    if (instructorIdOrParams && typeof instructorIdOrParams === 'object') {
      actualParams = instructorIdOrParams;
    }
    devLog('Instructor', 'Get top courses', actualParams);
    const query = new URLSearchParams();
      if (actualParams) {
              if (actualParams.limit) query.append('limit', actualParams.limit.toString());
              if (actualParams.preset) query.append('preset', actualParams.preset);
              if (actualParams.startDate) query.append('date_from', actualParams.startDate);
              if (actualParams.endDate) query.append('date_to', actualParams.endDate);
              if (actualParams.date_from) query.append('date_from', actualParams.date_from);
              if (actualParams.date_to) query.append('date_to', actualParams.date_to);
            }
      return apiFetch<any>(`/instructor/dashboard/top-courses?${query.toString()}`);
  },

async getInstructorIncompleteCourses(params?: any): Promise<any[]> {
    devLog('Instructor', 'Get dashboard incomplete courses', params);
    return apiFetch<any[]>(`/instructor/dashboard/incomplete-courses`);
  },

async getInstructorDashboardAlerts(params?: any): Promise<any[]> {
    devLog('Instructor', 'Get dashboard alerts/notifications', params);
    const query = new URLSearchParams();
      if (params && params.limit) {
              query.append('limit', params.limit.toString());
            }
      return apiFetch<any[]>(`/instructor/dashboard/alerts?${query.toString()}`);
  },

async getInstructorUnansweredQuestions(params?: any): Promise<any> {
    devLog('Instructor', 'Get dashboard unanswered questions', params);
    const query = new URLSearchParams();
      query.append('status', 'unanswered');
      if (params) {
              if (params.course_id) query.append('course_id', params.course_id.toString());
              if (params.lesson_id) query.append('lesson_id', params.lesson_id.toString());
              if (params.page) query.append('page', params.page.toString());
              if (params.per_page) query.append('per_page', params.per_page.toString());
              if (params.search) query.append('search', params.search);
            }
      return apiFetch<any>(`/instructor/questions?${query.toString()}`);
  },

async getInstructorRevenueStats(instructorId: string, params: any): Promise<{ totalRevenue: number, totalGross: number, totalPlatformFee: number, totalTransactions: number, totalStudentsPaid: number }> {
      // BACKEND_MISSING
    devLog('Instructor', `Get revenue stats for instructor ${instructorId}`, params);
    const query = new URLSearchParams();
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      return apiFetch<any>(`/instructor/${instructorId}/revenue-stats?${query.toString()}`);
    // Mock
  },

async getInstructorEnrollments(instructorId: string, params: any): Promise<{ data: any[], meta: any }> {
  devLog('Instructor', `Get enrollments for instructor ${instructorId} with params`, params);
  const query = new URLSearchParams();
  if (params?.courseId && params.courseId !== 'all') query.append('courseId', params.courseId);
  if (params?.status && params.status !== 'all') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);
  if (params?.minProgress !== undefined && params.minProgress !== 'all') query.append('minProgress', params.minProgress);
  if (params?.maxProgress !== undefined && params.maxProgress !== 'all') query.append('maxProgress', params.maxProgress);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  if (params?.page) query.append('page', params.page);
  if (params?.limit) query.append('limit', params.limit);
  return apiFetch<{ data: any[], meta: any }>(`/instructor/${instructorId}/enrollments?${query.toString()}`);
  },

async getInstructorRevenues(instructorId: string, params: any): Promise<{ data: any[], meta: any }> {
  devLog('Instructor', `Get revenues list for instructor ${instructorId}`, params);
  const query = new URLSearchParams();
  if (params.courseId) query.append('courseId', params.courseId);
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  return apiFetch<any>(`/instructor/${instructorId}/revenues?${query.toString()}`);
  },

async getInstructorCourseStudentsList(courseId: string): Promise<any[]> {
  devLog('Instructor', `Query enrolled learner names and active hours for course ${courseId}`);
  return apiFetch<any[]>(`/instructor/courses/${courseId}/learners`);
  },

async getInstructorLearners(params?: any): Promise<any> {
    devLog('Instructor', `Query all learners for instructor`);
    const q = new URLSearchParams();
    if (params) {
      if (params.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params.status && params.status !== 'all') q.set('status', String(params.status));
      if (params.search) q.set('search', String(params.search));
      if (params.preset && params.preset !== '30d') q.set('preset', String(params.preset));
      if (params.date_from) q.set('date_from', String(params.date_from));
      if (params.date_to) q.set('date_to', String(params.date_to));
      if (params.page) q.set('page', String(params.page));
      if (params.per_page) q.set('per_page', String(params.per_page));
    }
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiFetch<any>(`/instructor/learners${queryStr}`);
  },

async getInstructorLearnerDetails(enrollmentId: number | string): Promise<any> {
    devLog('Instructor', `Query learner details for enrollment ${enrollmentId}`);
    return apiFetch<any>(`/instructor/learners/${enrollmentId}`);
  },

async getCourseEngagementAnalytics(courseId: string): Promise<any> {
    devLog('Instructor', `Calculate drop-offs, daily watchtime frequency graphs: ${courseId}`);
    return apiFetch<any>(`/instructor/courses/${courseId}/analytics`);
  },

async uploadInstructorFile(file: File, type: string = 'course_media'): Promise<{ url: string; path?: string }> {
    devLog('Instructor', 'Upload media file', { fileName: file.name, type });
    const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await apiFetch<any>('/instructor/media/upload', {
              method: 'POST',
              body: formData,
            });
      return { 
              url: res?.url || res?.data?.url || res?.file_url || '',
              path: res?.path || res?.data?.path || ''
            };
  },

async createCourseDraft(payload: any): Promise<any> {
    devLog('Instructor', 'Create course draft', payload);
    const backendPayload: any = {
              title: payload.title || 'Khóa học chưa đặt tên',
            };
      if (payload.slug) backendPayload.slug = payload.slug;
      if (payload.category_id || payload.categoryId) {
              backendPayload.category_ids = [Number(payload.category_id || payload.categoryId)];
            }
      if (payload.level) backendPayload.level = payload.level;
      if (payload.language) backendPayload.language = payload.language;
      if (payload.subtitle || payload.short_description) {
              backendPayload.short_description = payload.subtitle ?? payload.short_description;
            }
      if (payload.description) backendPayload.description = payload.description;
      if (payload.price !== undefined) {
              backendPayload.price = typeof payload.price === 'number' ? payload.price : parseFloat(payload.price || 0);
            }
      if (payload.salePrice !== undefined || payload.sale_price !== undefined) {
              const sp = payload.salePrice ?? payload.sale_price;
              backendPayload.sale_price = sp !== null && sp !== undefined ? parseFloat(sp) : null;
            }
      if (payload.image || payload.thumbnail_url) {
              backendPayload.thumbnail_url = payload.image ?? payload.thumbnail_url;
            }
      if (payload.introVideoUrl || payload.intro_video_url) {
              backendPayload.intro_video_url = payload.introVideoUrl ?? payload.intro_video_url;
            }
      if (payload.requirements) {
              backendPayload.requirements = Array.isArray(payload.requirements) ? JSON.stringify(payload.requirements) : payload.requirements;
            }
      if (payload.willLearn || payload.outcomes) {
              const out = payload.willLearn ?? payload.outcomes;
              backendPayload.outcomes = Array.isArray(out) ? JSON.stringify(out) : out;
            }
      return apiFetch<any>('/instructor/courses/draft', {
              method: 'POST',
              body: JSON.stringify(backendPayload),
            });
  },

async updateCourseDraft(id: string | number, payload: any): Promise<any> {
    devLog('Instructor', `Update course draft ID ${id}`, payload);
    const backendPayload: any = {};
      if (payload.title !== undefined) backendPayload.title = payload.title;
      if (payload.slug !== undefined) backendPayload.slug = payload.slug || undefined;
      if (payload.category_id !== undefined || payload.categoryId !== undefined) {
              const catId = payload.category_id || payload.categoryId;
              if (catId) backendPayload.category_ids = [Number(catId)];
            }
      if (payload.level !== undefined) backendPayload.level = payload.level;
      if (payload.language !== undefined) backendPayload.language = payload.language;
      if (payload.subtitle !== undefined || payload.short_description !== undefined) {
              backendPayload.short_description = payload.subtitle ?? payload.short_description;
            }
      if (payload.description !== undefined) backendPayload.description = payload.description;
      if (payload.price !== undefined) {
              backendPayload.price = typeof payload.price === 'number' ? payload.price : parseFloat(payload.price || 0);
            }
      if (payload.salePrice !== undefined || payload.sale_price !== undefined) {
              const sp = payload.salePrice ?? payload.sale_price;
              backendPayload.sale_price = sp !== null && sp !== undefined ? parseFloat(sp) : null;
            }
      if (payload.image !== undefined || payload.thumbnail_url !== undefined) {
              backendPayload.thumbnail_url = payload.image ?? payload.thumbnail_url;
            }
      if (payload.introVideoUrl !== undefined || payload.intro_video_url !== undefined) {
              backendPayload.intro_video_url = payload.introVideoUrl ?? payload.intro_video_url;
            }
      if (payload.requirements !== undefined) {
              backendPayload.requirements = Array.isArray(payload.requirements) ? JSON.stringify(payload.requirements) : payload.requirements;
            }
      if (payload.willLearn !== undefined || payload.outcomes !== undefined) {
              const out = payload.willLearn ?? payload.outcomes;
              backendPayload.outcomes = Array.isArray(out) ? JSON.stringify(out) : out;
            }
      return apiFetch<any>(`/instructor/courses/${id}/draft`, {
              method: 'PATCH',
              body: JSON.stringify(backendPayload),
            });
  },

async getCourseDetail(id: string | number): Promise<any> {
    devLog('Instructor', `Get course detail ID ${id}`);
    return apiFetch<any>(`/instructor/courses/${id}`);
  },

async getCourseContent(id: string | number): Promise<any> {
    devLog('Instructor', `Get course content ID ${id}`);
    return apiFetch<any>(`/instructor/courses/${id}/content`);
  },

async getCourseChecklist(courseId: string | number): Promise<any> {
    devLog('Instructor', `Get course checklist ID ${courseId}`);
    return apiFetch<any>(`/instructor/courses/${courseId}/checklist`);
  },

async submitCourseToAdminVerification(id: string | number): Promise<any> {
    devLog('Instructor', `Submit course ID ${id} for admin review`);
    return apiFetch<any>(`/instructor/courses/${id}/submit`, {
              method: 'POST',
            });
  },

async createSection(payload: any): Promise<any> {
    devLog('Instructor', 'Create section', payload);
    return apiFetch<any>('/instructor/sections', {
              method: 'POST',
              body: JSON.stringify({
                course_id: Number(payload.course_id || payload.courseId),
                title: payload.title,
                sort_order: payload.sort_order || payload.orderIndex || 1,
              }),
            });
  },

async updateSection(id: string | number, payload: any): Promise<any> {
    devLog('Instructor', `Update section ID ${id}`, payload);
    return apiFetch<any>(`/instructor/sections/${id}`, {
              method: 'PATCH',
              body: JSON.stringify({
                title: payload.title,
                sort_order: payload.sort_order || payload.orderIndex,
              }),
            });
  },

async deleteSection(id: string | number): Promise<any> {
    devLog('Instructor', `Delete section ID ${id}`);
    return apiFetch<any>(`/instructor/sections/${id}`, {
              method: 'DELETE',
            });
  },

async createLesson(payload: any): Promise<any> {
    devLog('Instructor', 'Create lesson', payload);
    return apiFetch<any>('/instructor/lessons', {
              method: 'POST',
              body: JSON.stringify({
                course_id: Number(payload.course_id || payload.courseId),
                course_section_id: Number(payload.course_section_id || payload.sectionId),
                title: payload.title,
                lesson_type: payload.lesson_type || payload.type || 'video',
                sort_order: payload.sort_order || payload.orderIndex || 1,
                is_preview: payload.is_preview ?? payload.isPreview ?? false,
                video_url: payload.video_url || payload.videoUrl || undefined,
                video_duration_seconds: payload.video_duration_seconds ?? payload.duration_seconds ?? undefined,
                content: payload.content || payload.docContent || undefined,
              }),
            });
  },

async updateLesson(id: string | number, payload: any): Promise<any> {
    devLog('Instructor', `Update lesson ID ${id}`, payload);
    return apiFetch<any>(`/instructor/lessons/${id}`, {
              method: 'PATCH',
              body: JSON.stringify({
                title: payload.title,
                lesson_type: payload.lesson_type || payload.type,
                sort_order: payload.sort_order || payload.orderIndex,
                is_preview: payload.is_preview ?? payload.isPreview,
                video_url: payload.video_url ?? payload.videoUrl,
                video_duration_seconds: payload.video_duration_seconds ?? payload.duration_seconds,
                content: payload.content ?? payload.docContent,
              }),
            });
  },

async deleteLesson(id: string | number): Promise<any> {
    devLog('Instructor', `Delete lesson ID ${id}`);
    return apiFetch<any>(`/instructor/lessons/${id}`, {
              method: 'DELETE',
            });
  },

async uploadLessonVideo(id: string | number, videoFile: File, durationSeconds?: number): Promise<any> {
    devLog('Instructor', `Upload video for lesson ID ${id}`);
    const formData = new FormData();
      formData.append('video', videoFile);
      if (durationSeconds) formData.append('video_duration_seconds', durationSeconds.toString());
      return apiFetch<any>(`/instructor/lessons/${id}/video`, {
              method: 'POST',
              body: formData,
            });
  },

async uploadLessonAsset(id: string | number, assetFile: File, title?: string): Promise<any> {
    devLog('Instructor', `Upload asset for lesson ID ${id}`);
    const formData = new FormData();
      formData.append('file', assetFile);
      if (title) formData.append('title', title);
      return apiFetch<any>(`/instructor/lessons/${id}/assets`, {
              method: 'POST',
              body: formData,
            });
  },

async getDropoutRiskAnalytics(courseId: string): Promise<any[]> {
  devLog('Instructor', `Running Dropout Predictive heuristics model over students in ${courseId}`);
  return apiFetch<any[]>(`/instructor/courses/${courseId}/learner-risk`);
  },

async getStudioDashboardStats(courseId?: string): Promise<any> {
  devLog('Instructor', 'Query financial statistics and student enrollment graphs', { id: courseId });
  const url = courseId ? `/instructor/courses/${courseId}/dashboard` : '/instructor/courses/dashboard';
  return apiFetch<any>(url);
  },

async getInstructorLessons(): Promise<Lesson[]> {
  devLog('Instructor', 'Fetch all managed classroom content items');
  return apiFetch<Lesson[]>('/instructor/lessons');
  },

async createCourseSectionLesson(payload: any): Promise<Lesson> {
  devLog('Instructor', 'Create section lesson resource', payload);
  return apiFetch<Lesson>('/instructor/lessons', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

async getInstructorLessonDetails(id: string): Promise<Lesson> {
  devLog('Instructor', `View detailed settings metadata for Lesson node: ${id}`);
  return apiFetch<Lesson>(`/instructor/lessons/${id}`);
  },

async updateInstructorLesson(id: string, payload: any): Promise<Lesson> {
  devLog('Instructor', `Update lesson metadata nodes of Lesson: ${id}`, payload);
  return apiFetch<Lesson>(`/instructor/lessons/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
  },

async deleteInstructorLesson(id: string): Promise<{ success: boolean }> {
  devLog('Instructor', `Delete Lesson node: ${id} from workspace`);
  return apiFetch<{ success: boolean }>(`/instructor/lessons/${id}`, { method: 'DELETE' });
  },

async uploadLessonAttachmentFile(lessonId: string, payload: FormData): Promise<any> {
  devLog('Instructor', `Upload document attachment to Lesson placeholder: ${lessonId}`);
  return apiFetch<any>(`/instructor/lessons/${lessonId}/assets`, {
          method: 'POST',
          body: payload, // Send as FormData directly
        });
  },

async toggleLessonPublicSample(lessonId: string, isPreviewable: boolean): Promise<any> {
  devLog('Instructor', `Updating sample allowance flag on Lesson: ${lessonId}`, { isPreviewable });
  return apiFetch<any>(`/instructor/lessons/${lessonId}/preview`, {
          method: 'PATCH',
          body: JSON.stringify({ is_free_preview: isPreviewable }),
        });
  },

async getInstructorQuizzes(): Promise<any[]> {
  devLog('Instructor', 'List quizzes available for inclusion');
  return apiFetch<any[]>('/instructor/quizzes');
  },

async createQuizDraft(quizPayload: any): Promise<any> {
  devLog('Instructor', 'Instantiate a quiz worksheet template', quizPayload);
  return apiFetch<any>('/instructor/quizzes', {
          method: 'POST',
          body: JSON.stringify(quizPayload),
        });
  },

async manageQuizWorksheet(id: string, action: 'GET' | 'PUT' | 'PATCH' | 'DELETE', payload?: any): Promise<any> {
  devLog('Instructor', `Quiz operations pipeline [${action}] to ID: ${id}`);
  return apiFetch<any>(`/instructor/quizzes/${id}`, {
          method: action,
          body: payload ? JSON.stringify(payload) : undefined,
        });
  },

async getCourseSections(): Promise<any[]> {
  devLog('Instructor', 'Sync sections of managed drafts');
  return apiFetch<any[]>('/instructor/sections');
  },

async createCourseSection(payload: any): Promise<any> {
  devLog('Instructor', 'Write section block into workbook', payload);
  return apiFetch<any>('/instructor/sections', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

async getSectionDetails(id: string): Promise<any> {
  devLog('Instructor', `Retrieve setting details on section: ${id}`);
  return apiFetch<any>(`/instructor/sections/${id}`);
  },

async updateInstructorSectionDetails(id: string, payload: any): Promise<any> {
    devLog('Instructor', `Modifying structure of section: ${id}`, payload);
    return apiFetch<any>(`/instructor/sections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

async deleteInstructorSectionDetails(id: string): Promise<{ success: boolean }> {
    devLog('Instructor', `Remove section folder block entirely: ${id}`);
    return apiFetch<{ success: boolean }>(`/instructor/sections/${id}`, { method: 'DELETE' });
  },

async getInstructorCouponSummary(params?: { course_id?: number | string }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.course_id && params.course_id !== 'all') query.append('course_id', String(params.course_id));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<any>(`/instructor/discount-codes/summary${qs}`);
  },

async getInstructorCouponCourseOptions(): Promise<any[]> {
    return apiFetch<any[]>('/instructor/discount-codes/course-options');
  },

async getInstructorCoupons(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    type?: string;
    course_id?: number | string;
    search?: string;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.type && params.type !== 'all') query.append('type', params.type);
    if (params?.course_id && params.course_id !== 'all') query.append('course_id', String(params.course_id));
    if (params?.search) query.append('search', params.search);
    
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<any>(`/instructor/discount-codes${qs}`);
  },

async getInstructorCouponDetail(id: number | string): Promise<any> {
    return apiFetch<any>(`/instructor/discount-codes/${id}`);
  },

async createInstructorCoupon(payload: any): Promise<any> {
    return apiFetch<any>('/instructor/discount-codes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

async updateInstructorCoupon(id: number | string, payload: any): Promise<any> {
    return apiFetch<any>(`/instructor/discount-codes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

async enableInstructorCoupon(id: number | string): Promise<any> {
    return apiFetch<any>(`/instructor/discount-codes/${id}/enable`, {
      method: 'PATCH',
    });
  },

async disableInstructorCoupon(id: number | string): Promise<any> {
    return apiFetch<any>(`/instructor/discount-codes/${id}/disable`, {
      method: 'PATCH',
    });
  },

async deleteInstructorCoupon(id: number | string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/instructor/discount-codes/${id}`, { method: 'DELETE' });
  },

  async getInstructorPromoCoupons(): Promise<any[]> {
    return instructorApi.getInstructorCoupons();
  },

async sendBulkCourseAnnouncement(payload: any): Promise<any> {
  devLog('Instructor', 'Dispatch announcements notifications thread to subscribed students', payload);
  return apiFetch<any>('/instructor/course-announcements', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

async getRevenueReportsSummary(): Promise<any> {
  devLog('Instructor', 'Fetch sales distributions and ledger reports');
  return apiFetch<any>('/instructor/revenue');
  },

async getCompletionRatesReport(): Promise<any[]> {
  devLog('Instructor', 'Compile average lessons completed statistics across student population');
  return apiFetch<any[]>('/instructor/reports/completion-rate');
  },

async getInactiveStudentsRiskList(): Promise<any[]> {
  devLog('Instructor', 'Query for users with zero classroom logins (> 14 days)');
  return apiFetch<any[]>('/instructor/reports/inactive-learners');
  },

async submitBalancePayoutRequest(payload: Partial<PayoutRequest>): Promise<PayoutRequest> {
  devLog('Instructor', 'Submitting finance balance payout request', payload);
  return apiFetch<PayoutRequest>('/instructor/withdrawals', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
  },

async uploadLessonVideoWithProgress(
    file: File, 
    onProgress: (progress: number, status: string) => void,
    lessonId: string = 'new'
  ): Promise<{ success: boolean; videoUrl: string; duration: string }> {
  devLog('Media', 'Upload direct video file request', { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(2)} MB` });
  const formData = new FormData();
  formData.append('video', file);
  return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${config.baseUrl}/instructor/lessons/${lessonId}/video`);
          
          if (config.authToken) {
            xhr.setRequestHeader('Authorization', `Bearer ${config.authToken}`);
          }
          
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              onProgress(percentComplete, 'Đang gửi từng cụm byte lên Cloud Storage...');
            }
          };
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const res = JSON.parse(xhr.responseText);
                resolve(res);
              } catch (err) {
                reject(new Error('Invalid response payload from media server.'));
              }
            } else {
              reject(new Error(`Tải video lỗi: status code ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => reject(new Error('Mất kết nối tới máy chủ lưu trữ HLS.'));
          xhr.send(formData);
        });
  },

async getInstructorRequests(): Promise<InstructorRequest[]> {
  devLog('Auth', 'Get Instructor Requests');
  const data = await apiFetch<any>('/admin/instructor-upgrade-requests');
  return data.requests || data || [];
  },

async getInstructorCoursesByAdmin(userId: string): Promise<Course[]> {
      // BACKEND_MISSING
    devLog('Admin', 'Get instructor courses', { userId });
    const data = await apiFetch<any>(`/admin/users/${userId}/courses`);
      return data.courses || [];
  },

async getInstructorWithdrawalSummary(): Promise<any> {
    devLog('Instructor', 'Get withdrawal summary');
    return apiFetch<any>('/instructor/withdrawals/summary');
  },

async getInstructorBalance(instructorId?: string): Promise<any> {
    devLog('Instructor', 'Get withdrawal summary for balance');
    return apiFetch<any>('/instructor/withdrawals/summary');
  },

async getInstructorPayoutAccounts(params?: any): Promise<any> {
    devLog('Instructor', 'Get payout accounts');
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return apiFetch<any>(`/instructor/payout-accounts${queryString}`);
  },

async getDefaultInstructorPayoutAccount(): Promise<any> {
    devLog('Instructor', 'Get default payout account');
    return apiFetch<any>('/instructor/payout-accounts/default');
  },

async getInstructorPayoutAccount(instructorId?: string): Promise<any> {
    devLog('Instructor', 'Get default payout account');
    return apiFetch<any>('/instructor/payout-accounts/default');
  },

async setDefaultInstructorPayoutAccount(accountId: string | number): Promise<any> {
    devLog('Instructor', 'Set default payout account', { accountId });
    return apiFetch<any>(`/instructor/payout-accounts/${accountId}/set-default`, {
      method: 'PATCH',
    });
  },

async createInstructorPayoutAccount(payload: any): Promise<any> {
    devLog('Instructor', 'Create payout account', payload);
    return apiFetch<any>('/instructor/payout-accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

async verifyInstructorPayoutAccountChange(accountId: string | number, otp: string): Promise<any> {
    devLog('Instructor', 'Verify payout account change OTP', { accountId, otp });
    const id = accountId ? accountId : 0;
    return apiFetch<any>(`/instructor/payout-accounts/${id}/verify-change`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  },

async revealInstructorPayoutAccount(accountId: string | number, payload: { password?: string }): Promise<any> {
    devLog('Instructor', 'Reveal payout account number', { accountId });
    return apiFetch<any>(`/instructor/payout-accounts/${accountId}/reveal`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

async updateInstructorPayoutAccount(idOrInstructorId: string | number, payload: any): Promise<any> {
    devLog('Instructor', 'Update payout account', payload);
    // If first argument is numeric ID, route to PATCH /instructor/payout-accounts/:id
    // Otherwise if it's instructorId string or payload has id, handle gracefully
    const accountId = typeof payload?.id === 'number' || typeof payload?.id === 'string' 
      ? payload.id 
      : idOrInstructorId;
    
    if (accountId && (typeof accountId === 'number' || !isNaN(Number(accountId)))) {
      return apiFetch<any>(`/instructor/payout-accounts/${accountId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }

    return apiFetch<any>('/instructor/payout-accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

async getInstructorWithdrawals(arg1?: any, arg2?: any): Promise<any> {
    devLog('Instructor', 'Get withdrawals list');
    let params: any = {};
    if (typeof arg1 === 'object' && arg1 !== null) {
      params = arg1;
    } else if (typeof arg2 === 'object' && arg2 !== null) {
      params = arg2;
    }
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('per_page', String(params.limit));
    if (params.per_page) query.set('per_page', String(params.per_page));
    if (params.type && params.type !== 'all') query.set('type', String(params.type));
    if (params.status && params.status !== 'all') query.set('status', String(params.status));
    if (params.date_from) query.set('date_from', String(params.date_from));
    if (params.date_to) query.set('date_to', String(params.date_to));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<any>(`/instructor/withdrawals${queryString}`);
  },

async getInstructorWithdrawal(withdrawalId: string | number): Promise<any> {
    devLog('Instructor', 'Get withdrawal detail', { withdrawalId });
    return apiFetch<any>(`/instructor/withdrawals/${withdrawalId}`);
  },

async createInstructorEarlyWithdrawal(payload: { amount: number; payout_account_id?: number | string; otp: string }): Promise<any> {
    devLog('Instructor', 'Create early withdrawal', payload);
    return apiFetch<any>('/instructor/early-withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

async createInstructorWithdrawal(arg1: any, arg2?: any): Promise<any> {
    const payload = typeof arg1 === 'object' ? arg1 : arg2;
    devLog('Instructor', 'Create withdrawal', payload);
    return apiFetch<any>('/instructor/withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

async cancelInstructorWithdrawal(withdrawalId: string | number): Promise<any> {
    devLog('Instructor', 'Cancel withdrawal request', { withdrawalId });
    return apiFetch<any>(`/instructor/early-withdrawals/${withdrawalId}/cancel`, {
      method: 'PATCH',
    });
  },

async getInstructorTransactions(instructorId: string, params: any): Promise<any> {
  devLog('Instructor', 'Get transaction history');
  const query = new URLSearchParams(params).toString();
  return apiFetch<any>(`/instructor/credit-transactions?${query}`);
  },

async getInstructorTransactionDetails(transactionId: string | number): Promise<any> {
  devLog('Instructor', 'Get transaction details');
  return apiFetch<any>(`/instructor/transactions/${transactionId}/details`);
  },

async getInstructorQAStats(instructorId: string): Promise<any> {
      // BACKEND_MISSING
    return apiFetch<any>(`/instructor/${instructorId}/qa-stats`);
  },

async getInstructorQuestions(arg1?: any, arg2?: any): Promise<any> {
    const params = typeof arg1 === 'object' ? (arg1 || {}) : (arg2 || {});
      const q = new URLSearchParams();
      if (params.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params.courseId && params.courseId !== 'all') q.set('course_id', String(params.courseId));
      if (params.lesson_id && params.lesson_id !== 'all') q.set('lesson_id', String(params.lesson_id));
      if (params.lessonId && params.lessonId !== 'all') q.set('lesson_id', String(params.lessonId));
      if (params.status && params.status !== 'all') q.set('status', String(params.status));
      if (params.filter && params.filter !== 'all') q.set('status', String(params.filter));
      if (params.search && params.search.trim()) q.set('search', params.search.trim());
      if (params.sort) q.set('sort', params.sort);
      if (params.page) q.set('page', String(params.page));
      if (params.per_page || params.limit) q.set('per_page', String(params.per_page || params.limit));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/questions${queryString}`);
  },

async replyToQuestion(instructorId: string, questionId: string, payload: any): Promise<any> {
      // BACKEND_MISSING
    return apiFetch<any>(`/instructor/${instructorId}/questions/${questionId}/reply`, {
              method: 'POST',
              body: JSON.stringify(payload)
            });
  },

async getInstructorCoursesList(): Promise<any[]> {
    return apiFetch<any[]>('/instructor/courses');
  },

async getInstructorCourse(id: string): Promise<any> {
    return apiFetch<any>(`/instructor/courses/${id}`);
  },

async createInstructorCourse(payload: any): Promise<any> {
    return apiFetch<any>('/instructor/courses', {
              method: 'POST',
              body: JSON.stringify(payload)
            });
  },

async updateInstructorCourse(id: string, payload: any): Promise<any> {
    return apiFetch<any>(`/instructor/courses/${id}`, {
              method: 'PATCH',
              body: JSON.stringify(payload)
            });
  },

async submitInstructorCourseReview(id: string): Promise<any> {
    return apiFetch<any>(`/instructor/courses/${id}/submit`, { method: 'POST' });
  },

async deleteInstructorCourse(id: string | number): Promise<any> {
    return apiFetch<any>(`/instructor/courses/${id}`, {
              method: 'DELETE'
            });
  },

async hideInstructorCourse(id: string | number): Promise<any> {
    return apiFetch<any>(`/instructor/courses/${id}/hide`, {
              method: 'PATCH'
            });
  },

async unhideInstructorCourse(id: string | number): Promise<any> {
    return apiFetch<any>(`/instructor/courses/${id}/unhide`, {
              method: 'PATCH'
            });
  },

async getInstructorCourseSections(courseId: string): Promise<any[]> {
    return apiFetch<any[]>(`/instructor/courses/${courseId}/sections`);
  },

async createInstructorCourseSection(courseId: string, payload: any): Promise<any> {
    return apiFetch<any>(`/instructor/courses/${courseId}/sections`, {
              method: 'POST',
              body: JSON.stringify(payload)
            });
  },

async updateCourseSection(sectionId: string, payload: any): Promise<any> {
    return apiFetch<any>(`/instructor/sections/${sectionId}`, {
              method: 'PATCH',
              body: JSON.stringify(payload)
            });
  },

async deleteCourseSection(sectionId: string): Promise<any> {
    return apiFetch<any>(`/instructor/sections/${sectionId}`, {
              method: 'DELETE'
            });
  },

async getCourseLessons(courseId: string): Promise<any[]> {
    return apiFetch<any[]>(`/instructor/courses/${courseId}/lessons`);
  },

async getLessonAssets(lessonId: string): Promise<any[]> {
    return apiFetch<any[]>(`/instructor/lessons/${lessonId}/assets`);
  },

async createLessonAsset(lessonId: string | number, payload: any): Promise<any> {
    if (payload.file instanceof File) {
              const formData = new FormData();
              formData.append('file', payload.file);
              if (payload.title) formData.append('title', payload.title);
              if (payload.note) formData.append('note', payload.note);
              return apiFetch<any>(`/instructor/lessons/${lessonId}/assets`, {
                method: 'POST',
                body: formData,
              });
            }
      return apiFetch<any>(`/instructor/lessons/${lessonId}/assets`, {
              method: 'POST',
              body: JSON.stringify(payload)
            });
  },

async deleteLessonAsset(assetId: string): Promise<any> {
    return apiFetch<any>(`/instructor/assets/${assetId}`, {
              method: 'DELETE'
            });
  },

async getInstructorQuestionSummary(params?: { course_id?: string | number; lesson_id?: string | number }): Promise<any> {
    const q = new URLSearchParams();
      if (params?.course_id) q.set('course_id', String(params.course_id));
      if (params?.lesson_id) q.set('lesson_id', String(params.lesson_id));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/questions/summary${queryString}`);
  },

async getInstructorQuestionCourseOptions(): Promise<any> {
    return apiFetch<any>(`/instructor/questions/course-options`);
  },

async getInstructorQuestionLessonOptions(course_id?: string | number): Promise<any> {
    const q = course_id && course_id !== 'all' ? `?course_id=${course_id}` : '';
      return apiFetch<any>(`/instructor/questions/lesson-options${q}`);
  },

async getInstructorQuestion(id: string | number): Promise<any> {
    return apiFetch<any>(`/instructor/questions/${id}`);
  },

async replyInstructorQuestion(id: string | number, payload: { content: string; is_official?: boolean; notify_learner?: boolean } | string): Promise<any> {
    const bodyData = typeof payload === 'string' 
              ? { content: payload, is_official: true, notify_learner: true } 
              : payload;
      return apiFetch<any>(`/instructor/questions/${id}/reply`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bodyData)
            });
  },

async starInstructorQuestion(id: string | number): Promise<any> {
    return apiFetch<any>(`/instructor/questions/${id}/star`, { method: 'POST' });
  },

async unstarInstructorQuestion(id: string | number): Promise<any> {
    return apiFetch<any>(`/instructor/questions/${id}/star`, { method: 'DELETE' });
  },

async updateInstructorQuestionStatus(id: string | number, status: string): Promise<any> {
    return apiFetch<any>(`/instructor/questions/${id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
            });
  },

async updateInstructorQuestionReply(questionId: string | number, replyId: string | number, payload: { content: string; is_official?: boolean }): Promise<any> {
    return apiFetch<any>(`/instructor/questions/${questionId}/replies/${replyId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
  },

async deleteInstructorQuestionReply(questionId: string | number, replyId: string | number): Promise<any> {
    return apiFetch<any>(`/instructor/questions/${questionId}/replies/${replyId}`, {
              method: 'DELETE'
            });
  },

async deleteInstructorQuestion(id: string | number): Promise<any> {
    return apiFetch<any>(`/instructor/questions/${id}`, {
              method: 'DELETE'
            });
  },

async hideInstructorQuestion(id: string | number): Promise<any> {
    return apiFetch<any>(`/instructor/questions/${id}/hide`, {
              method: 'PATCH'
            });
  },

async getInstructorLearnersSummary(params?: { course_id?: string | number; status?: string; preset?: string; date_from?: string; date_to?: string }): Promise<any> {
    const q = new URLSearchParams();
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params?.status && params.status !== 'all') q.set('status', String(params.status));
      if (params?.preset && params.preset !== '30d') q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/learners/summary${queryString}`);
  },

async getInstructorLearnersChart(params?: { course_id?: string | number; status?: string; days?: number; preset?: string; date_from?: string; date_to?: string }): Promise<any> {
    const q = new URLSearchParams();
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params?.status && params.status !== 'all') q.set('status', String(params.status));
      if (params?.preset && params.preset !== '30d') q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      if (params?.days) q.set('days', String(params.days));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/learners/chart${queryString}`);
  },

async exportInstructorLearners(params?: { course_id?: string | number; status?: string; search?: string; preset?: string; date_from?: string; date_to?: string }): Promise<any> {
    const q = new URLSearchParams();
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params?.status && params.status !== 'all') q.set('status', String(params.status));
      if (params?.search) q.set('search', String(params.search));
      if (params?.preset && params.preset !== '30d') q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/learners/export${queryString}`);
  },

async getInstructorRevenueSummary(params?: { preset?: string; date_from?: string; date_to?: string; course_id?: string | number }): Promise<any> {
    const q = new URLSearchParams();
      if (params?.preset) q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/revenues/summary${queryString}`);
  },

async getInstructorRevenueCourseBreakdown(params?: { preset?: string; date_from?: string; date_to?: string }): Promise<any> {
    const q = new URLSearchParams();
      if (params?.preset) q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/revenues/course-breakdown${queryString}`);
  },

async getInstructorRevenueDetails(params?: { page?: number; per_page?: number; preset?: string; date_from?: string; date_to?: string; course_id?: string | number; status?: string; search?: string }): Promise<any> {
    const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.per_page) q.set('per_page', String(params.per_page));
      if (params?.preset) q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      if (params?.status && params.status !== 'all') q.set('status', String(params.status));
      if (params?.search) q.set('search', String(params.search));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/revenues/details${queryString}`);
  },

async exportInstructorRevenues(params?: { preset?: string; date_from?: string; date_to?: string; course_id?: string | number }): Promise<any> {
    const q = new URLSearchParams();
      if (params?.preset) q.set('preset', String(params.preset));
      if (params?.date_from) q.set('date_from', String(params.date_from));
      if (params?.date_to) q.set('date_to', String(params.date_to));
      if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
      const queryString = q.toString() ? `?${q.toString()}` : '';
      return apiFetch<any>(`/instructor/revenues/export${queryString}`);
  },

  async exportInstructorRevenuesBlob(params?: { preset?: string; date_from?: string; date_to?: string; course_id?: string | number }): Promise<Blob> {
    devLog('Instructor', 'Export revenues list to CSV Blob', params);
    const q = new URLSearchParams();
    if (params?.preset) q.set('preset', String(params.preset));
    if (params?.date_from) q.set('date_from', String(params.date_from));
    if (params?.date_to) q.set('date_to', String(params.date_to));
    if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
    const queryString = q.toString() ? `?${q.toString()}` : '';

    const baseUrl = config.baseUrl || 'http://127.0.0.1:8000/api';
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const token = config.authToken || localStorage.getItem('mindhub_api_token') || localStorage.getItem('token') || '';

    const response = await fetch(`${cleanBase}/instructor/revenues/export${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`Không thể xuất báo cáo doanh thu (Mã lỗi: ${response.status})`);
    }
    return response.blob();
  },

  async exportInstructorLearnersBlob(params?: { course_id?: string | number; status?: string; preset?: string; date_from?: string; date_to?: string; search?: string }): Promise<Blob> {
    devLog('Instructor', 'Export learners list to CSV Blob', params);
    const q = new URLSearchParams();
    if (params?.course_id && params.course_id !== 'all') q.set('course_id', String(params.course_id));
    if (params?.status && params.status !== 'all') q.set('status', String(params.status));
    if (params?.preset && params.preset !== '30d') q.set('preset', String(params.preset));
    if (params?.date_from) q.set('date_from', String(params.date_from));
    if (params?.date_to) q.set('date_to', String(params.date_to));
    if (params?.search) q.set('search', String(params.search));
    const queryString = q.toString() ? `?${q.toString()}` : '';

    const baseUrl = config.baseUrl || 'http://127.0.0.1:8000/api';
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const token = config.authToken || localStorage.getItem('mindhub_api_token') || localStorage.getItem('token') || '';

    const response = await fetch(`${cleanBase}/instructor/learners/export${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`Không thể xuất báo cáo học viên (Mã lỗi: ${response.status})`);
    }
    return response.blob();
  },

  async toggleCourseFeatured(courseId: number, isFeatured: boolean): Promise<any> {
    devLog('Instructor', `Toggle course ${courseId} featured status to ${isFeatured}`);
    return apiFetch<any>(`/instructor/courses/${courseId}/featured`, {
      method: 'PATCH',
      body: JSON.stringify({ is_featured: isFeatured }),
    });
  }
};
