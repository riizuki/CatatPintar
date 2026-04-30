"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import ThemeToggle from "../ThemeToggle";
import { motion } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-300">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`max-w-7xl mx-auto transition-all duration-500 border rounded-full ${scrolled || isMenuOpen
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-lg py-2 px-4"
            : "bg-transparent border-transparent py-4 px-2 shadow-none"
          }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-xl bg-white p-1 shadow-sm transition-transform group-hover:scale-105">
              <Image
                src="/img/logo.png"
                alt="CatatPintar Logo"
                width={32}
                height={32}
                priority
                className="relative z-10"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">CatatPintar</h1>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link href="#fitur" className="hover:text-[#00A2D8] transition-colors">Fitur</Link>
              <Link href="#cara-kerja" className="hover:text-[#00A2D8] transition-colors">Cara Kerja</Link>
            </nav>
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200 dark:border-gray-700">
              <ThemeToggle />
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-full hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                Masuk
              </Link>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 focus:outline-none bg-gray-100 dark:bg-gray-800 rounded-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-3 mx-auto max-w-7xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-3xl overflow-hidden px-4 py-4"
        >
          <div className="space-y-2">
            <Link href="#fitur" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Fitur</Link>
            <Link href="#cara-kerja" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Cara Kerja</Link>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
              <Link
                href="/login"
                className="block w-full text-center px-5 py-3 mt-2 text-sm font-bold text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Masuk Sekarang
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
