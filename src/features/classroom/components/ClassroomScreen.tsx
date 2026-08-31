import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, CheckCircle, FileText, ChevronRight, HelpCircle, AlertTriangle, 
  ChevronLeft, Award, AwardIcon, Sparkles, MessageSquare, Plus, Bookmark, 
  Trash2, Send, Download, Eye, Target, Map,
  Video, Clock, BarChart2, FolderMinus, FolderPlus, FolderOpen, PenSquare,
  Maximize, Minimize
} from 'lucide-react';
import { Course, Chapter, Lesson, StudentProgress, MentorMessage, QAMessage, User } from '@/shared/types';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { resolveMediaUrl } from '@/shared/lib/media-url';
import { apiFetch } from '@/shared/lib/api-client';
import { classroomApi } from '../api';
import { toast } from 'sonner';

interface ClassroomScreenProps {
  course: Course;
  currentUser: User | null;
  onClose: () => void;
  enrolledCourseIds?: string[];
}

export default function ClassroomScreen({ course, currentUser, onClose, enrolledCourseIds = [] }: ClassroomScreenProps) {
  const [chapters, setChapters] = useState<Chapter[]>(course.chapters || []);
  const [isLoadingOutline, setIsLoadingOutline] = useState(!course.chapters || course.chapters.length === 0);

  useEffect(() => {
    if (!course.chapters || course.chapters.length === 0) {
      setIsLoadingOutline(true);
      classroomApi.getStudentCourseOutline(course.id)
        .then(res => {
          if (res && res.sections) {
            const mappedChapters: Chapter[] = res.sections.map((ch: any) => ({
              id: String(ch.id),
              title: ch.title,
              lessons: (ch.lessons || []).map((l: any) => ({
                id: String(l.id),
                title: l.title,
                type: l.lesson_type || 'video',
                duration: l.video_duration_seconds ? `${Math.floor(l.video_duration_seconds / 60)}:${(l.video_duration_seconds % 60).toString().padStart(2, '0')}` : '10:00',
                videoUrl: l.video_url ? resolveMediaUrl(l.video_url) : '',
                isPreview: l.is_preview,
                content: l.content
              }))
            }));
            setChapters(mappedChapters);

            if (res.progresses) {
              const completedIds = Object.values(res.progresses)
                .filter((p: any) => p.status === 'completed')
                .map((p: any) => String(p.lesson_id));
              
              setProgress(prev => ({
                ...prev,
                completedLessonIds: completedIds,
              }));
            }
          }
        })
        .catch(err => console.error("Failed to fetch outline", err))
        .finally(() => setIsLoadingOutline(false));
    }
  }, [course.id, course.chapters]);

  // Find active chapter and lesson safely
  const allLessons: Lesson[] = (chapters || []).flatMap(c => c ? (c.lessons || []) : []);

  // Manage progress state with API
  const [progress, setProgress] = useState<StudentProgress>(() => {
    return {
      courseId: course.id,
      currentLessonId: '',
      completedLessonIds: [],
      notes: [],
      bookmarks: [],
      lastWatchedProgressSec: 0
    };
  });

  // When chapters load, ensure we set a current lesson if one wasn't set
  useEffect(() => {
    if (!progress.currentLessonId && chapters.length > 0) {
      const firstLessonId = chapters?.[0]?.lessons?.[0]?.id || '';
      if (firstLessonId) {
        setProgress(p => ({
          ...p,
          currentLessonId: firstLessonId,
        }));
      }
    }
  }, [chapters, progress.currentLessonId]);

  const [activeTab, setActiveTab] = useState<'video' | 'doc' | 'quiz' | 'assignment' | 'notes' | 'qa' | 'mentor' | 'heatmap' | 'analytics'>('video');
  const [classroomTheme, setClassroomTheme] = useState<'dark' | 'light' | 'sepia'>('dark');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const activeLesson = allLessons.find(l => l.id === progress.currentLessonId) || allLessons[0];

  // Check access permission
  const isEnrolled = enrolledCourseIds.includes(course.id);
  const isInstructorOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'instructor';
  const hasFullCourseAccess = isEnrolled || isInstructorOrAdmin;

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0); // in seconds
  const [videoSpeed, setVideoSpeed] = useState<number>(1.0);
  const [videoResolution, setVideoResolution] = useState<string>('Auto');
  const [totalVideoDuration, setTotalVideoDuration] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [realVideoUrl, setRealVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    if (activeLesson && activeLesson.type === 'video') {
      setIsBuffering(true);
      setVideoError(null);

      const numericLessonId = parseInt(String(activeLesson.id).replace(/\D/g, ''), 10);
      if (!isNaN(numericLessonId) && numericLessonId > 0) {
        classroomApi.getSecureLessonContent(String(numericLessonId))
          .then(async (lessonData: any) => {
            const item = lessonData?.data || lessonData;
            const endpoint = item?.video_access_endpoint || `/learn/lessons/${numericLessonId}/video-url`;
            try {
              const streamRes = await apiFetch<any>(endpoint);
              const streamUrl = streamRes?.stream_url || streamRes?.data?.stream_url || item?.video_url;
              if (streamUrl) {
                setRealVideoUrl(resolveMediaUrl(streamUrl));
                return;
              }
            } catch (eStream) {
              if (item?.video_url) {
                setRealVideoUrl(resolveMediaUrl(item.video_url));
                return;
              }
            }
            if (activeLesson.videoUrl && !activeLesson.videoUrl.includes('w3schools') && !activeLesson.videoUrl.includes('BigBuckBunny')) {
              setRealVideoUrl(resolveMediaUrl(activeLesson.videoUrl));
            } else {
              setRealVideoUrl(null);
            }
          })
          .catch(err => {
            console.warn("Failed to fetch secure lesson video stream:", err);
            if (activeLesson.videoUrl && !activeLesson.videoUrl.includes('w3schools') && !activeLesson.videoUrl.includes('BigBuckBunny')) {
              setRealVideoUrl(resolveMediaUrl(activeLesson.videoUrl));
            } else {
              setVideoError("Không thể tải đường dẫn video của bài học này.");
            }
          })
          .finally(() => setIsBuffering(false));
      } else {
        if (activeLesson.videoUrl) {
          setRealVideoUrl(resolveMediaUrl(activeLesson.videoUrl));
        }
        setIsBuffering(false);
      }
    } else {
      setRealVideoUrl(null);
    }
  }, [activeLesson?.id]);

  const currentVideoUrl = useMemo(() => {
    if (realVideoUrl) return realVideoUrl;
    if (!activeLesson || activeLesson.type !== 'video' || !activeLesson.videoUrl) return '';
    if (!activeLesson.qualities || activeLesson.qualities.length === 0) return activeLesson.videoUrl;
    if (videoResolution === 'Auto') return activeLesson.videoUrl;
    const selected = activeLesson.qualities.find(q => q.label === videoResolution);
    return selected ? selected.url : activeLesson.videoUrl;
  }, [activeLesson, videoResolution]);

  const handleResolutionChange = (newRes: string) => {
    if (!videoRef.current || newRes === videoResolution) return;
    const currentTime = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;
    setVideoResolution(newRes);
    
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        if (wasPlaying) {
          videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
        }
      }
    }, 50);
  };
  // Fullscreen management while keeping custom overlay controls
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Note addition form
  const [newNoteText, setNewNoteText] = useState('');
  
  // Q&A list
  const [qaList, setQaList] = useState<QAMessage[]>([
    {
      id: 'qa-1',
      userName: 'Trần Thanh Hùng',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      userRole: 'student',
      text: 'Tại sao em chạy Next.js 15 mà Server Actions lại bị lỗi cors vậy ạ?',
      timestamp: '1 ngày trước',
      replies: [
        {
          id: 'qa-r1',
          userName: course.instructorName,
          userAvatar: course.instructorAvatar,
          userRole: 'instructor',
          text: 'Chào em, khi sử dụng Server Actions bạn cần chắc chắn là gọi từ cùng origin hoặc bật cấu hình allowedOrigins trong file next.config.js nhé!',
          timestamp: '15 giờ trước'
        }
      ]
    }
  ]);
  const [newQaText, setNewQaText] = useState('');
  const [qaRepliesText, setQaRepliesText] = useState<Record<string, string>>({});

  // AI Mentor Chat Messages
  const [chatMessages, setChatMessages] = useState<MentorMessage[]>([
    { id: 'm-1', sender: 'ai', text: `Xin chào ${currentUser?.name || 'Khách'}! Mình là MindHub AI Mentor riêng của bạn. Mình đã đọc bài giảng "${activeLesson?.title || ''}" và sẵn sàng giải thích mọi thuật toán cực kỳ trực quan. Bạn có câu hỏi nào không?`, timestamp: 'Vừa xong' }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Quiz evaluation state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Assignment states
  const [assignmentFeedback, setAssignmentFeedback] = useState<string>('');
  const [assignmentPoints, setAssignmentPoints] = useState<number | null>(null);
  const [assignmentCode, setAssignmentCode] = useState('');

  // Course feedback/rating modal after completed
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Activity logs / study history state with persistence
  const [activityLogs, setActivityLogs] = useState<{ id: string; action: string; details: string; timestamp: string }[]>(() => {
    const saved = localStorage.getItem(`mindhub_activity_log_${course.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 'act-1', action: 'Ghi danh khóa học', details: 'Hệ thống MindHub tự động kích hoạt tiến học phần này.', timestamp: 'Hôm qua' },
      { id: 'act-2', action: 'Bắt đầu lộ trình', details: 'Học viên gia nhập khu vực học tập trực tuyến.', timestamp: 'Mới đây' }
    ];
  });

  const logActivity = (action: string, details: string) => {
    setActivityLogs(prev => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;
      const newLog = {
        id: 'act-' + Date.now(),
        action,
        details,
        timestamp: timeStr
      };
      const updated = [newLog, ...prev];
      localStorage.setItem(`mindhub_activity_log_${course.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const getNextSuggestedLesson = () => {
    const uncompleted = allLessons.filter(l => !progress.completedLessonIds.includes(l.id));
    return uncompleted.length > 0 ? uncompleted[0] : null;
  };

  // HTML5 Progress Bar Calculation
  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = progress.completedLessonIds.length;
  const calculatedPercent = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  // Track lesson selection & security access check
  const handleSelectLesson = (lessonId: string | number) => {
    const target = allLessons.find(l => l.id === lessonId);
    if (!target) return;

    setProgress(prev => ({
      ...prev,
      currentLessonId: lessonId,
      lastWatchedProgressSec: 0
    }));
    setQuizScore(null);
    setSelectedAnswers({});
    setAssignmentPoints(null);
    setAssignmentFeedback('');

    // Switch tab defaults based on lesson type
    if (target.type === 'quiz') setActiveTab('quiz');
    else if (target.type === 'assignment') setActiveTab('assignment');
    else if (target.type === 'doc') setActiveTab('doc');
    else setActiveTab('video');

    logActivity('Vào bài học', `Chuyển sang học bài: ${target.title}`);
  };

  const handleToggleComplete = async (lessonId: string | number) => {
    const target = allLessons.find(l => l.id === lessonId);
    const isLessonFree = target?.isPreview;
    const hasAccess = hasFullCourseAccess || isLessonFree;
    if (!hasAccess && lessonId) {
      alert("Bạn cần sở hữu khóa học để thực hiện thao tác hoàn thành bài giảng.");
      return;
    }

    const isCompleted = progress.completedLessonIds.map(String).includes(String(lessonId));

    // Optimistic UI update
    setProgress(prev => {
      const updated = isCompleted 
        ? prev.completedLessonIds.filter(id => String(id) !== String(lessonId))
        : [...prev.completedLessonIds, lessonId];

      if (target) {
        if (isCompleted) {
          logActivity('Hủy hoàn thành', `Hủy dấu học xong bài: ${target.title}`);
        } else {
          logActivity('Hoàn thành bài', `Xác nhận học xong bài: ${target.title}`);
        }
      }

      return { ...prev, completedLessonIds: updated };
    });

    try {
      await classroomApi.markLessonAsComplete(String(lessonId));
    } catch (e) {
      toast.error('Không thể lưu trạng thái hoàn thành trên máy chủ.');
      // Revert on failure
      setProgress(prev => {
        const updated = isCompleted 
          ? [...prev.completedLessonIds, lessonId]
          : prev.completedLessonIds.filter(id => String(id) !== String(lessonId));
        return { ...prev, completedLessonIds: updated };
      });
    }
  };

  // Save video play progress to API & dispatch "learning_resume" notification
  useEffect(() => {
    if (progress.currentLessonId && videoTime > 0) {
      if (activeLesson && activeLesson.type === 'video') {
         classroomApi.saveVideoPlaybackRatio(String(progress.currentLessonId), Math.floor(videoTime)).catch(e => console.warn('Failed to save video progress', e));
      }

      if (videoTime > 10 && activeLesson) {
        const notifItem = {
          id: `learning_resume_${course.id}_${activeLesson.id}`,
          type: 'learning_resume',
          category: 'database',
          title: `Bạn đang học dở bài ${activeLesson.title}`,
          message: `Tiếp tục từ giây ${Math.round(videoTime)}s trong bài ${activeLesson.title}.`,
          time_ago: 'Vừa xong',
          created_at: new Date().toISOString(),
          is_read: false,
          read_at: null,
          action_url: `/learn/${course.id}`
        };

        // classroomApi.saveNotification(notifItem).then(() => {
        //   window.dispatchEvent(new CustomEvent('mindhub_notification_updated', { detail: notifItem }));
        // }).catch(console.error);
      }
    }
  }, [Math.floor(videoTime / 10), progress.currentLessonId, course.id, activeLesson]);

  // Load video play progress whenever currentLessonId changes & save as last played lesson for "Học tiếp bài gần nhất"
  useEffect(() => {
    if (progress.currentLessonId) {
      setVideoTime(0); // Reset immediately to prevent ghost time from previous lesson
      classroomApi.getSecureLessonContent(String(progress.currentLessonId))
        .then((res: any) => {
          if (res && res.current_second) {
            setVideoTime(res.current_second);
          }
        }).catch(err => {
          console.warn('Could not fetch lesson current second', err);
        });
      setIsPlaying(false);
      localStorage.setItem(`mindhub_last_lesson_${course.id}`, String(progress.currentLessonId));
    }
  }, [progress.currentLessonId, course.id, chapters]);

  // Video controller mockup
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Video playback effects
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = videoSpeed;
    }
  }, [videoSpeed, currentVideoUrl]);

  // Fullscreen event listener and toggle function
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    const element = videoContainerRef.current;
    
    if (!document.fullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Mouse move and auto-hide controls in fullscreen
  const handleMouseMoveVideo = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isFullscreen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  };

  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isFullscreen]);

  // Create intelligent note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const newNote = {
      id: 'n-' + Date.now(),
      lessonId: progress.currentLessonId,
      text: newNoteText,
      timestamp: formatTime(videoTime),
      timestampSec: videoTime
    };
    setProgress(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes]
    }));
    setNewNoteText('');
    logActivity('Lưu Ghi chú', `Tại mốc ${formatTime(videoTime)} bài: ${activeLesson.title}`);
  };

  const handleDeleteNote = (noteId: string) => {
    setProgress(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== noteId)
    }));
  };

  // Create timestamp bookmark
  const handleAddBookmark = () => {
    const newB = {
      id: 'b-' + Date.now(),
      lessonId: progress.currentLessonId,
      title: `Gỡ rối tại phần: ${formatTime(videoTime)}`,
      timestampSec: videoTime
    };
    setProgress(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks, newB]
    }));
  };

  // Post Lesson Thread comment
  const handlePostQa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQaText.trim()) return;
    const comment: QAMessage = {
      id: 'qa-' + Date.now(),
      userName: currentUser?.name || 'Khách',
      userAvatar: currentUser?.avatar,
      userRole: currentUser?.role,
      text: newQaText,
      timestamp: 'Vừa xong',
      replies: []
    };
    setQaList([comment, ...qaList]);
    setNewQaText('');
    logActivity('Hỏi đáp Q&A', `Gửi thắc mắc về bài: ${activeLesson.title}`);
  };

  const handlePostReply = (qaId: string) => {
    const text = qaRepliesText[qaId];
    if (!text || !text.trim()) return;

    setQaList(prev => prev.map(qa => {
      if (qa.id === qaId) {
        const isInstructorRole = currentUser?.role === 'admin' || currentUser?.role === 'instructor';
        const newReply = {
          id: 'qa-r-' + Date.now(),
          userName: isInstructorRole ? `${currentUser?.name || 'Khách'} 🔔 (Giảng viên)` : currentUser?.name || 'Khách',
          userAvatar: currentUser?.avatar,
          userRole: currentUser?.role,
          text: text,
          timestamp: 'Vừa xong'
        };
        return {
          ...qa,
          replies: [...(qa.replies || []), newReply]
        };
      }
      return qa;
    }));

    const targetQa = qaList.find(q => q.id === qaId);
    logActivity('Trả lời Q&A', `Phản hồi thắc mắc của ${targetQa?.userName || 'học viên'}: "${text.substring(0, 30)}..."`);
    
    setQaRepliesText(prev => ({ ...prev, [qaId]: '' }));
    alert('Phát biểu ý kiến câu trả lời của giảng viên thành công!');
  };

  // Solve the multiple choice test
  const handleAnswerChange = (questionId: string, value: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleValidateQuiz = () => {
    if (!activeLesson.quiz) return;
    let score = 0;
    activeLesson.quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    setQuizScore(score);
    logActivity('Giải Quiz test', `Đạt ${score}/${activeLesson.quiz.questions.length} điểm chính tả tại bài: ${activeLesson.title}`);
    // Auto complete if passed 50%
    if (score >= Math.ceil(activeLesson.quiz.questions.length / 2)) {
      if (!progress.completedLessonIds.includes(progress.currentLessonId)) {
        handleToggleComplete(progress.currentLessonId);
      }
    }
  };

  // Submit hand-on assignment
  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentCode.trim()) return;
    
    // Simulate grading delay with intelligent response feed
    setAssignmentFeedback('Hệ thống đang chạy mã độc lập...');
    setTimeout(() => {
      setAssignmentPoints(95);
      setAssignmentFeedback('Hàm Server Action của bạn hoạt động rất tối ưu, chống trùng lặp CSRF và injection thành công. Tuyệt vời!');
      logActivity('Nộp Assignment', `Đạt 95 điểm bài tập thực hành bài: ${activeLesson.title}`);
      if (!progress.completedLessonIds.includes(progress.currentLessonId)) {
        handleToggleComplete(progress.currentLessonId);
      }
    }, 1500);
  };

  // AI Chat simulation response generator
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;
    
    const userMsg: MentorMessage = {
      id: 'm-user-' + Date.now(),
      sender: 'user',
      text: newChatMessage,
      timestamp: 'Vừa xong'
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    const userPromptText = newChatMessage;
    setNewChatMessage('');
    setIsAiTyping(true);

    // AI thinking
    setTimeout(() => {
      let aiResponseText = `Cảm ơn bạn đã đặt câu hỏi về "${userPromptText}". Theo logic lập trình hiện đại kết xuất trong bài giảng, bạn cần lưu ý:
1. Luôn bảo vệ các Route thông tin mật.
2. React Core Compiler hoạt động tại bước dịch nên không tốn thêm năng lực phần cứng của Client.
3. Liên hệ ngay Giảng viên nếu cần hướng dẫn lập trình trực tiếp các tính năng này nhé!`;
      
      if (userPromptText.toLowerCase().includes('compiler') || userPromptText.toLowerCase().includes('react')) {
        aiResponseText = `React Compiler (React 19) là đột phá lớn nhất! 
Nó tự biến mọi component của bạn thành 'pure memoized render' tương tự như có tự động chèn useMemo và useCallback. Điều này giảm thiểu tuyệt đối re-render dư thừa. Bạn không cần đổi cách code, React Compiler làm tất cả dưới mui xe!`;
      } else if (userPromptText.toLowerCase().includes('error') || userPromptText.toLowerCase().includes('lỗi')) {
        aiResponseText = `Để sửa đổi hoặc báo cáo lỗi cho bài học "${activeLesson.title}", bạn có thể bấm vào tab 'Báo lỗi nội dung' hoặc chụp ảnh màn hình gửi cho admin nhé. Mình khuyên bạn hãy kiểm tra lại phiên bản thư mục node_modules xem đã khớp với package.json chưa!`;
      }

      setChatMessages(prev => [...prev, {
        id: 'm-ai-' + Date.now(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: 'Vừa xong'
      }]);
      setIsAiTyping(false);
    }, 1800);
  };

  // Rate course after completion toggle
  const handlePostReview = async () => {
    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nội dung nhận xét trước khi gửi đánh giá.');
      return;
    }
    try {
      await apiFetch(`/courses/${course.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: reviewRating,
          content: reviewComment.trim(),
          comment: reviewComment.trim(),
        }),
      });
      toast.success('Đã gửi đánh giá khóa học thành công! Cám ơn phản hồi thiết thực của bạn.');
      setReviewComment('');
    } catch (err: any) {
      const msg = err?.message || 'Đã ghi nhận đánh giá của bạn trên hệ thống!';
      toast.success(msg);
      setReviewComment('');
    }
  };

  // Mock certificate verified code
  const verificationCode = `CERT-MD-${String(course.id).toUpperCase()}-${String(currentUser?.id || 'GUEST').toUpperCase()}`;

  if (isLoadingOutline) {
    return (
      <div className="fixed inset-0 bg-stone-950 z-[9999] flex flex-col items-center justify-center h-screen text-stone-250 font-sans p-6 text-center">
        <div className="flex flex-col items-center gap-4 text-emerald-500">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-stone-300 font-medium text-sm animate-pulse">Đang tải giáo án khóa học...</p>
        </div>
      </div>
    );
  }

  if (allLessons.length === 0 || !activeLesson) {
    return (
      <div className="fixed inset-0 bg-stone-950 z-[9999] flex flex-col items-center justify-center h-screen text-stone-250 font-sans p-6 text-center">
        <div className="max-w-md bg-stone-900 border border-stone-800 p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-500/11 text-amber-500 rounded-full flex items-center justify-center mb-6 border border-amber-500/20 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-3 text-stone-200">Chưa có nội dung bài học</h2>
          <p className="text-stone-400 text-xs mb-6 leading-relaxed">
            Khóa học <strong className="text-stone-300">{course.title}</strong> này hiện chưa được thiết lập giáo án hoặc chưa được thêm bất kỳ bài giảng nào. Vui lòng quay lại sau!
          </p>
          <button 
            onClick={onClose} 
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl transition duration-200 shadow-md cursor-pointer text-xs"
          >
            Quay lại trang chính (Thoát lớp học)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col md:flex-row-reverse h-screen font-sans ${classroomTheme === 'dark' ? 'bg-[#12161e] text-stone-200' : classroomTheme === 'sepia' ? 'bg-[#f4ebd0] text-[#4d3227]' : 'bg-[#faf8f5] text-stone-900'}`}>
      
      {/* Dynamic Classroom Sidebar: List Chapters and Chapters Video preview */}
      <div className={`flex flex-col shrink-0 transition-all duration-300 ${
        classroomTheme === 'dark' ? 'bg-[#12161e] border-[#2d3139] text-stone-200' : classroomTheme === 'sepia' ? 'bg-[#f4ebd0] border-[#cbbfa0] text-[#4d3227]' : 'bg-white border-stone-200 text-stone-900'
      } ${isSidebarVisible ? 'w-full md:w-80 h-1/3 md:h-full border-b md:border-b-0 md:border-l' : 'w-0 h-0 overflow-hidden pointer-events-none md:border-l-0 border-b-0'}`}>
        <div className={`p-4 flex items-center justify-between border-b ${
          classroomTheme === 'dark' ? 'bg-[#181a20] border-[#2d3139]' : classroomTheme === 'sepia' ? 'bg-[#e6dcb8] border-[#cbbfa0]' : 'bg-stone-50 border-stone-200'
        }`}>
          <button 
            onClick={onClose} 
            className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-lg border transition-all cursor-pointer font-display ${
              classroomTheme === 'dark' ? 'text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10' : classroomTheme === 'sepia' ? 'text-[#4d3227] hover:text-[#291a18] bg-[#dfd4b3]/50 hover:bg-[#dfd4b3] border-[#cbbfa0]' : 'text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border-stone-200 shadow-xs'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Thoát lớp học
          </button>
          <div className="text-right">
            <span className={`text-[10px] block font-mono font-semibold ${classroomTheme === 'dark' ? 'text-gray-300' : classroomTheme === 'sepia' ? 'text-[#7d655c]' : 'text-stone-500'}`}>MindHub Study</span>
          </div>
        </div>

        {/* Course Progress Percent Indicator */}
        <div className={`p-4 border-b text-xs ${
          classroomTheme === 'dark' ? 'bg-[#181a20] border-[#2d3139]' : classroomTheme === 'sepia' ? 'bg-[#fcf5e3]/60 border-[#cbbfa0]' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex justify-between font-bold mb-1.5">
            <span className={classroomTheme === 'dark' ? 'text-stone-300' : classroomTheme === 'sepia' ? 'text-[#5c3e35]' : 'text-stone-700'}>Tiến độ học tập:</span>
            <span className={`font-mono font-bold ${classroomTheme === 'dark' ? 'text-sky-400' : classroomTheme === 'sepia' ? 'text-[#734c2f]' : 'text-brand-normal'}`}>{calculatedPercent}% ({completedLessonsCount}/{totalLessonsCount} bài)</span>
          </div>
          <div className={`w-full rounded-full h-2 overflow-hidden border ${
            classroomTheme === 'dark' ? 'bg-[#2d3139] border-[#3b3e47]' : classroomTheme === 'sepia' ? 'bg-[#dfd4b3] border-[#cbbfa0]' : 'bg-stone-200 border-stone-300'
          }`}>
            <div className={`h-full transition-all duration-300 ${classroomTheme === 'sepia' ? 'bg-[#734c2f]' : 'bg-brand-normal'}`} style={{ width: `${calculatedPercent}%` }}></div>
          </div>
          
          {calculatedPercent === 100 && (
            <div className="mt-2 text-center p-2 bg-yellow-500/10 rounded-lg text-yellow-400 font-bold block animate-pulse border border-yellow-500/20 text-[10px] uppercase tracking-wider flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5" /> Chúc mừng! Đã Đủ Điều Kiện Nhận Chứng Chỉ
            </div>
          )}
        </div>

        {/* Next Suggested Lesson Quick Widget */}
        {(() => {
          const nextLesson = getNextSuggestedLesson();
          if (!nextLesson) return null;
          const isNextLessonLocked = !hasFullCourseAccess && !nextLesson.isPreview;
          return (
            <div className={`p-3 border-b text-[11px] space-y-1.5 flex flex-col ${
              classroomTheme === 'dark' ? 'bg-[#181a20] border-[#2d3139]' : classroomTheme === 'sepia' ? 'bg-[#fcf5e3]/60 border-[#cbbfa0]' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex justify-between items-center text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                <span>💡 Gợi ý học tiếp</span>
                {!isNextLessonLocked && <span className="bg-emerald-500/20 text-emerald-400 font-mono text-[9px] px-1.5 py-0.2 rounded font-bold">SẴN SÀNG</span>}
              </div>
              <p className={`font-bold line-clamp-1 leading-snug ${
                classroomTheme === 'dark' ? 'text-stone-200' : classroomTheme === 'sepia' ? 'text-[#4d3227]' : 'text-stone-800'
              }`}>{nextLesson.title}</p>
              <button
                type="button"
                onClick={() => {
                  if (isNextLessonLocked) {
                    alert("Bài học gợi ý tiếp theo yêu cầu quyền sở hữu khóa học.");
                    return;
                  }
                  handleSelectLesson(nextLesson.id);
                  logActivity('Nhấp bài gợi ý sidebar', `Vào bài gợi ý: ${nextLesson.title}`);
                }}
                className={`w-full py-1.5 rounded text-[10px] font-extrabold text-center transition-all cursor-pointer ${
                  isNextLessonLocked 
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-50' 
                    : classroomTheme === 'sepia' ? 'bg-[#734c2f] hover:bg-[#5c3b24] text-white shadow-xs' : 'bg-brand-normal hover:bg-brand-hover text-white shadow-xs'
                }`}
              >
                {isNextLessonLocked ? '🔒 Bài học tiếp đang Khóa' : 'Nhấn học tiếp »'}
              </button>
            </div>
          );
        })()}

        {/* Chapters Table View */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3 tactile-scrollbar">
          {(chapters || []).map((chapter) => (
            <div key={chapter.id} className="space-y-1">
              <h4 className={`text-xs font-bold px-2 py-1 leading-snug ${
                classroomTheme === 'dark' ? 'text-sky-400' : classroomTheme === 'sepia' ? 'text-[#734c2f]' : 'text-deep-indigo'
              }`}>
                {chapter.title}
              </h4>
              <div className="space-y-1">
                {chapter.lessons.map((lesson) => {
                  const isCurrent = progress.currentLessonId === lesson.id;
                  const isCompleted = progress.completedLessonIds.map(String).includes(String(lesson.id));
                  const isLocked = !hasFullCourseAccess && !lesson.isPreview;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 text-xs border ${
                        isCurrent 
                          ? classroomTheme === 'dark' ? 'bg-brand-normal text-white font-bold shadow-md border-sky-400/30' : classroomTheme === 'sepia' ? 'bg-[#734c2f] text-white font-bold shadow-md border-[#432c28]' : 'bg-brand-normal text-white font-bold shadow-md border-deep-indigo'
                          : isLocked 
                            ? classroomTheme === 'dark' ? 'hover:bg-red-950/20 text-stone-500 opacity-60 border-transparent' : classroomTheme === 'sepia' ? 'hover:bg-red-100/50 text-[#8c7468] opacity-60 border-transparent' : 'hover:bg-red-50 text-stone-400 opacity-60 border-transparent'
                            : classroomTheme === 'dark' ? 'hover:bg-white/5 text-stone-200 border-transparent hover:border-stone-700' : classroomTheme === 'sepia' ? 'hover:bg-[#dfd4b3]/60 text-[#4d3227] border-transparent hover:border-[#cbbfa0]' : 'hover:bg-stone-100 text-stone-800 border-transparent hover:border-stone-200'
                      }`}
                    >
                      {isLocked ? (
                        <span className="mt-0.5 text-red-400 shrink-0 font-bold text-[11px]" title="Bài học cần trả phí mở khóa">🔒</span>
                      ) : (
                        <input 
                          type="checkbox" 
                          checked={isCompleted}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(lesson.id);
                          }}
                          className={`mt-0.5 rounded focus:ring-2 shadow-xs bg-transparent cursor-pointer ${
                            isCurrent ? 'border-white text-white focus:ring-white' : 'border-stone-400 text-brand-normal focus:ring-brand-normal'
                          }`}
                          onClick={(e) => e.stopPropagation()} // Prevent selecting parent lesson
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`line-clamp-2 leading-relaxed font-semibold ${isLocked ? 'line-through decoration-stone-600/40' : ''}`}>{lesson.title}</p>
                        <span className={`font-mono text-[10px] mt-1 block ${
                          isCurrent ? (classroomTheme === 'sepia' ? 'text-[#fcf5e3]' : 'text-sky-100') : (classroomTheme === 'dark' ? 'text-stone-400' : classroomTheme === 'sepia' ? 'text-[#7d655c]' : 'text-stone-500')
                        }`}>
                          [{lesson.type.toUpperCase()}] • {lesson.duration} 
                          {isLocked && <span className="text-red-400 font-bold ml-1">(Khóa)</span>}
                        </span>
                      </div>
                      {lesson.isPreview && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                          isCurrent ? 'bg-white/20 text-white' : classroomTheme === 'dark' ? 'bg-white/10 text-stone-300' : classroomTheme === 'sepia' ? 'bg-[#dfd4b3] text-[#4d3227]' : 'bg-stone-200 text-stone-700'
                        }`}>Miễn phí</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Study Screen Component Content */}
      <div className={`flex-1 flex flex-col h-2/3 md:h-full overflow-hidden transition-all duration-300 ${classroomTheme === 'dark' ? 'bg-[#0f1115] text-[#eee5db]' : classroomTheme === 'sepia' ? 'bg-[#f4ebd0] text-[#5c3e35]' : 'bg-[#faf8f5] text-stone-900'}`}>
        
        {/* Active lesson title with current stream data */}
        <div className={`p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b transition-colors duration-300 shrink-0 ${classroomTheme === 'dark' ? 'bg-[#181a20] border-[#2d3139]' : classroomTheme === 'sepia' ? 'bg-[#e6dcb8] border-[#cbbfa0]' : 'bg-white border-brand-light-active'}`}>
          <div>
            <h2 className={`text-sm md:text-base font-bold tracking-tight leading-tight transition-colors duration-300 ${classroomTheme === 'dark' ? 'text-white' : classroomTheme === 'sepia' ? 'text-[#3d2c25]' : 'text-[#432c28]'}`}>
              {activeLesson.title}
            </h2>
            <p className={`text-[11px] transition-colors duration-300 ${classroomTheme === 'dark' ? 'text-gray-300' : classroomTheme === 'sepia' ? 'text-[#7d655c]' : 'text-stone-550'}`}>Khóa: {course.title}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-2 md:mt-0">
            {/* Toggle Sidebar Collapse button */}
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              aria-label={isSidebarVisible ? "Ẩn bảng tiến trình và danh sách bài học" : "Hiện bảng tiến trình và danh sách bài học"}
              className={`p-2 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-sm focus:ring-2 focus:ring-offset-2 ${
                classroomTheme === 'dark' 
                  ? 'bg-[#2d3139] hover:bg-[#3b3e47] active:bg-[#12161e] text-white border border-stone-600 focus:ring-sky-400' 
                  : classroomTheme === 'sepia' 
                    ? 'bg-[#e6dcb8] hover:bg-[#dfd4b3] active:bg-[#cbbfa0] text-[#3d2c25] border border-[#cbbfa0] focus:ring-[#734c2f]' 
                    : 'bg-brand-normal hover:bg-brand-hover active:bg-brand-dark text-white border border-brand-normal focus:ring-brand-normal'
              }`}
              title={isSidebarVisible ? "Ẩn bảng tiến trình & danh sách bài học" : "Hiện bảng tiến trình & danh sách bài học"}
            >
              <span className="flex items-center gap-2">
                {isSidebarVisible ? <FolderMinus className="w-4 h-4 shrink-0" /> : <FolderPlus className="w-4 h-4 shrink-0" />}
                {isSidebarVisible ? 'Ẩn tiến độ & bài học' : 'Hiện tiến độ & bài học'}
              </span>
            </button>

            {/* Ambient Eye Protection Theme Switcher inside Classroom */}
            <div className={`flex p-0.5 rounded-lg border text-[10.5px] items-center ${classroomTheme === 'dark' ? 'bg-black/40 border-[#2d3139]' : classroomTheme === 'sepia' ? 'bg-[#dbcdc3] border-[#cbbfa0]' : 'bg-[#f5ece3] border-brand-light-active'}`}>
              <span className={`px-2 font-bold text-[9px] uppercase tracking-wider block ${classroomTheme === 'dark' ? 'text-[#e8d8c8]' : 'text-[#432c28]'}`}>Màu:</span>
              <button
                type="button"
                onClick={() => setClassroomTheme('dark')}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all ${classroomTheme === 'dark' ? 'bg-[#432c28] text-white shadow-xs' : 'text-stone-500 hover:text-brand-dark'}`}
                title="Giao diện tối huyền bí"
              >
                Tối
              </button>
              <button
                type="button"
                onClick={() => setClassroomTheme('light')}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all ${classroomTheme === 'light' ? 'bg-[#432c28] text-white shadow-xs' : 'text-stone-500 hover:text-brand-dark'}`}
                title="Giao diện sáng ấm"
              >
                Sáng
              </button>
              <button
                type="button"
                onClick={() => setClassroomTheme('sepia')}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all ${classroomTheme === 'sepia' ? 'bg-[#432c28] text-white shadow-xs' : 'text-stone-500 hover:text-[#432c28]'}`}
                title="Giao diện giấy mộc"
              >
                Giấy
              </button>
            </div>

            {/* Tactile Previous / Next Lesson controls grouped on the right */}
            <div className="flex items-center gap-1.5 ml-2">
              <button 
                onClick={() => {
                  const index = allLessons.findIndex(l => l.id === progress.currentLessonId);
                  if (index > 0) handleSelectLesson(allLessons[index - 1].id);
                }}
                disabled={allLessons.findIndex(l => l.id === progress.currentLessonId) === 0}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-30 disabled:pointer-events-none ${
                  classroomTheme === 'dark' 
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-[#2d3139]' 
                    : classroomTheme === 'sepia' 
                      ? 'bg-[#dbcdc3]/70 hover:bg-[#dbcdc3] text-[#3d2c25] border border-[#cbbfa0]' 
                      : 'bg-[#f5ece3] hover:bg-[#dbcdc3] text-main-darker border border-brand-light-active'
                }`}
                title="Quay lại bài học trước"
              >
                <ChevronLeft className="w-4 h-4 text-current" /> Trước đó
              </button>
              
              <button 
                onClick={() => {
                  const index = allLessons.findIndex(l => l.id === progress.currentLessonId);
                  if (index < allLessons.length - 1) handleSelectLesson(allLessons[index + 1].id);
                }}
                disabled={allLessons.findIndex(l => l.id === progress.currentLessonId) === allLessons.length - 1}
                className="py-2 px-4 bg-brand-normal hover:bg-brand-hover active:scale-95 text-brand-light rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-30 disabled:pointer-events-none"
                title="Đi đến bài học tiếp theo"
              >
                Bài tiếp <ChevronRight className="w-4 h-4 text-brand-light" />
              </button>

              {/* Persistable Manual lesson completion state switcher */}
              <button
                type="button"
                onClick={() => handleToggleComplete(activeLesson.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                  progress.completedLessonIds.map(String).includes(String(activeLesson.id))
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : classroomTheme === 'dark'
                      ? 'bg-[#252830] hover:bg-[#2d313a] border border-white/10 text-stone-200'
                      : 'bg-stone-200 hover:bg-stone-250 text-stone-955'
                }`}
                title={progress.completedLessonIds.map(String).includes(String(activeLesson.id)) ? "Kích mốc để Hủy đánh dấu hoàn thành" : "Click để Xác nhận hoàn thành bài học này"}
              >
                <CheckCircle className={`w-3.5 h-3.5 ${progress.completedLessonIds.map(String).includes(String(activeLesson.id)) ? 'fill-white stroke-emerald-600' : ''}`} />
                <span className="hidden sm:inline">
                  {progress.completedLessonIds.map(String).includes(String(activeLesson.id)) ? 'Đã hoàn thành ✓' : 'Hoàn thành bài học'}
                </span>
                <span className="inline sm:hidden">
                  {progress.completedLessonIds.map(String).includes(String(activeLesson.id)) ? 'Đã học ✓' : 'Đã học?'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* High fidelity simulation of video player + timeline content */}
        <div className="flex-1 overflow-y-auto flex flex-col">

          {(() => {
            const isLessonFree = activeLesson?.isPreview;
            const hasAccess = hasFullCourseAccess || isLessonFree;
            
            if (!hasAccess) {
              return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto space-y-5 my-auto">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center text-3xl font-bold mx-auto animate-bounce shadow-inner">
                    🔒
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base md:text-lg font-extrabold text-[#9c2b1e] uppercase tracking-wider">Bài học đặc quyền đã bị khóa</h3>
                    <p className="text-xs text-stone-450 italic">Bạn đang chọn: "{activeLesson?.title || 'Bài học chuyên sâu'}"</p>
                  </div>
                  <p className="text-xs leading-relaxed text-stone-500">
                    Đây là tài nguyên học thuật thuộc dự án thực tế của MindHub. Bạn cần đăng ký khóa học để kích hoạt đặc quyền tải học liệu và truy cập nội dung bài học chuyên sâu.
                  </p>
                  
                  <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl space-y-2 text-left w-full text-xs">
                    <p className="font-extrabold text-amber-800 flex items-center gap-1"><Sparkles className="w-4 h-4" /> Đặc quyền học viên chính thức:</p>
                    <ul className="list-disc list-inside space-y-1 text-stone-500 font-medium">
                      <li>Hơn 50+ video bài giảng chất lượng cao không quảng cáo</li>
                      <li>Học liệu đính kèm độc quyền (Ebook, Code, Solution)</li>
                      <li>Tương tác 1-1 với AI Mentor & Trợ giảng con người</li>
                      <li>Sát hạch trực quan & Chứng chỉ bảo chứng năng lực</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      alert("Mẹo: Hãy kích hoạt mua khóa học bằng cách bấm nút 'Mua Ngay' trên trang chi tiết bên ngoài!");
                      onClose();
                    }}
                    className="w-full bg-[#432c28] hover:bg-black text-white hover:text-brand-light font-bold py-3.5 px-6 rounded-2xl text-xs uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Xem Cách Kích Hoạt Quyền Truy Cập »</span>
                  </button>
                </div>
              );
            }

            return null;
          })()}

          {/* Actual lesson content (Only rendered if authorized) */}
          {(() => {
            const isLessonFree = activeLesson?.isPreview;
            const hasAccess = hasFullCourseAccess || isLessonFree;
            if (!hasAccess) return null;

            return (
              <>
                {activeLesson.type === 'doc' && (
            <div className={`p-8 flex-1 overflow-y-auto transition-colors duration-300 ${classroomTheme === 'dark' ? 'bg-[#181a20] text-stone-200' : classroomTheme === 'sepia' ? 'bg-[#f5ebd0] text-[#4d3227]' : 'bg-[#fcfcf9] text-stone-850'}`}>
              <div className={`max-w-2xl mx-auto rounded-2xl border p-6 md:p-8 space-y-4 shadow-sm text-left transition-colors duration-300 ${
                classroomTheme === 'dark' 
                  ? 'bg-[#181a20] border-slate-700/55' 
                  : classroomTheme === 'sepia' 
                    ? 'bg-[#fcf7e8] border-[#cbbfa0]' 
                    : 'bg-white border-stone-200'
              }`}>
                <div className={`flex items-center gap-2 border-b pb-3 text-xs font-bold transition-all ${
                  classroomTheme === 'dark' 
                    ? 'border-slate-700/40 text-stone-400' 
                    : classroomTheme === 'sepia' 
                      ? 'border-[#cbbfa0]/50 text-[#7d655c]' 
                      : 'border-stone-150 text-stone-500'
                }`}>
                  <FileText className="w-4 h-4 text-brand-normal" />
                  <span>NỘI DUNG TÀI LIỆU KHÓA HỌC (.DOC)</span>
                  <span className={`ml-auto px-2 py-0.5 rounded font-mono text-[10px] ${
                    classroomTheme === 'dark' ? 'bg-slate-800 text-stone-300' : 'bg-slate-100 text-stone-500'
                  }`}>{activeLesson.duration} Đọc</span>
                </div>
                <h3 className={`text-lg md:text-xl font-display font-extrabold tracking-tight transition-colors duration-300 ${
                  classroomTheme === 'dark' ? 'text-white' : classroomTheme === 'sepia' ? 'text-[#3d2c25]' : 'text-[#432c28]'
                }`}>{activeLesson.title}</h3>
                
                <div className={`whitespace-pre-wrap leading-relaxed text-xs md:text-sm font-sans pt-2 space-y-3 transition-colors duration-300 ${
                  classroomTheme === 'dark' ? 'text-stone-300 font-normal' : classroomTheme === 'sepia' ? 'text-[#4d3227] font-semibold' : 'text-stone-850 font-medium'
                }`}>
                  {activeLesson.docContent || activeLesson.content || "Nội dung bài viết này chưa được giảng viên soạn thảo."}
                </div>
              </div>
            </div>
          )}
          
          {activeLesson.type === 'video' && (
            <div className="bg-black/90 p-4 relative flex flex-col items-center">
              {/* Fake Video Canvas Area with Lucide controllers */}
              <div 
                ref={videoContainerRef}
                onMouseMove={handleMouseMoveVideo}
                onMouseLeave={() => {
                  if (isFullscreen) {
                    setShowControls(false);
                  }
                }}
                style={{ cursor: isFullscreen && !showControls ? 'none' : 'auto' }}
                className={`w-full bg-[#050505] overflow-hidden relative flex items-center justify-center group shadow-2xl transition-all duration-300 ${
                  isFullscreen ? 'fixed inset-0 z-[120] w-screen h-screen rounded-none border-none aspect-auto p-0 bg-black' : 'max-w-3xl aspect-video rounded-xl border border-brand-light/5'
                }`}
              >
                
                {/* Floating Bookmark Button in Top-Right Corner */}
                <button 
                  onClick={handleAddBookmark} 
                  className={`absolute top-4 right-4 z-[60] bg-black/75 hover:bg-amber-950 backdrop-blur-md border border-white/20 hover:border-amber-500 text-stone-200 hover:text-white flex items-center gap-1.5 text-[10.5px] font-bold py-1.5 px-3 rounded-lg shadow-lg cursor-pointer transition-all duration-300 ${
                    isFullscreen && !showControls ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
                  }`}
                  title="Thêm Bookmark tại mốc thời gian hiện tại"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  <span>Thêm Bookmark</span>
                </button>

                {activeLesson.isPreview && !isPlaying && (
                  <div className="absolute top-3 left-3 bg-brand-normal/90 text-brand-light text-[10px] uppercase tracking-widest p-1.5 py-1 px-3.5 rounded-full font-bold">
                    PREVIEW BÀI MIỄN PHÍ KHÔNG CẦN ĐĂNG NHẬP
                  </div>
                )}

                <video
                  ref={videoRef}
                  onError={(e) => {
                    const error = e.currentTarget.error;
                    setVideoError(error ? `Error code ${error.code}: ${error.message}` : "Unknown video error");
                    console.error("Video error:", error);
                  }}
                  onLoadStart={() => setVideoError(null)}
                  src={currentVideoUrl}
                  className="absolute inset-0 w-full h-full object-contain bg-black z-0"
                  onTimeUpdate={(e) => {
                    setVideoTime(e.currentTarget.currentTime);
                  }}
                  onLoadedMetadata={(e) => {
                    setTotalVideoDuration(e.currentTarget.duration);
                    if (videoTime > 0 && e.currentTarget.currentTime === 0) {
                      e.currentTarget.currentTime = videoTime;
                    }
                  }}
                  onWaiting={() => setIsBuffering(true)}
                  onPlaying={() => setIsBuffering(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false);
                    if (!progress.completedLessonIds.includes(progress.currentLessonId)) {
                      handleToggleComplete(progress.currentLessonId);
                    }
                  }}
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) videoRef.current.pause();
                      else videoRef.current.play();
                    }
                  }}
                />

                {!isPlaying && !isBuffering && (
                  <button 
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
                      }
                    }}
                    className="w-16 h-16 bg-brand-normal text-brand-light rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
                  >
                    <Play className="w-8 h-8 fill-brand-light ml-1" />
                  </button>
                )}

                {videoError && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
                      <p className="text-red-400 font-bold mb-2">Video load error</p>
                      <p className="text-red-200 text-xs font-mono">{videoError}</p>
                      <p className="text-stone-400 text-xs mt-2 break-all">{currentVideoUrl}</p>
                    </div>
                  </div>
                )}

                {isBuffering && !videoError && (
                  <div className="text-center p-6 space-y-4 z-10 absolute bg-black/40 rounded-xl backdrop-blur-sm pointer-events-none">
                    <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-brand-normal animate-spin mx-auto"></div>
                    <div>
                      <p className="text-xs text-brand-light-active font-mono uppercase tracking-widest animate-pulse font-bold">Đang tải...</p>
                    </div>
                  </div>
                )}

                {/* Custom Video Control Row */}
                <div className={`absolute bottom-0 inset-x-0 bg-linear-to-t from-black/95 via-black/80 to-transparent p-4 flex flex-col justify-end gap-2.5 transition-all duration-300 ${
                  isFullscreen 
                    ? `p-6 z-50 transition-all ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}` 
                    : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity'
                }`}>
                  {/* Slider Progress Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-300">{formatTime(videoTime)}</span>
                    <input 
                      type="range" 
                      min={0}
                      max={totalVideoDuration}
                      value={videoTime}
                      onChange={(e) => {
                        const sec = parseInt(e.target.value);
                        setVideoTime(sec);
                        if (videoRef.current) {
                          videoRef.current.currentTime = sec;
                        }
                      }}
                      className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-normal"
                    />
                    <span className="text-[10px] font-mono text-gray-300">{formatTime(totalVideoDuration)}</span>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-3 text-xs w-full select-none">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) videoRef.current.pause();
                            else videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
                          }
                        }}
                        className="hover:text-amber-400 text-white font-bold cursor-pointer transition-all flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                      >
                        {isPlaying ? '⏸ Tạm dừng' : '▶ Phát'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-nowrap shrink-0 overflow-x-auto no-scrollbar">
                      {/* Styled Speed Selector */}
                      <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-700/80 rounded-lg px-2.5 py-1 text-white transition-all shadow-md shrink-0">
                        <span className="text-[9.5px] text-gray-300 font-bold uppercase tracking-wider whitespace-nowrap">Tốc độ:</span>
                        <select 
                          value={videoSpeed} 
                          onChange={(e) => setVideoSpeed(parseFloat(e.target.value))}
                          className="bg-[#24262d] text-amber-305 border-none px-2 py-0.5 focus:ring-0 text-[11px] font-extrabold cursor-pointer outline-none [color-scheme:dark] rounded-md"
                        >
                          <option value="0.25" className="bg-[#181a20] text-stone-100 font-medium">0.25x</option>
                          <option value="0.5" className="bg-[#181a20] text-stone-100 font-medium">0.5x</option>
                          <option value="0.75" className="bg-[#181a20] text-stone-100 font-medium">0.75x</option>
                          <option value="1" className="bg-[#181a20] text-stone-100 font-medium">1.0x</option>
                          <option value="1.25" className="bg-[#181a20] text-stone-100 font-medium">1.25x</option>
                          <option value="1.5" className="bg-[#181a20] text-stone-100 font-medium">1.5x</option>
                          <option value="1.75" className="bg-[#181a20] text-stone-100 font-medium">1.75x</option>
                          <option value="2" className="bg-[#181a20] text-stone-100 font-medium">2.0x</option>
                        </select>
                      </div>

                      {/* Styled Resolution Selector */}
                      <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-700/80 rounded-lg px-2.5 py-1 text-white transition-all shadow-md shrink-0">
                        <span className="text-[9.5px] text-gray-300 font-bold uppercase tracking-wider whitespace-nowrap">Độ phân giải:</span>
                        <select 
                          value={videoResolution} 
                          onChange={(e) => handleResolutionChange(e.target.value)}
                          disabled={!activeLesson?.qualities || activeLesson.qualities.length === 0}
                          title={!activeLesson?.qualities || activeLesson.qualities.length === 0 ? "Chỉ có một độ phân giải" : "Chọn độ phân giải"}
                          className="bg-[#24262d] text-amber-300 border-none px-2 py-0.5 focus:ring-0 text-[11px] font-extrabold cursor-pointer outline-none [color-scheme:dark] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {(!activeLesson?.qualities || activeLesson.qualities.length === 0) ? (
                            <option value="Auto" className="bg-[#181a20] text-stone-100 font-medium">Mặc định</option>
                          ) : (
                            <>
                              <option value="Auto" className="bg-[#181a20] text-stone-100 font-medium">Auto</option>
                              {activeLesson.qualities.map((q) => (
                                <option key={q.label} value={q.label} className="bg-[#181a20] text-stone-100 font-medium">{q.label}</option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>

                      {/* Fullscreen Button Toggle */}
                      <button 
                        onClick={toggleFullscreen}
                        className="bg-stone-900 border border-stone-700/80 hover:bg-stone-800 hover:scale-[1.03] active:scale-95 text-white py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition text-[11px] font-bold shadow-md shrink-0"
                        title={isFullscreen ? "Thu nhỏ về giao diện bài học" : "Phóng to toàn màn hình"}
                      >
                        {isFullscreen ? (
                          <>
                            <Minimize className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span className="whitespace-nowrap">Thu nhỏ</span>
                          </>
                        ) : (
                          <>
                            <Maximize className="w-3.5 h-3.5 text-amber-400" />
                            <span className="whitespace-nowrap">Toàn màn hình</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 p-1 px-1.5 rounded select-none font-medium whitespace-nowrap shrink-0">Tự động lưu</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

              </>
            );
          })()}

          {/* Sub Content Tabs selectors */}
          <div className={`sticky top-0 border-b flex items-center overflow-x-auto shrink-0 z-20 transition-all duration-300 ${classroomTheme === 'dark' ? 'bg-[#181a20] border-[#2d3139]' : classroomTheme === 'sepia' ? 'bg-[#e6dcb8] border-[#cbbfa0]' : 'bg-[#faf7f2]/95 border-brand-light-active'}`}>
            {activeLesson.type === 'video' && (
              <button 
                onClick={() => setActiveTab('video')} 
                className={`text-xs px-4 py-3 font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${activeTab === 'video' ? 'text-brand-normal border-b-2 border-brand-normal bg-brand-light/5' : classroomTheme === 'dark' ? 'text-gray-300 hover:text-white' : classroomTheme === 'sepia' ? 'text-[#8c7468] hover:text-[#432c28]' : 'text-stone-500 hover:text-brand-normal'}`}
              >
                <Video className="w-3.5 h-3.5" /> Xem Video bài giảng
              </button>
            )}
            {activeLesson.type === 'doc' && (
              <button 
                onClick={() => setActiveTab('doc')} 
                className={`text-xs px-4 py-3 font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${activeTab === 'doc' ? 'text-brand-normal border-b-2 border-brand-normal bg-brand-light/5' : classroomTheme === 'dark' ? 'text-gray-300 hover:text-white' : classroomTheme === 'sepia' ? 'text-[#8c7468] hover:text-[#432c28]' : 'text-stone-500 hover:text-brand-normal'}`}
              >
                <FileText className="w-3.5 h-3.5" /> Đọc Tài liệu bài học (.doc)
              </button>
            )}
            {activeLesson.type === 'quiz' && (
              <button 
                onClick={() => setActiveTab('quiz')} 
                className={`text-xs px-4 py-3 font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${activeTab === 'quiz' ? 'text-brand-normal border-b-2 border-brand-normal bg-brand-light/5' : classroomTheme === 'dark' ? 'text-gray-300 hover:text-white' : classroomTheme === 'sepia' ? 'text-[#8c7468] hover:text-[#432c28]' : 'text-stone-500 hover:text-brand-normal'}`}
              >
                <HelpCircle className="w-3.5 h-3.5" /> Làm bài Quiz test
              </button>
            )}
            {activeLesson.type === 'assignment' && (
              <button 
                onClick={() => setActiveTab('assignment')} 
                className={`text-xs px-4 py-3 font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${activeTab === 'assignment' ? 'text-brand-normal border-b-2 border-brand-normal bg-brand-light/5' : classroomTheme === 'dark' ? 'text-gray-300 hover:text-white' : classroomTheme === 'sepia' ? 'text-[#8c7468] hover:text-[#432c28]' : 'text-stone-500 hover:text-brand-normal'}`}
              >
                <Target className="w-3.5 h-3.5" /> Nộp bài tập thực hành
              </button>
            )}
            <button 
              onClick={() => setActiveTab('notes')} 
              className={`text-xs px-4 py-3 font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${activeTab === 'notes' ? 'text-brand-normal border-b-2 border-brand-normal bg-brand-light/5' : classroomTheme === 'dark' ? 'text-gray-300 hover:text-white' : classroomTheme === 'sepia' ? 'text-[#8c7468] hover:text-[#432c28]' : 'text-stone-500 hover:text-brand-normal'}`}
            >
              <PenSquare className="w-3.5 h-3.5" /> Ghi chú ({progress.notes.length})
            </button>
            <button 
              onClick={() => setActiveTab('qa')} 
              className={`text-xs px-4 py-3 font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${activeTab === 'qa' ? 'text-brand-normal border-b-2 border-brand-normal bg-brand-light/5' : classroomTheme === 'dark' ? 'text-gray-300 hover:text-white' : classroomTheme === 'sepia' ? 'text-[#8c7468] hover:text-[#432c28]' : 'text-stone-500 hover:text-brand-normal'}`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Hỏi đáp Q&A ({qaList.length})
            </button>
            <button 
              onClick={() => setActiveTab('heatmap')} 
              className={`text-xs px-4 py-3 font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${activeTab === 'heatmap' ? 'text-brand-normal border-b-2 border-brand-normal bg-brand-light/5' : classroomTheme === 'dark' ? 'text-gray-300 hover:text-white' : classroomTheme === 'sepia' ? 'text-[#8c7468] hover:text-[#432c28]' : 'text-stone-500 hover:text-brand-normal'}`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Heatmap Video chi tiết
            </button>
            <button 
              onClick={() => setActiveTab('mentor')} 
              className={`text-xs px-4 py-3 font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${activeTab === 'mentor' ? 'text-brand-normal border-b-2 border-brand-normal bg-brand-light/5' : classroomTheme === 'dark' ? 'text-gray-300 hover:text-white' : classroomTheme === 'sepia' ? 'text-[#8c7468] hover:text-[#432c28]' : 'text-stone-500 hover:text-brand-normal'}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Mentor Trợ Lý
            </button>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`text-xs px-4 py-3 font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${activeTab === 'analytics' ? 'text-brand-normal border-b-2 border-brand-normal bg-brand-light/5' : classroomTheme === 'dark' ? 'text-gray-300 hover:text-white' : classroomTheme === 'sepia' ? 'text-[#8c7468] hover:text-[#432c28]' : 'text-stone-500 hover:text-brand-normal'}`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" /> Tiến độ & Học bạ
            </button>
          </div>

          <div className={`p-6 transition-all duration-300 ${classroomTheme === 'dark' ? 'text-stone-200' : classroomTheme === 'sepia' ? 'text-[#5c3e35]' : 'text-main-darker'}`}>
            
            {/* VIDEO SIDE DETAILS / FILE DOWNLOADS */}
            {activeTab === 'video' && activeLesson.type === 'video' && (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className={`border rounded-2xl p-4 transition-colors duration-300 ${classroomTheme === 'dark' ? 'bg-white/5 border-white/10' : classroomTheme === 'sepia' ? 'bg-[#fcf5e3]/60 border-[#cbbfa0]' : 'bg-stone-50 border-stone-200'}`}>
                  <h3 className={`font-display font-semibold mb-2 text-sm flex items-center gap-2 transition-colors duration-300 ${classroomTheme === 'dark' ? 'text-white' : classroomTheme === 'sepia' ? 'text-[#3d2c25]' : 'text-[#432c28]'}`}>
                    <FolderOpen className="w-4 h-4 text-brand-normal" /> Học liệu đính kèm bài viết này
                  </h3>
                  {activeLesson.resources && activeLesson.resources.length > 0 ? (
                    <div className="space-y-2">
                      {activeLesson.resources.map(res => (
                        <div key={res.id} className={`flex justify-between items-center p-2.5 rounded-xl border transition-colors duration-300 ${classroomTheme === 'dark' ? 'bg-black/40 border-white/5 text-gray-300' : classroomTheme === 'sepia' ? 'bg-[#dfd4b3]/60 border-[#cbbfa0] text-[#5c3e35]' : 'bg-white border-stone-200 text-stone-750'}`}>
                          <span className="font-medium">{res.title} ({res.size})</span>
                          <button 
                            onClick={() => alert(`Bắt đầu chuyển hướng tải file giả định: MindHub S3 Storage ${res.url}`)}
                            className="bg-brand-normal hover:bg-brand-hover text-brand-light text-[10px] font-bold py-1 px-3 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <Download className="w-3 h-3" /> Tải về máy
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`transition-colors duration-300 ${classroomTheme === 'dark' ? 'text-gray-300' : classroomTheme === 'sepia' ? 'text-[#7d655c]' : 'text-gray-500'}`}>Không có bài học đính kèm đặc quyền cho bài giảng này.</p>
                  )}
                </div>

                <div className={`border rounded-2xl p-4 transition-colors duration-300 ${classroomTheme === 'dark' ? 'bg-white/5 border-white/10' : classroomTheme === 'sepia' ? 'bg-[#fcf5e3]/60 border-[#cbbfa0]' : 'bg-stone-50 border-stone-200'}`}>
                  <h3 className={`font-semibold mb-2 text-sm transition-colors duration-300 ${classroomTheme === 'dark' ? 'text-white' : classroomTheme === 'sepia' ? 'text-[#3d2c25]' : 'text-[#432c28]'}`}>💡 Tóm tắt lý thuyết bài giảng</h3>
                  <p className={`leading-normal transition-colors duration-300 ${classroomTheme === 'dark' ? 'text-gray-300' : classroomTheme === 'sepia' ? 'text-[#5c3e35]' : 'text-stone-650'}`}>{activeLesson.content}</p>
                </div>
              </div>
            )}

            {/* INTERACTIVE COMPREHENSIVE QUIZ MODULE */}
            {activeTab === 'quiz' && (
              <div className="space-y-4 animate-fade-in text-xs max-w-2xl mx-auto">
                <div className={`p-4 rounded-xl border text-center transition-colors duration-300 ${
                  classroomTheme === 'dark' 
                    ? 'bg-main-dark border-brand-light/10 text-white' 
                    : classroomTheme === 'sepia' 
                      ? 'bg-[#dfd4b3] border-[#cbbfa0] text-[#4d3227]' 
                      : 'bg-[#ece5dd] border-[#ebdcd0] text-stone-900'
                }`}>
                  <h3 className={`font-display font-bold text-sm mb-1 ${classroomTheme === 'dark' ? 'text-white' : classroomTheme === 'sepia' ? 'text-[#3d2c25]' : 'text-stone-900'}`}>
                    {activeLesson.quiz?.title || 'Đố vui sát hạch khái niệm'}
                  </h3>
                  <p className={`text-[11px] ${classroomTheme === 'dark' ? 'text-gray-300' : classroomTheme === 'sepia' ? 'text-[#7d655c]' : 'text-gray-500'}`}>Hãy trả lời đúng tất cả câu hỏi để ghi nhận độ thông thạo</p>
                </div>

                {activeLesson.quiz?.questions ? (
                  <div className="space-y-6">
                    {activeLesson.quiz.questions.map((q, idx) => (
                      <div key={q.id} className={`p-5 rounded-2xl text-left space-y-3 border transition-colors duration-300 ${
                        classroomTheme === 'dark' 
                          ? 'bg-brand-light/5 border-brand-light/10' 
                          : classroomTheme === 'sepia' 
                            ? 'bg-[#f5ebd0] border-[#cbbfa0]' 
                            : 'bg-stone-50 border-stone-200'
                      }`}>
                        <p className={`font-semibold text-xs ${classroomTheme === 'dark' ? 'text-white' : classroomTheme === 'sepia' ? 'text-[#3d2c25]' : 'text-stone-900'}`}>
                          Câu {idx + 1}: {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => (
                            <label 
                              key={oIdx}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                                selectedAnswers[q.id] === oIdx 
                                  ? 'bg-brand-normal/20 border-brand-normal text-brand-dark font-bold' 
                                  : classroomTheme === 'dark' 
                                    ? 'bg-main-darker/50 border-brand-light/5 hover:bg-main-dark text-stone-200' 
                                    : classroomTheme === 'sepia'
                                      ? 'bg-white/40 border-[#cbbfa0]/60 hover:bg-[#eae0c0] text-[#4d3227]'
                                      : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-850'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name={`q-${q.id}`}
                                checked={selectedAnswers[q.id] === oIdx}
                                onChange={() => handleAnswerChange(q.id, oIdx)}
                                className="mt-0.5"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>

                        {quizScore !== null && (
                          <div className={`mt-3 p-3 rounded-xl text-xs leading-normal border ${
                            selectedAnswers[q.id] === q.correctIndex 
                              ? classroomTheme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                              : classroomTheme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-800'
                          }`}>
                            <b>Kết quả:</b> {selectedAnswers[q.id] === q.correctIndex ? 'Chính xác! 🎉' : `Chưa đúng! Đáp án đúng: ${q.options[q.correctIndex]}`}
                            <p className={`mt-1 text-[11px] ${classroomTheme === 'dark' ? 'text-gray-300' : classroomTheme === 'sepia' ? 'text-[#5c3e35]' : 'text-stone-500'}`}>👉 {q.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="text-center pt-2">
                      {quizScore === null ? (
                        <button 
                          onClick={handleValidateQuiz}
                          className="bg-brand-normal hover:bg-brand-hover text-white font-bold py-2.5 px-6 rounded-xl animate-bounce shadow-md"
                        >
                          Nộp Bài & Kiểm tra đáp án
                        </button>
                      ) : (
                        <div className={`border p-4 rounded-xl inline-block transition-colors ${
                          classroomTheme === 'dark' ? 'bg-brand-light/10 border-brand-light/20 text-white' : classroomTheme === 'sepia' ? 'bg-[#dfd4b3] border-[#cbbfa0] text-[#4d3227]' : 'bg-stone-100 border-stone-200 text-stone-900'
                        }`}>
                          <p className="font-bold text-sm">Điểm số của bạn: {quizScore} / {activeLesson.quiz.questions.length} câu</p>
                          <button 
                            onClick={() => { setQuizScore(null); setSelectedAnswers({}); }}
                            className="text-xs text-brand-normal hover:underline mt-2 font-semibold"
                          >
                            Thiết lập Thử lại
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 text-center">Không tìm thấy dữ liệu Trắc nghiệm của bài học.</p>
                )}
              </div>
            )}

            {/* INTERACTIVE HANDS-ON ASSIGNMENTS FILE UPLOADS/SOURCE CODE */}
            {activeTab === 'assignment' && (
              <div className="space-y-4 animate-fade-in text-xs max-w-2xl mx-auto">
                <div className={`p-5 rounded-2xl text-left space-y-3 transition-colors duration-300 border ${
                  classroomTheme === 'dark' 
                    ? 'bg-brand-light/5 border-brand-light/10 text-brand-light' 
                    : classroomTheme === 'sepia' 
                      ? 'bg-[#dfd4b3]/50 border-[#cbbfa0] text-[#4d3227]' 
                      : 'bg-stone-50 border-stone-200 text-stone-800'
                }`}>
                  <h3 className={`font-display font-semibold text-sm ${classroomTheme === 'dark' ? 'text-white' : classroomTheme === 'sepia' ? 'text-[#3d2c25]' : 'text-stone-900'}`}>{activeLesson.assignment?.title}</h3>
                  <p className={`leading-relaxed text-xs ${classroomTheme === 'dark' ? 'text-gray-300' : classroomTheme === 'sepia' ? 'text-[#5c3e35]' : 'text-stone-650'}`}>{activeLesson.assignment?.description}</p>
                  <p className={`text-[10px] ${classroomTheme === 'dark' ? 'text-brand-light-hover' : 'text-brand-dark font-medium'}`}>Thang điểm tối đa: {activeLesson.assignment?.maxPoints} điểm • {activeLesson.assignment?.dueDate}</p>
                </div>

                <form onSubmit={handleSubmitAssignment} className="space-y-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-2 ${classroomTheme === 'dark' ? 'text-white' : classroomTheme === 'sepia' ? 'text-[#3d2c25]' : 'text-[#432c28]'}`}>
                      Nhập lời giải bài tập (Hoặc link github chứa mã nguồn cụ thể):
                    </label>
                    <textarea 
                      rows={6}
                      value={assignmentCode}
                      onChange={(e) => setAssignmentCode(e.target.value)}
                      placeholder="Hãy viết code hoặc copy dán link repo Github của bạn vào đây..."
                      className={`w-full font-mono text-xs p-3 rounded-xl focus:ring-1 focus:outline-none transition-all ${
                        classroomTheme === 'dark' 
                          ? 'bg-main-dark text-emerald-400 border border-brand-light/10 placeholder-gray-655' 
                          : classroomTheme === 'sepia' 
                            ? 'bg-white text-[#4d3227] border border-[#cbbfa0] placeholder-[#8c7468]' 
                            : 'bg-white text-stone-950 border border-stone-200 placeholder-stone-400'
                      }`}
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <button 
                      type="button" 
                      onClick={() => alert('Mô phỏng đính kèm file nộp bài thành công (ZIP, PDF, DOCX)')}
                      className={`py-1.5 px-3 rounded-lg transition-colors ${
                        classroomTheme === 'dark' ? 'bg-brand-light/10 text-brand-light-active hover:bg-brand-light/20' : 'bg-stone-150 text-stone-750 hover:bg-stone-200'
                      }`}
                    >
                      📎 Đính kèm tài liệu hỗ trợ
                    </button>
                    <button 
                      type="submit"
                      className="bg-brand-normal hover:bg-brand-hover text-white py-2 px-6 rounded-xl font-bold"
                    >
                      Bấm Gửi Bài làm cho Giảng viên chấm
                    </button>
                  </div>
                </form>

                {assignmentFeedback && (
                  <div className={`p-4 rounded-2xl space-y-1 border ${
                    classroomTheme === 'dark' 
                      ? 'bg-brand-light/5 border-brand-light/10' 
                      : classroomTheme === 'sepia' 
                        ? 'bg-[#dfd4b3]/60 border-[#cbbfa0]' 
                        : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${classroomTheme === 'dark' ? 'text-white' : 'text-[#3d2c25]'}`}>
                      <Sparkles className="w-4 h-4 text-brand-normal animate-pulse" />
                      Phản hồi tự động / Giảng viên chấm:
                    </p>
                    <p className={`font-medium text-xs mt-1 ${classroomTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>{assignmentFeedback}</p>
                    {assignmentPoints !== null && (
                      <p className={`font-mono text-xs mt-2 pt-1 border-t ${classroomTheme === 'dark' ? 'border-white/5 text-brand-light-active' : 'border-stone-200 text-stone-700'}`}>
                        ĐẠT ĐIỂM SỐ: <span className={`text-md font-bold ${classroomTheme === 'dark' ? 'text-yellow-400' : 'text-amber-800'}`}>{assignmentPoints}/100</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TIMESTAMPS INTERESTING NOTES FOR THE STUDENT PROFILE */}
            {activeTab === 'notes' && (
              <div className="space-y-4 animate-fade-in text-xs max-w-2xl mx-auto">
                <form onSubmit={handleAddNote} className={`flex gap-2 p-2 rounded-xl border transition-colors duration-300 ${
                  classroomTheme === 'dark' ? 'bg-main-dark border-brand-light/10 text-white' : classroomTheme === 'sepia' ? 'bg-[#dfd4b3] border-[#cbbfa0] text-[#4d3227]' : 'bg-stone-100 border-stone-200 text-stone-900'
                }`}>
                  <input 
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder={`Ghi chú nhanh tại thời điểm ${formatTime(videoTime)}...`}
                    className={`flex-1 bg-transparent px-3 text-xs focus:outline-none focus:ring-0 ${
                      classroomTheme === 'dark' ? 'text-white placeholder-gray-500' : 'text-stone-900 placeholder-stone-450 font-medium'
                    }`}
                    required
                  />
                  <button type="submit" className="bg-brand-normal text-white px-4 py-1.5 rounded-lg font-medium shrink-0 flex items-center gap-1.5 hover:bg-brand-hover">
                    <Plus className="w-3.5 h-3.5" /> Thêm ghi chú
                  </button>
                </form>

                <div className="space-y-3">
                  <div className={`flex justify-between items-center border-b pb-2 ${classroomTheme === 'dark' ? 'border-brand-light/10' : 'border-stone-250'}`}>
                    <h4 className={`font-semibold ${classroomTheme === 'dark' ? 'text-white' : classroomTheme === 'sepia' ? 'text-[#3d2c25]' : 'text-stone-900'}`}>Sổ tay ghi chú cá nhân khẩn cấp</h4>
                    <span className={`text-[10px] ${classroomTheme === 'dark' ? 'text-gray-300' : 'text-stone-500'}`}>Tự động gắn mã thời gian (timestamps)</span>
                  </div>

                  {progress.notes.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">Chưa có ghi chú nào được soạn thảo trong bài này.</p>
                  ) : (
                    <div className="space-y-2">
                      {progress.notes.map(note => (
                        <div key={note.id} className={`p-3 rounded-xl flex items-start gap-3 border transition-colors duration-300 ${
                          classroomTheme === 'dark' 
                            ? 'bg-brand-light/5 border-brand-light/10' 
                            : classroomTheme === 'sepia' 
                              ? 'bg-[#fcf7e8] border-[#cbbfa0]' 
                              : 'bg-stone-50 border-stone-200 shadow-3xs'
                        }`}>
                          <button 
                            onClick={() => {
                              if (note.timestampSec) setVideoTime(note.timestampSec);
                              setActiveTab('video');
                              setIsPlaying(true);
                            }}
                            className="bg-brand-normal/20 text-brand-light-active px-2 py-1 rounded font-mono font-bold hover:bg-brand-normal text-[10px] shrink-0 flex items-center gap-1 transition-all"
                            title="Bấm để nhảy nhanh đến thời điểm video"
                          >
                            <Clock className="w-3 h-3" /> {note.timestamp || '0:00'}
                          </button>
                          <div className="flex-1">
                            <p className={`text-justify ${classroomTheme === 'dark' ? 'text-gray-200' : classroomTheme === 'sepia' ? 'text-[#4d3227]' : 'text-stone-800 font-medium'}`}>{note.text}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-gray-300 hover:text-red-400 p-1 shrink-0 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Q&A FORUM / INTERACTIVE COMMENT THREAD BETWEEN STUDENTS & TEACHERS */}
            {activeTab === 'qa' && (
              <div className="space-y-4 animate-fade-in text-xs max-w-2xl mx-auto text-left">
                <form onSubmit={handlePostQa} className={`p-3 rounded-xl border flex flex-col gap-2 transition-colors duration-300 ${
                  classroomTheme === 'dark' ? 'bg-main-dark border-brand-light/10' : classroomTheme === 'sepia' ? 'bg-[#dfd4b3] border-[#cbbfa0]' : 'bg-stone-100 border-stone-200'
                }`}>
                  <textarea 
                    rows={2}
                    value={newQaText}
                    onChange={(e) => setNewQaText(e.target.value)}
                    placeholder="Bạn gặp khó khăn hay vướng mắc đoạn nào? Hỏi ngay để được trợ giúp..."
                    className={`bg-transparent text-xs p-2 focus:outline-none w-full ${
                      classroomTheme === 'dark' ? 'text-white placeholder-gray-500' : 'text-stone-900 placeholder-stone-500 font-medium'
                    }`}
                    required
                  />
                  <div className={`flex justify-between items-center border-t pt-2 ${classroomTheme === 'dark' ? 'border-brand-light/5' : 'border-stone-250/20'}`}>
                    <span className={`text-[10px] ${classroomTheme === 'dark' ? 'text-gray-300' : 'text-stone-500'}`}>Quy tắc cộng đồng văn minh</span>
                    <button type="submit" className="bg-brand-normal hover:bg-brand-hover text-white text-[11px] py-1 px-4 rounded-lg font-semibold shadow">
                      Phát biểu câu hỏi
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {qaList.map((qa) => (
                    <div key={qa.id} className={`p-4 rounded-2xl border space-y-3 transition-colors duration-300 ${
                      classroomTheme === 'dark' 
                        ? 'bg-brand-light/5 border-brand-light/10' 
                        : classroomTheme === 'sepia' 
                          ? 'bg-[#fcf7e8] border-[#cbbfa0]' 
                          : 'bg-white border-stone-200 shadow-3xs'
                    }`}>
                      <div className="flex items-center gap-2">
                        <img src={qa.userAvatar} alt="avatar" className={`w-8 h-8 rounded-full border ${classroomTheme === 'dark' ? 'border-brand-light/10' : 'border-stone-200'}`} />
                        <div>
                          <span className={`font-semibold block ${classroomTheme === 'dark' ? 'text-white' : classroomTheme === 'sepia' ? 'text-[#3d2c25]' : 'text-stone-900'}`}>{qa.userName}</span>
                          <span className={`text-[9px] uppercase tracking-widest ${classroomTheme === 'dark' ? 'text-gray-300' : 'text-stone-550'}`}>{qa.userRole === 'instructor' ? 'giảng viên' : 'học viên'} • {qa.timestamp}</span>
                        </div>
                      </div>
                      <p className={`pl-10 text-justify ${classroomTheme === 'dark' ? 'text-gray-300' : classroomTheme === 'sepia' ? 'text-[#5c3e35]' : 'text-stone-700 font-medium'}`}>{qa.text}</p>
                      
                      {/* Replies List */}
                      {qa.replies && qa.replies.length > 0 && (
                        <div className={`ml-10 border-l-2 border-brand-normal p-3 rounded-xl space-y-3 transition-colors duration-300 ${
                          classroomTheme === 'dark' ? 'bg-main-dark' : classroomTheme === 'sepia' ? 'bg-[#d6caa4]' : 'bg-stone-50'
                        }`}>
                          {qa.replies.map((reply) => (
                            <div key={reply.id} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <img src={reply.userAvatar} alt="avatar" className="w-6 h-6 rounded-full" />
                                <div>
                                  <span className={`font-semibold font-mono flex items-center gap-1 ${classroomTheme === 'dark' ? 'text-white' : classroomTheme === 'sepia' ? 'text-[#3d2c25]' : 'text-stone-900'}`}>{reply.userName} <Sparkles className="w-3 h-3 text-amber-400" /></span>
                                  <span className={`text-[9px] ${classroomTheme === 'dark' ? 'text-gray-300' : 'text-stone-550'}`}>{reply.timestamp}</span>
                                </div>
                              </div>
                              <p className={`text-justify text-[11px] pl-8 ${classroomTheme === 'dark' ? 'text-gray-300' : classroomTheme === 'sepia' ? 'text-[#5c3e35]' : 'text-stone-700 font-medium'}`}>{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Active Reply Form for Teachers/Users */}
                      <div className="ml-10 pt-2 border-t border-dashed border-white/5 flex gap-2">
                        <input
                          type="text"
                          placeholder={isInstructorOrAdmin ? "Trả lời với tư cách Giảng Viên xuất chúng..." : "Nhập câu trả lời / chia sẻ ý kiến của bạn..."}
                          value={qaRepliesText[qa.id] || ''}
                          onChange={(e) => setQaRepliesText(prev => ({ ...prev, [qa.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handlePostReply(qa.id);
                            }
                          }}
                          className={`flex-1 text-[11px] p-2 rounded-lg border focus:outline-none transition-colors duration-300 ${
                            classroomTheme === 'dark' 
                              ? 'bg-black/30 border-white/10 text-white focus:border-brand-normal placeholder-gray-500' 
                              : classroomTheme === 'sepia' 
                                ? 'bg-white/40 border-[#cbbfa0] text-[#4d3227] focus:border-[#4d3227] placeholder-[#a69282]' 
                                : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-brand-normal placeholder-stone-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handlePostReply(qa.id)}
                          className="bg-brand-normal hover:bg-brand-hover text-white text-[10px] font-bold py-1.5 px-3.5 rounded-lg active:scale-95 transition-all shrink-0 cursor-pointer"
                        >
                          Gửi đáp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI MENTOR SIDEKICK CHATBOT WIDGET */}
            {activeTab === 'mentor' && (
              <div className="space-y-4 animate-fade-in text-xs max-w-2xl mx-auto text-left">
                <div className="bg-linear-to-r from-brand-dark to-main-normal p-4 rounded-2xl flex items-center gap-3 border border-brand-light/10 shadow-lg shrink-0">
                  <div className="w-10 h-10 bg-brand-light/50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-brand-dark animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-brand-light text-sm flex items-center gap-1.5">
                      MindHub AI Tutor 
                      <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90">ONLINE</span>
                    </h3>
                    <p className="text-[10px] text-brand-light/75 font-medium">Trợ lý AI sẵn sàng phân tích, tóm tắt và hướng dẫn code 24/7</p>
                  </div>
                </div>

                {/* AI Chat History Container */}
                <div className={`border rounded-2xl h-80 flex flex-col overflow-hidden transition-all duration-300 ${
                  classroomTheme === 'dark' 
                    ? 'bg-main-dark border-brand-light/10' 
                    : classroomTheme === 'sepia' 
                      ? 'bg-[#dfd4b3] border-[#cbbfa0]' 
                      : 'bg-white border-stone-250/80 shadow-3xs'
                }`}>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                      >
                        <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.sender === 'user' ? 'bg-brand-normal text-white' : 'bg-brand-light/30 text-brand-light-hover'}`}>
                          {msg.sender === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className={`p-3 rounded-2xl leading-relaxed text-xs shadow-xs text-justify ${
                          msg.sender === 'user' 
                            ? 'bg-brand-normal text-brand-light font-medium' 
                            : classroomTheme === 'dark'
                            ? 'bg-[#1e222b]/80 border border-white/5 text-gray-300'
                            : classroomTheme === 'sepia'
                            ? 'bg-[#f4ebd0] border border-[#cbbfa0] text-[#4d3227] font-semibold'
                            : 'bg-stone-100 border border-stone-200 text-stone-900 font-medium'
                        }`}>
                          {msg.text}
                          <span className={`block text-[8px] text-right mt-1 ${classroomTheme === 'dark' ? 'text-gray-300' : 'text-stone-500'}`}>{msg.timestamp}</span>
                        </div>
                      </div>
                    ))}

                    {isAiTyping && (
                      <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
                        <div className="w-7 h-7 rounded-full bg-brand-light/50 flex items-center justify-center animate-spin"></div>
                        <div className={`p-3 rounded-2xl text-xs ${classroomTheme === 'dark' ? 'bg-brand-light/5 text-gray-300' : 'bg-stone-55 text-stone-500 font-medium'}`}>
                          <span className="animate-pulse">Thinking / Đang phân tích thuật toán...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendChatMessage} className={`border-t p-3 flex gap-2 transition-all duration-300 ${
                    classroomTheme === 'dark' 
                      ? 'border-brand-light/10 bg-main-darker' 
                      : classroomTheme === 'sepia' 
                        ? 'border-[#cbbfa0] bg-[#e6dcb8]' 
                        : 'border-stone-200 bg-stone-50'
                  }`}>
                    <input 
                      type="text" 
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="Hãy hỏi AI: 'Giải thích tối ưu hóa React Compiler'..."
                      className={`flex-1 border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-normal transition-all ${
                        classroomTheme === 'dark' 
                          ? 'bg-main-dark border-brand-light/10 text-white placeholder-gray-500' 
                          : classroomTheme === 'sepia'
                            ? 'bg-white border-[#cbbfa0] text-[#3d2c25] placeholder-[#8c7468] font-semibold'
                            : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400'
                      }`}
                      disabled={isAiTyping}
                    />
                    <button 
                      type="submit" 
                      className="bg-brand-normal hover:bg-brand-hover text-white p-2.5 rounded-xl transition-all shadow shrink-0"
                      disabled={isAiTyping}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* VIDEO HEATMAP - HIGHLIGHT STUDY FREQUENCY IN VIDEO PROGRESS */}
            {activeTab === 'heatmap' && (
              <div className="space-y-4 animate-fade-in text-xs max-w-2xl mx-auto text-left">
                <div className={`p-5 rounded-2xl border transition-colors duration-300 ${
                  classroomTheme === 'dark' 
                    ? 'bg-brand-light/5 border-brand-light/10' 
                    : classroomTheme === 'sepia' 
                      ? 'bg-[#dfd4b3]/40 border-[#cbbfa0]' 
                      : 'bg-stone-50 border-stone-200'
                }`}>
                  <h3 className={`font-display font-semibold text-sm flex items-center gap-1.5 ${classroomTheme === 'dark' ? 'text-brand-light' : 'text-brand-dark'}`}>
                    <Map className="w-5 h-5 text-brand-normal" />
                    Heatmap Lưu Lượng Xem Video Chi Tiết
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${classroomTheme === 'dark' ? 'text-gray-300' : 'text-stone-500 font-medium'}`}>
                    Biểu đồ phản ánh các mốc thời gian trong video được học viên chú ý hoặc quay lại xem đi xem lại nhiều lần nhất. Rất bổ ích để phân bổ sự quan tâm cần rèn luyện!
                  </p>

                  {/* SVG Map simulation */}
                  <div className={`my-6 border p-4 rounded-xl transition-all ${
                    classroomTheme === 'dark' 
                      ? 'bg-main-dark border-slate-700/50' 
                      : classroomTheme === 'sepia' 
                        ? 'bg-white/40 border-[#cbbfa0]' 
                        : 'bg-white border-stone-200'
                  }`}>
                    <div className="flex items-end justify-between h-20 gap-1.5">
                      {[12, 18, 45, 95, 120, 110, 85, 34, 12, 45, 50, 40, 15, 65, 85, 120, 150, 200, 95, 45].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col justify-end h-full">
                          <div 
                            style={{ height: `${(val / 200) * 100}%` }}
                            className={`rounded-t transition-all ${val > 100 ? 'bg-red-500' : val > 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            title={`Mốc ${idx * 18}s - ${val} lượt tua lại`}
                          ></div>
                        </div>
                      ))}
                    </div>

                    <div className={`flex justify-between text-[10px] pt-2 border-t ${classroomTheme === 'dark' ? 'border-slate-700 text-gray-300' : 'border-stone-200 text-stone-550'}`}>
                      <span>0:00 (Khởi đầu)</span>
                      <span>3:00 (Phần tranh cãi/Server Actions)</span>
                      <span>6:00 (Hết bài)</span>
                    </div>
                  </div>

                  <div className={`flex flex-wrap items-center gap-4 text-[10px] justify-center p-3 rounded-lg transition-all ${
                    classroomTheme === 'dark' 
                      ? 'bg-brand-light/5 text-gray-300' 
                      : classroomTheme === 'sepia' 
                        ? 'bg-[#d6caa4]/40 text-[#4d3227] font-semibold' 
                        : 'bg-stone-100 text-stone-800 font-medium'
                  }`}>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> Độ chú ý Cao độ (+100 lượt tua)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Độ chú ý Trung bình</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded"></span> Chạy mượt bình thường</span>
                  </div>
                </div>
              </div>
            )}

            {/* PROGRESS, PATH AND COURSE RATING TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fade-in text-xs max-w-2xl mx-auto text-left">
                
                {/* 1. Next suggested lesson in that course */}
                {(() => {
                  const nextLesson = getNextSuggestedLesson();
                  if (!nextLesson) {
                    return (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-extrabold text-emerald-400 text-sm flex items-center gap-1">🏆 HOÀN THÀNH XUẤT SẮC!</p>
                          <p className={`transition-all ${classroomTheme === 'dark' ? 'text-gray-300' : 'text-stone-750'}`}>Chúc mừng bạn đã hoàn thành xuất sắc {allLessons.length}/{allLessons.length} bài học trong khóa học này.</p>
                        </div>
                        <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wide">Đã hoàn tất</span>
                      </div>
                    );
                  }

                  const isNextLessonLocked = !hasFullCourseAccess && !nextLesson.isPreview;

                  return (
                    <div className="p-4 rounded-2xl bg-brand-light/5 border border-brand-normal/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <span className="px-2 py-0.5 bg-brand-normal text-white rounded-md text-[9px] font-bold uppercase tracking-wide">🔥 Gợi ý học tiếp</span>
                        <h4 className={`font-bold mt-1 text-sm leading-snug ${classroomTheme === 'dark' ? 'text-gray-200' : 'text-stone-900'}`}>{nextLesson.title}</h4>
                        <p className="text-[10px] text-gray-300 font-mono">Chương học: {(chapters || []).find(ch => ch.lessons.some(le => le.id === nextLesson.id))?.title || 'Chương hiện tại'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isNextLessonLocked) {
                            alert("Bài học gợi ý tiếp theo yêu cầu quyền sở hữu khóa học. Hãy click 'Mua Ngay' trên trang chi tiết bên ngoài!");
                            return;
                          }
                          handleSelectLesson(nextLesson.id);
                          logActivity('Nhấp bài gợi ý', `Vào bài gợi ý: ${nextLesson.title}`);
                        }}
                        className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
                          isNextLessonLocked 
                            ? 'bg-stone-850 text-stone-500 border border-stone-800 opacity-60' 
                            : 'bg-brand-normal hover:bg-brand-hover text-white shadow-md font-extrabold'
                        }`}
                      >
                        {isNextLessonLocked ? '🔒 Bài tiếp đang Khóa' : 'Học Tiếp Ngay »'}
                      </button>
                    </div>
                  );
                })()}

                {/* 2. Course completion conditions */}
                <div className={`p-5 rounded-2xl border transition-colors duration-300 ${
                  classroomTheme === 'dark' ? 'bg-[#1e222b] border-white/10' : classroomTheme === 'sepia' ? 'bg-[#dfd4b3]/60 border-[#cbbfa0]' : 'bg-white border-stone-250 shadow-3xs'
                }`}>
                  <h3 className={`font-display font-extrabold text-sm flex items-center gap-1.5 mb-1 ${classroomTheme === 'dark' ? 'text-brand-light' : 'text-stone-900'}`}>
                    <Award className="w-4 h-4 text-amber-500 animate-pulse" /> Điều Kiện Hoàn Thành Khóa Học
                  </h3>
                  <p className="text-stone-400 text-[11px] mb-4">Chúng tôi áp dụng mô hình liên kết đào tạo năng khiếu tối ưu. Hãy hoàn tất các điều kiện sau:</p>

                  <div className="space-y-3">
                    {/* Condition 1: Watch/complete all lessons */}
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/10">
                      <span className={`text-sm ${completedLessonsCount === totalLessonsCount ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {completedLessonsCount === totalLessonsCount ? '✓' : '⏰'}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-200">Hoàn thành 100% video & tài liệu</p>
                        <p className="text-[10px] text-gray-300">Đã học xong & đánh dấu {completedLessonsCount} trên tổng số {totalLessonsCount} bài giảng.</p>
                      </div>
                      <span className="font-bold text-brand-light-hover font-mono">{calculatedPercent}%</span>
                    </div>

                    {/* Condition 2: Score at least 50% in Quiz */}
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/10">
                      <span className={`text-sm ${quizScore !== null ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {quizScore !== null ? '✓' : '⏰'}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-200">Đạt yêu cầu bài thi thử (Quiz Test)</p>
                        <p className="text-[10px] text-gray-300">Yêu cầu hoàn tất khảo nghiệm trắc nghiệm đạt từ 50% tổng điểm trở lên.</p>
                      </div>
                      <span className="font-bold text-stone-400 font-mono">{quizScore !== null ? `Đã thi` : 'Chưa thi'}</span>
                    </div>

                    {/* Condition 3: Must make notes */}
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/10">
                      <span className={`text-sm ${progress.notes.length > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {progress.notes.length > 0 ? '✓' : '⏰'}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-200">Xây dựng ít nhất 1 dòng Ghi chú học tập</p>
                        <p className="text-[10px] text-gray-300">Có tương tác chủ động ghi ghép bài học để tổng hòa kiến thức.</p>
                      </div>
                      <span className="font-bold text-stone-400 font-mono">{progress.notes.length} note(s)</span>
                    </div>
                  </div>

                </div>

                {/* 3. Detailed study logs & history */}
                <div className={`p-5 rounded-2xl border transition-colors duration-300 ${
                  classroomTheme === 'dark' ? 'bg-[#1e222b] border-white/10' : classroomTheme === 'sepia' ? 'bg-[#dfd4b3]/60 border-[#cbbfa0]' : 'bg-white border-stone-250'
                }`}>
                  <h3 className={`font-display font-extrabold text-sm flex items-center gap-1.5 mb-2 ${classroomTheme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                    <Clock className="w-4 h-4 text-[#8a72ec]" /> Nhật Ký & Lịch Sử Hoạt Động Học Tập
                  </h3>
                  <p className="text-stone-400 text-[10px] mb-3">Lịch sử rèn luyện học tập chi tiết của bạn trong khóa học này (lưu cục bộ):</p>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex justify-between items-center p-2.5 rounded-xl bg-black/20 border border-white/5 text-[10.5px]">
                        <div className="flex-1 space-y-0.5 pr-2">
                          <span className="font-extrabold text-brand-light-hover">{log.action}</span>
                          <p className="text-stone-300 font-medium leading-relaxed">{log.details}</p>
                        </div>
                        <span className="font-mono text-[9px] text-[#868ea3] shrink-0">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Course feedback/rating */}
                <div className={`p-5 rounded-2xl border transition-colors duration-300 ${
                  classroomTheme === 'dark' ? 'bg-[#1e222b] border-white/10' : classroomTheme === 'sepia' ? 'bg-[#dfd4b3]/60 border-[#cbbfa0]' : 'bg-white border-stone-250 shadow-3xs'
                }`}>
                  <h3 className={`font-display font-extrabold text-sm flex items-center gap-1.5 mb-2 ${classroomTheme === 'dark' ? 'text-white' : 'text-[#3d2c25]'}`}>
                    <Sparkles className="w-4 h-4 text-amber-400 text-amber-500" /> Đánh Giá & Góp Ý Khóa Học Sau Khi Học
                  </h3>
                  <p className="text-stone-400 text-[11px] mb-4">Để lại xếp hạng sao và ý kiến phản hồi chân thực để ban cải tiến học thuật phục vụ tốt hơn:</p>

                  <div className="space-y-4">
                    {/* Star selection widget */}
                    <div>
                      <p className="font-semibold text-gray-200 mb-1.5">Chọn mức độ hài lòng:</p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="bg-transparent hover:scale-115 transition-all outline-none border-none p-0 cursor-pointer text-xl"
                            title={`Đánh giá ${star} sao`}
                          >
                            <span className={star <= reviewRating ? 'text-amber-400 font-bold' : 'text-stone-700'}>
                              ★
                            </span>
                          </button>
                        ))}
                        <span className="ml-2 font-bold font-mono text-amber-400 capitalize text-[10px]">
                          {reviewRating === 1 ? 'Rất tệ 😟' : reviewRating === 2 ? 'Tạm ổn 😐' : reviewRating === 3 ? 'Khá hay 🙂' : reviewRating === 4 ? 'Rất tốt 😃' : 'Tuyệt đỉnh! 😍'}
                        </span>
                      </div>
                    </div>

                    {/* FeedBack comments text area */}
                    <div className="space-y-1">
                      <label className="block text-gray-200 font-semibold text-[10.5px]">Nội dung góp ý chuyên sâu:</label>
                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Em học được rất nhiều kiến thức bổ ích từ các bài đọc, slide và video HLS mượt mà..."
                        className="w-full bg-black/20 text-white rounded-xl p-2.5 border border-white/10 text-xs focus:outline-none focus:border-brand-normal"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!reviewComment.trim()) {
                          alert("Vui lòng nhập nội dung nhận xét trước khi gửi đánh giá.");
                          return;
                        }
                        logActivity('Đánh giá khóa học', `Đạt ${reviewRating} sao, bình luận: "${reviewComment}"`);
                        handlePostReview();
                      }}
                      className="w-full bg-brand-normal hover:bg-brand-hover text-white py-2.5 font-bold rounded-xl text-xs uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Xác nhận gửi đánh giá khóa học
                    </button>
                  </div>
                </div>

              </div>
            )}



          </div>
        </div>

      </div>
    </div>
  );
}
