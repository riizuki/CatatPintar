"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await res.json();
        setError(data.message || "Terjadi kesalahan saat mendaftar.");
        setLoading(false);
      }
    } catch (err) {
      setError("Terjadi kesalahan pada jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white/70 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200"> 
        <div className="text-center">
            <Image 
                src="/img/logo.png"
                alt="CatatPintar Logo"
                width={64}
                height={64}
                className="mx-auto mb-4"
            />
          <h1 className="text-4xl font-extrabold text-gray-900">Daftar Akun Baru</h1>
          <p className="mt-2 text-base text-gray-700">
            Mulai petualangan belajarmu bersama CatatPintar.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleRegister} autoComplete="off">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              Nama Lengkap
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="off"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-all duration-200 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-all duration-200 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              Kata Sandi
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="off"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-all duration-200 sm:text-sm"
            />
          </div>
           {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-base font-bold text-white bg-[#00A2D8] rounded-lg shadow-md hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] disabled:opacity-50 transition-all duration-200"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </div>
        </form>
        <div className="text-sm text-center mt-6">
          <p className="text-gray-700">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-bold text-[#00A2D8] hover:text-[#008EB2] transition-colors"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}