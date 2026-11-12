"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faClone, faComments, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { useDashboard } from "../../../lib/contexts/DashboardContext";
import { useLanguage } from "../../../lib/contexts/LanguageContext";
import { dashboardTranslations } from "../../../locales/dashboard";

const btn =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--rule)] px-3 sm:px-4 text-sm font-bold text-[var(--ink)] transition-colors hover:border-[var(--ink-soft)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--rule)]";

const NoteEditorNavbar = ({ onGenerateFlashcards, onExportPdf, isGenerating, isExporting, noteId }) => {
  const { setIsAiSidebarOpen } = useDashboard();
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  const generationDisabled = !noteId;

  return (
    <div className="flex items-center justify-between gap-3 border-b-2 border-[var(--rule)] px-4 py-3 sm:px-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span className="hidden sm:inline">{language === "id" ? "Beranda" : "Home"}</span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsAiSidebarOpen(true)}
          title={t.notes.navbar.askAiTooltip}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[var(--hl-blue)] px-3 sm:px-4 text-sm font-bold text-[var(--ink-fixed)] transition-[filter,transform] hover:brightness-95 active:scale-[0.97]"
        >
          <FontAwesomeIcon icon={faComments} />
          <span className="hidden sm:inline">{t.notes.navbar.askAi}</span>
        </button>

        <button
          type="button"
          onClick={onGenerateFlashcards}
          disabled={generationDisabled || isGenerating === "flashcards"}
          title={generationDisabled ? t.notes.navbar.flashcardDisabledTooltip : t.notes.navbar.flashcardTooltip}
          className={btn}
        >
          <FontAwesomeIcon icon={faClone} className="text-amber-500" />
          <span className="hidden sm:inline">
            {isGenerating === "flashcards" ? t.notes.navbar.generating : t.notes.navbar.flashcard}
          </span>
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          disabled={generationDisabled || isExporting}
          title={generationDisabled ? "Simpan catatan untuk mengunduh PDF" : "Unduh catatan ini sebagai PDF"}
          className={btn}
        >
          <FontAwesomeIcon icon={faFilePdf} className="text-[var(--margin)]" />
          <span className="hidden sm:inline">
            {isExporting ? t.notes.editor.saving : t.notes.navbar.exportPdf || "Export PDF"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default NoteEditorNavbar;
