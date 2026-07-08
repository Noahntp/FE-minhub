import React, { useState } from 'react';
import { QAOverview } from './QAOverview';
import { QAFilter } from './QAFilter';
import { QAList } from './QAList';
import { QADetailView } from './QADetailView';
import { Question, QAFilterState } from './types';

// Mock data
const mockQuestions: Question[] = [
  {
    id: '1',
    student_name: 'Nguyễn Văn A',
    content: 'Tại sao khi setState lại không thấy component re-render ngay lập tức? Làm sao để lấy giá trị mới nhất?',
    course_name: 'React.js Cơ bản',
    lesson_name: 'Bài 2: Hooks',
    created_at: '2026-07-08T09:30:00Z',
    is_answered: false,
    reply_count: 0
  },
  {
    id: '2',
    student_name: 'Trần Thị B',
    content: 'Cho mình hỏi Next.js khác gì so với React thuần, và khi nào nên dùng cái nào?',
    course_name: 'Next.js Thực chiến',
    lesson_name: 'Bài 1: Giới thiệu',
    created_at: '2026-07-07T14:15:00Z',
    is_answered: true,
    reply_count: 1
  }
];

export const InstructorQAModule: React.FC = () => {
  const [filter, setFilter] = useState<QAFilterState>({
    keyword: '',
    status: 'all',
    course: 'all',
    lesson: 'all',
    sort: 'newest'
  });
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Derived state for Overview
  const totalCount = mockQuestions.length;
  const unansweredCount = mockQuestions.filter(q => !q.is_answered).length;
  const answeredCount = mockQuestions.filter(q => q.is_answered).length;

  // Apply filters
  const filteredQuestions = mockQuestions.filter(q => {
    if (filter.status !== 'all') {
      if (filter.status === 'answered' && !q.is_answered) return false;
      if (filter.status === 'unanswered' && q.is_answered) return false;
    }
    
    if (filter.keyword) {
      const lowerKeyword = filter.keyword.toLowerCase();
      return q.content.toLowerCase().includes(lowerKeyword) || q.student_name.toLowerCase().includes(lowerKeyword);
    }
    
    return true;
  });

  const handleFilterChange = (status: 'all' | 'answered' | 'unanswered') => {
    setFilter(prev => ({ ...prev, status }));
  };

  const handleViewDetail = (question: Question) => {
    setSelectedQuestion(question);
  };

  if (selectedQuestion) {
    return <QADetailView question={selectedQuestion} onBack={() => setSelectedQuestion(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Hỏi đáp & Bình luận</h1>
        <p className="text-slate-500">Quản lý và giải đáp thắc mắc của học viên</p>
      </div>

      <QAOverview
        totalCount={totalCount}
        unansweredCount={unansweredCount}
        answeredCount={answeredCount}
        onFilterChange={handleFilterChange}
      />

      <QAFilter filter={filter} setFilter={setFilter} />

      <QAList questions={filteredQuestions} onViewDetail={handleViewDetail} />
    </div>
  );
};
