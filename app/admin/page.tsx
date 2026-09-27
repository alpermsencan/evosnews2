import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let articles = 0;
  let drafts = 0;
  let categories = 0;
  let comments = 0;
  let vehicles = 0;
  let stations = 0;
  let community = 0;
  let subscribers = 0;
  let leads = 0;
  let listings = 0;
  let pendingListings = 0;
  let totalViews = 0;
  let topArticles: { id: string; title: string; slug: string; views: number }[] = [];
  let recentComments: any[] = [];
  let recentLeads: any[] = [];
  let perCategory: any[] = [];
  let latest: any[] = [];
  let recentPendingListings: any[] = [];

  try {
    const results = await Promise.allSettled([
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.category.count(),
      prisma.comment.count(),
      prisma.vehicle.count(),
      prisma.chargeStation.count(),
      prisma.communityPost.count(),
      prisma.subscriber.count(),
      prisma.lead.count(),
      prisma.listing.count({ where: { status: "PUBLISHED" } }),
      prisma.listing.count({ where: { status: "PENDING" } }),
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
      prisma.listing.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, brand: true, model: true, price: true, createdAt: true, sellerName: true },
      }),
    ]);

    if (results[0].status === "fulfilled") articles = results[0].value;
    if (results[1].status === "fulfilled") drafts = results[1].value;
    if (results[2].status === "fulfilled") categories = results[2].value;
    if (results[3].status === "fulfilled") comments = results[3].value;
    if (results[4].status === "fulfilled") vehicles = results[4].value;
    if (results[5].status === "fulfilled") stations = results[5].value;
    if (results[6].status === "fulfilled") community = results[6].value;
    if (results[7].status === "fulfilled") subscribers = results[7].value;
    if (results[8].status === "fulfilled") leads = results[8].value;
    if (results[9].status === "fulfilled") listings = results[9].value;
    if (results[10].status === "fulfilled") pendingListings = results[10].value;
    if (results[11].status === "fulfilled") totalViews = results[11].value._sum.views ?? 0;
    if (results[12].status === "fulfilled") topArticles = results[12].value;
    if (results[13].status === "fulfilled") recentComments = results[13].value;
    if (results[14].status === "fulfilled") recentLeads = results[14].value;
    if (results[15].status === "fulfilled") perCategory = results[15].value;
    if (results[16].status === "fulfilled") latest = results[16].value;
    if (results[17].status === "fulfilled") recentPendingListings = results[17].value;
  } catch {
    // Veritabanı gecikmelerine karşı varsayılanlarla devam eder
  }

  const maxCat = Math.max(...perCategory.map((c) => c._count?.articles ?? 0), 1);

  const STAT_CARDS = [
    { label: "Araçları Keşfet (Katalog)", value: vehicles, href: "/admin/araclar", color: "bg-teal-600" },
    { label: "Yayındaki 2.El İlanlar", value: listings, href: "/admin/ilanlar", color: "bg-blue-600" },
    { label: "Onay Bekleyen İlanlar", value: pendingListings, href: "/admin/ilanlar?durum=PENDING", color: pendingListings > 0 ? "bg-amber-500 animate-pulse" : "bg-neutral-400" },
    { label: "Yayındaki Haberler", value: articles, href: "/admin/haberler", color: "bg-emerald-600" },
    { label: "Moderasyon Taslakları", value: drafts, href: "/admin/kuyruk", color: "bg-amber-600" },
    { label: "Toplam Okunma", value: totalViews, href: "/admin/haberler", color: "bg-neutral-800" },
    { label: "Şarj İstasyonları", value: stations, href: "/admin/istasyonlar", color: "bg-sky-600" },
    { label: "Topluluk Gönderileri", value: community, href: "/admin/topluluk", color: "bg-orange-600" },
    { label: "Kategoriler", value: categories, href: "/admin/kategoriler", color: "bg-violet-600" },
    { label: "Okur Yorumları", value: comments, href: "/admin/yorumlar", color: "bg-rose-600" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ÜST BAŞLIK VE HIZLI YETKİ BİLGİSİ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1E3F] to-slate-800 p-6 text-white shadow-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-black text-emerald-400 border border-emerald-500/30">
              TAM YETKİLİ ADMİN
            </span>
            <span className="text-xs text-white/50">• Tek Yönetim Merkezi</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            SİTE GENEL YÖNETİM PANELİ
          </h1>
          <p className="text-xs sm:text-sm text-sky-200/80">
            Araçları Keşfet, 2. El İlanlar, Haberler, İstasyonlar ve Topluluk bölümlerini buradan yönetebilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/araclar/yeni"
            className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-black text-white shadow transition hover:bg-teal-500"
          >
            + YENİ ARAÇ EKLE
          </Link>
          <Link
            href="/admin/haberler/yeni"
            className="rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-black text-white shadow transition hover:bg-sky-400"
          >
            + YENİ HABER YAZ
          </Link>
        </div>
      </div>

      {/* 4 ANA BÖLÜM HIZLI YÖNETİM KARTLARI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Araçları Keşfet */}
        <div className="flex flex-col justify-between rounded-2xl border border-teal-200 bg-teal-50/50 p-5 shadow-sm transition hover:shadow">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🚗</span>
              <span className="text-xs font-black text-teal-800">{vehicles} Model</span>
            </div>
            <h2 className="text-base font-black text-neutral-900">Araçları Keşfet</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Teknik veriler, motor, menzil, batarya, fiyatlar ve galeri fotoğraflarını yönetin.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-teal-100 pt-3">
            <Link
              href="/admin/araclar/yeni"
              className="rounded-xl bg-teal-700 px-3.5 py-2 text-center text-xs font-black text-white transition hover:bg-teal-800"
            >
              + Yeni Araç Ekle
            </Link>
            <Link
              href="/admin/araclar"
              className="rounded-xl border border-teal-300 bg-white px-3.5 py-1.5 text-center text-xs font-bold text-teal-800 transition hover:bg-teal-100"
            >
              Araç Listesini Düzenle ({vehicles})
            </Link>
          </div>
        </div>

        {/* 2. 2.El İlanlar */}
        <div className="flex flex-col justify-between rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm transition hover:shadow">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📑</span>
              <span className="text-xs font-black text-blue-800">{listings} Yayında</span>
            </div>
            <h2 className="text-base font-black text-neutral-900">2.El İlan Yönetimi</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Üyelerden gelen ilanları onaylayın, reddedin, vitrine taşıyın veya silin.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-blue-100 pt-3">
            <Link
              href="/admin/ilanlar?durum=PENDING"
              className={`rounded-xl px-3.5 py-2 text-center text-xs font-black text-white transition ${
                pendingListings > 0 ? "bg-amber-600 hover:bg-amber-700 shadow" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Onay Bekleyenler ({pendingListings})
            </Link>
            <Link
              href="/admin/ilanlar"
              className="rounded-xl border border-blue-300 bg-white px-3.5 py-1.5 text-center text-xs font-bold text-blue-800 transition hover:bg-blue-100"
            >
              Tüm İlanları Yönet ({listings})
            </Link>
          </div>
        </div>

        {/* 3. Haberler & İçerik */}
        <div className="flex flex-col justify-between rounded-2xl border border-sky-200 bg-sky-50/50 p-5 shadow-sm transition hover:shadow">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📰</span>
              <span className="text-xs font-black text-sky-800">{articles} Yayında</span>
            </div>
            <h2 className="text-base font-black text-neutral-900">Haberler & İçerik</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Manşetler, kapak görselleri, zengin metin düzenleyici ile haber yayınlayın.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-sky-100 pt-3">
            <Link
              href="/admin/haberler/yeni"
              className="rounded-xl bg-sky-600 px-3.5 py-2 text-center text-xs font-black text-white transition hover:bg-sky-700"
            >
              + Yeni Haber Yaz
            </Link>
            <Link
              href="/admin/haberler"
              className="rounded-xl border border-sky-300 bg-white px-3.5 py-1.5 text-center text-xs font-bold text-sky-800 transition hover:bg-sky-100"
            >
              Haber Listesi & Taslaklar
            </Link>
          </div>
        </div>

        {/* 4. Şarj Ağları & Topluluk */}
        <div className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm transition hover:shadow">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">⚡</span>
              <span className="text-xs font-black text-neutral-700">{stations} İstasyon</span>
            </div>
            <h2 className="text-base font-black text-neutral-900">Şarj, Üye & Topluluk</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              İstasyonlar, şarj tarifeleri, topluluk gönderileri ve üyeleri yönetin.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 pt-3">
            <Link
              href="/admin/istasyonlar"
              className="rounded-xl bg-neutral-800 px-3.5 py-2 text-center text-xs font-black text-white transition hover:bg-neutral-900"
            >
              İstasyon & Tarifeler
            </Link>
            <Link
              href="/admin/topluluk"
              className="rounded-xl border border-neutral-300 bg-white px-3.5 py-1.5 text-center text-xs font-bold text-neutral-800 transition hover:bg-neutral-200"
            >
              Topluluk Moderasyonu
            </Link>
          </div>
        </div>
      </div>

      {/* SAYAÇ KARTLARI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_CARDS.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-4 transition hover:shadow-md"
          >
            <span className={`h-1.5 w-8 rounded-full ${c.color}`} />
            <span className="text-2xl font-black text-neutral-900">
              {c.value.toLocaleString("tr-TR")}
            </span>
            <span className="text-[11px] font-bold text-neutral-500">{c.label}</span>
          </Link>
        ))}
      </div>

      {/* ONAY BEKLEYEN İLANLAR (Varsa en üstte dikkat çeker) */}
      {recentPendingListings.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-amber-300 bg-amber-50/60 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <h2 className="text-sm font-black text-amber-900 uppercase">
                Onay Bekleyen 2. El İlanlar ({pendingListings})
              </h2>
            </div>
            <Link
              href="/admin/ilanlar?durum=PENDING"
              className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-black text-white hover:bg-amber-700"
            >
              Tümünü İncele & Onayla →
            </Link>
          </div>

          <div className="divide-y divide-amber-200/60">
            {recentPendingListings.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2.5">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-900">{l.title}</span>
                  <span className="text-xs text-neutral-500">
                    {l.brand} {l.model} · Satıcı: {l.sellerName} · {timeAgo(l.createdAt)}
                  </span>
                </div>
                <Link
                  href={`/admin/ilanlar/${l.id}`}
                  className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-black text-amber-800 hover:bg-amber-100"
                >
                  İncele / Onayla
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ALT DETAY PANELLERİ */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* En çok okunanlar */}
        <Panel title="EN ÇOK OKUNAN HABERLER" action={{ href: "/admin/haberler", label: "TÜMÜ" }}>
          <ol className="flex flex-col">
            {topArticles.map((a, i) => (
              <li key={a.id}>
                <Link
                  href={`/haber/${a.slug}`}
                  target="_blank"
                  className="flex items-start gap-3 border-b border-neutral-100 px-4 py-3 last:border-0 hover:bg-neutral-50"
                >
                  <span className="text-lg font-black text-sky-600/30">{i + 1}</span>
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
        <Panel title="KATEGORİ DAĞILIMI" action={{ href: "/admin/kategoriler", label: "YÖNET" }}>
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
                      backgroundColor: c.color || "#0284c7",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Son yorumlar */}
        <Panel title="SON YORUMLAR" action={{ href: "/admin/yorumlar", label: "TÜMÜ" }}>
          <ul className="flex flex-col">
            {recentComments.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-neutral-400">
                Henüz yorum yapılmadı.
              </li>
            )}
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
                <span className="truncate text-[10px] font-bold text-sky-600">
                  {c.article?.title}
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
                    style={{ backgroundColor: a.category?.color || "#0284c7" }}
                  >
                    {a.category?.name?.toUpperCase() || "HABER"}
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

        <Panel title="SON TALEPLER & İLETİŞİM" action={{ href: "/admin/talepler", label: "TÜMÜ" }}>
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
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <h2 className="text-[12px] font-black tracking-wide text-neutral-700">
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="text-[11px] font-bold text-neutral-400 hover:text-sky-600"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
