"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CreateQuizModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [step, setStep] = useState("selectType");
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [topic, setTopic] = useState("");
  
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Fetch notes only when the user wants to create from notes
  useEffect(() => {
    if (step === "selectNote" && isOpen) {
      setIsLoadingNotes(true);
      setError("");
      fetch("/api/notes")
        .then((res) => {
          if (!res.ok) throw new Error("Gagal memuat catatan.");
          return res.json();
        })
        .then((data) => setNotes(data))
        .catch((err) => setError(err.message))
        .finally(() => setIsLoadingNotes(false));
    }
  }, [step, isOpen]);
  
  const resetState = () => {
    setStep("selectType");
    setSelectedNoteId(null);
    setTopic("");
    setError("");
    setIsGenerating(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setError("");

    const sourceType = step === 'selectNote' ? 'note' : 'topic';
    const sourceValue = step === 'selectNote' ? selectedNoteId : topic;

    try {
      const res = await fetch('/api/generate/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceType, sourceValue })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Gagal membuat kuis.`);
      }

      const { quizId } = await res.json();
      handleClose();
      router.push(`/dashboard/quiz/${quizId}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case "selectNote":
        return (
          <div>
            <h3 className="text-xl font-semibold text-black mb-4">Pilih Catatan</h3>
            {isLoadingNotes && <p>Memuat catatan...</p>}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-4 rounded-md cursor-pointer ${
                    selectedNoteId === note.id
                      ? "bg-gray-200 border border-black"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <p className="font-medium text-black truncate">{note.title}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "enterTopic":
        return (
          <div>
            <h3 className="text-xl font-semibold text-black mb-4">Masukkan Topik</h3>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="cth., 'Dasar-dasar Pembelajaran Mesin'"
              className="w-full px-3 py-2 placeholder-gray-500 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
            />
          </div>
        );
      case "selectType":
      default:
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-black mb-6">Buat Kuis Baru</h3>
            <div className="flex flex-col space-y-4">
              <button onClick={() => setStep("selectNote")} className="w-full px-6 py-3 text-lg font-medium text-white bg-black rounded-md hover:bg-gray-800">
                Buat dari Catatan Saya
              </button>
              <button onClick={() => setStep("enterTopic")} className="w-full px-6 py-3 text-lg font-medium text-white bg-black rounded-md hover:bg-gray-800">
                Buat dengan Topik AI
              </button>
            </div>
          </div>
        );
    }
  };

  const showSubmit = step === 'selectNote' || step === 'enterTopic';
  const isSubmitDisabled = isGenerating || (step === 'selectNote' && !selectedNoteId) || (step === 'enterTopic' && !topic);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm ${isOpen ? '' : 'hidden'}`}>
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-black mb-6">Buat Kuis</h2>
            <button onClick={handleClose} className="relative z-50">
                <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
        </div>
        {renderContent()}
        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        {showSubmit && (
             <div className="mt-6 flex justify-end">
              <button
                onClick={handleGenerateQuiz}
                disabled={isSubmitDisabled}
                className="px-6 py-2 text-sm font-medium text-white bg-black rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Membuat...' : 'Buat Kuis'}
              </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CreateQuizModal;
