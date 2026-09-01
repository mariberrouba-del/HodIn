import React, { useState, useEffect } from "react";
import { UserProfile, ContentItem, Course, CategoryItem, MarketPrice, Product, ServiceProvider, FavoriteItem, StudentNotification, UserRole, CourseProgress, CourseCertificate } from "../types";
import StudentCoursePlayer from "./StudentCoursePlayer";
import CertificateModal from "./CertificateModal";
import {
  GraduationCap, BookOpen, Bookmark, User, Bell, DollarSign, ShoppingBag,
  Wrench, Home, Search, Heart, Share2, Download, Play, Video, CheckCircle2,
  AlertTriangle, Calendar, Award, Phone, Mail, MapPin, Building, Sparkles,
  ExternalLink, ChevronLeft, ChevronRight, X, Star, FileText, Clock, RefreshCw,
  Send, Lock, ShieldCheck, Filter, ArrowRight, Layers, Printer
} from "lucide-react";
import {
  getFirebaseContent,
  getFirebaseCourses,
  getFirebaseCategories,
  getFirebasePrices,
  getFirebaseProducts,
  getFirebaseProviders,
  getFirebaseFavorites,
  addFirebaseFavorite,
  deleteFirebaseFavorite,
  updateStudentProfile,
  getFirebaseNotifications,
  addFirebaseInquiry,
  getFirebaseCourseProgress,
  getFirebaseCertificates
} from "../lib/firebaseService";

interface StudentSpaceProps {
  currentUser: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function StudentSpace({
  currentUser,
  onUpdateUser,
  onLogout,
  onNavigateToTab
}: StudentSpaceProps) {
  // Navigation Tabs for Student
  const [activeTab, setActiveTab] = useState<
    "home" | "profile" | "courses" | "certificates" | "articles" | "favorites" | "services" | "prices" | "products" | "notifications"
  >("home");

  // Data States
  const [articles, setArticles] = useState<ContentItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress>>({});
  const [certificatesList, setCertificatesList] = useState<CourseCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser.name || "");
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || "");
  const [profileSpecialty, setProfileSpecialty] = useState(currentUser.specialty || "علوم فلاحية وإنتاج نباتي");
  const [profileField, setProfileField] = useState(currentUser.agriculturalField || "زراعة البطاطا الصحراوية وإدارة السقي");
  const [profileInstitution, setProfileInstitution] = useState(currentUser.institution || "جامعة الشهيد حمه لخضر - الوادي");
  const [profileBio, setProfileBio] = useState(currentUser.bio || "");
  const [profileLocation, setProfileLocation] = useState(currentUser.location || "الوادي");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favFilter, setFavFilter] = useState<"all" | "article" | "course" | "product">("all");
  const [courseProgressFilter, setCourseProgressFilter] = useState<"all" | "in_progress" | "completed">("all");
  const [courseTierFilter, setCourseTierFilter] = useState<"all" | "free" | "paid">("all");

  // Modals & Active Viewers
  const [selectedArticle, setSelectedArticle] = useState<ContentItem | null>(null);
  const [activePlayingCourse, setActivePlayingCourse] = useState<Course | null>(null);
  const [activeViewingCert, setActiveViewingCert] = useState<CourseCertificate | null>(null);

  // Consultation Form
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryText, setInquiryText] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Load all student space data
  const loadData = async () => {
    try {
      setLoading(true);
      const [
        fetchedArticles,
        fetchedCourses,
        fetchedCats,
        fetchedPrices,
        fetchedProducts,
        fetchedProviders,
        fetchedFavs,
        fetchedNotifs,
        fetchedCerts
      ] = await Promise.all([
        getFirebaseContent(),
        getFirebaseCourses(),
        getFirebaseCategories(),
        getFirebasePrices(),
        getFirebaseProducts(),
        getFirebaseProviders(),
        getFirebaseFavorites(currentUser.id),
        getFirebaseNotifications(currentUser.id),
        getFirebaseCertificates(currentUser.id)
      ]);

      // Only published content/courses for student view
      const validCourses = fetchedCourses.filter((c) => c.status !== "draft" && c.status !== "archived");
      setArticles(fetchedArticles.filter((a) => a.isPublished !== false && a.status !== "draft" && a.status !== "archived"));
      setCourses(validCourses);
      setCategories(fetchedCats);
      setPrices(fetchedPrices);
      setProducts(fetchedProducts);
      setProviders(fetchedProviders);
      setFavorites(fetchedFavs);
      setNotifications(fetchedNotifs);
      setCertificatesList(fetchedCerts);

      // Load progress map for each course
      const pMap: Record<string, CourseProgress> = {};
      await Promise.all(
        validCourses.map(async (c) => {
          const prog = await getFirebaseCourseProgress(currentUser.id, c.id);
          if (prog) {
            pMap[c.id] = prog;
          }
        })
      );
      setProgressMap(pMap);
    } catch (err) {
      console.error("Error loading student space data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  // Favorite toggle handler
  const handleToggleFavorite = async (
    itemType: "article" | "course" | "product" | "service",
    itemId: string,
    title: string,
    extra?: { category?: string; imageUrl?: string; description?: string; authorOrInstructor?: string }
  ) => {
    const existing = favorites.find((f) => f.itemId === itemId && f.userId === currentUser.id);
    if (existing) {
      // Remove from favorites
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      await deleteFirebaseFavorite(existing.id, currentUser.id);
    } else {
      // Add to favorites
      const newFav: FavoriteItem = {
        id: "fav_" + Math.random().toString(36).substring(2, 11),
        userId: currentUser.id,
        itemType,
        itemId,
        title,
        category: extra?.category || "",
        imageUrl: extra?.imageUrl || "",
        description: extra?.description || "",
        authorOrInstructor: extra?.authorOrInstructor || "",
        createdAt: new Date().toISOString()
      };
      setFavorites((prev) => [newFav, ...prev]);
      await addFirebaseFavorite(newFav);
    }
  };

  const isFavorited = (itemId: string) => {
    return favorites.some((f) => f.itemId === itemId && f.userId === currentUser.id);
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileMsg({ text: "يرجى كتابة الاسم الكامل", isError: true });
      return;
    }

    try {
      setIsSavingProfile(true);
      setProfileMsg(null);
      const updated = await updateStudentProfile(
        currentUser.id,
        {
          name: profileName,
          phone: profilePhone,
          specialty: profileSpecialty,
          agriculturalField: profileField,
          institution: profileInstitution,
          bio: profileBio,
          location: profileLocation
        },
        currentUser.role
      );

      onUpdateUser(updated);
      setProfileMsg({ text: "تم تحديث بياناتك بنجاح وحفظها في قاعدة البيانات", isError: false });
      setTimeout(() => setProfileMsg(null), 4000);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setProfileMsg({ text: "حدث خطأ أثناء حفظ الملف الشخصي: " + (err.message || ""), isError: true });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Consultation Submit
  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirySubject.trim() || !inquiryText.trim()) return;

    try {
      await addFirebaseInquiry({
        id: "inq_" + Date.now(),
        farmerId: currentUser.id,
        farmerName: currentUser.name,
        subject: inquirySubject,
        question: inquiryText,
        phone: currentUser.phone,
        specialty: currentUser.specialty,
        createdAt: new Date().toISOString(),
        replied: false
      });
      setInquirySuccess(true);
      setInquirySubject("");
      setInquiryText("");
      setTimeout(() => setInquirySuccess(false), 5000);
    } catch (err) {
      console.error("Error submitting inquiry:", err);
    }
  };

  // Filtered articles
  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.tags && a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCat = selectedCategory === "all" || a.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const prog = progressMap[c.id];
    const isCompleted = prog?.isCompleted || (prog?.progressPercentage || 0) === 100;
    const isInProgress = (prog?.progressPercentage || 0) > 0 && !isCompleted;

    const matchesTier =
      courseTierFilter === "all"
        ? true
        : courseTierFilter === "paid"
        ? Boolean(c.isPremium)
        : !c.isPremium;

    if (!matchesTier) return false;
    if (courseProgressFilter === "completed") return matchesSearch && isCompleted;
    if (courseProgressFilter === "in_progress") return matchesSearch && isInProgress;
    return matchesSearch;
  });

  // Filtered favorites
  const filteredFavorites = favorites.filter((f) => {
    if (favFilter === "all") return true;
    return f.itemType === favFilter;
  });

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Student Top Bar & Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-800/40 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg border-2 border-emerald-300 shrink-0">
              <GraduationCap className="w-9 h-9 text-slate-950" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-white">
                  مرحباً بك، {currentUser.name || "الطالب الأكاديمي"}
                </h1>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>فضاء الطالب / المشارك</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {currentUser.specialty || "تخصص العلوم الفلاحية والإنتاج النباتي"} • {currentUser.institution || "جامعة الشهيد حمه لخضر بالوادي"}
              </p>
              <p className="text-[11px] text-slate-400">
                المجال المهتم به: <span className="text-emerald-400 font-semibold">{currentUser.agriculturalField || "زراعة البطاطا والسقي الذكي"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("certificates")}
              className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>شهاداتي ({certificatesList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className="relative p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>الإشعارات</span>
              {unreadNotifsCount > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("favorites")}
              className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
              <span>المفضلة ({favorites.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className="p-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <User className="w-4 h-4" />
              <span>تعديل ملفي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Navigation Tabs Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-md">
        {[
          { id: "home", label: "الرئيسية", icon: Home },
          { id: "profile", label: "ملفي الشخصي", icon: User },
          { id: "courses", label: "دوراتي والمقررات", icon: GraduationCap },
          { id: "certificates", label: "شهاداتي الأكاديمية", icon: Award, badge: certificatesList.length },
          { id: "articles", label: "المقالات والأدلة", icon: BookOpen },
          { id: "favorites", label: "المفضلة", icon: Bookmark, badge: favorites.length },
          { id: "services", label: "الخدمات والاستشارات", icon: Wrench },
          { id: "prices", label: "بورصة الأسعار", icon: DollarSign },
          { id: "products", label: "المنتجات والسوق", icon: ShoppingBag },
          { id: "notifications", label: "الإشعارات", icon: Bell, badge: unreadNotifsCount }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? "bg-slate-950 text-emerald-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">جاري مزامنة بيانات مساحة الطالب من Firestore...</p>
        </div>
      ) : (
        <div>
          {/* ======================= TAB 1: HOME (الرئيسية) ======================= */}
          {activeTab === "home" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveTab("courses")}
                  className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4.5 cursor-pointer transition group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">المقررات المتاحة</span>
                    <GraduationCap className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
                  </div>
                  <div className="text-2xl font-black text-white">{courses.length}</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-semibold">دروس تطبيقية معتمدة ←</div>
                </div>

                <div 
                  onClick={() => setActiveTab("articles")}
                  className="bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-4.5 cursor-pointer transition group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">المقالات والأدلة</span>
                    <BookOpen className="w-5 h-5 text-teal-400 group-hover:scale-110 transition" />
                  </div>
                  <div className="text-2xl font-black text-white">{articles.length}</div>
                  <div className="text-[10px] text-teal-400 mt-1 font-semibold">إرشاد زراعي وفني ←</div>
                </div>

                <div 
                  onClick={() => setActiveTab("favorites")}
                  className="bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-4.5 cursor-pointer transition group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">عناصري المفضلة</span>
                    <Bookmark className="w-5 h-5 text-rose-400 group-hover:scale-110 transition" />
                  </div>
                  <div className="text-2xl font-black text-white">{favorites.length}</div>
                  <div className="text-[10px] text-rose-400 mt-1 font-semibold">محفوظة بحسابك ←</div>
                </div>

                <div 
                  onClick={() => setActiveTab("prices")}
                  className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4.5 cursor-pointer transition group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">بورصة الأسعار</span>
                    <DollarSign className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
                  </div>
                  <div className="text-2xl font-black text-white">{prices.length}</div>
                  <div className="text-[10px] text-amber-400 mt-1 font-semibold">سوق وادي سوف اليوم ←</div>
                </div>
              </div>

              {/* Featured / Recommended Course Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-black text-white">المقررات التدريبية الموصى بها لتخصصك</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>عرض كافة المقررات ({courses.length})</span>
                    <ChevronLeft className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.slice(0, 2).map((course) => (
                    <div
                      key={course.id}
                      className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 rounded-3xl overflow-hidden shadow-lg transition duration-200 flex flex-col justify-between"
                    >
                      <div className="relative h-44 w-full bg-slate-950">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        <button
                          onClick={() => handleToggleFavorite("course", course.id, course.title, {
                            description: course.description,
                            imageUrl: course.thumbnail,
                            authorOrInstructor: course.instructor
                          })}
                          className="absolute top-3 left-3 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white hover:text-rose-400 transition cursor-pointer"
                          title="حفظ في المفضلة"
                        >
                          <Heart
                            className={`w-4 h-4 ${isFavorited(course.id) ? "text-rose-500 fill-rose-500" : "text-white"}`}
                          />
                        </button>
                        <span className="absolute bottom-3 right-3 px-3 py-1 bg-emerald-500 text-slate-950 font-black text-[11px] rounded-lg">
                          {course.lessonsCount} دروس تطبيقية
                        </span>
                      </div>

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="font-extrabold text-white text-base leading-snug">{course.title}</h3>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                          <div className="text-slate-300 font-semibold">
                            <span>إشراف: </span>
                            <strong className="text-emerald-400">{course.instructor}</strong>
                          </div>
                          <button
                            onClick={() => setActivePlayingCourse(course)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
                          >
                            <Play className="w-3.5 h-3.5 fill-slate-950" />
                            <span>مشاهدة الدروس</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Field Articles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-teal-400" />
                    <h2 className="text-base font-black text-white">أحدث المقالات والأدلة الزراعية المحكّمة</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("articles")}
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>تصفح الكل ({articles.length})</span>
                    <ChevronLeft className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {articles.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between transition group"
                    >
                      {item.imageUrl && (
                        <div className="h-36 w-full relative bg-slate-950">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() => handleToggleFavorite("article", item.id, item.title, {
                              description: item.description,
                              imageUrl: item.imageUrl,
                              authorOrInstructor: item.author
                            })}
                            className="absolute top-2.5 left-2.5 p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-white hover:text-rose-400 transition cursor-pointer"
                            title="حفظ في المفضلة"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${isFavorited(item.id) ? "text-rose-500 fill-rose-500" : "text-white"}`}
                            />
                          </button>
                        </div>
                      )}
                      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-bold">
                              {categories.find((c) => c.id === item.categoryId)?.nameAr || "إرشاد فلاحي"}
                            </span>
                            <span>•</span>
                            <span>{item.author || "م. ماريه بروبة"}</span>
                          </div>
                          <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">{item.title}</h3>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-DZ") : "اليوم"}
                          </span>
                          <button
                            onClick={() => setSelectedArticle(item)}
                            className="text-teal-400 hover:text-teal-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <span>قراءة</span>
                            <ChevronLeft className="w-3.5 h-3.5 transform rotate-180" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================= TAB 2: PROFILE (ملفي) ======================= */}
          {activeTab === "profile" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
              {profileMsg && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
                    profileMsg.isError
                      ? "bg-rose-950/50 border-rose-800 text-rose-300"
                      : "bg-emerald-950/50 border-emerald-800 text-emerald-300"
                  }`}
                >
                  {profileMsg.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <p>{profileMsg.text}</p>
                </div>
              )}

              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-400" />
                      <span>الملف الأكاديمي والمهني للطالب</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      يمكنك تحديث اسمك، تخصصك، مجالك الزراعي ورقم هاتفك. الصلاحية مؤمنة بقواعد Firestore.
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>الصلاحية: طالب أكاديمي / مشارك</span>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">الاسم الكامل *</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                        placeholder="مثال: أحمد بن سالم"
                      />
                    </div>

                    {/* Email (Read only authentication email) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>البريد الإلكتروني للحساب</span>
                        <span className="text-[10px] text-slate-500 font-normal">مرتبط بـ Auth</span>
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email || ""}
                        className="w-full bg-slate-950/50 border border-slate-850 rounded-xl p-3 text-xs text-slate-400 cursor-not-allowed font-mono"
                      />
                    </div>

                    {/* Academic Specialty */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">التخصص الأكاديمي (Specialty) *</label>
                      <input
                        type="text"
                        required
                        value={profileSpecialty}
                        onChange={(e) => setProfileSpecialty(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                        placeholder="مثال: ماستر وقاية نباتية / علوم بيولوجية / هندسة زراعية"
                      />
                    </div>

                    {/* Agricultural Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">المجال الزراعي والاهتمام البحثي *</label>
                      <input
                        type="text"
                        required
                        value={profileField}
                        onChange={(e) => setProfileField(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                        placeholder="مثال: زراعة البطاطا / سقي ذكي بالطاقة الشمسية / نخيل التمر"
                      />
                    </div>

                    {/* Institution */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">الجامعة / الكلية أو المعهد</label>
                      <input
                        type="text"
                        value={profileInstitution}
                        onChange={(e) => setProfileInstitution(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                        placeholder="جامعة الشهيد حمه لخضر - الوادي"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">رقم الهاتف للتواصل</label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
                        placeholder="+213 549 598 307"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">نبذة تعريفية مختصرة / أهداف المشاركة في هودنت</label>
                    <textarea
                      rows={3}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="اكتب نبذة عن اهتماماتك الزراعية والبحثية..."
                    />
                  </div>

                  {/* Security Notice */}
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="font-bold text-amber-200">حماية الصلاحيات (Security Rules Active):</strong>
                      <p className="text-[11px] text-amber-300/80 leading-relaxed">
                        يُمنع تغيير صفة الحساب (Role) أو محاولة الوصول لأدوات إدارة المنصة. تقتصر التعديلات على البيانات الأكاديمية والمهنية أعلاه ويتم تدقيقها وفق قواعد الأمان في Firestore.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      {isSavingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>حفظ التعديلات في الملف الشخصي</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ======================= TAB 3: COURSES (دوراتي) ======================= */}
          {activeTab === "courses" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    <span>المقررات والدورات الأكاديمية والتطبيقية</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    منهاج تفاعلي متكامل مع تتبع نسبة الإنجاز واستخراج شهادات إتمام معتمدة لطلبة جامعة الوادي.
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Tier Filter: All / Free / Paid */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setCourseTierFilter("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        courseTierFilter === "all"
                          ? "bg-slate-700 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      الكل
                    </button>
                    <button
                      onClick={() => setCourseTierFilter("free")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        courseTierFilter === "free"
                          ? "bg-emerald-500 text-slate-950 shadow"
                          : "text-emerald-400 hover:text-emerald-300"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>مجانية (Free)</span>
                    </button>
                    <button
                      onClick={() => setCourseTierFilter("paid")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        courseTierFilter === "paid"
                          ? "bg-amber-500 text-slate-950 shadow"
                          : "text-amber-400 hover:text-amber-300"
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      <span>مدفوعة (Premium)</span>
                    </button>
                  </div>

                  {/* Progress Status Filter */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    {[
                      { id: "all", label: "جميع الحالات" },
                      { id: "in_progress", label: "قيد الإنجاز" },
                      { id: "completed", label: "المكتملة" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setCourseProgressFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          courseProgressFilter === f.id
                            ? "bg-emerald-600 text-white shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث بالدورة أو المحاضر..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
                  <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-white">لا توجد دورات تطابق معايير البحث الحالية</h3>
                  <p className="text-xs text-slate-400">جرب تغيير فلتر الحالة أو مسح عبارة البحث في الأعلى.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => {
                    const prog = progressMap[course.id];
                    const percent = prog?.progressPercentage || 0;
                    const isDone = prog?.isCompleted || percent === 100;
                    const cert = certificatesList.find((c) => c.courseId === course.id);

                    return (
                      <div
                        key={course.id}
                        className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 rounded-3xl overflow-hidden shadow-lg transition duration-200 flex flex-col justify-between"
                      >
                        <div className="relative h-44 w-full bg-slate-950">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                          
                          <button
                            onClick={() => handleToggleFavorite("course", course.id, course.title, {
                              description: course.description,
                              imageUrl: course.thumbnail,
                              authorOrInstructor: course.instructor
                            })}
                            className="absolute top-3 left-3 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white hover:text-rose-400 transition cursor-pointer z-10"
                            title="حفظ في المفضلة"
                          >
                            <Heart
                              className={`w-4 h-4 ${isFavorited(course.id) ? "text-rose-500 fill-rose-500" : "text-white"}`}
                            />
                          </button>

                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {course.isPremium ? (
                              <span className="px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-slate-950 font-black text-[10px] rounded-lg border border-amber-400 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>مدفوع ({course.price ? `${course.price} DZD` : "اشتراك"})</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-slate-950 font-black text-[10px] rounded-lg border border-emerald-400">
                                مجاني
                              </span>
                            )}
                            <span className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-emerald-300 font-bold text-[10px] rounded-lg border border-slate-700">
                              {course.level === "beginner" ? "مبتدئ" : course.level === "advanced" ? "متقدم" : "متوسط"}
                            </span>
                          </div>

                          <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between">
                            <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-lg">
                              {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || course.lessonsCount || 1} دروس
                            </span>
                            {course.duration && (
                              <span className="px-2 py-0.5 bg-slate-950/80 text-slate-300 font-mono text-[10px] rounded">
                                {course.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>المشرف: <strong className="text-emerald-400">{course.instructor}</strong></span>
                              <span>{course.institution || "جامعة الوادي"}</span>
                            </div>
                            <h3 className="font-extrabold text-white text-base leading-snug">{course.title}</h3>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
                          </div>

                          {/* Free vs Paid Distinction Badge & Perks */}
                          {course.isPremium ? (
                            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 space-y-1 text-[11px]">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>دورة احترافية مدفوعة</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black">
                                  {course.price ? `${course.price} دج` : "3,500 دج"}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                                <span className="text-emerald-400 font-medium">✓ معاينة مجانية للدرس الأول</span>
                                <span className="text-amber-400/90 font-medium">🔒 باقي الدروس والشهادة مدفوعة</span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-[11px]">
                              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>دورة مجانية مفتوحة بالكامل</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-black">
                                مجاناً 0 دج
                              </span>
                            </div>
                          )}

                          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                            {/* Course Progress Bar */}
                            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400">نسبة الإنجاز في المساق:</span>
                                <span className={isDone ? "text-amber-400" : percent > 0 ? "text-emerald-400" : "text-slate-500"}>
                                  {percent}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    isDone
                                      ? "bg-gradient-to-r from-amber-400 to-emerald-400"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              {prog?.lastLessonTitle && !isDone && (
                                <p className="text-[10px] text-slate-400 truncate pt-0.5">
                                  آخر درس: <span className="text-slate-200">{prog.lastLessonTitle}</span>
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                              {isDone && cert ? (
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => setActiveViewingCert(cert)}
                                    className="py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 transition"
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                    <span>عرض الشهادة</span>
                                  </button>
                                  <button
                                    onClick={() => setActivePlayingCourse(course)}
                                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                    <span>مراجعة الدروس</span>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setActivePlayingCourse(course)}
                                  className={`w-full py-2.5 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow ${
                                    course.isPremium
                                      ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                                      : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                                  }`}
                                >
                                  {course.isPremium ? (
                                    <>
                                      <Lock className="w-3.5 h-3.5" />
                                      <span>
                                        {percent > 0
                                          ? "متابعة المساق المدفوع"
                                          : `معاينة الدرس 1 المجاني / الاشتراك (${course.price ? `${course.price} دج` : "3500 دج"})`}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                                      <span>{percent > 0 ? "متابعة المساق المجاني" : "بدء المساق المجاني (0 دج)"}</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB: CERTIFICATES (شهاداتي) ======================= */}
          {activeTab === "certificates" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>الشهادات الأكاديمية المعتمدة</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    الشهادات الصادرة باسمك بعد إتمام 100% من المساقات التدريبية التخصصية في منصة هودنت.
                  </p>
                </div>

                <div className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>إجمالي الشهادات المكتسبة: {certificatesList.length}</span>
                </div>
              </div>

              {certificatesList.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4 max-w-xl mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white">لم تكتسب أي شهادة بعد</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      أكمل جميع دروس أحد المقررات التدريبية بنسبة 100% لتحصل تلقائياً على شهادة إتمام معتمدة باسمك.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>تصفح الدورات والبدء بالتعلم</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificatesList.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            {cert.grade || "اجتياز تدريبي ممتاز"}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("ar-DZ") : "مؤخرًا"}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-white">{cert.courseTitle}</h3>
                        <p className="text-xs text-slate-300 font-medium">
                          الممنوحة لـ: <strong className="text-emerald-400">{cert.userName}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          بإشراف: {cert.instructor} • {cert.institution || "جامعة الشهيد حمه لخضر"}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">
                          كود التحقق: {cert.certificateNumber}
                        </span>

                        <button
                          onClick={() => setActiveViewingCert(cert)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 transition"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>معاينة وطباعة الشهادة</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 4: ARTICLES (المقالات) ======================= */}
          {activeTab === "articles" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-teal-400" />
                    <span>المقالات والأدلة الإرشادية</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    أبحاث ميدانية وتجارب زراعية صادرة عن مخابر جامعة الوادي والهيئة التأسيسية.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="all">كافة الأقسام</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>

                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث بالمقال أو الوسم..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 rounded-3xl overflow-hidden shadow-md flex flex-col justify-between transition group"
                  >
                    {item.imageUrl && (
                      <div className="h-44 w-full relative bg-slate-950">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => handleToggleFavorite("article", item.id, item.title, {
                            description: item.description,
                            imageUrl: item.imageUrl,
                            authorOrInstructor: item.author
                          })}
                          className="absolute top-3 left-3 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white hover:text-rose-400 transition cursor-pointer"
                          title="حفظ في المفضلة"
                        >
                          <Heart
                            className={`w-4 h-4 ${isFavorited(item.id) ? "text-rose-500 fill-rose-500" : "text-white"}`}
                          />
                        </button>
                      </div>
                    )}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="px-2.5 py-1 rounded bg-slate-800 text-teal-300 font-bold">
                            {categories.find((c) => c.id === item.categoryId)?.nameAr || "إرشاد فلاحي"}
                          </span>
                          <span>•</span>
                          <span>{item.author || "م. ماريه بروبة"}</span>
                        </div>
                        <h3 className="font-bold text-white text-base leading-snug">{item.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-DZ") : "اليوم"}
                        </span>
                        <button
                          onClick={() => setSelectedArticle(item)}
                          className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>قراءة المقال</span>
                          <ChevronLeft className="w-3.5 h-3.5 transform rotate-180" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= TAB 5: FAVORITES (المفضلة) ======================= */}
          {activeTab === "favorites" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-rose-400" />
                    <span>العناصر المحفوظة في المفضلة ({favorites.length})</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    جميع المقالات والدورات التي قمت بحفظها مخزنة بأمان في Firestore بحسابك.
                  </p>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setFavFilter("all")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      favFilter === "all" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400"
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setFavFilter("article")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      favFilter === "article" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400"
                    }`}
                  >
                    المقالات
                  </button>
                  <button
                    onClick={() => setFavFilter("course")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      favFilter === "course" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400"
                    }`}
                  >
                    الدورات
                  </button>
                </div>
              </div>

              {filteredFavorites.length === 0 ? (
                <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                    <Bookmark className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base">لا توجد عناصر محفوظة حالياً</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      يمكنك حفظ أي مقال أو دورة بالنقر على أيقونة القلب ❤️ لتظهر هنا وتصل إليها سريعاً.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab("courses")}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                    >
                      تصفح الدورات
                    </button>
                    <button
                      onClick={() => setActiveTab("articles")}
                      className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      تصفح المقالات
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFavorites.map((fav) => {
                    const isArticle = fav.itemType === "article";
                    const isCourse = fav.itemType === "course";

                    return (
                      <div
                        key={fav.id}
                        className="bg-slate-900/70 border border-slate-800 hover:border-rose-500/40 rounded-3xl overflow-hidden shadow-md flex flex-col justify-between transition"
                      >
                        {fav.imageUrl && (
                          <div className="h-40 w-full relative bg-slate-950">
                            <img
                              src={fav.imageUrl}
                              alt={fav.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              onClick={() => deleteFirebaseFavorite(fav.id, currentUser.id).then(() => {
                                setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
                              })}
                              className="absolute top-3 left-3 p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-rose-400 hover:bg-rose-950 transition cursor-pointer"
                              title="حذف من المفضلة"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded-lg">
                              {isArticle ? "مقال إرشادي" : isCourse ? "مقرر تطبيقي" : "منتج"}
                            </span>
                          </div>
                        )}

                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <h3 className="font-bold text-white text-sm leading-snug">{fav.title}</h3>
                            {fav.description && (
                              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{fav.description}</p>
                            )}
                            {fav.authorOrInstructor && (
                              <p className="text-[11px] text-emerald-400 font-semibold">{fav.authorOrInstructor}</p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                            <button
                              onClick={() => {
                                if (isArticle) {
                                  const art = articles.find((a) => a.id === fav.itemId);
                                  if (art) setSelectedArticle(art);
                                  else setActiveTab("articles");
                                } else if (isCourse) {
                                  const crs = courses.find((c) => c.id === fav.itemId);
                                  if (crs) {
                                    setActivePlayingCourse(crs);
                                  } else setActiveTab("courses");
                                }
                              }}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition shadow"
                            >
                              <span>فتح المحتوى</span>
                              <ChevronLeft className="w-3.5 h-3.5 transform rotate-180" />
                            </button>

                            <button
                              onClick={() => deleteFirebaseFavorite(fav.id, currentUser.id).then(() => {
                                setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
                              })}
                              className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                            >
                              إزالة
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 6: SERVICES & INQUIRIES (الخدمات والاستشارات) ======================= */}
          {activeTab === "services" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-emerald-400" />
                    <span>الخدمات والوساطة الفلاحية بالوادي</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    دليل المزودين وطلب الاستشارات الفنية والأكاديمية من أساتذة مخابر جامعة الوادي.
                  </p>
                </div>
              </div>

              {/* Submit Consultation */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>إرسال استشارة زراعية أو سؤال أكاديمي</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    يتم إحالة سؤالك مباشرة إلى الدكتور سمير مرداسي والمهندسين المؤسسين للرد عليه.
                  </p>
                </div>

                {inquirySuccess && (
                  <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>تم إرسال استشارتك بنجاح وسيتكفل الأساتذة بالإجابة عليك فورياً.</span>
                  </div>
                )}

                <form onSubmit={handleSendInquiry} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">موضوع الاستفسار *</label>
                      <input
                        type="text"
                        required
                        value={inquirySubject}
                        onChange={(e) => setInquirySubject(e.target.value)}
                        placeholder="مثال: تحليل أعراض نقص البوتاسيوم في التربة الرملية"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">المرسل (حسابك)</label>
                      <input
                        type="text"
                        disabled
                        value={`${currentUser.name} (${currentUser.specialty || "طالب"})`}
                        className="w-full bg-slate-950/60 border border-slate-850 rounded-xl p-3 text-xs text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">نص السؤال أو المشكلة الفنية بالتفصيل *</label>
                    <textarea
                      required
                      rows={3}
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      placeholder="اكتب استفسارك بالتفصيل..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال الاستشارة لهيئة الإشراف</span>
                  </button>
                </form>
              </div>

              {/* Service Providers Directory */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-white text-base">دليل الخدمات والمعدات المعتمدة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {providers.map((p) => (
                    <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20">
                          {p.category}
                        </span>
                        <span className="text-xs text-amber-400 font-bold font-mono">★ {p.rating}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{p.name}</h4>
                      <p className="text-xs text-slate-400">{p.description}</p>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{p.location}</span>
                        <a
                          href={`tel:${p.phone}`}
                          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 font-mono text-[11px]"
                          dir="ltr"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{p.phone}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================= TAB 7: PRICES (الأسعار) ======================= */}
          {activeTab === "prices" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    <span>بورصة الأسعار اليومية بسوق وادي سوف</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    أسعار الجملة والتجزئة المحدثة للمنتجات الزراعية الرئيسية (بطاطا، تمور، خضر صحراوية).
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم المحصول..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs text-slate-300 font-sans">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-4">المحصول / المنتج</th>
                        <th className="p-4">السوق</th>
                        <th className="p-4">سعر الجملة (DZD)</th>
                        <th className="p-4">سعر التجزئة (DZD)</th>
                        <th className="p-4">الاتجاه</th>
                        <th className="p-4">تاريخ التحديث</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {prices
                        .filter((p) => !searchQuery || p.crop.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((price) => (
                          <tr key={price.id} className="hover:bg-slate-850/50 transition">
                            <td className="p-4 font-bold text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span>{price.crop}</span>
                            </td>
                            <td className="p-4 text-slate-300">{price.market}</td>
                            <td className="p-4 font-mono font-bold text-emerald-400">{price.wholesalePrice} دج / {price.unit}</td>
                            <td className="p-4 font-mono font-bold text-amber-400">{price.retailPrice} دج / {price.unit}</td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  price.trend === "up"
                                    ? "bg-rose-950 text-rose-400 border border-rose-800/40"
                                    : price.trend === "down"
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {price.trend === "up" ? "↑ ارتفاع" : price.trend === "down" ? "↓ انخفاض" : "= مستقر"}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 font-mono text-[11px]">{price.date}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================= TAB 8: PRODUCTS (المنتجات) ======================= */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    <span>سوق البذور ومستلزمات الإنتاج</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    عروض البذور المعتمدة، الأسمدة ومعدات السقي المتاحة في ولاية الوادي.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-md flex flex-col justify-between"
                  >
                    <div className="h-40 w-full relative bg-slate-950">
                      <img
                        src={p.imageUrl || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80"}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-lg">
                        {p.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-white text-base">{p.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="font-black text-amber-400 font-mono text-sm">{p.price} DZD</span>
                        <a
                          href={`tel:${p.phone || "+213549598307"}`}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 font-mono cursor-pointer"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>اتصال</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= TAB 9: NOTIFICATIONS (الإشعارات) ======================= */}
          {activeTab === "notifications" && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-emerald-400" />
                    <span>الإشعارات والتنبيهات الأكاديمية</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    آخر التحديثات حول الدورات المنشورة وتنبيهات الطقس والمناخ.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                >
                  تحديد الكل كمقروء
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-5 rounded-2xl border transition flex items-start gap-4 ${
                      notif.isRead
                        ? "bg-slate-900/50 border-slate-800/80 text-slate-400"
                        : "bg-slate-900 border-emerald-500/40 text-slate-100 shadow-md"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.type === "alert"
                          ? "bg-rose-950/80 text-rose-400 border border-rose-800/40"
                          : notif.type === "course"
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                          : "bg-slate-800 text-teal-300"
                      }`}
                    >
                      {notif.type === "alert" ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : notif.type === "course" ? (
                        <GraduationCap className="w-5 h-5" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm">{notif.title}</h3>
                        <span className="text-[10px] text-slate-500 font-mono">{notif.date}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Article Detail View Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedArticle.imageUrl && (
              <div className="rounded-2xl overflow-hidden h-60 w-full">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                  {categories.find((c) => c.id === selectedArticle.categoryId)?.nameAr || "إرشاد فلاحي"}
                </span>
                <span className="text-slate-400">بواسطة: {selectedArticle.author || "م. ماريه بروبة"}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  {selectedArticle.createdAt ? new Date(selectedArticle.createdAt).toLocaleDateString("ar-DZ") : "اليوم"}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">{selectedArticle.title}</h2>
              {selectedArticle.description && (
                <p className="text-xs font-semibold text-teal-300/90 leading-relaxed bg-teal-950/30 p-3.5 rounded-xl border border-teal-800/30">
                  {selectedArticle.description}
                </p>
              )}
            </div>

            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-3">
              {selectedArticle.body || selectedArticle.description}
            </div>

            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800">
                {selectedArticle.tags.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleToggleFavorite("article", selectedArticle.id, selectedArticle.title, {
                  description: selectedArticle.description,
                  imageUrl: selectedArticle.imageUrl,
                  authorOrInstructor: selectedArticle.author
                })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isFavorited(selectedArticle.id) ? "fill-rose-400" : ""}`} />
                <span>{isFavorited(selectedArticle.id) ? "في المفضلة" : "إضافة للمفضلة"}</span>
              </button>

              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Interactive Student Course Player */}
      {activePlayingCourse && (
        <StudentCoursePlayer
          course={activePlayingCourse}
          currentUser={currentUser}
          onClose={() => {
            setActivePlayingCourse(null);
            loadData();
          }}
        />
      )}

      {/* Academic Certificate Viewer & Print Modal */}
      {activeViewingCert && (
        <CertificateModal
          certificate={activeViewingCert}
          onClose={() => setActiveViewingCert(null)}
        />
      )}
    </div>
  );
}
