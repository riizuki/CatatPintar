"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-700 transition-colors duration-500">
      <div className="container mx-auto px-6 md:px-32 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="mb-8 md:mb-0">
            <h3 className="font-bold text-xl mb-4 text-gray-900 transition-colors duration-500">CatatPintar</h3>
            <p className="text-gray-500 text-sm transition-colors duration-500">
              Catatan kuliah, diperkuat AI. Belajar lebih cerdas, bukan lebih keras.
            </p>
          </div>
          <div className="mb-8 md:mb-0">
            <h3 className="font-semibold text-lg mb-4 text-gray-900 transition-colors duration-500">Produk</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-500 hover:text-[#4CC1EE] transition-colors duration-500">
                  Fitur
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-[#4CC1EE] transition-colors duration-500">
                  Harga
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-[#4CC1EE] transition-colors duration-500">
                  Keamanan
                </a>
              </li>
            </ul>
          </div>
          <div className="mb-8 md:mb-0">
            <h3 className="font-semibold text-lg mb-4 text-gray-900 transition-colors duration-500">Perusahaan</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-500 hover:text-[#4CC1EE] transition-colors duration-500">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-[#4CC1EE] transition-colors duration-500">
                  Karir
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-[#4CC1EE] transition-colors duration-500">
                  Kontak
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900 transition-colors duration-500">Sosial Media</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="text-gray-500 hover:text-[#4CC1EE] transition-colors duration-500">
                <FontAwesomeIcon icon={faTwitter} size="2x" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors duration-500">
                <FontAwesomeIcon icon={faGithub} size="2x" />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors duration-500">
                <FontAwesomeIcon icon={faLinkedin} size="2x" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-400 transition-colors duration-500">
          <p className="mb-2 transition-colors duration-500">
            Project ini dibuat oleh <span className="font-semibold text-gray-700">Kelompok 5</span> untuk matakuliah Penerapan Teknologi Internet kelas IF1.
          </p>
          <p className="transition-colors duration-500">
            &copy; 2026 CatatPintar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
