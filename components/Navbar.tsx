import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar() {
  const email = await getSessionEmail();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a12]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-aura-400 to-aura-700 text-sm font-bold">
            A
          </span>
          Aura
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/70 sm:flex">
          <Link href="/#features" className="hover:text-white">
            Fonctionnalités
          </Link>
          <Link href="/pricing" className="hover:text-white">
            Abonnements
          </Link>
          <Link href="/chat" className="hover:text-white">
            Essayer Aura
          </Link>
          {email && (
            <Link href="/account" className="hover:text-white">
              Mon compte
            </Link>
          )}
        </nav>
        {email ? (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-white/50 sm:inline">{email}</span>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm text-white/70 hover:text-white sm:inline">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-aura-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-aura-400"
            >
              Commencer gratuitement
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
