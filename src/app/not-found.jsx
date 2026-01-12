import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-4">
      <div className="text-9xl font-extrabold text-purple-600 mb-4 animate-bounce">404</div>
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Halaman Tidak Ditemukan</h1>
      <p className="text-lg md:text-xl text-center mb-8 max-w-md">
        Maaf, halaman yang Anda cari tidak tersedia. Mungkin sudah dipindahkan atau dihapus.
      </p>
      <Link href="/" className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
