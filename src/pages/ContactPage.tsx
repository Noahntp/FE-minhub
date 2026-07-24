import React, { useState } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <PageTransition>
      {/* Hero Section */}
      <div className="bg-primary/5 py-16 md:py-24 border-b">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black font-suisseintl tracking-tight mb-6">
            Liên hệ với MindHub
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Đừng ngần ngại để lại lời nhắn hoặc liên hệ trực tiếp qua các kênh dưới đây.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 md:py-24 px-4">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-8">Thông tin liên hệ</h2>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Địa chỉ văn phòng</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Tầng 12, Tòa nhà Techcombank<br />
                      191 Bà Triệu, Quận Hai Bà Trưng<br />
                      Hà Nội, Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Hotline</h3>
                    <p className="text-muted-foreground">1900 1234 (Ext: 1)</p>
                    <p className="text-sm text-muted-foreground mt-1">Hỗ trợ từ 8:00 - 18:00 (Thứ 2 - Thứ 6)</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email hỗ trợ</h3>
                    <p className="text-muted-foreground">support@mindhub.edu.vn</p>
                    <p className="text-muted-foreground">partnership@mindhub.edu.vn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Mock */}
            <div className="h-64 bg-muted rounded-3xl overflow-hidden relative border flex items-center justify-center">
               <div className="text-center p-4">
                 <MapPin className="w-8 h-8 text-primary mx-auto mb-2 opacity-50" />
                 <p className="text-muted-foreground font-medium">Bản đồ (Google Maps Integration)</p>
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
            <h2 className="text-3xl font-bold mb-2">Gửi lời nhắn</h2>
            <p className="text-muted-foreground mb-8">Chúng tôi sẽ phản hồi bạn trong vòng 24 giờ làm việc.</p>
            
            {isSuccess ? (
              <div className="absolute inset-0 bg-card z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <Send className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Gửi thành công!</h3>
                <p className="text-muted-foreground mb-8">
                  Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm nhất có thể.
                </p>
                <Button onClick={() => setIsSuccess(false)} variant="outline">Gửi tin nhắn khác</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Họ và tên</label>
                    <Input placeholder="Nguyễn Văn A" required className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Số điện thoại</label>
                    <Input placeholder="0901234567" className="h-12 rounded-xl" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold">Email <span className="text-red-500">*</span></label>
                  <Input type="email" placeholder="email@example.com" required className="h-12 rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold">Chủ đề</label>
                  <select className="w-full h-12 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option>Hỗ trợ kỹ thuật</option>
                    <option>Tư vấn khóa học</option>
                    <option>Thanh toán & Hóa đơn</option>
                    <option>Hợp tác nội dung</option>
                    <option>Khác</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold">Nội dung <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={5} 
                    required 
                    placeholder="Nhập nội dung lời nhắn của bạn..."
                    className="w-full p-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  ></textarea>
                </div>
                
                <Button type="submit" size="lg" className="w-full rounded-xl h-12" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang gửi...' : 'Gửi lời nhắn'}
                </Button>
              </form>
            )}
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
