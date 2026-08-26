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

export const dynamic = "force-dynamic";

const SERVICES = [
  { label: "Araçları Keşfet", href: "/araclar", Icon: IconCar, color: "bg-evos" },
  { label: "Şarj Ağı", href: "/sarj-agi", Icon: IconBolt, color: "bg-volt" },
  { label: "AI Danışman", href: "/ai-danisman", Icon: IconSparkles, color: "bg-indigo-600" },
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
    community,
    poll,
    priceIndex,
    stations,
    tech,
    listings,
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
          {/* Sütun sayısı SERVICES uzunluğuyla hizalı: Evos Market kaldırılıp
              Voice Intelligence AI Danışman'la birleştiğinde şerit 8 öğeye
              düştü; 10 sütunluk grid sonda iki boş hücre bırakıyordu. */}
          <div className="no-scrollbar flex gap-3 overflow-x-auto p-3 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible lg:grid-cols-8">
            {SERVICES.map(({ label, href, Icon, color }, i) => (
              <Link
                key={href + label}
                href={href}
                style={{ animationDelay: `${i * 45}ms` }}
                className="evos-service flex w-[88px] shrink-0 flex-col items-center gap-2 rounded-lg p-1.5 text-center transition hover:bg-neutral-50 sm:w-auto"
              >
                <span
                  className={`evos-service-icon flex h-16 w-16 items-center justify-center rounded-2xl text-white ${color}`}
                >
                  <Icon className="h-8 w-8" />
                </span>
                <span className="text-[11px] font-bold leading-tight text-neutral-600">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EVOS INTELLIGENCE (Canlı Araç Verisi) */}
      <EvosIntelligence />

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

          {/* ARAÇLARI KEŞFET */}
          <section className="px-3 sm:px-0">
            <SectionTitle
              title="ARAÇLARI KEŞFET"
              href="/araclar"
              color="#0f766e"
              subtitle="Türkiye'de satışta olan öne çıkan elektrikli modeller"
            />
            <CardRail itemClass="w-[62%] sm:w-[38%] lg:w-[27%]" autoPlay={true}>
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
