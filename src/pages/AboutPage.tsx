import React from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle2, Users, Target, Zap, Globe, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <PageTransition>
      {/* Hero Section */}
      <div className="bg-primary/5 py-20 md:py-32 border-b overflow-hidden relative">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-black font-suisseintl tracking-tight mb-6 leading-tight">
              Sứ mệnh của chúng tôi là <span className="text-primary">dân chủ hóa giáo dục</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              MindHub được tạo ra với mục tiêu mang đến cho mọi người cơ hội tiếp cận nền tảng giáo dục chất lượng cao, dễ tiếp cận và phù hợp với nhu cầu thực tế của thị trường lao động.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="rounded-full px-8">Khám phá khóa học</Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 bg-background">Tham gia cộng đồng</Button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
              alt="About MindHub" 
              className="rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border-8 border-background"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x">
          <div>
            <h3 className="text-4xl md:text-5xl font-black text-primary mb-2">50K+</h3>
            <p className="text-muted-foreground font-medium">Học viên</p>
          </div>
          <div>
            <h3 className="text-4xl md:text-5xl font-black text-primary mb-2">200+</h3>
            <p className="text-muted-foreground font-medium">Khóa học</p>
          </div>
          <div>
            <h3 className="text-4xl md:text-5xl font-black text-primary mb-2">150+</h3>
            <p className="text-muted-foreground font-medium">Giảng viên</p>
          </div>
          <div>
            <h3 className="text-4xl md:text-5xl font-black text-primary mb-2">4.8</h3>
            <p className="text-muted-foreground font-medium">Đánh giá trung bình</p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black font-suisseintl tracking-tight mb-4">Giá trị cốt lõi</h2>
          <p className="text-muted-foreground">Những nguyên tắc định hình cách chúng tôi xây dựng nền tảng và phục vụ cộng đồng học viên.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Target, title: 'Thực tiễn', desc: 'Kiến thức có thể áp dụng ngay vào công việc và dự án thực tế.' },
            { icon: Users, title: 'Cộng đồng', desc: 'Học tập cùng nhau, hỗ trợ nhau và cùng nhau phát triển.' },
            { icon: Zap, title: 'Đổi mới', desc: 'Luôn cập nhật những công nghệ và xu hướng mới nhất.' },
            { icon: Globe, title: 'Dễ tiếp cận', desc: 'Giao diện thân thiện, chi phí hợp lý, học mọi lúc mọi nơi.' },
            { icon: CheckCircle2, title: 'Chất lượng', desc: 'Nội dung được kiểm duyệt kỹ lưỡng bởi các chuyên gia.' },
            { icon: Shield, title: 'Đáng tin cậy', desc: 'Bảo mật thông tin và tôn trọng quyền riêng tư của người dùng.' },
          ].map((val, idx) => (
            <div key={idx} className="bg-card border rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <val.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{val.title}</h3>
              <p className="text-muted-foreground">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-muted/30 border-t border-b">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black font-suisseintl tracking-tight mb-4">Đội ngũ sáng lập</h2>
            <p className="text-muted-foreground">Những người tâm huyết với giáo dục công nghệ.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="text-center group">
                <div className="w-40 h-40 mx-auto rounded-full overflow-hidden mb-4 border-4 border-background shadow-lg group-hover:scale-105 transition-transform">
                  <img src={`https://i.pravatar.cc/300?img=${idx + 10}`} alt={`Team ${idx}`} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-lg">Nguyễn Văn {String.fromCharCode(64 + idx)}</h3>
                <p className="text-muted-foreground text-sm">Co-founder & {['CEO', 'CTO', 'COO', 'CMO'][idx-1]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
