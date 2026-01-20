"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Testimonials = () => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="bg-white py-16 md:py-20 lg:py-28"
    >
      <div className="container mx-auto px-6 md:px-16 lg:px-32">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Apa Kata <span className="text-[#4CC1EE]">Mereka</span>?
          </h2>
          <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
            Cerita nyata dari mahasiswa berbagai jurusan yang merasakan langsung
            manfaat CatatPintar dalam proses belajar mereka.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-12">
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-6 md:p-8"
          >
            <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
              “Sejak menggunakan CatatPintar, cara saya belajar berubah total.
              Catatan jadi lebih rapi, mudah dipahami, dan fitur kuis instan
              sangat membantu saya mengulang materi sebelum ujian tanpa stres.”
            </p>
            <div className="flex items-center gap-4">
              <Image
                src="https://i.pravatar.cc/150?img=1"
                alt="Anonim"
                width={56}
                height={56}
                className="rounded-full border-2 border-[#4CC1EE] w-10 h-10 md:w-14 md:h-14"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  Anonim
                </p>
                <p className="text-gray-500 text-xs md:text-sm">
                  Mahasiswa Teknik Informatika
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-6 md:p-8"
          >
            <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
              “Materi kedokteran sangat padat dan penuh istilah. Dengan bantuan
              CatatPintar dan fitur AI-nya, saya bisa memahami konsep dengan
              lebih cepat dan tidak hanya menghafal, tapi benar-benar mengerti.”
            </p>
            <div className="flex items-center gap-4">
              <Image
                src="https://i.pravatar.cc/150?img=2"
                alt="Anonim"
                width={56}
                height={56}
                className="rounded-full border-2 border-[#4CC1EE] w-10 h-10 md:w-14 md:h-14"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  Anonim
                </p>
                <p className="text-gray-500 text-xs md:text-sm">
                  Mahasiswa Kedokteran
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-6 md:p-8"
          >
            <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
              “Saya sangat terbantu dengan editor catatan yang fleksibel dan
              mudah digunakan. Semua ide, referensi, dan rangkuman bisa saya
              susun dengan rapi, membuat proses belajar jauh lebih terstruktur.”
            </p>
            <div className="flex items-center gap-4">
              <Image
                src="https://i.pravatar.cc/150?img=3"
                alt="Anonim"
                width={56}
                height={56}
                className="rounded-full border-2 border-[#4CC1EE] w-10 h-10 md:w-14 md:h-14"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                  Anonim
                </p>
                <p className="text-gray-500 text-xs md:text-sm">
                  Mahasiswa Desain Komunikasi Visual
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center mt-14 md:mt-16">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-7 py-4 text-base md:text-lg font-semibold text-white bg-[#00A2D8] rounded-full hover:bg-[#008EB2] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Mulai Belajar Lebih Cerdas
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default Testimonials;
