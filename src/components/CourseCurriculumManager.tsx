import React, { useState } from "react";
import { Course, CourseModule, Lesson, QuizQuestion, UserProfile } from "../types";
import {
  BookOpen, Layers, Plus, Edit2, Trash2, ChevronDown, ChevronUp,
  Video, FileText, Link, HelpCircle, Save, X, ArrowUp, ArrowDown,
  CheckCircle2, AlertTriangle, Sparkles, RefreshCw, Eye, Lock, Unlock
} from "lucide-react";

interface CourseCurriculumManagerProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSaveCourse: (updatedCourse: Course) => Promise<void>;
  currentUser: UserProfile;
}

export default function CourseCurriculumManager({
  course,
  isOpen,
  onClose,
  onSaveCourse,
  currentUser
}: CourseCurriculumManagerProps) {
  const [modules, setModules] = useState<CourseModule[]>(course.modules || []);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(
    course.modules && course.modules.length > 0 ? course.modules[0].id : null
  );

  // Module Modal state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");

  // Lesson Modal state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetModuleIdForLesson, setTargetModuleIdForLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonDuration, setLessonDuration] = useState("20 دقيقة");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonPdfUrl, setLessonPdfUrl] = useState("");
  const [lessonAttachmentName, setLessonAttachmentName] = useState("");
  const [lessonAttachmentSize, setLessonAttachmentSize] = useState("");
  const [lessonIsFree, setLessonIsFree] = useState<boolean>(false);
  const [lessonReferences, setLessonReferences] = useState<string[]>([]);
  const [newRefInput, setNewRefInput] = useState("");

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  // Calculate total lessons
  const totalLessonsCount = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  // ---------------- MODULE ACTIONS ----------------
  const handleOpenAddModule迷 = () => {
    setEditingModule(null);
    setModuleTitle("");
    setModuleDesc("");
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: CourseModule) => {
    setEditingModule(mod);
    setModuleTitle(mod.title);
    setModuleDesc(mod.description || "");
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    if (editingModule) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === editingModule.id
            ? { ...m, title: moduleTitle.trim(), description: moduleDesc.trim() }
            : m
        )
      );
    } else {
      const newMod: CourseModule = {
        id: "mod_" + Date.now().toString(36),
        courseId: course.id,
        title: moduleTitle.trim(),
        description: moduleDesc.trim(),
        order: modules.length + 1,
        lessons: []
      };
      setModules((prev) => [...prev, newMod]);
      if (!activeModuleId) setActiveModuleId(newMod.id);
    }
    setIsModuleModalOpen(false);
  };

  const handleDeleteModule = (moduleId: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذه الوحدة وجميع الدروس التابعة لها؟")) {
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      if (activeModuleId === moduleId) {
        setActiveModuleId(null);
      }
    }
  };

  const handleMoveModule = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= modules.length) return;
    const reordered = [...modules];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;
    // Update order property
    reordered.forEach((m, idx) => {
      m.order = idx + 1;
    });
    setModules(reordered);
  };

  // ---------------- LESSON ACTIONS ----------------
  const handleOpenAddLesson = (moduleId: string) => {
    setTargetModuleIdForLesson(moduleId);
    setEditingLesson(null);
    setLessonTitle("");
    setLessonContent("");
    setLessonDuration("20 دقيقة");
    setLessonVideoUrl(course.videoUrl || "https://www.youtube.com/embed/zH0F6LclisY");
    setLessonPdfUrl("");
    setLessonAttachmentName("");
    setLessonAttachmentSize("");
    setLessonIsFree(!course.isPremium); // default free if course is free, or first lesson
    setLessonReferences([]);
    setNewRefInput("");
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson述 = (moduleId: string, lesson: Lesson) => {
    setTargetModuleIdForLesson(moduleId);
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonContent(lesson.content || "");
    setLessonDuration(lesson.duration || "20 دقيقة");
    setLessonVideoUrl(lesson.videoUrl || "");
    setLessonPdfUrl(lesson.pdfUrl || "");
    setLessonAttachmentName(lesson.attachmentName || "");
    setLessonAttachmentSize(lesson.attachmentSize || "");
    setLessonIsFree(lesson.isFree === true || !course.isPremium);
    setLessonReferences(lesson.references || []);
    setNewRefInput("");
    setIsLessonModalOpen(true);
  };

  const handleAddReference = () => {
    if (!newRefInput.trim()) return;
    setLessonReferences((prev) => [...prev, newRefInput.trim()]);
    setNewRefInput("");
  };

  const handleRemoveReference = (refIdx: number) => {
    setLessonReferences((prev) => prev.filter((_, idx) => idx !== refIdx));
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !targetModuleIdForLesson) return;

    const mod = modules.find((m) => m.id === targetModuleIdForLesson);
    if (!mod) return;

    if (editingLesson) {
      const updatedLesson: Lesson = {
        ...editingLesson,
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        duration: lessonDuration.trim(),
        isFree: lessonIsFree,
        videoUrl: lessonVideoUrl.trim() || undefined,
        pdfUrl: lessonPdfUrl.trim() || undefined,
        attachmentName: lessonAttachmentName.trim() || undefined,
        attachmentSize: lessonAttachmentSize.trim() || undefined,
        references: lessonReferences.length > 0 ? lessonReferences : undefined
      };

      setModules((prev) =>
        prev.map((m) =>
          m.id === targetModuleIdForLesson
            ? {
                ...m,
                lessons: m.lessons.map((l) => (l.id === editingLesson.id ? updatedLesson : l))
              }
            : m
        )
      );
    } else {
      const newLesson: Lesson = {
        id: "l_" + Date.now().toString(36),
        courseId: course.id,
        moduleId: targetModuleIdForLesson,
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        duration: lessonDuration.trim(),
        isFree: lessonIsFree,
        order: (mod.lessons?.length || 0) + 1,
        videoUrl: lessonVideoUrl.trim() || undefined,
        pdfUrl: lessonPdfUrl.trim() || undefined,
        attachmentName: lessonAttachmentName.trim() || undefined,
        attachmentSize: lessonAttachmentSize.trim() || undefined,
        references: lessonReferences.length > 0 ? lessonReferences : undefined
      };

      setModules((prev) =>
        prev.map((m) =>
          m.id === targetModuleIdForLesson
            ? {
                ...m,
                lessons: [...(m.lessons || []), newLesson]
              }
            : m
        )
      );
    }
    setIsLessonModalOpen(false);
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الدرس؟")) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
            : m
        )
      );
    }
  };

  const handleMoveLesson = (moduleId: string, lessonIdx: number, direction: "up" | "down") => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const newIdx进 = direction === "up" ? lessonIdx - 1 : lessonIdx + 1;
    if (newIdx进 < 0 || newIdx进 >= mod.lessons.length) return;

    const lessonsClone = [...mod.lessons];
    const temp = lessonsClone[lessonIdx];
    lessonsClone[lessonIdx] = lessonsClone[newIdx进];
    lessonsClone[newIdx进] = temp;
    lessonsClone.forEach((l, idx) => {
      l.order不易 = idx + 1;
    });

    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, lessons: lessonsClone } : m))
    );
  };

  // ---------------- COMMIT ALL TO COURSE IN FIRESTORE ----------------
  const handleCommitCourseChanges = async () => {
    try {
      setIsSaving(true);
      setFeedbackMsg(null);

      const finalCourse: Course = {
        ...course,
        modules,
        lessonsCount: totalLessonsCount,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.name
      };

      await onSaveCourse(finalCourse);
      setFeedbackMsg({ text: "تم حفظ وحدات ودروس المقرر بنجاح في قاعدة البيانات!", isError: false });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      setFeedbackMsg({ text: "فشل حفظ المنهج: " + (err.message || ""), isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                منهج الدورة والمقرر الأكاديمي
              </span>
              <span className="text-xs text-slate-400 font-bold">•</span>
              <span className="text-xs text-slate-400">{course.instructor}</span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-white leading-snug">
              {course.title}
            </h2>
            <p className="text-xs text-slate-400">
              إدارة الوحدات التعليمية ({modules.length}) ومجموع الدروس ({totalLessonsCount} درس).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCommitCourseChanges}
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>حفظ المنهج التدريبي</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              feedbackMsg.isError
                ? "bg-rose-950/50 border-rose-800 text-rose-300"
                : "bg-emerald-950/50 border-emerald-800 text-emerald-300"
            }`}
          >
            {feedbackMsg.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <p>{feedbackMsg.text}</p>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>هيكل الوحدات والمحاضرات</span>
            </h3>

            <button
              onClick={handleOpenAddModule迷}
              className="px-3.5 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة وحدة جديدة</span>
            </button>
          </div>

          {modules.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-950/50 space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">لا توجد وحدات تعليمية بعد</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ابدأ بإضافة الوحدة الأولى لتتمكن من إدراج الدروس والشروحات والفيديوهات المرفقة.
              </p>
              <button
                onClick={handleOpenAddModule迷}
                className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة أول وحدة</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, modIdx) => {
                const isExpanded = activeModuleId === module.id;
                return (
                  <div
                    key={module.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow"
                  >
                    {/* Module Header Bar */}
                    <div
                      className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between cursor-pointer select-none"
                      onClick={() => setActiveModuleId(isExpanded ? null : module.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center text-xs font-black">
                          {modIdx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-sm">{module.title}</h4>
                          {module.description && (
                            <p className="text-xs text-slate-400 mt-0.5">{module.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold">
                          {module.lessons?.length || 0} دروس
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveModule(modIdx, "up")}
                            disabled={modIdx === 0}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-lg"
                            title="تحريك لأعلى"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveModule(modIdx, "down")}
                            disabled={modIdx === modules.length - 1}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-lg"
                            title="تحريك لأسفل"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleOpenEditModule(module)}
                          className="p-1.5 bg-slate-800 hover:bg-teal-600 hover:text-slate-950 text-teal-400 rounded-lg transition"
                          title="تعديل اسم الوحدة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition"
                          title="حذف الوحدة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="p-1.5 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Lessons List under Module */}
                    {isExpanded && (
                      <div className="p-4 space-y-3 bg-slate-950/40">
                        {(!module.lessons || module.lessons.length === 0) ? (
                          <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-850 rounded-xl">
                            لا توجد دروس في هذه الوحدة حتى الآن.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {module.lessons.map((lesson, lessonIdx) => (
                              <div
                                key={lesson.id}
                                className="p-3.5 bg-slate-900/80 border border-slate-800/90 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center text-[11px] font-mono shrink-0">
                                    {lessonIdx + 1}
                                  </span>
                                  <div className="truncate">
                                    <h5 className="font-bold text-white text-xs truncate">{lesson.title}</h5>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                      <span className="text-emerald-400">{lesson.duration || "20 دقيقة"}</span>
                                      {lesson.isFree || !course.isPremium ? (
                                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                                          مجاني
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                                          <Lock className="w-2.5 h-2.5" />
                                          <span>مدفوع</span>
                                        </span>
                                      )}
                                      {lesson.videoUrl && (
                                        <span className="flex items-center gap-1 text-teal-400">
                                          <Video className="w-3 h-3" />
                                          <span>فيديو</span>
                                        </span>
                                      )}
                                      {lesson.attachmentName && (
                                        <span className="flex items-center gap-1 text-amber-400">
                                          <FileText className="w-3 h-3" />
                                          <span>مرفق</span>
                                        </span>
                                      )}
                                      {lesson.references && lesson.references.length > 0 && (
                                        <span className="text-indigo-400 font-mono">
                                          ({lesson.references.length} مراجع)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleMoveLesson(module.id, lessonIdx, "up")}
                                    disabled={lessonIdx === 0}
                                    className="p-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded"
                                    title="تحريك لأعلى"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveLesson(module.id, lessonIdx, "down")}
                                    disabled={lessonIdx === module.lessons.length - 1}
                                    className="p-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded"
                                    title="تحريك لأسفل"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>

                                  <button
                                    onClick={() => handleOpenEditLesson述(module.id, lesson)}
                                    className="p-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-emerald-400 rounded-lg transition cursor-pointer"
                                    title="تعديل محتوى الدرس"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                    className="p-1.5 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                                    title="حذف الدرس"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => handleOpenAddLesson(module.id)}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-800 text-emerald-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة درس جديد لهذه الوحدة</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ======================= MODULE MODAL ======================= */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsModuleModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-white text-base">
              {editingModule ? "تعديل الوحدة التعليمية" : "إضافة وحدة تعليمية جديدة"}
            </h3>

            <form onSubmit={handleSaveModule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">عنوان الوحدة *</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="مثال: الوحدة 1: تحضير التربة الرملية"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">وصف مختصر للوحدة</label>
                <textarea
                  rows={2}
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="نبذة عما سيتعلمه الطالب في هذه الوحدة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-xs"
                >
                  حفظ الوحدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= LESSON MODAL ======================= */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsLessonModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="font-black text-white text-base">
                {editingLesson ? "تعديل محتوى الدرس والشرح الأكاديمي" : "إضافة درس جديد للوحدة"}
              </h3>
              <p className="text-xs text-slate-400">
                يمكنك كتابة النص الأكاديمي التفصيلي، تضمين رابط فيديو، وإرفاق مراجع بصيغة PDF.
              </p>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">عنوان الدرس *</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="مثال: الدرس 1: حساب كمية مياه السقي ومكافحة الإجهاد الحراري"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">المدة التقديرية للدرس</label>
                  <input
                    type="text"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="25 دقيقة"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">رابط الفيديو (YouTube / Embed)</label>
                  <input
                    type="url"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Free vs Paid Toggle */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {lessonIsFree ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        <span>درس مجاني للجميع</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>درس مدفوع للمشتركين فقط</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {lessonIsFree
                      ? "يمكن لجميع زوار المنصة والطلبة مشاهدة هذا الدرس والمحاضرة مجاناً كمعاينة."
                      : "لا يمكن تشغيل هذا الدرس إلا بعد اشتراك الطالب في المقرر."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setLessonIsFree(!lessonIsFree)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                    lessonIsFree
                      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                      : "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20"
                  }`}
                >
                  {lessonIsFree ? "تحويل إلى مدفوع" : "جعله درساً مجانياً"}
                </button>
              </div>

              {/* Rich Lesson Content */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>الشرح العلمي والنص التفصيلي للدرس *</span>
                  <span className="text-[10px] text-slate-500 font-normal">يدعم الفقرات والتعداد</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="اكتب هنا المحتوى الأكاديمي للدرس بالتفصيل والخطوات الميدانية..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                />
              </div>

              {/* Attachment PDF */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>المرفقات والكراسات بصيغة PDF (اختياري)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={lessonAttachmentName}
                    onChange={(e) => setLessonAttachmentName(e.target.value)}
                    placeholder="اسم الملف: كتيب السقي.pdf"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={lessonAttachmentSize}
                    onChange={(e) => setLessonAttachmentSize(e.target.value)}
                    placeholder="الحجم: 3.5 MB"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <input
                  type="url"
                  value={lessonPdfUrl}
                  onChange={(e) => setLessonPdfUrl(e.target.value)}
                  placeholder="رابط التحميل أو الرابط الخارجي (URL)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              {/* References */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">المراجع والروابط العلمية</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRefInput}
                    onChange={(e) => setNewRefInput(e.target.value)}
                    placeholder="أدخل مرجعاً أو دراسة (مثال: تقرير ITDAS 2025)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddReference();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddReference}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    إضافة مرجع
                  </button>
                </div>

                {lessonReferences.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {lessonReferences.map((ref, rIdx) => (
                      <div
                        key={rIdx}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between text-xs text-slate-300"
                      >
                        <span className="truncate">{ref}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveReference(rIdx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow"
                >
                  حفظ الدرس
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
