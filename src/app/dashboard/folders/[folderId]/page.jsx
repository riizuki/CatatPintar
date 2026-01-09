"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const FolderNotesPage = () => {
  const params = useParams();
  const { folderId } = params;

  // In a real application, you would fetch this data based on the folderId
  const [folders, setFolders] = useState([
    { id: "1", name: "Mata Kuliah: AI" },
    { id: "2", name: "Mata Kuliah: Web Dev" },
    { id: "3", name: "Mata Kuliah: Basis Data" },
  ]);

  const [notes, setNotes] = useState([
    { id: 1, title: "Note 1: Introduction to AI", content: "This note contains an introduction to the field of Artificial Intelligence...", folderId: "1" },
    { id: 2, title: "Note 2: Machine Learning Basics", content: "An overview of the fundamental concepts in Machine Learning...", folderId: "1" },
    { id: 3, title: "Note 3: Deep Learning", content: "Exploring the architecture and applications of deep neural networks...", folderId: "2" },
  ]);

  const folder = folders.find((f) => f.id === folderId);
  const folderNotes = notes.filter((n) => String(n.folderId) === String(folderId));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-black mb-8">
        {folder ? folder.name : "Folder Not Found"}
      </h1>
      {folderNotes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {folderNotes.map((note) => (
            <Link
              key={note.id}
              href={`/dashboard/notes/${note.id}/edit`}
              className="relative p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-black">
                {note.title}
              </h3>
              <div
                className="mt-2 text-sm text-gray-600 prose"
                dangerouslySetInnerHTML={{ __html: note.content.substring(0, 100) + '...' }}
              />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No notes in this folder yet.</p>
      )}
    </div>
  );
};

export default FolderNotesPage;
