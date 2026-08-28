"use client";

import { useState, useEffect, useCallback } from "react";
import { IconBolt, IconCar, IconCheck, IconClose } from "@/components/ui/Icons";

export type SyncLog = {
  id: string;
  source: string;
  brand: string;
  status: string;
  triggerType: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  fetched: number;
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  failed: number;
  imagesFound: number;
  imagesUploaded: number;
  imagesUpdated: number;
  imagesUnchanged: number;
  imagesSkipped: number;
  imageErrors: number;
  errorMessage: string | null;
};

export type PriceHistoryItem = {
  id: string;
  vehicleBrand: string;
  vehicleModel: string;
  variantName: string;
  listPrice: number;
  previousPrice: number | null;
  priceDiff: number;
  campaignPrice: number | null;
  previousCampaignPrice: number | null;
  campaignDiff: number | null;
  source: string;
  sourceUrl: string;
  recordedAt: string;
};

export type BrandStatus = {
  brand: string;
  source: string;
  variantCount: number;
  imageCount: number;
  lastSync: {
    status: string;
    triggerType: string;
    startedAt: string;
    completedAt: string | null;
    durationMs: number | null;
    fetched: number;
    created: number;
    updated: number;
    unchanged: number;
    imagesFound: number;
    imagesUploaded: number;
    imagesUnchanged: number;
    imageErrors: number;
    errorMessage: string | null;
  } | null;
};

export type DashboardData = {
  summary: {
    totalBrands: number;
    activeBrands: number;
    totalVehicles: number;
    totalVariants: number;
    totalImages: number;
    totalCloudinaryImages: number;
    lastSuccessfulSync: string | null;
    lastErrorSync: {
      source: string;
      errorMessage: string | null;
      startedAt: string;
    } | null;
    todaySyncsCount: number;
  };
  brandStatuses: BrandStatus[];
  priceHistories: PriceHistoryItem[];
  syncLogs: SyncLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("tr-TR").format(amount) + " ₺";
}

function timeAgo(dateString: string | null | undefined): string {
  if (!dateString) return "Henüz çalışmadı";
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSec < 60) return `${diffSec} sn önce`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} sa önce`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} gün önce`;
}

export default function VehicleSyncDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [syncingBrand, setSyncingBrand] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/vehicle-sync?page=${pageNum}&limit=20`);
      if (!res.ok) throw new Error("Veri yüklenemedi");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setToastMessage({ type: "error", text: "Dashboard verileri alınırken hata oluştu." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  // 45 saniyede bir otomatik hafif arka plan tazeleme
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(page);
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchData, page]);

  const handleManualSync = async (brandKey: string) => {
    setSyncingBrand(brandKey);
    setToastMessage(null);

    try {
      const res = await fetch("/api/admin/vehicle-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: brandKey }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Senkronizasyon başarısız");
      }

      setToastMessage({
        type: "success",
        text: `${brandKey.toUpperCase()} senkronizasyonu tamamlandı: ${resData.result?.unchanged ?? 0} güncel, ${resData.result?.updated ?? 0} yeni fiyat, ${resData.result?.imagesUnchanged ?? 0} görsel doğrulandı.`,
      });

      // Tabloyu tazele
      await fetchData(page);
    } catch (err) {
      setToastMessage({
        type: "error",
        text: `${brandKey.toUpperCase()} senkronizasyon hatası: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setSyncingBrand(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`flex items-center justify-between rounded-lg p-4 text-sm font-semibold transition ${
            toastMessage.type === "success"
              ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border border-red-300 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <IconCheck className="h-5 w-5 text-emerald-600" />
            ) : (
              <IconClose className="h-5 w-5 text-red-600" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="rounded p-1 text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black text-neutral-900">
            Araç Senkronizasyon & Fiyat Değişikliği Monitörü
          </h2>
          <p className="text-xs text-neutral-500">
            Kia, Hyundai, Togg, BYD ve Tesla resmi üretici portallarından otomatik fiyat, teknik özellik ve görsel senkronizasyonu.
          </p>
        </div>
        <button
          onClick={() => fetchData(page)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start rounded-md bg-white border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
        >
          <span className={loading ? "animate-spin" : ""}>🔄</span>
          <span>{loading ? "Yenileniyor..." : "Yenile"}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Aktif Markalar
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900">
              {data?.summary.activeBrands ?? 5}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">/ 5 Resmi Kaynak</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Kia · Hyundai · Togg · BYD · Tesla</p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Toplam Variant
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900">
              {data?.summary.totalVariants ?? "—"}
            </span>
            <span className="text-xs text-neutral-500">paket</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            {data?.summary.totalVehicles ?? "—"} temel modelde
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Cloudinary Görsel
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900">
              {data?.summary.totalCloudinaryImages ?? "—"}
            </span>
            <span className="text-xs text-emerald-600 font-bold">Aktif CDN</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            {data?.summary.totalImages ?? "—"} toplam kayıt
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Son Başarılı Sync
          </span>
          <div className="mt-1">
            <span className="text-sm font-black text-neutral-800">
              {timeAgo(data?.summary.lastSuccessfulSync)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">
            {data?.summary.lastSuccessfulSync
              ? new Date(data.summary.lastSuccessfulSync).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Sistem Sağlığı
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-black text-emerald-700">Tümü Aktif</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Daily Cron: 07:00 TRT</p>
        </div>
      </div>

      {/* Error Alert Panel (If Any) */}
      {data?.summary.lastErrorSync && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <div className="flex items-center gap-2 font-black text-sm">
            <span>⚠ Son Senkronizasyon Uyarısı:</span>
            <span className="uppercase font-mono">{data.summary.lastErrorSync.source}</span>
            <span className="text-xs font-normal text-amber-700">
              ({timeAgo(data.summary.lastErrorSync.startedAt)})
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-800">
            {data.summary.lastErrorSync.errorMessage || "Ayrıntı belirtilmedi."}
          </p>
        </div>
      )}

      {/* Brand Status & Actions */}
      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-neutral-800 mb-4">
          Resmi Marka Senkronizasyon Durumları
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {(data?.brandStatuses || [
            { brand: "Kia", source: "kia-official", variantCount: 12, imageCount: 89, lastSync: null },
            { brand: "Hyundai", source: "hyundai-official", variantCount: 12, imageCount: 89, lastSync: null },
            { brand: "Togg", source: "togg-official", variantCount: 8, imageCount: 55, lastSync: null },
            { brand: "BYD", source: "byd-official", variantCount: 4, imageCount: 151, lastSync: null },
            { brand: "Tesla", source: "tesla-official", variantCount: 1, imageCount: 0, lastSync: null },
          ]).map((b) => {
            const isSyncing = syncingBrand === b.brand.toLowerCase();
            const last = b.lastSync;

            return (
              <div
                key={b.brand}
                className="flex flex-col justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition hover:border-neutral-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconCar className="h-5 w-5 text-evos" />
                      <span className="text-base font-black text-neutral-900">{b.brand}</span>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                        last?.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-800"
                          : last?.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {last?.status ?? "HAZIR"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded bg-white p-2 border border-neutral-200">
                      <span className="text-[10px] font-bold text-neutral-400 block">VARYANT</span>
                      <span className="text-sm font-black text-neutral-800">{b.variantCount} Paket</span>
                    </div>
                    <div className="rounded bg-white p-2 border border-neutral-200">
                      <span className="text-[10px] font-bold text-neutral-400 block">GÖRSEL</span>
                      <span className="text-sm font-black text-neutral-800">{b.imageCount} Cloudinary</span>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-neutral-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Son Çalışma:</span>
                      <span className="font-bold text-neutral-700">{timeAgo(last?.startedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tetikleme:</span>
                      <span className="font-bold text-neutral-700">{last?.triggerType ?? "CRON / MANUAL"}</span>
                    </div>
                    {last?.durationMs != null && (
                      <div className="flex justify-between">
                        <span>Süre:</span>
                        <span className="font-bold text-neutral-700">{(last.durationMs / 1000).toFixed(1)} sn</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200">
                  <button
                    onClick={() => handleManualSync(b.brand.toLowerCase())}
                    disabled={isSyncing || syncingBrand !== null}
                    className="w-full rounded-md bg-evos px-3 py-2 text-xs font-bold text-white transition hover:bg-evos-dark disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Senkronize Ediliyor...</span>
                      </>
                    ) : (
                      <>
                        <IconBolt className="h-3.5 w-3.5" />
                        <span>{b.brand.toUpperCase()} SYNC ET</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Price History Changes & Visual Asset Monitor */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Price History Table */}
        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
              Son Fiyat Değişiklikleri
            </h3>
            <span className="text-xs font-semibold text-neutral-400">Canlı Değişim Takibi</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-neutral-100">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-black tracking-wider text-neutral-500 uppercase">
                <tr>
                  <th className="px-3 py-2.5">ARAÇ / PAKET</th>
                  <th className="px-3 py-2.5">GÜNCEL FİYAT</th>
                  <th className="px-3 py-2.5">ÖNCEKİ</th>
                  <th className="px-3 py-2.5">FARK</th>
                  <th className="px-3 py-2.5 text-right">TARİH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data?.priceHistories && data.priceHistories.length > 0 ? (
                  data.priceHistories.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-3 py-2.5 font-bold text-neutral-800">
                        <div>{item.vehicleBrand} {item.vehicleModel}</div>
                        <div className="text-[10px] text-neutral-400 font-normal">{item.variantName}</div>
                      </td>
                      <td className="px-3 py-2.5 font-black text-neutral-900">
                        {formatPrice(item.listPrice)}
                        {item.campaignPrice && (
                          <div className="text-[10px] text-emerald-600 font-bold">
                            Kampanya: {formatPrice(item.campaignPrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-neutral-500">
                        {formatPrice(item.previousPrice)}
                      </td>
                      <td className="px-3 py-2.5 font-bold">
                        {item.priceDiff > 0 ? (
                          <span className="text-red-600">+{formatPrice(item.priceDiff)}</span>
                        ) : item.priceDiff < 0 ? (
                          <span className="text-emerald-600">{formatPrice(item.priceDiff)}</span>
                        ) : (
                          <span className="text-neutral-400">0 ₺</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right text-neutral-400 text-[11px]">
                        {timeAgo(item.recordedAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-neutral-400">
                      Henüz kayıtlı bir fiyat değişikliği bulunmuyor. Senkronizasyon motoru fiyat değişimlerini otomatik yakalar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Görsel Senkronizasyon & Cloudinary Durumu */}
        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
              Görsel Senkronizasyon & CDN Durumu
            </h3>
            <span className="text-xs font-semibold text-emerald-600">Cloudinary Aktif</span>
          </div>

          <div className="space-y-4">
            {(data?.brandStatuses || []).map((b) => {
              const last = b.lastSync;
              const found = last?.imagesFound ?? b.imageCount;
              const uploaded = last?.imagesUploaded ?? 0;
              const unchanged = last?.imagesUnchanged ?? b.imageCount;
              const errors = last?.imageErrors ?? 0;

              return (
                <div key={b.brand} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm text-neutral-800">{b.brand} Resmi Görselleri</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {unchanged + uploaded} / {found} Senkron
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="rounded bg-white p-2 border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 block font-bold">BULUNAN</span>
                      <span className="font-black text-neutral-800">{found}</span>
                    </div>
                    <div className="rounded bg-white p-2 border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 block font-bold">YÜKLENEN</span>
                      <span className="font-black text-neutral-800">{uploaded}</span>
                    </div>
                    <div className="rounded bg-white p-2 border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 block font-bold">DEĞİŞMEYEN</span>
                      <span className="font-black text-neutral-800">{unchanged}</span>
                    </div>
                    <div className="rounded bg-white p-2 border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 block font-bold">HATA</span>
                      <span className={`font-black ${errors > 0 ? "text-red-600 font-black" : "text-neutral-800"}`}>
                        {errors}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sync Geçmişi Tablosu */}
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
              Senkronizasyon Geçmişi ({data?.pagination.total ?? 0})
            </h3>
            <p className="text-xs text-neutral-400">
              Otomatik günlük cron ve manuel tetiklemelerin ayrıntılı log kayıtları.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-neutral-100">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-black tracking-wider text-neutral-500 uppercase">
              <tr>
                <th className="px-3 py-2.5">TARİH</th>
                <th className="px-3 py-2.5">MARKA</th>
                <th className="px-3 py-2.5">TETİK</th>
                <th className="px-3 py-2.5">DURUM</th>
                <th className="px-3 py-2.5">VARYANTLAR (Ç/O/G/A)</th>
                <th className="px-3 py-2.5">GÖRSELLER (B/Y/D/H)</th>
                <th className="px-3 py-2.5">SÜRE</th>
                <th className="px-3 py-2.5">NOT / HATA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data?.syncLogs && data.syncLogs.length > 0 ? (
                data.syncLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="px-3 py-2.5 text-neutral-600 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.startedAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-neutral-900">{log.brand}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                          log.triggerType === "CRON"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {log.triggerType}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-neutral-700 font-mono text-[11px]">
                      {log.fetched} / +{log.created} / ~{log.updated} / ={log.unchanged}
                    </td>
                    <td className="px-3 py-2.5 text-neutral-700 font-mono text-[11px]">
                      {log.imagesFound} / +{log.imagesUploaded} / ={log.imagesUnchanged} / !{log.imageErrors}
                    </td>
                    <td className="px-3 py-2.5 text-neutral-500 font-mono text-[11px]">
                      {log.durationMs ? (log.durationMs / 1000).toFixed(1) + " s" : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-neutral-500 text-[11px] max-w-[200px] truncate">
                      {log.errorMessage ? (
                        <span className="text-red-600 font-medium">{log.errorMessage}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-neutral-400">
                    Henüz senkronizasyon kaydı bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <span className="text-xs text-neutral-500">
              Sayfa {data.pagination.page} / {data.pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                Önceki
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page >= data.pagination.totalPages}
                className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
