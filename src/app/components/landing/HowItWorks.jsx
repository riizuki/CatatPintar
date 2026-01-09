"use client";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const HowItWorks = () => (
  <motion.section className="py-20" variants={itemVariants}>
    <div className="container mx-auto px-40">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
          Bagaimana Caranya?
        </h2>
        <p className="text-gray-600 mt-2">
          Tiga langkah mudah untuk memulai.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>

        <div className="relative p-6">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 text-gray-900 rounded-full font-semibold text-2xl border border-gray-300">
            1
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Catat
          </h3>
          <p className="text-gray-600 text-sm">
            Tulis semua materi penting dari kelasmu menggunakan editor
            teks kami.
          </p>
        </div>
        <div className="relative p-6">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 text-gray-900 rounded-full font-semibold text-2xl border border-gray-300">
            2
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Tanya
          </h3>
          <p className="text-gray-600 text-sm">
            Ada yang kurang jelas? Pilih bagian teks dan biarkan AI
            menjelaskannya untukmu.
          </p>
        </div>
        <div className="relative p-6">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 text-gray-900 rounded-full font-semibold text-2xl border border-gray-300">
            3
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">Uji</h3>
          <p className="text-gray-600 text-sm">
            Siap untuk ujian? Buat kuis dari catatanmu dan uji pemahamanmu
            secara instan.
          </p>
        </div>
      </div>
    </div>
  </motion.section>
);

export default HowItWorks;
