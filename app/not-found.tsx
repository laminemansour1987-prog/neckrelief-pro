import Link from "next/link";
import LogoMark from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
      <LogoMark className="h-14 w-14 opacity-70" />
      <p className="mt-8 font-display text-6xl font-medium italic text-white/20">404</p>
      <h1 className="mt-3 font-display text-2xl font-medium text-white">
        Cette page s&apos;est évaporée
      </h1>
      <p className="mt-3 text-sm text-white/50">
        Même Aura ne la retrouve pas. Revenez à l&apos;accueil ou posez-lui
        directement la question.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-canvas transition hover:bg-white/90"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/chat"
          className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white/30"
        >
          Parler à Aura
        </Link>
      </div>
    </div>
  );
}
