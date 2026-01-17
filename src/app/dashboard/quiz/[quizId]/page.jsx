"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon, XMarkIcon, LightBulbIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

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
                        correctAnswers: quizData.questions.map(q => ({
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

    if (loading) return <div className="p-8 text-center text-gray-700">Memuat Kuis...</div>;
    if (error) return <div className="p-8 text-red-500 text-center">Kesalahan: {error}</div>;
    if (!quiz) return <div className="p-8 text-center text-gray-700">Kuis tidak ditemukan.</div>;

    if (result) {
        const correctAnswersMap = new Map(result.correctAnswers.map(a => [a.questionId, a.correctAnswer]));
        return (
            <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto min-h-screen">
                <div className="text-center mb-12 bg-white rounded-2xl p-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#00A2D8] mb-4">Hasil Kuis Anda</h1>
                    <p className="text-5xl sm:text-6xl font-extrabold text-gray-800 animate-pulse">
                        <span className="text-[#00A2D8]">{result.score}</span>%
                    </p>
                    <p className="text-lg text-gray-600 mt-4">
                        Anda menjawab {result.correctAnswers.filter(a => a.correctAnswer === answers[a.questionId]).length} dari {quiz.questions.length} pertanyaan dengan benar.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <button
                            onClick={handleAnalyzeWeaknesses}
                            disabled={isAnalyzing}
                            className="flex items-center px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-noneå focus:ring-indigo-500 disabled:opacity-50 "
                        >
                            {isAnalyzing ? 'Menganalisis...' : <><LightBulbIcon className="w-5 h-5 mr-2" />Analisis Kelemahan</>}
                        </button>
                        <button
                            onClick={handleRetakeQuiz}
                            className="flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                        >
                            <ArrowPathIcon className="w-5 h-5 mr-2" />Coba Lagi
                        </button>
                    </div>
                </div>

                {aiAnalysis && (
                    <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                        <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                            <LightBulbIcon className="w-7 h-7 mr-3 text-blue-600" />Saran Analisis AI
                        </h2>
                        <p className="text-blue-900 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
                    </div>
                )}

                <div className="space-y-8 mt-12">
                    {quiz.questions.map((q, index) => {
                        const userAnswer = answers[q.id];
                        const correctAnswer = correctAnswersMap.get(q.id);
                        const isCorrect = userAnswer === correctAnswer;

                        const getOptionClass = (option) => {
                            if (option === correctAnswer) return 'bg-green-100 border-green-500 text-green-800 font-semibold';
                            if (option === userAnswer && !isCorrect) return 'bg-red-100 border-red-500 text-red-800 font-semibold';
                            return 'bg-gray-50 border-gray-200 text-gray-700';
                        };

                        return (
                            <div key={q.id} className="p-6 bg-white rounded-2xl border border-gray-200">
                                <p className="font-semibold text-xl text-gray-800 mb-4">{index + 1}. {q.question}</p>
                                <div className="space-y-3">
                                    {['A', 'B', 'C', 'D'].map(opt => (
                                        <div key={opt} className={`p-4 rounded-lg border ${getOptionClass(opt)} flex justify-between items-center`}>
                                            <span className="text-base">{opt}. {q[`option${opt}`]}</span>
                                            {opt === correctAnswer && <CheckIcon className="w-5 h-5 text-green-600" />}
                                            {opt === userAnswer && !isCorrect && <XMarkIcon className="w-5 h-5 text-red-600" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="text-center mt-12">
                    <Link href="/dashboard/quiz" className="px-8 py-3 text-base font-semibold text-white bg-[#00A2D8] rounded-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] transition-all">
                        Kembali ke Daftar Kuis
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto min-h-screen">
            <header className="mb-8">
                <div className="flex items-center mb-4">
                    <button onClick={() => router.push('/dashboard/quiz')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 capitalize flex-grow text-center">
                        Kuis: {quiz.sourceType} - {quiz.sourceValue}
                    </h1>
                    <div className="w-10 h-6"></div>
                </div>
            </header>

            <div className="space-y-6">
                {quiz.questions.map((q, index) => (
                    <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                        <p className="text-xl font-semibold text-gray-800 mb-6">{index + 1}. {q.question}</p>
                        <div className="space-y-4">
                            {['A', 'B', 'C', 'D'].map(opt => q[`option${opt}`] && (
                                <div
                                    key={opt}
                                    onClick={() => handleSelectAnswer(q.id, opt)}
                                    className={`p-4 rounded-lg cursor-pointer transition-colors border-colors duration-300 ease-in-out border-2 ${answers[q.id] === opt
                                            ? 'bg-[#E0F7FA] border-[#00A2D8] text-[#00A2D8] font-semibold'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    <span className="text-base">{opt}. {q[`option${opt}`]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-12 flex flex-col items-center">
                {uiMessage && (
                    <p className="text-red-500 mb-4 text-center">{uiMessage}</p>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(answers).length !== quiz.questions.length}
                    className="px-8 py-3 text-base font-semibold text-white bg-[#00A2D8] rounded-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] disabled:opacity-50 transition-all"
                >
                    {isSubmitting ? 'Mengirimkan...' : 'Kirim Kuis'}
                </button>
            </div>        </div>
    );
};

export default QuizTakingPage;
