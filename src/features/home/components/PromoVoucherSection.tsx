import React, { useState } from 'react';
import { Gift, Copy, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function PromoVoucherSection() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const vouchers = [
    {
      code: 'WELCOME100',
      title: 'Giảm 100.000đ',
      desc: 'Cho học viên mới',
    },
    {
      code: 'GLOBAL10',
      title: 'Giảm 10%',
      desc: 'Áp dụng cho mọi khóa học',
    },
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ${code}!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="py-8 bg-emerald-50/50 border-y border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Header left */}
          <div className="flex items-center gap-4 text-left">
            <div className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Ưu đãi dành riêng cho bạn!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Nhập mã giảm giá khi thanh toán để tiết kiệm hơn
              </p>
            </div>
          </div>

          {/* Vouchers & Action right */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {vouchers.map((v) => (
              <div
                key={v.code}
                className="flex-1 min-w-[200px] p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 group hover:border-emerald-300 transition-colors"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm tracking-wide">
                      {v.code}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600">
                    {v.title}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {v.desc}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(v.code)}
                  className="p-2 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 rounded-xl transition-colors shadow-sm"
                  title="Sao chép mã"
                >
                  {copiedCode === v.code ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}

            <Link
              to="/courses"
              className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-600/20 active:scale-95 transition-all w-full sm:w-auto shrink-0"
            >
              <span>Xem tất cả ưu đãi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
