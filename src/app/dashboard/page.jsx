"use client";

import { MagnifyingGlassIcon, PlusIcon, ClockIcon, SparklesIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { FolderIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

import SkeletonLoader from "@/app/components/dashboard/SkeletonLoader";
import FolderModal from "@/app/components/dashboard/FolderModal";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { dashboardTranslations } from "@/locales/dashboard";

const getGreeting = (t) => {
  const hour = new Date().getHours();
  if (hour < 12) return t.home.greeting.morning;
  if (hour < 15) return t.home.greeting.afternoon;
  if (hour < 18) return t.home.greeting.evening;
  return t.home.greeting.night;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

function DashboardContent() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [greeting, setGreeting] = useState("");
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const { language } = useLanguage();
  const t = dashboardTranslations[language];

  useEffect(() => {
    setGreeting(getGreeting(t));
    const fetchData = async () => {
      setError("");
      try {
        const query = searchTerm ? `?search=${searchTerm}` : "";

        const [recentRes, allRes, foldersRes] = await Promise.all([
          fetch(`/api/notes?recent=true${query}`),
          fetch(`/api/notes${query}`),
          fetch("/api/folders"),
        ]);

        if (!recentRes.ok || !allRes.ok) {
          throw new Error("Gagal mengambil catatan");
        }
        if (!foldersRes.ok) {
          throw new Error("Gagal mengambil folder");
        }

        const recentData = await recentRes.json();
        const allData = await allRes.json();
        const foldersData = await foldersRes.json();

        setRecentNotes(recentData);
        setNotes(allData);
        setFolders(foldersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsInitialLoad(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [searchTerm, language]);

  const handleSaveFolder = async (folderData) => {
    setIsMutating(true);
    setError("");
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderData.name }),
      });
      if (!res.ok) throw new Error("Gagal membuat folder.");

      const foldersRes = await fetch("/api/folders");
      const foldersData = await foldersRes.json();
      setFolders(foldersData);

      setIsFolderModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSave={handleSaveFolder}
        isLoading={isMutating}
      />
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        {/* Dynamic Greeting Banner */}
        <div className="relative overflow-hidden bg-[#00A2D8] rounded-3xl p-8 md:p-10 text-white mb-8 border border-white/20 dark:border-white/10">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-blue-300 opacity-30 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium mb-4 border border-white/20">
                <SparklesIcon className="w-4 h-4" />
                {t.home.activeWorkspace}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                {greeting}, {session?.user?.name || t.home.greeting.friend}!
              </h1>
              <p className="text-blue-50 text-base md:text-lg max-w-lg">
                {t.home.readyToDigest}
              </p>
            </div>

            <Link
              href="/dashboard/notes/new"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-[#00A2D8] bg-white rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform hover:scale-105 group"
            >
              <PlusIcon className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" />
              <span>{t.home.createNewNote}</span>
            </Link>
          </div>
        </div>

        {/* Command Palette Search */}
        <div className="relative max-w-2xl mx-auto -mt-14 z-20 px-4 md:px-0">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4">
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 group-focus-within:text-[#00A2D8] transition-colors" />
            </span>
            <input
              type="text"
              placeholder={t.home.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              className="w-full pl-12 pr-4 py-4 text-base md:text-lg text-gray-800 dark:text-white bg-transparent focus:outline-none placeholder-gray-400"
            />
            {searchTerm && (
              <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                <button onClick={() => setSearchTerm("")} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded-md hover:bg-gray-200">ESC</button>
              </span>
            )}
          </div>
        </div>
      </motion.header>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-8 border border-red-100">
          Kesalahan: {error}
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-8 space-y-10">
          {/* Terakhir Dilihat (Recent Notes) */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <ClockIcon className="w-6 h-6 mr-3 text-[#00A2D8] dark:text-[#4CC1EE]" />
                {t.home.continueLearning}
              </h2>
            </div>

            {isInitialLoad ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SkeletonLoader type="note" count={2} />
              </div>
            ) : recentNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {recentNotes.slice(0, 2).map((note) => (
                  <Link
                    key={note.id}
                    href={`/dashboard/notes/${note.id}/edit`}
                    className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-[#00A2D8]/50 dark:hover:border-[#4CC1EE]/50 transition-all duration-300 group flex flex-col h-[160px]"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#00A2D8] dark:group-hover:text-[#4CC1EE] transition-colors line-clamp-2">
                      {note.title}
                    </h3>
                    <div className="mt-auto flex items-center justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1 opacity-70" />
                        {new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </p>
                      <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-[#00A2D8]/10 group-hover:text-[#00A2D8] transition-colors">
                        <ChevronRightIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50 pointer-events-none"></div>
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center mb-5 border border-gray-200/50 dark:border-gray-700/50 relative z-10">
                  <DocumentTextIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 relative z-10">{t.home.emptyDesk}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6 relative z-10 max-w-xs mx-auto">{t.home.startJourney}</p>
                <Link
                  href="/dashboard/notes/new"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" /> {t.home.createNow}
                </Link>
              </div>
            )}
          </motion.section>

          {/* Semua Catatan */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg mr-3 border border-gray-200/50 dark:border-gray-700/50">
                  <DocumentTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                {t.home.noteArchive}
              </h2>
            </div>
            {isInitialLoad ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <SkeletonLoader type="note" count={3} />
              </div>
            ) : notes.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {notes.map((note) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      key={note.id}
                    >
                      <Link
                        href={`/dashboard/notes/${note.id}/edit`}
                        className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 group flex items-start gap-4 relative overflow-hidden h-full"
                      >
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-gray-400/10 to-transparent rounded-full blur-xl group-hover:from-gray-400/20 transition-all"></div>
                        <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-500 dark:text-gray-400 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0 relative z-10 border border-gray-200/50 dark:border-gray-700/50">
                          <DocumentTextIcon className="w-7 h-7" />
                        </div>
                        <div className="min-w-0 flex-1 relative z-10">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors truncate">
                            {note.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              !isInitialLoad && recentNotes.length > 0 &&
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t.home.noOtherNotes}</p>
            )}
          </motion.section>
        </div>

        {/* Sidebar Kanan (Folders) */}
        <div className="lg:col-span-4">
          <motion.aside variants={itemVariants} className="sticky top-24">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700/50 dark:">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <FolderIcon className="w-5 h-5 text-[#00A2D8] dark:text-[#4CC1EE]" />
                  </div>
                  {t.home.folderCollection}
                </h2>
                <button
                  onClick={() => setIsFolderModalOpen(true)}
                  className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>

              {isInitialLoad ? (
                <div className="space-y-4">
                  <SkeletonLoader type="folder" count={4} />
                </div>
              ) : folders.length > 0 ? (
                <div className="space-y-3">
                  {folders.map((folder, index) => {
                    const colorClass = "text-[#00A2D8] bg-[#00A2D8]/10";

                    return (
                      <Link
                        key={folder.id}
                        href={`/dashboard/folders/${folder.id}`}
                        className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-blue-200 dark:hover:border-blue-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group relative overflow-hidden"
                      >
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-[#00A2D8]/10 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center min-w-0 gap-4 relative z-10">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/10 text-[#00A2D8] group-hover:scale-110 transition-transform border border-blue-200/50 dark:border-blue-700/50`}>
                            <FolderIcon className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                              {folder.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {folder.noteCount} {folder.noteCount === 1 ? t.home.item : t.home.items}
                            </p>
                          </div>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10 px-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center mb-4 border border-gray-200/50 dark:border-gray-700/50">
                    <FolderIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-base font-bold text-gray-800 dark:text-gray-200">{t.home.noFoldersYet}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.home.groupNotes}</p>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </motion.div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <Link
          href="/dashboard/notes/new"
          className="flex items-center justify-center w-14 h-14 text-white bg-[#00A2D8] rounded-full )] hover:bg-[#008EB2] focus:outline-none transition-transform hover:scale-110 active:scale-95"
        >
          <PlusIcon className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00A2D8] rounded-full animate-spin"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}