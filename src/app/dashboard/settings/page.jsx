"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ConfirmationModal from "@/app/components/dashboard/ConfirmationModal";

const SettingsPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession(); 
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return; 
    if (!session) { 
      router.push("/login");
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) {
          throw new Error("Failed to fetch user profile.");
        }
        const data = await res.json();
        setName(data.fullName);
        setEmail(data.email);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [session, status, router]); 

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true); 

    if (password && password !== confirmPassword) {
      setMessage("Kata sandi tidak cocok!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          email,
          ...(password && { password }), 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan perubahan.");
      }

      setMessage("Perubahan berhasil disimpan!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
      setMessage(err.message); 
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-8 text-center">Memuat pengaturan...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">Kesalahan: {error}</div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Keluar"
      >
        <p>Apakah Anda yakin ingin keluar dari akun Anda?</p>
      </ConfirmationModal>
      <div className="p-8">
        <h1 className="text-3xl font-semibold text-black mb-8">Pengaturan</h1>
        <div className="max-w-2xl">
          <form onSubmit={handleSaveChanges} className="space-y-6">
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                Kata Sandi Baru
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 text-black placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-black"
              >
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 text-black placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
            </div>
            {message && (
              <p
                className={`text-sm ${
                  message.includes("berhasil") ? "text-green-600" : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
            <div className="mt-8">
              <button
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md shadow-sm sm:w-auto hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-transparent rounded-md shadow-sm sm:w-auto hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;