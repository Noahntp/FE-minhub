import React, { useRef, useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2, MessageSquareHeart, Sparkles } from 'lucide-react';

interface StudentTestimonialsSectionProps {
  testimonials?: any[];
}

export function StudentTestimonialsSection({ testimonials: apiTestimonials }: StudentTestimonialsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const defaultTestimonials = [
    {
      name: 'Trịnh Khánh An',
      role: 'Frontend Developer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      comment: 'Nội dung rõ ràng, ví dụ sát với dự án thực tế và cực kỳ dễ theo dõi. Học xong làm được ngay sản phẩm bổ sung vào CV.',
      courseName: 'React Frontend Masterclass',
      rating: 5,
    },
    {
      name: 'Ngô Anh Tuấn',
      role: 'Backend Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      comment: 'Một vài bài đi khá nhanh nhưng tổng thể nội dung vẫn đầy đủ và thực tế. Giảng viên hỗ trợ giải đáp trong kênh Q&A rất nhiệt tình.',
      courseName: 'Laravel REST API & Microservices',
      rating: 5,
    },
    {
      name: 'Tạ Phương Nhi',
      role: 'Sinh viên CNTT',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      comment: 'Mình thích cách khóa học liên kết kiến thức với tình huống khi đi làm. Giúp mình tự tin hơn hẳn khi đi phỏng vấn thực tập.',
      courseName: 'Fullstack Node.js & React',
      rating: 5,
    },
    {
      name: 'Trịnh Thu Hà',
      role: 'UI/UX Designer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
      comment: 'Phần checklist cuối chương và bài tập thực hành rất hữu ích khi áp dụng trực tiếp vào đồ án tốt nghiệp của mình.',
      courseName: 'Figma UI/UX Pro',
      rating: 5,
    },
    {
      name: 'Ngô Quang Minh',
      role: 'DevOps Engineer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
      comment: 'Giảng viên giải thích mạch lạc, phần lab thực hành Docker & Kubernetes giúp mình hiểu bài và triển khai hệ thống cực nhanh.',
      courseName: 'Docker & Kubernetes Thực Chiến',
      rating: 5,
    },
    {
      name: 'Võ Thanh Trúc',
      role: 'Data Analyst',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
      comment: 'Khóa Python Data Analysis giảng chi tiết từ xử lý Pandas đến trực quan hóa dữ liệu. Đội ngũ trợ giảng hỗ trợ rất chuyên nghiệp.',
      courseName: 'Python Data Analysis & AI',
      rating: 5,
    },
  ];

  // Process & Deduplicate testimonials if API returns repeated seed comments
  const processedTestimonials = (() => {
    if (!Array.isArray(apiTestimonials) || apiTestimonials.length === 0) {
      return defaultTestimonials;
    }

    const seenComments = new Set<string>();
    const uniqueList: any[] = [];

    apiTestimonials.forEach((t) => {
      const commentText = (t.comment || '').trim().replace(/^"/, '').replace(/"$/, '');
      if (commentText && !seenComments.has(commentText)) {
        seenComments.add(commentText);
        uniqueList.push({
          name: t.user_name || 'Học viên MindHub',
          role: t.user_role || 'Học viên',
          avatar: t.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
          comment: commentText,
          courseName: t.course_name || 'Khóa học chất lượng',
          rating: t.rating || 5,
        });
      }
    });

    return uniqueList.length > 0 ? uniqueList : defaultTestimonials;
  })();

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
  }, [processedTestimonials]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40 border-t border-slate-100 relative overflow-hidden">
      
      {/* Decorative background glow shapes */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-sky-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/80 text-xs font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cảm nhận thực tế</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Học viên nói gì về MindHub?
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Hàng ngàn học viên đã và đang phát triển sự nghiệp cùng lộ trình đào tạo tại MindHub
          </p>
        </div>

        {/* Testimonials Carousel Wrapper with Side Arrow Controls Centered on Cards */}
        <div className="relative group/slider">
          
          {/* Left Arrow Button */}
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous review"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 text-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-slate-300 disabled:hover:border-slate-200 disabled:shadow-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Next review"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 text-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-slate-300 disabled:hover:border-slate-200 disabled:shadow-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Testimonials Carousel Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 -mx-1 px-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
          {processedTestimonials.map((item, idx) => (
            <div
              key={idx}
              className="group flex-none w-[300px] sm:w-[360px] md:w-[390px] snap-start bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Quote Watermark Icon */}
              <Quote className="w-16 h-16 text-emerald-500/10 absolute -top-2 -right-2 transform rotate-12 group-hover:scale-110 transition-transform duration-300 pointer-events-none" />

              <div>
                {/* Rating & Verified Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-black text-amber-700 ml-1">5.0</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Học viên đã học</span>
                  </span>
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic text-left min-h-[4rem]">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              {/* User Info & Course Footer */}
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors shadow-sm"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-emerald-600 rounded-full text-white">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="text-left truncate">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {item.role}
                    </p>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                  <MessageSquareHeart className="w-4 h-4" />
                </div>
              </div>

            </div>
          ))}
        </div>

        </div>

      </div>
    </section>
  );
}
