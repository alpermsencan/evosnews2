"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ListingImageUpload from "./ListingImageUpload";

/**
 * İlan verme formu.
 *
 * VoltScore girdileri (garanti, servis geçmişi, şarj alışkanlığı, gerçek
 * menzil) İSTEĞE BAĞLIDIR ve boş bırakılabilir. Zorunlu tutmak, satıcıyı
 * bilmediği alanı tahminle doldurmaya iter — puanın tüm değeri o zaman
 * kaybolur. Boş bırakılan kriter puana hiç katılmaz, bunun yerine puanın
 * "veri kapsamı" düşer ve alıcı bunu görür.
 */

type VehicleOption = { id: string; label: string; rangeKm: number };

const inputClass =
  "w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-evos";
const labelClass = "text-[11px] font-black tracking-wide text-neutral-500";

export default function ListingForm({ vehicles }: { vehicles: VehicleOption[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState("");
  const [condition, setCondition] = useState("IKINCI_EL");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = Object.fromEntries(fd.entries());
    body.image = image || undefined;

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "İlan oluşturulamadı");

      router.push("/ilanlarim?yeni=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-black text-neutral-900">Araç bilgileri</legend>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="İLAN BAŞLIĞI" full>
            <input name="title" required maxLength={140} className={inputClass}
              placeholder="Tesla Model Y Long Range AWD — Isı pompalı" />
          </Field>

          <Field label="DURUM">
            <select
              name="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={inputClass}
            >
              <option value="IKINCI_EL">İkinci el</option>
              <option value="SIFIR">Sıfır</option>
            </select>
          </Field>

          <Field label="KATALOG MODELİ" help="Seçerseniz teknik veriler otomatik bağlanır">
            <select name="vehicleId" className={inputClass} defaultValue="">
              <option value="">Katalogda yok / seçmek istemiyorum</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </Field>

          <Field label="MARKA"><input name="brand" required className={inputClass} /></Field>
          <Field label="MODEL"><input name="model" required className={inputClass} /></Field>
          <Field label="MODEL YILI">
            <input name="year" type="number" required min={2010} max={new Date().getFullYear() + 1} className={inputClass} />
          </Field>
          <Field label="KİLOMETRE">
            <input name="km" type="number" min={0} className={inputClass} placeholder="0" />
          </Field>
          <Field label="FİYAT (₺)">
            <input name="price" type="number" required min={1} className={inputClass} />
          </Field>
          <Field label="ŞEHİR"><input name="city" required className={inputClass} /></Field>
          <Field label="RENK"><input name="color" className={inputClass} /></Field>
          <Field label="HASAR DURUMU">
            <select name="damage" className={inputClass} defaultValue="Hasarsız">
              <option>Hasarsız</option>
              <option>Boyalı</option>
              <option>Lokal boyalı</option>
              <option>Değişen var</option>
              <option>Ağır hasar kayıtlı</option>
            </select>
          </Field>
          <Field label="SATICI TİPİ">
            <select name="sellerType" className={inputClass} defaultValue="Sahibinden">
              <option>Sahibinden</option>
              <option>Galeri</option>
              <option>Yetkili Bayi</option>
            </select>
          </Field>
          <Field label="İLAN MENZİLİ (km)" help="Üreticinin ilan ettiği WLTP değeri">
            <input name="rangeKm" type="number" min={0} className={inputClass} />
          </Field>
        </div>

        <Field label="KAPAK GÖRSELİ" full>
          <ListingImageUpload value={image} onChange={setImage} />
        </Field>

        <Field label="AÇIKLAMA" full>
          <textarea name="description" rows={5} maxLength={4000} className={inputClass}
            placeholder="Aracın bakım geçmişi, kullanım şekli, öne çıkan donanımları…" />
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-black text-neutral-900">
          VoltScore bilgileri <span className="font-bold text-neutral-400">(isteğe bağlı)</span>
        </legend>

        <p className="rounded bg-neutral-50 p-3 text-[12px] leading-relaxed text-neutral-600">
          Bu alanlar aracın güven puanını hesaplar. <strong>Bilmediğinizi boş
          bırakın</strong> — tahmin yazmayın. Boş kalan kriter puana katılmaz,
          yalnızca puanın veri kapsamı düşer ve bu alıcıya açıkça gösterilir.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="BEYAN EDİLEN BATARYA SAĞLIĞI (%)"
            help="Ölçülmüş rapor eklendiğinde onun değeri geçerli olur">
            <input name="batteryHealth" type="number" min={1} max={100} className={inputClass} />
          </Field>
          <Field label="KALAN GARANTİ (ay)">
            <input name="warrantyMonthsLeft" type="number" min={0} max={120} className={inputClass} />
          </Field>
          <Field label="SERVİS GEÇMİŞİ">
            <select name="serviceHistory" className={inputClass} defaultValue="">
              <option value="">Belirtmek istemiyorum</option>
              <option value="TAM">Tam (tüm bakımlar yetkili serviste)</option>
              <option value="KISMI">Kısmi</option>
              <option value="YOK">Yok</option>
            </select>
          </Field>
          <Field label="DC HIZLI ŞARJ KULLANIMI">
            <select name="fastChargeHabit" className={inputClass} defaultValue="">
              <option value="">Belirtmek istemiyorum</option>
              <option value="DUSUK">Düşük (çoğunlukla AC / evde)</option>
              <option value="ORTA">Orta</option>
              <option value="YUKSEK">Yüksek (çoğunlukla DC)</option>
            </select>
          </Field>
          <Field label="GERÇEK MENZİL (km)" help="Karışık kullanımda aldığınız gerçek menzil">
            <input name="realRangeKm" type="number" min={0} className={inputClass} />
          </Field>
        </div>
      </fieldset>

      {error && (
        <p className="rounded-md bg-evos/10 px-4 py-3 text-sm font-bold text-evos">{error}</p>
      )}

      <label className="flex items-start gap-2.5 cursor-pointer select-none px-1">
        <input
          required
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-neutral-300 text-evos focus:ring-evos"
        />
        <span className="text-[12px] leading-tight text-neutral-500">
          <Link href="/yasal/ilan-verme-kurallari" target="_blank" className="font-bold text-neutral-600 hover:underline">
            İlan Yayınlama Kuralları
          </Link>
          'nı ve e-Devlet kimlik doğrulama/mevzuat sorumluluklarımı okudum, kabul ediyorum.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-evos px-6 py-3 text-sm font-black text-white transition hover:bg-evos-dark disabled:opacity-60"
        >
          {busy ? "GÖNDERİLİYOR…" : "İLANI GÖNDER"}
        </button>
        <span className="text-[12px] text-neutral-500">
          İlanınız moderasyondan geçtikten sonra yayına alınır.
        </span>
      </div>
    </form>
  );
}

function Field({
  label,
  help,
  full,
  children,
}: {
  label: string;
  help?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "sm:col-span-2" : ""}`}>
      <span className={labelClass}>{label}</span>
      {children}
      {help && <span className="text-[10px] text-neutral-400">{help}</span>}
    </label>
  );
}
