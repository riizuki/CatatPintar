"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { DocumentTextIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { dashboardTranslations } from "@/locales/dashboard";

// A more modern take on the flashcard page
function FlashcardsDisplay() {
    const { language } = useLanguage();
    const t = dashboardTranslations[language];
    const searchParams = useSearchParams();
    const router = useRouter();
    const noteId = searchParams.get('noteId');

    const [flashcards, setFlashcards] = useState([]);
    const [note, setNote] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notesWithFlashcards, setNotesWithFlashcards] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            setIsFlipped(false);
            setCurrentIndex(0);

            if (noteId) {
                try {
                    const [cardsRes, noteRes] = await Promise.all([
                        fetch(`/api/flashcards?noteId=${noteId}`),
                        fetch(`/api/notes/${noteId}`)
                    ]);

                    if (!cardsRes.ok || !noteRes.ok) throw new Error("Tidak dapat memuat flashcard atau detail catatan.");
                    
                    const cardsData = await cardsRes.json();
                    const noteData = await noteRes.json();
                    setFlashcards(cardsData);
                    setNote(noteData);

                    if (cardsData.length === 0) {
                         setError("Belum ada flashcard untuk catatan ini. Buat flashcard dari halaman edit catatan untuk memulai.");
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            } else {
                try {
                    const res = await fetch('/api/flashcards/notes');
                    if (!res.ok) throw new Error("Gagal mengambil daftar catatan dengan flashcard.");
                    const data = await res.json();
                    setNotesWithFlashcards(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [noteId]);

    const goToNext = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => (prev + 1) % flashcards.length), 150);
    };

    const goToPrev = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length), 150);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00A2D8] rounded-full animate-spin"></div>
        </div>
    );

    // SCENARIO 1: SET SELECTION VIEW
    if (!noteId) {
        return (
            <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
                            <SparklesIcon className="w-8 h-8 mr-3 text-[#00A2D8] dark:text-[#4CC1EE]"/>
                            {t.flashcards.selectSet}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">
                            {t.flashcards.selectSubtitle}
                        </p>
                    </div>
                </header>
                
                {error && <p className="text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-6 py-3 rounded-xl mb-6">{error}</p>}

                {notesWithFlashcards.length === 0 && !error ? (
                    <div className="text-center py-16 sm:py-20 px-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                        <SparklesIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600"/>
                        <h3 className="mt-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t.flashcards.emptyTitle}</h3>
                        <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">{t.flashcards.emptySubtitle}</p>
                         <button
                            onClick={() => router.push('/dashboard')}
                            className="mt-8 inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-xl transition-all transform hover:-translate-y-1"
                        >
                            {t.flashcards.backToHome}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notesWithFlashcards.map(n => (
                            <Link 
                                key={n.id} 
                                href={`/dashboard/flashcards?noteId=${n.id}`} 
                                className="block p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 transform hover:-translate-y-2 hover:border-[#00A2D8]/50 group"
                            >
                                <div className="inline-flex p-3 rounded-2xl mb-4 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50 transition-transform group-hover:scale-110">
                                    <DocumentTextIcon className="w-8 h-8"/>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate transition-colors mb-2">{n.title}</h2>
                                <p className="text-sm font-bold text-[#00A2D8] dark:text-[#4CC1EE] opacity-0 group-hover:opacity-100 transition-opacity">{t.flashcards.startLearning}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    const currentCard = flashcards[currentIndex];

    // SCENARIO 2: FLIPPER VIEW
    return (
        <div className="p-4 sm:p-6 md:p-10 flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-3xl">
                 <header className="mb-12 text-center flex items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 relative">
                    <button onClick={() => router.push('/dashboard/flashcards')} className="absolute left-6 p-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <div className="flex-grow px-16">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white truncate">
                            {note?.title}
                        </h1>
                        <div className="inline-flex items-center mt-3 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-[#00A2D8] dark:text-[#4CC1EE] text-sm font-bold rounded-full">
                            {t.flashcards.cardWord} {currentIndex + 1} {t.flashcards.cardOf} {flashcards.length}
                        </div>
                    </div>
                 </header>

                {error && (
                    <div className="text-center py-16 sm:py-20 px-6 bg-white /20 rounded-2xl border-2 border-dashed border-red-300 /50">
                        <h3 className="text-lg sm:text-2xl font-bold text-red-600">{t.flashcards.errorOccurred}</h3>
                        <p className="mt-2 text-sm sm:text-base text-gray-500">{error}</p>
                         <button
                            onClick={() => router.push('/dashboard/notes/' + noteId + '/edit')}
                            className="mt-8 inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                        >
                            {t.flashcards.openEditor}
                        </button>
                    </div>
                )}

                {!error && flashcards.length > 0 && (
                    <>
                        <div 
                            className="relative w-full h-80 sm:h-96 md:h-[400px] perspective-1000 cursor-pointer group"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div 
                                className={`relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                            >
                                {/* Front of Card - Redesigned */}
                                <div className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-8 sm:p-12 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700">
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-gray-900 dark:text-white leading-tight">{currentCard.frontText}</p>
                                    <span className="absolute bottom-8 text-sm font-medium text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{t.flashcards.clickToFlip}</span>
                                </div>
                                {/* Back of Card - Redesigned */}
                                <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-8 sm:p-12 bg-[#00A2D8] text-white rounded-[3rem]">
                                    <p className="text-xl sm:text-2xl md:text-3xl text-center font-bold leading-relaxed">{currentCard.backText}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-12 px-4 sm:px-10">
                            <button 
                                onClick={goToPrev} 
                                className="flex items-center justify-center w-36 py-3.5 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-2xl hover:bg-white dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50 transition-all transform hover:-translate-y-1"
                            >
                                <ArrowLeftIcon className="w-5 h-5 mr-2"/>
                                {t.flashcards.prev}
                            </button>
                            <div className="flex space-x-2">
                                {flashcards.map((_, idx) => (
                                    <div key={idx} className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-[#00A2D8]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                ))}
                            </div>
                            <button 
                                onClick={goToNext} 
                                className="flex items-center justify-center w-36 py-3.5 text-sm font-bold text-white bg-[#00A2D8] rounded-2xl transition-all transform hover:-translate-y-1"
                            >
                                {t.flashcards.next}
                                <ArrowRightIcon className="w-5 h-5 ml-2"/>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Wrap the component in Suspense as it uses useSearchParams
export default function FlashcardsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat...</div>}>
            <FlashcardsDisplay />
        </Suspense>
    );
}
