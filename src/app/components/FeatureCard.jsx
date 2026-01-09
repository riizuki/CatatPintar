import Image from "next/image";

// Komponen untuk setiap kartu fitur
const FeatureCard = ({ headerImageSrc, title, description }) => (
  <article
    className="
    group
    overflow-hidden rounded-2xl
    border border-gray-200
    bg-white
    transition-all duration-300
    hover:-translate-y-0.5 hover:shadow-md
  "
  >
    <div className="relative h-48 w-full bg-gray-100">
      <Image
        src={headerImageSrc}
        alt={`${title} header image`}
        fill
        className="object-cover"
        priority
        quality={100}
      />
    </div>

    {/* Card Body */}
    <div className="p-6 text-center">
      <h3
        className="
        mb-2 text-lg font-medium
        text-gray-900
      "
      >
        {title}
      </h3>

      <p
        className="
        text-sm leading-relaxed
        text-gray-500
      "
      >
        {description}
      </p>
    </div>
  </article>
);

export default FeatureCard;