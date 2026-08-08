import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ArrowRight, ChevronUp } from 'lucide-react';

interface HomeFaqSectionProps {
  faqs?: any[];
}

export function HomeFaqSection({ faqs: apiFaqs }: HomeFaqSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);

  const defaultFaqs = [
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
    {
      q: 'Học xong có được cấp chứng chỉ không?',
      a: 'Có. Hoàn thành 100% video và bài tập trắc nghiệm, hệ thống MindHub sẽ tự động cấp chứng chỉ điện tử chứng nhận bạn đã hoàn tất khóa học.',
    },
  ];

  const allFaqs = Array.isArray(apiFaqs) && apiFaqs.length > 0
    ? apiFaqs.map((f) => ({
        q: f.question || f.q,
        a: f.answer || f.a,
      }))
    : defaultFaqs;

  // Hiển thị 3 hoặc 4 item ban đầu (mặc định 3)
  const initialCount = 3;
  const displayedFaqs = showAll ? allFaqs : allFaqs.slice(0, initialCount);

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
              Giải đáp nhanh các thắc mắc trước khi tham gia học ({allFaqs.length} câu hỏi)
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
          {displayedFaqs.map((faq, idx) => {
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

        {/* Nút Xem Thêm / Thu Gọn FAQ */}
        {allFaqs.length > initialCount && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-600 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              {showAll ? (
                <>
                  <span>Thu gọn câu hỏi</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Xem thêm câu hỏi ({allFaqs.length - initialCount})</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
