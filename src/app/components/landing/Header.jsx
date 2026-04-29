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
        className={`max-w-7xl mx-auto rounded-full transition-all duration-500 border ${scrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-lg py-2 px-4"
            : "bg-transparent border-transparent py-4 px-2"
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
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">CatatPintar</h1>
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
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#00A2D8] to-[#4CC1EE] rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
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

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden overflow-hidden"
          >
            <div className="pt-4 pb-2 space-y-2 border-t border-gray-200 dark:border-gray-700 mt-4">
              <Link href="#fitur" className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Fitur</Link>
              <Link href="#cara-kerja" className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Cara Kerja</Link>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="block w-full text-center px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#00A2D8] to-[#4CC1EE] rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Masuk Sekarang
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </header>
  );
};

export default Header;
