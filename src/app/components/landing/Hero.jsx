"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";

const Hero = () => {
  const { language } = useLanguage();
  const t = translations[language].hero;

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-500">
      
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-[#4CC1EE] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 dark:opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 lg:w-96 lg:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 dark:opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-5xl text-center">
        
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#00A2D8] animate-pulse"></span>
          <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">{t.badge}</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 leading-[1.1]"
        >
          {t.title1} <br className="hidden sm:block" />
          <span className="text-[#00A2D8] dark:text-[#4CC1EE]">
            {t.titleHighlight}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {t.subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-[#00A2D8] to-[#4CC1EE] rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            {t.ctaStart}
          </Link>
          <Link
            href="#cara-kerja"
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            {t.ctaLearn}
          </Link>
        </motion.div>

        {/* Floating Image / UI Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-16 sm:mt-24 relative mx-auto w-full max-w-4xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-950 z-20 h-full pointer-events-none"></div>
          <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-2xl p-2 sm:p-4 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00A2D8] to-blue-700"></div>
             {/* Abstract Dashboard Representation */}
             <div className="w-full h-64 sm:h-96 bg-gray-100 dark:bg-gray-800 rounded-xl sm:rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden relative">
               
               <motion.div 
                 animate={{ y: [0, -10, 0] }} 
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="absolute top-10 left-10 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hidden sm:block"
               >
                 <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                 <div className="w-16 h-3 bg-gray-100 dark:bg-gray-800 rounded"></div>
               </motion.div>

               <motion.div 
                 animate={{ y: [0, 10, 0] }} 
                 transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                 className="absolute bottom-10 right-10 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hidden md:block"
               >
                 <div className="w-32 h-4 bg-blue-100 dark:bg-blue-900/30 rounded mb-2"></div>
                 <div className="w-20 h-3 bg-gray-100 dark:bg-gray-800 rounded"></div>
               </motion.div>

               <Image
                 src="/img/logo.png"
                 alt="AI Mascot"
                 width={120}
                 height={120}
                 priority
                 className="opacity-80 drop-shadow-2xl"
               />
             </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
