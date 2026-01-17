"use client";

import { ChatBubbleLeftRightIcon, SparklesIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "../../../lib/contexts/DashboardContext";

const NoteEditorNavbar = ({
  onGenerateFlashcards,
  onGenerateQuiz,
  isGenerating,
  noteId,
}) => {
  const { setIsAiSidebarOpen } = useDashboard();
  const generationDisabled = !noteId;

  return (
    <div className="flex justify-end items-center p-4 border-b border-gray-200 bg-white dark:bg-gray-800 space-x-2">
      <button
        type="button"
        onClick={() => setIsAiSidebarOpen(true)}
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 whitespace-nowrap"
        title="Tanya AI tentang catatan ini"
      >
        <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
        Tanya AI
      </button>
      <button
        type="button"
        onClick={onGenerateFlashcards}
        disabled={generationDisabled || isGenerating === 'flashcards'}
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
        title={generationDisabled ? "Simpan catatan untuk membuat flashcard" : "Buat Flashcard dari Catatan Ini"}
      >
        <SparklesIcon className="w-4 h-4 mr-1" />
        {isGenerating === 'flashcards' ? 'Membuat...' : 'Flashcard'}
      </button>
      <button
        type="button"
        onClick={onGenerateQuiz}
        disabled={generationDisabled || isGenerating === 'quiz'}
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
        title={generationDisabled ? "Simpan catatan untuk membuat kuis" : "Buat Kuis dari Catatan Ini"}
      >
        <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />
        {isGenerating === 'quiz' ? 'Membuat...' : 'Buat Kuis'}
      </button>
    </div>
  );
};

export default NoteEditorNavbar;
