import React from 'react';
import { Course, Lesson } from '@/shared/types';
import { TabType } from '../hooks/useClassroom';

interface ClassroomTabsProps {
  course: Course | null;
  activeLesson: Lesson | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function ClassroomTabs({ course, activeLesson, activeTab, onTabChange }: ClassroomTabsProps) {
  if (!course) return null;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'qa', label: 'Hỏi đáp' },
    { id: 'notes', label: 'Ghi chú' },
    { id: 'resources', label: 'Tài nguyên' },
  ];

  return (
    <div className="w-full">
      <div className="border-b border-border/40 flex px-4 md:px-8 gap-6 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              py-4 text-sm font-semibold border-b-2 transition-all duration-300 relative
              ${activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 md:p-8">
        {activeTab === 'overview' && (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-bold mb-4 text-foreground/90 tracking-tight">Về bài học này</h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              {activeLesson?.content || (
                <p>Nội dung chi tiết của bài học đang được cập nhật. Theo dõi video để nắm bắt kiến thức một cách tốt nhất.</p>
              )}
            </div>
            
            <hr className="my-10 border-border/40" />
            
            <h3 className="text-xl font-bold mb-6 text-foreground/90 tracking-tight">Giảng viên</h3>
            <div className="flex items-start gap-5 bg-card border border-border/40 p-6 rounded-2xl shadow-sm">
              <img 
                src={course.instructorAvatar} 
                alt={course.instructorName} 
                className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-sm"
              />
              <div className="flex-1">
                <h4 className="font-bold text-lg text-foreground/90">{course.instructorName}</h4>
                <p className="text-primary font-medium text-sm mt-0.5">{course.instructorTitle}</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{course.instructorBio}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold mb-4">Hỏi đáp</h2>
            <div className="bg-muted/30 p-6 rounded-lg text-center">
              <p className="text-muted-foreground mb-4">Bạn có thắc mắc về bài học này?</p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium">
                Đặt câu hỏi mới
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-xl font-bold mb-6 text-foreground/90 tracking-tight">Ghi chú của bạn</h2>
            <div className="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
              <textarea 
                placeholder="Thêm ghi chú mới tại đây (hỗ trợ Markdown)..."
                className="w-full min-h-[120px] p-5 bg-transparent resize-y focus:outline-none text-sm"
              />
              <div className="bg-muted/20 p-3 flex justify-end border-t border-border/40">
                <button className="px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium text-sm transition-colors shadow-sm">
                  Lưu ghi chú
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold mb-4">Tài nguyên đính kèm</h2>
            {activeLesson?.resources && activeLesson.resources.length > 0 ? (
              <ul className="space-y-3">
                {activeLesson.resources.map(res => (
                  <li key={res.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                        📄
                      </div>
                      <div>
                        <p className="font-medium">{res.title}</p>
                        <p className="text-xs text-muted-foreground">{res.size}</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-primary hover:underline">
                      Tải xuống
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                Không có tài nguyên đính kèm cho bài học này.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
