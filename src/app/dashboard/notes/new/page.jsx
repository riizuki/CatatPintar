"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import "@/app/quill-editor.css";
import NoteEditorNavbar from "../../../components/dashboard/NoteEditorNavbar";
import CreateQuizModal from "../../../components/dashboard/CreateQuizModal";
import { useDashboard } from "../../../../lib/contexts/DashboardContext";
import { toast } from "react-hot-toast";

const NewNotePage = () => {
  const router = useRouter();
  const { setNoteContext, isAiSidebarOpen } = useDashboard();

  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

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

    setNoteContext({ noteId: null, noteContent: '' });

    return () => {
      setNoteContext({ noteId: null, noteContent: '' });
    }
  }, [setNoteContext]);

  useEffect(() => {
    setNoteContext(prev => ({ ...prev, noteContent: content }));
  }, [content, setNoteContext]);


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
      toast.success('Catatan berhasil dibuat!');
      router.push(`/dashboard/notes/${newNote.id}/edit`);
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
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

  return (
    <div>
      <NoteEditorNavbar
        isGenerating={null}
        noteId={null}
        onGenerateFlashcards={() => { /* Disabled for new notes */ }}
        onGenerateQuiz={() => setIsCreateQuizModalOpen(true)}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <form onSubmit={handleCreateNote} className="space-y-6">
          <div className="mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl md:text-5xl font-extrabold bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 border-none focus:outline-none focus:ring-0 px-0 transition-colors"
              placeholder="Judul Catatan..."
            />
          </div>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-800/50 mb-24">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              className="quill-editor modern-quill"
              style={{ minHeight: "60vh" }}
            />
          </div>
          {/* Floating Action Bar */}
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 w-full max-w-[95%] sm:max-w-[90%] md:w-auto z-40 transition-all duration-300 ${isAiSidebarOpen ? 'md:right-[400px] md:max-w-[calc(100vw-700px)]' : 'md:right-8 md:max-w-[calc(100vw-320px)]'}`}>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all">
              <div className="flex items-center w-full sm:w-auto gap-3">
                <label htmlFor="folder" className="hidden sm:block text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                  Folder:
                </label>
                <select
                  id="folder"
                  name="folder"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="block w-full sm:w-48 px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8]/50 transition-colors"
                >
                  <option value="">Tanpa Folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-xl disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                >
                  {loading ? "Menyimpan..." : "Buat Catatan"}
                </button>
              </div>
            </div>
          </div>
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