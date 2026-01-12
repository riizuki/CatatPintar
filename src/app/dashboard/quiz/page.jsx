"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import CreateQuizModal from "@/app/components/dashboard/CreateQuizModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

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

  return (
    <>
      <CreateQuizModal isOpen={isModalOpen} onClose={() => {
          setIsModalOpen(false);
      }} notes={[]} />
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                <ArrowLeftIcon className="w-6 h-6 text-black"/>
            </button>
            <h1 className="text-3xl font-semibold text-black">Kuis Saya</h1>
          </div>
          <button
            onClick={() => {
                console.log("Create Quiz button clicked, setting isModalOpen to true");
                setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Buat Kuis
          </button>
        </div>
        
        {loading && <p>Memuat riwayat kuis...</p>}
        {error && <p className="text-red-500">Kesalahan: {error}</p>}
        
        {!loading && !error && (
          <div className="space-y-4">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-black capitalize">
                      {quiz.sourceType}: <span className="font-normal text-gray-700 truncate">{quiz.sourceValue}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Dibuat pada: {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {quiz.result ? (
                       <div className="text-right">
                           <p className="font-semibold text-black">{quiz.result.score}%</p>
                           <p className="text-sm text-gray-500">Dikerjakan pada: {new Date(quiz.result.takenAt).toLocaleDateString()}</p>
                       </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Belum dikerjakan</p>
                    )}
                    <Link href={`/dashboard/quiz/${quiz.id}`} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-black">
                      {quiz.result ? "Lihat Hasil" : "Kerjakan Kuis"}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                <p>Belum ada kuis yang dibuat.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default QuizPage;