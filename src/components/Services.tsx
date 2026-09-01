import React, { useState } from "react";
import { ServiceProvider } from "../types";
import { Hammer, HeartHandshake, MapPin, Phone, Star, CheckCircle, Clock, Plus, UserPlus, FileQuestion, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ServicesProps {
  providers: ServiceProvider[];
  pendingRequests: any[];
  onAddRequest: (formData: any) => Promise<boolean>;
  onDeleteRequest?: (requestId: string) => Promise<boolean>;
  userRole: string;
}

export default function Services({ providers, pendingRequests, onAddRequest, onDeleteRequest, userRole }: ServicesProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  
  // Custom request form states
  const [farmerName, setFarmerName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("الوادي");
  const [serviceNeeded, setServiceNeeded] = useState("technician");
  const [description, setDescription] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const specialties = [
    { value: "all", label: "كل التخصصات" },
    { value: "technician", label: "فني صيانة معدات وأعطال" },
    { value: "irrigation", label: "تقني سقي ورش محوري" },
    { value: "consultant", label: "مهندس مستشار زراعي" },
    { value: "laborer", label: "عمال موسميين ومجمعين لقلع الدرنات" }
  ];

  const municipalities = ["الوادي", "حاسي خليفة", "قمار", "الرقيبة", "البياضة", "الدبيلة", "أورماس", "تغزوت"];

  const filteredProviders = selectedSpecialty === "all"
    ? providers
    : providers.filter(p => p.specialty === selectedSpecialty);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName || !phone || !description) {
      alert("الرجاء ملء كافة التفاصيل لتقديم طلب الوساطة.");
      return;
    }

    const payload = {
      farmerName,
      phone,
      location,
      serviceNeeded,
      description
    };

    const success = await onAddRequest(payload);
    if (success) {
      setSuccessMsg("تم نشر طلبك بنجاح! سيتم إخطار أقرب تقني أو مستشار في محيطك فوراً.");
      setFarmerName("");
      setPhone("");
      setDescription("");
      setTimeout(() => setSuccessMsg(""), 7500);
    }
  };

  const getSpecialtyLabel = (val: string) => {
    const found = specialties.find(s => s.value === val);
    return found ? found.label : val;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" dir="rtl">
      
      {/* Left Column: Form & Live requested Board (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Request posting Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-950 text-emerald-400 border border-emerald-900/50 rounded-xl flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm">طلب وساطة زراعية معجلة</h3>
              <p className="text-[11px] text-slate-400 font-light">انشر ما تحتاجه في حقل السقي ليتواصل عمال ومهندسو سوف معك.</p>
            </div>
          </div>

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-950/80 text-emerald-300 p-4 rounded-xl text-xs font-bold leading-relaxed border border-emerald-800/60"
            >
              {successMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-350">اسم الطالب / الفلاح المستثمر *</label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="مثال: بلقاسم بن مبروك السوفي"
                className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-655 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-350">تخصص الخدمة العمالية المطلوبة *</label>
              <select
                value={serviceNeeded}
                onChange={(e) => setServiceNeeded(e.target.value)}
                className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none"
              >
                <option value="technician">فني صيانة معدات وأعطال</option>
                <option value="irrigation">تقني سقي ورش محوري</option>
                <option value="consultant">مهندس مستشار زراعي</option>
                <option value="laborer">عمال موسميين ومجمعين لقلع الدرنات</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-350">جوال الاتصال والربط *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 0655123456"
                  className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-655 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left dir-ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-350">الموقع وبلدية التدخل</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none"
                >
                  {municipalities.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-350">شرح مختصر للأعمال أو الصيانة المطلوبة *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: نطلب عمال باليومية لجني محصول بطاطا سبونتا في حقل بهكتارين بحاسي خليفة، أو ضبط ركائز طاقة شمسية للآبار..."
                className="w-full text-xs p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-655 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-650 hover:bg-emerald-600 text-slate-100 rounded-xl py-3.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-950/20"
            >
              <Plus className="w-4 h-4" />
              <span>نشر الطلب وحجز الوساطة السريعة</span>
            </button>
          </form>
        </motion.div>

        {/* Live Board of Farmer Pending Service Requests */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-5 border border-slate-800/80 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>طلبات الفلاحين النشطة المعلقة بولاية الوادي ({pendingRequests.length})</span>
            </h4>
            <span className="bg-amber-950/70 text-amber-400 border border-amber-900/60 text-[9px] px-2.5 py-0.5 rounded-md font-bold">حالة حية</span>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-3.5 bg-slate-950/50 rounded-2xl border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">{req.farmerName}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/60 font-bold px-2 py-0.5 rounded-md">
                    {getSpecialtyLabel(req.serviceNeeded)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{req.description}</p>
                
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900/70">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>البلدية: {req.location}</span>
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => alert(`تم تأكيد اهتمامك بطلب ${req.farmerName}. هاتف الاتصال المباشر للتنسيق: ${req.phone}`)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold text-xs cursor-pointer"
                    >
                      قبول والاتصال التنسيقي 📞
                    </button>

                    {(userRole === "ADMIN" || userRole === "FARMER") && onDeleteRequest && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`هل أنت متأكد من رغبتك في إلغاء وحذف هذا الطلب الفلاحي؟`)) {
                            onDeleteRequest(req.id);
                          }
                        }}
                        className="text-rose-450 hover:text-rose-300 transition cursor-pointer"
                        title="إلغاء وحذف الطلب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {pendingRequests.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-xs space-y-2 flex flex-col items-center">
                <FileQuestion className="w-8 h-8 text-slate-600" />
                <p>لم يتم تسجيل طلبات صيانة وخدمات عمالية معلقة حالياً في السوف.</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Right Column: Expert Directory list (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Specialty Filter bar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-5 border border-slate-800/80 shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-200 text-sm">دليل الحرفيين والخبراء والمهندسين بالمنصة</h3>
            <span className="text-[10px] text-slate-450 font-bold">اتصال مباشر فوري</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {specialties.map((spec) => (
              <button
                key={spec.value}
                onClick={() => setSelectedSpecialty(spec.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSpecialty === spec.value
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60 shadow-inner"
                    : "bg-slate-950/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                {spec.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProviders.map((prov) => (
            <div
              key={prov.id}
              className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-5 border border-slate-850/80 shadow-xl flex flex-col justify-between hover:border-emerald-500/25 duration-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-200 text-sm flex items-center gap-1.5">
                      <span>{prov.name}</span>
                      {prov.isVerified && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-950" title="خبير معتمد مدقق" />
                      )}
                    </h4>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-900/60 px-2 py-0.5 rounded font-bold inline-block mt-1">
                      {getSpecialtyLabel(prov.specialty)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-950/70 text-amber-400 border border-amber-900/60 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                    <span>{prov.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-light">{prov.description}</p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-450">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-550" />
                  <span>البلدية: {prov.location}</span>
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px] font-bold">الخبرة: {prov.experience} سنة</span>
                  <a
                    href={`tel:${prov.phone}`}
                    onClick={(e) => {
                      alert(`اتصال ومخابرة مباشرة بالخبير المعتمد ${prov.name} عبر الرقم ${prov.phone}`);
                    }}
                    className="bg-emerald-650 hover:bg-emerald-600 text-slate-100 rounded-xl py-1.5 px-3.5 font-bold transition-all text-xs flex items-center gap-1"
                  >
                    <span>اتصل الآن</span>
                  </a>
                </div>
              </div>

            </div>
          ))}

          {filteredProviders.length === 0 && (
            <div className="col-span-full p-12 bg-slate-900/10 rounded-3xl text-center border border-dashed border-slate-800">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
              <p className="text-slate-400 text-xs">لا يوجد عمال أو خبراء مسجلون في هذا التصنيف حالياً ببنك معلومات الوادي.</p>
            </div>
          )}
        </div>

        {/* Join as expert help note */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-radial-[at_right] from-emerald-950/45 to-slate-950 text-slate-200 p-5 rounded-3xl border border-emerald-900/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="space-y-1 text-center md:text-right">
            <h4 className="font-bold text-xs flex items-center gap-1.5 justify-center md:justify-start text-emerald-400">
              <UserPlus className="w-4 h-4" />
              <span>هل أنت فني أو مهندس بالوادي؟ سجل تواجدك الآن!</span>
            </h4>
            <p className="text-[11px] text-slate-400 font-light">انضم إلى قائمة هودنت الرسمية لتقديم خدماتك وتلقي طلبات الحفر والسقي اليومية.</p>
          </div>
          <button
            onClick={() => alert("للتسجيل كخبير فني باللوحة، يرجى ملء طلبك وتضمين تخصصك وتجربتك عبر البريد: hodintplatform@gmail.com أو الواتساب.")}
            className="bg-emerald-650 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shrink-0 transition-all cursor-pointer shadow-lg"
          >
            تقديم طلب انضمام كخبير
          </button>
        </motion.div>

      </div>

    </div>
  );
}
