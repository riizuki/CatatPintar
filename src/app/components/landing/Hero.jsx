"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link"; // Import Link for better navigation

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
    className="relative pt-24 pb-32 lg:pt-36 lg:pb-48 bg-gradient-to-br from-blue-50 to-purple-50" // Added a subtle gradient background
    variants={itemVariants}
  >
    <div className="container mx-auto px-36 grid md:grid-cols-2 gap-14 items-center">
      {/* Text Content */}
      <motion.div
        className="text-center md:text-left"
      >
        <motion.h2
          variants={itemVariants}
          className="
            text-4xl lg:text-6xl
            font-extrabold // Made bolder
            mb-5
            leading-tight
            text-gray-900 // Kept dark for contrast
          "
        >
          Catatan Kuliah,
          <br className="sm:hidden" /> Diperkuat <span className="text-[#4CC1EE]">AI</span>.
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="
            text-lg lg:text-xl // Slightly larger text
            text-gray-700 // Slightly darker for readability
            mb-8
            max-w-xl
            mx-auto md:mx-0
          "
        >
          Ubah caramu belajar. Catat, tanyakan hal yang belum jelas, dan
          uji pemahamanmu dengan kuis instan—langsung dari catatanmu.
        </motion.p>

        <Link
          href="/register" // Changed to register for new users
          variants={itemVariants}
          className="inline-flex px-8 py-4 text-lg font-bold text-white bg-[#00A2D8] rounded-full hover:bg-[#008EB2] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1" // More vibrant and interactive CTA
        >
          Mulai Petualangan Belajarmu!
        </Link>
      </motion.div>

      <motion.div
        className="flex jqustify-center md:justify-end"
        variants={floatingVariants}
        animate="animate"
      >
        <Image
          src="/img/logo.png" // Changed image to ai-card.png
          alt="AI Mascot"
          width={450} // Slightly larger image
          height={450}
          priority
          className="w-full max-w-sm md:max-w-md" // Removed shadow and rounded corners
        />
      </motion.div>
    </div>
  </motion.main>
);

export default Hero;
