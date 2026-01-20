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

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isSidebarOpen, toggleSidebar } = useDashboard();

  const navigation = [
    { name: "Beranda", href: "/dashboard", icon: HomeIcon },
    { name: "Folder", href: "/dashboard/folders", icon: FolderIcon },
    { name: "Kuis", href: "/dashboard/quiz", icon: QuestionMarkCircleIcon },
    {
      name: "Flashcard",
      href: "/dashboard/flashcards",
      icon: RectangleStackIcon,
    },
    { name: "Pengaturan", href: "/dashboard/settings", icon: CogIcon },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: "/login?logout=success" });
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Keluar"
      >
        <p>Apakah Anda yakin ingin keluar dari akun Anda?</p>
      </ConfirmationModal>
      <motion.div
        initial={{ width: isSidebarOpen ? 256 : 80 }}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-white border-r border-gray-200 flex-shrink-0"
      >
        <div className="p-4 flex items-center justify-between">
          <div className={`flex items-center space-x-2 overflow-hidden ${isSidebarOpen ? 'w-full' : 'w-0'}`}>
            <Image 
              src="/img/logo.png"
              alt="CatatPintar Logo"
              width={32}
              height={32}
              className="flex-shrink-0"
            />
            {isSidebarOpen && <h1 className="text-xl font-bold text-[#00A2D8]">CatatPintar</h1>}
          </div>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-base font-medium rounded-lg ${
                pathname === item.href
                  ? "bg-blue-50 text-[#00A2D8]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-6 h-6 mr-3 flex-shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && <motion.span initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0}} transition={{ duration: 0.2 }}>{item.name}</motion.span>}
              </AnimatePresence>
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-gray-100">
          <button
            onClick={toggleSidebar}
            className="mb-4 w-full flex justify-center p-2 text-gray-500 rounded-lg hover:bg-gray-100"
          >
            <motion.div
              animate={{ rotate: isSidebarOpen ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </motion.div>
          </button>
          {session?.user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <Image
                  src={`https://i.pravatar.cc/150?u=${session.user.email}`}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full mr-3 flex-shrink-0"
                />
                <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0}} transition={{ duration: 0.2 }} className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </p>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
              {isSidebarOpen &&
                <motion.button
                  initial={{ opacity: 0}} animate={{ opacity: 1 }} exit={{ opacity: 0}} transition={{ duration: 0.2 }}
                  onClick={() => setIsModalOpen(true)}
                  title="Keluar"
                  className="p-2 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 flex-shrink-0"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </motion.button>
              }
              </AnimatePresence>
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
  
    const navigation = [
      { name: "Beranda", href: "/dashboard", icon: HomeIcon },
      { name: "Folder", href: "/dashboard/folders", icon: FolderIcon },
      { name: "Kuis", href: "/dashboard/quiz", icon: QuestionMarkCircleIcon },
      {
        name: "Flashcard",
        href: "/dashboard/flashcards",
        icon: RectangleStackIcon,
      },
      { name: "Pengaturan", href: "/dashboard/settings", icon: CogIcon },
    ];
  
    const handleLogout = () => {
      signOut({ callbackUrl: "/login?logout=success" });
    };

    return (
        <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col md:hidden"
                >
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                        <Image src="/img/logo.png" alt="CatatPintar Logo" width={32} height={32} />
                        <h1 className="text-xl font-bold text-[#00A2D8]">CatatPintar</h1>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2">
                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-2 space-y-2">
                    {navigation.map((item) => (
                        <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-3 py-2 text-base font-medium rounded-lg ${
                            pathname === item.href
                            ? "bg-blue-50 text-[#00A2D8]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        >
                        <item.icon className="w-6 h-6 mr-3" />
                        {item.name}
                        </Link>
                    ))}
                    </nav>
                    <div className="mt-auto p-4 border-t border-gray-100">
                    {session?.user && (
                        <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                            <Image
                            src={`https://i.pravatar.cc/150?u=${session.user.email}`}
                            alt="User Avatar"
                            width={40}
                            height={40}
                            className="rounded-full mr-3 flex-shrink-0"
                            />
                            <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                                {session.user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {session.user.email}
                            </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            title="Keluar"
                            className="p-2 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 flex-shrink-0 hidden"
                        >
                            <ArrowRightOnRectangleIcon className="w-6 h-6" />
                        </button>
                        </div>
                    )}
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            </>
        )}
        </AnimatePresence>
    )
}

const Header = ({ onMenuClick }) => {
    return (
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
            <Link href="/dashboard" className="flex items-center space-x-2">
                <Image src="/img/logo.png" alt="CatatPintar Logo" width={32} height={32} />
                <h1 className="text-xl font-bold text-[#00A2D8]">CatatPintar</h1>
            </Link>
            <button onClick={onMenuClick} className="p-2">
                <Bars3Icon className="w-6 h-6 text-gray-700" />
            </button>
        </header>
    )
}

const DashboardMainContent = ({ children }) => {
    const { isAiSidebarOpen } = useDashboard();
    return (
        <div className="flex flex-1 overflow-hidden">
            <main className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${isAiSidebarOpen ? 'md:mr-96' : 'mr-0'}`}>
              {children}
            </main>
            <AIChat />
        </div>
    )
}

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
      <div className="flex items-center justify-center h-screen bg-gray-50 ">
        <p className="">Memuat...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <DashboardProvider>
        <div className="flex h-screen bg-gray-50 -900">
          <Sidebar />
          <MobileSidebar isOpen={isMobileSidebarOpen} setIsOpen={setIsMobileSidebarOpen}/>
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header onMenuClick={() => setIsMobileSidebarOpen(true)}/>
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