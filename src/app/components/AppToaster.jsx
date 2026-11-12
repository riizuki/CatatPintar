"use client";

/**
 * Notifikasi (toast) bergaya buku tulis untuk seluruh aplikasi.
 * Tetap memakai react-hot-toast, jadi semua pemanggilan toast.success / toast.error /
 * toast.loading di halaman lain otomatis ikut tampilan ini.
 */
import "./app-toaster.css";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck, faExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";

const STYLE = {
  success: { badge: "bg-[#96edb6]", bar: "bg-[#1a9e55]", icon: faCheck },
  error: { badge: "bg-[#ff9fcb]", bar: "bg-[#e5484d]", icon: faExclamation },
  loading: { badge: "bg-[#a9def5]", bar: "bg-[#3b4bc8]", icon: null },
  blank: { badge: "bg-[#ffe14d]", bar: "bg-[#1e2a78]", icon: faBell },
  custom: { badge: "bg-[#ffe14d]", bar: "bg-[#1e2a78]", icon: faBell },
};

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerStyle={{ top: 20 }}
      toastOptions={{
        duration: 3000,
        success: { duration: 2800 },
        error: { duration: 4500 },
        style: { background: "transparent", boxShadow: "none", padding: 0, maxWidth: "none" },
      }}
    >
      {(t) => (
        <ToastBar toast={t} style={{ ...t.style, animation: "none" }}>
          {({ message }) => {
            const s = STYLE[t.type] || STYLE.blank;
            return (
              <div
                className={`cp-toast group relative flex w-[min(92vw,420px)] items-center gap-3 overflow-hidden rounded-2xl border-2 border-[#1e2a78] bg-white py-2.5 pr-2.5 pl-2.5 text-[#1e2a78] dark:border-[#3b4bc8] dark:bg-[#15203a] dark:text-[#dbe3ff] ${
                  t.visible ? "cp-toast-in" : "cp-toast-out"
                }`}
              >
                {/* Lencana ikon */}
                <span className={`flex h-10 w-10 shrink-0 -rotate-6 items-center justify-center rounded-xl border-2 border-[#1e2a78] text-[#1e2a78] ${s.badge}`}>
                  {t.type === "loading" ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-[3px] border-[#1e2a78]/25 border-t-[#1e2a78]" />
                  ) : (
                    <FontAwesomeIcon icon={s.icon} className="cp-toast-icon" />
                  )}
                </span>

                <div className="min-w-0 flex-1 text-[15px] leading-snug font-bold [&>div]:!m-0 [&>div]:!justify-start [&>div]:!text-left">{message}</div>

                {t.type !== "loading" && (
                  <button
                    type="button"
                    onClick={() => toast.dismiss(t.id)}
                    aria-label="Tutup notifikasi"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#4a5487] opacity-60 transition-opacity hover:bg-[#d6e4f5] hover:opacity-100 dark:text-[#9aa7cf] dark:hover:bg-[#1c2a44]"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                )}

                {/* Bar waktu yang menyusut */}
                {t.type !== "loading" && t.duration !== Infinity && (
                  <span
                    className={`cp-toast-timer absolute bottom-0 left-0 h-[3px] ${s.bar}`}
                    style={{ animationDuration: `${t.duration}ms` }}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          }}
        </ToastBar>
      )}
    </Toaster>
  );
}
