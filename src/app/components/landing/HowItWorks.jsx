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
    className="bg-gradient-to-br from-purple-50 to-blue-50 py-20 lg:py-28"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={containerVariants}
  >
    <div className="container mx-auto px-36">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Bagaimana Caranya?
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Tiga langkah mudah untuk memulai petualangan belajarmu.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
        {/* Decorative connecting line */}
        <div className="hidden md:block absolute left-1/2 top-1/2 w-full h-1 bg-[#00A2D8] transform -translate-x-1/2 -translate-y-1/2 rounded-full z-0"></div>

<motion.div className="relative z-10 p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300" variants={itemVariants}>
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-[#00A2D8] text-white rounded-full font-bold text-3xl border-4 border-[#4CC1EE]">
            1
          </div>
          <h3 className="mb-3 text-xl font-bold text-gray-900">
            Catat dengan Mudah
          </h3>
          <p className="text-gray-700 text-base">
            Tulis semua materi penting dari kelasmu menggunakan editor
            teks kami yang canggih dan intuitif.
          </p>
        </motion.div>

<motion.div className="relative z-10 p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300" variants={itemVariants}>
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-purple-600 text-white rounded-full font-bold text-3xl border-4 border-purple-300">
            2
          </div>
          <h3 className="mb-3 text-xl font-bold text-gray-900">
            Tanya AI Pintar
          </h3>
          <p className="text-gray-700 text-base">
            Ada yang kurang jelas? Pilih bagian teks dan biarkan AI
            menjelaskannya untukmu secara instan.
          </p>
        </motion.div>

        {/* Step 3 */}
        <motion.div className="relative z-10 p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300" variants={itemVariants}>
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-600 text-white rounded-full font-bold text-3xl border-4 border-green-300">
            3
          </div>
          <h3 className="mb-3 text-xl font-bold text-gray-900">Uji Pemahamanmu</h3>
          <p className="text-gray-700 text-base">
            Siap untuk ujian? Buat kuis dari catatanmu dan uji pemahamanmu
            secara instan dengan fitur kuis otomatis.
          </p>
        </motion.div>
      </div>
    </div>
  </motion.section>
);

export default HowItWorks;
