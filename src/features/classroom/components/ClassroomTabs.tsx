import React, { useState, useEffect, useCallback } from 'react';
import { Course, Lesson } from '@/shared/types';
import { TabType } from '../hooks/useClassroom';
import { classroomApi } from '../api';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import {
  Clock,
  BarChart2,
  Tag,
  Star,
  GraduationCap,
  MessageSquare,
  FileText,
  FolderDown,
  Layout,
  Download,
  ExternalLink,
  ThumbsUp,
  User,
  PlusCircle,
  Bookmark,
  Sparkles,
  FileCode,
  Loader2,
  Pencil,
  Trash2,
  Check,
  X,
  Send,
  PenLine,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/app/AppContext';
import { apiFetch } from '@/shared/lib/api-client';

interface ClassroomTabsProps {
  course: Course | null;
  activeLesson: Lesson | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentVideoTime?: number;
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Mới đây';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Mới đây';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

function formatSecondsToMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function parseMMSSToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1 && !isNaN(parts[0])) {
    return parts[0];
  }
  return 0;
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'Tệp đính kèm';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const getNumericLessonId = (rawId?: string | number): number => {
  if (!rawId) return 1;
  const num = parseInt(String(rawId).replace(/\D/g, ''), 10);
  return isNaN(num) || num <= 0 ? 1 : num;
};

export function ClassroomTabs({ course, activeLesson, activeTab, onTabChange, currentVideoTime }: ClassroomTabsProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [newNote, setNewNote] = useState('');
  const [customNoteTime, setCustomNoteTime] = useState<string>('00:00');
  const [isTimeManuallyEdited, setIsTimeManuallyEdited] = useState(false);

  // Real API & Local Storage Persistent States (No Mock Samples)
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const [qaList, setQaList] = useState<any[]>([]);
  const [isLoadingQA, setIsLoadingQA] = useState(false);
  const [isSubmittingQA, setIsSubmittingQA] = useState(false);

  const [resourcesList, setResourcesList] = useState<any[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  const { currentUser, enrolledCourseIds = [] } = useApp();
  const isEnrolled = Boolean(
    currentUser && (
      (course as any)?.is_enrolled ||
      (course as any)?.isEnrolled ||
      enrolledCourseIds.some(
        (id) => String(id) === String(course?.id) || String(id) === String(course?.slug)
      )
    )
  );

  const [courseReviews, setCourseReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [selectedReviewRating, setSelectedReviewRating] = useState<number>(5);
  const [hoverReviewRating, setHoverReviewRating] = useState<number | null>(null);
  const [reviewCommentText, setReviewCommentText] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchReviewsData = useCallback(async () => {
    if (!course?.id) return;
    setIsLoadingReviews(true);
    try {
      const res = await apiFetch<any>(`/courses/${course.id}/reviews?per_page=100`);
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setCourseReviews(list);
    } catch (e) {
      setCourseReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [course?.id]);

  useEffect(() => {
    fetchReviewsData();
  }, [fetchReviewsData]);

  // Continuous auto-sync with current real video time while watching, unless user manually edited custom time
  useEffect(() => {
    if (!isTimeManuallyEdited && typeof currentVideoTime === 'number') {
      setCustomNoteTime(formatSecondsToMMSS(currentVideoTime));
    }
  }, [currentVideoTime, isTimeManuallyEdited]);

  const handleCaptureCurrentTime = () => {
    const time = typeof currentVideoTime === 'number' ? currentVideoTime : 0;
    const formatted = formatSecondsToMMSS(time);
    setCustomNoteTime(formatted);
    setIsTimeManuallyEdited(false);
    toast.info(`Đã lấy mốc thời gian video: [${formatted}]`);
  };

  // Editing note states
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingTime, setEditingTime] = useState<string>('00:00');

  const handleStartEditNote = (note: any) => {
    setEditingNoteId(String(note.id));
    setEditingContent(note.text || note.content || '');
    setEditingTime(note.time || '00:00');
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingContent('');
    setEditingTime('00:00');
  };

  const handleSaveEditNote = async (noteId: string) => {
    if (!editingContent.trim() || !activeLesson?.id) return;
    const timeSeconds = parseMMSSToSeconds(editingTime);
    const timeFormatted = formatSecondsToMMSS(timeSeconds);

    const storageKey = `mindhub_notes_list_${course?.id || 'c1'}_${activeLesson.id}`;

    setSavedNotes((prev) => {
      const updated = prev.map((item) => {
        if (String(item.id) === String(noteId)) {
          return {
            ...item,
            text: editingContent.trim(),
            time: timeFormatted,
            note_time_second: timeSeconds,
          };
        }
        return item;
      });
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    handleCancelEditNote();
    toast.success('Đã cập nhật ghi chú!');

    if (!String(noteId).startsWith('local-')) {
      try {
        await classroomApi.updateLessonNote(String(noteId), editingContent.trim(), timeSeconds);
      } catch (err: any) {
        console.warn('API update note error:', err?.message);
      }
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!activeLesson?.id) return;
    const storageKey = `mindhub_notes_list_${course?.id || 'c1'}_${activeLesson.id}`;

    setSavedNotes((prev) => {
      const updated = prev.filter((item) => String(item.id) !== String(noteId));
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    toast.success('Đã xóa ghi chú!');

    if (!String(noteId).startsWith('local-')) {
      try {
        await classroomApi.deleteLessonNote(String(noteId));
      } catch (err: any) {
        console.warn('API delete note error:', err?.message);
      }
    }
  };

  const fetchNotesData = useCallback(async () => {
    if (!activeLesson?.id) return;
    setIsLoadingNotes(true);
    const storageKey = `mindhub_notes_list_${course?.id || 'c1'}_${activeLesson.id}`;
    try {
      const numericId = getNumericLessonId(activeLesson.id);
      const res = await classroomApi.getLessonNotes(String(numericId));
      if (Array.isArray(res)) {
        const formatted = res.map((n: any) => ({
          id: String(n.id),
          time: formatSecondsToMMSS(n.note_time_second || 0),
          note_time_second: n.note_time_second || 0,
          text: n.content,
          date: n.created_at ? formatTimeAgo(n.created_at) : 'Vừa xong',
        }));
        setSavedNotes((prev) => {
          const localOnly = prev.filter((item) => String(item.id).startsWith('local-'));
          const mergedMap = new Map<string, any>();
          [...localOnly, ...formatted].forEach((item) => {
            mergedMap.set(String(item.id), item);
          });
          const merged = Array.from(mergedMap.values());
          try {
            localStorage.setItem(storageKey, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (err: any) {
      console.warn('Could not load notes from backend API:', err?.message);
    } finally {
      setIsLoadingNotes(false);
    }
  }, [activeLesson?.id, course?.id]);

  useEffect(() => {
    if (!activeLesson?.id) return;
    const storageKey = `mindhub_notes_list_${course?.id || 'c1'}_${activeLesson.id}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSavedNotes(parsed);
        }
      }
    } catch (e) {}

    if (activeTab === 'notes') {
      fetchNotesData();
    }
  }, [activeTab, activeLesson?.id, course?.id, fetchNotesData]);

  const fetchQAData = useCallback(async () => {
    if (!activeLesson?.id) return;
    setIsLoadingQA(true);
    const storageKey = `mindhub_qa_list_${course?.id || 'c1'}_${activeLesson.id}`;
    // Xóa bộ nhớ đệm cũ trên trình duyệt để tránh hiển thị bình luận lỗi trước đây
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}

    try {
      const numericId = getNumericLessonId(activeLesson.id);
      const res = await classroomApi.getLessonComments(String(numericId));
      const commentsArray = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.items)
        ? (res as any).items
        : Array.isArray((res as any)?.data)
        ? (res as any).data
        : [];

      // Chỉ hiển thị các bình luận hợp lệ (status = visible)
      const validComments = commentsArray.filter((item: any) => item.status === 'visible' || !item.status);
      setQaList(validComments);
    } catch (err: any) {
      console.warn('Could not load Q&A from backend API:', err?.message);
      setQaList([]);
    } finally {
      setIsLoadingQA(false);
    }
  }, [activeLesson?.id, course?.id]);

  useEffect(() => {
    if (!activeLesson?.id) return;
    fetchQAData();
  }, [activeLesson?.id, fetchQAData]);

  const fetchResourcesData = useCallback(async () => {
    if (!activeLesson?.id) return;
    setIsLoadingResources(true);
    try {
      const numericId = getNumericLessonId(activeLesson.id);
      const lessonData = await classroomApi.getSecureLessonContent(String(numericId));
      if (lessonData && Array.isArray((lessonData as any).assets)) {
        setResourcesList((lessonData as any).assets);
      } else {
        setResourcesList([]);
      }
    } catch (err: any) {
      console.warn('Could not load lesson assets from backend API:', err?.message);
      setResourcesList([]);
    } finally {
      setIsLoadingResources(false);
    }
  }, [activeLesson?.id]);

  useEffect(() => {
    if (!activeLesson?.id) return;
    fetchNotesData();
    fetchQAData();
    fetchResourcesData();
  }, [activeLesson?.id, fetchNotesData, fetchQAData, fetchResourcesData]);

  if (!course) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Tổng quan', icon: <Layout className="w-4 h-4" /> },
    { id: 'qa', label: 'Hỏi đáp', icon: <MessageSquare className="w-4 h-4" />, badge: `${qaList.length}` },
    { id: 'notes', label: 'Ghi chú', icon: <FileText className="w-4 h-4" />, badge: `${savedNotes.length}` },
    { id: 'resources', label: 'Tài nguyên', icon: <FolderDown className="w-4 h-4" />, badge: `${resourcesList.length}` },
    { id: 'reviews', label: 'Đánh giá', icon: <Star className="w-4 h-4" />, badge: courseReviews.length > 0 ? `${courseReviews.length}` : undefined },
  ];

  const handleAddNote = async () => {
    if (!newNote.trim() || !activeLesson?.id) return;
    const noteText = newNote.trim();
    const timeSeconds = parseMMSSToSeconds(customNoteTime);

    // Prevent double clicks by clearing input synchronously
    setNewNote('');
    setIsSubmittingNote(true);

    try {
      const numericId = getNumericLessonId(activeLesson.id);
      await classroomApi.addLessonNote(String(numericId), noteText, timeSeconds);
      toast.success('Đã lưu ghi chú bài học thành công!');
      fetchNotesData();
    } catch (err: any) {
      console.warn('API add note error:', err?.message);
      toast.error('Có lỗi xảy ra khi lưu ghi chú!');
    } finally {
      setIsTimeManuallyEdited(false);
      setIsSubmittingNote(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !activeLesson?.id) return;
    const questionText = newQuestion.trim();
    setIsSubmittingQA(true);

    try {
      const numericId = getNumericLessonId(activeLesson.id);
      await classroomApi.addLessonComment(String(numericId), questionText);
      toast.success('Đã gửi câu hỏi! Giảng viên sẽ phản hồi sớm nhất.');
      setNewQuestion('');
      await fetchQAData();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Bình luận chứa nội dung không phù hợp với tiêu chuẩn cộng đồng!';
      toast.error(errorMsg);
    } finally {
      setIsSubmittingQA(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-6">
      
      {/* TAB HEADER BAR */}
      <div className="flex items-center gap-2 sm:gap-6 border-b border-slate-100 pb-0 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-extrabold transition-all border-b-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}
      <div className="min-h-[220px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Title & Description */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bài học hiện tại</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeLesson?.title || 'Tổng quan bài học'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {activeLesson?.content ||
                  'Trong bài học này, bạn sẽ nắm vững các khái niệm nền tảng, thực hành trực tiếp theo hướng dẫn từng bước của giảng viên để xây dựng tư duy lập trình vững chắc.'}
              </p>
            </div>

            {/* 4 Quick Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Thời lượng</span>
                  <span className="text-xs font-black text-slate-900">
                    {activeLesson?.duration || '10:15'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Trình độ</span>
                  <span className="text-xs font-black text-slate-900">
                    {course.level || 'Tất cả trình độ'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Chủ đề</span>
                  <span className="text-xs font-black text-slate-900 truncate block max-w-[90px]">
                    {course.category || 'Công nghệ'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Đánh giá</span>
                  <span className="text-xs font-black text-slate-900">
                    {course.rating || 4.9} ★
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Column: Learning Outcomes & Instructor Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              
              {/* Left Column: Learning Objectives */}
              <div className="lg:col-span-7 bg-slate-50/80 border border-slate-200/70 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Mục tiêu bài học & Kết quả đạt được</span>
                </div>
                
                <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                      ✓
                    </div>
                    <span>Hiểu rõ bản chất công cụ và ứng dụng vào dự án thực tế.</span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                      ✓
                    </div>
                    <span>Thực hành viết mã sạch (Clean Code), tối ưu hóa quy trình làm việc.</span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                      ✓
                    </div>
                    <span>Tự tay hoàn thành bài tập thực hành cuối bài học.</span>
                  </li>
                </ul>
              </div>

              {/* Right Column: Instructor Card */}
              <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      course?.instructorAvatar ||
                      (course as any)?.instructor?.avatar_url ||
                      (course as any)?.instructorAvatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'
                    }
                    alt={course?.instructorName || 'Giảng viên'}
                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/30"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Giảng viên hướng dẫn</span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      {course?.instructorName || (course as any)?.instructor?.full_name || 'Chuyên gia MindHub'}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium line-clamp-2">
                  {(course as any)?.instructorBio ||
                    (course as any)?.instructor?.bio ||
                    'Senior Software Engineer với nhiều năm kinh nghiệm giảng dạy và phát triển sản phẩm phần mềm thực tế.'}
                </p>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'qa' && (
          <div className="space-y-6">
            
            {/* Ask Question Input Box */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Đặt câu hỏi cho bài học này</span>
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSubmittingQA) {
                      handleAddQuestion();
                    }
                  }}
                  disabled={isSubmittingQA}
                  placeholder="Nhập thắc mắc của bạn về bài học..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                />
                <button
                  onClick={handleAddQuestion}
                  disabled={isSubmittingQA || !newQuestion.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmittingQA ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <span>Gửi câu hỏi</span>
                  )}
                </button>
              </div>
            </div>

            {/* Q&A Thread List */}
            <div className="space-y-3">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Thảo luận gần đây ({qaList.length} câu hỏi)
              </div>

              {isLoadingQA ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-200/80 space-y-2">
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mx-auto" />
                  <p>Đang tải danh sách thảo luận...</p>
                </div>
              ) : qaList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-200/80">
                  Chưa có câu hỏi nào cho bài học này. Hãy là người đầu tiên đặt câu hỏi!
                </div>
              ) : (
                qaList.map((q) => {
                  const authorName = q.user?.full_name || 'Học viên';
                  const initials = authorName
                    .split(' ')
                    .filter(Boolean)
                    .map((n: string) => n[0])
                    .join('')
                    .slice(-2)
                    .toUpperCase() || 'HV';
                  const isInstructor = q.user?.role === 'instructor';

                  return (
                    <div key={q.id || q.comment_id} className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 ${
                              isInstructor
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-slate-900">{authorName}</span>
                            <span className="text-[10px] text-slate-400 font-medium ml-2">
                              {q.created_at ? formatTimeAgo(q.created_at) : 'Mới đây'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                        {q.content}
                      </p>

                      {/* Replies */}
                      {Array.isArray(q.replies) && q.replies.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {q.replies.map((reply: any) => {
                            const replyAuthor = reply.user?.full_name || 'Giảng viên';
                            const isRepInstructor = reply.user?.role === 'instructor';
                            return (
                              <div
                                key={reply.id || reply.comment_id}
                                className="ml-3 sm:ml-4 p-3 bg-emerald-50/70 border-l-2 border-emerald-500 rounded-r-xl space-y-1"
                              >
                                <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800">
                                  <User className="w-3.5 h-3.5" />
                                  <span>{isRepInstructor ? 'Giảng viên Trả lời' : replyAuthor}</span>
                                  <span className="text-[10px] text-emerald-600 font-normal ml-auto">
                                    {reply.created_at ? formatTimeAgo(reply.created_at) : ''}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                                  {reply.content}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

            </div>

          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            
            {/* Note Input Box */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Tạo ghi chú tại mốc thời gian</span>
                </h3>

                {/* Custom & Real Video Time Selector */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCaptureCurrentTime}
                    className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95 shrink-0"
                    title="Lấy thời gian thực video đang phát"
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Lấy mốc video [{formatSecondsToMMSS(currentVideoTime || 0)}]</span>
                  </button>

                  <span className="text-xs font-bold text-slate-300">|</span>

                  <span className="text-xs font-extrabold text-slate-500">Mốc [MM:SS]:</span>
                  <input
                    type="text"
                    value={customNoteTime}
                    onChange={(e) => {
                      setCustomNoteTime(e.target.value);
                      setIsTimeManuallyEdited(true);
                    }}
                    placeholder="00:00"
                    className="w-20 px-2 py-1 text-xs font-black text-emerald-700 bg-white border border-slate-200 rounded-lg text-center focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>

              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Nhập ghi chú cá nhân cho bài học này..."
                className="w-full min-h-[90px] p-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleAddNote}
                  disabled={isSubmittingNote || !newNote.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingNote ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Lưu ghi chú tại [{customNoteTime || '00:00'}]</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Saved Notes List */}
            <div className="space-y-3">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Danh sách ghi chú của bạn ({savedNotes.length})
              </div>

              {isLoadingNotes ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-200/80 space-y-2">
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mx-auto" />
                  <p>Đang tải ghi chú cá nhân...</p>
                </div>
              ) : savedNotes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-200/80">
                  Chưa có ghi chú nào cho bài học này. Hãy tạo ghi chú đầu tiên!
                </div>
              ) : (
                savedNotes.map((note) => {
                const isEditing = editingNoteId === String(note.id);

                if (isEditing) {
                  return (
                    <div
                      key={note.id}
                      className="p-3.5 bg-emerald-50/50 border border-emerald-300 rounded-xl space-y-3 shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Sửa mốc [MM:SS]:</span>
                        <input
                          type="text"
                          value={editingTime}
                          onChange={(e) => setEditingTime(e.target.value)}
                          className="w-20 px-2 py-1 text-xs font-black text-emerald-700 bg-white border border-slate-300 rounded-lg text-center focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full min-h-[60px] p-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditNote}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Hủy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditNote(String(note.id))}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Lưu thay đổi</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={note.id}
                    className="p-3.5 bg-white border border-slate-200/80 rounded-xl flex items-start justify-between gap-4 hover:border-emerald-200 transition-colors shadow-2xs group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                        {note.time}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed break-words">
                        {note.text}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-medium text-slate-400">
                        {note.date}
                      </span>

                      {/* Action buttons: Edit & Delete */}
                      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEditNote(note)}
                          className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Chỉnh sửa ghi chú"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(String(note.id))}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa ghi chú"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }))
            }
            </div>

          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                <FolderDown className="w-4 h-4 text-emerald-600" />
                <span>Tài nguyên & Mã nguồn đi kèm bài học ({resourcesList.length} tệp)</span>
              </h3>
            </div>

            {/* Resource Files List */}
            {isLoadingResources ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-200/80 space-y-2">
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mx-auto" />
                <p>Đang tải tài nguyên đi kèm...</p>
              </div>
            ) : resourcesList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-200/80">
                Chưa có tài nguyên hoặc mã nguồn đính kèm cho bài học này.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resourcesList.map((asset: any) => {
                  const isExternalLink = asset.file_type === 'link' || asset.file_type === 'url' || asset.download_endpoint?.includes('github');
                  const isPdf = asset.file_type === 'pdf' || asset.file_name?.endsWith('.pdf');

                  return (
                    <div
                      key={asset.id}
                      className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 hover:border-emerald-300 transition-all hover:shadow-md group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isExternalLink
                              ? 'bg-purple-50 text-purple-600 border-purple-100'
                              : isPdf
                              ? 'bg-rose-50 text-rose-600 border-rose-100'
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}
                        >
                          {isExternalLink ? (
                            <ExternalLink className="w-5 h-5" />
                          ) : isPdf ? (
                            <FileText className="w-5 h-5" />
                          ) : (
                            <FileCode className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                            {asset.title || asset.file_name || 'Tài nguyên bài học'}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-400 block truncate">
                            {asset.file_type ? asset.file_type.toUpperCase() : 'Tệp'} — {formatFileSize(asset.file_size)}
                          </span>
                        </div>
                      </div>

                      {isExternalLink ? (
                        <a
                          href={asset.file_url || 'https://github.com'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5 shrink-0"
                        >
                          <span>Truy cập</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            toast.success(`Đang tải xuống ${asset.title || asset.file_name || 'tài nguyên'}`);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition-colors cursor-pointer shrink-0"
                          title="Tải xuống"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* 5. TAB: ĐÁNH GIÁ (REVIEWS) */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            
            {/* Header / Summary Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl font-black text-amber-700">
                    {course.rating ? course.rating.toFixed(1) : '5.0'}
                  </span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2.5 h-2.5 ${
                          i < Math.round(course.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Đánh giá & Nhận xét từ học viên
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {courseReviews.length > 0
                      ? `Tổng cộng ${courseReviews.length} lượt đánh giá thực tế`
                      : `Khóa học có ${course.reviewCount || 0} lượt đánh giá`}
                  </p>
                </div>
              </div>

              {isEnrolled && (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã ghi danh — Được phép đánh giá</span>
                </div>
              )}
            </div>

            {/* Submit / Edit Review Box */}
            {isEnrolled ? (
              <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-500/5 via-white to-emerald-500/5 border-2 border-amber-300/60 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PenLine className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Gửi đánh giá của bạn
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Đánh giá sẽ hiển thị công khai
                  </span>
                </div>

                {/* Interactive Star Picker */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Chọn số sao:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverReviewRating !== null ? hoverReviewRating : selectedReviewRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverReviewRating(star)}
                          onMouseLeave={() => setHoverReviewRating(null)}
                          onClick={() => setSelectedReviewRating(star)}
                          className="p-1 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              isFilled ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-extrabold text-amber-700 ml-1">
                    {(hoverReviewRating !== null ? hoverReviewRating : selectedReviewRating) === 5
                      ? 'Tuyệt vời (5 sao)'
                      : (hoverReviewRating !== null ? hoverReviewRating : selectedReviewRating) === 4
                      ? 'Rất tốt (4 sao)'
                      : (hoverReviewRating !== null ? hoverReviewRating : selectedReviewRating) === 3
                      ? 'Bình thường (3 sao)'
                      : (hoverReviewRating !== null ? hoverReviewRating : selectedReviewRating) === 2
                      ? 'Tạm được (2 sao)'
                      : 'Chưa tốt (1 sao)'}
                  </span>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-2">
                  <textarea
                    value={reviewCommentText}
                    onChange={(e) => setReviewCommentText(e.target.value)}
                    placeholder="Chia sẻ cảm nghĩ, chất lượng nội dung, sự hỗ trợ của giảng viên..."
                    className="w-full h-24 p-3.5 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-medium resize-none shadow-inner text-slate-800 placeholder:text-slate-400"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isSubmittingReview || !reviewCommentText.trim()}
                      onClick={async () => {
                        if (!course?.id) return;
                        if (!reviewCommentText.trim()) {
                          toast.error('Vui lòng nhập nội dung đánh giá.');
                          return;
                        }
                        setIsSubmittingReview(true);
                        try {
                          await apiFetch(`/courses/${course.id}/reviews`, {
                            method: 'POST',
                            body: JSON.stringify({
                              rating: selectedReviewRating,
                              content: reviewCommentText.trim(),
                              comment: reviewCommentText.trim(),
                            }),
                          });
                          toast.success('Đã gửi đánh giá khóa học thành công!');
                          setReviewCommentText('');
                          fetchReviewsData();
                        } catch (err: any) {
                          toast.error(err?.message || 'Có lỗi xảy ra khi gửi đánh giá.');
                        } finally {
                          setIsSubmittingReview(false);
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      {isSubmittingReview ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Gửi đánh giá</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-slate-600 text-xs font-medium">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Chỉ những học viên đã đăng ký hoặc mua khóa học mới có thể gửi đánh giá và nhận xét.</span>
              </div>
            )}

            {/* List of Reviews */}
            {isLoadingReviews ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : courseReviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Chưa có đánh giá nào</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Hãy là người đầu tiên chia sẻ cảm nhận về khóa học này!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {courseReviews.map((rev: any, idx: number) => {
                  const ratingVal = Number(rev.rating) || 5;
                  const reviewerName = rev.reviewer_name || rev.user_name || rev.name || rev.user?.full_name || 'Học viên MindHub';
                  const reviewerAvatar = rev.reviewer_avatar || rev.user_avatar || rev.avatar || rev.user?.avatar;
                  const reviewContent = rev.content || rev.comment || rev.review_text || '';
                  const reviewTime = rev.created_at ? formatTimeAgo(rev.created_at) : (rev.date || 'Gần đây');

                  return (
                    <div
                      key={rev.id || idx}
                      className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl space-y-3 hover:border-amber-300/60 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {reviewerAvatar ? (
                            <img
                              src={reviewerAvatar}
                              alt={reviewerName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                              {reviewerName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-black text-slate-900">{reviewerName}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{reviewTime}</div>
                          </div>
                        </div>

                        {/* Star display */}
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < ratingVal ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {reviewContent}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}

