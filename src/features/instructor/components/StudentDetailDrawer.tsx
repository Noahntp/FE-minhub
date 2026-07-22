import React, { useState, useEffect } from 'react';
import { X, BookOpen, Clock, Award, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import { ApiService } from '@/features/services/api';

interface StudentDetailDrawerProps {
  enrollmentId: number;
  onClose: () => void;
}

export default function StudentDetailDrawer({ enrollmentId, onClose }: StudentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'lessons' | 'quizzes'>('info');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
        if (res?.success || res?.data?.success) {
          setData(res.data?.data || res.data || res);
        }
      } catch (err) {
        console.error('Failed to fetch details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [enrollmentId]);

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-[100] flex flex-col animate-fade-in border-l">
      {/* Header */}
      <div className="p-5 border-b flex justify-between items-center bg-slate-50">
        <h2 className="font-black text-lg text-stone-800">Chi tiết Học viên</h2>
        <button onClick={onClose} className="p-2 bg-white border rounded-full hover:bg-stone-100 transition-colors">
          <X className="w-5 h-5 text-stone-600" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-normal"></div>
        </div>
      ) : !data ? (
        <div className="flex-1 p-6 flex justify-center items-center text-stone-400">Không thể tải dữ liệu</div>
      ) : (
        <>
          {/* Profile Header */}
          <div className="p-6 border-b flex items-center gap-4">
            <img 
              src={data.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=random`} 
              alt="avatar" 
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" 
            />
            <div>
              <h3 className="text-xl font-bold text-stone-900">{data.user.name}</h3>
              <p className="text-stone-500 text-sm">{data.user.email}</p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${activeTab === 'info' ? 'border-b-2 border-brand-normal text-brand-normal' : 'text-stone-500 hover:text-stone-700 hover:bg-slate-50'}`}
            >
              Thông tin
            </button>
            <button 
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${activeTab === 'lessons' ? 'border-b-2 border-brand-normal text-brand-normal' : 'text-stone-500 hover:text-stone-700 hover:bg-slate-50'}`}
            >
              Tiến độ
            </button>
            <button 
              onClick={() => setActiveTab('quizzes')}
              className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${activeTab === 'quizzes' ? 'border-b-2 border-brand-normal text-brand-normal' : 'text-stone-500 hover:text-stone-700 hover:bg-slate-50'}`}
            >
              Quiz
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {activeTab === 'info' && (
              <div className="space-y-4 text-sm text-stone-800">
                <div className="bg-white p-4 rounded-xl border space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-stone-500 text-xs font-bold uppercase">Khóa học</span>
                    <span className="font-semibold text-right max-w-[200px] truncate" title={data.course.title}>{data.course.title}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-stone-500 text-xs font-bold uppercase">Ngày ghi danh</span>
                    <span className="font-semibold">{new Date(data.enrollment.enrolled_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-stone-500 text-xs font-bold uppercase">Trạng thái</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${data.enrollment.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {data.enrollment.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-stone-500 text-xs font-bold uppercase">Tiến độ</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-normal">{Number(data.enrollment.progress).toFixed(0)}%</span>
                      <div className="w-16 h-1.5 bg-stone-200 rounded-full">
                        <div style={{ width: `${data.enrollment.progress}%` }} className="bg-brand-normal h-full rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-stone-500 text-xs font-bold uppercase">Lần học gần nhất</span>
                    <span className="font-semibold">{data.enrollment.last_accessed_at ? new Date(data.enrollment.last_accessed_at).toLocaleString('vi-VN') : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 text-xs font-bold uppercase">Ngày hoàn thành</span>
                    <span className="font-semibold">{data.enrollment.completed_at ? new Date(data.enrollment.completed_at).toLocaleDateString('vi-VN') : '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div className="bg-white p-5 rounded-xl border">
                {data.lessons_timeline.length === 0 ? (
                  <div className="text-center text-stone-400 py-6 text-sm">
                    Khóa học chưa có bài học hoặc chưa có dữ liệu tiến độ chi tiết.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-stone-200 ml-3 space-y-6">
                    {data.lessons_timeline.map((lesson: any, idx: number) => (
                      <div key={idx} className="relative pl-6">
                        <div className={`absolute -left-[11px] top-0.5 bg-white p-0.5 rounded-full ${lesson.status === 'completed' ? 'text-emerald-500' : lesson.status === 'in_progress' ? 'text-blue-500' : 'text-stone-300'}`}>
                          {lesson.status === 'completed' ? <CheckCircle className="w-4 h-4 bg-white" /> : lesson.status === 'in_progress' ? <PlayCircle className="w-4 h-4 bg-white" /> : <Circle className="w-4 h-4 bg-white" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-stone-800 leading-tight">{lesson.title}</span>
                          <span className="text-xs text-stone-500 mt-1">
                            {lesson.status === 'completed' ? 'Đã học xong' : lesson.status === 'in_progress' ? 'Đang học' : 'Chưa học'}
                            {lesson.last_accessed && ` • ${new Date(lesson.last_accessed).toLocaleDateString('vi-VN')}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="bg-white rounded-xl border overflow-hidden">
                {data.quizzes.length === 0 ? (
                  <div className="text-center text-stone-400 py-6 text-sm">
                    Học viên chưa làm bài Quiz nào.
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="py-2 px-3 font-bold text-stone-500 text-xs">Quiz</th>
                        <th className="py-2 px-3 font-bold text-stone-500 text-xs">Điểm</th>
                        <th className="py-2 px-3 font-bold text-stone-500 text-xs">Kết quả</th>
                        <th className="py-2 px-3 font-bold text-stone-500 text-xs">Ngày làm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.quizzes.map((quiz: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-stone-800 line-clamp-2" title={quiz.title}>{quiz.title}</td>
                          <td className="py-2 px-3">{Number(quiz.score).toFixed(0)}</td>
                          <td className="py-2 px-3">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${quiz.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {quiz.is_passed ? 'Đậu' : 'Rớt'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-xs text-stone-600">{new Date(quiz.created_at).toLocaleDateString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
