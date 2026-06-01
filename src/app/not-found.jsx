"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  const { language } = useLanguage() || { language: "id" };

  const content = {
    id: {
      title: "Halaman Tidak Ditemukan",
      subtitle: "Sepertinya catatan pintar kami kehilangan jejak halaman ini. Mungkin halaman telah dipindahkan, dihapus, atau tersesat di luar angkasa.",
      btnHome: "Kembali ke Beranda",
      badge: "Oops! Tersesat?"
    },
    en: {
      title: "Page Not Found",
      subtitle: "It seems our smart notes lost track of this page. Maybe it has been moved, deleted, or got lost in outer space.",
      btnHome: "Back to Home",
      badge: "Oops! Lost?"
    }
  };

  const t = content[language] || content.id;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const numberVariants = {
    hover: {
      scale: 1.15,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.4, ease: "easeInOut" }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 px-6 py-12 overflow-hidden transition-colors duration-500">

      {/* Background blobs aligned with brand colors */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 lg:w-[450px] lg:h-[450px] bg-[#4CC1EE] rounded-full mix-blend-multiply filter blur-[100px] opacity-25 dark:opacity-15 animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 lg:w-[450px] lg:h-[450px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-25 dark:opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 lg:w-[450px] lg:h-[450px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-25 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Sparkle/Note Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Floating Note 1 */}
        <motion.div
          animate={{
            y: [0, -25, 0],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-10 md:left-24 opacity-20 dark:opacity-30"
        >
          <svg className="w-12 h-12 text-[#00A2D8]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
        </motion.div>

        {/* Floating Question Mark */}
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-10 md:right-24 opacity-20 dark:opacity-30"
        >
          <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>

        {/* Floating Sparkle */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-1/4 w-4 h-4 bg-[#4CC1EE] rounded-full filter blur-[2px]"
        ></motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl rounded-3xl p-8 md:p-12 text-center overflow-hidden transition-all duration-300"
      >
        {/* Dynamic top brand gradient border */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00A2D8] via-[#4CC1EE] to-blue-500"></div>

        {/* Mascot Wrapper with Floating Animation */}
        <motion.div
          variants={itemVariants}
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="flex justify-center mb-6 relative"
        >
          <div className="relative p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
            <Image
              src="/img/logo.png"
              alt="AI Mascot"
              width={80}
              height={80}
              className="drop-shadow-lg filter dark:brightness-110"
              priority
            />
          </div>
          {/* Sparkles around mascot */}
          <span className="absolute -top-1 right-[38%] text-yellow-400 text-xl animate-pulse">✦</span>
          <span className="absolute -bottom-1 left-[38%] text-blue-400 text-lg animate-pulse animation-delay-2000">✦</span>
        </motion.div>

        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 rounded-full bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#00A2D8] animate-ping"></span>
          <span className="text-xs font-bold text-[#00A2D8] dark:text-[#4CC1EE] uppercase tracking-wider">
            {t.badge}
          </span>
        </motion.div>

        {/* Giant Interactive 404 Numbers */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-1 mb-6 font-extrabold text-8xl md:text-9xl tracking-tight select-none"
        >
          <motion.span
            variants={numberVariants}
            whileHover="hover"
            className="cursor-pointer bg-clip-text text-transparent bg-gradient-to-br from-[#00A2D8] via-blue-500 to-[#4CC1EE] inline-block"
          >
            4
          </motion.span>
          <motion.span
            variants={numberVariants}
            whileHover="hover"
            className="cursor-pointer bg-clip-text text-transparent bg-gradient-to-br from-[#4CC1EE] via-purple-500 to-[#00A2D8] inline-block"
          >
            0
          </motion.span>
          <motion.span
            variants={numberVariants}
            whileHover="hover"
            className="cursor-pointer bg-clip-text text-transparent bg-gradient-to-br from-[#00A2D8] via-blue-500 to-[#4CC1EE] inline-block"
          >
            4
          </motion.span>
        </motion.div>

        {/* Text Area */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4"
        >
          {t.title}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed"
        >
          {t.subtitle}
        </motion.p>

        {/* Navigation Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-[#00A2D8] to-[#4CC1EE] rounded-full shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            {t.btnHome}
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
}
