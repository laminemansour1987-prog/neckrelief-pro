import Link from "next/link";
import { POSTS } from "@/lib/posts";
import Reveal from "@/components/Reveal";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata = {
  title: "Blog — bien-être, posture & productivité",
  description:
    "Conseils pratiques pour soulager la nuque, corriger sa posture devant l'écran et rester concentré au quotidien — par Aura, votre compagnon IA.",
  alternates: { canonical: `${appUrl}/blog` },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <Reveal>
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-aura-300">
          Le blog Aura
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-center font-display text-4xl font-medium text-white">
          Bien-être, posture &amp; productivité
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-white/55">
          Des conseils simples et concrets pour prendre soin de votre corps et
          de votre concentration, jour après jour.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {POSTS.map((post, i) => (
          <Reveal key={post.slug} delay={(i % 2) * 100}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 transition duration-300 hover:border-aura-400/30"
            >
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>{formatDate(post.date)}</span>
                <span aria-hidden="true">·</span>
                <span>{post.readingMinutes} min de lecture</span>
              </div>
              <h2 className="mt-3 font-display text-xl font-medium leading-snug text-white">
                {post.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">
                {post.excerpt}
              </p>
              <span className="mt-5 text-sm font-medium text-aura-300 transition group-hover:text-aura-200">
                Lire l&apos;article →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={150}>
        <div className="mt-16 rounded-3xl border border-aura-400/25 bg-gradient-to-b from-aura-500/10 to-transparent p-10 text-center">
          <h2 className="font-display text-2xl font-medium text-white">
            Mettez ces conseils en pratique, sans y penser
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/55">
            Aura vous rappelle de bouger, corrige votre posture et répond à vos
            questions au quotidien. Gratuit pour commencer.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-canvas transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Essayer Aura gratuitement
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
