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

      // Sanitize content: strip all inline font-size and font-family styles from Quill HTML
      // to ensure consistent typography in the PDF output
      const sanitizedContent = content
        .replace(/style\s*=\s*"[^"]*"/gi, (match) => {
          // Remove font-size and font-family from inline styles, keep other styles
          let cleaned = match
            .replace(/font-size\s*:\s*[^;"]+;?/gi, '')
            .replace(/font-family\s*:\s*[^;"]+;?/gi, '')
            .replace(/color\s*:\s*[^;"]+;?/gi, '');
          // If style is now empty, remove it entirely
          if (cleaned.replace(/style\s*=\s*"[\s;]*"/i, '').trim() === '') return '';
          return cleaned;
        })
        .replace(/class\s*=\s*"[^"]*ql-size-[^"]*"/gi, (match) => {
          // Remove ql-size classes to prevent oversized text
          return match.replace(/ql-size-\w+/g, '').replace(/\s+/g, ' ');
        });

      // Build a self-contained HTML document for the print iframe
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    /* ===== Reset ===== */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4;
      margin: 20mm 18mm 18mm 18mm;
    }

    body {
      font-family: 'Crimson Pro', 'Times New Roman', Georgia, serif;
      font-size: 10pt;
      line-height: 1.7;
      color: #2d3748;
      background: #fff;
      font-weight: 400;
      letter-spacing: 0.005em;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      -webkit-font-smoothing: antialiased;
    }

    /* ===== Layout ===== */
    .print-container { width: 100%; border-collapse: collapse; }
    .pdf-header-space { height: 42px; }
    .pdf-footer-space { height: 32px; }

    /* ===== Running Header ===== */
    .pdf-header {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 0.5pt solid #cbd5e0;
      background: #fff;
      padding-bottom: 4px;
      z-index: 1000;
    }
    .pdf-header .brand {
      font-family: 'Crimson Pro', 'Times New Roman', Georgia, serif;
      font-size: 9.5pt;
      font-weight: 700;
      color: #2d3748;
      letter-spacing: 0.02em;
    }
    .pdf-header .date {
      font-size: 7.5pt;
      color: #a0aec0;
      font-weight: 400;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    /* ===== Title Area ===== */
    .pdf-title-block {
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 0.5pt solid #e2e8f0;
    }
    .pdf-title {
      font-family: 'Crimson Pro', 'Times New Roman', Georgia, serif;
      font-size: 20pt;
      font-weight: 700;
      color: #1a202c;
      line-height: 1.2;
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }
    .pdf-meta {
      font-size: 8pt;
      color: #a0aec0;
      font-weight: 400;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* ===== Body Content ===== */
    .pdf-body {
      font-size: 10pt;
      line-height: 1.7;
      color: #2d3748;
    }

    /* — Force all text inside pdf-body to inherit consistent sizing — */
    .pdf-body * {
      font-size: inherit !important;
      line-height: inherit !important;
    }

    /* — Headings — */
    .pdf-body h1, .pdf-body h2, .pdf-body h3,
    .pdf-body h4, .pdf-body h5, .pdf-body h6 {
      font-family: 'Crimson Pro', 'Times New Roman', Georgia, serif !important;
      color: #1a202c;
      line-height: 1.25 !important;
      page-break-after: avoid;
      break-after: avoid;
      font-weight: 700;
    }
    .pdf-body h1 {
      font-size: 16pt !important;
      margin: 22px 0 8px 0;
      padding-bottom: 4px;
      border-bottom: 0.5pt solid #e2e8f0;
    }
    .pdf-body h2 {
      font-size: 13pt !important;
      margin: 18px 0 6px 0;
    }
    .pdf-body h3 {
      font-size: 11.5pt !important;
      margin: 14px 0 5px 0;
    }
    .pdf-body h4, .pdf-body h5, .pdf-body h6 {
      font-size: 10pt !important;
      margin: 12px 0 4px 0;
      font-weight: 600;
    }

    /* — Paragraphs — */
    .pdf-body p {
      margin-bottom: 8px;
      orphans: 3;
      widows: 3;
      text-align: justify;
      hyphens: auto;
    }

    .pdf-body strong { font-weight: 700; color: #1a202c; }
    .pdf-body em { font-style: italic; }
    .pdf-body u { text-decoration: underline; text-underline-offset: 2px; }
    .pdf-body s { text-decoration: line-through; color: #a0aec0; }

    .pdf-body a {
      color: #00A2D8;
      text-decoration: none;
      border-bottom: 0.5pt solid #00A2D8;
    }

    /* — Lists — */
    .pdf-body ul, .pdf-body ol {
      padding-left: 18px;
      margin: 4px 0 10px 0;
    }
    .pdf-body li {
      margin-bottom: 3px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .pdf-body ul li { list-style-type: disc; }
    .pdf-body ol li { list-style-type: decimal; }
    .pdf-body li > ul, .pdf-body li > ol {
      margin-top: 2px;
      margin-bottom: 2px;
    }
    .pdf-body ul ul li { list-style-type: circle; }
    .pdf-body ul ul ul li { list-style-type: square; }

    /* — Blockquote — */
    .pdf-body blockquote {
      border-left: 2.5pt solid #00A2D8;
      background: #f7fafc;
      padding: 10px 14px;
      margin: 12px 0;
      border-radius: 0 4px 4px 0;
      color: #4a5568;
      font-style: italic;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* — Code — */
    .pdf-body pre, .pdf-body .ql-syntax {
      background: #f7fafc !important;
      color: #2d3748 !important;
      padding: 10px 14px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', Consolas, monospace !important;
      font-size: 8pt !important;
      line-height: 1.5 !important;
      overflow-x: auto;
      margin: 10px 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      page-break-inside: avoid;
      break-inside: avoid;
      border: 0.5pt solid #e2e8f0 !important;
    }

    .pdf-body code {
      background: #edf2f7;
      color: #c53030;
      padding: 1px 4px;
      border-radius: 3px;
      font-family: 'JetBrains Mono', Consolas, monospace !important;
      font-size: 8.5pt !important;
    }

    .pdf-body pre code {
      background: none;
      color: inherit;
      padding: 0;
      border-radius: 0;
      font-size: inherit !important;
    }

    /* Highlight.js tokens */
    .hljs-comment, .hljs-quote { color: #718096; font-style: italic; }
    .hljs-keyword, .hljs-selector-tag, .hljs-subst { color: #5a67d8; font-weight: 600; }
    .hljs-number, .hljs-literal, .hljs-variable, .hljs-template-variable, .hljs-tag .hljs-attr { color: #c05621; }
    .hljs-string, .hljs-doctag, .hljs-regexp { color: #2b6cb0; }
    .hljs-title, .hljs-section, .hljs-selector-id { color: #6b46c1; font-weight: 600; }
    .hljs-type, .hljs-class .hljs-title { color: #b83280; }
    .hljs-params, .hljs-attr { color: #2d3748; }
    .hljs-built_in, .hljs-bullet { color: #c53030; }

    /* — Images — */
    .pdf-body img {
      max-width: 85%;
      height: auto;
      border-radius: 4px;
      margin: 12px auto;
      display: block;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* — Tables — */
    .pdf-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .pdf-body th, .pdf-body td {
      border: 0.5pt solid #e2e8f0;
      padding: 6px 10px;
      text-align: left;
      font-size: 9pt !important;
      line-height: 1.4 !important;
    }
    .pdf-body th {
      background: #f7fafc;
      font-weight: 600;
      color: #1a202c;
      font-size: 8.5pt !important;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .pdf-body tr:nth-child(even) td { background: #fafbfc; }

    /* — HR — */
    .pdf-body hr {
      border: none;
      border-top: 0.5pt solid #e2e8f0;
      margin: 16px 0;
    }

    /* ===== Running Footer ===== */
    .pdf-footer {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      height: 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 0.5pt solid #e2e8f0;
      background: #fff;
      padding-top: 4px;
      font-size: 7pt;
      color: #a0aec0;
      letter-spacing: 0.03em;
      z-index: 1000;
    }

    /* ===== Quill Overrides ===== */
    .pdf-body .ql-indent-1 { margin-left: 2em !important; }
    .pdf-body .ql-indent-2 { margin-left: 4em !important; }
    .pdf-body .ql-indent-3 { margin-left: 6em !important; }
    .pdf-body .ql-indent-4 { margin-left: 8em !important; }
    .pdf-body .ql-indent-5 { margin-left: 10em !important; }
    .pdf-body .ql-indent-6 { margin-left: 12em !important; }
    .pdf-body .ql-indent-7 { margin-left: 14em !important; }
    .pdf-body .ql-indent-8 { margin-left: 16em !important; }

    .pdf-body .ql-align-center { text-align: center; }
    .pdf-body .ql-align-right { text-align: right; }
    .pdf-body .ql-align-justify { text-align: justify; }

    /* Force Quill size classes to consistent sizes */
    .pdf-body .ql-size-small { font-size: 9pt !important; }
    .pdf-body .ql-size-large { font-size: 10pt !important; }
    .pdf-body .ql-size-huge { font-size: 10pt !important; }

    .pdf-body .ql-font-serif { font-family: 'Crimson Pro', 'Times New Roman', Georgia, serif !important; }
    .pdf-body .ql-font-monospace { font-family: 'JetBrains Mono', Consolas, monospace !important; }

    /* Hide video embeds */
    .pdf-body iframe, .pdf-body .ql-video { display: none; }

    /* — Span color overrides (strip Quill inline colors for clean print) — */
    .pdf-body span[style*="color"] { color: inherit !important; }
    .pdf-body span[style*="background"] { background: transparent !important; }

    @media print {
      body { background: white; }
    }
  </style>
</head>
<body>
  <table class="print-container">
    <thead><tr><td><div class="pdf-header-space"></div></td></tr></thead>
    <tbody>
      <tr>
        <td>
          <div class="pdf-title-block">
            <div class="pdf-title">${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <div class="pdf-meta">E-Notebook &bull; ${formattedDate}</div>
          </div>
          <div class="pdf-body">${sanitizedContent}</div>
        </td>
      </tr>
    </tbody>
    <tfoot><tr><td><div class="pdf-footer-space"></div></td></tr></tfoot>
  </table>

  <div class="pdf-header">
    <div class="brand">Catat Pintar</div>
    <div class="date">${formattedDate}</div>
  </div>

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
