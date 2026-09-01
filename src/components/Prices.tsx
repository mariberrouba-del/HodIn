import React, { useState } from "react";
import { MarketPrice, UserProfile } from "../types";
import { Coins, TrendingUp, TrendingDown, ArrowRight, Plus, RefreshCw, BarChart2, Info, Sparkles, Star, Trash2, Edit2, Check, X, ShieldAlert } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { isUserFounder } from "../lib/firebaseService";

interface PricesProps {
  prices: MarketPrice[];
  onAddPrice: (formData: any) => Promise<boolean>;
  onUpdatePrice?: (priceId: string, formData: any) => Promise<boolean>;
  onDeletePrice?: (priceId: string) => Promise<boolean>;
  userRole: string;
  currentUser?: UserProfile;
}

export default function Prices({ prices, onAddPrice, onUpdatePrice, onDeletePrice, userRole, currentUser }: PricesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Custom price posting & editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [category, setCategory] = useState("vegetables");
  const [currentPrice, setCurrentPrice] = useState("");
  const [yesterdayPrice, setYesterdayPrice] = useState("");
  const [trend, setTrend] = useState("stable");
  const [icon, setIcon] = useState("🥬");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManage = isUserFounder(currentUser);

  const categories = [
    { value: "all", label: "كل الأغذية" },
    { value: "vegetables", label: "خضروات الوادي" },
    { value: "fruits", label: "فواكه وتمور سوف" }
  ];

  // Historical price trends matching our emerald / gold color palette
  const historicPriceData = [
    { day: "السبت", "بطاطا سوف": 96, "تمور دقلة نور": 450, "طماطم حقل": 50 },
    { day: "الأحد", "بطاطا سوف": 93, "تمور دقلة نور": 450, "طماطم حقل": 52 },
    { day: "الإثنين", "بطاطا سوف": 90, "تمور دقلة نور": 460, "طماطم حقل": 58 },
    { day: "الثلاثاء", "بطاطا سوف": 88, "تمور دقلة نور": 450, "طماطم حقل": 62 },
    { day: "الأربعاء", "بطاطا سوف": 84, "تمور دقلة نور": 450, "طماطم حقل": 65 },
    { day: "الخميس", "بطاطا سوف": 85, "تمور دقلة نور": 450, "طماطم حقل": 70 }
  ];

  const filteredPrices = selectedCategory === "all"
    ? prices
    : prices.filter(p => p.category === selectedCategory);

  const handleStartEdit = (p: MarketPrice) => {
    setEditingId(p.id);
    setNameAr(p.nameAr);
    setNameEn(p.nameEn || "");
    setCategory(p.category);
    setCurrentPrice(String(p.currentPrice));
    setYesterdayPrice(String(p.yesterdayPrice || p.currentPrice));
    setTrend(p.trend);
    setIcon(p.icon || "🥬");
    // Scroll smoothly to form if mobile
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNameAr("");
    setNameEn("");
    setCurrentPrice("");
    setYesterdayPrice("");
    setTrend("stable");
    setIcon("🥬");
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !currentPrice) {
      alert("البيانات الأساسية (الاسم العربي والسعر) مطلوبة لتعديل قائمة السوق.");
      return;
    }

    const payload = {
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim() || nameAr.trim(),
      category,
      currentPrice: Number(currentPrice),
      yesterdayPrice: yesterdayPrice ? Number(yesterdayPrice) : Number(currentPrice),
      trend,
      icon
    };

    setIsSubmitting(true);
    try {
      if (editingId && onUpdatePrice) {
        const success = await onUpdatePrice(editingId, payload);
        if (success) {
          setSuccessMsg(`تم تعديل سعر "${nameAr}" بنجاح وتحديث قاعدة البيانات!`);
          handleCancelEdit();
          setTimeout(() => setSuccessMsg(""), 5000);
        }
      } else {
        const success = await onAddPrice({
          id: "p_" + Date.now().toString(36),
          ...payload
        });
        if (success) {
          setSuccessMsg("تم إدراج المنتوج وتسعيرته الجديدة ونشرها في عموم واحات الوادي بنجاح!");
          handleCancelEdit();
          setTimeout(() => setSuccessMsg(""), 5000);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" dir="rtl">
      
      {/* List / Table of Current Prices (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-extrabold text-slate-100 text-lg flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-400" />
                  <span>لوحة بورصة الأسعار المحلية الفورية لولاية الوادي</span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">الأسعار متداولة حالياً بأسواق جملة الوادي وحاسي خليفة والدبيلة بالدينار الجزائري (دج/كغ).</p>
            </div>
            
            {/* Category selection buttons */}
            <div className="flex gap-1.5 shrink-0 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {categories.map(c => (
                <button
                  key={c.value}
                  onClick={() => setSelectedCategory(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === c.value
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60 shadow-sm"
                      : "text-slate-450 hover:text-slate-200"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid list of prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPrices.map((p) => {
              const diff = p.currentPrice - p.yesterdayPrice;
              const percentDiff = p.yesterdayPrice > 0 ? ((diff / p.yesterdayPrice) * 100).toFixed(1) : "0.0";
              const isUp = p.trend === "up";
              const isDown = p.trend === "down";
              const isItemEditing = editingId === p.id;

              return (
                <div 
                  key={p.id} 
                  className={`p-4 rounded-2xl border flex items-center justify-between relative transition-all duration-300 group ${
                    isItemEditing 
                      ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg" 
                      : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl bg-slate-900 w-11 h-11 rounded-xl flex items-center justify-center border border-slate-800 shadow-sm">{p.icon}</span>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                        <span>{p.nameAr}</span>
                        {isItemEditing && (
                          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] rounded font-mono font-bold">قيد التعديل</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono tracking-wide">{p.nameEn}</p>
                    </div>
                  </div>

                  <div className="text-left flex items-center gap-3">
                    <div>
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="font-extrabold text-lg text-slate-100 font-mono">{p.currentPrice}</span>
                        <span className="text-[10px] text-slate-450">دج</span>
                      </div>
                      
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {isUp && (
                          <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span>+{percentDiff}%</span>
                          </span>
                        )}
                        {isDown && (
                          <span className="text-rose-400 bg-rose-950/40 border border-rose-900/60 text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3 text-rose-400" />
                            <span>{percentDiff}%</span>
                          </span>
                        )}
                        {!isUp && !isDown && (
                          <span className="text-slate-500 bg-slate-900 border border-slate-850 text-[10px] px-2 py-0.5 rounded-md font-bold">
                            مستقر
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons for Founders & Admins */}
                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className={`p-2 rounded-xl transition-all cursor-pointer shadow-sm ${
                            isItemEditing 
                              ? "bg-emerald-500 text-slate-950 font-bold" 
                              : "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800"
                          }`}
                          title="تعديل السعر"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {onDeletePrice && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`هل أنت متأكد من رغبتك في حذف تسعيرة "${p.nameAr}" نهائياً من المنصة؟`)) {
                                onDeletePrice(p.id);
                              }
                            }}
                            className="bg-rose-950/80 hover:bg-rose-900 text-rose-400 hover:text-rose-200 border border-rose-900/40 p-2 rounded-xl transition-all cursor-pointer shadow-sm"
                            title="حذف التسعيرة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 bg-emerald-950/30 text-emerald-300 p-4 rounded-2xl text-[11px] border border-emerald-900/30 leading-relaxed font-light">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <p><strong>توجيه مهني:</strong> تتحكم وفرة محاصيل المزارع السوفية وعقود تزويد ولايات الشمال والساحل الجزائري بصفة رئيسية في وتيرة العرض والطلب للمزروعات.</p>
          </div>
        </motion.div>

        {/* Dynamic Trend visualization */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4"
        >
          <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>رسوم بيانية: منحنى تطور الأسعار هذا الأسبوع في أسواق الوادي (دج/كغ)</span>
          </h4>

          {/* Recharts dark wrapper */}
          <div className="h-[250px] text-xs font-mono pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicPriceData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="day" stroke="#64748b" tickSize={4} />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    direction: "rtl", 
                    borderRadius: "16px", 
                    backgroundColor: "#0f172a", 
                    borderColor: "#334155", 
                    color: "#f8fafc" 
                  }} 
                />
                <Line type="monotone" dataKey="بطاطا سوف" stroke="#10b981" strokeWidth={3.5} dot={{ r: 4, stroke: "#10b981", strokeWidth: 1 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="طماطم حقل" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="تمور دقلة نور" stroke="#f59e0b" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-5 text-[10px] text-slate-450 font-bold">
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-1.5 bg-emerald-500 rounded"></span><span>البطاطا (سبونتا السوفية)</span></span>
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-1.5 bg-rose-500 rounded-dashed border border-rose-500"></span><span>طماطم الحقل</span></span>
            <span className="flex items-center gap-1.5"><span className="w-3.5 h-1.5 bg-amber-500 rounded"></span><span>تمور دقلة نور الفاخرة</span></span>
          </div>
        </motion.div>

      </div>

      {/* Admin / Founder Price Editor Panel (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl relative"
        >
          <div className="absolute right-4 top-4 text-emerald-500/15 pointer-events-none">
            <Sparkles className="w-14 h-14" />
          </div>

          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-100 text-base">
                {editingId ? "✏️ تعديل وتحديث سعر المحصول" : "➕ إضافة محصول جديد لبورصة الأسعار"}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>إلغاء التعديل</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-450">
              {editingId
                ? "تقوم الآن بتعديل التسعيرة المختارة وحفظها مباشرة في قاعدة البيانات."
                : "خاصة بالمؤسسين ومشرفي المنصة لإدراج مؤشرات أسعار المنتجات الفلاحية بالوادي."}
            </p>
          </div>

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-950/80 text-emerald-300 p-4 rounded-2xl text-xs font-semibold leading-relaxed border border-emerald-800/60 shadow-inner flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handlePriceSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-350">الاسم التجاري للمنتوج فلاحياً (بالعربية) *</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: فلفل حلو حركاتي"
                className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-350">الاسم الأجنبي للمنتوج (اختياري)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="مثال: Bell Pepper"
                className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-350">السعر المحدث (دج/كغ) *</label>
                <input
                  type="number"
                  required
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="مثال: 95"
                  className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-350">سعر أمس للمقارنة</label>
                <input
                  type="number"
                  value={yesterdayPrice}
                  onChange={(e) => setYesterdayPrice(e.target.value)}
                  placeholder="مثال: 90"
                  className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">التصنيف</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-[11px] p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="vegetables">خضروات</option>
                  <option value="fruits">فواكه وتمور</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">المؤشر الحالي</label>
                <select
                  value={trend}
                  onChange={(e) => setTrend(e.target.value)}
                  className="w-full text-[11px] p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="stable">مستقر</option>
                  <option value="up">صعود (+)</option>
                  <option value="down">هبوط (-)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">رمز الأيقونة</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full text-[11px] p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="🥔">🥔 بطاطا</option>
                  <option value="🌴">🌴 تمر نخيل</option>
                  <option value="🍅">🍅 طماطم</option>
                  <option value="🌶️">🌶️ فلفل حار</option>
                  <option value="🧅">🧅 بصل </option>
                  <option value="🍉">🍉 بطيخ سوف</option>
                  <option value="🍓">🍓 فراولة</option>
                  <option value="🧄">🧄 ثوم</option>
                  <option value="🥕">🥕 جزر</option>
                  <option value="🍈">🍈 شمام</option>
                  <option value="🥬">🥬 خضار ورقية</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-slate-100 rounded-xl py-3.5 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-4 ${
                editingId
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-950/30"
                  : "bg-emerald-650 hover:bg-emerald-600 shadow-emerald-950/20"
              }`}
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : editingId ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات على السعر الفوري</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>تحديث البورصة وبث السعر الفوري للعموم</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

    </div>
  );
}
