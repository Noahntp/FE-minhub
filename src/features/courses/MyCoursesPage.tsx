import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { INITIAL_COURSES } from '@/shared/data';
import { Course } from '@/shared/types';
import { BookOpen, PlayCircle, Trophy, Target, Clock, Star, Heart } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/EmptyState';

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState<'learning' | 'completed' | 'saved'>('learning');
  const navigate = useNavigate();
  
  // Mock data
  const learningCourses = INITIAL_COURSES.slice(0, 2).map(c => ({...c, progress: Math.floor(Math.random() * 80) + 10}));
  const completedCourses = INITIAL_COURSES.slice(2, 3).map(c => ({...c, progress: 100}));
  const savedCourses = INITIAL_COURSES.slice(3, 5);

  const getDisplayCourses = () => {
    switch(activeTab) {
      case 'learning': return learningCourses;
      case 'completed': return completedCourses;
      case 'saved': return savedCourses;
      default: return learningCourses;
    }
  };

  const displayCourses = getDisplayCourses();

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto py-8 px-4">
        
        {/* Dashboard Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-2xl text-foreground">3</h3>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Khóa học</p>
          </div>
          <div className="bg-card border rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-2xl text-foreground">1</h3>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Hoàn thành</p>
          </div>
          <div className="bg-card border rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-3">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-2xl text-foreground">15</h3>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">XP Nhận được</p>
          </div>
          <div className="bg-card border rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-2xl text-foreground">42h</h3>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">Thời gian học</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b pb-4 overflow-x-auto whitespace-nowrap">
          <Button 
            variant={activeTab === 'learning' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('learning')}
            className="rounded-full gap-2"
          >
            <PlayCircle className="w-4 h-4" /> Đang học ({learningCourses.length})
          </Button>
          <Button 
            variant={activeTab === 'completed' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('completed')}
            className="rounded-full gap-2"
          >
            <Trophy className="w-4 h-4" /> Đã hoàn thành ({completedCourses.length})
          </Button>
          <Button 
            variant={activeTab === 'saved' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('saved')}
            className="rounded-full gap-2"
          >
            <Heart className="w-4 h-4" /> Đã lưu ({savedCourses.length})
          </Button>
        </div>

        {/* Courses List */}
        {displayCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Không có khóa học nào"
            description="Bạn chưa có khóa học nào trong danh sách này."
            actionLabel="Khám phá khóa học"
            onAction={() => navigate('/courses')}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayCourses.map((course: any) => (
              <Link 
                key={course.id} 
                to={activeTab === 'saved' ? `/courses/${course.id}` : `/learn/${course.id}`}
                className="group bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all block relative"
              >
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                    {course.title}
                  </h3>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Giảng viên: <strong>{course.instructorName}</strong></span>
                  </div>
                  
                  {/* Progress bar (Only for Learning & Completed) */}
                  {(activeTab === 'learning' || activeTab === 'completed') && (
                    <div className="mt-5">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground mb-1.5">
                        <span>Tiến độ</span>
                        <span className={course.progress === 100 ? "text-green-600" : "text-primary"}>
                          {course.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100 ? 'bg-green-500' : 'bg-primary'}`} 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Actions for Completed Tab */}
                  {activeTab === 'completed' && (
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={(e) => {
                        e.preventDefault();
                        navigate('/certificates');
                      }}>
                        <Trophy className="w-3 h-3" /> Xem chứng chỉ
                      </Button>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
