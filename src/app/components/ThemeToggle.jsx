'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex h-10 w-20 items-center justify-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${isDark ? 'bg-gray-800' : 'bg-blue-100'
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
  );
}
