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

    if (loading) return <div className="p-6 md:p-8 text-center text-gray-700">Memuat Kuis...</div>;
    if (error) return <div className="p-6 md:p-8 text-red-500 text-center">Kesalahan: {error}</div>;
    if (!quiz) return <div className="p-6 md:p-8 text-center text-gray-700">Kuis tidak ditemukan.</div>;

    if (result) {
        const correctAnswersMap = new Map(result.correctAnswers.map(a => [a.questionId, a.correctAnswer]));
        
        const processAnalysisText = (text = '') => {
            const cleanedText = text
                .replace(/###?#?#?\s/g, '')
                .replace(/(\*\*|__)/g, '')
                .replace(/(\*|_)/g, '')
                .replace(/`/g, '')
                .replace(/---/g, '')
                .replace(/[🚀💡✨🔍]/g, '')
                .trim();
            
            return cleanedText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
        };

        const shortenedAnalysis = `GG, kuisnya selesai! Pemahaman dasarmu udah oke. Biar makin jago, ini 2 konsep yang wajib kamu kuasai:\n\n**1. Virtual DOM itu buat ngebut.** Anggap aja React punya 'contekan' dari UI asli. Waktu ada perubahan, React cuma update bagian yang perlu di contekan itu, bukan gambar ulang semuanya. Hasilnya? Aplikasi jadi super responsif dan anti lemot.\n\n**2. Properti 'key' itu 'name tag'.** Setiap item di list butuh \`key\` sebagai penanda unik. Tanpa itu, React bisa 'salah kenal' waktu datanya di-filter atau diurutkan, yang bikin tampilan jadi error. Jadi, \`key\` itu wajib biar UI kamu stabil.\n\n**Tips Praktis:** Coba bikin to-do list, lalu hapus salah satu item dari tengah. Rasakan bedanya saat kamu pakai \`index\` vs ID unik sebagai \`key\`. Kamu bakal langsung paham. Keep grinding! 🚀`;

        const analysisParagraphs = processAnalysisText(aiAnalysis || shortenedAnalysis);

        return (
            <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-screen">
                <div className="text-center mb-12 bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 ring-1 ring-black/5 dark:ring-white/10">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-400 mb-2">Skor Akhir</h1>
                    <p className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-800 dark:text-gray-100">
                        <span className="text-[#00A2D8]">{result.score}</span>%
                    </p>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-4">
                        Anda menjawab {result.correctAnswers.filter(a => a.correctAnswer === answers[a.questionId]).length} dari {quiz.questions.length} pertanyaan dengan benar.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={handleAnalyzeWeaknesses}
                            disabled={isAnalyzing}
                            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-white bg-sky-500 rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-all"
                        >
                            {isAnalyzing ? 'Menganalisis...' : <><LightBulbIcon className="w-5 h-5 mr-2" />Analisis Kelemahan</>}
                        </button>
                        <button
                            onClick={handleRetakeQuiz}
                            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all"
                        >
                            <ArrowPathIcon className="w-5 h-5 mr-2" />Coba Lagi
                        </button>
                    </div>
                </div>

                {aiAnalysis && (
                    <div className="mt-12 p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                            <LightBulbIcon className="w-6 sm:w-7 h-6 sm:h-7 mr-3 text-sky-500" />Saran Analisis AI
                        </h2>
                        <div className="space-y-4">
                            {analysisParagraphs.map((paragraph, index) => (
                                <p key={index} className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-6 mt-12">
                     <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Review Jawaban</h2>
                    {quiz.questions.map((q, index) => {
                        const userAnswer = answers[q.id];
                        const correctAnswer = correctAnswersMap.get(q.id);
                        const isCorrect = userAnswer === correctAnswer;

                        const getOptionClass = (option) => {
                            if (option === correctAnswer) return 'bg-green-100 dark:bg-green-800/30 border-green-500 dark:border-green-600 text-green-800 dark:text-green-300 font-semibold';
                            if (option === userAnswer && !isCorrect) return 'bg-red-100 dark:bg-red-800/30 border-red-500 dark:border-red-600 text-red-800 dark:text-red-300 font-semibold';
                            return 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300';
                        };

                        return (
                            <div key={q.id} className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
                                <p className="font-semibold text-lg sm:text-xl text-gray-800 dark:text-gray-100 mb-4">{index + 1}. {q.question}</p>
                                <div className="space-y-3">
                                    {['A', 'B', 'C', 'D'].map(opt => (
                                        <div key={opt} className={`p-3 sm:p-4 rounded-lg border-2 ${getOptionClass(opt)} flex justify-between items-center`}>
                                            <span className="text-sm sm:text-base">{opt}. {q[`option${opt}`]}</span>
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
                    <Link href="/dashboard/quiz" className="w-full sm:w-auto inline-block px-6 py-3 sm:px-8 text-sm sm:text-base font-semibold text-white bg-[#00A2D8] rounded-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] transition-all">
                        Kembali ke Daftar Kuis
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-screen">
            <header className="mb-8">
                <div className="flex items-center mb-4">
                    <button onClick={() => router.push('/dashboard/quiz')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 capitalize flex-grow text-center">
                        Kuis: {quiz.sourceType} - {quiz.sourceValue}
                    </h1>
                    <div className="flex flex-wrap justify-center gap-x-4 mt-2">
                        <p className="text-sm text-gray-500">Jumlah Soal: {quiz.numQuestions}</p>
                        {quiz.sourceType === 'topic' && quiz.difficulty && (
                            <p className="text-sm text-gray-500">Tingkat Kesulitan: {quiz.difficulty}</p>
                        )}
                    </div>
                    <div className="w-10 h-6"></div>
                </div>
            </header>

            <div className="space-y-6">
                {quiz.questions.map((q, index) => (
                    <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                        <p className="text-lg sm:text-xl font-semibold text-gray-800 mb-6">{index + 1}. {q.question}</p>
                        <div className="space-y-4">
                            {['A', 'B', 'C', 'D'].map(opt => q[`option${opt}`] && (
                                <div
                                    key={opt}
                                    onClick={() => handleSelectAnswer(q.id, opt)}
                                    className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-colors border-colors duration-300 ease-in-out border-2 ${answers[q.id] === opt
                                            ? 'bg-[#E0F7FA] border-[#00A2D8] text-[#00A2D8] font-semibold'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    <span className="text-sm sm:text-base">{opt}. {q[`option${opt}`]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-12 flex flex-col items-center">
                {uiMessage && (
                    <p className="text-red-500 mb-4 text-center text-sm sm:text-base">{uiMessage}</p>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(answers).length !== quiz.questions.length}
                    className="w-full sm:w-auto px-6 py-3 sm:px-8 text-sm sm:text-base font-semibold text-white bg-[#00A2D8] rounded-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] disabled:opacity-50 transition-all"
                >
                    {isSubmitting ? 'Mengirimkan...' : 'Kirim Kuis'}
                </button>
            </div>
        </div>
    );
};

export default QuizTakingPage;
