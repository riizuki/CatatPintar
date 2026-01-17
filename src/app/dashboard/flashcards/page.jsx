"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

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
    const [notesWithFlashcards, setNotesWithFlashcards] = useState([]); // New state for notes list

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            setIsFlipped(false);
            setCurrentIndex(0);

            if (noteId) {
                // Scenario 1: noteId is present, fetch specific flashcards
                try {
                    const [cardsRes, noteRes] = await Promise.all([
                        fetch(`/api/flashcards?noteId=${noteId}`),
                        fetch(`/api/notes/${noteId}`)
                    ]);

                    if (!cardsRes.ok || !noteRes.ok) {
                        throw new Error("Tidak dapat memuat flashcard atau detail catatan.");
                    }

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
                // Scenario 2: no noteId, fetch list of notes that have flashcards
                try {
                    const res = await fetch('/api/flashcards/notes');
                    if (!res.ok) {
                        throw new Error("Gagal mengambil daftar catatan dengan flashcard.");
                    }
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
    }, [noteId]); // Depend on noteId to re-fetch when it changes

    const goToNext = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => (prev + 1) % flashcards.length), 150);
    };

    const goToPrev = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length), 150);
    };

    if (loading) return <div className="p-8 text-center text-gray-700">Memuat...</div>;

    if (!noteId) {
        // Render list of notes with flashcards
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <header className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                            Pilih Set Flashcard
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Pilih salah satu catatan untuk memulai sesi belajarmu.
                        </p>
                    </div>
                </header>
                
                {error && <p className="text-red-500 mb-4">{error}</p>}

                {notesWithFlashcards.length === 0 && !error ? (
                    <div className="text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400"/>
                        <h3 className="mt-6 text-2xl font-bold text-gray-800">Belum Ada Flashcard</h3>
                        <p className="mt-2 text-base text-gray-500">Buat flashcard dari catatanmu untuk memulai belajar dengan metode ini.</p>
                         <button
                            onClick={() => router.push('/dashboard')}
                            className="mt-8 inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-[#00A2D8] rounded-lg shadow-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] transition-all"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {notesWithFlashcards.map(n => (
                            <Link 
                                key={n.id} 
                                href={`/dashboard/flashcards?noteId=${n.id}`} 
                                className="block p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#00A2D8] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group"
                            >
                                <DocumentTextIcon className="w-10 h-10 mb-4 text-gray-400 group-hover:text-[#00A2D8] transition-colors"/>
                                <h2 className="text-xl font-bold text-gray-800 truncate group-hover:text-[#00A2D8] transition-colors">{n.title}</h2>
                                <p className="mt-2 text-sm font-semibold text-[#00A2D8]">Mulai Belajar →</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    const currentCard = flashcards[currentIndex];

    return (
        <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center h-full relative">
            <button onClick={() => router.push('/dashboard/flashcards')} className="absolute top-8 left-8 flex items-center text-sm font-semibold text-gray-500 hover:text-[#00A2D8] group">
                <ArrowLeftIcon className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"/>
                Kembali ke Pilihan Set
            </button>
            <div className="w-full max-w-2xl">
                 <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 truncate">
                        {note?.title}
                    </h1>
                    <p className="text-gray-500 mt-1">Kartu {currentIndex + 1} dari {flashcards.length}</p>
                 </header>

                {error && (
                    <div className="text-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-red-300">
                        <h3 className="text-2xl font-bold text-red-600">Terjadi Kesalahan</h3>
                        <p className="mt-2 text-base text-gray-500">{error}</p>
                         <button
                            onClick={() => router.push('/dashboard/notes/' + noteId + '/edit')}
                            className="mt-8 inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-red-600 rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                        >
                            Buka Editor Catatan
                        </button>
                    </div>
                )}

                {!error && flashcards.length > 0 && (
                    <>
                        <div 
                            className="relative w-full h-80 perspective-1000 cursor-pointer group"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div 
                                className={`absolute w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                            >
                                {/* Front of Card */}
                                <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-8 bg-white rounded-2xl border-2 border-gray-200">
                                    <p className="text-2xl lg:text-3xl font-bold text-center text-gray-800">{currentCard.frontText}</p>
                                </div>
                                {/* Back of Card */}
                                <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-8 bg-[#00A2D8] text-white rounded-2xl">
                                    <p className="text-xl lg:text-2xl text-center">{currentCard.backText}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-8">
                            <button 
                                onClick={goToPrev} 
                                className="flex items-center px-6 py-3 text-base font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all"
                            >
                                <ArrowLeftIcon className="w-5 h-5 mr-2"/>
                                Sebelumnya
                            </button>
                            <p className="text-sm font-semibold text-gray-500 hidden sm:block">Klik kartu untuk membalik</p>
                            <button 
                                onClick={goToNext} 
                                className="flex items-center px-6 py-3 text-base font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all"
                            >
                                Selanjutnya
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
        <Suspense fallback={<div className="p-8 text-center text-gray-700">Memuat...</div>}>
            <FlashcardsDisplay />
        </Suspense>
    );
}


