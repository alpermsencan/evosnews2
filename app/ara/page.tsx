import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { searchArticles } from "@/lib/queries";
import NewsCard from "@/components/news/NewsCard";
import VehicleCard from "@/components/vehicles/VehicleCard";
import SectionTitle from "@/components/news/SectionTitle";

export const dynamic = "force-dynamic";
export const metadata = { title: "Arama" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const [articles, vehicles, stations] = query
    ? await Promise.all([
        searchArticles(query),
        prisma.vehicle.findMany({
          where: {
            OR: [
              { brand: { contains: query, mode: "insensitive" } },
              { model: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 8,
          include: { syncImages: true },
        }),
        prisma.chargeStation.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
              { operator: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 6,
        }),
      ])
    : [[], [], []];

  const totalCount =
    articles.length + vehicles.length + stations.length;

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-1 rounded-lg bg-white p-5 sm:border sm:border-neutral-200">
        <span className="text-xs font-bold text-neutral-400">ARAMA SONUÇLARI</span>
        <h1 className="text-2xl font-black text-neutral-900 sm:text-3xl">
          &ldquo;{query}&rdquo;
        </h1>
        <span className="text-sm text-neutral-500">
          Toplam {totalCount} sonuç bulundu
        </span>
      </header>

      {!query && (
        <p className="rounded-lg bg-white p-8 text-center text-sm text-neutral-500">
          Aramak istediğiniz kelimeyi üstteki arama kutusuna yazın.
        </p>
      )}

      {query && totalCount === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">
            Aramanızla eşleşen içerik bulunamadı.
          </p>
          <Link
            href="/"
            className="rounded-md bg-evos px-5 py-2.5 text-sm font-bold text-white"
          >
            Anasayfaya dön
          </Link>
        </div>
      )}

      {articles.length > 0 && (
        <section>
          <SectionTitle title={`HABERLER (${articles.length})`} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {articles.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      {vehicles.length > 0 && (
        <section>
          <SectionTitle title={`ARAÇLAR (${vehicles.length})`} color="#0f766e" href="/araclar" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>
      )}

      {stations.length > 0 && (
        <section>
          <SectionTitle title={`ŞARJ İSTASYONLARI (${stations.length})`} color="#15803d" href="/sarj-agi" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stations.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-4"
              >
                <span className="text-sm font-black text-neutral-900">{s.name}</span>
                <span className="text-xs text-neutral-500">
                  {s.city} / {s.district} · {s.operator}
                </span>
                <span className="mt-1 w-fit rounded bg-volt/10 px-2 py-1 text-[11px] font-black text-volt-dark">
                  {s.maxPowerKw} kW · {s.socketCount} soket
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
