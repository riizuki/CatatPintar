"use client";

import { PlusIcon, ArrowLeftIcon, CheckCircleIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import CreateQuizModal from "@/app/components/dashboard/CreateQuizModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { dashboardTranslations } from "@/locales/dashboard";

const QuizPage = () => {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/quizzes");
        if (!res.ok) throw new Error("Gagal mengambil kuis");
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <>
      <CreateQuizModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} notes={[]} />
      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-4 p-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300"/>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
                  {t.quiz.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">
                  {t.quiz.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm sm:text-base font-bold text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            <span>{t.quiz.createQuiz}</span>
          </button>
        </header>
        
        {loading && (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00A2D8] rounded-full animate-spin"></div>
            </div>
        )}
        {error && <p className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">{t.quiz.error} {error}</p>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 transform hover:-translate-y-2 hover:border-[#00A2D8]/50 dark:hover:border-[#4CC1EE]/50 p-6 flex flex-col min-h-[280px]">
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize line-clamp-2">
                        {quiz.sourceType}: <span className="font-normal opacity-80">{quiz.sourceValue}</span>
                        </h3>
                        {quiz.result && (
                            <CheckCircleIcon className="w-6 h-6 text-emerald-500 flex-shrink-0" title={t.quiz.completed}/>
                        )}
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg w-fit">
                        <CalendarDaysIcon className="w-4 h-4 mr-2"/>
                        <span>{formatDate(quiz.createdAt)}</span>
                    </div>
                    
                    {quiz.result ? (
                       <div className="text-left mt-6">
                           <p className="text-4xl font-extrabold text-[#00A2D8] dark:text-[#4CC1EE]">{quiz.result.score}%</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t.quiz.takenAt} {formatDate(quiz.result.takenAt)}</p>
                       </div>
                    ) : (
                      <p className="text-sm italic text-gray-500 dark:text-gray-400 mt-6">{t.quiz.notTaken}</p>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <Link href={`/dashboard/quiz/${quiz.id}`} 
                        className={`w-full inline-flex justify-center items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${quiz.result ? 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600' : 'text-white bg-[#00A2D8] hover:bg-[#008EB2] '}`}
                    >
                        {quiz.result ? t.quiz.viewResult : t.quiz.startQuiz}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 px-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50 pointer-events-none"></div>
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl flex items-center justify-center mb-6 border border-gray-200/50 dark:border-gray-700/50 relative z-10">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-500"/>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white relative z-10">{t.quiz.emptyTitle}</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 relative z-10">{t.quiz.emptySubtitle}</p>
                 <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-8 inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-xl transition-all transform hover:-translate-y-1"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    {t.quiz.createQuiz}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default QuizPage;