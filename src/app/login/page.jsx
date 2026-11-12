"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import AuthShell, { Field, FormError, PasswordField, SubmitButton } from "../components/auth/AuthShell";

function LoginAside() {
  return (
    <>
      <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Catatanmu sudah menunggu.</h2>
      <div className="mt-8 rotate-[-1deg] rounded-xl border border-[var(--rule)] bg-[var(--card)] p-6">
        <p className="font-bold">Sejarah: Sumpah Pemuda</p>
        <ul className="mt-2 space-y-1 leading-8">
          <li>Diikrarkan pada 28 Oktober 1928.</li>
          <li>
            <span className="hl hl-yellow">Hasil Kongres Pemuda II di Batavia.</span>
          </li>
          <li className="text-[var(--ink-soft)]">…</li>
        </ul>
      </div>
      <p className="hand mt-5 rotate-[-2deg] text-2xl text-[var(--margin)]">lanjut dari halaman terakhir, yuk!</p>
    </>
  );
}

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
      router.replace("/login", undefined, { shallow: true });
    } else if (registeredParam === "true" && !toastShownRef.current) {
      toast.success("Registrasi berhasil! Silakan login.");
      toastShownRef.current = true;
      router.replace("/login", undefined, { shallow: true });
    }
  }, [searchParams, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const toastId = toast.loading("Mencoba untuk login...");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result.ok) {
      toast.success("Login berhasil!", { id: toastId });
      router.push("/dashboard");
    } else {
      toast.error("Email atau kata sandi salah.", { id: toastId });
      setError("Email atau kata sandi salah.");
    }
  };

  return (
    <AuthShell title="Masuk" subtitle="Lanjutkan belajar dari catatan terakhirmu." aside={<LoginAside />}>
      <form className="space-y-5" onSubmit={handleLogin} autoComplete="off">
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="off"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
        />
        <PasswordField
          autoComplete="off"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Kata sandimu"
        />
        <FormError>{error}</FormError>
        <div className="pt-2">
          <SubmitButton loading={loading}>Masuk</SubmitButton>
        </div>
      </form>

      <p className="mt-8 text-[var(--ink-soft)]">
        Belum punya akun?{" "}
        <Link href="/register" className="font-bold text-[var(--ink)] underline decoration-[var(--hl-yellow)] decoration-4 underline-offset-4">
          Daftar gratis
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginPageContent />
    </Suspense>
  );
}
