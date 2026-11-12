"use client";

import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "../ThemeToggle";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";

const Header = () => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language].header;

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--rule)] bg-[var(--paper)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/img/logo.png" alt="CatatPintar" width={28} height={28} priority />
          <span className="text-lg font-extrabold tracking-tight">CatatPintar</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 font-medium text-[var(--ink-soft)]">
          <a href="#fitur" className="hover:text-[var(--ink)]">{t.features}</a>
          <a href="#cara-kerja" className="hover:text-[var(--ink)]">{t.howItWorks}</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleLanguage}
            className="h-9 w-9 rounded-lg text-xs font-bold text-[var(--ink-soft)] hover:bg-[var(--rule)]"
            title="Ganti Bahasa / Change Language"
          >
            {language.toUpperCase()}
          </button>
          <ThemeToggle />
          <Link href="/login" className="hidden sm:inline px-2 font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]">
            {t.login}
          </Link>
          <Link href="/register" className="btn-ink h-9 px-4 text-sm">
            {t.register}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
