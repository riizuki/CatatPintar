"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import FeatureCard from "../FeatureCard";

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Features = () => (
  <motion.section className="bg-gray-50 py-20" variants={itemVariants}>
    <div className="container mx-auto px-40">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
          Fitur Inti Untuk Belajar Cerdas
        </h2>
        <p className="text-gray-600 mt-2">
          Alat yang kamu butuhkan untuk memahami materi lebih dalam.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          headerImageSrc="/img/note-card.png"
          title="Rich-Text Notes"
          description="Tulis dan format catatan kuliahmu dengan mudah menggunakan editor yang intuitif."
        />
        <FeatureCard
          headerImageSrc="/img/ai-card.png"
          title="Asisten AI Cerdas"
          description="Bingung dengan suatu istilah? Pilih teks dan tanyakan langsung pada AI untuk penjelasan instan."
        />
        <FeatureCard
          headerImageSrc="/img/quiz-card.jpg"
          title="Kuis Instan"
          description="Uji pemahamanmu kapan saja. Buat kuis secara otomatis langsung dari materi yang kamu catat."
        />
      </div>
    </div>
  </motion.section>
);

export default Features;
