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
    <div className="flex flex-col sm:flex-row justify-end items-center p-2 sm:p-4 border-b border-gray-200 bg-white dark:bg-gray-800 space-y-2 sm:space-y-0 sm:space-x-2">
      <button
        type="button"
        onClick={() => setIsAiSidebarOpen(true)}
        className="w-full sm:w-auto flex items-center justify-center sm:justify-start px-3 py-2 text-sm font-medium text-white bg-[#00A2D8] rounded-md hover:bg-[#008EB2] whitespace-nowrap"
        title="Tanya AI tentang catatan ini"
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5 sm:mr-1" />
        <span className="hidden sm:inline">Tanya AI</span>
      </button>
      <button
        type="button"
        onClick={onGenerateFlashcards}
        disabled={generationDisabled || isGenerating === 'flashcards'}
        className="w-full sm:w-auto flex items-center justify-center sm:justify-start px-3 py-2 text-sm font-medium text-white bg-[#00A2D8] rounded-md hover:bg-[#008EB2] disabled:opacity-50 whitespace-nowrap"
        title={generationDisabled ? "Simpan catatan untuk membuat flashcard" : "Buat Flashcard dari Catatan Ini"}
      >
        <SparklesIcon className="w-5 h-5 sm:mr-1" />
        <span className="hidden sm:inline">
          {isGenerating === 'flashcards' ? 'Membuat...' : 'Flashcard'}
        </span>
      </button>

    </div>
  );
};

export default NoteEditorNavbar;
