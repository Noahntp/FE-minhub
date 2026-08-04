import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Globe, Server, Monitor, Cpu, Cloud, ArrowRight } from 'lucide-react';

export function FeaturedCategoriesSection() {
  const categories = [
    {
      id: 'programming',
      title: 'Lập trình',
      subtitle: 'Nền tảng lập trình',
      icon: <Code className="w-6 h-6 text-emerald-600" />,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      slug: 'lap-trinh',
    },
    {
      id: 'web-dev',
      title: 'Web Development',
      subtitle: 'Xây dựng website',
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50 text-blue-600 border-blue-100',
      slug: 'web-development',
    },
    {
      id: 'backend',
      title: 'Backend',
      subtitle: 'Xử lý server, API',
      icon: <Server className="w-6 h-6 text-amber-600" />,
      bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
      slug: 'backend',
    },
    {
      id: 'frontend',
      title: 'Frontend',
      subtitle: 'Giao diện người dùng',
      icon: <Monitor className="w-6 h-6 text-indigo-600" />,
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      slug: 'frontend',
    },
    {
      id: 'ai-data',
      title: 'AI và Dữ liệu',
      subtitle: 'AI, ML, Data Science',
      icon: <Cpu className="w-6 h-6 text-teal-600" />,
      bgColor: 'bg-teal-50 text-teal-600 border-teal-100',
      slug: 'ai-data',
    },
    {
      id: 'devops',
      title: 'DevOps',
      subtitle: 'Triển khai & vận hành',
      icon: <Cloud className="w-6 h-6 text-sky-600" />,
      bgColor: 'bg-sky-50 text-sky-600 border-sky-100',
      slug: 'devops',
    },
  ];

  return (
    <section className="py-12 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Danh mục nổi bật
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Khám phá các chủ đề học tập hot nhất được săn đón trong ngành CNTT
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group"
          >
            Xem tất cả danh mục
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid 6 Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className={`p-3.5 rounded-2xl border ${cat.bgColor} mb-3 group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors line-clamp-1">
                {cat.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                {cat.subtitle}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
