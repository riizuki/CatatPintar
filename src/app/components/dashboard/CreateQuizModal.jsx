"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faFileLines, faListCheck, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { Modal, cls } from "../ui/kit";

/* Pilihan berbentuk tombol (segmented) */
function Choice({ options, value, onChange, label }) {
  return (
    <div>
      <p className={cls.label}>{label}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            onClick={() => onChange(opt)}
            className={`h-10 min-w-[3.5rem] rounded-[10px] border-2 px-4 text-sm font-bold transition-colors ${
              value === opt
                ? "border-[var(--ink-fixed)] bg-[var(--hl-yellow)] text-[var(--ink-fixed)]"
                : "border-[var(--rule)] text-[var(--ink)] hover:border-[var(--ink-soft)]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

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
            <div>
              <p className={cls.label}>Pilih catatan</p>
              {isLoadingNotes && <p className="hand text-xl text-[var(--ink-soft)]">Memuat catatan…</p>}
              {preselectedSourceType === "note" ? (
                <div className="rounded-[10px] border-2 border-[var(--ink-fixed)] bg-[var(--hl-yellow)] px-4 py-3 font-bold text-[var(--ink-fixed)]">
                  Catatan ini (ID {preselectedSourceValue})
                </div>
              ) : (
                <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                  {notes.map((note) => {
                    const active = selectedNoteId === note.id;
                    return (
                      <button
                        type="button"
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        aria-pressed={active}
                        className={`flex w-full items-center gap-3 rounded-[10px] border-2 px-4 py-3 text-left transition-colors ${
                          active
                            ? "border-[var(--ink-fixed)] bg-[var(--hl-yellow)] text-[var(--ink-fixed)]"
                            : "border-[var(--rule)] hover:border-[var(--ink-soft)]"
                        }`}
                      >
                        <FontAwesomeIcon icon={active ? faCheck : faFileLines} className="shrink-0 text-[var(--ink-soft)]" fixedWidth />
                        <span className="truncate font-bold">{note.title}</span>
                      </button>
                    );
                  })}
                  {!isLoadingNotes && notes.length === 0 && (
                    <p className="text-[var(--ink-soft)]">Belum ada catatan. Buat catatan dulu, atau pilih &ldquo;Dari topik&rdquo;.</p>
                  )}
                </div>
              )}
            </div>
            <Choice label="Jumlah pertanyaan" options={[5, 10, 15, 20]} value={numQuestions} onChange={setNumQuestions} />
          </div>
        );
      case "enterTopic":
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="topic" className={cls.label}>Topik kuis</label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="mis. Sistem pencernaan manusia"
                className={cls.input}
                autoComplete="off"
                autoFocus
              />
            </div>
            <Choice label="Jumlah pertanyaan" options={[5, 10, 15, 20]} value={numQuestions} onChange={setNumQuestions} />
            <Choice label="Tingkat kesulitan" options={["Mudah", "Sedang", "Sulit"]} value={difficulty} onChange={setDifficulty} />
          </div>
        );
      case "selectType":
      default:
        return (
          <div>
            <p className="text-[var(--ink-soft)]">Mau bikin kuis dari mana?</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { type: "note", next: "selectNote", icon: faFileLines, hl: "bg-[var(--hl-yellow)]", title: "Dari catatan", desc: "Soal dibuat dari isi catatanmu sendiri." },
                { type: "topic", next: "enterTopic", icon: faWandMagicSparkles, hl: "bg-[var(--hl-blue)]", title: "Dari topik", desc: "Tulis topik apa saja, AI yang menyusun soalnya." },
              ].map((o) => (
                <button
                  key={o.type}
                  type="button"
                  onClick={() => { setSourceType(o.type); setStep(o.next); }}
                  className={`group flex flex-col items-start gap-3 rounded-xl border-2 border-[var(--rule)] p-5 text-left ${cls.cardHover}`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg text-[var(--ink-fixed)] ${o.hl}`}>
                    <FontAwesomeIcon icon={o.icon} />
                  </span>
                  <span className="text-lg font-extrabold">{o.title}</span>
                  <span className="text-sm text-[var(--ink-soft)]">{o.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  const isSubmitDisabled = isGenerating || (step === "selectNote" && !selectedNoteId) || (step === "enterTopic" && !topic);
  const showBack = step !== "selectType" && !preselectedSourceType;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      busy={isGenerating}
      size="max-w-xl"
      title="Buat kuis baru"
      icon={faListCheck}
      iconClass="bg-[var(--hl-pink)]"
      footer={
        step === "selectNote" || step === "enterTopic" ? (
          <>
            {showBack && (
              <button type="button" onClick={() => setStep("selectType")} disabled={isGenerating} className={`${cls.btnOutline} sm:mr-auto`}>
                <FontAwesomeIcon icon={faArrowLeft} />
                Kembali
              </button>
            )}
            <button type="button" onClick={handleGenerateQuiz} disabled={isSubmitDisabled} className="btn-ink h-10 px-6 text-sm disabled:cursor-not-allowed disabled:opacity-50">
              <FontAwesomeIcon icon={faWandMagicSparkles} />
              {isGenerating ? "Membuat soal…" : "Buat kuis"}
            </button>
          </>
        ) : null
      }
    >
      {renderContent()}
      {error && (
        <p role="alert" className="mt-5 rounded-[10px] border-2 border-[var(--wrong)] px-4 py-3 text-sm font-semibold text-[var(--wrong)]">
          {error}
        </p>
      )}
    </Modal>
  );
};

export default CreateQuizModal;
