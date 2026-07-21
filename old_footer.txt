import React, { useState } from 'react';
import { Mail, Shield, CheckCircle, HelpCircle, FileText, Send, Landmark } from 'lucide-react';
import { GENERAL_FAQ } from '../data';

interface FooterLegalProps {
  initialTab?: 'terms' | 'privacy' | 'refund' | 'contact' | 'faq';
  onClose: () => void;
}

export default function FooterLegal({ initialTab = 'terms', onClose }: FooterLegalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund' | 'contact' | 'faq'>(initialTab);
  
  // Contact Form state:
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div 
        id="legal-modal-card" 
        className="bg-white w-full max-w-4xl h-[88vh] md:h-[82vh] rounded-2xl shadow-2xl border border-brand-light-active overflow-hidden flex flex-col animate-fade-in text-main-darker"
      >
        {/* Header toolbar */}
        <div className="bg-[#432c28] p-4.5 text-brand-light flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-light" />
            <h2 className="text-sm sm:text-base font-academic font-bold tracking-tight italic text-brand-light">Trung tâm Hỗ trợ & Chính sách MindHub</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Đóng [✕]
          </button>
        </div>

        {/* Content body container with responsive navigation stacking */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          
          {/* Navigation Tab Menu: Row-grid on mobile/tablet, Column sidebar on desktop */}
          <div className="bg-stone-50 md:bg-brand-light border-b md:border-b-0 md:border-r border-brand-light-active p-2.5 md:p-4 space-y-0.5 md:space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible shrink-0 md:w-56 no-scrollbar gap-1.5 md:gap-0">
            <button
              onClick={() => { setActiveTab('terms'); setSubmitted(false); }}
              className={`text-left px-3 py-1.5 md:py-2.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'terms' ? 'bg-[#8b5e3c] text-white shadow-xs' : 'bg-white md:bg-transparent hover:bg-brand-light-hover text-stone-605'}`}
            >
              <FileText className="w-3.5 h-3.5" /> Điều khoản sử dụng
            </button>
            <button
              onClick={() => { setActiveTab('privacy'); setSubmitted(false); }}
              className={`text-left px-3 py-1.5 md:py-2.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'privacy' ? 'bg-[#8b5e3c] text-white shadow-xs' : 'bg-white md:bg-transparent hover:bg-brand-light-hover text-stone-605'}`}
            >
              <Shield className="w-3.5 h-3.5" /> Chính sách bảo mật
            </button>
            <button
              onClick={() => { setActiveTab('refund'); setSubmitted(false); }}
              className={`text-left px-3 py-1.5 md:py-2.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'refund' ? 'bg-[#8b5e3c] text-white shadow-xs' : 'bg-white md:bg-transparent hover:bg-brand-light-hover text-stone-605'}`}
            >
              <Landmark className="w-3.5 h-3.5" /> Chính sách hoàn tiền
            </button>
            <button
              onClick={() => { setActiveTab('faq'); setSubmitted(false); }}
              className={`text-left px-3 py-1.5 md:py-2.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'faq' ? 'bg-[#8b5e3c] text-white shadow-xs' : 'bg-white md:bg-transparent hover:bg-brand-light-hover text-stone-605'}`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Câu hỏi FAQ chung
            </button>
            <button
              onClick={() => { setActiveTab('contact'); setSubmitted(false); }}
              className={`text-left px-3 py-1.5 md:py-2.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'contact' ? 'bg-[#8b5e3c] text-white shadow-xs' : 'bg-white md:bg-transparent hover:bg-brand-light-hover text-stone-650'}`}
            >
              <Mail className="w-3.5 h-3.5" /> Liên hệ hỗ trợ & Ticket
            </button>
          </div>

          {/* Interactive Content area - Scrollable */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-stone-50/50 text-[11px] sm:text-xs md:text-sm leading-relaxed text-left tactile-scrollbar">
            
            {activeTab === 'terms' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-base sm:text-lg font-bold text-stone-850">Điều khoản sử dụng dịch vụ MindHub</h3>
                <p className="text-gray-400 text-[10px]">Cập nhật lần cuối: 2026-06-08</p>
                <div className="border border-brand-light-active bg-white p-4.5 rounded-xl space-y-3.5 shadow-xs">
                  <h4 className="font-bold text-stone-800 text-xs sm:text-sm border-b pb-1">1. Chấp thuận điều khoản hợp đồng</h4>
                  <p className="text-stone-600 text-xs leading-relaxed text-justify">
                    Bằng việc tạo tài khoản, đăng ký khóa học, hoặc truy cập bất kỳ tài nguyên học liệu số nào trên MindHub, bạn đồng ý tuân thủ toàn bộ điều khoản dưới đây. Nếu bạn không đồng ý với chúng tôi, vui lòng ngừng sử dụng dịch vụ.
                  </p>
                  
                  <h4 className="font-bold text-stone-800 text-xs sm:text-sm border-b pb-1">2. Quyền sở hữu trí tuệ của bài giảng</h4>
                  <p className="text-stone-600 text-xs leading-relaxed text-justify">
                    Mọi video, mã nguồn, bài trắc nghiệm, tài liệu tải về, bản vẽ Figma mẫu và nội dung trao đổi thuộc bản quyền sở hữu của MindHub hoặc Giảng viên cộng tác. Bạn TUYỆT ĐỐI KHÔNG được sao chép, phân phối phi pháp hoặc bán lại dưới mọi hình thức.
                  </p>

                  <h4 className="font-bold text-stone-800 text-xs sm:text-sm border-b pb-1">3. Hành vi người dùng bị nghiêm cấm</h4>
                  <ul className="text-stone-600 text-xs list-disc pl-5 space-y-1 text-justify">
                    <li>Chia sẻ tài khoản học chung cho nhiều người dùng khác nhau truy cập song song.</li>
                    <li>Sử dụng robot, crawler để tải trộm hàng loạt video bài giảng trái phép.</li>
                    <li>Bình luận thô tục, bôi nhọ danh dự người khác hoặc chia sẻ link lậu trong mục Q&A.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-base sm:text-lg font-bold text-stone-850">Chính sách bảo mật thông tin cá nhân</h3>
                <p className="text-gray-400 text-[10px]">Cập nhật lần cuối: 2026-06-08</p>
                <div className="border border-brand-light-active bg-white p-4.5 rounded-xl space-y-3.5 shadow-xs">
                  <h4 className="font-bold text-stone-800 text-xs sm:text-sm border-b pb-1">1. Dữ liệu thu thập</h4>
                  <p className="text-stone-600 text-xs leading-relaxed text-justify">
                    Hệ thống chúng tôi thu thập tên, địa chỉ email, ảnh đại diện, lịch sử giao dịch và thời gian tương tác xem video để liên tục cải thiện hiệu suất của tính năng hỗ trợ học cá nhân hóa.
                  </p>

                  <h4 className="font-bold text-stone-800 text-xs sm:text-sm border-b pb-1">2. Cam kết bảo mật dữ liệu khách hàng</h4>
                  <p className="text-stone-600 text-xs leading-relaxed text-justify">
                    MindHub tuân thủ nghiêm ngặt tiêu chuẩn bảo vệ dữ liệu châu Âu GDPR. Chúng tôi cam kết không bao giờ bán, cho thuê hay tiết lộ bất cứ thông tin cá nhân của bạn cho bên thứ ba vì bất kì mục tiếp thị thương mại nào khác.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'refund' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-base sm:text-lg font-bold text-stone-850">Chính sách Hoàn tiền & Bảo đảm</h3>
                <p className="text-gray-400 text-[10px]">Cập nhật lần cuối: 2026-06-08</p>
                <div className="border border-brand-light-active bg-white p-4.5 rounded-xl space-y-3.5 shadow-xs">
                  <h4 className="font-bold text-stone-800 text-xs sm:text-sm border-b pb-1">1. Điều kiện yêu cầu hoàn trả học phí hoàn thành</h4>
                  <p className="text-stone-600 text-xs leading-relaxed text-justify">
                    Vì quyền lợi tối đa của học viên, MindHub cam kết hoàn tiền 100% học phí đầu tư trong vòng <b>7 ngày đầu tiên</b> kể từ ngày tạo hóa đơn giao dịch thành công nếu thỏa mãn:
                  </p>
                  <ul className="text-stone-600 text-xs list-disc pl-5 space-y-1.5 text-justify">
                    <li>Bạn chưa làm bài kiểm tra hoặc xem vượt quá 10% tổng thời lượng của khóa học đã đăng ký.</li>
                    <li>Bạn chưa tiến hành tải xuống tài liệu đi kèm của bài viết.</li>
                    <li>Chưa phát sinh hay yêu cầu tạo chứng chỉ đầu ra cho khóa học tương ứng.</li>
                  </ul>

                  <h4 className="font-bold text-stone-800 text-xs sm:text-sm border-b pb-1">2. Quy trình và Thời gian tiếp nhận chuyển khoản</h4>
                  <p className="text-stone-600 text-xs leading-relaxed text-justify">
                    Bạn chỉ cần gửi yêu cầu ticket đi kèm với thông tin mã giao dịch hóa đơn. Bộ phận đối soát tài chính của chúng tôi sẽ xử lý và chuyển trả khoản tiền phí ngân hàng cho bạn sau 2 - 4 ngày làm việc cực nhanh.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-base sm:text-lg font-bold text-stone-850">Những Câu hỏi Thường gặp (FAQ)</h3>
                <div className="space-y-3.5">
                  {GENERAL_FAQ.map((item, idx) => (
                    <div key={idx} className="bg-white border border-brand-light-active p-4 rounded-xl shadow-xs">
                      <h4 className="font-bold text-stone-800 text-xs sm:text-sm flex items-center gap-2">
                        <HelpCircle className="w-4.5 h-4.5 text-[#8b5e3c]" />
                        {item.q}
                      </h4>
                      <p className="text-stone-605 text-xs mt-2 pl-6.5 leading-relaxed text-justify">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-base sm:text-lg font-bold text-stone-850">Gửi yêu cầu hỗ trợ (Support Ticket)</h3>
                <p className="text-stone-500 text-xs leading-relaxed">
                  Đội ngũ CSKH và Chuyên viên vận hành kỹ thuật luôn túc trực hỗ trợ bạn. Mọi phản hồi của bạn sẽ được xử lý trong tối đa 12 giờ làm việc.
                </p>

                {submitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-805 p-6 rounded-2xl text-center space-y-3.5 animate-scale-up">
                    <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-base text-emerald-900">Khởi tạo Ticket hỗ trợ thành công!</h4>
                    <p className="text-xs text-emerald-700 leading-normal">
                      Mã số Ticket ưu tiên: <b>#TK-{Math.floor(100000 + Math.random() * 900000)}</b> của bạn đã được lưu lại trên luồng bảo mật. Chúng tôi sẽ thông báo trực tiếp qua email cá nhân của bạn.
                    </p>
                    <button 
                      type="button" 
                      onClick={() => setSubmitted(false)}
                      className="text-xs font-bold text-[#8b5e3c] hover:underline"
                    >
                      Gửi thêm câu hỏi hoặc phản hồi khác
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="bg-white border border-brand-light-active p-4 sm:p-5 rounded-2xl space-y-4 shadow-sm text-left">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-605 mb-1.5">Họ và tên quý danh</label>
                        <input 
                          type="text" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nhập tên của bạn" 
                          className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-1 focus:ring-[#8b5e3c] focus:outline-none" 
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-605 mb-1.5">Email tiếp nhận liên lạc</label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com" 
                          className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-1 focus:ring-[#8b5e3c] focus:outline-none" 
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-605 mb-1.5">Chủ đề hỗ trợ</label>
                      <input 
                        type="text" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="VD: Không truy cập được bài preview / Hỏi về rút số dư ví..." 
                        className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-1 focus:ring-[#8b5e3c] focus:outline-none" 
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-605 mb-1.5">Mô tả cụ thể yêu cầu của bạn</label>
                      <textarea 
                        rows={4} 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Vui lòng nêu chi tiết để đội ngũ kỹ thuật của MindHub hỗ trợ bạn nhanh nhất." 
                        className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-1 focus:ring-[#8b5e3c] focus:outline-none" 
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="bg-[#432c28] hover:bg-black text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" /> Gửi Yêu Cầu Hỗ Trợ [Ticket]
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer info brand */}
        <div className="bg-stone-50 border-t border-[#e8ded3]/80 p-4 shrink-0 flex justify-between items-center text-[10px] text-stone-500">
          <span>MindHub e-learning platform © 2026.</span>
          <button 
            type="button" 
            onClick={onClose} 
            className="bg-[#432c28] hover:bg-black text-white font-bold py-1.5 px-4 rounded-lg transition-colors"
          >
            Đóng bảng
          </button>
        </div>
      </div>
    </div>
  );
}
