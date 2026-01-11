"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link"; // Import Link
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

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
                         setError("Tidak ada flashcard ditemukan untuk catatan ini. Coba buat dari halaman edit catatan.");
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
        setCurrentIndex(prev => (prev + 1) % flashcards.length);
    };

    const goToPrev = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
    };

    if (loading) return <div className="p-8 text-center">Memuat flashcard...</div>;

    if (error) { // Display generic error if something went wrong
        return (
            <div className="p-8 text-center text-red-500">
                <h1 className="text-2xl font-semibold mb-4">Kesalahan</h1>
                <p>{error}</p>
                 <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 text-white bg-black rounded-md">
                    Kembali ke Beranda
                </button>
            </div>
        );
    }

    if (!noteId) {
        // Render list of notes with flashcards
        return (
            <div className="p-8">
                <h1 className="text-3xl font-semibold text-black mb-6">Flashcard</h1>
                {notesWithFlashcards.length === 0 ? (
                    <div className="text-center text-gray-600">
                        <p className="mb-4">Belum ada flashcard yang dibuat. Untuk membuat flashcard, buka catatan Anda dan klik tombol 'Flashcard'.</p>
                        <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-white bg-black rounded-md">
                            Kembali ke Beranda
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {notesWithFlashcards.map(n => (
                            <Link key={n.id} href={`/dashboard/flashcards?noteId=${n.id}`} className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                <h2 className="text-lg font-semibold text-black">{n.title}</h2>
                                <p className="text-sm text-gray-500">Lihat Flashcard</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Original rendering logic for specific note flashcards
    if (flashcards.length === 0) { // If noteId exists but no flashcards were found
        return (
            <div className="p-8 text-center text-gray-600">
                <h1 className="text-2xl font-semibold mb-4">Flashcard</h1>
                <p>Tidak ada flashcard ditemukan untuk catatan ini. Coba buat dari halaman edit catatan.</p>
                 <button onClick={() => router.push('/dashboard/notes/' + noteId + '/edit')} className="mt-4 px-4 py-2 text-white bg-black rounded-md">
                    Edit Catatan
                </button>
            </div>
        );
    }
    
    const currentCard = flashcards[currentIndex];

    return (
        <div className="p-8 flex flex-col items-center justify-center h-full">
            <div className="w-full max-w-2xl">
                 <h1 className="text-2xl font-semibold text-center text-black mb-2">Flashcard untuk: {note?.title}</h1>
                 <p className="text-center text-gray-500 mb-8">Kartu {currentIndex + 1} dari {flashcards.length}</p>

                <div 
                    className="relative w-full h-80 perspective-1000"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div 
                        className={`absolute w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                    >
                        {/* Front of Card */}
                        <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
                            <p className="text-2xl font-semibold text-center text-black">{currentCard.frontText}</p>
                        </div>
                        {/* Back of Card */}
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 bg-gray-800 text-white rounded-2xl shadow-xl">
                            <p className="text-xl text-center">{currentCard.backText}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-between items-center mt-8">
                    <button onClick={goToPrev} className="flex items-center px-4 py-2 text-sm font-medium text-black bg-gray-200 rounded-md hover:bg-gray-300">
                        <ArrowLeftIcon className="w-5 h-5 mr-2"/>
                        Sebelumnya
                    </button>
                    <button onClick={goToNext} className="flex items-center px-4 py-2 text-sm font-medium text-black bg-gray-200 rounded-md hover:bg-gray-300">
                        Selanjutnya
                        <ArrowRightIcon className="w-5 h-5 ml-2"/>
                    </button>
                </div>
            </div>
        </div>
    );
}


// Wrap the component in Suspense as it uses useSearchParams
export default function FlashcardsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
            <FlashcardsDisplay />
        </Suspense>
    );
}


