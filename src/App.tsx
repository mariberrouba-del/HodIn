import React, { useState, useEffect } from "react";
import { UserRole, UserProfile, Course, Product, ServiceProvider, MarketPrice, WeatherAlert, ContentItem, CategoryItem } from "./types";
import Hero from "./components/Hero";
import Education from "./components/Education";
import Marketplace from "./components/Marketplace";
import Services from "./components/Services";
import Prices from "./components/Prices";
import SmartAssistance from "./components/SmartAssistance";
import Logo from "./components/Logo";
import AdminDashboard from "./components/AdminDashboard";
import FoundersModal from "./components/FoundersModal";
import FoundersSection from "./components/FoundersSection";
import FounderLogin from "./components/FounderLogin";
import FounderDashboard from "./components/FounderDashboard";
import StudentSpace from "./components/StudentSpace";
import AuthModal from "./components/AuthModal";
import { 
  Sprout, Briefcase, GraduationCap, Users, ShieldAlert, Award, Phone, 
  HelpCircle, ChevronLeft, LogIn, LogOut, HeartHandshake, User, RefreshCw, 
  LayoutDashboard, Star, Sparkles, MapPin, Layers, Settings, ArrowLeftRight,
  Mail, Lock, Eye, EyeOff, UserPlus, KeyRound, MessageSquare, Send, CheckCircle2, ShieldCheck, X, Trash2,
  BookOpen, ExternalLink, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  seedDatabaseIfEmpty, 
  authenticateFirebaseUser, 
  registerFirebaseUser, 
  forgotFirebasePassword, 
  logoutFirebaseUser,
  subscribeToAuthChanges,
  getFirebasePrices,
  getFirebaseWeatherAlerts,
  getFirebaseProviders,
  getFirebaseServiceRequests,
  getFirebaseProducts,
  getFirebaseCourses,
  getFirebaseInquiries,
  getFirebaseUsers,
  getFirebaseCategories,
  getFirebaseContent,
  isUserFounder,
  addFirebasePrice,
  updateFirebasePrice,
  deleteFirebasePrice,
  addFirebaseWeatherAlert,
  updateFirebaseWeatherAlert,
  deleteFirebaseWeatherAlert,
  addFirebaseServiceRequest,
  deleteFirebaseServiceRequest,
  addFirebaseProduct,
  updateFirebaseProduct,
  deleteFirebaseProduct,
  addFirebaseInquiry,
  addFirebaseCourse,
  updateFirebaseCourse,
  deleteFirebaseCourse
} from "./lib/firebaseService";


export default function App() {
  // Current active tab state with URL path resolution
  const [activeTab, setActiveTab] = useState<string>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.includes("/founder/login") || hash.includes("founder/login")) return "founder_login";
    if (path.includes("/founder/dashboard") || hash.includes("founder/dashboard")) return "founder_dashboard";
    if (path.includes("/student") || hash.includes("student")) return "student_space";
    return "home";
  });

  // Authentication & Session States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("hodint_logged_in") === "true";
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("hodint_user");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      id: "",
      name: "زائر المنصة",
      role: UserRole.STUDENT,
      phone: "",
      email: ""
    };
  });
  const [sessionToken, setSessionToken] = useState<string>(() => {
    return localStorage.getItem("hodint_token") || "";
  });

  // Login/Register Form Controllers
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  
  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState<UserRole>(UserRole.STUDENT);
  const [regLocation, setRegLocation] = useState("الوادي");
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regAcademicYear, setRegAcademicYear] = useState("");
  const [regInstitution, setRegInstitution] = useState("جامعة الشهيد حمه لخضر - الوادي");
  const [regSpecialty, setRegSpecialty] = useState("");

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [tempPasswordVisible, setTempPasswordVisible] = useState("");

  // Change Password Modal Controllers
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [showFoundersModal, setShowFoundersModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePassError, setChangePassError] = useState("");
  const [changePassSuccess, setChangePassSuccess] = useState("");

  // Feedback Contact Form States
  const [contactSubject, setContactSubject] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactText, setContactText] = useState("");
  const [contactMsg, setContactMsg] = useState("");

  // Master data state seeded with elegant offline defaults, loaded dynamically from server
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedContentDetail, setSelectedContentDetail] = useState<ContentItem | null>(null);
  
  // Admin Lists
  const [usersList, setUsersList] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time Auth State
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((profile) => {
      if (profile) {
        setCurrentUser(profile);
        setIsLoggedIn(true);
        localStorage.setItem("hodint_logged_in", "true");
        localStorage.setItem("hodint_user", JSON.stringify(profile));
        localStorage.setItem("hodint_token", profile.id);
        setSessionToken(profile.id);
      }
    });
    return () => unsubscribe();
  }, []);

  // Route protection for Founder & Admin Dashboards
  useEffect(() => {
    const isFounder = isLoggedIn && isUserFounder(currentUser);
    if (!isFounder && (activeTab === "founder_dashboard" || activeTab === "admin_dashboard")) {
      setActiveTab("home");
      try {
        window.history.pushState(null, "", "/");
      } catch (_) {}
    }
  }, [activeTab, isLoggedIn, currentUser]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const isFounder = isLoggedIn && isUserFounder(currentUser);

      if (path.includes("/founder/login") || hash.includes("founder/login")) {
        setActiveTab("founder_login");
      } else if (path.includes("/founder") || hash.includes("founder")) {
        if (isFounder) {
          setActiveTab("founder_dashboard");
        } else {
          setActiveTab("founder_login");
        }
      } else if (path.includes("/student") || hash.includes("student")) {
        setActiveTab("student_space");
      } else if (path.includes("/login") || hash.includes("login")) {
        setAuthMode("login");
        setShowAuthModal(true);
      } else if (path.includes("/register") || hash.includes("register")) {
        setAuthMode("register");
        setShowAuthModal(true);
      }
    };
    handlePopState();
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, [isLoggedIn, currentUser]);

  const navigateToTab = (tabId: string) => {
    const isFounder = isLoggedIn && isUserFounder(currentUser);
    // If not a founder, founder_dashboard and admin_dashboard redirect to founder_login
    if (!isFounder && (tabId === "founder_dashboard" || tabId === "admin_dashboard")) {
      setActiveTab("founder_login");
      try {
        window.history.pushState(null, "", "/founder/login");
      } catch (_) {}
      return;
    }

    setActiveTab(tabId);
    try {
      if (tabId === "founder_login") {
        window.history.pushState(null, "", "/founder/login");
      } else if (tabId === "founder_dashboard") {
        window.history.pushState(null, "", "/founder/dashboard");
      } else if (tabId === "student_space") {
        window.history.pushState(null, "", "/student");
      } else {
        window.history.pushState(null, "", "/");
      }
    } catch (_) {}
  };

  // Load all server side API data on mount
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Ensure seed on mount
      await seedDatabaseIfEmpty();

      const [fsPrices, fsAlerts, fsProviders, fsRequests, fsProducts, fsCourses, fsCats, fsContent] = await Promise.all([
        getFirebasePrices(),
        getFirebaseWeatherAlerts(),
        getFirebaseProviders(),
        getFirebaseServiceRequests(),
        getFirebaseProducts(),
        getFirebaseCourses(),
        getFirebaseCategories(),
        getFirebaseContent()
      ]);

      setPrices(fsPrices);
      setWeatherAlerts(fsAlerts);
      setProviders(fsProviders);
      setPendingRequests(fsRequests);
      setProducts(fsProducts);
      setCourses(fsCourses);
      setCategories(fsCats);
      setContentItems(fsContent);

      // Load admin lists if authorized
      if (isLoggedIn) {
        const inquiriesData = await getFirebaseInquiries();
        setInquiries(inquiriesData);

        if (isUserFounder(currentUser)) {
          const usersData = await getFirebaseUsers();
          setUsersList(usersData);
        }
      }

    } catch (e) {
      console.error("Error loading full-stack data.", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [isLoggedIn, currentUser.role]);

  // Handle Login Actions
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    if (!loginEmail.trim() || !loginPassword) {
      setAuthError("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }
    setIsAuthSubmitting(true);
    try {
      const data = await authenticateFirebaseUser(loginEmail.trim(), loginPassword);
      if (data.success) {
        localStorage.setItem("hodint_logged_in", "true");
        localStorage.setItem("hodint_user", JSON.stringify(data.user));
        localStorage.setItem("hodint_token", data.uid);
        
        setSessionToken(data.uid);
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        setActiveTab("home");
        setLoginPassword("");
      }
    } catch (err: any) {
      setAuthError(err.message || "فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Handle Register Actions
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    
    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !regPassword || !regConfirmPassword) {
      setAuthError("الرجاء تعبئة كافة الحقول الأساسية (الاسم، البريد، كلمة المرور وتأكيدها).");
      return;
    }

    if (regPassword.length < 6) {
      setAuthError("يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setAuthError("كلمتا المرور غير متطابقتين. يرجى إعادة التأكد.");
      return;
    }

    if (!regAgreeTerms) {
      setAuthError("يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة.");
      return;
    }

    setIsAuthSubmitting(true);
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
        setAuthSuccess("تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.");
        setLoginEmail(cleanEmail);
        setAuthMode("login");
        // reset form
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        setRegConfirmPassword("");
        setRegPhone("");
        setRegLocation("الوادي");
        setRegCompanyName("");
        setRegAcademicYear("");
        setRegInstitution("جامعة الشهيد حمه لخضر - الوادي");
        setRegSpecialty("");
        setRegAgreeTerms(false);
      }
    } catch (err: any) {
      setAuthError(err.message || "فشل إنشاء الحساب.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Handle Password Recovery Action
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setTempPasswordVisible("");
    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError("الرجاء إدخال البريد الإلكتروني المسجل.");
      return;
    }
    setIsAuthSubmitting(true);
    try {
      await forgotFirebasePassword(cleanEmail);
      setAuthSuccess("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى مراجعة صندوق الوارد.");
    } catch (err: any) {
      setAuthError(err.message || "تعذر إرسال رابط إعادة التعيين.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Handle Change Password (Logged in)
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError("");
    setChangePassSuccess("");
    try {
      alert("يمكن للأعضاء تحديث كلمة المرور مباشرة عبر رابط الأمان المستلم ببريدهم الإلكتروني المسجل.");
      setChangePassSuccess("تم إشعار نظام الأمان!");
      setTimeout(() => {
        setShowChangePassModal(false);
        setOldPassword("");
        setNewPassword("");
        setChangePassSuccess("");
      }, 2050);
    } catch (err: any) {
      setChangePassError(err.message || "فشل التغيير.");
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutFirebaseUser();
    } catch (_) {}
    localStorage.removeItem("hodint_logged_in");
    localStorage.removeItem("hodint_user");
    localStorage.removeItem("hodint_token");
    setIsLoggedIn(false);
    setCurrentUser({
      id: "",
      name: "زائر المنصة",
      role: UserRole.STUDENT,
      phone: "",
      email: ""
    });
    setActiveTab("home");
  };

  // Submit new feedback inquiry message
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactMsg("");
    if (!contactSubject || !contactName || !contactText) {
      alert("الرجاء ملء موضوع الاستفسار، الاسم والرسالة.");
      return;
    }
    try {
      const inquiryPayload = {
        id: "inq_" + Date.now(),
        senderName: contactName,
        senderEmail: currentUser?.email || "guest@hodint.dz",
        senderPhone: contactPhone,
        subject: contactSubject,
        message: contactText,
        createdAt: new Date().toISOString(),
        replied: false,
        reply: ""
      };
      await addFirebaseInquiry(inquiryPayload);
      const fsInq = await getFirebaseInquiries();
      setInquiries(fsInq);
      setContactMsg("تم استلام رسالتك بنجاح! سيجيبك الخبراء في أقرب وقت.");
      // Reset fields
      setContactSubject("");
      setContactText("");
    } catch (err) {
      console.error("Failed to post inquiry", err);
    }
  };

  // Post new price (Admin/Founder action)
  const handleAddPrice = async (payload: any): Promise<boolean> => {
    try {
      await addFirebasePrice(payload);
      const fsPrices = await getFirebasePrices();
      setPrices(fsPrices);
      return true;
    } catch (err) {
      console.error("Failed to add price", err);
    }
    return false;
  };

  // Update existing price
  const handleUpdatePrice = async (priceId: string, payload: any): Promise<boolean> => {
    try {
      await updateFirebasePrice(priceId, payload);
      const fsPrices = await getFirebasePrices();
      setPrices(fsPrices);
      return true;
    } catch (err) {
      console.error("Failed to update price", err);
    }
    return false;
  };

  // Weather Alert Handlers
  const handleAddWeatherAlert = async (payload: any): Promise<boolean> => {
    try {
      await addFirebaseWeatherAlert(payload);
      const fsWeather = await getFirebaseWeatherAlerts();
      setWeatherAlerts(fsWeather);
      return true;
    } catch (err) {
      console.error("Failed to add weather alert", err);
    }
    return false;
  };

  const handleUpdateWeatherAlert = async (alertId: string, payload: any): Promise<boolean> => {
    try {
      await updateFirebaseWeatherAlert(alertId, payload);
      const fsWeather = await getFirebaseWeatherAlerts();
      setWeatherAlerts(fsWeather);
      return true;
    } catch (err) {
      console.error("Failed to update weather alert", err);
    }
    return false;
  };

  const handleDeleteWeatherAlert = async (alertId: string): Promise<boolean> => {
    try {
      await deleteFirebaseWeatherAlert(alertId);
      const fsWeather = await getFirebaseWeatherAlerts();
      setWeatherAlerts(fsWeather);
      return true;
    } catch (err) {
      console.error("Failed to delete weather alert", err);
    }
    return false;
  };

  // Post service request (Farmer action)
  const handleAddServiceRequest = async (payload: any): Promise<boolean> => {
    try {
      await addFirebaseServiceRequest(payload);
      const fsRequests = await getFirebaseServiceRequests();
      setPendingRequests(fsRequests);
      return true;
    } catch (err) {
      console.error("Failed to post request", err);
    }
    return false;
  };

  // Post marketplace product (Company/Admin action)
  const handleAddProduct = async (payload: any): Promise<boolean> => {
    try {
      await addFirebaseProduct(payload);
      const fsProducts = await getFirebaseProducts();
      setProducts(fsProducts);
      return true;
    } catch (err) {
      console.error("Failed to add product", err);
    }
    return false;
  };

  // Delete a price ticker (Admin option)
  const handleDeletePrice = async (priceId: string): Promise<boolean> => {
    try {
      await deleteFirebasePrice(priceId);
      const fsPrices = await getFirebasePrices();
      setPrices(fsPrices);
      return true;
    } catch (err) {
      console.error("Failed to delete price", err);
    }
    return false;
  };

  // Delete a service request (Admin or Farmer option)
  const handleDeleteServiceRequest = async (requestId: string): Promise<boolean> => {
    try {
      await deleteFirebaseServiceRequest(requestId);
      const fsRequests = await getFirebaseServiceRequests();
      setPendingRequests(fsRequests);
      return true;
    } catch (err) {
      console.error("Failed to delete service request", err);
    }
    return false;
  };

  // Delete a product (Admin or Company option)
  const handleDeleteProduct = async (productId: string): Promise<boolean> => {
    try {
      await deleteFirebaseProduct(productId);
      const fsProducts = await getFirebaseProducts();
      setProducts(fsProducts);
      return true;
    } catch (err) {
      console.error("Failed to delete product", err);
    }
    return false;
  };

  // Get user role badges with elegant new styling matched to general logo tints
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.FARMER:
        return { label: "فلاح السوفي", color: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60" };
      case UserRole.STUDENT:
        return { label: "طالب أكاديمي", color: "bg-violet-950/80 text-violet-300 border-violet-800/60" };
      case UserRole.EXPERT:
        return { label: "مهندس خبير", color: "bg-cyan-950/80 text-cyan-350 border-cyan-800/60" };
      case UserRole.COMPANY:
        return { label: "شركة زراعية", color: "bg-amber-950/80 text-amber-300 border-amber-800/60" };
      case UserRole.MANAGER:
        return { label: "المدير العام", color: "bg-rose-950/90 text-rose-300 border-rose-800/80 font-bold" };
      case UserRole.SUPERVISOR:
        return { label: "مشرف المنصة", color: "bg-indigo-950/80 text-indigo-300 border-indigo-800/60 font-semibold" };
      case UserRole.WORKER:
        return { label: "مقدم خدمة / عامل", color: "bg-gray-900 text-gray-300 border-gray-800 font-medium" };
      case UserRole.ADMIN:
      default:
        return { label: "مشرف المنصة", color: "bg-rose-950/90 text-rose-300 border-rose-800/80 font-bold" };
    }
  };

  return (
    <div className="min-h-screen bg-[#030610] text-[#f1f5f9] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 antialiased" dir="rtl">
      
      {/* Upper ambient background glow matching brand colors */}
      <div className="absolute top-0 right-0 left-0 h-[500px] bg-gradient-to-b from-emerald-950/30 via-transparent to-transparent pointer-events-none -z-10" />

      {/* Dynamic Header & App Bar */}
      <header className="bg-slate-950/80 border-b border-slate-900 sticky top-0 z-40 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.15)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* High fidelity dynamic Logo */}
            <div 
              onClick={() => navigateToTab("home")}
              className="flex items-center gap-3 animate-pulse-slow cursor-pointer"
            >
              <Logo className="w-13 h-13" showText={true} textSize="md" />
            </div>

            {/* Main Tabs Navigation with hover effects */}
            <nav className="hidden lg:flex items-center gap-1 text-xs">
              {[
                { id: "home", label: "الرئيسية" },
                { id: "education", label: "التعليم والتدريب" },
                { id: "marketplace", label: "السوق الفلاحي" },
                { id: "services", label: "الوساطة والخدمات" },
                { id: "prices", label: "بورصة الأسعار" },
                { id: "assistance", label: "المساعد الذكي (AI)" },
                { id: "student_space", label: "فضاء الطالب" },
                ...(isLoggedIn && isUserFounder(currentUser)
                  ? [
                      { id: "founder_dashboard", label: "لوحة المؤسسين (Founders)" },
                      { id: "admin_dashboard", label: "لوحة التحكم الإدارية" }
                    ] 
                  : []
                )
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigateToTab(tab.id)}
                    className="relative px-4 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer text-slate-300 hover:text-white"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeTabGlow"
                        className="absolute inset-0 bg-emerald-950/50 border border-emerald-800/40 rounded-xl -z-10 shadow-[inner_0_0_8px_rgba(16,185,129,0.1)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={isActive ? "text-emerald-400 font-extrabold" : ""}>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick User Actions & Auth Controls (Top Left in RTL) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 shadow-md">
                    <div className="bg-emerald-950/60 text-emerald-400 w-8 h-8 rounded-xl flex items-center justify-center border border-emerald-800/40 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-right flex flex-col justify-center max-w-[130px]">
                      <span className="text-[11px] font-extrabold text-slate-100 leading-none truncate">{currentUser.name}</span>
                      <span className="text-[9px] text-emerald-400 font-bold mt-1 leading-none truncate">{getRoleBadge(currentUser.role).label}</span>
                    </div>

                    <div className="h-5 w-[1px] bg-slate-800 mx-0.5 shrink-0" />

                    <button 
                      onClick={() => setShowChangePassModal(true)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
                      title="تغيير كلمة المرور الخاصة بك"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Explicit Logout Button */}
                  <button 
                    onClick={handleLogout}
                    className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-800/50 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="تسجيل الخروج من الحساب"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span className="hidden sm:inline">تسجيل الخروج</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Explicit Login Button */}
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>تسجيل الدخول</span>
                  </button>

                  {/* Register Button */}
                  <button
                    onClick={() => {
                      setAuthMode("register");
                      setShowAuthModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700/80 font-bold text-xs transition hidden sm:flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span>حساب جديد</span>
                  </button>
                </div>
              )}
              
              <button 
                onClick={fetchAllData}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-all p-2.5 sm:p-3 rounded-2xl shrink-0 cursor-pointer relative"
                title="تحديث شامل للبورصة والبيانات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Responsive tabs mobile navigator */}
      <div className="lg:hidden bg-slate-950 border-b border-slate-900 p-2 overflow-x-auto flex gap-1.5 scrollbar-none sticky top-20 z-30" dir="rtl">
        {[
          { id: "home", label: "الرئيسية" },
          { id: "education", label: "التعليم" },
          { id: "marketplace", label: "السوق" },
          { id: "services", label: "الوساطة" },
          { id: "prices", label: "البورصة" },
          { id: "assistance", label: "المساعد (AI)" },
          { id: "student_space", label: "فضاء الطالب" },
          ...(isLoggedIn && isUserFounder(currentUser) 
            ? [
                { id: "founder_dashboard", label: "لوحة المؤسسين" },
                { id: "admin_dashboard", label: "الإدارة" }
              ] 
            : []
          )
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigateToTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs shrink-0 transition-all ${isActive ? "bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/40" : "bg-slate-900 border border-slate-800 text-slate-400"}`}
            >
              {tab.label}
            </button>
          );
        })}

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl font-bold text-xs shrink-0 transition-all bg-rose-950/60 text-rose-300 border border-rose-800/60 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>تسجيل الخروج</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setAuthMode("login");
              setShowAuthModal(true);
            }}
            className="px-3.5 py-2 rounded-xl font-bold text-xs shrink-0 transition-all bg-emerald-500 text-slate-950 flex items-center gap-1 font-black"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>تسجيل الدخول</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold tracking-wider">جاري مزامنة بيانات منصة هودنت مع ملقم جامعة الوادي...</p>
          </div>
        ) : (
          <div>
            
            {/* Show Home tab */}
            {activeTab === "home" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <Hero onOpenFounders={isLoggedIn && isUserFounder(currentUser) ? () => setShowFoundersModal(true) : undefined} />
                
                {/* Visual directory shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
                  
                  {/* Education card */}
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-md hover:border-emerald-500/20 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-emerald-950/60 rounded-2xl flex items-center justify-center mb-4 border border-emerald-800/40 group-hover:bg-emerald-500 transition-all">
                      <GraduationCap className="w-6 h-6 text-emerald-400 group-hover:text-white" />
                    </div>
                    <h3 className="font-extrabold text-slate-100 text-base mb-2">التعليم والتأهيل الأكاديمي</h3>
                    <p className="text-xs text-slate-450 leading-relaxed mb-4">
                      مقررات مسجلة بالتعاون مع دكاترة وباحثي جامعة الوادي لتدريب الطلبة والفلاحين على السقي بمحاور الطاقة الشمسية وحماية التربة الرملية.
                    </p>
                    <button
                      onClick={() => navigateToTab("education")}
                      className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1.5 leading-none transition cursor-pointer"
                    >
                      <span>تصفح المقاطع والكتيبات المتاحة</span>
                      <ChevronLeft className="w-4 h-4 transform rotate-180" />
                    </button>
                  </div>

                  {/* Marketplace card */}
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-md hover:border-amber-500/20 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-amber-950/60 rounded-2xl flex items-center justify-center mb-4 border border-amber-800/40 group-hover:bg-amber-600 transition-all">
                      <Briefcase className="w-6 h-6 text-amber-400 group-hover:text-white" />
                    </div>
                    <h3 className="font-extrabold text-slate-100 text-base mb-2">سوق البذور وكراء الآلات</h3>
                    <p className="text-xs text-slate-450 leading-relaxed mb-4">
                      فضاء ترويجي يربط الشركات والمتاجر الفلاحية مع الفلاح السوفي لعرض بذور 'سبونتا' ومعدات الحفر وكراء الجرارات بصفة مباشرة.
                    </p>
                    <button
                      onClick={() => navigateToTab("marketplace")}
                      className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 leading-none transition cursor-pointer"
                    >
                      <span>ادخل للسوق وعاين الأسعار المتداولة</span>
                      <ChevronLeft className="w-4 h-4 transform rotate-180" />
                    </button>
                  </div>

                  {/* Intelligent Help card */}
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-md hover:border-cyan-500/20 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-cyan-950/60 rounded-2xl flex items-center justify-center mb-4 border border-cyan-800/40 group-hover:bg-cyan-500 transition-all">
                      <LayoutDashboard className="w-6 h-6 text-cyan-400 group-hover:text-white" />
                    </div>
                    <h3 className="font-extrabold text-slate-100 text-base mb-2">مستشار دورات السقي الذكي (AI)</h3>
                    <p className="text-xs text-slate-450 leading-relaxed mb-4">
                      استخدم مستشار التربة الرملية، وتابع تقارير الطقس، وتحاور فوريا حول الحشرات والنباتات مع المساعد الذكي المدعم بـ Gemini.
                    </p>
                    <button
                      onClick={() => navigateToTab("assistance")}
                      className="text-cyan-400 hover:text-cyan-300 font-bold text-xs flex items-center gap-1.5 leading-none transition cursor-pointer"
                    >
                      <span>طرح سؤال على المساعد الزراعي</span>
                      <ChevronLeft className="w-4 h-4 transform rotate-180" />
                    </button>
                  </div>

                </div>

                {/* Published Guides & Knowledge from Founders & Researchers */}
                {contentItems.length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6" dir="rtl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div className="space-y-1 text-right">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold">
                            إصدارات الهيئة التأسيسية
                          </span>
                          <h3 className="font-extrabold text-slate-100 text-lg">أحدث المقالات والإرشادات الزراعية التخصصية</h3>
                        </div>
                        <p className="text-xs text-slate-400">
                          مقالات وأبحاث موثقة محررة من طرف المهندسين المؤسسين والمشرفين الأكاديميين بجامعة الوادي
                        </p>
                      </div>
                      
                      {isLoggedIn && isUserFounder(currentUser) && (
                        <button
                          onClick={() => navigateToTab("founder_dashboard")}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start md:self-auto cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>إدارة المحتوى في لوحة المؤسسين</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {contentItems.slice(0, 6).map((item) => {
                        const cat = categories.find((c) => c.id === item.categoryId);
                        return (
                          <div 
                            key={item.id}
                            className="bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
                          >
                            {item.imageUrl && (
                              <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                                {(item.categoryName || cat) && (
                                  <span className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-sm text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-800">
                                    {item.categoryName || cat?.nameAr || "إرشاد فلاحي"}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                              <div className="space-y-2">
                                <h4 className="font-extrabold text-white text-sm leading-snug group-hover:text-emerald-400 transition-colors">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                  {item.description || (item.body ? (item.body.length > 100 ? item.body.slice(0, 100) + "..." : item.body) : "")}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                                <span className="font-semibold text-slate-300">{item.author || item.authorRole || "م. ماريه بروبة"}</span>
                                <button
                                  onClick={() => setSelectedContentDetail(item)}
                                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <span>قراءة التفاصيل</span>
                                  <ChevronLeft className="w-3.5 h-3.5 transform rotate-180" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* About university context */}
                <div className="bg-slate-900/45 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row items-center gap-6" dir="rtl">
                  <div className="w-16 h-16 bg-emerald-950/80 rounded-full flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-800/40">
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5 text-center md:text-right font-sans">
                    <h3 className="font-extrabold text-slate-100 text-sm">البعد الأكاديمي والبحثي لبرنامج هودنت</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      تم تصوّر منصة "HodInt" كبنية رقمية ذكية تربط أبحاث كلية علوم الطبيعة والحياة بـ <strong className="text-slate-300 font-extrabold">جامعة الشهيد حمه لخضر بالوادي</strong> بالفلاح السوفى البسيط مباشرة. يساهم دكاترة الهيئة برأسهم <strong>الدكتور سمير مرداسي</strong> وطلبة الماستر والدكتوراه في رفد المستودع بالخبرات لزيادة مردود الهكتار للبطاطا والتمور بطرق تنافسية ومستدامة بيئياً.
                    </p>
                  </div>
                </div>

                {/* Interactive Contact & Expert Advisory Form */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-4">
                    <div className="space-y-1 text-right">
                      <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                        <span className="p-1 px-2.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded-lg text-xs font-bold font-sans">بوابة التواصل</span>
                        <span>اتصل بإدارة HodInt أو اطلب استشارة تقنية</span>
                      </h3>
                      <p className="text-xs text-slate-450 leading-relaxed font-light">
                        هل لديك استفسار علمي لأسرة الكلية، أو ترغب في تعديل بيانات حسابك أو الإبلاغ عن مشكلة؟ أرسل رسالتك فورياً هنا.
                      </p>
                    </div>
                  </div>

                  {contactMsg && (
                    <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-300 text-xs p-3.5 rounded-xl font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping shrink-0" />
                      <p>{contactMsg}</p>
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans" dir="rtl">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">موضوع الرسالة / الاستشارة</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="مثال: استفسار حول مكافحة غبار التمر" 
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">الاسم الكامل</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="مثال: المزارع بن خليفة" 
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">رقم الهاتف للرد</label>
                      <input 
                        type="text" 
                        placeholder="05XXXXXXXX / 06XXXXXXXX" 
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 text-white font-sans"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-3">
                      <label className="text-[10px] text-slate-400 font-bold block">نص الاستفسار الفلاحي أو الرسالة الإرشادية المطلوبة بالتفصيل</label>
                      <textarea 
                        required 
                        rows={3}
                        placeholder="اكتب رسالتك أو مشكلتك الفنية هنا بالتفصيل، وسيتكفل الأساتذة والمهندسون بالإجابة عليك فورياً في لوحة الإشراف..." 
                        value={contactText}
                        onChange={(e) => setContactText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 text-white"
                      />
                    </div>

                    <div className="md:col-span-3 text-left">
                      <button 
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-6 py-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال الرسالة لمركز الإشراف والأكاديميين</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}

            {/* Educational Training tab */}
            {activeTab === "education" && (
              <div className="animate-in fade-in duration-200">
                <Education courses={courses} userRole={currentUser.role} />
              </div>
            )}

            {/* Marketplace Tab */}
            {activeTab === "marketplace" && (
              <div className="animate-in fade-in duration-200">
                <Marketplace 
                  products={products} 
                  onAddProduct={handleAddProduct} 
                  onDeleteProduct={handleDeleteProduct}
                  userRole={currentUser.role} 
                />
              </div>
            )}

            {/* Services mediation tab */}
            {activeTab === "services" && (
              <div className="animate-in fade-in duration-200">
                <Services 
                  providers={providers} 
                  pendingRequests={pendingRequests} 
                  onAddRequest={handleAddServiceRequest} 
                  onDeleteRequest={handleDeleteServiceRequest}
                  userRole={currentUser.role} 
                />
              </div>
            )}

            {/* Market Prices Tab */}
            {activeTab === "prices" && (
              <div className="animate-in fade-in duration-200">
                <Prices 
                  prices={prices} 
                  onAddPrice={handleAddPrice} 
                  onUpdatePrice={handleUpdatePrice}
                  onDeletePrice={handleDeletePrice}
                  userRole={currentUser.role} 
                  currentUser={currentUser}
                />
              </div>
            )}

            {/* Smart agricultural assistance tab */}
            {activeTab === "assistance" && (
              <div className="animate-in fade-in duration-200">
                <SmartAssistance 
                  weatherAlerts={weatherAlerts} 
                  currentUser={currentUser}
                  onAddAlert={handleAddWeatherAlert}
                  onDeleteAlert={handleDeleteWeatherAlert}
                />
              </div>
            )}

            {/* Student Space Tab */}
            {activeTab === "student_space" && (
              <div className="animate-in fade-in duration-200">
                <StudentSpace
                  currentUser={currentUser}
                  onUpdateUser={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    localStorage.setItem("hodint_user", JSON.stringify(updatedUser));
                  }}
                  onLogout={handleLogout}
                  onNavigateToTab={(tab) => navigateToTab(tab)}
                />
              </div>
            )}

            {/* Founder Login Tab */}
            {activeTab === "founder_login" && (
              <div className="animate-in fade-in duration-200">
                <FounderLogin 
                  onLoginSuccess={(user) => {
                    setCurrentUser(user);
                    setIsLoggedIn(true);
                    navigateToTab("founder_dashboard");
                  }}
                  onNavigateToHome={() => navigateToTab("home")}
                />
              </div>
            )}

            {/* Founder Dashboard Tab */}
            {activeTab === "founder_dashboard" && isLoggedIn && isUserFounder(currentUser) && (
              <div className="animate-in fade-in duration-200">
                <FounderDashboard 
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onNavigateToHome={() => navigateToTab("home")}
                />
              </div>
            )}

            {/* Admin Management Dashboard tab */}
            {activeTab === "admin_dashboard" && isLoggedIn && isUserFounder(currentUser) && (
              <div className="animate-in fade-in duration-200">
                <AdminDashboard 
                  currentUser={currentUser}
                  usersList={usersList}
                  courses={courses}
                  weatherAlerts={weatherAlerts}
                  inquiries={inquiries}
                  setUsersList={setUsersList}
                  setCourses={setCourses}
                  setWeatherAlerts={setWeatherAlerts}
                  setInquiries={setInquiries}
                  fetchAllData={fetchAllData}
                />
              </div>
            )}

          </div>
        )}
      </main>

      {/* Platform global footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-light">
            
            {/* Founders & supervisors attribution */}
            <div className="space-y-4 text-center md:text-right">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Logo className="w-10 h-10" showText={false} />
                <h4 className="font-extrabold text-slate-100 text-sm">HodInt – منصة الحلول الفلاحية بالوادي</h4>
              </div>
              <p className="leading-relaxed text-slate-400">
                منصة تواصل وعلمية ذكية تسعى لربط طاقات جامعة الوادي بالمزارع مباشرة لضمان سلامة الإنتاج وترشيد مصادر الطاقة النظيفة.
              </p>
              <p className="text-slate-500">© 2026 HodInt. كافة الحقوق محفوظة ومسجلة علمياً بالجزائر.</p>
            </div>

            {/* Academic super references */}
            <div className="space-y-4 text-center md:text-right">
              <h4 className="font-bold text-slate-200 text-sm border-b border-slate-900 pb-2">التنسيق الأكاديمي والهيئة التأسيسية</h4>
              <p className="leading-relaxed">
                تحت إشراف مباشر: <strong>الأستاذ الدكتور سمير مرداسي</strong><br />
                بالتنسيق العلمي مع أساتذة ومخابر كلية علوم الطبيعة والحياة - <span className="font-semibold text-emerald-400">جامعة الشهيد حمه لخضر (ولاية الوادي)</span>.
              </p>
              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-850 space-y-1">
                <div className="text-slate-200 font-bold text-[11px]">
                  <span>المهندسون المؤسسون:</span>
                </div>
                <div className="text-emerald-300 text-xs font-semibold">
                  م. ماريه بروبة & م. إكرام محده
                </div>
              </div>
            </div>

            {/* Direct Official Contact coordinates */}
            <div className="space-y-4 text-center md:text-right">
              <h4 className="font-bold text-slate-200 text-sm border-b border-slate-900 pb-2">الاتصال والمراسلة</h4>
              <p className="leading-relaxed">
                مكتب الاتصال وخدمات الفلاحة بمدخلات التكنولوجيا، ولاية الوادي، الجمهورية الجزائرية الديمقراطية الشعبية.
              </p>
              <div className="space-y-2 font-mono text-[11px] text-slate-300 mt-2">
                <p className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-emerald-500">📞</span>
                  <span className="dir-ltr text-xs font-bold font-sans">+213 549 598 307</span>
                </p>
                <p className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-emerald-500">✉️</span>
                  <span>hodintplatform@gmail.com</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Article Detail View Modal */}
      {selectedContentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedContentDetail(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedContentDetail.imageUrl && (
              <div className="rounded-2xl overflow-hidden h-64 w-full">
                <img 
                  src={selectedContentDetail.imageUrl} 
                  alt={selectedContentDetail.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {selectedContentDetail.categoryName || categories.find((c) => c.id === selectedContentDetail.categoryId)?.nameAr || "إرشاد فلاحي"}
                </span>
                <span className="text-slate-400">بواسطة: {selectedContentDetail.author || selectedContentDetail.authorRole || "م. ماريه بروبة"}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{selectedContentDetail.createdAt ? new Date(selectedContentDetail.createdAt).toLocaleDateString("ar-DZ") : "اليوم"}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">{selectedContentDetail.title}</h2>
              {selectedContentDetail.description && (
                <p className="text-sm font-semibold text-emerald-300/90 leading-relaxed bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/30">
                  {selectedContentDetail.description}
                </p>
              )}
            </div>

            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-3">
              {selectedContentDetail.body || selectedContentDetail.description || ""}
            </div>

            {selectedContentDetail.tags && selectedContentDetail.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800">
                {selectedContentDetail.tags.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedContentDetail(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Founders & Supervision Modal */}
      <FoundersModal 
        isOpen={showFoundersModal} 
        onClose={() => setShowFoundersModal(false)}
        onOpenFounderLogin={() => {
          setShowFoundersModal(false);
          navigateToTab(isLoggedIn && isUserFounder(currentUser) ? "founder_dashboard" : "founder_login");
        }}
      />

      {/* Universal Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authMode}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user, token) => {
          setCurrentUser(user);
          setSessionToken(token);
          setIsLoggedIn(true);
          localStorage.setItem("hodint_logged_in", "true");
          localStorage.setItem("hodint_user", JSON.stringify(user));
          localStorage.setItem("hodint_token", token);
          setShowAuthModal(false);
        }}
        onOpenFounderLogin={() => {
          setShowAuthModal(false);
          navigateToTab("founder_login");
        }}
      />

    </div>
  );
}
