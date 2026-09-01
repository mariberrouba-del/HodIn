import React, { useState, useEffect } from "react";
import { UserRole, Course, MarketPrice, WeatherAlert } from "../types";
import { 
  Users, ShieldCheck, GraduationCap, AlertTriangle, MessageSquare, 
  Trash2, Plus, Send, ShieldAlert, CheckCircle2, UserPlus, FileText, Play, Server, Clock, Check, Upload, FileUp
} from "lucide-react";
import { 
  registerFirebaseUser, 
  updateFirebaseUserRole, 
  deleteFirebaseUser, 
  addFirebaseCourse, 
  deleteFirebaseCourse, 
  addFirebaseWeatherAlert, 
  deleteFirebaseWeatherAlert, 
  respondToFirebaseInquiry,
  getFirebaseUsers,
  getFirebaseCourses,
  getFirebaseWeatherAlerts,
  getFirebaseInquiries,
  uploadFileToStorage
} from "../lib/firebaseService";

interface AdminDashboardProps {
  currentUser: any;
  usersList: any[];
  courses: Course[];
  weatherAlerts: WeatherAlert[];
  inquiries: any[];
  setUsersList: React.Dispatch<React.SetStateAction<any[]>>;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setWeatherAlerts: React.Dispatch<React.SetStateAction<WeatherAlert[]>>;
  setInquiries: React.Dispatch<React.SetStateAction<any[]>>;
  fetchAllData: () => Promise<void>;
}

export default function AdminDashboard({
  currentUser,
  usersList,
  courses,
  weatherAlerts,
  inquiries,
  setUsersList,
  setCourses,
  setWeatherAlerts,
  setInquiries,
  fetchAllData
}: AdminDashboardProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<"users" | "courses" | "alerts" | "inquiries">(
    currentUser.role === UserRole.EXPERT ? "courses" : "users"
  );

  // Prefill details for experts/teachers
  useEffect(() => {
    if (currentUser.role === UserRole.EXPERT) {
      setCourseInstructor(currentUser.name || "");
      setCourseInstructorRole(currentUser.specialty || "خبير وأستاذ فلاحي معتمد");
    }
  }, [currentUser]);

  // User form states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.FARMER);
  const [newUserLocation, setNewUserLocation] = useState("الوادي");
  const [newUserCompany, setNewUserCompany] = useState("");
  const [newUserSpecialty, setNewUserSpecialty] = useState("");
  const [userMsg, setUserMsg] = useState("");
  const [userError, setUserError] = useState("");

  // Course form states
  const [courseTitle, setCourseTitle] = useState("");
  const [courseInstructor, setCourseInstructor] = useState("");
  const [courseInstructorRole, setCourseInstructorRole] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCategory, setCourseCategory] = useState("crops");
  const [courseDuration, setCourseDuration] = useState("4 حصص (8 ساعات)");
  const [courseVidUrl, setCourseVidUrl] = useState("https://www.youtube.com/embed/zH0F6LclisY");
  const [courseMsg, setCourseMsg] = useState("");

  // Real Storage Upload States
  const [uploadProgressDoc, setUploadProgressDoc] = useState<number | null>(null);
  const [uploadProgressVideo, setUploadProgressVideo] = useState<number | null>(null);
  const [uploadedDocUrl, setUploadedDocUrl] = useState("");
  const [uploadedDocName, setUploadedDocName] = useState("");
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");

  // Climate Alert form states
  const [alertType, setAlertType] = useState("heatwave");
  const [alertTitleAr, setAlertTitleAr] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("warning");
  const [alertDescAr, setAlertDescAr] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  // Inquiry text replies
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  // Real Upload Handlers (Storage)
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgressDoc(0);
    try {
      const url = await uploadFileToStorage(file, (pct) => {
        setUploadProgressDoc(pct);
      });
      setUploadedDocUrl(url);
      setUploadedDocName(file.name);
      setUploadProgressDoc(100);
      alert("تم رفع الملف بنجاح!");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء رفع الملف.");
      setUploadProgressDoc(null);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgressVideo(0);
    try {
      const url = await uploadFileToStorage(file, (pct) => {
        setUploadProgressVideo(pct);
      });
      setUploadedVideoUrl(url);
      setCourseVidUrl(url); // Set main course url
      setUploadProgressVideo(100);
      alert("تم رفع الفيديو بنجاح!");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء رفع الفيديو.");
      setUploadProgressVideo(null);
    }
  };

  // 1. Add User Account with Firebase Auth + Firestore
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg("");
    setUserError("");
    if (!newUserName || !newUserEmail || !newUserPassword) {
      setUserError("الرجاء إدخال الاسم، البريد الإلكتروني وكلمة المرور.");
      return;
    }
    try {
      await registerFirebaseUser(newUserEmail, newUserPassword, {
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone,
        role: newUserRole,
        location: newUserLocation,
        companyName: newUserCompany,
        specialty: newUserSpecialty
      });
      
      const freshUsers = await getFirebaseUsers();
      setUsersList(freshUsers);
      setUserMsg("تم إنشاء حساب العضو الجديد بنجاح!");
      // reset fields
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPhone("");
      setNewUserPassword("");
      setNewUserCompany("");
      setNewUserSpecialty("");
    } catch (err: any) {
      setUserError(err.message || "خطأ أثناء إنشاء حساب العضو.");
    }
  };

  // 2. Change Role privilege in Firestore
  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await updateFirebaseUserRole(userId, newRole as UserRole);
      const freshUsers = await getFirebaseUsers();
      setUsersList(freshUsers);
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Delete account from Firestore
  const handleDeleteUser = async (userId: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا الحساب نهائياً من منصة HodInt؟")) {
      try {
        await deleteFirebaseUser(userId);
        const freshUsers = await getFirebaseUsers();
        setUsersList(freshUsers);
      } catch {
        alert("فشل حذف الحساب.");
      }
    }
  };

  // 4. Create Course in Firestore
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseMsg("");
    if (!courseTitle || !courseInstructor || !courseDesc) {
      alert("الرجاء توفير البيانات الأساسية للدورة.");
      return;
    }
    try {
      const docsList = [];
      if (uploadedDocUrl) {
        docsList.push({
          title: uploadedDocName || "كتيب مادة دراسية.pdf",
          size: "مرفق خارجي",
          downloadUrl: uploadedDocUrl
        });
      }

      await addFirebaseCourse({
        id: "c_" + Date.now(),
        title: courseTitle,
        instructor: courseInstructor,
        instructorRole: courseInstructorRole,
        description: courseDesc,
        category: courseCategory as any,
        duration: courseDuration,
        lessonsCount: 6,
        videoUrl: courseVidUrl,
        thumbnail: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=600",
        documents: docsList,
        isPremium: false,
        status: "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const freshCourses = await getFirebaseCourses();
      setCourses(freshCourses);
      setCourseMsg("تم إدراج المقرر التعليمي الجديد وتثبيت ملفاته في Firebase Firestore & Storage!");
      setCourseTitle("");
      setCourseInstructor("");
      setCourseInstructorRole("");
      setCourseDesc("");
      setUploadedDocUrl("");
      setUploadedDocName("");
      setUploadedVideoUrl("");
      setUploadProgressDoc(null);
      setUploadProgressVideo(null);
    } catch {
      alert("حدث خطأ أثناء إضافة الدورة.");
    }
  };

  // 5. Delete Course from Firestore
  const handleDeleteCourse = async (id: string) => {
    if (confirm("هل تريد حذف هذا المقرر التعليمي؟")) {
      try {
        await deleteFirebaseCourse(id);
        const freshCourses = await getFirebaseCourses();
        setCourses(freshCourses);
      } catch {
        alert("فشل الحذف.");
      }
    }
  };

  // 6. Post Weather Alert in Firestore
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg("");
    if (!alertTitleAr || !alertDescAr) {
      alert("الرجاء توفير تفاصيل التنبيه.");
      return;
    }
    try {
      await addFirebaseWeatherAlert({
        id: "w_" + Date.now(),
        type: alertType as any,
        titleAr: alertTitleAr,
        titleEn: alertType.toUpperCase(),
        severity: alertSeverity as any,
        descriptionAr: alertDescAr,
        descriptionEn: "Climate alert broadcast details.",
        date: "الآن"
      });
      const freshAlerts = await getFirebaseWeatherAlerts();
      setWeatherAlerts(freshAlerts);
      setAlertMsg("تم بث التنبيه الزراعي والمناخي لجميع الفلاحين بالمنصة وتخزينه في Firestore.");
      setAlertTitleAr("");
      setAlertDescAr("");
    } catch {
      alert("فشل إرسال التنبيه.");
    }
  };

  // 7. Delete Alert from Firestore
  const handleDeleteAlert = async (id: string) => {
    if (confirm("هل تريد مسح هذا التنبيه المناخي?")) {
      try {
        await deleteFirebaseWeatherAlert(id);
        const freshAlerts = await getFirebaseWeatherAlerts();
        setWeatherAlerts(freshAlerts);
      } catch {
        alert("فشل حذف التنبيه.");
      }
    }
  };

  // 8. Respond to inquiries in Firestore
  const handleSendResponse = async (id: string) => {
    const text = replyText[id];
    if (!text) {
      alert("الرجاء كتابة نص الرد قبل الإرسال.");
      return;
    }
    try {
      await respondToFirebaseInquiry(id, text, currentUser.email);
      const freshInquiries = await getFirebaseInquiries();
      setInquiries(freshInquiries);
      setReplyText(prev => ({ ...prev, [id]: "" }));
    } catch {
      alert("فشل إرسال الرد.");
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 left-0 bg-rose-500/10 text-rose-450 border-r border-b border-rose-900/40 text-[9px] font-extrabold px-3 py-1.5 uppercase rounded-br-2xl flex items-center gap-1.5 shadow-md">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>مركز العمليات الآمن لولاية الوادي</span>
        </div>
        <div className="space-y-2 mt-4 md:mt-2">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>لوحة التحكم والقيادة الإدارية</span>
            <span className="text-[10px] bg-emerald-950 border border-emerald-850 text-emerald-400 font-bold px-2 py-0.5 rounded-full">نشط</span>
          </h2>
          <p className="text-xs text-slate-405 leading-relaxed font-light">
            {currentUser.role === UserRole.EXPERT ? (
              <span>مرحباً بك الأستاذ/الخبير <strong className="text-white font-black">{currentUser.name}</strong>. بصفتك باحثاً وخبيراً معتمداً بالمنصة، تمنحك هذه البوابة صلاحيات كاملة لرفع وتسيير المقررات التعليمية، وتزويد طلبة الهندسة بالفيديوهات والمراجع العلمية.</span>
            ) : (
              <span>مرحباً بك <strong className="text-white font-black">{currentUser.name}</strong>. بصفتك مخولاً من الإدارة العامة، تمنحك هذه البوابة الصلاحيات الرقمية الكاملة لإصدار البيانات وإدارة العضويات، ومراجعة استفسارات الفلاحين.</span>
            )}
          </p>
        </div>
      </div>

      {/* Sub Tabs menu */}
      <div className="flex flex-wrap gap-2.5 bg-slate-950 border border-slate-900 p-2 rounded-2xl">
        {currentUser.role !== UserRole.EXPERT && (
          <button
            onClick={() => setActiveSubTab("users")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeSubTab === "users" ? "bg-rose-950/70 text-rose-300 border border-rose-900/55 shadow-[0_0_12px_rgba(244,63,94,0.1)]" : "text-slate-400 hover:text-white"}`}
          >
            <Users className="w-4 h-4" />
            <span>إدارة الأعضاء والصلاحيات ({usersList.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab("courses")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeSubTab === "courses" ? "bg-rose-950/70 text-rose-300 border border-rose-900/55 shadow-[0_0_12px_rgba(244,63,94,0.1)]" : "text-slate-400 hover:text-white"}`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>إشراف المقررات والدورات التعليمية ({courses.length})</span>
        </button>

        {currentUser.role !== UserRole.EXPERT && (
          <>
            <button
              onClick={() => setActiveSubTab("alerts")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeSubTab === "alerts" ? "bg-rose-950/70 text-rose-300 border border-rose-900/55 shadow-[0_0_12px_rgba(244,63,94,0.1)]" : "text-slate-400 hover:text-white"}`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>التنبيهات الزراعية والمناخية ({weatherAlerts.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("inquiries")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeSubTab === "inquiries" ? "bg-rose-950/70 text-rose-300 border border-rose-900/55 shadow-[0_0_12px_rgba(244,63,94,0.1)]" : "text-slate-400 hover:text-white"}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>الرسائل والرد على الاستفسارات ({inquiries.length})</span>
            </button>
          </>
        )}
      </div>

      {/* Main Admin Section Body */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
        
        {/* Subtab 1: USER ACCOUNTS MANAGEMENT */}
        {activeSubTab === "users" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Form card */}
            <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-850/80 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-slate-100 text-sm">إنشاء حساب جديد لعضو أو مشرف</h3>
              </div>

              {userMsg && (
                <div className="bg-emerald-950/50 border border-emerald-900 text-emerald-300 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p>{userMsg}</p>
                </div>
              )}

              {userError && (
                <div className="bg-rose-950/50 border border-rose-900 text-rose-300 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <p>{userError}</p>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">الاسم الكامل باللغة العربية</label>
                  <input
                    type="text" required placeholder="مثال: م. مريم الهادي" value={newUserName} onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">البريد الإلكتروني للولوج</label>
                  <input
                    type="email" required placeholder="name@email.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">رقم الهاتف للاتصال والتحقق</label>
                  <input
                    type="text" placeholder="05XXXXXXXX / 06XXXXXXXX" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">كلمة المرور الخاصة بالعضو</label>
                  <input
                    type="text" required placeholder="مثال: SecureUser2026@" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">رتبة وصلاحيات العضوية</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-200"
                  >
                    <option value={UserRole.FARMER}>فلاح السوفي</option>
                    <option value={UserRole.STUDENT}>طالب هندسة زراعية (أكاديمي)</option>
                    <option value={UserRole.EXPERT}>مهندس خبير فلاحي</option>
                    <option value={UserRole.COMPANY}>شركة زراعية / مستثمر</option>
                    <option value={UserRole.SUPERVISOR}>مشرف منصة مساعد (Supervisor)</option>
                    <option value={UserRole.MANAGER}>مدير عام إضافي (Manager)</option>
                    <option value={UserRole.WORKER}>عامل فلاحي / مقدم خدمات</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">الموقع / بلدية الإقامة بالوادي</label>
                  <input
                    type="text" placeholder="مثال: حاسي خليفة، الوادي" value={newUserLocation} onChange={(e) => setNewUserLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100"
                  />
                </div>

                {newUserRole === UserRole.COMPANY && (
                  <div className="col-span-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">اسم المؤسسة أو الشركة الزراعية</label>
                    <input
                      type="text" placeholder="مثال: مستودع الوادي للأسمدة العضوية" value={newUserCompany} onChange={(e) => setNewUserCompany(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                )}

                {newUserRole === UserRole.EXPERT && (
                  <div className="col-span-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">مجالات الخبرة الأكاديمية أو الميدانية</label>
                    <input
                      type="text" placeholder="مثال: ري حديث بالطاقة الشمسية، وقاية الأنسجة لنباتات دقلة نور" value={newUserSpecialty} onChange={(e) => setNewUserSpecialty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                )}

                <div className="col-span-1 md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تأكيد تسجيل العضو بالرتبة المعينة</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List and privileged controller */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-450" />
                  <h4 className="font-extrabold text-slate-100 text-sm">الأعضاء المسجلون بالمنصة وإدارة الصلاحيات</h4>
                </div>
                <div className="text-[10px] text-slate-500 font-bold">إجمالي الحسابات: {usersList.length} مستخدمين</div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {usersList.map((user) => (
                  <div 
                    key={user.id} 
                    className="bg-slate-950/60 p-5 rounded-2xl border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-slate-800 transition"
                  >
                    <div className="space-y-1.5 text-right">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-extrabold text-slate-100 text-sm">{user.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-900 border border-slate-800 text-[9px] text-slate-400 font-bold px-2 py-0.5 rounded-md">
                            رقم المعرف: {user.id}
                          </span>
                          {user.isCustom && (
                            <span className="bg-emerald-950 border border-emerald-900 text-[9px] text-emerald-400 font-bold px-2 py-0.5 rounded-md">
                              مضاف يدوياً
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 text-[10px] text-slate-450 font-mono">
                        <p>📧 {user.email}</p>
                        <p>📞 {user.phone || "غير ملحق"}</p>
                        <p>📍 {user.location || "ولاية الوادي"}</p>
                      </div>

                      {user.companyName && (
                        <p className="text-[10px] text-amber-400 font-medium bg-amber-950/30 px-2 py-1 rounded inline-block">🏢 الشركة: {user.companyName}</p>
                      )}
                      {user.specialty && (
                        <p className="text-[10px] text-cyan-400 font-medium bg-cyan-950/30 px-2 py-1 rounded inline-block">🎓 التخصص: {user.specialty}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold block text-left">تعديل الرتبة والامتيازات</span>
                        <select
                          disabled={user.id === "user_5"}
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          className="bg-slate-900 border border-slate-805 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-700 disabled:opacity-50"
                        >
                          <option value={UserRole.FARMER}>فلاح</option>
                          <option value={UserRole.STUDENT}>طالب هندسة زراعية</option>
                          <option value={UserRole.EXPERT}>خبير فلاحي</option>
                          <option value={UserRole.COMPANY}>شركة زراعية</option>
                          <option value={UserRole.SUPERVISOR}>مشرف مساعدة</option>
                          <option value={UserRole.MANAGER}>المدير العام</option>
                          <option value={UserRole.WORKER}>عامل / مقدم خدمة</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === "user_5"}
                        className="bg-slate-900 hover:bg-rose-950 border border-slate-800 text-slate-500 hover:text-rose-400 p-2.5 rounded-xl transition cursor-pointer self-end disabled:opacity-30 disabled:hover:bg-slate-900 disabled:hover:text-slate-500"
                        title={user.id === "user_5" ? "لا يمكن حذف حساب المدير العام الأساسي" : "حذف الحساب نهائياً"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Subtab 2: MANAGE EDUCATION COURSES */}
        {activeSubTab === "courses" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Form card */}
            <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-850/80 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-slate-100 text-sm">رفع وتثبيت مقرر تعليمي أو دورية زراعية جديدة</h3>
              </div>

              {courseMsg && (
                <div className="bg-emerald-950/50 border border-emerald-900 text-emerald-300 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p>{courseMsg}</p>
                </div>
              )}

              <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] text-slate-400 font-bold block">عنوان المقرر الدراسي</label>
                  <input
                    type="text" required placeholder="مثال: ري حقول البطاطا بالمرش المحوري" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">اسم الدكتور أو الخبير المحاضر</label>
                  <input
                    type="text" required placeholder="مثال: د. سمير مرداسي" value={courseInstructor} onChange={(e) => setCourseInstructor(e.target.value)}
                    disabled={currentUser.role === UserRole.EXPERT}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">الصفة الأكاديمية للمحاضر</label>
                  <input
                    type="text" placeholder="مثال: باحث بكلية الطبيعة والحياة - جامعة الوادي" value={courseInstructorRole} onChange={(e) => setCourseInstructorRole(e.target.value)}
                    disabled={currentUser.role === UserRole.EXPERT}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">مدة وتوصيف الجلسات</label>
                  <input
                    type="text" placeholder="مثال: 4 فصول دراسية (6 ساعات)" value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">تصنيف المادة العلمية</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-200"
                  >
                    <option value="crops">زراعة المحاصيل (بطاطا/حبوب)</option>
                    <option value="palms">زراعة النخيل (حماية دقلة نور)</option>
                    <option value="livestock">تربية المواشي بالجنوب الجزائري</option>
                    <option value="tech">حلول مكننة وري طاقة شمسية</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] text-slate-400 font-bold block">رابط الفيديو المضمّن (YouTube Embed Link أو رابط مباشر)</label>
                  <input
                    type="text" placeholder="https://www.youtube.com/embed/zH0F6LclisY" value={courseVidUrl} onChange={(e) => setCourseVidUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100 font-sans"
                  />
                </div>

                {/* File attachments Firebase upload */}
                <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-[11px] text-teal-400 font-extrabold flex items-center gap-1.5 font-sans">
                    <FileUp className="w-3.5 h-3.5 text-teal-400" />
                    تحميل مستند مادة علمية (PDF/Slides) إلى Firebase Storage
                  </label>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg text/*"
                    onChange={handleDocUpload}
                    className="block w-full text-[11px] text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-teal-950 file:text-teal-300 hover:file:bg-teal-900 cursor-pointer"
                  />
                  {uploadProgressDoc !== null && (
                    <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                      <div className="bg-teal-500 h-1 rounded-full transition-all duration-300" style={{ width: `${uploadProgressDoc}%` }}></div>
                    </div>
                  )}
                  {uploadedDocUrl && <span className="text-[10px] text-emerald-400 block font-mono truncate">✓ مرفوع: {uploadedDocName}</span>}
                </div>

                {/* Video clips Firebase upload */}
                <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1.5 font-sans">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    رفع مقطع فيديو محاضرة (MP4) إلى Firebase Storage
                  </label>
                  <input 
                    type="file" 
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="block w-full text-[11px] text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-950 file:text-emerald-300 hover:file:bg-emerald-900 cursor-pointer"
                  />
                  {uploadProgressVideo !== null && (
                    <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                      <div className="bg-emerald-500 h-1 rounded-full transition-all duration-300" style={{ width: `${uploadProgressVideo}%` }}></div>
                    </div>
                  )}
                  {uploadedVideoUrl && <span className="text-[10px] text-emerald-400 block font-mono truncate">✓ الفيديو جاهز في Firebase!</span>}
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] text-slate-400 font-bold block">وصف تفصيلي شامل للمادة والأهداف التعليمية</label>
                  <textarea
                    required rows={3} placeholder="اكتب أهداف الدورة التعليمية وما سيتعلمه طالب الهندسة الزراعية بالوادي..." value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-3 rounded-xl shadow col-span-2 transition cursor-pointer"
                >
                  نشر وتثبيت المقرر التعليمي وملفاته فورياً
                </button>
              </form>
            </div>

            {/* Courses visual inventory */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <span>المقررات التعليمية المنشورة حالياً بالمنصة</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-slate-950/80 p-5 rounded-2xl border border-slate-850 flex justify-between gap-4">
                    <div className="space-y-2 text-right flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-105 font-bold text-sm leading-tight">{course.title}</span>
                        <span className="bg-teal-950 border border-teal-900 text-[9px] text-teal-400 px-2 py-0.5 rounded">
                          {course.category === "crops" ? "إنتاج محاصيل" : "طاقة وري وبذور"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">المحاضر: {course.instructor} ({course.instructorRole})</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{course.description}</p>
                      <p className="text-[9px] font-mono text-slate-600">⏱️ {course.duration} | 🔗 معرف: {course.id}</p>
                    </div>

                    {(currentUser.role !== UserRole.EXPERT || course.instructor === currentUser.name) && (
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-slate-800 p-3 rounded-xl transition cursor-pointer self-start"
                        title="حذف المقرر الدراسي"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Subtab 3: BROADCAST CLIMATE ALERTS */}
        {activeSubTab === "alerts" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-850/80 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-extrabold text-slate-100 text-sm">بث وإعلان تحذير مناخي أو نصيحة زراعية طارئة للفلاسين بالجنوب</h3>
              </div>

              {alertMsg && (
                <div className="bg-emerald-950/50 border border-emerald-900 text-emerald-300 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p>{alertMsg}</p>
                </div>
              )}

              <form onSubmit={handleCreateAlert} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">نوع التنبيه</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-205"
                  >
                    <option value="heatwave">🌡️ موجة حر شديدة الشهيلي</option>
                    <option value="frost">❄️ خطر صقيع وضريب بالليل</option>
                    <option value="sandstorm">💨 عاصفة رملية وتطاير أتربة</option>
                    <option value="pest">🐛 انتشار سوسة النخيل أو بوفروة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold block">درجة خطورة التنبيه الإداري</label>
                  <select
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-200"
                  >
                    <option value="info">ℹ️ إرشاد زراعي اعتيادي (ازرق)</option>
                    <option value="warning">⚠️ تحذير يستوجب الحيطة (أصفر)</option>
                    <option value="danger">🚨 خطورة قصوى مستعجلة (أحمر)</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] text-slate-400 font-bold block">عنوان التنبيه بالعربية للواجهة الرئيسية</label>
                  <input
                    type="text" required placeholder="مثال: موجة حرارة تفوق 48 درجة مئوية - توصيات السقي المحوري ليلة السبت" value={alertTitleAr} onChange={(e) => setAlertTitleAr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] text-slate-400 font-bold block">تفاصيل التنبيه والنصائح الإرشادية اللازمة لمقاومته</label>
                  <textarea
                    required rows={3} placeholder="مثال: تنصح الإدارة الفلاحين في حاسي خليفة وضواحي الوادي بزيادة دورات السقي بالطاقة الشمسية ليلاً لتجنب تبخر المياه الشديد، وتغطية عراجين النخيل الفتية..." value={alertDescAr} onChange={(e) => setAlertDescAr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-800 text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer col-span-2"
                >
                  بث التنبيه المناخي والزراعي العاجل
                </button>
              </form>
            </div>

            {/* Warnings visual checklist */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-200 text-sm">التنبيهات النشطة حالياً في المنصة والمساعد الذكي</h4>
              <div className="grid grid-cols-1 gap-3">
                {weatherAlerts.map((alert) => (
                  <div key={alert.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex justify-between items-center gap-4">
                    <div className="text-right space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping shrink-0" />
                        <span className="text-slate-100 text-xs font-extrabold leading-tight">{alert.titleAr}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border uppercase ${alert.severity === "danger" ? "bg-red-950/80 border-red-900 text-red-400" : "bg-amber-950/80 border-amber-900 text-amber-400"}`}>
                          {alert.severity === "danger" ? "خطير عاجل" : "تحذير زراعي"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-405 leading-relaxed font-light">{alert.descriptionAr}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="bg-slate-900 hover:bg-rose-950 border border-slate-805 text-slate-500 hover:text-rose-400 p-2 rounded-xl transition"
                      title="مسح الإعلان"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Subtab 4: MESSAGES INBOX & USER INQUIRIES REPLY BOARD */}
        {activeSubTab === "inquiries" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/85">
              <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <span>بريد استقبال الاستفسارات ومراسلات فلاحي وطلبة الوادي</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-light mt-1">تستقبل هذه اللوحة كافة الرسائل المرسلة من صفحة الاتصال بالمنصة لتسهيل الإشراف الأكاديمي والمهني وإجابة الأعضاء المباشرة.</p>
            </div>

            {inquiries.length === 0 ? (
              <div className="text-center py-16 bg-slate-950/20 rounded-2xl border border-slate-850">
                <p className="text-xs text-slate-500 font-bold">صندوق الوارد فارغ. لم يتم استلام أي استفسارات حديثة حتى الآن.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="bg-slate-950/80 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-900 pb-3">
                      <div>
                        <h4 className="font-extrabold text-slate-100 text-xs">موضوع: {inq.subject}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-mono">
                          <p>👤 المرسل: <span className="text-slate-300 font-extrabold font-sans">{inq.senderName}</span></p>
                          <p>✉️ البريد: <span className="text-emerald-500">{inq.senderEmail}</span></p>
                          <p>📞 هاتف: <span>{inq.senderPhone}</span></p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono bg-slate-900 text-slate-500 px-3 py-1 rounded-full">{inq.date}</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border-r-2 border-amber-500/40">
                      <p className="text-xs text-slate-205 leading-relaxed">{inq.message}</p>
                    </div>

                    {inq.response ? (
                      <div className="p-3 bg-emerald-950/20 rounded-xl border-r-2 border-emerald-500/50 flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-emerald-400 font-bold">الرد الصادر من الإدارة ({inq.respondedAt}):</p>
                          <p className="text-xs text-slate-200 mt-1 leading-relaxed">{inq.response}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 p-3 bg-slate-900/20 border border-slate-850 rounded-xl">
                        <label className="text-[10px] text-slate-450 font-bold block">إرسال رد رسمي من الإدارة مباشرة إلى العضو</label>
                        <div className="flex gap-2.5">
                          <input
                            type="text"
                            placeholder="اكتب ردّك الإرشادي أو الإداري هنا لمساعدة السائل..."
                            value={replyText[inq.id] || ""}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [inq.id]: e.target.value }))}
                            className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs flex-1 focus:outline-none focus:border-indigo-800 text-white"
                          />
                          <button
                            onClick={() => handleSendResponse(inq.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>إرسال الرد</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
