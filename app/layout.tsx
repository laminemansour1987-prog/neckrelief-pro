import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Aura — Votre compagnon IA au quotidien",
  description:
    "Aura est l'assistant IA pensé pour un usage quotidien par tous : conseils instantanés, bien-être, productivité. Essayez gratuitement, passez Plus ou Pro quand vous voulez.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#0a0a12] bg-aura-radial antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
