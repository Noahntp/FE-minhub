import React from 'react';
import { Target, Clock, Award, LineChart } from 'lucide-react';

export function WhyChooseUsSection() {
  const features = [
    {
      icon: <Target className="w-6 h-6 text-emerald-600" />,
      bgColor: 'bg-emerald-50 border-emerald-100',
      title: 'Nội dung thực chiến',
      desc: 'Bài giảng bám sát thực tế, nhiều ví dụ và dự án để áp dụng ngay.',
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50 border-blue-100',
      title: 'Học mọi lúc mọi nơi',
      desc: 'Truy cập trọn đời, học trên mọi thiết bị, linh hoạt thời gian.',
    },
    {
      icon: <Award className="w-6 h-6 text-amber-600" />,
      bgColor: 'bg-amber-50 border-amber-100',
      title: 'Giảng viên kinh nghiệm',
      desc: 'Đội ngũ giảng viên là chuyên gia đang làm việc trong ngành.',
    },
    {
      icon: <LineChart className="w-6 h-6 text-purple-600" />,
      bgColor: 'bg-purple-50 border-purple-100',
      title: 'Theo dõi tiến độ học tập',
      desc: 'Hệ thống ghi nhận tiến độ và gợi ý lộ trình phù hợp cho bạn.',
    },
  ];

  return (
    <section className="py-14 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tại sao chọn MindHub?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Trải nghiệm học tập hiện đại, tối ưu hóa cho sự phát triển của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4 text-left"
            >
              <div className={`p-3 rounded-2xl border ${item.bgColor} shrink-0`}>
                {item.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
