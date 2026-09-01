import React, { useState } from "react";
import { Product } from "../types";
import { SlidersHorizontal, ShoppingCart, Key, MapPin, Phone, Building, Tag, Plus, Check, CheckCircle, AlertCircle, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MarketplaceProps {
  products: Product[];
  onAddProduct: (newProduct: any) => Promise<boolean>;
  onDeleteProduct?: (productId: string) => Promise<boolean>;
  userRole: string;
}

export default function Marketplace({ products, onAddProduct, onDeleteProduct, userRole }: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal ordering states
  const [showOrderModal, setShowOrderModal] = useState<Product | null>(null);
  const [orderName, setOrderName] = useState("");
  const [orderPhone, setOrderPhone] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("1");
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Listing creation form states (for Companies & Admins)
  const [companyName, setCompanyName] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("قطعة");
  const [category, setCategory] = useState("seeds");
  const [type, setType] = useState("buy");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("الوادي");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const categories = [
    { value: "all", label: "كل الفئات" },
    { value: "seeds", label: "الحبوب والبذور" },
    { value: "fertilizers", label: "الأسمدة والكبريت" },
    { value: "pesticides", label: "المبيدات الحيوية" },
    { value: "irrigation", label: "خراطيم الري المحوري" },
    { value: "machinery", label: "المعدات والجرارات" }
  ];

  // Locations list
  const municipalities = ["الوادي", "قمار", "حاسي خليفة", "الرقيبة", "البياضة", "الدبيلة", "أورماس", "تغزوت"];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchesType = selectedType === "all" || p.type === selectedType;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesType && matchesSearch;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !productTitle || !price || !phone) {
      alert("يرجى إكمال البيانات المطلوبة لرفع المنتوج.");
      return;
    }

    const payload = {
      companyName,
      title: productTitle,
      category,
      type,
      price: Number(price),
      unit,
      description,
      phone,
      location,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600"
    };

    const success = await onAddProduct(payload);
    if (success) {
      setSuccessMsg("تهانينا! تم إرسال منتجك للبيع للجمهور الفلاحي بالوادي بنجاح.");
      setProductTitle("");
      setPrice("");
      setPhone("");
      setDescription("");
      setImageUrl("");
      setTimeout(() => setSuccessMsg(""), 7000);
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderName || !orderPhone) {
      alert("الطلب بحاجة لتأكيد الاسم المعرف ورقم الجوال للتوصيل.");
      return;
    }
    setOrderSuccess(`تم إرسال طلبك لشراء/كراء "${showOrderModal?.title}" بنجاح! ستتصل بك شركة "${showOrderModal?.companyName}" فوراً عبر الرقم ${orderPhone} لتنسيق عمليات الشحن والتوصيل الفوري.`);
    setOrderName("");
    setOrderPhone("");
    setTimeout(() => {
      setOrderSuccess(null);
      setShowOrderModal(null);
    }, 8000);
  };

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* Top filter dashboard banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-emerald-400" />
              <span>سوق مستلزمات الفلاحة والعتاد السوفي</span>
            </h3>
            <p className="text-xs text-slate-400 font-light">
              منصة ربط تجاري مباشر بين فلاحي سوف وشركات الأسمدة الحيوية والري وكراء التجهيزات.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedType === "all" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/60 shadow-inner" : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-900"
              }`}
            >
              عرض لعموم السلع
            </button>
            <button
              onClick={() => setSelectedType("buy")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedType === "buy" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/60 shadow-inner" : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-900"
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>شراء مباشر للمدخلات</span>
            </button>
            <button
              onClick={() => setSelectedType("rent")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedType === "rent" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/60 shadow-inner" : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-900"
              }`}
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>إيجار وكراء تجهيزات</span>
            </button>
          </div>
        </div>

        {/* Filters and search box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
          <div className="md:col-span-4 select-none relative">
            <input
              type="text"
              placeholder="ابحث عن بذور، مضخات، عتاد فلاحي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pr-4 rounded-xl border border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-950 text-slate-100 placeholder:text-slate-650"
            />
          </div>

          <div className="md:col-span-8 flex flex-wrap gap-2 items-center">
            <SlidersHorizontal className="w-4 h-4 text-slate-550 ml-1 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.value 
                      ? "bg-slate-800 text-slate-200 border border-slate-755 shadow-inner" 
                      : "bg-slate-950/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900/40 backdrop-blur-xl border border-slate-850/80 rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_4px_30px_rgba(16,185,129,0.04)] hover:border-emerald-500/25 hover:scale-[1.01] duration-300 transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-850">
              <img
                src={p.imageUrl}
                alt={p.title}
                className="w-full h-full object-cover opacity-80"
              />
              <span className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[9px] font-bold text-white shadow-md ${
                p.type === "buy" ? "bg-emerald-600 border border-emerald-500/30" : "bg-cyan-650 border border-cyan-500/30"
              }`}>
                {p.type === "buy" ? "شراء" : "كراء"}
              </span>
              <span className="absolute bottom-3 right-3 bg-slate-950/85 text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-800">
                {p.price.toLocaleString()} دج / <span className="font-light text-[10px] text-slate-300">{p.unit}</span>
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-450 text-[10px]">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[170px] font-bold">{p.companyName}</span>
                </div>
                <h4 className="font-bold text-slate-100 text-sm leading-relaxed line-clamp-1">
                  {p.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-850 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>موقع العرض: {p.location}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[9px] bg-emerald-950 border border-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-400">
                    {categories.find(c => c.value === p.category)?.label}
                  </span>
                </div>

                <div className="flex gap-2 pt-1.5">
                  <button
                    onClick={() => setShowOrderModal(p)}
                    className="flex-1 bg-emerald-650 hover:bg-emerald-600 text-slate-100 rounded-xl py-2 px-3 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>طلب معجل</span>
                  </button>
                  <a
                    href={`tel:${p.phone}`}
                    className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-emerald-400 p-2.5 rounded-xl transition flex items-center justify-center shrink-0"
                    title={p.phone}
                    onClick={(e) => {
                      alert(`رقم الاتصال الفوري بالبائع: ${p.phone}`);
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  {(userRole === "ADMIN" || userRole === "COMPANY") && onDeleteProduct && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`هل أنت متأكد من رغبتك في حذف هذا المعروض "${p.title}" من السوق؟`)) {
                          onDeleteProduct(p.id);
                        }
                      }}
                      className="bg-rose-950/85 hover:bg-rose-900 text-rose-400 hover:text-rose-200 border border-rose-900/40 p-2.5 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer"
                      title="حذف هذا المعروض"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full bg-slate-900/30 p-12 text-center rounded-3xl border border-dashed border-slate-800/80">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-pulse" />
            <p className="text-slate-400 text-xs font-bold">لم تدرج أية معروضات تطابق التصنيف الفلاحي المحدد حالياً مسبقاً.</p>
          </div>
        )}
      </div>

      {/* Product Uploading Form exclusive for Companies / Admins */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-950/85 text-emerald-400 border border-emerald-900/50 rounded-2xl flex items-center justify-center shadow-inner">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#f1f5f9]">بوابة إضافة السلع وإدراج جرارات الإيجار بالجنوب</h4>
            <p className="text-xs text-slate-400">
              متاح للشركات المعترف بها بالوادي وجامعة الوادي لعرض البذور المعقمة وعتاد الضخ المحوري.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">اسم الشركة أو المورِّد النشط *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="مثال: شركة سقي سوف التعاونية"
              className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">اسم المنتوج أو العتاد بالتفصيل *</label>
            <input
              type="text"
              required
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="مثال: بذور بطاطا 'سبونتا' مستوردة معقمة"
              className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">فئة وتصنيف المنتج</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="seeds">الحبوب والبذور</option>
              <option value="fertilizers">الأسمدة والكبريت</option>
              <option value="pesticides">المبيدات الحيوية</option>
              <option value="irrigation">خراطيم الري المحوري</option>
              <option value="machinery">المعدات والجرارات الزراعية</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">نوع التبادل المتاح</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("buy")}
                className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  type === "buy" ? "bg-emerald-950 text-emerald-400 border-emerald-800/60" : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900"
                }`}
              >
                شراء مباشر
              </button>
              <button
                type="button"
                onClick={() => setType("rent")}
                className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  type === "rent" ? "bg-emerald-950 text-emerald-400 border-emerald-800/60" : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900"
                }`}
              >
                إيجار وكراء جرار
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">سعر المعاملة المقترح (دج) *</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="مثال: 14500"
              className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">وحدة السعر (كيس، قنطار، طن، يوم كراء)</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="مثال: قنطار، كيس، لتر، يوم كامل"
              className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">رقم الهاتف لخدمة المزارع *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: +213 549 598 307"
              className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">موقع المستلزمات بالوادي</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none"
            >
              {municipalities.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-350">رابط صورة المعاينة (اختياري)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="الصق رابط صورة للآلة"
              className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5 md:col-span-3">
            <label className="text-xs font-bold text-slate-350">توصيف دقيق للمنتج ومطابقته لتربة سوف الرملية *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب مواصفات السلعة، بلد الصنع والتدريج الوقائي والضمان..."
              className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-650 hover:bg-emerald-600 text-slate-100 px-6 py-3.5 rounded-xl transition-all font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-950/20"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل وعرض المنتوج في السوق لقرى سوف</span>
            </button>
          </div>
        </form>
      </div>

      {/* Order popup modal with dark premium style */}
      <AnimatePresence>
        {showOrderModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5" 
              dir="rtl"
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 border border-emerald-900/60 px-2 py-0.5 rounded">
                    شحن وتوصيل فوري بالدينار
                  </span>
                  <h4 className="text-base font-bold text-slate-100 mt-1">تأكيد طلب شراء من منصة هودنت</h4>
                </div>
                <button
                  onClick={() => setShowOrderModal(null)}
                  className="text-slate-500 hover:text-slate-200 text-2xl font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {orderSuccess ? (
                <div className="p-4 bg-emerald-950/50 border border-emerald-900/40 rounded-2xl text-xs text-emerald-200 space-y-2 leading-relaxed">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mb-1" />
                  <p className="font-semibold">{orderSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div className="bg-slate-950 p-3.5 rounded-2xl flex items-center gap-3.5 border border-slate-850">
                    <img src={showOrderModal.imageUrl} alt={showOrderModal.title} className="w-16 h-12 object-cover rounded-lg" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-100 leading-tight">{showOrderModal.title}</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">البائع: {showOrderModal.companyName}</p>
                      <p className="text-xs text-emerald-400 font-bold mt-1">المبلغ المقدر: {showOrderModal.price.toLocaleString()} دج /{showOrderModal.unit}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-350">اسم الفلاح / المستثمر بالوادي *</label>
                    <input
                      type="text"
                      required
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="اكتب اسمك للمطابقة"
                      className="w-full text-xs p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-350">رقم الهاتف للاتصال والتنسيق الكلي *</label>
                    <input
                      type="tel"
                      required
                      value={orderPhone}
                      onChange={(e) => setOrderPhone(e.target.value)}
                      placeholder="مثال: 0655123456"
                      className="w-full text-xs p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-350">الكمية المطلوبة للشحن والقلع</label>
                    <input
                      type="text"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(e.target.value)}
                      placeholder="مثال: قنطار ونصف / 5 أيام كراء"
                      className="w-full text-xs p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-650 hover:bg-emerald-600 text-slate-100 rounded-xl py-2.5 px-4 text-xs font-bold cursor-pointer transition shadow-lg"
                    >
                      إرسال وتأكيد الطلب الفوري
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOrderModal(null)}
                      className="bg-slate-950 hover:bg-slate-850 text-slate-400 rounded-xl py-2.5 px-4 text-xs font-bold cursor-pointer transition border border-slate-850"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
