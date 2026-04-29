import Image from "next/image";
import { motion } from "framer-motion";

const FeatureCard = ({ headerImageSrc, title, description, className = "", icon }) => (
  <motion.article
    whileHover={{ y: -5 }}
    className={`
      group
      relative overflow-hidden rounded-3xl 
      border border-gray-200/50 dark:border-gray-700/50
      bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl
      shadow-xl hover:shadow-2xl hover:border-[#4CC1EE]/50 dark:hover:border-[#4CC1EE]/50
      transition-all duration-300 flex flex-col h-full
      ${className}
    `}
  >
    {/* Decorative background glow */}
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00A2D8] rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-10 dark:opacity-0 dark:group-hover:opacity-20 transition-opacity duration-500"></div>

    <div className="relative h-48 sm:h-56 w-full bg-gray-100/50 dark:bg-gray-900/50 overflow-hidden shrink-0"> 
      <Image
        src={headerImageSrc}
        alt={`${title} header image`}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
        priority
        quality={100}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-gray-800/90 to-transparent opacity-80"></div>
    </div>

    <div className="relative p-6 sm:p-8 flex-grow flex flex-col justify-end -mt-16 z-10">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00A2D8] to-[#4CC1EE] flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30 transform group-hover:scale-110 transition-transform duration-300">
        {icon ? icon : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
      </div>
      <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        {title}
      </h3>
      <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  </motion.article>
);

export default FeatureCard;