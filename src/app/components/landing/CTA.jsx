"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";

const CTA = () => {
  const { language } = useLanguage();
  const t = translations[language].cta;

  return (
    <section className="px-4 sm:px-6 pb-20 sm:pb-28">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 rounded-2xl bg-[var(--ink-btn)] px-8 py-12 sm:px-14 md:flex-row md:items-center md:justify-between">
        <h2 className="max-w-xl text-2xl sm:text-3xl font-extrabold leading-snug text-white">{t.title}</h2>
        <Link
          href="/register"
          className="shrink-0 rounded-[10px] bg-[var(--hl-yellow)] px-6 py-3 font-bold text-[var(--ink-fixed)] transition-[filter,transform] hover:brightness-95 active:scale-[0.97]"
        >
          {t.button}
        </Link>
      </div>
    </section>
  );
};

export default CTA;
