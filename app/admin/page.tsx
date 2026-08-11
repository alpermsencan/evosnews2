import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    articles,
    drafts,
    categories,
    comments,
    vehicles,
    stations,
    community,
    subscribers,
    leads,
    views,
    topArticles,
    recentComments,
    recentLeads,
    perCategory,
    latest,
  ] = await Promise.all([
    // Yayındaki ve kuyruktaki haberler ayrı sayılır: tek bir "haber" sayacı,
    // moderasyondan geçmemiş taslakları da yayındaymış gibi gösterirdi.
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.category.count(),
    prisma.comment.count(),
    prisma.vehicle.count(),
    prisma.chargeStation.count(),
    prisma.communityPost.count(),
    prisma.subscriber.count(),
    prisma.lead.count(),
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.article.findMany({
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, views: true },
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { article: { select: { title: true, slug: true } } },
    }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, color: true, _count: { select: { articles: true } } },
    }),
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: { id: true, title: true, slug: true, publishedAt: true, category: { select: { name: true, color: true } } },
    }),
  ]);

  const maxCat = Math.max(...perCategory.map((c) => c._count.articles), 1);

  const CARDS = [
    { label: "Yayındaki haber", value: articles, href: "/admin/haberler", color: "bg-evos" },
    { label: "Moderasyon kuyruğu", value: drafts, href: "/admin/kuyruk", color: "bg-amber-700" },
    { label: "Toplam okunma", value: views._sum.views ?? 0, href: "/admin/haberler", color: "bg-neutral-800" },
    { label: "Yorum", value: comments, href: "/admin/yorumlar", color: "bg-amber-600" },
    { label: "Kategori", value: categories, href: "/admin/kategoriler", color: "bg-violet-600" },
    { label: "Araç", value: vehicles, href: "/admin/araclar", color: "bg-teal-700" },
    { label: "Şarj istasyonu", value: stations, href: "/admin/istasyonlar", color: "bg-volt" },
    { label: "Topluluk gönderisi", value: community, href: "/admin/topluluk", color: "bg-orange-600" },
    { label: "Bülten abonesi", value: subscribers, href: "/admin/aboneler", color: "bg-sky-700" },
    { label: "Talep", value: leads, href: "/admin/talepler", color: "bg-indigo-600" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Kartlar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-4 transition hover:shadow-md"
          >
            <span className={`h-1.5 w-8 rounded-full ${c.color}`} />
            <span className="text-2xl font-black text-neutral-900">
              {c.value.toLocaleString("tr-TR")}
            </span>
            <span className="text-[11px] font-bold text-neutral-500">{c.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* En çok okunanlar */}
        <Panel title="EN ÇOK OKUNAN HABERLER">
          <ol className="flex flex-col">
            {topArticles.map((a, i) => (
              <li key={a.id}>
                <Link
                  href={`/haber/${a.slug}`}
                  className="flex items-start gap-3 border-b border-neutral-100 px-4 py-3 last:border-0 hover:bg-neutral-50"
                >
                  <span className="text-lg font-black text-evos/30">{i + 1}</span>
                  <span className="line-clamp-2 flex-1 text-[13px] font-bold text-neutral-800">
                    {a.title}
                  </span>
                  <span className="shrink-0 text-[11px] font-black text-neutral-400">
                    {a.views.toLocaleString("tr-TR")}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Panel>

        {/* Kategori dağılımı */}
        <Panel title="KATEGORİ DAĞILIMI">
          <div className="flex flex-col gap-2.5 p-4">
            {perCategory.map((c) => (
              <div key={c.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
                  <span>{c.name}</span>
                  <span>{c._count.articles}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c._count.articles / maxCat) * 100}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Son yorumlar */}
        <Panel title="SON YORUMLAR">
          <ul className="flex flex-col">
            {recentComments.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-1 border-b border-neutral-100 px-4 py-3 last:border-0"
              >
                <span className="text-[11px] font-black text-neutral-800">
                  {c.name}{" "}
                  <span className="font-semibold text-neutral-400">
                    · {timeAgo(c.createdAt)}
                  </span>
                </span>
                <span className="line-clamp-2 text-[12px] text-neutral-600">
                  {c.body}
                </span>
                <span className="truncate text-[10px] font-bold text-evos">
                  {c.article.title}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="SON EKLENEN HABERLER" action={{ href: "/admin/haberler", label: "TÜMÜ" }}>
          <ul className="flex flex-col">
            {latest.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/admin/haberler/${a.id}`}
                  className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 last:border-0 hover:bg-neutral-50"
                >
                  <span
                    className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black text-white"
                    style={{ backgroundColor: a.category.color }}
                  >
                    {a.category.name.toUpperCase()}
                  </span>
                  <span className="line-clamp-1 flex-1 text-[13px] font-bold text-neutral-800">
                    {a.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-neutral-400">
                    {formatDate(a.publishedAt, false)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="SON TALEPLER" action={{ href: "/admin/talepler", label: "TÜMÜ" }}>
          <ul className="flex flex-col">
            {recentLeads.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-neutral-400">
                Henüz talep yok.
              </li>
            )}
            {recentLeads.map((l) => (
              <li
                key={l.id}
                className="flex flex-col gap-1 border-b border-neutral-100 px-4 py-3 last:border-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-black text-neutral-800">
                    {l.name}
                  </span>
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500">
                    {l.topic}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500">{l.email}</span>
                <span className="line-clamp-2 text-[12px] text-neutral-600">
                  {l.message}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/haberler/yeni"
          className="rounded-md bg-evos px-5 py-3 text-sm font-black text-white transition hover:bg-evos-dark"
        >
          + YENİ HABER
        </Link>
        <Link
          href="/admin/araclar/yeni"
          className="rounded-md bg-teal-700 px-5 py-3 text-sm font-black text-white transition hover:bg-teal-800"
        >
          + YENİ ARAÇ
        </Link>
        <Link
          href="/admin/istasyonlar/yeni"
          className="rounded-md bg-volt px-5 py-3 text-sm font-black text-white transition hover:bg-volt-dark"
        >
          + YENİ İSTASYON
        </Link>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <h2 className="text-[12px] font-black tracking-wide text-neutral-700">
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="text-[11px] font-bold text-neutral-400 hover:text-evos"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
