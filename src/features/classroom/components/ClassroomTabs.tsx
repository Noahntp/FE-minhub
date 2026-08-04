import React from 'react';
import { Course, Lesson } from '@/shared/types';
import { TabType } from '../hooks/useClassroom';
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
} from 'lucide-react';

interface ClassroomTabsProps {
  course: Course | null;
  activeLesson: Lesson | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function ClassroomTabs({ course, activeLesson, activeTab, onTabChange }: ClassroomTabsProps) {
  if (!course) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Tổng quan', icon: <Layout className="w-4 h-4" /> },
    { id: 'qa', label: 'Hỏi đáp', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'notes', label: 'Ghi chú', icon: <FileText className="w-4 h-4" /> },
    { id: 'resources', label: 'Tài nguyên', icon: <FolderDown className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      
      {/* TAB HEADER BAR */}
      <div className="flex items-center gap-6 border-b border-slate-100 pb-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-extrabold transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Title & Description */}
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Về bài học này
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                {activeLesson?.content ||
                  'Nội dung chi tiết của bài học đang được cập nhật. Theo dõi video để nắm bắt kiến thức một cách tốt nhất.'}
              </p>
            </div>

            {/* 2-Column Grid (Stats Grid + Blue Goal Box) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: 4 Stats Cards (md:col-span-6) */}
              <div className="md:col-span-6 grid grid-cols-2 gap-4">
                
                {/* Stat 1: Thời lượng */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Thời lượng</span>
                    <span className="text-xs font-black text-slate-900">
                      {activeLesson?.duration || '10:15'}
                    </span>
                  </div>
                </div>

                {/* Stat 2: Độ khó */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="w-9 h-9 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Độ khó</span>
                    <span className="text-xs font-black text-slate-900">
                      {course.level || 'Cơ bản'}
                    </span>
                  </div>
                </div>

                {/* Stat 3: Chủ đề */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="w-9 h-9 rounded-full bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Chủ đề</span>
                    <span className="text-xs font-black text-slate-900 truncate block max-w-[100px]">
                      {course.subcategory || 'REST API'}
                    </span>
                  </div>
                </div>

                {/* Stat 4: Hoàn thành */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="w-9 h-9 rounded-full bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Hoàn thành</span>
                    <span className="text-xs font-black text-slate-900">0%</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Blue Goal Card (md:col-span-6) */}
              <div className="md:col-span-6 bg-blue-50/70 border border-blue-100/80 rounded-2xl p-5 flex items-start gap-4">
                {/* Graduation Cap Illustration Badge */}
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    Mục tiêu bài học
                  </h4>
                  
                  <ul className="space-y-1.5 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                        ✓
                      </div>
                      <span>Hiểu các chuẩn RESTful API</span>
                    </li>

                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                        ✓
                      </div>
                      <span>Nắm vững HTTP Methods & Status Codes</span>
                    </li>

                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                        ✓
                      </div>
                      <span>Áp dụng vào Laravel Framework</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'qa' && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-base font-extrabold text-slate-900">Hỏi đáp & Thảo luận</h3>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-3">
              <p className="text-xs text-slate-600 font-semibold">
                Bạn có thắc mắc hoặc gặp khó khăn ở bài học này? Giảng viên và cộng đồng luôn sẵn sàng hỗ trợ bạn.
              </p>
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md">
                Đặt câu hỏi mới
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-base font-extrabold text-slate-900">Ghi chú cá nhân</h3>
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
              <textarea
                placeholder="Thêm ghi chú bài học tại đây (tự động lưu mốc thời gian video)..."
                className="w-full min-h-[120px] p-4 bg-slate-50/50 text-xs font-medium text-slate-800 focus:outline-none"
              />
              <div className="bg-slate-100/60 p-3 flex justify-end border-t border-slate-200/60">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
                  Lưu ghi chú
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-base font-extrabold text-slate-900">Tài nguyên bài học</h3>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-500 text-center font-medium">
              Không có tài nguyên đính kèm cho bài học này.
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
