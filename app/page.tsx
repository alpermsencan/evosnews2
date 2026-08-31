import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/components/home/HeroCarousel";
import NewsCard from "@/components/news/NewsCard";
import MostRead from "@/components/news/MostRead";
import SectionTitle from "@/components/news/SectionTitle";
import CardRail from "@/components/ui/CardRail";
import VehicleCard from "@/components/vehicles/VehicleCard";
import PollWidget from "@/components/ui/PollWidget";
import NewsletterForm from "@/components/ui/NewsletterForm";
import {
  IconBolt,
  IconChevronRight,
  IconShield,
  IconSparkles,
  IconChart,
  IconCar,
  IconUsers,
  IconTag,
  IconLayers,
} from "@/components/ui/Icons";
import {
  getHeadlines,
  getLatest,
  getMostRead,
  getByCategory,
  getFeaturedVehicles,
  getCommunityPosts,
  getActivePoll,
  getPriceIndex,
} from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatTL, timeAgo } from "@/lib/utils";
import EvosIntelligence from "@/components/home/EvosIntelligence";
import EvosVoiceIntelligence from "@/components/home/EvosVoiceIntelligence";
import ListingCard from "@/components/listings/ListingCard";
import FeaturesTicker from "@/components/home/FeaturesTicker";

export const dynamic = "force-dynamic";

const SERVICES = [
  { label: "Araçları Keşfet", href: "/araclar", Icon: IconCar, color: "from-blue-600 to-sky-500" },
  { label: "Şarj Ağı", href: "/sarj-agi", Icon: IconBolt, color: "from-emerald-600 to-teal-400" },
  { label: "İlanlar", href: "/ilanlar", Icon: IconTag, color: "from-rose-600 to-pink-500" },
  { label: "AI Danışman", href: "/ai-danisman", Icon: IconSparkles, color: "from-indigo-600 to-purple-500" },
  { label: "Volt Score", href: "/evos-intelligence/volt-score", Icon: IconChart, color: "from-amber-500 to-orange-400" },
  { label: "Batarya Analizi", href: "/evos-intelligence/batarya-analizi", Icon: IconShield, color: "from-blue-800 to-indigo-600" },
  { label: "Fiyat Analizi", href: "/fiyat-analizi", Icon: IconLayers, color: "from-violet-600 to-fuchsia-500" },
  { label: "ÖTV Rehberi", href: "/otv-rehberi", Icon: IconTag, color: "from-teal-600 to-cyan-500" },
  { label: "Topluluk", href: "/topluluk", Icon: IconUsers, color: "from-orange-600 to-amber-500" },
];

export default async function HomePage() {
  const viewer = await getCurrentUser();

  const [
    headlines,
    latest,
    mostRead,
    charge,
    vehicles,
    community,
    poll,
    priceIndex,
    stations,
    tech,
    listings,
    editorArticles,
    authorArticles,
  ] = await Promise.all([
    getHeadlines(6),
    getLatest(16),
    getMostRead(8),
    getByCategory("sarj-agi", 4),
    getFeaturedVehicles(8),
    getCommunityPosts(5),
    getActivePoll(),
    getPriceIndex(),
    prisma.chargeStation.findMany({ take: 5, orderBy: { maxPowerKw: "desc" } }),
    getByCategory("teknoloji", 4),
    prisma.listing.findMany({
      take: 4,
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        brand: true,
        model: true,
        year: true,
        km: true,
        price: true,
        city: true,
        image: true,
        condition: true,
        sellerType: true,
        sellerName: true,
        damage: true,
        rangeKm: true,
        batteryHealth: true,
        isSponsored: true,
        voltScore: true,
        batteryReport: {
          select: {
            verifiedAt: true,
            sohPercent: true,
            riskLevel: true,
          }
        }
      }
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", author: { title: { contains: "Editör" } } },
      take: 4,
      orderBy: { publishedAt: "desc" },
      include: { author: true, category: true }
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", author: { title: { contains: "Yazar" } } },
      take: 4,
      orderBy: { publishedAt: "desc" },
      include: { author: true, category: true }
    })
  ]);

  const last = priceIndex[priceIndex.length - 1];
  const heroIds = new Set(headlines.map((h) => h.id));
  const feed = latest.filter((a) => !heroIds.has(a.id));

  return (
    <div className="flex flex-col gap-6 sm:gap-8 sm:pt-4">
      {/* MANŞET CAROUSEL */}
      <HeroCarousel
        slides={headlines.map((h) => ({
          id: h.id,
          title: h.title,
          slug: h.slug,
          spot: h.spot,
          image: h.image,
          isVideo: h.isVideo,
          isBreaking: h.isBreaking,
          publishedAt: h.publishedAt,
          category: h.category,
        }))}
      />

      {/* HİZMET ŞERİDİ */}
      <section className="px-3 sm:px-0">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#0B1E3F] text-white">
                <IconBolt className="h-4 w-4 text-sky-400" />
              </span>
              <h2 className="text-sm font-black tracking-wide text-neutral-800">
                EVOTOPILOT SERVİSLERİ
              </h2>
            </div>
            <Link
              href="/platform"
              className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-sky-600"
            >
              PLATFORM <IconChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 p-3 sm:grid-cols-5 lg:grid-cols-9">
            {SERVICES.map(({ label, href, Icon, color }) => (
              <Link
                key={href + label}
                href={href}
                className="group flex flex-col items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 text-center transition duration-300 hover:bg-sky-50/50 hover:border-sky-200 hover:shadow-sm"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow group-hover:scale-110 transition duration-300`}
                >
                  <Icon className="h-5.5 w-5.5" />
                </span>
                <span className="text-[11px] font-black text-neutral-800 mt-2.5 group-hover:text-sky-800 transition leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GÜNLÜK YAZILAR (Editörün Kaleminden & Yazarlardan) */}
      <section className="px-3 sm:px-0 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol: Editörün Kaleminden */}
        <div className="flex flex-col gap-3">
          <SectionTitle
            title="EDİTÖRÜN KALEMİNDEN"
            color="#0f172a"
            href="/kategori/haber-merkezi"
          />
          <div className="flex flex-col gap-5 bg-white border border-neutral-200 rounded-lg p-5 shadow-sm">
            {editorArticles.length > 0 && (
              (() => {
                const first = editorArticles[0];
                const rest = editorArticles.slice(1);
                return (
                  <>
                    {/* Featured Large Card */}
                    <Link href={`/haber/${first.slug}`} className="group flex flex-col gap-3 pb-4 border-b border-neutral-100">
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded bg-neutral-100">
                        <img src={first.image} alt={first.title} className="object-cover w-full h-full group-hover:scale-102 transition duration-300" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider">
                          {first.category?.name || "Editör İncelemesi"}
                        </span>
                        <h3 className="text-base font-black text-neutral-900 leading-snug group-hover:text-sky-600 transition">
                          {first.title}
                        </h3>
                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{first.spot}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-neutral-400">
                          <img src={first.author?.avatar || ""} alt="" className="h-4 w-4 rounded-full object-cover" />
                          <span className="truncate">{first.author?.name}</span>
                          <span>·</span>
                          <span className="shrink-0">{timeAgo(first.publishedAt)}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Smaller horizontal but larger-image list */}
                    <div className="flex flex-col gap-4">
                      {rest.map((a) => (
                        <Link key={a.id} href={`/haber/${a.slug}`} className="flex items-start gap-4 group border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded bg-neutral-100">
                            <img src={a.image} alt={a.title} className="object-cover w-full h-full group-hover:scale-102 transition duration-300" />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <h4 className="text-sm font-black text-neutral-900 group-hover:text-sky-600 transition leading-snug line-clamp-2">
                              {a.title}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-neutral-400">
                              <img src={a.author?.avatar || ""} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
                              <span className="truncate">{a.author?.name}</span>
                              <span>·</span>
                              <span className="shrink-0">{timeAgo(a.publishedAt)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>

        {/* Sağ: Yazarlardan */}
        <div className="flex flex-col gap-3">
          <SectionTitle
            title="YAZARLARDAN"
            color="#0f172a"
            href="/kategori/teknoloji"
          />
          <div className="flex flex-col gap-5 bg-white border border-neutral-200 rounded-lg p-5 shadow-sm">
            {authorArticles.length > 0 && (
              (() => {
                const first = authorArticles[0];
                const rest = authorArticles.slice(1);
                return (
                  <>
                    {/* Featured Large Card */}
                    <Link href={`/haber/${first.slug}`} className="group flex flex-col gap-3 pb-4 border-b border-neutral-100">
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded bg-neutral-100">
                        <img src={first.image} alt={first.title} className="object-cover w-full h-full group-hover:scale-102 transition duration-300" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider">
                          {first.category?.name || "Yazar İncelemesi"}
                        </span>
                        <h3 className="text-base font-black text-neutral-900 leading-snug group-hover:text-sky-600 transition">
                          {first.title}
                        </h3>
                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{first.spot}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-neutral-400">
                          <img src={first.author?.avatar || ""} alt="" className="h-4 w-4 rounded-full object-cover" />
                          <span className="truncate">{first.author?.name}</span>
                          <span>·</span>
                          <span className="shrink-0">{timeAgo(first.publishedAt)}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Smaller horizontal but larger-image list */}
                    <div className="flex flex-col gap-4">
                      {rest.map((a) => (
                        <Link key={a.id} href={`/haber/${a.slug}`} className="flex items-start gap-4 group border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded bg-neutral-100">
                            <img src={a.image} alt={a.title} className="object-cover w-full h-full group-hover:scale-102 transition duration-300" />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <h4 className="text-sm font-black text-neutral-900 group-hover:text-sky-600 transition leading-snug line-clamp-2">
                              {a.title}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-neutral-400">
                              <img src={a.author?.avatar || ""} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
                              <span className="truncate">{a.author?.name}</span>
                              <span>·</span>
                              <span className="shrink-0">{timeAgo(a.publishedAt)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>
      </section>

      {/* AKAN BANT (Site Servisleri & Özellikleri) */}
      <FeaturesTicker />

      {/* EVOS İLAN MERKEZİ (Öne Çıkan İlanlar) */}
      <section className="px-3 sm:px-0">
        <SectionTitle
          title="EVOS İLAN MERKEZİ"
          href="/ilanlar"
          color="#be123c"
          subtitle="Öne çıkan ve bataryası doğrulanmış ilanlar"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(listings.length > 0 ? listings : [
            {
              id: "mock1",
              title: "Sahibinden Temiz Togg T10X V2 Uzun Menzil",
              slug: "sahibinden-togg-t10x-v2-1",
              brand: "Togg",
              model: "T10X V2",
              year: 2024,
              km: 12500,
              price: 1650000,
              city: "Ankara",
              image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60",
              condition: "IKINCI_EL",
              sellerType: "Sahibinden",
              sellerName: "Ahmet Yılmaz",
              damage: "Boyasız / Hasarsız",
              rangeKm: 420,
              batteryHealth: 98,
              isSponsored: true,
              voltScore: 94,
              batteryReport: null
            },
            {
              id: "mock2",
              title: "Tesla Model Y RWD - Boyasız Hata Kaza Yoktur",
              slug: "tesla-model-y-rwd-boyasiz-hata-kaza-yoktur",
              brand: "Tesla",
              model: "Model Y RWD",
              year: 2023,
              km: 34000,
              price: 1980000,
              city: "İstanbul",
              image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=500&auto=format&fit=crop&q=60",
              condition: "IKINCI_EL",
              sellerType: "Galeri",
              sellerName: "Evos Motors",
              damage: "Hasarsız",
              rangeKm: 380,
              batteryHealth: 94,
              isSponsored: false,
              voltScore: 89,
              batteryReport: {
                verifiedAt: new Date().toISOString(),
                sohPercent: 94,
                riskLevel: "LOW"
              }
            },
            {
              id: "mock3",
              title: "MG4 Electric Luxury - İlk Sahibinden Sıkıntısız",
              slug: "mg4-electric-luxury-ilk-sahibinden-sikintisiz",
              brand: "MG",
              model: "MG4 Electric",
              year: 2023,
              km: 15400,
              price: 1240000,
              city: "İzmir",
              image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop&q=60",
              condition: "IKINCI_EL",
              sellerType: "Sahibinden",
              sellerName: "Eser Kaya",
              damage: "Hasarsız",
              rangeKm: 435,
              batteryHealth: 97,
              isSponsored: false,
              voltScore: 93,
              batteryReport: null
            },
            {
              id: "mock4",
              title: "Opel Corsa-e Ultimate - Sıfır Ayarında Garanti Kapsamında",
              slug: "opel-corsa-e-ultimate-sifir-ayarinda",
              brand: "Opel",
              model: "Corsa-e",
              year: 2023,
              km: 9800,
              price: 1120000,
              city: "Bursa",
              image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=60",
              condition: "IKINCI_EL",
              sellerType: "Sahibinden",
              sellerName: "Caner Şen",
              damage: "Lokal Boyalı",
              rangeKm: 350,
              batteryHealth: 96,
              isSponsored: false,
              voltScore: 91,
              batteryReport: null
            }
          ]).map((item: any) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      </section>

      {/* ANA İÇERİK + SAĞ SÜTUN */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {/* GÜNDEM */}
          <section className="px-3 sm:px-0">
            <SectionTitle
              title="GÜNDEM"
              href="/kategori/haber-merkezi"
              subtitle="Elektrikli mobilite dünyasından son gelişmeler"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {feed.slice(0, 2).map((a, i) => (
                <NewsCard key={a.id} article={a} variant="wide" priority={i === 0} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {feed.slice(2, 10).map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </section>



          {/* TEKNOLOJİ */}
          <section className="px-3 sm:px-0">
            <SectionTitle
              title="TEKNOLOJİ"
              href="/kategori/teknoloji"
              color="#9333ea"
              subtitle="Batarya, yazılım ve otonom sürüş"
            />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {tech.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </section>

          {/* TOPLULUK — üye içeriği yoksa bölüm hiç gösterilmez */}
          {community.length > 0 && (
          <section className="px-3 sm:px-0">
            <SectionTitle
              title="TOPLULUK"
              href="/topluluk"
              color="#c2410c"
              subtitle="Evos kullanıcılarının deneyimleri ve tartışmaları"
            />
            <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
              {community.map((p) => (
                <Link
                  key={p.id}
                  href="/topluluk"
                  className="group flex items-start gap-3 border-b border-neutral-100 p-4 transition last:border-0 hover:bg-neutral-50"
                >
                  {p.avatar && (
                    <Image
                      src={p.avatar}
                      alt={p.author}
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-black text-orange-700">
                        {p.topic.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-400">
                        {p.author} · {timeAgo(p.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-black leading-snug text-neutral-900 group-hover:text-evos">
                      {p.title}
                    </h3>
                    <p className="line-clamp-2 text-[13px] text-neutral-500">
                      {p.body}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-neutral-400">
                      <span>♥ {p.likes}</span>
                      <span>{p.replies} yanıt</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          )}
        </div>

        {/* SAĞ SÜTUN */}
        <aside className="flex w-full shrink-0 flex-col gap-5 px-3 sm:px-0 lg:w-[330px]">
          <MostRead articles={mostRead} />

          {last && (
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 bg-amber-600 px-4 py-3">
                <IconChart className="h-4 w-4 text-white" />
                <h3 className="text-sm font-black tracking-wide text-white">
                  EVOS FİYAT ENDEKSİ
                </h3>
              </div>
              {/* Yalnızca doğrulanmış kaynağı olan satırlar gösterilir;
                  operatör tarife girmediyse o satır hiç çıkmaz. */}
              <div className="flex flex-col divide-y divide-neutral-100">
                <Row label="Ortalama EV fiyatı" value={formatTL(last.avgEvPrice)} />
                <Row label="Ortalama menzil" value={`${last.avgRangeKm} km`} />
                <Row label="Katalogdaki model" value={`${last.modelCount}`} />
                {last.dcChargeCost != null && (
                  <Row label="DC şarj" value={`${last.dcChargeCost.toFixed(2)} ₺/kWh`} />
                )}
                {last.acChargeCost != null && (
                  <Row label="AC şarj" value={`${last.acChargeCost.toFixed(2)} ₺/kWh`} />
                )}
                {last.batteryUsd != null && (
                  <Row label="Batarya maliyeti" value={`${last.batteryUsd} $/kWh`} />
                )}
                {last.evShare != null && <Row label="EV pazar payı" value={`%${last.evShare}`} />}
              </div>
              <Link
                href="/fiyat-analizi"
                className="flex items-center justify-center gap-1 bg-neutral-50 py-3 text-xs font-bold text-neutral-600 hover:text-evos"
              >
                DETAYLI ANALİZ <IconChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {poll && (
            <PollWidget
              poll={{
                id: poll.id,
                question: poll.question,
                options: poll.options,
                votes: poll.votes,
              }}
            />
          )}

          <EvosVoiceIntelligence />

          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <NewsletterForm />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
            <IconShield className="h-7 w-7 text-blue-700" />
            <h3 className="text-base font-black leading-tight text-neutral-900">
              Evos Protect ile bataryanız 10 yıl güvende
            </h3>
            <p className="text-sm text-neutral-600">
              Kapasite %70&apos;in altına düşerse modül değişimi ücretsiz.
            </p>
            <Link
              href="/evos-protect"
              className="rounded-md bg-blue-700 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-blue-800"
            >
              PAKETLERİ İNCELE
            </Link>
          </div>
        </aside>
      </div>

      {/* SON HABERLER */}
      <section className="px-3 sm:px-0">
        <SectionTitle title="SON HABERLER" href="/kategori/haber-merkezi" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {latest.slice(0, 12).map((a) => (
            <NewsCard key={`son-${a.id}`} article={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-[12px] font-semibold text-neutral-500">{label}</span>
      <span className="text-[13px] font-black text-neutral-900">{value}</span>
    </div>
  );
}
