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
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Pilih Catatan</h3>
            {isLoadingNotes && <p className="text-gray-500 dark:text-gray-400">Memuat catatan...</p>}
            {preselectedSourceType === "note" ? (
                <div className="p-4 rounded-xl border-2 bg-blue-50 dark:bg-blue-900/20 border-[#00A2D8] text-[#00A2D8] dark:text-[#4CC1EE] cursor-not-allowed">
                    <p className="font-bold text-sm sm:text-base">Catatan ID: {preselectedSourceValue}</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {notes.map((note) => (
                    <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-300 ${ selectedNoteId === note.id ? "bg-blue-50 dark:bg-blue-900/20 border-[#00A2D8] text-[#00A2D8] dark:text-[#4CC1EE] " : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200" }`}
                    >
                    <p className="font-bold text-sm sm:text-base truncate">{note.title}</p>
                    </div>
                ))}
                </div>
            )}
            <div className="mt-6">
                <label htmlFor="numQuestions" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Jumlah Pertanyaan</label>
                <select id="numQuestions" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8]/50 focus:border-[#00A2D8] transition-all">
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
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Masukkan Topik</h3>
            <div className="space-y-6">
                <div>
                    <label htmlFor="topic" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Topik Kuis</label>
                    <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="cth., 'Dasar-dasar Pembelajaran Mesin'"
                    className="block w-full px-4 py-3 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8]/50 focus:border-[#00A2D8] transition-all"
                    autoComplete="off"
                    />
                </div>
                <div>
                    <label htmlFor="numQuestions" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Jumlah Pertanyaan</label>
                    <select id="numQuestions" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8]/50 focus:border-[#00A2D8] transition-all">
                        <option>5</option>
                        <option>10</option>
                        <option>15</option>
                        <option>20</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="difficulty" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tingkat Kesulitan</label>
                    <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8]/50 focus:border-[#00A2D8] transition-all">
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
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Buat Kuis Baru</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm sm:text-base">Pilih sumber untuk membuat kuis Anda.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => { setSourceType('note'); setStep("selectNote");}} 
                className="group flex flex-col items-center justify-center p-6 sm:p-8 font-bold text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:border-[#00A2D8]/50 dark:hover:border-[#4CC1EE]/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-4 rounded-2xl mb-4 bg-gray-50 dark:bg-gray-900/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <DocumentTextIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500 group-hover:text-[#00A2D8] dark:group-hover:text-[#4CC1EE] transition-colors" />
                </div>
                Buat dari Catatan
              </button>
              <button 
                onClick={() => { setSourceType('topic'); setStep("enterTopic");}} 
                className="group flex flex-col items-center justify-center p-6 sm:p-8 font-bold text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:border-[#00A2D8]/50 dark:hover:border-[#4CC1EE]/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-4 rounded-2xl mb-4 bg-sky-50 dark:bg-sky-900/20 transition-colors group-hover:scale-110 transform duration-300">
                    <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#00A2D8] dark:text-[#4CC1EE]" />
                </div>
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
                className="w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base font-bold text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-xl disabled:from-gray-400 disabled:to-gray-500 disabled: disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 transition-all ${isOpen ? '' : 'hidden'}`}>
      <div className="w-full max-w-md sm:max-w-2xl p-6 sm:p-10 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
            {(step !== 'selectType' && !preselectedSourceType) && (
                <button onClick={() => setStep('selectType')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
            )}
            <div className="flex-grow"></div>
            <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-auto">
                <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
        </div>
        <div>
          {renderContent()}
        </div>
        {error && <p className="text-sm font-bold text-rose-500 mt-4 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl">{error}</p>}
        {renderFooter()}
      </div>
    </div>
  );
};

export default CreateQuizModal;
