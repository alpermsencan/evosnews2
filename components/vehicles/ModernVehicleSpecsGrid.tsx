import React from "react";

type SpecsData = {
  // Güç ve Hız
  motorPowerHp: number;
  motorPowerKw: number;
  torqueNm?: number | null;
  topSpeed: number;
  acceleration: number;
  motorCount?: string | null;
  driveType: string;
  motorType?: string | null;

  // Batarya ve Şarj
  batteryKwh: number;
  batteryUsableKwh?: number | null;
  rangeKm: number;
  dcChargeKw?: number | null;
  acChargeKw?: number | null;
  chargeMin?: number | null;
  acChargeHour?: number | null;
  consumption: number;

  // Araç Ölçüleri
  weightKg?: number | null;
  lengthMm?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  trunkLiter?: number | null;

  // Ekstralar
  bodyType: string;
  year: number;
  originCountry?: string | null;
  heatPump?: string | null;
  v2l?: string | null;
  warranty?: string | null;
  segment: string;
  extraSpecs?: Record<string, Record<string, string>> | null;
};

export default function ModernVehicleSpecsGrid({ specs }: { specs: SpecsData }) {
  const gucHiz = [
    { label: "Motor Gücü", val: `${specs.motorPowerHp} HP (${specs.motorPowerKw} kW)` },
    { label: "Tork", val: specs.torqueNm ? `${specs.torqueNm} Nm` : "—" },
    { label: "Azami Hız", val: specs.topSpeed ? `${specs.topSpeed} km/s` : "—" },
    { label: "0-100 km/s", val: specs.acceleration ? `${specs.acceleration} s` : "—" },
    { label: "Motor Sayısı", val: specs.motorCount || (specs.driveType === "AWD" ? "Dual Motor" : "Tek Motor") },
    { label: "Sürüş Sistemi", val: specs.driveType || "RWD" },
    { label: "Motor Türü", val: specs.motorType || "Permanent Magnet Synchronous" },
  ];

  const bataryaSarj = [
    { label: "Batarya (Brüt)", val: `${specs.batteryKwh} kWh` },
    { label: "Kullanılabilir Net", val: specs.batteryUsableKwh ? `${specs.batteryUsableKwh} kWh` : `${Math.round(specs.batteryKwh * 0.95)} kWh` },
    { label: "Menzil (WLTP)", val: `${specs.rangeKm} km` },
    { label: "DC Şarj Hızı", val: specs.dcChargeKw ? `${specs.dcChargeKw} kW` : "—" },
    { label: "AC Şarj Hızı", val: specs.acChargeKw ? `${specs.acChargeKw} kW` : "11 kW" },
    { label: "DC Şarj Süresi", val: specs.chargeMin ? `${specs.chargeMin} dakika` : "—" },
    { label: "AC Şarj Süresi", val: specs.acChargeHour ? `${specs.acChargeHour} saat` : "—" },
    { label: "Ortalama Tüketim", val: `${specs.consumption} kWh / 100 km` },
  ];

  const olculer = [
    { label: "Ağırlık", val: specs.weightKg ? `${specs.weightKg} kg` : "—" },
    { label: "Uzunluk", val: specs.lengthMm ? `${specs.lengthMm} mm` : "—" },
    { label: "Genişlik", val: specs.widthMm ? `${specs.widthMm} mm` : "—" },
    { label: "Yükseklik", val: specs.heightMm ? `${specs.heightMm} mm` : "—" },
    { label: "Bagaj Hacmi", val: specs.trunkLiter ? `${specs.trunkLiter} litre` : "—" },
  ];

  const ekstralar = [
    { label: "Araç Türü / Kasa", val: specs.bodyType || "Sedan" },
    { label: "Çıkış / Model Yılı", val: `${specs.year}` },
    { label: "Segment", val: specs.segment || "—" },
    { label: "Üretim Yeri", val: specs.originCountry || "—" },
    { label: "Isı Pompası", val: specs.heatPump || "Var" },
    { label: "V2L Desteği", val: specs.v2l || "—" },
    { label: "Batarya Garantisi", val: specs.warranty || "8 yıl / 160.000 km" },
  ];

  const columns = [
    {
      title: "Güç ve Hız",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon: "⚡",
      items: gucHiz,
    },
    {
      title: "Batarya ve Şarj",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "🔋",
      items: bataryaSarj,
    },
    {
      title: "Araç Ölçüleri",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: "📐",
      items: olculer,
    },
    {
      title: "Ekstra Özellikler",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: "✨",
      items: ekstralar,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <h2 className="text-xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
          <span>⚙</span> TEKNİK ÖZELLİKLER &amp; DETAYLAR
        </h2>
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Resmi Fabrika Verileri
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-xs overflow-hidden"
          >
            {/* Sütun Başlığı */}
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-neutral-150 bg-neutral-50/80">
              <span className="text-base">{col.icon}</span>
              <h3 className="text-sm font-black text-neutral-900 tracking-wide">
                {col.title}
              </h3>
            </div>

            {/* Özellik Satırları */}
            <div className="flex flex-col divide-y divide-neutral-100 text-xs">
              {col.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50/60 transition"
                >
                  <span className="font-semibold text-neutral-500">{item.label}</span>
                  <span className="font-bold text-neutral-900 text-right max-w-[55%] truncate">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
