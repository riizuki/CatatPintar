"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import "@/app/quill-editor.css";
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { TrashIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import ConfirmationModal from "../../../../components/dashboard/ConfirmationModal";
import NoteEditorNavbar from "../../../../components/dashboard/NoteEditorNavbar";
import { useDashboard } from "../../../../../lib/contexts/DashboardContext";
import { useLanguage } from "../../../../../lib/contexts/LanguageContext";
import { dashboardTranslations } from "../../../../../locales/dashboard";

const EditNotePage = () => {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  const router = useRouter();
  const params = useParams();
  const { noteId } = params;
  const { setNoteContext, isAiSidebarOpen } = useDashboard();

  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folderId, setFolderId] = useState("");
  const [folders, setFolders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);

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

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
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
      toast.success('Catatan berhasil disimpan!');
      router.refresh();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSaving(false);
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

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }, { font: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        ["blockquote", "code-block"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
      clipboard: {
        matchVisual: true,
      },
      syntax: {
        highlight: (text) => hljs.highlightAuto(text).value,
      },
    }),
    []
  );

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00A2D8] rounded-full animate-spin"></div>
    </div>
  );
  if (error && !note) return <div className="p-8 text-red-500 bg-red-50 rounded-xl m-8">{t.notes.editor.error} {error}</div>;


  return (
    <div>
      <NoteEditorNavbar
        onGenerateFlashcards={() => handleGenerate('flashcards')}
        onGenerateQuiz={() => setIsCreateQuizModalOpen(true)}
        isGenerating={isGenerating}
        noteId={noteId}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title={t.notes.editor.deleteModalTitle}
        >
          <p className="text-gray-600 dark:text-gray-300">{t.notes.editor.deleteModalText}</p>
        </ConfirmationModal>

        <form onSubmit={handleSaveChanges} autoComplete="off" className="space-y-6">
          <div className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl md:text-5xl font-extrabold bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 border-none focus:outline-none focus:ring-0 px-0 transition-colors"
              placeholder={t.notes.editor.titlePlaceholder}
            />
          </div>

          <div className="mb-32 pb-4">
            <ReactQuill
              key={language}
              theme="snow"
              value={content}
              onChange={setContent}
              className="quill-editor modern-quill"
              style={{ minHeight: "60vh" }}
              modules={modules}
              placeholder={t.notes.editor.contentPlaceholder}
            />
          </div>

          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 w-full max-w-[95%] sm:max-w-[90%] md:w-auto z-40 transition-all duration-300 ${isAiSidebarOpen ? 'md:right-[400px] md:max-w-[calc(100vw-700px)]' : 'md:right-8 md:max-w-[calc(100vw-320px)]'}`}>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all">

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeleting}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors w-full sm:w-auto justify-center"
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                {isDeleting ? t.notes.editor.deleting : t.notes.editor.delete}
              </button>

              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block mx-1"></div>

              <div className="flex items-center w-full sm:w-auto gap-3">
                <label htmlFor="folder" className="hidden sm:block text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                  {t.notes.editor.folder}
                </label>
                <select
                  id="folder"
                  name="folder"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="block w-full sm:w-40 px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8]/50 transition-colors"
                >
                  <option value="">{t.notes.editor.noFolder}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t.notes.editor.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-xl disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                >
                  {isSaving ? t.notes.editor.saving : t.notes.editor.saveChanges}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNotePage;
