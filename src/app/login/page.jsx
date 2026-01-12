"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import { signIn } from "next-auth/react";
import toast from 'react-hot-toast';

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-black">Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Selamat datang kembali! Silakan masukkan detail Anda.
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin} autoComplete="off">
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
              {loading ? "Memproses..." : "Login"}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}