"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SettingsPage = () => {
  const router = useRouter();
  const [name, setName] = useState("Rizky Alfaridha");
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Kata sandi tidak cocok!");
      return;
    }

    // Dummy save logic
    console.log("Saving changes:", { name, email, password });
    setMessage("Perubahan berhasil disimpan!");
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogout = () => {
    // Dummy logout logic
    console.log("Logging out...");
    router.push("/login");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-black mb-8">Settings</h1>
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
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-transparent rounded-md shadow-sm sm:w-auto hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
