"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowUpRightFromSquare, faCheck, faLightbulb, faMagnifyingGlassChart, faPaperPlane, faPenToSquare, faRotateRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ErrorNote, Page, Spinner, cls } from "../../../components/ui/kit";

const OPTIONS = ["A", "B", "C", "D"];

/* Nilai besar ala coretan guru */
function BigGrade({ score }) {
  const color = score >= 80 ? "text-[var(--right)]" : score >= 60 ? "text-amber-500" : "text-[var(--margin)]";
  return (
    <div className={`relative mx-auto flex h-40 w-48 items-center justify-center ${color}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 96 80" fill="none" aria-hidden="true">
        <path d="M80 14C64 2 26 4 12 22C0 38 10 66 44 72C76 78 94 58 88 36C85 26 76 18 60 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="hand text-7xl leading-none">{score}</span>
    </div>
  );
}

const QuizTakingPage = () => {
    const params = useParams();
    const router = useRouter();
    const { quizId } = params;

    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [uiMessage, setUiMessage] = useState("");

    const [aiAnalysis, setAiAnalysis] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (!quizId) return;

        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const [quizRes, resultRes] = await Promise.all([
                    fetch(`/api/quizzes/${quizId}`),
                    fetch(`/api/quizzes/${quizId}/result`),
                ]);

                if (!quizRes.ok) {
                    const errData = await quizRes.json();
                    if (quizRes.status === 404) router.push('/dashboard/quiz');
                    throw new Error(errData.message || "Gagal memuat kuis.");
                }
                const quizData = await quizRes.json();
                setQuiz(quizData);

                if (resultRes.ok) {
                    const resultData = await resultRes.json();
                    setResult({
                        score: resultData.score,
                        // Kunci jawaban kini dikirim oleh rute result. Fallback lama
                        // dipertahankan untuk berjaga-jaga, walau isinya selalu kosong.
                        correctAnswers: resultData.correctAnswers ?? quizData.questions.map(q => ({
                            questionId: q.id,
                            correctAnswer: q.correctAnswer,
                        })),
                    });
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [quizId, router]);

    const handleSelectAnswer = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleSubmit = async () => {
        setUiMessage("");
        if (Object.keys(answers).length !== quiz.questions.length) {
            setUiMessage("Harap jawab semua pertanyaan sebelum mengirimkan.");
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            const res = await fetch(`/api/quizzes/${quizId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: Object.entries(answers).map(([questionId, answer]) => ({
                        questionId: parseInt(questionId),
                        answer,
                    }))
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Gagal mengirimkan jawaban.");
            }

            const resultData = await res.json();
            setResult(resultData);

        } catch (err) {
            setError(err.message);
            setUiMessage(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnalyzeWeaknesses = async () => {
        setIsAnalyzing(true);
        setAiAnalysis("");
        setError("");
        try {
            const res = await fetch(`/api/quizzes/${quizId}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAnswers: Object.entries(answers).map(([questionId, answer]) => ({
                        questionId: parseInt(questionId),
                        selectedAnswer: answer,
                    }))
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Gagal mendapatkan analisis.");
            }
            const data = await res.json();
            setAiAnalysis(data.analysis);
        } catch (err) {
            setError(err.message);
            setUiMessage(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRetakeQuiz = () => {
        setResult(null);
        setAnswers({});
        setAiAnalysis("");
        setUiMessage("");
        setError("");
    };

    if (loading) return <Spinner className="h-[calc(100vh-140px)]" />;
    if (error && !quiz)
        return (
            <Page>
                <ErrorNote>Kesalahan: {error}</ErrorNote>
            </Page>
        );
    if (!quiz) return <Page><p className="text-[var(--ink-soft)]">Kuis tidak ditemukan.</p></Page>;

    const backLink = (
        <Link href="/dashboard/quiz" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]">
            <FontAwesomeIcon icon={faArrowLeft} />
            Daftar kuis
        </Link>
    );

    /* ================= HASIL ================= */
    if (result) {
        const correctAnswersMap = new Map(result.correctAnswers.map((a) => [a.questionId, a.correctAnswer]));
        const reviewMap = new Map(result.correctAnswers.map((a) => [a.questionId, a]));
        // Kuis celah (F3): jawaban salah diarahkan ke halaman slide sumbernya.
        const isGapQuiz = quiz.sourceType === "gap";
        const gapMaterial = quiz.note?.material ?? null;
        const slideHref = (page) =>
            gapMaterial && gapMaterial.fileType === "pdf" && page
                ? `/api/materials/${gapMaterial.id}/file#page=${page}`
                : null;
        const correctCount = result.correctAnswers.filter((a) => a.correctAnswer === answers[a.questionId]).length;
        const answeredThisSession = Object.keys(answers).length > 0;

        const processAnalysisText = (text = "") =>
            text
                .replace(/###?#?#?\s/g, "")
                .replace(/(\*\*|__)/g, "")
                .replace(/(\*|_)/g, "")
                .replace(/`/g, "")
                .replace(/---/g, "")
                .trim()
                .split(/\n\s*\n/)
                .map((p) => p.trim())
                .filter((p) => p.length > 0);

        return (
            <Page>
                {backLink}

                <section className={`ruled relative mt-4 overflow-hidden px-6 py-10 text-center ${cls.card}`}>
                    <span className="margin-line left-8 hidden sm:block" aria-hidden="true" />
                    <p className="font-semibold text-[var(--ink-soft)]">Skor akhir</p>
                    <BigGrade score={result.score} />
                    {answeredThisSession && (
                        <p className="text-lg">
                            Kamu menjawab <strong className="text-[var(--right)]">{correctCount}</strong> dari {quiz.questions.length} soal dengan benar.
                        </p>
                    )}
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <button onClick={handleAnalyzeWeaknesses} disabled={isAnalyzing} className="btn-ink h-11 px-6 disabled:opacity-60">
                            <FontAwesomeIcon icon={faLightbulb} />
                            {isAnalyzing ? "Menganalisis…" : "Analisis kelemahan dengan AI"}
                        </button>
                        <button onClick={handleRetakeQuiz} className={`${cls.btnOutline} h-11`}>
                            <FontAwesomeIcon icon={faRotateRight} />
                            Coba lagi
                        </button>
                        {isGapQuiz && quiz.note && (
                            <Link href={`/dashboard/notes/${quiz.note.id}/gaps`} className={`${cls.btnOutline} h-11`}>
                                <FontAwesomeIcon icon={faMagnifyingGlassChart} />
                                Kembali ke Celah Catatan
                            </Link>
                        )}
                    </div>
                    {uiMessage && <p className="mt-4 font-semibold text-[var(--wrong)]">{uiMessage}</p>}
                </section>

                {aiAnalysis && (
                    <section className="mt-8 rounded-xl border-2 border-[var(--ink-fixed)] bg-[var(--hl-blue)] p-6 text-[var(--ink-fixed)]">
                        <h2 className="flex items-center gap-2 text-xl font-extrabold">
                            <FontAwesomeIcon icon={faLightbulb} />
                            Saran dari AI
                        </h2>
                        <div className="mt-3 space-y-3 leading-relaxed">
                            {processAnalysisText(aiAnalysis).map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                    </section>
                )}

                <h2 className="mt-12 mb-5 text-2xl font-extrabold tracking-tight">Pembahasan jawaban</h2>
                <ol className="space-y-5">
                    {quiz.questions.map((q, index) => {
                        const userAnswer = answers[q.id];
                        const correctAnswer = correctAnswersMap.get(q.id);
                        const isCorrect = userAnswer === correctAnswer;
                        return (
                            <li key={q.id} className={`p-5 sm:p-6 ${cls.card}`}>
                                <div className="flex items-start gap-3">
                                    {userAnswer && (
                                        <span className={`hand shrink-0 text-3xl leading-none ${isCorrect ? "text-[var(--right)]" : "text-[var(--margin)]"}`} aria-label={isCorrect ? "Benar" : "Salah"}>
                                            <FontAwesomeIcon icon={isCorrect ? faCheck : faXmark} />
                                        </span>
                                    )}
                                    <p className="text-lg font-bold leading-relaxed">
                                        {index + 1}. {q.question}
                                    </p>
                                </div>
                                {isGapQuiz && reviewMap.get(q.id)?.slidePage && (
                                    <span className="mt-2 inline-block rounded bg-[var(--rule)] px-2 py-0.5 text-xs font-bold">
                                        Slide halaman {reviewMap.get(q.id).slidePage}
                                    </span>
                                )}
                                <div className="mt-4 grid gap-2">
                                    {OPTIONS.map((opt) => {
                                        if (!q[`option${opt}`]) return null;
                                        const right = opt === correctAnswer;
                                        const wrongPick = opt === userAnswer && !isCorrect;
                                        return (
                                            <div
                                                key={opt}
                                                className={`flex items-center gap-3 rounded-[10px] border-2 px-4 py-2.5 ${
                                                    right
                                                        ? "border-[var(--right)] font-semibold text-[var(--right)]"
                                                        : wrongPick
                                                          ? "border-[var(--wrong)] text-[var(--wrong)] line-through"
                                                          : "border-[var(--rule)] text-[var(--ink-soft)]"
                                                }`}
                                            >
                                                <span className="font-bold">{opt}.</span>
                                                <span className="flex-1">{q[`option${opt}`]}</span>
                                                {right && <FontAwesomeIcon icon={faCheck} />}
                                                {wrongPick && <FontAwesomeIcon icon={faXmark} />}
                                            </div>
                                        );
                                    })}
                                </div>
                                {isGapQuiz && reviewMap.get(q.id)?.explanation && (
                                    <p className="mt-4 rounded-[10px] bg-[var(--hl-green)] px-4 py-3 text-sm text-[var(--ink-fixed)]">
                                        {reviewMap.get(q.id).explanation}
                                    </p>
                                )}
                                {/* F5 + F6: jawaban salah → lihat slidenya → lengkapi catatannya. */}
                                {isGapQuiz && userAnswer && !isCorrect && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {slideHref(reviewMap.get(q.id)?.slidePage) && (
                                            <a
                                                href={slideHref(reviewMap.get(q.id).slidePage)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${cls.btnOutline} h-9 text-sm`}
                                            >
                                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                                                Buka slide halaman {reviewMap.get(q.id).slidePage}
                                            </a>
                                        )}
                                        {quiz.note && reviewMap.get(q.id)?.gapId && (
                                            <Link
                                                href={`/dashboard/notes/${quiz.note.id}/gaps?gap=${reviewMap.get(q.id).gapId}`}
                                                className="btn-ink h-9 px-4 text-sm"
                                            >
                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                Lengkapi catatan untuk poin ini
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
                <div className="mt-10 text-center">
                    <Link href="/dashboard/quiz" className={`${cls.btnOutline} h-11 px-6`}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Kembali ke daftar kuis
                    </Link>
                </div>
            </Page>
        );
    }

    /* ================= MENGERJAKAN ================= */
    const answered = Object.keys(answers).length;
    const total = quiz.questions.length;

    return (
        <Page>
            {backLink}
            <header className="mt-4">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{quiz.sourceValue}</h1>
                <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-md bg-[var(--hl-yellow)] px-2.5 py-1 text-sm font-bold text-[var(--ink-fixed)]">{quiz.numQuestions} soal</span>
                    {quiz.sourceType === "topic" && quiz.difficulty && (
                        <span className="rounded-md bg-[var(--hl-pink)] px-2.5 py-1 text-sm font-bold text-[var(--ink-fixed)]">{quiz.difficulty}</span>
                    )}
                </div>
            </header>

            <ol className="mt-8 space-y-6">
                {quiz.questions.map((q, index) => (
                    <li key={q.id} className={`p-5 sm:p-7 ${cls.card}`}>
                        <p className="text-lg font-bold leading-relaxed sm:text-xl">
                            <span className="hand mr-2 text-2xl text-[var(--margin)]">{index + 1}.</span>
                            {q.question}
                        </p>
                        <div className="mt-5 grid gap-2.5" role="radiogroup" aria-label={`Soal ${index + 1}`}>
                            {OPTIONS.map((opt) => {
                                if (!q[`option${opt}`]) return null;
                                const picked = answers[q.id] === opt;
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        role="radio"
                                        aria-checked={picked}
                                        onClick={() => handleSelectAnswer(q.id, opt)}
                                        className={`group flex items-center gap-4 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                                            picked ? "border-[var(--ink-fixed)] bg-[var(--hl-yellow)] text-[var(--ink-fixed)]" : "border-[var(--rule)] hover:border-[var(--ink-soft)]"
                                        }`}
                                    >
                                        {/* bulatan ala lembar jawaban */}
                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-extrabold transition-colors ${
                                                picked ? "border-[var(--ink-fixed)] bg-[var(--ink-fixed)] text-white" : "border-[var(--ink-soft)] text-[var(--ink-soft)]"
                                            }`}
                                        >
                                            {opt}
                                        </span>
                                        <span className="font-medium">{q[`option${opt}`]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </li>
                ))}
            </ol>

            {/* Bar kirim menempel di bawah, dengan progres */}
            <div className={`sticky bottom-4 z-20 mt-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${cls.card}`}>
                <div className="flex-1">
                    <p className="text-sm font-semibold">
                        {answered} dari {total} soal dijawab
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--rule)]">
                        <div className="h-full rounded-full bg-[var(--right)] transition-[width] duration-300" style={{ width: `${(answered / total) * 100}%` }} />
                    </div>
                    {uiMessage && <p className="mt-2 text-sm font-semibold text-[var(--wrong)]">{uiMessage}</p>}
                </div>
                <button onClick={handleSubmit} disabled={isSubmitting || answered !== total} className="btn-ink h-11 px-6 disabled:cursor-not-allowed disabled:opacity-50">
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {isSubmitting ? "Mengirim…" : "Kirim jawaban"}
                </button>
            </div>
        </Page>
    );
};

export default QuizTakingPage;
