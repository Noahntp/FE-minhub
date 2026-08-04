import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

export default function ServicesPage() {
  const navigate = useNavigate();

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
      <section className="bg-white py-12 lg:py-16 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div>
                <span className="inline-block text-[11px] font-extrabold tracking-wider uppercase bg-emerald-100/80 text-emerald-700 px-3.5 py-1 rounded-full mb-3">
                  DỊCH VỤ CỦA MINDHUB
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  Nền tảng học tập trực tuyến <br className="hidden sm:inline" />
                  chất lượng <span className="text-emerald-600">hàng đầu Việt Nam</span>
                </h1>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                MindHub không chỉ mang đến những khóa học chất lượng cho học viên, mà còn cung cấp môi trường phát triển toàn diện cho giảng viên và đối tác.
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Chất lượng hàng đầu</div>
                    <div className="text-[11px] text-slate-500 font-medium">Nội dung được chọn lọc kỹ lưỡng</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Công nghệ hiện đại</div>
                    <div className="text-[11px] text-slate-500 font-medium">Học tập mượt mà trên mọi thiết bị</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Hỗ trợ tận tâm</div>
                    <div className="text-[11px] text-slate-500 font-medium">Đồng hành 24/7 cùng học viên và giảng viên</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Cộng đồng lớn mạnh</div>
                    <div className="text-[11px] text-slate-500 font-medium">Kết nối hàng triệu học viên đam mê học hỏi</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Image (5 cols) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
                  alt="MindHub Workspace Laptop Platform"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Metrics Stat Bar (5 Items) */}
      <section className="bg-white py-8 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center divide-x divide-slate-100">
            <div className="px-2 space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">10.000+</div>
              <div className="text-xs font-bold text-slate-800">Học viên</div>
              <div className="text-[11px] text-slate-400 font-medium">Đang theo học và tin tưởng</div>
            </div>

            <div className="px-2 space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">1.200+</div>
              <div className="text-xs font-bold text-slate-800">Khóa học</div>
              <div className="text-[11px] text-slate-400 font-medium">Đa dạng chủ đề, cập nhật liên tục</div>
            </div>

            <div className="px-2 space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">300+</div>
              <div className="text-xs font-bold text-slate-800">Giảng viên</div>
              <div className="text-[11px] text-slate-400 font-medium">Chuyên gia hàng đầu trong lĩnh vực</div>
            </div>

            <div className="px-2 space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">98%</div>
              <div className="text-xs font-bold text-slate-800">Học viên hài lòng</div>
              <div className="text-[11px] text-slate-400 font-medium">Với chất lượng khóa học</div>
            </div>

            <div className="px-2 space-y-1 col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">50+</div>
              <div className="text-xs font-bold text-slate-800">Quốc gia</div>
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
                    
                    {/* Row 1: Đơn hàng tự nhiên */}
                    <tr className="bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-slate-900">
                            Đơn hàng tự nhiên trên nền tảng
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-2xl font-black text-emerald-600">70%</span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-xl font-bold text-slate-400">30%</span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 font-medium text-[11px] leading-relaxed max-w-xs">
                        Học viên tìm thấy khóa học một cách tự nhiên trên MindHub (tìm kiếm, danh mục, đề xuất, v.v.).
                      </td>
                    </tr>

                    {/* Row 2: Đơn hàng từ quảng cáo */}
                    <tr className="bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                            <Megaphone className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-slate-900">
                            Đơn hàng từ quảng cáo hoặc chiến dịch của MindHub
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-2xl font-black text-purple-600">37%</span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-xl font-bold text-slate-400">63%</span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 font-medium text-[11px] leading-relaxed max-w-xs">
                        Đơn hàng phát sinh từ quảng cáo, email marketing hoặc các chiến dịch khuyến mãi do MindHub triển khai.
                      </td>
                    </tr>

                    {/* Row 3: Đơn hàng từ mã giảm giá */}
                    <tr className="bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                            <Tag className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-slate-900">
                            Đơn hàng từ mã giảm giá hoặc link giới thiệu của giảng viên
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-2xl font-black text-amber-500">97%</span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-xl font-bold text-slate-400">3%</span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 font-medium text-[11px] leading-relaxed max-w-xs">
                        Đơn hàng sử dụng mã giảm giá hoặc link giới thiệu do giảng viên tạo ra và chia sẻ.
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

      {/* 7. Giảng viên nói gì về MindHub (Testimonials) */}
      <section className="py-14 bg-slate-50/50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              Giảng viên nói gì về MindHub
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Hàng nghìn giảng viên đã và đang đồng hành cùng chúng tôi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
              <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                "MindHub là nền tảng tuyệt vời để tôi chia sẻ kiến thức và tiếp cận hàng nghìn học viên. Chính sách chia sẻ doanh thu rất hợp lý và minh bạch."
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"
                    alt="Nguyễn Văn A"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">Nguyễn Văn A</div>
                    <div className="text-[11px] text-slate-400 font-medium">Giảng viên lập trình Python</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                  <span className="text-slate-700 ml-1">5.0</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
              <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                "Tôi rất ấn tượng với công cụ hỗ trợ giảng dạy và đội ngũ hỗ trợ nhiệt tình của MindHub. Doanh thu của tôi đã tăng trưởng đáng kể."
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"
                    alt="Trần Thị B"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">Trần Thị B</div>
                    <div className="text-[11px] text-slate-400 font-medium">Giảng viên Marketing</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                  <span className="text-slate-700 ml-1">5.0</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
              <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                "Nền tảng ổn định, học viên chất lượng và chính sách rút tiền nhanh chóng. Tôi hoàn toàn tin tưởng và gắn bó lâu dài với MindHub."
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80"
                    alt="Lê Văn C"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">Lê Văn C</div>
                    <div className="text-[11px] text-slate-400 font-medium">Giảng viên thiết kế UI/UX</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                  <span className="text-slate-700 ml-1">5.0</span>
                </div>
              </div>
            </div>

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
