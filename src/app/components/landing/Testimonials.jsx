"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { translations } from "@/locales/landing";

// Color palette for generated avatars
const avatarColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
];

const Testimonials = () => {
  const { language } = useLanguage();
  const t = translations[language].testimonials;

  const testimonialsList = [
    {
      id: 1,
      quote: t.review1 || "Sejak menggunakan CatatPintar, cara saya belajar berubah total. Catatan jadi lebih rapi, mudah dipahami, dan fitur kuis instan sangat membantu saya mengulang materi sebelum ujian.",
      name: t.author1 || "Anonim",
      role: t.role1 || "Mahasiswa Teknik Informatika",
    },
    {
      id: 2,
      quote: t.review2 || "Materi kedokteran sangat padat dan penuh istilah. Dengan bantuan CatatPintar dan fitur AI-nya, saya bisa memahami konsep dengan lebih cepat dan tidak hanya menghafal.",
      name: t.author2 || "Anonim",
      role: t.role2 || "Mahasiswi Kedokteran",
    },
    {
      id: 3,
      quote: t.review3 || "Saya sangat terbantu dengan editor catatan yang fleksibel. Semua ide, referensi, dan rangkuman bisa saya susun dengan rapi, membuat proses belajar jauh lebih terstruktur.",
      name: t.author3 || "Anonim",
      role: t.role3 || "Mahasiswa DKV",
    },
    {
      id: 4,
      quote: t.review4 || "Flashcard otomatisnya adalah game changer! Dulu saya harus menyalin ulang secara manual, sekarang cukup satu klik dan siap dihafal di jalan.",
      name: t.author4 || "Anonim",
      role: t.role4 || "Mahasiswi Hukum",
    },
    {
      id: 5,
      quote: t.review5 || "Tidak pernah terbayangkan belajar akuntansi bisa semenyenangkan ini. Penjelasan AI-nya sangat detail dan persis dengan yang saya butuhkan.",
      name: t.author5 || "Anonim",
      role: t.role5 || "Mahasiswa Akuntansi",
    }
  ];

  // Generate initials from name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const TestimonialCard = ({ testimonial, index }) => (
    <div className="w-[280px] sm:w-[320px] md:w-[400px] shrink-0">
      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 h-full flex flex-col justify-between transition-transform duration-300 hover:-translate-y-2">
        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 italic">
          {testimonial.quote}
        </p>
        <div className="flex items-center gap-3 sm:gap-4 mt-auto">
          {/* CSS-generated avatar — no external network requests */}
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm sm:text-base shrink-0 border-2 border-[#4CC1EE]`}
          >
            {getInitials(testimonial.name)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">{testimonial.name}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-16 sm:py-20 lg:py-32 transition-colors duration-500 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="text-center mb-10 sm:mb-16 md:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6 tracking-tight"
          >
            {t.badge}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2"
          >
            {t.subtitle}
          </motion.p>
        </div>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative flex overflow-hidden group py-4">
        
        {/* Gradient Masks for smooth fading edges */}
        <div className="absolute top-0 left-0 w-8 sm:w-16 md:w-32 h-full bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-950 z-10 pointer-events-none" aria-hidden="true"></div>
        <div className="absolute top-0 right-0 w-8 sm:w-16 md:w-32 h-full bg-gradient-to-l from-gray-50 to-transparent dark:from-gray-950 z-10 pointer-events-none" aria-hidden="true"></div>

        {/* Marquee Track 1 */}
        <div className="flex shrink-0 min-w-full items-stretch gap-4 sm:gap-6 md:gap-8 pr-4 sm:pr-6 md:pr-8 animate-marquee group-hover:[animation-play-state:paused] will-change-transform">
          {testimonialsList.map((testimonial, i) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={i} />
          ))}
        </div>

        {/* Marquee Track 2 (Duplicate for seamless loop) */}
        <div className="flex shrink-0 min-w-full items-stretch gap-4 sm:gap-6 md:gap-8 pr-4 sm:pr-6 md:pr-8 animate-marquee group-hover:[animation-play-state:paused] will-change-transform" aria-hidden="true">
          {testimonialsList.map((testimonial, i) => (
            <TestimonialCard key={`dup-${testimonial.id}`} testimonial={testimonial} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
