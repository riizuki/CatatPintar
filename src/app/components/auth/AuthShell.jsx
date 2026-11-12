"use client";

import "../../landing.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleExclamation, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import ThemeToggle from "../ThemeToggle";

/**
 * Kerangka halaman login & register dengan tema buku tulis.
 * - aside: isi panel kertas bergaris di kiri (hanya tampil di layar lebar)
 */
export default function AuthShell({ title, subtitle, aside, children }) {
  return (
    <div className="landing min-h-screen lg:grid lg:grid-cols-[1fr_minmax(28rem,36rem)]">
      {/* Panel kiri: kertas bergaris */}
      <aside className="ruled relative hidden overflow-hidden border-r-2 border-[var(--rule)] lg:block">
        <div className="margin-line left-16" aria-hidden="true" />
        <div className="flex h-full flex-col justify-between py-12 pr-12 pl-24">
          <Link href="/" className="flex items-center gap-2 self-start">
            <Image src="/img/logo.png" alt="CatatPintar" width={30} height={30} priority />
            <span className="text-lg font-extrabold tracking-tight">CatatPintar</span>
          </Link>
          <div className="max-w-md">{aside}</div>
          <span aria-hidden="true" />
        </div>
      </aside>

      {/* Panel kanan: formulir */}
      <main className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Kembali ke beranda
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <Image src="/img/logo.png" alt="CatatPintar" width={30} height={30} priority />
            <span className="text-lg font-extrabold tracking-tight">CatatPintar</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-[var(--ink-soft)]">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

const inputClass =
  "block w-full rounded-[10px] border-2 border-[var(--rule)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] placeholder:text-[var(--ink-soft)]/60 outline-none transition-colors focus:border-[var(--ink-soft)]";

export function Field({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <input id={id} name={id} className={inputClass} {...props} />
    </div>
  );
}

export function PasswordField({ id = "password", label = "Kata sandi", ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input id={id} name={id} type={show ? "text" : "password"} className={`${inputClass} pr-12`} {...props} />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)]"
        >
          <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
        </button>
      </div>
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-[10px] border-2 border-[var(--wrong)] px-3 py-2 text-sm font-medium text-[var(--wrong)]">
      <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5" />
      {children}
    </p>
  );
}

export function SubmitButton({ loading, children, loadingText = "Memproses…" }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="btn-ink w-full px-4 py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading && (
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {loading ? loadingText : children}
    </button>
  );
}
