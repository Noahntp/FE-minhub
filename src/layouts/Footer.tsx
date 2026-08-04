import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  
  return (
    <>
              <footer className="bg-[#111A4A] text-[#fbf9f6] py-14 px-4 md:px-8 border-t border-white/10 mt-16 shrink-0 select-none">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-left text-xs">
            {/* Column 1: Thương hiệu / giới thiệu ngắn */}
            <div className="space-y-4">
              <div className="flex items-center text-white mb-2">
                <div className="bg-white/95 px-3 py-1.5 rounded-lg shadow-sm">
                  <img src="/header-logo.png" alt="MindHub Logo" className="h-6 w-auto" />
                </div>
              </div>
              <p className="text-white/80 leading-relaxed text-xs font-normal">
                Hệ thống đào tạo trực tuyến thông minh kiến tạo tri thức từ việc
                rèn luyện thực tế kết hợp trợ lý AI Mentor đồng hành.
              </p>
              <p className="text-[11px] font-bold text-white italic">
                "Thắp sáng ngọn lửa tri thức Việt"
              </p>
            </div>

            {/* Column 2: Khám phá */}
            <div className="space-y-3">
              <span className="font-bold text-white footer-section-title uppercase text-[11px] tracking-wider block border-b border-white/20 pb-1.5">
                Khám Phá
              </span>
              <div className="space-y-2 text-white/80 font-medium">
                <button
                  onClick={() => navigate('/courses')}
                  className="block hover:text-white text-left transition-colors cursor-pointer border-none bg-transparent p-0"
                >
                  Khóa học hiện có
                </button>
                <button
                  onClick={() => navigate('/search')}
                  className="block hover:text-white text-left transition-colors cursor-pointer border-none bg-transparent p-0"
                >
                  Tìm kiếm & Danh mục
                </button>
                <button
                  onClick={() => navigate('/roadmaps')}
                  className="block hover:text-white text-left transition-colors cursor-pointer border-none bg-transparent p-0"
                >
                  Lộ trình học tập
                </button>
                <button
                  onClick={() => navigate('/services')}
                  className="block hover:text-white text-left transition-colors cursor-pointer border-none bg-transparent p-0"
                >
                  Dịch vụ & Giới thiệu
                </button>
              </div>
            </div>

            {/* Column 3: Hỗ trợ (Từ FAQ & Popup '?') */}
            <div className="space-y-3">
              <span className="font-bold text-white footer-section-title uppercase text-[11px] tracking-wider block border-b border-white/20 pb-1.5">
                Hỗ Trợ & Chính Sách
              </span>
              <div className="space-y-2 text-white/80 font-medium">
                <button
                  onClick={() => navigate('/faq')}
                  className="block hover:text-white text-left transition-colors cursor-pointer border-none bg-transparent p-0"
                >
                  Câu hỏi thường gặp (FAQ)
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="block hover:text-white text-left transition-colors cursor-pointer border-none bg-transparent p-0"
                >
                  Bảng giá & Gói học
                </button>
                <button
                  onClick={() => navigate('/legal')}
                  className="block hover:text-white text-left transition-colors cursor-pointer border-none bg-transparent p-0"
                >
                  Điều khoản sử dụng
                </button>
                <button
                  onClick={() => navigate('/legal')}
                  className="block hover:text-white text-left transition-colors cursor-pointer border-none bg-transparent p-0"
                >
                  Chính sách bảo mật
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="block hover:text-white text-left transition-colors cursor-pointer border-none bg-transparent p-0"
                >
                  Liên hệ hỗ trợ
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="block hover:text-white text-left transition-colors cursor-pointer border-none bg-transparent p-0"
                >
                  Báo lỗi & Gửi phản hồi
                </button>
              </div>
            </div>

            {/* Column 4: Liên hệ / thông tin hệ thống */}
            <div className="space-y-3">
              <span className="font-bold text-white footer-section-title uppercase text-[11px] tracking-wider block border-b border-white/20 pb-1.5">
                Liên Hệ Hệ Thống
              </span>
              <div className="space-y-2 text-white/80 font-medium leading-relaxed">
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
                <div className="pt-2 border-t border-white/20 flex items-center gap-3 text-white">
                  <span className="font-bold text-[10px] uppercase text-white/90">
                    Mạng xã hội:
                  </span>
                  <a
                    href="#"
                    className="hover:text-white text-white/80 transition-colors"
                  >
                    Facebook
                  </a>
                  <span className="text-white/50">•</span>
                  <a
                    href="#"
                    className="hover:text-white text-white/80 transition-colors"
                  >
                    YouTube
                  </a>
                  <span className="text-white/50">•</span>
                  <a
                    href="#"
                    className="hover:text-white text-white/80 transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto border-t border-white/20 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-white/60 gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-bold text-white/80">
                Công ty Cổ phần Công nghệ Giáo Dục Quốc Tế MindHub Việt Nam.
              </p>
              <p>MindHub e-learning platform © 2026. Bảo lưu mọi bản quyền.</p>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-[10px] bg-white/20 text-white p-1.5 px-3 rounded-lg block text-center font-bold tracking-wider border border-white/30">
                XÁC THỰC BOUTIQUE SSL
              </span>
              <button
                onClick={() =>
                  alert(
                    "Xác thực chứng chỉ MindHub bằng mã hóa block chuỗi an toàn",
                  )
                }
                className="hover:underline text-white/80 hover:text-white bg-transparent border-none cursor-pointer p-0 font-medium"
              >
                Xác thực chứng chỉ
              </button>
            </div>
          </div>
        </footer>
    </>
  );
}
