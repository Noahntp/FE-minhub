import React, { useState, useEffect, useCallback } from 'react';
import { QAOverview } from './QAOverview';
import { QAFilter } from './QAFilter';
import { QAList } from './QAList';
import { QADetailView } from './QADetailView';
import { Question, QAFilterState, Reply } from './types';
import { HelpCircle, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { ApiService } from '../../services/api';

const mapBackendQuestion = (q: any): Question => {
  const isAns = q.is_answered ?? (q.question_status === 'answered' || q.status === 'answered');
  return {
    id: String(q.id || q.comment_id),
    student_name: q.learner?.full_name || q.learner_name || 'Học viên',
    student_avatar: q.learner?.avatar_url || q.learner_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(q.learner?.full_name || 'HV')}&background=007A64&color=fff&bold=true`,
    content: q.content || '',
    course_name: q.course?.title || q.course_title || 'Khóa học',
    lesson_name: q.lesson?.title || q.lesson_title || 'Bài học',
    created_at: q.created_at || new Date().toISOString(),
    is_answered: isAns,
    reply_count: q.reply_count ?? q.replies?.length ?? 0,
    status: q.status === 'hidden' ? 'hidden' : (isAns ? 'answered' : 'unanswered'),
    device: q.learnerDevice || q.device || 'Windows',
    browser: q.learnerBrowser || q.browser || 'Chrome 124.0',
    is_bookmarked: !!q.is_bookmarked,
    replies: Array.isArray(q.replies) ? q.replies.map((r: any) => ({
      id: String(r.id),
      user_name: r.user_full_name || r.author?.full_name || (r.user_role === 'instructor' || r.author?.role === 'instructor' ? 'Giảng viên (Bạn)' : 'Học viên'),
      user_avatar: r.user_avatar || r.author?.avatar_url,
      role: (r.user_role === 'instructor' || r.author?.role === 'instructor') ? 'instructor' : 'student',
      content: r.content || '',
      created_at: r.created_at || new Date().toISOString()
    })) : []
  };
};

export const InstructorQAModule: React.FC = () => {
  // Parse initial route/query params
  const parseInitialState = () => {
    if (typeof window === 'undefined') {
      return { questionId: '', course: 'all', lesson: 'all', status: 'all' as const, keyword: '', sort: 'newest' as const, page: 1 };
    }
    const pathname = window.location.pathname;
    const match = pathname.match(/\/instructor\/questions\/(\d+)/);
    const qId = match ? match[1] : '';

    const params = new URLSearchParams(window.location.search);
    return {
      questionId: qId,
      course: params.get('course') || 'all',
      lesson: params.get('lesson') || 'all',
      status: (params.get('status') as any) || 'all',
      keyword: params.get('search') || '',
      sort: (params.get('sort') as any) || 'newest',
      page: parseInt(params.get('page') || '1', 10) || 1,
    };
  };

  const [initialParams] = useState(parseInitialState);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(initialParams.questionId);
  const [selectedQuestionDetail, setSelectedQuestionDetail] = useState<Question | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Options
  const [courseOptions, setCourseOptions] = useState<Array<{ id: string | number; title: string }>>([]);
  const [lessonOptions, setLessonOptions] = useState<Array<{ id: string | number; title: string }>>([]);

  // Filter state
  const [filter, setFilter] = useState<QAFilterState>({
    keyword: initialParams.keyword,
    status: initialParams.status,
    course: initialParams.course,
    lesson: initialParams.lesson,
    sort: initialParams.sort
  });

  // Pagination state
  const [page, setPage] = useState<number>(initialParams.page);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  // Summary counts
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [todayCommentsCount, setTodayCommentsCount] = useState(0);
  const [bookmarkedCount, setBookmarkedCount] = useState(0);

  // Loading states
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Synchronize URL query and path
  const updateUrl = useCallback((newQuestionId: string, newFilter: QAFilterState, newPage: number) => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams();
    if (newFilter.course && newFilter.course !== 'all') urlParams.set('course', newFilter.course);
    if (newFilter.lesson && newFilter.lesson !== 'all') urlParams.set('lesson', newFilter.lesson);
    if (newFilter.status && newFilter.status !== 'all') urlParams.set('status', newFilter.status);
    if (newFilter.keyword && newFilter.keyword.trim()) urlParams.set('search', newFilter.keyword.trim());
    if (newFilter.sort && newFilter.sort !== 'newest') urlParams.set('sort', newFilter.sort);
    if (newPage > 1) urlParams.set('page', String(newPage));

    const queryString = urlParams.toString() ? `?${urlParams.toString()}` : '';
    const basePath = newQuestionId ? `/instructor/questions/${newQuestionId}` : '/instructor/questions';
    const targetUrl = `${basePath}${queryString}`;

    if (window.location.pathname + window.location.search !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  }, []);

  // Fetch summary
  const loadSummary = useCallback(async () => {
    try {
      const res = await ApiService.getInstructorQuestionSummary({
        course_id: filter.course !== 'all' ? filter.course : undefined,
        lesson_id: filter.lesson !== 'all' ? filter.lesson : undefined,
      });
      const data = res.data || res;
      setUnansweredCount(data.unanswered_questions ?? 0);
      setAnsweredCount(data.answered_questions ?? 0);
      setTodayCommentsCount(data.comments_today ?? 0);
      setBookmarkedCount(data.starred ?? 0);
      setTotalQuestions(data.total_questions ?? 0);
    } catch (err) {
      console.warn("Failed to load question summary:", err);
    }
  }, [filter.course, filter.lesson]);

  // Fetch course options
  useEffect(() => {
    ApiService.getInstructorQuestionCourseOptions().then((res: any) => {
      const list = res.data || res;
      if (Array.isArray(list)) {
        setCourseOptions(list);
      }
    }).catch(err => console.warn("Failed to load course options:", err));
  }, []);

  // Fetch lesson options when course filter changes
  useEffect(() => {
    ApiService.getInstructorQuestionLessonOptions(filter.course !== 'all' ? filter.course : undefined).then((res: any) => {
      const list = res.data || res;
      if (Array.isArray(list)) {
        setLessonOptions(list);
      }
    }).catch(err => console.warn("Failed to load lesson options:", err));
  }, [filter.course]);

  // Fetch list of questions
  const loadQuestions = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const res = await ApiService.getInstructorQuestions({
        course_id: filter.course,
        lesson_id: filter.lesson,
        status: filter.status === 'bookmarked' ? 'all' : filter.status,
        search: filter.keyword,
        sort: filter.sort,
        page,
        per_page: 10,
      });

      const listData = res.data || res;
      const items = Array.isArray(listData) ? listData : (listData.items || res.items || []);
      const mapped = items.map(mapBackendQuestion);
      setQuestions(mapped);

      const meta = res.meta || res.pagination || res;
      if (meta.last_page) setLastPage(meta.last_page);

      // Auto select first question if none selected or invalid
      if (mapped.length > 0 && !selectedQuestionId) {
        setSelectedQuestionId(mapped[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load instructor questions:", err);
      setListError(err.message || "Không thể tải danh sách câu hỏi.");
    } finally {
      setIsLoadingList(false);
    }
  }, [filter, page, selectedQuestionId]);

  useEffect(() => {
    loadSummary();
    loadQuestions();
  }, [loadSummary, loadQuestions]);

  // Fetch detail when selectedQuestionId changes
  useEffect(() => {
    if (!selectedQuestionId) {
      setSelectedQuestionDetail(null);
      return;
    }

    setIsLoadingDetail(true);
    ApiService.getInstructorQuestion(selectedQuestionId).then((res: any) => {
      const detailData = res.data || res;
      if (detailData) {
        setSelectedQuestionDetail(mapBackendQuestion(detailData));
      }
    }).catch(err => {
      console.warn("Failed to load question detail:", err);
      // Fallback to list item if detail API fails
      const fallback = questions.find(q => q.id === selectedQuestionId);
      if (fallback) {
        setSelectedQuestionDetail(fallback);
      }
    }).finally(() => {
      setIsLoadingDetail(false);
    });

    updateUrl(selectedQuestionId, filter, page);
  }, [selectedQuestionId, filter, page, updateUrl, questions]);

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseInitialState();
      setSelectedQuestionId(parsed.questionId);
      setFilter({
        keyword: parsed.keyword,
        status: parsed.status,
        course: parsed.course,
        lesson: parsed.lesson,
        sort: parsed.sort,
      });
      setPage(parsed.page);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Q&A Actions
  const handleReply = async (replyText: string, isOfficial: boolean, notifyStudent: boolean) => {
    if (!selectedQuestionId) return;

    try {
      const res = await ApiService.replyInstructorQuestion(selectedQuestionId, {
        content: replyText,
        is_official: isOfficial,
        notify_learner: notifyStudent,
      });
      showToast('Đã gửi câu trả lời thành công!');

      // Reload detail and list
      loadSummary();
      loadQuestions();

      // Optimistically append reply
      const newReply: Reply = {
        id: String(res.data?.reply?.id || 'reply-' + Date.now()),
        user_name: 'Giảng viên (Bạn)',
        role: 'instructor',
        content: replyText,
        created_at: new Date().toISOString(),
      };

      setSelectedQuestionDetail(prev => prev ? {
        ...prev,
        is_answered: true,
        status: 'answered',
        reply_count: (prev.reply_count || 0) + 1,
        replies: [...(prev.replies || []), newReply],
      } : null);
    } catch (err: any) {
      console.error("Failed to reply question:", err);
      showToast(err.message || "Gửi trả lời thất bại.", 'error');
    }
  };

  const handleHide = async () => {
    if (!selectedQuestionId) return;
    try {
      await ApiService.hideInstructorQuestion(selectedQuestionId);
      showToast('Đã ẩn câu hỏi thành công.');
      loadSummary();
      loadQuestions();
    } catch (err: any) {
      showToast(err.message || "Ẩn câu hỏi thất bại.", 'error');
    }
  };

  const handleToggleBookmark = async () => {
    if (!selectedQuestionDetail || !selectedQuestionId) return;
    const isCurrentlyBookmarked = selectedQuestionDetail.is_bookmarked;
    try {
      if (isCurrentlyBookmarked) {
        await ApiService.unstarInstructorQuestion(selectedQuestionId);
      } else {
        await ApiService.starInstructorQuestion(selectedQuestionId);
      }
      const nextState = !isCurrentlyBookmarked;
      setSelectedQuestionDetail(prev => prev ? { ...prev, is_bookmarked: nextState } : null);
      setQuestions(prev => prev.map(q => q.id === selectedQuestionId ? { ...q, is_bookmarked: nextState } : q));
      loadSummary();
      showToast(nextState ? 'Đã đánh dấu câu hỏi.' : 'Đã bỏ đánh dấu câu hỏi.');
    } catch (err: any) {
      showToast(err.message || 'Đánh dấu thất bại.', 'error');
    }
  };

  const handleFilterChange = (status: QAFilterState['status']) => {
    setFilter(prev => ({ ...prev, status }));
    setPage(1);
  };

  return (
    <div className="w-full text-left relative">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#111a4a] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-brand-light/20">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Hỏi đáp & Bình luận</h1>
            <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-650 cursor-pointer" />
          </div>
          <p className="text-slate-400 text-xs font-bold mt-1">Quản lý câu hỏi và bình luận của học viên trong các bài học</p>
        </div>
      </div>

      {/* Stat Cards */}
      <QAOverview
        unansweredCount={unansweredCount}
        answeredCount={answeredCount}
        todayCommentsCount={todayCommentsCount}
        bookmarkedCount={bookmarkedCount}
        activeFilterStatus={filter.status}
        onFilterChange={handleFilterChange}
      />

      {/* Filter Card */}
      <QAFilter 
        filter={filter} 
        setFilter={(newFilterAction) => {
          setFilter(newFilterAction);
          setPage(1);
        }}
        courseOptions={courseOptions}
        lessonOptions={lessonOptions}
      />

      {/* Split Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left column: List of Questions */}
        <div className="w-full lg:w-[48%] shrink-0">
          {isLoadingList ? (
            <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 p-8 h-[750px] flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-normal animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-500">Đang tải danh sách câu hỏi...</p>
            </div>
          ) : listError ? (
            <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 p-8 h-[750px] flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
              <p className="text-xs font-bold text-slate-700">{listError}</p>
              <button 
                onClick={loadQuestions}
                className="mt-3 px-4 py-2 text-xs font-bold bg-brand-normal text-white rounded-xl hover:bg-brand-hover cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <QAList 
              questions={questions} 
              selectedQuestionId={selectedQuestionId}
              onSelectQuestion={setSelectedQuestionId}
              sort={filter.sort}
              onSortChange={(sort) => {
                setFilter(prev => ({ ...prev, sort }));
                setPage(1);
              }}
              page={page}
              lastPage={lastPage}
              onPageChange={setPage}
            />
          )}
        </div>

        {/* Right column: Conversation detail & reply form */}
        <div className="w-full lg:w-[52%] shrink-0">
          {isLoadingDetail ? (
            <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 p-8 h-[750px] flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-normal animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-500">Đang tải chi tiết câu hỏi...</p>
            </div>
          ) : (
            <QADetailView 
              question={selectedQuestionDetail}
              onReply={handleReply}
              onHide={handleHide}
              onToggleBookmark={handleToggleBookmark}
            />
          )}
        </div>
      </div>
    </div>
  );
};
