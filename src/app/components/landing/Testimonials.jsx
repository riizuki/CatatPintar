"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    quote: "“Sejak menggunakan CatatPintar, cara saya belajar berubah total. Catatan jadi lebih rapi, mudah dipahami, dan fitur kuis instan sangat membantu saya mengulang materi sebelum ujian.”",
    name: "Ahmad R.",
    role: "Mahasiswa Teknik Informatika",
    avatar: "https://i.pravatar.cc/150?img=11"
  },
  {
    id: 2,
    quote: "“Materi kedokteran sangat padat dan penuh istilah. Dengan bantuan CatatPintar dan fitur AI-nya, saya bisa memahami konsep dengan lebih cepat dan tidak hanya menghafal.”",
    name: "Sarah M.",
    role: "Mahasiswi Kedokteran",
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: 3,
    quote: "“Saya sangat terbantu dengan editor catatan yang fleksibel. Semua ide, referensi, dan rangkuman bisa saya susun dengan rapi, membuat proses belajar jauh lebih terstruktur.”",
    name: "Budi S.",
    role: "Mahasiswa DKV",
    avatar: "https://i.pravatar.cc/150?img=8"
  },
  {
    id: 4,
    quote: "“Flashcard otomatisnya adalah game changer! Dulu saya harus menyalin ulang secara manual, sekarang cukup satu klik dan siap dihafal di jalan.”",
    name: "Nisa A.",
    role: "Mahasiswi Hukum",
    avatar: "https://i.pravatar.cc/150?img=9"
  },
  {
    id: 5,
    quote: "“Tidak pernah terbayangkan belajar akuntansi bisa semenyenangkan ini. Penjelasan AI-nya sangat detail dan persis dengan yang saya butuhkan.”",
    name: "Dimas P.",
    role: "Mahasiswa Akuntansi",
    avatar: "https://i.pravatar.cc/150?img=12"
  }
];

const Testimonials = () => {
  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-24 lg:py-32 transition-colors duration-500 overflow-hidden">
      <div className="container mx-auto px-6 md:px-8 max-w-7xl">
        <div className="text-center mb-16 md:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight"
          >
            Apa Kata <span className="text-[#00A2D8] dark:text-[#4CC1EE]">Mereka</span>?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Cerita nyata dari mahasiswa berbagai jurusan yang telah meningkatkan produktivitas belajar mereka.
          </motion.p>
        </div>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative flex overflow-hidden group py-4">
        
        {/* Gradient Masks for smooth fading edges */}
        <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-950 z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-gray-50 to-transparent dark:from-gray-950 z-10 pointer-events-none"></div>

        {/* Marquee Track 1 */}
        <div className="flex shrink-0 min-w-full items-stretch gap-6 md:gap-8 pr-6 md:pr-8 animate-marquee group-hover:[animation-play-state:paused]">
          {testimonials.map((t) => (
            <div key={t.id} className="w-[300px] md:w-[400px] shrink-0">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 h-full flex flex-col justify-between transition-transform duration-300 hover:-translate-y-2">
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed mb-8 italic">
                  {t.quote}
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={50}
                    height={50}
                    className="rounded-full border-2 border-[#4CC1EE] shrink-0"
                  />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{t.name}</p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Marquee Track 2 (Duplicate for seamless loop) */}
        <div className="flex shrink-0 min-w-full items-stretch gap-6 md:gap-8 pr-6 md:pr-8 animate-marquee group-hover:[animation-play-state:paused]" aria-hidden="true">
          {testimonials.map((t) => (
            <div key={`dup-${t.id}`} className="w-[300px] md:w-[400px] shrink-0">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 h-full flex flex-col justify-between transition-transform duration-300 hover:-translate-y-2">
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed mb-8 italic">
                  {t.quote}
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={50}
                    height={50}
                    className="rounded-full border-2 border-[#4CC1EE] shrink-0"
                  />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{t.name}</p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
