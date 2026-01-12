"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
        // Redirect to login page with a success query param
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-black">Buat Akun</h1>
          <p className="mt-2 text-sm text-gray-600">
            Mulai perjalanan belajarmu bersama CatatPintar.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleRegister} autoComplete="off">
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
                autoComplete="off"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="off"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 text-black placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>
          </div>
           {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Daftar"}
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