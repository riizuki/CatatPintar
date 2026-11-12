"use client";

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language].footer;

  return (
    <footer className="border-t-2 border-[var(--rule)]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:px-6 py-8 text-sm text-[var(--ink-soft)] md:flex-row md:items-center">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/img/logo.png" alt="CatatPintar" width={22} height={22} />
            <span className="font-bold text-[var(--ink)]">CatatPintar</span>
          </Link>
          <p className="mt-1">{t.description}</p>
        </div>
        <p>
          &copy; {new Date().getFullYear()} CatatPintar. {t.madeWith}{" "}
          <FontAwesomeIcon icon={faHeart} className="text-[var(--margin)]" /> {t.by}{" "}
          <span className="font-semibold text-[var(--ink)]">Rizky Al Farid Hafizh</span>
        </p>
      </div>
    </footer>
  );
}
