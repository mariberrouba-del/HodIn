
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Standard localized seeds
let marketPrices = [
  { id: "p1", nameAr: "بطاطا (غسيل محلي)", nameEn: "Local Potato (Washed)", category: "vegetables", currentPrice: 85, yesterdayPrice: 90, trend: "down" as const, icon: "🥔" },
  { id: "p2", nameAr: "تمور دقلة نور الممتازة", nameEn: "Deglet Nour Dates (Premium)", category: "fruits", currentPrice: 450, yesterdayPrice: 450, trend: "stable" as const, icon: "🌴" },
  { id: "p3", nameAr: "طماطم حقل مكشوف", nameEn: "Open Field Tomato", category: "vegetables", currentPrice: 70, yesterdayPrice: 65, trend: "up" as const, icon: "🍅" },
  { id: "p4", nameAr: "فلفل حار حاسي خليفة", nameEn: "Hot Pepper (Hassi Khalifa)", category: "vegetables", currentPrice: 120, yesterdayPrice: 130, trend: "down" as const, icon: "🌶️" },
  { id: "p5", nameAr: "بصل جاف", nameEn: "Dry Onion", category: "vegetables", currentPrice: 60, yesterdayPrice: 55, trend: "up" as const, icon: "🧅" },
  { id: "p6", nameAr: "بطيخ أحمر الرقيبة", nameEn: "Reguiba Watermelon", category: "fruits", currentPrice: 45, yesterdayPrice: 45, trend: "stable" as const, icon: "🍉" },
  { id: "p7", nameAr: "فراولة كوينين ممتازة", nameEn: "Premium Kouinine Strawberry", category: "fruits", currentPrice: 280, yesterdayPrice: 300, trend: "down" as const, icon: "🍓" },
  { id: "p8", nameAr: "ثوم طازج", nameEn: "Fresh Garlic", category: "vegetables", currentPrice: 180, yesterdayPrice: 175, trend: "up" as const, icon: "🧄" }
];

let weatherAlerts = [
  {
    id: "w1",
    type: "sirocco" as const,
    titleAr: "تنبيه: رياح جنوبية حارة ومغبرة (الشهيلي)",
    titleEn: "Alert: Hot Dusty Sirocco Wind (Chehili)",
    severity: "warning" as const,
    descriptionAr: "من المتوقع هبوب رياح جنوبية قوية مغبرة تؤدي لارتفاع درجات الحرارة وانخفاض الرؤية. ينصح بضبط فترات السقي لتقليل تساقط الثمار والأزهار.",
    descriptionEn: "Strong hot dusty winds expected. High temperatures and low visibility. Adjust irrigation timing to reduce flower/fruit dropping.",
    date: "اليوم وطيلة الـ 48 ساعة القادمة"
  },
  {
    id: "w2",
    type: "heatwave" as const,
    titleAr: "تحذير: ذروة موجة حرارة تفوق 46° مئوية",
    titleEn: "Warning: Heatwave peak exceeding 46°C",
    severity: "danger" as const,
    descriptionAr: "موجة حرارية شديدة تجتاح ولاية الوادي. تجنب التسميد الكيميائي السائل خلال النهار، وقم بالسقي رشا غزيرا في الصباح الباكر أو ساعة متأخرة من المساء لدعم نبتة البطاطا وحماية سعف النخيل.",
    descriptionEn: "Severe heatwave across El Oued. Protect crops, irrigate in early morning or late evening, avoid daytime chemical fertilization.",
    date: "خلال الـ 3 أيام القادمة"
  }
];

let serviceProviders = [
  {
    id: "s1",
    name: "م. محمد الهادي زعبوب",
    specialty: "consultant" as const,
    experience: 12,
    rating: 4.9,
    phone: "+213 655 49 88 12",
    location: "حاسي خليفة",
    description: "مستشار زراعي متخصص في تحليل التربة الرملية وتخطيط محاصيل البطاطا والري المحوري بمقاطعة الوادي.",
    isVerified: true
  },
  {
    id: "s2",
    name: "عمي عمار البياضي",
    specialty: "technician" as const,
    experience: 20,
    rating: 4.8,
    phone: "+213 540 22 91 03",
    location: "البياضة",
    description: "خبير صيانة وصعود النخيل وتلقيح الزرج واستئصال حشرة بوفروة بالطرق التقليدية والحديثة.",
    isVerified: true
  },
  {
    id: "s3",
    name: "التقني بشير قمار",
    specialty: "irrigation" as const,
    experience: 8,
    rating: 4.7,
    phone: "+213 772 13 40 59",
    location: "قمار",
    description: "تركيب وصيانة شبكات الري بالتنقيط، برمجة لوحات التحكم الذكية لمضخات الآبار الشمسية.",
    isVerified: true
  },
  {
    id: "s4",
    name: "شركة الوديان للأشغال",
    specialty: "laborer" as const,
    experience: 6,
    rating: 4.6,
    phone: "+213 550 81 77 02",
    location: "الرباح",
    description: "توفير فرق العمال الموسمية لنزع الحشائش وجمع البطاطا وتعبئة المحاصيل تحت إشراف هندسي.",
    isVerified: false
  }
];

let marketplaceProducts = [
  {
    id: "m1",
    companyName: "شركة الوديان للمدخلات الفلاحية",
    title: "بذور بطاطا صنف 'سبونتا' الهولندية الأصلية",
    category: "seeds" as const,
    type: "buy" as const,
    price: 32000,
    unit: "قنطار",
    description: "بذور بطاطا سبونتا ذات جودة عالية وإنتاجية ممتازة وملائمة تماما لتربة وادي سوف الرملية. حاصلة على شهادة المطابقة البيولوجية.",
    phone: "+213 549 598 307",
    location: "كوينين",
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600",
    isAvailable: true
  },
  {
    id: "m2",
    companyName: "مؤسسة سوف للآلات الزراعية",
    title: "مضخة مياه غاطسة بقوة 15 حصان تعمل بالطاقة الشمسية",
    category: "machinery" as const,
    type: "buy" as const,
    price: 480000,
    unit: "جهاز كامل",
    description: "نظام ضخ مياه ذكي للآبار العميقة مجهز بألواح شمسية ومحول طاقة ذكي ذو كفاءة عالية في ظروف صيف الرمال.",
    phone: "+213 655 12 30 40",
    location: "الرقيبة",
    imageUrl: "https://images.unsplash.com/photo-1595182877114-f81df6822a94?auto=format&fit=crop&q=80&w=600",
    isAvailable: true
  },
  {
    id: "m3",
    companyName: "سوف إيجار العتاد",
    title: "جرار فلاحي نيوهولاند 110 حصان للإيجار مع السائق",
    category: "machinery" as const,
    type: "rent" as const,
    price: 15000,
    unit: "يوم واحد",
    description: "جرار حديث مجهز لشق القنوات الزراعية وتقليب التربة الرملية وتحضيرها لغرس البطاطا الطازجة أو شتلات الطماطم.",
    phone: "+213 771 99 82 11",
    location: "الدبيلة",
    imageUrl: "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=600",
    isAvailable: true
  },
  {
    id: "m4",
    companyName: "مؤسسة النخلة للأسمدة العضوية",
    title: "سماد سوف العضوي المعالج حرارياً (خام طبيعي)",
    category: "fertilizers" as const,
    type: "buy" as const,
    price: 1400,
    unit: "كيس 50 كغ",
    description: "سماد عضوي بلدي مجهز ومطهر تماماً خالي من بذور الأعشاب الضارة والديدان السلكية. مثالي لإثراء المواد العضوية في حقول الغوط الرملي.",
    phone: "+213 540 22 18 90",
    location: "ورماس",
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600",
    isAvailable: true
  }
];

let courses = [
  {
    id: "c1",
    title: "الدورة التطبيقية المتكاملة لزراعة البطاطا الصحراوية بوادي سوف",
    instructor: "م. ماريه بروبة",
    instructorRole: "مؤسس شريك - مهندسة دولة وباحثة في محاصيل التربة الرملية",
    description: "دورة شاملة تمتد من تحضير الأراضي الرملية وتطهير البذور، إلى نظام السقي بالرش والري المحوري، وختاماً بمراحل التلوين وخرط البطاطا والتخزين المبرد لمواجهة صيف الرمال الساخنة.",
    category: "crops",
    duration: "12 حصة مصورة (15 ساعة)",
    lessonsCount: 12,
    videoUrl: "https://www.youtube.com/embed/zH0F6LclisY", // standard high-quality agriculture background video embed
    thumbnail: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=600",
    documents: [
      { title: "كتيب الدليل الميداني لزراعة البطاطا بالوادي.pdf", size: "8.4 MB", downloadUrl: "#" },
      { title: "مخطط التسميد الكيميائي والورقي حسب نمو النبتة.xlsx", size: "2.1 MB", downloadUrl: "#" }
    ],
    isPremium: false
  },
  {
    id: "c2",
    title: "العناية المتكاملة بالنخيل وتثبيت إنتاج دقلة نور الفاخرة",
    instructor: "م. إكرام محده",
    instructorRole: "مؤسس شريك - مهندسة دولة في الإنتاج النباتي ووقاية النباتات",
    description: "نهج حديث لخدمة بساتين النخيل بوادي سوف. تشمل الدروس: التلقيح المناسب، تقليم الجريد وحماية العراجين، التعرف المبكر على سوسة النخيل وبوفروة، واستخدام مصائد الفرمونات بطرق علمية.",
    category: "sustainability",
    duration: "8 حصص تطبيقية (10 ساعات)",
    lessonsCount: 8,
    videoUrl: "https://www.youtube.com/embed/S2O6-VcoTts",
    thumbnail: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=600",
    documents: [
      { title: "الدليل الشامل للتعرف على آفات النخيل وطرق مكافحتها.pdf", size: "12.3 MB", downloadUrl: "#" }
    ],
    isPremium: false
  },
  {
    id: "c3",
    title: "تصميم وإدارة أنظمة الري بالتنقيط المتطورة وحسابات الاحتياج المائي بالصحراء",
    instructor: "أ.د. سمير مرداسي",
    instructorRole: "أستاذ مشرف بجامعة حمة لخضر بالوادي ومستشار التطوير الزراعي",
    description: "بوابة علمية للمهندسين والطلبة لحساب كمية تدفق المياه وموازاة طاقة الضخ الشمسية مع عمق المياه الجوفية، لتلافي ملوحة التربة والتصريف السيء في حوض بساتين سوف.",
    category: "irrigation",
    duration: "10 محاضرات (12 ساعة)",
    lessonsCount: 10,
    videoUrl: "https://www.youtube.com/embed/hK2L16xXv7k",
    thumbnail: "https://images.unsplash.com/photo-1463123081488-729f378ea354?auto=format&fit=crop&q=80&w=600",
    documents: [
      { title: "جداول حساب تدفق مياه الآبار الجوفية وتوازن الملوحة.pdf", size: "4.5 MB", downloadUrl: "#" },
      { title: "كتيب تصميم أنظمة ري المزروعات البلاستيكية.pdf", size: "6.7 MB", downloadUrl: "#" }
    ],
    isPremium: true
  }
];

let customInquiries: any[] = [];
let customServicesRequests: any[] = [];
let customPostedProducts: any[] = [];

// Secure User Hashing and Management system
function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

const salt1 = "salt_mariaberrouba";
const salt2 = "salt_ikrammahda";
const salt3 = "salt_abderzak";
const salt4 = "salt_company";
const salt5 = "salt_farmer";
const salt6 = "salt_student";
const salt7 = "salt_worker";
const salt8 = "salt_merdassi";

let usersAccounts: any[] = [
  {
    id: "user_5",
    name: "م. ماريه بروبة",
    email: "mariaberrouba@gmail.com",
    phone: "+213 549 598 307",
    role: "FOUNDER", // مؤسس شريك
    salt: salt1,
    passwordHash: hashPassword("FounderPassword123", salt1),
    companyName: "مؤسس شريك - مهندسة دولة ومسؤولة المشروع",
    location: "الوادي"
  },
  {
    id: "user_ikram",
    name: "م. إكرام محده",
    email: "ikram.platform@gmail.com",
    phone: "+213 549 598 307",
    role: "FOUNDER", // مؤسس شريك
    salt: salt2,
    passwordHash: hashPassword("FounderPassword123", salt2),
    companyName: "مؤسس شريك - مهندسة دولة ومسؤولة المشروع",
    location: "الوادي"
  },
  {
    id: "user_merdassi",
    name: "أ.د. سمير مرداسي",
    email: "samir.merdassi@univ-eloued.dz",
    phone: "+213 549 598 307",
    role: "SUPERVISOR", // المشرف العلمي العام
    salt: salt8,
    passwordHash: hashPassword("SupervisorPassword123", salt8),
    companyName: "المشرف العلمي والأكاديمي - جامعة الوادي",
    location: "الوادي"
  },
  {
    id: "user_3",
    name: "م. عبد الرزاق سوفي",
    email: "abderzak.expert@hodint.dz",
    phone: "+213 775 30 11 02",
    role: "EXPERT", // خبير فلاحي
    salt: salt3,
    passwordHash: hashPassword("ExpertPassword123", salt3),
    specialty: "أنظمة ري طاقة شمسية ومكافحة آفات النخيل",
    institution: "مستشار عمومي معتمد"
  },
  {
    id: "user_4",
    name: "ممثِّل شركة ري السوف",
    email: "contact@soof-mir.com",
    phone: "+213 540 22 18 90",
    role: "COMPANY", // حساب شركة
    salt: salt4,
    passwordHash: hashPassword("CompanyPassword123", salt4),
    companyName: "سوف لتقنيات الري والتجهيزات"
  },
  {
    id: "user_1",
    name: "عمي بلقاسم السوفي",
    email: "belgasem@gmail.com",
    phone: "+213 655 89 22 10",
    role: "FARMER", // حساب فلاح
    salt: salt5,
    passwordHash: hashPassword("FarmerPassword123", salt5),
    location: "حاسي خليفة"
  },
  {
    id: "user_2",
    name: "منير سلطاني",
    email: "mounir.student@univ-eloued.dz",
    phone: "+213 550 12 34 56",
    role: "STUDENT", // حساب طالب
    salt: salt6,
    passwordHash: hashPassword("StudentPassword123", salt6),
    academicYear: "سنة ثالثة ليسانس زراعة صحراوية",
    institution: "جامعة الشهيد حمه لخضر - الوادي"
  },
  {
    id: "user_work",
    name: "عمي عمار البياضي",
    email: "amar@gmail.com",
    phone: "+213 540 22 91 03",
    role: "WORKER", // حساب عامل أو مقدم خدمة
    salt: salt7,
    passwordHash: hashPassword("WorkerPassword123", salt7),
    location: "البياضة"
  }
];

// Lazy initialization logic for server-side Gemini
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("لم يتم تكوين مفتاح GEMINI_API_KEY في إعدادات المنصة. يرجى تفعيله من لوحة الأسرار.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "HodInt" });
  });

  // ==================== AUTHENTICATION & SECURITY ENDPOINTS ====================

  // 1. Safe Auth Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "الرجاء إدخال البريد الإلكتروني وكلمة المرور." });
    }

    const user = usersAccounts.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: "البريد الإلكتروني المدخل غير مسجل بالمنصة." });
    }

    const inputHash = hashPassword(password, user.salt);
    if (inputHash !== user.passwordHash) {
      return res.status(401).json({ success: false, error: "كلمة المرور غير صحيحة، يرجى المحاولة مجدداً." });
    }

    // Exclude security credentials
    const { passwordHash, salt, ...profile } = user;
    res.json({
      success: true,
      user: profile,
      sessionToken: "token_" + crypto.randomBytes(8).toString("hex")
    });
  });

  // 2. Register new member (Public or Manager)
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, phone, role, location, companyName, academicYear, institution, specialty } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: "المعلومات الأساسية (الاسم، البريد، كلمة المرور، والرتبة المطلوبة) إجبارية." });
    }

    const exists = usersAccounts.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, error: "البريد الإلكتروني هذا مستخدم بالفعل في حساب آخر." });
    }

    const userSalt = generateSalt();
    const newUser = {
      id: "u_" + Date.now(),
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      role,
      salt: userSalt,
      passwordHash: hashPassword(password, userSalt),
      location,
      companyName,
      academicYear,
      institution,
      specialty,
      isCustom: true
    };

    usersAccounts.push(newUser);
    
    // Exclude security credentials
    const { passwordHash: _, salt: __, ...profile } = newUser;
    res.json({ success: true, user: profile });
  });

  // 3. Change Password
  app.post("/api/auth/change-password", (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "جميع الحقول مطلوبة لتعديل كلمة المرور." });
    }

    const user = usersAccounts.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, error: "المستخدم غير موجود." });
    }

    const oldHash = hashPassword(oldPassword, user.salt);
    if (oldHash !== user.passwordHash) {
      return res.status(401).json({ success: false, error: "كلمة المرور الحالية غير صحيحة." });
    }

    user.passwordHash = hashPassword(newPassword, user.salt);
    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح." });
  });

  // 4. Recovery/Forgot Password (Simulation)
  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "الرجاء إدخال البريد الإلكتروني." });
    }

    const user = usersAccounts.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, error: "هذا البريد غير مسجل بنظام HodInt." });
    }

    // Set a random temp password and return it in simulation (so users can easily test it)
    const tempPass = "Reset" + Math.floor(1000 + Math.random() * 9000);
    user.passwordHash = hashPassword(tempPass, user.salt);

    res.json({
      success: true,
      message: `تم إرسال رمز استعادة كلمة المرور لبريدك. للمحاكاة الفورية، تم إعداد كلمة المرور المؤقتة لتبسيط تجربتك.`,
      tempPassword: tempPass
    });
  });

  // 5. Admin Manage Users
  app.get("/api/admin/users", (req, res) => {
    // Return sanitized users
    const sanitized = usersAccounts.map(({ passwordHash, salt, ...u }) => u);
    res.json({ success: true, users: sanitized });
  });

  app.post("/api/admin/users", (req, res) => {
    const { name, email, password, phone, role, location, companyName, academicYear, institution, specialty } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: "الحقول الأساسية ضرورية لإنشاء العضو." });
    }

    const exists = usersAccounts.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, error: "هذا البريد الإلكتروني مستعمل بالفعل." });
    }

    const userSalt = generateSalt();
    const newUser = {
      id: "u_admin_" + Date.now(),
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      role,
      salt: userSalt,
      passwordHash: hashPassword(password, userSalt),
      location,
      companyName,
      academicYear,
      institution,
      specialty,
      isCustom: true
    };

    usersAccounts.push(newUser);
    const sanitized = usersAccounts.map(({ passwordHash, salt, ...u }) => u);
    res.json({ success: true, users: sanitized });
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    const { id } = req.params;
    if (id === "user_5") {
      return res.status(400).json({ success: false, error: "لا يمكن حذف حساب المدير العام الأساسي للمنصة!" });
    }
    usersAccounts = usersAccounts.filter(u => u.id !== id);
    const sanitized = usersAccounts.map(({ passwordHash, salt, ...u }) => u);
    res.json({ success: true, users: sanitized });
  });

  app.put("/api/admin/users/:id/role", (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, error: "الرجاء تزويد الرتبة المطلوبة للترقية." });
    }
    const idx = usersAccounts.findIndex(u => u.id === id);
    if (idx !== -1) {
      usersAccounts[idx].role = role;
      const sanitized = usersAccounts.map(({ passwordHash, salt, ...u }) => u);
      return res.json({ success: true, users: sanitized });
    }
    res.status(404).json({ success: false, error: "المستخدم غير موجود." });
  });

  // API 1: Prices retrieval & contribution
  app.get("/api/prices", (req, res) => {
    res.json({ success: true, count: marketPrices.length, prices: marketPrices });
  });

  app.post("/api/prices", (req, res) => {
    const { nameAr, nameEn, category, currentPrice, yesterdayPrice, trend, icon } = req.body;
    if (!nameAr || !currentPrice) {
      return res.status(400).json({ success: false, error: "الرجاء توفير اسم المنتج باللغة العربية والسعر الحالي." });
    }
    const newPriceItem = {
      id: "p_" + Date.now(),
      nameAr,
      nameEn: nameEn || nameAr,
      category: category || "vegetables",
      currentPrice: Number(currentPrice),
      yesterdayPrice: yesterdayPrice ? Number(yesterdayPrice) : Number(currentPrice),
      trend: trend || "stable",
      icon: icon || "🥬"
    };
    marketPrices.unshift(newPriceItem);
    res.json({ success: true, item: newPriceItem, prices: marketPrices });
  });

  app.put("/api/prices/:id", (req, res) => {
    const { id } = req.params;
    const { nameAr, nameEn, category, currentPrice, yesterdayPrice, trend, icon } = req.body;
    const index = marketPrices.findIndex(p => p.id === id);
    if (index !== -1) {
      marketPrices[index] = {
        ...marketPrices[index],
        nameAr: nameAr || marketPrices[index].nameAr,
        nameEn: nameEn || marketPrices[index].nameEn,
        category: category || marketPrices[index].category,
        currentPrice: currentPrice !== undefined ? Number(currentPrice) : marketPrices[index].currentPrice,
        yesterdayPrice: yesterdayPrice !== undefined ? Number(yesterdayPrice) : marketPrices[index].yesterdayPrice,
        trend: trend || marketPrices[index].trend,
        icon: icon || marketPrices[index].icon
      };
      return res.json({ success: true, item: marketPrices[index], prices: marketPrices });
    }
    res.status(404).json({ success: false, error: "لم يتم العثور على المنتج المطلوب لتعديله." });
  });

  app.delete("/api/prices/:id", (req, res) => {
    const { id } = req.params;
    marketPrices = marketPrices.filter(p => p.id !== id);
    res.json({ success: true, prices: marketPrices });
  });

  // API 2: Weather and climate alerts
  app.get("/api/weather-alerts", (req, res) => {
    res.json({ success: true, alerts: weatherAlerts });
  });

  // API 3: Service provider registration & request posting
  app.get("/api/services", (req, res) => {
    res.json({ success: true, providers: serviceProviders, requests: customServicesRequests });
  });

  app.post("/api/services/request", (req, res) => {
    const { farmerName, phone, location, serviceNeeded, description } = req.body;
    if (!farmerName || !phone || !serviceNeeded) {
      return res.status(400).json({ success: false, error: "الرجاء ملء الخانات الإجبارية (الاسم، الهاتف وتوصيف الخدمة المطلوب)." });
    }
    const newRequest = {
      id: "sr_" + Date.now(),
      farmerName,
      phone,
      location: location || "الوادي",
      serviceNeeded,
      description,
      status: "pending",
      date: new Date().toLocaleDateString("ar-DZ")
    };
    customServicesRequests.unshift(newRequest);
    res.json({ success: true, data: newRequest, requests: customServicesRequests });
  });

  app.delete("/api/services/request/:id", (req, res) => {
    const { id } = req.params;
    customServicesRequests = customServicesRequests.filter(r => r.id !== id);
    res.json({ success: true, requests: customServicesRequests });
  });

  // API 4: Marketplace operations
  app.get("/api/marketplace", (req, res) => {
    res.json({
      success: true,
      products: [...customPostedProducts, ...marketplaceProducts]
    });
  });

  app.post("/api/marketplace/product", (req, res) => {
    const { companyName, title, category, type, price, unit, description, phone, location, imageUrl } = req.body;
    if (!companyName || !title || !price || !phone) {
      return res.status(400).json({ success: false, error: "المعلومات الأساسية (الشركة، العنوان، السعر والهاتف) إجبارية." });
    }
    const newProduct = {
      id: "m_custom_" + Date.now(),
      companyName,
      title,
      category: category || "tools",
      type: type || "buy",
      price: Number(price),
      unit: unit || "قطعة",
      description: description || "",
      phone,
      location: location || "الوادي",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600",
      isAvailable: true
    };
    customPostedProducts.unshift(newProduct);
    res.json({ success: true, item: newProduct });
  });

  app.put("/api/marketplace/product/:id", (req, res) => {
    const { id } = req.params;
    const { companyName, title, category, type, price, unit, description, phone, location, imageUrl } = req.body;
    
    let found = false;
    const customIdx = customPostedProducts.findIndex(p => p.id === id);
    if (customIdx !== -1) {
      customPostedProducts[customIdx] = {
        ...customPostedProducts[customIdx],
        companyName: companyName || customPostedProducts[customIdx].companyName,
        title: title || customPostedProducts[customIdx].title,
        category: category || customPostedProducts[customIdx].category,
        type: type || customPostedProducts[customIdx].type,
        price: price !== undefined ? Number(price) : customPostedProducts[customIdx].price,
        unit: unit || customPostedProducts[customIdx].unit,
        description: description || customPostedProducts[customIdx].description,
        phone: phone || customPostedProducts[customIdx].phone,
        location: location || customPostedProducts[customIdx].location,
        imageUrl: imageUrl || customPostedProducts[customIdx].imageUrl
      };
      found = true;
    } else {
      const defaultIdx = marketplaceProducts.findIndex(p => p.id === id);
      if (defaultIdx !== -1) {
        marketplaceProducts[defaultIdx] = {
          ...marketplaceProducts[defaultIdx],
          companyName: companyName || marketplaceProducts[defaultIdx].companyName,
          title: title || marketplaceProducts[defaultIdx].title,
          category: category || marketplaceProducts[defaultIdx].category,
          type: type || marketplaceProducts[defaultIdx].type,
          price: price !== undefined ? Number(price) : marketplaceProducts[defaultIdx].price,
          unit: unit || marketplaceProducts[defaultIdx].unit,
          description: description || marketplaceProducts[defaultIdx].description,
          phone: phone || marketplaceProducts[defaultIdx].phone,
          location: location || marketplaceProducts[defaultIdx].location,
          imageUrl: imageUrl || marketplaceProducts[defaultIdx].imageUrl
        };
        found = true;
      }
    }
    
    if (found) {
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, error: "لم يتم العثور على المعروض المطلوب لتعديله." });
  });

  app.delete("/api/marketplace/product/:id", (req, res) => {
    const { id } = req.params;
    customPostedProducts = customPostedProducts.filter(p => p.id !== id);
    marketplaceProducts = marketplaceProducts.filter(p => p.id !== id);
    res.json({ success: true });
  });

  // API 5: Educational courses
  app.get("/api/courses", (req, res) => {
    res.json({ success: true, courses });
  });

  app.post("/api/courses", (req, res) => {
    const { title, instructor, instructorRole, description, category, duration, lessonsCount, videoUrl, thumbnail, documents, isPremium } = req.body;
    if (!title || !instructor || !description) {
      return res.status(400).json({ success: false, error: "الرجاء توفير عنوان الدورة، اسم المحاضر ووصف الدورة." });
    }
    const newCourse = {
      id: "c_" + Date.now(),
      title,
      instructor,
      instructorRole: instructorRole || "خبير زراعي متميز بـ HodInt",
      description,
      category: category || "crops",
      duration: duration || "5 حصص (8 ساعات)",
      lessonsCount: lessonsCount ? Number(lessonsCount) : 5,
      videoUrl: videoUrl || "https://www.youtube.com/embed/zH0F6LclisY",
      thumbnail: thumbnail || "https://images.unsplash.com/photo-1463123081488-729f378ea354?auto=format&fit=crop&q=80&w=600",
      documents: documents || [{ title: "مادة علمية - منصة هودنت.pdf", size: "3.2 MB", downloadUrl: "#" }],
      isPremium: !!isPremium
    };
    courses.unshift(newCourse);
    res.json({ success: true, course: newCourse, courses });
  });

  app.delete("/api/courses/:id", (req, res) => {
    const { id } = req.params;
    const index = courses.findIndex(c => c.id === id);
    if (index !== -1) {
      courses.splice(index, 1);
      return res.json({ success: true, courses });
    }
    res.status(404).json({ success: false, error: "الدورة المطلوب حذفها غير موجودة." });
  });

  // Dynamic Weather & Climate alerts endpoints
  app.post("/api/weather-alerts", (req, res) => {
    const { type, titleAr, titleEn, severity, descriptionAr, descriptionEn, date } = req.body;
    if (!titleAr || !descriptionAr) {
      return res.status(400).json({ success: false, error: "الرجاء تزويد عنوان وتفاصيل التنبيه بالعربية." });
    }
    const newAlert = {
      id: "w_" + Date.now(),
      type: type || "heatwave",
      titleAr,
      titleEn: titleEn || titleAr,
      severity: severity || "warning",
      descriptionAr,
      descriptionEn: descriptionEn || descriptionAr,
      date: date || "تحديث فوري نشط"
    };
    weatherAlerts.unshift(newAlert);
    res.json({ success: true, alert: newAlert, alerts: weatherAlerts });
  });

  app.delete("/api/weather-alerts/:id", (req, res) => {
    const { id } = req.params;
    const index = weatherAlerts.findIndex(a => a.id === id);
    if (index !== -1) {
      weatherAlerts.splice(index, 1);
      return res.json({ success: true, alerts: weatherAlerts });
    }
    res.status(404).json({ success: false, error: "التنبيه المناخي غير موجود." });
  });

  // User inquiries (Contact messaging & response board)
  app.get("/api/inquiries", (req, res) => {
    res.json({ success: true, inquiries: customInquiries });
  });

  app.post("/api/inquiries", (req, res) => {
    const { senderName, senderEmail, senderPhone, subject, message } = req.body;
    if (!senderName || !message) {
      return res.status(400).json({ success: false, error: "الاسم ونص الرسالة ضروريين لإرسال الطلب." });
    }
    const newInquiry = {
      id: "inq_" + Date.now(),
      senderName,
      senderEmail: senderEmail || "بريد غير متوفر",
      senderPhone: senderPhone || "غير متوفر",
      subject: subject || "استفسار تقني عام",
      message,
      response: null,
      respondedAt: null,
      date: new Date().toLocaleDateString("ar-DZ") + " " + new Date().toLocaleTimeString("ar-DZ")
    };
    customInquiries.unshift(newInquiry);
    res.json({ success: true, inquiry: newInquiry, inquiries: customInquiries });
  });

  app.post("/api/inquiries/respond/:id", (req, res) => {
    const { id } = req.params;
    const { responseText } = req.body;
    if (!responseText) {
      return res.status(400).json({ success: false, error: "نص الرد لا يمكن أن يكون فارغاً." });
    }
    const index = customInquiries.findIndex(i => i.id === id);
    if (index !== -1) {
      customInquiries[index].response = responseText;
      customInquiries[index].respondedAt = new Date().toLocaleDateString("ar-DZ") + " " + new Date().toLocaleTimeString("ar-DZ");
      return res.json({ success: true, inquiries: customInquiries });
    }
    res.status(404).json({ success: false, error: "الرسالة المستهدفة للرد غير موجودة." });
  });

  // API 6: Smart AI Assistant (Gemini 3.8 Flash server-side integration)
  app.post("/api/assistant", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "طلب المساعدة فارغ." });
    }

    try {
      const ai = getGeminiClient();

      // Formulate custom system instructions tailored to Algerian agriculture, specifically El Oued (Valley of Thousand Domes, sandy soil, date palms, pivot potatoes, extreme desert climate).
      const systemInstruction = 
        `أنت مستشار زراعي ذكي وخبير تقني يعمل في منصة "HodInt" (منصة هودنت للحلول والتعليم الزراعي). 
        
        الهيئة التأسيسية والإشراف الأكاديمي على المنصة:
        1. المهندسة ماريه بروبة (م. ماريه بروبة): مؤسس شريك ومهندسة دولة في العلوم الفلاحية والإنتاج النباتي (جامعة الشهيد حمه لخضر - الوادي)، باحثة متخصصة في علوم التربة الرملية وتطوير محاصيل البطاطا والري المحوري والتسميد المتوازن.
        2. المهندسة إكرام محده (م. إكرام محده): مؤسس شريك ومهندسة دولة في العلوم الفلاحية والإنتاج النباتي (جامعة الشهيد حمه لخضر - الوادي)، متخصصة في رعاية النخيل والتمور (دقلة نور والغرس) والوقاية والتشخيص المبكر للآفات كالبيوض وبوفروة وسوسة النخيل.
        كلا المهندستين المؤسستين لهما نفس الرتبة والقيمة القيادية التأسيسية للمنصة بدون أي تفاوت.
        3. الأستاذ الدكتور سمير مرداسي (أ.د. سمير مرداسي): المشرف العلمي والأكاديمي على المنصة، أستاذ وباحث خبير في الأنظمة الفلاحية والبيئات الصحراوية بكلية علوم الطبيعة والحياة بجامعة الشهيد حمه لخضر - ولاية الوادي.
        
        إذا سألك أي مستخدم عن المؤسسين أو من أنشأ المنصة أو من يشرف عليها، اذكر هذه الأسماء الثلاثة بوضوح وبكل تقدير واعتزاز مع تخصصاتهم ومساهماتهم.

        مميزات الزراعة في ولاية الوادي (واد سوف):
        1. زراعة البطاطا الرائدة في الجزائر باستخدام الري المحوري الرشاش والزراعة في حفر الرمل وسهول الكثبان.
        2. زراعة النخيل (دقلة نور الجزائرية الفاخرة) وطرق خدمتها، بما في ذلك التحديات مثل آفة بوفروة (العناكب)، سوسة النخيل، ومرض البيوض.
        3. التربة الرملية شديدة النفاذية وفقيرة المواد العضوية، مما يتطلب تقنيات تسميد عضوي وتسميد ورقي متقدمة.
        4. الطقس الصحراوي القاسي (رياح الشهيلي الجنوبية المحملة بالأتربة، والحرارة المرتفعة جداً في الصيف التي تفوق 48 درجة مئوية، ومخاطر الصقيع في الشتاء).
        5. الاعتماد المتزايد على الطاقة الشمسية لضخ المياه الجوفية.

        التعليمات:
        - أجب باللغة العربية بأسلوب فصيح ومفهوم وودود جداً للفلاح الجزائري المهتم.
        - استخدم مصطلحات زراعية جزائرية متداولة (مثل "الشهيلي" للرياح الحارة، "الزرج" للتلقيح، "الجريد" لسعف النخيل، "الغبار" للسماد العضوي، "الدولاب" للمحور).
        - شجع التعاون الأكاديمي مع دكاترة وخبراء جامعة الوادي (جامعة الشهيد حمه لخضر).
        - قدم إرشادات دقيقة وعلمية لجدول غرس البطاطا (الدورة الخريفية والدورة الشتوية/الربيعية)، وعلم وقاية النبات ومكافحة الحشرات والري المناسب لتوفير المياه الجوفية.
        - حافظ على النبرة الاحترافية والداعمة للغاية.`;

      // Candidate models in order of priority & reliability (guarantees 100% uptime even during Google spikes)
      const candidateModels = [
        "gemini-3.1-flash-lite",
        "gemini-3.8-flash",
        "gemini-3.6-flash",
        "gemini-flash-latest"
      ];
      let responseText = "";
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: message,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7
            }
          });
          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Attempt with model ${modelName} failed:`, modelErr?.message || modelErr);
          lastError = modelErr;
        }
      }

      if (!responseText) {
        if (lastError) throw lastError;
        responseText = "عذراً، لم أستطع استخلاص جواب كافٍ حالياً. هل يمكنك إعادة توجيه سؤالك؟";
      }

      res.json({ success: true, reply: responseText });

    } catch (error: any) {
      console.error("Gemini API Error in /api/assistant:", error);
      let clientMsg = "حدث خطأ غير متوقع أثناء الاتصال بالذكاء الاصطناعي.";
      if (error.message && error.message.includes("GEMINI_API_KEY")) {
        clientMsg = error.message;
      } else if (error.message) {
        clientMsg = `خطأ في الاتصال بالذكاء الاصطناعي: ${error.message}`;
      }
      res.status(500).json({ success: false, error: clientMsg });
    }
  });

  // Static assets and Vite middleware mount
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HodInt full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start HodInt server:", err);
});
