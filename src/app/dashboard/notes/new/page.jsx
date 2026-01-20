"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import "@/app/quill-editor.css";
import NoteEditorNavbar from "../../../components/dashboard/NoteEditorNavbar";
import CreateQuizModal from "../../../components/dashboard/CreateQuizModal"
import { useDashboard } from "../../../../lib/contexts/DashboardContext";

const NewNotePage = () => {
  const router = useRouter();
  const { setNoteContext } = useDashboard();

  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folderId, setFolderId] = useState("");
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch("/api/folders");
        if (!res.ok) throw new Error("Gagal mengambil folder");
        const data = await res.json();
        setFolders(data);
      } catch (err) {
        setError("Tidak dapat memuat folder. Silakan coba lagi nanti.");
      }
    };
    fetchFolders();
    
    // Clear context on mount
    setNoteContext({ noteId: null, noteContent: '' });

    return () => {
      // Clear context on unmount
      setNoteContext({ noteId: null, noteContent: '' });
    }
  }, [setNoteContext]);
  
  // Update context when content changes
  useEffect(() => {
    setNoteContext(prev => ({...prev, noteContent: content}));
  }, [content, setNoteContext]);


  const handleCreateNote = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      router.push(`/dashboard/notes/${newNote.id}/edit`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image", "video"],
        ["code-block"],
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
      <div className="p-8">
        <form onSubmit={handleCreateNote}>
          <div className="mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold bg-transparent text-black border-none focus:outline-none focus:ring-0"
              placeholder="Judul Catatan"
            />
          </div>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="quill-editor"
            style={{ height: "400px", marginBottom: "50px" }}
          />
          <div className="mt-8">
            <label
              htmlFor="folder"
              className="block text-sm font-medium text-black"
            >
              Folder
            </label>
            <div className="mt-1">
              <select
                id="folder"
                name="folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="block w-full max-w-xs px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              >
                <option value="">Tidak ada Folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              disabled={loading}
              className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 text-sm font-medium text-black bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Membuat..." : "Buat Catatan"}
            </button>
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