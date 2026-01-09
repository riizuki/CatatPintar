"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import CreateQuizModal from "@/app/components/dashboard/CreateQuizModal";

const QuizPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Dummy data, in a real app this would come from a database or state management
  const [notes, setNotes] = useState([
    { id: 1, title: "Note 1: Introduction to AI", content: "This note contains an introduction to the field of Artificial Intelligence...", folderId: 1, lastModified: new Date() },
    { id: 2, title: "Note 2: Machine Learning Basics", content: "An overview of the fundamental concepts in Machine Learning...", folderId: 1, lastModified: new Date() },
    { id: 3, title: "Note 3: Deep Learning", content: "Exploring the architecture and applications of deep neural networks...", folderId: 2, lastModified: new Date() },
  ]);

  return (
    <>
      <CreateQuizModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} notes={notes} />
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-black">Quiz</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Quiz
          </button>
        </div>
        {/* Quiz history or other content will go here */}
        <div className="text-center text-gray-500">
          <p>No quizzes taken yet.</p>
        </div>
      </div>
    </>
  );
};

export default QuizPage;