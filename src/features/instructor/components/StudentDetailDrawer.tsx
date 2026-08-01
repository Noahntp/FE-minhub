import React, { useState, useEffect } from 'react';
import { 
  X, BookOpen, Clock, Award, CheckCircle2, Circle, PlayCircle, 
  FileText, Download, Sparkles, Loader2, Copy, Check, Phone, 
  Mail, Calendar, Play, FileCode, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { instructorApi } from '@/features/instructor/api';

interface StudentDetailDrawerProps {
  enrollmentId: number;
  onClose: () => void;
}

export default function StudentDetailDrawer({ enrollmentId, onClose }: StudentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'lessons' | 'activity'>('roadmap');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      setData(null); // Anti-stale: Clear old student data immediately

      try {
        const res = await instructorApi.getInstructorLearnerDetails(enrollmentId);
        const apiData = res?.data || res;
        
        if (isMounted) {
          if (apiData && apiData.user && apiData.course) {
            setData(apiData);
          } else {
            setError('Không tìm thấy dữ liệu lượt ghi danh.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to fetch student details:', err);
          setError(err?.message || 'Không thể tải thông tin lượt ghi danh.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [enrollmentId]);

  const handleCopyEmail = (email: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimeAgo = (timeStr: string | null) => {
    if (!timeStr) return 'Chưa học';
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins > 0 ? diffMins : 1} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-[#f8fafc] shadow-2xl z-[100] flex flex-col border-l border-[#e7e8ed] text-xs font-semibold text-[#121b4b] text-left animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-5 border-b border-[#e7e8ed] bg-white flex justify-between items-center shrink-0">
        <div>
          <h2 className="font-black text-sm text-[#06091a] uppercase tracking-wide">Thông tin lượt ghi danh #{enrollmentId}</h2>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 border border-[#dbdde4] rounded-full hover:bg-slate-50 text-[#737373] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 p-6 flex flex-col justify-center items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#007A64]" />
          <span className="text-xs text-slate-500 font-bold">Đang tải dữ liệu lượt ghi danh...</span>
        </div>
      ) : error || !data ? (
        <div className="flex-1 p-6 flex flex-col justify-center items-center gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <span className="font-bold text-red-600 text-sm">{error || 'Không thể tải dữ liệu.'}</span>
          <button 
            onClick={() => {
              setLoading(true);
              setError(null);
              instructorApi.getInstructorLearnerDetails(enrollmentId).then(res => {
                setData(res?.data || res);
                setLoading(false);
              }).catch(err => {
                setError(err?.message || 'Không thể tải dữ liệu.');
                setLoading(false);
              });
            }}
            className="mt-2 px-4 py-2 bg-[#007A64] text-white rounded-xl text-xs font-bold hover:bg-[#006653] cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* Student Profile Overview Card */}
          <div className="p-5 border-b border-[#e7e8ed] bg-white flex items-center gap-4 shrink-0">
            <img 
              src={data.user.avatar} 
              alt={data.user.name} 
              className="w-14 h-14 rounded-full object-cover border border-[#dbdde4]" 
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#06091a] tracking-tight truncate">{data.user.name}</h3>
                <span className={`inline-flex items-center font-bold border px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide shrink-0 ${
                  data.enrollment?.status === 'completed' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {data.enrollment?.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[#595959] text-[10.5px] font-medium mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{data.user.email}</span>
                <button 
                  onClick={() => handleCopyEmail(data.user.email)}
                  className="p-0.5 hover:bg-slate-100 rounded text-[#8c8c8c] hover:text-[#06091a] cursor-pointer"
                  title="Sao chép email"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[#737373] text-[9.5px] font-medium mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{data.user.phone}</span>
              </div>
            </div>
          </div>

          {/* Enrollment Info Card */}
          <div className="p-4 bg-white border-b border-[#e7e8ed] grid grid-cols-2 gap-3 shrink-0 text-[10px]">
            <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e7e8ed]">
              <span className="text-[#8c8c8c] font-bold block uppercase tracking-wide text-[8.5px]">Khóa học</span>
              <span className="text-[#06091a] font-bold block mt-1 truncate" title={data.course.title}>
                {data.course.title}
              </span>
            </div>
            <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e7e8ed]">
              <span className="text-[#8c8c8c] font-bold block uppercase tracking-wide text-[8.5px]">Ngày ghi danh</span>
              <span className="text-[#06091a] font-bold block mt-1">
                {data.enrollment?.enrolled_at ? new Date(data.enrollment.enrolled_at).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </span>
            </div>
            <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e7e8ed]">
              <span className="text-[#8c8c8c] font-bold block uppercase tracking-wide text-[8.5px]">Hình thức học</span>
              <span className="text-[#06091a] font-bold block mt-1">{data.enrollment?.learning_mode || 'Online'}</span>
            </div>
            <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e7e8ed]">
              <span className="text-[#8c8c8c] font-bold block uppercase tracking-wide text-[8.5px]">Mã ghi danh</span>
              <span className="text-[#06091a] font-bold block mt-1 truncate" title={data.enrollment?.enrollment_code}>
                {data.enrollment?.enrollment_code}
              </span>
            </div>
          </div>

          {/* Progress Card */}
          <div className="p-4 bg-white border-b border-[#e7e8ed] flex items-center gap-4 shrink-0">
            {/* Circle Progress bar */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                <circle cx="32" cy="32" r="28" stroke={data.enrollment?.progress >= 100 ? '#10b981' : '#2563eb'} strokeWidth="6" fill="transparent"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - (data.enrollment?.progress || 0) / 100)}
                  strokeLinecap="round" />
              </svg>
              <span className="absolute text-xs font-black text-[#121b4b]">
                {data.enrollment?.progress || 0}%
              </span>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-[10.5px]">
              <div>
                <span className="text-[#8c8c8c] font-bold uppercase tracking-wide text-[8px]">Bài giảng hoàn thành</span>
                <span className="text-[#06091a] font-bold block mt-0.5">
                  {data.enrollment?.lessons_completed || 0}/{data.enrollment?.total_lessons || 0}
                </span>
              </div>
              <div>
                <span className="text-[#8c8c8c] font-bold uppercase tracking-wide text-[8px]">Thời lượng đã học</span>
                <span className="text-[#06091a] font-bold block mt-0.5">
                  {data.enrollment?.learning_duration || '0m'}
                </span>
              </div>
              <div>
                <span className="text-[#8c8c8c] font-bold uppercase tracking-wide text-[8px]">Thời lượng khóa học</span>
                <span className="text-[#06091a] font-bold block mt-0.5">
                  {data.enrollment?.course_duration || '0m'}
                </span>
              </div>
              <div>
                <span className="text-[#8c8c8c] font-bold uppercase tracking-wide text-[8px]">Lần truy cập cuối</span>
                <span className="text-[#06091a] font-bold block mt-0.5 truncate" title={data.enrollment?.last_accessed_at}>
                  {formatTimeAgo(data.enrollment?.last_accessed_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs bar */}
          <div className="flex border-b border-[#e7e8ed] shrink-0 bg-white shadow-3xs">
            <button 
              onClick={() => setActiveTab('roadmap')}
              className={`flex-1 py-3 text-[10.5px] font-black uppercase text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'roadmap' 
                  ? 'border-[#007A64] text-[#007A64]' 
                  : 'border-transparent text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Lộ trình học
            </button>
            <button 
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 py-3 text-[10.5px] font-black uppercase text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'lessons' 
                  ? 'border-[#007A64] text-[#007A64]' 
                  : 'border-transparent text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Bài giảng ({data.lessons?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-3 text-[10.5px] font-black uppercase text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'activity' 
                  ? 'border-[#007A64] text-[#007A64]' 
                  : 'border-transparent text-[#737373] hover:text-[#06091a]'
              }`}
            >
              Hoạt động gần đây ({data.activities?.length || 0})
            </button>
          </div>

          {/* Scrollable Tab contents */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* Roadmap Tab */}
            {activeTab === 'roadmap' && (
              <div className="bg-white p-5 rounded-2xl border border-[#e7e8ed] shadow-3xs space-y-5">
                {(!data.roadmap || data.roadmap.length === 0) ? (
                  <p className="text-center text-[#737373] py-6 font-medium">Chưa có chương học nào trong lộ trình khóa học này.</p>
                ) : (
                  <div className="relative border-l-2 border-slate-100 ml-2.5 space-y-6 text-xs text-[#121b4b]">
                    {data.roadmap.map((milestone: any, idx: number) => {
                      const isComp = milestone.status === 'completed';
                      const isLearning = milestone.status === 'learning';
                      return (
                        <div key={idx} className="relative pl-6">
                          <div className={`absolute -left-[9px] top-0 bg-white rounded-full ${
                            isComp ? 'text-emerald-500' : isLearning ? 'text-blue-500' : 'text-[#bfbfbf]'
                          }`}>
                            {isComp ? (
                              <CheckCircle className="w-4 h-4 bg-white fill-emerald-100 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4 bg-white text-slate-300" />
                            )}
                          </div>
                          <div>
                            <div className="flex justify-between items-baseline gap-2">
                              <p className="font-black text-[#06091a] leading-tight text-[11.5px]">{milestone.title}</p>
                              <span className="text-[10px] font-bold text-slate-500 shrink-0">
                                {milestone.completed_lessons}/{milestone.total_lessons} bài ({milestone.progress}%)
                              </span>
                            </div>
                            <p className="text-[10px] text-[#737373] mt-1 font-medium flex items-center gap-1.5">
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                                isComp ? 'bg-emerald-500' : isLearning ? 'bg-blue-500' : 'bg-slate-300'
                              }`} />
                              <span>{isComp ? 'Đã hoàn thành' : isLearning ? 'Đang học' : 'Chưa bắt đầu'}</span>
                              {milestone.lastActive && <span>• {formatTimeAgo(milestone.lastActive)}</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Lessons List Tab */}
            {activeTab === 'lessons' && (
              <div className="bg-white p-4 rounded-2xl border border-[#e7e8ed] shadow-3xs space-y-3 text-xs text-[#121b4b]">
                <h4 className="font-black uppercase tracking-wider text-[10px] text-[#06091a] mb-2">Danh sách bài giảng chi tiết</h4>
                
                {(!data.lessons || data.lessons.length === 0) ? (
                  <p className="text-center text-[#737373] py-6 font-medium">Khóa học này chưa có bài giảng nào.</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.lessons.map((les: any) => {
                      const isComp = les.status === 'completed';
                      const isLearning = les.status === 'learning';

                      return (
                        <div 
                          key={les.id} 
                          className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                            isComp ? 'bg-emerald-50/40 border-emerald-100' :
                            isLearning ? 'bg-blue-50/50 border-blue-100' :
                            'bg-slate-50/40 border-slate-100 text-[#737373]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {isComp ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : isLearning ? (
                              <PlayCircle className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-[#06091a] block truncate text-[11px]">{les.title}</span>
                              <span className="text-[9.5px] text-slate-400 font-medium block truncate">{les.section_title} • {les.duration}</span>
                            </div>
                          </div>

                          <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                            isComp ? 'text-emerald-700 bg-emerald-100/60' :
                            isLearning ? 'text-blue-700 bg-blue-100/60' :
                            'text-slate-500 bg-slate-100'
                          }`}>
                            {isComp ? 'Đã học' : isLearning ? 'Đang học' : 'Chưa học'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                {(!data.activities || data.activities.length === 0) ? (
                  <div className="bg-white rounded-2xl border border-[#e7e8ed] p-6 text-center text-[#737373] font-medium">
                    Chưa ghi nhận hoạt động nào của học viên trong khóa học này.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.activities.map((act: any) => {
                      let actIcon = <FileText className="w-4 h-4" />;
                      let colorClass = "bg-blue-50 text-blue-600 border-blue-200";
                      
                      if (act.type === 'video') {
                        actIcon = <PlayCircle className="w-4 h-4 text-blue-600" />;
                        colorClass = "bg-blue-50 text-blue-600 border-blue-200";
                      } else if (act.type === 'enrollment') {
                        actIcon = <BookOpen className="w-4 h-4 text-emerald-600" />;
                        colorClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
                      } else if (act.type === 'cert') {
                        actIcon = <Award className="w-4 h-4 text-amber-600" />;
                        colorClass = "bg-amber-50 text-amber-600 border-amber-200";
                      }
                      
                      return (
                        <div 
                          key={act.id} 
                          className={`p-4 rounded-2xl border bg-white shadow-3xs flex gap-3 text-xs font-semibold`}
                        >
                          <div className={`shrink-0 p-2 rounded-xl h-9 w-9 flex items-center justify-center ${colorClass}`}>
                            {actIcon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline gap-2">
                              <h4 className="font-bold text-[#06091a] text-[11px] truncate leading-tight">{act.title}</h4>
                              <span className="text-[9.5px] text-[#737373] font-medium shrink-0">{formatTimeAgo(act.time)}</span>
                            </div>
                            <p className="text-[#595959] font-medium text-[10px] mt-1 leading-relaxed">{act.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Drawer footer */}
          <div className="p-4 border-t border-[#e7e8ed] bg-white flex justify-end shrink-0">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 border border-[#dbdde4] text-[#121b4b] hover:bg-slate-50 rounded-xl font-bold transition-colors cursor-pointer bg-white text-xs"
            >
              Đóng
            </button>
          </div>
        </>
      )}

    </div>
  );
}
