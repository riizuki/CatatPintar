"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import CreateQuizModal from "@/app/components/dashboard/CreateQuizModal";
import Link from "next/link";

const QuizPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/quizzes");
        if (!res.ok) throw new Error("Failed to fetch quizzes");
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
      {/* The notes prop will be removed when we refactor the modal itself */}
      <CreateQuizModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} notes={[]} />
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-black">My Quizzes</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Quiz
          </button>
        </div>
        
        {loading && <p>Loading quiz history...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
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
                      Created on: {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {quiz.result ? (
                       <div className="text-right">
                           <p className="font-semibold text-black">{quiz.result.score}%</p>
                           <p className="text-sm text-gray-500">Taken on: {new Date(quiz.result.takenAt).toLocaleDateString()}</p>
                       </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Not taken yet</p>
                    )}
                    <Link href={`/dashboard/quiz/${quiz.id}`} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-black">
                      {quiz.result ? "View Result" : "Take Quiz"}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                <p>No quizzes created yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default QuizPage;