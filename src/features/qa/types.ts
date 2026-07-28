export interface Question {
  id: string;
  student_name: string;
  student_avatar?: string;
  content: string;
  course_name: string;
  lesson_name: string;
  created_at: string;
  is_answered: boolean;
  reply_count: number;
  status: 'unanswered' | 'answered' | 'hidden';
  device?: string;
  browser?: string;
  is_bookmarked?: boolean;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  user_name: string;
  user_avatar?: string;
  role: 'instructor' | 'student';
  content: string;
  created_at: string;
}

export interface QAFilterState {
  keyword: string;
  status: 'all' | 'answered' | 'unanswered' | 'hidden' | 'bookmarked';
  course: string;
  lesson: string;
  sort: 'newest' | 'oldest';
}
