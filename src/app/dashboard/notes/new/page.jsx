"use client";

import { useState, useMemo, useEffect } from "react";
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
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch("/api/folders");
        if (!res.ok) throw new Error("Failed to fetch folders");
        const data = await res.json();
        setFolders(data);
      } catch (err) {
        setError("Could not load folders. Please try again later.");
      }
    };
    fetchFolders();
  }, []);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled Note",
          content,
          folderId: folderId ? parseInt(folderId) : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create note");
      }

      const newNote = await res.json();
      router.push(`/dashboard/notes/${newNote.id}/edit`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <form onSubmit={handleCreateNote}>
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold bg-transparent text-black border-none focus:outline-none focus:ring-0"
            placeholder="Note Title"
          />
        </div>
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="bg-white text-black"
          style={{ height: "400px", marginBottom: "50px" }}
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
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-black bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Note"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewNotePage;