import React from "react";
import { X, Award, Users, GraduationCap, Phone, Mail, MapPin, CheckCircle2, Sparkles, BookOpen, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FoundersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFounderLogin?: () => void;
}

export default function FoundersModal({ isOpen, onClose, onOpenFounderLogin }: FoundersModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-950 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute left-6 top-6 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-right space-y-2 mb-6 border-b border-slate-850 pb-5">
            <div className="inline-flex items-center gap-2 bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-3 py-1 rounded-full text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>بطاقة التعريف بالهيئة التأسيسية والإشراف الأكاديمي</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              مؤسسو منصة هودنت للحلول والتعليم الزراعي (HodInt)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              مشروع رائد يجمع بين الابتكار الهندسي التطبيقي والإشراف العلمي الأكاديمي لجامعة الشهيد حمه لخضر - ولاية الوادي.
            </p>
          </div>

          {/* Founders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            
            {/* Maria Berrouba */}
            <div className="bg-gradient-to-b from-emerald-950/30 to-slate-900/70 border border-emerald-850/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0">
                  م.ب
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base">المهندسة ماريه بروبة</h3>
                  <p className="text-xs text-emerald-400 font-semibold">المؤسس المشارك - رئيسة المشروع</p>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 font-light leading-relaxed">
                <p><strong className="text-slate-200">المؤهل:</strong> مهندسة دولة في العلوم الزراعية - تخصص إنتاج نباتي (جامعة الوادي)</p>
                <p><strong className="text-slate-200">التخصص:</strong> إنتاج نباتي (تحسين المحاصيل، التغذية النباتية، وأنظمة الزراعة الصحراوية)</p>
                <p><strong className="text-slate-200">المهمة:</strong> التخطيط العلمي، إعداد مناهج التسميد وإدارة المشاريع الفلاحية</p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="dir-ltr select-all font-sans font-bold">+213 549 598 307</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="select-all">mariaberrouba@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Ikram Mehda */}
            <div className="bg-gradient-to-b from-cyan-950/30 to-slate-900/70 border border-cyan-850/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0">
                  إ.م
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base">المهندسة إكرام محده</h3>
                  <p className="text-xs text-cyan-400 font-semibold">المؤسس المشارك - المسؤولة التقنية</p>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 font-light leading-relaxed">
                <p><strong className="text-slate-200">المؤهل:</strong> مهندسة دولة في العلوم الزراعية - تخصص إنتاج نباتي (جامعة الوادي)</p>
                <p><strong className="text-slate-200">التخصص:</strong> إنتاج نباتي (رعاية وتنمية المحاصيل، وقاية وتغذية النباتات، وجودة الإنتاج الزراعي)</p>
                <p><strong className="text-slate-200">المهمة:</strong> تصميم بروتوكولات الرعاية والمكافحة، إدارة الاستشارات والتنبيهات</p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="dir-ltr select-all font-sans font-bold">+213 549 598 307</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="select-all">ikram.platform@gmail.com</span>
                </div>
              </div>
            </div>

          </div>

          {/* Supervisor Samir Merdassi */}
          <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 text-right">
            <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
              أ.د
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <h4 className="font-extrabold text-slate-100 text-sm">الأستاذ الدكتور سمير مرداسي (المشرف العلمي)</h4>
              </div>
              <p className="text-slate-300 font-light leading-relaxed">
                أستاذ وباحث خبير في الأنظمة الفلاحية والبيئات الصحراوية بكلية علوم الطبيعة والحياة - جامعة الشهيد حمه لخضر بالوادي. يشرف على التحكيم العلمي لكافة الدروس والتطبيقات بالمنصة.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-850">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
