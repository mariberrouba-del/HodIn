import React, { useRef } from "react";
import { CourseCertificate } from "../types";
import { Award, CheckCircle2, Download, Printer, X, ShieldCheck, Calendar, User, BookOpen, Building } from "lucide-react";

interface CertificateModalProps {
  certificate: CourseCertificate;
  onClose: () => void;
}

export default function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer z-10 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">شهادة إتمام المساق الأكاديمي</h2>
              <p className="text-xs text-slate-400">معتمدة رقميًا عبر منصة هودنت للابتكار الزراعي الصحراوي</p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الشهادة</span>
          </button>
        </div>

        {/* CERTIFICATE DISPLAY BOX (Printable) */}
        <div
          ref={printRef}
          className="relative bg-gradient-to-br from-amber-950/20 via-slate-950 to-emerald-950/20 border-4 border-amber-500/40 rounded-2xl p-6 md:p-10 space-y-6 text-center shadow-inner overflow-hidden"
        >
          {/* Certificate Watermark Background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <Award className="w-96 h-96 text-amber-300" />
          </div>

          {/* Top Institutions Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
            <div className="text-right space-y-0.5">
              <p className="text-[11px] font-bold text-amber-400">الجمهورية الجزائرية الديمقراطية الشعبية</p>
              <p className="text-[10px] text-slate-400">منصة هودنت التأسيسية للإرشاد والتطوير الفلاحي</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 text-sm">
                HODINT
              </div>
            </div>

            <div className="text-left space-y-0.5" dir="ltr">
              <p className="text-[10px] text-amber-400 font-bold">HODINT AGRICULTURAL PLATFORM</p>
              <p className="text-[9px] text-slate-400">El Oued Agricultural Innovation</p>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="space-y-2 pt-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block">
              شهادة إتمام واجتياز تدريبي
            </span>
            <h1 className="text-xl md:text-3xl font-black text-white font-serif tracking-wide pt-1">
              شهـادة إنجـاز أكـاديمي
            </h1>
            <p className="text-xs text-slate-300">
              تشهد الهيئة التأسيسية لمنصة هودنت بأن الطالب / المشارك:
            </p>
          </div>

          {/* Recipient Name */}
          <div className="py-2">
            <div className="inline-block px-8 py-3 bg-slate-900/90 border border-amber-500/40 rounded-2xl shadow-lg">
              <h2 className="text-lg md:text-2xl font-black text-amber-300">{certificate.userName}</h2>
            </div>
          </div>

          {/* Course Statement */}
          <div className="max-w-xl mx-auto space-y-2 text-xs md:text-sm text-slate-300 leading-relaxed">
            <p>
              قد أتم بنجاح كافة متطلبات الدورة والمقرر التدريبي التخصصي:
            </p>
            <p className="text-base md:text-lg font-black text-emerald-300">
              « {certificate.courseTitle} »
            </p>
            <p className="text-[11px] text-slate-400">
              المنعقدة بالتعاون مع {certificate.institution || "جامعة الشهيد حمه لخضر - الوادي"}
            </p>
          </div>

          {/* Footer Details: Signatures, ID, Date */}
          <div className="pt-6 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
            {/* Instructor Signature */}
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-[10px] text-slate-400 block">المشرف والمؤطر الأكاديمي:</span>
              <p className="font-bold text-white text-xs">{certificate.instructor}</p>
              <div className="h-0.5 w-24 bg-amber-500/40 mx-auto sm:mr-0 sm:ml-auto" />
              <span className="text-[9px] text-emerald-400 font-mono">توقيع رقمي معتمد</span>
            </div>

            {/* Stamp & Verification */}
            <div className="space-y-1 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-500/60 flex flex-col items-center justify-center text-amber-400 p-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-[8px] font-black">HODINT VERIFIED</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                رقم التحقق: {certificate.certificateNumber}
              </span>
            </div>

            {/* Platform Seal & Issue Date */}
            <div className="space-y-1 text-center sm:text-left" dir="rtl">
              <span className="text-[10px] text-slate-400 block">تاريخ الإصدار والاعتماد:</span>
              <p className="font-bold text-white text-xs font-mono">
                {new Date(certificate.issuedAt).toLocaleDateString("ar-DZ")}
              </p>
              <div className="h-0.5 w-24 bg-amber-500/40 mx-auto sm:ml-0 sm:mr-auto" />
              <span className="text-[9px] text-slate-400">ولاية الوادي - الجزائر</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>تم حفظ الشهادة في حسابك الشخصي ويمكنك العودة إليها في أي وقت.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل أو طباعة</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
