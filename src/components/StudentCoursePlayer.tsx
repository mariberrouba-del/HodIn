import React, { useState, useEffect } from "react";
import { Course, CourseModule, Lesson, CourseProgress, CourseCertificate, UserProfile, UserRole } from "../types";
import {
  getFirebaseCourseProgress,
  saveFirebaseCourseProgress,
  getFirebaseCertificates,
  saveFirebaseCertificate
} from "../lib/firebaseService";
import CertificateModal from "./CertificateModal";
import {
  GraduationCap, Play, CheckCircle2, ChevronRight, ChevronLeft,
  FileText, Download, Award, Clock, ArrowRight, BookOpen, Layers,
  ExternalLink, Sparkles, AlertCircle, RefreshCw, X, ShieldCheck,
  Check, Lock, Unlock, CreditCard
} from "lucide-react";

interface StudentCoursePlayerProps {
  course: Course;
  currentUser: UserProfile;
  onClose: () => void;
}

export default function StudentCoursePlayer({
  course,
  currentUser,
  onClose
}: StudentCoursePlayerProps) {
  // Normalize modules
  const courseModules: CourseModule[] = (course.modules && course.modules.length > 0)
    ? course.modules
    : [
        {
          id: "m_default",
          title: "الوحدة الشاملة للمقرر التدريبي",
          order: 1,
          description: course.description,
          lessons: [
            {
              id: "l_default_1",
              title: "المحاضرة التأسيسية: " + course.title,
              description: course.description,
              videoUrl: course.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
              duration: course.duration || "45 دقيقة",
              order: 1,
              isCompleted: false,
              documents: course.documents || []
            }
          ]
        }
      ];

  // All lessons flat array for linear progression
  const allLessons: { lesson: Lesson; module: CourseModule }[] = [];
  courseModules.forEach((mod) => {
    (mod.lessons || []).forEach((les) => {
      allLessons.push({ lesson: les, module: mod });
    });
  });

  // State
  const [activeLessonId, setActiveLessonId] = useState<string>(
    allLessons[0]?.lesson.id || ""
  );
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [certificate, setCertificate] = useState<CourseCertificate | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Access control for free vs paid lessons
  const isFounderOrExpert = currentUser.role === UserRole.FOUNDER || currentUser.role === UserRole.EXPERT;
  // studentMode allows testing and seeing the authentic locked state even if founder/expert
  const [studentMode, setStudentMode] = useState<boolean>(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    if (!course.isPremium) return true;
    const stored = localStorage.getItem(`course_access_${currentUser.id}_${course.id}`);
    return stored === "unlocked";
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState(false);

  // Load current student progress for this course
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const [prog, certs] = await Promise.all([
          getFirebaseCourseProgress(currentUser.id, course.id),
          getFirebaseCertificates(currentUser.id)
        ]);

        if (prog) {
          setProgress(prog);
          setCompletedLessonIds(prog.completedLessonIds || []);
          if (prog.lastLessonId && allLessons.some((l) => l.lesson.id === prog.lastLessonId)) {
            setActiveLessonId(prog.lastLessonId);
          }
        }

        const existingCert = certs.find((c) => c.courseId === course.id);
        if (existingCert) {
          setCertificate(existingCert);
        }
      } catch (err) {
        console.error("Error loading course progress:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [currentUser.id, course.id]);

  // Find currently active lesson and its module
  const currentItem = allLessons.find((item) => item.lesson.id === activeLessonId) || allLessons[0];
  const activeLesson = currentItem?.lesson;
  const activeModule = currentItem?.module;
  const currentIdx = allLessons.findIndex((item) => item.lesson.id === activeLessonId);

  // Access check: A lesson is accessible if course is free, OR student has unlocked/subscribed, OR lesson is specifically free, OR admin bypass active
  const isLessonFree = !course.isPremium || activeLesson?.isFree === true;
  const isAdminBypass = !studentMode && isFounderOrExpert;
  const hasAccessToActiveLesson = isSubscribed || isLessonFree || isAdminBypass;

  // Calculate completion percentage
  const totalLessonsCount = allLessons.length || 1;
  const completedCount = completedLessonIds.length;
  const progressPercentage = Math.min(100, Math.round((completedCount / totalLessonsCount) * 100));
  const isAllCompleted = completedCount >= totalLessonsCount && totalLessonsCount > 0;

  // Unlock subscription handler
  const handleUnlockSubscription = () => {
    localStorage.setItem(`course_access_${currentUser.id}_${course.id}`, "unlocked");
    setIsSubscribed(true);
    setPaymentSuccessMsg(true);
    setTimeout(() => {
      setShowPaymentModal(false);
      setPaymentSuccessMsg(false);
    }, 1600);
  };

  // Reset subscription lock for testing
  const handleResetLockForTest = () => {
    localStorage.removeItem(`course_access_${currentUser.id}_${course.id}`);
    setIsSubscribed(false);
  };

  // Toggle Lesson Completion
  const handleToggleCompleteLesson = async (lessonId: string) => {
    try {
      setIsSaving(true);
      const isAlreadyCompleted = completedLessonIds.includes(lessonId);
      const updatedCompleted = isAlreadyCompleted
        ? completedLessonIds.filter((id) => id !== lessonId)
        : [...completedLessonIds, lessonId];

      setCompletedLessonIds(updatedCompleted);

      const newPercentage = Math.min(
        100,
        Math.round((updatedCompleted.length / totalLessonsCount) * 100)
      );
      const isCourseFinished = updatedCompleted.length >= totalLessonsCount && totalLessonsCount > 0;

      const newProgress: CourseProgress = {
        id: `${currentUser.id}_${course.id}`,
        userId: currentUser.id,
        courseId: course.id,
        completedLessonIds: updatedCompleted,
        lastLessonId: lessonId,
        lastLessonTitle: activeLesson?.title,
        lastModuleId: activeModule?.id,
        progressPercentage: newPercentage,
        isCompleted: isCourseFinished,
        completedAt: isCourseFinished ? (progress?.completedAt || new Date().toISOString()) : undefined,
        startedAt: progress?.startedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setProgress(newProgress);
      await saveFirebaseCourseProgress(newProgress);

      // If course is newly finished and has no certificate, generate certificate
      if (isCourseFinished && !certificate) {
        const newCert: CourseCertificate = {
          id: `cert_${currentUser.id}_${course.id}_${Date.now().toString(36)}`,
          certificateNumber: `HOD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: currentUser.id,
          userName: currentUser.name || "طالب منصة هودنت",
          courseId: course.id,
          courseTitle: course.title,
          institution: course.institution || "جامعة الشهيد حمه لخضر - الوادي",
          instructor: course.instructor,
          issuedAt: new Date().toISOString(),
          grade: "ممتاز (Excellent)"
        };

        setCertificate(newCert);
        await saveFirebaseCertificate(newCert);
        setShowCertificateModal(true);
      }
    } catch (err) {
      console.error("Error saving progress:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Navigate to Next / Previous Lesson
  const handleNextLesson = () => {
    if (currentIdx < allLessons.length - 1) {
      setActiveLessonId(allLessons[currentIdx + 1].lesson.id);
    }
  };

  const handlePrevLesson = () => {
    if (currentIdx > 0) {
      setActiveLessonId(allLessons[currentIdx - 1].lesson.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-in fade-in duration-200 overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="الرجوع إلى مساحة الطالب"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {course.level === "beginner" ? "مستوى مبتدئ" : course.level === "advanced" ? "مستوى متقدم" : "مستوى متوسط"}
              </span>
              {course.isPremium ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>مقرر مدفوع ({course.price || "3500 دج"})</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  مقرر مجاني بالكامل
                </span>
              )}
              <span className="text-xs text-slate-400 font-semibold">{course.institution || "جامعة الوادي"}</span>
            </div>
            <h1 className="text-sm md:text-base font-black text-white line-clamp-1">{course.title}</h1>
          </div>
        </div>

        {/* Progress & Certificate Buttons */}
        <div className="flex items-center gap-3">
          {isFounderOrExpert && (
            <button
              onClick={() => setStudentMode(!studentMode)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                studentMode
                  ? "bg-amber-950/70 text-amber-300 border-amber-800/60"
                  : "bg-slate-850 text-slate-300 border-slate-700"
              }`}
              title="التبديل بين تجربة قفل الطالب وتجاوز الإدارة"
            >
              {studentMode ? "👁️ تجربة الطالب (قفل نشط)" : "🔓 تجاوز الإدارة"}
            </button>
          )}

          {course.isPremium && (
            isSubscribed ? (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-xs flex items-center gap-1">
                  <Unlock className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">الاشتراك مفعل ✓</span>
                </span>
                <button
                  onClick={handleResetLockForTest}
                  title="إعادة قفل المقرر لتجربة تجربة الطالب غير المشترك"
                  className="text-[10px] text-slate-400 hover:text-amber-400 underline cursor-pointer"
                >
                  قفل للتجربة
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">فتح الدروس ({course.price || "3500 دج"})</span>
                <span className="sm:hidden">اشتراك</span>
              </button>
            )
          )}

          {/* Progress Indicator */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400">نسبة الإنجاز:</span>
              <span className={progressPercentage === 100 ? "text-amber-400" : "text-emerald-400 font-mono"}>
                {progressPercentage}%
              </span>
            </div>
            <div className="w-36 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progressPercentage === 100 ? "bg-gradient-to-r from-amber-400 to-emerald-400" : "bg-emerald-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Certificate Button */}
          {certificate && (
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 transition"
            >
              <Award className="w-4 h-4" />
              <span className="hidden md:inline">عرض الشهادة الأكاديمية</span>
              <span className="md:hidden">الشهادة</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area (2-column layout: Player + Curriculum Sidebar) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Main Column: Video & Lesson View */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-6">
          {/* 100% Completion Celebration Banner */}
          {isAllCompleted && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-emerald-950/40 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3 text-right">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300">تهانينا! لقد أكملت 100% من المساق التدريبي</h3>
                  <p className="text-xs text-slate-300">
                    تم إصدار شهادة إتمام المساق الأكاديمي الخاصة بك باسم: {currentUser.name}
                  </p>
                </div>
              </div>

              {certificate && (
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Award className="w-4 h-4" />
                  <span>معاينة وطباعة الشهادة</span>
                </button>
              )}
            </div>
          )}

          {/* Lesson Video Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="relative aspect-video w-full bg-slate-950">
              {hasAccessToActiveLesson ? (
                activeLesson?.videoUrl ? (
                  <iframe
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6 space-y-3">
                    <Play className="w-16 h-16 opacity-30 text-emerald-400" />
                    <p className="text-sm text-slate-400 font-medium">محتوى نصي وتطبيقي للدرس بدون فيديو مباشر</p>
                  </div>
                )
              ) : (
                /* LOCKED PAYWALL OVERLAY FOR PREMIUM LESSONS */
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="max-w-md space-y-1.5">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 inline-block">
                      درس مدفوع (خاص بالمشتركين)
                    </span>
                    <h3 className="text-lg font-black text-white">هذا الدرس متاح حصرياً لأصحاب الاشتراك الكامل</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      يمكنك معاينة الدروس المجانية المتاحة، أو فتح كافة دروس الدورة والمرفقات الأكاديمية وشهادة التخرج بنقرة واحدة.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>الاشتراك وتفعيل الوصول ({course.price || "3500 دج"})</span>
                    </button>
                    {allLessons.find((l) => l.lesson.isFree || !course.isPremium) && (
                      <button
                        onClick={() => {
                          const firstFree = allLessons.find((l) => l.lesson.isFree || !course.isPremium);
                          if (firstFree) setActiveLessonId(firstFree.lesson.id);
                        }}
                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        الانتقال إلى درس مجاني
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Info Bar */}
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-bold">
                      {activeModule?.title || "الوحدة التدريبية"}
                    </span>
                    {activeLesson?.isFree ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        محتوى مجاني
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>محتوى مدفوع</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-white">
                    {activeLesson?.title || "عنوان الدرس"}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mark as Completed Button */}
                  <button
                    onClick={() => activeLesson && handleToggleCompleteLesson(activeLesson.id)}
                    disabled={isSaving || !hasAccessToActiveLesson}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition cursor-pointer ${
                      !hasAccessToActiveLesson
                        ? "bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed"
                        : activeLesson && completedLessonIds.includes(activeLesson.id)
                        ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-slate-700"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {activeLesson && completedLessonIds.includes(activeLesson.id)
                        ? "✓ تم إنجاز هذا الدرس"
                        : "وضع علامة كمنجز"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Lesson Description & Academic Body */}
              <div className="space-y-3 text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                {hasAccessToActiveLesson ? (
                  activeLesson?.description ? (
                    <p className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
                      {activeLesson.description}
                    </p>
                  ) : (
                    <p className="text-slate-500 italic">تابع محتوى الفيديو التوضيحي لإتمام متطلبات هذه المحاضرة.</p>
                  )
                ) : (
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-850 text-center space-y-2">
                    <Lock className="w-6 h-6 text-amber-400 mx-auto" />
                    <h4 className="font-bold text-white text-sm">المحتوى الأكاديمي والمذكرات المرفقة مقفلة</h4>
                    <p className="text-xs text-slate-400">
                      اشترك في المقرر التدريبي للوصول الكامل إلى الشروحات العلمية والتمارين والمراجع الميدانية.
                    </p>
                  </div>
                )}
              </div>

              {/* Lesson Attachments & PDF Resources */}
              {hasAccessToActiveLesson && activeLesson?.documents && activeLesson.documents.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span>كراسات ومذكرات هذه المحاضرة (PDF):</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeLesson.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-200 truncate">{doc.title}</span>
                        <a
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{doc.size || "تحميل"}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Controls (Prev / Next) */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={handlePrevLesson}
                  disabled={currentIdx <= 0}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>الدرس السابق</span>
                </button>

                <span className="text-xs text-slate-400 font-mono">
                  {currentIdx + 1} / {allLessons.length}
                </span>

                <button
                  onClick={handleNextLesson}
                  disabled={currentIdx >= allLessons.length - 1}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition"
                >
                  <span>الدرس التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Curriculum Navigation Drawer */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-r border-slate-800 bg-slate-900/60 flex flex-col h-auto lg:h-full overflow-y-auto">
          <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>منهج المقرر وتقسيم الدروس</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                {completedCount}/{totalLessonsCount} مكتمل
              </span>
            </div>

            {/* Free vs Paid Stats */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-2 text-center">
                <span className="text-[10px] text-emerald-400 font-bold block">دروس مجانية</span>
                <span className="text-sm font-black text-emerald-300 font-mono">
                  {allLessons.filter((l) => l.lesson.isFree || !course.isPremium).length}
                </span>
              </div>
              <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-2 text-center">
                <span className="text-[10px] text-amber-400 font-bold block">دروس مدفوعة</span>
                <span className="text-sm font-black text-amber-300 font-mono">
                  {allLessons.filter((l) => course.isPremium && !l.lesson.isFree).length}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 space-y-4 flex-1">
            {courseModules.map((module, mIdx) => (
              <div key={module.id} className="space-y-1.5">
                <div className="px-2 py-1 flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="text-emerald-400 text-[11px]">الوحدة {mIdx + 1}:</span>
                  <span className="text-slate-200 truncate flex-1 mr-2">{module.title}</span>
                </div>

                <div className="space-y-1">
                  {(module.lessons || []).map((lesson, lIdx) => {
                    const isActive = lesson.id === activeLessonId;
                    const isDone = completedLessonIds.includes(lesson.id);
                    const isLessonFreeDirect = !course.isPremium || lesson.isFree === true;
                    const isLocked = !isSubscribed && !isLessonFreeDirect && (!isAdminBypass);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLessonId(lesson.id)}
                        className={`w-full text-right p-3 rounded-2xl text-xs transition cursor-pointer flex items-center justify-between gap-2.5 ${
                          isActive
                            ? "bg-emerald-500/20 text-white border border-emerald-500/40 shadow-sm"
                            : "bg-slate-950/60 hover:bg-slate-850 text-slate-300 border border-slate-850"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isDone
                                ? "bg-emerald-500 text-slate-950"
                                : isActive
                                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400"
                                : isLocked
                                ? "bg-slate-850 text-slate-500"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {isDone ? "✓" : lIdx + 1}
                          </span>
                          <span className={`truncate font-semibold ${isActive ? "text-emerald-300" : ""}`}>
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isLessonFreeDirect ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                              مجاني
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                              {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                              <span>مدفوع</span>
                            </span>
                          )}

                          {lesson.duration && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {lesson.duration}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Instructor Card at bottom of curriculum */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 m-3 rounded-2xl text-xs space-y-1">
            <span className="text-[10px] text-slate-400 block">المشرف على المنهج:</span>
            <strong className="text-emerald-400 font-bold block">{course.instructor}</strong>
            <p className="text-[11px] text-slate-400">{course.instructorRole || "مؤطر فلاحي معتمد"}</p>
          </div>
        </div>
      </div>

      {/* Payment / Unlock Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">الاشتراك في المساق الأكاديمي</h3>
              <p className="text-xs text-slate-400">
                افتح جميع الدروس المدفوعة والمراجع العلمية بصيغة PDF وشهادة التخرج المعتمدة.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">المقرر:</span>
                <span className="text-white font-bold truncate max-w-[200px]">{course.title}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">المؤطر العلمي:</span>
                <span className="text-emerald-400 font-bold">{course.instructor}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-850 pt-2 font-bold">
                <span className="text-slate-300">رسوم الاشتراك الكامل:</span>
                <span className="text-amber-400 font-mono text-sm">{course.price || "3500 دج"}</span>
              </div>
            </div>

            {paymentSuccessMsg ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-300">تم تفعيل الاشتراك بنجاح!</h4>
                <p className="text-[11px] text-slate-300">تم فتح كافة الدروس والمرفقات الأكاديمية لحسابك.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleUnlockSubscription}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Unlock className="w-4 h-4" />
                  <span>تأكيد الاشتراك وفتح المحتوى المدفوع فورياً</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center">
                  دعم الدفع عبر بريدي موب (BaridiMob) / البطاقة الذهبية / الحساب الميداني
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && certificate && (
        <CertificateModal
          certificate={certificate}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
}
