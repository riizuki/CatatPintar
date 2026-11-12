"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

/**
 * Saklar mode terang/gelap.
 * Kapsul + kenop bulat yang bergeser dengan sedikit pantulan,
 * ikon berputar saat berganti, dan bintang kecil muncul di mode gelap.
 * Dipakai di landing, login, register, dan dashboard.
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Placeholder ukuran sama supaya header tidak bergeser saat dimuat
  if (!mounted) {
    return <div className="h-8 w-[60px] shrink-0 rounded-full bg-[#e3eaf5] dark:bg-[#3b4bc8]" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap";
  const ease = "ease-[cubic-bezier(0.34,1.56,0.64,1)]"; // sedikit memantul

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative h-8 w-[60px] shrink-0 overflow-hidden rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9def5] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
        isDark ? "bg-[#3b4bc8]" : "bg-[#e3eaf5] hover:bg-[#d6e0ef]"
      }`}
    >
      {/* Bintang kecil (mode gelap) */}
      <span
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${isDark ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      >
        <span className="absolute top-[8px] left-[10px] h-[3px] w-[3px] rounded-full bg-white" />
        <span className="absolute top-[17px] left-[17px] h-[2px] w-[2px] rounded-full bg-white/80" />
        <span className="absolute top-[11px] left-[23px] h-[2px] w-[2px] rounded-full bg-white/60" />
      </span>

      {/* Kenop */}
      <span
        className={`absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#c9d5e8] bg-white transition-transform duration-500 ${ease} ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
        aria-hidden="true"
      >
        <FontAwesomeIcon
          icon={faSun}
          className={`absolute text-[13px] text-amber-500 transition-all duration-500 ${ease} ${
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <FontAwesomeIcon
          icon={faMoon}
          className={`absolute text-[12px] text-[#3b4bc8] transition-all duration-500 ${ease} ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
