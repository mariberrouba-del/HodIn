import React, { useState } from "react";
import { WeatherAlert, UserProfile } from "../types";
import { 
  MessageSquare, AlertTriangle, Send, Calendar, Bot, Loader2, 
  RefreshCw, Layers, Sparkles, BookOpen, ChevronLeft, HelpCircle, 
  ShieldAlert, Sun, Wind, ThermometerSnowflake, Plus, Trash2, Check, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { isUserFounder } from "../lib/firebaseService";

interface SmartAssistanceProps {
  weatherAlerts: WeatherAlert[];
  currentUser?: UserProfile;
  onAddAlert?: (alert: any) => Promise<boolean>;
  onDeleteAlert?: (id: string) => Promise<boolean>;
}

export default function SmartAssistance({ weatherAlerts, currentUser, onAddAlert, onDeleteAlert }: SmartAssistanceProps) {
  // Weather Alert broadcasting modal / form state for founders
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDesc, setAlertDesc] = useState("");
  const [alertType, setAlertType] = useState<"heatwave" | "wind" | "frost" | "humidity">("heatwave");
  const [alertSeverity, setAlertSeverity] = useState<"warning" | "danger" | "info">("danger");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");

  const canManageWeather = isUserFounder(currentUser);

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertDesc.trim() || !onAddAlert) return;
    setIsBroadcasting(true);
    try {
      const payload = {
        id: "w_" + Date.now().toString(36),
        type: alertType,
        titleAr: alertTitle.trim(),
        titleEn: alertType.toUpperCase(),
        severity: alertSeverity,
        descriptionAr: alertDesc.trim(),
        descriptionEn: "Urgent climate and agricultural advisory for El Oued region.",
        date: "الآن"
      };
      const ok = await onAddAlert(payload);
      if (ok) {
        setBroadcastMsg("تم بث التنبيه المناخي بنجاح لجميع مزارعي وادي سوف!");
        setAlertTitle("");
        setAlertDesc("");
        setShowAddAlert(false);
        setTimeout(() => setBroadcastMsg(""), 5000);
      }
    } finally {
      setIsBroadcasting(false);
    }
  };
  // Crop Rotation state
  const [selectedPrevCrop, setSelectedPrevCrop] = useState<string>("none");
  
  // Gemini AI Chat states
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "مرحباً بك يا فلاحنا الكريم أو طالبنا الرفيع! أنا مستشار هودنت الذكي، المطوّر برؤية المهندسين المؤسسين (م. ماريه بروبة وم. إكرام محده) وتحت الإشراف العلمي الأكاديمي لـ أ.د. سمير مرداسي (جامعة الوادي). يسعدني إرشادك علمياً بلغة فلاحية سهلة حول حماية النخيل وحقول البطاطا بالوادي، جدولة السقي المحوري، مكافحة وباء بوفروة وسوسة النخيل، والتعامل مع ملوحة التربة الرملية. كيف يمكنني إفادتك اليوم؟"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Pre-configured questions
  const quickQuestions = [
    { text: "من هم مؤسسو منصة هودنت والمشرف العلمي عليها؟", val: "من هم مؤسسو منصة هودنت وما هي تخصصاتهم الهندسية ومن هو المشرف العلمي والأكاديمي عليها؟" },
    { text: "كيف يمكنني مكافحة وباء بوفروة في نخيل دقلة نور؟", val: "أحتاج إلى دليل عملي عاجل ومبسط لمكافحة آفة غبار بوفروة (العنكبوت) في عراجين تمور دقلة نور بولاية الوادي وما هي المواد الكيميائية أو الطرق الحيوية لغسل وسقاية التمر؟" },
    { text: "ما هي خطوات زراعة بطاطا سبونتا في التربة الرملية؟", val: "أريد معرفة خطوات الدورة الخريفية المثلى لزراعة بطاطا صنف سبونتا السوفية في التربة الرملية والري المحوري بالرش ونسب التسميد العضوي؟" },
    { text: "كيف أواجه ملوحة الآبار ومشاكل طاعون الرياح الحارة؟", val: "كيف نبرمج الري خلال هبوب رياح الشهيلي الجنوبية القوية الحارة في الوادي، وكيف نتعامل مع ارتفاع ملوحة المياه الجوفية في السقي بالتنقيط؟" }
  ];

  // Sowing & Harvesting Calendar Data
  const cropCalendar = [
    { name: "بطاطا سوف (الدورة الخريفية)", plantDate: "أوت - سبتمبر", reapDate: "ديسمبر - جانفي", tips: "تطهير البذور من العفن الجاف ضروري جداً لمواجهة رطوبة الخريف." },
    { name: "بطاطا سوف (الدورة الشتوية/الربيعية)", plantDate: "ديسمبر - جانفي", reapDate: "أفريل - ماي", tips: "مراقبة مرض اللفحة المتأخرة خلال ضباب الصباح السوفي." },
    { name: "تمر دقلة نور (نخيل)", plantDate: "تلقيح: مارس - أفريل", reapDate: "جني: أكتوبر - نوفمبر", tips: "تدلية العراجين وحمايتها من أضرار الرياح الخريفية." },
    { name: "الطماطم الحقلية", plantDate: "مارس", reapDate: "جوان - جويلية", tips: "استخدام الشاش الواقي لتفادي لسعات الشمس القوية في الصيف." },
    { name: "الفول السوداني وسوف", plantDate: "أفريل - ماي", reapDate: "سبتمبر - أكتوبر", tips: "محصول ممتاز يعيد إثراء النيتروجين في التربة الرملية الفقيرة." }
  ];

  // Rotation recommendation engine solver
  const handleRotationSolve = () => {
    switch (selectedPrevCrop) {
      case "potato":
        return {
          nextCrops: ["الفول السوداني الجزائري", "برسيم سوف العضوي (الفصة)", "الفول واللوبياء الصحراوية"],
          rating: "درجة أمان ممتازة لرمالكم",
          explanation: "زراعة البطاطا تستهلك كميات هائلة من سلفات البوتاسيوم والآزوت. يمنع تكرار غرس البطاطا مباشرة لتجنب تضاعف ديدان نيماتودا التربة. زراعة الفول السوداني أو البرسيم تعيد تثبيت النيتروجين الجوي طبيعياً وتعقم رمال الحقل."
        };
      case "tomato":
        return {
          nextCrops: ["البصل أو الثوم السوفي", "الشعير أو الذرة العلفية", "بستنة النخيل البينية"],
          rating: "تكامل حيوي متميز ضد الفطريات",
          explanation: "تنتمي الطماطم إلى الفصيلة الباذنجانية وتجلب أمراض اللفحات الفطرية. زراعة البصل أو الثوم بعدها تقضي على مسببات الأمراض الفطرية بفضل مواد الكبريت الطبيعية المفرزة في جذورها."
        };
      case "alfalfa":
        return {
          nextCrops: ["البطاطا الغزيرة", "البطيخ الأحمر أو الشمام", "الجزر واللفت السوفي"],
          rating: "أعلى خصوبة فوسفورية وعضوية ميسرة",
          explanation: "البرسيم (الفصة السوفية) هو أفضل مصلح حيوي على الإطلاق لتربة الوادي الرملية. يترك رمالكم ملأى بالدبال العضوي والنيتروجين، مما يضمن الحصول على أعلى قنطار للهكتار عند زرع البطاطا في الدورة الموالية."
        };
      case "fallow":
        return {
          nextCrops: ["أي محصول بالدورة الخريفية اللاحقة"],
          rating: "تعقيم طبيعي ممتاز",
          explanation: "ترك الأرض الرملية مكشوفة لأشعة الشمس الحارقة صيفاً (العقيم الشمسي) يقضي طبيعياً على 90% من ممرضات الفطريات والنيماتودا بوادي سوف."
        };
      default:
        return null;
    }
  };

  const rotationResult = handleRotationSolve();

  // Send message to Gemini server API
  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    setInputValue("");
    // Add user message to display logs
    setChatMessages((prev) => [...prev, { sender: "user", text }]);
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();

      if (data.success) {
        setChatMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: "bot", text: `⚠️ عذراً: ${data.error || "حدث خطأ في معالجة طلبك."}` }
        ]);
      }
    } catch (error: any) {
      console.error(error);
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ فشل الاتصال بالملقم الذكي للمنصة. يرجى التحقق من اتصال الإنترنت أو إعداد مفاتيح Gemini." }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" dir="rtl">
      
      {/* Left Column: Local weather alerts, rotation, crop calendar (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Weather Alerts Display */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>تنبيهات المناخ وتحذيرات زوابع الرمل بالجنوب</span>
            </h3>
            
            <div className="flex items-center gap-2">
              {canManageWeather && (
                <button
                  onClick={() => setShowAddAlert(!showAddAlert)}
                  className="text-xs bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/60 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddAlert ? "إلغاء النموذج" : "بث تنبيه مناخي"}</span>
                </button>
              )}
              <span className="text-[10px] bg-amber-950/85 text-amber-400 border border-amber-800/60 font-bold px-2.5 py-1 rounded-md shrink-0">
                الرصد الفوري
              </span>
            </div>
          </div>

          {broadcastMsg && (
            <div className="bg-emerald-950/80 text-emerald-300 p-3.5 rounded-2xl text-xs font-semibold border border-emerald-800/60 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{broadcastMsg}</span>
            </div>
          )}

          {/* Quick Broadcast Form for Founders */}
          {showAddAlert && canManageWeather && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleBroadcastAlert}
              className="bg-slate-950/70 p-4.5 rounded-2xl border border-emerald-500/30 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sun className="w-4 h-4" />
                  <span>إرسال وتعميم تنبيه زراعي ومناخي جديد</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddAlert(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-350">عنوان التنبيه المناخي *</label>
                <input
                  type="text"
                  required
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="مثال: موجة حر شديدة وتدفق رياح جنوبية حارة"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-350">نوع الظاهرة</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="heatwave">موجة حر وجفاف (حرارة عالية)</option>
                    <option value="wind">رياح رملية وشهيلي</option>
                    <option value="frost">صقيع وبرودة ليلية مفاجئة</option>
                    <option value="humidity">رطوبة وضباب صباحي كثيف</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-350">درجة الخطورة</label>
                  <select
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="danger">🔴 خطر داهم (أحمر)</option>
                    <option value="warning">🟡 تحذير استباقي (أصفر)</option>
                    <option value="info">🔵 إشعار إرشادي (أزرق)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-350">تفاصيل وتوصيات الوقاية للفلاحين *</label>
                <textarea
                  required
                  rows={2}
                  value={alertDesc}
                  onChange={(e) => setAlertDesc(e.target.value)}
                  placeholder="اكتب التوجيهات الدقيقة بخصوص الري والتسميد والوقاية..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {isBroadcasting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>بث التنبيه وحفظه فوراً في Firestore</span>
              </button>
            </motion.form>
          )}

          <div className="space-y-4">
            {weatherAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4.5 rounded-2xl border flex flex-col md:flex-row gap-4 items-start relative overflow-hidden transition-all duration-300 ${
                  alert.severity === "danger" 
                    ? "bg-rose-950/30 border-rose-900/40 text-rose-100" 
                    : "bg-amber-950/30 border-amber-900/40 text-amber-100"
                }`}
              >
                {/* Indicator icon background tint */}
                <div className="absolute left-3 top-3 opacity-15">
                  {alert.severity === "danger" ? <Wind className="w-16 h-16" /> : <Sun className="w-16 h-16" />}
                </div>

                <div className="space-y-2 flex-1 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full animate-ping shrink-0 ${alert.severity === "danger" ? "bg-rose-500" : "bg-amber-400"}`} />
                      <h4 className="font-bold text-sm tracking-wide">{alert.titleAr}</h4>
                    </div>
                    {canManageWeather && onDeleteAlert && (
                      <button
                        onClick={() => {
                          if (confirm(`هل تريد حذف هذا التنبيه المناخي "${alert.titleAr}"؟`)) {
                            onDeleteAlert(alert.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-400 hover:text-rose-200 border border-rose-900/40 transition cursor-pointer"
                        title="حذف التنبيه"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">{alert.descriptionAr}</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">
                    تاريخ الفعالية والوقاية: {alert.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Crop Rotation Solver */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm">مستشار الدورة والموازنة البيولوجية للتربة الرملية</h3>
              <p className="text-[11px] text-slate-400 mt-1">اختر المحصول الذي زرعته في الموسم الماضي للتحقق من المخطط الكيميائي والوقائي المتوازن لتربتكم.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            <div className="space-y-2 bg-slate-950/50 p-4.5 rounded-2xl border border-slate-850 flex flex-col justify-center">
              <label className="text-xs font-bold text-slate-350">ما هو آخر محصول زرعته بقطعة الأرض؟</label>
              <select
                value={selectedPrevCrop}
                onChange={(e) => setSelectedPrevCrop(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold mt-1.5 cursor-pointer"
              >
                <option value="none">-- اختر المحصول السابق لمعاينته --</option>
                <option value="potato">البطاطا (خريفية أو شتوية سوداء)</option>
                <option value="tomato">الطماطم والفصيلة الباذنجانية (بندورة)</option>
                <option value="alfalfa">الفصة / جلبان علفي (بقوليات مصلحة)</option>
                <option value="fallow">ترك الأرض بواراً لاستقطاب حرارة الصيف</option>
              </select>
            </div>

            {/* rotation results details */}
            <div className="bg-slate-950/30 rounded-2xl p-4.5 border border-slate-900 flex flex-col justify-center min-h-[140px]">
              {rotationResult ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-emerald-300">التوصية البيئية:</span>
                    <span className="bg-emerald-950 text-emerald-300 text-[9px] border border-emerald-900 px-2 py-0.5 rounded-md font-bold">{rotationResult.rating}</span>
                  </div>
                  <p className="font-bold text-slate-200 leading-snug">
                    ننصحك بغرس أحد المزروعات التالية: <span className="text-emerald-400 font-extrabold">{rotationResult.nextCrops.join(" ، ")}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-light leading-relaxed">{rotationResult.explanation}</p>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Sparkles className="w-7 h-7 text-emerald-500/20" />
                  <p className="font-light">الرجاء تحديد زراعتكم السابقة لاستخراج التدرج العضوي السليم من محركات هودنت.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* El Oued Agricultural Crop Calendar */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4"
        >
          <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>رزنامة ومواعيد غرس وجني أهم المحاصيل بولاية الوادي</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-950/70 text-slate-350 font-bold border-b border-slate-850">
                  <th className="p-3">اسم النبتة المحصولية</th>
                  <th className="p-3">مواعيد الغرس والزرع</th>
                  <th className="p-3">مواعيد الجني والقلع</th>
                  <th className="p-3">إرشاد ميداني من م. ماريه وم. اكرام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {cropCalendar.map((crop, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/50 transition duration-150">
                    <td className="p-3 font-bold text-slate-200">{crop.name}</td>
                    <td className="p-3 text-emerald-400 font-extrabold">{crop.plantDate}</td>
                    <td className="p-3 text-amber-500 font-extrabold">{crop.reapDate}</td>
                    <td className="p-3 text-slate-400 leading-relaxed font-light text-[11px]">{crop.tips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>

      {/* Right Column: Live Server-Side Gemini Chat Assistant (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl flex flex-col justify-between h-[660px]"
        >
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            {/* AI Advisor Header */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-950 text-white flex items-center justify-center shadow-lg border border-emerald-800/20">
                  <Bot className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-1.5">
                    <span>مستشار هودنت الفلاحي الذكي</span>
                    <span className="bg-emerald-950 text-emerald-400 text-[9px] border border-emerald-900/50 px-2 py-0.5 rounded font-bold">GEMINI AI</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-light mt-0.5">توجيه ذكي وفوري معزز بقدرات الذكاء الاصطناعي</p>
                </div>
              </div>

              <button
                onClick={() => setChatMessages([{
                  sender: "bot",
                  text: "مرحباً بك يا فلاحنا الكريم أو طالبنا الرفيع! أنا مستشار هودنت الذكي المطور تحت إشراف الدكاترة والمهندسة ماريه والمهندسة اكرام. يسعدني إرشادك علمياً بلغة فلاحية سهلة حول حماية النخيل وحقول البطاطا بالوادي، جدولة السقي المحوري، مكافحة وباء بوفروة والديدان السلكية، والتعامل مع ملوحة التربة الرملية. كيف يمكنني إفادتك اليوم؟"
                }])}
                className="text-slate-500 hover:text-slate-300 transition-colors p-2 rounded-xl bg-slate-950 border border-slate-850 cursor-pointer"
                title="إعادة ضبط المحادثة الزراعية"
                type="button"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Box log streams */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2.5 text-xs leading-relaxed max-h-[385px]">
              {chatMessages.map((msg, idx) => {
                const isBot = msg.sender === "bot";
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-extrabold text-[11px] ${
                      isBot ? "bg-emerald-950 text-emerald-300 border border-emerald-900/40" : "bg-slate-800 text-slate-200 border border-slate-700"
                    }`}>
                      {isBot ? "هـ" : "أنت"}
                    </div>

                    <div className={`p-3.5 rounded-2xl max-w-[82%] relative border leading-relaxed ${
                      isBot 
                        ? "bg-slate-950/60 text-slate-200 rounded-tr-none border-slate-900/70" 
                        : "bg-emerald-950/30 text-emerald-100 rounded-tl-none border-emerald-900/50"
                    }`}>
                      <p className="whitespace-pre-line leading-relaxed font-light text-xs">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {isAiLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-900/40">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 px-4 bg-slate-950 rounded-2xl rounded-tr-none border border-slate-900 flex items-center gap-2">
                    <span className="text-[11px] text-emerald-400 font-bold animate-pulse">الدكتور مرداسي والمهندسات يعالجون التوصية الفنية...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick recommendations / preset questions */}
          <div className="space-y-3 pt-3 border-t border-slate-850">
            <h4 className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mr-1 select-none">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>أسئلة فلاحية شائعة بوادي سوف:</span>
            </h4>
            <div className="flex flex-col gap-1.5">
              {quickQuestions.map((qq, idx) => (
                <button
                  key={idx}
                  disabled={isAiLoading}
                  onClick={() => handleSendMessage(qq.val)}
                  className="w-full text-right p-2.5 bg-slate-950/65 rounded-xl hover:bg-emerald-950/20 font-medium text-[11px] text-slate-300 border border-slate-900 hover:border-emerald-900/60 transition-all text-wrap line-clamp-1 truncate cursor-pointer disabled:opacity-50"
                >
                  {qq.text}
                </button>
              ))}
            </div>

            {/* Input message form box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex gap-2 pt-2.5"
            >
              <input
                type="text"
                disabled={isAiLoading}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="اسأل المستشار الذكي عن أي محصول أو آفة فلاحية..."
                className="flex-1 p-3.5 text-xs placeholder:text-slate-650 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-950 text-slate-100 font-medium"
              />
              <button
                type="submit"
                disabled={isAiLoading || !inputValue.trim()}
                className="bg-emerald-650 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white p-3.5 rounded-xl transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 transform rotate-180" />
              </button>
            </form>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
