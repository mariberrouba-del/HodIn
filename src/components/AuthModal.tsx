import React, { useState } from "react";
import { UserRole, UserProfile } from "../types";
import { 
  LogIn, UserPlus, Mail, Lock, Eye, EyeOff, User, Phone, MapPin, 
  ShieldAlert, CheckCircle2, Send, X, Shield, Sparkles, KeyRound, Building
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  authenticateFirebaseUser, 
  registerFirebaseUser, 
  forgotFirebasePassword 
} from "../lib/firebaseService";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register" | "forgot";
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, token: string) => void;
  onOpenFounderLogin?: () => void;
}

export default function AuthModal({
  isOpen,
  initialMode = "login",
  onClose,
  onLoginSuccess,
  onOpenFounderLogin
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register inputs
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>(UserRole.STUDENT);
  const [regLocation, setRegLocation] = useState("ولاية الوادي");
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regAcademicYear, setRegAcademicYear] = useState("");
  const [regInstitution, setRegInstitution] = useState("جامعة الشهيد حمه لخضر - الوادي");
  const [regSpecialty, setRegSpecialty] = useState("");
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);

  // Forgot password input
  const [forgotEmail, setForgotEmail] = useState("");

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !loginPassword) {
      setErrorMsg("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authenticateFirebaseUser(cleanEmail, loginPassword);
      if (data.success) {
        setSuccessMsg(`أهلاً بك مجدداً يا ${data.user.name || "مستخدم HodInt"}!`);
        setTimeout(() => {
          onLoginSuccess(data.user, data.uid);
          onClose();
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !regPassword || !regConfirmPassword) {
      setErrorMsg("الرجاء تعبئة كافة الحقول الأساسية (الاسم، البريد، كلمة المرور وتأكيدها).");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg("يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg("كلمتا المرور غير متطابقتين. يرجى إعادة التأكد.");
      return;
    }

    if (!regAgreeTerms) {
      setErrorMsg("يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await registerFirebaseUser(cleanEmail, regPassword, {
        name: cleanName,
        email: cleanEmail,
        phone: regPhone.trim(),
        role: regRole,
        location: regLocation.trim(),
        companyName: regCompanyName.trim(),
        academicYear: regAcademicYear.trim(),
        institution: regInstitution.trim(),
        specialty: regSpecialty.trim()
      });

      if (data.success) {
        setSuccessMsg("تم إنشاء الحساب بنجاح! تم تسجيل دخولك تلقائياً.");
        setTimeout(() => {
          onLoginSuccess(data.user, data.uid);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشل إنشاء الحساب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("الرجاء إدخال البريد الإلكتروني المسجل.");
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotFirebasePassword(cleanEmail);
      setSuccessMsg("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.");
    } catch (err: any) {
      setErrorMsg(err.message || "تعذر إرسال رابط إعادة التعيين.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-950 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-right font-sans"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Title & Header */}
          <div className="text-center mb-6 pr-8 pl-8">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {authMode === "login" && "تسجيل الدخول إلى HodInt"}
              {authMode === "register" && "إنشاء حساب جديد في منصة HodInt"}
              {authMode === "forgot" && "استعادة كلمة المرور"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {authMode === "login" && "أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى كافة خدمات المنصة"}
              {authMode === "register" && "انضم لمجتمع الفلاحة والبحث العلمي بجامعة الوادي"}
              {authMode === "forgot" && "سنرسل لك رابطاً لإعادة ضبط كلمة المرور على بريدك الإلكتروني"}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs p-3.5 rounded-2xl mb-5 font-semibold flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs p-3.5 rounded-2xl mb-5 font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          {authMode !== "forgot" && (
            <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setErrorMsg(""); setSuccessMsg(""); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === "login" 
                    ? "bg-emerald-500 text-slate-950 font-black shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode("register"); setErrorMsg(""); setSuccessMsg(""); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === "register" 
                    ? "bg-emerald-500 text-slate-950 font-black shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>إنشاء حساب جديد</span>
              </button>
            </div>
          )}

          {/* Login Form */}
          {authMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] text-slate-400 font-bold block">كلمة المرور</label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode("forgot"); setErrorMsg(""); setSuccessMsg(""); }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer bg-transparent border-none"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 pl-10 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute left-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer bg-transparent border-none"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer border-none mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Registration Form */}
          {authMode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pl-1 pr-1">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">الاسم الكامل *</label>
                <div className="relative">
                  <User className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: م. علي بن سالم"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">البريد الإلكتروني *</label>
                  <div className="relative">
                    <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="05XXXXXXXX"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">كلمة المرور (6 خانات على الأقل) *</label>
                  <div className="relative">
                    <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 pl-10 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute left-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer bg-transparent border-none"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">تأكيد كلمة المرور *</label>
                  <div className="relative">
                    <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type={showRegConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 pl-10 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute left-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer bg-transparent border-none"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-emerald-400 font-extrabold block">نوع الحساب *</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 text-right cursor-pointer"
                  disabled={isSubmitting}
                >
                  <option value={UserRole.STUDENT}>طالب هندسة زراعية / طالب فلاحي (مشارك)</option>
                  <option value={UserRole.FARMER}>فلاح السوفي (مستفيد ومثمن منتجات)</option>
                  <option value={UserRole.EXPERT}>أستاذ / خبير ومستشار زراعي (تدريس واستشارات)</option>
                  <option value={UserRole.COMPANY}>شركة زراعية (عروض المنتجات والمعدات)</option>
                  <option value={UserRole.WORKER}>مقدم خدمة / عامل مهني حقل وصيانة</option>
                </select>
              </div>

              {regRole === UserRole.STUDENT && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-bold block">المستوى / السنة الدراسية</label>
                    <input
                      type="text"
                      placeholder="مثال: سنة ثانية ماستر"
                      value={regAcademicYear}
                      onChange={(e) => setRegAcademicYear(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-bold block">الجامعة / الكلية</label>
                    <input
                      type="text"
                      placeholder="جامعة الشهيد حمه لخضر - الوادي"
                      value={regInstitution}
                      onChange={(e) => setRegInstitution(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {regRole === UserRole.EXPERT && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-bold block">التخصص الأكاديمي</label>
                    <input
                      type="text"
                      placeholder="مثال: وقاية النباتات والري"
                      value={regSpecialty}
                      onChange={(e) => setRegSpecialty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-bold block">المؤسسة / المعهد</label>
                    <input
                      type="text"
                      placeholder="جامعة الوادي"
                      value={regInstitution}
                      onChange={(e) => setRegInstitution(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {regRole === UserRole.COMPANY && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">اسم الشركة أو المؤسسة</label>
                  <input
                    type="text"
                    placeholder="مثال: شركة سوف لتطوير نظم السقي"
                    value={regCompanyName}
                    onChange={(e) => setRegCompanyName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">البلدية / المنطقة</label>
                <div className="relative">
                  <MapPin className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="مثال: حاسي خليفة، الوادي"
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 bg-slate-900/50 p-3 rounded-xl border border-slate-850">
                <input
                  type="checkbox"
                  id="modal-terms-check"
                  checked={regAgreeTerms}
                  onChange={(e) => setRegAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500 shrink-0"
                  disabled={isSubmitting}
                />
                <label htmlFor="modal-terms-check" className="text-xs text-slate-300 select-none cursor-pointer leading-relaxed">
                  أوافق على <span className="text-emerald-400 font-semibold">شروط الاستخدام وسياسة الخصوصية</span> لمنصة HodInt
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer border-none mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>جاري إنشاء الحساب...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>إنشاء الحساب</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {authMode === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">البريد الإلكتروني المسجل</label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال رابط إعادة تعيين كلمة المرور</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode("login"); setErrorMsg(""); setSuccessMsg(""); }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 mt-2 block cursor-pointer bg-transparent border-none"
              >
                العودة لصفحة تسجيل الدخول
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
