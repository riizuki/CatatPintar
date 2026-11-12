"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faDownload, faFloppyDisk, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "../../../../components/dashboard/ConfirmationModal";
import NoteEditorNavbar from "../../../../components/dashboard/NoteEditorNavbar";
import NoteEditor from "../../../../components/editor/NoteEditor";
import { ActionBar, FolderPicker, TopSaveButton } from "../../../../components/editor/NotePageParts";
import MaterialPointsPanel from "../../../../components/editor/MaterialPointsPanel";
import { exportNotePdf } from "../../../../../lib/exportNotePdf";
import { useDashboard } from "../../../../../lib/contexts/DashboardContext";
import { useLanguage } from "../../../../../lib/contexts/LanguageContext";
import { dashboardTranslations } from "../../../../../locales/dashboard";

const EditNotePage = () => {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  const router = useRouter();
  const params = useParams();
  const { noteId } = params;
  const { setNoteContext, setIsAiSidebarOpen } = useDashboard();
  const formRef = useRef(null);

  const askAi = (selected) => {
    if (selected) {
      const text = language === "id" ? `Jelaskan dengan bahasa sederhana: "${selected}"` : `Explain simply: "${selected}"`;
      setNoteContext((prev) => ({ ...prev, prefill: { text, at: Date.now() } }));
    }
    setIsAiSidebarOpen(true);
  };

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folderId, setFolderId] = useState("");
  const [folders, setFolders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isGenerating, setIsGenerating] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const [isCheckingGaps, setIsCheckingGaps] = useState(false);

  useEffect(() => {
    if (!noteId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [noteRes, foldersRes] = await Promise.all([
          fetch(`/api/notes/${noteId}`),
          fetch("/api/folders"),
        ]);

        if (!noteRes.ok) throw new Error("Catatan tidak ditemukan atau akses ditolak.");
        if (!foldersRes.ok) throw new Error("Gagal mengambil folder.");

        const noteData = await noteRes.json();
        const foldersData = await foldersRes.json();

        setNote(noteData);
        setTitle(noteData.title);
        setContent(noteData.content);
        setFolderId(noteData.folderId || "");
        setFolders(foldersData);

        setNoteContext({ noteId, noteContent: noteData.content });

        // Parse search params for instant AI actions
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("askAi") === "true") {
          setIsAiSidebarOpen(true);
        }
        if (searchParams.get("generateFlashcards") === "true") {
          setTimeout(() => {
            handleGenerate('flashcards');
          }, 600);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      setNoteContext({ noteId: null, noteContent: '' });
    }
  }, [noteId, setNoteContext]);

  useEffect(() => {
    setNoteContext(prev => ({ ...prev, noteContent: content }));
  }, [content, setNoteContext]);

  /** Simpan catatan; mengembalikan true kalau berhasil. */
  const saveNote = async () => {
    const res = await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        folderId: folderId ? parseInt(folderId) : null,
      }),
    });
    if (!res.ok) throw new Error("Gagal menyimpan perubahan.");
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await saveNote();
      toast.success('Catatan berhasil disimpan!');
      router.refresh();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Simpan dulu, BARU ke halaman Celah Catatan. Analisis celah membaca catatan
   * dari database; tanpa langkah simpan ini, tulisan terakhir yang belum
   * disimpan tidak ikut dinilai dan mahasiswa dituduh punya celah yang
   * sebenarnya sudah ia tulis.
   */
  const handleCheckGaps = async () => {
    setIsCheckingGaps(true);
    try {
      await saveNote();
      router.push(`/dashboard/notes/${noteId}/gaps`);
    } catch (err) {
      toast.error(err.message);
      setIsCheckingGaps(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleteModalOpen(false);
    setIsDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus catatan.");
      toast.success('Catatan berhasil dihapus.');
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setIsDeleting(false);
    }
  };

  const handleGenerate = async (type) => {
    setIsGenerating(type);
    setError('');
    try {
      if (type === 'flashcards') {
        const url = '/api/generate/flashcards';
        const requestBody = { noteId: parseInt(noteId) };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || `Gagal membuat ${type}`);
        }
        router.push(`/dashboard/flashcards?noteId=${noteId}`);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleExportPdf = async () => {
    if (!note) return;
    setIsExportingPdf(true);
    const toastId = toast.loading(language === "id" ? "Menyiapkan berkas PDF..." : "Preparing PDF file...");
    try {
      await exportNotePdf({
        title,
        html: content,
        updatedAt: note.updatedAt,
        folderName: folders.find((f) => String(f.id) === String(folderId))?.name,
        language,
      });
      toast.success(
        language === "id" ? 'Pilih "Simpan sebagai PDF" di dialog cetak.' : 'Choose "Save as PDF" in the print dialog.',
        { id: toastId, duration: 5000 }
      );
    } catch (err) {
      console.error(err);
      toast.error(language === "id" ? "Gagal ekspor PDF." : "Failed to export PDF.", { id: toastId });
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--rule)] border-t-[var(--ink)]" />
      </div>
    );
  if (error && !note)
    return (
      <p role="alert" className="m-8 rounded-xl border-2 border-[var(--wrong)] p-6 font-medium text-[var(--wrong)]">
        {t.notes.editor.error} {error}
      </p>
    );

  const updatedLabel = note?.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div>
      <NoteEditorNavbar
        onGenerateFlashcards={() => handleGenerate("flashcards")}
        onExportPdf={handleExportPdf}
        isGenerating={isGenerating}
        isExporting={isExportingPdf}
        noteId={noteId}
      />

      <div className={`mx-auto px-4 pt-8 pb-6 sm:px-6 md:pt-10 ${note?.material ? "max-w-7xl" : "max-w-5xl"}`}>
        <div className={note?.material ? "grid grid-cols-1 gap-8 lg:grid-cols-12" : ""}>
        {note?.material && (
          <div className="lg:order-last lg:col-span-4">
            <MaterialPointsPanel
              material={note.material}
              isAiNote={note.isAiGenerated}
              t={t.notes.materialPanel}
              onCheckGaps={handleCheckGaps}
              checking={isCheckingGaps}
            />
          </div>
        )}
        <div className={note?.material ? "min-w-0 lg:col-span-8" : ""}>
        {note && note.filePath && (
          <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-xl border-2 border-dashed border-[var(--rule)] p-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <span className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-extrabold uppercase text-[var(--ink-fixed)] ${note.fileType === "pdf" ? "bg-[var(--hl-pink)]" : "bg-[var(--hl-yellow)]"}`}>
                {note.fileType || "doc"}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-[var(--ink-soft)]">{language === "id" ? "Lampiran berkas asli" : "Original attachment"}</p>
                <p className="truncate font-bold">{note.title}</p>
              </div>
            </div>
            <a
              href={note.filePath}
              download
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--rule)] px-4 text-sm font-bold hover:border-[var(--ink-soft)] sm:w-auto"
            >
              <FontAwesomeIcon icon={faDownload} />
              {language === "id" ? "Unduh berkas asli" : "Download original file"}
            </a>
          </div>
        )}

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title={t.notes.editor.deleteModalTitle}
        >
          <p className="text-gray-600 dark:text-gray-300">{t.notes.editor.deleteModalText}</p>
        </ConfirmationModal>

        <form ref={formRef} onSubmit={handleSaveChanges} autoComplete="off">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            title={title}
            className={`w-full bg-transparent px-0 text-3xl font-extrabold tracking-tight text-[var(--ink)] placeholder:text-[var(--ink-soft)]/40 focus:outline-none ${note?.material ? "sm:text-4xl" : "sm:text-5xl"}`}
            placeholder={t.notes.editor.titlePlaceholder}
            aria-label={t.notes.editor.titlePlaceholder}
          />

          <div className="mt-4 mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <FolderPicker folders={folders} value={folderId} onChange={setFolderId} t={t} />
            {updatedLabel && (
              <span className="inline-flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                <FontAwesomeIcon icon={faClock} />
                {updatedLabel}
              </span>
            )}
            <TopSaveButton busy={isSaving} label={t.notes.editor.saveChanges} busyLabel={t.notes.editor.saving} />
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
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeleting}
              aria-label={t.notes.editor.delete}
              className="mr-auto inline-flex h-11 items-center gap-2 rounded-[10px] px-4 font-semibold text-[var(--wrong)] hover:bg-[var(--wrong)]/10 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faTrashCan} />
              <span className="hidden sm:inline">{isDeleting ? t.notes.editor.deleting : t.notes.editor.delete}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="hidden h-11 rounded-[10px] sm:inline-block border-2 border-[var(--rule)] px-5 font-semibold text-[var(--ink)] hover:border-[var(--ink-soft)]"
            >
              {t.notes.editor.cancel}
            </button>
            <button type="submit" disabled={isSaving} className="btn-ink h-11 px-6 disabled:opacity-60">
              <FontAwesomeIcon icon={faFloppyDisk} />
              {isSaving ? t.notes.editor.saving : t.notes.editor.saveChanges}
            </button>
          </ActionBar>
        </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EditNotePage;
