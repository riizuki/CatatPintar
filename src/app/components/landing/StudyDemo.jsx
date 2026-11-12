"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faWandMagicSparkles, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";

const tabColor = { green: "hl-green", yellow: "hl-yellow", pink: "hl-pink" };

/**
 * Demo mini di hero: pilih pelajaran → klik kalimat yang membingungkan →
 * baca penjelasan AI → jawab kuis. Semua data dari locales/landing.js.
 */
export default function StudyDemo() {
  const { language } = useLanguage();
  const t = translations[language].demo;

  const [tab, setTab] = useState(0);
  const [explained, setExplained] = useState(false);
  const [picked, setPicked] = useState(null);

  const s = t.subjects[tab];
  const hl = tabColor[s.color];

  const switchTab = (i) => {
    setTab(i);
    setExplained(false);
    setPicked(null);
  };

  return (
    <div className="relative mx-auto w-full max-w-md lg:mt-6">
      {/* Catatan tangan + panah */}
      <p className="hand absolute -top-12 right-2 rotate-[-4deg] text-2xl text-[var(--margin)]" aria-hidden="true">
        {t.tryIt}
      </p>
      <svg
        className="absolute -top-6 right-24 h-8 w-10 text-[var(--margin)]"
        viewBox="0 0 40 32"
        fill="none"
        aria-hidden="true"
      >
        <path d="M34 4C26 6 14 10 10 26M10 26l-5-6M10 26l7-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Tab mata pelajaran, seperti pembatas buku */}
      <div className="flex gap-1.5 pl-10" role="tablist" aria-label="Mata pelajaran">
        {t.subjects.map((sub, i) => (
          <button
            key={sub.name}
            role="tab"
            aria-selected={tab === i}
            onClick={() => switchTab(i)}
            className={`rounded-t-lg px-3.5 pt-1.5 pb-1 text-sm font-semibold transition-colors ${
              tab === i
                ? `${tabColor[sub.color]} text-[var(--ink-fixed)]`
                : "bg-[var(--rule)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* Kertas */}
      <div className="relative rotate-[0.6deg] rounded-xl border border-[var(--rule)] bg-[var(--card)] py-6 pr-6 pl-12">
        <div className="binder-holes" aria-hidden="true">
          <span /><span /><span /><span />
        </div>

        <h3 className="text-xl font-bold">{s.title}</h3>
        <p className="hand mt-1 text-xl text-[var(--ink-soft)]">{t.hint}</p>

        <ul className="mt-3 space-y-1">
          {s.lines.map((line, i) =>
            i === s.confusing ? (
              <li key={line}>
                <button
                  onClick={() => setExplained(true)}
                  aria-expanded={explained}
                  className={`text-left leading-8 decoration-[var(--margin)] decoration-wavy decoration-2 underline-offset-4 ${
                    explained ? `hl ${hl} no-underline` : "underline"
                  }`}
                >
                  {line}
                </button>
              </li>
            ) : (
              <li key={line} className="leading-8">{line}</li>
            )
          )}
        </ul>

        {explained && (
          <div className="mt-4 rounded-lg bg-[var(--hl-blue)] p-4 text-sm leading-relaxed text-[var(--ink-fixed)]" role="status">
            <p className="flex items-center gap-2 font-bold">
              <FontAwesomeIcon icon={faWandMagicSparkles} />
              {t.aiLabel}
            </p>
            <p className="mt-1">{s.explain}</p>
          </div>
        )}

        {/* Kuis */}
        <div className="mt-6 border-t-2 border-dashed border-[var(--rule)] pt-4">
          <p className="text-sm font-semibold text-[var(--ink-soft)]">{t.quizLabel}</p>
          <p className="mt-1 font-semibold">{s.question}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {s.options.map((opt, i) => {
              const isAnswer = i === s.answer;
              const chosen = picked === i;
              let state = "border-[var(--rule)] hover:border-[var(--ink-soft)]";
              if (picked !== null && isAnswer) state = "border-[var(--right)] text-[var(--right)] font-bold";
              else if (chosen) state = "border-[var(--wrong)] text-[var(--wrong)] line-through";
              return (
                <button
                  key={opt}
                  disabled={picked !== null}
                  onClick={() => setPicked(i)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border-2 px-2 py-2 text-sm transition-colors disabled:cursor-default ${state}`}
                >
                  {picked !== null && isAnswer && <FontAwesomeIcon icon={faCheck} />}
                  {chosen && !isAnswer && <FontAwesomeIcon icon={faXmark} />}
                  {opt}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <p className="hand mt-3 text-2xl" role="status">
              {picked === s.answer ? (
                <span className="text-[var(--right)]">{t.right}</span>
              ) : (
                <span className="text-[var(--wrong)]">
                  {t.wrong} {s.options[s.answer]}
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
