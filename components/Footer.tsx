import LogoMark from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-white/35 sm:flex-row">
        <div className="flex items-center gap-2">
          <LogoMark className="h-5 w-5" />
          <span>© {new Date().getFullYear()} Aura AI. Tous droits réservés.</span>
        </div>
        <p>Fait avec soin pour un compagnon IA du quotidien.</p>
      </div>
    </footer>
  );
}
