import Image from "next/image";
import { motion } from "framer-motion";

const FeatureCard = ({ headerImageSrc, title, description, className = "", icon }) => {
  const isHorizontal = className.includes("md:flex-row");

  return (
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

      <div className={`relative h-48 sm:h-56 ${isHorizontal ? 'md:h-auto md:w-2/5' : 'w-full'} bg-gray-100/50 dark:bg-gray-900/50 overflow-hidden shrink-0`}> 
        <Image
          src={headerImageSrc}
          alt={`${title} header image`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
          priority
          quality={100}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${isHorizontal ? 'md:bg-gradient-to-r' : ''} from-white dark:from-gray-800 to-transparent opacity-60`}></div>
      </div>

      <div className="relative p-8 flex-grow flex flex-col z-10">
        <div className={`absolute ${isHorizontal ? 'md:top-1/2 md:-translate-y-1/2 md:-left-7 top-0 -translate-y-1/2' : '-top-10'} left-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00A2D8] to-[#4CC1EE] flex items-center justify-center text-white shadow-xl shadow-blue-500/30 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 border-4 border-white dark:border-gray-800`}>
          {icon ? icon : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </div>
        <div className={`${isHorizontal ? 'md:mt-0 mt-6' : 'mt-6'}`}>
          <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
      </div>
    </motion.article>
  );
};

export default FeatureCard;