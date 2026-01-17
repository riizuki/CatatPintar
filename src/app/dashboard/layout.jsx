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
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState } from "react";
import ConfirmationModal from "../components/dashboard/ConfirmationModal";
import { DashboardProvider, useDashboard } from "../../lib/contexts/DashboardContext";
import AIChat from "../components/dashboard/AIChat";

const Sidebar = () => {
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
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Keluar"
      >
        <p>Apakah Anda yakin ingin keluar dari akun Anda?</p>
      </ConfirmationModal>
      <div className="flex flex-col w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex-shrink-0">
        <div className="p-4 flex items-center space-x-2">
          <Image 
            src="/img/logo.png"
            alt="CatatPintar Logo"
            width={32}
            height={32}
          />
          <h1 className="text-xl font-bold text-[#00A2D8]">CatatPintar</h1>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-base font-medium rounded-lg ${
                pathname === item.href
                  ? "bg-blue-50 text-[#00A2D8] dark:bg-blue-900/50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              }`}
>
              <item.icon className="w-6 h-6 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-700">
          {session?.user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  src={`https://i.pravatar.cc/150?u=${session.user.email}`}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800 truncate dark:text-gray-200">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                title="Keluar"
                className="p-2 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const LayoutContent = ({ children }) => {
  const { isAiSidebarOpen } = useDashboard();
  return (
    <div className="flex flex-1 overflow-hidden">
        <main className={`flex-1 overflow-y-auto transition-margin-right duration-500 ease-in-out ${isAiSidebarOpen ? 'mr-96' : 'mr-0'}`}>
          {children}
        </main>
        <AIChat />
    </div>
  )
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
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <p className="dark:text-white">Memuat...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <DashboardProvider>
        <div className="flex h-screen bg-custom-blue dark:bg-gray-900">
          <Sidebar />
          <LayoutContent>{children}</LayoutContent>
        </div>
      </DashboardProvider>
    );
  }

  return null;
}