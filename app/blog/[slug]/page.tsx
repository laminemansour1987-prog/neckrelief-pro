import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { POSTS, getPost } from "@/lib/posts";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  const url = `${appUrl}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      publishedTime: post.date,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  // JSON-LD so search engines render a rich article result.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "Aura" },
    publisher: { "@type": "Organization", name: "Aura" },
    mainEntityOfPage: `${appUrl}/blog/${post.slug}`,
  };

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/blog" className="text-sm text-aura-300 transition hover:text-aura-200">
        ← Tous les articles
      </Link>

      <div className="mt-6 flex items-center gap-2 text-xs text-white/40">
        <span>{formatDate(post.date)}</span>
        <span aria-hidden="true">·</span>
        <span>{post.readingMinutes} min de lecture</span>
      </div>
      <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-white">
        {post.title}
      </h1>

      <div className="mt-10 space-y-6">
        {post.body.map((block, i) => {
          if (block.type === "h2") {
            return (
              <h2 key={i} className="pt-2 font-display text-2xl font-medium text-white">
                {block.text}
              </h2>
            );
          }
          if (block.type === "ul") {
            return (
              <ul key={i} className="space-y-2.5">
                {block.items?.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-white/70">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-aura-500/20 text-[10px] text-aura-300">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="text-[15px] leading-relaxed text-white/70">
              {block.text}
            </p>
          );
        })}
      </div>

      <div className="mt-14 rounded-3xl border border-aura-400/25 bg-gradient-to-b from-aura-500/10 to-transparent p-8 text-center">
        <h2 className="font-display text-xl font-medium text-white">
          Transformez ces conseils en habitude
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/55">
          Aura vous rappelle de bouger et répond à vos questions du quotidien —
          gratuit pour commencer, sans carte bancaire.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-canvas transition hover:-translate-y-0.5 hover:bg-white/90"
        >
          Essayer Aura gratuitement
        </Link>
      </div>

      <div className="mt-12 border-t border-white/[0.08] pt-8">
        <p className="text-sm font-medium text-white/50">À lire ensuite</p>
        <div className="mt-4 space-y-3">
          {POSTS.filter((p) => p.slug !== post.slug).map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="block text-[15px] text-aura-300 transition hover:text-aura-200"
            >
              {p.title} →
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
