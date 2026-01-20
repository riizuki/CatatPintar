"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import { signIn } from "next-auth/react";
import toast from 'react-hot-toast';
import Image from "next/image"; // Import Image component

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    const logoutParam = searchParams.get("logout");
    const registeredParam = searchParams.get("registered");

    if (logoutParam === "success" && !toastShownRef.current) {
      toast.success("Berhasil logout.");
      toastShownRef.current = true;
      router.replace('/login', undefined, { shallow: true });
    } else if (registeredParam === "true" && !toastShownRef.current) {
      toast.success("Registrasi berhasil! Silakan login.");
      toastShownRef.current = true;
      router.replace('/login', undefined, { shallow: true });
    }
  }, [searchParams, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const toastId = toast.loading('Mencoba untuk login...');

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result.ok) {
      toast.success('Login berhasil!', { id: toastId });
      router.push("/dashboard"); 
    } else {
      toast.error('Email atau kata sandi salah.', { id: toastId });
      setError("Email atau kata sandi salah"); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="w-full sm:max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white/70 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200">
        <div className="text-center">
            <Image 
                src="/img/logo.png"
                alt="CatatPintar Logo"
                width={48}
                height={48}
                className="mx-auto mb-3 sm:mb-4"
            />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Selamat Datang!</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-700">
            Silakan login untuk melanjutkan petualangan belajarmu.
          </p>
        </div>
        
        <form className="space-y-4 sm:space-y-6" onSubmit={handleLogin} autoComplete="off">
          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2"
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
              className="block w-full px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2"
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
              className="block w-full px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-all duration-200"
            />
          </div>
          {error && <p className="text-xs sm:text-sm text-red-500 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base font-bold text-white bg-[#00A2D8] rounded-lg shadow-md hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] disabled:opacity-50 transition-all duration-200"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </div>
        </form>
        <div className="text-xs sm:text-sm text-center mt-4 sm:mt-6">
          <p className="text-gray-700">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-bold text-[#00A2D8] hover:text-[#008EB2] transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}