'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 md:w-20" />;
  }

  const isDark = theme === 'dark';

  return (
    <>
      {/* Desktop Switch */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`hidden md:inline-flex relative h-10 w-20 items-center justify-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${isDark ? 'bg-gray-800' : 'bg-blue-100'
          }`}
        aria-label="Toggle Dark Mode"
      >
        <div className="absolute inset-0 flex w-full justify-between items-center px-2.5">
          <MoonIcon className={`h-5 w-5 z-10 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-400'}`} />
          <SunIcon className={`h-5 w-5 z-10 transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-orange-500'}`} />
        </div>
        <motion.div
          className={`absolute h-8 w-8 rounded-full bg-white shadow-md`}
          initial={false}
          animate={{
            x: isDark ? -20 : 20,
          }}
          transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        />
      </button>

      {/* Mobile Icon Button */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="md:hidden relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 focus:outline-none overflow-hidden"
        aria-label="Toggle Dark Mode"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ y: -30, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 30, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
            >
              <MoonIcon className="h-5 w-5 text-blue-300" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ y: -30, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 30, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
            >
              <SunIcon className="h-5 w-5 text-orange-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </>
  );
}
