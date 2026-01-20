"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className="
        sticky top-0 z-50
        bg-white/90 backdrop-blur-md
        border-b border-gray-200
        transition-colors duration-500
      "
    >
      <div className="container mx-auto flex items-center justify-between px-6 md:px-36 py-4">
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

        <div className="hidden md:flex items-center space-x-4">
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

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-900 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-6 pb-4">
            <Link
              href="/login"
              className="
                block px-5 py-2 text-sm font-medium
                text-white
                bg-[#00A2D8]
                rounded-lg
                text-center
                transition-all duration-200
                hover:bg-[#008EB2]
                shadow-md hover:shadow-lg
              "
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
