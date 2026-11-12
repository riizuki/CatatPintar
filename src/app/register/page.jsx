"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import AuthShell, { Field, FormError, PasswordField, SubmitButton } from "../components/auth/AuthShell";

const firstSteps = [
  { text: "Tulis catatan pertamamu", hl: "hl-yellow" },
  { text: "Tanya AI kalau ada yang bingung", hl: "hl-blue" },
  { text: "Coba kuis dari catatanmu", hl: "hl-green" },
];

function RegisterAside() {
  return (
    <>
      <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Buku catatan baru, siap diisi.</h2>
      <p className="hand mt-4 text-2xl text-[var(--ink-soft)]">Yang bisa kamu lakukan setelah daftar:</p>
      <ul className="mt-4 space-y-4">
        {firstSteps.map((s) => (
          <li key={s.text} className="flex items-center gap-3 text-lg">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-[var(--ink-soft)] text-sm text-[var(--margin)]">
              <FontAwesomeIcon icon={faCheck} />
            </span>
            <span className={`hl ${s.hl}`}>{s.text}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    <AuthShell title="Daftar akun" subtitle="Gratis untuk pelajar dan mahasiswa." aside={<RegisterAside />}>
      <p className="hand -mt-4 mb-6 rotate-[-1.5deg] text-xl text-[var(--margin)]">psst, isinya sembarang aja ya :D</p>

      <form className="space-y-5" onSubmit={handleRegister} autoComplete="off">
        <Field
          id="name"
          label="Nama lengkap"
          type="text"
          autoComplete="off"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nama kamu"
        />
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
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Buat kata sandi"
        />
        <FormError>{error}</FormError>
        <div className="pt-2">
          <SubmitButton loading={loading}>Buat akun</SubmitButton>
        </div>
      </form>

      <p className="mt-8 text-[var(--ink-soft)]">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-bold text-[var(--ink)] underline decoration-[var(--hl-yellow)] decoration-4 underline-offset-4">
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
}
