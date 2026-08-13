"use client";

import { useMemo, useState } from "react";
import { formatTL } from "@/lib/utils";
import { calculateEnergy, calculateLoan, calculateTax, KDV_RATE } from "@/lib/finance";

/**
 * VERGİ + KREDİ + ENERJİ HESAPLAYICI
 *
 * Üç maliyet kalemi ayrı ayrı hesaplanıp tek ekranda toplanır. Şarj tarifeleri
 * VARSAYILAN DEĞİL: operatörlerin ilan ettiği fiyatların ortancası sunucudan
 * gelir (bkz. /sarj-fiyatlari). Tarife girilmemişse alan boş açılır ve
 * kullanıcı kendi fiyatını yazana kadar enerji bölümü hesaplanmaz.
 */

type Vehicle = {
  slug: string;
  label: string;
  price: number;
  otvRate: number;
  consumption: number;
};

const inputCls =
  "w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-evos";

export default function FinanceCalculator({
  vehicles,
  medianAcPrice,
  medianDcPrice,
}: {
  vehicles: Vehicle[];
  /** Ev/AC şarj tarifesi ortancası — yoksa null. */
  medianAcPrice: number | null;
  /** Halka açık DC tarifesi ortancası — yoksa null. */
  medianDcPrice: number | null;
}) {
  const [slug, setSlug] = useState(vehicles[0]?.slug ?? "");
  const vehicle = vehicles.find((v) => v.slug === slug) ?? vehicles[0];

  const [base, setBase] = useState<number>(() =>
    vehicle ? Math.round(vehicle.price / 1.5) : 0,
  );
  const [downPct, setDownPct] = useState(30);
  const [months, setMonths] = useState(36);
  const [monthlyRate, setMonthlyRate] = useState(3.5);
  const [annualKm, setAnnualKm] = useState(15000);
  const [homeShare, setHomeShare] = useState(70);
  const [homePrice, setHomePrice] = useState<number | "">(medianAcPrice ?? "");
  const [publicPrice, setPublicPrice] = useState<number | "">(medianDcPrice ?? "");

  function pickVehicle(next: string) {
    setSlug(next);
    const v = vehicles.find((x) => x.slug === next);
    // Matrahı etiket fiyatından geriye çözmek yerine kullanıcıya makul bir
    // başlangıç veriyoruz; gerçek matrah faturadan okunur.
    if (v) setBase(Math.round(v.price / 1.5));
  }

  const tax = useMemo(
    () => calculateTax({ base, otvRate: vehicle?.otvRate ?? 10 }),
    [base, vehicle],
  );

  const loan = useMemo(() => {
    const price = tax.total;
    const principal = price * (1 - downPct / 100);
    return { principal, ...calculateLoan({ principal, monthlyRate, months }) };
  }, [tax.total, downPct, monthlyRate, months]);

  const energy = useMemo(() => {
    if (!vehicle || homePrice === "" || publicPrice === "") return null;
    return calculateEnergy({
      annualKm,
      consumption: vehicle.consumption,
      homeSharePct: homeShare,
      homePrice: Number(homePrice),
      publicPrice: Number(publicPrice),
    });
  }, [vehicle, annualKm, homeShare, homePrice, publicPrice]);

  if (!vehicle) {
    return (
      <p className="rounded-lg bg-white p-8 text-center text-sm text-neutral-500">
        Hesaplama için katalogda araç bulunmuyor.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* GİRDİLER */}
      <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5">
        <Group title="Araç ve vergi">
          <L label="ARAÇ">
            <select value={slug} onChange={(e) => pickVehicle(e.target.value)} className={inputCls}>
              {vehicles.map((v) => (
                <option key={v.slug} value={v.slug}>{v.label}</option>
              ))}
            </select>
          </L>
          <L label="ÖTV MATRAHI (₺)" help="Vergisiz satış bedeli — faturadan okunur">
            <input type="number" value={base} min={0}
              onChange={(e) => setBase(Number(e.target.value))} className={inputCls} />
          </L>
          <Info label="ÖTV oranı" value={`%${vehicle.otvRate}`} />
          <Info label="KDV oranı" value={`%${KDV_RATE}`} />
        </Group>

        <Group title="Kredi">
          <L label={`PEŞİNAT (%${downPct})`}>
            <input type="range" min={0} max={90} step={5} value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))} className="w-full accent-evos" />
          </L>
          <L label="VADE (ay)">
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className={inputCls}>
              {[12, 24, 36, 48, 60].map((m) => <option key={m} value={m}>{m} ay</option>)}
            </select>
          </L>
          <L label="AYLIK FAİZ (%)" help="Bankanıza göre değişir; ilan edilen oranı girin">
            <input type="number" step="0.01" min={0} value={monthlyRate}
              onChange={(e) => setMonthlyRate(Number(e.target.value))} className={inputCls} />
          </L>
        </Group>

        <Group title="Enerji">
          <L label="YILLIK KİLOMETRE">
            <input type="number" min={0} step={1000} value={annualKm}
              onChange={(e) => setAnnualKm(Number(e.target.value))} className={inputCls} />
          </L>
          <L label={`EVDE ŞARJ ORANI (%${homeShare})`}>
            <input type="range" min={0} max={100} step={5} value={homeShare}
              onChange={(e) => setHomeShare(Number(e.target.value))} className="w-full accent-evos" />
          </L>
          <L label="EV / AC TARİFESİ (₺/kWh)"
            help={medianAcPrice ? "Operatör tarifelerinin ortancası" : "Tarife verisi yok — kendi fiyatınızı girin"}>
            <input type="number" step="0.01" min={0} value={homePrice}
              onChange={(e) => setHomePrice(e.target.value === "" ? "" : Number(e.target.value))}
              className={inputCls} />
          </L>
          <L label="HALKA AÇIK DC (₺/kWh)"
            help={medianDcPrice ? "Operatör tarifelerinin ortancası" : "Tarife verisi yok"}>
            <input type="number" step="0.01" min={0} value={publicPrice}
              onChange={(e) => setPublicPrice(e.target.value === "" ? "" : Number(e.target.value))}
              className={inputCls} />
          </L>
          <Info label="Tüketim" value={`${vehicle.consumption} kWh/100km`} />
        </Group>
      </div>

      {/* SONUÇ */}
      <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[380px]">
        <Panel title="VERGİ" tone="bg-violet-600">
          <Row label="Matrah" value={formatTL(Math.round(tax.base))} />
          <Row label={`ÖTV (%${vehicle.otvRate})`} value={formatTL(Math.round(tax.otv))} />
          <Row label={`KDV (%${KDV_RATE})`} value={formatTL(Math.round(tax.kdv))} />
          <Row label="Anahtar teslim" value={formatTL(Math.round(tax.total))} strong />
          <p className="pt-1 text-[11px] text-white/70">
            Ödediğiniz her 100 ₺&apos;nin {Math.round(tax.taxShare)} ₺&apos;si vergi.
            KDV, ÖTV dâhil tutardan alınır.
          </p>
        </Panel>

        <Panel title="KREDİ" tone="bg-evos-ink">
          <Row label="Peşinat" value={formatTL(Math.round(tax.total - loan.principal))} />
          <Row label="Kredi tutarı" value={formatTL(Math.round(loan.principal))} />
          <Row label="Aylık taksit" value={formatTL(Math.round(loan.installment))} strong />
          <Row label={`${months} ayda toplam`} value={formatTL(Math.round(loan.total))} />
          <Row label="Toplam faiz" value={formatTL(Math.round(loan.interest))} />
        </Panel>

        <Panel title="ENERJİ" tone="bg-volt-dark">
          {energy ? (
            <>
              <Row label="Yıllık tüketim" value={`${Math.round(energy.annualKwh).toLocaleString("tr-TR")} kWh`} />
              <Row label="Karışık tarife" value={`${energy.blendedPrice.toFixed(2)} ₺/kWh`} />
              <Row label="100 km maliyeti" value={formatTL(Math.round(energy.per100Km))} />
              <Row label="Aylık enerji" value={formatTL(Math.round(energy.monthlyCost))} strong />
              <Row label="Yıllık enerji" value={formatTL(Math.round(energy.annualCost))} />
            </>
          ) : (
            <p className="text-[12px] text-white/80">
              Enerji maliyeti için şarj tarifesi gerekiyor. Operatör tarifesi
              girilmediğinden alanlar boş — kendi ₺/kWh fiyatınızı yazın.
            </p>
          )}
        </Panel>

        {energy && (
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <span className="text-[11px] font-black tracking-wide text-neutral-500">
              AYLIK TOPLAM YÜK
            </span>
            <span className="block text-2xl font-black text-neutral-900">
              {formatTL(Math.round(loan.installment + energy.monthlyCost))}
            </span>
            <span className="text-[11px] text-neutral-400">
              Taksit + enerji. Sigorta, bakım ve MTV dâhil değildir.
            </span>
          </div>
        )}
      </aside>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-[13px] font-black text-neutral-900">{title}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function L({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-black tracking-wide text-neutral-500">{label}</span>
      {children}
      {help && <span className="text-[10px] text-neutral-400">{help}</span>}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-center rounded-md bg-neutral-50 px-3 py-2">
      <span className="text-[10px] font-semibold text-neutral-500">{label}</span>
      <span className="text-sm font-black text-neutral-900">{value}</span>
    </div>
  );
}

function Panel({ title, tone, children }: { title: string; tone: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 rounded-lg ${tone} p-5 text-white`}>
      <h3 className="text-[12px] font-black tracking-wide text-white/80">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-[12px] ${strong ? "font-bold text-white" : "text-white/75"}`}>
        {label}
      </span>
      <span className={strong ? "text-lg font-black" : "text-[13px] font-bold"}>{value}</span>
    </div>
  );
}
