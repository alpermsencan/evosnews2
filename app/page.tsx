import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/components/home/HeroCarousel";
import NewsCard from "@/components/news/NewsCard";
import MostRead from "@/components/news/MostRead";
import SectionTitle from "@/components/news/SectionTitle";
import CardRail from "@/components/ui/CardRail";
import VehicleCard from "@/components/vehicles/VehicleCard";
import ListingCard from "@/components/market/ListingCard";
import PollWidget from "@/components/ui/PollWidget";
import NewsletterForm from "@/components/ui/NewsletterForm";
import {
  IconBolt,
  IconChevronRight,
  IconMic,
  IconShield,
  IconSparkles,
  IconStore,
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
  getListings,
  getCommunityPosts,
  getActivePoll,
  getPriceIndex,
} from "@/lib/queries";
import ReelRail from "@/components/social/ReelRail";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getFeed, type FeedPost } from "@/lib/social";
import type { SocialPost } from "@/components/social/types";
import { formatTL, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SERVICES = [
  { label: "Araçları Keşfet", href: "/araclar", Icon: IconCar, color: "bg-evos" },
  { label: "Şarj Ağı", href: "/sarj-agi", Icon: IconBolt, color: "bg-volt" },
  { label: "AI Danışman", href: "/ai-danisman", Icon: IconSparkles, color: "bg-indigo-600" },
  { label: "Voice Intelligence", href: "/voice-intelligence", Icon: IconMic, color: "bg-cyan-600" },
  { label: "Evos Market", href: "/marketplace", Icon: IconStore, color: "bg-rose-600" },
  { label: "Evos Protect", href: "/evos-protect", Icon: IconShield, color: "bg-blue-700" },
  { label: "ÖTV Rehberi", href: "/otv-rehberi", Icon: IconTag, color: "bg-violet-600" },
  { label: "Fiyat Analizi", href: "/fiyat-analizi", Icon: IconChart, color: "bg-amber-600" },
  { label: "Dijital Garaj", href: "/dijital-garaj", Icon: IconLayers, color: "bg-sky-700" },
  { label: "Topluluk", href: "/topluluk", Icon: IconUsers, color: "bg-orange-600" },
];

export default async function HomePage() {
  const viewer = await getCurrentUser();

  const [
    headlines,
    latest,
    mostRead,
    charge,
    vehicles,
    listings,
    community,
    poll,
    priceIndex,
    stations,
    market,
    tech,
    reels,
  ] = await Promise.all([
    getHeadlines(6),
    getLatest(16),
    getMostRead(8),
    getByCategory("sarj-agi", 4),
    getFeaturedVehicles(8),
    getListings(8),
    getCommunityPosts(5),
    getActivePoll(),
    getPriceIndex(),
    prisma.chargeStation.findMany({ take: 5, orderBy: { maxPowerKw: "desc" } }),
    getByCategory("marketplace", 3),
    getByCategory("teknoloji", 4),
    getFeed({
      viewerId: viewer?.id ?? null,
      scope: "explore",
      kind: "reel",
      limit: 10,
    }),
  ]);

  const reelCards = reels.map((r: FeedPost) => r as unknown as SocialPost);
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
              <span className="flex h-6 w-6 items-center justify-center rounded bg-evos text-white">
                <IconBolt className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-black tracking-wide text-neutral-800">
                EVOS SERVİSLERİ
              </h2>
            </div>
            <Link
              href="/platform"
              className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-evos"
            >
              PLATFORM <IconChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto p-3 sm:grid sm:grid-cols-5 sm:overflow-visible lg:grid-cols-10">
            {SERVICES.map(({ label, href, Icon, color }) => (
              <Link
                key={href + label}
                href={href}
                className="flex w-[76px] shrink-0 flex-col items-center gap-2 rounded-lg p-1.5 text-center transition hover:bg-neutral-50 sm:w-auto"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${color}`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-[10px] font-bold leading-tight text-neutral-600">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TOPLULUK REELS ŞERİDİ */}
      {reelCards.length > 0 && (
        <section className="px-3 sm:px-0">
          <ReelRail
            reels={reelCards}
            title="TOPLULUKTAN REELS"
          />
        </section>
      )}

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

          {/* ARAÇLARI KEŞFET */}
          <section className="px-3 sm:px-0">
            <SectionTitle
              title="ARAÇLARI KEŞFET"
              href="/araclar"
              color="#0f766e"
              subtitle="Türkiye'de satışta olan öne çıkan elektrikli modeller"
            />
            <CardRail itemClass="w-[62%] sm:w-[38%] lg:w-[27%]">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </CardRail>
          </section>

          {/* ŞARJ AĞI */}
          <section className="px-3 sm:px-0">
            <SectionTitle
              title="ŞARJ AĞI"
              href="/sarj-agi"
              color="#15803d"
              subtitle="Evos Charge Network ve operatör haberleri"
            />
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
                {charge.map((a) => (
                  <NewsCard key={a.id} article={a} variant="row" />
                ))}
              </div>
              <aside className="w-full shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white lg:w-[300px]">
                <div className="bg-volt px-4 py-3 text-sm font-black text-white">
                  EN GÜÇLÜ İSTASYONLAR
                </div>
                <ul className="flex flex-col">
                  {stations.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-2 border-b border-neutral-100 px-4 py-3 last:border-0"
                    >
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[13px] font-bold text-neutral-800">
                          {s.name}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {s.city} · {s.operator}
                        </span>
                      </div>
                      <span className="shrink-0 rounded bg-volt/10 px-2 py-1 text-[11px] font-black text-volt-dark">
                        {s.maxPowerKw} kW
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sarj-agi"
                  className="flex items-center justify-center gap-1 bg-neutral-50 py-3 text-xs font-bold text-neutral-600 hover:text-evos"
                >
                  TÜM İSTASYONLAR <IconChevronRight className="h-3 w-3" />
                </Link>
              </aside>
            </div>
          </section>

          {/* EVOS MARKET */}
          <section className="px-3 sm:px-0">
            <SectionTitle
              title="EVOS MARKET"
              href="/marketplace"
              color="#be123c"
              subtitle="İkinci el elektrikli araç ilanları ve batarya raporlu fırsatlar"
            />
            <CardRail itemClass="w-[62%] sm:w-[38%] lg:w-[24%]">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </CardRail>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {market.map((a) => (
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

          {/* TOPLULUK */}
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
              <div className="flex flex-col divide-y divide-neutral-100">
                <Row label="Ortalama EV fiyatı" value={formatTL(last.avgEvPrice)} />
                <Row label="DC şarj" value={`${last.dcChargeCost.toFixed(2)} ₺/kWh`} />
                <Row label="AC şarj" value={`${last.acChargeCost.toFixed(2)} ₺/kWh`} />
                <Row label="Benzin (100 km)" value={`${last.fuelCost.toFixed(0)} ₺`} />
                <Row label="Batarya maliyeti" value={`${last.batteryUsd} $/kWh`} />
                <Row label="EV pazar payı" value={`%${last.evShare}`} />
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

          <div className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white">
            <IconSparkles className="h-7 w-7" />
            <h3 className="text-lg font-black leading-tight">
              Hangi elektrikli araç size uygun?
            </h3>
            <p className="text-sm text-white/80">
              Bütçenizi, günlük kilometrenizi ve şarj imkânınızı girin; AI
              Danışman 220+ varyant arasından 30 saniyede öneri çıkarsın.
            </p>
            <Link
              href="/ai-danisman"
              className="mt-1 rounded-md bg-white px-4 py-2.5 text-center text-sm font-black text-indigo-700 transition hover:bg-white/90"
            >
              AI DANIŞMANI DENE
            </Link>
          </div>

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
