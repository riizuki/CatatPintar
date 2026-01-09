"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const NewNotePage = () => {
  const router = useRouter();

  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folderId, setFolderId] = useState("");

  // Dummy data, in a real app this would come from a database or state management
  const [folders, setFolders] = useState([
    { id: "1", name: "Mata Kuliah: AI" },
    { id: "2", name: "Mata Kuliah: Web Dev" },
    { id: "3", name: "Mata Kuliah: Basis Data" },
  ]);

  const handleSaveChanges = (e) => {
    e.preventDefault();
    console.log("Saving new note:", { title, content, folderId });
    router.push("/dashboard");
  };

  return (
    <div className="p-8">
      <form onSubmit={handleSaveChanges}>
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-semibold text-black border-none focus:outline-none"
            placeholder="Note Title"
          />
        </div>
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="bg-white text-black"
        />
        <div className="mt-8">
          <label
            htmlFor="folder"
            className="block text-sm font-medium text-black"
          >
            Folder
          </label>
            <div className="mt-1">
              <select
                id="folder"
                name="folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="block w-full max-w-xs px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              >
                <option value="">No Folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 text-sm font-medium text-black bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
          >
            Create Note
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewNotePage;