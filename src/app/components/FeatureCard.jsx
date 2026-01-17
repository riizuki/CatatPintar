import Image from "next/image";

// Komponen untuk setiap kartu fitur
const FeatureCard = ({ headerImageSrc, title, description }) => (
  <article
    className="
      group
      overflow-hidden rounded-xl 
      border border-gray-100 dark:border-gray-800
      bg-white dark:bg-gray-800
      shadow-lg
      transition-all duration-300
      hover:-translate-y-2 hover:shadow-xl hover:border-[#4CC1EE] // More pronounced hover effect
    "
  >
    <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden"> 
      <Image
        src={headerImageSrc}
        alt={`${title} header image`}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300" 
        priority
        quality={100}
      />
    </div>

    {/* Card Body */}
    <div className="p-6 text-center">
      <h3
        className="
          mb-3 text-xl font-bold // More prominent title
          text-gray-900 dark:text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          text-base leading-relaxed // Slightly larger text
          text-gray-600 dark:text-gray-300
        "
      >
        {description}
      </p>
    </div>
  </article>
);

export default FeatureCard;