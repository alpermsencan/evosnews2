"use client";

import { useMemo, useState } from "react";
import RouteButton from "./RouteButton";
import { formatKm, haversineKm } from "@/lib/geo";
import { IconBolt, IconMap } from "@/components/ui/Icons";

/**
 * KONUMA GÖRE EN YAKIN İSTASYONLAR
 *
 * Envanterde 400'ün üzerinde istasyon var; kullanıcı hangisinin yakın olduğunu
 * listeye bakarak anlayamıyordu. Burada tarayıcıdan konum izni alınır ve
 * istasyonlar mesafeye göre sıralanır.
 *
 * Sıralama TAMAMEN TARAYICIDA yapılır — konum sunucuya gönderilmez. Koordinat
 * yalnızca kullanıcı bir istasyon için "ROTA OLUŞTUR" derse, o istasyona giden
 * yolu çizmek üzere /api/route-to'ya gider.
 */

export type NearbyStation = {
  id: string;
  name: string;
  operator: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  socketCount: number;
  maxPowerKw: number | null;
  isFast: boolean;
  /** Doğrulanmış tarife — yoksa gösterilmez. */
  price: number | null;
};

type State =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "error"; message: string }
  | { status: "done"; lat: number; lng: number };

const SHOWN = 8;

export default function NearbyStations({
  stations,
}: {
  stations: NearbyStation[];
}) {
  const [state, setState] = useState<State>({ status: "idle" });

  const nearest = useMemo(() => {
    if (state.status !== "done") return [];
    return stations
      // Koordinatı olmayan kayıt (0,0) Gine Körfezi'ne düşer ve listeyi
      // kirletir; mesafe hesabına hiç girmez.
      .filter((s) => s.lat !== 0 || s.lng !== 0)
      .map((s) => ({ ...s, km: haversineKm(state.lat, state.lng, s.lat, s.lng) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, SHOWN);
  }, [stations, state]);

  async function locate() {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", message: "Tarayıcınız konum servisini desteklemiyor" });
      return;
    }

    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: "done",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) =>
        setState({
          status: "error",
          message:
            err.code === err.PERMISSION_DENIED
              ? "Konum izni verilmedi. Tarayıcı adres çubuğundaki konum simgesinden izin verebilirsiniz."
              : "Konum alınamadı. Lütfen tekrar deneyin.",
        }),
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 },
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-volt text-white">
            <IconMap className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-black tracking-wide text-neutral-800">
            YAKINIMDAKİ İSTASYONLAR
          </h2>
        </div>

        <button
          type="button"
          onClick={locate}
          disabled={state.status === "locating"}
          className="rounded-md bg-volt px-4 py-2 text-[12px] font-black text-white transition hover:bg-volt-dark disabled:opacity-60"
        >
          {state.status === "locating"
            ? "KONUM ALINIYOR…"
            : state.status === "done"
              ? "KONUMU YENİLE"
              : "KONUMUMA GÖRE SIRALA"}
        </button>
      </div>

      {state.status === "idle" && (
        <p className="px-4 py-5 text-[13px] leading-relaxed text-neutral-500">
          Konumunuza izin verin; {stations.length.toLocaleString("tr-TR")} istasyon
          arasından size en yakın olanları mesafe, güç ve tarifesiyle sıralayalım.
          Konumunuz tarayıcınızdan çıkmaz — sıralama cihazınızda yapılır.
        </p>
      )}

      {state.status === "error" && (
        <p className="px-4 py-5 text-[13px] font-semibold text-evos">{state.message}</p>
      )}

      {state.status === "done" && (
        <ul className="flex flex-col divide-y divide-neutral-100">
          {nearest.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[14px] font-black text-neutral-900">
                    {s.name}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {s.city} / {s.district} · {s.operator} · {s.socketCount} soket
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="rounded bg-volt/10 px-2 py-1 text-[12px] font-black text-volt-dark">
                    {formatKm(s.km)}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-neutral-500">
                    <IconBolt className="h-3 w-3" />
                    {s.maxPowerKw != null ? `${s.maxPowerKw} kW` : "—"}
                    {s.price != null && ` · ${s.price.toFixed(2)} ₺`}
                  </span>
                </div>
              </div>

              <RouteButton
                name={s.name}
                lat={s.lat}
                lng={s.lng}
                city={s.city}
                district={s.district}
              />
            </li>
          ))}

          {nearest.length === 0 && (
            <li className="px-4 py-5 text-[13px] text-neutral-500">
              Koordinatı bilinen istasyon bulunamadı.
            </li>
          )}
        </ul>
      )}

      {state.status === "done" && nearest.length > 0 && (
        <p className="border-t border-neutral-100 px-4 py-2.5 text-[11px] text-neutral-400">
          Mesafeler kuş uçuşudur; &quot;Rota oluştur&quot; gerçek sürüş mesafesini
          ve süresini hesaplar.
        </p>
      )}
    </section>
  );
}
