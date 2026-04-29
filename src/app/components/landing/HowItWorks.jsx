"use client";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const HowItWorks = () => (
  <motion.section
    className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-20 lg:py-28 transition-colors duration-500"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={containerVariants}
  >
    <div className="container mx-auto px-6 md:px-36">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors duration-500">
          Bagaimana Caranya?
        </h2>
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-500">
          Tiga langkah mudah untuk memulai petualangan belajarmu.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
        {/* Decorative connecting line for desktop */}
        <div className="hidden md:block absolute left-0 top-1/3 w-full h-1 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2 rounded-full z-0 transition-colors duration-500"></div>

        <motion.div
          className="relative z-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-blue-500 text-white rounded-full font-bold text-3xl border-4 border-blue-300 dark:border-blue-700">
            1
          </div>
          <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white transition-colors duration-500">
            Catat dengan Mudah
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-base transition-colors duration-500">
            Tulis semua materi penting dari kelasmu menggunakan editor
            teks kami yang canggih dan intuitif.
          </p>
        </motion.div>

        <motion.div
          className="relative z-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-purple-500 text-white rounded-full font-bold text-3xl border-4 border-purple-300 dark:border-purple-700">
            2
          </div>
          <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white transition-colors duration-500">
            Tanya AI Pintar
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-base transition-colors duration-500">
            Ada yang kurang jelas? Pilih bagian teks dan biarkan AI
            menjelaskannya untukmu secara instan.
          </p>
        </motion.div>

        <motion.div
          className="relative z-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-500 text-white rounded-full font-bold text-3xl border-4 border-green-300 dark:border-green-700">
            3
          </div>
          <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white transition-colors duration-500">Uji Pemahamanmu</h3>
          <p className="text-gray-700 dark:text-gray-300 text-base transition-colors duration-500">
            Siap untuk ujian? Buat kuis dari catatanmu dan uji pemahamanmu
            secara instan dengan fitur kuis otomatis.
          </p>
        </motion.div>
      </div>
    </div>
  </motion.section>
);

export default HowItWorks;
