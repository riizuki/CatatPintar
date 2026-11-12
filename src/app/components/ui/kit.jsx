"use client";

/**
 * Komponen UI bersama untuk halaman dashboard (tema buku tulis).
 * Warna diambil dari variabel di landing.css: --ink, --rule, --card, --hl-*, dll.
 */
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

/* ---------- kelas siap pakai ---------- */
export const cls = {
  // tombol garis tepi (sekunder)
  btnOutline:
    "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--rule)] px-4 text-sm font-bold text-[var(--ink)] transition-colors hover:border-[var(--ink-soft)] disabled:cursor-not-allowed disabled:opacity-50",
  // tombol bahaya (hapus)
  btnDanger:
    "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[var(--wrong)] px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
  // tombol ikon kecil
  iconBtn:
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--rule)] hover:text-[var(--ink)] disabled:opacity-40",
  // kartu
  card: "rounded-xl border-2 border-[var(--rule)] bg-[var(--card)]",
  cardHover: "transition-colors hover:border-[var(--ink-soft)]",
  // kolom isian
  input:
    "block w-full rounded-[10px] border-2 border-[var(--rule)] bg-[var(--card)] px-4 py-2.5 text-base text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--ink-soft)]/60 focus:border-[var(--ink-soft)]",
  label: "mb-1.5 block text-sm font-semibold text-[var(--ink)]",
};

/* ---------- judul halaman ---------- */
export function PageHeader({ title, subtitle, note, action }) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">{subtitle}</p>}
        {note && <p className="hand mt-1 rotate-[-1deg] text-2xl text-[var(--margin)]">{note}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-3">{action}</div>}
    </header>
  );
}

/* ---------- wadah halaman ---------- */
export function Page({ children, wide = false }) {
  return <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-5xl"} px-4 py-8 sm:px-6 md:px-10 md:py-10`}>{children}</div>;
}

/* ---------- tampilan kosong ---------- */
export function EmptyState({ icon, title, text, children }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-[var(--rule)] px-6 py-14 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--hl-yellow)] text-xl text-[var(--ink-fixed)]">
          <FontAwesomeIcon icon={icon} />
        </div>
      )}
      <p className="text-lg font-bold">{title}</p>
      {text && <p className="hand mt-1 text-xl text-[var(--ink-soft)]">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

/* ---------- spinner ---------- */
export function Spinner({ className = "py-20" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--rule)] border-t-[var(--ink)]" />
    </div>
  );
}

/* ---------- pesan error ---------- */
export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-xl border-2 border-[var(--wrong)] px-4 py-3 font-medium text-[var(--wrong)]">
      {children}
    </p>
  );
}

/* ---------- modal ---------- */
export function Modal({ open, onClose, title, icon, iconClass = "bg-[var(--hl-yellow)]", children, footer, size = "max-w-md", busy }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !busy && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--ink-fixed)]/45 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={`w-full ${size} max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-[var(--ink-fixed)] bg-[var(--card)] text-[var(--ink)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b-2 border-[var(--rule)] px-6 py-5">
          <div className="flex items-center gap-3">
            {icon && (
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--ink-fixed)] ${iconClass}`}>
                <FontAwesomeIcon icon={icon} />
              </span>
            )}
            <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Tutup" className={cls.iconBtn}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-3 border-t-2 border-[var(--rule)] px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}
