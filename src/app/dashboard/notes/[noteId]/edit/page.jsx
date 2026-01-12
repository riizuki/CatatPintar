"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import 'highlight.js/styles/monokai.css'; // Import highlight.js CSS for code blocks
import { TrashIcon, SparklesIcon, QuestionMarkCircleIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import AIChat from "@/app/components/dashboard/AIChat";

const modules = {
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
    ["code-block"], // Add code block button
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
  syntax: true, // Enable syntax highlighting
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "code-block", // Add code block format
];

const EditNotePage = () => {
  const router = useRouter();
  const params = useParams();
  const { noteId } = params;

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
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [noteId]);

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

  const handleDelete = async () => {
    if (window.confirm("Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan.")) {
      setIsDeleting(true);
      setError("");
      try {
        const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal menghapus catatan.");
        router.push("/dashboard");
      } catch (err) {
        setError(err.message);
        setIsDeleting(false);
      }
    }
  };

      const handleGenerate = async (type) => {
      setIsGenerating(type);
      setError('');
      try {
          const url = type === 'flashcards' ? '/api/generate/flashcards' : '/api/generate/quiz';
          let requestBody;
  
          if (type === 'flashcards') {
              requestBody = { noteId: parseInt(noteId) };
          } else { 
              requestBody = { sourceType: 'note', sourceValue: noteId };
          }
  
          const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody), 
          });
  
          if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || `Gagal membuat ${type}`);
          }
        
        if (type === 'quiz') {
            const { quizId } = await res.json();
            router.push(`/dashboard/quiz/${quizId}`);
        } else {
            router.push(`/dashboard/flashcards?noteId=${noteId}`);
        }

    } catch (err) {
        setError(err.message);
    } finally {
        setIsGenerating(null);
    }
  };

  if (loading) return <div className="p-8">Memuat...</div>;
  if (error && !note) return <div className="p-8 text-red-500">Kesalahan: {error}</div>;


  return (
    <div className="p-8">
      <form onSubmit={handleSaveChanges}>
        <div className="flex justify-between items-start mb-8">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-4xl font-bold bg-transparent text-black border-none focus:outline-none focus:ring-0"
                placeholder="Judul Catatan"
            />
            <div className="flex space-x-2">
                <button
                    type="button"
                    onClick={() => setIsAiChatOpen(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    title="Tanya AI tentang catatan ini"
                >
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2"/>
                    Tanya AI
                </button>
                <button
                    type="button"
                    onClick={() => handleGenerate('flashcards')}
                    disabled={isGenerating}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50 whitespace-nowrap"
                    title="Buat Flashcard dari Catatan Ini"
                >
                    <SparklesIcon className="w-5 h-5 mr-2"/>
                    {isGenerating === 'flashcards' ? 'Membuat...' : 'Flashcard'}
                </button>
                 <button
                    type="button"
                    onClick={() => handleGenerate('quiz')}
                    disabled={isGenerating}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50 whitespace-nowrap"
                    title="Buat Kuis dari Catatan Ini"
                >
                    <QuestionMarkCircleIcon className="w-5 h-5 mr-2"/>
                    {isGenerating === 'quiz' ? 'Membuat...' : 'Buat Kuis'}
                </button>
            </div>
        </div>
        
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="bg-white text-black"
          style={{ height: "400px", marginBottom: "50px" }}
          modules={modules}
          formats={formats}
        />
        <div className="mt-8">
          <label htmlFor="folder" className="block text-sm font-medium text-black">Folder</label>
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
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        <div className="mt-8 flex justify-between items-center">
            <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50"
            >
                <TrashIcon className="w-5 h-5 mr-2" />
                {isDeleting ? 'Menghapus...' : 'Hapus Catatan'}
            </button>
            <div className="flex space-x-4">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-2 text-sm font-medium text-black bg-gray-200 rounded-md hover:bg-gray-300"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
        </div>
      </form>
      {isAiChatOpen && <AIChat noteContent={content} onClose={() => setIsAiChatOpen(false)} />}
    </div>
  );
};

export default EditNotePage;