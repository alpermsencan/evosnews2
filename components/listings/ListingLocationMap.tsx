"use client";

import { IconPin } from "@/components/ui/Icons";

type Props = {
  city: string;
  district?: string | null;
  neighborhood?: string | null;
};

export default function ListingLocationMap({
  city,
  district,
  neighborhood,
}: Props) {
  const parts = [neighborhood, district, city, "Türkiye"].filter(Boolean);
  const locationLabel = [district, city].filter(Boolean).join(", ");
  const query = parts.join(", ");
  const encodedQuery = encodeURIComponent(query);

  // Google Maps Evrensel Güvenli Embed & Yol Tarifi Bağlantısı
  const embedUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm ring-1 ring-black/5">
      {/* Başlık ve Lokasyon Bilgisi */}
      <div className="flex items-center justify-between border-b border-neutral-100 p-4 bg-neutral-50/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 shadow-2xs">
            <IconPin className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                Araç Konumu
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-sm font-black text-neutral-900 leading-tight">
              {locationLabel || "Türkiye"}
            </p>
          </div>
        </div>

        <span className="rounded-md bg-neutral-150 px-2 py-0.5 text-[10px] font-bold text-neutral-700">
          {city}
        </span>
      </div>

      {/* Harita Önizleme Çerçevesi */}
      <div className="relative aspect-[16/10] w-full bg-neutral-100 overflow-hidden border-b border-neutral-100">
        <iframe
          title="Araç Konumu Haritası"
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full grayscale-[15%] contrast-[105%]"
        />

        {/* Konum Kapsülü */}
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-neutral-950/85 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-md border border-white/20">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span>{locationLabel}</span>
          </div>
        </div>
      </div>

      {/* Buton ve Bilgilendirme */}
      <div className="p-3.5 flex flex-col gap-2">
        <a
          href={externalMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-neutral-900 hover:bg-black text-white px-4 py-2.5 text-xs font-black transition shadow-xs active:scale-[0.99]"
        >
          <IconPin className="h-3.5 w-3.5 text-red-400" />
          <span>Google Haritalar&apos;da Aç / Yol Tarifi</span>
          <span className="text-neutral-400 text-xs font-normal">↗</span>
        </a>
        <p className="text-[11px] text-neutral-400 text-center font-medium leading-relaxed">
          Güvenlik gerekçesiyle tam sokak/kapı no randevu onayında satıcı tarafından iletilir.
        </p>
      </div>
    </div>
  );
}
