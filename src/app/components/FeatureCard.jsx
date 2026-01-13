import Image from "next/image";

// Komponen untuk setiap kartu fitur
const FeatureCard = ({ headerImageSrc, title, description }) => (
  <article
    className="
      group
      overflow-hidden rounded-xl // More rounded corners
      border border-gray-100 // Lighter border
      bg-white
      shadow-lg // Subtle shadow
      transition-all duration-300
      hover:-translate-y-2 hover:shadow-xl hover:border-[#4CC1EE] // More pronounced hover effect
    "
  >
    <div className="relative h-48 w-full bg-gray-100 overflow-hidden"> 
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
          text-gray-900
        "
      >
        {title}
      </h3>

      <p
        className="
          text-base leading-relaxed // Slightly larger text
          text-gray-600
        "
      >
        {description}
      </p>
    </div>
  </article>
);

export default FeatureCard;