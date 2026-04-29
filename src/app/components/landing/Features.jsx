"use client";
import { motion } from "framer-motion";
import FeatureCard from "../FeatureCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const Features = () => (
  <section id="fitur" className="bg-gray-50 dark:bg-gray-950 py-24 lg:py-32 transition-colors duration-500 overflow-hidden relative">
    
    {/* Decorative background elements */}
    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent dark:from-gray-900/50 pointer-events-none"></div>
    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-100/50 to-transparent dark:from-gray-900/50 pointer-events-none"></div>

    <div className="container relative z-10 mx-auto px-6 md:px-8 max-w-7xl">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={itemVariants}
        className="text-center mb-16 md:mb-24"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
          Dirancang untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A2D8] to-blue-700 dark:from-[#4CC1EE] dark:to-blue-400">Pelajar Modern</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Kumpulan alat cerdas yang terintegrasi penuh untuk membantu Anda mencerna informasi, menyimpan pengetahuan, dan menguji diri sendiri.
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-[22rem] md:auto-rows-[24rem]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        {/* Card 1: Spans 2 columns on large screens */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <FeatureCard
            headerImageSrc="/img/ai-card.png"
            title="Asisten AI Terintegrasi"
            description="Tidak perlu lagi membuka tab baru untuk mencari penjelasan. Blok teks yang membingungkan dan biarkan AI kami menyederhanakannya untuk Anda dalam hitungan detik."
            className="md:flex-row"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            }
          />
        </motion.div>

        {/* Card 2: Normal span */}
        <motion.div variants={itemVariants}>
          <FeatureCard
            headerImageSrc="/img/note-card.png"
            title="Rich-Text Editor"
            description="Tulis catatan yang rapi dan terstruktur. Dukungan penuh untuk format teks, gambar, tabel, dan blok kode."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            }
          />
        </motion.div>

        {/* Card 3: Normal span */}
        <motion.div variants={itemVariants}>
          <FeatureCard
            headerImageSrc="/img/quiz-card.jpg"
            title="Flashcard Otomatis"
            description="Ubah catatan panjang menjadi kartu pengingat (flashcard) interaktif hanya dengan satu klik."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            }
          />
        </motion.div>

        {/* Card 4: Spans 2 columns on large screens */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <FeatureCard
            headerImageSrc="/img/quiz-card.jpg"
            title="Kuis Evaluasi Instan"
            description="Uji seberapa jauh Anda telah memahami materi. CatatPintar menganalisis catatan Anda dan membuat kuis pilihan ganda untuk mengevaluasi pemahaman Anda secara langsung."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
          />
        </motion.div>

      </motion.div>
    </div>
  </section>
);

export default Features;
