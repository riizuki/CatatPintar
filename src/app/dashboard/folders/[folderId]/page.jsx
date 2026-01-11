"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const FolderNotesPage = () => {
  const params = useParams();
  const router = useRouter();
  const { folderId } = params;

  const [folder, setFolder] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!folderId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [folderRes, notesRes] = await Promise.all([
          fetch(`/api/folders/${folderId}`),
          fetch(`/api/notes?folderId=${folderId}`),
        ]);

        if (!folderRes.ok) {
          throw new Error("Folder tidak ditemukan atau Anda tidak memiliki akses.");
        }
        if (!notesRes.ok) {
          throw new Error("Gagal mengambil catatan untuk folder ini.");
        }

        const folderData = await folderRes.json();
        const notesData = await notesRes.json();

        setFolder(folderData);
        setNotes(notesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [folderId]);
  
  if (loading) {
    return <div className="p-8">Memuat catatan...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-red-500">Kesalahan: {error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="w-6 h-6 text-black"/>
        </button>
        <h1 className="text-3xl font-semibold text-black">
            {folder ? folder.name : "Folder"}
        </h1>
      </div>

      {notes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/dashboard/notes/${note.id}/edit`}
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-black truncate">
                {note.title}
              </h3>
              <div
                className="mt-2 text-sm text-gray-600 prose max-h-24 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-gray-600">Belum ada catatan di folder ini.</p>
            <Link href="/dashboard/notes/new" className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
                Buat catatan pertama
            </Link>
        </div>
      )}
    </div>
  );
};

export default FolderNotesPage;
