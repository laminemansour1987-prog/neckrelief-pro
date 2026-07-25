import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const routes = ["", "/pricing", "/chat", "/login", "/signup", "/blog"];
  const staticEntries = routes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: new Date(),
  }));
  const postEntries = POSTS.map((post) => ({
    url: `${appUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));
  return [...staticEntries, ...postEntries];
}
