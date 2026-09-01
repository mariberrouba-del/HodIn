// Shared Types for HodInt Platform

export enum UserRole {
  FOUNDER = "FOUNDER", // المؤسس (صلاحيات إدارية كاملة للمحتوى والأقسام)
  MANAGER = "MANAGER", // المدير العام
  SUPERVISOR = "SUPERVISOR", // مشرف المنصة
  EXPERT = "EXPERT", // خبير فلاحي
  COMPANY = "COMPANY", // حساب شركة
  FARMER = "FARMER", // حساب فلاح
  STUDENT = "STUDENT", // حساب طالب
  WORKER = "WORKER", // حساب عامل أو مقدم خدمة
  ADMIN = "ADMIN" // للموافقة مع الكود السابق
}

export interface CategoryItem {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon?: string;
  description?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ContentType = "article" | "guide" | "lesson" | "announcement" | "alert" | "crop_guide";
export type ContentStatus = "draft" | "published" | "archived";

export interface ContentItem {
  id: string;
  title: string;
  slug?: string;
  description: string; // Summary or excerpt
  body: string; // Detailed content / text
  categoryId: string;
  categoryName?: string;
  type: ContentType;
  status?: ContentStatus; // draft | published | archived
  imageUrl?: string;
  author: string;
  authorId?: string;
  authorRole?: string;
  isPublished: boolean;
  isFeatured?: boolean;
  tags?: string[];
  createdBy?: {
    uid: string;
    name: string;
    email?: string;
    role?: string;
  } | string;
  updatedBy?: {
    uid: string;
    name: string;
    email?: string;
    role?: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  location?: string;
  // Specific role fields
  companyName?: string; // For Company
  academicYear?: string; // For Student
  specialty?: string; // For Student / Expert (التخصص الأكاديمي)
  agriculturalField?: string; // For Student / Farmer (المجال الزراعي)
  institution?: string; // For Student / Expert (e.g. University of El Oued)
  bio?: string;
  joinedAt?: string;
}

export type CourseLevel = "beginner" | "intermediate" | "advanced" | "all";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface LessonQuiz {
  id?: string;
  title?: string;
  passingScore?: number;
  questions: QuizQuestion[];
}

export interface Lesson {
  id: string;
  courseId?: string;
  moduleId?: string;
  title: string;
  content?: string; // Detailed educational text & scientific explanations
  description?: string;
  imageUrl?: string;
  videoUrl?: string; // YouTube, direct or embed video
  pdfUrl?: string; // PDF manual / reference
  attachmentName?: string;
  attachmentSize?: string;
  documents?: { title: string; size: string; downloadUrl: string; type?: string }[];
  references?: string[]; // Scientific links & books
  duration?: string; // e.g. "15 دقيقة"
  order: number;
  isCompleted?: boolean;
  isFree?: boolean; // Preview free lesson vs premium locked
  quiz?: LessonQuiz; // Extensible quiz structure
}

export interface CourseModule {
  id: string;
  courseId?: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  thumbnail: string;
  shortDescription?: string;
  description: string;
  category: "crops" | "irrigation" | "machinery" | "soil" | "sustainability" | string;
  level?: CourseLevel | string; // مبتدئ / متوسط / متقدم
  duration: string;
  lessonsCount: number;
  instructor: string;
  instructorRole?: string;
  institution?: string; // الجامعة أو الجهة e.g. جامعة الشهيد حمه لخضر - الوادي
  modules?: CourseModule[];
  videoUrl?: string;
  documents?: { title: string; size: string; downloadUrl: string }[];
  isPremium?: boolean;
  price?: number; // Subscription price in DZD
  status: ContentStatus; // draft | published | archived
  createdBy?: {
    uid: string;
    name: string;
    email?: string;
  } | string;
  updatedBy?: {
    uid: string;
    name: string;
    email?: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseProgress {
  id: string; // `${userId}_${courseId}`
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  lastLessonId?: string;
  lastLessonTitle?: string;
  lastModuleId?: string;
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: string;
  startedAt?: string;
  updatedAt: string;
}

export interface CourseCertificate {
  id: string;
  certificateNumber: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  institution: string;
  instructor: string;
  issuedAt: string;
  grade?: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  itemType: "article" | "course" | "product" | "service";
  itemId: string;
  title: string;
  category?: string;
  imageUrl?: string;
  description?: string;
  authorOrInstructor?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: "create" | "update" | "delete" | "publish" | "unpublish" | "archive" | "role_change" | "status_change";
  entityType: "article" | "course" | "category" | "price" | "product" | "service" | "user" | "weather";
  entityId: string;
  entityTitle: string;
  performedBy: {
    uid: string;
    name: string;
    email?: string;
    role?: string;
  };
  details?: string;
  timestamp: string;
}

export interface StudentNotification {
  id: string;
  userId?: string; // "all" or specific userId
  title: string;
  message: string;
  type: "info" | "course" | "alert" | "system";
  date: string;
  isRead?: boolean;
  linkTab?: string;
}

export interface Product {
  id: string;
  companyName?: string;
  title?: string;
  name?: string;
  category: "seeds" | "fertilizers" | "pesticides" | "irrigation" | "tools" | "machinery" | string;
  type?: "buy" | "rent" | string;
  price: number | string; // in DZD (دينار جزائري)
  unit?: string; // e.g. "كيس", "لتر", "ساعة", "يوم"
  description: string;
  phone: string;
  location?: string;
  imageUrl: string;
  isAvailable?: boolean;
  sellerName?: string;
  inStock?: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  specialty: "technician" | "irrigation" | "consultant" | "laborer" | string;
  experience: number; // years
  rating: number;
  phone: string;
  location: string; // Municipalities in El Oued (e.g. El Oued, Robbah, Guemar, Kouinine)
  description: string;
  isVerified: boolean;
}

export interface MarketPrice {
  id: string;
  nameAr?: string;
  nameEn?: string;
  category?: "vegetables" | "fruits" | string;
  currentPrice?: number; // in DZD/kg
  yesterdayPrice?: number;
  trend?: "up" | "down" | "stable";
  icon?: string;
  crop?: string;
  market?: string;
  wholesalePrice?: number;
  retailPrice?: number;
  unit?: string;
  date?: string;
}

export interface WeatherAlert {
  id: string;
  type: "heatwave" | "sirocco" | "frost" | "humidity" | "wind";
  titleAr: string;
  titleEn: string;
  severity: "info" | "warning" | "danger";
  descriptionAr: string;
  descriptionEn: string;
  date: string;
}

export interface CropRotationRecommendation {
  cropNameAr: string;
  seasonAr: string;
  previousCropAr: string;
  nextBestCropsAr: string[];
  tipsAr: string;
}
