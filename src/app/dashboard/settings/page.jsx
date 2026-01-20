"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ConfirmationModal from "@/app/components/dashboard/ConfirmationModal";
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const router = useRouter();
  const { data: session, status, update } = useSession(); 
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);
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
          throw new Error("Gagal memuat profil pengguna.");
        }
        const data = await res.json();
        setName(data.fullName);
        setEmail(data.email);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [session, status, router]); 

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError("");
    
    if (password && password !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok!");
      return;
    }
    
    setIsSaving(true);
    const toastId = toast.loading('Menyimpan perubahan...');

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
      
      toast.success("Perubahan berhasil disimpan!", { id: toastId });
      
      // Update the session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: name,
          email: email
        }
      });
      
      setPassword("");
      setConfirmPassword("");

    } catch (err) {
      setError(err.message);
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-6 md:p-8 text-center">Memuat pengaturan...</div>
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
        <p className="text-sm sm:text-base">Apakah Anda yakin ingin keluar dari akun Anda?</p>
      </ConfirmationModal>
      <div className="p-6 md:p-8">
        <header className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Pengaturan Akun
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Kelola informasi profil, email, dan kata sandi Anda.
            </p>
        </header>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
          <form onSubmit={handleSaveChanges} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <label
                htmlFor="name"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                Nama Lengkap
              </label>
              <div className="md:col-span-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-colors duration-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <label
                htmlFor="email"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                Alamat Email
              </label>
              <div className="md:col-span-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-colors duration-300"
                />
              </div>
            </div>
             <div className="border-t-2 border-gray-100"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <label
                htmlFor="password"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                Kata Sandi Baru
              </label>
              <div className="md:col-span-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-colors duration-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <label
                htmlFor="confirm-password"
                className="text-sm sm:text-base font-medium text-gray-700"
              >
                Konfirmasi Kata Sandi
              </label>
              <div className="md:col-span-2">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A2D8] focus:border-transparent transition-colors duration-300"
                />
              </div>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-between items-center">
                <button
                    onClick={() => setIsModalOpen(true)}
                    type="button"
                    className="w-full sm:w-auto order-2 sm:order-1 mt-4 sm:mt-0 px-4 py-2 sm:px-6 text-sm sm:text-base font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
                >
                    Keluar Akun
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto order-1 sm:order-2 px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base font-semibold text-white bg-[#00A2D8] rounded-lg shadow-md hover:bg-[#008EB2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A2D8] disabled:opacity-50 transition-all duration-300"
                >
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;