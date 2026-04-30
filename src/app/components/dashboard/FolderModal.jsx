import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function FolderModal({ isOpen, onClose, onSave, editingFolder, isLoading }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 transition-all">
      <div className="w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {editingFolder ? "Edit Folder" : "Buat Folder Baru"}
          </h2>
          <button onClick={onClose} disabled={isLoading} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
              Nama Folder
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2 sm:px-4 sm:py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8]/50 focus:border-[#00A2D8] transition-all"
            />
          </div>
          <div className="mt-6 sm:mt-8 flex justify-end space-x-2 sm:space-x-4">
            <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
                Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base font-semibold text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
            >
              {isLoading ? "Menyimpan..." : (editingFolder ? "Simpan" : "Buat")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
