import { prisma } from "@/lib/prisma";
import ModerationQueue, { type QueueItem } from "@/components/admin/ModerationQueue";

export const dynamic = "force-dynamic";

const PLACEHOLDER = "/haber-placeholder.svg";

export default async function AdminQueue({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string }>;
}) {
  const { durum } = await searchParams;
  const status = durum === "reddedilen" ? "REJECTED" : "DRAFT";

  const [articles, draftCount, rejectedCount] = await Promise.all([
    prisma.article.findMany({
      where: { status },
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        spot: true,
        slug: true,
        image: true,
        sourceName: true,
        sourceUrl: true,
        ingestedAt: true,
        publishedAt: true,
        category: { select: { name: true } },
      },
    }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "REJECTED" } }),
  ]);

  const items: QueueItem[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    spot: a.spot,
    slug: a.slug,
    sourceName: a.sourceName,
    sourceUrl: a.sourceUrl,
    categoryName: a.category.name,
    hasImage: a.image !== PLACEHOLDER,
    ingestedAt: a.ingestedAt?.toISOString() ?? null,
    publishedAt: a.publishedAt.toISOString(),
  }));

  const tabs = [
    { key: "taslak", label: `Onay bekleyen (${draftCount})`, href: "/admin/kuyruk" },
    {
      key: "reddedilen",
      label: `Reddedilen (${rejectedCount})`,
      href: "/admin/kuyruk?durum=reddedilen",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-black text-neutral-900">Moderasyon Kuyruğu</h2>
        <p className="text-sm text-neutral-500">
          Otomatik çekilen haberler burada bekler. Yayına almadan önce metni kendi
          ifadelerinizle yeniden yazın ve görsel ekleyin — kaynak metnin aynen
          yayınlanması telif ihlalidir.
        </p>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => {
          const active =
            (t.key === "taslak" && status === "DRAFT") ||
            (t.key === "reddedilen" && status === "REJECTED");
          return (
            <a
              key={t.key}
              href={t.href}
              className={`rounded px-3 py-1.5 text-[12px] font-black ${
                active
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {t.label}
            </a>
          );
        })}
      </div>

      <ModerationQueue items={items} />
    </div>
  );
}
