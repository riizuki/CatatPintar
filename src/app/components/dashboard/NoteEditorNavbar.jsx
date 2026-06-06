"use client";

import { ChatBubbleLeftRightIcon, SparklesIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "../../../lib/contexts/DashboardContext";
import { useLanguage } from "../../../lib/contexts/LanguageContext";
import { dashboardTranslations } from "../../../locales/dashboard";

const NoteEditorNavbar = ({
  onGenerateFlashcards,
  onGenerateQuiz,
  onExportPdf,
  isGenerating,
  isExporting,
  noteId,
}) => {
  const { setIsAiSidebarOpen } = useDashboard();
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  const generationDisabled = !noteId;

  return (
    <div className="flex flex-col sm:flex-row justify-end items-center p-3 sm:p-5 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl space-y-3 sm:space-y-0 sm:space-x-3 transition-colors">
      <button
        type="button"
        onClick={() => setIsAiSidebarOpen(true)}
        className="w-full sm:w-auto flex items-center justify-center sm:justify-start px-5 py-2.5 text-sm font-bold text-white bg-[#00A2D8] rounded-xl hover:bg-[#008EB2] transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
        title={t.notes.navbar.askAiTooltip}
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5 sm:mr-2" />
        <span className="hidden sm:inline">{t.notes.navbar.askAi}</span>
      </button>
      
      <button
        type="button"
        onClick={onGenerateFlashcards}
        disabled={generationDisabled || isGenerating === 'flashcards'}
        className="w-full sm:w-auto flex items-center justify-center sm:justify-start px-5 py-2.5 text-sm font-bold text-white bg-[#00A2D8] rounded-xl hover:bg-[#008EB2] disabled:opacity-50 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
        title={generationDisabled ? t.notes.navbar.flashcardDisabledTooltip : t.notes.navbar.flashcardTooltip}
      >
        <SparklesIcon className="w-5 h-5 sm:mr-2" />
        <span className="hidden sm:inline">
          {isGenerating === 'flashcards' ? t.notes.navbar.generating : t.notes.navbar.flashcard}
        </span>
      </button>

      <button
        type="button"
        onClick={onExportPdf}
        disabled={generationDisabled || isExporting}
        className="w-full sm:w-auto flex items-center justify-center sm:justify-start px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#00A2D8] to-indigo-600 hover:from-[#008EB2] hover:to-indigo-700 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 whitespace-nowrap shadow-md shadow-indigo-500/20 border border-transparent"
        title={generationDisabled ? "Simpan catatan untuk mengunduh PDF" : "Unduh catatan ini sebagai PDF"}
      >
        <ArrowDownTrayIcon className="w-5 h-5 sm:mr-2 text-white" />
        <span className="hidden sm:inline">
          {isExporting ? t.notes.editor.saving : (t.notes.navbar.exportPdf || "Export PDF")}
        </span>
      </button>
    </div>
  );
};

export default NoteEditorNavbar;
