"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faFolderOpen, faPen, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import FolderModal from "../../components/dashboard/FolderModal";
import ConfirmationModal from "../../components/dashboard/ConfirmationModal";
import { EmptyState, ErrorNote, Page, PageHeader, cls } from "../../components/ui/kit";
import { useLanguage } from "../../../lib/contexts/LanguageContext";
import { dashboardTranslations } from "../../../locales/dashboard";

// Warna tab map, bergantian (kelas lengkap supaya terbaca Tailwind)
const TABS = [
  { tab: "bg-[var(--hl-yellow)]", icon: "text-amber-500" },
  { tab: "bg-[var(--hl-blue)]", icon: "text-sky-500" },
  { tab: "bg-[var(--hl-green)]", icon: "text-emerald-500" },
  { tab: "bg-[var(--hl-pink)]", icon: "text-pink-500" },
];

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
        <p>
          {t.folders.deleteModalText1} <strong className="text-[var(--ink)]">{folderToDelete?.name}</strong>?
        </p>
        <p className="mt-2 text-sm">{t.folders.deleteModalText2}</p>
      </ConfirmationModal>

      <Page wide>
        <PageHeader
          title={t.folders.title}
          subtitle={t.folders.subtitle}
          action={
            <button onClick={openCreateModal} className="btn-ink h-11 px-5">
              <FontAwesomeIcon icon={faPlus} />
              {t.folders.createFolder}
            </button>
          }
        />

        <div className="mt-8 space-y-6">
          <ErrorNote>{error && `${t.folders.error} ${error}`}</ErrorNote>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-xl bg-[var(--rule)]" />
              ))}
            </div>
          ) : folders.length === 0 ? (
            <EmptyState icon={faFolderOpen} title={t.folders.emptyTitle} text={t.folders.emptySubtitle}>
              <button onClick={openCreateModal} className="btn-ink h-11 px-5">
                <FontAwesomeIcon icon={faPlus} />
                {t.folders.createFolder}
              </button>
            </EmptyState>
          ) : (
            <ul className="grid grid-cols-1 gap-x-6 gap-y-8 pt-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {folders.map((folder, i) => {
                const c = TABS[i % TABS.length];
                return (
                  <li key={folder.id} className="group relative">
                    {/* Tab map */}
                    <span className={`absolute -top-3 left-4 h-5 w-20 rounded-t-lg ${c.tab}`} aria-hidden="true" />
                    <Link
                      href={`/dashboard/folders/${folder.id}`}
                      className={`relative block h-full p-5 ${cls.card} ${cls.cardHover}`}
                    >
                      <FontAwesomeIcon icon={faFolder} className={`text-3xl ${c.icon}`} />
                      <h3 className="mt-4 truncate text-lg font-extrabold">{folder.name}</h3>
                      <p className="mt-0.5 text-sm text-[var(--ink-soft)]">
                        {folder.noteCount} {t.folders.savedItems}
                      </p>
                    </Link>
                    <div className="absolute top-3 right-3 flex gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                      <button
                        onClick={() => handleEditFolder(folder)}
                        className={cls.iconBtn}
                        title={t.folders.editFolder}
                        aria-label={`${t.folders.editFolder} ${folder.name}`}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(folder)}
                        className={`${cls.iconBtn} hover:!text-[var(--wrong)]`}
                        title={t.folders.deleteFolder}
                        aria-label={`${t.folders.deleteFolder} ${folder.name}`}
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Page>
    </>
  );
};

export default FoldersPage;
