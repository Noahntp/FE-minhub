import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code2, Database, Figma } from "lucide-react";

export function LearningPathsSection() {
  const paths = [
    {
      id: "frontend",
      title: "Trở thành Frontend Developer",
      coursesCount: 5,
      duration: "40 giờ",
      icon: <Code2 className="w-8 h-8 text-blue-500" />,
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      id: "backend",
      title: "Backend Engineer (NodeJS)",
      coursesCount: 4,
      duration: "45 giờ",
      icon: <Database className="w-8 h-8 text-green-500" />,
      bg: "bg-green-500/10",
      border: "border-green-500/20"
    },
    {
      id: "uiux",
      title: "Lộ trình UI/UX Designer",
      coursesCount: 3,
      duration: "25 giờ",
      icon: <Figma className="w-8 h-8 text-purple-500" />,
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    }
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Lộ trình học tập</h2>
            <p className="text-muted-foreground">Các chuỗi khóa học được thiết kế chuẩn xác để giúp bạn làm chủ một nghề nghiệp.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paths.map((path) => (
            <Link 
              key={path.id} 
              to={`/paths/${path.id}`}
              className={`p-6 rounded-2xl border ${path.border} bg-card hover:shadow-md transition-all group flex flex-col h-full`}
            >
              <div className={`w-16 h-16 rounded-xl ${path.bg} flex items-center justify-center mb-6`}>
                {path.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {path.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1">
                Bao gồm {path.coursesCount} khóa học • Tổng thời lượng {path.duration}
              </p>
              
              <div className="flex items-center text-sm font-bold text-primary">
                Bắt đầu lộ trình
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
