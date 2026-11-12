"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faFileLines, faListCheck, faMagnifyingGlassChart, faPlay, faPlus, faTrashCan, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import CreateQuizModal from "@/app/components/dashboard/CreateQuizModal";
import ConfirmationModal from "@/app/components/dashboard/ConfirmationModal";
import { EmptyState, ErrorNote, Page, PageHeader, Spinner, cls } from "@/app/components/ui/kit";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { dashboardTranslations } from "@/locales/dashboard";

/* Nilai ala coretan guru: angka dilingkari, warnanya sesuai skor */
function Grade({ score }) {
  const color = score >= 80 ? "text-[var(--right)]" : score >= 60 ? "text-amber-500" : "text-[var(--margin)]";
  return (
    <div className={`relative flex h-20 w-24 items-center justify-center ${color}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 96 80" fill="none" aria-hidden="true">
        <path d="M80 14C64 2 26 4 12 22C0 38 10 66 44 72C76 78 94 58 88 36C85 26 76 18 60 14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span className="hand text-4xl leading-none">{score}</span>
    </div>
  );
}

const QuizContent = () => {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];

  const searchParams = useSearchParams();
  const noteIdParam = searchParams.get('noteId');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    if (noteIdParam) {
      setIsModalOpen(true);
    }
  }, [noteIdParam]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quizzes");
      if (!res.ok) throw new Error("Gagal mengambil kuis");
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  const confirmDelete = (quiz) => {
    setQuizToDelete(quiz);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/quizzes/${quizToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus kuis");
      setQuizzes(quizzes.filter(q => q.id !== quizToDelete.id));
      setIsDeleteModalOpen(false);
      setQuizToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus kuis.");
    } finally {
      setIsDeleting(false);
    }
  };

  const sourceLabel = (q) =>
    q.sourceType === "gap"
      ? language === "id" ? "Dari celah catatan" : "From note gaps"
      : q.sourceType === "note"
        ? language === "id" ? "Dari catatan" : "From note"
        : language === "id" ? "Dari topik" : "From topic";
  const sourceStyle = (q) =>
    q.sourceType === "gap" ? "bg-[var(--hl-pink)]" : q.sourceType === "note" ? "bg-[var(--hl-yellow)]" : "bg-[var(--hl-blue)]";
  const sourceIcon = (q) =>
    q.sourceType === "gap" ? faMagnifyingGlassChart : q.sourceType === "note" ? faFileLines : faWandMagicSparkles;

  return (
    <>
      <CreateQuizModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedSourceType={noteIdParam ? "note" : null}
        preselectedSourceValue={noteIdParam ? parseInt(noteIdParam) : null}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteQuiz}
        title={t.quiz.deleteQuiz}
        isMutating={isDeleting}
      >
        <p>{t.quiz.deleteQuizConfirm}</p>
      </ConfirmationModal>

      <Page wide>
        <PageHeader
          title={t.quiz.title}
          subtitle={t.quiz.subtitle}
          action={
            <button onClick={() => setIsModalOpen(true)} className="btn-ink h-11 px-5">
              <FontAwesomeIcon icon={faPlus} />
              {t.quiz.createQuiz}
            </button>
          }
        />

        <div className="mt-8">
          {loading && <Spinner />}
          <ErrorNote>{error && `${t.quiz.error} ${error}`}</ErrorNote>

          {!loading && !error &&
            (quizzes.length > 0 ? (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz) => (
                  <li key={quiz.id} className={`group relative flex flex-col overflow-hidden ${cls.card}`}>
                    {/* kepala kertas ujian */}
                    <div className="flex items-center justify-between gap-2 border-b-2 border-dashed border-[var(--rule)] px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold text-[var(--ink-fixed)] ${
                          sourceStyle(quiz)
                        }`}
                      >
                        <FontAwesomeIcon icon={sourceIcon(quiz)} />
                        {sourceLabel(quiz)}
                      </span>
                      <button
                        onClick={() => confirmDelete(quiz)}
                        className={`${cls.iconBtn} h-8 w-8 hover:!text-[var(--wrong)]`}
                        title={t.quiz.deleteQuiz}
                        aria-label={t.quiz.deleteQuiz}
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>

                    <div className="flex flex-1 items-start justify-between gap-3 px-5 pt-4">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-lg font-extrabold leading-snug">{quiz.sourceValue}</h3>
                        {quiz.createdAt && (
                          <p className="mt-2 flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                            <FontAwesomeIcon icon={faCalendar} />
                            {formatDate(quiz.createdAt)}
                          </p>
                        )}
                      </div>
                      {quiz.result ? (
                        <Grade score={quiz.result.score} />
                      ) : (
                        <span className="hand mt-1 shrink-0 rotate-[-4deg] text-xl text-[var(--ink-soft)]">{t.quiz.notTaken}</span>
                      )}
                    </div>

                    <div className="mt-auto px-5 pt-4 pb-5">
                      {quiz.result && (
                        <p className="mb-3 text-sm text-[var(--ink-soft)]">
                          {t.quiz.takenAt} {formatDate(quiz.result.takenAt)}
                        </p>
                      )}
                      <Link
                        href={`/dashboard/quiz/${quiz.id}`}
                        className={quiz.result ? `${cls.btnOutline} w-full` : "btn-ink h-10 w-full text-sm"}
                      >
                        {!quiz.result && <FontAwesomeIcon icon={faPlay} />}
                        {quiz.result ? t.quiz.viewResult : t.quiz.startQuiz}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={faListCheck} title={t.quiz.emptyTitle} text={t.quiz.emptySubtitle}>
                <button onClick={() => setIsModalOpen(true)} className="btn-ink h-11 px-5">
                  <FontAwesomeIcon icon={faPlus} />
                  {t.quiz.createQuiz}
                </button>
              </EmptyState>
            ))}
        </div>
      </Page>
    </>
  );
};

export default function QuizPage() {
  return (
    <Suspense fallback={<Spinner className="h-screen" />}>
      <QuizContent />
    </Suspense>
  );
}
