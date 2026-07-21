import React, { useEffect, useState } from 'react';
import { Award, Users, BookOpen, Target, Sparkles, Globe, ChevronRight, Play } from 'lucide-react';

export default function AboutPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    { label: 'Học viên trực tuyến', value: '50,000+', icon: <Users className="w-7 h-7" /> },
    { label: 'Khóa học chất lượng', value: '150+', icon: <BookOpen className="w-7 h-7" /> },
    { label: 'Giảng viên chuyên gia', value: '45+', icon: <Award className="w-7 h-7" /> },
    { label: 'Tỷ lệ hài lòng', value: '98%', icon: <Sparkles className="w-7 h-7" /> },
  ];

  const features = [
    'Cung cấp kiến thức chuẩn quốc tế với chi phí tối ưu.',
    'Cập nhật liên tục các xu hướng công nghệ mới nhất.',
    'Môi trường học tập chủ động, linh hoạt mọi lúc mọi nơi.',
    'Cộng đồng hỗ trợ học tập và phát triển nghề nghiệp mạnh mẽ.'
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-indigo-900/90 via-deep-indigo to-stone-50 z-0"></div>
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 space-y-24">
        
        {/* Hero Section */}
        <div className={`text-center space-y-8 max-w-4xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-4 shadow-xl">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Nền tảng học tập số 1 Việt Nam
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Kiến tạo tương lai cùng <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-white drop-shadow-sm">
              MindHub
            </span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 leading-relaxed max-w-3xl mx-auto font-light">
            Chúng tôi là nền tảng học tập trực tuyến hàng đầu, mang đến các khóa học chuyên sâu về công nghệ, thiết kế và kỹ năng số. 
            Mục tiêu của chúng tôi là trang bị cho bạn những kiến thức thực tiễn nhất để tự tin bước vào kỷ nguyên số.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button className="px-8 py-4 bg-white text-deep-indigo rounded-xl font-bold text-lg hover:bg-indigo-50 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-2">
              Khám phá khóa học <ChevronRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm">
              <Play className="w-5 h-5 fill-white/80" /> Xem Video Giới Thiệu
            </button>
          </div>
        </div>

        {/* Stats Section with Glassmorphism */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {stats.map((stat, idx) => (
            <div key={idx} className="group bg-white p-8 rounded-3xl text-center hover:-translate-y-2 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-stone-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-deep-indigo text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30 transform group-hover:rotate-6 transition-transform">
                {stat.icon}
              </div>
              <div className="text-4xl font-extrabold text-stone-900 mb-2 tracking-tight">{stat.value}</div>
              <div className="text-sm md:text-base text-stone-500 font-semibold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className={`space-y-8 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm tracking-wide uppercase">
              <Target className="w-4 h-4" /> Sứ mệnh của chúng tôi
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight">
              Xóa bỏ khoảng cách kỹ năng công nghệ tại <span className="text-deep-indigo">Việt Nam</span>
            </h2>
            <p className="text-stone-600 text-lg md:text-xl leading-relaxed">
              MindHub ra đời với niềm tin mãnh liệt rằng: Bất kỳ ai cũng có thể làm chủ công nghệ nếu được tiếp cận đúng phương pháp và một người hướng dẫn tận tâm. Chúng tôi không chỉ dạy kỹ năng, chúng tôi định hình tư duy giải quyết vấn đề.
            </p>
            <ul className="space-y-5">
              {features.map((item, i) => (
                <li key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-stone-100">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                    <CheckIcon />
                  </div>
                  <span className="text-stone-700 font-medium text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`relative transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {/* Decorative background elements for image */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-200 to-fuchsia-100 rounded-[2.5rem] transform rotate-3 opacity-70"></div>
            <div className="absolute -inset-4 bg-gradient-to-tl from-blue-200 to-indigo-100 rounded-[2.5rem] transform -rotate-3 opacity-70"></div>
            
            <div className="aspect-[4/5] md:aspect-square rounded-[2rem] overflow-hidden bg-slate-200 border-4 border-white shadow-2xl relative z-10 group">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
                alt="MindHub Team working"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-indigo/90 via-deep-indigo/20 to-transparent opacity-80"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white">
                  <Globe className="w-8 h-8 mb-4 text-amber-300" />
                  <h3 className="text-xl font-bold mb-2">Tầm nhìn vươn xa</h3>
                  <p className="text-indigo-100 text-sm">Hướng tới trở thành hệ sinh thái học tập số hàng đầu Đông Nam Á vào năm 2030.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
