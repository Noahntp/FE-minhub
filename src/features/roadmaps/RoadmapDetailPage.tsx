import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Map, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { CourseCard } from '@/features/courses/components/CourseCard';

// Dummy data for demo
const ROADMAP_DETAILS = {
  frontend: {
    title: "Frontend Developer",
    description: "Lộ trình từ cơ bản đến nâng cao để trở thành Frontend Engineer",
    steps: [
      {
        id: 1,
        title: "Internet & Web Basics",
        description: "Hiểu về cách hoạt động của Internet, HTTP, DNS.",
        status: "completed",
        courses: []
      },
      {
        id: 2,
        title: "HTML, CSS & JavaScript",
        description: "Nền tảng cốt lõi của mọi ứng dụng Web.",
        status: "in-progress",
        courses: [
          {
            id: "1",
            title: "JavaScript Advanced",
            instructor: "Nguyễn Văn A",
            price: 499000,
            originalPrice: 899000,
            rating: 4.8,
            reviews: 1200,
            thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80",
            tags: ["Frontend", "JavaScript"],
            level: "Intermediate"
          }
        ]
      },
      {
        id: 3,
        title: "React & Ecosystem",
        description: "Học Framework phổ biến nhất thế giới.",
        status: "locked",
        courses: []
      }
    ]
  }
};

export default function RoadmapDetailPage() {
  const { roadmapId } = useParams();
  const roadmap = ROADMAP_DETAILS[roadmapId as keyof typeof ROADMAP_DETAILS] || ROADMAP_DETAILS.frontend;

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Link to="/roadmaps" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Link>
        
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 mb-12 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
            <Map className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-suisseintl tracking-tight mb-4">{roadmap.title}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">{roadmap.description}</p>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {roadmap.steps.map((step, index) => (
            <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : step.status === 'in-progress' ? (
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-card border border-border p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chặng {index + 1}</span>
                  {step.status === 'in-progress' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">Đang học</span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
                
                {step.courses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-4">Khóa học đề xuất:</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {step.courses.map(course => (
                        <CourseCard key={course.id} course={course as any} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
