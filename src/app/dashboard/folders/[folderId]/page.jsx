"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faClock, faCode, faFileCirclePlus, faFileLines, faImage, faMagnifyingGlass, faPlus, faTable, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { EmptyState, ErrorNote, Page, Spinner, cls } from "../../../components/ui/kit";
import { useLanguage } from "../../../../lib/contexts/LanguageContext";

/**
 * Ringkas isi catatan untuk pratinjau: judul bagian pertama, beberapa poin, jumlah kata,
 * dan penanda isi (gambar/tabel/kode). HTML hanya DIBACA sebagai teks, tidak dirender.
 */
function summarize(html = "") {
  const empty = { heading: "", points: [], words: 0, img: false, table: false, code: false, text: "" };
  if (!html || typeof window === "undefined") return empty;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
  const cut = (t, n = 110) => (t.length > n ? `${t.slice(0, n).trimEnd()}…` : t);

  const text = clean(doc.body.textContent);
  const heading = clean(doc.querySelector("h1,h2,h3")?.textContent);

  let points = [...doc.querySelectorAll("li")].map((li) => clean(li.textContent)).filter(Boolean);
  if (points.length < 2) {
    const paras = [...doc.querySelectorAll("p")].map((x) => clean(x.textContent)).filter((t) => t && t !== heading);
    points = [...points, ...paras];
  }
  if (points.length === 0 && text) points = [text];

  return {
    heading: cut(heading, 80),
    points: points.filter((t) => t !== heading).slice(0, 3).map((t) => cut(t)),
    words: text ? text.split(" ").length : 0,
    img: !!doc.querySelector("img"),
    table: !!doc.querySelector("table"),
    code: !!doc.querySelector("pre,code"),
    text: text.toLowerCase(),
  };
}

const BADGE = { pdf: "bg-[var(--hl-pink)]", ppt: "bg-[var(--hl-yellow)]", pptx: "bg-[var(--hl-yellow)]" };
const stripExt = (title = "") => title.replace(/\.(pdf|pptx?|docx?)$/i, "");

function NoteCard({ note, isId }) {
  const sum = useMemo(() => summarize(note.content), [note.content]);
  const ext = (note.fileType || "").toLowerCase();
  const minutes = Math.max(1, Math.round(sum.words / 200));

  return (
    <Link href={`/dashboard/notes/${note.id}/edit`} className={`group flex h-full flex-col overflow-hidden ${cls.card} ${cls.cardHover}`}>
      {/* Halaman mini */}
      <div className={`ruled relative h-36 overflow-hidden border-b-2 border-[var(--rule)] pt-1.5 pl-10 ${ext ? "pr-16" : "pr-4"}`}>
        <span className="margin-line left-6" aria-hidden="true" />
        {sum.heading && <p className="truncate text-sm leading-8 font-extrabold">{sum.heading}</p>}
        {sum.points.length > 0 ? (
          <ul>
            {sum.points.map((pt, i) => (
              <li key={i} className="flex items-baseline gap-2 text-[13px] leading-8 text-[var(--ink-soft)]">
                <span className="relative -top-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--margin)] opacity-70" aria-hidden="true" />
                <span className="truncate">{pt}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hand text-xl leading-8 text-[var(--ink-soft)]">{isId ? "catatan masih kosong" : "empty note"}</p>
        )}
        {ext && (
          <span className={`absolute top-2.5 right-3 rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase text-[var(--ink-fixed)] ${BADGE[ext] || "bg-[var(--hl-blue)]"}`}>
            {ext}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base leading-snug font-extrabold group-hover:underline group-hover:decoration-[var(--hl-yellow)] group-hover:decoration-4 group-hover:underline-offset-4">
          {stripExt(note.title)}
        </h3>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs font-semibold text-[var(--ink-soft)]">
          <span className="inline-flex items-center gap-1.5">
            <FontAwesomeIcon icon={faClock} />
            {new Date(note.updatedAt).toLocaleDateString(isId ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FontAwesomeIcon icon={faFileLines} />
            {sum.words.toLocaleString(isId ? "id-ID" : "en-US")} {isId ? "kata" : "words"}
          </span>
          {sum.words > 0 && <span>±{minutes} {isId ? "mnt baca" : "min read"}</span>}
          <span className="ml-auto flex gap-2 text-[var(--ink-soft)]">
            {sum.img && <FontAwesomeIcon icon={faImage} title={isId ? "Ada gambar" : "Has images"} />}
            {sum.table && <FontAwesomeIcon icon={faTable} title={isId ? "Ada tabel" : "Has tables"} />}
            {sum.code && <FontAwesomeIcon icon={faCode} title={isId ? "Ada kode" : "Has code"} />}
          </span>
        </div>
      </div>
    </Link>
  );
}

const FolderNotesPage = () => {
  const params = useParams();
  const router = useRouter();
  const { folderId } = params;
  const { language } = useLanguage();
  const isId = language === "id";

  const [folder, setFolder] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!folderId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [folderRes, notesRes] = await Promise.all([
          fetch(`/api/folders/${folderId}`),
          fetch(`/api/notes?folderId=${folderId}`),
        ]);

        if (!folderRes.ok) {
          throw new Error("Folder tidak ditemukan atau Anda tidak memiliki akses.");
        }
        if (!notesRes.ok) {
          throw new Error("Gagal mengambil catatan untuk folder ini.");
        }

        const folderData = await folderRes.json();
        const notesData = await notesRes.json();

        setFolder(folderData);
        setNotes(notesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [folderId]);
  
  if (loading) return <Spinner className="h-[calc(100vh-140px)]" />;

  if (error)
    return (
      <Page>
        <ErrorNote>Kesalahan: {error}</ErrorNote>
      </Page>
    );

  const q = query.trim().toLowerCase();
  const visible = q
    ? notes.filter((n) => (n.title || "").toLowerCase().includes(q) || (n.content || "").replace(/<[^>]*>/g, " ").toLowerCase().includes(q))
    : notes;

  return (
    <Page wide>
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        {isId ? "Kembali" : "Back"}
      </button>

      <header className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{folder ? folder.name : "Folder"}</h1>
          <p className="hand mt-1 text-2xl text-[var(--margin)]">
            {notes.length} {isId ? "catatan di folder ini" : "notes in this folder"}
          </p>
        </div>
        <Link href="/dashboard/notes/new" className="btn-ink h-11 self-start px-5 md:self-auto">
          <FontAwesomeIcon icon={faPlus} />
          {isId ? "Catatan baru" : "New note"}
        </Link>
      </header>

      {notes.length > 2 && (
        <div className="relative mt-6 max-w-md">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isId ? "Cari di folder ini…" : "Search this folder…"}
            aria-label={isId ? "Cari catatan di folder ini" : "Search notes in this folder"}
            className={`${cls.input} pr-10 pl-11`}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Hapus pencarian" className={`absolute top-1/2 right-1.5 -translate-y-1/2 ${cls.iconBtn} h-8 w-8`}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
      )}

      <div className="mt-8">
        {notes.length === 0 ? (
          <EmptyState
            icon={faFileCirclePlus}
            title={isId ? "Belum ada catatan" : "No notes yet"}
            text={isId ? "ayo isi folder ini dengan catatan barumu!" : "fill this folder with your first note!"}
          >
            <Link href="/dashboard/notes/new" className="btn-ink h-11 px-5">
              <FontAwesomeIcon icon={faPlus} />
              {isId ? "Buat catatan pertama" : "Create first note"}
            </Link>
          </EmptyState>
        ) : visible.length === 0 ? (
          <p className="text-[var(--ink-soft)]">{isId ? `Tidak ada catatan yang cocok dengan "${query}".` : `No notes match "${query}".`}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((note) => (
              <li key={note.id} className="min-w-0">
                <NoteCard note={note} isId={isId} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Page>
  );
};

export default FolderNotesPage;
