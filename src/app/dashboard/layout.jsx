"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  FolderIcon,
  HomeIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  RectangleStackIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState } from "react";
import ConfirmationModal from "../components/dashboard/ConfirmationModal";
import { DashboardProvider, useDashboard } from "../../lib/contexts/DashboardContext";
import AIChat from "../components/dashboard/AIChat";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { useLanguage } from "../../lib/contexts/LanguageContext";
import { dashboardTranslations } from "../../locales/dashboard";

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isSidebarOpen, toggleSidebar } = useDashboard();

  const { language } = useLanguage();
  const t = dashboardTranslations[language];

  const navigation = [
    { name: t.sidebar.home, href: "/dashboard", icon: HomeIcon },
    { name: t.sidebar.folders, href: "/dashboard/folders", icon: FolderIcon },
    { name: t.sidebar.quiz, href: "/dashboard/quiz", icon: QuestionMarkCircleIcon },
    {
      name: t.sidebar.flashcards,
      href: "/dashboard/flashcards",
      icon: RectangleStackIcon,
    },
    { name: t.sidebar.settings, href: "/dashboard/settings", icon: CogIcon },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title={t.logoutModal.title}
        isMutating={isLoggingOut}
      >
        <p className="text-gray-700 dark:text-gray-300">{t.logoutModal.message}</p>
      </ConfirmationModal>
      <motion.div
        initial={{ width: isSidebarOpen ? 260 : 88 }}
        animate={{ width: isSidebarOpen ? 260 : 88 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex-shrink-0"
      >
        <div className="p-5 flex items-center justify-between h-20">
          <div className="flex items-center overflow-hidden h-10 w-full px-1">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 flex-shrink-0">
              <Image
                src="/img/logo.png"
                alt="CatatPintar Logo"
                width={28}
                height={28}
              />
            </div>
            <motion.h1 
              initial={false}
              animate={{ 
                opacity: isSidebarOpen ? 1 : 0, 
                width: isSidebarOpen ? 120 : 0,
                marginLeft: isSidebarOpen ? 12 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-xl font-bold text-[#00A2D8] dark:text-[#4CC1EE] whitespace-nowrap overflow-hidden"
            >
              CatatPintar
            </motion.h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 text-base font-medium rounded-xl transition-all duration-200 group ${isActive ? "bg-[#00A2D8]/10 text-[#00A2D8] dark:bg-[#4CC1EE]/20 dark:text-[#4CC1EE] " : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white" }`}
              >
                <div className="flex items-center justify-center min-w-[24px]">
                  <item.icon className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                </div>
                <motion.div
                  initial={false}
                  animate={{ 
                    opacity: isSidebarOpen ? 1 : 0, 
                    width: isSidebarOpen ? 130 : 0,
                    marginLeft: isSidebarOpen ? 12 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.name}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-gray-100/50 dark:border-gray-800/50 flex flex-col gap-2">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors mb-2"
          >
            <motion.div animate={{ rotate: isSidebarOpen ? 0 : 180 }} transition={{ duration: 0.3 }}>
              <ChevronLeftIcon className="w-5 h-5" />
            </motion.div>
          </button>

          {session?.user && (
            <div className={`flex items-center justify-between p-2 rounded-xl border border-transparent ${isSidebarOpen ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-700/50' : ''} transition-all`}>
              <div className="flex items-center min-w-0">
                <Image
                  src={`https://i.pravatar.cc/150?u=${session.user.email}`}
                  alt="User Avatar"
                  width={36}
                  height={36}
                  className="rounded-full flex-shrink-0 border border-gray-200 dark:border-gray-700"
                />
                <motion.div
                  initial={false}
                  animate={{ 
                    opacity: isSidebarOpen ? 1 : 0, 
                    width: isSidebarOpen ? 130 : 0,
                    marginLeft: isSidebarOpen ? 12 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="min-w-0 overflow-hidden whitespace-nowrap"
                >
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session.user.email}
                  </p>
                </motion.div>
              </div>
              <motion.button
                initial={false}
                animate={{ 
                  opacity: isSidebarOpen ? 1 : 0, 
                  width: isSidebarOpen ? 36 : 0,
                  marginLeft: isSidebarOpen ? 8 : 0,
                  padding: isSidebarOpen ? 8 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={() => setIsModalOpen(true)}
                title="Keluar"
                className="text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 flex-shrink-0 transition-colors overflow-hidden flex items-center justify-center"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

const MobileSidebar = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { language } = useLanguage();
  const t = dashboardTranslations[language];

  const navigation = [
    { name: t.sidebar.home, href: "/dashboard", icon: HomeIcon },
    { name: t.sidebar.folders, href: "/dashboard/folders", icon: FolderIcon },
    { name: t.sidebar.quiz, href: "/dashboard/quiz", icon: QuestionMarkCircleIcon },
    {
      name: t.sidebar.flashcards,
      href: "/dashboard/flashcards",
      icon: RectangleStackIcon,
    },
    { name: t.sidebar.settings, href: "/dashboard/settings", icon: CogIcon },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title={t.logoutModal.title}
        isMutating={isLoggingOut}
      >
        <p className="text-gray-700 dark:text-gray-300">{t.logoutModal.message}</p>
      </ConfirmationModal>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col md:hidden"
            >
              <div className="h-20 p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50">
                <div className="flex items-center space-x-3">
                  <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
                    <Image src="/img/logo.png" alt="CatatPintar Logo" width={28} height={28} />
                  </div>
                  <h1 className="text-xl font-bold text-[#00A2D8] dark:text-[#4CC1EE]">CatatPintar</h1>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-200 ${isActive ? "bg-[#00A2D8]/10 text-[#00A2D8] dark:bg-[#4CC1EE]/20 dark:text-[#4CC1EE] " : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50" }`}
                    >
                      <item.icon className="w-6 h-6 mr-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
              <div className="p-5 border-t border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/20">
                {session?.user && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <Image
                        src={`https://i.pravatar.cc/150?u=${session.user.email}`}
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="rounded-full border border-gray-200 dark:border-gray-700"
                      />
                      <div className="min-w-0 ml-3">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="p-2.5 text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/50 dark:hover:text-red-400 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const Header = ({ onMenuClick }) => {
  const { language, toggleLanguage } = useLanguage();
  const t = dashboardTranslations[language];

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-30">
      <div className="flex items-center md:hidden">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-100 dark:border-gray-700">
            <Image src="/img/logo.png" alt="CatatPintar Logo" width={24} height={24} />
          </div>
          <h1 className="text-lg font-bold text-[#00A2D8] dark:text-[#4CC1EE]">CatatPintar</h1>
        </Link>
      </div>
      <div className="hidden md:flex flex-1"></div>
      
      <div className="flex items-center justify-end space-x-2 md:space-x-3">
        <button 
          onClick={toggleLanguage}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold text-sm border border-gray-200/50 dark:border-gray-700/50"
          title="Ganti Bahasa / Change Language"
        >
          {language.toUpperCase()}
        </button>
        <ThemeToggle />
        <button onClick={onMenuClick} className="md:hidden flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

const DashboardMainContent = ({ children }) => {
  const { isAiSidebarOpen } = useDashboard();
  return (
    <div className="flex flex-1 overflow-hidden relative">
      <main className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${isAiSidebarOpen ? 'md:mr-96' : 'mr-0'}`}>
        <div className="min-h-full">
          {children}
        </div>
      </main>
      <AIChat />
    </div>
  );
};

export default function DashboardLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 border-t-[#00A2D8] dark:border-t-[#4CC1EE] rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium animate-pulse">Menyiapkan Workspace...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <DashboardProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 overflow-hidden">

          <Sidebar />
          <MobileSidebar isOpen={isMobileSidebarOpen} setIsOpen={setIsMobileSidebarOpen} />

          <div className="flex flex-col flex-1 overflow-hidden relative z-10 )] dark:)]">
            <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
            <DashboardMainContent>
              {children}
            </DashboardMainContent>
          </div>
        </div>
      </DashboardProvider>
    );
  }

  return null;
}