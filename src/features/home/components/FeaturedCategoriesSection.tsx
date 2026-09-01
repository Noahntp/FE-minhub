import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, Globe, Server, Monitor, Cpu, Cloud, 
  Smartphone, ShieldCheck, Database, Palette, 
  Gamepad2, ChevronLeft, ChevronRight, ArrowRight, Sparkles,
  LucideIcon
} from 'lucide-react';

interface FeaturedCategoriesSectionProps {
  categories?: any[];
}

interface CategoryDisplayItem {
  id: string;
  title: string;
  subtitle: string;
  coursesCount: string;
  icon: LucideIcon;
  bgColor: string;
  slug: string;
}

export function FeaturedCategoriesSection({ categories: apiCategories }: FeaturedCategoriesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const categoryPresets: { icon: LucideIcon; bgColor: string }[] = [
    {
      icon: Code,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100/80 group-hover:border-emerald-200',
    },
    {
      icon: Globe,
      bgColor: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100/80 group-hover:border-blue-200',
    },
    {
      icon: Server,
      bgColor: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100/80 group-hover:border-amber-200',
    },
    {
      icon: Monitor,
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-100/80 group-hover:border-indigo-200',
    },
    {
      icon: Cpu,
      bgColor: 'bg-teal-50 text-teal-600 border-teal-100 group-hover:bg-teal-100/80 group-hover:border-teal-200',
    },
    {
      icon: Cloud,
      bgColor: 'bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-sky-100/80 group-hover:border-sky-200',
    },
    {
      icon: Smartphone,
      bgColor: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-100/80 group-hover:border-purple-200',
    },
    {
      icon: ShieldCheck,
      bgColor: 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100/80 group-hover:border-rose-200',
    },
    {
      icon: Database,
      bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-100/80 group-hover:border-cyan-200',
    },
    {
      icon: Palette,
      bgColor: 'bg-pink-50 text-pink-600 border-pink-100 group-hover:bg-pink-100/80 group-hover:border-pink-200',
    },
    {
      icon: Gamepad2,
      bgColor: 'bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-100/80 group-hover:border-orange-200',
    },
  ];

  const defaultCategories: CategoryDisplayItem[] = [
    {
      id: 'programming',
      title: 'Lập trình',
      subtitle: 'Nền tảng & tư duy',
      coursesCount: '142 khóa',
      icon: Code,
      bgColor: categoryPresets[0].bgColor,
      slug: 'lap-trinh',
    },
    {
      id: 'web-dev',
      title: 'Web Development',
      subtitle: 'Xây dựng website',
      coursesCount: '215 khóa',
      icon: Globe,
      bgColor: categoryPresets[1].bgColor,
      slug: 'web-development',
    },
    {
      id: 'backend',
      title: 'Backend',
      subtitle: 'Xử lý server, API',
      coursesCount: '98 khóa',
      icon: Server,
      bgColor: categoryPresets[2].bgColor,
      slug: 'backend',
    },
    {
      id: 'frontend',
      title: 'Frontend',
      subtitle: 'Giao diện người dùng',
      coursesCount: '130 khóa',
      icon: Monitor,
      bgColor: categoryPresets[3].bgColor,
      slug: 'frontend',
    },
    {
      id: 'ai-data',
      title: 'AI & Dữ liệu',
      subtitle: 'AI, ML, Data Science',
      coursesCount: '86 khóa',
      icon: Cpu,
      bgColor: categoryPresets[4].bgColor,
      slug: 'ai-data',
    },
    {
      id: 'devops',
      title: 'DevOps & Cloud',
      subtitle: 'Triển khai & vận hành',
      coursesCount: '64 khóa',
      icon: Cloud,
      bgColor: categoryPresets[5].bgColor,
      slug: 'devops',
    },
    {
      id: 'mobile-app',
      title: 'Lập trình Mobile',
      subtitle: 'iOS, Android, React Native',
      coursesCount: '75 khóa',
      icon: Smartphone,
      bgColor: categoryPresets[6].bgColor,
      slug: 'mobile-app',
    },
    {
      id: 'cyber-security',
      title: 'An toàn thông tin',
      subtitle: 'Bảo mật & Hacking',
      coursesCount: '42 khóa',
      icon: ShieldCheck,
      bgColor: categoryPresets[7].bgColor,
      slug: 'cyber-security',
    },
    {
      id: 'database',
      title: 'Cơ sở dữ liệu',
      subtitle: 'SQL, NoSQL, Optimization',
      coursesCount: '58 khóa',
      icon: Database,
      bgColor: categoryPresets[8].bgColor,
      slug: 'database',
    },
    {
      id: 'ui-ux',
      title: 'Thiết kế UI/UX',
      subtitle: 'Figma, Product Design',
      coursesCount: '91 khóa',
      icon: Palette,
      bgColor: categoryPresets[9].bgColor,
      slug: 'ui-ux-design',
    },
    {
      id: 'game-dev',
      title: 'Lập trình Game',
      subtitle: 'Unity, Unreal Engine',
      coursesCount: '39 khóa',
      icon: Gamepad2,
      bgColor: categoryPresets[10].bgColor,
      slug: 'game-development',
    },
  ];

  const cleanSubtitle = (desc?: string) => {
    if (!desc) return 'Chủ đề phong phú';
    const cleaned = desc.replace(/^danh\s*mục\s*demo(\s*mindhub)?[:\s]*/i, '').trim();
    return cleaned || 'Chủ đề phong phú';
  };

  const categories: CategoryDisplayItem[] = Array.isArray(apiCategories) && apiCategories.length > 0
    ? apiCategories.map((cat, idx) => {
        const preset = categoryPresets[idx % categoryPresets.length];
        return {
          id: String(cat.id || cat.slug || idx),
          title: cat.name || 'Danh mục',
          subtitle: cleanSubtitle(cat.description),
          coursesCount: `${cat.courses_count ?? 0} khóa`,
          icon: preset.icon,
          bgColor: preset.bgColor,
          slug: cat.slug || '',
        };
      })
    : defaultCategories;

  const checkScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollState();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScrollState);
      window.addEventListener('resize', checkScrollState);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScrollState);
      }
      window.removeEventListener('resize', checkScrollState);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-12 bg-slate-50/60 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chủ đề phong phú</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Danh mục khóa học
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Khám phá các chủ đề học tập chuyên môn trong ngành CNTT ({categories.length}+ chủ đề)
            </p>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group px-3 py-2 rounded-xl hover:bg-emerald-50"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Carousel Slider Container with Side Arrow Buttons */}
        <div className="relative group/slider">
          
          {/* Left Arrow Button */}
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous categories"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-20 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 text-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-slate-300 disabled:hover:border-slate-200 disabled:shadow-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Next categories"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-20 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 text-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-slate-300 disabled:hover:border-slate-200 disabled:shadow-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Slider */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory py-3 -mx-1 px-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="group flex-none w-[185px] sm:w-[210px] lg:w-[225px] snap-start bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-3 rounded-2xl border ${cat.bgColor} transition-all duration-300 shadow-sm flex items-center justify-center shrink-0`}>
                        <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                        {cat.coursesCount}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-emerald-600 transition-colors line-clamp-1 truncate" title={cat.title}>
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-1 truncate" title={cat.subtitle}>
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                    <span className="truncate">Khám phá ngay</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
