import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navegacion/Navbar";
import Footer from "@/components/navegacion/Footer";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mi Plataforma",
  description: "Plataforma de novelas y cómics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col h-full`}>
        <ToastProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}