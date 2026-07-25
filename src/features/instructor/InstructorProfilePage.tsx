import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { INITIAL_COURSES } from '@/shared/data';
import { CourseCard } from '@/features/courses/components/CourseCard';
import { Star, Users, PlayCircle, Award, MessageCircle, MapPin, Globe } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ReviewList } from '@/features/reviews/ReviewList';

export default function InstructorProfilePage() {
  const { instructorId } = useParams();
  const [activeTab, setActiveTab] = useState<'courses' | 'reviews'>('courses');

  // Mock instructor data
  const instructor = {
    id: instructorId || '1',
    name: 'Nguyễn Văn A',
    title: 'Senior Fullstack Engineer & Tech Lead',
    avatar: 'https://i.pravatar.cc/150?img=11',
    bio: 'Với hơn 10 năm kinh nghiệm trong ngành phát triển phần mềm, tôi đã tham gia xây dựng nhiều hệ thống quy mô lớn tại các tập đoàn công nghệ hàng đầu. Đam mê của tôi là chia sẻ kiến thức và giúp đỡ các kỹ sư trẻ phát triển sự nghiệp.',
    students: 15420,
    coursesCount: 12,
    rating: 4.8,
    reviews: 3240,
    location: 'Hà Nội, Việt Nam',
    website: 'https://example.com'
  };

  const instructorCourses = INITIAL_COURSES.slice(0, 4); // Mock filtering

  return (
    <PageTransition>
      {/* Hero Section */}
      <div className="bg-primary/5 py-12 md:py-20 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-xl shrink-0">
              <img src={instructor.avatar} alt={instructor.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black font-suisseintl mb-2">{instructor.name}</h1>
              <p className="text-lg text-primary font-medium mb-4">{instructor.title}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="font-bold">{instructor.students.toLocaleString()}</span> học viên
                </div>
                <div className="flex items-center gap-1.5">
                  <PlayCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold">{instructor.coursesCount}</span> khóa học
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="font-bold">{instructor.rating}</span> ({instructor.reviews.toLocaleString()} đánh giá)
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Button className="rounded-xl px-8">Theo dõi</Button>
                <div className="flex gap-4 text-sm font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-muted-foreground" /> {instructor.location}</span>
                  <span className="flex items-center gap-1"><Globe className="w-4 h-4 text-muted-foreground" /> Website</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 grid md:grid-cols-[1fr_300px] gap-12">
        <div className="space-y-12">
          {/* Bio */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Về giảng viên</h2>
            <div className="prose prose-slate max-w-none text-muted-foreground">
              <p className="leading-relaxed whitespace-pre-wrap">{instructor.bio}</p>
              <p>Từng công tác tại: VNG, VinAI, FPT Software.</p>
              <p>Chuyên môn: React, Node.js, System Design, Microservices.</p>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex gap-8 border-b mb-8">
              <button 
                className={`pb-4 font-bold text-lg transition-colors relative ${activeTab === 'courses' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('courses')}
              >
                Khóa học ({instructor.coursesCount})
                {activeTab === 'courses' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
              </button>
              <button 
                className={`pb-4 font-bold text-lg transition-colors relative ${activeTab === 'reviews' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('reviews')}
              >
                Đánh giá ({instructor.reviews})
                {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
              </button>
            </div>

            {activeTab === 'courses' ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {instructorCourses.map(course => (
                  <CourseCard key={course.id} course={course as any} />
                ))}
              </div>
            ) : (
              <ReviewList targetId={instructor.id} type="instructor" />
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-card border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Thành tựu
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Giảng viên tiêu biểu năm 2023</span>
              </li>
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Top 1% React Developer</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-card border rounded-3xl p-6 shadow-sm text-center">
            <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-bold mb-2">Liên hệ công việc</h3>
            <p className="text-sm text-muted-foreground mb-4">Bạn muốn mời giảng viên tham gia dự án hoặc đào tạo doanh nghiệp?</p>
            <Button variant="outline" className="w-full rounded-xl">Gửi tin nhắn</Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

// Temporary inline CheckCircle2 component
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);
