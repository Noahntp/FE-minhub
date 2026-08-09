import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { homeApi } from '@/features/home/api';
import { CountUpNumber } from '@/shared/components/ui/CountUpNumber';
import { resolveMediaUrl } from '@/shared/utils/format';
import {
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Laptop,
  Headphones,
  Users,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Handshake,
  Globe,
  Megaphone,
  Tag,
  Star,
  Info,
  Calendar,
  BarChart,
  Wallet,
  Sparkles,
} from 'lucide-react';

export default function ServicesPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    homeApi.getHomepageData()
      .then((res: any) => {
        if (isMounted) {
          if (res?.stats) setStats(res.stats);
          if (Array.isArray(res?.testimonials) && res.testimonials.length > 0) {
            setTestimonials(res.testimonials);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch data for ServicesPage:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const defaultTestimonials = [
    {
      id: 1,
      comment: 'MindHub là nền tảng tuyệt vời để tôi chia sẻ kiến thức và tiếp cận hàng nghìn học viên. Chính sách chia sẻ doanh thu rất hợp lý và minh bạch.',
      user_name: 'Nguyễn Văn A',
      user_role: 'Giảng viên Lập trình Python',
      user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      rating: 5,
    },
    {
      id: 2,
      comment: 'Tôi rất ấn tượng với công cụ hỗ trợ giảng dạy và đội ngũ hỗ trợ nhiệt tình của MindHub. Doanh thu của tôi đã tăng trưởng đáng kể.',
      user_name: 'Trần Thị B',
      user_role: 'Giảng viên Marketing',
      user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      rating: 5,
    },
    {
      id: 3,
      comment: 'Nền tảng ổn định, học viên chất lượng và chính sách rút tiền nhanh chóng. Tôi hoàn toàn tin tưởng và gắn bó lâu dài với MindHub.',
      user_name: 'Lê Văn C',
      user_role: 'Giảng viên thiết kế UI/UX',
      user_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
      rating: 5,
    },
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-20">

      {/* 1. Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-emerald-600 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold">Dịch vụ</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Header Section (DỊCH VỤ CỦA MINDHUB) */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-14 lg:py-20 border-b border-slate-800 select-none">
        {/* Dynamic Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-full mb-4 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>DỊCH VỤ CỦA MINDHUB</span>
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                  Nền tảng học tập trực tuyến <br className="hidden sm:inline" />
                  chất lượng <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">hàng đầu Việt Nam</span>
                </h1>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-xl">
                MindHub không chỉ mang đến những khóa học chất lượng cho học viên, mà còn cung cấp môi trường phát triển toàn diện cho giảng viên và đối tác.
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-inner">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Chất lượng hàng đầu</div>
                    <div className="text-[11px] text-slate-400 font-normal">Nội dung được chọn lọc kỹ lưỡng bởi chuyên gia</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-inner">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Công nghệ hiện đại</div>
                    <div className="text-[11px] text-slate-400 font-normal">Trợ lý AI & Học tập mượt mà trên mọi thiết bị</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-inner">
                  <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Hỗ trợ tận tâm</div>
                    <div className="text-[11px] text-slate-400 font-normal">Đồng hành 24/7 cùng học viên và giảng viên</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-inner">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Cộng đồng lớn mạnh</div>
                    <div className="text-[11px] text-slate-400 font-normal">Kết nối hàng nghìn học viên đam mê học hỏi</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Showcase Image (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
                  alt="MindHub Workspace Laptop Platform"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                {/* Floating Badges */}
                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    {stats?.total_students
                      ? `${Number(stats.total_students).toLocaleString('vi-VN')}+ Học viên Active`
                      : '10.000+ Học viên Active'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Metrics Stat Bar (5 Items) */}
      <section className="bg-slate-900/90 py-8 border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center divide-x divide-slate-800">
            <div className="px-2 space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                <CountUpNumber target={stats?.total_students || 10000} suffix="+" />
              </div>
              <div className="text-xs font-bold text-white">Học viên</div>
              <div className="text-[11px] text-slate-400 font-medium">Đang theo học và tin tưởng</div>
            </div>

            <div className="px-2 space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">
                <CountUpNumber target={stats?.total_courses || 1200} suffix="+" />
              </div>
              <div className="text-xs font-bold text-white">Khóa học</div>
              <div className="text-[11px] text-slate-400 font-medium">Đa dạng chủ đề, cập nhật liên tục</div>
            </div>

            <div className="px-2 space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-teal-300">
                <CountUpNumber target={stats?.total_instructors || 300} suffix="+" />
              </div>
              <div className="text-xs font-bold text-white">Giảng viên</div>
              <div className="text-[11px] text-slate-400 font-medium">Chuyên gia hàng đầu trong lĩnh vực</div>
            </div>

            <div className="px-2 space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                <CountUpNumber target={stats?.completion_rate || stats?.satisfaction_rate || 98} suffix="%" />
              </div>
              <div className="text-xs font-bold text-white">Học viên hài lòng</div>
              <div className="text-[11px] text-slate-400 font-medium">Với chất lượng khóa học</div>
            </div>

            <div className="px-2 space-y-1 col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-3xl font-black text-rose-400">
                {stats?.total_countries ? `${stats.total_countries}+` : '50+'}
              </div>
              <div className="text-xs font-bold text-white">Quốc gia</div>
              <div className="text-[11px] text-slate-400 font-medium">Học viên đến từ khắp nơi</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dịch vụ của chúng tôi (Our Services - 4 Cards Grid) */}
      <section className="py-14 bg-slate-50/50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              Dịch vụ của chúng tôi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              MindHub cung cấp các dịch vụ toàn diện, hướng đến trải nghiệm học tập và giảng dạy tốt nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: Học tập chất lượng cao */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Học tập chất lượng cao</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Kho khóa học đa dạng, được thiết kế bởi chuyên gia, cập nhật liên tục theo xu hướng mới nhất.
                </p>
              </div>
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 pt-2 transition-colors"
              >
                <span>Khám phá khóa học</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Trở thành giảng viên */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Trở thành giảng viên</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Cung cấp nền tảng để giảng viên chia sẻ kiến thức, tiếp cận hàng triệu học viên và gia tăng thu nhập.
                </p>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 pt-2 transition-colors"
              >
                <span>Tìm hiểu ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Giải pháp doanh nghiệp */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Giải pháp doanh nghiệp</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Đào tạo nội bộ chuyên sâu, nâng cao kỹ năng và hiệu suất cho đội ngũ nhân sự.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 pt-2 transition-colors"
              >
                <span>Xem giải pháp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Đối tác & liên kết */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Handshake className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Đối tác & liên kết</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Hợp tác cùng MindHub để mở rộng mạng lưới, cùng phát triển và tạo ra giá trị bền vững.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 pt-2 transition-colors"
              >
                <span>Trở thành đối tác</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 5. CHÍNH SÁCH CHIA LỢI NHUẬN MINH BẠCH, CÔNG BẰNG */}
      <section className="py-14 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left Content (4 cols) */}
            <div className="lg:col-span-4 text-left space-y-5">
              <div>
                <span className="inline-block text-[11px] font-extrabold tracking-wider uppercase bg-emerald-100/80 text-emerald-700 px-3 py-1 rounded-full mb-2">
                  CHÍNH SÁCH MINH BẠCH
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  Chính sách chia lợi nhuận <br className="hidden sm:inline" />
                  <span className="text-emerald-600">minh bạch, công bằng</span>
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                MindHub áp dụng chính sách chia lợi nhuận rõ ràng theo nguồn phát sinh đơn hàng. Giảng viên luôn được đảm bảo quyền lợi xứng đáng với giá trị kiến thức mang lại.
              </p>

              <div className="space-y-2 text-xs text-slate-700 font-bold pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Minh bạch, rõ ràng</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tỷ lệ cạnh tranh trên thị trường</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Thanh toán đúng hạn hàng tháng</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/register')}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <span>Trở thành giảng viên ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Profit Sharing Table (8 cols) */}
            <div className="lg:col-span-8 bg-slate-50/70 rounded-3xl border border-slate-200/80 p-4 sm:p-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[11px] font-extrabold text-slate-500 border-b border-slate-200">
                      <th className="pb-3 px-3">Nguồn đơn hàng</th>
                      <th className="pb-3 px-3 text-center">Giảng viên nhận</th>
                      <th className="pb-3 px-3 text-center">MindHub nhận</th>
                      <th className="pb-3 px-3">Mô tả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">

                    {/* Row 1: Organic */}
                    <tr className="bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-slate-900">
                            Đơn hàng tự nhiên (Organic)
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-2xl font-black text-emerald-600">85%</span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-xl font-bold text-slate-400">15%</span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 font-medium text-[11px] leading-relaxed max-w-xs">
                        Học viên tìm thấy và mua khóa học tự nhiên trên nền tảng (qua tìm kiếm, danh mục, đề xuất).
                      </td>
                    </tr>

                    {/* Row 2: Instructor Coupon */}
                    <tr className="bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                            <Tag className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-slate-900">
                            Mã giảm giá từ Giảng viên (Instructor Coupon)
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-2xl font-black text-amber-500">85%</span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-xl font-bold text-slate-400">15%</span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 font-medium text-[11px] leading-relaxed max-w-xs">
                        Đơn hàng sử dụng mã giảm giá hoặc đường link chia sẻ do chính Giảng viên tạo ra.
                      </td>
                    </tr>

                    {/* Row 3: Platform Coupon */}
                    <tr className="bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                            <Megaphone className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-slate-900">
                            Mã giảm giá từ Nền tảng (Platform Coupon)
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-2xl font-black text-purple-600">70%</span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-xl font-bold text-slate-400">30%</span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 font-medium text-[11px] leading-relaxed max-w-xs">
                        Đơn hàng áp dụng mã giảm giá hoặc chiến dịch khuyến mãi toàn hệ thống của MindHub.
                      </td>
                    </tr>

                    {/* Row 4: Affiliate */}
                    <tr className="bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                            <Handshake className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-slate-900">
                            Tiếp thị liên kết (Affiliate)
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-2xl font-black text-blue-600">60%</span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-xl font-bold text-slate-400">40%</span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 font-medium text-[11px] leading-relaxed max-w-xs">
                        Đơn hàng phát sinh từ mạng lưới các đối tác tiếp thị liên kết (Affiliate Partners).
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

              <div className="pt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>Tỷ lệ trên chưa bao gồm thuế giá trị gia tăng (VAT) và các loại thuế, phí khác theo quy định của pháp luật.</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 6. Guarantees Bar (4 Items) */}
      <section className="bg-white py-6 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <div className="font-extrabold text-slate-900">Thanh toán đúng hạn</div>
                <div className="text-[11px] text-slate-500 font-medium">Hàng tháng vào ngày cố định</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <BarChart className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <div className="font-extrabold text-slate-900">Báo cáo minh bạch</div>
                <div className="text-[11px] text-slate-500 font-medium">Theo dõi doanh thu chi tiết</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <Wallet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <div className="font-extrabold text-slate-900">Rút tiền linh hoạt</div>
                <div className="text-[11px] text-slate-500 font-medium">Nhiều phương thức tiện lợi</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <Headphones className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <div className="font-extrabold text-slate-900">Hỗ trợ tận tâm</div>
                <div className="text-[11px] text-slate-500 font-medium">Đội ngũ hỗ trợ 24/7</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Giảng viên & Học viên nói gì về MindHub (Testimonials) */}
      <section className="py-14 bg-slate-50/50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              Đánh giá & Cảm nhận về MindHub
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Hàng nghìn giảng viên và học viên đã và đang đồng hành phát triển cùng chúng tôi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {displayTestimonials.map((item: any, index: number) => {
              const text = (item.comment || item.content || '').trim();
              const formattedComment = text ? (text.startsWith('"') ? text : `"${text}"`) : '"Nội dung khóa học rất sát thực tế, hệ thống ổn định và hỗ trợ nhiệt tình."';
              
              const rawAvatar = item.user_avatar || item.avatar || item.user?.avatar_url;
              const resolvedAvatar = rawAvatar ? resolveMediaUrl(rawAvatar) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
              
              const nameText = item.user_name || item.user?.full_name || item.name || 'Người dùng MindHub';
              const roleText = item.user_role === 'Học viên' ? 'Thành viên MindHub' : (item.user_role || 'Giảng viên chuyên môn');
              const ratingVal = Number(item.rating) || 5.0;

              return (
                <div
                  key={item.id || index}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                    {formattedComment}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolvedAvatar}
                        alt={nameText}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
                        }}
                      />
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs">{nameText}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{roleText}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(ratingVal) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      ))}
                      <span className="text-slate-700 ml-1">{ratingVal.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section className="py-10 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-left relative overflow-hidden">

            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Sẵn sàng chia sẻ kiến thức của bạn?
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                Tham gia MindHub ngay hôm nay để truyền cảm hứng, giúp học viên phát triển kỹ năng và gia tăng thu nhập bền vững.
              </p>
            </div>

            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-md active:scale-95 transition-all shrink-0 inline-flex items-center gap-2"
            >
              <span>Đăng ký trở thành giảng viên</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      </section>

    </div>
  );
}
