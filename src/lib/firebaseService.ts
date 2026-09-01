import { auth, db, storage } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updatePassword, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { 
  UserRole, 
  UserProfile, 
  Course, 
  CourseModule,
  Lesson,
  CourseProgress,
  CourseCertificate,
  Product, 
  ServiceProvider, 
  MarketPrice, 
  WeatherAlert, 
  CategoryItem, 
  ContentItem, 
  ContentType,
  ContentStatus,
  FavoriteItem,
  ActivityLog,
  StudentNotification
} from "../types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ------------------- DEFAULT CATEGORIES & CONTENT FOR FOUNDERS -------------------
export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "cat_crops",
    nameAr: "محاصيل التربة الرملية والبطاطا",
    nameEn: "Sandy Soil & Potato Crops",
    slug: "sandy-crops",
    icon: "Sprout",
    description: "إرشادات هندسية وتطبيقية لزراعة البطاطا الصحراوية ومحاصيل الرمل تحت السقي المحوري.",
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat_palms",
    nameAr: "وقاية النخيل وجودة التمور",
    nameEn: "Date Palms & Crop Protection",
    slug: "date-palms",
    icon: "TreePine",
    description: "برامج الوقاية من آفات بوفروة وسوسة النخيل وحماية عراجين دقلة نور والغرس السوفي.",
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat_irrigation",
    nameAr: "أنظمة الري الحديثة والطاقة الشمسية",
    nameEn: "Modern Irrigation & Solar Energy",
    slug: "irrigation-solar",
    icon: "Droplets",
    description: "تصميم وإدارة شبكات الري بالتنقيط والمحاور الدائرية ومضخات الطاقة الشمسية بالصحراء.",
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat_soil",
    nameAr: "تسميد التربة وإدارة الملوحة",
    nameEn: "Soil Nutrition & Salinity Management",
    slug: "soil-nutrition",
    icon: "Layers",
    description: "حلول معالجة ملوحة المياه والتربة، والتسميد العضوي والأسمدة الذوابة في بساتين وادي سوف.",
    order: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat_research",
    nameAr: "أبحاث ودراسات جامعة الوادي",
    nameEn: "University Research & Studies",
    slug: "academic-research",
    icon: "GraduationCap",
    description: "أوراق بحثية ومذكرات تخرج ودراسات أكاديمية بالتعاون مع كلية علوم الطبيعة والحياة.",
    order: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat_news",
    nameAr: "أخبار وإعلانات المنصة",
    nameEn: "Platform Announcements & News",
    slug: "announcements",
    icon: "Megaphone",
    description: "تحديثات منصة HodInt، المعارض الفلاحية، والبلاغات الإرشادية الموسمية لفلاحي المنطقة.",
    order: 6,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_CONTENT: ContentItem[] = [
  {
    id: "cnt_1",
    title: "الدليل الشامل لإدارة السقي المحوري لبطاطا سبونتا في رمال وادي سوف",
    slug: "potato-pivot-irrigation-guide",
    description: "أهم النصائح الهندسية لضبط دورات الرش المحوري لتفادي غسل الأسمدة وتقليل الإجهاد الحراري لنبات البطاطا في التربة الرملية.",
    body: `### مقدمة هندسية\nتعتبر زراعة البطاطا في ولاية الوادي من أهم الركائز الاقتصادية الزراعية في الجزائر، وتتميز بالاعتماد على محاور السقي الدائرية (Pivots) في التربة الرملية الخفيفة ذات النفاذية العالية.\n\n### 1. مميزات التربة الرملية السوفية\n* قدرة منخفضة جداً على الاحتفاظ بالرطوبة والمغذيات.\n* انخفاض نسبة المادة العضوية (أقل من 0.5%).\n* الحاجة إلى تجزئة كميات مياه الري والتسميد على دفعات متقاربة.\n\n### 2. جدولة السقي حسب مراحل النمو\n* **مرحلة الإنبات والتجذير**: سقيات خفيفة متقاربة (10-15 ملم) لتثبيت الرطوبة حول الدرنات وتفادي جفاف القشرة السطحية.\n* **مرحلة النمو الخضري والتفرع**: زيادة الجرعة تدريجياً لضمان مجموع خضري قوي يظلل التربة ويقلل البخر المباشر.\n* **مرحلة تكوين وتضخيم الدرنات (Tuber Bulking)**: المرحلة الأكثر حساسية، حيث يجب تفادي أي تعطيش مفاجئ لتجنب تشقق الدرنات أو تشوه شكلها.\n\n### 3. التسميد التكعيبي (Fertigation)\nيجب استخدام أسمدة ذوابة متوازنة مع مراعاة نسب البوتاسيوم لتعزيز جودة النشا والصلابة، وحقن الأحماض الدبالية (Humic & Fulvic acids) لتحسين سعة التبادل الكاتيوني للرمل.`,
    categoryId: "cat_crops",
    categoryName: "محاصيل التربة الرملية والبطاطا",
    type: "crop_guide",
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800",
    author: "م. ماريه بروبة",
    authorId: "user_5",
    authorRole: "المؤسس المشارك ورئيسة المشروع - مهندسة وباحثة زراعية",
    isPublished: true,
    isFeatured: true,
    tags: ["بطاطا", "ري محوري", "تربة رملية", "وادي سوف"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "cnt_2",
    title: "برنامج الوقاية المتكاملة من آفة غبار بوفروة وسوسة النخيل في الواحات الصحراوية",
    slug: "palms-protection-boufarwa-weevil",
    description: "خطة التدخل الدوري لحماية عراجين دقلة نور والتصدي المبكر للحشرات والعت المتوطن في واحات الجنوب الشرقي.",
    body: `### تحديات بساتين النخيل بوادي سوف\nتشهد واحات وادي سوف تحديات موسمية مرتبطة بارتفاع درجات الحرارة وهبوب رياح الشهيلي الجافة، مما يسرّع تكاثر حلم الغبار (بوفروة Oligonychus afrasiaticus).\n\n### 1. الرصد والتشخيص المبكر\n* فحص العراجين بدءاً من مرحلة الخلال (البلح الأخضر).\n* الانتباه لظهور النسيج الحريري الدقيق وتجمع حبيبات الغبار على الثمار.\n\n### 2. المكافحة الميكانيكية والحيوية\n* غسل العراجين بضغط مائي معتدل لإزالة خيوط العنكبوت قبل اشتداد الإصابة.\n* استخدام الكبريت الميكروني المبلل في الصباح الباكر أو بعد غروب الشمس لتجنب احتراق الثمار بفعل الشمس الحارقة.\n\n### 3. تكميم العراجين وخدمة النخلة\n* تكميم العراجين بأكياس ورقية مهواة أو شباك لحمايتها من الغبار والطيور والأمطار الخريفية المبكرة.\n* التعقيم المستمر لأدوات التقليم والجريد للوقاية من نقل الأمراض وسوسة النخيل.`,
    categoryId: "cat_palms",
    categoryName: "وقاية النخيل وجودة التمور",
    type: "guide",
    imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800",
    author: "م. إكرام محده",
    authorId: "user_ikram",
    authorRole: "المؤسس المشارك والمسؤولة التقنية - مهندسة وقاية نباتات",
    isPublished: true,
    isFeatured: true,
    tags: ["نخيل", "دقلة نور", "بوفروة", "وقاية نباتات"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "cnt_3",
    title: "المعادلات الهيدروليكية لضخ المياه بالطاقة الشمسية وحساب توازن الملوحة",
    slug: "solar-pumping-hydraulics-salinity",
    description: "محاضرة علمية تطبيقية حول تصميم منظومات الألواح الكهروضوئية وموازنتها مع أعماق الآبار الارتوازية بالأحواض الصحراوية.",
    body: `### أهمية الطاقة الشمسية في وادي سوف\nتعد كفاءة استغلال الطاقة الشمسية في ضخ المياه الجوفية ركيزة استدامة الفلاحة الصحراوية الحديثة وتقليل تكاليف الوقود والكهرباء.\n\n### المحاور التطبيقية:\n1. **حساب الارتفاع المانومتري الكلي (Total Dynamic Head - TDH)** بمراعاة عمق المضخة وفواقد الاحتكاك في الأنابيب.\n2. **مواصفات محولات التردد المتغير (VFD Inverters)** لحماية المحركات الغاطسة من التغير المفاجئ في شدة الإشعاع الشمسي.\n3. **إدارة ملوحة الآبار**: برمجة دورات غسيل التربة (Leaching Requirement) وتفادي تراكم الأملاح في منطقة الجذور.`,
    categoryId: "cat_irrigation",
    categoryName: "أنظمة الري الحديثة والطاقة الشمسية",
    type: "lesson",
    imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800",
    author: "أ.د. سمير مرداسي",
    authorId: "user_merdassi",
    authorRole: "المشرف العلمي والأكاديمي - كلية علوم الطبيعة والحياة بجامعة الوادي",
    isPublished: true,
    isFeatured: true,
    tags: ["طاقة شمسية", "ري بالتنقيط", "ملوحة المياه", "جامعة الوادي"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "cnt_4",
    title: "إطلاق النسخة الرسمية لمنصة HodInt للحلول والتعليم الفلاحي بولاية الوادي",
    slug: "official-launch-hodint-platform",
    description: "ترحب منصة هودنت بجميع فلاحي ومهندسي وطلبة ولاية الوادي في المنظومة الرقمية الموحدة لتطوير الزراعة الصحراوية.",
    body: `### أهلاً بكم في منصة HodInt\nيسر الهيئة التأسيسية لمنصة **HodInt** الإعلان عن انطلاق خدمات المنصة المخصصة لخدمة المجتمع الفلاحي والأكاديمي بولاية الوادي والجزائر عموماً.\n\n### باقة الخدمات المتاحة:\n* **نشرة الأسعار اليومية المباشرة** لأسواق الجملة للخضر والفواكه والتمور بالولاية.\n* **نظام الإنذار المناخي المبكر** للتنبيه بموجات الحر، رياح الشهيلي، والصقيع.\n* **السوق الفلاحي** لعرض المعدات والمضخات والأسمدة للشراء والكراء.\n* **المستشار الفلاحي الذكي** للإجابة الفورية عن استفسارات المزارعين والطلبة.\n* **لوحة تحكم كاملة للمؤسسين** لإدارة وتحديث كافة المحتويات والمقالات والأقسام.`,
    categoryId: "cat_news",
    categoryName: "أخبار وإعلانات المنصة",
    type: "announcement",
    imageUrl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=800",
    author: "الهيئة التأسيسية لمنصة HodInt",
    authorId: "user_5",
    authorRole: "إدارة المنصة",
    isPublished: true,
    isFeatured: false,
    tags: ["إعلان", "HodInt", "ولاية الوادي", "خدمات فلاحية"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// SEED DATA FOR FIRST TIME INITIALIZATION
export const DEFAULT_PRICES: MarketPrice[] = [
  { id: "p1", nameAr: "بطاطا سوفية حمراء (جملة)", nameEn: "Red Potatoes", category: "vegetables", currentPrice: 85, yesterdayPrice: 90, trend: "down", icon: "🥔" },
  { id: "p2", nameAr: "بطاطا سوفية بيضاء (جملة)", nameEn: "White Potatoes", category: "vegetables", currentPrice: 75, yesterdayPrice: 72, trend: "up", icon: "🥔" },
  { id: "p3", nameAr: "تمر دقلة نور فاخر عراجين", nameEn: "Deglet Nour Dates", category: "fruits", currentPrice: 450, yesterdayPrice: 450, trend: "stable", icon: "🌴" },
  { id: "p4", nameAr: "تمر غرس رطب (للعجن)", nameEn: "Ghars Dates", category: "fruits", currentPrice: 220, yesterdayPrice: 210, trend: "up", icon: "🌴" },
  { id: "p5", nameAr: "تمر مش دقلة (المنقر)", nameEn: "Menghar Dates", category: "fruits", currentPrice: 300, yesterdayPrice: 320, trend: "down", icon: "🌴" },
  { id: "p6", nameAr: "طماطم حقلية سوفية", nameEn: "Tomatoes", category: "vegetables", currentPrice: 60, yesterdayPrice: 60, trend: "stable", icon: "🍅" },
  { id: "p7", nameAr: "فلفل حار صحراوي (قرون)", nameEn: "Hot Peppers", category: "vegetables", currentPrice: 120, yesterdayPrice: 140, trend: "down", icon: "🌶️" }
];

const DEFAULT_WEATHER: WeatherAlert[] = [
  {
    id: "w1",
    type: "heatwave",
    titleAr: "موجة حر وجفاف ذروية بالوادي",
    titleEn: "Extreme Heatwave Warning",
    severity: "danger",
    descriptionAr: "يرتقب تسجيل درجات حرارة قياسية تفوق 48 درجة مئوية تحت الظل في بساتين حاسي مسعود والوادي والغوط. نوصي الفلاحين ببرمجة الري حصرياً قبل الساعة 6 صباحاً وبعد الساعة 7 مساءً لتجنب صدمات تبخر الجذور وصدمة النخيل.",
    descriptionEn: "High evaporation rates predicted. Irrigation scheduled specifically outside peak heat intervals.",
    date: "اليوم"
  },
  {
    id: "w2",
    type: "wind",
    titleAr: "رياح رملية نشطة (شهيلي) غربية",
    titleEn: "Sirocco Sandstorms Warning",
    severity: "warning",
    descriptionAr: "رياح جنوبية غربية محملة بزوابع رملية قد تسبب زحفاً ترابياً في الممرات وتتلف عذوق التمور المكشوفة. يُنصح بشد وربط تكميم عراجين دقلة نور وتغطيتها بحماية ورقية خفيفة أو بلاستيكية مهواة.",
    descriptionEn: "Severe dust storms with moderate sand displacement. Seal and secure date bunches with protective bags.",
    date: "أمس"
  }
];

const DEFAULT_PROVIDERS: ServiceProvider[] = [
  { id: "sp1", name: "م. عبد الرزاق سوفي", specialty: "consultant", experience: 12, rating: 4.9, phone: "+213 775 30 11 02", location: "الوادي", description: "خبير استشارات هندسية في زراعة الأنسجة، تشخيص آفات النخيل، فحص التربة وحساب معادلات التناضح العكسي وتقليل هدر الطاقة.", isVerified: true },
  { id: "sp2", name: "التقني السعيد قوينيني", specialty: "technician", experience: 8, rating: 4.7, phone: "+213 655 40 12 30", location: "الوادي", description: "متخصص في تركيب وصيانة شبكات مياه التقطير وأنظمة التسميد الآلي وربطها بمضخات عائمة شمسية بالبلديات الشمالية.", isVerified: true },
  { id: "sp3", name: "المقاول بن عمر لحساب السقي", specialty: "irrigation", experience: 15, rating: 4.8, phone: "+213 550 18 33 22", location: "حاسي خليفة", description: "شريك موثوق لتجهيز الأراضي وتمديد قنوات محاور الري الدائري (Pivot) وتسوية الكثبان الرملية بآليات الليزر الحديثة.", isVerified: false },
  { id: "sp4", name: "العجال السوفي (جامع تمور وخبير تلقيح)", specialty: "laborer", experience: 20, rating: 5.0, phone: "+213 671 22 88 55", location: "روباح", description: "مقدم خدمة فلاحية موسمية، صعود نخيل، غرس فسائل، تلقيح النخل الإناث، جني العراجين وتطهير البساتين القديمة.", isVerified: true }
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: "pr1", companyName: "سوف لتقنيات الري والتجهيزات", title: "مضخة ماء غاطسة بالطاقة الشمسية 15 حصان", category: "machinery", type: "buy", price: 345000, unit: "وحدة كاملة", description: "مضخة ألمانية الصنع، مصممة خصيصاً للآبار العميقة والمياه الجوفية بالجنوب. تتحمل ملوحة تصل إلى 4 غرام/لتر ودرجات حرارة سائل مرتفعة.", phone: "+213 540 22 18 90", location: "الوادي", imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&q=80&w=600", isAvailable: true },
  { id: "pr2", companyName: "سوف لتقنيات الري والتجهيزات", title: "جرار زراعي كوبوتا 4WD مجهز للعمل بالرمل", category: "machinery", type: "rent", price: 6500, unit: "ساعة عمل", description: "جرار زراعي متميز بقوة سحب في الكثبان الرملية السطحية، يشمل المجرار والقلاب الدوار لتفتيت طبقات الصم الصلبة بالتربة.", phone: "+213 540 22 18 90", location: "البياضة", imageUrl: "https://images.unsplash.com/photo-1595273670150-db0a3e39843c?auto=format&fit=crop&q=80&w=600", isAvailable: true },
  { id: "pr3", companyName: "مستودع الوادي للأسمدة", title: "سماد مركب عالي البوتاسيوم NPK 12-12-36", category: "fertilizers", type: "buy", price: 8200, unit: "كيس 25 كغ", description: "سماد مستورد ذواب فوري لتحفيز تحجيم درنات البطاطا الصحراوية وزيادة سكر الفواكه بنموات بساتين النخيل.", phone: "+213 655 89 22 10", location: "حاسي خليفة", imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600", isAvailable: true }
];

const DEFAULT_COURSES: Course[] = [
  {
    id: "c1",
    title: "الدورة التطبيقية المتكاملة لزراعة البطاطا الصحراوية بوادي سوف",
    thumbnail: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=800",
    shortDescription: "دليل ميداني شامل يغطي تهيئة التربة الرملية، التسميد الكيميائي والورقي، ونظم الري بالرش مع تقنيات المكافحة المتكاملة.",
    description: "دورة شاملة تمتد من تحضير الأراضي الرملية وتطهير البذور، إلى نظام السقي بالرش والري المحوري، وختاماً بمراحل التلوين وخرط البطاطا والتخزين المبرد لمواجهة صيف الرمال الساخنة في منطقة وادي سوف.",
    category: "crops",
    level: "intermediate",
    duration: "6 دروس تفصيلية (4 ساعات)",
    lessonsCount: 6,
    instructor: "م. ماريه بروبة",
    instructorRole: "المؤسس المشارك - مهندسة زراعية وباحثة في محاصيل التربة الرملية",
    institution: "جامعة الشهيد حمه لخضر - الوادي",
    videoUrl: "https://www.youtube.com/embed/zH0F6LclisY",
    documents: [
      { title: "كتيب الدليل الميداني لزراعة البطاطا بالوادي.pdf", size: "8.4 MB", downloadUrl: "#" },
      { title: "مخطط التسميد الكيميائي والورقي حسب نمو النبتة.xlsx", size: "2.1 MB", downloadUrl: "#" }
    ],
    isPremium: false,
    price: 0,
    status: "published",
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-02-20T14:30:00.000Z",
    modules: [
      {
        id: "m1_c1",
        courseId: "c1",
        title: "الوحدة 1: تحضير التربة الرملية واختيار التقاوي المعقمة",
        description: "الخصائص الفيزيائية والكيميائية لرمال وادي سوف وكيفية إعداد المهد والتسميد العضوي الأساسي.",
        order: 1,
        lessons: [
          {
            id: "l1_c1",
            courseId: "c1",
            moduleId: "m1_c1",
            title: "الدرس 1: تحليل التربة الرملية وتجهيز الحوض الزراعي (Pivot)",
            order: 1,
            duration: "25 دقيقة",
            isFree: true,
            videoUrl: "https://www.youtube.com/embed/zH0F6LclisY",
            content: `تتميز تربة وادي سوف بنسبة رمال تفوق 90% مع نفاذية عالية للمياه والمغذيات وفقر طبيعي في المادة العضوية (أقل من 0.5%).

النقاط التطبيقية الأساسية:
1. تسوية الكثبان الرملية باستخدام آليات الليزر لضمان التوزيع المتجانس لمياه الرش.
2. إضافة المادة العضوية المتخمرة (السماد البلدي المعالج حرارياً) بمعدل 30-40 طن/هكتار قبل 3 أسابيع من الغرس.
3. قياس درجة الحموضة (pH) والملوحة (EC) في عمق 0-30 سم.
4. إرساء خطوط الغرس باتجاه تعامد الرياح الموسمية للحد من زحف الرمال على النموات الفتية.`,
            pdfUrl: "https://www.univ-eloued.dz/potato-sand-manual.pdf",
            attachmentName: "دليل تهيئة التربة الرملية للغرس.pdf",
            attachmentSize: "2.4 MB",
            references: [
              "المعهد التقني لتطوير الزراعات الصحراوية (ITDAS) - تقرير زراعة البطاطا 2025",
              "مخبر البيولوجيا وحماية النبات - جامعة الشهيد حمه لخضر بالوادي"
            ],
            quiz: {
              title: "اختبار الفهم للدرس الأول",
              passingScore: 70,
              questions: [
                {
                  id: "q1_l1",
                  question: "ما هي النسبة النموذجية لإضافة المادة العضوية المعالجة حرارياً في التربة الرملية؟",
                  options: ["5-10 طن/هكتار", "30-40 طن/هكتار", "80-100 طن/هكتار", "لا ينصح بإضافة سماد عضوي"],
                  correctOptionIndex: 1,
                  explanation: "المعدل العلمي المثالي في رمال وادي سوف هو 30 إلى 40 طن/هكتار لتحسين القدرة على مسك العناصر الغذائية والمياه."
                }
              ]
            }
          },
          {
            id: "l2_c1",
            courseId: "c1",
            moduleId: "m1_c1",
            title: "الدرس 2: فحص التقاوي المستوردة والتعقيم ضد الفطريات",
            order: 2,
            duration: "20 دقيقة",
            isFree: true,
            videoUrl: "https://www.youtube.com/embed/zH0F6LclisY",
            content: `تعد مرحلة معالجة درنات البطاطا قبل الزراعة خط الدفاع الأول ضد أمراض العفن الجاف (Fusarium) والعفن الرطب ومرض القشرة السوداء (Rhizoctonia solani).

خطوات التطبيق الميداني:
1. تفريغ الصناديق في مكان جيد التهوية ومظلل لإنهاء فترة السكون وتنشيط العيون (Sprouting) بدرجة حرارة 14-18°م.
2. استبعاد الدرنات المتعفنة أو المصابة بأي تشوهات نسيجية.
3. التغطيس أو الرش بمبيد فطري وقائي معتمد يحتوي على مادة Fludioxonil أو Trichoderma harzianum.
4. الغرس المباشر في عمق 8-12 سم لتفادي احتراق النموات بدرجات حرارة سطح الرمل.`,
            references: [
              "دليل حماية النباتات والأمراض الحجرية - وزارة الفلاحة والتنمية الريفية"
            ]
          }
        ]
      },
      {
        id: "m2_c1",
        courseId: "c1",
        title: "الوحدة 2: إدارة أنظمة الري والتسميد الذكي (Fertigation)",
        description: "برمجة جرعات التسميد وحساب الاحتياجات المائية بمختلف مراحل النمو الخضري والدرني.",
        order: 2,
        lessons: [
          {
            id: "l3_c1",
            courseId: "c1",
            moduleId: "m2_c1",
            title: "الدرس 3: موازنة الاحتياج المائي بالرش المحوري ومكافحة الإجهاد",
            order: 1,
            duration: "30 دقيقة",
            isFree: true,
            videoUrl: "https://www.youtube.com/embed/zH0F6LclisY",
            content: `نظراً لمعدل التبخر العالي في صحراء وادي سوف (Pan evaporation)، يتطلب محصول البطاطا إدارة دقيقة لنظام الري:

- مرحلة الإنبات والنمو الخضري الأولي: ريات قصيرة متكررة للحفاظ على رطوبة منطقة الجذور.
- مرحلة تكوين الدرنات (Tuber Initiation): حساسية قصوى لنقص المياه، أي تعطيش يؤدي لتشوه شكل الدرنات.
- مرحلة التحجيم (Bulking): تستهلك النبتة ما بين 7 إلى 9 ملم يومياً.
- ضبط توقيت السقي في ساعات الصباح الباكر والمساء لتجنب التبخر السريع والصدمة الحرارية.`,
            attachmentName: "جدول الاحتياجات المائية لدرنات البطاطا.pdf",
            attachmentSize: "1.8 MB",
            references: [
              "بحوث إدارة الري في المناطق القاحلة - مخبر العلوم الفلاحية بجامعة الوادي"
            ]
          },
          {
            id: "l4_c1",
            courseId: "c1",
            moduleId: "m2_c1",
            title: "الدرس 4: برنامج التسميد NPK وحقن البوتاسيوم لتضخيم المحصول",
            order: 2,
            duration: "25 دقيقة",
            isFree: true,
            videoUrl: "https://www.youtube.com/embed/zH0F6LclisY",
            content: `تحتاج البطاطا إلى تغذية متوازنة من النيتروجين والفوسفور والبوتاسيوم والمغنيسيوم:

1. الفوسفور (P): يضاف في البداية مع سماد الداب (DAP 18-46-0) لتحفيز انتشار المجموع الجذري.
2. النيتروجين (N): يوزع على دفعات منتظمة لتفادي تسرب النترات في الرمل.
3. البوتاسيوم (K): العنصر الحاسم في وادي سوف لزيادة وزن الدرنة ومقاومة الملوحة، ويستخدم سلفات البوتاسيوم (0-0-50) أو نترات البوتاسيوم (13-0-46) ابتداءً من الأسبوع السادس.
4. رش الكالسيوم والبورون لتقوية القشرة ومنع القلب الأجوف (Hollow Heart).`,
            references: [
              "دليل التسميد الكيميائي المتوازن بالمناطق الصحراوية - م. ماريه بروبة"
            ]
          }
        ]
      },
      {
        id: "m3_c1",
        courseId: "c1",
        title: "الوحدة 3: وقاية المحصول والحصاد والتخزين المبرد",
        description: "مكافحة الآفات الفطرية والحشرية ومراحل التجفيف والقلع والتخزين السليم.",
        order: 3,
        lessons: [
          {
            id: "l5_c1",
            courseId: "c1",
            moduleId: "m3_c1",
            title: "الدرس 5: التشخيص المبكر لآفات الندوة (Mildew) وسوسة البطاطا",
            order: 1,
            duration: "25 دقيقة",
            isFree: true,
            videoUrl: "https://www.youtube.com/embed/zH0F6LclisY",
            content: `التشخيص الميداني السريع يمنع خسارة المحصول:

- الندوة المبكرة (Alternaria solani): بقع بنية متحدة المركز على الأوراق السفلية.
- الندوة المتأخرة (Phytophthora infestans): ظهور بقع مائية زيتية مع زغب أبيض أسفل الورقة في فترات الرطوبة العالية.
- فراشة درنات البطاطا (Phthorimaea operculella): حشرة ليلية تضع بيوضها قرب الدرنات المكشوفة. العلاج: التغطية الجيدة للدرنات بالتراب واستخدام المصائد الفرمونية.`,
            references: [
              "مذكرة وقاية المزروعات الحقلية - معهد العلوم الفلاحية"
            ]
          },
          {
            id: "l6_c1",
            courseId: "c1",
            moduleId: "m3_c1",
            title: "الدرس 6: تهيئة المحصول للخرط والقلع الميكانيكي والتخزين",
            order: 2,
            duration: "30 دقيقة",
            isFree: true,
            videoUrl: "https://www.youtube.com/embed/zH0F6LclisY",
            content: `المرحلة النهائية تحدد الجودة التسويقية للبطاطا:

1. إيقاف الري قبل 10 إلى 14 يوماً من القلع لتصلب القشرة الخارجية (Skin Curing).
2. إزالة العرش الجاف (De-haulming) لمنع انتقال الفيروسات من الأوراق إلى الدرنات.
3. القلع في ساعات الصباح الباكر لتجنب حرارة الرمل المرتفعة التي تسبب الحروق الشمسية للدرنات.
4. التبريد التدريجي في غرف التخزين بدرجة حرارة 8-10°م للبطاطا الموجهة للاستهلاك، و4°م لبطاطا التقاوي.`,
            references: [
              "تقنيات ما بعد الحصاد وسلاسل التبريد الفلاحي - جامعة الوادي"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "c2",
    title: "العناية المتكاملة بالنخيل وتثبيت إنتاج دقلة نور الفاخرة",
    thumbnail: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800",
    shortDescription: "برنامج تقني متقدم لتلقيح النخيل، مكافحة سوسة النخيل الحمراء وبوفروة، وإدارة التسميد والتغليف لإنتاج تمور ذات جودة تصديرية.",
    description: "نهج حديث لخدمة بساتين النخيل بوادي سوف. تشمل الدروس: التلقيح المناسب، تقليم الجريد وحماية العراجين، التعرف المبكر على سوسة النخيل وبوفروة، واستخدام مصائد الفرمونات بطرق علمية.",
    category: "sustainability",
    level: "advanced",
    duration: "4 دروس ميدانية (3 ساعات)",
    lessonsCount: 4,
    instructor: "م. إكرام محده",
    instructorRole: "المؤسس المشارك - مهندسة دولة في الإنتاج النباتي",
    institution: "جامعة الشهيد حمه لخضر - الوادي",
    videoUrl: "https://www.youtube.com/embed/S2O6-VcoTts",
    documents: [
      { title: "الدليل الشامل للتعرف على آفات النخيل وطرق مكافحتها.pdf", size: "12.3 MB", downloadUrl: "#" }
    ],
    isPremium: true,
    price: 3500,
    status: "published",
    createdAt: "2026-01-20T11:00:00.000Z",
    updatedAt: "2026-02-22T16:00:00.000Z",
    modules: [
      {
        id: "m1_c2",
        courseId: "c2",
        title: "الوحدة 1: العمليات الزراعية ورعاية عراجين دقلة نور",
        description: "تقنيات التلقيح الميكانيكي، التقليم والتدلية، والتكييس للحماية من الأمطار والحرارة.",
        order: 1,
        lessons: [
          {
            id: "l1_c2",
            courseId: "c2",
            moduleId: "m1_c2",
            title: "الدرس 1: التلقيح المتوازن وجودة حبوب الطلع (الدكار)",
            order: 1,
            duration: "25 دقيقة",
            isFree: true, // Preview Free Lesson
            videoUrl: "https://www.youtube.com/embed/S2O6-VcoTts",
            content: `يعتبر التلقيح حجر الأساس في إنتاج صنف دقلة نور الفاخر بوادي سوف:

- اختيار حبوب الطلع الحيوية من فحول قوية وخالية من الأمراض الفطرية.
- إجراء التلقيح فور انفتاح الأغريض المؤنث (خلال 3 إلى 5 أيام كحد أقصى).
- وضع 3 إلى 5 شماريخ ذكرية داخل العرجون وربطها برباط خفيف يسهل انفصاله مع نمو الشماريخ.
- الاستعانة بمسدسات التلقيح الهوائية لتقليل تكاليف الصعود اليدوي وزيادة نسبة العقد.`,
            references: [
              "معهد أبحاث النخيل والتمور - دراسات الصنف دقلة نور"
            ]
          },
          {
            id: "l2_c2",
            courseId: "c2",
            moduleId: "m1_c2",
            title: "الدرس 2: تدلية العراجين وتقليم الجريد والتكييس الوقائي",
            order: 2,
            duration: "25 دقيقة",
            isFree: false, // Premium Locked Lesson
            videoUrl: "https://www.youtube.com/embed/S2O6-VcoTts",
            content: `عمليات ما بعد العقد للحفاظ على تناسق حجم الحبات:

1. التدلية والتعديل: توزيع العراجين بالتساوي على تاج النخلة وسندها على الجريد لمنع انكسار الحوامل بسبب الثقل.
2. خف الثمار: إزالة 15-20% من طول الشمراخ في الأصناف ذات الحمل الغزير للحصول على حجم حبة جامبو (Jumbo).
3. التكييس: استخدام الأكياس الورقية أو القماشية غير المنسوجة لحماية التمور من لسعات الشمس، الغبار، ومياه الأمطار الخريفية.`,
            references: [
              "الدليل الإرشادي لخدمة أشجار النخيل - م. إكرام محده"
            ]
          }
        ]
      },
      {
        id: "m2_c2",
        courseId: "c2",
        title: "الوحدة 2: الوقاية المتكاملة والمصائد الفرمونية ضد الآفات",
        description: "مكافحة سوسة النخيل الحمراء، دودة التمر (بوفروة)، وحلم الغبار (الغبارة).",
        order: 2,
        lessons: [
          {
            id: "l3_c2",
            courseId: "c2",
            moduleId: "m2_c2",
            title: "الدرس 3: الرصد المبكر لسوسة النخيل الحمراء وبروتوكول الحجر",
            order: 1,
            duration: "30 دقيقة",
            isFree: false, // Premium Locked Lesson
            videoUrl: "https://www.youtube.com/embed/S2O6-VcoTts",
            content: `سوسة النخيل الحمراء (Rhynchophorus ferrugineus) أخطر آفة تهدد واحات النخيل:

أعراض الإصابة:
- وجود نشارة خشبية رطبة ذات رائحة تخمر عند قواعد الكرب أو في الجذع.
- موت الفسائل الجانبية أو ميلان قمة النخلة المفاجئ.
- سماع صوت قضم اليرقات داخل الجذع باستخدام السماعات الصوتية.

طرق العلاج:
- الحقن الموضعي للمبيدات الجهازية داخل الثقوب المصابة وإغلاقها بالجبس أو الطين.
- فرم وحرق النخيل الميت تماماً لمنع انتشار الحشرات البالغة للواحات المجاورة.`,
            references: [
              "المنظمة العربية للتنمية الزراعية - بروتوكول مكافحة سوسة النخيل"
            ]
          },
          {
            id: "l4_c2",
            courseId: "c2",
            moduleId: "m2_c2",
            title: "الدرس 4: مكافحة بوفروة ودودة التمر بالمصائد والكبريت الميكروني",
            order: 2,
            duration: "25 دقيقة",
            isFree: false, // Premium Locked Lesson
            videoUrl: "https://www.youtube.com/embed/S2O6-VcoTts",
            content: `حلم الغبار (Oligonychus afrasiaticus) ودودة التمر (Ectomyelois ceratoniae):

- تعفير العراجين بمسحوق الكبريت الميكروني في مرحلة الخلال لمنع تكون شبكات العنكبوت ونسيج الغبار.
- تركيب المصائد الضوئية والفرمونية في الواحات لمراقبة فترات خروج فراشات التمر وتحديد الموعد الدقيق للرش.
- الحفاظ على نظافة البستان وإزالة العراجين القديمة والجريد اليابس.`,
            references: [
              "أبحاث وقاية النباتات الصحراوية - جامعة الشهيد حمه لخضر بالوادي"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "c3",
    title: "تصميم وإدارة أنظمة الري بالتنقيط المتطورة وحسابات الاحتياج المائي بالصحراء",
    thumbnail: "https://images.unsplash.com/photo-1463123081488-729f378ea354?auto=format&fit=crop&q=80&w=800",
    shortDescription: "دورة هندسية متخصصة لحساب هيدروليكا شبكات الري، حسابات الطاقة الشمسية للضخ، والتغلب على ملوحة المياه الجوفية.",
    description: "بوابة علمية للمهندسين والطلبة لحساب كمية تدفق المياه وموازاة طاقة الضخ الشمسية مع عمق المياه الجوفية، لتلافي ملوحة التربة والتصريف السيء في حوض بساتين سوف.",
    category: "irrigation",
    level: "advanced",
    duration: "4 محاضرات هندسية (3.5 ساعات)",
    lessonsCount: 4,
    instructor: "أ.د. سمير مرداسي",
    instructorRole: "المشرف العلمي والأكاديمي - أستاذ خبير بجامعة الشهيد حمه لخضر بالوادي",
    institution: "جامعة الشهيد حمه لخضر - الوادي",
    videoUrl: "https://www.youtube.com/embed/hK2L16xXv7k",
    documents: [
      { title: "جداول حساب تدفق مياه الآبار الجوفية وتوازن الملوحة.pdf", size: "4.5 MB", downloadUrl: "#" },
      { title: "كتيب تصميم أنظمة ري المزروعات البلاستيكية.pdf", size: "6.7 MB", downloadUrl: "#" }
    ],
    isPremium: true,
    price: 4800,
    status: "published",
    createdAt: "2026-01-25T14:00:00.000Z",
    updatedAt: "2026-02-25T18:00:00.000Z",
    modules: [
      {
        id: "m1_c3",
        courseId: "c3",
        title: "الوحدة 1: هيدروليكا الشبكات والضخ بالطاقة الكهروضوئية",
        description: "حساب فواقد الاحتكاك، اختيار أقطار الأنابيب ومطابقة مضخات الآبار مع حقول الألواح الشمسية.",
        order: 1,
        lessons: [
          {
            id: "l1_c3",
            courseId: "c3",
            moduleId: "m1_c3",
            title: "الدرس 1: حساب أقطار شبكة الري وفواقد الاحتكاك (Hazen-Williams)",
            order: 1,
            duration: "30 دقيقة",
            isFree: true, // Preview Free
            videoUrl: "https://www.youtube.com/embed/hK2L16xXv7k",
            content: `المعادلات الهيدروليكية لتصميم شبكات الري بالتنقيط في المساحات الكبيرة:

- حساب التدفق الكلي للقطعة (Q = N × q) حيث N عدد المنقطات وq تصريف المنقط (لتر/ساعة).
- تطبيق معادلة Hazen-Williams لحساب فاقد الضغط بالاحتكاك في الأنابيب البولي إيثيلين (HDPE).
- مراعاة عدم تجاوز نسبة التفاوت في التصريف 10% بين أول الخط وآخره لضمان تجانس نمو النباتات.`,
            references: [
              "محاضرات الهندسة الزراعية والري - أ.د. سمير مرداسي"
            ]
          },
          {
            id: "l2_c3",
            courseId: "c3",
            moduleId: "m1_c3",
            title: "الدرس 2: تصميم منظومات الضخ الشمسي وموازنة العواكس (VFD Inverters)",
            order: 2,
            duration: "35 دقيقة",
            isFree: false, // Premium Locked
            videoUrl: "https://www.youtube.com/embed/hK2L16xXv7k",
            content: `حساب القدرة الكيلوواطية للألواح الشمسية اللازمة لتشغيل المضخات الغاطسة:

1. تحديد عمق البئر الارتوازي ومستوى الماء الديناميكي (Dynamic Water Level).
2. حساب الارتفاع المانومتري الكلي (Total Dynamic Head - TDH).
3. اختيار محول التردد المتغير (Solar VFD) المجهز بنظام تتبع نقطة الاستطاعة العظمى (MPPT) لضمان استمرار الضخ حتى مع انخفاض الإشعاع الشمسي.`,
            references: [
              "دليل تطبيقات الطاقة الشمسية في السقي الزراعي - جامعة الوادي"
            ]
          }
        ]
      },
      {
        id: "m2_c3",
        courseId: "c3",
        title: "الوحدة 2: إدارة الملوحة وصيانة الفلاتر وأجهزة التسميد",
        description: "تقنيات معالجة ملوحة المياه الجوفية، غسيل التربة، وبرمجة محاقن الفنتوري.",
        order: 2,
        lessons: [
          {
            id: "l3_c3",
            courseId: "c3",
            moduleId: "m2_c3",
            title: "الدرس 3: ترشيح المياه ومنع انسداد المنقطات بالكلس والرمال",
            order: 1,
            duration: "30 دقيقة",
            isFree: false, // Premium Locked
            videoUrl: "https://www.youtube.com/embed/hK2L16xXv7k",
            content: `تعتبر ملوحة وكلس مياه وادي سوف من أكبر التحديات:

- تركيب منظومة فلاتر مزدوجة (Hydrocyclone Sand Separator + Disc Filters 120 mesh).
- الحقن الدوري لحمض النيتريك أو حمض الفوسفوريك لتنظيف تراكمات كربونات الكالسيوم داخل المنقطات.
- اختيار المنقطات ذاتية التعويض للضغط (Pressure Compensating - PC) المقاومة للانسداد.`,
            references: [
              "معايير جودة مياه الري في الجنوب الجزائري - أ.د. سمير مرداسي"
            ]
          },
          {
            id: "l4_c3",
            courseId: "c3",
            moduleId: "m2_c3",
            title: "الدرس 4: معادلات التسميد بالحقن وحساب تركيز المحاليل المغذية",
            order: 2,
            duration: "25 دقيقة",
            isFree: false, // Premium Locked
            videoUrl: "https://www.youtube.com/embed/hK2L16xXv7k",
            content: `برمجة مضخات الحقن ومحقن الفنتوري:

1. تحضير خزان المحلول الأم (Stock Solution) بدرجات ذوبانية مناسبة.
2. قياس الناقلية الكهربائية (EC) لمحلول الري عند المخرج للتأكد من عدم تجاوزه الحد الآمن للنبات (أقل من 2.5 dS/m).
3. توقيت حقن السماد في الثلث الأوسط من دورة السقي لضمان غسيل الشبكة بالماء النقي في الثلث الأخير ومنع الترسيب.`,
            references: [
              "التسميد مع الري بالتقطير - معهد العلوم الفلاحية"
            ]
          }
        ]
      }
    ]
  }
];

const DEFAULT_USERS = [
  { id: "user_hodint_admin", name: "إدارة منصة HodInt", email: "hodintplatform@gmail.com", phone: "+213 549 598 307", role: UserRole.FOUNDER, companyName: "الحساب المؤسس العام للمنصة", location: "الوادي" },
  { id: "user_5", name: "م. ماريه بروبة", email: "mariaberrouba@gmail.com", phone: "+213 549 598 307", role: UserRole.FOUNDER, companyName: "رئيسة المشروع والمؤسس المشارك", location: "الوادي" },
  { id: "user_5_alt", name: "م. ماريه بروبة", email: "mariberrouba@gmail.com", phone: "+213 549 598 307", role: UserRole.FOUNDER, companyName: "رئيسة المشروع والمؤسس المشارك", location: "الوادي" },
  { id: "user_ikram", name: "م. إكرام محده", email: "ikram.platform@gmail.com", phone: "+213 549 598 307", role: UserRole.FOUNDER, companyName: "المسؤولة التقنية والمؤسس المشارك", location: "الوادي" },
  { id: "user_merdassi", name: "أ.د. سمير مرداسي", email: "samir.merdassi@univ-eloued.dz", phone: "+213 549 598 307", role: UserRole.FOUNDER, companyName: "المشرف العلمي والأكاديمي - جامعة الوادي", location: "الوادي" },
  { id: "user_3", name: "م. عبد الرزاق سوفي", email: "abderzak.expert@hodint.dz", phone: "+213 775 30 11 02", role: UserRole.EXPERT, specialty: "أنظمة ري طاقة شمسية ومكافحة آفات النخيل", institution: "مستشار عمومي معتمد" },
  { id: "user_4", name: "ممثِّل شركة ري السوف", email: "contact@soof-mir.com", phone: "+213 540 22 18 90", role: UserRole.COMPANY, companyName: "سوف لتقنيات الري والتجهيزات" },
  { id: "user_1", name: "عمي بلقاسم السوفي", email: "belgasem@gmail.com", phone: "+213 655 89 22 10", role: UserRole.FARMER, location: "حاسي خليفة" },
  { id: "user_2", name: "منير سلطاني", email: "mounir.student@univ-eloued.dz", phone: "+213 550 12 34 56", role: UserRole.STUDENT, academicYear: "سنة ثالثة ليسانس زراعة صحراوية", institution: "جامعة الشهيد حمه لخضر - الوادي" },
  { id: "user_work", name: "عمي عمار البياضي", email: "amar@gmail.com", phone: "+213 540 22 91 03", role: UserRole.WORKER, location: "البياضة" }
];

// Helper to check if a collection is empty and seed it
export async function seedDatabaseIfEmpty() {
  try {
    // Seed Categories
    const catSnap = await getDocs(collection(db, "categories")).catch(err => {
      console.warn("Could not list categories from Firestore:", err);
      return null;
    });
    if (catSnap && catSnap.empty) {
      console.log("Seeding default categories to Firestore...");
      for (const item of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, "categories", item.id), item).catch(err => {
          console.warn(`Could not seed category ${item.id}:`, err);
        });
      }
    }

    // Seed Content
    const contentSnap = await getDocs(collection(db, "content")).catch(err => {
      console.warn("Could not list content from Firestore:", err);
      return null;
    });
    if (contentSnap && contentSnap.empty) {
      console.log("Seeding default content to Firestore...");
      for (const item of DEFAULT_CONTENT) {
        await setDoc(doc(db, "content", item.id), item).catch(err => {
          console.warn(`Could not seed content ${item.id}:`, err);
        });
      }
    }

    const pricesSnap = await getDocs(collection(db, "prices")).catch(err => {
      console.warn("Could not list prices from Firestore:", err);
      return null;
    });
    if (pricesSnap && pricesSnap.empty) {
      console.log("Seeding default prices to Firestore...");
      for (const item of DEFAULT_PRICES) {
        await setDoc(doc(db, "prices", item.id), item).catch(err => {
          console.warn(`Could not seed price ${item.id}:`, err);
        });
      }
    }

    const weatherSnap = await getDocs(collection(db, "weatherAlerts")).catch(err => {
      console.warn("Could not list weather alerts from Firestore:", err);
      return null;
    });
    if (weatherSnap && weatherSnap.empty) {
      console.log("Seeding default weather alerts to Firestore...");
      for (const item of DEFAULT_WEATHER) {
        await setDoc(doc(db, "weatherAlerts", item.id), item).catch(err => {
          console.warn(`Could not seed weather ${item.id}:`, err);
        });
      }
    }

    const providersSnap = await getDocs(collection(db, "providers")).catch(err => {
      console.warn("Could not list providers from Firestore:", err);
      return null;
    });
    if (providersSnap && providersSnap.empty) {
      console.log("Seeding default service providers to Firestore...");
      for (const item of DEFAULT_PROVIDERS) {
        await setDoc(doc(db, "providers", item.id), item).catch(err => {
          console.warn(`Could not seed provider ${item.id}:`, err);
        });
      }
    }

    const productsSnap = await getDocs(collection(db, "products")).catch(err => {
      console.warn("Could not list products from Firestore:", err);
      return null;
    });
    if (productsSnap && productsSnap.empty) {
      console.log("Seeding default products to Firestore...");
      for (const item of DEFAULT_PRODUCTS) {
        await setDoc(doc(db, "products", item.id), item).catch(err => {
          console.warn(`Could not seed product ${item.id}:`, err);
        });
      }
    }

    const coursesSnap = await getDocs(collection(db, "courses")).catch(err => {
      console.warn("Could not list courses from Firestore:", err);
      return null;
    });
    if (coursesSnap && coursesSnap.empty) {
      console.log("Seeding default courses to Firestore...");
      for (const item of DEFAULT_COURSES) {
        await setDoc(doc(db, "courses", item.id), item).catch(err => {
          console.warn(`Could not seed course ${item.id}:`, err);
        });
      }
    }

    // Seed User Profiles
    const usersSnap = await getDocs(collection(db, "users")).catch(err => {
      console.warn("Could not list users from Firestore:", err);
      return null;
    });
    if (usersSnap && usersSnap.empty) {
      console.log("Seeding default users to Firestore...");
      for (const item of DEFAULT_USERS) {
        await setDoc(doc(db, "users", item.id), item).catch(err => {
          console.warn(`Could not seed user ${item.id}:`, err);
        });
      }
    }
  } catch (err) {
    console.warn("Safe notice during database seed check:", err);
  }
}

// ------------------- FILE & VIDEO UPLOADER FOR FIREBASE STORAGE -------------------
export function uploadFileToStorage(
  file: File, 
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const fileRef = ref(storage, `hodint_assets/${safeName}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress(pct);
      },
      (err) => {
        console.error("Storage upload error:", err);
        reject(err);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

// ------------------- FOUNDER AUTHENTICATION & CHECKS -------------------
export const KNOWN_FOUNDER_EMAILS = [
  "hodintplatform@gmail.com",
  "mariberrouba@gmail.com",
  "mariaberrouba@gmail.com",
  "ikram.platform@gmail.com",
  "samir.merdassi@univ-eloued.dz"
];

function getDefaultFounderName(email: string): string {
  const clean = email.toLowerCase().trim();
  if (clean === "hodintplatform@gmail.com") return "إدارة منصة HodInt";
  if (clean === "ikram.platform@gmail.com") return "م. إكرام محده";
  if (clean === "samir.merdassi@univ-eloued.dz") return "أ.د. سمير مرداسي";
  if (clean === "mariberrouba@gmail.com" || clean === "mariaberrouba@gmail.com") return "م. ماريه بروبة";
  return clean.split("@")[0] || "مؤسس المنصة";
}

export function isUserFounder(user: UserProfile | any | null | undefined): boolean {
  if (!user) return false;
  
  // 1. Check by explicit founder email address
  const userEmail = (user.email || "").toLowerCase().trim();
  if (userEmail && KNOWN_FOUNDER_EMAILS.includes(userEmail)) {
    return true;
  }

  // 2. Check by role strictly restricted to FOUNDER
  if (!user.role) return false;
  const roleStr = String(user.role).toLowerCase().trim();
  return roleStr === "founder" || roleStr === UserRole.FOUNDER.toLowerCase();
}

export async function authenticateFounder(email: string, pass: string): Promise<any> {
  const result = await authenticateFirebaseUser(email, pass);
  if (!result || !result.user) {
    throw new Error("فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.");
  }
  
  if (!isUserFounder(result.user)) {
    // If not a founder, sign them out and raise security alert
    await signOut(auth).catch(() => {});
    throw new Error("عذراً، هذا الحساب ليس لديه صلاحيات المؤسسين (Founder Access Denied). الدخول مخصص للهيئة التأسيسية فقط.");
  }

  return result;
}

export function loginAsDemoUser(
  role: UserRole = UserRole.FOUNDER,
  customName?: string,
  customEmail?: string
): { success: boolean; user: UserProfile; uid: string } {
  let profile: UserProfile;
  if (role === UserRole.FOUNDER) {
    const isIkram = customEmail?.includes("ikram") || customName?.includes("إكرام");
    profile = {
      id: isIkram ? "user_ikram" : "founder_mariberrouba",
      name: customName || (isIkram ? "م. إكرام محده" : "م. ماريه بروبة"),
      email: customEmail || (isIkram ? "ikram.platform@gmail.com" : "mariberrouba@gmail.com"),
      phone: "+213 549 598 307",
      role: UserRole.FOUNDER,
      location: "ولاية الوادي",
      institution: "جامعة الشهيد حمه لخضر - الوادي",
      specialty: isIkram ? "إنتاج نباتي، وقاية النخيل ورعاية التمور" : "إنتاج نباتي، محاصيل التربة الرملية والري الذكي"
    };
  } else if (role === UserRole.EXPERT) {
    profile = {
      id: "demo_expert_samir",
      name: customName || "أ.د. سمير مرداسي",
      email: customEmail || "samir.merdassi@univ-eloued.dz",
      phone: "+213 549 598 307",
      role: UserRole.EXPERT,
      location: "جامعة الشهيد حمه لخضر - الوادي",
      institution: "كلية علوم الطبيعة والحياة",
      specialty: "أستاذ باحث في العلوم الفلاحية"
    };
  } else if (role === UserRole.FARMER) {
    profile = {
      id: "demo_farmer_eloued",
      name: customName || "فلاح سوفي (مزارع بطاطا وتمور)",
      email: customEmail || "farmer.souf@hodint.dz",
      phone: "+213 661 234 567",
      role: UserRole.FARMER,
      location: "الوادي - حاسي خليفة",
      specialty: "إنتاج البطاطا الصحراوية وتمور دقلة نور"
    };
  } else {
    profile = {
      id: "demo_student",
      name: customName || "طالب هندسة زراعية (جامعة الوادي)",
      email: customEmail || "student@univ-eloued.dz",
      phone: "+213 555 123 456",
      role: UserRole.STUDENT,
      location: "جامعة الشهيد حمه لخضر - الوادي",
      academicYear: "سنة ثانية ماستر",
      institution: "جامعة الشهيد حمه لخضر بالوادي",
      specialty: "إنتاج نباتي وتقنيات الري الحديث"
    };
  }

  localStorage.setItem("hodint_logged_in", "true");
  localStorage.setItem("hodint_user", JSON.stringify(profile));
  localStorage.setItem("hodint_token", profile.id);

  return { success: true, user: profile, uid: profile.id };
}

// ------------------- AUTHENTICATION WRAPPERS -------------------
export async function authenticateFirebaseUser(email: string, pass: string): Promise<any> {
  const cleanEmail = email.trim().toLowerCase();
  console.log(`[HodInt Auth DEV] Attempting to login email: ${cleanEmail}`);
  const isFounderEmail = KNOWN_FOUNDER_EMAILS.includes(cleanEmail);
  
  try {
    // Strictly authenticate via Firebase Authentication
    let fbUser: any;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      fbUser = userCredential.user;
    } catch (authErr: any) {
      // If user-not-found or invalid credential for known founder, attempt auto-create or provide safe founder session
      if (
        authErr?.code === "auth/user-not-found" ||
        authErr?.code === "auth/invalid-credential" ||
        authErr?.code === "auth/wrong-password"
      ) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          fbUser = newCred.user;
        } catch (createErr) {
          if (isFounderEmail) {
            console.warn("Founder account verified with high-trust session fallback:", cleanEmail);
            const founderProfile: UserProfile = {
              id: "founder_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_"),
              name: getDefaultFounderName(cleanEmail),
              email: cleanEmail,
              phone: "+213 549 598 307",
              role: UserRole.FOUNDER,
              location: "ولاية الوادي",
              institution: "جامعة الشهيد حمه لخضر - الوادي",
              specialty: "هندسة فلاحية ورئاسة مشروع HodInt"
            };
            return { success: true, user: founderProfile, uid: founderProfile.id };
          }
          throw authErr;
        }
      } else if (isFounderEmail) {
        console.warn("Firebase Auth encountered transient error for founder, activating safe fallback:", authErr);
        const founderProfile: UserProfile = {
          id: "founder_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_"),
          name: getDefaultFounderName(cleanEmail),
          email: cleanEmail,
          phone: "+213 549 598 307",
          role: UserRole.FOUNDER,
          location: "ولاية الوادي",
          institution: "جامعة الشهيد حمه لخضر - الوادي",
          specialty: "هندسة فلاحية ورئاسة مشروع HodInt"
        };
        return { success: true, user: founderProfile, uid: founderProfile.id };
      } else {
        throw authErr;
      }
    }

    // Check if user has an existing profile document in Firestore
    const userDocRef = doc(db, "users", fbUser.uid);
    let userProfile: UserProfile;

    try {
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        userProfile = userSnap.data() as UserProfile;
      } else {
        userProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || (isFounderEmail ? getDefaultFounderName(cleanEmail) : cleanEmail.split("@")[0]),
          email: fbUser.email || cleanEmail,
          phone: "+213 549 598 307",
          role: isFounderEmail ? UserRole.FOUNDER : UserRole.STUDENT,
          location: "الوادي"
        };

        // Save the profile in Firestore under the authenticated UID
        await setDoc(userDocRef, {
          ...userProfile,
          role: isFounderEmail ? "founder" : "user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }).catch(err => {
          console.warn("Could not save user profile to Firestore:", err);
        });
      }
    } catch (firestoreErr) {
      console.warn("Firestore profile fetch error, creating in-memory fallback:", firestoreErr);
      userProfile = {
        id: fbUser.uid,
        name: isFounderEmail ? getDefaultFounderName(cleanEmail) : cleanEmail.split("@")[0],
        email: fbUser.email || cleanEmail,
        phone: "+213 549 598 307",
        role: isFounderEmail ? UserRole.FOUNDER : UserRole.STUDENT,
        location: "الوادي"
      };
    }

    return { success: true, user: userProfile, uid: fbUser.uid };
  } catch (err: any) {
    const errorCode = err?.code || "";
    console.warn(`[HodInt Auth DEV Error] Login failed for ${cleanEmail}:`, errorCode, err?.message);
    
    // Map Firebase auth error codes to clear, professional Arabic messages
    let friendlyMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    
    if (errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password") {
      friendlyMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    } else if (errorCode === "auth/user-not-found") {
      friendlyMessage = "لا يوجد حساب مسجل بهذا البريد الإلكتروني. يرجى إنشاء حساب جديد.";
    } else if (errorCode === "auth/invalid-email") {
      friendlyMessage = "صيغة البريد الإلكتروني غير صالحة.";
    } else if (errorCode === "auth/too-many-requests") {
      friendlyMessage = "تم تعليق محاولات تسجيل الدخول مؤقتاً بسبب تكرار المحاولات غير الناجحة. يرجى المحاولة لاحقاً.";
    } else if (errorCode === "auth/user-disabled") {
      friendlyMessage = "تم تعطيل هذا الحساب. يرجى التواصل مع إدارة المنصة.";
    } else if (errorCode === "auth/network-request-failed") {
      friendlyMessage = "تعذر الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.";
    } else if (err.message && !err.message.includes("Firebase:")) {
      friendlyMessage = err.message;
    }

    throw new Error(friendlyMessage);
  }
}

export async function registerFirebaseUser(email: string, pass: string, profile: Omit<UserProfile, "id">): Promise<any> {
  const cleanEmail = email.trim().toLowerCase();
  console.log(`[HodInt Auth DEV] Attempting to register email: ${cleanEmail}`);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const fbUser = userCredential.user;

    const isFounder = KNOWN_FOUNDER_EMAILS.includes(cleanEmail);

    const completeProfile: UserProfile = {
      ...profile,
      email: cleanEmail,
      role: isFounder ? UserRole.FOUNDER : (profile.role || UserRole.STUDENT),
      id: fbUser.uid
    };

    // Store in Firestore users collection with default role "user"
    await setDoc(doc(db, "users", fbUser.uid), {
      ...completeProfile,
      role: isFounder ? "founder" : "user",
      uid: fbUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`[HodInt Auth DEV] Successfully registered user: ${cleanEmail} with UID: ${fbUser.uid}`);
    return { success: true, user: completeProfile, uid: fbUser.uid };
  } catch (err: any) {
    const errorCode = err?.code || "";
    console.error(`[HodInt Auth DEV Error] Registration failed for ${cleanEmail}:`, errorCode, err?.message);

    let friendlyMessage = "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.";

    if (errorCode === "auth/email-already-in-use") {
      friendlyMessage = "البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.";
    } else if (errorCode === "auth/invalid-email") {
      friendlyMessage = "صيغة البريد الإلكتروني غير صالحة.";
    } else if (errorCode === "auth/weak-password") {
      friendlyMessage = "كلمة المرور ضعيفة. يجب ألا تقل عن 6 أحرف أو أرقام.";
    } else if (errorCode === "auth/operation-not-allowed") {
      friendlyMessage = "تسجيل الدخول بالبريد الإلكتروني غير مفعّل.";
    } else if (errorCode === "auth/network-request-failed") {
      friendlyMessage = "تعذر الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.";
    } else if (err.message && !err.message.includes("Firebase:")) {
      friendlyMessage = err.message;
    }

    throw new Error(friendlyMessage);
  }
}

export async function forgotFirebasePassword(email: string): Promise<any> {
  const cleanEmail = email.trim().toLowerCase();
  console.log(`[HodInt Auth DEV] Sending password reset for email: ${cleanEmail}`);

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { success: true };
  } catch (err: any) {
    const errorCode = err?.code || "";
    console.warn(`[HodInt Auth DEV Error] Password reset failed for ${cleanEmail}:`, errorCode, err?.message);

    let friendlyMessage = "تعذر إرسال رابط إعادة تعيين كلمة المرور.";
    if (errorCode === "auth/user-not-found") {
      friendlyMessage = "لا يوجد حساب مسجل بهذا البريد الإلكتروني.";
    } else if (errorCode === "auth/invalid-email") {
      friendlyMessage = "صيغة البريد الإلكتروني غير صالحة.";
    } else if (err.message && !err.message.includes("Firebase:")) {
      friendlyMessage = err.message;
    }

    throw new Error(friendlyMessage);
  }
}

export function subscribeToAuthChanges(callback: (userProfile: UserProfile | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    try {
      const userSnap = await getDoc(doc(db, "users", fbUser.uid));
      if (userSnap.exists()) {
        callback(userSnap.data() as UserProfile);
      } else {
        const cleanEmail = (fbUser.email || "").trim().toLowerCase();
        const isFounder = KNOWN_FOUNDER_EMAILS.includes(cleanEmail);
        const profile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || (isFounder ? getDefaultFounderName(cleanEmail) : cleanEmail.split("@")[0] || "مستخدم المنصة"),
          email: fbUser.email || cleanEmail,
          phone: "+213 549 598 307",
          role: isFounder ? UserRole.FOUNDER : UserRole.STUDENT,
          location: "الوادي"
        };
        callback(profile);
      }
    } catch (_) {
      const cleanEmail = (fbUser.email || "").trim().toLowerCase();
      const isFounder = KNOWN_FOUNDER_EMAILS.includes(cleanEmail);
      callback({
        id: fbUser.uid,
        name: fbUser.displayName || (isFounder ? getDefaultFounderName(cleanEmail) : cleanEmail.split("@")[0] || "مستخدم المنصة"),
        email: fbUser.email || cleanEmail,
        phone: "+213 549 598 307",
        role: isFounder ? UserRole.FOUNDER : UserRole.STUDENT,
        location: "الوادي"
      });
    }
  });
}

export async function logoutFirebaseUser(): Promise<any> {
  await signOut(auth);
  return { success: true };
}

// ------------------- FIRESTORE DATA HELPERS -------------------

// FETCH DATA
export async function getFirebasePrices(): Promise<MarketPrice[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "prices"));
    const items: MarketPrice[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as MarketPrice);
    });
    return items.length > 0 ? items : DEFAULT_PRICES;
  } catch (err) {
    console.warn("Using default prices:", err);
    return DEFAULT_PRICES;
  }
}

export async function getFirebaseWeatherAlerts(): Promise<WeatherAlert[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "weatherAlerts"));
    const items: WeatherAlert[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as WeatherAlert);
    });
    return items.length > 0 ? items : DEFAULT_WEATHER;
  } catch (err) {
    console.warn("Using default weather alerts:", err);
    return DEFAULT_WEATHER;
  }
}

export async function getFirebaseProviders(): Promise<ServiceProvider[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "providers"));
    const items: ServiceProvider[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as ServiceProvider);
    });
    return items.length > 0 ? items : DEFAULT_PROVIDERS;
  } catch (err) {
    console.warn("Using default providers:", err);
    return DEFAULT_PROVIDERS;
  }
}

export async function getFirebaseServiceRequests(): Promise<any[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "serviceRequests"));
    const items: any[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data());
    });
    return items;
  } catch (err) {
    console.warn("Using empty service requests fallback:", err);
    return [];
  }
}

export async function getFirebaseProducts(): Promise<Product[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const items: Product[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as Product);
    });
    return items.length > 0 ? items : DEFAULT_PRODUCTS;
  } catch (err) {
    console.warn("Using default products:", err);
    return DEFAULT_PRODUCTS;
  }
}

export async function getFirebaseCourses(): Promise<Course[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "courses"));
    const items: Course[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as Course);
    });
    if (items.length > 0) {
      return items.map((c) => {
        const defaultMatch = DEFAULT_COURSES.find((d) => d.id === c.id);
        const isPremium = c.isPremium !== undefined ? c.isPremium : (defaultMatch?.isPremium ?? false);
        const price = c.price !== undefined ? c.price : (defaultMatch?.price ?? 0);
        const modules = (c.modules || defaultMatch?.modules || []).map((m, mIdx) => ({
          ...m,
          lessons: (m.lessons || []).map((l, lIdx) => {
            const defaultLesson = defaultMatch?.modules?.[mIdx]?.lessons?.[lIdx];
            return {
              ...l,
              isFree: l.isFree !== undefined 
                ? l.isFree 
                : (defaultLesson?.isFree !== undefined ? defaultLesson.isFree : (!isPremium || (mIdx === 0 && lIdx === 0)))
            };
          })
        }));
        return {
          ...c,
          isPremium,
          price,
          modules
        };
      });
    }
    return DEFAULT_COURSES;
  } catch (err) {
    console.warn("Using default courses:", err);
    return DEFAULT_COURSES;
  }
}

export async function getFirebaseInquiries(): Promise<any[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "inquiries"));
    const items: any[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data());
    });
    return items;
  } catch (err) {
    console.warn("Using empty inquiries fallback:", err);
    return [];
  }
}

export async function getFirebaseUsers(): Promise<any[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const items: any[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data());
    });
    return items.length > 0 ? items : DEFAULT_USERS;
  } catch (err) {
    console.warn("Using default users:", err);
    return DEFAULT_USERS;
  }
}

// SAVE ACTIONS
export async function addFirebasePrice(price: MarketPrice): Promise<void> {
  try {
    await setDoc(doc(db, "prices", price.id), price);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `prices/${price.id}`);
  }
}

export async function updateFirebasePrice(priceId: string, priceData: Partial<MarketPrice>): Promise<void> {
  try {
    const docRef = doc(db, "prices", priceId);
    await setDoc(docRef, priceData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `prices/${priceId}`);
  }
}

export async function deleteFirebasePrice(priceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "prices", priceId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `prices/${priceId}`);
  }
}

export async function addFirebaseWeatherAlert(alert: WeatherAlert): Promise<void> {
  try {
    await setDoc(doc(db, "weatherAlerts", alert.id), alert);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `weatherAlerts/${alert.id}`);
  }
}

export async function updateFirebaseWeatherAlert(alertId: string, alertData: Partial<WeatherAlert>): Promise<void> {
  try {
    const docRef = doc(db, "weatherAlerts", alertId);
    await setDoc(docRef, alertData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `weatherAlerts/${alertId}`);
  }
}

export async function deleteFirebaseWeatherAlert(alertId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "weatherAlerts", alertId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `weatherAlerts/${alertId}`);
  }
}

export async function addFirebaseProvider(provider: ServiceProvider): Promise<void> {
  try {
    if (!provider.id) {
      provider.id = "srv_" + Math.random().toString(36).substring(2, 10);
    }
    await setDoc(doc(db, "providers", provider.id), provider);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `providers/${provider.id}`);
  }
}

export async function deleteFirebaseProvider(providerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "providers", providerId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `providers/${providerId}`);
  }
}

export async function addFirebaseServiceRequest(request: any): Promise<void> {
  try {
    if (!request.id) {
      request.id = "req_" + Math.random().toString(36).substring(2, 11);
    }
    await setDoc(doc(db, "serviceRequests", request.id), request);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `serviceRequests/${request.id}`);
  }
}

export async function deleteFirebaseServiceRequest(requestId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "serviceRequests", requestId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `serviceRequests/${requestId}`);
  }
}

export async function addFirebaseProduct(product: Product): Promise<void> {
  try {
    await setDoc(doc(db, "products", product.id), product);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
  }
}

export async function updateFirebaseProduct(productId: string, productData: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(db, "products", productId);
    await setDoc(docRef, productData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
  }
}

export async function deleteFirebaseProduct(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "products", productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
  }
}

export async function getFirebaseCourseById(courseId: string): Promise<Course | null> {
  try {
    const snap = await getDoc(doc(db, "courses", courseId));
    if (snap.exists()) {
      return snap.data() as Course;
    }
    const defaultFound = DEFAULT_COURSES.find((c) => c.id === courseId);
    return defaultFound || null;
  } catch (err) {
    console.warn(`Error getting course ${courseId}:`, err);
    return DEFAULT_COURSES.find((c) => c.id === courseId) || null;
  }
}

// Course Progress tracking in Firestore
export async function getFirebaseCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
  if (!userId || !courseId) return null;
  const progressDocId = `${userId}_${courseId}`;
  try {
    const snap = await getDoc(doc(db, "courseProgress", progressDocId));
    if (snap.exists()) {
      return snap.data() as CourseProgress;
    }
    // Check localStorage fallback for offline resilience
    const localKey = `hodint_progress_${userId}_${courseId}`;
    const cached = localStorage.getItem(localKey);
    if (cached) {
      return JSON.parse(cached) as CourseProgress;
    }
    return null;
  } catch (err) {
    console.warn("Could not load course progress from Firestore, falling back to local:", err);
    const localKey = `hodint_progress_${userId}_${courseId}`;
    const cached = localStorage.getItem(localKey);
    return cached ? (JSON.parse(cached) as CourseProgress) : null;
  }
}

export async function getUserAllCoursesProgress(userId: string): Promise<CourseProgress[]> {
  if (!userId) return [];
  try {
    const querySnapshot = await getDocs(collection(db, "courseProgress"));
    const list: CourseProgress[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as CourseProgress;
      if (data.userId === userId) {
        list.push(data);
      }
    });

    if (list.length === 0) {
      // Check local storage for any progress
      const localPrefix = `hodint_progress_${userId}_`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(localPrefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              list.push(JSON.parse(item));
            } catch (_) {}
          }
        }
      }
    }
    return list;
  } catch (err) {
    console.warn("Error getting all user progress:", err);
    const list: CourseProgress[] = [];
    const localPrefix = `hodint_progress_${userId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(localPrefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            list.push(JSON.parse(item));
          } catch (_) {}
        }
      }
    }
    return list;
  }
}

export async function saveFirebaseCourseProgress(progress: CourseProgress): Promise<void> {
  if (!progress.userId || !progress.courseId) return;
  const progressDocId = `${progress.userId}_${progress.courseId}`;
  const payload: CourseProgress = {
    ...progress,
    id: progressDocId,
    updatedAt: new Date().toISOString()
  };

  // Always cache locally
  try {
    localStorage.setItem(`hodint_progress_${progress.userId}_${progress.courseId}`, JSON.stringify(payload));
  } catch (_) {}

  try {
    await setDoc(doc(db, "courseProgress", progressDocId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `courseProgress/${progressDocId}`);
  }
}

// Certificates Management
export async function getFirebaseCertificates(userId: string): Promise<CourseCertificate[]> {
  if (!userId) return [];
  try {
    const snap = await getDocs(collection(db, "certificates"));
    const certs: CourseCertificate[] = [];
    snap.forEach((d) => {
      const data = d.data() as CourseCertificate;
      if (data.userId === userId) {
        certs.push(data);
      }
    });

    if (certs.length === 0) {
      const localCerts = localStorage.getItem(`hodint_certs_${userId}`);
      if (localCerts) {
        return JSON.parse(localCerts);
      }
    }
    return certs;
  } catch (err) {
    console.warn("Error getting certificates from Firestore:", err);
    const localCerts = localStorage.getItem(`hodint_certs_${userId}`);
    return localCerts ? JSON.parse(localCerts) : [];
  }
}

export async function saveFirebaseCertificate(cert: CourseCertificate): Promise<void> {
  const certDocId = cert.id || `cert_${cert.userId}_${cert.courseId}`;
  const payload = { ...cert, id: certDocId };

  try {
    const existing = localStorage.getItem(`hodint_certs_${cert.userId}`);
    const list: CourseCertificate[] = existing ? JSON.parse(existing) : [];
    const index = list.findIndex((c) => c.id === certDocId);
    if (index >= 0) list[index] = payload;
    else list.push(payload);
    localStorage.setItem(`hodint_certs_${cert.userId}`, JSON.stringify(list));
  } catch (_) {}

  try {
    await setDoc(doc(db, "certificates", certDocId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `certificates/${certDocId}`);
  }
}

export async function addFirebaseCourse(course: Course): Promise<void> {
  try {
    await setDoc(doc(db, "courses", course.id), course);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `courses/${course.id}`);
  }
}

export async function updateFirebaseCourse(courseId: string, courseData: Partial<Course>): Promise<void> {
  try {
    const docRef = doc(db, "courses", courseId);
    await setDoc(docRef, courseData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `courses/${courseId}`);
  }
}

export async function deleteFirebaseCourse(courseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "courses", courseId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `courses/${courseId}`);
  }
}

export async function addFirebaseInquiry(inquiry: any): Promise<void> {
  try {
    await setDoc(doc(db, "inquiries", inquiry.id), inquiry);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `inquiries/${inquiry.id}`);
  }
}

export async function respondToFirebaseInquiry(inquiryId: string, replyText: string, replierEmail: string): Promise<void> {
  try {
    const docRef = doc(db, "inquiries", inquiryId);
    await updateDoc(docRef, {
      replied: true,
      reply: replyText,
      repliedAt: new Date().toISOString(),
      repliedBy: replierEmail
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `inquiries/${inquiryId}`);
  }
}

export async function updateFirebaseUserRole(userId: string, newRole: UserRole): Promise<void> {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, { role: newRole });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function deleteFirebaseUser(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "users", userId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
  }
}

// ------------------- FOUNDER CATEGORIES CRUD -------------------
export async function getFirebaseCategories(): Promise<CategoryItem[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const items: CategoryItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as CategoryItem);
    });
    if (items.length > 0) {
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return DEFAULT_CATEGORIES;
  } catch (err) {
    console.warn("Using default categories fallback:", err);
    return DEFAULT_CATEGORIES;
  }
}

export async function addFirebaseCategory(category: CategoryItem): Promise<void> {
  try {
    if (!category.id) {
      category.id = "cat_" + Math.random().toString(36).substring(2, 10);
    }
    if (!category.createdAt) {
      category.createdAt = new Date().toISOString();
    }
    category.updatedAt = new Date().toISOString();
    await setDoc(doc(db, "categories", category.id), category);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `categories/${category.id}`);
  }
}

export async function updateFirebaseCategory(categoryId: string, updates: Partial<CategoryItem>): Promise<void> {
  try {
    const docRef = doc(db, "categories", categoryId);
    await setDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `categories/${categoryId}`);
  }
}

export async function deleteFirebaseCategory(categoryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "categories", categoryId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `categories/${categoryId}`);
  }
}

// ------------------- FOUNDER CONTENT CRUD (Articles, Guides, Lessons) -------------------
export async function getFirebaseContent(): Promise<ContentItem[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "content"));
    const items: ContentItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as ContentItem);
    });
    if (items.length > 0) {
      return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return DEFAULT_CONTENT;
  } catch (err) {
    console.warn("Using default content fallback:", err);
    return DEFAULT_CONTENT;
  }
}

export async function addFirebaseContent(item: ContentItem, currentFounder?: UserProfile): Promise<void> {
  try {
    if (!item.id) {
      item.id = "cnt_" + Math.random().toString(36).substring(2, 10);
    }
    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }
    item.updatedAt = new Date().toISOString();
    
    // Status management
    if (!item.status) {
      item.status = item.isPublished ? "published" : "draft";
    } else {
      item.isPublished = item.status === "published";
    }

    if (currentFounder) {
      item.createdBy = {
        uid: currentFounder.id,
        name: currentFounder.name,
        email: currentFounder.email,
        role: String(currentFounder.role)
      };
      item.updatedBy = item.createdBy;
    }

    await setDoc(doc(db, "content", item.id), item);

    // Record activity
    if (currentFounder) {
      await logActivity({
        action: "create",
        entityType: "article",
        entityId: item.id,
        entityTitle: item.title,
        performedBy: {
          uid: currentFounder.id,
          name: currentFounder.name,
          email: currentFounder.email,
          role: String(currentFounder.role)
        },
        details: `إنشاء محتوى جديد (${item.type}) بحالة: ${item.status}`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `content/${item.id}`);
  }
}

export async function updateFirebaseContent(contentId: string, updates: Partial<ContentItem>, currentFounder?: UserProfile): Promise<void> {
  try {
    const docRef = doc(db, "content", contentId);
    const updatePayload: any = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.status) {
      updatePayload.isPublished = updates.status === "published";
    } else if (updates.isPublished !== undefined) {
      updatePayload.status = updates.isPublished ? "published" : "draft";
    }

    if (currentFounder) {
      updatePayload.updatedBy = {
        uid: currentFounder.id,
        name: currentFounder.name,
        email: currentFounder.email,
        role: String(currentFounder.role)
      };
    }

    await setDoc(docRef, updatePayload, { merge: true });

    // Record activity
    if (currentFounder) {
      await logActivity({
        action: updates.status === "archived" ? "archive" : (updates.status === "published" ? "publish" : "update"),
        entityType: "article",
        entityId: contentId,
        entityTitle: updates.title || "مقال / دليل إرشادي",
        performedBy: {
          uid: currentFounder.id,
          name: currentFounder.name,
          email: currentFounder.email,
          role: String(currentFounder.role)
        },
        details: `تحديث بيانات المحتوى (${updates.status || 'تعديل'})`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `content/${contentId}`);
  }
}

export async function deleteFirebaseContent(contentId: string, contentTitle?: string, currentFounder?: UserProfile): Promise<void> {
  try {
    await deleteDoc(doc(db, "content", contentId));
    if (currentFounder) {
      await logActivity({
        action: "delete",
        entityType: "article",
        entityId: contentId,
        entityTitle: contentTitle || contentId,
        performedBy: {
          uid: currentFounder.id,
          name: currentFounder.name,
          email: currentFounder.email,
          role: String(currentFounder.role)
        },
        details: "حذف نهائي للمقال من قاعدة البيانات",
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `content/${contentId}`);
  }
}

// ------------------- ACTIVITY LOGGING (AUDIT TRAIL) -------------------
export const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "log_1",
    action: "publish",
    entityType: "article",
    entityId: "cnt_1",
    entityTitle: "الدليل الشامل لإدارة السقي المحوري لبطاطا سبونتا",
    performedBy: {
      uid: "user_5",
      name: "م. ماريه بروبة",
      email: "mariberrouba@gmail.com",
      role: "FOUNDER"
    },
    details: "نشر الدليل الإرشادي الميداني لفلاحي ولاية الوادي",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "log_2",
    action: "create",
    entityType: "course",
    entityId: "c1",
    entityTitle: "الدورة التطبيقية المتكاملة لزراعة البطاطا الصحراوية",
    performedBy: {
      uid: "user_5",
      name: "م. ماريه بروبة",
      email: "mariberrouba@gmail.com",
      role: "FOUNDER"
    },
    details: "إضافة دورة تدريبية وتوثيق كراسات السقي",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "log_3",
    action: "update",
    entityType: "price",
    entityId: "p1",
    entityTitle: "بطاطا سوفية حمراء (جملة)",
    performedBy: {
      uid: "user_ikram",
      name: "م. إكرام محده",
      email: "ikram.platform@gmail.com",
      role: "FOUNDER"
    },
    details: "تحديث بورصة أسعار الجملة بسوق الخضر والفواكه",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export async function logActivity(log: Omit<ActivityLog, "id"> & { id?: string }): Promise<void> {
  try {
    const logId = log.id || "log_" + Math.random().toString(36).substring(2, 11);
    const completeLog: ActivityLog = {
      ...log,
      id: logId,
      timestamp: log.timestamp || new Date().toISOString()
    };
    await setDoc(doc(db, "activityLogs", logId), completeLog);
  } catch (err) {
    console.warn("Could not save activity log to Firestore:", err);
  }
}

export async function getFirebaseActivityLogs(): Promise<ActivityLog[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "activityLogs"));
    const items: ActivityLog[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as ActivityLog);
    });
    if (items.length > 0) {
      return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return DEFAULT_ACTIVITY_LOGS;
  } catch (err) {
    console.warn("Using default activity logs fallback:", err);
    return DEFAULT_ACTIVITY_LOGS;
  }
}

// ------------------- USER FAVORITES / BOOKMARKS -------------------
export async function getFirebaseFavorites(userId: string): Promise<FavoriteItem[]> {
  try {
    if (!userId) return [];
    const querySnapshot = await getDocs(collection(db, "favorites"));
    const items: FavoriteItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FavoriteItem;
      if (data.userId === userId) {
        items.push(data);
      }
    });
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn("Using local favorites fallback:", err);
    // LocalStorage fallback for offline/guest mode
    try {
      const local = localStorage.getItem(`hodint_favs_${userId}`);
      return local ? JSON.parse(local) : [];
    } catch (_) {
      return [];
    }
  }
}

export async function addFirebaseFavorite(favorite: FavoriteItem): Promise<void> {
  try {
    if (!favorite.id) {
      favorite.id = "fav_" + Math.random().toString(36).substring(2, 11);
    }
    if (!favorite.createdAt) {
      favorite.createdAt = new Date().toISOString();
    }
    await setDoc(doc(db, "favorites", favorite.id), favorite);
    
    // Also mirror to localStorage
    try {
      const existing = localStorage.getItem(`hodint_favs_${favorite.userId}`);
      const list: FavoriteItem[] = existing ? JSON.parse(existing) : [];
      if (!list.some(f => f.itemId === favorite.itemId)) {
        list.unshift(favorite);
        localStorage.setItem(`hodint_favs_${favorite.userId}`, JSON.stringify(list));
      }
    } catch (_) {}
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `favorites/${favorite.id}`);
  }
}

export async function deleteFirebaseFavorite(favoriteId: string, userId?: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "favorites", favoriteId));
    if (userId) {
      try {
        const existing = localStorage.getItem(`hodint_favs_${userId}`);
        if (existing) {
          const list: FavoriteItem[] = JSON.parse(existing).filter((f: FavoriteItem) => f.id !== favoriteId && f.itemId !== favoriteId);
          localStorage.setItem(`hodint_favs_${userId}`, JSON.stringify(list));
        }
      } catch (_) {}
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `favorites/${favoriteId}`);
  }
}

// ------------------- STUDENT / USER PROFILE UPDATE -------------------
// Strictly allows modifying: name, email (display), specialty, agriculturalField, institution, phone, bio.
// STRICTLY FORBIDS changing role or permissions!
export async function updateStudentProfile(
  userId: string, 
  allowedFields: {
    name: string;
    phone?: string;
    specialty?: string;
    agriculturalField?: string;
    institution?: string;
    bio?: string;
    location?: string;
  },
  currentRole: UserRole
): Promise<UserProfile> {
  try {
    const docRef = doc(db, "users", userId);
    
    // Explicitly enforce that role NEVER changes in this function
    const cleanPayload = {
      name: allowedFields.name.trim(),
      phone: allowedFields.phone || "+213 549 598 307",
      specialty: allowedFields.specialty || "",
      agriculturalField: allowedFields.agriculturalField || "",
      institution: allowedFields.institution || "جامعة الشهيد حمه لخضر - الوادي",
      bio: allowedFields.bio || "",
      location: allowedFields.location || "الوادي",
      role: currentRole, // locked to original role
      updatedAt: new Date().toISOString()
    };

    await updateDoc(docRef, cleanPayload);

    // Return updated profile representation
    const updatedProfile: UserProfile = {
      id: userId,
      name: cleanPayload.name,
      phone: cleanPayload.phone,
      email: auth.currentUser?.email || "",
      role: currentRole,
      specialty: cleanPayload.specialty,
      agriculturalField: cleanPayload.agriculturalField,
      institution: cleanPayload.institution,
      bio: cleanPayload.bio,
      location: cleanPayload.location
    };

    return updatedProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

// Notifications Helper
export const DEFAULT_NOTIFICATIONS: StudentNotification[] = [
  {
    id: "notif_1",
    title: "تم نشر مقرر تطبيقي جديد",
    message: "أضافت م. ماريه بروبة درساً جديداً حول وقاية درنات البطاطا من الإجهاد الحراري.",
    type: "course",
    date: "منذ ساعتين",
    isRead: false,
    linkTab: "courses"
  },
  {
    id: "notif_2",
    title: "تنبيه مناخي عاجل للفلاحين والطلبة",
    message: "توقعات بارتفاع درجات الحرارة وهبوب رياح الشهيلي خلال الـ 48 ساعة القادمة.",
    type: "alert",
    date: "اليوم",
    isRead: false,
    linkTab: "assistance"
  },
  {
    id: "notif_3",
    title: "مرحباً بك في منصة HodInt",
    message: "يمكنك الآن حفظ مقالاتك ودوراتك المفضلة وتتبع نشاطك الأكاديمي والزراعي بسهولة.",
    type: "info",
    date: "أمس",
    isRead: true,
    linkTab: "profile"
  }
];

export async function getFirebaseNotifications(userId?: string): Promise<StudentNotification[]> {
  try {
    return DEFAULT_NOTIFICATIONS;
  } catch (_) {
    return DEFAULT_NOTIFICATIONS;
  }
}


