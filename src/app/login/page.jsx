"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import { signIn } from "next-auth/react";
import toast from 'react-hot-toast';
import Image from "next/image";
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 transition-colors duration-500 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#4CC1EE] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full sm:max-w-md p-8 space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50"
      >
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Link>

        <div className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            >
              <Image 
                  src="/img/logo.png"
                  alt="CatatPintar Logo"
                  width={56}
                  height={56}
                  className="mx-auto mb-4 drop-shadow-md"
              />
            </motion.div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Selamat Datang!</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Masuk untuk melanjutkan petualangan belajarmu.
          </p>
        </div>
        
        <form className="space-y-5" onSubmit={handleLogin} autoComplete="off">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5"
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
              className="block w-full px-4 py-3 text-base bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-all duration-300"
              placeholder="nama@email.com"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 text-base bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-all duration-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </motion.div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm text-red-500 text-center font-medium bg-red-50 dark:bg-red-500/10 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-2"
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3.5 text-base font-bold text-white bg-gradient-to-r from-[#00A2D8] to-[#4CC1EE] rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] dark:focus:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? "Memproses..." : "Masuk ke Akun"}
            </button>
          </motion.div>
        </form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-center mt-6"
        >
          <p className="text-gray-600 dark:text-gray-400">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-bold text-[#00A2D8] hover:text-[#008EB2] dark:hover:text-[#4CC1EE] transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}