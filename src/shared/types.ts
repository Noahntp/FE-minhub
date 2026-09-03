export type Role = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  avatar: string;
  avatar_url?: string;
  role: Role;
  streak: number;
  lastActiveDate: string;
  bio?: string;
  title?: string;
  phone?: string;
  expertise?: string;
  experienceYears?: string;
  portfolioUrl?: string;
  dob?: string;
  address?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  roleRequestStatus?: 'none' | 'pending_instructor' | 'pending_admin' | 'approved' | 'rejected' | 'pending_leave_instructor';
  status?: 'active' | 'locked' | 'suspended';
  verificationOtp?: string;
  interestedTopics: string[];
  notificationSettings: {
    email: boolean;
    push: boolean;
    app: boolean;
    scheduleReminders: boolean;
  };
  payoutInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    balance: number;
  };
  isTwoFactorEnabled?: boolean;
  activeSessions?: { id: string; device: string; os: string; browser: string; ip: string; lastActive: string; isCurrent: boolean }[];
  recoveryCodes?: string[];
  lastPasswordChange?: string;
}

export interface SendPasswordOtpPayload {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
  otp: string;
}

export interface UserSession {
  id: string;
  device: string;
  platform: string;
  ipAddress: string | null;
  lastActivityAt: string;
  isCurrent: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'students_only';
  showEmail: boolean;
  showPhone: boolean;
  showSocialLinks: boolean;
  allowMessages: boolean;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  size: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
  dueDate: string;
}

export interface Lesson {
  id: number | string;
  title: string;
  type: 'video' | 'quiz' | 'assignment' | 'doc';
  lesson_type?: 'video' | 'quiz' | 'assignment' | 'doc';
  duration: string; // e.g. "12:30" or "5 Qs"
  video_duration_seconds?: number;
  videoUrl?: string;
  video_url?: string;
  stream_url?: string;
  streamUrl?: string;
  isPreview?: boolean;
  is_preview?: boolean;
  quiz?: Quiz;
  assignment?: Assignment;
  resources?: Resource[];
  content?: string; // markdown or text content
  docContent?: string; // Word document raw text content
  qualities?: { label: string; url: string; }[];
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  q?: string;
  a?: string;
}

export interface Course {
  id: string;
  title: string;
  slug?: string;
  level?: string;
  language?: string;
  introVideoUrl?: string;
  subtitle: string;
  description: string;
  category: string;
  subcategory: string;
  instructorId: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  instructorBio: string;
  price: number;
  salePrice?: number | null;
  originalPrice?: number | null;
  discount_percent?: number | null;
  discountPercent?: number | null;
  has_discount?: boolean;
  hasDiscount?: boolean;
  campaign_type?: 'discount' | 'trial' | null;
  has_trial?: boolean;
  hasTrial?: boolean;
  isTrial?: boolean;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  completionRate: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  image: string;
  chapters: Chapter[];
  reviews?: CourseReview[];
  faqs?: FAQItem[];
  requirements?: string[];
  willLearn?: string[];
  status: 'draft' | 'pending' | 'active' | 'rejected' | 'hidden' | 'archived' | 'suspended' | 'published' | 'approved';
  is_enrolled?: boolean;
  isEnrolled?: boolean;
  enrollment_status?: string;
  rawStatus?: string;
  statusLabel?: string;
  category_id?: number | string;
  rejectionReason?: string;
  isHidden?: boolean;
  allowSkip?: boolean;
  allowDownload?: boolean;
  allowDiscussion?: boolean;
  giveCertificate?: boolean;
  createdAt?: string;
  updatedAt?: string;
  allowFreeDoc?: boolean;
  allowFreeVideo?: boolean;
  freeVideoDuration?: number; // duration in seconds
}

export interface CartItem {
  courseId: string;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  courses: { id: string; title: string; price: number }[];
  discountAmount: number;
  total: number;
  status: 'success' | 'pending' | 'failed';
  paymentMethod: string;
}

export interface PackageOrder {
  id: string;
  order_code: string;
  amount: number;
  package_snapshot_name: string;
  package_snapshot_credits: number;
  status: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reminder';
  date: string;
  read: boolean;
  targetCourseId?: string;
}

export interface Coupon {
  code: string;
  discount: number;
  description: string;
  targetCourseId?: string;
}

export interface StudentProgress {
  courseId: string;
  currentLessonId: string | number;
  completedLessonIds: (string | number)[];
  notes: { id: string; lessonId: string | number; text: string; timestamp?: string; timestampSec?: number }[];
  bookmarks: { id: string; lessonId: string | number; title: string; timestampSec: number }[];
  lastWatchedProgressSec: number; // e.g. 124s
}

export interface UserCertificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  verificationCode: string;
}

export interface MentorMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface QAMessage {
  id: string;
  userName: string;
  userAvatar: string;
  userRole: Role;
  text: string;
  timestamp: string;
  replies?: QAMessage[];
}

export interface CourseAnswer {
  id: string;
  questionId: string;
  authorId: string;
  content: string;
  isInstructorAnswer: boolean;
  isAdminAnswer: boolean;
  createdAt: string;
  author?: {
    name: string;
    avatar: string;
    role: Role;
  };
}

export interface CourseQuestion {
  id: string;
  courseId: string;
  authorId: string;
  content: string;
  isInternal: boolean;
  lessonId: string | null;
  status: 'open' | 'answered' | 'hidden';
  createdAt: string;
  author?: {
    name: string;
    avatar: string;
    role: Role;
  };
  answers?: CourseAnswer[];
}

export interface FlaggedItem {
  id: string;
  type: 'review' | 'comment' | 'course_content';
  content: string;
  reason: string;
  reporter: string;
  status: 'pending' | 'resolved' | 'dismissed';
  courseId?: string;
  courseTitle?: string;
}

export interface PayoutRequest {
  id: string;
  instructorId: string;
  instructorName: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  timestamp: string;
  details: string;
}

export interface AccountRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'lock' | 'delete';
  reason: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  actionText: string;
  actionUrl?: string;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export function normalizeUser(user: any): User {
  if (!user || typeof user !== 'object') {
    return {
      id: 'u-guest',
      name: 'Khách Ghé Thăm',
      email: 'guest@mindhub.edu.vn',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Guest',
      role: 'student',
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      interestedTopics: [],
      notificationSettings: {
        email: true,
        push: true,
        app: true,
        scheduleReminders: true
      }
    };
  }
  
  const name = user.name || user.full_name || user.username || 'User';
  
  let interestedTopics = user.interestedTopics || [];
  if (typeof interestedTopics === 'string') {
    try {
      interestedTopics = JSON.parse(interestedTopics);
    } catch {
      interestedTopics = [];
    }
  }
  if (!Array.isArray(interestedTopics)) {
    interestedTopics = [];
  }

  let notificationSettings = user.notificationSettings;
  if (typeof notificationSettings === 'string') {
    try {
      notificationSettings = JSON.parse(notificationSettings);
    } catch {
      notificationSettings = null;
    }
  }
  if (!notificationSettings || typeof notificationSettings !== 'object') {
    notificationSettings = {
      email: true,
      push: true,
      app: true,
      scheduleReminders: true
    };
  }

  let role = user.role || 'student';
  if (role === 'learner') {
    role = 'student';
  }

  const avatar = user.avatar || user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
  const streak = typeof user.streak === 'number' ? user.streak : 0;
  const lastActiveDate = user.lastActiveDate || new Date().toISOString().split('T')[0];

  return {
    ...user,
    id: String(user.id),
    name,
    avatar,
    role,
    streak,
    lastActiveDate,
    interestedTopics,
    notificationSettings
  };
}

export interface InstructorRequest {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  expertise: string;
  experienceYears: string;
  portfolioUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface CourseCreditPackage {
  id: string;
  name: string;
  description?: string;
  credits: number;
  price: number;
  status: 'active' | 'inactive';
  sort_order: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface DbOrder {
  id: string;
  order_type: 'instructor_credit' | 'course_purchase';
  coupon_id?: string | null;
  course_id?: string | null;
  credit_package_id?: string | null;
  package_snapshot_name?: string | null;
  package_snapshot_credits?: number | null;
  user_id: string;
  order_code: string;
  status: 'pending' | 'paid' | 'cancelled' | 'failed' | 'expired';
  price_snapshot: number;
  payment_method?: string | null;
  provider_transaction_id?: string | null;
  amount: number;
  payment_status: 'unpaid' | 'processing' | 'paid' | 'failed';
  paid_at?: string | null;
  created_at: string;
  updated_at?: string;

  // relations
  package?: CourseCreditPackage | null;
}

export interface InstructorCourseCredit {
  id: string;
  instructor_id: string;
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
  created_at: string;
  updated_at?: string;
}

export interface InstructorCreditTransaction {
  id: string;
  instructor_id: string;
  order_id?: string | null;
  course_id?: string | null;
  type: 'purchase' | 'use' | 'refund' | 'adjust';
  credits: number;
  balance_before: number;
  balance_after: number;
  note?: string | null;
  created_at: string;
  updated_at?: string;

  // relations
  order?: { order_code: string; package_snapshot_name: string; amount: number } | null;
  course?: { title: string } | null;
}

export interface InstructorCourseSummary {
  total: number;
  published: number;
  draft: number;
  pending_review: number;
  rejected: number;
  approved: number;
  hidden: number;
}

export interface InstructorEnrollmentSummary {
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
}

export interface InstructorRevenueSummary {
  gross_amount_this_month: string;
  instructor_amount_this_month: string;
  platform_fee_this_month: string;
}

export interface InstructorWithdrawSummary {
  available_revenue: string;
  pending_withdraw_amount: string;
  available_balance: string;
}

export interface InstructorDashboardOverview {
  course_summary: InstructorCourseSummary;
  enrollment_summary: InstructorEnrollmentSummary;
  revenue_summary: InstructorRevenueSummary;
  withdraw_summary: InstructorWithdrawSummary;
  interaction_summary: {
    unanswered_questions: number;
  };
  filters: {
    date_from: string;
    date_to: string;
  };
}

export interface RevenueChartPoint {
  period: string;
  gross_amount: string;
  instructor_amount: string;
  platform_fee_amount: string;
}

export interface EnrollmentChartPoint {
  period: string;
  enrollment_count: number;
  completed_count: number;
}

export interface InstructorTopCourse {
  course_id: number;
  title: string;
  status: string;
  enrollment_count: number;
  unique_learner_count: number;
}

export interface InstructorUnansweredQuestion {
  id: number;
  comment_id: number;
  content: string;
  status: string;
  is_answered: boolean;
  status_label: string;
  created_at: string;
  learner: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string | null;
  };
  course: {
    id: number;
    title: string;
  };
  lesson: {
    id: number;
    title: string;
  };
  reply_count: number;
  instructor_reply_count: number;
  answer_count: number;
}

export interface InstructorIncompleteCourse {
  id: number;
  title: string;
  status: string;
  missing_items?: string[];
  warnings?: string[];
}

export interface InstructorDashboardAlert {
  type: string;
  title: string;
  message: string;
  created_at: string;
  action_url?: string | null;
  read_at?: string | null;
}
