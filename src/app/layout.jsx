import { Quicksand } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Catat Pintar",
  description: "Catat, Tanya, dan Uji. Belajar jadi lebih mudah.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <LanguageProvider>
          <Providers>
            <Toaster position="top-center" reverseOrder={false} />
            {children}
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}