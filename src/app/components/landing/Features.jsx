"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import FeatureCard from "../FeatureCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Stagger animations for children
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Features = () => (
  <motion.section 
    className="bg-white py-20 lg:py-28" // Brighter background, more vertical padding
    initial="hidden"
    whileInView="visible" // Animate when in view
    viewport={{ once: true, amount: 0.3 }} // Only animate once, when 30% of item is visible
    variants={containerVariants}
  >
    <div className="container mx-auto px-32">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Fitur <span className="text-[#4CC1EE]">Inti</span> Untuk Belajar Cerdas
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Alat yang kamu butuhkan untuk memahami materi lebih dalam.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        <motion.div variants={itemVariants}>
          <FeatureCard
            headerImageSrc="/img/note-card.png"
            title="Rich-Text Notes"
            description="Tulis dan format catatan kuliahmu dengan mudah menggunakan editor yang intuitif."
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <FeatureCard
            headerImageSrc="/img/ai-card.png"
            title="Asisten AI Cerdas"
            description="Bingung dengan suatu istilah? Pilih teks dan tanyakan langsung pada AI untuk penjelasan instan."
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <FeatureCard
            headerImageSrc="/img/quiz-card.jpg"
            title="Kuis Instan"
            description="Uji pemahamanmu kapan saja. Buat kuis secara otomatis langsung dari materi yang kamu catat."
          />
        </motion.div>
      </div>
    </div>
  </motion.section>
);

export default Features;
