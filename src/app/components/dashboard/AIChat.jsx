"use client";

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useDashboard } from '../../../lib/contexts/DashboardContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../lib/contexts/LanguageContext';
import { dashboardTranslations } from '../../../locales/dashboard';

const AIChat = () => {
  const { isAiSidebarOpen, setIsAiSidebarOpen, noteContext } = useDashboard();
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const userMessage = { role: 'user', content: searchTerm.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setSearchTerm('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/generate/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm: userMessage.content,
          context: noteContext?.noteContent || '',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal mendapatkan penjelasan dari AI.');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', content: data.explanation }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', content: `**Error:** ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-96 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border-l border-gray-200/50 dark:border-gray-800/50 flex flex-col transition-transform duration-500 ease-in-out z-50 ${isAiSidebarOpen ? 'transform translate-x-0' : 'transform translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-gray-200/50 dark:border-gray-800/50 flex-shrink-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent dark:via-blue-900/10">
        <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center">
          {t.aiChat.title}
        </h3>
        <button onClick={() => setIsAiSidebarOpen(false)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="p-4 flex-grow overflow-y-auto space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-[#00A2D8]" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">{t.aiChat.emptyTitle}</p>
              <p className="text-sm mt-1">{t.aiChat.emptySubtitle}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00A2D8] to-blue-500 flex items-center justify-center mr-3 mt-1 shrink-0">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div 
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-[#00A2D8] to-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-a:text-[#00A2D8]" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                    )}
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ml-3 mt-1 shrink-0">
                      <UserCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start items-center"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00A2D8] to-blue-500 flex items-center justify-center mr-3 shrink-0">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm p-4 flex space-x-1.5 items-center h-[52px]">
                  <motion.div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }} />
                  <motion.div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
                  <motion.div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/50 flex-shrink-0 z-10 pb-6">
        <form onSubmit={handleSearch} autoComplete="off" className="relative rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-[#00A2D8]/50 focus-within:border-[#00A2D8] transition-all">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.aiChat.placeholder}
            className="w-full pr-14 pl-5 py-3.5 text-sm text-gray-900 dark:text-white bg-transparent placeholder-gray-400 dark:placeholder-gray-500 rounded-full focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            className="absolute inset-y-0 right-1 flex items-center justify-center w-10 h-10 text-white bg-gradient-to-r from-[#00A2D8] to-blue-500 rounded-full my-auto disabled:opacity-50 transition-all duration-300"
          >
            <PaperAirplaneIcon className="w-5 h-5 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;