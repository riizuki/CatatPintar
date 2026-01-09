"use client";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-40 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">CatatPintar</h3>
            <p className="text-gray-600 text-sm">
              Catatan kuliah, diperkuat AI.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Produk</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Fitur
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Harga
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Keamanan
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Perusahaan</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Karir
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Kontak
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Sosial Media</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>
            &copy; {new Date().getFullYear()} CatatPintar. All rights reserved.
          </p>
          <p className="mt-1">Oleh Kelompok 5</p>
        </div>
      </div>
    </footer>
  );
}
