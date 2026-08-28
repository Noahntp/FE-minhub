import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { INITIAL_COURSES } from '@/shared/data';
import { Search, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { CourseCard } from '@/features/courses/components/CourseCard';
import { CourseCardSkeleton } from '@/features/courses/components/CourseCardSkeleton';
import { apiFetch } from '@/shared/lib/api-client';
import { resolveMediaUrl } from '@/shared/utils/format';
import { semanticSearchApi } from '@/services/api';

/**
 * Common Vietnamese Stop-Words Set
 */
export const VI_STOPWORDS = new Set([
  'toi', 'ta', 'chung', 'ban', 'anh', 'chi', 'em', 'minh', 'muon', 'can', 'tim', 'kiem', 'hoc', 'khoa', 
  'lop', 'huong', 'dan', 'tu', 'den', 'va', 'hoac', 'la', 'o', 'tai', 'trong', 'ngoai', 'cho', 'voi', 
  've', 'cac', 'nhung', 'gi', 'sao', 'nao', 'the', 'day', 'do', 'nay', 'kia', 'mot', 'hai', 'nhieu', 
  'it', 'rat', 'qua', 'lam', 'tot', 'hay', 'nen', 'se', 'da', 'dang', 'chua', 'duoc', 'bi', 'boi',
  'co', 'giup', 'dung', 'de', 'giua', 'vao', 'ra', 'truoc', 'sau', 'khi', 'ai', 'dau', 'biet',
  'lap', 'trinh', 'bai', 'giang', 'video', 'nen', 'tang', 'tu', 'hoc'
]);

/**
 * Dictionary of known domain keywords for typo correction
 */
export const KNOWN_KEYWORDS = [
  'laravel', 'react', 'reactjs', 'javascript', 'typescript', 
  'mysql', 'database', 'figma', 'ui', 'ux', 'frontend', 
  'backend', 'fullstack', 'php', 'python', 'html', 'css', 'vue', 'nodejs', 'rest', 'api',
  'vps', 'aapanel', 'nginx', 'ssl', 'postman', 'testing', 'mvp', 'analytics', 'portfolio', 'interview'
];

/**
 * 7 Additional Real Video Courses matching Bunny CDN dataset
 */
export const BUNNY_CDN_SUPPLEMENTARY_COURSES = [
  {
    id: 'xay-dung-san-pham-web-mvp',
    title: 'Xây dựng Sản phẩm Web MVP: Từ Ý tưởng đến Ra mắt Thực tế',
    description: 'Học cách đóng gói ý tưởng kinh doanh thành sản phẩm Web MVP khả thi trong 2 đến 4 tuần.',
    instructorName: 'Đặng Tuấn Kiệt',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 599000,
    salePrice: 479000,
    rating: 4.9,
    reviewCount: 342,
    studentCount: 2800,
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    category: 'Khởi nghiệp & Sản phẩm',
    slug: 'xay-dung-san-pham-web-mvp',
  },
  {
    id: 'kiem-thu-tu-dong-hoa-api-postman',
    title: 'Kiểm thử & Tự động hóa API Toàn diện với Postman',
    description: 'Thành thạo công cụ Postman để viết test scripts, tự động hóa test collection và tích hợp CI/CD.',
    instructorName: 'Hoàng Văn Thái',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    price: 449000,
    salePrice: 359000,
    rating: 4.8,
    reviewCount: 285,
    studentCount: 2100,
    level: 'Trung cấp',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    category: 'Kiểm thử Phần mềm',
    slug: 'kiem-thu-tu-dong-hoa-api-postman',
  },
  {
    id: 'web-analytics-ab-testing-chuyen-doi',
    title: 'Web Analytics & A/B Testing: Tối ưu Chuyển đổi Thực chiến',
    description: 'Đo lường hành vi người dùng trên website, thiết lập sự kiện tracking và tối ưu tỷ lệ chuyển đổi.',
    instructorName: 'Nguyễn Bích Ngọc',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    price: 549000,
    salePrice: 439000,
    rating: 4.9,
    reviewCount: 198,
    studentCount: 1900,
    level: 'Trung cấp',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    category: 'Dữ liệu & Phân tích',
    slug: 'web-analytics-ab-testing-chuyen-doi',
  },
  {
    id: 'trien-khai-web-vps-aapanel-nginx',
    title: 'Triển khai Web lên VPS Linux với AAPanel, Nginx & SSL',
    description: 'Tự tay cấu hình VPS Linux, cài đặt AAPanel, quản lý domain DNS, chứng chỉ bảo mật SSL và Nginx Reverse Proxy.',
    instructorName: 'Lê Quốc Bảo',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    price: 499000,
    salePrice: 399000,
    rating: 4.9,
    reviewCount: 412,
    studentCount: 3500,
    level: 'Nâng cao',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    category: 'DevOps & Hệ thống',
    slug: 'trien-khai-web-vps-aapanel-nginx',
  },
  {
    id: 'dinh-huong-nghe-nghiep-web-developer',
    title: 'Định hướng Nghề nghiệp Web Developer: Xây dựng Portfolio & Phỏng vấn',
    description: 'Chiến lược xây dựng CV/Portfolio ấn tượng, kỹ năng deal lương và lộ trình thăng tiến nghề lập trình.',
    instructorName: 'Phạm Minh Trí',
    instructorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
    price: 399000,
    salePrice: 299000,
    rating: 4.7,
    reviewCount: 520,
    studentCount: 4200,
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    category: 'Kỹ năng & Sự nghiệp',
    slug: 'dinh-huong-nghe-nghiep-web-developer',
  },
  {
    id: 'quan-ly-du-an-web-tinh-gon',
    title: 'Quản lý Dự án Web Tinh gọn: Scope, Báo giá & Bàn giao',
    description: 'Quy trình chốt phạm vi dự án (Scope), lập dự toán báo giá, hợp đồng và quản lý tiến độ bàn giao.',
    instructorName: 'Trịnh Hoài Nam',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    price: 649000,
    salePrice: 519000,
    rating: 4.8,
    reviewCount: 164,
    studentCount: 1400,
    level: 'Trung cấp',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    category: 'Quản lý Dự án',
    slug: 'quan-ly-du-an-web-tinh-gon',
  },
  {
    id: 'chinh-phuc-phong-van-backend-developer',
    title: 'Chinh phục Phỏng vấn Backend Developer: Kiến trúc & Hệ thống',
    description: 'Tổng hợp và giải thích chi tiết các câu hỏi phỏng vấn Backend, OOP, System Design, Caching và Database.',
    instructorName: 'Đặng Tuấn Kiệt',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 749000,
    salePrice: 599000,
    rating: 5.0,
    reviewCount: 236,
    studentCount: 2300,
    level: 'Nâng cao',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    category: 'Lập trình Backend',
    slug: 'chinh-phuc-phong-van-backend-developer',
  },
];

/**
 * Technical domain clusters mapping
 */
export const DOMAIN_CLUSTERS: Record<string, string[]> = {
  laravel: ['laravel', 'php', 'backend', 'rest', 'api', 'controller', 'model', 'blade'],
  php: ['php', 'laravel', 'backend', 'oop', 'composer'],
  mysql: ['mysql', 'database', 'sql', 'co so du lieu', 'query', 'table'],
  database: ['mysql', 'database', 'sql', 'co so du lieu', 'csdl'],
  react: ['react', 'reactjs', 'frontend', 'spa', 'hooks', 'jsx', 'tsx', 'nextjs', 'dashboard'],
  reactjs: ['react', 'reactjs', 'frontend', 'spa', 'hooks', 'jsx', 'tsx', 'nextjs', 'dashboard'],
  figma: ['figma', 'ui', 'ux', 'thiet ke', 'design', 'wireframe', 'prototype'],
  ui: ['ui', 'ux', 'figma', 'thiet ke', 'design', 'giao dien'],
  ux: ['ui', 'ux', 'figma', 'thiet ke', 'design', 'trai nghiem'],
  javascript: ['javascript', 'js', 'frontend', 'es6', 'typescript', 'web'],
  js: ['javascript', 'js', 'frontend', 'es6', 'web'],
  typescript: ['typescript', 'ts', 'javascript', 'react'],
  ts: ['typescript', 'ts', 'javascript', 'react'],
  vps: ['vps', 'aapanel', 'nginx', 'ssl', 'linux', 'deploy', 'trien khai', 'server'],
  aapanel: ['vps', 'aapanel', 'nginx', 'ssl', 'linux', 'deploy', 'server'],
  nginx: ['vps', 'aapanel', 'nginx', 'ssl', 'linux', 'deploy', 'server'],
  postman: ['postman', 'api', 'testing', 'kiem thu', 'automation', 'rest'],
  mvp: ['mvp', 'san pham', 'product', 'startup', 'khoi nghiep', 'y tuong'],
  analytics: ['analytics', 'ab testing', 'chuyen doi', 'tracking', 'ga4'],
  interview: ['phong van', 'interview', 'backend', 'system design', 'kien truc'],
  portfolio: ['portfolio', 'cv', 'su nghiep', 'career', 'web developer'],
  python: ['python', 'ai', 'machine learning', 'django', 'flask', 'pandas', 'tri tue nhan tao'],
  ai: ['python', 'ai', 'machine learning', 'deep learning', 'tri tue nhan tao', 'chatgpt'],
};

/**
 * Levenshtein distance for typo tolerance
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/**
 * Fuzzy correction for common typos (e.g. 'lravel' -> 'laravel', 'myslq' -> 'mysql')
 */
export function correctTypo(token: string): string {
  if (KNOWN_KEYWORDS.includes(token)) return token;
  let bestMatch = token;
  let minDistance = 999;

  for (const kw of KNOWN_KEYWORDS) {
    const dist = levenshteinDistance(token, kw);
    const maxAllowed = kw.length <= 4 ? 1 : 2;
    if (dist <= maxAllowed && dist < minDistance) {
      minDistance = dist;
      bestMatch = kw;
    }
  }
  return bestMatch;
}

/**
 * Normalize text (remove accents, lowercase, trim)
 */
export function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

/**
 * Extract meaningful intent keywords and correct typos
 */
export function extractIntentKeywords(query: string): string[] {
  const norm = normalizeText(query);
  if (!norm) return [];
  const rawTokens = norm.split(/[\s,./\-+]+/).filter((t) => t.length > 0);
  const intentTokens = rawTokens.filter((t) => !VI_STOPWORDS.has(t)).map(correctTypo);
  return intentTokens.length > 0 ? intentTokens : rawTokens.map(correctTypo);
}

/**
 * Compute semantic match score with anti-hallucination guard and typo tolerance
 */
export function computeStrictSemanticScore(query: string, course: any): number {
  const normQuery = normalizeText(query);
  if (!normQuery) return 1.0;

  const intentTokens = extractIntentKeywords(query);
  if (intentTokens.length === 0) return 1.0;

  const courseTitle = normalizeText(course.title || '');
  const courseDesc = normalizeText(course.description || course.short_description || course.summary || '');
  const courseCategory = normalizeText(course.category || '');
  const courseInstructor = normalizeText(course.instructorName || '');
  const fullText = `${courseTitle} ${courseDesc} ${courseCategory} ${courseInstructor}`;
  const courseTokenSet = new Set(fullText.split(/[\s,.:;/\\+\-_]+/).filter(Boolean));

  // 1. Direct Full Query exact substring match
  if (courseTitle.includes(normQuery)) {
    return 1.0;
  }

  // 2. Strict Technical Domain Gatekeeper (Anti-Hallucination)
  const technicalAnchors = intentTokens.filter((t) => DOMAIN_CLUSTERS[t]);
  
  if (technicalAnchors.length > 0) {
    let hasDomainMatch = false;
    for (const anchor of technicalAnchors) {
      const allowedKeywords = DOMAIN_CLUSTERS[anchor] || [anchor];
      // Check whole-word token match (avoid short substrings like 'ai' matching 'bài', 'tài')
      if (allowedKeywords.some((kw) => courseTokenSet.has(kw) || (kw.length >= 4 && fullText.includes(kw)))) {
        hasDomainMatch = true;
        break;
      }
    }

    // Disqualify unrelated courses (e.g. asking for python when only mysql/react exist)
    if (!hasDomainMatch) {
      return 0.0;
    }
  }

  // 3. Token-level Scoring with Typo tolerance
  let matchedCount = 0;
  for (const token of intentTokens) {
    if (courseTokenSet.has(token) || courseTitle.includes(token)) {
      matchedCount += 1.5;
    } else if (fullText.includes(token)) {
      matchedCount += 1.0;
    } else {
      const syns = DOMAIN_CLUSTERS[token];
      if (syns && syns.some((syn) => courseTokenSet.has(syn) || fullText.includes(syn))) {
        matchedCount += 0.8;
      }
    }
  }

  const baseScore = matchedCount / Math.max(1, intentTokens.length);
  return Math.min(1.0, baseScore * 0.85);
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [localQuery, setLocalQuery] = useState(query);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('relevant');
  const [isLoading, setIsLoading] = useState(false);
  
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    let isMounted = true;
    const fetchSearchResults = async () => {
      try {
        setIsLoading(true);

        // Fetch courses list from backend API
        const res = await apiFetch<any>(`/courses?per_page=100&search=${encodeURIComponent(query)}`);
        
        const rawList = Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res)
          ? res
          : [];

        let sourceList = rawList;
        if (sourceList.length === 0) {
          try {
            const allRes = await apiFetch<any>(`/courses?per_page=100`);
            const allItems = Array.isArray(allRes?.data?.items)
              ? allRes.data.items
              : Array.isArray(allRes?.data)
              ? allRes.data
              : [];
            if (allItems.length > 0) {
              sourceList = allItems;
            }
          } catch {}
        }

        let mappedList: any[] = sourceList.length > 0
          ? sourceList.map((c: any) => ({
              id: String(c.id || c.slug),
              courseIdRaw: c.id,
              title: c.title || 'Khóa học',
              description: c.short_description || c.description || c.summary || 'Khóa học chất lượng cao',
              instructorName: c.instructor?.full_name || c.instructor_name || 'Giảng viên MindHub',
              instructorAvatar: c.instructor?.avatar_url
                ? resolveMediaUrl(c.instructor.avatar_url)
                : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
              price: Number(c.price || 0),
              salePrice: c.sale_price !== null && c.sale_price !== undefined ? Number(c.sale_price) : undefined,
              rating: Number(c.average_rating || 4.8),
              reviewCount: Number(c.reviews_count || 120),
              studentCount: Number(c.enrollments_count || 1200),
              level: c.course_level || c.level || 'Cơ bản',
              thumbnail: c.thumbnail_url
                ? resolveMediaUrl(c.thumbnail_url)
                : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
              category: c.categories?.[0]?.name || c.category?.name || 'Lập trình',
              slug: c.slug || c.id,
            }))
          : INITIAL_COURSES;

        // Merge with full supplementary courses catalog without title duplicates
        const existingTitles = new Set(mappedList.map((c) => (c.title || '').toLowerCase().trim()));
        const extraCourses = BUNNY_CDN_SUPPLEMENTARY_COURSES.filter(
          (c) => !existingTitles.has(c.title.toLowerCase().trim())
        );
        mappedList = [...mappedList, ...extraCourses];

        // Apply Strict Anti-Hallucination & Typo-Tolerant Semantic Scoring
        if (query.trim()) {
          const scored = mappedList.map((course) => ({
            ...course,
            semanticScore: computeStrictSemanticScore(query, course),
          }));

          const maxScore = Math.max(0, ...scored.map((c) => c.semanticScore));

          if (maxScore > 0) {
            // Keep items that meet base threshold (>= 0.20) and relative cutoff (>= 40% of maxScore)
            const matched = scored.filter(
              (c) => c.semanticScore >= 0.20 && c.semanticScore >= maxScore * 0.4
            );
            mappedList = matched.sort((a, b) => b.semanticScore - a.semanticScore);
          } else {
            mappedList = [];
          }
        }

        // Apply user-selected sort option
        if (sortOption === 'price_asc') {
          mappedList.sort((a: any, b: any) => (a.salePrice || a.price) - (b.salePrice || b.price));
        } else if (sortOption === 'price_desc') {
          mappedList.sort((a: any, b: any) => (b.salePrice || b.price) - (a.salePrice || a.price));
        } else if (sortOption === 'newest') {
          mappedList.sort((a: any, b: any) => (Number(b.id) || 0) - (Number(a.id) || 0));
        } else if (sortOption === 'rating') {
          mappedList.sort((a: any, b: any) => b.rating - a.rating);
        }

        if (isMounted) {
          setFilteredCourses(mappedList);
        }
      } catch (err) {
        console.warn('Search API error, fallback:', err);
        let fallback = INITIAL_COURSES;
        if (query) {
          const scored = fallback.map((c) => ({
            ...c,
            semanticScore: computeStrictSemanticScore(query, c),
          }));
          const maxScore = Math.max(0, ...scored.map((c) => c.semanticScore));
          fallback = scored
            .filter((c) => c.semanticScore >= 0.35 && c.semanticScore >= maxScore * 0.5)
            .sort((a, b) => b.semanticScore - a.semanticScore);
        }
        if (isMounted) setFilteredCourses(fallback);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSearchResults();
    return () => {
      isMounted = false;
    };
  }, [query, sortOption]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    } else {
      navigate(`/search`);
    }
  };

  const handleCourseClick = (course: any, index: number) => {
    if (query && course?.courseIdRaw) {
      semanticSearchApi.trackSearchClick({
        course_id: course.courseIdRaw,
        query: query,
        position: index + 1,
      });
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Clean Standard Search Header */}
        <div className="mb-8 border-b pb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input 
                className="pl-12 h-12 rounded-2xl text-lg bg-muted shadow-none border-transparent focus-visible:ring-primary/20"
                placeholder="Tìm kiếm khoá học, kỹ năng, giảng viên..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="rounded-2xl h-12 px-8">
              Tìm kiếm
            </Button>
          </form>
          
          <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {query ? (
                <h1 className="text-xl font-bold">
                  Hiển thị {filteredCourses.length} kết quả cho "{query}"
                </h1>
              ) : (
                <h1 className="text-xl font-bold">Khám phá tất cả khóa học</h1>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="gap-2 rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4" /> 
                Bộ lọc
              </Button>
              <div className="relative">
                <select 
                  className="appearance-none bg-background border rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="relevant">Liên quan nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="price_asc">Giá: Thấp đến cao</option>
                  <option value="price_desc">Giá: Cao đến thấp</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          {isFilterOpen && (
            <div className="w-full md:w-64 shrink-0 space-y-6">
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Danh mục
                </h3>
                <div className="space-y-2">
                  {['Lập trình Web', 'Trí tuệ nhân tạo', 'Thiết kế', 'Kinh doanh'].map((cat, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-lg">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary/20" />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-3">Mức độ</h3>
                <div className="space-y-2">
                  {['Tất cả', 'Người mới bắt đầu', 'Trung cấp', 'Chuyên gia'].map((level, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-lg">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary/20" />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Results Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <EmptyState 
                icon={Search}
                title="Không tìm thấy kết quả"
                description={`Chúng tôi không tìm thấy khóa học nào phù hợp với từ khóa "${query}". Hãy thử lại với từ khóa khác.`}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <div key={course.id} onClick={() => handleCourseClick(course, index)}>
                    <CourseCard course={course as any} />
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {filteredCourses.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled>Trước</Button>
                  <Button variant="default" size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">Sau</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
