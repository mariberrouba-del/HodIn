import React, { useState } from "react";
import { Course } from "../types";
import {
  BookOpen, Video, FileText, Download, Play, Filter, CheckCircle,
  Upload, Plus, Sparkles, Star, Lock, Unlock, ShieldCheck, Award, Layers,
  X, CreditCard, Check
} from "lucide-react";
import { motion } from "motion/react";

interface EducationProps {
  courses: Course[];
  userRole: string;
}

export default function Education({ courses, userRole }: EducationProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<"all" | "free" | "paid">("all");
  const [activeCourse, setActiveCourse] = useState<Course | null>(courses[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [unlockedCourses, setUnlockedCourses] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem("unlocked_education_courses");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [showPayModal, setShowPayModal] = useState(false);
  const [unlockSuccess, setUnlockSuccess] = useState(false);
  const [paperUploadSuccess, setPaperUploadSuccess] = useState<string | null>(null);

  // When activeCourse changes, reset chapter and playing
  const handleSelectCourse = (course: Course) => {
    setActiveCourse(course);
    setActiveChapterIndex(0);
    setIsPlaying(false);
  };

  const handleUnlockCurrentCourse = () => {
    if (!activeCourse) return;
    const updated = { ...unlockedCourses, [activeCourse.id]: true };
    setUnlockedCourses(updated);
    localStorage.setItem("unlocked_education_courses", JSON.stringify(updated));
    setUnlockSuccess(true);
    setTimeout(() => {
      setShowPayModal(false);
      setUnlockSuccess(false);
    }, 1500);
  };

  // Form states for uploading material
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialAuthor, setMaterialAuthor] = useState("");
  const [materialCategory, setMaterialCategory] = useState("crops");
  const [materialDesc, setMaterialDesc] = useState("");

  const categories = [
    { value: "all", label: "كل التصنيفات الوازنة" },
    { value: "crops", label: "زراعة المحاصيل صحراوياً" },
    { value: "irrigation", label: "أنظمة وقنوات الري الذكي" },
    { value: "soil", label: "التربة والتأهيل الرملي" },
    { value: "sustainability", label: "الاستدامة والمكافحة الحيوية" }
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchesTier =
      tierFilter === "all"
        ? true
        : tierFilter === "paid"
        ? Boolean(c.isPremium)
        : !c.isPremium;
    return matchesCategory && matchesTier;
  });

  const handleUploadMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle || !materialAuthor || !materialDesc) {
      alert("الرجاء ملء كافة الحقول لإرسال المادة الزراعية.");
      return;
    }
    setPaperUploadSuccess(`تم إرسال مسودتك "${materialTitle}" بنجاح! سيراجعها طاقمنا الأكاديمي والمهندسة ماريه بروبة والمهندسة إكرام محده قبل النشر على فلاحي سوف.`);
    setMaterialTitle("");
    setMaterialAuthor("");
    setMaterialDesc("");
    setTimeout(() => setPaperUploadSuccess(null), 8500);
  };

  // Mock chapters based on courses
  const getMockChapters = (courseId: string) => {
    if (courseId === "c1") {
      return [
        { num: "01", title: "مقدمة عن تربة سوف الرملية وخواصها الفيزيائية" },
        { num: "02", title: "مواعيد غرس البطاطا: الدورة الخريفية والشتوية" },
        { num: "03", title: "تطهير الدرنات وحساب نسب الغرس الفضلى" },
        { num: "04", title: "تصميم مدرج السقي الرشاش بالري المحوري والدولاب" },
        { num: "05", title: "التكامل السمادي الكهرومغناطيسي للمياه الجوفية" },
        { num: "06", title: "علامات نضج مزارع البطاطا ومرحلة القلع السليم" }
      ];
    }
    if (courseId === "c2") {
      return [
        { num: "01", title: "شجرة النخيل في واحات الوادي وتاريخ غرسها" },
        { num: "02", title: "تلقيح النخيل بوادي سوف (الزرج) والرياح الجنوبية" },
        { num: "03", title: "مرض دودة التمر وبوفروة (العنكبوت الغباري)" },
        { num: "04", title: "سوسة النخيل الحمراء والبيوض: سبل الوقاية الحديثة" },
        { num: "05", title: "تدلية العراجين وتقليم الجريد لحمايته من رياح السموم" }
      ];
    }
    return [
      { num: "01", title: "ميكانيكا السوائل والضخ المائي ومستويات الآبار بالولاية" },
      { num: "02", title: "تكامل الخلايا الكهروضوئية مع مضخات الآبار الصحراوية" },
      { num: "03", title: "مفاتيح وصمامات التفريغ وحامل الموزع بالتنقيط" },
      { num: "04", title: "معالجة ملوحة المياه الجوفية وتجنب ديدان نيماتودا التربة" }
    ];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" dir="rtl">
      
      {/* Category Selection Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        {/* Tier Filter: Free vs Paid */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-slate-850 shadow-xl space-y-3"
        >
          <div className="flex items-center gap-2 font-bold text-slate-100 border-b border-slate-800/80 pb-3 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>نوع الدورة والاشتراك</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setTierFilter("all")}
              className={`w-full text-right p-2.5 rounded-xl transition text-xs font-bold flex items-center justify-between cursor-pointer ${
                tierFilter === "all"
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "bg-slate-950/40 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>جميع المقررات ({courses.length})</span>
              {tierFilter === "all" && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button
              onClick={() => setTierFilter("free")}
              className={`w-full text-right p-2.5 rounded-xl transition text-xs font-bold flex items-center justify-between cursor-pointer ${
                tierFilter === "free"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60 shadow-sm"
                  : "bg-slate-950/40 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>المقررات المجانية ({courses.filter(c => !c.isPremium).length})</span>
              </div>
              {tierFilter === "free" && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button
              onClick={() => setTierFilter("paid")}
              className={`w-full text-right p-2.5 rounded-xl transition text-xs font-bold flex items-center justify-between cursor-pointer ${
                tierFilter === "paid"
                  ? "bg-amber-950 text-amber-400 border border-amber-800/60 shadow-sm"
                  : "bg-slate-950/40 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>المقررات المدفوعة ({courses.filter(c => c.isPremium).length})</span>
              </div>
              {tierFilter === "paid" && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-slate-850 shadow-xl"
        >
          <div className="flex items-center gap-2 font-bold text-slate-100 mb-4 border-b border-slate-800/80 pb-3">
            <Filter className="w-5 h-5 text-emerald-400" />
            <span>تصنيفات التعلم والأبحاث</span>
          </div>
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`w-full text-right p-3 rounded-xl transition text-xs font-bold flex items-center justify-between cursor-pointer ${
                  selectedCategory === cat.value
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60 shadow-sm"
                    : "bg-slate-950/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{cat.label}</span>
                {selectedCategory === cat.value && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Comparison card: Free vs Paid */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 shadow-xl text-xs space-y-3"
        >
          <div className="flex items-center gap-2 font-bold text-amber-400 text-xs">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>دليل الفروق بين المقررات:</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/40">
              <span className="font-bold text-emerald-400 block mb-0.5">🌟 المقررات المجانية:</span>
              <p className="text-slate-300">متاحة بالكامل 100% لجميع الزوار مع حق مشاهدة الفيديوهات وتحميل المذكرات فورياً.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-900/40">
              <span className="font-bold text-amber-400 block mb-0.5">🔒 المقررات المدفوعة:</span>
              <p className="text-slate-300">تشمل درساً تمهيدياً مجانياً، وباقي الوحدات التخصصية والملفات الهندسية والشهادة المعتمدة تتطلب اشتراكاً من فضاء الطالب.</p>
            </div>
          </div>
        </motion.div>

        {/* Academic Supervision Credential Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-radial-[at_top] from-emerald-950/30 to-slate-950 p-5 rounded-3xl border border-emerald-900/30 shadow-xl text-xs space-y-3"
        >
          <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>هيئة الإرشاد والبحث العلمي</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-light">
            تعقد منصة "HodInt" بروتوكول تعاون معرفي مستمر مع المخابر البحثية بـ <strong>كلية علوم الطبيعة والحياة بجامعة الشهيد حمه لخضر - ولاية الوادي</strong>، وذلك بإشراف من <strong>الأستاذ الدكتور سمير مرداسي</strong> والمساهمات الرائدة للمهندسين المؤسسين <strong>م. ماريه بروبة</strong> و <strong>م. إكرام محده</strong>.
          </p>
        </motion.div>
      </div>

      {/* Main Educational Interface */}
      <div className="lg:col-span-9 space-y-8">
        
        {/* Stream and active course section */}
        {activeCourse && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-850 p-6 shadow-xl space-y-6"
          >
            {/* Top Banner Clarifying Free vs Paid Status */}
            {activeCourse.isPremium ? (
              <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-amber-300">
                      دورة تخصصية احترافية مدفوعة — السعر: {activeCourse.price ? `${activeCourse.price} دج` : "3,500 دج"}
                    </h4>
                    <p className="text-slate-300 text-[11px]">
                      الدرس الأول متاح للمعاينة المجانية، وباقي الحصص والشهادة الأكاديمية متاحة عبر الاشتراك في «فضاء الطالب».
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                    رسوم: {activeCourse.price || 3500} دج
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-emerald-300">
                      دورة تدريبية مجانية 100% مفتوحة للجميع
                    </h4>
                    <p className="text-slate-300 text-[11px]">
                      متاحة لجميع طلبة وفلاحي ولاية الوادي بدون أي رسوم، بما في ذلك مشاهدة كافة الدروس وتحميل المذكرات.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs shrink-0">
                  مجاني بالكامل (0 دج)
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left video player visualizer (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-[inset_0_0_12px_black] border border-slate-850 group">
                  {(() => {
                    const isCurrentChapterFree = !activeCourse.isPremium || activeChapterIndex === 0;
                    const isCourseUnlocked = Boolean(!activeCourse.isPremium || unlockedCourses[activeCourse.id]);
                    const hasAccess = isCurrentChapterFree || isCourseUnlocked;

                    if (!hasAccess) {
                      return (
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                            <Lock className="w-7 h-7" />
                          </div>
                          <div className="space-y-1 max-w-sm">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30 inline-block">
                              الدرس رقم {activeChapterIndex + 1} مقفل (محتوى مدفوع)
                            </span>
                            <h4 className="text-sm md:text-base font-black text-white">
                              هذا الدرس متاح حصرياً للمشتركين في المقرر الكامل
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              يشمل الاشتراك كافة الفيديوهات، الملفات الهندسية، مذكرات PDF، والاختبار التأهيلي للشهادة المعتمدة من جامعة الوادي.
                            </p>
                          </div>
                          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                            <button
                              onClick={() => setShowPayModal(true)}
                              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 transition"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>الاشتراك وتفعيل الوصول ({activeCourse.price || "3,500 دج"})</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveChapterIndex(0);
                                setIsPlaying(false);
                              }}
                              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs cursor-pointer transition"
                            >
                              الرجوع للدرس 1 المجاني
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (isPlaying) {
                      return (
                        <iframe
                          width="100%"
                          height="100%"
                          src={`${activeCourse.videoUrl}?autoplay=1`}
                          title={activeCourse.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        ></iframe>
                      );
                    }

                    return (
                      <>
                        <img
                          src={activeCourse.thumbnail}
                          alt={activeCourse.title}
                          className="w-full h-full object-cover opacity-50 transition group-hover:scale-105 duration-750"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent flex flex-col items-center justify-center p-4 text-center">
                          <button
                            onClick={() => setIsPlaying(true)}
                            className="w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-115 active:scale-95 cursor-pointer z-10"
                          >
                            <Play className="w-8 h-8 fill-current ml-1" />
                          </button>
                          <p className="mt-3 text-white text-xs font-bold tracking-wider filter drop-shadow">
                            {isCurrentChapterFree
                              ? `انقر لمشاهدة الدرس ${activeChapterIndex + 1} (معاينة مجانية)`
                              : `انقر لمشاهدة الدرس ${activeChapterIndex + 1} (الاشتراك مفعل)`}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                  
                  {activeCourse.isPremium ? (
                    <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-md z-12 flex items-center gap-1 shadow">
                      {unlockedCourses[activeCourse.id] ? (
                        <>
                          <Unlock className="w-3 h-3" />
                          <span>اشتراك مفعل بالكامل ✓</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>دورة مدفوعة ({activeCourse.price ? `${activeCourse.price} دج` : "3,500 دج"})</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-md z-12 shadow">
                      دورة مجانية 100%
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
                    <Video className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مدة الدرس: {activeCourse.duration}</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>المادة المقسمة: {activeCourse.lessonsCount || 6} دروس منسقة</span>
                  </span>
                </div>
              </div>

              {/* Right Course Info panel (5 cols) */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block bg-emerald-950/80 text-emerald-400 border border-emerald-900/60 text-xs px-2.5 py-1 rounded-md font-semibold font-sans">
                      {categories.find(c => c.value === activeCourse.category)?.label}
                    </span>
                    {activeCourse.isPremium ? (
                      <span className="inline-flex items-center gap-1 bg-amber-950/80 text-amber-300 border border-amber-800/60 text-xs px-2.5 py-1 rounded-md font-bold">
                        {unlockedCourses[activeCourse.id] ? (
                          <>
                            <Unlock className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">الاشتراك مفعل</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-amber-400" />
                            <span>مدفوع: {activeCourse.price || 3500} دج</span>
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="inline-block bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-xs px-2.5 py-1 rounded-md font-bold">
                        مجاني بالكامل
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 leading-snug">
                    {activeCourse.title}
                  </h3>
                  <div className="p-3 bg-slate-950/60 border border-slate-850/80 rounded-2xl space-y-1">
                    <p className="text-[10px] text-emerald-400 font-bold">بإشراف وتقديم الدكتور والمهندسين:</p>
                    <p className="text-sm font-bold text-slate-200">{activeCourse.instructor}</p>
                    <p className="text-[11px] text-slate-500">{activeCourse.instructorRole}</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {activeCourse.description}
                  </p>
                </div>

                {/* Course Documents Download Section */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>كتيبات ومصادر الرفع المتاحة ({activeCourse.documents.length})</span>
                    </span>
                    {activeCourse.isPremium && !unlockedCourses[activeCourse.id] && (
                      <span className="text-[10px] text-amber-400 font-bold">تحتاج اشتراك المساق</span>
                    )}
                  </h4>
                  <div className="space-y-1.5">
                    {activeCourse.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-950/60 p-2 px-3 rounded-xl border border-slate-850 text-xs">
                        <span className="text-slate-200 truncate max-w-[170px] font-medium" title={doc.title}>
                          {doc.title}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-500 font-mono">{doc.size}</span>
                          <button
                            onClick={() => {
                              if (activeCourse.isPremium && !unlockedCourses[activeCourse.id]) {
                                setShowPayModal(true);
                              } else {
                                alert(`بدء تحميل المستند: ${doc.title} لولاية الوادي`);
                              }
                            }}
                            className="bg-emerald-650 hover:bg-emerald-600 text-slate-100 p-1 px-3 rounded-lg transition-all text-xs flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>تحميل</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Curriculum chapter outline with lock status & interactive switcher */}
            <div className="pt-4 border-t border-slate-850 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-xs font-bold text-slate-250">
                  منهاج ومخرجات حصص المساق (انقر على الدرس لتجربة المعاينة أو القفل):
                </h4>
                {activeCourse.isPremium ? (
                  <div className="flex items-center gap-2">
                    {unlockedCourses[activeCourse.id] ? (
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>أنت مشترك (كافة الدروس مفتوحة)</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowPayModal(true)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer underline"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>فتح باقي الدروس ({activeCourse.price || "3500 دج"})</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-bold">
                    ✓ جميع الدروس مفتوحة بالمجان لجميع أبناء الوادي
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {getMockChapters(activeCourse.id).map((chap, idx) => {
                  const isLessonFree = !activeCourse.isPremium || idx === 0;
                  const isUnlocked = Boolean(unlockedCourses[activeCourse.id]);
                  const isSelected = activeChapterIndex === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveChapterIndex(idx);
                        setIsPlaying(false);
                      }}
                      className={`w-full text-right flex items-center justify-between p-3 rounded-2xl border transition text-xs cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                          : isLessonFree || isUnlocked
                          ? "bg-slate-950/60 border-slate-800 hover:border-emerald-700/50"
                          : "bg-slate-950/40 border-slate-850 hover:border-amber-700/50 opacity-85"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold shrink-0 ${
                          isSelected
                            ? "bg-emerald-500 text-slate-950"
                            : isLessonFree || isUnlocked
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-850" 
                            : "bg-amber-950/60 text-amber-400 border border-amber-900/60"
                        }`}>
                          {chap.num}
                        </span>
                        <span className={`truncate font-medium leading-relaxed ${isSelected ? "text-white font-bold" : "text-slate-300"}`}>
                          {chap.title}
                        </span>
                      </div>
                      
                      <div className="shrink-0 mr-2">
                        {isLessonFree ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            متاح مجاناً
                          </span>
                        ) : isUnlocked ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                            <Unlock className="w-2.5 h-2.5" />
                            <span>مفتوح ✓</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>مقفل</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

        {/* All Available Courses List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-350">
              الدورات والمقاطع الأكاديمية الصادرة والمدققة ({filteredCourses.length})
            </h3>
            <span className="text-xs text-slate-400">
              {tierFilter === "all" ? "عرض الكل" : tierFilter === "free" ? "المقررات المجانية" : "المقررات المدفوعة"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectCourse(c)}
                className={`group cursor-pointer rounded-3xl border transition-all overflow-hidden bg-slate-900/30 hover:scale-[1.01] duration-300 shadow-lg ${
                  activeCourse?.id === c.id 
                    ? "border-emerald-500 ring-1 ring-emerald-500/20" 
                    : "border-slate-850 hover:border-slate-800"
                }`}
              >
                <div className="aspect-video relative overflow-hidden bg-slate-950">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-full object-cover opacity-60 transition duration-300 group-hover:opacity-40"
                  />
                  <div className="absolute inset-0 bg-slate-950/15 group-hover:bg-slate-950/30 transition flex items-center justify-center">
                    <Play className="w-10 h-10 text-white drop-shadow opacity-90 group-hover:scale-110 transition-all" />
                  </div>

                  {/* Badge: Free vs Paid */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {c.isPremium ? (
                      <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-lg border border-amber-400 flex items-center gap-1 shadow-md">
                        <Lock className="w-3 h-3" />
                        <span>مدفوع ({c.price ? `${c.price} دج` : "3,500 دج"})</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-lg border border-emerald-400 shadow-md">
                        مجاني 100%
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950 border border-emerald-900/60 px-2 py-0.5 rounded">
                      {categories.find(cat => cat.value === c.category)?.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{c.duration}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-relaxed">
                    {c.title}
                  </h4>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-slate-450 font-light">بتقديم: {c.instructor}</p>
                    {c.isPremium ? (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" />
                        <span>معاينة مجانية متاحة</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold">
                        مفتوح بالكامل
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Submission Contribution Form */}
        <div className="bg-slate-900/35 backdrop-blur-xl rounded-3xl p-6 border border-slate-850 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-900/50">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-100">بوابة إيداع البحوث التطبيقية للطلبة</h3>
              <p className="text-xs text-slate-400">ساهم في إثراء المحتوى المعرفي لولاية الوادي من خلال مشاركة دراساتك وتقارير التربة الميدانية.</p>
            </div>
          </div>

          {paperUploadSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-950/80 text-emerald-300 p-4 rounded-2xl text-xs font-bold leading-relaxed border border-emerald-800/60"
            >
              {paperUploadSuccess}
            </motion.div>
          )}

          <form onSubmit={handleUploadMaterialSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-350">عنوان الورقة أو المستند الإرشادي *</label>
              <input
                type="text"
                required
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                placeholder="مثال: آليات الري المحوري بالتقطير في رمال حاسي خليفة"
                className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-350">اسم الطالب ومستواه الأكاديمي والجامعة *</label>
              <input
                type="text"
                required
                value={materialAuthor}
                onChange={(e) => setMaterialAuthor(e.target.value)}
                placeholder="مثال: منير سلطاني - طالب ماستر جامعة الوادي"
                className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-350">ملف المستند الإرشادي</label>
              <select
                value={materialCategory}
                onChange={(e) => setMaterialCategory(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="crops">زراعة المحاصيل صحراوياً</option>
                <option value="irrigation">أنظمة وبطانيات الري الذكي</option>
                <option value="soil">التربة والتأهيل الرملي</option>
                <option value="sustainability">الاستدامة والمكافحة الحيوية</option>
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-350">نبذة تعريفية ومصادر البحث الفلاحي السوفي *</label>
              <textarea
                required
                rows={3}
                value={materialDesc}
                onChange={(e) => setMaterialDesc(e.target.value)}
                placeholder="تفاصيل التقديم لفائدة الدكتور سمير مرداسي ولجنة التدقيق الفني ببنك معلومات هودنت..."
                className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              />
            </div>
            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                className="bg-emerald-650 hover:bg-emerald-600 text-slate-100 px-6 py-3 rounded-xl transition-all font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-950/20"
              >
                <Plus className="w-4 h-4" />
                <span>إيداع المخطط للمراجعة الأكاديمية والنشر</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Algerian Payment Simulation Modal for Premium Course */}
      {showPayModal && activeCourse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-750 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 text-right relative"
          >
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">الاشتراك في المقرر التخصصي</h3>
                <p className="text-xs text-amber-400 font-bold">{activeCourse.title}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">رسوم الدورة الكاملة:</span>
                <span className="text-base font-black text-amber-400">{activeCourse.price || "3,500 دج"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">الشهادة الأكاديمية:</span>
                <span className="text-emerald-400 font-bold">معتمدة من جامعة الشهيد حمه لخضر - الوادي</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">الوصول للمحتوى:</span>
                <span className="text-slate-200">مدى الحياة لكافة الفيديوهات والملفات الهندسية</span>
              </div>
            </div>

            {/* Payment methods in Algeria */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300">طرق الدفع المعتمدة في الجزائر:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 block text-[11px]">📱 بريدي موب (BaridiMob)</span>
                  <p className="text-[10px] text-slate-400 font-mono">RIP: 00799999002345678912</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 block text-[11px]">💳 البطاقة الذهبية (EDAHABIA)</span>
                  <p className="text-[10px] text-slate-400">دفع إلكتروني آمن وفوري عبر بريد الجزائر</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="font-bold text-blue-400 block text-[11px]">📮 الحوالة البريدية (CCP)</span>
                  <p className="text-[10px] text-slate-400 font-mono">CCP: 18452390 Clé 45</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="font-bold text-purple-400 block text-[11px]">🏛️ بنك الفلاحة (BADR)</span>
                  <p className="text-[10px] text-slate-400">وكالة وادي سوف - حساب تمويل التدريب</p>
                </div>
              </div>
            </div>

            {unlockSuccess ? (
              <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-500/50 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تم تأكيد الاشتراك بنجاح! تم فتح كافة الدروس والملفات فورياً.</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleUnlockCurrentCourse}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black rounded-xl cursor-pointer shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>تأكيد الاشتراك وتفعيل كافة الدروس فوراً (تجربة المنصة)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition"
                >
                  إلغاء
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
