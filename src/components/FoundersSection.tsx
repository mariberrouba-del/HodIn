import React from "react";
import { Award, GraduationCap, Users, Mail, Phone, MapPin, Sparkles, CheckCircle2, BookOpen, ShieldCheck, HeartHandshake, ExternalLink } from "lucide-react";
import { motion } from "motion/react";

interface FoundersSectionProps {
  onContactClick?: () => void;
  onCourseClick?: () => void;
}

export default function FoundersSection({ onContactClick, onCourseClick }: FoundersSectionProps) {
  const founders = [
    {
      id: "maria",
      name: "المهندسة ماريه بروبة",
      title: "مؤسس شريك - مهندسة دولة ومسؤولة المشروع",
      qualification: "مهندسة دولة في العلوم الفلاحية - تخصص إنتاج نباتي",
      specialty: "إنتاج نباتي: تحسين إنتاجية المحاصيل الحقلية والصحراوية، التغذية والتسميد، وأنظمة الري الذكي",
      institution: "جامعة الشهيد حمه لخضر - ولاية الوادي",
      email: "mariaberrouba@gmail.com",
      phone: "+213 549 598 307",
      location: "الوادي، الجزائر",
      avatarBg: "from-emerald-500 to-teal-700",
      accentColor: "emerald",
      badge: "مؤسس شريك",
      roleDesc: "قيادة التأسيس والتخطيط العلمي والزراعي لمنصة هودنت كجسر رقمي متقدم يخدم فلاحي وادي سوف ويدمج الأبحاث الأكاديمية لتحسين المحاصيل الاستراتيجية والتسميد المتوازن.",
      contributions: [
        "إعداد الدليل الشامل لزراعة البطاطا بالري المحوري بالوادي",
        "تطوير منظومة التسميد المتوازن للتربة الرملية الفقيرة",
        "التنسيق الميداني المباشر مع فلاحي حاسي خليفة وقمار والدبيلة"
      ]
    },
    {
      id: "ikram",
      name: "المهندسة إكرام محده",
      title: "مؤسس شريك - مهندسة دولة ومسؤولة المشروع",
      qualification: "مهندسة دولة في العلوم الفلاحية - تخصص إنتاج نباتي",
      specialty: "إنتاج نباتي: رعاية وتنمية المحاصيل، تشخيص ووقاية النباتات، وإدارة الإنذارات وجودة التمور",
      institution: "جامعة الشهيد حمه لخضر - ولاية الوادي",
      email: "ikram.platform@gmail.com",
      phone: "+213 549 598 307",
      location: "الوادي، الجزائر",
      avatarBg: "from-emerald-500 to-teal-700",
      accentColor: "emerald",
      badge: "مؤسس شريك",
      roleDesc: "قيادة التأسيس وتطوير بروتوكولات الوقاية والإرشاد الزراعي الرقمي بالمنصة، وإدارة التنبيهات المناخية الميدانية لحماية ثروة النخيل والواحات والمحاصيل الصحراوية.",
      contributions: [
        "تصميم كراسة التشخيص المبكر لآفات النخيل وعث الغبار (بوفروة)",
        "برمجة التنبيهات المناخية الموسمية ومكافحة حشرات الصيف",
        "إعداد سلسلة الدروس المرئية لوقاية البساتين والواحات السوفية"
      ]
    }
  ];

  const supervisor = {
    name: "الأستاذ الدكتور سمير مرداسي",
    title: "المشرف العلمي والأكاديمي العام",
    qualification: "أستاذ وباحث خبير في الأنظمة الفلاحية والبيئات الصحراوية",
    faculty: "كلية علوم الطبيعة والحياة - جامعة الشهيد حمه لخضر (ولاية الوادي)",
    specialty: "ديناميكا التربة والمياه الجوفية، هندسة السقي المستدام، وحسابات الضخ الشمسي",
    roleDesc: "يتولى التدقيق الأكاديمي والتحكيم العلمي لكافة الدروس والمعلومات والإرشادات المنشورة في المنصة لضمان مطابقتها لأحدث المعايير العلمية الدولية والمحلية."
  };

  return (
    <section className="space-y-8" dir="rtl">
      {/* Header Badge */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
          <Award className="w-4 h-4 text-amber-400" />
          <span>الهيئة التأسيسية والإشراف الأكاديمي لمنصة HodInt</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          كفاءات هندسية شابة تحت إشراف نخبة من أساتذة <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">جامعة الوادي</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
          انطلقت منصة "هودنت" بمبادرة رائدة من المهندسين الزراعيين لخدمة الفلاحة الصحراوية في الجزائر وربط العلم الأكاديمي بحقول ومزارع وادي سوف.
        </p>
      </div>

      {/* Founders Cards Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {founders.map((founder, idx) => (
          <motion.div
            key={founder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.15 }}
            className={`relative overflow-hidden rounded-3xl border ${
              founder.accentColor === "emerald" 
                ? "border-emerald-900/40 bg-gradient-to-b from-emerald-950/20 via-slate-900/60 to-slate-950/90" 
                : "border-cyan-900/40 bg-gradient-to-b from-cyan-950/20 via-slate-900/60 to-slate-950/90"
            } p-6 sm:p-7 shadow-xl hover:border-slate-700 transition-all duration-300 group`}
          >
            {/* Top Bar with Avatar, Name, and Badge */}
            <div className="flex items-start gap-4 mb-5">
              {/* Monogram / Avatar badge */}
              <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br ${founder.avatarBg} flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-lg shrink-0 border border-white/20`}>
                {founder.name.includes("ماريه") ? "م.ب" : "إ.م"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-100 truncate">
                    {founder.name}
                  </h3>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    founder.accentColor === "emerald" 
                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60" 
                      : "bg-cyan-950/80 text-cyan-300 border-cyan-700/60"
                  }`}>
                    {founder.badge}
                  </span>
                </div>

                <div className="text-xs font-bold text-emerald-400 mb-1">
                  {founder.title}
                </div>

                <div className="text-[11px] text-slate-400 font-light flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{founder.qualification}</span>
                </div>
              </div>
            </div>

            {/* Description of role */}
            <p className="text-xs text-slate-300 leading-relaxed mb-4 font-light bg-slate-950/50 p-3.5 rounded-2xl border border-slate-850">
              {founder.roleDesc}
            </p>

            {/* Specialty tag */}
            <div className="mb-4">
              <div className="text-[10px] text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>مجالات الخبرة والتخصص الدقيق:</span>
              </div>
              <div className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                {founder.specialty}
              </div>
            </div>

            {/* Key contributions */}
            <div className="space-y-1.5 mb-5">
              <div className="text-[10px] text-slate-500 font-bold mb-1">أبرز المساهمات في منصة HodInt:</div>
              {founder.contributions.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Contact Coordinates */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-850 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-[11px] dir-ltr select-all">{founder.phone}</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-850 text-slate-300 min-w-0">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-mono text-[10px] truncate select-all">{founder.email}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scientific Academic Supervision Card (Samir Merdassi) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-amber-900/40 bg-gradient-to-r from-amber-950/20 via-slate-900/80 to-slate-950 p-6 sm:p-8 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shrink-0 border border-amber-400/30">
            أ.د
          </div>

          <div className="flex-1 text-center md:text-right space-y-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <span>{supervisor.name}</span>
              </h3>
              <span className="text-xs font-bold px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800/60 rounded-full">
                {supervisor.title}
              </span>
            </div>

            <div className="text-xs font-semibold text-emerald-400">
              {supervisor.faculty}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              {supervisor.roleDesc}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
              <span className="bg-slate-950/60 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>شراكة أكاديمية مع جامعة الشهيد حمه لخضر</span>
              </span>
              <span className="bg-slate-950/60 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>تدقيق علمي للمناهج ودورات السقي والأمراض</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
