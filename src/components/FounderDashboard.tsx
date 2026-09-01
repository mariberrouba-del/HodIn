import React, { useState, useEffect } from "react";
import CourseCurriculumManager from "./CourseCurriculumManager";
import { 
  UserProfile, 
  ContentItem, 
  CategoryItem, 
  ContentType, 
  UserRole, 
  Course, 
  MarketPrice, 
  Product, 
  ServiceProvider, 
  ActivityLog, 
  ContentStatus 
} from "../types";
import {
  ShieldCheck, Plus, Edit2, Trash2, Eye, Search, Filter, Sparkles,
  RefreshCw, CheckCircle2, AlertCircle, Image as ImageIcon, Upload,
  ExternalLink, LogOut, ArrowRight, BookOpen, Layers, Sprout, Droplets,
  TreePine, GraduationCap, Megaphone, Sun, Bug, Activity, Tag, FileText,
  Clock, User, Check, X, ShieldAlert, BarChart3, ChevronRight, FolderPlus,
  DollarSign, ShoppingBag, Wrench, Users, History, Archive, CheckSquare,
  AlertTriangle, Lock, Shield, Phone, Mail, Building, Video, Download,
  TrendingUp, TrendingDown, Minus
} from "lucide-react";
import {
  getFirebaseContent,
  addFirebaseContent,
  updateFirebaseContent,
  deleteFirebaseContent,
  getFirebaseCategories,
  addFirebaseCategory,
  updateFirebaseCategory,
  deleteFirebaseCategory,
  getFirebaseCourses,
  addFirebaseCourse,
  updateFirebaseCourse,
  deleteFirebaseCourse,
  getFirebasePrices,
  addFirebasePrice,
  updateFirebasePrice,
  deleteFirebasePrice,
  getFirebaseProducts,
  addFirebaseProduct,
  updateFirebaseProduct,
  deleteFirebaseProduct,
  getFirebaseProviders,
  addFirebaseProvider,
  deleteFirebaseProvider,
  getFirebaseUsers,
  updateFirebaseUserRole,
  deleteFirebaseUser,
  getFirebaseActivityLogs,
  logActivity,
  uploadFileToStorage,
  DEFAULT_CATEGORIES,
  DEFAULT_CONTENT,
  DEFAULT_PRICES
} from "../lib/firebaseService";

interface FounderDashboardProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onNavigateToHome: () => void;
}

export default function FounderDashboard({
  currentUser,
  onLogout,
  onNavigateToHome
}: FounderDashboardProps) {
  // Master Tabs
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "articles"
    | "courses"
    | "categories"
    | "prices"
    | "products"
    | "services"
    | "users"
    | "analytics"
    | "logs"
  >("overview");

  // Data Collections
  const [contentList, setContentList] = useState<ContentItem[]>(DEFAULT_CONTENT);
  const [categoryList, setCategoryList] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [priceList, setPriceList] = useState<MarketPrice[]>(DEFAULT_PRICES);
  const [productList, setProductList] = useState<Product[]>([]);
  const [providerList, setProviderList] = useState<ServiceProvider[]>([]);
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Loading & Toast States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");

  // Content (Article) Modal State
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [contentForm, setContentForm] = useState<Partial<ContentItem>>({
    title: "",
    slug: "",
    description: "",
    body: "",
    categoryId: "cat_crops",
    type: "crop_guide",
    status: "published",
    imageUrl: "",
    author: currentUser.name || "م. ماريه بروبة",
    authorRole: currentUser.companyName || "الهيئة التأسيسية لمنصة HodInt",
    isPublished: true,
    isFeatured: false,
    tags: []
  });
  const [tagsInput, setTagsInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSavingContent, setIsSavingContent] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryForm, setCategoryForm] = useState<Partial<CategoryItem>>({
    nameAr: "",
    nameEn: "",
    slug: "",
    icon: "Sprout",
    description: "",
    order: 1
  });
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Course Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [curriculumCourse, setCurriculumCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState<Partial<Course>>({
    title: "",
    instructor: currentUser.name || "م. ماريه بروبة",
    instructorRole: "مهندس زراعي - الهيئة التأسيسية",
    institution: "جامعة الشهيد حمه لخضر - الوادي",
    shortDescription: "",
    description: "",
    category: "crops",
    level: "intermediate",
    duration: "3 أسابيع (12 ساعة)",
    lessonsCount: 6,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80",
    status: "published",
    documents: [{ title: "مذكرة السقي وإدارة التربة الرملية.pdf", size: "3.2 MB", downloadUrl: "#" }]
  });
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  // Price Modal State
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<MarketPrice | null>(null);
  const [priceForm, setPriceForm] = useState<Partial<MarketPrice>>({
    crop: "",
    market: "سوق الجملة للخضر والفواكه - الوادي",
    wholesalePrice: 45,
    retailPrice: 60,
    unit: "كغ",
    trend: "stable",
    date: new Date().toISOString().split("T")[0]
  });
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: "",
    category: "بذور",
    price: "4500 DZD",
    sellerName: currentUser.name || "متجر هودنت المعتمد",
    phone: "+213 549 598 307",
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80",
    inStock: true
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Delete & Archive Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "content" | "category" | "course" | "price" | "product" | "user";
    id: string;
    name: string;
    allowArchive?: boolean;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview Modal
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);

  // Toast Helper
  const showToast = (msg: string, isError: boolean = false) => {
    if (isError) {
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 4000);
    } else {
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  // Load All Founder Data
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const [
        fetchedCategories,
        fetchedContent,
        fetchedCourses,
        fetchedPrices,
        fetchedProducts,
        fetchedProviders,
        fetchedUsers,
        fetchedLogs
      ] = await Promise.all([
        getFirebaseCategories(),
        getFirebaseContent(),
        getFirebaseCourses(),
        getFirebasePrices(),
        getFirebaseProducts(),
        getFirebaseProviders(),
        getFirebaseUsers(),
        getFirebaseActivityLogs()
      ]);

      setCategoryList(fetchedCategories);
      setContentList(fetchedContent);
      setCourseList(fetchedCourses);
      setPriceList(fetchedPrices);
      setProductList(fetchedProducts);
      setProviderList(fetchedProviders);
      setUserList(fetchedUsers);
      setActivityLogs(fetchedLogs);
    } catch (err: any) {
      console.error("Error loading founder dashboard data:", err);
      showToast("حدث خطأ أثناء مزامنة البيانات مع Firestore", true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ---------------- CONTENT HANDLERS ----------------
  const handleOpenAddContent = () => {
    setEditingContent(null);
    setContentForm({
      title: "",
      slug: "",
      description: "",
      body: "",
      categoryId: categoryList[0]?.id || "cat_crops",
      type: "crop_guide",
      status: "published",
      imageUrl: "",
      author: currentUser.name || "م. ماريه بروبة",
      authorRole: currentUser.companyName || "الهيئة التأسيسية لمنصة HodInt",
      isPublished: true,
      isFeatured: false,
      tags: ["وادي سوف", "زراعة صحراوية"]
    });
    setTagsInput("وادي سوف, زراعة صحراوية");
    setIsContentModalOpen(true);
  };

  const handleOpenEditContent = (item: ContentItem) => {
    setEditingContent(item);
    setContentForm({
      ...item,
      status: item.status || (item.isPublished ? "published" : "draft")
    });
    setTagsInput(item.tags ? item.tags.join(", ") : "");
    setIsContentModalOpen(true);
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentForm.title?.trim()) {
      showToast("يرجى إدخال عنوان المقال", true);
      return;
    }
    if (!contentForm.body?.trim()) {
      showToast("يرجى كتابة نص المقال", true);
      return;
    }

    try {
      setIsSavingContent(true);
      const parsedTags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const targetCat = categoryList.find((c) => c.id === contentForm.categoryId);
      const categoryName = targetCat ? targetCat.nameAr : "قسم عام";

      const finalStatus: ContentStatus = (contentForm.status as ContentStatus) || "published";

      const finalItem: ContentItem = {
        id: editingContent?.id || "cnt_" + Date.now().toString(36),
        title: contentForm.title.trim(),
        slug: contentForm.slug?.trim() || contentForm.title.toLowerCase().replace(/[^a-zA-Z0-9\u0621-\u064A]/g, "-").replace(/-+/g, "-"),
        description: contentForm.description?.trim() || "",
        body: contentForm.body.trim(),
        categoryId: contentForm.categoryId || "cat_crops",
        categoryName,
        type: (contentForm.type as ContentType) || "article",
        status: finalStatus,
        isPublished: finalStatus === "published",
        isFeatured: contentForm.isFeatured ?? false,
        imageUrl: contentForm.imageUrl || "",
        author: contentForm.author?.trim() || currentUser.name || "م. ماريه بروبة",
        authorId: currentUser.id || "founder",
        authorRole: contentForm.authorRole?.trim() || currentUser.companyName || "الهيئة التأسيسية",
        tags: parsedTags,
        createdBy: editingContent?.createdBy || {
          uid: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: String(currentUser.role)
        },
        updatedBy: {
          uid: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: String(currentUser.role)
        },
        createdAt: editingContent?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingContent) {
        await updateFirebaseContent(editingContent.id, finalItem, currentUser);
        setContentList((prev) => prev.map((c) => (c.id === editingContent.id ? finalItem : c)));
        showToast("تم تحديث المقال بنجاح");
      } else {
        await addFirebaseContent(finalItem, currentUser);
        setContentList((prev) => [finalItem, ...prev]);
        showToast("تم إنشاء المقال ونشره بنجاح");
      }

      setIsContentModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      console.error("Error saving content:", err);
      showToast(err.message || "فشل حفظ المقال", true);
    } finally {
      setIsSavingContent(false);
    }
  };

  // Quick Status Toggle (Publish / Unpublish / Archive)
  const handleToggleContentStatus = async (item: ContentItem, newStatus: ContentStatus) => {
    try {
      await updateFirebaseContent(item.id, {
        status: newStatus,
        isPublished: newStatus === "published"
      }, currentUser);
      setContentList((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, status: newStatus, isPublished: newStatus === "published" } : c))
      );
      showToast(`تم تغيير حالة المقال إلى: ${newStatus === "published" ? "منشور" : newStatus === "draft" ? "مسودة" : "مؤرشف"}`);
    } catch (err: any) {
      showToast("فشل تغيير حالة المقال", true);
    }
  };

  // Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadProgress(0);
      const downloadUrl = await uploadFileToStorage(file, (pct) => setUploadProgress(pct));
      setContentForm((prev) => ({ ...prev, imageUrl: downloadUrl }));
      showToast("تم رفع الصورة إلى التخزين السحابي بنجاح");
    } catch (err: any) {
      showToast("فشل رفع الصورة", true);
    } finally {
      setUploadProgress(null);
    }
  };

  // ---------------- CATEGORY HANDLERS ----------------
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      nameAr: "",
      nameEn: "",
      slug: "",
      icon: "Sprout",
      description: "",
      order: categoryList.length + 1
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryForm({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.nameAr?.trim()) {
      showToast("يرجى إدخال اسم القسم بالعربية", true);
      return;
    }

    try {
      setIsSavingCategory(true);
      const finalCat: CategoryItem = {
        id: editingCategory?.id || "cat_" + Date.now().toString(36),
        nameAr: categoryForm.nameAr.trim(),
        nameEn: categoryForm.nameEn?.trim() || "",
        slug: categoryForm.slug?.trim() || categoryForm.nameAr.toLowerCase().replace(/[^a-zA-Z0-9\u0621-\u064A]/g, "-"),
        icon: categoryForm.icon || "Sprout",
        description: categoryForm.description?.trim() || "",
        order: Number(categoryForm.order) || categoryList.length + 1,
        createdAt: editingCategory?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingCategory) {
        await updateFirebaseCategory(editingCategory.id, finalCat);
        setCategoryList((prev) => prev.map((c) => (c.id === editingCategory.id ? finalCat : c)));
        showToast("تم تحديث القسم بنجاح");
      } else {
        await addFirebaseCategory(finalCat);
        setCategoryList((prev) => [...prev, finalCat]);
        showToast("تمت إضافة القسم الجديد بنجاح");
      }

      setIsCategoryModalOpen(false);
    } catch (err: any) {
      showToast("فشل حفظ القسم", true);
    } finally {
      setIsSavingCategory(false);
    }
  };

  // ---------------- COURSE HANDLERS ----------------
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: "",
      instructor: currentUser.name || "م. ماريه بروبة",
      instructorRole: "مهندس زراعي - الهيئة التأسيسية",
      description: "",
      category: "crops",
      duration: "3 أسابيع (12 ساعة)",
      lessonsCount: 6,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80",
      status: "published",
      isPremium: false,
      price: 0,
      documents: [{ title: "مذكرة السقي وإدارة التربة الرملية.pdf", size: "3.2 MB", downloadUrl: "#" }]
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({ ...course });
    setIsCourseModalOpen(true);
  };

  const handleToggleCourseStatus = async (course: Course, newStatus: ContentStatus) => {
    try {
      const updated: Course = {
        ...course,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.name
      };
      await updateFirebaseCourse(course.id, updated);
      setCourseList((prev) => prev.map((c) => (c.id === course.id ? updated : c)));
      
      await logActivity({
        action: newStatus === "archived" ? "archive" : "update",
        entityType: "course",
        entityId: course.id,
        entityTitle: course.title,
        performedBy: {
          uid: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: String(currentUser.role)
        },
        details: `تغيير حالة الدورة إلى: ${newStatus === "published" ? "منشور" : newStatus === "draft" ? "مسودة" : "مؤرشف"}`,
        timestamp: new Date().toISOString()
      });

      showToast(`تم تحديث حالة الدورة إلى ${newStatus === "published" ? "منشور ومتاح للطلاب" : newStatus === "draft" ? "مسودة غير معروضة" : "مؤرشف"}`);
    } catch (err: any) {
      showToast("فشل تحديث حالة الدورة: " + (err.message || ""), true);
    }
  };

  const handleSaveCurriculumCourse = async (updatedCourse: Course) => {
    await updateFirebaseCourse(updatedCourse.id, updatedCourse);
    setCourseList((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
    setCurriculumCourse(updatedCourse);

    await logActivity({
      action: "update",
      entityType: "course",
      entityId: updatedCourse.id,
      entityTitle: updatedCourse.title,
      performedBy: {
        uid: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: String(currentUser.role)
      },
      details: `تحديث المنهج الأكاديمي والوحدات (${updatedCourse.modules?.length || 0} وحدات، ${updatedCourse.lessonsCount} دروس)`,
      timestamp: new Date().toISOString()
    });

    showToast("تم تحديث منهج الدورة ووحداتها بنجاح في قاعدة البيانات");
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title?.trim() || !courseForm.instructor?.trim()) {
      showToast("يرجى إكمال عنوان الدورة واسم المشرف", true);
      return;
    }

    try {
      setIsSavingCourse(true);
      const finalCourse: Course = {
        id: editingCourse?.id || "c_" + Date.now().toString(36),
        title: courseForm.title.trim(),
        instructor: courseForm.instructor.trim(),
        instructorRole: courseForm.instructorRole?.trim() || "مشرف أكاديمي",
        institution: courseForm.institution?.trim() || "جامعة الشهيد حمه لخضر - الوادي",
        shortDescription: courseForm.shortDescription?.trim() || "",
        description: courseForm.description?.trim() || "",
        category: (courseForm.category as any) || "crops",
        level: (courseForm.level as any) || "intermediate",
        duration: courseForm.duration || "4 أسابيع",
        lessonsCount: editingCourse?.modules
          ? editingCourse.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
          : Number(courseForm.lessonsCount) || 1,
        videoUrl: courseForm.videoUrl || "https://www.youtube.com/embed/zH0F6LclisY",
        thumbnail: courseForm.thumbnail || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80",
        status: (courseForm.status as ContentStatus) || "published",
        isPremium: courseForm.isPremium ?? false,
        price: courseForm.price ?? 0,
        documents: courseForm.documents || [],
        modules: editingCourse?.modules || courseForm.modules || [],
        createdBy: editingCourse?.createdBy || currentUser.name,
        updatedBy: currentUser.name,
        createdAt: editingCourse?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingCourse) {
        await updateFirebaseCourse(editingCourse.id, finalCourse);
        setCourseList((prev) => prev.map((c) => (c.id === editingCourse.id ? finalCourse : c)));
        showToast("تم تحديث بيانات الدورة بنجاح");
      } else {
        await addFirebaseCourse(finalCourse);
        setCourseList((prev) => [finalCourse, ...prev]);
        showToast("تمت إضافة الدورة التدريبية بنجاح");
      }

      await logActivity({
        action: editingCourse ? "update" : "create",
        entityType: "course",
        entityId: finalCourse.id,
        entityTitle: finalCourse.title,
        performedBy: {
          uid: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: String(currentUser.role)
        },
        details: `${editingCourse ? "تعديل" : "إنشاء"} دورة تعليمية`,
        timestamp: new Date().toISOString()
      });

      setIsCourseModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      showToast("فشل حفظ الدورة", true);
    } finally {
      setIsSavingCourse(false);
    }
  };

  // ---------------- PRICE HANDLERS ----------------
  const handleOpenAddPrice = () => {
    setEditingPrice(null);
    setPriceForm({
      crop: "",
      market: "سوق الجملة للخضر والفواكه - الوادي",
      wholesalePrice: 45,
      retailPrice: 60,
      unit: "كغ",
      trend: "stable",
      date: new Date().toISOString().split("T")[0]
    });
    setIsPriceModalOpen(true);
  };

  const handleOpenEditPrice = (price: MarketPrice) => {
    setEditingPrice(price);
    setPriceForm({ ...price });
    setIsPriceModalOpen(true);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceForm.crop?.trim()) {
      showToast("يرجى إدخال اسم المحصول", true);
      return;
    }

    try {
      setIsSavingPrice(true);
      const finalPrice: MarketPrice = {
        id: editingPrice?.id || "p_" + Date.now().toString(36),
        crop: priceForm.crop.trim(),
        market: priceForm.market?.trim() || "سوق الوادي",
        wholesalePrice: Number(priceForm.wholesalePrice) || 0,
        retailPrice: Number(priceForm.retailPrice) || 0,
        unit: priceForm.unit?.trim() || "كغ",
        trend: (priceForm.trend as any) || "stable",
        date: priceForm.date || new Date().toISOString().split("T")[0]
      };

      if (editingPrice) {
        await updateFirebasePrice(editingPrice.id, finalPrice);
        setPriceList((prev) => prev.map((p) => (p.id === editingPrice.id ? finalPrice : p)));
        showToast("تم تحديث السعر بنجاح");
      } else {
        await addFirebasePrice(finalPrice);
        setPriceList((prev) => [finalPrice, ...prev]);
        showToast("تمت إضافة المحصول للبورصة بنجاح");
      }

      await logActivity({
        action: editingPrice ? "update" : "create",
        entityType: "price",
        entityId: finalPrice.id,
        entityTitle: finalPrice.crop,
        performedBy: {
          uid: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: String(currentUser.role)
        },
        details: `تحديث سعر بورصة ${finalPrice.crop}`,
        timestamp: new Date().toISOString()
      });

      setIsPriceModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      showToast("فشل حفظ السعر", true);
    } finally {
      setIsSavingPrice(false);
    }
  };

  // ---------------- PRODUCT HANDLERS ----------------
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "بذور",
      price: "4500 DZD",
      sellerName: currentUser.name || "متجر هودنت المعتمد",
      phone: "+213 549 598 307",
      description: "",
      imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80",
      inStock: true
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name?.trim()) {
      showToast("يرجى إدخال اسم المنتج", true);
      return;
    }

    try {
      setIsSavingProduct(true);
      const finalProduct: Product = {
        id: editingProduct?.id || "prd_" + Date.now().toString(36),
        name: productForm.name.trim(),
        category: productForm.category?.trim() || "عام",
        price: productForm.price?.trim() || "0 DZD",
        sellerName: productForm.sellerName?.trim() || currentUser.name,
        phone: productForm.phone?.trim() || "+213 549 598 307",
        description: productForm.description?.trim() || "",
        imageUrl: productForm.imageUrl || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80",
        inStock: productForm.inStock ?? true
      };

      if (editingProduct) {
        await updateFirebaseProduct(editingProduct.id, finalProduct);
        setProductList((prev) => prev.map((p) => (p.id === editingProduct.id ? finalProduct : p)));
        showToast("تم تحديث المنتج بنجاح");
      } else {
        await addFirebaseProduct(finalProduct);
        setProductList((prev) => [finalProduct, ...prev]);
        showToast("تمت إضافة المنتج للسوق بنجاح");
      }

      await logActivity({
        action: editingProduct ? "update" : "create",
        entityType: "product",
        entityId: finalProduct.id,
        entityTitle: finalProduct.name,
        performedBy: {
          uid: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: String(currentUser.role)
        },
        details: `${editingProduct ? "تعديل" : "إضافة"} منتج بالسوق`,
        timestamp: new Date().toISOString()
      });

      setIsProductModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      showToast("فشل حفظ المنتج", true);
    } finally {
      setIsSavingProduct(false);
    }
  };

  // ---------------- USER ROLE MANAGEMENT ----------------
  const handleUpdateRole = async (userId: string, newRole: UserRole, userName: string) => {
    try {
      await updateFirebaseUserRole(userId, newRole);
      setUserList((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      showToast(`تم تحديث رتبة المستخدم ${userName} إلى: ${newRole}`);
      await logActivity({
        action: "role_change",
        entityType: "user",
        entityId: userId,
        entityTitle: userName,
        performedBy: {
          uid: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: String(currentUser.role)
        },
        details: `تغيير الصلاحية إلى ${newRole}`,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      showToast("فشل تحديث رتبة المستخدم", true);
    }
  };

  // ---------------- DELETE EXECUTION & ARCHIVING ----------------
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      if (deleteTarget.type === "content") {
        await deleteFirebaseContent(deleteTarget.id, deleteTarget.name, currentUser);
        setContentList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        showToast(`تم حذف المقال "${deleteTarget.name}" نهائياً`);
      } else if (deleteTarget.type === "category") {
        await deleteFirebaseCategory(deleteTarget.id);
        setCategoryList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        showToast(`تم حذف القسم "${deleteTarget.name}" بنجاح`);
      } else if (deleteTarget.type === "course") {
        await deleteFirebaseCourse(deleteTarget.id);
        setCourseList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        showToast(`تم حذف الدورة "${deleteTarget.name}" بنجاح`);
      } else if (deleteTarget.type === "price") {
        await deleteFirebasePrice(deleteTarget.id);
        setPriceList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        showToast(`تم حذف المحصول "${deleteTarget.name}" من البورصة`);
      } else if (deleteTarget.type === "product") {
        await deleteFirebaseProduct(deleteTarget.id);
        setProductList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        showToast(`تم حذف المنتج "${deleteTarget.name}"`);
      } else if (deleteTarget.type === "user") {
        await deleteFirebaseUser(deleteTarget.id);
        setUserList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        showToast(`تم حذف حساب المستخدم "${deleteTarget.name}"`);
      }

      setDeleteTarget(null);
      loadDashboardData();
    } catch (err: any) {
      console.error("Delete failed:", err);
      showToast(err.message || "فشل الحذف من الخادم", true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveTarget = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "content") {
      const item = contentList.find((c) => c.id === deleteTarget.id);
      if (item) {
        await handleToggleContentStatus(item, "archived");
      }
    }
    setDeleteTarget(null);
  };

  // Helper Icon Renderer
  const renderCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case "TreePine": return <TreePine className="w-5 h-5 text-emerald-400" />;
      case "Droplets": return <Droplets className="w-5 h-5 text-sky-400" />;
      case "Layers": return <Layers className="w-5 h-5 text-amber-400" />;
      case "GraduationCap": return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case "Megaphone": return <Megaphone className="w-5 h-5 text-rose-400" />;
      case "Sun": return <Sun className="w-5 h-5 text-amber-300" />;
      case "Bug": return <Bug className="w-5 h-5 text-red-400" />;
      case "Activity": return <Activity className="w-5 h-5 text-teal-400" />;
      default: return <Sprout className="w-5 h-5 text-emerald-400" />;
    }
  };

  // Filtered Content
  const filteredContent = contentList.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory =
      selectedCategoryFilter === "all" || item.categoryId === selectedCategoryFilter;

    const itemStatus = item.status || (item.isPublished ? "published" : "draft");
    const matchesStatus =
      selectedStatusFilter === "all" || itemStatus === selectedStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans" dir="rtl">
      {/* Toast Notifications */}
      {successToast && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-emerald-100 text-sm shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-rose-950/95 border border-rose-500/50 text-rose-100 text-sm shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="font-semibold">{errorToast}</span>
        </div>
      )}

      {/* Top Banner & Founder Identity */}
      <header className="bg-slate-900/90 border-b border-emerald-500/20 backdrop-blur-xl sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-teal-800 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg border border-amber-300/40">
                <ShieldCheck className="w-7 h-7 text-slate-950" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-white">
                  لوحة تحكم المؤسسين المتقدمة
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  Founder Command Center
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-slate-200">{currentUser.name || "م. ماريه بروبة"}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-semibold">{currentUser.email}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{currentUser.companyName || "الهيئة التأسيسية لـ HodInt"}</span>
              </p>
            </div>
          </div>

          {/* Quick Global Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onNavigateToHome}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>معاينة الواجهة العامة</span>
            </button>

            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition flex items-center gap-1.5 cursor-pointer"
              title="تحديث البيانات من Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? "animate-spin" : ""}`} />
              <span>مزامنة فورية</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 border border-rose-800/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs Bar for Founder (10 Clear Sections) */}
        <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-md sticky top-20 z-20 backdrop-blur-md">
          {[
            { id: "overview", label: "الرئيسية", icon: BarChart3 },
            { id: "articles", label: "المقالات والأدلة", icon: BookOpen, count: contentList.length },
            { id: "courses", label: "الدورات والمقررات", icon: GraduationCap, count: courseList.length },
            { id: "categories", label: "الأقسام والتصنيفات", icon: Layers, count: categoryList.length },
            { id: "prices", label: "الأسعار والبورصة", icon: DollarSign, count: priceList.length },
            { id: "products", label: "المنتجات والسوق", icon: ShoppingBag, count: productList.length },
            { id: "services", label: "الخدمات والوساطة", icon: Wrench, count: providerList.length },
            { id: "users", label: "المستخدمون", icon: Users, count: userList.length },
            { id: "analytics", label: "الإحصائيات", icon: TrendingUp },
            { id: "logs", label: "سجل النشاط", icon: History, count: activityLogs.length }
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
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? "bg-slate-950 text-emerald-300" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">جاري تحميل سجلات مركز إدارة المؤسسين من Firestore...</p>
          </div>
        ) : (
          <div>
            {/* ========================================================================= */}
            {/* 1. OVERVIEW TAB (الرئيسية) */}
            {/* ========================================================================= */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div 
                    onClick={() => setActiveTab("articles")}
                    className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition shadow"
                  >
                    <div className="text-slate-400 text-xs font-medium">المقالات والأدلة</div>
                    <div className="text-2xl font-black text-white mt-1">{contentList.length}</div>
                    <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
                      {contentList.filter((c) => c.status === "published" || c.isPublished).length} منشور • {contentList.filter((c) => c.status === "draft").length} مسودة
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("courses")}
                    className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition shadow"
                  >
                    <div className="text-slate-400 text-xs font-medium">الدورات والمقررات</div>
                    <div className="text-2xl font-black text-white mt-1">{courseList.length}</div>
                    <div className="text-[10px] text-emerald-400 mt-1 font-semibold">مقررات أكاديمية معتمدة</div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("categories")}
                    className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 cursor-pointer transition shadow"
                  >
                    <div className="text-slate-400 text-xs font-medium">الأقسام والتصنيفات</div>
                    <div className="text-2xl font-black text-white mt-1">{categoryList.length}</div>
                    <div className="text-[10px] text-teal-400 mt-1 font-semibold">شجرة محتوى منظمة</div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("prices")}
                    className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition shadow"
                  >
                    <div className="text-slate-400 text-xs font-medium">بورصة الأسعار</div>
                    <div className="text-2xl font-black text-white mt-1">{priceList.length}</div>
                    <div className="text-[10px] text-amber-400 mt-1 font-semibold">سوق وادي سوف</div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("users")}
                    className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition shadow"
                  >
                    <div className="text-slate-400 text-xs font-medium">المستخدمون المسجلون</div>
                    <div className="text-2xl font-black text-white mt-1">{userList.length}</div>
                    <div className="text-[10px] text-indigo-400 mt-1 font-semibold">طلاب، فلاحون، خبراء</div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("logs")}
                    className="p-4.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition shadow"
                  >
                    <div className="text-slate-400 text-xs font-medium">سجل العمليات الإدارية</div>
                    <div className="text-2xl font-black text-white mt-1">{activityLogs.length}</div>
                    <div className="text-[10px] text-rose-400 mt-1 font-semibold">سجل تدقيق مباشر (Audit)</div>
                  </div>
                </div>

                {/* Quick Shortcuts & Recent Operational Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Quick Action Shortcuts */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
                    <h3 className="font-black text-white text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>إجراءات سريعة للمؤسسين</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={handleOpenAddContent}
                        className="p-3 bg-slate-800/80 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-right"
                      >
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>إضافة مقال جديد</span>
                      </button>
                      <button
                        onClick={handleOpenAddCourse}
                        className="p-3 bg-slate-800/80 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-right"
                      >
                        <GraduationCap className="w-4 h-4 shrink-0" />
                        <span>إضافة مقرر تدريبي</span>
                      </button>
                      <button
                        onClick={handleOpenAddPrice}
                        className="p-3 bg-slate-800/80 hover:bg-amber-600 hover:text-slate-950 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-right"
                      >
                        <DollarSign className="w-4 h-4 shrink-0" />
                        <span>تحديث البورصة</span>
                      </button>
                      <button
                        onClick={handleOpenAddProduct}
                        className="p-3 bg-slate-800/80 hover:bg-teal-600 hover:text-slate-950 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-right"
                      >
                        <ShoppingBag className="w-4 h-4 shrink-0" />
                        <span>إدراج منتج بالسوق</span>
                      </button>
                      <button
                        onClick={handleOpenAddCategory}
                        className="p-3 bg-slate-800/80 hover:bg-indigo-600 hover:text-slate-950 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-right col-span-2"
                      >
                        <FolderPlus className="w-4 h-4 shrink-0" />
                        <span>إضافة قسم / تصنيف جديد للمحتوى</span>
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity Mini-Feed */}
                  <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-white text-sm flex items-center gap-2">
                        <History className="w-4 h-4 text-emerald-400" />
                        <span>آخر العمليات والأنشطة الإدارية المسجلة</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab("logs")}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                      >
                        عرض السجل الكامل ←
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {activityLogs.slice(0, 4).map((log) => (
                        <div
                          key={log.id}
                          className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                log.action === "create"
                                  ? "bg-emerald-400"
                                  : log.action === "update"
                                  ? "bg-amber-400"
                                  : log.action === "delete"
                                  ? "bg-rose-400"
                                  : "bg-teal-400"
                              }`}
                            />
                            <div>
                              <strong className="text-slate-200 font-bold">{log.entityTitle}</strong>
                              <p className="text-[11px] text-slate-400">{log.details || log.action}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(log.timestamp).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <p className="text-[10px] text-emerald-400 font-semibold">{log.performedBy?.name || "المؤسس"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. ARTICLES TAB (المقالات) */}
            {/* ========================================================================= */}
            {activeTab === "articles" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                      <span>إدارة المقالات والأدلة الإرشادية ({contentList.length})</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      إنشاء، تعديل، أرشفة أو حذف المقالات العلمية والإرشادات الزراعية.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddContent}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة مقال جديد</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث بالعنوان أو الكاتب أو الوسم..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="all">كافة الأقسام</option>
                    {categoryList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="all">كافة الحالات (منشور ومسودة ومؤرشف)</option>
                    <option value="published">المنشور فقط (Published)</option>
                    <option value="draft">المسودات فقط (Draft)</option>
                    <option value="archived">المؤرشف فقط (Archived)</option>
                  </select>
                </div>

                {/* Articles Table */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs text-slate-300 font-sans">
                      <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
                        <tr>
                          <th className="p-4">المقال / الدليل</th>
                          <th className="p-4">القسم</th>
                          <th className="p-4">الكاتب / المنشئ</th>
                          <th className="p-4">الحالة (Status)</th>
                          <th className="p-4">تاريخ التحديث</th>
                          <th className="p-4 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {filteredContent.map((item) => {
                          const status = item.status || (item.isPublished ? "published" : "draft");
                          return (
                            <tr key={item.id} className="hover:bg-slate-850/50 transition">
                              <td className="p-4">
                                <div className="space-y-1">
                                  <span className="font-bold text-white text-sm block">{item.title}</span>
                                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-emerald-300 font-semibold text-[11px]">
                                  {categoryList.find((c) => c.id === item.categoryId)?.nameAr || "قسم عام"}
                                </span>
                              </td>
                              <td className="p-4 text-slate-300 font-medium">
                                <div>{item.author || "م. ماريه بروبة"}</div>
                                {typeof item.updatedBy === "object" && item.updatedBy?.name && (
                                  <span className="text-[10px] text-slate-500">عدله: {item.updatedBy.name}</span>
                                )}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                    status === "published"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                      : status === "draft"
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                      : "bg-slate-800 text-slate-400 border border-slate-700"
                                  }`}
                                >
                                  {status === "published" ? "✓ منشور" : status === "draft" ? "✎ مسودة" : "📦 مؤرشف"}
                                </span>
                              </td>
                              <td className="p-4 text-slate-400 font-mono text-[11px]">
                                {new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString("ar-DZ")}
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => setPreviewContent(item)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                                    title="معاينة المقال"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditContent(item)}
                                    className="p-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-emerald-400 rounded-lg transition cursor-pointer"
                                    title="تعديل المقال"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleToggleContentStatus(
                                        item,
                                        status === "published" ? "draft" : "published"
                                      )
                                    }
                                    className="p-1.5 bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-amber-400 rounded-lg transition cursor-pointer"
                                    title={status === "published" ? "تحويل لمسودة" : "نشر المقال"}
                                  >
                                    {status === "published" ? <Minus className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteTarget({
                                        type: "content",
                                        id: item.id,
                                        name: item.title,
                                        allowArchive: true
                                      })
                                    }
                                    className="p-1.5 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                                    title="حذف أو أرشفة"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. COURSES TAB (الدورات والمقررات) */}
            {/* ========================================================================= */}
            {activeTab === "courses" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                      <span>إدارة الدورات التدريبية والمناهج الأكاديمية ({courseList.length})</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      بناء الوحدات والدروس، رفع المرفقات وروابط الفيديو، وتحديث حالة النشر للطلبة والمشاركين.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddCourse}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء دورة تعليمية جديدة</span>
                  </button>
                </div>

                {/* Filters Bar for Courses */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث بالعنوان أو المشرف أو الوصف..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="all">كافة المجالات والتصنيفات</option>
                    <option value="crops">زراعة المحاصيل والإنتاج النباتي</option>
                    <option value="irrigation">هندسة الري والطاقة بالصحراء</option>
                    <option value="sustainability">وقاية النباتات وأمراض النخيل</option>
                  </select>

                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="all">كافة الحالات (منشور ومسودة ومؤرشف)</option>
                    <option value="published">منشور فقط (Published)</option>
                    <option value="draft">مسودة قيد التطوير (Draft)</option>
                    <option value="archived">مؤرشف (Archived)</option>
                  </select>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courseList
                    .filter((c) => {
                      if (selectedCategoryFilter !== "all" && c.category !== selectedCategoryFilter) return false;
                      if (selectedStatusFilter !== "all" && (c.status || "published") !== selectedStatusFilter) return false;
                      if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase();
                        const matchTitle = c.title?.toLowerCase().includes(q);
                        const matchInstructor = c.instructor?.toLowerCase().includes(q);
                        const matchDesc = c.description?.toLowerCase().includes(q);
                        if (!matchTitle && !matchInstructor && !matchDesc) return false;
                      }
                      return true;
                    })
                    .map((course) => {
                      const totalLessons = course.modules
                        ? course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
                        : (course.lessonsCount || 0);
                      const totalModules = course.modules?.length || 0;
                      const status = course.status || "published";

                      return (
                        <div
                          key={course.id}
                          className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
                        >
                          <div className="relative h-48 w-full bg-slate-950">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-900/90 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                                {totalModules > 0 ? `${totalModules} وحدات • ` : ""}{totalLessons} دروس
                              </span>
                            </div>

                            <div className="absolute top-3 right-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-md ${
                                  status === "published"
                                    ? "bg-emerald-500 text-slate-950"
                                    : status === "draft"
                                    ? "bg-amber-500 text-slate-950"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                              >
                                {status === "published" ? "✓ منشور" : status === "draft" ? "✎ مسودة" : "📦 مؤرشف"}
                              </span>
                            </div>

                            <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-[11px] text-slate-300">
                              <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-teal-300 font-bold border border-teal-500/20">
                                {course.level === "beginner" ? "مبتدئ" : course.level === "advanced" ? "متقدم" : "متوسط"}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px] bg-slate-950/70 px-2 py-0.5 rounded">
                                {course.duration}
                              </span>
                            </div>
                          </div>

                          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">
                                {course.title}
                              </h3>
                              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                {course.shortDescription || course.description}
                              </p>
                              <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                                <User className="w-3.5 h-3.5" />
                                <span>{course.instructor}</span>
                              </div>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-slate-800">
                              {/* Manage Curriculum Button */}
                              <button
                                onClick={() => setCurriculumCourse(course)}
                                className="w-full py-2.5 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                              >
                                <Layers className="w-4 h-4" />
                                <span>إدارة الوحدات والدروس ({totalModules} وحدات)</span>
                              </button>

                              <div className="flex items-center justify-between gap-2 pt-1">
                                {/* Status Toggle Dropdown / Button */}
                                <select
                                  value={status}
                                  onChange={(e) => handleToggleCourseStatus(course, e.target.value as ContentStatus)}
                                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-300 focus:outline-none"
                                >
                                  <option value="published">منشور (للطلبة)</option>
                                  <option value="draft">مسودة (حجب)</option>
                                  <option value="archived">أرشفة</option>
                                </select>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditCourse(course)}
                                    className="p-2 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-emerald-400 rounded-lg transition cursor-pointer"
                                    title="تعديل بيانات الدورة"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteTarget({
                                        type: "course",
                                        id: course.id,
                                        name: course.title,
                                        allowArchive: true
                                      })
                                    }
                                    className="p-2 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                                    title="حذف أو أرشفة الدورة"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. CATEGORIES TAB (الأقسام والتصنيفات) */}
            {/* ========================================================================= */}
            {activeTab === "categories" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-teal-400" />
                      <span>إدارة أقسام وتصنيفات المنصة ({categoryList.length})</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      هيكلة تصنيفات الإرشاد الفلاحي، المقررات، والأدلة التقنية.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddCategory}
                    className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة تصنيف جديد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categoryList.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 flex items-start justify-between shadow-md"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                          {renderCategoryIcon(cat.icon)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-white text-base">{cat.nameAr}</h3>
                          {cat.nameEn && <p className="text-[11px] text-slate-400 font-mono">{cat.nameEn}</p>}
                          <p className="text-xs text-slate-400">{cat.description || "قسم رئيسي للمحتوى"}</p>
                          <span className="inline-block text-[10px] text-teal-400 font-mono">الترتيب: {cat.order}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1.5 bg-slate-800 hover:bg-teal-600 hover:text-slate-950 text-teal-400 rounded-lg transition cursor-pointer"
                          title="تعديل التصنيف"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: "category",
                              id: cat.id,
                              name: cat.nameAr
                            })
                          }
                          className="p-1.5 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                          title="حذف التصنيف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. PRICES TAB (الأسعار والبورصة) */}
            {/* ========================================================================= */}
            {activeTab === "prices" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-amber-400" />
                      <span>إدارة بورصة أسعار المحاصيل اليومية ({priceList.length})</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      تحديث أسعار سوق الجملة والتجزئة وتتبع الاتجاهات السوقية.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddPrice}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة محصول للبورصة</span>
                  </button>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <table className="w-full text-right text-xs text-slate-300 font-sans">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-4">المحصول</th>
                        <th className="p-4">السوق</th>
                        <th className="p-4">سعر الجملة</th>
                        <th className="p-4">سعر التجزئة</th>
                        <th className="p-4">الاتجاه</th>
                        <th className="p-4">تاريخ التحديث</th>
                        <th className="p-4 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {priceList.map((price) => (
                        <tr key={price.id} className="hover:bg-slate-850/50 transition">
                          <td className="p-4 font-bold text-white">{price.crop}</td>
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
                          <td className="p-4 text-slate-500 font-mono">{price.date}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditPrice(price)}
                                className="p-1.5 bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-amber-400 rounded-lg transition cursor-pointer"
                                title="تعديل السعر"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "price",
                                    id: price.id,
                                    name: price.crop
                                  })
                                }
                                className="p-1.5 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                                title="حذف من البورصة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. PRODUCTS TAB (المنتجات) */}
            {/* ========================================================================= */}
            {activeTab === "products" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-400" />
                      <span>إدارة سوق المنتجات والمدخلات الفلاحية ({productList.length})</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      عروض بذور البطاطا، الأسمدة، ومعدات الحفر وكراء الجرارات.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة منتج جديد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {productList.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between"
                    >
                      <div className="h-40 w-full relative bg-slate-950">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-lg">
                          {prod.category}
                        </span>
                      </div>

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h3 className="font-bold text-white text-base">{prod.name}</h3>
                          <p className="text-xs text-slate-400 line-clamp-2">{prod.description}</p>
                          <div className="font-mono font-black text-amber-400 text-sm">{prod.price}</div>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">{prod.sellerName}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-amber-400 rounded-lg transition cursor-pointer"
                              title="تعديل المنتج"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: "product",
                                  id: prod.id,
                                  name: prod.name
                                })
                              }
                              className="p-1.5 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                              title="حذف المنتج"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 7. SERVICES TAB (الخدمات والوساطة) */}
            {/* ========================================================================= */}
            {activeTab === "services" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-emerald-400" />
                      <span>إدارة مقدمي الخدمات والوساطة ({providerList.length})</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      دليل الفنيين وشركات الصيانة وسائقي الجرارات المسجلين بولاية الوادي.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {providerList.map((p) => (
                    <div key={p.id} className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-lg">
                          {p.category}
                        </span>
                        <span className="text-xs text-amber-400 font-bold font-mono">★ {p.rating}</span>
                      </div>
                      <h4 className="font-bold text-white text-base">{p.name}</h4>
                      <p className="text-xs text-slate-400">{p.description}</p>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{p.location}</span>
                        <span className="font-mono text-emerald-400 font-bold" dir="ltr">{p.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 8. USERS TAB (المستخدمون وإدارة الصلاحيات) */}
            {/* ========================================================================= */}
            {activeTab === "users" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-400" />
                      <span>إدارة المستخدمين والحسابات المسجلة ({userList.length})</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      تعديل رتب المستخدمين وتعيين الصلاحيات (مؤسس، مشرف، خبير، فلاح، طالب).
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <table className="w-full text-right text-xs text-slate-300 font-sans">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-4">الاسم</th>
                        <th className="p-4">البريد الإلكتروني</th>
                        <th className="p-4">التخصص / المجال</th>
                        <th className="p-4">الرتبة الحالية (Role)</th>
                        <th className="p-4">تغيير الصلاحية</th>
                        <th className="p-4 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {userList.map((usr) => (
                        <tr key={usr.id} className="hover:bg-slate-850/50 transition">
                          <td className="p-4 font-bold text-white">{usr.name}</td>
                          <td className="p-4 font-mono text-slate-400">{usr.email}</td>
                          <td className="p-4 text-slate-300">{usr.specialty || usr.agriculturalField || usr.institution || "—"}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-indigo-300 font-bold text-[10px]">
                              {usr.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={usr.role}
                              onChange={(e) => handleUpdateRole(usr.id, e.target.value as UserRole, usr.name)}
                              className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white focus:outline-none"
                            >
                              <option value={UserRole.STUDENT}>طالب (STUDENT)</option>
                              <option value={UserRole.FARMER}>فلاح (FARMER)</option>
                              <option value={UserRole.EXPERT}>خبير زراعي (EXPERT)</option>
                              <option value={UserRole.COMPANY}>شريك تجاري (COMPANY)</option>
                              <option value={UserRole.SUPERVISOR}>مشرف (SUPERVISOR)</option>
                              <option value={UserRole.MANAGER}>مدير (MANAGER)</option>
                              <option value={UserRole.FOUNDER}>مؤسس (FOUNDER)</option>
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: "user",
                                  id: usr.id,
                                  name: usr.name
                                })
                              }
                              className="p-1.5 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                              title="حذف المستخدم"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 9. ANALYTICS TAB (الإحصائيات) */}
            {/* ========================================================================= */}
            {activeTab === "analytics" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span>التحليلات والمؤشرات البيانية للمنصة</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      رصد نمو المحتوى الأكاديمي، تفاعل الطلاب، وتوزع المحاصيل في البورصة.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Content Distribution */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <h3 className="font-bold text-white text-base">توزيع حالة المقالات الإرشادية</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-emerald-400 font-bold">منشور ومفعل للجمهور</span>
                          <span className="text-slate-300 font-mono">
                            {contentList.filter((c) => c.status === "published" || c.isPublished).length} ({Math.round((contentList.filter((c) => c.status === "published" || c.isPublished).length / (contentList.length || 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${(contentList.filter((c) => c.status === "published" || c.isPublished).length / (contentList.length || 1)) * 100}%`
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-amber-400 font-bold">مسودات قيد المراجعة</span>
                          <span className="text-slate-300 font-mono">
                            {contentList.filter((c) => c.status === "draft").length}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{
                              width: `${(contentList.filter((c) => c.status === "draft").length / (contentList.length || 1)) * 100}%`
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-bold">محتوى مؤرشف</span>
                          <span className="text-slate-300 font-mono">
                            {contentList.filter((c) => c.status === "archived").length}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-600 rounded-full"
                            style={{
                              width: `${(contentList.filter((c) => c.status === "archived").length / (contentList.length || 1)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Users Breakdown */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <h3 className="font-bold text-white text-base">توزع رتب الحسابات بالمنصة</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850">
                        <span className="text-slate-400">الطلبة والمشاركون:</span>
                        <div className="text-xl font-black text-indigo-400 mt-1">
                          {userList.filter((u) => u.role === UserRole.STUDENT).length}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850">
                        <span className="text-slate-400">الفلاحون والمنتجون:</span>
                        <div className="text-xl font-black text-emerald-400 mt-1">
                          {userList.filter((u) => u.role === UserRole.FARMER).length}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850">
                        <span className="text-slate-400">الخبراء والأساتذة:</span>
                        <div className="text-xl font-black text-teal-400 mt-1">
                          {userList.filter((u) => u.role === UserRole.EXPERT).length}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850">
                        <span className="text-slate-400">المؤسسون والإشراف:</span>
                        <div className="text-xl font-black text-amber-400 mt-1">
                          {userList.filter((u) => u.role === UserRole.FOUNDER || u.role === UserRole.MANAGER || u.role === UserRole.SUPERVISOR).length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 10. ACTIVITY LOG TAB (سجل النشاط) */}
            {/* ========================================================================= */}
            {activeTab === "logs" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-emerald-400" />
                      <span>سجل النشاط والتدقيق الإداري ({activityLogs.length})</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      سجل موثق لجميع عمليات الإنشاء والتعديل والأرشفة والحذف التي ينفذها المؤسسون.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <table className="w-full text-right text-xs text-slate-300 font-sans">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-4">نوع الإجراء (Action)</th>
                        <th className="p-4">العنصر المتأثر</th>
                        <th className="p-4">المنفّذ (Performed By)</th>
                        <th className="p-4">التفاصيل</th>
                        <th className="p-4">التوقيت والتاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-850/50 transition">
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                log.action === "create"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : log.action === "update"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : log.action === "delete"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                  : log.action === "archive"
                                  ? "bg-slate-800 text-slate-400"
                                  : "bg-indigo-500/20 text-indigo-300"
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-white">{log.entityTitle}</td>
                          <td className="p-4">
                            <div className="font-semibold text-emerald-400">{log.performedBy?.name || "المؤسس"}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{log.performedBy?.email}</div>
                          </td>
                          <td className="p-4 text-slate-300">{log.details}</td>
                          <td className="p-4 font-mono text-slate-400 text-[11px]">
                            {new Date(log.timestamp).toLocaleString("ar-DZ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Content Form Modal */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsContentModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>{editingContent ? "تعديل بيانات المقال / الدليل" : "إنشاء مقال أو دليل إرشادي جديد"}</span>
              </h2>
              <p className="text-xs text-slate-400">سيتم حفظ المقال مباشرة في Firestore وتوثيق العملية في سجل التدقيق.</p>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">عنوان المقال *</label>
                <input
                  type="text"
                  required
                  value={contentForm.title || ""}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  placeholder="مثال: الدليل الشامل لمكافحة لفحة بطاطا سبونتا"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">القسم والتصنيف *</label>
                  <select
                    value={contentForm.categoryId || "cat_crops"}
                    onChange={(e) => setContentForm({ ...contentForm, categoryId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    {categoryList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">حالة النشر (Status) *</label>
                  <select
                    value={contentForm.status || "published"}
                    onChange={(e) => setContentForm({ ...contentForm, status: e.target.value as ContentStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    <option value="published">منشور ومفعل (Published)</option>
                    <option value="draft">مسودة قيد المراجعة (Draft)</option>
                    <option value="archived">مؤرشف (Archived)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">الملخص أو النبذة التعريفية (Description) *</label>
                <textarea
                  rows={2}
                  value={contentForm.description || ""}
                  onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                  placeholder="ملخص قصير يظهر في البطاقات والمعاينات..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">النص الكامل للمقال والتعليمات التطبيقية *</label>
                <textarea
                  required
                  rows={6}
                  value={contentForm.body || ""}
                  onChange={(e) => setContentForm({ ...contentForm, body: e.target.value })}
                  placeholder="اكتب المحتوى الكامل هنا بالتفصيل..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">الوسوم والكلمات المفتاحية (مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="وادي سوف, بطاطا سبونتا, سقي ذكي"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">رابط الصورة التوضيحية أو رفع من الجهاز</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={contentForm.imageUrl || ""}
                    onChange={(e) => setContentForm({ ...contentForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
                  />
                  <label className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsContentModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingContent}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs cursor-pointer flex items-center gap-2 shadow"
                >
                  {isSavingContent ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingContent ? "حفظ التعديلات" : "إنشاء ونشر المقال"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete & Archive Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-white">تأكيد عملية الحذف أو الأرشفة</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف <strong className="text-slate-200">"{deleteTarget.name}"</strong>؟
                {deleteTarget.allowArchive && " يمكنك أيضاً أرشفتها لإخفائها من الجمهور والاحتفاظ بها بسجل المؤسسين."}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {deleteTarget.allowArchive && (
                <button
                  onClick={handleArchiveTarget}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Archive className="w-4 h-4" />
                  <span>أرشفة العنصر بدلاً من الحذف (Archive)</span>
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء التراجع
                </button>
                <button
                  onClick={handleExecuteDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>حذف نهائي</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-white text-base">
              {editingCategory ? "تعديل بيانات القسم" : "إضافة قسم جديد"}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">اسم القسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.nameAr || ""}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                  placeholder="مثال: وقاية النباتات والأمراض"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">الاسم بالإنجليزية (Slug/En)</label>
                <input
                  type="text"
                  value={categoryForm.nameEn || ""}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                  placeholder="Plant Protection"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">أيقونة القسم</label>
                <select
                  value={categoryForm.icon || "Sprout"}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                >
                  <option value="Sprout">Sprout (شتلة/نبات)</option>
                  <option value="TreePine">TreePine (نخيل/أشجار)</option>
                  <option value="Droplets">Droplets (سقي وري)</option>
                  <option value="Layers">Layers (تربة وأسمدة)</option>
                  <option value="GraduationCap">GraduationCap (تعليم وأكاديميا)</option>
                  <option value="Bug">Bug (حشرات ومكافحة)</option>
                  <option value="Sun">Sun (طاقة شمسية ومناخ)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-xs"
                >
                  حفظ القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsCourseModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-white text-base">
              {editingCourse ? "تعديل بيانات الدورة التدريبية" : "إنشاء دورة تدريبية جديدة"}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">عنوان الدورة الأكاديمية *</label>
                <input
                  type="text"
                  required
                  value={courseForm.title || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="مثال: الدورة التطبيقية المتقدمة في السقي المحوري الذكي"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">المشرف الأكاديمي *</label>
                  <input
                    type="text"
                    required
                    value={courseForm.instructor || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">صفة المشرف</label>
                  <input
                    type="text"
                    value={courseForm.instructorRole || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, instructorRole: e.target.value })}
                    placeholder="مهندس زراعي وخبير ري صحراوي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">المستوى</label>
                  <select
                    value={courseForm.level || "intermediate"}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    <option value="beginner">مبتدئ</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">متقدم</option>
                    <option value="all">كافة المستويات</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">التصنيف</label>
                  <select
                    value={courseForm.category || "crops"}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    <option value="crops">المحاصيل والإنتاج النباتي</option>
                    <option value="irrigation">هندسة الري والطاقة</option>
                    <option value="sustainability">وقاية النباتات وأمراض النخيل</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">حالة النشر</label>
                  <select
                    value={courseForm.status || "published"}
                    onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    <option value="published">منشور (متاح للطلبة)</option>
                    <option value="draft">مسودة (حجب)</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Access Tier */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-black text-white">نوع الوصول للدورة</label>
                    <p className="text-[11px] text-slate-400">
                      {courseForm.isPremium
                        ? "دورة مدفوعة برسوم اشتراك تتضمن دروساً مقفلة وأخرى مجانية للمعاينة"
                        : "دورة مجانية بالكامل ومتاحة لجميع طلبة وفلاحي المنصة"}
                    </p>
                  </div>
                  <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCourseForm({ ...courseForm, isPremium: false, price: 0 })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        !courseForm.isPremium ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      مجانية
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseForm({ ...courseForm, isPremium: true, price: courseForm.price || 3500 })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        courseForm.isPremium ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      مدفوعة
                    </button>
                  </div>
                </div>

                {courseForm.isPremium && (
                  <div className="pt-2 border-t border-slate-850 flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-300 shrink-0">سعر الاشتراك (DZD):</label>
                    <input
                      type="number"
                      value={courseForm.price || 3500}
                      onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                      placeholder="مثال: 3500"
                      className="w-full max-w-[160px] bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[11px] text-slate-400">دينار جزائري شامل الشهادة والمعاينة</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">المدة والمدة التقديرية</label>
                  <input
                    type="text"
                    value={courseForm.duration || "4 أسابيع"}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="مثال: 4 أسابيع (12 ساعة تدريبية)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">المؤسسة / الجهة الأكاديمية</label>
                  <input
                    type="text"
                    value={courseForm.institution || "جامعة الشهيد حمه لخضر - الوادي"}
                    onChange={(e) => setCourseForm({ ...courseForm, institution: e.target.value })}
                    placeholder="جامعة الشهيد حمه لخضر - الوادي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">رابط صورة الغلاف (Thumbnail)</label>
                <input
                  type="url"
                  value={courseForm.thumbnail || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">وصف موجز للمقرر</label>
                <input
                  type="text"
                  value={courseForm.shortDescription || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, shortDescription: e.target.value })}
                  placeholder="نبذة سريعة تظهر في بطاقة الدورة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">الوصف التفصيلي والأهداف</label>
                <textarea
                  rows={3}
                  value={courseForm.description || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="شرح متكامل حول المحتوى، المستهدفين، والمهارات المكتسبة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingCourse}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {isSavingCourse ? "جاري الحفظ..." : "حفظ بيانات الدورة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price Modal */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsPriceModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-white text-base">
              {editingPrice ? "تعديل سعر المحصول بالبورصة" : "إضافة محصول جديد للبورصة"}
            </h3>

            <form onSubmit={handleSavePrice} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">اسم المحصول *</label>
                <input
                  type="text"
                  required
                  value={priceForm.crop || ""}
                  onChange={(e) => setPriceForm({ ...priceForm, crop: e.target.value })}
                  placeholder="مثال: بطاطا سوفية حمراء (جملة)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">سعر الجملة (DZD)</label>
                  <input
                    type="number"
                    value={priceForm.wholesalePrice || 0}
                    onChange={(e) => setPriceForm({ ...priceForm, wholesalePrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">سعر التجزئة (DZD)</label>
                  <input
                    type="number"
                    value={priceForm.retailPrice || 0}
                    onChange={(e) => setPriceForm({ ...priceForm, retailPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">اتجاه السعر (Trend)</label>
                <select
                  value={priceForm.trend || "stable"}
                  onChange={(e) => setPriceForm({ ...priceForm, trend: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                >
                  <option value="stable">مستقر (=)</option>
                  <option value="up">في ارتفاع (↑)</option>
                  <option value="down">في انخفاض (↓)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingPrice}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs"
                >
                  حفظ السعر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-white text-base">
              {editingProduct ? "تعديل بيانات المنتج" : "إضافة منتج جديد للسوق"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  value={productForm.name || ""}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="مثال: بذور بطاطا سبونتا نخبة أصلية"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">الصنف / القسم</label>
                  <input
                    type="text"
                    value={productForm.category || "بذور"}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">السعر المعروض</label>
                  <input
                    type="text"
                    value={productForm.price || "4500 DZD"}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setPreviewContent(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {previewContent.imageUrl && (
              <div className="rounded-2xl overflow-hidden h-60 w-full">
                <img
                  src={previewContent.imageUrl}
                  alt={previewContent.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {categoryList.find((c) => c.id === previewContent.categoryId)?.nameAr || "إرشاد فلاحي"}
                </span>
                <span className="text-slate-400">بواسطة: {previewContent.author || "م. ماريه بروبة"}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{previewContent.createdAt ? new Date(previewContent.createdAt).toLocaleDateString("ar-DZ") : "اليوم"}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">{previewContent.title}</h2>
              {previewContent.description && (
                <p className="text-xs font-semibold text-emerald-300/90 leading-relaxed bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-800/30">
                  {previewContent.description}
                </p>
              )}
            </div>

            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-3">
              {previewContent.body}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setPreviewContent(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Course Curriculum & Lessons Manager Modal */}
      {curriculumCourse && (
        <CourseCurriculumManager
          isOpen={true}
          course={curriculumCourse}
          currentUser={currentUser}
          onClose={() => setCurriculumCourse(null)}
          onSaveCourse={handleSaveCurriculumCourse}
        />
      )}
    </div>
  );
}
