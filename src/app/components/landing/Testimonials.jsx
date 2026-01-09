"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const TestimonialCard = ({ quote, author, role, imgSrc }) => (
  <motion.div
    className="bg-white p-8 rounded-2xl shadow-md border border-gray-200"
    variants={itemVariants}
  >
    <p className="text-gray-600 mb-6">"{quote}"</p>
    <div className="flex items-center">
      <Image
        src={imgSrc}
        alt={author}
        width={48}
        height={48}
        className="rounded-full mr-4"
      />
      <div>
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </div>
  </motion.div>
);

const Testimonials = () => (
  <motion.section className="bg-gray-50 py-20" variants={itemVariants}>
    <div className="container mx-auto px-40">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
          Apa Kata Mereka?
        </h2>
        <p className="text-gray-600 mt-2">
          Lihat bagaimana CatatPintar telah membantu mahasiswa lain.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <TestimonialCard
          quote="CatatPintar benar-benar mengubah cara saya belajar. Fitur kuis instan sangat membantu saya dalam mempersiapkan ujian."
          author="Anisa Fitriani"
          role="Mahasiswa Teknik Informatika"
          imgSrc="https://i.pravatar.cc/150?u=a042581f4e29026704d"
        />
        <TestimonialCard
          quote="Sebagai mahasiswa kedokteran, saya harus mengingat banyak sekali istilah. Asisten AI di CatatPintar sangat membantu saya untuk memahami materi yang sulit."
          author="Budi Santoso"
          role="Mahasiswa Kedokteran"
          imgSrc="https://i.pravatar.cc/150?u=a042581f4e29026704e"
        />
        <TestimonialCard
          quote="Saya suka sekali dengan fitur rich-text editornya. Sangat mudah digunakan dan membuat catatan saya lebih rapi dan terstruktur."
          author="Cindy Lestari"
          role="Mahasiswa Desain Komunikasi Visual"
          imgSrc="https://i.pravatar.cc/150?u=a042581f4e29026704f"
        />
      </div>
    </div>
  </motion.section>
);

export default Testimonials;
