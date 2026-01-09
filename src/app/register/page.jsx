import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-black">Buat Akun</h1>
          <p className="mt-2 text-sm text-gray-600">
            Mulai perjalanan belajarmu bersama CatatPintar.
          </p>
        </div>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-black"
            >
              Nama Lengkap
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="block w-full px-3 py-2 text-black placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black"
            >
              Alamat Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-3 py-2 text-black placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black"
            >
              Kata Sandi
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full px-3 py-2 text-black placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Daftar
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <p className="text-gray-600">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-medium text-black hover:text-gray-800"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}