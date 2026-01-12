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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-black">
            {editingFolder ? "Edit Folder" : "Buat Folder"}
          </h2>
          <button onClick={onClose} disabled={isLoading}>
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black">
                Nama Folder
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 placeholder-gray-500 text-black border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm sm:w-auto hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {isLoading ? "Menyimpan..." : (editingFolder ? "Simpan Perubahan" : "Buat Folder")}
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
      
      await fetchFolders(); // Refetch folders to update the list
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
      >
        <p>Anda yakin ingin menghapus folder <strong>{folderToDelete?.name}</strong>?</p>
        <p className="mt-2 text-sm text-gray-600">Semua catatan di dalamnya juga akan dihapus secara permanen. Tindakan ini tidak dapat diurungkan.</p>
      </ConfirmationModal>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-black">Folder</h1>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Buat Folder
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">Kesalahan: {error}</p>}

        {loading ? (
          <p>Memuat folder...</p>
        ) : folders.length === 0 ? (
          <p className="text-gray-500">Belum ada folder yang dibuat. Klik "Buat Folder" untuk memulai.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <div key={folder.id} className="relative group">
                <Link
                  href={`/dashboard/folders/${folder.id}`}
                  className="block p-6 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <FolderIcon className="w-8 h-8 mr-4 text-gray-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-black truncate">{folder.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{folder.noteCount} Catatan</p>
                  </div>
                </Link>
                <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.preventDefault(); handleEditFolder(folder); }}
                    className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"
                    title="Edit Folder"
                  >
                    <PencilIcon className="w-4 h-4 text-gray-600"/>
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(folder); }}
                    className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"
                    title="Hapus Folder"
                  >
                    <TrashIcon className="w-4 h-4 text-red-600"/>
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
