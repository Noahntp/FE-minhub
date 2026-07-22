export interface Question {
  id: string;
  student_name: string;
  content: string;
  course_name: string;
  lesson_name: string;
  created_at: string;
  is_answered: boolean;
  reply_count: number;
}

export interface Reply {
  id: string;
  user_name: string;
  role: 'instructor' | 'student';
  content: string;
  created_at: string;
}

export interface QAFilterState {
  keyword: string;
  status: 'all' | 'answered' | 'unanswered';
  course: string;
  lesson: string;
  sort: 'newest' | 'oldest';
}
