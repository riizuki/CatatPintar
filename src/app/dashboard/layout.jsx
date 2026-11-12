"use client";

import "../landing.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChevronLeft,
  faClone,
  faFileArrowUp,
  faFolder,
  faGear,
  faHouse,
  faListCheck,
  faRightFromBracket,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "../components/dashboard/ConfirmationModal";
import { DashboardProvider, useDashboard } from "../../lib/contexts/DashboardContext";
import AIChat from "../components/dashboard/AIChat";
import ThemeToggle from "../components/ThemeToggle";
import { useLanguage } from "../../lib/contexts/LanguageContext";
import { dashboardTranslations } from "../../locales/dashboard";

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// Menu + warna stabilo masing-masing (kelas ditulis lengkap supaya terbaca Tailwind)
const useNavigation = () => {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  return [
    { name: t.sidebar.home, href: "/dashboard", icon: faHouse, hl: "hl-yellow" },
    { name: t.sidebar.folders, href: "/dashboard/folders", icon: faFolder, hl: "hl-blue" },
    { name: t.sidebar.materials, href: "/dashboard/materials", icon: faFileArrowUp, hl: "hl-green" },
    { name: t.sidebar.quiz, href: "/dashboard/quiz", icon: faListCheck, hl: "hl-pink" },
    { name: t.sidebar.flashcards, href: "/dashboard/flashcards", icon: faClone, hl: "hl-yellow" },
    { name: t.sidebar.settings, href: "/dashboard/settings", icon: faGear, hl: "hl-blue" },
  ];
};

const isActivePath = (pathname, href) =>
  pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

/* ---------- Isi sidebar (dipakai desktop & mobile) ---------- */
function SidebarBody({ expanded, onNavigate, onLogout }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const navigation = useNavigation();

  return (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {navigation.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={expanded ? undefined : item.name}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 items-center gap-3 rounded-[10px] px-3 font-semibold transition-colors ${
                active
                  ? `${item.hl} text-[var(--ink-fixed)]`
                  : "text-[var(--ink-soft)] hover:bg-[var(--rule)]/60 hover:text-[var(--ink)]"
              } ${expanded ? "" : "justify-center"}`}
            >
              <FontAwesomeIcon icon={item.icon} fixedWidth className="shrink-0 text-[1.05rem]" />
              {expanded && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {session?.user && (
        <div className={`m-3 flex items-center gap-3 rounded-xl border-2 border-[var(--rule)] p-2 ${expanded ? "" : "flex-col"}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--hl-yellow)] text-sm font-extrabold text-[var(--ink-fixed)]">
            {getInitials(session.user.name || "User")}
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{session.user.name}</p>
              <p className="truncate text-xs text-[var(--ink-soft)]">{session.user.email}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            title="Keluar"
            aria-label="Keluar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--wrong)]/10 hover:text-[var(--wrong)]"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
      )}
    </>
  );
}

function Logo({ showText = true }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <Image src="/img/logo.png" alt="CatatPintar" width={30} height={30} className="shrink-0" />
      {showText && <span className="text-lg font-extrabold tracking-tight">CatatPintar</span>}
    </Link>
  );
}

/* ---------- Sidebar desktop ---------- */
const Sidebar = ({ onLogout }) => {
  const { isSidebarOpen, toggleSidebar } = useDashboard();

  return (
    <aside
      className={`relative hidden shrink-0 flex-col border-r-2 border-[var(--rule)] bg-[var(--card)] transition-[width] duration-300 md:flex ${
        isSidebarOpen ? "w-64" : "w-[76px]"
      }`}
    >
      <div className={`flex h-16 items-center border-b-2 border-[var(--rule)] ${isSidebarOpen ? "px-5" : "justify-center"}`}>
        <Logo showText={isSidebarOpen} />
      </div>

      <SidebarBody expanded={isSidebarOpen} onLogout={onLogout} />

      {/* Tombol lipat sidebar, menempel di tepi seperti pembatas buku */}
      <button
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Ciutkan sidebar" : "Lebarkan sidebar"}
        className="absolute top-20 -right-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--rule)] bg-[var(--card)] text-xs text-[var(--ink-soft)] hover:text-[var(--ink)]"
      >
        <FontAwesomeIcon icon={faChevronLeft} className={`transition-transform duration-300 ${isSidebarOpen ? "" : "rotate-180"}`} />
      </button>
    </aside>
  );
};

/* ---------- Sidebar mobile (laci) ---------- */
const MobileSidebar = ({ isOpen, setIsOpen, onLogout }) => (
  <div className={`md:hidden ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
    <div
      className={`fixed inset-0 z-40 bg-[var(--ink-fixed)]/40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      onClick={() => setIsOpen(false)}
    />
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-[var(--rule)] bg-[var(--card)] transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b-2 border-[var(--rule)] px-5">
        <Logo />
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Tutup menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ink-soft)] hover:bg-[var(--rule)]"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
      <SidebarBody expanded onNavigate={() => setIsOpen(false)} onLogout={onLogout} />
    </aside>
  </div>
);

/* ---------- Header ---------- */
const Header = ({ onMenuClick }) => {
  const { language, toggleLanguage } = useLanguage();
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, [language]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b-2 border-[var(--rule)] bg-[var(--paper)] px-4 md:px-8">
      <div className="md:hidden">
        <Logo />
      </div>
      {/* Tanggal ala pojok halaman buku */}
      <p className="hand hidden text-2xl text-[var(--ink-soft)] md:block" suppressHydrationWarning>
        {today}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="h-9 w-9 rounded-lg text-xs font-bold text-[var(--ink-soft)] hover:bg-[var(--rule)]"
          title="Ganti Bahasa / Change Language"
        >
          {language.toUpperCase()}
        </button>
        <ThemeToggle />
        <button
          onClick={onMenuClick}
          aria-label="Buka menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--rule)] text-[var(--ink)] md:hidden"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
    </header>
  );
};

const DashboardMainContent = ({ children }) => {
  const { isAiSidebarOpen } = useDashboard();
  return (
    <div className="relative flex flex-1 overflow-hidden">
      <main className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${isAiSidebarOpen ? "md:mr-96" : "mr-0"}`}>
        <div className="min-h-full">{children}</div>
      </main>
      <AIChat />
    </div>
  );
};

function DashboardShell({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { language } = useLanguage();
  const t = dashboardTranslations[language];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };
  const askLogout = () => setIsModalOpen(true);

  return (
    <div className="landing flex h-screen overflow-hidden">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title={t.logoutModal.title}
        isMutating={isLoggingOut}
      >
        <p className="text-gray-700 dark:text-gray-300">{t.logoutModal.message}</p>
      </ConfirmationModal>

      <Sidebar onLogout={askLogout} />
      <MobileSidebar isOpen={isMobileSidebarOpen} setIsOpen={setIsMobileSidebarOpen} onLogout={askLogout} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <DashboardMainContent>{children}</DashboardMainContent>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="landing flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--rule)] border-t-[var(--ink)]" />
          <p className="hand mt-4 text-2xl text-[var(--ink-soft)]">Menyiapkan buku catatanmu…</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <DashboardProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardProvider>
    );
  }

  return null;
}
