"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, DocumentTextIcon, SparklesIcon } from "@heroicons/react/24/outline";

// A more modern take on the flashcard page
function FlashcardsDisplay() {
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

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Memuat...</div>;

    // SCENARIO 1: SET SELECTION VIEW
    if (!noteId) {
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <header className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                            Pilih Set Flashcard
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
                            Pilih salah satu catatan untuk memulai sesi belajarmu.
                        </p>
                    </div>
                </header>
                
                {error && <p className="text-red-500 mb-4">{error}</p>}

                {notesWithFlashcards.length === 0 && !error ? (
                    <div className="text-center py-16 sm:py-20 px-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700">
                        <SparklesIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-sky-400"/>
                        <h3 className="mt-6 text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Belum Ada Flashcard</h3>
                        <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">Buat flashcard dari catatanmu untuk memulai belajar dengan metode ini.</p>
                         <button
                            onClick={() => router.push('/dashboard')}
                            className="mt-8 inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#00A2D8] rounded-lg shadow-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] transition-all"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {notesWithFlashcards.map(n => (
                            <Link 
                                key={n.id} 
                                href={`/dashboard/flashcards?noteId=${n.id}`} 
                                className="block p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group"
                            >
                                <DocumentTextIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-4 text-gray-300 dark:text-gray-500 group-hover:text-[#00A2D8] dark:group-hover:text-sky-400 transition-colors"/>
                                <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 truncate transition-colors">{n.title}</h2>
                                <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500 group-hover:text-[#00A2D8] dark:group-hover:text-sky-400 transition-colors">Mulai Belajar →</p>
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
        <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="w-full max-w-2xl">
                 <header className="mb-8 text-center flex items-center justify-between">
                    <button onClick={() => router.push('/dashboard/flashcards')} className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                    <div className="flex-grow">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 truncate">
                            {note?.title}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">Kartu {currentIndex + 1} dari {flashcards.length}</p>
                    </div>
                    <div className="w-10"></div>
                 </header>

                {error && (
                    <div className="text-center py-16 sm:py-20 px-6 bg-white dark:bg-red-900/20 rounded-2xl border-2 border-dashed border-red-300 dark:border-red-500/50">
                        <h3 className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">Terjadi Kesalahan</h3>
                        <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">{error}</p>
                         <button
                            onClick={() => router.push('/dashboard/notes/' + noteId + '/edit')}
                            className="mt-8 inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                        >
                            Buka Editor Catatan
                        </button>
                    </div>
                )}

                {!error && flashcards.length > 0 && (
                    <>
                        <div 
                            className="relative w-full h-64 sm:h-80 perspective-1000 cursor-pointer group"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div 
                                className={`relative w-full h-full transition-transform duration-700 ease-in-out transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                            >
                                {/* Front of Card - Redesigned */}
                                <div className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-xl">
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-800 dark:text-gray-100">{currentCard.frontText}</p>
                                    <span className="absolute bottom-4 sm:bottom-6 text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">Klik untuk melihat jawaban</span>
                                </div>
                                {/* Back of Card - Redesigned */}
                                <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-sky-400 to-blue-500 text-white rounded-2xl shadow-xl">
                                    <p className="text-lg sm:text-xl lg:text-2xl text-center font-medium">{currentCard.backText}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-8">
                            <button 
                                onClick={goToPrev} 
                                className="flex items-center justify-center w-24 sm:w-36 py-2 sm:py-3 text-xs sm:text-base font-semibold text-gray-600 dark:text-gray-300 bg-transparent rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                            >
                                <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2"/>
                                Sebelumnya
                            </button>
                            <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 hidden sm:block">Klik kartu untuk membalik</p>
                            <button 
                                onClick={goToNext} 
                                className="flex items-center justify-center w-24 sm:w-36 py-2 sm:py-3 text-xs sm:text-base font-semibold text-gray-600 dark:text-gray-300 bg-transparent rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                            >
                                Selanjutnya
                                <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2"/>
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
        <Suspense fallback={<div className="p-8 text-center text-gray-500 dark:text-gray-400">Memuat...</div>}>
            <FlashcardsDisplay />
        </Suspense>
    );
}
