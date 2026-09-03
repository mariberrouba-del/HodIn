import React from "react";
import { Sprout, Phone, Mail, MapPin, GraduationCap, Users, Award, Sparkles, Server, ArrowLeft, HeartHandshake } from "lucide-react";
import { motion } from "motion/react";
import Logo from "./Logo";

interface HeroProps {
  onOpenFounders?: () => void;
}

export default function Hero({ onOpenFounders }: HeroProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border border-emerald-900/40 bg-radial-[at_top_right] from-emerald-950/40 via-slate-950 to-slate-950 p-6 md:p-8 lg:p-10 shadow-[0_4px_30px_rgba(16,185,129,0.05)] mb-8"
      dir="rtl"
    >
      {/* Absolute Ambient Background Lights matching the Logo scheme */}
      <div className="absolute right-[-10%] top-[-20%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute left-[5%] bottom-[-10%] w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute right-[20%] bottom-[-20%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none" />

      {/* Grid structure */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Pitch content text (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-emerald-950/70 text-emerald-300 border border-emerald-800/50 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>منصة هودنت للحلول والتعليم الزراعي - HodInt</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-100 leading-tight">
            بوابة رقمية متكاملة للابتكار <br className="hidden md:inline" />
            الفلاحة الصحراوية في <span className="bg-gradient-to-r from-emerald-400 via-amber-400 to-cyan-400 bg-clip-text text-transparent">ولاية الوادي</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl font-light">
            تأسست مبادرة <span className="font-semibold text-emerald-400">"HodInt"</span> برؤية المهندسين المؤسسين <strong className="text-slate-100 font-bold">م. ماريه بروبة</strong> و <strong className="text-slate-100 font-bold">م. إكرام محده</strong> وتحت الإشراف العلمي المباشر لـ <strong className="text-amber-300 font-bold">الأستاذ الدكتور سمير مرداسي</strong>، منصة HodInt تجمع الطالب والمهندس والفلاح في فضاء واحد للتعلّم، الابتكار، وتبادل المعرفة من أجل إنتاج أفضل وأكثر أمانًا.
          </p>

          {/* Practical contact chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/60 text-xs">
            
            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-3.5 rounded-2xl hover:border-emerald-500/20 transition-all duration-300 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/60 flex items-center justify-center text-emerald-400 border border-emerald-800/30 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500">الهاتف والمراسلة المباشرة</div>
                <div className="font-bold text-slate-300 font-mono dir-ltr select-all mt-0.5">+213 549 598 307</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-3.5 rounded-2xl hover:border-cyan-500/20 transition-all duration-300 group">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/60 flex items-center justify-center text-cyan-400 border border-cyan-800/30 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-500">البريد الإلكتروني المباشر</div>
                <div className="font-bold text-slate-300 text-xs mt-0.5 break-all select-all font-mono">hodintplatform@gmail.com</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-3.5 rounded-2xl hover:border-amber-500/20 transition-all duration-300 group">
              <div className="w-9 h-9 rounded-xl bg-amber-950/60 flex items-center justify-center text-amber-400 border border-amber-800/30 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500">مركز السيادة والخدمة</div>
                <div className="font-bold text-slate-300 mt-0.5">الوادي، الجزائر (واد سوف)</div>
              </div>
            </div>

          </div>
        </div>

        {/* Supervisors and academic design banner (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative select-none">
          <div className="absolute right-4 top-4 opacity-10">
            <Server className="w-20 h-20 text-emerald-400" />
          </div>
          
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800/80">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>الهيئة التأسيسية والإشراف العلمي</span>
            </h2>
          </div>

          <div className="space-y-4 text-xs font-light">
            
            {/* Founders with updated graphics */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70 hover:border-emerald-800/50 transition">
              <div className="flex items-center gap-2 mb-2.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-slate-200">المهندسان الزراعيان المؤسسان</h3>
              </div>
              
              <ul className="space-y-2.5 text-slate-300 pr-1">
                <li className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 font-bold text-[10px] shrink-0 mt-0.5">
                    م.ب
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-sm">المهندسة ماريه بروبة</div>
                    <div className="text-[11px] text-emerald-400">مؤسس شريك - مهندسة دولة في الإنتاج النباتي</div>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 font-bold text-[10px] shrink-0 mt-0.5">
                    إ.م
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-sm">المهندسة إكرام محده</div>
                    <div className="text-[11px] text-emerald-400">مؤسس شريك - مهندسة دولة في الإنتاج النباتي</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Academic Supervision with updated graphics */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70 hover:border-amber-800/50 transition">
              <div className="flex items-center gap-2 mb-1.5">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-slate-200">الإشراف والتحكيم الأكاديمي</h3>
              </div>
              <p className="text-sm text-slate-100 font-extrabold">الأستاذ الدكتور سمير مرداسي</p>
              <p className="text-slate-400 mt-1 select-text leading-relaxed text-[11px]">
                أستاذ وباحث خبير في الأنظمة الفلاحية والبيئات الصحراوية بكلية علوم الطبيعة والحياة بجامعة الشهيد حمه لخضر - ولاية الوادي.
              </p>
            </div>

            {/* Scientific credentials */}
            <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-900/30 text-[11px] text-slate-300 leading-relaxed font-light">
              <span className="font-bold text-emerald-400 ml-1">شراكة أكاديمية:</span>
              يتم تحديث مناهج ومضامين "HodInt" دورياً بالتنسيق العلمي المباشر مع طلبة وأساتذة كلية علوم الطبيعة والحياة بجامعة الوادي.
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
}
