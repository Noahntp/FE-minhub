import React from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Check, Star, Shield, Zap } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export default function PricingPage() {
  return (
    <PageTransition>
      <div className="bg-primary/5 pb-20 pt-16 md:pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-black font-suisseintl tracking-tight mb-6">
              Đầu tư cho tương lai của bạn
            </h1>
            <p className="text-lg text-muted-foreground">
              Chọn gói học tập phù hợp với mục tiêu của bạn. MindHub cung cấp các lựa chọn linh hoạt từ học viên cá nhân đến doanh nghiệp.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-card border rounded-3xl p-8 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold mb-2">Cơ bản</h3>
              <p className="text-muted-foreground mb-6 text-sm">Trải nghiệm nền tảng với các khóa học miễn phí</p>
              <div className="mb-8">
                <span className="text-4xl font-black">Miễn phí</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Truy cập 20+ khóa học miễn phí</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Tham gia cộng đồng học viên</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Theo dõi tiến độ học tập</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full rounded-xl h-12">Bắt đầu ngay</Button>
            </div>

            {/* Pro Tier */}
            <div className="bg-primary text-primary-foreground border-primary rounded-3xl p-8 shadow-xl flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-amber-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3" /> Phổ biến nhất
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-primary-foreground/80 mb-6 text-sm">Mở khóa toàn bộ tiềm năng học tập</p>
              <div className="mb-8">
                <span className="text-4xl font-black">299.000đ</span>
                <span className="text-primary-foreground/70">/tháng</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-300 shrink-0" />
                  <span className="text-sm">Truy cập TẤT CẢ khóa học trên hệ thống</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-300 shrink-0" />
                  <span className="text-sm">Cấp chứng chỉ sau mỗi khóa học</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-300 shrink-0" />
                  <span className="text-sm">Được hỗ trợ ưu tiên 1-1 từ giảng viên</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-amber-300 shrink-0" />
                  <span className="text-sm">Tải video xem offline</span>
                </li>
              </ul>
              <Button variant="secondary" className="w-full rounded-xl h-12 font-bold bg-white text-primary hover:bg-white/90">
                Nâng cấp Pro
              </Button>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-card border rounded-3xl p-8 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Shield className="w-5 h-5 text-blue-500" /> Doanh nghiệp</h3>
              <p className="text-muted-foreground mb-6 text-sm">Giải pháp đào tạo nhân sự toàn diện</p>
              <div className="mb-8">
                <span className="text-4xl font-black">Liên hệ</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Tất cả tính năng của gói Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Dashboard báo cáo tiến độ học viên</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Cổng thanh toán và xuất hóa đơn riêng</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Hỗ trợ thiết kế lộ trình theo nhu cầu</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full rounded-xl h-12" onClick={() => window.location.href = '/contact'}>
                Tư vấn ngay
              </Button>
            </div>
          </div>
          
          <div className="mt-20 max-w-3xl mx-auto text-center border-t pt-12">
            <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full mb-4">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Mua lẻ từng khóa học?</h2>
            <p className="text-muted-foreground mb-6">
              Bạn hoàn toàn có thể thanh toán một lần và sở hữu trọn đời từng khóa học riêng lẻ mà không cần mua gói đăng ký tháng. 
              Các khóa học riêng lẻ có giá chỉ từ 499.000đ.
            </p>
            <Button variant="link" onClick={() => window.location.href = '/courses'} className="text-primary font-bold">
              Khám phá danh sách khóa học
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
