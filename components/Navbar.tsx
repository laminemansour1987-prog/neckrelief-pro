import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import LogoMark from "@/components/Logo";

export default async function Navbar() {
  const email = await getSessionEmail();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-canvas/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-white">
          <LogoMark className="h-7 w-7" />
          <span className="font-display text-lg italic">Aura</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/60 sm:flex">
          <Link href="/#features" className="transition hover:text-white">
            Fonctionnalités
          </Link>
          <Link href="/pricing" className="transition hover:text-white">
            Abonnements
          </Link>
          <Link href="/chat" className="transition hover:text-white">
            Essayer Aura
          </Link>
          {email && (
            <Link href="/account" className="transition hover:text-white">
              Mon compte
            </Link>
          )}
        </nav>
        {email ? (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-white/40 sm:inline">{email}</span>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm text-white/60 transition hover:text-white sm:inline">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-canvas transition hover:bg-white/90"
            >
              Commencer gratuitement
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
