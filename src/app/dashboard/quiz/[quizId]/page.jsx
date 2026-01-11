"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

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

    useEffect(() => {
        if (!quizId) return;
        const fetchQuiz = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/quizzes/${quizId}`);
                if (!res.ok) {
                    const errData = await res.json();
                    if (res.status === 404) router.push('/dashboard/quiz'); // Redirect if quiz not found
                    throw new Error(errData.message || "Gagal memuat kuis.");
                }
                const data = await res.json();
                setQuiz(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId, router]);

    const handleSelectAnswer = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length !== quiz.questions.length) {
            alert("Harap jawab semua pertanyaan sebelum mengirimkan.");
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
                 // If already taken, just redirect to the main quiz page
                 if (res.status === 409) {
                     alert(errData.message);
                     router.push('/dashboard/quiz');
                     return;
                 }
                throw new Error(errData.message || "Gagal mengirimkan jawaban.");
            }
            
            const resultData = await res.json();
            setResult(resultData);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
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
                    <p className="text-2xl mt-4">Skor Anda: <span className="font-bold text-blue-600">{result.score}%</span></p>
                </div>
                <div className="space-y-8">
                    {quiz.questions.map((q, index) => {
                        const userAnswer = answers[q.id];
                        const correctAnswer = correctAnswers.get(q.id);
                        const isCorrect = userAnswer === correctAnswer;
                        
                        const getOptionClass = (option) => {
                            if (option === correctAnswer) return 'bg-green-100 border-green-500 text-green-800';
                            if (option === userAnswer && !isCorrect) return 'bg-red-100 border-red-500 text-red-800';
                            return 'bg-gray-100 border-gray-200';
                        };

                        return (
                            <div key={q.id} className="p-6 bg-white rounded-lg shadow-md border">
                                <p className="font-semibold text-lg text-black">{index + 1}. {q.question}</p>
                                <div className="space-y-2 mt-4">
                                    {['A', 'B', 'C', 'D'].map(opt => (
                                        <div key={opt} className={`p-3 rounded-md border ${getOptionClass(opt)} flex justify-between items-center`}>
                                            <span>{opt}. {q[`option${opt}`]}</span>
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
                                        ? 'bg-blue-100 border-blue-500 text-blue-800' 
                                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                    } border`}
                                >
                                    {opt}. {q[`option${opt}`]}
                                </div>
                           ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-12 flex justify-end">
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 text-lg font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                >
                    {isSubmitting ? 'Mengirimkan...' : 'Kirim Kuis'}
                </button>
            </div>
        </div>
    );
};

export default QuizTakingPage;
