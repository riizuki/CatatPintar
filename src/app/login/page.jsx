"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const dummyUser = {
    email: "user@example.com",
    password: "password123",
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === dummyUser.email && password === dummyUser.password) {
      router.push("/dashboard");
    } else {
      setError("Email atau kata sandi salah");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-black">Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Selamat datang kembali! Silakan masukkan detail Anda.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 text-black placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label
                htmlFor="remember-me"
                className="block ml-2 text-sm text-black"
              >
                Ingat saya
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-black hover:text-gray-800"
              >
                Lupa kata sandi?
              </a>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Login
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <p className="text-gray-600">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-black hover:text-gray-800"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}