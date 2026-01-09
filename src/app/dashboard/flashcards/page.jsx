"use client";

import { useState } from "react";

const FlashcardsPage = () => {
  const [notes, setNotes] = useState([
    { id: 1, title: "Note 1: Introduction to AI", content: "This note contains an introduction to the field of Artificial Intelligence...", folderId: 1, lastModified: new Date() },
    { id: 2, title: "Note 2: Machine Learning Basics", content: "An overview of the fundamental concepts in Machine Learning...", folderId: 1, lastModified: new Date() },
    { id: 3, title: "Note 3: Deep Learning", content: "Exploring the architecture and applications of deep neural networks...", folderId: 2, lastModified: new Date() },
  ]);
  const [selectedNote, setSelectedNote] = useState(null);

  const handleGenerateFlashcards = () => {
    if (selectedNote) {
      console.log("Generating flashcards from note:", selectedNote);
      // Here you would implement the logic to generate and display flashcards
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-black">Flashcards</h1>
        <button
          onClick={handleGenerateFlashcards}
          disabled={!selectedNote}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm disabled:bg-gray-400 hover:bg-gray-800"
        >
          Generate Flashcards
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-black mb-4">
        Select a Note to Generate Flashcards
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => setSelectedNote(note)}
            className={`p-6 rounded-lg border cursor-pointer ${
              selectedNote && selectedNote.id === note.id
                ? "bg-gray-200 border-black"
                : "bg-gray-100 border-gray-200 hover:bg-gray-200"
            }`}
          >
            <h3 className="text-lg font-semibold text-black">{note.title}</h3>
          </div>
        ))}
      </div>

      {/* Flashcard display area will go here */}
    </div>
  );
};

export default FlashcardsPage;
