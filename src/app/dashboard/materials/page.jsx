"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { 
  CloudArrowUpIcon, 
  DocumentArrowUpIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { dashboardTranslations } from "@/locales/dashboard";
import toast from "react-hot-toast";

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

function MaterialsContent() {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  const router = useRouter();

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [statusStep, setStatusStep] = useState(0); // 0: Idle, 1: Uploading, 2: Parsing, 3: Structuring, 4: Done
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [generatedNote, setGeneratedNote] = useState(null); // { noteId, title }
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch upload history
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/materials");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to load materials history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (!["pdf", "ppt", "pptx"].includes(extension)) {
      toast.error(t.materials.errors.unsupportedType);
      return false;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.error(t.materials.errors.fileTooLarge);
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        uploadAndProcess(droppedFile);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        uploadAndProcess(selectedFile);
      }
    }
  };

  const uploadAndProcess = async (selectedFile) => {
    setLoading(true);
    setStatusStep(1); // Uploading

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("language", language);

    // Simulate multi-stage progress for premium feel
    const timer1 = setTimeout(() => setStatusStep(2), 2000); // AI Reading/Parsing
    const timer2 = setTimeout(() => setStatusStep(3), 5000); // Structuring HTML

    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        body: formData,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || t.materials.errors.uploadFailed);
      }

      const data = await res.json();
      setGeneratedNote(data);
      setStatusStep(4); // Done
      setShowSuccessModal(true);
      toast.success(t.materials.successTitle);
      
      // Refresh history list
      fetchHistory();
    } catch (err) {
      toast.error(err.message);
      setStatusStep(0);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (noteId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(language === 'id' ? "Hapus materi kuliah ini?" : "Delete this lecture material?")) return;

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(language === 'id' ? "Materi berhasil dihapus" : "Material deleted successfully");
        setHistory(prev => prev.filter(item => item.id !== noteId));
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      toast.error(language === 'id' ? "Gagal menghapus materi" : "Failed to delete material");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto min-h-screen relative">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center">
          <button onClick={() => router.push("/dashboard")} className="mr-4 p-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300"/>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
              <CloudArrowUpIcon className="w-8 h-8 mr-3 text-[#00A2D8]" />
              {t.materials.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base max-w-2xl">
              {t.materials.subtitle}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Column */}
        <div className="lg:col-span-6 space-y-8">
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50"
          >
            {!loading && statusStep !== 4 ? (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  dragActive 
                    ? "border-[#00A2D8] bg-[#00A2D8]/5 scale-[1.02]" 
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/20"
                }`}
                onClick={() => document.getElementById("file-input").click()}
              >
                <input 
                  id="file-input"
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.ppt,.pptx"
                  onChange={handleChange}
                />
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl mb-4 text-[#00A2D8] group-hover:scale-110 transition-transform">
                  <DocumentArrowUpIcon className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t.materials.uploadArea.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {t.materials.uploadArea.subtitle}
                </p>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50">
                  {t.materials.uploadArea.supportedTypes}
                </span>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-20 h-20 relative mb-6">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-700 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-[#00A2D8] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SparklesIcon className="w-8 h-8 text-[#00A2D8] animate-pulse" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
                  {statusStep === 1 && t.materials.uploading}
                  {statusStep === 2 && t.materials.parsing}
                  {statusStep === 3 && t.materials.structuring}
                  {statusStep === 4 && t.materials.successTitle}
                </h3>

                {/* Progress bars indicator */}
                <div className="w-full max-w-xs space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                    <span>{t.materials.uploading}</span>
                    {statusStep >= 1 && <CheckCircleIcon className={`w-4 h-4 ${statusStep > 1 ? "text-emerald-500" : "text-[#00A2D8] animate-pulse"}`} />}
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-[#00A2D8] to-blue-500 transition-all duration-500 ${statusStep === 1 ? "w-1/3" : statusStep > 1 ? "w-full" : "w-0"}`}></div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                    <span>{t.materials.parsing}</span>
                    {statusStep >= 2 && <CheckCircleIcon className={`w-4 h-4 ${statusStep > 2 ? "text-emerald-500" : "text-[#00A2D8] animate-pulse"}`} />}
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-[#00A2D8] to-blue-500 transition-all duration-500 ${statusStep === 2 ? "w-1/2" : statusStep > 2 ? "w-full" : "w-0"}`}></div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                    <span>{t.materials.structuring}</span>
                    {statusStep >= 3 && <CheckCircleIcon className={`w-4 h-4 ${statusStep > 3 ? "text-emerald-500" : "text-[#00A2D8] animate-pulse"}`} />}
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-[#00A2D8] to-blue-500 transition-all duration-500 ${statusStep === 3 ? "w-3/4" : statusStep > 3 ? "w-full" : "w-0"}`}></div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* History Column */}
        <div className="lg:col-span-6">
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-gray-200/50 dark:border-gray-700/50 flex flex-col h-full min-h-[400px]"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-6">
              <BookOpenIcon className="w-6 h-6 mr-3 text-[#00A2D8]" />
              {t.materials.history.title}
            </h2>

            {historyLoading ? (
              <div className="flex items-center justify-center flex-grow">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00A2D8] rounded-full animate-spin"></div>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => router.push(`/dashboard/notes/${item.id}/edit`)}
                    className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-blue-200 dark:hover:border-blue-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center min-w-0 gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${
                        item.fileType === "pdf" 
                          ? "from-rose-100 to-rose-50 dark:from-rose-950/30 dark:to-rose-950/10 text-rose-600" 
                          : "from-amber-100 to-amber-50 dark:from-amber-950/30 dark:to-amber-950/10 text-amber-600"
                      } border border-gray-200/50 dark:border-gray-700/50 group-hover:scale-105 transition-transform flex-shrink-0`}>
                        <span className="font-bold text-xs uppercase">{item.fileType || "doc"}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-[#00A2D8] transition-colors pr-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(item.createdAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.filePath && (
                        <a 
                          href={item.filePath} 
                          download
                          onClick={(e) => e.stopPropagation()} 
                          className="p-2 text-gray-400 hover:text-[#00A2D8] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                          title="Download Original"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </a>
                      )}
                      <button 
                        onClick={(e) => handleDeleteMaterial(item.id, e)}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                      <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow text-center py-10 px-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl flex items-center justify-center mb-6 border border-gray-200/50 dark:border-gray-700/50">
                  <CloudArrowUpIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t.materials.history.emptyTitle}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">{t.materials.history.emptySubtitle}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Premium Glassmorphic Success Actions Modal */}
      <AnimatePresence>
        {showSuccessModal && generatedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-xl p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative backgrounds */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00A2D8]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-md">
                  <CheckCircleIcon className="w-10 h-10 text-white animate-bounce" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                  {t.materials.successTitle}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8">
                  {t.materials.successSubtitle}
                </p>
                <div className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 mb-8 font-bold text-gray-800 dark:text-gray-200 text-sm truncate">
                  📌 {generatedNote.title}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* Action 1: View Note */}
                  <button 
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push(`/dashboard/notes/${generatedNote.noteId}/edit`);
                    }}
                    className="flex items-center px-4 py-3.5 bg-gradient-to-r from-[#00A2D8] to-blue-500 hover:from-[#008EB2] hover:to-blue-600 text-white font-bold rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <BookOpenIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{t.materials.actions.viewNote}</span>
                  </button>

                  {/* Action 2: Chatbot */}
                  <button 
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push(`/dashboard/notes/${generatedNote.noteId}/edit?askAi=true`);
                    }}
                    className="flex items-center px-4 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 hover:border-[#00A2D8]/50 text-gray-800 dark:text-gray-200 font-bold rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3 text-[#00A2D8] flex-shrink-0" />
                    <span>{t.materials.actions.askAi}</span>
                  </button>

                  {/* Action 3: Flashcard */}
                  <button 
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push(`/dashboard/notes/${generatedNote.noteId}/edit?generateFlashcards=true`);
                    }}
                    className="flex items-center px-4 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 hover:border-[#00A2D8]/50 text-gray-800 dark:text-gray-200 font-bold rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <AcademicCapIcon className="w-5 h-5 mr-3 text-[#00A2D8] flex-shrink-0" />
                    <span>{t.materials.actions.generateFlashcards}</span>
                  </button>

                  {/* Action 4: Create Quiz */}
                  <button 
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push(`/dashboard/quiz?noteId=${generatedNote.noteId}`);
                    }}
                    className="flex items-center px-4 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 hover:border-[#00A2D8]/50 text-gray-800 dark:text-gray-200 font-bold rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5 mr-3 text-[#00A2D8] flex-shrink-0" />
                    <span>{t.materials.actions.createQuiz}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00A2D8] rounded-full animate-spin"></div>
      </div>
    }>
      <MaterialsContent />
    </Suspense>
  )
}
