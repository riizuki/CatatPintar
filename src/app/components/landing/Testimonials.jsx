"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const TestimonialCard = ({ quote, author, role, imgSrc }) => (
  <motion.div
    className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    variants={itemVariants}
  >
    <p className="text-gray-700 text-lg mb-6 leading-relaxed">"{quote}"</p>
    <div className="flex items-center">
      <Image
        src={imgSrc}
        alt={author}
        width={56} 
        height={56}
        className="rounded-full mr-4 object-cover border-2 border-[#4CC1EE]"
      />
      <div>
        <p className="font-bold text-gray-900 text-base">{author}</p>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </div>
  </motion.div>
);

const Testimonials = () => (
  <motion.section 
    className="bg-white py-20 lg:py-28"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={containerVariants}
  >
    <div className="container mx-auto px-32">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Apa Kata <span className="text-[#4CC1EE]">Mereka</span>?
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Lihat bagaimana CatatPintar telah membantu ribuan mahasiswa lain
          meraih potensi akademik mereka.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        <TestimonialCard
          quote="CatatPintar benar-benar mengubah cara saya belajar. Fitur kuis instan sangat membantu saya dalam mempersiapkan ujian."
          author="Anonim"
          role="Mahasiswa Teknik Informatika"
          imgSrc="https://i.pravatar.cc/150?img=1"
        />
        <TestimonialCard
          quote="Sebagai mahasiswa kedokteran, saya harus mengingat banyak sekali istilah. Asisten AI di CatatPintar sangat membantu saya untuk memahami materi yang sulit."
          author="Anonim"
          role="Mahasiswa Kedokteran"
          imgSrc="https://i.pravatar.cc/150?img=2"
        />
        <TestimonialCard
          quote="Saya suka sekali dengan fitur rich-text editornya. Sangat mudah digunakan dan membuat catatan saya lebih rapi dan terstruktur."
          author="Anonim"
          role="Mahasiswa Desain Komunikasi Visual"
          imgSrc="https://i.pravatar.cc/150?img=3"
        />
      </div>
      <div className="text-center mt-16">
        <Link
          href="/register"
          className="inline-flex px-8 py-4 text-lg font-bold text-white bg-[#00A2D8] rounded-full hover:bg-[#008EB2] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Mulai Belajar Lebih Cerdas Sekarang!
        </Link>
      </div>
    </div>
  </motion.section>
);

export default Testimonials;
