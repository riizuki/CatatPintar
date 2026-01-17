import Image from "next/image";
import Link from "next/link"; // Import Link for better navigation


const Header = () => (
  <header
    className="
      sticky top-0 z-50
      bg-white/90 backdrop-blur-md
      border-b border-gray-200
    "
  >
    <div className="container mx-auto flex items-center justify-between px-36 py-4">
      <div className="flex items-center gap-3">
        <Image
          src="/img/logo.png"
          alt="CatatPintar Logo"
          width={32}
          height={32}
          priority
        />
        <h1 className="text-xl font-semibold text-gray-900">CatatPintar</h1>
      </div>

      <div className="flex items-center space-x-4">

        <Link
          href="/login"
          className="
            px-5 py-2 text-sm font-medium
            text-white
            bg-[#00A2D8]
            rounded-lg
            transition-all duration-200
            hover:bg-[#008EB2]
            shadow-md hover:shadow-lg
          "
        >
          Login
        </Link>
      </div>
    </div>
  </header>
);

export default Header;
