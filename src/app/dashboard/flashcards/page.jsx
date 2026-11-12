"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faClone, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "@/app/components/dashboard/ConfirmationModal";
import StudyDeck from "@/app/components/flashcards/StudyDeck";
import { EmptyState, ErrorNote, Page, PageHeader, Spinner, cls } from "@/app/components/ui/kit";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { dashboardTranslations } from "@/locales/dashboard";

const STACK = ["bg-[var(--hl-yellow)]", "bg-[var(--hl-blue)]", "bg-[var(--hl-green)]", "bg-[var(--hl-pink)]"];

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
    
    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const confirmDelete = (noteInfo) => {
        setNoteToDelete(noteInfo);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteFlashcards = async () => {
        if (!noteToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/flashcards?noteId=${noteToDelete.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Gagal menghapus riwayat flashcard");
            
            // Remove the note from the list
            setNotesWithFlashcards(notesWithFlashcards.filter(n => n.id !== noteToDelete.id));
            setIsDeleteModalOpen(false);
            setNoteToDelete(null);
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan saat menghapus flashcard.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <Spinner className="h-[calc(100vh-140px)]" />;

    /* ================= DAFTAR SET ================= */
    if (!noteId) {
        return (
            <>
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteFlashcards}
                    title={t.flashcards.deleteFlashcards}
                    isMutating={isDeleting}
                >
                    <p>{t.flashcards.deleteFlashcardsConfirm}</p>
                </ConfirmationModal>

                <Page wide>
                    <PageHeader title={t.flashcards.selectSet} subtitle={t.flashcards.selectSubtitle} />
                    <div className="mt-8 space-y-6">
                        <ErrorNote>{error}</ErrorNote>
                        {notesWithFlashcards.length === 0 && !error ? (
                            <EmptyState icon={faClone} title={t.flashcards.emptyTitle} text={t.flashcards.emptySubtitle}>
                                <button onClick={() => router.push("/dashboard")} className="btn-ink h-11 px-5">
                                    {t.flashcards.backToHome}
                                </button>
                            </EmptyState>
                        ) : (
                            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                                {notesWithFlashcards.map((n, i) => (
                                    <li key={n.id} className="group relative">
                                        {/* tumpukan kartu di belakang */}
                                        <span className={`absolute inset-x-3 -top-2 h-full rotate-[-2deg] rounded-xl border-2 border-[var(--rule)] ${STACK[(i + 1) % STACK.length]}`} aria-hidden="true" />
                                        <span className="absolute inset-x-1.5 -top-1 h-full rotate-[1.5deg] rounded-xl border-2 border-[var(--rule)] bg-[var(--card)]" aria-hidden="true" />
                                        <Link href={`/dashboard/flashcards?noteId=${n.id}`} className={`relative block overflow-hidden ${cls.card} ${cls.cardHover}`}>
                                            <span className={`block h-3 ${STACK[i % STACK.length]}`} aria-hidden="true" />
                                            <span className="block p-5 pr-14">
                                                <span className="block truncate text-lg font-extrabold">{n.title}</span>
                                                <span className="hand mt-1 block text-xl text-[var(--ink-soft)] group-hover:text-[var(--margin)]">{t.flashcards.startLearning}</span>
                                            </span>
                                        </Link>
                                        <button
                                            onClick={() => confirmDelete(n)}
                                            className={`absolute top-6 right-3 ${cls.iconBtn} hover:!text-[var(--wrong)]`}
                                            title={t.flashcards.deleteFlashcards}
                                            aria-label={`${t.flashcards.deleteFlashcards}: ${n.title}`}
                                        >
                                            <FontAwesomeIcon icon={faTrashCan} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Page>
            </>
        );
    }

    /* ================= MODE BELAJAR ================= */
    return (
        <Page>
            <button
                onClick={() => router.push("/dashboard/flashcards")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
                <FontAwesomeIcon icon={faArrowLeft} />
                {language === "id" ? "Semua set" : "All sets"}
            </button>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight break-words sm:text-4xl">{note?.title}</h1>

            {error && (
                <div className="mt-8">
                    <EmptyState icon={faClone} title={t.flashcards.errorOccurred} text={error}>
                        <button onClick={() => router.push("/dashboard/notes/" + noteId + "/edit")} className="btn-ink h-11 px-5">
                            <FontAwesomeIcon icon={faPenToSquare} />
                            {t.flashcards.openEditor}
                        </button>
                    </EmptyState>
                </div>
            )}

            {!error && flashcards.length > 0 && <StudyDeck cards={flashcards} lang={language} />}
        </Page>
    );
}

export default function FlashcardsPage() {
    return (
        <Suspense fallback={<Spinner className="h-screen" />}>
            <FlashcardsDisplay />
        </Suspense>
    );
}
