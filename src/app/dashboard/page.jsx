"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faClock,
  faFileLines,
  faFolder,
  faMagnifyingGlass,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import FolderModal from "@/app/components/dashboard/FolderModal";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { dashboardTranslations } from "@/locales/dashboard";

const getGreeting = (t) => {
  const hour = new Date().getHours();
  if (hour < 12) return t.home.greeting.morning;
  if (hour < 15) return t.home.greeting.afternoon;
  if (hour < 18) return t.home.greeting.evening;
  return t.home.greeting.night;
};

const folderColors = ["text-sky-500", "text-amber-500", "text-emerald-500", "text-pink-500", "text-violet-500"];

/* ---------- Komponen kecil ---------- */

function SectionTitle({ icon, children, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
        <FontAwesomeIcon icon={icon} className="text-base text-[var(--ink-soft)]" />
        {children}
      </h2>
      {action}
    </div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-[var(--rule)] ${className}`} />;
}

function EmptyNote({ title, text, children }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-[var(--rule)] px-6 py-10 text-center">
      <p className="text-lg font-bold">{title}</p>
      <p className="hand mt-1 text-xl text-[var(--ink-soft)]">{text}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

/* ---------- Halaman ---------- */

function DashboardContent() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [greeting, setGreeting] = useState("");
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  const locale = language === "id" ? "id-ID" : "en-US";

  useEffect(() => {
    setGreeting(getGreeting(t));
    const fetchData = async () => {
      setError("");
      try {
        const query = searchTerm ? `?search=${searchTerm}` : "";

        const [recentRes, allRes, foldersRes, quizzesRes] = await Promise.all([
          fetch(`/api/notes?recent=true${query}`),
          fetch(`/api/notes${query}`),
          fetch("/api/folders"),
          fetch("/api/quizzes").catch(() => null),
        ]);

        if (!recentRes.ok || !allRes.ok) {
          throw new Error("Gagal mengambil catatan");
        }
        if (!foldersRes.ok) {
          throw new Error("Gagal mengambil folder");
        }

        const recentData = await recentRes.json();
        const allData = await allRes.json();
        const foldersData = await foldersRes.json();

        let quizzesData = [];
        if (quizzesRes && quizzesRes.ok) {
          quizzesData = await quizzesRes.json();
        }

        setRecentNotes(recentData);
        setNotes(allData);
        setFolders(foldersData);
        setQuizzes(quizzesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsInitialLoad(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [searchTerm, language]);

  const handleSaveFolder = async (folderData) => {
    setIsMutating(true);
    setError("");
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderData.name }),
      });
      if (!res.ok) throw new Error("Gagal membuat folder.");

      const foldersRes = await fetch("/api/folders");
      const foldersData = await foldersRes.json();
      setFolders(foldersData);

      setIsFolderModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsMutating(false);
    }
  };

  /* ---------- Statistik belajar ---------- */
  const completedQuizzes = quizzes.filter((q) => q.result !== null);
  const quizzesCount = completedQuizzes.length;

  const averageScore =
    quizzesCount > 0
      ? Math.round(completedQuizzes.reduce((sum, q) => sum + q.result.score, 0) / quizzesCount)
      : 0;

  let comprehensionLevel = t.home.stats.none;
  let comprehensionHl = "";
  if (quizzesCount > 0) {
    if (averageScore >= 90) {
      comprehensionLevel = t.home.stats.excellent;
      comprehensionHl = "hl-green";
    } else if (averageScore >= 75) {
      comprehensionLevel = t.home.stats.good;
      comprehensionHl = "hl-blue";
    } else if (averageScore >= 50) {
      comprehensionLevel = t.home.stats.fair;
      comprehensionHl = "hl-yellow";
    } else {
      comprehensionLevel = t.home.stats.needsStudy;
      comprehensionHl = "hl-pink";
    }
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyProgressCount = completedQuizzes.filter((q) => new Date(q.result.takenAt) >= sevenDaysAgo).length;

  const lowScoreQuizzes = completedQuizzes
    .filter((q) => q.result.score < 80)
    .sort((a, b) => a.result.score - b.result.score);
  const challengingTopic = lowScoreQuizzes.length > 0 ? lowScoreQuizzes[0] : null;

  const noQuizSub = t.home.stats?.noQuizTakenSub || "Mulai kuis untuk melihat statistik";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSave={handleSaveFolder}
        isLoading={isMutating}
      />

      {/* ---------- Sapaan ---------- */}
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl" suppressHydrationWarning>
            {greeting}, {session?.user?.name || t.home.greeting.friend}.
          </h1>
          <p className="hand mt-1 rotate-[-1deg] text-2xl text-[var(--margin)]">{t.home.whatToStudy}</p>
        </div>
        <Link href="/dashboard/notes/new" className="btn-ink hidden self-start px-5 py-3 md:inline-flex md:self-auto">
          <FontAwesomeIcon icon={faPlus} />
          {t.home.createNewNote}
        </Link>
      </header>

      {/* ---------- Pencarian ---------- */}
      <div className="relative mt-8">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[var(--ink-soft)]"
        />
        <input
          type="text"
          placeholder={t.home.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setSearchTerm("")}
          autoComplete="off"
          aria-label={t.home.searchPlaceholder}
          className="block w-full rounded-xl border-2 border-[var(--rule)] bg-[var(--card)] py-3.5 pr-12 pl-11 text-base text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink-soft)]/70 focus:border-[var(--ink-soft)]"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            aria-label="Hapus pencarian"
            className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--rule)]"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border-2 border-[var(--wrong)] px-4 py-3 font-medium text-[var(--wrong)]">
          {error}
        </p>
      )}

      {/* ---------- Rapor belajar ---------- */}
      <section className="mt-10" aria-labelledby="rapor">
        <h2 id="rapor" className="sr-only">{t.home.stats?.title || "Statistik Belajar"}</h2>
        <div className="grid grid-cols-1 overflow-hidden rounded-xl border-2 border-[var(--rule)] bg-[var(--card)] sm:grid-cols-2 lg:grid-cols-4">
          {/* Rata-rata */}
          <div className="border-b-2 border-[var(--rule)] p-5 sm:border-r-2 lg:border-b-0">
            <p className="text-sm font-semibold text-[var(--ink-soft)]">{t.home.stats?.avgScore || "Rata-rata kuis"}</p>
            <p className="mt-2 text-4xl font-extrabold">
              {quizzesCount > 0 ? averageScore : "–"}
              {quizzesCount > 0 && <span className="text-lg font-bold text-[var(--ink-soft)]"> /100</span>}
            </p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {quizzesCount > 0
                ? (t.home.stats?.avgScoreSub || "Dari {count} kuis selesai").replace("{count}", quizzesCount)
                : noQuizSub}
            </p>
          </div>

          {/* Pemahaman */}
          <div className="border-b-2 border-[var(--rule)] p-5 lg:border-r-2 lg:border-b-0">
            <p className="text-sm font-semibold text-[var(--ink-soft)]">{t.home.stats?.comprehension || "Pemahaman"}</p>
            <p className="mt-2 text-2xl font-extrabold leading-10">
              {quizzesCount > 0 ? <span className={`hl ${comprehensionHl}`}>{comprehensionLevel}</span> : "–"}
            </p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {quizzesCount > 0 ? t.home.stats?.comprehensionSub || "Berdasarkan performa kuis" : noQuizSub}
            </p>
          </div>

          {/* Minggu ini */}
          <div className="border-b-2 border-[var(--rule)] p-5 sm:border-r-2 sm:border-b-0">
            <p className="text-sm font-semibold text-[var(--ink-soft)]">{t.home.stats?.weeklyProgress || "Progress belajar"}</p>
            <p className="mt-2 text-4xl font-extrabold">
              {weeklyProgressCount}
              <span className="text-lg font-bold text-[var(--ink-soft)]"> {t.home.stats?.weekActivity || "kuis minggu ini"}</span>
            </p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {notes.length} {t.home.stats?.notesCount || "catatan dibuat"}
            </p>
          </div>

          {/* Perlu ditinjau */}
          <div className="p-5">
            <p className="text-sm font-semibold text-[var(--ink-soft)]">{t.home.stats?.challengingTopic || "Perlu ditinjau"}</p>
            {challengingTopic ? (
              <Link
                href={`/dashboard/quiz/${challengingTopic.id}`}
                className="group mt-2 flex items-center justify-between gap-2 rounded-lg border-2 border-[var(--wrong)]/40 px-3 py-2 hover:border-[var(--wrong)]"
              >
                <span className="min-w-0">
                  <span className="block truncate font-bold">{challengingTopic.sourceValue}</span>
                  <span className="text-sm text-[var(--wrong)]">Skor {challengingTopic.result.score}</span>
                </span>
                <FontAwesomeIcon icon={faChevronRight} className="text-sm text-[var(--wrong)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <p className="mt-2 text-4xl font-extrabold">–</p>
            )}
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {challengingTopic ? t.home.stats?.challengingTopicSub || "Materi dengan skor terendah" : noQuizSub}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-12 lg:col-span-8">
          {/* ---------- Lanjutkan belajar ---------- */}
          <section>
            <SectionTitle icon={faClock}>{t.home.continueLearning}</SectionTitle>
            {isInitialLoad ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            ) : recentNotes.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {recentNotes.slice(0, 2).map((note, i) => (
                  <Link
                    key={note.id}
                    href={`/dashboard/notes/${note.id}/edit`}
                    className={`ruled group relative flex h-40 flex-col overflow-hidden rounded-xl border-2 border-[var(--rule)] bg-[var(--card)] pt-1.5 pb-4 pr-5 pl-10 transition-colors hover:border-[var(--ink-soft)] ${
                      i % 2 ? "rotate-[0.4deg]" : "rotate-[-0.4deg]"
                    }`}
                  >
                    <span className="margin-line left-6" aria-hidden="true" />
                    <h3 className="line-clamp-2 text-lg font-bold leading-8">{note.title}</h3>
                    <p className="mt-auto flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                      <FontAwesomeIcon icon={faClock} />
                      {new Date(note.updatedAt).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                      <FontAwesomeIcon icon={faChevronRight} className="ml-auto transition-transform group-hover:translate-x-1" />
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyNote title={t.home.emptyDesk} text={t.home.startJourney}>
                <Link href="/dashboard/notes/new" className="btn-ink px-5 py-2.5">
                  <FontAwesomeIcon icon={faPlus} />
                  {t.home.createNow}
                </Link>
              </EmptyNote>
            )}
          </section>

          {/* ---------- Arsip catatan, gaya daftar isi ---------- */}
          <section>
            <SectionTitle icon={faFileLines}>{t.home.noteArchive}</SectionTitle>
            {isInitialLoad ? (
              <div className="space-y-3">
                <Skeleton className="h-6" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-4/6" />
              </div>
            ) : notes.length > 0 ? (
              <ol className="divide-y-2 divide-[var(--rule)] rounded-xl border-2 border-[var(--rule)] bg-[var(--card)]">
                {notes.map((note, i) => (
                  <li key={note.id}>
                    <Link
                      href={`/dashboard/notes/${note.id}/edit`}
                      className="group flex items-baseline gap-3 px-4 py-3 hover:bg-[var(--rule)]/40"
                    >
                      <span className="hand w-7 shrink-0 text-xl text-[var(--ink-soft)]">{i + 1}.</span>
                      <span className="truncate font-semibold group-hover:underline group-hover:decoration-[var(--hl-yellow)] group-hover:decoration-4 group-hover:underline-offset-4">
                        {note.title}
                      </span>
                      <span className="mx-1 hidden flex-1 border-b-2 border-dotted border-[var(--rule)] sm:block" aria-hidden="true" />
                      <span className="ml-auto shrink-0 text-sm text-[var(--ink-soft)] sm:ml-0">
                        {new Date(note.updatedAt).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              !isInitialLoad &&
              recentNotes.length > 0 && <p className="text-[var(--ink-soft)]">{t.home.noOtherNotes}</p>
            )}
          </section>
        </div>

        {/* ---------- Folder ---------- */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-6">
            <SectionTitle
              icon={faFolder}
              action={
                <button
                  onClick={() => setIsFolderModalOpen(true)}
                  aria-label="Buat folder"
                  title="Buat folder"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[var(--rule)] text-[var(--ink-soft)] hover:border-[var(--ink-soft)] hover:text-[var(--ink)]"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              }
            >
              {t.home.folderCollection}
            </SectionTitle>

            {isInitialLoad ? (
              <div className="space-y-3">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : folders.length > 0 ? (
              <ul className="space-y-2">
                {folders.map((folder, i) => (
                  <li key={folder.id}>
                    <Link
                      href={`/dashboard/folders/${folder.id}`}
                      className="group flex items-center gap-3 rounded-xl border-2 border-[var(--rule)] bg-[var(--card)] px-4 py-3 hover:border-[var(--ink-soft)]"
                    >
                      <FontAwesomeIcon icon={faFolder} className={`text-xl ${folderColors[i % folderColors.length]}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{folder.name}</span>
                        <span className="text-sm text-[var(--ink-soft)]">
                          {folder.noteCount} {folder.noteCount === 1 ? t.home.item : t.home.items}
                        </span>
                      </span>
                      <FontAwesomeIcon icon={faChevronRight} className="text-sm text-[var(--ink-soft)] transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyNote title={t.home.noFoldersYet} text={t.home.groupNotes} />
            )}
          </div>
        </aside>
      </div>

      {/* Tombol tambah catatan (mobile) */}
      <Link
        href="/dashboard/notes/new"
        aria-label={t.home.createNewNote}
        className="btn-ink fixed right-5 bottom-5 z-30 h-14 w-14 rounded-full text-xl md:hidden"
      >
        <FontAwesomeIcon icon={faPlus} />
      </Link>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--rule)] border-t-[var(--ink)]" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
