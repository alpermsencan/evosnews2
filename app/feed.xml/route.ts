import { getPublishedIndex } from "@/lib/queries";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import { toDate } from "@/lib/utils";

/** RSS içerik akışıyla birlikte tazelensin. */
export const revalidate = 900;
export const dynamic = "force-dynamic";

/** XML'de güvenli olmayan karakterleri kaçırır. */
function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = siteUrl();
  const articles = await getPublishedIndex(50);

  const items = articles
    .map((a) => {
      const url = `${base}/haber/${a.slug}`;
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(a.spot)}</description>
      <category>${escapeXml(a.category.slug)}</category>
      <pubDate>${toDate(a.publishedAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${base}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
export const dynamic = "force-dynamic";
