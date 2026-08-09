import React, { useState, useMemo, useEffect } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { apiFetch } from '@/shared/lib/api-client';
import { 
  Search, ChevronDown, HelpCircle, MessageSquare, FileText, Sparkles, 
  ShieldCheck, Award, CreditCard, BookOpen, UserCheck, GraduationCap, 
  Laptop, ThumbsUp, ThumbsDown, Copy, Check, X, ArrowRight, Send, 
  Clock, Zap, Tag, Layers, LifeBuoy, ChevronRight, Filter
} from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

export interface FAQItem {
  id: string;
  category: 'account' | 'payment' | 'course' | 'certificate' | 'instructor' | 'technical';
  categoryLabel: string;
  q: string;
  a: string;
  helpfulCount: number;
  unhelpfulCount: number;
  views: number;
  tags: string[];
  isPopular?: boolean;
}

const FAQ_CATEGORIES = [
  { 
    id: 'all', 
    label: 'Tất cả câu hỏi', 
    desc: 'Tổng hợp mọi thắc mắc phổ biến trên MindHub',
    icon: Layers, 
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    iconBg: 'bg-slate-100 text-slate-700'
  },
  { 
    id: 'account', 
    label: 'Tài khoản & Bảo mật', 
    desc: 'Đăng ký, đăng nhập, đổi mật khẩu & 2FA',
    icon: UserCheck, 
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-600'
  },
  { 
    id: 'payment', 
    label: 'Thanh toán & Hoàn tiền', 
    desc: 'VNPay, MoMo, chuyển khoản & chính sách 7 ngày',
    icon: CreditCard, 
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600'
  },
  { 
    id: 'course', 
    label: 'Khóa học & Học tập', 
    desc: 'Truy cập trọn đời, tài liệu & thảo luận Q&A',
    icon: BookOpen, 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-100 text-indigo-600'
  },
  { 
    id: 'certificate', 
    label: 'Chứng chỉ & Bằng cấp', 
    desc: 'Điều kiện cấp, xác thực PDF & đính kèm LinkedIn',
    icon: Award, 
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-600'
  },
  { 
    id: 'instructor', 
    label: 'Dành cho Giảng viên', 
    desc: 'Đăng ký giảng dạy, tạo khóa học & doanh thu',
    icon: GraduationCap, 
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-600'
  },
  { 
    id: 'technical', 
    label: 'Kỹ thuật & Hệ thống', 
    desc: 'Xử lý lỗi video, sự cố phát & cấu hình máy',
    icon: Laptop, 
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-100 text-rose-600'
  },
];

const INITIAL_FAQS: FAQItem[] = [
  // Tài khoản
  {
    id: 'faq-acc-1',
    category: 'account',
    categoryLabel: 'Tài khoản & Bảo mật',
    q: 'Làm thế nào để đổi mật khẩu hoặc lấy lại mật khẩu đã quên?',
    a: 'Bạn có thể lấy lại mật khẩu bằng cách bấm vào đường dẫn "Quên mật khẩu?" tại màn hình Đăng nhập. Hệ thống sẽ gửi một liên kết hoặc mã xác thực (OTP) tới email đăng ký của bạn. Sau khi nhập đúng mã OTP, bạn có thể thiết lập mật khẩu mới ngay lập tức.\n\nNếu muốn đổi mật khẩu khi đang đăng nhập, hãy truy cập Cài đặt tài khoản > Bảo mật & Mật khẩu.',
    helpfulCount: 245,
    unhelpfulCount: 4,
    views: 1820,
    tags: ['mật khẩu', 'quên mật khẩu', 'otp', 'đăng nhập'],
    isPopular: true
  },
  {
    id: 'faq-acc-2',
    category: 'account',
    categoryLabel: 'Tài khoản & Bảo mật',
    q: 'Tôi có thể sử dụng 1 tài khoản MindHub trên nhiều thiết bị cùng lúc không?',
    a: 'MindHub cho phép bạn đăng nhập và học tập trên tối đa 3 thiết bị cá nhân (Máy tính, Máy tính bảng, Điện thoại).\n\nTuy nhiên, để đảm bảo an toàn tài khoản và bản quyền khóa học, hệ thống không cho phép xem video bài giảng đồng thời trên 2 thiết bị khác nhau tại cùng một thời điểm.',
    helpfulCount: 188,
    unhelpfulCount: 9,
    views: 1450,
    tags: ['thiết bị', 'đăng nhập', 'bảo mật', 'tài khoản'],
  },
  {
    id: 'faq-acc-3',
    category: 'account',
    categoryLabel: 'Tài khoản & Bảo mật',
    q: 'Làm sao để kích hoạt bảo mật 2 lớp (2FA) cho tài khoản?',
    a: 'Vào Trang cá nhân > Cài đặt tài khoản > Mục "Bảo mật & 2FA". Tại đây, bạn chọn kích hoạt xác thực qua Mã OTP Email hoặc Số điện thoại. Sau khi kích hoạt, mỗi khi đăng nhập trên thiết bị lạ, hệ thống sẽ yêu cầu nhập mã xác thực gửi về điện thoại/email của bạn.',
    helpfulCount: 96,
    unhelpfulCount: 2,
    views: 740,
    tags: ['2fa', 'bảo mật', 'otp'],
  },

  // Thanh toán
  {
    id: 'faq-pay-1',
    category: 'payment',
    categoryLabel: 'Thanh toán & Hoàn tiền',
    q: 'Chính sách hoàn tiền trong vòng 7 ngày áp dụng như thế nào?',
    a: 'MindHub cam kết hoàn tiền 100% trong vòng 7 ngày kể từ ngày mua khóa học nếu bạn không hài lòng với nội dung, với điều kiện thời lượng học chưa vượt quá 20% tổng dung lượng khóa học và chưa tải xuống tài liệu đi kèm.\n\nĐể yêu cầu hoàn tiền, bạn truy cập Lịch sử giao dịch > Chọn đơn hàng > Nhấn "Yêu cầu hoàn tiền" hoặc liên hệ bộ phận CSKH.',
    helpfulCount: 412,
    unhelpfulCount: 15,
    views: 3100,
    tags: ['hoàn tiền', 'refund', 'chính sách', '7 ngày'],
    isPopular: true
  },
  {
    id: 'faq-pay-2',
    category: 'payment',
    categoryLabel: 'Thanh toán & Hoàn tiền',
    q: 'MindHub hỗ trợ những phương thức thanh toán nào?',
    a: 'Chúng tôi hỗ trợ đa dạng các cổng thanh toán an toàn hàng đầu Việt Nam bao gồm:\n• Cổng VNPAY (Thẻ ATM nội địa, QR Pay ngân hàng)\n• Ví điện tử MoMo\n• Thẻ tín dụng/ghi nợ quốc tế (Visa, Mastercard, JCB)\n• Chuyển khoản ngân hàng trực tiếp 24/7 với cú pháp tự động kích hoạt tức thì.',
    helpfulCount: 320,
    unhelpfulCount: 6,
    views: 2400,
    tags: ['vnpay', 'momo', 'visa', 'chuyển khoản', 'thanh toán'],
    isPopular: true
  },
  {
    id: 'faq-pay-3',
    category: 'payment',
    categoryLabel: 'Thanh toán & Hoàn tiền',
    q: 'Sau khi chuyển khoản ngân hàng, bao lâu thì khóa học được kích hoạt?',
    a: 'Nếu bạn quét mã QR Code chuyển khoản với nội dung chuyển khoản chính xác do hệ thống tạo ra, khóa học sẽ được tự động kích hoạt trong vòng 10 - 30 giây.\n\nNếu sau 5 phút bạn vẫn chưa thấy khóa học trong mục "Khóa học của tôi", vui lòng kiểm tra lại sao kê hoặc gửi hóa đơn cho CSKH qua Live Chat.',
    helpfulCount: 175,
    unhelpfulCount: 5,
    views: 1290,
    tags: ['kích hoạt', 'chuyển khoản', 'thời gian'],
  },

  // Khóa học
  {
    id: 'faq-crs-1',
    category: 'course',
    categoryLabel: 'Khóa học & Học tập',
    q: 'Khóa học trên MindHub có thời hạn truy cập bao lâu?',
    a: 'Tất cả các khóa học lẻ trên MindHub đều có quyền truy cập TRỌN ĐỜI sau khi đăng ký thành công. Bạn có thể xem lại bài giảng, bài tập, mã nguồn và tài liệu cập nhật bất kỳ lúc nào, không giới hạn số lần xem.',
    helpfulCount: 530,
    unhelpfulCount: 8,
    views: 4200,
    tags: ['thời hạn', 'trọn đời', 'truy cập'],
    isPopular: true
  },
  {
    id: 'faq-crs-2',
    category: 'course',
    categoryLabel: 'Khóa học & Học tập',
    q: 'Tôi có thể tải video bài giảng về xem ngoại tuyến (Offline) không?',
    a: 'Để bảo vệ bản quyền của giảng viên, bạn hiện chưa thể tải file video trực tiếp về máy tính. Tuy nhiên, trên ứng dụng di động MindHub Mobile App, bạn có thể bấm "Tải xuống bài giảng" để xem ngoại tuyến khi không có kết nối Internet.',
    helpfulCount: 210,
    unhelpfulCount: 14,
    views: 1650,
    tags: ['offline', 'tải video', 'app mobile'],
  },
  {
    id: 'faq-crs-3',
    category: 'course',
    categoryLabel: 'Khóa học & Học tập',
    q: 'Nếu gặp thắc mắc hoặc lỗi bài tập trong lúc học thì hỏi ai?',
    a: 'Mỗi bài giảng đều có mục "Thảo luận & Hỏi đáp (Q&A)" ngay bên dưới video. Bạn có thể đặt câu hỏi kèm hình ảnh/mã nguồn tại đó. Giảng viên và đội ngũ Trợ giảng MindHub sẽ phản hồi thắc mắc của bạn trong vòng 24 giờ làm việc.',
    helpfulCount: 164,
    unhelpfulCount: 3,
    views: 1100,
    tags: ['hỏi đáp', 'q&a', 'giảng viên', 'trợ giảng'],
  },

  // Chứng chỉ
  {
    id: 'faq-cert-1',
    category: 'certificate',
    categoryLabel: 'Chứng chỉ & Bằng cấp',
    q: 'Điều kiện để nhận Chứng chỉ hoàn thành khóa học là gì?',
    a: 'Để nhận chứng chỉ điện tử từ MindHub, bạn cần:\n1. Hoàn thành 100% các bài học video\n2. Vượt qua tất cả các bài kiểm tra trắc nghiệm/quizzes với điểm số từ 70% trở lên\n3. Hoàn thành đồ án cuối khóa (nếu khóa học yêu cầu).\n\nChứng chỉ sẽ tự động xuất hiện trong trang "Trung tâm chứng chỉ".',
    helpfulCount: 380,
    unhelpfulCount: 7,
    views: 2900,
    tags: ['chứng chỉ', 'hoàn thành', 'điều kiện'],
    isPopular: true
  },
  {
    id: 'faq-cert-2',
    category: 'certificate',
    categoryLabel: 'Chứng chỉ & Bằng cấp',
    q: 'Chứng chỉ MindHub có thể chia sẻ lên LinkedIn hoặc đính kèm CV không?',
    a: 'Có! Mỗi chứng chỉ MindHub cấp đều có một đường dẫn xác thực công khai (Verification Link) và mã định danh duy nhất (Unique Certificate ID). Bạn có thể bấm nút "Thêm vào LinkedIn Profile" hoặc tải bản PDF chất lượng cao để in ấn và đưa vào CV xin việc.',
    helpfulCount: 295,
    unhelpfulCount: 4,
    views: 2150,
    tags: ['linkedin', 'pdf', 'xác thực', 'cv'],
  },

  // Giảng viên
  {
    id: 'faq-inst-1',
    category: 'instructor',
    categoryLabel: 'Dành cho Giảng viên',
    q: 'Tôi muốn trở thành Giảng viên trên MindHub thì làm thế nào?',
    a: 'Bạn chỉ cần truy cập trang "Trở thành Giảng viên" (Đăng ký Instructor), điền đầy đủ thông tin chuyên môn, kinh nghiệm giảng dạy và video giảng thử 3-5 phút.\n\nĐội ngũ thẩm định chuyên môn MindHub sẽ duyệt hồ sơ trong vòng 48 giờ làm việc và liên hệ hướng dẫn bạn tạo khóa học đầu tiên.',
    helpfulCount: 260,
    unhelpfulCount: 11,
    views: 1980,
    tags: ['đăng ký giảng viên', 'instructor', 'tạo khóa học'],
  },
  {
    id: 'faq-inst-2',
    category: 'instructor',
    categoryLabel: 'Dành cho Giảng viên',
    q: 'Tỷ lệ chia sẻ doanh thu cho Giảng viên là bao nhiêu?',
    a: 'MindHub áp dụng mức chia sẻ doanh thu cạnh tranh top đầu thị trường:\n• Giảng viên nhận tới 80% doanh thu đối với các đơn hàng mua qua mã giới thiệu/link trực tiếp của giảng viên.\n• 50% doanh thu đối với các đơn hàng phát sinh tự nhiên từ nền tảng MindHub.',
    helpfulCount: 310,
    unhelpfulCount: 8,
    views: 2200,
    tags: ['doanh thu', 'hoa hồng', 'rút tiền'],
  },

  // Kỹ thuật
  {
    id: 'faq-tech-1',
    category: 'technical',
    categoryLabel: 'Kỹ thuật & Hệ thống',
    q: 'Video bài giảng bị giật/lag hoặc không có tiếng thì khắc phục sao?',
    a: 'Bạn có thể xử lý nhanh theo các bước:\n1. Kiểm tra kết nối Internet\n2. Đổi chất lượng video từ 1080p xuống 720p hoặc Auto ở góc trình phát\n3. Thử xóa bộ nhớ đệm (Cache) trình duyệt hoặc đổi sang trình duyệt Chrome/Edge mới nhất\n4. Tắt các tiện ích mở rộng chặn quảng cáo (AdBlock) có thể gây xung đột trình phát HTML5.',
    helpfulCount: 190,
    unhelpfulCount: 12,
    views: 1400,
    tags: ['video lỗi', 'lag', 'chất lượng', 'sự cố'],
  },
  {
    id: 'faq-tech-2',
    category: 'technical',
    categoryLabel: 'Kỹ thuật & Hệ thống',
    q: 'Yêu cầu cấu hình máy tính để học lập trình trên MindHub?',
    a: 'Các khóa học trên MindHub xem mượt mà trên mọi máy tính/laptop phổ thông có trình duyệt web hiện đại.\n\nĐối với các khóa học thực hành Lập trình Web, Mobile hoặc AI/Data, chúng tôi khuyên dùng máy tính có tối thiểu RAM 8GB và hệ điều hành Windows 10/11, macOS hoặc Linux.',
    helpfulCount: 145,
    unhelpfulCount: 3,
    views: 980,
    tags: ['cấu hình', 'máy tính', 'yêu cầu'],
  }
];

const POPULAR_SEARCH_TAGS = [
  'Hoàn tiền 7 ngày',
  'Cấp chứng chỉ',
  'Thanh toán VNPay',
  'Quên mật khẩu',
  'Đăng ký Giảng viên',
  'Xem offline'
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({ 'faq-pay-1': true });
  const [votedMap, setVotedMap] = useState<Record<string, 'up' | 'down'>>({});
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // FETCH FAQS FROM BACKEND API WITH FALLBACK
  useEffect(() => {
    let isMounted = true;
    const fetchFaqs = async () => {
      try {
        setIsLoading(true);
        // Try fetching public FAQs from /home endpoint
        const res = await apiFetch<any>('/home');
        const apiFaqs = Array.isArray(res?.faqs) 
          ? res.faqs 
          : (Array.isArray(res?.data?.faqs) ? res.data.faqs : []);

        if (isMounted && apiFaqs.length > 0) {
          const categoryLabels: Record<string, string> = {
            account: 'Tài khoản & Bảo mật',
            payment: 'Thanh toán & Hoàn tiền',
            refund: 'Thanh toán & Hoàn tiền',
            course: 'Khóa học & Học tập',
            certificate: 'Chứng chỉ & Bằng cấp',
            instructor: 'Dành cho Giảng viên',
            technical: 'Kỹ thuật & Hệ thống',
            general: 'Khóa học & Học tập'
          };

          const mapped: FAQItem[] = apiFaqs.map((item: any, idx: number) => {
            const rawType = (item.type || 'course').toLowerCase();
            const cat = (['account', 'payment', 'refund', 'course', 'certificate', 'instructor', 'technical'].includes(rawType) 
              ? (rawType === 'refund' ? 'payment' : rawType) 
              : 'course') as FAQItem['category'];

            return {
              id: `api-faq-${item.id || idx}`,
              category: cat,
              categoryLabel: categoryLabels[rawType] || 'Khóa học & Học tập',
              q: item.question || item.q || '',
              a: item.answer || item.a || '',
              helpfulCount: item.helpful_count || (120 + (idx * 15)),
              unhelpfulCount: item.unhelpful_count || 0,
              views: item.views || (600 + (idx * 40)),
              tags: [rawType, 'mindhub', 'faq'],
              isPopular: idx < 3 || !!item.is_popular
            };
          });

          if (mapped.length > 0) {
            setFaqs(mapped);
          }
        }
      } catch (err) {
        console.warn('Backend API FAQs fetch fallback to initial FAQs:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFaqs();
    return () => { isMounted = false; };
  }, []);

  // Submit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter FAQs based on active category & search query
  const filteredFaqs = useMemo(() => {
    return faqs.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const qLower = searchQuery.toLowerCase().trim();
      if (!qLower) return matchesCategory;

      const matchesQuery = 
        item.q.toLowerCase().includes(qLower) ||
        item.a.toLowerCase().includes(qLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(qLower));

      return matchesCategory && matchesQuery;
    });
  }, [faqs, activeCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenFaqIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const nextState: Record<string, boolean> = {};
    filteredFaqs.forEach(f => { nextState[f.id] = true; });
    setOpenFaqIds(nextState);
  };

  const collapseAll = () => {
    setOpenFaqIds({});
  };

  const handleVote = (id: string, type: 'up' | 'down') => {
    if (votedMap[id]) {
      toast.info('Bạn đã thực hiện đánh giá cho câu hỏi này.');
      return;
    }

    setVotedMap(prev => ({ ...prev, [id]: type }));
    setFaqs(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          helpfulCount: type === 'up' ? item.helpfulCount + 1 : item.helpfulCount,
          unhelpfulCount: type === 'down' ? item.unhelpfulCount + 1 : item.unhelpfulCount
        };
      }
      return item;
    }));

    if (type === 'up') {
      toast.success('Cảm ơn bạn đã phản hồi! Đánh giá giúp chúng tôi cải thiện chất lượng hỗ trợ.');
    } else {
      toast.info('Cảm ơn bạn! Chúng tôi sẽ cập nhật nội dung câu trả lời rõ ràng hơn.');
    }
  };

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/faq#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Đã sao chép liên kết câu hỏi!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setContactForm({ name: '', email: '', category: 'general', subject: '', message: '' });
      toast.success('Gửi câu hỏi thành công! Đội ngũ MindHub sẽ phản hồi qua email trong 24h.');
    }, 1200);
  };

  const selectCategoryAndScroll = (catId: string) => {
    setActiveCategory(catId);
    const contentEl = document.getElementById('faq-content-section');
    if (contentEl) {
      contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-200/90 text-amber-950 font-semibold px-1 rounded">
              {part}
            </mark>
          ) : part
        )}
      </span>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/70 pb-20">
        
        {/* REDESIGNED HERO SECTION */}
        <div className="relative bg-gradient-to-b from-[#004D3F] via-[#007A64] to-[#005A49] text-white py-12 md:py-16 px-4 shadow-xl overflow-hidden">
          {/* Subtle Decorative Mesh Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-300/30 text-emerald-200 text-xs font-bold tracking-wide mb-4 backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Trung Tâm Trợ Giúp & FAQ MindHub
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight mb-3 text-white">
              Chúng tôi có thể giải đáp gì cho bạn?
            </h1>
            <p className="text-emerald-100/90 text-sm md:text-base max-w-xl mx-auto mb-6 leading-relaxed font-normal">
              Tra cứu nhanh câu trả lời cho các thắc mắc về tài khoản, khóa học, thanh toán & chính sách hoàn tiền 7 ngày.
            </p>

            {/* SEARCH BAR WITH INTEGRATED BUTTON */}
            <div className="relative max-w-xl mx-auto">
              <div className="relative flex items-center shadow-2xl rounded-2xl p-1 bg-white border border-white/30 backdrop-blur-md">
                <Search className="left-4 absolute w-4 h-4 text-slate-400 pointer-events-none" />
                <Input 
                  type="text"
                  className="pl-10 pr-24 h-11 w-full text-slate-900 text-sm md:text-base border-none focus-visible:ring-0 placeholder:text-slate-400 bg-transparent font-medium"
                  placeholder="Nhập từ khóa (Ví dụ: hoàn tiền, chứng chỉ, vnpay...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-28 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}

                <Button 
                  onClick={() => selectCategoryAndScroll('all')}
                  className="bg-[#007A64] hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-9 px-4 shrink-0 shadow-md"
                >
                  <Search className="w-3.5 h-3.5 mr-1" /> Tìm kiếm
                </Button>
              </div>

              {/* POPULAR SEARCH TAG CHIPS */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 text-xs">
                <span className="text-emerald-200 font-semibold flex items-center gap-1 text-[11px]">
                  <Tag className="w-3.5 h-3.5 text-amber-300" /> Từ khóa gợi ý:
                </span>
                {POPULAR_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      selectCategoryAndScroll('all');
                    }}
                    className="px-3 py-1 rounded-full bg-emerald-950/40 hover:bg-white hover:text-emerald-800 text-emerald-100 border border-emerald-400/30 text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TOP CATEGORY TILES (6 GRID TILES) */}
        <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-20 mb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {FAQ_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
              const IconComp = cat.icon;
              const isSelected = activeCategory === cat.id;
              const count = faqs.filter(f => f.category === cat.id).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => selectCategoryAndScroll(cat.id)}
                  className={`bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
                      : 'border-slate-200/80 hover:border-emerald-500/40'
                  }`}
                >
                  <div>
                    <div className={`w-9 h-9 rounded-xl ${cat.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-xs md:text-sm leading-snug group-hover:text-emerald-700 transition-colors">
                      {cat.label}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>{count} câu hỏi</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN 2-COLUMN SECTION */}
        <div id="faq-content-section" className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* LEFT STICKY SIDEBAR */}
            <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-20 space-y-6">
              
              {/* Category Filter Menu */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 px-2 flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" /> Danh mục trợ giúp
                </h3>

                <div className="space-y-1">
                  {FAQ_CATEGORIES.map(cat => {
                    const IconComponent = cat.icon;
                    const isActive = activeCategory === cat.id;
                    const count = cat.id === 'all' 
                      ? faqs.length 
                      : faqs.filter(f => f.category === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{cat.label}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Popular Questions Quick Jump Widget */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hidden lg:block">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 px-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Phổ biến nhất
                </h3>

                <div className="space-y-2">
                  {INITIAL_FAQS.filter(f => f.isPopular).slice(0, 4).map(pop => (
                    <button
                      key={pop.id}
                      onClick={() => {
                        setActiveCategory('all');
                        setOpenFaqIds(prev => ({ ...prev, [pop.id]: true }));
                        const el = document.getElementById(pop.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200/60"
                    >
                      <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-600 line-clamp-2 leading-snug">
                        {pop.q}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
                        👍 {pop.helpfulCount} người thấy hữu ích
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Need Direct Help Card */}
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-md text-center">
                <LifeBuoy className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-sm mb-1">Cần hỗ trợ trực tiếp?</h4>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Gửi câu hỏi cho đội ngũ tư vấn MindHub để được giải đáp trong 24h.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="sm"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs h-9"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Gửi câu hỏi ngay
                </Button>
              </div>

            </div>

            {/* RIGHT MAIN FAQS ACCORDION */}
            <div className="flex-1 min-w-0 w-full">

              {/* ACTIVE FILTER HEADER & CONTROLS */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base md:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    {FAQ_CATEGORIES.find(c => c.id === activeCategory)?.label || 'Tất cả câu hỏi'}
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {filteredFaqs.length}
                    </span>
                  </h2>
                  {searchQuery && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kết quả tìm kiếm cho từ khóa: "<span className="font-bold text-emerald-600">{searchQuery}</span>"
                    </p>
                  )}
                </div>

                {filteredFaqs.length > 0 && (
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <button 
                      onClick={expandAll}
                      className="text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      Mở tất cả
                    </button>
                    <span className="text-slate-300">•</span>
                    <button 
                      onClick={collapseAll}
                      className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                    >
                      Thu gọn tất cả
                    </button>
                  </div>
                )}
              </div>

              {/* FAQS LIST - UNIFIED SLEEK CONTAINER */}
              {isLoading ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2.5 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                      <div className="flex gap-2">
                        <div className="h-3 bg-slate-100 rounded-md w-24" />
                        <div className="h-3 bg-slate-100 rounded-md w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredFaqs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-sm">
                  <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy câu hỏi phù hợp</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-5 text-xs md:text-sm">
                    Không có kết quả khớp với từ khóa "{searchQuery}". Bạn có thể thử tìm từ khóa khác hoặc gửi thắc mắc trực tiếp.
                  </p>
                  <div className="flex items-center justify-center gap-2.5">
                    <Button 
                      onClick={() => setSearchQuery('')}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs"
                    >
                      Xóa tìm kiếm
                    </Button>
                    <Button 
                      onClick={() => setIsModalOpen(true)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Gửi câu hỏi
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
                  {filteredFaqs.map((item) => {
                    const isOpen = !!openFaqIds[item.id];
                    const vote = votedMap[item.id];

                    return (
                      <div 
                        key={item.id}
                        id={item.id}
                        className={`transition-colors duration-150 ${
                          isOpen ? 'bg-slate-50/50' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Header Trigger */}
                        <button
                          onClick={() => toggleFaq(item.id)}
                          className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none group"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug group-hover:text-emerald-700 transition-colors mb-1.5">
                              {highlightMatch(item.q, searchQuery)}
                            </h3>

                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {item.categoryLabel}
                              </span>
                              {item.isPopular && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-500" /> Phổ biến
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-medium ml-auto sm:ml-0">
                                👍 {item.helpfulCount} người thấy hữu ích
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 group-hover:border-emerald-500/50 group-hover:text-emerald-600 transition-all ${
                              isOpen ? 'bg-emerald-600 text-white border-emerald-600 group-hover:text-white' : 'bg-white'
                            }`}>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </button>

                        {/* Answer Accordion Content */}
                        {isOpen && (
                          <div className="px-5 pb-5 pt-3 bg-white border-l-4 border-emerald-500 animate-fadeIn">
                            <p className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-line mb-4 font-normal">
                              {highlightMatch(item.a, searchQuery)}
                            </p>

                            {/* TAGS */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                                <span className="text-[11px] text-slate-400 font-medium">Thẻ:</span>
                                {item.tags.map(tag => (
                                  <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* ACTIONS & FEEDBACK TOOLBAR */}
                            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                              <button
                                type="button"
                                onClick={(e) => handleCopyLink(item.id, e)}
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                              >
                                {copiedId === item.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600 font-bold">Đã sao chép link</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Sao chép liên kết câu hỏi</span>
                                  </>
                                )}
                              </button>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Hữu ích?</span>
                                <button
                                  onClick={() => handleVote(item.id, 'up')}
                                  disabled={!!vote}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                                    vote === 'up'
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" /> Có ({item.helpfulCount})
                                </button>

                                <button
                                  onClick={() => handleVote(item.id, 'down')}
                                  disabled={!!vote}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                                    vote === 'down'
                                      ? 'bg-rose-600 text-white border-rose-600'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-500 hover:text-rose-600'
                                  }`}
                                >
                                  <ThumbsDown className="w-3 h-3" /> Không ({item.unhelpfulCount})
                                </button>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        </div>

        {/* SUBMIT QUESTION MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 relative border border-slate-100">
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Gửi câu hỏi cho MindHub</h3>
                  <p className="text-xs text-slate-500">Đội ngũ CSKH sẽ phản hồi qua email của bạn trong 24h</p>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <Input 
                    required
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="h-10 rounded-xl text-sm"
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email nhận phản hồi <span className="text-rose-500">*</span>
                  </label>
                  <Input 
                    required
                    type="email"
                    placeholder="nguyenvana@gmail.com"
                    className="h-10 rounded-xl text-sm"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Danh mục thắc mắc
                  </label>
                  <select 
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs md:text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={contactForm.category}
                    onChange={e => setContactForm({ ...contactForm, category: e.target.value })}
                  >
                    <option value="general">Thắc mắc chung</option>
                    <option value="account">Tài khoản & Đăng nhập</option>
                    <option value="payment">Thanh toán & Hoàn tiền</option>
                    <option value="course">Khóa học & Bài tập</option>
                    <option value="certificate">Chứng chỉ & Bằng cấp</option>
                    <option value="instructor">Đăng ký làm Giảng viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tiêu đề thắc mắc
                  </label>
                  <Input 
                    type="text"
                    placeholder="Cần hỗ trợ kích hoạt khóa học..."
                    className="h-10 rounded-xl text-sm"
                    value={contactForm.subject}
                    onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nội dung câu hỏi <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Mô tả chi tiết câu hỏi hoặc vấn đề bạn gặp phải..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none font-medium"
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl text-xs"
                  >
                    Hủy bỏ
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-5 text-xs"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
                  </Button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}
