"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";
import StudyDemo from "./StudyDemo";

const Hero = () => {
  const { language } = useLanguage();
  const t = translations[language].hero;

  return (
    <section className="ruled relative overflow-hidden">
      <div className="relative mx-auto grid max-w-6xl items-start gap-20 px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* Garis margin buku tulis */}
        <div className="margin-line -top-32 -bottom-32 left-4 sm:left-6 hidden sm:block" aria-hidden="true" />

        <div className="sm:pl-10">
          <h1 className="text-[2.6rem] leading-[3rem] sm:text-6xl sm:leading-[4rem] font-extrabold tracking-tight">
            {t.title}
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">{t.subtitle}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/register" className="btn-ink px-6 py-3 text-base">
              {t.ctaStart}
            </Link>
            <Link href="/login" className="font-semibold text-[var(--ink-soft)] underline-offset-4 hover:text-[var(--ink)] hover:underline">
              {t.ctaLogin}
            </Link>
          </div>

          {/* Catatan tangan dengan panah ke tombol */}
          <div className="mt-3 flex items-start gap-1 pl-3 text-[var(--margin)]" aria-hidden="true">
            <svg className="h-9 w-8 shrink-0" viewBox="0 0 32 36" fill="none">
              <path d="M24 32C12 30 6 22 8 6M8 6l-5 6M8 6l6 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hand mt-4 rotate-[-2deg] text-2xl">{t.handNote}</span>
          </div>
        </div>

        <StudyDemo />
      </div>
    </section>
  );
};

export default Hero;
