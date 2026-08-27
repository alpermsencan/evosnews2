import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import SectionTitle from "@/components/news/SectionTitle";
import { calcOtv, formatDate, formatTL } from "@/lib/utils";
import { IconCheck, IconClose } from "@/components/ui/Icons";

// Kök layout oturumu sunucuda okuduğu için bu sayfa zaten istek başına
// render edilir; buradaki değer yalnızca layout ileride statikleşirse devreye
// girer. Verinin tazeliğini lib/cache.ts'teki etiketler ve TTL belirler —
// ikisi aynı kısa pencerede tutulur ki sayfa hiçbir koşulda eskimesin.
export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = await prisma.vehicle.findUnique({ where: { slug } });
  if (!v) return { title: "Araç bulunamadı" };
  return {
    title: `${v.brand} ${v.model} · Teknik Özellikler ve Fiyat`,
    description: v.description,
  };
}

export default async function VehicleDetail({ params }: Props) {
  const { slug } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { slug } });
  if (!vehicle) notFound();

  const [similar, stations] = await Promise.all([
    prisma.vehicle.findMany({
      where: { segment: vehicle.segment, NOT: { id: vehicle.id } },
      take: 4,
      orderBy: { price: "asc" },
    }),
    // Aracın DC şarj gücü bilinmiyorsa "uyumlu istasyon" eşiği kurulamaz;
    // bu durumda en güçlü istasyonlar gösterilir.
    prisma.chargeStation.findMany({
      where: vehicle.dcChargeKw != null ? { maxPowerKw: { gte: vehicle.dcChargeKw } } : {},
      take: 4,
      orderBy: { maxPowerKw: "desc" },
    }),
  ]);

  // ÖTV kırılımı (etiket fiyatından geriye doğru tahmini matrah)
  const rate = vehicle.otvRate;
  const base = Math.round(vehicle.price / (1.2 * (1 + rate / 100)));
  const breakdown = calcOtv(base, vehicle.motorPowerKw);

  const yearlyKm = 20000;
  // Karışık şarj tarifesi ~4,9 ₺/kWh, benzinli eşdeğeri 100 km'de ~400 ₺
  const energyCost = Math.round((yearlyKm / 100) * vehicle.consumption * 4.9);
  const iceCost = Math.round((yearlyKm / 100) * 400);

  // Kaynağı olmayan teknik alanlar boş kalabilir; uydurma değer yerine "—".
  const spec = (value: string | number | null | undefined, unit = "") =>
    value == null || value === "" ? "—" : `${value}${unit}`;

  const SPECS: [string, string][] = [
    ["Segment", vehicle.segment],
    ["Kasa tipi", vehicle.bodyType],
    ["Model yılı", String(vehicle.year)],
    ["Menzil (WLTP)", `${vehicle.rangeKm} km`],
    // Gerçek mevsimsel menzil yalnızca ÖLÇÜLDÜYSE doldurulur; ölçüm yoksa
    // "—" görünür. WLTP'den katsayıyla türetmek uydurma veri üretmek olurdu.
    ["Gerçek yaz menzili", spec(vehicle.rangeSummerKm, " km")],
    ["Gerçek kış menzili", spec(vehicle.rangeWinterKm, " km")],
    ["Batarya kapasitesi", `${vehicle.batteryKwh} kWh`],
    ["Motor gücü", `${vehicle.motorPowerKw} kW / ${vehicle.motorPowerHp} HP`],
    ["0-100 km/s", `${vehicle.acceleration} sn`],
    ["Azami hız", `${vehicle.topSpeed} km/s`],
    ["DC şarj gücü", spec(vehicle.dcChargeKw, " kW")],
    ["%10-80 şarj", spec(vehicle.chargeMin, " dakika")],
    ["Tüketim", `${vehicle.consumption} kWh/100 km`],
    ["Bagaj hacmi", spec(vehicle.trunkLiter, " litre")],
    ["Çekiş", vehicle.driveType],
    ["Batarya garantisi", spec(vehicle.warranty)],
    ["ÖTV oranı", `%${vehicle.otvRate}`],
  ];

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <nav className="flex items-center gap-2 text-[11px] font-bold text-neutral-400">
        <Link href="/" className="hover:text-evos">ANASAYFA</Link>
        <span>›</span>
        <Link href="/araclar" className="hover:text-evos">ARAÇLARI KEŞFET</Link>
        <span>›</span>
        <span className="text-neutral-600">{vehicle.brand.toUpperCase()}</span>
      </nav>

      <div className="flex flex-col gap-5 overflow-hidden rounded-lg border border-neutral-200 bg-white lg:flex-row">
        <div className="relative w-full shrink-0 bg-neutral-100 lg:w-[52%] flex flex-col justify-between">
          <VehicleGallery
            defaultImage={vehicle.image}
            images={vehicle.images}
            alt={`${vehicle.brand} ${vehicle.model}`}
          />
          <span className="absolute left-3 top-3 rounded bg-evos-ink/85 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur z-10">
            {vehicle.segment} · {vehicle.year}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Editör puanı yalnızca gerçek bir inceleme yapıldıysa vardır. */}
            {vehicle.rating != null && (
              <span className="rounded bg-volt px-2 py-1 text-[11px] font-black text-white">
                ★ {vehicle.rating.toFixed(1)} / 5
              </span>
            )}
            <span className="rounded bg-neutral-100 px-2 py-1 text-[11px] font-bold text-neutral-600">
              {vehicle.driveType}
            </span>
          </div>

          <h1 className="text-2xl font-black leading-tight text-neutral-900 sm:text-4xl">
            {vehicle.brand}{" "}
            <span className="font-bold text-neutral-600">{vehicle.model}</span>
          </h1>

          {vehicle.description && (
            <p className="text-sm leading-relaxed text-neutral-600">
              {vehicle.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KeySpec label="MENZİL (WLTP)" value={`${vehicle.rangeKm}`} unit="km" />
            <KeySpec label="BATARYA" value={`${vehicle.batteryKwh}`} unit="kWh" />
            {vehicle.dcChargeKw != null ? (
              <KeySpec label="DC ŞARJ" value={`${vehicle.dcChargeKw}`} unit="kW" />
            ) : (
              <KeySpec label="MOTOR" value={`${vehicle.motorPowerHp}`} unit="HP" />
            )}
            <KeySpec label="0-100" value={`${vehicle.acceleration}`} unit="sn" />
          </div>

          <div className="mt-1 flex flex-col gap-2 rounded-lg bg-neutral-50 p-4">
            <span className="text-[11px] font-bold text-neutral-500">
              ANAHTAR TESLİM FİYAT
            </span>
            <span className="text-3xl font-black text-evos">
              {formatTL(vehicle.price)}
            </span>
            <span className="text-[11px] text-neutral-500">
              Tahmini matrah {formatTL(breakdown.base)} · ÖTV %{breakdown.rate} ·
              KDV %20
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/otv-rehberi"
              className="flex-1 rounded-md bg-evos px-4 py-3 text-center text-sm font-black text-white transition hover:bg-evos-dark"
            >
              ÖTV HESAPLA
            </Link>
            <Link
              href="/ai-danisman"
              className="flex-1 rounded-md border border-neutral-300 px-4 py-3 text-center text-sm font-bold text-neutral-700 transition hover:border-evos hover:text-evos"
            >
              AI DANIŞMANA SOR
            </Link>
          </div>
        </div>
      </div>

      {/* TEKNİK ÖZELLİKLER + ARTI/EKSİ */}
      <div className="flex flex-col gap-5 lg:flex-row">
        <section className="min-w-0 flex-1">
          <SectionTitle title="TEKNİK ÖZELLİKLER" color="#0f766e" />
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
                {SPECS.map(([k, v]) => (
                  <tr key={k}>
                    <td className="w-1/2 px-4 py-2.5 font-semibold text-neutral-500">
                      {k}
                    </td>
                    <td className="px-4 py-2.5 text-right font-black text-neutral-900">
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Veri izlenebilirliği: okuyucu rakamın nereden geldiğini görsün. */}
          {vehicle.priceSource && (
            <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
              Fiyat kaynağı: {vehicle.priceSource}
              {vehicle.priceUpdatedAt && ` · ${formatDate(vehicle.priceUpdatedAt)} tarihinde doğrulandı`}
              . Fiyatlar sık değişir; kesin bilgi için yetkili satıcıya danışın.
              {vehicle.rangeSource
                ? ` Mevsimsel menzil kaynağı: ${vehicle.rangeSource}.`
                : " Gerçek yaz/kış menzili için doğrulanmış ölçüm henüz girilmedi."}
            </p>
          )}
        </section>

        <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[380px]">
          {/* Artı/eksi listesi editör değerlendirmesidir; girilmediyse gösterilmez. */}
          {(vehicle.pros.length > 0 || vehicle.cons.length > 0) && (
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              {vehicle.pros.length > 0 && (
                <>
                  <div className="bg-volt px-4 py-3 text-sm font-black text-white">
                    ARTILARI
                  </div>
                  <ul className="flex flex-col gap-2 p-4">
                    {vehicle.pros.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-neutral-700">
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-volt" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {vehicle.cons.length > 0 && (
                <>
                  <div className="bg-evos px-4 py-3 text-sm font-black text-white">
                    EKSİLERİ
                  </div>
                  <ul className="flex flex-col gap-2 p-4">
                    {vehicle.cons.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-neutral-700">
                        <IconClose className="mt-0.5 h-4 w-4 shrink-0 text-evos" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="bg-amber-600 px-4 py-3 text-sm font-black text-white">
              YILLIK MALİYET (20.000 KM)
            </div>
            <div className="flex flex-col divide-y divide-neutral-100">
              <CostRow label="Elektrik maliyeti" value={formatTL(energyCost)} />
              <CostRow label="Benzinli eşdeğeri" value={formatTL(iceCost)} />
              <CostRow
                label="Yıllık tasarruf"
                value={formatTL(Math.max(0, iceCost - energyCost))}
                highlight
              />
              <CostRow
                label="Enerji / 100 km"
                value={`${(vehicle.consumption * 4.9).toFixed(0)} ₺`}
              />
            </div>
          </div>
        </aside>
      </div>

      {stations.length > 0 && (
        <section>
          <SectionTitle
            title="BU ARACI DESTEKLEYEN HIZLI ŞARJ NOKTALARI"
            href="/sarj-agi"
            color="#15803d"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stations.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-4"
              >
                <span className="text-sm font-black text-neutral-900">{s.name}</span>
                <span className="text-xs text-neutral-500">
                  {s.city} · {s.operator}
                </span>
                <span className="mt-1 w-fit rounded bg-volt/10 px-2 py-1 text-[11px] font-black text-volt-dark">
                  {s.maxPowerKw != null ? `${s.maxPowerKw} kW` : "Güç bilinmiyor"}
                  {s.pricePerKwh != null && ` · ${s.pricePerKwh.toFixed(2)} ₺/kWh`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section>
          <SectionTitle title="BENZER ARAÇLAR" href="/araclar" color="#0f766e" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {similar.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function KeySpec({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-neutral-200 py-2.5">
      <span className="text-[10px] font-bold text-neutral-400">{label}</span>
      <span className="text-lg font-black text-neutral-900">{value}</span>
      <span className="text-[10px] font-semibold text-neutral-400">{unit}</span>
    </div>
  );
}

function CostRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-[12px] font-semibold text-neutral-500">{label}</span>
      <span
        className={`text-[13px] font-black ${highlight ? "text-volt-dark" : "text-neutral-900"}`}
      >
        {value}
      </span>
    </div>
  );
}
