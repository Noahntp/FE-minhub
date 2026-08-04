import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  PlayCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Users,
  Award,
  Shield,
  MonitorPlay,
  Heart,
  ShoppingCart,
  Calendar,
  BarChart,
  Clock,
  BookOpen,
  Globe,
  Subtitles,
  Smartphone,
  ShieldCheck,
  Infinity,
  Lock,
  Share2,
  CheckCircle2,
  ThumbsUp,
  ChevronLeft,
} from 'lucide-react';

import { useApp } from '@/app/AppContext';
import { useCourseDetail } from './hooks/useCourseDetail';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { CourseDetailSkeleton } from './components/CourseDetailSkeleton';
import { HomeCourseCard, HomeCourseItem } from '@/features/home/components/HomeCourseCard';
import { toast } from 'sonner';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, isLoading, error } = useCourseDetail(courseId);

  const { cart, setCart, enrolledCourseIds } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews' | 'faq'>('overview');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    ch1: true,
  });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);

  // Live Countdown Timer state (02 Days, 15 Hours, 30 Mins, 45 Secs)
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 15,
    minutes: 30,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const expandAllChapters = () => {
    const all: Record<string, boolean> = {};
    mockChapters.forEach((ch) => {
      all[ch.id] = true;
    });
    setExpandedChapters(all);
  };

  const handleAddToCart = () => {
    if (!course) return;
    if (!cart.includes(course.id)) {
      setCart([...cart, course.id]);
    }
    toast.success('Đã thêm khóa học vào giỏ hàng!');
    navigate(`/cart?courseId=${course.id}`);
  };

  const handleEnrollNow = () => {
    if (!course) return;
    if (!cart.includes(course.id)) {
      setCart([...cart, course.id]);
    }
    navigate(`/checkout?courseId=${course.id}`);
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Đã sao chép đường dẫn khóa học!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (isLoading) return <CourseDetailSkeleton />;
  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <EmptyState
          title="Không tìm thấy khoá học"
          description="Khoá học bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ."
          actionLabel="Trở về trang chủ"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  const isEnrolled = (enrolledCourseIds || []).includes(course.id);

  // Mock chapters matching design
  const mockChapters = [
    {
      id: 'ch1',
      title: 'Chương 1: Giới thiệu về Python',
      lessonCount: 6,
      duration: '45 phút',
      lessons: [
        { id: 'l1', title: '1.1 Python là gì?', duration: '05:30', isPreview: true },
        { id: 'l2', title: '1.2 Cài đặt Python và môi trường lập trình', duration: '08:15', isPreview: true },
        { id: 'l3', title: '1.3 Chạy chương trình đầu tiên', duration: '04:45', isPreview: false },
      ],
    },
    {
      id: 'ch2',
      title: 'Chương 2: Biến và kiểu dữ liệu',
      lessonCount: 8,
      duration: '1 giờ 10 phút',
      lessons: [
        { id: 'l4', title: '2.1 Khai báo biến và đặt tên chuẩn', duration: '09:20', isPreview: false },
        { id: 'l5', title: '2.2 Kiểu dữ liệu số (Integer, Float)', duration: '12:10', isPreview: false },
        { id: 'l6', title: '2.3 Chuỗi ký tự (String) & Xử lý chuỗi', duration: '15:40', isPreview: false },
      ],
    },
    {
      id: 'ch3',
      title: 'Chương 3: Toán tử và biểu thức',
      lessonCount: 7,
      duration: '1 giờ',
      lessons: [
        { id: 'l7', title: '3.1 Toán tử số học & gán giá trị', duration: '10:00', isPreview: false },
        { id: 'l8', title: '3.2 Toán tử so sánh & logic', duration: '14:30', isPreview: false },
      ],
    },
    {
      id: 'ch4',
      title: 'Chương 4: Cấu trúc điều kiện',
      lessonCount: 6,
      duration: '50 phút',
      lessons: [
        { id: 'l9', title: '4.1 Câu lệnh If - Else cơ bản', duration: '11:15', isPreview: false },
        { id: 'l10', title: '4.2 Điều kiện lồng nhau & Elif', duration: '13:50', isPreview: false },
      ],
    },
    {
      id: 'ch5',
      title: 'Chương 5: Vòng lặp',
      lessonCount: 7,
      duration: '1 giờ 5 phút',
      lessons: [
        { id: 'l11', title: '5.1 Vòng lặp For và hàm range()', duration: '12:00', isPreview: false },
        { id: 'l12', title: '5.2 Vòng lặp While & xử lý điều kiện dừng', duration: '14:20', isPreview: false },
      ],
    },
    {
      id: 'ch6',
      title: 'Chương 6: Hàm (Function) và Module trong Python',
      lessonCount: 8,
      duration: '1 giờ 15 phút',
      lessons: [
        { id: 'l13', title: '6.1 Định nghĩa hàm def & Tham số truyền vào', duration: '11:30', isPreview: false },
        { id: 'l14', title: '6.2 Giá trị trả về Return & Scope biến', duration: '14:10', isPreview: false },
      ],
    },
    {
      id: 'ch7',
      title: 'Chương 7: Cấu trúc dữ liệu nâng cao (List, Dictionary, Set)',
      lessonCount: 10,
      duration: '1 giờ 30 phút',
      lessons: [
        { id: 'l15', title: '7.1 Thao tác với List & Tuple', duration: '15:20', isPreview: false },
        { id: 'l16', title: '7.2 Dictionary & Cấu trúc JSON trong Python', duration: '18:40', isPreview: false },
      ],
    },
    {
      id: 'ch8',
      title: 'Chương 8: Đọc & Ghi File (File I/O) và Xử lý ngoại lệ (Exception)',
      lessonCount: 7,
      duration: '55 phút',
      lessons: [
        { id: 'l17', title: '8.1 Thao tác đọc ghi tệp tin TXT / CSV', duration: '13:10', isPreview: false },
        { id: 'l18', title: '8.2 Khối Try - Except xử lý lỗi ứng dụng', duration: '12:45', isPreview: false },
      ],
    },
    {
      id: 'ch9',
      title: 'Chương 9: Lập trình hướng đối tượng (OOP) & Dự án Thực tế',
      lessonCount: 9,
      duration: '1 giờ 40 phút',
      lessons: [
        { id: 'l19', title: '9.1 Class, Object & Kế thừa trong OOP', duration: '20:15', isPreview: false },
        { id: 'l20', title: '9.2 Xây dựng phần mềm Quản lý Học viên Mini Project', duration: '25:30', isPreview: false },
      ],
    },
  ];

  // Related courses mock data
  const relatedCoursesData: HomeCourseItem[] = [
    {
      id: 'django-web-framework',
      title: 'Django - Web Framework với Python',
      level: 'Trung cấp',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
      rating: 4.7,
      reviewCount: 842,
      studentCount: '3.4K',
      instructorName: 'Nguyễn Văn A',
      instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      price: 349000,
      originalPrice: 499000,
      discountBadge: '-30%',
      isHot: true,
    },
    {
      id: 'flask-web-dev',
      title: 'Flask Web Development cơ bản',
      level: 'Cơ bản',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
      rating: 4.8,
      reviewCount: 623,
      studentCount: '2.1K',
      instructorName: 'Trần Minh Đức',
      instructorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
      price: 299000,
      originalPrice: 399000,
      discountBadge: '-25%',
    },
    {
      id: 'data-analysis-python',
      title: 'Data Analysis Python & Pandas',
      level: 'Trung cấp',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      rating: 4.9,
      reviewCount: 1024,
      studentCount: '4.5K',
      instructorName: 'Phạm Quỳnh Anh',
      instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      price: 399000,
      isHot: true,
    },
    {
      id: 'python-advanced-mastery',
      title: 'Python Nâng cao & Design Patterns',
      level: 'Nâng cao',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      rating: 4.9,
      reviewCount: 732,
      studentCount: '1.9K',
      instructorName: 'Đỗ Thành Long',
      instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
      price: 449000,
    },
    {
      id: 'automate-boring-stuff',
      title: 'Automate the Boring Stuff with Python',
      level: 'Mọi trình độ',
      thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80',
      rating: 4.8,
      reviewCount: 512,
      studentCount: '1.6K',
      instructorName: 'Lê Hoàng Nam',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      price: 299000,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-20">
      
      {/* 1. Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-emerald-600 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link to="/courses" className="hover:text-emerald-600 transition-colors">
              Công nghệ thông tin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link to="/courses?category=programming" className="hover:text-emerald-600 transition-colors">
              Lập trình
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-none">
              {course.title}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Hero Section */}
      <section className="bg-white py-8 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cột trái (5 cols): Video Preview Box */}
            <div className="lg:col-span-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-xl group border border-slate-200">
                <img
                  src={course.image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm">
                    <PlayCircle className="w-9 h-9 fill-white stroke-emerald-600 ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-2">
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span>Xem trước khóa học</span>
                </div>
              </div>
            </div>

            {/* Cột giữa (4 cols): Course Info Details */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <div>
                <span className="inline-block text-[11px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md mb-2">
                  Bestseller
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {course.title}
                </h1>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {course.subtitle ||
                  'Khóa học dành cho người mới bắt đầu, giúp bạn nắm vững kiến thức nền tảng Python từ cơ bản đến thực hành, dễ hiểu, dễ áp dụng.'}
              </p>

              {/* Instructor & Stats */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructorName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-extrabold text-slate-900">{course.instructorName}</div>
                    <div className="text-[11px] text-slate-400">Giảng viên</div>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{course.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({course.reviewCount.toLocaleString()} đánh giá)</span>
                </div>

                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.enrolledCount.toLocaleString()} Học viên</span>
                </div>
              </div>
            </div>

            {/* Cột phải (4 cols): Sticky Purchase Card */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-5 text-left relative">
                
                {/* Discount Tag */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black bg-rose-500 text-white px-2.5 py-1 rounded-md">
                    -40%
                  </span>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                    <span className="font-bold">Yêu thích</span>
                    <span className="text-slate-400">(1.234)</span>
                  </button>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-900">
                    299.000đ
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    499.000đ
                  </span>
                </div>

                {/* Live Countdown Timer */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                    Kết thúc sau
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-base font-black text-slate-900">
                        {String(timeLeft.days).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Ngày</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-base font-black text-slate-900">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Giờ</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-base font-black text-slate-900">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Phút</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-base font-black text-rose-600">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Giây</div>
                    </div>
                  </div>
                </div>

                {/* Single Purchase Button */}
                <div className="pt-1">
                  {isEnrolled ? (
                    <button
                      onClick={() => navigate(`/learn/${course.id}`)}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      <PlayCircle className="w-5 h-5" />
                      <span>Tiếp tục học ngay</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleEnrollNow}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Mua ngay</span>
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Key Stats Bar */}
      <section className="bg-white py-4 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Cập nhật</div>
                <div className="font-extrabold text-slate-800">05/2026</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <BarChart className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Cấp độ</div>
                <div className="font-extrabold text-slate-800">Cơ bản</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Thời lượng</div>
                <div className="font-extrabold text-slate-800">8 giờ 30 phút</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Bài giảng</div>
                <div className="font-extrabold text-slate-800">68 bài học</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Ngôn ngữ</div>
                <div className="font-extrabold text-slate-800">Tiếng Việt</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Subtitles className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Phụ đề</div>
                <div className="font-extrabold text-slate-800">Có</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Guarantees Bar (4 items) */}
      <section className="bg-emerald-50/40 py-4 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-emerald-100 shadow-sm">
              <Smartphone className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <div className="font-extrabold text-slate-900">Học mọi lúc, mọi nơi</div>
                <div className="text-[11px] text-slate-500">Trên mọi thiết bị</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-emerald-100 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <div className="font-extrabold text-slate-900">Hoàn tiền trong 7 ngày</div>
                <div className="text-[11px] text-slate-500">Nếu không hài lòng</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-emerald-100 shadow-sm">
              <Infinity className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <div className="font-extrabold text-slate-900">Truy cập trọn đời</div>
                <div className="text-[11px] text-slate-500">Nội dung khóa học</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-emerald-100 shadow-sm">
              <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <div className="font-extrabold text-slate-900">Thanh toán an toàn</div>
                <div className="text-[11px] text-slate-500">Bảo mật tuyệt đối</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Main Tabbed Content & Right Sidebar */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Tổng quan' },
              { id: 'curriculum', label: 'Nội dung khóa học' },
              { id: 'instructor', label: 'Giảng viên' },
              { id: 'reviews', label: 'Đánh giá (1.234)' },
              { id: 'faq', label: 'Hỏi đáp (320)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 text-sm font-extrabold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main Content (8 cols) */}
            <div className="lg:col-span-8 space-y-8 text-left">
              
              {/* Box 1: Bạn sẽ học được gì */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Bạn sẽ học được gì
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                  {[
                    'Hiểu và sử dụng các khái niệm cơ bản của Python',
                    'Xử lý file và ngoại lệ trong Python',
                    'Làm việc với biến, kiểu dữ liệu, toán tử và điều kiện',
                    'Xây dựng chương trình nhỏ và thực hành thực tế',
                    'Sử dụng vòng lặp, hàm và cấu trúc dữ liệu cơ bản',
                    'Tự tin viết code và tiếp tục học nâng cao',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Mô tả khóa học */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Mô tả khóa học
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
                  <p>
                    Python là một trong những ngôn ngữ lập trình phổ biến và dễ học nhất hiện nay. Khóa học này được thiết kế dành riêng cho người mới bắt đầu, giúp bạn nắm vững kiến thức nền tảng và ứng dụng vào thực tế.
                  </p>
                  {isDescExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2 pt-2"
                    >
                      <p>
                        Thông qua 68 bài học thực chiến, bạn sẽ được hướng dẫn chi tiết từ việc cài đặt môi trường Anaconda, PyCharm, viết những dòng lệnh Python đầu tiên cho tới việc xây dựng ứng dụng quản lý mini project thực tế.
                      </p>
                      <p>
                        Khóa học cung cấp đầy đủ tài liệu PDF, bộ mã nguồn mẫu và hệ thống bài tập tự luyện có giải thích đáp án chi tiết.
                      </p>
                    </motion.div>
                  )}
                </div>
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-xs font-bold text-emerald-600 hover:underline pt-1 inline-block"
                >
                  {isDescExpanded ? '... Thu gọn' : '... Xem thêm'}
                </button>
              </div>

              {/* Box 3: Nội dung khóa học (Accordion) */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Nội dung khóa học
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      68 bài học • 8 giờ 30 phút tổng thời lượng
                    </p>
                  </div>
                  <button
                    onClick={expandAllChapters}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Mở rộng tất cả
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
                  {(showAllChapters ? mockChapters : mockChapters.slice(0, 5)).map((ch) => {
                    const isExpanded = !!expandedChapters[ch.id];
                    return (
                      <div key={ch.id} className="bg-white">
                        <button
                          onClick={() => toggleChapter(ch.id)}
                          className="w-full p-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 transition-transform ${
                                isExpanded ? 'rotate-180 text-emerald-600' : ''
                              }`}
                            />
                            <span className="font-extrabold text-slate-900 text-sm">
                              {ch.title}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {ch.lessonCount} bài học • {ch.duration}
                          </span>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-white divide-y divide-slate-100"
                            >
                              {ch.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="p-3.5 pl-10 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                                    <PlayCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{lesson.title}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {lesson.isPreview && (
                                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                        Xem thử
                                      </span>
                                    )}
                                    <span className="text-slate-400">{lesson.duration}</span>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowAllChapters(!showAllChapters)}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline transition-all cursor-pointer py-1 px-3 rounded-lg hover:bg-emerald-50"
                  >
                    <span>{showAllChapters ? 'Thu gọn danh sách chương' : `Xem tất cả ${mockChapters.length} chương`}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllChapters ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6 text-left">
              
              {/* Widget 1: Thông tin Giảng viên */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Giảng viên
                </h3>
                <div className="flex items-center gap-3">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructorName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{course.instructorName}</span>
                      <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Senior Python Developer tại MindHub
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-700 pt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                    <span className="text-slate-400 font-normal">(2.345 đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>25.6K Học viên</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Hơn 8 năm kinh nghiệm trong lĩnh vực lập trình Python và giảng dạy online.
                </p>

                <button
                  onClick={() => navigate(`/instructors/${course.instructorId}`)}
                  className="w-full py-2.5 rounded-xl border border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-colors"
                >
                  Xem thêm về giảng viên
                </button>
              </div>

              {/* Widget 2: Khóa học bao gồm */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Khóa học bao gồm
                </h3>
                <div className="space-y-3 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>68 bài học video chất lượng cao</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>8 giờ 30 phút nội dung</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tài liệu bài giảng PDF</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bài tập thực hành có hướng dẫn</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MonitorPlay className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Code mẫu và tài nguyên</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Truy cập trên điện thoại và TV</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Infinity className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cập nhật nội dung miễn phí</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Chứng chỉ hoàn thành</span>
                  </div>
                </div>
              </div>

              {/* Widget 3: Chia sẻ khóa học */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Chia sẻ khóa học
                </h3>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-full bg-blue-600 text-white hover:opacity-90 transition-opacity">
                    <span className="text-xs font-bold">f</span>
                  </button>
                  <button className="p-2.5 rounded-full bg-sky-500 text-white hover:opacity-90 transition-opacity">
                    <span className="text-xs font-bold">⚡</span>
                  </button>
                  <button className="p-2.5 rounded-full bg-blue-500 text-white hover:opacity-90 transition-opacity">
                    <span className="text-xs font-bold">Z</span>
                  </button>
                  <button
                    onClick={handleCopyShare}
                    className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Sao chép đường dẫn"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 6. Khóa học liên quan */}
      <section className="py-12 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Khóa học liên quan
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Các khóa học cùng chủ đề được học viên đăng ký nhiều nhất
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 4 Course Cards (9 cols) */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedCoursesData.slice(0, 4).map((item) => (
                <HomeCourseCard key={item.id} course={item} />
              ))}
            </div>

            {/* Extra Roadmap Banner Card (3 cols) */}
            <div className="lg:col-span-3 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between text-left">
              <div>
                <span className="inline-block text-[10px] font-black tracking-wider uppercase bg-white/20 px-2.5 py-1 rounded mb-3">
                  LỘ TRÌNH TOÀN DIỆN
                </span>
                <h3 className="text-lg font-black leading-snug mb-2">
                  Học Python lộ trình toàn diện từ cơ bản đến nâng cao
                </h3>
                <div className="space-y-1.5 text-xs text-emerald-100 mb-4 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>9 khóa học liên tiếp</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>45+ giờ học thực hành</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Giảm 35% khi mua trọn bộ</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/roadmaps')}
                className="w-full py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-black shadow-md transition-colors"
              >
                Xem lộ trình
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Đánh giá của học viên */}
      <section className="py-12 bg-slate-50/50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-left mb-8">
            Đánh giá của học viên
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Ratings Summary (4 cols) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">4.8</span>
                <span className="text-base text-slate-400 font-bold">/5</span>
              </div>

              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                (1.234 đánh giá từ học viên)
              </div>

              {/* Progress Bars */}
              <div className="space-y-2 pt-2 text-xs">
                {[
                  { star: '5 sao', percent: 76 },
                  { star: '4 sao', percent: 20 },
                  { star: '3 sao', percent: 3 },
                  { star: '2 sao', percent: 1 },
                  { star: '1 sao', percent: 0 },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-10 text-slate-600 font-medium shrink-0">
                      {row.star}
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${row.percent}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-slate-400 font-medium shrink-0">
                      {row.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Cards List (8 cols) */}
            <div className="lg:col-span-8 space-y-4 text-left">
              {[
                {
                  name: 'Trần Minh Đức',
                  date: '2 tuần trước',
                  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
                  content:
                    'Khóa học rất dễ hiểu, phù hợp cho người mới bắt đầu như mình. Giảng viên giải thích rõ ràng, ví dụ thực tế dễ áp dụng.',
                  helpfulCount: 12,
                },
                {
                  name: 'Lê Hoàng Anh',
                  date: '1 tháng trước',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
                  content:
                    'Nội dung đầy đủ, bài tập thực hành sát với thực tế. Mình đã tự tin viết được các chương trình Python cơ bản.',
                  helpfulCount: 8,
                },
              ].map((rev, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.avatar}
                        alt={rev.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">
                          {rev.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{rev.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {rev.content}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-start">
                    <button className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 font-bold transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Hữu ích ({rev.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              ))}

              <div className="text-center pt-2">
                <button className="px-6 py-2.5 rounded-xl border border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 text-xs font-extrabold transition-colors">
                  Xem tất cả đánh giá
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
