import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

export function HomeFaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Tôi có được học lại khóa đã mua không?',
      a: 'Có. Bạn được truy cập trọn đời khóa đã mua và học lại bất cứ lúc nào trên mọi thiết bị.',
    },
    {
      q: 'Nếu thanh toán thất bại thì sao?',
      a: 'Vui lòng kiểm tra lại phương thức thanh toán hoặc thử lại sau vài phút. Nếu vẫn gặp sự cố, đội ngũ CSKH của MindHub luôn sẵn sàng hỗ trợ bạn 24/7.',
    },
    {
      q: 'Khóa Laravel có phù hợp cho người mới không?',
      a: 'Có. Khóa học được thiết kế có lộ trình từ cơ bản đến nâng cao, giải thích từng dòng code chi tiết nên rất phù hợp cho học viên mới bắt đầu.',
    },
  ];

  return (
    <section className="py-12 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Câu hỏi thường gặp
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Giải đáp nhanh các thắc mắc trước khi tham gia học
            </p>
          </div>
          <Link
            to="/faq"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group"
          >
            Xem tất cả FAQ
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Faq List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 text-left flex flex-col justify-between shadow-sm hover:border-emerald-200 transition-all cursor-pointer"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{faq.q}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </div>
                  <p
                    className={`text-xs text-slate-600 leading-relaxed mt-2 transition-all duration-300 ${
                      isOpen ? 'block opacity-100' : 'hidden opacity-0'
                    }`}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
