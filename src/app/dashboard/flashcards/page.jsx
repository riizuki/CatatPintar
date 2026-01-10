"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
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

    useEffect(() => {
        if (!noteId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [cardsRes, noteRes] = await Promise.all([
                    fetch(`/api/flashcards?noteId=${noteId}`),
                    fetch(`/api/notes/${noteId}`)
                ]);

                if (!cardsRes.ok || !noteRes.ok) {
                    throw new Error("Could not load flashcards or note details.");
                }

                const cardsData = await cardsRes.json();
                const noteData = await noteRes.json();

                setFlashcards(cardsData);
                setNote(noteData);

                if (cardsData.length === 0) {
                     setError("No flashcards found for this note. Try generating them from the note's edit page.");
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [noteId]);

    const goToNext = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev + 1) % flashcards.length);
    };

    const goToPrev = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
    };

    if (loading) return <div className="p-8 text-center">Loading flashcards...</div>;

    if (!noteId || error) {
        return (
            <div className="p-8 text-center text-gray-600">
                <h1 className="text-2xl font-semibold mb-4">Flashcards</h1>
                <p>{error || "To view flashcards, go to a specific note and click 'Generate Flashcards'."}</p>
                 <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 text-white bg-black rounded-md">
                    Back to Dashboard
                </button>
            </div>
        );
    }
    
    const currentCard = flashcards[currentIndex];

    return (
        <div className="p-8 flex flex-col items-center justify-center h-full">
            <div className="w-full max-w-2xl">
                 <h1 className="text-2xl font-semibold text-center text-black mb-2">Flashcards for: {note?.title}</h1>
                 <p className="text-center text-gray-500 mb-8">Card {currentIndex + 1} of {flashcards.length}</p>

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
                        Previous
                    </button>
                    <button onClick={goToNext} className="flex items-center px-4 py-2 text-sm font-medium text-black bg-gray-200 rounded-md hover:bg-gray-300">
                        Next
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
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <FlashcardsDisplay />
        </Suspense>
    );
}

// Add some CSS for the 3D effect
const styles = `
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }
`;

// Inject styles into the head
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

