import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { serviceContent } from "@/content/services";
import { townContent } from "@/content/towns";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/home`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/designer`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/service-areas`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${site.url}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.9 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const servicePages: MetadataRoute.Sitemap = serviceContent.map((s) => ({
    url: `${site.url}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const townPages: MetadataRoute.Sitemap = townContent.map((t) => ({
    url: `${site.url}/service-areas/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const posts: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${site.url}/blog/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...townPages, ...posts];
}
