"use client";

import { FolderIcon, PlusIcon, XMarkIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Link from "next/link";
import ConfirmationModal from "../../components/dashboard/ConfirmationModal";

const FolderModal = ({ isOpen, onClose, onSave, editingFolder, isLoading }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(editingFolder ? editingFolder.name : "");
  }, [editingFolder]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, id: editingFolder ? editingFolder.id : null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {editingFolder ? "Edit Folder" : "Buat Folder Baru"}
          </h2>
          <button onClick={onClose} disabled={isLoading} className="p-2 rounded-full hover:bg-gray-100">
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm sm:text-base font-medium text-gray-700">
              Nama Folder
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2 sm:px-4 sm:py-3 text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-colors duration-300"
            />
          </div>
          <div className="mt-6 sm:mt-8 flex justify-end space-x-2 sm:space-x-4">
            <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
            >
                Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base font-semibold text-white bg-[#00A2D8] rounded-lg shadow-md hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] disabled:opacity-50 transition-all"
            >
              {isLoading ? "Menyimpan..." : (editingFolder ? "Simpan" : "Buat")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FoldersPage = () => {
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
        title="Hapus Folder"
        isMutating={isMutating}
      >
        <p className="text-sm sm:text-base">Anda yakin ingin menghapus folder <strong>{folderToDelete?.name}</strong>?</p>
        <p className="mt-2 text-xs sm:text-sm text-gray-600">Semua catatan di dalamnya juga akan dihapus secara permanen. Tindakan ini tidak dapat diurungkan.</p>
      </ConfirmationModal>
      <div className="p-4 sm:p-6 md:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Folder Saya
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Kelola semua folder catatan Anda di sini.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-semibold text-white bg-[#00A2D8] rounded-lg shadow-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] transition-all duration-300 transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            <span>Buat Folder</span>
          </button>
        </header>

        {error && <p className="text-red-500 mb-4">Kesalahan: {error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-4 sm:p-6 bg-white rounded-2xl border border-gray-200">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            ))}
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-16 sm:py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                <FolderIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400"/>
                <h3 className="mt-6 text-lg sm:text-2xl font-bold text-gray-800">Folder Masih Kosong</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-500">Ayo buat folder pertamamu untuk mengorganisir catatan!</p>
                 <button
                    onClick={openCreateModal}
                    className="mt-8 inline-flex items-center px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold text-white bg-[#00A2D8] rounded-lg shadow-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] transition-all"
                >
                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Buat Folder
                </button>
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div key={folder.id} className="relative group bg-white rounded-2xl border border-gray-200 hover:border-[#00A2D8] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <Link
                  href={`/dashboard/folders/${folder.id}`}
                  className="block p-4 sm:p-6"
                >
                  <FolderIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-4 text-[#00A2D8]" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate transition-colors">{folder.name}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">{folder.noteCount} Catatan</p>
                </Link>
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex space-x-1 sm:space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => { e.preventDefault(); handleEditFolder(folder); }}
                    className="p-2 sm:p-2.5 bg-gray-100 rounded-full hover:bg-gray-200"
                    title="Edit Folder"
                  >
                    <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700"/>
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(folder); }}
                    className="p-2 sm:p-2.5 bg-gray-100 rounded-full hover:bg-red-100"
                    title="Hapus Folder"
                  >
                    <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default FoldersPage;
