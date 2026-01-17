"use client";

import { MagnifyingGlassIcon, PlusIcon, FolderIcon, DocumentTextIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import SkeletonLoader from "@/app/components/dashboard/SkeletonLoader";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
};

function DashboardContent() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const query = searchTerm ? `?search=${searchTerm}` : "";

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
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-10">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                    {greeting}, {session?.user?.name || "Kawan"}!
                </h1>
                <p className="text-gray-500 mt-1">
                    Mari kita mulai hari ini dengan produktif!
                </p>
            </div>
            <Link
                href="/dashboard/notes/new"
                className="hidden sm:inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-[#00A2D8] rounded-lg shadow-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] transition-all duration-300 transform hover:scale-105"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                <span>Buat Catatan</span>
            </Link>
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Cari catatan atau folder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            className="w-full pl-10 pr-4 py-2.5 text-base text-gray-800 bg-white border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8] transition-all duration-300"
          />
        </div>
      </header>

      {error && <p className="text-red-500">Kesalahan: {error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <ClockIcon className="w-6 h-6 mr-2 text-[#00A2D8]"/>
                Terakhir Dilihat
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonLoader type="note" count={2} />
              </div>
            ) : recentNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentNotes.slice(0, 2).map((note) => (
                  <Link
                    key={note.id}
                    href={`/dashboard/notes/${note.id}/edit`}
                    className="p-6 bg-white/50 backdrop-blur-lg rounded-2xl border border-gray-200 hover:shadow-2xl hover:border-[#00A2D8] transition-all duration-300 group transform hover:-translate-y-1"
                  >
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00A2D8] transition-colors line-clamp-2">
                      {note.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Diedit pada: {new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
                <div className="text-center py-10 px-6 bg-white rounded-2xl border border-dashed border-gray-300">
                    <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400"/>
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">Belum Ada Catatan</h3>
                    <p className="mt-1 text-sm text-gray-500">Mulai buat catatan pertamamu sekarang juga!</p>
                     <Link
                        href="/dashboard/notes/new"
                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#00A2D8] rounded-lg shadow-sm hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8]"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Buat Catatan
                    </Link>
                </div>
            )}
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <DocumentTextIcon className="w-6 h-6 mr-2 text-[#00A2D8]"/>
                Semua Catatan
            </h2>
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SkeletonLoader type="note" count={6} />
                </div>
            ) : notes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note) => (
                        <Link
                        key={note.id}
                        href={`/dashboard/notes/${note.id}/edit`}
                        className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:border-[#00A2D8] transition-all duration-300 group transform hover:-translate-y-1 flex flex-col justify-between h-full"
                        >
                        <div className="flex items-start">
                            <DocumentTextIcon className="w-8 h-8 text-gray-400 mr-4 mt-1"/>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#00A2D8] transition-colors line-clamp-2">
                                    {note.title}
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    {new Date(note.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        </Link>
                    ))}
                </div>
            ) : (
                !loading && recentNotes.length > 0 &&
                <p className="text-gray-500">Tidak ada catatan lain.</p>
            )}
          </section>
        </main>

        <aside className="lg:col-span-1">
            <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FolderIcon className="w-6 h-6 mr-2 text-[#00A2D8]"/>
                Folder Saya
            </h2>
            {loading ? (
              <div className="space-y-4">
                <SkeletonLoader type="folder" count={3} />
              </div>
            ) : folders.length > 0 ? (
              <div className="space-y-4">
                {folders.map((folder) => (
                  <Link
                    key={folder.id}
                    href={`/dashboard/folders/${folder.id}`}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:border-[#00A2D8] transition-all duration-300 group transform hover:-translate-y-1"
                  >
                    <div className="flex items-center">
                        <FolderIcon className="w-8 h-8 text-[#00A2D8] mr-4"/>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-[#00A2D8] transition-colors">
                                {folder.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                            {folder.noteCount} Catatan
                            </p>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-white bg-[#00A2D8] rounded-full px-2 py-1">
                      {folder.noteCount}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
                <div className="text-center py-10 px-6 bg-white rounded-2xl border border-dashed border-gray-300">
                    <FolderIcon className="w-12 h-12 mx-auto text-gray-400"/>
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">Folder Masih Kosong</h3>
                    <p className="mt-1 text-sm text-gray-500">Buat folder baru untuk mengorganisir catatanmu.</p>
                </div>
            )}
            </section>
        </aside>
      </div>
      <div className="sm:hidden fixed bottom-4 right-4">
        <Link
            href="/dashboard/notes/new"
            className="inline-flex items-center p-4 text-base font-semibold text-white bg-[#00A2D8] rounded-full shadow-lg hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] transition-all duration-300 transform hover:scale-105"
        >
            <PlusIcon className="w-6 h-6" />
        </Link>
      </div>
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
