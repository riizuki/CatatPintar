"use client";

import { MagnifyingGlassIcon, PlusIcon, FolderIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import SkeletonLoader from "@/app/components/dashboard/SkeletonLoader";

function DashboardContent() {
  const [notes, setNotes] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (searchParams.get("loggedin") === "true" && !toastShownRef.current) {
      toast.success("Login berhasil!");
      toastShownRef.current = true;
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const query = searchTerm ? `?search=${searchTerm}` : ''; 

        const [recentRes, allRes, foldersRes] = await Promise.all([
          fetch(`/api/notes?recent=true${query}`), 
          fetch(`/api/notes${query}`),             
          fetch("/api/folders"),
        ]);

        if (!recentRes.ok || !allRes.ok) {
          throw new Error("Gagal mengambil catatan");
        }
        if (!foldersRes.ok) {
          throw new Error("Gagal mengambil folder");
        }

        const recentData = await recentRes.json();
        const allData = await allRes.json();
        const foldersData = await foldersRes.json();

        setRecentNotes(recentData);
        setNotes(allData);
        setFolders(foldersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
        fetchData();
    }, 300); 

    return () => clearTimeout(debounceFetch);

  }, [searchTerm]); 

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-black">Catatan Saya</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Cari catatan..."
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 pr-4 py-2 text-black placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
            />
          </div>
          <Link
            href="/dashboard/notes/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Buat Catatan
          </Link>
        </div>
      </div>

      {error && <p className="text-red-500">Kesalahan: {error}</p>}

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-black mb-4">
          Folder
        </h2>
        {loading ? (
            <SkeletonLoader type="folder" count={3} />
        ) : folders.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <Link
                key={folder.id}
                href={`/dashboard/folders/${folder.id}`}
                className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4"
              >
                <div className="flex-shrink-0">
                    <FolderIcon className="w-8 h-8 text-gray-400"/>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-black truncate">
                        {folder.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                        {folder.noteCount} Catatan
                    </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Belum ada folder yang dibuat.</p>
        )}
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-black mb-4">
          Catatan Terbaru
        </h2>
        {loading ? (
            <SkeletonLoader type="note" count={3} />
        ) : recentNotes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentNotes.map((note) => (
              <Link
                key={note.id}
                href={`/dashboard/notes/${note.id}/edit`}
                className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                    <h3 className="text-lg font-semibold text-black truncate">
                    {note.title}
                    </h3>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                    Dibuat pada: {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Tidak ada catatan terbaru.</p>
        )}
      </div>

      <h2 className="text-2xl font-semibold text-black mb-4">Semua Catatan</h2>
      {loading ? (
            <SkeletonLoader type="note" count={6} />
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/dashboard/notes/${note.id}/edit`}
              className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
                <div>
                    <h3 className="text-lg font-semibold text-black truncate">
                        {note.title}
                    </h3>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                    Dibuat pada: {new Date(note.createdAt).toLocaleDateString()}
                </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Anda belum membuat catatan apa pun.</p>
      )}
    </div>
  );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div className="p-8">Memuat...</div>}>
            <DashboardContent />
        </Suspense>
    )
}


