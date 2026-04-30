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

    if (loading) return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00A2D8] rounded-full animate-spin"></div>
      </div>
    );
    if (error) return <div className="p-6 md:p-8 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl m-8 text-center font-medium">Kesalahan: {error}</div>;
    if (!quiz) return <div className="p-6 md:p-8 text-center text-gray-700 dark:text-gray-300">Kuis tidak ditemukan.</div>;

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
            <div className="p-6 md:p-10 max-w-4xl mx-auto min-h-screen">
                <div className="text-center mb-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-gray-200/50 dark:border-gray-700/50">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-400 mb-4">Skor Akhir</h1>
                    <p className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-gray-900 dark:text-white">
                        <span className="text-transparent bg-clip-text bg-[#00A2D8] hover:bg-[#008EB2]">{result.score}</span>%
                    </p>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-6 font-medium">
                        Anda menjawab <span className="text-emerald-500 font-bold">{result.correctAnswers.filter(a => a.correctAnswer === answers[a.questionId]).length}</span> dari {quiz.questions.length} pertanyaan dengan benar.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={handleAnalyzeWeaknesses}
                            disabled={isAnalyzing}
                            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 sm:px-8 text-sm sm:text-base font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl disabled:opacity-50 transition-all transform hover:-translate-y-1"
                        >
                            {isAnalyzing ? 'Menganalisis...' : <><LightBulbIcon className="w-5 h-5 mr-2" />Analisis Kelemahan AI</>}
                        </button>
                        <button
                            onClick={handleRetakeQuiz}
                            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 sm:px-8 text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                            <ArrowPathIcon className="w-5 h-5 mr-2" />Coba Lagi
                        </button>
                    </div>
                </div>

                {aiAnalysis && (
                    <div className="mt-12 p-8 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 rounded-3xl border border-sky-100 dark:border-sky-800">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
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

                <div className="space-y-8 mt-16">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Review Jawaban</h2>
                    {quiz.questions.map((q, index) => {
                        const userAnswer = answers[q.id];
                        const correctAnswer = correctAnswersMap.get(q.id);
                        const isCorrect = userAnswer === correctAnswer;

                        const getOptionClass = (option) => {
                            if (option === correctAnswer) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold';
                            if (option === userAnswer && !isCorrect) return 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-700 dark:text-rose-400 font-bold';
                            return 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
                        };

                        return (
                            <div key={q.id} className="p-6 md:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
                                <p className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-6 leading-relaxed">{index + 1}. {q.question}</p>
                                <div className="space-y-3">
                                    {['A', 'B', 'C', 'D'].map(opt => (
                                        <div key={opt} className={`p-4 rounded-xl border-2 ${getOptionClass(opt)} flex justify-between items-center transition-all`}>
                                            <span className="text-sm sm:text-base">{opt}. {q[`option${opt}`]}</span>
                                            {opt === correctAnswer && <CheckIcon className="w-6 h-6 text-emerald-500" />}
                                            {opt === userAnswer && !isCorrect && <XMarkIcon className="w-6 h-6 text-rose-500" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="text-center mt-12 mb-10">
                    <Link href="/dashboard/quiz" className="w-full sm:w-auto inline-flex justify-center px-8 py-3.5 text-base font-bold text-white bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 rounded-xl transition-all transform hover:-translate-y-1">
                        Kembali ke Daftar Kuis
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto min-h-screen">
            <header className="mb-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 relative">
                <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
                    <button onClick={() => router.push('/dashboard/quiz')} className="absolute md:relative left-6 top-6 md:left-auto md:top-auto p-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <div className="text-center md:text-left flex-1 px-12 md:px-4">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white capitalize truncate">
                            Kuis: {quiz.sourceType} - {quiz.sourceValue}
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 mt-3">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-[#00A2D8] dark:text-[#4CC1EE] text-xs font-bold rounded-full">
                                {quiz.numQuestions} Soal
                            </span>
                            {quiz.sourceType === 'topic' && quiz.difficulty && (
                                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">
                                    {quiz.difficulty}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="space-y-8">
                {quiz.questions.map((q, index) => (
                    <div key={q.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-10">
                        <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-8 leading-relaxed">
                            <span className="text-[#00A2D8]">{index + 1}.</span> {q.question}
                        </p>
                        <div className="space-y-4">
                            {['A', 'B', 'C', 'D'].map(opt => q[`option${opt}`] && (
                                <div
                                    key={opt}
                                    onClick={() => handleSelectAnswer(q.id, opt)}
                                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 ease-out border-2 group ${answers[q.id] === opt ? 'bg-blue-50 dark:bg-blue-900/20 border-[#00A2D8] text-[#00A2D8] dark:text-[#4CC1EE] transform scale-[1.02]' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#00A2D8]/50 text-gray-700 dark:text-gray-300' }`}
                                >
                                    <span className="text-base sm:text-lg font-medium flex items-center">
                                        <span className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 text-sm font-bold transition-colors ${answers[q.id] === opt ? 'bg-[#00A2D8] text-white' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-[#00A2D8]/20 group-hover:text-[#00A2D8]'}`}>
                                            {opt}
                                        </span>
                                        {q[`option${opt}`]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-16 mb-10 flex flex-col items-center">
                {uiMessage && (
                    <p className="text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-6 py-3 rounded-xl mb-6 text-sm sm:text-base font-bold animate-pulse">{uiMessage}</p>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(answers).length !== quiz.questions.length}
                    className="w-full max-w-md px-8 py-4 text-lg font-extrabold text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] disabled:opacity-50 transition-all transform hover:-translate-y-1 disabled:hover:translate-y-0"
                >
                    {isSubmitting ? 'Mengirimkan...' : 'Kirim Jawaban'}
                </button>
            </div>
        </div>
    );
};

export default QuizTakingPage;
