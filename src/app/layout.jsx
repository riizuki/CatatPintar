import { Quicksand } from "next/font/google";
import "./globals.css";

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
      <body className={quicksand.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
