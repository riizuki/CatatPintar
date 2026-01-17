"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useDashboard } from '../../../lib/contexts/DashboardContext';

const AIChat = () => {
  const { isAiSidebarOpen, setIsAiSidebarOpen, noteContext } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    if (isAiSidebarOpen) {
      setSearchTerm('');
      setIsLoading(false);
      setError('');
      setExplanation('');
    }
  }, [isAiSidebarOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError('');
    setExplanation('');

    try {
      const res = await fetch('/api/generate/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm,
          context: noteContext.noteContent,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal mendapatkan penjelasan dari AI.');
      }

      const data = await res.json();
      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col transition-transform duration-500 ease-in-out z-50 ${isAiSidebarOpen ? 'transform translate-x-0' : 'transform translate-x-full'}`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-bold text-lg text-black flex items-center">
          <SparklesIcon className="w-6 h-6 mr-2 text-blue-500" />
          Tanya AI
        </h3>
        <button onClick={() => setIsAiSidebarOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="p-4 flex-grow overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">AI sedang berpikir...</p>
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {explanation && (
          <div className="prose prose-sm max-w-none text-black" dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }} />
        )}
        {!isLoading && !explanation && !error && (
            <div className="text-center text-gray-400 h-full flex flex-col justify-center">
                <p>Punya istilah yang tidak Anda mengerti?</p>
                <p className="font-medium">Tanyakan pada AI!</p>
            </div>
        )}
      </div>

      <form onSubmit={handleSearch} autoComplete="off" className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ketik istilah atau pertanyaan..."
            className="w-full pr-12 pl-4 py-3 text-black placeholder-gray-400 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-white bg-blue-600 rounded-full m-1.5 hover:bg-blue-700 disabled:bg-gray-400"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;