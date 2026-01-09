"use client";

import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Link from "next/link";

const Dashboard = () => {
  // Dummy data, in a real app this would come from a database or state management
  const [notes, setNotes] = useState([
    { id: 1, title: "Note 1: Introduction to AI", content: "This note contains an introduction to the field of Artificial Intelligence...", folderId: 1, lastModified: new Date() },
    { id: 2, title: "Note 2: Machine Learning Basics", content: "An overview of the fundamental concepts in Machine Learning...", folderId: 1, lastModified: new Date() },
    { id: 3, title: "Note 3: Deep Learning", content: "Exploring the architecture and applications of deep neural networks...", folderId: 2, lastModified: new Date() },
  ]);

  const recentNotes = notes.sort((a, b) => b.lastModified - a.lastModified).slice(0, 3);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-black">My Notes</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search notes..."
              className="pl-10 pr-4 py-2 text-black placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
            />
          </div>
          <Link
            href="/dashboard/notes/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Note
          </Link>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-black mb-4">Recent Notes</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentNotes.map((note) => (
            <Link
              key={note.id}
              href={`/dashboard/notes/${note.id}/edit`}
              className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-black">
                {note.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-black mb-4">All Notes</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/dashboard/notes/${note.id}/edit`}
            className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-black">
              {note.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
