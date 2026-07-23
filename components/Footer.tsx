export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 text-sm text-white/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p>© {new Date().getFullYear()} Aura AI. Tous droits réservés.</p>
        <p>Fait avec soin pour un compagnon IA du quotidien.</p>
      </div>
    </footer>
  );
}
