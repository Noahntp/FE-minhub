import { apiFetch, devLog, config, ApiError } from '@/shared/lib/api-client';
import { Course, Chapter, Lesson, Resource, User, QAMessage, StudentProgress, PayoutRequest, AuditLog, InstructorRequest, AccountRequest } from '@/shared/types';

export const classroomApi = {
async getFreeLessonPreview(lessonId: string): Promise<any> {
  devLog('Catalog', `Attempting free sample preview for Lesson ID: ${lessonId}`);
  return apiFetch<any>(`/lessons/${lessonId}/preview`);
  },

async getResumeBookmarkNode(): Promise<any> {
  devLog('Learning', 'Locate last watched session pointer');
  return apiFetch<any>('/learn/resume');
  },

async getStudentCourseOutline(courseId: string): Promise<any> {
  devLog('Learning', `Retrieve syllabus framework with checkmarks for Course: ${courseId}`);
  return apiFetch<any>(`/learn/courses/${courseId}/outline`);
  },

async getStudentCourseProgress(courseId: string): Promise<any> {
  devLog('Learning', `Pull complete detailed study data node: ${courseId}`);
  return apiFetch<any>(`/learn/courses/${courseId}/progress`);
  },

async getSecureLessonContent(lessonId: string): Promise<Lesson> {
  devLog('Learning', `Get secure media payload and attachments for Lesson: ${lessonId}`);
  return apiFetch<Lesson>(`/learn/lessons/${lessonId}`);
  },

async verifyClassroomAccess(lessonId: string): Promise<{ has_access: boolean }> {
  devLog('Learning', `Assert system eligibility node of Lesson ID: ${lessonId}`);
  return apiFetch<{ has_access: boolean }>(`/learn/lessons/${lessonId}/check-access`);
  },

async markLessonAsComplete(lessonId: string, completed: boolean = true): Promise<{ success: boolean }> {
  devLog('Learning', `Setting milestone checkmark to Lesson: ${lessonId}`, { completed });
  return apiFetch<{ success: boolean }>(`/learn/lessons/${lessonId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
  },

async getNextLessonNode(lessonId: string): Promise<any> {
  devLog('Learning', `Find following lesson after node ${lessonId}`);
  return apiFetch<any>(`/learn/lessons/${lessonId}/next`);
  },

async saveVideoPlaybackRatio(lessonId: string, currentSeconds: number, durationSeconds?: number, isCompleted?: boolean): Promise<{ success: boolean }> {
  devLog('Learning', `Syncing video playback bookmark: ${lessonId}`, { current_second: currentSeconds });
  return apiFetch<{ success: boolean }>(`/learn/lessons/${lessonId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({
      current_second: Math.round(currentSeconds),
      duration_second: durationSeconds ? Math.round(durationSeconds) : undefined,
      is_completed: isCompleted,
    }),
  });
  },

async generateSignedAssetUrl(assetId: string): Promise<{ signedUrl: string }> {
  devLog('Learning', `Signing secure credential attachment download token for Asset ${assetId}`);
  return apiFetch<{ signedUrl: string }>(`/learn/assets/${assetId}/signed-url`, { method: 'POST' });
  },

async downloadResourceAsset(assetId: string): Promise<any> {
  devLog('Learning', `Download resource payload for asset node: ${assetId}`);
  return apiFetch<any>(`/learn/assets/${assetId}/download`);
  },

async getLiveWatermarkMetadata(lessonId: string): Promise<{ text: string; alpha: number }> {
  devLog('Learning', `Pull licensing watermark to overlay video player of lesson: ${lessonId}`);
  return apiFetch<{ text: string; alpha: number }>(`/learn/lessons/${lessonId}/watermark-info`);
  },

async getLessonComments(lessonId: string): Promise<any[]> {
  devLog('Learning', `Fetch comments stream for Lesson ID: ${lessonId}`);
  return apiFetch<any[]>(`/lessons/${lessonId}/comments`);
  },

async addLessonComment(lessonId: string, content: string): Promise<any> {
  devLog('Learning', `Post comment to active Lesson ${lessonId}`, { content });
  return apiFetch<any>(`/lessons/${lessonId}/comments`, {
          method: 'POST',
          body: JSON.stringify({ content }),
        });
  },

async replyToLessonComment(commentId: string, content: string): Promise<any> {
  devLog('Learning', `Post nested thread replies to comment node ${commentId}`, { content });
  return apiFetch<any>(`/comments/${commentId}/replies`, {
          method: 'POST',
          body: JSON.stringify({ content }),
        });
  },

async updateStudentProgress(courseId: string, progress: Partial<StudentProgress>): Promise<Partial<StudentProgress>> {
  devLog('Progress', `Sync student study session for: ${courseId}`, progress);
  return apiFetch<StudentProgress>(`/progress/${courseId}`, {
          method: 'PATCH',
          body: JSON.stringify(progress),
        });
  },

async getLessonNotes(lessonId: string): Promise<any[]> {
  devLog('Learning', `Fetch personal notes for Lesson ID: ${lessonId}`);
  return apiFetch<any[]>(`/learn/lessons/${lessonId}/notes`);
  },

async addLessonNote(lessonId: string, content: string, noteTimeSecond: number): Promise<any> {
  devLog('Learning', `Add note for Lesson ${lessonId} at ${noteTimeSecond}s`, { content, noteTimeSecond });
  return apiFetch<any>(`/learn/lessons/${lessonId}/notes`, {
          method: 'POST',
          body: JSON.stringify({ content, note_time_second: noteTimeSecond }),
        });
  },

async deleteLessonNote(noteId: string): Promise<any> {
  devLog('Learning', `Delete note ${noteId}`);
  return apiFetch<any>(`/learn/notes/${noteId}`, {
          method: 'DELETE',
        });
  },

async updateLessonNote(noteId: string, content: string, noteTimeSecond?: number): Promise<any> {
  devLog('Learning', `Update note ${noteId}`);
  return apiFetch<any>(`/learn/notes/${noteId}`, {
          method: 'PUT',
          body: JSON.stringify({ content, note_time_second: noteTimeSecond }),
        });
  }
};
