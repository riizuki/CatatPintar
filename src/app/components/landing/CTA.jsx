"use client";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CTA = () => (
  <motion.section
    className="bg-gray-900 text-white"
    variants={itemVariants}
  >
    <div className="container mx-auto px-40 py-24 text-center">
      <h2 className="text-3xl md:text-4xl font-semibold mb-4">
        Siap Mengubah Cara Belajarmu?
      </h2>

      <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
        Bergabunglah dengan CatatPintar sekarang dan rasakan kemudahan
        belajar dengan bantuan AI.
      </p>

      <a
        href="#"
        className="inline-block px-8 py-4 bg-white text-gray-900 rounded-lg
  font-medium hover:bg-gray-100 transition"
      >
        Mulai Sekarang, Gratis!
      </a>
    </div>
  </motion.section>
);

export default CTA;
