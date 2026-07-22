import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-900 via-deep-indigo to-stone-50 z-0"></div>
      
      {/* Orbs */}
      <div className="absolute top-10 right-20 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-40 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24">
        <div className={`text-center mb-16 space-y-6 max-w-3xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-semibold mb-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <MessageSquare className="w-4 h-4 text-amber-300" />
            Hỗ trợ 24/7
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Kết nối cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-100">MindHub</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 font-light leading-relaxed">
            Bạn có câu hỏi hoặc cần hỗ trợ chuyên sâu? Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn trên con đường chinh phục tri thức.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Information Cards */}
          <div className={`lg:col-span-2 space-y-6 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
              
              <h3 className="text-2xl font-bold mb-8 text-stone-900 tracking-tight">Thông Tin Liên Hệ</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-5 group/item">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center shrink-0 text-indigo-600 shadow-sm group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-stone-900">Trụ sở chính</h4>
                    <p className="text-stone-500 font-medium leading-relaxed">Tầng 12, Tòa nhà Bitexco<br/>Quận 1, TP. Hồ Chí Minh</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group/item">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shrink-0 text-blue-600 shadow-sm group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-stone-900">Email</h4>
                    <p className="text-stone-500 font-medium leading-relaxed">admin@mindhub.edu.vn<br/>support@mindhub.edu.vn</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group/item">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 flex items-center justify-center shrink-0 text-fuchsia-600 shadow-sm group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-stone-900">Điện thoại</h4>
                    <p className="text-stone-500 font-medium leading-relaxed">1900 6868 99<br/>0988 123 456</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map Placeholder or Aesthetic Block */}
            <div className="bg-deep-indigo rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-indigo-500">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <h4 className="text-xl font-bold mb-2 relative z-10">Bạn cần tư vấn lộ trình?</h4>
              <p className="text-indigo-200 text-sm mb-6 relative z-10 leading-relaxed">Để lại thông tin, đội ngũ cố vấn học tập của chúng tôi sẽ liên hệ trong vòng 24h làm việc.</p>
              <div className="flex -space-x-3 relative z-10">
                <img className="w-10 h-10 rounded-full border-2 border-deep-indigo" src="https://i.pravatar.cc/100?img=1" alt="Avatar 1" />
                <img className="w-10 h-10 rounded-full border-2 border-deep-indigo" src="https://i.pravatar.cc/100?img=5" alt="Avatar 2" />
                <img className="w-10 h-10 rounded-full border-2 border-deep-indigo" src="https://i.pravatar.cc/100?img=8" alt="Avatar 3" />
                <div className="w-10 h-10 rounded-full border-2 border-deep-indigo bg-white/20 flex items-center justify-center text-xs font-bold">+12</div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`lg:col-span-3 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-stone-100 h-full">
              <div className="mb-8">
                <h3 className="text-3xl font-extrabold text-stone-900 tracking-tight">Gửi Lời Nhắn</h3>
                <p className="text-stone-500 mt-2 font-medium">Chúng tôi sẽ phản hồi qua email của bạn nhanh nhất có thể.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-stone-700">Họ và Tên <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-stone-800 placeholder-stone-400"
                      placeholder="VD: Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-stone-700">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-stone-800 placeholder-stone-400"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-stone-700">Chủ đề <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-stone-800 placeholder-stone-400"
                    placeholder="Bạn cần hỗ trợ về vấn đề gì?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-stone-700">Nội dung <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-stone-800 placeholder-stone-400 resize-none"
                    placeholder="Vui lòng mô tả chi tiết..."
                  ></textarea>
                </div>

                {/* Status Messages */}
                {status === 'success' && (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium flex items-start gap-3 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p>Tuyệt vời! Tin nhắn của bạn đã được gửi thành công. Đội ngũ của chúng tôi sẽ liên hệ lại với bạn sớm nhất.</p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-red-700 font-medium flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p>Rất tiếc, đã có lỗi xảy ra khi gửi tin nhắn. Vui lòng kiểm tra lại kết nối hoặc thử lại sau.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full sm:w-auto px-10 py-4 bg-deep-indigo hover:bg-indigo-900 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_4px_20px_rgba(30,27,75,0.2)] hover:shadow-[0_8px_30px_rgba(30,27,75,0.3)] hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Gửi Lời Nhắn <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
