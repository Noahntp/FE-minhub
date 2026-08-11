import React, { useState } from 'react';
import { Gift, Copy, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface PromoVoucherSectionProps {
  vouchers?: any[];
}

export function PromoVoucherSection({ vouchers: apiVouchers }: PromoVoucherSectionProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const defaultVouchers = [
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

  const formatVoucherTitle = (v: any) => {
    if (v.title) return v.title;
    if (v.discount_type === 'percent') {
      return `Giảm ${v.discount_value}%`;
    }
    if (v.discount_type === 'fixed') {
      return `Giảm ${new Intl.NumberFormat('vi-VN').format(v.discount_value)}đ`;
    }
    return v.name || 'Ưu đãi đặc biệt';
  };

  const vouchers = Array.isArray(apiVouchers) && apiVouchers.length > 0
    ? apiVouchers.map((v) => ({
        code: v.code,
        title: formatVoucherTitle(v),
        desc: v.description || v.name || 'Hạn dùng có hạn',
      }))
    : defaultVouchers;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ${code}!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="py-8 bg-emerald-50/40 border-y border-emerald-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100/90 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* LEFT HEADER & ACTION BLOCK */}
          <div className="lg:col-span-4 text-left space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 bg-emerald-100/80 text-emerald-700 rounded-2xl shrink-0 shadow-sm">
                <Gift className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Mã ưu đãi HSSV
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mt-1">
                  Ưu đãi dành riêng cho bạn!
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Nhập mã giảm giá khi thanh toán để tiết kiệm thêm từ 10% đến 50% học phí.
            </p>

            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <span>Xem tất cả ưu đãi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* RIGHT VOUCHER CARDS GRID */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {vouchers.map((v) => (
              <div
                key={v.code}
                className="p-3.5 bg-slate-50/90 border border-slate-200/90 hover:border-emerald-300 rounded-2xl flex items-center justify-between gap-2.5 transition-all duration-200 hover:shadow-md group relative overflow-hidden text-left"
              >
                {/* Left Accent Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="min-w-0 flex-1">
                  <span className="font-mono font-black text-slate-900 text-sm tracking-wider uppercase block truncate">
                    {v.code}
                  </span>
                  <div className="text-xs font-bold text-emerald-600 truncate mt-0.5">
                    {v.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5" title={v.desc}>
                    {v.desc}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(v.code)}
                  className="p-2 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
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
          </div>

        </div>
      </div>
    </section>
  );
}
