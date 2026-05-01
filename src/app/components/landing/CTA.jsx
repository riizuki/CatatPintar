"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";

const CTA = () => {
  const { language } = useLanguage();
  const t = translations[language].cta;

  return (
  <section className="py-24 bg-white dark:bg-gray-950 transition-colors duration-500 overflow-hidden px-6">
    <div className="container mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="relative rounded-3xl sm:rounded-[3rem] bg-gradient-to-br from-[#00A2D8] via-[#4CC1EE] to-blue-600 overflow-hidden shadow-2xl shadow-blue-500/20 dark:shadow-blue-900/20 border border-white/20 dark:border-white/10"
      >
        {/* Decorative background patterns */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[50px] animate-blob"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-300 rounded-full mix-blend-overlay filter blur-[50px] animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 px-8 py-20 sm:px-16 sm:py-24 text-center flex flex-col items-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-white tracking-tight"
          >
            {t.title1} <br className="hidden sm:block" /> {t.title2}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-blue-50 text-lg sm:text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-10 py-5 bg-white text-[#00A2D8] rounded-full font-extrabold text-lg sm:text-xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 group"
            >
              {t.button}
              <svg className="w-6 h-6 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
  );
};

export default CTA;
