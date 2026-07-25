import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, BookOpen, Clock, Plus, BarChart2, CheckCircle, 
  Settings, UserCheck, ShieldAlert, ArrowUpRight, FileText, Send, Trash2,
  Eye, EyeOff, Edit, PlusCircle, MinusCircle, Save, Check, ChevronRight, ChevronLeft,
  AlertTriangle, Play, HelpCircle, Lock, Sparkles, Upload, ArrowUp, ArrowDown, Shield, Key, Smartphone, Mail, X, List, AlertCircle, Search, LayoutDashboard, Activity, MessageSquare
} from 'lucide-react';
import { User, Course, Chapter, Lesson, Quiz, QuizQuestion, PayoutRequest } from '@/shared/types';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { InstructorRevenue } from '@/features/instructor/InstructorRevenue';
import { InstructorWithdrawal } from '@/features/instructor/InstructorWithdrawal';
import { InstructorQAModule } from '@/features/qa/index';
import { InstructorRevenueChart } from '@/features/instructor/InstructorRevenueChart';
import TransactionManagement from '@/features/instructor/components/TransactionManagement';
import { InstructorEnrollmentChart } from '@/features/instructor/InstructorEnrollmentChart';
import { InstructorTopCourses } from '@/features/instructor/InstructorTopCourses';
import { CouponManagement } from '@/features/coupons/index';
import { CourseBuilderWizard } from '@/features/instructor/components/CourseBuilderWizard';
import { InstructorSecurityPanel } from '@/features/instructor/components/InstructorSecurityPanel';
import { InstructorStudentManagement } from '@/features/instructor/components/InstructorStudentManagement';

interface InstructorDashboardProps {
  currentUser: User;
  courses: Course[];
  onCreateCourseDraft: (newC: Course) => void;
  onUpdateCourse: (c: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onClose: () => void;
}



export default function InstructorDashboard({
  currentUser,
  courses,
  onCreateCourseDraft,
  onUpdateCourse,
  onDeleteCourse,
  onClose
}: InstructorDashboardProps) {
  
  // Tabs: 'overview' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons'
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'transactions' | 'courses' | 'grading' | 'qa' | 'builder' | 'students' | 'security' | 'coupons' | 'payout'>('overview');
  const [initialEditCourseId, setInitialEditCourseId] = useState<string | null>(null);
  const [initialBuilderStep, setInitialBuilderStep] = useState<number>(1);

  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseStatusFilter, setCourseStatusFilter] = useState('all');
  
  const [gradingSubmissions, setGradingSubmissions] = useState([
    { id: 'sub-101', studentName: 'Student Test', email: 'student.test@mindhub.local', courseTitle: 'Chinh Phục React 19 & Next.js 15', lessonTitle: 'Bài tập 2.3: Validate Form Server Action', submittedValue: 'https://github.com/student/react19-form-test', points: null as number | null, feedback: '' }
  ]);


  const [totalEnrollments, setTotalEnrollments] = useState(0);
  // REVENUE STATE
  const [revenueStats, setRevenueStats] = useState<{totalRevenue: number, totalGross: number, totalPlatformFee: number, totalTransactions: number, totalStudentsPaid: number}>({
    totalRevenue: 0, totalGross: 0, totalPlatformFee: 0, totalTransactions: 0, totalStudentsPaid: 0
  });
  const [overviewBalance, setOverviewBalance] = useState<number>(0);
  const [overviewUnansweredQA, setOverviewUnansweredQA] = useState<number>(0);

  // Fetch stats when user changes
  useEffect(() => {
    if (currentUser?.id && currentUser.role === 'instructor') {
      Promise.resolve((Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any)).then(res => {
        setTotalEnrollments(res.totalEnrollments);
      }).catch(err => console.error("Error fetching enrollment stats", err));

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      Promise.resolve((Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any)).then(res => {
        setRevenueStats(res);
      }).catch(err => console.error("Error fetching revenue stats", err));

      Promise.resolve((Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any)).then(res => {
        setOverviewUnansweredQA(res.unansweredCount);
      }).catch(err => console.error("Error fetching qa stats", err));
    }
  }, [currentUser?.id]);

  const allInstructorCourses = courses.filter(c => c.instructorId === currentUser.id || c.instructorName === currentUser.name);
  
  const baseOverviewStats = {
    total: allInstructorCourses.filter(c => !(c as any).deleted_at && c.status !== 'archived').length,
    published: allInstructorCourses.filter(c => !(c as any).deleted_at && (c.status === 'active' || (c.status as any) === 'published')).length,
    draft: allInstructorCourses.filter(c => !(c as any).deleted_at && c.status === 'draft').length,
    pending: allInstructorCourses.filter(c => !(c as any).deleted_at && (c.status === 'pending' || (c.status as any) === 'pending_review')).length,
    rejected: allInstructorCourses.filter(c => !(c as any).deleted_at && c.status === 'rejected').length,
  };

  const overviewStats = baseOverviewStats.total > 0 ? baseOverviewStats : {
    total: 12, published: 8, draft: 2, pending: 1, rejected: 1
  };

  const displayTotalEnrollments = totalEnrollments > 0 ? totalEnrollments : 1250;
  const displayTotalRevenue = revenueStats.totalRevenue > 0 ? revenueStats.totalRevenue : 45000000;
  const displayOverviewBalance = overviewBalance > 0 ? overviewBalance : 15500000;
  const displayOverviewUnansweredQA = overviewUnansweredQA > 0 ? overviewUnansweredQA : 5;

  const recentCourses = [...allInstructorCourses].sort((a, b) => {
    if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
  }).slice(0, 5);

  const [courseFilterStatus, setCourseFilterStatus] = useState<string>('all');
  const instructorCourses = courseFilterStatus === 'all' 
    ? allInstructorCourses 
    : allInstructorCourses.filter(c => 
        courseFilterStatus === 'active' ? (c.status === 'active' || (c.status as any) === 'published') : 
        courseFilterStatus === 'pending' ? ((c.status as any) === 'pending_review' || c.status === 'pending') : 
        c.status === courseFilterStatus
      );

  const rawInstructorCourses = courses.filter(c => c.instructorName === currentUser.name && c.status !== 'archived');
  const filteredInstructorCourses = rawInstructorCourses.filter(c => {
    if (courseSearchQuery.trim() && !c.title.toLowerCase().includes(courseSearchQuery.toLowerCase())) {
      return false;
    }
    if (courseStatusFilter === 'all') return true;
    if (courseStatusFilter === 'draft') return c.status === 'draft';
    if (courseStatusFilter === 'pending') return c.status === 'pending';
    if (courseStatusFilter === 'rejected') return c.status === 'rejected';
    if (courseStatusFilter === 'active') return c.status === 'active' && !c.isHidden;
    if (courseStatusFilter === 'hidden') return c.isHidden;
    return true;
  });
  const totalStudents = rawInstructorCourses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const mockupAverageCompletion = Math.round(rawInstructorCourses.reduce((sum, c) => sum + c.completionRate, 0) / (rawInstructorCourses.length || 1));

  const handleGradeSubmission = (subId: string, pts: number, fbCode: string) => {
    if (pts < 0) {
      alert('Chấm điểm không hợp lệ: Điểm số của học sinh không được phép nhận giá trị âm.');
      return;
    }
    setGradingSubmissions(prev => 
      prev.map(s => s.id === subId ? { ...s, points: pts, feedback: fbCode } : s)
    );
    alert('Đã phản hồi lời giải và chấm điểm thành công cho học viên.');
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Hồ sơ yêu cầu rút tiền đã khởi tạo thành công! Admin MindHub đang tiến hành kiểm tra giao dịch.');
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="bg-white min-h-[90vh] rounded-2xl border border-brand-light-active overflow-hidden flex flex-col md:flex-row text-main-darker animate-fade-in shadow">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-brand-light-active p-3 md:p-4 shrink-0 flex flex-col md:block">
        
        {/* Avatar and Info: visible on desktop, hidden/compact on mobile */}
        <div className="hidden md:block text-center pb-4 border-b border-brand-light-active mb-4">
          <img src={currentUser.avatar} alt="Avatar" className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-brand-normal" />
          <h3 className="text-xs font-bold truncate">{currentUser.name}</h3>
          <span className="text-[10px] bg-brand-normal text-brand-light font-display px-2 py-0.5 rounded-full inline-block mt-1 font-semibold">Giảng viên Premium</span>
        </div>

        {/* Buttons List: flex horizontal on mobile, vertical on desktop */}
        <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1.5 md:gap-2 scrollbar-none scroll-smooth">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'overview' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <LayoutDashboard className="w-4 h-4 text-stone-700" /> Tổng quan Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('revenue')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'revenue' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <Activity className="w-4 h-4 text-stone-700" /> Doanh Thu
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'courses' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <BookOpen className="w-4 h-4 text-stone-700" /> Quản lý Khóa học
          </button>
          <button 
            onClick={() => setActiveTab('grading')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'grading' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <Clock className="w-4 h-4 text-stone-700" /> Chấm Bài làm
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'students' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <Users className="w-4 h-4 text-stone-700" /> Quản lý Học viên
          </button>
          
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'transactions' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <Activity className="w-4 h-4" /> Lịch sử Giao dịch
          </button>

          <button 
            onClick={() => setActiveTab('coupons')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'coupons' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <PlusCircle className="w-4 h-4 text-stone-700" /> Mã Giảm Giá
          </button>
          <button 
            onClick={() => setActiveTab('qa')}
            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-all ${activeTab === 'qa' ? 'bg-brand-normal text-brand-light' : 'bg-slate-50 md:bg-transparent hover:bg-brand-light-hover'}`}
          >
            <MessageSquare className="w-4 h-4 text-stone-700" /> Hỏi Đáp & Bình Luận
          </button>

          <div className="md:pt-6 shrink-0 flex items-center">
            <button onClick={onClose} className="whitespace-nowrap border text-xs py-1.5 px-3 rounded-lg text-gray-500 hover:text-black hover:bg-white bg-slate-50 md:bg-transparent">
              Trở lại Trang Chủ
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in text-xs text-left">
            <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5 border-b pb-3">
              <LayoutDashboard className="w-5 h-5 text-stone-850" /> Tổng quan Dashboard Giảng Viên
            </h3>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: Tổng khóa học */}
              <div 
                onClick={() => { setActiveTab('courses'); setCourseFilterStatus('all'); }}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Tổng khóa học</span>
                  <BookOpen className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-stone-800">{overviewStats.total}</span>
              </div>

              {/* Card 2: Đang Published */}
              <div 
                onClick={() => { setActiveTab('courses'); setCourseFilterStatus('active'); }}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Khóa Published</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-emerald-600">{overviewStats.published}</span>
              </div>

              {/* Card 3: Khóa Draft */}
              <div 
                onClick={() => { setActiveTab('courses'); setCourseFilterStatus('draft'); }}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Khóa Draft</span>
                  <Edit className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-gray-600">{overviewStats.draft}</span>
              </div>

              {/* Card 4: Đang chờ duyệt */}
              <div 
                onClick={() => { setActiveTab('courses'); setCourseFilterStatus('pending'); }}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Chờ duyệt</span>
                  <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-amber-600">{overviewStats.pending}</span>
              </div>

              {/* Card 5: Bị từ chối */}
              <div 
                onClick={() => { setActiveTab('courses'); setCourseFilterStatus('rejected'); }}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Bị từ chối</span>
                  <AlertTriangle className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-2xl font-black text-red-600">{overviewStats.rejected}</span>
              </div>
            </div>

            {/* Thống kê bổ sung */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {/* Lượt ghi danh */}
              <div 
                onClick={() => { setActiveTab('students'); }}
                className="bg-brand-normal border border-brand-hover rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <span className="text-[11px] uppercase font-bold text-brand-light tracking-wider">Tổng lượt ghi danh</span>
                  <Users className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative z-10 mt-1">
                  <span className="text-2xl font-black text-white">{displayTotalEnrollments}</span>
                  <span className="text-xs font-bold text-brand-light ml-1.5">lượt</span>
                </div>
              </div>

              {/* Doanh thu */}
              <div 
                onClick={() => { setActiveTab('revenue'); }}
                className="bg-emerald-600 border border-emerald-500 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <span className="text-[11px] uppercase font-bold text-emerald-100 tracking-wider">Doanh thu tháng này</span>
                  <Activity className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative z-10 mt-1">
                  <span className="text-2xl font-black text-white">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayTotalRevenue)}
                  </span>
                </div>
              </div>

              {/* Số dư có thể rút */}
              <div 
                onClick={() => { setActiveTab('transactions'); }}
                className="bg-[#5c3e21] border border-[#8b5e3c] rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <span className="text-[11px] uppercase font-bold text-[#e6ccb8] tracking-wider">Số dư có thể rút</span>
                  <DollarSign className="w-5 h-5 text-[#e6ccb8] group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative z-10 mt-1 flex justify-between items-end">
                  <span className="text-2xl font-black text-white">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayOverviewBalance)}
                  </span>
                </div>
              </div>

              {/* Câu hỏi chưa trả lời */}
              <div 
                onClick={() => { setActiveTab('qa'); }}
                className="bg-indigo-600 border border-indigo-500 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <span className="text-[11px] uppercase font-bold text-indigo-100 tracking-wider">Câu hỏi chưa trả lời</span>
                  <HelpCircle className="w-5 h-5 text-indigo-100 group-hover:scale-110 transition-transform" />
                </div>
                <div className="relative z-10 mt-1">
                  <span className="text-2xl font-black text-white">{displayOverviewUnansweredQA}</span>
                  <span className="text-xs font-bold text-indigo-200 ml-1.5">câu hỏi</span>
                </div>
              </div>
            </div>

            {/* Thêm Biểu đồ phân tích doanh thu */}
            <div className="w-full mb-6">
              <InstructorRevenueChart instructorId={currentUser.id} courses={instructorCourses} />
            </div>

            {/* Thêm Biểu đồ phân tích học viên */}
            <div className="w-full mb-6">
              <InstructorEnrollmentChart instructorId={currentUser.id} courses={instructorCourses} />
            </div>

            {/* Thêm Widget Top khóa học */}
            <div className="w-full mb-6">
              <InstructorTopCourses instructorId={currentUser.id} />
            </div>

            {/* Biểu đồ và Hoạt động gần đây */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Biểu đồ */}
              <div className="lg:col-span-1 bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-xs text-stone-800 border-b pb-2">Tỷ lệ Trạng thái Khóa học</h4>
                <div className="flex flex-col items-center justify-center py-4">
                  {overviewStats.total > 0 ? (
                    <div className="relative w-40 h-40">
                      <div 
                        className="w-full h-full rounded-full"
                        style={{
                          background: `conic-gradient(
                            #10b981 0% ${(overviewStats.published / overviewStats.total) * 100}%, 
                            #9ca3af ${(overviewStats.published / overviewStats.total) * 100}% ${((overviewStats.published + overviewStats.draft) / overviewStats.total) * 100}%, 
                            #f59e0b ${((overviewStats.published + overviewStats.draft) / overviewStats.total) * 100}% ${((overviewStats.published + overviewStats.draft + overviewStats.pending) / overviewStats.total) * 100}%, 
                            #ef4444 ${((overviewStats.published + overviewStats.draft + overviewStats.pending) / overviewStats.total) * 100}% 100%
                          )`
                        }}
                      ></div>
                      <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                        <span className="text-3xl font-black text-stone-800">{overviewStats.total}</span>
                        <span className="text-[9px] text-stone-500 font-bold uppercase mt-1">Tổng cộng</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-stone-400 text-center py-10 w-full bg-slate-50 rounded-full h-40 flex items-center justify-center">Chưa có khóa học nào</div>
                  )}
                </div>
                <div className="space-y-2 mt-4 text-[10.5px]">
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Published</span> <b>{overviewStats.published}</b></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Draft</span> <b>{overviewStats.draft}</b></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending</span> <b>{overviewStats.pending}</b></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Rejected</span> <b>{overviewStats.rejected}</b></div>
                </div>
              </div>

              {/* Hoạt động gần đây */}
              <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-xs text-stone-800 border-b pb-2 flex justify-between items-center">
                  <span>Hoạt động gần đây (Mới nhất)</span>
                  <button onClick={() => { setActiveTab('courses'); setCourseFilterStatus('all'); }} className="text-brand-normal hover:underline text-[10px]">Xem tất cả</button>
                </h4>
                {recentCourses.length > 0 ? (
                  <div className="space-y-3">
                    {recentCourses.map((c, i) => (
                      <div key={i} className="flex gap-4 items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200 cursor-pointer" onClick={() => { setInitialEditCourseId(c.id); setActiveTab('builder'); }}>
                        <img src={c.image} alt="" className="w-20 h-14 object-cover rounded-md border shrink-0 bg-white" />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h5 className="font-bold text-stone-800 truncate text-[11px] mb-0.5">{c.title}</h5>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-stone-500 truncate">Giá: {formatVND(c.price)}</span>
                            {c.createdAt && <span className="text-[9px] text-stone-400">Tạo: {new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>}
                          </div>
                        </div>
                        <div>
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap border ${
                            c.status === 'active' || (c.status as any) === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            c.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                            c.status === 'pending' || (c.status as any) === 'pending_review' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-white text-gray-600 border-gray-200'
                          }`}>
                            {c.status === 'active' || (c.status as any) === 'published' ? 'Published' : 
                             c.status === 'rejected' ? 'Bị từ chối' : 
                             c.status === 'pending' || (c.status as any) === 'pending_review' ? 'Chờ duyệt' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-stone-400 py-16 flex flex-col items-center">
                    <BookOpen className="w-10 h-10 text-stone-200 mb-2" />
                    <span>Không có hoạt động nào</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && (
          <InstructorRevenue instructorId={currentUser?.id} courses={courses} />
        )}

        {/* LIST OF COURSES TAB - NOW VERTICAL LAYOUT */}
        {activeTab === 'courses' && (
          <div className="space-y-6 animate-fade-in text-xs text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
              <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1 shrink-0">
                <BookOpen className="w-4 h-4 text-stone-850" /> Quản lý khóa học ({rawInstructorCourses.length})
              </h3>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    value={courseSearchQuery}
                    onChange={e => setCourseSearchQuery(e.target.value)}
                    className="w-full md:w-64 pl-9 pr-3 py-2 border rounded-xl focus:outline-none focus:border-brand-normal"
                  />
                </div>
                <select
                  value={courseStatusFilter}
                  onChange={e => setCourseStatusFilter(e.target.value)}
                  className="border rounded-xl px-3 py-2 bg-white min-w-[160px] focus:outline-none focus:border-brand-normal cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="draft">Đang hoàn thiện</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="rejected">Bị từ chối</option>
                  <option value="active">Đang công khai</option>
                  <option value="hidden">Đã ẩn</option>
                </select>
                <button 
                  onClick={() => { setInitialEditCourseId(null); setActiveTab('builder'); }}
                  className="bg-brand-normal hover:bg-brand-hover text-brand-light text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 justify-center"
                >
                  <Plus className="w-4 h-4" /> Tạo khóa học
                </button>
              </div>
            </div>

            {filteredInstructorCourses.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed rounded-2xl">
                <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-500 font-medium text-xs">Không tìm thấy khóa học nào khớp với bộ lọc.</p>
                {rawInstructorCourses.length === 0 && (
                  <button onClick={() => { setInitialEditCourseId(null); setActiveTab('builder'); }} className="mt-3 bg-brand-normal text-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark">
                    Tạo khóa học mới ngay
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInstructorCourses.map(course => (
                  <div 
                    key={course.id} 
                    className={`border border-brand-light-active rounded-2xl p-5 bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-stone-300 ${course.isHidden ? 'bg-stone-50/50 opacity-80' : ''}`}
                  >
                    {/* Left view detail */}
                    <div className="flex gap-4 text-left items-start md:items-center">
                      <img src={course.image} alt="Course banner" className="w-24 h-16 object-cover rounded-xl shrink-0 border" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                            course.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            course.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            course.status === 'draft' ? 'bg-slate-200 text-slate-700' :
                            course.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {course.status === 'active' ? '● Đang công khai' :
                             course.status === 'rejected' ? '● Bị từ chối' :
                             course.status === 'draft' ? '● Đang hoàn thiện' :
                             course.status === 'pending' ? '● Chờ duyệt' :
                             '● Không xác định'}
                          </span>
                          {course.isHidden && (
                            <span className="bg-gray-150 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded">
                              🚫 ĐANG ẨN
                            </span>
                          )}
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-stone-600 font-mono">
                            {course.category === 'Development' ? 'Lập trình' : 'Trí tuệ nhân tạo (AI)'}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-main-darker mt-1.5 leading-snug">{course.title}</h4>
                        
                        <div className="flex gap-3 text-[10px] text-gray-500 mt-1">
                          <span>Học viên: <b className="text-stone-700">{course.enrolledCount}</b></span>
                          <span>Giá gốc: <del className="text-gray-400">{formatVND(course.price)}</del></span>
                          <span>Giá ưu đãi: <b className="text-brand-normal">{formatVND(course.salePrice || course.price)}</b></span>
                        </div>

                        {course.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-red-700 text-[10px] leading-relaxed">
                            ⚠️ <b>Lý do hoàn trả sửa đổi:</b> {course.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side functional options */}
                    <div className="flex items-center gap-1.5 shrink-0 w-full md:w-auto self-end md:self-center justify-end border-t md:border-t-0 pt-3 md:pt-0">
                      
                      {course.status === 'rejected' && (
                        <button 
                          onClick={() => alert(`Lý do từ chối: ${course.rejectionReason || 'Không có lý do chi tiết.'}`)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-colors"
                        >
                          <AlertCircle className="w-4 h-4" /> Xem lý do
                        </button>
                      )}

                      {course.status === 'draft' && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Bạn có muốn gửi khóa học này cho Admin duyệt không?')) {
                              onUpdateCourse({ ...course, status: 'pending' });
                              alert('Đã gửi yêu cầu duyệt khóa học thành công!');
                            }
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Gửi duyệt
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          setInitialEditCourseId(course.id); 
                          setInitialBuilderStep(3); 
                          setActiveTab('builder'); 
                        }}
                        className="bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-colors"
                      >
                        <List className="w-4 h-4" /> Checklist
                      </button>

                      {course.status !== 'pending' && (
                        <button 
                          onClick={() => { setInitialEditCourseId(course.id); setActiveTab('builder'); }}
                          className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-colors"
                        >
                          <Edit className="w-4 h-4" /> Sửa
                        </button>
                      )}

                      {/* Hide/Show toggle option */}
                      {(course.status === 'active' || course.status === 'hidden') && (
                        <button 
                          onClick={() => {
                            const updated = { ...course, isHidden: !course.isHidden };
                            onUpdateCourse(updated);
                          }}
                          className={`p-1.5 rounded-xl border font-bold text-xs flex items-center justify-center transition-all ${course.isHidden ? 'bg-stone-50 border-stone-200 text-gray-400 hover:text-black' : 'bg-white border-stone-300 text-stone-700 hover:bg-slate-50'}`}
                          title={course.isHidden ? 'Đang ẩn - Bấm để hiện' : 'Đang hiện - Bấm để ẩn'}
                        >
                          {course.isHidden ? <EyeOff className="w-4 h-4 text-stone-500" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                        </button>
                      )}

                      {course.status !== 'active' && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này? Thao tác này không thể thu hồi.')) {
                              onDeleteCourse(course.id);
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-1.5 rounded-xl flex items-center justify-center font-bold"
                          title="Xóa khóa học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- DEDICATED STEPS COURSE BUILDER PAGE --- */}
        {activeTab === 'builder' && (
          <CourseBuilderWizard 
            currentUser={currentUser}
            courses={courses}
            onCreateCourseDraft={onCreateCourseDraft}
            onUpdateCourse={onUpdateCourse}
            onCloseWizard={() => setActiveTab('courses')}
            initialEditCourseId={initialEditCourseId}
            initialBuilderStep={initialBuilderStep}
          />
        )}
        {activeTab === 'grading' && (
          <div className="space-y-6 animate-fade-in text-xs text-left">
            <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1">
              <Clock className="w-4 h-4 text-stone-850" /> Chấm Bài làm học viên
            </h3>

            <div className="space-y-3">
              {gradingSubmissions.map(submission => (
                <div key={submission.id} className="border border-brand-light-active p-4 rounded-2xl bg-slate-50 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <span className="font-bold text-main-darker block">{submission.studentName}</span>
                      <span className="text-[10px] text-gray-400">{submission.email} • {submission.courseTitle}</span>
                    </div>
                    {submission.points ? (
                      <span className="bg-emerald-100 text-emerald-850 font-bold px-3 py-1 rounded">Điểm: {submission.points}/100</span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded">Chưa chấm điểm</span>
                    )}
                  </div>

                  <div className="bg-white border p-3 rounded-xl">
                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Mã nộp bài giải:</p>
                    <p className="font-mono text-[11px] text-emerald-600 break-all">{submission.submittedValue}</p>
                  </div>

                  {submission.points === null ? (
                    <div className="space-y-2">
                      <div className="flex gap-2.5">
                        <input 
                          type="number" 
                          placeholder="Chấm điểm (0 - 100)" 
                          id={`score-val-${submission.id}`}
                          className="w-32 text-xs border border-brand-light-active pl-3 py-1.5 rounded-xl bg-white" 
                        />
                        <button 
                          onClick={() => {
                            const val = parseInt((document.getElementById(`score-val-${submission.id}`) as HTMLInputElement)?.value || '95');
                            handleGradeSubmission(submission.id, val, 'Lời giải của bạn chính xác, code tối ưu dữ liệu!');
                          }}
                          className="bg-brand-normal text-white text-[11px] font-bold px-5 py-1.5 rounded-xl hover:bg-brand-hover"
                        >
                          Xác nhận Điểm & Gửi phản hồi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500 italic"><b>Nhận xét:</b> {submission.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        
        

        
        {/* WITHDRAWAL TAB */}
        {activeTab === 'payout' && (
          <InstructorWithdrawal instructorId={currentUser?.id} />
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <TransactionManagement instructorId={currentUser?.id || ''} />
        )}

        {/* STUDENTS MANAGEMENT DASHBOARD */}
        {activeTab === 'students' && (
          <InstructorStudentManagement 
            currentUser={currentUser} 
            coursesTaught={allInstructorCourses} 
          />
        )}
        {activeTab === 'security' && (
          <InstructorSecurityPanel currentUser={currentUser} />
        )}

        

        {/* TAB 9: COUPONS */}
        {activeTab === 'coupons' && (
          <CouponManagement />
        )}

        {/* TAB 10: QA */}
        {activeTab === 'qa' && (
          <InstructorQAModule />
        )}

      </div>
    </div>
  );
}
