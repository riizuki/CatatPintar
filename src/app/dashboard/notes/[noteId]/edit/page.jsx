"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const EditNotePage = () => {
  const router = useRouter();
  const params = useParams();
  const { noteId } = params;

  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  // In a real application, you would fetch this data based on the noteId
  const [notes, setNotes] = useState([
    { id: "1", title: "Note 1: Introduction to AI", content: "This note contains an introduction to the field of Artificial Intelligence...", folderId: 1 },
    { id: "2", title: "Note 2: Machine Learning Basics", content: "An overview of the fundamental concepts in Machine Learning...", folderId: 1 },
    { id: "3", title: "Note 3: Deep Learning", content: "Exploring the architecture and applications of deep neural networks...", folderId: 2 },
  ]);

  const note = notes.find((n) => n.id === noteId);

  const [title, setTitle] = useState(note ? note.title : "");
  const [content, setContent] = useState(note ? note.content : "");
  const [folderId, setFolderId] = useState(note ? note.folderId : "");


  const folders = useState([
    { id: "1", name: "Mata Kuliah: AI" },
    { id: "2", name: "Mata Kuliah: Web Dev" },
    { id: "3", name: "Mata Kuliah: Basis Data" },
  ])[0];

  const handleSaveChanges = (e) => {
    e.preventDefault();
    console.log("Saving changes:", { noteId, title, content, folderId });
    router.push("/dashboard");
  };

  if (!note) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-semibold text-black">Note not found</h1>
      </div>
    );
  }

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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditNotePage;