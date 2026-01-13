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
    const [result, setResult] = useState(null); // To store { score, correctAnswers }

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [uiMessage, setUiMessage] = useState(""); // New state for UI messages

    const [aiAnalysis, setAiAnalysis] = useState(""); // State for AI analysis
    const [isAnalyzing, setIsAnalyzing] = useState(false); // Loading state for analysis

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
                    // Structure result to match what handleSubmit provides
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
        setUiMessage(""); // Clear previous messages
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
            setUiMessage(err.message); // Also display network/API errors in UI
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
        setResult(null); // Clear result to go back to quiz taking view
        setAnswers({}); // Clear answers
        setAiAnalysis(""); // Clear analysis
        setUiMessage(""); // Clear messages
        setError(""); // Clear errors
    };
    
    if (loading) return <div className="p-8">Memuat Kuis...</div>;
    if (error) return <div className="p-8 text-red-500">Kesalahan: {error}</div>;
    if (!quiz) return <div className="p-8">Kuis tidak ditemukan.</div>;

    // Render RESULTS view
    if (result) {
        const correctAnswersMap = new Map(result.correctAnswers.map(a => [a.questionId, a.correctAnswer]));
        return (
            <div className="p-8 max-w-4xl mx-auto">
                 <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-black">Hasil Kuis</h1>
                    <p className="text-2xl mt-4 text-black">Skor Anda: <span className="font-bold text-blue-600">{result.score}%</span></p>
                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            onClick={handleAnalyzeWeaknesses}
                            disabled={isAnalyzing}
                            className="flex items-center px-6 py-3 text-lg font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                        >
                            {isAnalyzing ? 'Menganalisis...' : <><LightBulbIcon className="w-6 h-6 mr-2" />Analisis Kelemahan</>}
                        </button>
                        <button
                            onClick={handleRetakeQuiz}
                            className="flex items-center px-6 py-3 text-lg font-medium text-black bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            <ArrowPathIcon className="w-6 h-6 mr-2" />Coba Lagi
                        </button>
                    </div>
                </div>

                {aiAnalysis && (
                    <div className="mt-12 p-6 bg-blue-50 rounded-lg shadow-md border border-blue-200">
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
                            if (option === correctAnswer) return 'bg-green-100 border-green-500';
                            if (option === userAnswer && !isCorrect) return 'bg-red-100 border-red-500';
                            return 'bg-gray-100 border-gray-200';
                        };

                        return (
                            <div key={q.id} className="p-6 bg-white rounded-lg shadow-md border">
                                <p className="font-semibold text-lg text-black">{index + 1}. {q.question}</p>
                                <div className="space-y-2 mt-4">
                                    {['A', 'B', 'C', 'D'].map(opt => (
                                        <div key={opt} className={`p-3 rounded-md border ${getOptionClass(opt)} flex justify-between items-center`}>
                                            <span className="text-black">{opt}. {q[`option${opt}`]}</span>
                                            {opt === correctAnswer && <CheckIcon className="w-5 h-5 text-green-600"/>}
                                            {opt === userAnswer && !isCorrect && <XMarkIcon className="w-5 h-5 text-red-600"/>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                 <div className="text-center mt-12">
                    <Link href="/dashboard/quiz" className="px-6 py-3 text-white bg-black rounded-md hover:bg-gray-800">
                        Kembali ke Kuis
                    </Link>
                </div>
            </div>
        );
    }

    // Render QUIZ TAKING view
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
                 <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeftIcon className="w-6 h-6 text-black"/>
                </button>
                <h1 className="text-3xl font-semibold text-black capitalize">
                    Kuis: {quiz.sourceType} - {quiz.sourceValue}
                </h1>
            </div>
            <div className="space-y-8">
                {quiz.questions.map((q, index) => (
                    <div key={q.id} className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="font-semibold text-lg text-black">{index + 1}. {q.question}</p>
                        <div className="space-y-2 mt-4">
                           {['A', 'B', 'C', 'D'].map(opt => q[`option${opt}`] && (
                                <div 
                                    key={opt}
                                    onClick={() => handleSelectAnswer(q.id, opt)}
                                                                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                                                                            answers[q.id] === opt
                                                                            ? 'bg-blue-100 border-blue-500 text-black'
                                                                            : 'bg-gray-50 hover:bg-gray-100 border-gray-100 text-black'
                                                                        } border`}                                >
                                    {opt}. {q[`option${opt}`]}
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
                                disabled={isSubmitting}
                                className="px-8 py-3 text-lg font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                            >
                                {isSubmitting ? 'Mengirimkan...' : 'Kirim Kuis'}
                            </button>
                        </div>        </div>
    );
};

export default QuizTakingPage;
