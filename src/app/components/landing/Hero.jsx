"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

const Hero = () => (
  <motion.main
    className="relative pt-24 pb-32 lg:pt-32 lg:pb-48"
    variants={itemVariants}
  >
    <div className="container mx-auto px-40 grid md:grid-cols-2 gap-14 items-center">
      {/* Text Content */}
      <motion.div
        className="text-center md:text-left"
      >
        <motion.h2
          variants={itemVariants}
          className="
    text-4xl lg:text-5xl
    font-semibold
    mb-5
    leading-tight
    text-gray-900
  "
        >
          Catatan Kuliah,
          <br />
          Diperkuat AI.
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="
    text-base lg:text-lg
    text-gray-600
    mb-8
    max-w-xl
    mx-auto md:mx-0
  "
        >
          Ubah caramu belajar. Catat, tanyakan hal yang belum jelas, dan
          uji pemahamanmu dengan kuis instan—langsung dari catatanmu.
        </motion.p>

        <motion.a
          href="/login"
          variants={itemVariants}
          className="inline-flex px-7 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition"
        >
          Coba Gratis
        </motion.a>
      </motion.div>

      {/* Image Content */}
      <motion.div
        className="flex justify-center md:justify-end"
        variants={floatingVariants}
        animate="animate"
      >
        <Image
          src="/img/logo.png"
          alt="AI Mascot"
          width={360}
          height={360}
          priority
          className="w-full max-w-xs md:max-w-sm"
        />
      </motion.div>
    </div>
  </motion.main>
);

export default Hero;
