"use client";

import { XMarkIcon, DocumentTextIcon, SparklesIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CreateQuizModal = ({ isOpen, onClose, preselectedSourceType = null, preselectedSourceValue = null }) => {
  const router = useRouter();
  const [step, setStep] = useState("selectType");
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [topic, setTopic] = useState("");
  const [sourceType, setSourceType] = useState(preselectedSourceType || "");
  
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("Sedang");

  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Effect to handle preselected values
  useEffect(() => {
    if (!isOpen) return; // Only run when modal is open

    if (preselectedSourceType) {
      setSourceType(preselectedSourceType);
      if (preselectedSourceType === "note") {
        setStep("selectNote");
        setSelectedNoteId(preselectedSourceValue);
      } else if (preselectedSourceType === "topic") {
        setStep("enterTopic");
        setTopic(preselectedSourceValue);
      }
    } else {
      // If modal opens without preselection, ensure step is 'selectType'
      setStep("selectType");
    }
  }, [isOpen, preselectedSourceType, preselectedSourceValue]);

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
    // Determine the initial step based on preselectedSourceType
    const initialStep = preselectedSourceType 
                          ? (preselectedSourceType === 'note' ? 'selectNote' : 'enterTopic') 
                          : "selectType";
    setStep(initialStep);
    
    // Set initial values for selectedNoteId and topic based on preselectedSourceType
    setSelectedNoteId(preselectedSourceType === 'note' ? preselectedSourceValue : null);
    setTopic(preselectedSourceType === 'topic' ? preselectedSourceValue : "");
    
    // Reset other states
    setError("");
    setIsGenerating(false);
    setNumQuestions(10);
    setDifficulty("Sedang");
    setSourceType(preselectedSourceType || "");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setError("");

    const sourceValue = sourceType === 'note' ? selectedNoteId : topic;

    const payload = {
        sourceType,
        sourceValue,
        numQuestions,
    };

    if (sourceType === 'topic') {
        payload.difficulty = difficulty;
    }

    try {
      const res = await fetch('/api/generate/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case "selectNote":
        return (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-black mb-4">Pilih Catatan</h3>
            {isLoadingNotes && <p>Memuat catatan...</p>}
            {preselectedSourceType === "note" ? (
                <div className="p-3 sm:p-4 rounded-lg border-2 bg-blue-100 border-[#00A2D8] ring-2 ring-[#00A2D8]/50 cursor-not-allowed">
                    <p className="font-medium text-black truncate text-sm sm:text-base">Catatan ID: {preselectedSourceValue}</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                {notes.map((note) => (
                    <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3 sm:p-4 rounded-lg cursor-pointer border-2 transition-all ${
                        selectedNoteId === note.id
                        ? "bg-blue-100 border-[#00A2D8] ring-2 ring-[#00A2D8]/50"
                        : "bg-gray-100 hover:bg-gray-200 border-gray-200"
                    }`}
                    >
                    <p className="font-medium text-black truncate text-sm sm:text-base">{note.title}</p>
                    </div>
                ))}
                </div>
            )}
            <div className="mt-4">
                <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700">Jumlah Pertanyaan</label>
                <select id="numQuestions" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A2D8] focus:border-[#00A2D8] sm:text-sm">
                    <option>5</option>
                    <option>10</option>
                    <option>15</option>
                    <option>20</option>
                </select>
            </div>
          </div>
        );
      case "enterTopic":
        return (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-black mb-4">Masukkan Topik</h3>
            <div className="space-y-4">
                <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="cth., 'Dasar-dasar Pembelajaran Mesin'"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 placeholder-gray-500 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-[#00A2D8] text-sm sm:text-base"
                autoComplete="off"
                />
                <div>
                    <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700">Jumlah Pertanyaan</label>
                    <select id="numQuestions" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A2D8] focus:border-[#00A2D8] sm:text-sm">
                        <option>5</option>
                        <option>10</option>
                        <option>15</option>
                        <option>20</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Tingkat Kesulitan</label>
                    <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="mt-1 block w-full px-3 py-2 sm:px-4 sm:py-3 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00A2D8] focus:border-[#00A2D8] sm:text-sm">
                        <option>Mudah</option>
                        <option>Sedang</option>
                        <option>Sulit</option>
                    </select>
                </div>
            </div>
          </div>
        );
      case "selectType":
      default:
        return (
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">Buat Kuis Baru</h3>
            <p className="text-gray-500 mb-8 text-sm sm:text-base">Pilih sumber untuk membuat kuis Anda.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => { setSourceType('note'); setStep("selectNote");}} 
                className="flex flex-col items-center justify-center p-4 sm:p-6 text-base sm:text-lg font-semibold text-black bg-gray-50 rounded-lg border-2 border-gray-200 hover:bg-gray-100 hover:border-[#00A2D8] transition-all"
              >
                <DocumentTextIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-3 text-gray-500" />
                Buat dari Catatan
              </button>
              <button 
                onClick={() => { setSourceType('topic'); setStep("enterTopic");}} 
                className="flex flex-col items-center justify-center p-4 sm:p-6 text-base sm:text-lg font-semibold text-black bg-gray-50 rounded-lg border-2 border-gray-200 hover:bg-gray-100 hover:border-[#00A2D8] transition-all"
              >
                <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-3 text-[#00A2D8]" />
                Buat dengan AI
              </button>
            </div>
          </div>
        );
    }
  };

  const renderFooter = () => {
      const isSubmitDisabled = isGenerating || (step === 'selectNote' && !selectedNoteId) || (step === 'enterTopic' && !topic);
      
      if (step === 'selectNote' || step === 'enterTopic') {
          return (
            <div className="mt-8 flex justify-end">
                <button
                onClick={handleGenerateQuiz}
                disabled={isSubmitDisabled}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-[#00A2D8] rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#008EB2]"
                >
                {isGenerating ? 'Membuat...' : 'Buat Kuis'}
                </button>
            </div>
          )
      } else if (step === 'selectType' && preselectedSourceType) {
        // If preselected, and we are somehow back at selectType,
        // we should not show any button here, as the flow is direct.
        return null;
      }
      return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 ${isOpen ? '' : 'hidden'}`}>
      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
            {(step !== 'selectType' && !preselectedSourceType) && (
                <button onClick={() => setStep('selectType')} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-500" />
                </button>
            )}
            <div className="flex-grow"></div>
            <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-200 ml-auto">
                <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
        </div>
        <div>
          {renderContent()}
        </div>
        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        {renderFooter()}
      </div>
    </div>
  );
};

export default CreateQuizModal;
