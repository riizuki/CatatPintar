"use client";

import { PlusIcon, ArrowLeftIcon, DocumentTextIcon, CheckCircleIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import CreateQuizModal from "@/app/components/dashboard/CreateQuizModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

const QuizPage = () => {
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
      <div className="p-4 sm:p-6 md:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeftIcon className="w-6 h-6 text-gray-700"/>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Kuis Saya
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                  Latih pengetahuan Anda dengan kuis-kuis menarik.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-white bg-[#00A2D8] rounded-lg shadow-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] transition-all duration-300 transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            <span>Buat Kuis</span>
          </button>
        </header>
        
        {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="p-6 bg-white rounded-2xl border border-gray-200 animate-pulse flex flex-col justify-between min-h-[280px]">
                        <div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
                    </div>
                ))}
            </div>
        )}
        {error && <p className="text-red-500">Kesalahan: {error}</p>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="group relative bg-white rounded-2xl border border-gray-200 hover:border-[#00A2D8] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl p-6 flex flex-col min-h-[280px]">
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 capitalize line-clamp-2">
                        {quiz.sourceType}: <span className="font-normal text-gray-700">{quiz.sourceValue}</span>
                        </h3>
                        {quiz.result && (
                            <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" title="Kuis Selesai"/>
                        )}
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-4">
                        <CalendarDaysIcon className="w-4 h-4 mr-2"/>
                        <span>Dibuat pada: {formatDate(quiz.createdAt)}</span>
                    </div>
                    
                    {quiz.result ? (
                       <div className="text-left">
                           <p className="text-3xl sm:text-4xl font-bold text-[#00A2D8]">{quiz.result.score}%</p>
                           <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-2">
                               <CalendarDaysIcon className="w-4 h-4 mr-2"/>
                               <span>Dikerjakan pada: {formatDate(quiz.result.takenAt)}</span>
                           </div>
                       </div>
                    ) : (
                      <p className="text-sm sm:text-base italic text-gray-500">Belum dikerjakan</p>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <Link href={`/dashboard/quiz/${quiz.id}`} 
                        className="w-full inline-flex justify-center items-center px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base font-semibold text-white bg-[#00A2D8] rounded-lg shadow-md hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] transition-all duration-300"
                    >
                        {quiz.result ? "Lihat Hasil" : "Kerjakan Kuis"}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400"/>
                <h3 className="mt-6 text-xl sm:text-2xl font-bold text-gray-800">Belum Ada Kuis</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-500">Buat kuis pertamamu dari catatan atau topik favoritmu!</p>
                 <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-8 inline-flex items-center px-6 py-3 text-sm sm:text-base font-semibold text-white bg-[#00A2D8] rounded-lg shadow-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] transition-all"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Buat Kuis
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