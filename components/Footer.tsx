import Link from "next/link";
import LogoMark from "@/components/Logo";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "/#features" },
      { label: "Abonnements", href: "/pricing" },
      { label: "Essayer Aura", href: "/chat" },
    ],
  },
  {
    title: "Compte",
    links: [
      { label: "Créer un compte", href: "/signup" },
      { label: "Connexion", href: "/login" },
      { label: "Mon espace", href: "/account" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Questions fréquentes", href: "/#features" },
      { label: "Facturation", href: "/pricing" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <LogoMark className="h-7 w-7" />
            <span className="font-display text-lg italic">Aura</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
            Le compagnon IA pensé pour être utile chaque jour — réponses
            instantanées, bien-être et organisation, pour tout le monde.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
              {col.title}
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/60 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/[0.06] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-white/30 sm:flex-row">
          <p>© {new Date().getFullYear()} Aura AI. Tous droits réservés.</p>
          <p>Fait avec soin pour un compagnon IA du quotidien.</p>
        </div>
      </div>
    </footer>
  );
}
