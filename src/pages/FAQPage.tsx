import React, { useState } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Search, ChevronDown, HelpCircle, MessageCircle, FileText } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

const FAQS = [
  {
    category: 'Tài khoản & Đăng nhập',
    items: [
      { q: 'Làm thế nào để lấy lại mật khẩu?', a: 'Bạn có thể chọn "Quên mật khẩu" ở màn hình đăng nhập. Một mã OTP sẽ được gửi về email của bạn để xác thực và tạo mật khẩu mới.' },
      { q: 'Tôi có thể đổi email đăng ký không?', a: 'Hiện tại bạn không thể tự đổi email đăng ký. Vui lòng liên hệ bộ phận CSKH để được hỗ trợ.' }
    ]
  },
  {
    category: 'Khóa học & Thanh toán',
    items: [
      { q: 'Khóa học có thời hạn sử dụng bao lâu?', a: 'Tất cả khóa học trên MindHub đều có quyền truy cập trọn đời sau khi bạn thanh toán thành công.' },
      { q: 'MindHub hỗ trợ những hình thức thanh toán nào?', a: 'Chúng tôi hỗ trợ thanh toán qua VNPay, Momo, chuyển khoản ngân hàng, và thẻ tín dụng (Visa/Mastercard).' },
      { q: 'Tôi có được hoàn tiền nếu không hài lòng?', a: 'MindHub áp dụng chính sách hoàn tiền trong vòng 7 ngày đầu tiên nếu bạn học chưa quá 20% thời lượng khóa học.' }
    ]
  },
  {
    category: 'Chứng chỉ & Hỗ trợ',
    items: [
      { q: 'Làm sao để nhận được chứng chỉ?', a: 'Chứng chỉ sẽ tự động được cấp sau khi bạn hoàn thành 100% video bài giảng và đạt điểm yêu cầu trong các bài kiểm tra (nếu có).' },
      { q: 'Chứng chỉ của MindHub có giá trị không?', a: 'Chứng chỉ của MindHub chứng nhận bạn đã hoàn thành chương trình đào tạo chuyên môn và có thể thêm vào CV, LinkedIn để chứng minh năng lực.' }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = FAQS.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <PageTransition>
      {/* Hero Section */}
      <div className="bg-primary/5 py-16 md:py-24 border-b">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black font-suisseintl tracking-tight mb-6">
            Chúng tôi có thể giúp gì cho bạn?
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Tìm kiếm câu trả lời cho các câu hỏi thường gặp hoặc liên hệ trực tiếp với đội ngũ hỗ trợ của chúng tôi.
          </p>
          
          <div className="relative max-w-xl mx-auto shadow-xl rounded-full">
            <Search className="absolute left-5 top-4 h-5 w-5 text-muted-foreground" />
            <Input 
              className="pl-14 h-14 rounded-full text-lg bg-background border-transparent focus-visible:ring-primary/20"
              placeholder="Nhập câu hỏi của bạn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-16 px-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Không tìm thấy câu trả lời</h2>
            <p className="text-muted-foreground mb-6">Chúng tôi không tìm thấy kết quả nào cho "{searchQuery}"</p>
            <Button onClick={() => window.location.href = '/contact'}>Gửi câu hỏi cho chúng tôi</Button>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredFaqs.map((category, catIdx) => (
              <div key={catIdx}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  {category.category}
                </h2>
                
                <div className="space-y-4">
                  {category.items.map((item, itemIdx) => {
                    const id = `${catIdx}-${itemIdx}`;
                    const isOpen = openItems[id];
                    return (
                      <div key={itemIdx} className="bg-card border rounded-2xl overflow-hidden transition-all duration-300">
                        <button 
                          className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                          onClick={() => toggleItem(id)}
                        >
                          <span className="font-bold text-lg pr-4">{item.q}</span>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <div 
                          className={`px-6 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-16 bg-muted/50 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center">
          <MessageCircle className="w-12 h-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-4">Bạn vẫn còn thắc mắc?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg">
            Nếu bạn không tìm thấy câu trả lời, đừng ngần ngại liên hệ trực tiếp với đội ngũ CSKH của chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
          </p>
          <Button size="lg" className="rounded-full px-8" onClick={() => window.location.href = '/contact'}>
            Liên hệ hỗ trợ
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
