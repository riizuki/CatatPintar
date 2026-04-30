"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { DocumentTextIcon } from "@heroicons/react/24/solid";

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
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00A2D8] rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return <div className="p-4 sm:p-6 md:p-8 text-red-500 bg-red-50 rounded-xl m-8">Kesalahan: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      <header className="flex items-center mb-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
        <button onClick={() => router.back()} className="mr-4 p-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300"/>
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {folder ? folder.name : "Folder"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {notes.length} Catatan tersimpan
          </p>
        </div>
      </header>

      {notes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/dashboard/notes/${note.id}/edit`}
              className="block p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:-translate-y-2 hover:border-[#00A2D8]/50 dark:hover:border-[#4CC1EE]/50 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-tl from-gray-400/10 to-transparent rounded-full blur-2xl group-hover:from-gray-400/20 transition-all pointer-events-none"></div>
                  <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-500 dark:text-gray-400 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0 relative z-10 border border-gray-200/50 dark:border-gray-700/50">
                      <DocumentTextIcon className="w-7 h-7" />
                  </div>
                  <div className="min-w-0 flex-1 relative z-10">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors truncate">
                        {note.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                         {new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                  </div>
              </div>
              <div
                className="mt-4 text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert max-h-20 overflow-hidden line-clamp-3 opacity-90"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
              <div className="mt-4 flex items-center justify-between text-[#00A2D8] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Buka Catatan</span>
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 sm:py-20 px-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50 pointer-events-none"></div>
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center mb-6 border border-gray-200/50 dark:border-gray-700/50 relative z-10">
              <DocumentTextIcon className="w-10 h-10 text-gray-400 dark:text-gray-500"/>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white relative z-10">Belum ada catatan</h3>
            <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 relative z-10">Ayo mulai mengisi folder ini dengan catatan barumu!</p>
            <Link href="/dashboard/notes/new" className="mt-6 relative z-10 inline-flex items-center px-6 py-3 text-sm sm:text-base font-bold text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-xl transition-all transform hover:-translate-y-1">
                Buat catatan pertama
            </Link>
        </div>
      )}
    </div>
  );
};

export default FolderNotesPage;
