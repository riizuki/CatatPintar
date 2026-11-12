"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faLanguage, faLock, faPalette, faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "@/app/components/dashboard/ConfirmationModal";
import ThemeToggle from "@/app/components/ThemeToggle";
import { Page, PageHeader, Spinner, cls } from "@/app/components/ui/kit";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { dashboardTranslations } from "@/locales/dashboard";

const initials = (n = "") =>
  n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

function Section({ icon, title, children }) {
  return (
    <section className={`p-6 ${cls.card}`}>
      <h2 className="mb-5 flex items-center gap-2.5 text-lg font-extrabold">
        <FontAwesomeIcon icon={icon} className="text-[var(--ink-soft)]" />
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

const SettingsPage = () => {
  const { language, toggleLanguage } = useLanguage();
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

  if (status === "loading" || loading) return <Spinner className="h-[calc(100vh-140px)]" />;

  const isId = language === "id";

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title={t.settings.logout}
        isMutating={isLoggingOut}
      >
        <p>{t.logoutModal.message}</p>
      </ConfirmationModal>

      <Page wide>
        <PageHeader title={t.settings.title} subtitle={t.settings.subtitle} />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          {/* ---------- Kartu pelajar ---------- */}
          <aside>
            <div className="overflow-hidden rounded-2xl border-2 border-[var(--ink-fixed)] bg-[var(--card)] lg:sticky lg:top-6">
              <div className="flex items-center justify-between bg-[var(--ink-btn)] px-5 py-3 text-white">
                <span className="font-extrabold tracking-tight">CatatPintar</span>
                <span className="hand text-xl opacity-90">{isId ? "kartu belajar" : "study card"}</span>
              </div>
              <div className="ruled flex flex-col items-center px-6 pt-6 pb-7 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--ink-fixed)] bg-[var(--hl-yellow)] text-2xl font-extrabold text-[var(--ink-fixed)]">
                  {initials(name)}
                </span>
                <p className="mt-4 text-xl font-extrabold break-words">{name || "-"}</p>
                <p className="mt-1 text-sm break-all text-[var(--ink-soft)]">{email}</p>
              </div>
            </div>
          </aside>

          {/* ---------- Formulir ---------- */}
          <form onSubmit={handleSaveChanges} className="space-y-6">
            {error && (
              <p role="alert" className="rounded-xl border-2 border-[var(--wrong)] px-4 py-3 font-medium text-[var(--wrong)]">
                {error}
              </p>
            )}

            <Section icon={faUser} title={t.settings.basicInfo}>
              <div>
                <label htmlFor="name" className={cls.label}>{t.settings.fullName}</label>
                <input id="name" name="name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} className={cls.input} />
              </div>
              <div>
                <label htmlFor="email" className={cls.label}>{t.settings.email}</label>
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={cls.input} />
              </div>
            </Section>

            <Section icon={faLock} title={t.settings.security}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className={cls.label}>{t.settings.newPassword}</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cls.input}
                    placeholder={t.settings.passwordPlaceholder}
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className={cls.label}>{t.settings.confirmPassword}</label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cls.input}
                    placeholder={t.settings.confirmPlaceholder}
                  />
                </div>
              </div>
            </Section>

            <Section icon={faPalette} title={isId ? "Tampilan" : "Appearance"}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{isId ? "Mode gelap" : "Dark mode"}</p>
                  <p className="text-sm text-[var(--ink-soft)]">{isId ? "Lebih nyaman untuk belajar malam." : "Easier on the eyes at night."}</p>
                </div>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-[var(--rule)] pt-5">
                <div>
                  <p className="font-semibold">{isId ? "Bahasa" : "Language"}</p>
                  <p className="text-sm text-[var(--ink-soft)]">{isId ? "Bahasa Indonesia" : "English"}</p>
                </div>
                <button type="button" onClick={toggleLanguage} className={cls.btnOutline}>
                  <FontAwesomeIcon icon={faLanguage} />
                  {isId ? "Switch to English" : "Ganti ke Indonesia"}
                </button>
              </div>
            </Section>

            <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] px-4 font-bold text-[var(--wrong)] hover:bg-[var(--wrong)]/10"
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                {t.settings.logout}
              </button>
              <button type="submit" disabled={isSaving} className="btn-ink h-11 px-6 disabled:opacity-60">
                <FontAwesomeIcon icon={faFloppyDisk} />
                {isSaving ? t.settings.saving : t.settings.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </Page>
    </>
  );
};

export default SettingsPage;
