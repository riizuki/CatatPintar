"use client";

import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Link from "next/link";

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [recentRes, allRes] = await Promise.all([
          fetch("/api/notes?recent=true"),
          fetch("/api/notes"),
        ]);

        if (!recentRes.ok || !allRes.ok) {
          throw new Error("Gagal mengambil catatan");
        }

        const recentData = await recentRes.json();
        const allData = await allRes.json();

        setRecentNotes(recentData);
        setNotes(allData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

      {loading && <p>Memuat catatan...</p>}
      {error && <p className="text-red-500">Kesalahan: {error}</p>}

      {!loading && !error && (
        <>
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Catatan Terbaru
            </h2>
            {recentNotes.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recentNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/dashboard/notes/${note.id}/edit`}
                    className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-black truncate">
                      {note.title}
                    </h3>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada catatan terbaru.</p>
            )}
          </div>

          <h2 className="text-2xl font-semibold text-black mb-4">Semua Catatan</h2>
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <Link
                  key={note.id}
                  href={`/dashboard/notes/${note.id}/edit`}
                  className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-black truncate">
                    {note.title}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Anda belum membuat catatan apa pun.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

