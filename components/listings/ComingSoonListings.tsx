"use client";

import Link from "next/link";
import {
  IconBolt,
  IconCar,
  IconShield,
  IconBattery,
  IconCheck,
  IconMap,
} from "@/components/ui/Icons";

export default function ComingSoonListings() {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-16 px-4">
      <div className="w-full max-w-3xl flex flex-col items-center text-center">
        {/* Üst Rozet */}
        <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-sky-400 shadow-sm mb-6">
          <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
          <span>YAYINA HAZIRLANIYOR</span>
        </div>

        {/* Ana Başlık */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-950 uppercase leading-tight sm:leading-none">
          2. El Elektrikli Araçlar
          <span className="block text-sky-600 mt-1 sm:mt-2">
            Çok Yakında Yayında!
          </span>
        </h1>

        {/* Açıklama Metni */}
        <p className="mt-4 sm:mt-5 text-sm sm:text-base text-neutral-600 font-medium max-w-2xl leading-relaxed">
          Türkiye&apos;nin doğrulanmış batarya sağlığı (SoH) raporlu, 13 parçalı interaktif ekspertiz
          şemalı ve güvenli satıcı altyapısına sahip yeni nesil elektrikli araç pazaryeri son kontrolleriyle
          birlikte yayına hazırlanmaktadır.
        </p>

        {/* Özellik Vurgu Kartları (4 Sütun Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mt-8 sm:mt-10 text-left">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-neutral-300">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <IconBattery className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-neutral-900">
                  Batarya Sağlık Sertifikası
                </h2>
                <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                  Her araçta gerçek SoH yüzdesi ve döngü analizi
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-neutral-300">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <IconShield className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-neutral-900">
                  13 Parça Ekspertiz Şeması
                </h2>
                <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                  Boya, değişen ve parça durumlarında şeffaf görünüm
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-neutral-300">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <IconCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-neutral-900">
                  Doğrulanmış Satıcı Ağı
                </h2>
                <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                  Güvenilir kurumsal galeriler ve onaylı bireysel satıcılar
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-neutral-300">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <IconBolt className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-neutral-900">
                  Şeffaf Piyasa Değerlemesi
                </h2>
                <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                  Gerçek piyasa satış rakamları ve fiyat endeksi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8 sm:mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 hover:bg-black px-6 py-3 text-xs sm:text-sm font-black text-white transition shadow-sm active:scale-95"
          >
            <span>Anasayfaya Dön</span>
          </Link>
          <Link
            href="/araclar"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 px-6 py-3 text-xs sm:text-sm font-black text-neutral-900 transition shadow-2xs active:scale-95"
          >
            <IconCar className="h-4 w-4" />
            <span>Sıfır Araçları Keşfet</span>
          </Link>
          <Link
            href="/sarj-agi"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 px-6 py-3 text-xs sm:text-sm font-black text-neutral-900 transition shadow-2xs active:scale-95"
          >
            <IconMap className="h-4 w-4 text-emerald-600" />
            <span>Şarj İstasyonları Haritası</span>
          </Link>
        </div>

        {/* Yönetici Girişi Alt Bilgi */}
        <div className="mt-12 pt-6 border-t border-neutral-200 text-center">
          <p className="text-xs text-neutral-400 font-medium">
            Platform yöneticisi misiniz?{" "}
            <Link
              href="/admin/giris?devam=/ilanlar"
              className="font-bold text-neutral-700 hover:text-sky-600 underline transition"
            >
              Yönetici Girişi Yaparak Görüntüleyin →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
