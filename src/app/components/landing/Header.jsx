import Image from "next/image";

const Header = () => (
  <header
    className="
      sticky top-0 z-50
      bg-white/90 backdrop-blur-md
      border-b border-gray-200
    "
  >
    <div className="container mx-auto flex items-center justify-between px-40 py-4">
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

      <a
        href="/login"
        className="
    px-5 py-2 text-sm font-medium
    text-gray-900
    border border-gray-300
    rounded-lg
    transition-all duration-200
    hover:bg-gray-100
    hover:border-gray-400
  "
      >
        Login
      </a>
    </div>
  </header>
);

export default Header;
