"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import NoteEditor from "../../../components/editor/NoteEditor";
import { ActionBar, FolderPicker, TopSaveButton } from "../../../components/editor/NotePageParts";
import NoteEditorNavbar from "../../../components/dashboard/NoteEditorNavbar";
import CreateQuizModal from "../../../components/dashboard/CreateQuizModal";
import { useDashboard } from "../../../../lib/contexts/DashboardContext";
import { useLanguage } from "../../../../lib/contexts/LanguageContext";
import { dashboardTranslations } from "../../../../locales/dashboard";

const NewNotePage = () => {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  const router = useRouter();
  const formRef = useRef(null);
  const { setNoteContext, setIsAiSidebarOpen } = useDashboard();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folderId, setFolderId] = useState("");
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch("/api/folders");
        if (!res.ok) throw new Error("Gagal mengambil folder");
        const data = await res.json();
        setFolders(data);
      } catch (err) {
        toast.error("Tidak dapat memuat folder. Silakan coba lagi nanti.");
      }
    };
    fetchFolders();

    setNoteContext({ noteId: null, noteContent: "" });
    return () => {
      setNoteContext({ noteId: null, noteContent: "" });
    };
  }, [setNoteContext]);

  useEffect(() => {
    setNoteContext((prev) => ({ ...prev, noteContent: content }));
  }, [content, setNoteContext]);

  const askAi = (selected) => {
    if (selected) {
      const text = language === "id" ? `Jelaskan dengan bahasa sederhana: "${selected}"` : `Explain simply: "${selected}"`;
      setNoteContext((prev) => ({ ...prev, prefill: { text, at: Date.now() } }));
    }
    setIsAiSidebarOpen(true);
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Catatan Tanpa Judul",
          content,
          folderId: folderId ? parseInt(folderId) : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal membuat catatan");
      }

      const newNote = await res.json();
      toast.success("Catatan berhasil dibuat!");
      router.push(`/dashboard/notes/${newNote.id}/edit`);
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <NoteEditorNavbar isGenerating={null} noteId={null} onGenerateFlashcards={() => {}} />

      <div className="mx-auto max-w-5xl px-4 pt-8 pb-6 sm:px-6 md:pt-10">
        <form ref={formRef} onSubmit={handleCreateNote}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent px-0 text-3xl font-extrabold tracking-tight text-[var(--ink)] placeholder:text-[var(--ink-soft)]/40 focus:outline-none sm:text-5xl"
            placeholder={t.notes.editor.titlePlaceholder}
            aria-label={t.notes.editor.titlePlaceholder}
          />

          <div className="mt-4 mb-6 flex flex-wrap items-center gap-3">
            <FolderPicker folders={folders} value={folderId} onChange={setFolderId} t={t} />
            <TopSaveButton busy={loading} label={t.notes.editor.createNote} busyLabel={t.notes.editor.saving} />
          </div>

          <NoteEditor
            value={content}
            onChange={setContent}
            placeholder={t.notes.editor.contentPlaceholder}
            lang={language}
            onAskAi={askAi}
            onSave={() => formRef.current?.requestSubmit()}
          />

          <ActionBar>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              disabled={loading}
              className="h-11 rounded-[10px] border-2 border-[var(--rule)] px-5 font-semibold text-[var(--ink)] hover:border-[var(--ink-soft)] disabled:opacity-50"
            >
              {t.notes.editor.cancel}
            </button>
            <button type="submit" disabled={loading} className="btn-ink h-11 px-6 disabled:opacity-60">
              <FontAwesomeIcon icon={faFloppyDisk} />
              {loading ? t.notes.editor.saving : t.notes.editor.createNote}
            </button>
          </ActionBar>
        </form>

        <CreateQuizModal
          isOpen={isCreateQuizModalOpen}
          onClose={() => setIsCreateQuizModalOpen(false)}
          preselectedSourceType="note"
          preselectedSourceValue={null}
        />
      </div>
    </div>
  );
};

export default NewNotePage;
