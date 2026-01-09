"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const CreateQuizModal = ({ isOpen, onClose, notes }) => {
  const [step, setStep] = useState("selectType"); // 'selectType', 'selectNote', 'enterTopic'
  const [selectedNote, setSelectedNote] = useState(null);
  const [topic, setTopic] = useState("");

  if (!isOpen) return null;

  const handleStartQuiz = () => {
    if (step === 'selectNote' && selectedNote) {
      console.log("Starting quiz from note:", selectedNote);
      onClose();
    } else if (step === 'enterTopic' && topic) {
      console.log("Starting quiz with AI on topic:", topic);
      onClose();
    }
  };

  const renderContent = () => {
    switch (step) {
      case "selectNote":
        return (
          <div>
            <h3 className="text-xl font-semibold text-black mb-4">
              Select a Note
            </h3>
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 rounded-md cursor-pointer ${
                    selectedNote && selectedNote.id === note.id
                      ? "bg-gray-200"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <p className="font-medium text-black">{note.title}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleStartQuiz}
                disabled={!selectedNote}
                className="px-6 py-2 text-sm font-medium text-white bg-black rounded-md disabled:bg-gray-400"
              >
                Start Quiz
              </button>
            </div>
          </div>
        );
      case "enterTopic":
        return (
          <div>
            <h3 className="text-xl font-semibold text-black mb-4">
              Enter a Topic
            </h3>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Machine Learning'"
              className="w-full px-3 py-2 placeholder-gray-500 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleStartQuiz}
                disabled={!topic}
                className="px-6 py-2 text-sm font-medium text-white bg-black rounded-md disabled:bg-gray-400"
              >
                Start Quiz
              </button>
            </div>
          </div>
        );
      case "selectType":
      default:
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-black mb-6">
              Create a New Quiz
            </h3>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => setStep("selectNote")}
                className="w-full px-6 py-3 text-lg font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Create from My Notes
              </button>
              <button
                onClick={() => setStep("enterTopic")}
                className="w-full px-6 py-3 text-lg font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Create with AI
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-md">
        <div className="flex justify-end">
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default CreateQuizModal;
