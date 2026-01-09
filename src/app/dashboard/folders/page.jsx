"use client";

import { FolderIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Link from "next/link";

const CreateFolderModal = ({ isOpen, onClose, onSave, editingFolder }) => {
  const [name, setName] = useState(editingFolder ? editingFolder.name : "");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, id: editingFolder ? editingFolder.id : Date.now() });
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-xl p-8 bg-white rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-black">
            {editingFolder ? "Edit Folder" : "Create Folder"}
          </h2>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-black"
              >
                Folder Name
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
          <div className="mt-8">
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm sm:w-auto hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              {editingFolder ? "Save Changes" : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FoldersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folders, setFolders] = useState([
    { id: 1, name: "Mata Kuliah: AI", noteCount: 3 },
    { id: 2, name: "Mata Kuliah: Web Dev", noteCount: 5 },
    { id: 3, name: "Mata Kuliah: Basis Data", noteCount: 2 },
  ]);
  const [editingFolder, setEditingFolder] = useState(null);

  const handleSaveFolder = (newFolder) => {
    if (editingFolder) {
      setFolders(
        folders.map((folder) =>
          folder.id === newFolder.id ? { ...newFolder, noteCount: folder.noteCount } : folder
        )
      );
    } else {
      setFolders([...folders, { ...newFolder, noteCount: 0, id: Date.now() }]);
    }
    setEditingFolder(null);
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setIsModalOpen(true);
  };

  const handleDeleteFolder = (id) => {
    setFolders(folders.filter((folder) => folder.id !== id));
  };

  return (
    <>
      <CreateFolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFolder}
        editingFolder={editingFolder}
      />
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-black">Folders</h1>
          <button
            onClick={() => {
              setEditingFolder(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Folder
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Link
              key={folder.id}
              href={`/dashboard/folders/${folder.id}`}
              className="relative flex items-center p-6 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <FolderIcon className="w-8 h-8 mr-4 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-black">
                  {folder.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {folder.noteCount} Notes
                </p>
              </div>
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleEditFolder(folder);
                  }}
                  className="text-gray-500 hover:text-gray-900"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteFolder(folder.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default FoldersPage;
