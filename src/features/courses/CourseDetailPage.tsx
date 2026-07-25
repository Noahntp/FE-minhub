import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, PlayCircle, Check, ChevronDown, ChevronRight, 
  Video, FileText, Users, Award, Shield, MonitorPlay
} from 'lucide-react';

import { useApp } from '@/app/AppContext';
import { useCourseDetail } from './hooks/useCourseDetail';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { CourseDetailSkeleton } from './components/CourseDetailSkeleton';
import { CourseCard, CourseData } from './components/CourseCard';
import { ReviewList } from '@/features/reviews/ReviewList';
import { INITIAL_COURSES } from '@/shared/data';
import { toast } from 'sonner';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, isLoading, error } = useCourseDetail(courseId);
  
  const { cart, setCart, enrolledCourseIds } = useApp();
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleAddToCart = () => {
    if (!course) return;
    if (cart.includes(course.id)) {
      toast.info('Khoá học đã có trong giỏ hàng');
      navigate('/cart');
      return;
    }
    setCart([...cart, course.id]);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleEnrollNow = () => {
    if (!course) return;
    if (!cart.includes(course.id)) {
      setCart([...cart, course.id]);
    }
    navigate('/checkout');
  };

  if (isLoading) return <CourseDetailSkeleton />;
  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <EmptyState 
          title="Không tìm thấy khoá học" 
          description="Khoá học bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ." 
          actionLabel="Trở về trang chủ"
          onAction={() => navigate("/")}
        />
      </div>
    );
  }

  const isEnrolled = enrolledCourseIds.includes(course.id);
  
  const relatedCourses: CourseData[] = INITIAL_COURSES
    .filter(c => c.category === course.category && c.id !== course.id)
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      title: c.title,
      instructor: c.instructorName,
      thumbnail: c.image,
      duration: "20h 30m",
      difficulty: "Beginner"
    }));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-12 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 text-sm text-slate-300 mb-4">
              <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/')}>Trang chủ</span>
              <ChevronRight className="w-4 h-4" />
              <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/courses')}>{course.category}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white truncate">{course.title}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {course.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-300">
              {course.subtitle}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-yellow-400">
                <span className="font-bold text-lg">{course.rating.toFixed(1)}</span>
                <Star className="w-5 h-5 fill-current" />
                <span className="text-slate-300 ml-1">({course.reviewCount.toLocaleString()} đánh giá)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-5 h-5" />
                <span>{course.enrolledCount.toLocaleString()} học viên</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <img src={course.instructorAvatar} alt={course.instructorName} className="w-10 h-10 rounded-full object-cover border-2 border-slate-700" />
              <div>
                <p className="font-medium">Giảng viên: <span className="text-primary-foreground hover:underline cursor-pointer">{course.instructorName}</span></p>
                <p className="text-xs text-slate-400">Cập nhật lần cuối: 10/2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Mobile Image (hidden on desktop where sidebar handles it) */}
          <div className="block lg:hidden rounded-xl overflow-hidden shadow-lg border border-border bg-card">
            <img src={course.image} alt={course.title} className="w-full h-auto aspect-video object-cover" />
            <div className="p-6 space-y-4">
              <div className="text-3xl font-bold">
                {course.salePrice ? (
                  <div className="flex items-center gap-3">
                    <span>{course.salePrice.toLocaleString()}đ</span>
                    <span className="text-lg text-muted-foreground line-through">{course.price.toLocaleString()}đ</span>
                  </div>
                ) : (
                  <span>{course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}</span>
                )}
              </div>
              
              {isEnrolled ? (
                <Button className="w-full h-12 text-lg" onClick={() => navigate(`/learn/${course.id}`)}>
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Tiếp tục học
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button className="w-full h-12 text-lg" onClick={handleAddToCart}>
                    Thêm vào giỏ hàng
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-lg" onClick={handleEnrollNow}>
                    Mua ngay
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* What you'll learn */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Bạn sẽ học được gì</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.willLearn.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Nội dung khoá học</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>{course.chapters.length} chương</span>
              <span>•</span>
              <span>{course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} bài học</span>
            </div>
            
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              {course.chapters.map((chapter, index) => {
                const isExpanded = expandedChapters[chapter.id] ?? (index === 0);
                return (
                  <div key={chapter.id} className="border-b border-border last:border-b-0">
                    <button 
                      className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => toggleChapter(chapter.id)}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                        <span className="font-semibold text-foreground">{chapter.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground hidden md:block">
                        {chapter.lessons.length} bài học
                      </span>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-2 space-y-1">
                            {chapter.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  {lesson.type === 'video' ? <Video className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-blue-500" />}
                                  <span className={`text-sm ${lesson.isPreview ? 'text-primary font-medium cursor-pointer hover:underline' : 'text-muted-foreground'}`}>
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  {lesson.isPreview && <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full hidden md:inline-block">Xem thử</span>}
                                  <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Description */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Mô tả chi tiết</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: course.description }} />
          </section>

          {/* Instructor */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Giảng viên</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <img src={course.instructorAvatar} alt={course.instructorName} className="w-32 h-32 rounded-full object-cover shrink-0" />
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold hover:text-primary cursor-pointer transition-colors" onClick={() => navigate(`/instructors/${course.instructorId}`)}>{course.instructorName}</h3>
                  <p className="text-muted-foreground">{course.instructorTitle}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> {course.rating.toFixed(1)} Điểm</div>
                  <div className="flex items-center gap-1"><Users className="w-4 h-4 text-blue-500" /> {course.enrolledCount.toLocaleString()} Học viên</div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{course.instructorBio}</p>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Đánh giá của học viên</h2>
            <ReviewList targetId={course.id} type="course" />
          </section>
        </div>

        {/* Right Sidebar (Sticky) */}
        <div className="hidden lg:block relative">
          <div className="sticky top-24 rounded-xl border border-border shadow-xl bg-card overflow-hidden">
            <div className="relative group cursor-pointer">
              <img src={course.image} alt={course.title} className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center group-hover:hidden">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <PlayCircle className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-3xl font-bold">
                {course.salePrice ? (
                  <div className="flex items-center gap-3">
                    <span>{course.salePrice.toLocaleString()}đ</span>
                    <span className="text-lg text-muted-foreground line-through">{course.price.toLocaleString()}đ</span>
                  </div>
                ) : (
                  <span>{course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}</span>
                )}
              </div>
              
              {isEnrolled ? (
                <Button className="w-full h-12 text-lg" onClick={() => navigate(`/learn/${course.id}`)}>
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Tiếp tục học
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button className="w-full h-12 text-lg" onClick={handleAddToCart}>
                    Thêm vào giỏ hàng
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-lg" onClick={handleEnrollNow}>
                    Mua ngay
                  </Button>
                </div>
              )}
              
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold mb-4">Khoá học này bao gồm:</h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3"><MonitorPlay className="w-4 h-4" /> Thời lượng cập nhật</div>
                  <div className="flex items-center gap-3"><FileText className="w-4 h-4" /> Bài viết học thuật</div>
                  <div className="flex items-center gap-3"><Award className="w-4 h-4" /> Cấp chứng chỉ hoàn thành</div>
                  <div className="flex items-center gap-3"><Shield className="w-4 h-4" /> Quyền truy cập trọn đời</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-20 border-t border-border pt-16">
          <h2 className="text-2xl font-bold mb-8">Khoá học liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCourses.map(c => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
