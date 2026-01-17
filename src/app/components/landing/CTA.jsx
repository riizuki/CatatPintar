"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CTA = () => (
  <motion.section
    className="bg-gradient-to-r from-[#00A2D8] to-[#4CC1EE] text-white py-20 lg:py-28 relative overflow-hidden"
    variants={itemVariants}
  >
    <div className="absolute inset-0 z-0 opacity-10">
      <div className="w-48 h-48 bg-white rounded-full absolute -top-12 -left-12"></div>
      <div className="w-32 h-32 bg-white rounded-full absolute -bottom-8 -right-8"></div>
    </div>

    <div className="container mx-auto px-32 text-center relative z-10">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
        Siap Mengubah Cara Belajarmu?
      </h2>

      <p className="text-white text-lg lg:text-xl mb-10 max-w-3xl mx-auto">
        Bergabunglah dengan CatatPintar sekarang dan rasakan kemudahan
        belajar dengan bantuan AI yang revolusioner.
      </p>

      <Link
        href="/register"
        className="inline-block px-10 py-5 bg-white text-[#00A2D8] rounded-full
        font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
      >
        Mulai Sekarang, Gratis!
      </Link>
    </div>
  </motion.section>
);

export default CTA;
