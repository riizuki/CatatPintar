import { Quicksand } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";

import Providers from "./components/Providers";
import AppToaster from "./components/AppToaster";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";

// CSS Font Awesome sudah diimpor di atas, jadi jangan disuntik ulang (mencegah ikon "berkedip" besar)
config.autoAddCss = false;

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
    <html lang="id" suppressHydrationWarning>
      <body className={quicksand.className}>
        <LanguageProvider>
          <Providers>
            <AppToaster />
            {children}
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}