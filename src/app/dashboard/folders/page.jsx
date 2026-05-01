"use client";

import { PlusIcon, XMarkIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { FolderIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import Link from "next/link";
import FolderModal from "../../components/dashboard/FolderModal";
import ConfirmationModal from "../../components/dashboard/ConfirmationModal";
import { useLanguage } from "../../../lib/contexts/LanguageContext";
import { dashboardTranslations } from "../../../locales/dashboard";

const FoldersPage = () => {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [editingFolder, setEditingFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/folders");
      if (!res.ok) throw new Error("Gagal memuat folder");
      const data = await res.json();
      setFolders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleSaveFolder = async (folderData) => {
    setIsMutating(true);
    setError("");
    const { id, name } = folderData;
    const isEditing = !!id;
    const url = isEditing ? `/api/folders/${id}` : "/api/folders";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(`Gagal ${isEditing ? 'memperbarui' : 'membuat'} folder.`);
      
      await fetchFolders();
      setIsModalOpen(false);
      setEditingFolder(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setIsModalOpen(true);
  };
  
  const handleOpenDeleteModal = (folder) => {
    setFolderToDelete(folder);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setFolderToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!folderToDelete) return;
    setIsMutating(true);
    setError("");
    try {
      const res = await fetch(`/api/folders/${folderToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus folder.");
      await fetchFolders();
      handleCloseDeleteModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsMutating(false);
    }
  };
  
  const openCreateModal = () => {
    setEditingFolder(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <FolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFolder}
        editingFolder={editingFolder}
        isLoading={isMutating}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t.folders.deleteModalTitle}
        isMutating={isMutating}
      >
        <p className="text-sm sm:text-base">{t.folders.deleteModalText1} <strong>{folderToDelete?.name}</strong>?</p>
        <p className="mt-2 text-xs sm:text-sm text-gray-600">{t.folders.deleteModalText2}</p>
      </ConfirmationModal>
      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/10 rounded-xl mr-4 border border-blue-200/50 dark:border-blue-700/50">
                  <FolderIcon className="w-7 h-7 text-[#00A2D8] dark:text-[#4CC1EE]"/>
                </div>
                {t.folders.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">
                {t.folders.subtitle}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 text-sm sm:text-base font-bold text-[#00A2D8] bg-blue-50 dark:bg-[#00A2D8]/10 rounded-xl hover:bg-blue-100 dark:hover:bg-[#00A2D8]/20 focus:outline-none transition-all duration-300 transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            <span>{t.folders.createFolder}</span>
          </button>
        </header>

        {error && <p className="text-red-500 mb-4">{t.folders.error} {error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 animate-pulse">
                    <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-2 mt-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 mt-3"></div>
                </div>
            ))}
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-16 sm:py-20 px-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50 pointer-events-none"></div>
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl flex items-center justify-center mb-6 border border-gray-200/50 dark:border-gray-700/50 relative z-10">
                  <FolderIcon className="w-12 h-12 text-gray-400 dark:text-gray-500"/>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white relative z-10">{t.folders.emptyTitle}</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 relative z-10">{t.folders.emptySubtitle}</p>
                 <button
                    onClick={openCreateModal}
                    className="mt-8 inline-flex items-center px-6 py-3 text-sm sm:text-base font-bold text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-xl transition-all transform hover:-translate-y-1"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    {t.folders.createFolder}
                </button>
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {folders.map((folder, index) => {
              const colorClass = "text-[#00A2D8] bg-[#00A2D8]/10 group-hover:border-[#00A2D8]/50";

              return (
              <div key={folder.id} className={`relative group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 transform hover:-translate-y-2 ${colorClass.split(' ')[2]}`}>
                <Link
                  href={`/dashboard/folders/${folder.id}`}
                  className="block p-6"
                >
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-tl from-[#00A2D8]/10 to-transparent rounded-full blur-2xl group-hover:from-[#00A2D8]/20 transition-all pointer-events-none"></div>
                  <div className={`inline-flex p-3 rounded-2xl mb-4 transition-transform group-hover:scale-110 border border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/10 text-[#00A2D8] relative z-10`}>
                    <FolderIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate transition-colors">{folder.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{folder.noteCount} {t.folders.savedItems}</p>
                </Link>
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => { e.preventDefault(); handleEditFolder(folder); }}
                    className="p-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600"
                    title={t.folders.editFolder}
                  >
                    <PencilIcon className="w-4 h-4 text-gray-700 dark:text-gray-300"/>
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(folder); }}
                    className="p-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-xl hover:bg-red-50 dark:hover:bg-red-900/40"
                    title={t.folders.deleteFolder}
                  >
                    <TrashIcon className="w-4 h-4 text-red-500"/>
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </>
  );
};

export default FoldersPage;
