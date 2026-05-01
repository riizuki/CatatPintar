"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ConfirmationModal from "@/app/components/dashboard/ConfirmationModal";
import toast from 'react-hot-toast';
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { dashboardTranslations } from "@/locales/dashboard";

const SettingsPage = () => {
  const { language } = useLanguage();
  const t = dashboardTranslations[language];
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#00A2D8] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title={t.settings.logout}
        isMutating={isLoggingOut}
      >
        <p className="text-sm sm:text-base">{t.logoutModal.message}</p>
      </ConfirmationModal>
      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
        <header className="mb-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                {t.settings.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">
                {t.settings.subtitle}
            </p>
        </header>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
          <form onSubmit={handleSaveChanges} className="space-y-8">
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{t.settings.basicInfo}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                  <label
                    htmlFor="name"
                    className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t.settings.fullName}
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
                      className="block w-full px-4 py-3 text-sm sm:text-base text-gray-900 dark:text-white bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8]/50 focus:border-[#00A2D8] transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
                  <label
                    htmlFor="email"
                    className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300"
                  >
                    {t.settings.email}
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
                      className="block w-full px-4 py-3 text-sm sm:text-base text-gray-900 dark:text-white bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8]/50 focus:border-[#00A2D8] transition-all"
                    />
                  </div>
                </div>
            </div>
            
            <div className="space-y-6 pt-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{t.settings.security}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <label
                htmlFor="password"
                className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300"
              >
                {t.settings.newPassword}
              </label>
              <div className="md:col-span-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 text-sm sm:text-base text-gray-900 dark:text-white bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8]/50 focus:border-[#00A2D8] transition-all"
                  placeholder={t.settings.passwordPlaceholder}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <label
                htmlFor="confirm-password"
                className="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300"
              >
                {t.settings.confirmPassword}
              </label>
              <div className="md:col-span-2">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-4 py-3 text-sm sm:text-base text-gray-900 dark:text-white bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A2D8]/50 focus:border-[#00A2D8] transition-all"
                  placeholder={t.settings.confirmPlaceholder}
                />
              </div>
            </div>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    type="button"
                    className="w-full sm:w-auto order-2 sm:order-1 px-6 py-3 text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 focus:outline-none transition-all duration-300"
                >
                    {t.settings.logout}
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto order-1 sm:order-2 px-8 py-3 text-sm sm:text-base font-bold text-white bg-[#00A2D8] hover:bg-[#008EB2] rounded-xl focus:outline-none disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                    {isSaving ? t.settings.saving : t.settings.saveChanges}
                </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;