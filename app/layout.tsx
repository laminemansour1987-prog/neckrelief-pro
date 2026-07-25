import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RefCapture from "@/components/RefCapture";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const title = "Aura — Votre compagnon IA au quotidien";
const description =
  "Aura est l'assistant IA pensé pour un usage quotidien par tous : conseils instantanés, bien-être, productivité. Essayez gratuitement, passez Plus ou Pro quand vous voulez.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: title,
    template: "%s · Aura",
  },
  description,
  openGraph: {
    title,
    description,
    type: "website",
    url: appUrl,
    siteName: "Aura",
    locale: "fr_FR",
    images: [{ url: "/og.png", width: 2400, height: 1260, alt: "Aura — votre compagnon IA au quotidien" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

// Runs before paint: resolves the saved theme (or the OS preference) and
// stamps it on <html> so there is no light/dark flash on first load.
const themeInit = `(function(){try{var t=localStorage.getItem('aura-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-aura-radial" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grain" />
        <RefCapture />
        <Navbar />
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
