"use client";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-32 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">CatatPintar</h3>
            <p className="text-gray-400 text-sm">
              Catatan kuliah, diperkuat AI. Belajar lebih cerdas, bukan lebih keras.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Produk</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#4CC1EE] transition-colors">
                  Fitur
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#4CC1EE] transition-colors">
                  Harga
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#4CC1EE] transition-colors">
                  Keamanan
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Perusahaan</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#4CC1EE] transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#4CC1EE] transition-colors">
                  Karir
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#4CC1EE] transition-colors">
                  Kontak
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Sosial Media</h3>
            <div className="flex space-x-4"> {/* Using flex for icons */}
              <a href="#" className="text-gray-400 hover:text-[#4CC1EE] transition-colors">
                {/* Placeholder for Twitter Icon */}
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.007-.532A8.318 8.318 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.222 8.222 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 014 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.188a11.644 11.644 0 006.29 1.84"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                {/* Placeholder for Instagram Icon */}
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.873.514.095.698-.224.698-.492 0-.243-.008-.886-.013-1.745-3.56.776-4.148-1.706-4.148-1.706-.58-.967-1.41-1.227-1.41-1.227-1.15-.787.087-.77.087-.77 1.274.09 1.943 1.307 1.943 1.307 1.137 1.943 2.982 1.378 3.718 1.05.114-.816.444-1.378.818-1.7-2.813-.318-5.759-1.407-5.759-6.29 0-1.387.495-2.522 1.302-3.414-.135-.318-.56-.995.127-3.36 0 0 1.06-.342 3.47.787.97-.27 1.998-.405 3.028-.41.036 0 .073 0 .11 0 1.03.005 2.058.14 3.028.41 2.41-.787 3.47-.787 3.47-.787.687 2.365.263 3.042.127 3.36.807.892 1.302 2.027 1.302 3.414 0 4.89-2.946 5.967-5.767 6.28.43.372.823 1.102.823 2.222v3.293c0 .268.185.587.7.492C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                {/* Placeholder for LinkedIn Icon */}
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-700 text-center text-sm text-gray-500"> {/* Adjusted border color */}
          <p>
            &copy; {new Date().getFullYear()} CatatPintar. All rights reserved.
          </p>
          <p className="mt-1">Dibuat oleh Kelompok 5</p> 
        </div>
      </div>
    </footer>
  );
}
