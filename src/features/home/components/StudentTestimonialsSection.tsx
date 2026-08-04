import React from 'react';
import { Star, Quote } from 'lucide-react';

export function StudentTestimonialsSection() {
  const testimonials = [
    {
      name: 'Hải Nam',
      role: 'Backend Developer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      comment:
        '"Khóa Laravel REST API rất thực tế, giúp mình làm đồ án tốt nghiệp tự tin hơn nhiều. Giảng viên giải thích dễ hiểu, có project thực sát thực tế."',
    },
    {
      name: 'Thu Hà',
      role: 'Sinh viên CNTT',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      comment:
        '"PHP & MySQL giúp mình nắm vững kiến thức về transaction và tối ưu query. Nội dung chất lượng, học xong áp dụng được ngay vào project."',
    },
    {
      name: 'Minh Quân',
      role: 'Frontend Developer',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
      comment:
        '"React Frontend cho trang E-learning cực kỳ hữu ích. Project-based learning giúp mình hiểu sâu và làm được sản phẩm hoàn chỉnh."',
    },
  ];

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Học viên nói gì về MindHub?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Hàng ngàn học viên đã và đang kiến tạo sự nghiệp cùng MindHub
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="relative bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <Quote className="w-8 h-8 text-emerald-200 absolute top-4 right-4" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed text-left">
                  {item.comment}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 mt-6 border-t border-slate-200/60">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-200"
                />
                <div className="text-left">
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
