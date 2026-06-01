"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import "@/app/quill-editor.css";
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
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
  const { setNoteContext, isAiSidebarOpen, setIsAiSidebarOpen } = useDashboard();

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
  const [isExportingPdf, setIsExportingPdf] = useState(false);
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

  const handleExportPdf = async () => {
    if (!note) return;
    setIsExportingPdf(true);
    const toastId = toast.loading(language === 'id' ? 'Menyiapkan berkas PDF...' : 'Preparing PDF file...');

    try {
      const cleanFileName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'catatan';
      const formattedDate = new Date(note.updatedAt || Date.now()).toLocaleDateString(
        language === 'id' ? 'id-ID' : 'en-US',
        { day: 'numeric', month: 'long', year: 'numeric' }
      );
      const footerText = language === 'id'
        ? 'Dibuat dengan Catat Pintar — Belajar jadi lebih mudah'
        : 'Created with Catat Pintar — Learning made easy';

      // Build a self-contained HTML document for the print iframe
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* ===== Reset & Base ===== */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4;
      margin: 22mm 18mm 42mm 18mm;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1f2937;
      background: #fff;
      padding-bottom: 40mm;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* ===== Header ===== */
    .pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 2.5px solid #00A2D8;
      margin-bottom: 32px;
    }
    .pdf-header .brand {
      font-size: 16pt;
      font-weight: 800;
      color: #00A2D8;
      letter-spacing: -0.02em;
    }
    .pdf-header .brand span {
      color: #0e7490;
    }
    .pdf-header .date {
      font-size: 9pt;
      color: #6b7280;
      font-weight: 500;
    }

    /* ===== Title ===== */
    .pdf-title {
      font-size: 22pt;
      font-weight: 800;
      color: #111827;
      line-height: 1.25;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    .pdf-meta {
      font-size: 9pt;
      color: #9ca3af;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    /* ===== Content ===== */
    .pdf-body {
      font-size: 11pt;
      line-height: 1.75;
      color: #374151;
    }

    .pdf-body h1 {
      font-size: 18pt;
      font-weight: 800;
      color: #111827;
      margin-top: 28px;
      margin-bottom: 10px;
      line-height: 1.3;
      letter-spacing: -0.01em;
      page-break-after: avoid;
    }
    .pdf-body h2 {
      font-size: 15pt;
      font-weight: 700;
      color: #1f2937;
      margin-top: 24px;
      margin-bottom: 8px;
      line-height: 1.35;
      page-break-after: avoid;
    }
    .pdf-body h3 {
      font-size: 13pt;
      font-weight: 700;
      color: #374151;
      margin-top: 20px;
      margin-bottom: 6px;
      line-height: 1.4;
      page-break-after: avoid;
    }
    .pdf-body h4, .pdf-body h5, .pdf-body h6 {
      font-size: 11pt;
      font-weight: 700;
      color: #374151;
      margin-top: 16px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }

    .pdf-body p {
      margin-bottom: 10px;
      orphans: 3;
      widows: 3;
    }

    .pdf-body strong { font-weight: 700; color: #111827; }
    .pdf-body em { font-style: italic; }
    .pdf-body u { text-decoration: underline; text-underline-offset: 2px; }
    .pdf-body s { text-decoration: line-through; color: #9ca3af; }

    .pdf-body a {
      color: #00A2D8;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    /* Lists */
    .pdf-body ul, .pdf-body ol {
      padding-left: 24px;
      margin-bottom: 12px;
    }
    .pdf-body li {
      margin-bottom: 4px;
      line-height: 1.65;
    }
    .pdf-body ul li { list-style-type: disc; }
    .pdf-body ol li { list-style-type: decimal; }
    .pdf-body li > ul, .pdf-body li > ol {
      margin-top: 4px;
      margin-bottom: 4px;
    }

    /* Blockquote */
    .pdf-body blockquote {
      border-left: 4px solid #00A2D8;
      background: #f0f9ff;
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 0 8px 8px 0;
      color: #0c4a6e;
      font-style: italic;
      page-break-inside: avoid;
    }

    /* Code blocks */
    .pdf-body pre {
      background: #1e293b !important;
      color: #e2e8f0 !important;
      padding: 16px 20px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 9pt;
      line-height: 1.6;
      overflow-x: auto;
      margin: 16px 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      page-break-inside: avoid;
      border: 1px solid #334155;
    }

    .pdf-body code {
      background: #f1f5f9;
      color: #dc2626;
      padding: 1px 5px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 0.9em;
    }

    .pdf-body pre code {
      background: none;
      color: inherit;
      padding: 0;
      border-radius: 0;
      font-size: inherit;
    }

    /* Images */
    .pdf-body img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 16px auto;
      display: block;
      page-break-inside: avoid;
    }

    /* Tables */
    .pdf-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }
    .pdf-body th, .pdf-body td {
      border: 1px solid #d1d5db;
      padding: 8px 12px;
      text-align: left;
    }
    .pdf-body th {
      background: #f3f4f6;
      font-weight: 700;
      color: #111827;
    }
    .pdf-body tr:nth-child(even) td {
      background: #f9fafb;
    }

    /* Horizontal rule */
    .pdf-body hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 20px 0;
    }

    /* ===== Footer ===== */
    .pdf-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 18mm;
      font-size: 8pt;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      background: #fff;
    }

    /* ===== Quill-specific overrides ===== */
    .pdf-body .ql-indent-1 { padding-left: 3em; }
    .pdf-body .ql-indent-2 { padding-left: 6em; }
    .pdf-body .ql-indent-3 { padding-left: 9em; }
    .pdf-body .ql-indent-4 { padding-left: 12em; }
    .pdf-body .ql-indent-5 { padding-left: 15em; }
    .pdf-body .ql-indent-6 { padding-left: 18em; }
    .pdf-body .ql-indent-7 { padding-left: 21em; }
    .pdf-body .ql-indent-8 { padding-left: 24em; }

    .pdf-body .ql-align-center { text-align: center; }
    .pdf-body .ql-align-right { text-align: right; }
    .pdf-body .ql-align-justify { text-align: justify; }

    .pdf-body .ql-size-small { font-size: 9pt; }
    .pdf-body .ql-size-large { font-size: 14pt; }
    .pdf-body .ql-size-huge { font-size: 18pt; }

    .pdf-body .ql-font-serif { font-family: Georgia, 'Times New Roman', serif; }
    .pdf-body .ql-font-monospace { font-family: 'JetBrains Mono', 'Fira Code', monospace; }

    .pdf-body .ql-syntax {
      background: #1e293b !important;
      color: #e2e8f0 !important;
      padding: 16px 20px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 9pt;
      line-height: 1.6;
      overflow-x: auto;
      margin: 16px 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      page-break-inside: avoid;
      border: 1px solid #334155;
    }

    /* Video embeds */
    .pdf-body iframe, .pdf-body .ql-video {
      display: none; /* Hide video embeds in PDF */
    }
    .pdf-body .ql-video::after {
      content: '[Video content - view in app]';
      display: block;
      font-style: italic;
      color: #9ca3af;
      font-size: 9pt;
    }

    /* Print specific */
    @media print {
      body {
        background: white;
        padding-bottom: 40mm;
      }
      .pdf-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fff;
      }
    }
  </style>
</head>
<body>
  <div class="pdf-header">
    <div class="brand">Catat <span>Pintar</span></div>
    <div class="date">${formattedDate}</div>
  </div>

  <div class="pdf-title">${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <div class="pdf-meta">E-Notebook &bull; ${formattedDate}</div>

  <div class="pdf-body">${content}</div>

  <div class="pdf-footer">
    <div>${footerText}</div>
    <div>catatpintar.app</div>
  </div>
</body>
</html>`;

      // Create hidden iframe for clean print
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for fonts and content to load
      await new Promise((resolve) => {
        iframe.onload = resolve;
        // Fallback timeout in case onload doesn't fire
        setTimeout(resolve, 2000);
      });

      // Additional wait for web fonts
      await new Promise(resolve => setTimeout(resolve, 800));

      // Trigger the print dialog (user can save as PDF)
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // Cleanup after a delay
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 3000);

      toast.success(
        language === 'id'
          ? 'Dialog cetak PDF terbuka! Pilih "Save as PDF" untuk menyimpan.'
          : 'PDF print dialog opened! Select "Save as PDF" to save.',
        { id: toastId, duration: 5000 }
      );
    } catch (err) {
      console.error(err);
      toast.error(language === 'id' ? 'Gagal ekspor PDF.' : 'Failed to export PDF.', { id: toastId });
    } finally {
      setIsExportingPdf(false);
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
        onExportPdf={handleExportPdf}
        isGenerating={isGenerating}
        isExporting={isExportingPdf}
        noteId={noteId}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {note && note.filePath && (
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 via-white to-blue-50/30 dark:from-blue-950/20 dark:via-gray-800 dark:to-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl gap-4">
            <div className="flex items-center min-w-0">
              <div className={`p-2.5 rounded-xl mr-3 ${note.fileType === 'pdf' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'} flex-shrink-0 font-extrabold text-xs uppercase border border-gray-100 dark:border-gray-700`}>
                {note.fileType || 'doc'}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {language === 'id' ? 'Lampiran Berkas Asli' : 'Original Attachment'}
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                  {note.title}
                </p>
              </div>
            </div>
            <a 
              href={note.filePath} 
              download 
              className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all border border-blue-100/50 dark:border-blue-900/20 w-full sm:w-auto"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Unduh Berkas Asli' : 'Download Original File'}
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
