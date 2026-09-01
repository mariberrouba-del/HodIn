import React, { useState } from "react";
import { UserProfile } from "../types";
import { 
  ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, 
  CheckCircle2, AlertCircle, RefreshCw, KeyRound, ShieldAlert
} from "lucide-react";
import { authenticateFounder, forgotFirebasePassword } from "../lib/firebaseService";

interface FounderLoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToHome: () => void;
}

export default function FounderLogin({ onLoginSuccess, onNavigateToHome }: FounderLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setLoading(true);
    try {
      const result = await authenticateFounder(email.trim(), password);
      setSuccessMsg(`مرحباً بك مجدداً ${result.user.name || "سعادة المؤسس"}! جاري توجيهك إلى لوحة التحكم...`);
      setTimeout(() => {
        onLoginSuccess(result.user);
      }, 800);
    } catch (err: any) {
      console.warn("Founder login notice:", err?.message);
      setError(err.message || "فشل تسجيل الدخول. يرجى التأكد من صحة بيانات حساب المؤسس.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("يرجى إدخال البريد الإلكتروني للمؤسس أولاً لإرسال رابط إعادة التعيين.");
      return;
    }
    setResetLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await forgotFirebasePassword(email.trim());
      setSuccessMsg(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email.trim()} عبر Firebase.`);
    } catch (err: any) {
      setError(err.message || "تعذر إرسال رابط إعادة التعيين. تأكد من صحة البريد الإلكتروني.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Top return button */}
        <div className="mb-4">
          <button
            onClick={onNavigateToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition py-1 px-2.5 rounded-lg hover:bg-slate-900/60"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى المنصة الرئيسية (واجهة الفلاح)</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-900/40 border border-emerald-500/40 shadow-inner text-emerald-400 mb-1">
              <ShieldCheck className="w-8 h-8" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-950/90 border border-emerald-500/40 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>بوابة الهيئة التأسيسية والإدارة العليا</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              تسجيل دخول المؤسسين
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
              إدارة محتوى منصة HodInt، المقالات والإرشادات الفلاحية، الأقسام والإنذارات المناخية
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-600/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">تنبيه أمني</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 mr-1">
                البريد الإلكتروني للمؤسس
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mariberrouba@gmail.com"
                  required
                  dir="ltr"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition text-right"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 mr-1">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  dir="ltr"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pr-10 pl-10 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition text-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition hover:underline disabled:opacity-50"
                >
                  {resetLoading ? "جاري إرسال رابط التعيين..." : "نسيت كلمة المرور؟ إرسال رابط تعيين عبر البريد"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق من الصلاحيات عبر Firebase Auth...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>دخول لوحة تحكم المؤسسين</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              هذه البوابة مخصصة حصراً للهيئة التأسيسية المعتمدة. جميع العمليات مسجلة ومحمية بقواعد أمان Firebase Security Rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
