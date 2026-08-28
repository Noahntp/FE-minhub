import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  
  return (
    <>
      <footer className="bg-gradient-to-b from-[#081d16] via-[#061913] to-[#04120d] text-slate-200 py-14 px-4 md:px-8 border-t border-emerald-900/40 mt-16 shrink-0 select-none shadow-2xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-left text-xs">
          {/* Column 1: Thương hiệu / giới thiệu ngắn */}
          <div className="space-y-4">
            <div className="flex items-center text-white mb-2">
              <img src="/mindhub-logo-white.png" alt="MindHub Logo" className="h-9 w-auto object-contain" />
            </div>

            <p className="text-emerald-100/80 leading-relaxed text-xs font-medium">
              Hệ thống đào tạo trực tuyến thông minh kiến tạo tri thức từ việc
              rèn luyện thực tế kết hợp trợ lý AI Mentor đồng hành.
            </p>
            <p className="text-[11px] font-bold text-emerald-400 italic">
              "Thắp sáng ngọn lửa tri thức Việt"
            </p>
          </div>

          {/* Column 2: Khám phá */}
          <div className="space-y-3">
            <span className="font-extrabold text-emerald-400 footer-section-title uppercase text-[11px] tracking-wider block border-b border-emerald-800/40 pb-2">
              Khám Phá
            </span>
            <div className="space-y-2 text-emerald-100/80 font-medium">
              <button
                onClick={() => navigate('/courses')}
                className="block hover:text-emerald-400 text-left transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                Khóa học hiện có
              </button>
              <button
                onClick={() => navigate('/search')}
                className="block hover:text-emerald-400 text-left transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                Tìm kiếm & Danh mục
              </button>
              <button
                onClick={() => navigate('/roadmaps')}
                className="block hover:text-emerald-400 text-left transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                Lộ trình học tập
              </button>
              <button
                onClick={() => navigate('/services')}
                className="block hover:text-emerald-400 text-left transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                Dịch vụ & Giới thiệu
              </button>
            </div>
          </div>

          {/* Column 3: Hỗ trợ (Từ FAQ & Popup '?') */}
          <div className="space-y-3">
            <span className="font-extrabold text-emerald-400 footer-section-title uppercase text-[11px] tracking-wider block border-b border-emerald-800/40 pb-2">
              Hỗ Trợ & Chính Sách
            </span>
            <div className="space-y-2 text-emerald-100/80 font-medium">
              <button
                onClick={() => navigate('/faq')}
                className="block hover:text-emerald-400 text-left transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                Câu hỏi thường gặp (FAQ)
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="block hover:text-emerald-400 text-left transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                Bảng giá & Gói học
              </button>
              <button
                onClick={() => navigate('/legal')}
                className="block hover:text-emerald-400 text-left transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                Điều khoản sử dụng
              </button>
              <button
                onClick={() => navigate('/legal')}
                className="block hover:text-emerald-400 text-left transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                Chính sách bảo mật
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="block hover:text-emerald-400 text-left transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                Liên hệ hỗ trợ
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="block hover:text-emerald-400 text-left transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                Báo lỗi & Gửi phản hồi
              </button>
            </div>
          </div>

          {/* Column 4: Liên hệ / thông tin hệ thống */}
          <div className="space-y-3">
            <span className="font-extrabold text-emerald-400 footer-section-title uppercase text-[11px] tracking-wider block border-b border-emerald-800/40 pb-2">
              Liên Hệ Hệ Thống
            </span>
            <div className="space-y-2 text-emerald-100/80 font-medium leading-relaxed">
              <p className="flex items-center gap-2">
                <span className="text-white font-bold">Email:</span>{" "}
                help@mindhub.edu.vn
              </p>
              <p className="flex items-center gap-2">
                <span className="text-white font-bold">Hotline:</span> 1900
                6868 (24/7)
              </p>
              <p className="flex items-start gap-2">
                <span className="text-white font-bold shrink-0">
                  Địa chỉ:
                </span>{" "}
                Tòa nhà Tri Thức MindHub, Khu Công Nghệ Cao, Quận 9, TP. Hồ
                Chí Minh
              </p>
              <div className="pt-2.5 border-t border-emerald-800/40 flex items-center gap-3 text-white">
                <span className="font-bold text-[10px] uppercase text-emerald-400">
                  Mạng xã hội:
                </span>
                <a
                  href="#"
                  className="hover:text-emerald-400 text-emerald-100/80 transition-colors"
                >
                  Facebook
                </a>
                <span className="text-emerald-700">•</span>
                <a
                  href="#"
                  className="hover:text-emerald-400 text-emerald-100/80 transition-colors"
                >
                  YouTube
                </a>
                <span className="text-emerald-700">•</span>
                <a
                  href="#"
                  className="hover:text-emerald-400 text-emerald-100/80 transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-emerald-800/40 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-emerald-200/60 gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-emerald-100/90">
              Công ty Cổ phần Công nghệ Giáo Dục Quốc Tế MindHub Việt Nam.
            </p>
            <p>MindHub e-learning platform © 2026. Bảo lưu mọi bản quyền.</p>
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 p-1.5 px-3 rounded-lg block text-center font-bold tracking-wider border border-emerald-800/50">
              XÁC THỰC BOUTIQUE SSL
            </span>
            <button
              onClick={() =>
                alert(
                  "Xác thực chứng chỉ MindHub bằng mã hóa block chuỗi an toàn",
                )
              }
              className="hover:underline text-emerald-300 hover:text-emerald-200 bg-transparent border-none cursor-pointer p-0 font-medium"
            >
              Xác thực chứng chỉ
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
