import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/market/ListingCard";
import SectionTitle from "@/components/news/SectionTitle";
import LeadForm from "@/components/ui/LeadForm";
import { formatTL, timeAgo } from "@/lib/utils";
import { IconBattery, IconCheck, IconMap } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const l = await prisma.listing.findUnique({ where: { slug } });
  if (!l) return { title: "İlan bulunamadı" };
  return { title: l.title, description: l.description };
}

export default async function ListingDetail({ params }: Props) {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({ where: { slug } });
  if (!listing) notFound();

  const [similar, sameBrandAvg] = await Promise.all([
    prisma.listing.findMany({
      where: { brand: listing.brand, NOT: { id: listing.id } },
      take: 4,
    }),
    prisma.listing.aggregate({
      where: { brand: listing.brand },
      _avg: { price: true },
    }),
  ]);

  const avg = Math.round(sameBrandAvg._avg.price ?? listing.price);
  const diff = Math.round(((listing.price - avg) / avg) * 100);

  const gallery = [listing.image, ...listing.images];

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <nav className="flex items-center gap-2 text-[11px] font-bold text-neutral-400">
        <Link href="/" className="hover:text-evos">ANASAYFA</Link>
        <span>›</span>
        <Link href="/marketplace" className="hover:text-evos">EVOS MARKET</Link>
        <span>›</span>
        <span className="text-neutral-600">{listing.brand.toUpperCase()}</span>
      </nav>

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="relative aspect-[4/3] w-full bg-neutral-100 sm:aspect-[16/10]">
              <Image
                src={listing.image}
                alt={listing.title}
                fill
                priority
                sizes="(max-width:1024px) 100vw, 700px"
                className="object-cover"
              />
              <span className="absolute left-3 top-3 flex items-center gap-1 rounded bg-white/90 px-2.5 py-1 text-[11px] font-black text-neutral-700 backdrop-blur">
                <IconBattery className="h-3.5 w-3.5 text-volt" />
                BATARYA SAĞLIĞI %{listing.batteryHealth}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 p-1">
              {gallery.slice(0, 4).map((g, i) => (
                <div key={g + i} className="relative aspect-[4/3] overflow-hidden rounded bg-neutral-100">
                  <Image src={g} alt={`${listing.title} ${i + 1}`} fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <section className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-base font-black text-neutral-900">
              İLAN AÇIKLAMASI
            </h2>
            <p className="text-sm leading-relaxed text-neutral-700">
              {listing.description}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Spec label="Model yılı" value={String(listing.year)} />
              <Spec label="Kilometre" value={`${listing.km.toLocaleString("tr-TR")} km`} />
              <Spec label="Menzil" value={`${listing.rangeKm} km`} />
              <Spec label="Renk" value={listing.color} />
              <Spec label="Hasar durumu" value={listing.damage} />
              <Spec label="Satıcı" value={listing.sellerType} />
              <Spec label="Şehir" value={listing.city} />
              <Spec label="İlan tarihi" value={timeAgo(listing.createdAt)} />
            </div>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-base font-black text-neutral-900">
              EVOS EKSPERTİZ ÖZETİ
            </h2>
            <ul className="flex flex-col gap-2">
              {[
                `Batarya kapasitesi ölçümü: %${listing.batteryHealth} (yetkili servis raporu)`,
                "Hücre dengesi normal aralıkta, termal yönetim kaydı temiz",
                "Şarj soketi ve kablo kontrolü yapıldı, aşınma tespit edilmedi",
                `Tramer sorgusu: ${listing.damage}`,
                "Yazılım sürümü güncel, hata kaydı bulunmuyor",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-neutral-700">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
                  {t}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[360px]">
          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
            <h1 className="text-xl font-black leading-tight text-neutral-900">
              {listing.title}
            </h1>
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <IconMap className="h-3.5 w-3.5" />
              {listing.city}
            </span>
            <span className="text-3xl font-black text-evos">
              {formatTL(listing.price)}
            </span>

            <div
              className={`rounded-md px-3 py-2 text-xs font-bold ${
                diff <= 0 ? "bg-volt/10 text-volt-dark" : "bg-amber-50 text-amber-700"
              }`}
            >
              {diff <= 0
                ? `Bu ilan ${listing.brand} ortalamasının %${Math.abs(diff)} altında.`
                : `Bu ilan ${listing.brand} ortalamasının %${diff} üzerinde.`}{" "}
              (Ort. {formatTL(avg, { compact: true })})
            </div>

            <div className="flex flex-col gap-1 rounded-md bg-neutral-50 p-3">
              <span className="text-[11px] font-bold text-neutral-500">SATICI</span>
              <span className="text-sm font-black text-neutral-900">
                {listing.sellerName}
              </span>
              <span className="text-[11px] text-neutral-500">{listing.sellerType}</span>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-black text-neutral-900">
              SATICIYA MESAJ GÖNDER
            </h3>
            <LeadForm topic={`ilan:${listing.slug}`} compact />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section>
          <SectionTitle title="BENZER İLANLAR" href="/marketplace" color="#be123c" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-md bg-neutral-50 px-3 py-2">
      <span className="text-[10px] font-bold text-neutral-400">{label}</span>
      <span className="text-[13px] font-black text-neutral-800">{value}</span>
    </div>
  );
}
