import React from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Map, ArrowRight, Code, Server, Database, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const ROADMAPS = [
  {
    id: "frontend",
    title: "Frontend Developer",
    description: "Trở thành kỹ sư Frontend chuyên nghiệp với React, Vue và các công nghệ web hiện đại.",
    icon: <Code className="w-8 h-8 text-blue-500" />,
    coursesCount: 12,
    duration: "6 tháng",
    color: "bg-blue-50 border-blue-100"
  },
  {
    id: "backend",
    title: "Backend Developer",
    description: "Xây dựng hệ thống backend mạnh mẽ với Node.js, Java, Microservices và System Design.",
    icon: <Server className="w-8 h-8 text-emerald-500" />,
    coursesCount: 15,
    duration: "8 tháng",
    color: "bg-emerald-50 border-emerald-100"
  },
  {
    id: "data",
    title: "Data Engineering",
    description: "Xử lý dữ liệu lớn, xây dựng Data Pipeline với Python, SQL và Spark.",
    icon: <Database className="w-8 h-8 text-purple-500" />,
    coursesCount: 10,
    duration: "5 tháng",
    color: "bg-purple-50 border-purple-100"
  },
  {
    id: "mobile",
    title: "Mobile Developer",
    description: "Phát triển ứng dụng di động đa nền tảng với React Native và Flutter.",
    icon: <Smartphone className="w-8 h-8 text-orange-500" />,
    coursesCount: 8,
    duration: "4 tháng",
    color: "bg-orange-50 border-orange-100"
  }
];

export default function RoadmapsPage() {
  return (
    <PageTransition>
      {/* Hero Section */}
      <div className="bg-primary/5 border-b py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-2xl mb-6">
            <Map className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-suisseintl tracking-tight mb-6">
            Lộ trình học tập chuyên nghiệp
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá các lộ trình được thiết kế chuẩn mực bởi các chuyên gia hàng đầu. Bắt đầu từ con số 0 và tiến từng bước vững chắc để trở thành kỹ sư phần mềm thực thụ.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ROADMAPS.map((roadmap) => (
            <Link 
              to={`/roadmaps/${roadmap.id}`} 
              key={roadmap.id}
              className={`flex flex-col md:flex-row gap-8 p-8 rounded-3xl border ${roadmap.color} hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
                {roadmap.icon}
              </div>
              
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm relative z-10">
                {roadmap.icon}
              </div>
              
              <div className="flex-1 relative z-10">
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{roadmap.title}</h3>
                <p className="text-muted-foreground mb-6 line-clamp-2 leading-relaxed">{roadmap.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                  <span className="px-4 py-1.5 bg-white rounded-full text-slate-700 shadow-sm">{roadmap.coursesCount} khóa học</span>
                  <span className="px-4 py-1.5 bg-white rounded-full text-slate-700 shadow-sm">{roadmap.duration}</span>
                </div>
                
                <div className="mt-6 flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform">
                  Bắt đầu lộ trình <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
