"use client";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";

// Lingkaran coretan tangan di sekitar nomor langkah
const Scribble = () => (
  <svg className="absolute inset-0 h-full w-full text-[var(--margin)]" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path
      d="M50 12C40 4 18 5 10 18C3 30 8 50 26 56C44 62 60 50 58 32C57 22 50 14 38 11"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

const HowItWorks = () => {
  const { language } = useLanguage();
  const t = translations[language].how;

  return (
    <section id="cara-kerja" className="scroll-mt-16 border-t-2 border-[var(--rule)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t.title}</h2>

        <ol className="mt-12 grid gap-10 sm:grid-cols-3">
          {t.steps.map((step, i) => (
            <li key={step.title} className="flex gap-5">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                <Scribble />
                <span className="hand text-4xl">{i + 1}</span>
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-1 leading-7 text-[var(--ink-soft)]">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
