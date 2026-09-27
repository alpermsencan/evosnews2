"use client";

import React, { useState, useEffect, useRef } from "react";

interface VehicleImage {
  id: string;
  url: string;
  type: string;
  isPrimary: boolean;
  source: string;
}

interface VehicleImagesManagerProps {
  vehicleId: string;
}

export default function VehicleImagesManager({ vehicleId }: VehicleImagesManagerProps) {
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualType, setManualType] = useState("gallery");
  const [manualIsPrimary, setManualIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all images for this vehicle
  const fetchImages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/images`);
      const data = await res.json();
      if (res.ok && (data.images || data.success)) {
        setImages(data.images || []);
      } else {
        setError(data.error || data.message || "Görseller yüklenemedi.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ağ hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [vehicleId]);

  // Set an image as primary
  const handleSetPrimary = async (imageId: string) => {
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, isPrimary: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Ana görsel başarıyla güncellendi.");
        const selectedImg = images.find((img) => img.id === imageId);
        if (selectedImg?.url) {
          window.dispatchEvent(
            new CustomEvent("vehicle-image-changed", { detail: { url: selectedImg.url } })
          );
        }
        await fetchImages();
      } else {
        setError(data.error || data.message || "Birincil yapma işlemi başarısız.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    }
  };

  // Toggle active (ignored vs gallery/exterior)
  const handleToggleIgnore = async (img: VehicleImage) => {
    const newType = img.type === "ignored" ? "exterior" : "ignored";
    setError("");
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: img.id, type: newType }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchImages();
      } else {
        setError(data.error || data.message || "Güncelleme işlemi başarısız.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    }
  };

  // Delete image relation
  const handleDelete = async (imageId: string) => {
    if (!confirm("Bu görseli listeden silmek istediğinize emin misiniz?")) return;
    setError("");
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/images?imageId=${imageId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Görsel kaldırıldı.");
        await fetchImages();
      } else {
        setError(data.error || data.message || "Silme işlemi başarısız.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Silme işlemi başarısız.");
    }
  };

  // Add manual URL
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: manualUrl.trim(),
          type: manualType,
          isPrimary: manualIsPrimary || images.length === 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setManualUrl("");
        setManualIsPrimary(false);
        setSuccessMsg("Görsel başarıyla eklendi.");
        await fetchImages();
      } else {
        setError(data.error || data.message || "Görsel eklenemedi.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ağ hatası.");
    }
  };

  // Bilgisayardan çoklu dosya yükleme
  const handleFilesUpload = async (files: FileList | File[] | null) => {
    const fileList = Array.from(files || []).filter((f) => f.size > 0);
    if (fileList.length === 0) return;

    setUploading(true);
    setError("");
    setSuccessMsg("");
    setUploadProgress(`${fileList.length} dosya yükleniyor...`);

    try {
      const uploadedUrls: string[] = [];

      // Dosyaları /api/upload'a gönder
      const formData = new FormData();
      for (const f of fileList) {
        formData.append("files", f);
      }
      formData.append("folder", "evos/araclar");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || uploadData.message || "Dosya yüklenemedi.");
      }

      if (Array.isArray(uploadData.images) && uploadData.images.length > 0) {
        for (const item of uploadData.images) {
          if (item?.url) uploadedUrls.push(item.url);
        }
      } else if (uploadData.url) {
        uploadedUrls.push(uploadData.url);
      }

      if (uploadedUrls.length === 0) {
        throw new Error("Yüklenen görsel URL'i alınamadı.");
      }

      setUploadProgress("Veritabanına kaydediliyor...");

      // Araca bağla
      const linkRes = await fetch(`/api/vehicles/${vehicleId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: uploadedUrls,
          type: "exterior",
          isPrimary: images.length === 0, // İlk görselse otomatik ana görsel yap
        }),
      });

      const linkData = await linkRes.json();
      if (!linkRes.ok) {
        throw new Error(linkData.error || linkData.message || "Görseller araca bağlanamadı.");
      }

      setSuccessMsg(`${uploadedUrls.length} adet görsel başarıyla eklendi!`);
      if (images.length === 0 && uploadedUrls[0]) {
        window.dispatchEvent(
          new CustomEvent("vehicle-image-changed", { detail: { url: uploadedUrls[0] } })
        );
      }
      await fetchImages();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Yükleme sırasında hata oluştu.");
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm mt-6 flex flex-col gap-6">
      {/* Header */}
      <div className="border-b border-neutral-100 pb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-black text-neutral-900 tracking-wide flex items-center gap-2">
            <span>📷 Araç Görselleri & Galeri Yönetimi</span>
            <span className="rounded-full bg-neutral-100 text-neutral-700 text-xs px-2.5 py-0.5 font-bold">
              {images.length} Görsel
            </span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Bilgisayarınızdan dilediğiniz kadar fotoğraf seçip yükleyebilir, ana vitrin görselini tek tıkla belirleyebilirsiniz.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchImages}
          disabled={loading}
          className="text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 transition self-start"
        >
          {loading ? "Yenileniyor..." : "🔄 Görselleri Yenile"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-lg border border-red-200">
          <span>⚠ {error}</span>
          <button type="button" onClick={() => setError("")} className="hover:opacity-75">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 text-xs font-bold p-3.5 rounded-lg border border-emerald-200">
          <span>✓ {successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg("")} className="hover:opacity-75">✕</button>
        </div>
      )}

      {/* Manuel Bilgisayardan Çoklu Yükleme Bölümü (Drag & Drop) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFilesUpload(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition cursor-pointer text-center ${
          dragOver
            ? "border-emerald-500 bg-emerald-50/50"
            : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100/70 hover:border-neutral-400"
        }`}
        onClick={() => {
          if (!uploading && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFilesUpload(e.target.files)}
          disabled={uploading}
        />

        <div className="text-3xl mb-2">📁</div>

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent" />
            <span className="text-sm font-black text-neutral-800">{uploadProgress}</span>
            <span className="text-xs text-neutral-500">Lütfen bekleyin...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-black text-neutral-900">
              BİLGİSAYARINIZDAN GÖRSELLERİ SEÇİN VEYA BURAYA SÜRÜKLEYİN
            </span>
            <span className="text-xs text-neutral-500">
              Birden fazla görseli aynı anda seçip yükleyebilirsiniz (JPG, PNG, WEBP, AVIF)
            </span>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-neutral-800 transition"
            >
              <span>+ Dosya Seç (Çoklu)</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of Images */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 mb-3">
          Yüklü Görseller ({images.length})
        </h4>

        {loading ? (
          <div className="text-center text-xs text-neutral-500 py-12 animate-pulse">
            Görseller yükleniyor...
          </div>
        ) : images.length === 0 ? (
          <div className="text-center text-xs text-neutral-400 py-12 bg-neutral-50 border border-dashed rounded-xl">
            Bu araca ait henüz yüklenmiş bir görsel yok. Yukarıdaki alandan bilgisayarınızdan görsel yükleyebilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className={`group relative rounded-xl border overflow-hidden flex flex-col bg-white transition hover:shadow-md ${
                  img.isPrimary ? "border-amber-500 ring-2 ring-amber-500/20 shadow-sm" : "border-neutral-200"
                }`}
              >
                {/* Image Preview */}
                <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/arac-placeholder.svg";
                    }}
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {img.isPrimary && (
                      <span className="rounded bg-amber-500 text-white px-2 py-0.5 text-[10px] font-black uppercase shadow-sm">
                        ★ ANA KAPAK
                      </span>
                    )}
                    {img.type === "ignored" && (
                      <span className="rounded bg-neutral-600 text-white px-1.5 py-0.5 text-[9px] font-bold uppercase">
                        GİZLİ
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-2.5 border-t border-neutral-100 flex flex-col gap-1.5 mt-auto bg-neutral-50/50">
                  <div className="flex gap-1.5">
                    {/* Primary Toggle */}
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(img.id)}
                      disabled={img.isPrimary}
                      className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-md text-center transition ${
                        img.isPrimary
                          ? "bg-amber-100 text-amber-900 font-black cursor-default"
                          : "bg-white border border-neutral-300 text-neutral-700 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-800"
                      }`}
                    >
                      {img.isPrimary ? "★ ANA GÖRSEL" : "ANA YAP"}
                    </button>

                    {/* Ignore Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleIgnore(img)}
                      className={`py-1.5 px-2 text-[10px] font-bold uppercase rounded-md text-center border transition ${
                        img.type === "ignored"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100"
                      }`}
                      title={img.type === "ignored" ? "Yayına Al" : "Gizle"}
                    >
                      {img.type === "ignored" ? "AÇ" : "GİZLE"}
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    className="w-full py-1 text-[10px] font-bold uppercase rounded text-center text-red-600 hover:bg-red-50 transition"
                  >
                    Görseli Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manuel Dış URL Ekleme (İsteğe Bağlı) */}
      <div className="border-t border-neutral-100 pt-5">
        <details className="group">
          <summary className="cursor-pointer text-xs font-bold text-neutral-600 hover:text-neutral-900 select-none flex items-center gap-1.5">
            <span className="transition group-open:rotate-90">▸</span>
            <span>İsteğe bağlı: Web URL&apos;si Yapıştırarak Görsel Ekle</span>
          </summary>

          <form onSubmit={handleAddManual} className="mt-3 flex flex-col gap-2.5 max-w-xl bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <input
              type="url"
              placeholder="https://example.com/arac.jpg"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-neutral-900 bg-white text-neutral-800 w-full"
            />

            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-neutral-500">Görsel Türü:</span>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value)}
                  className="rounded border border-neutral-300 px-2 py-1 text-xs bg-white text-neutral-800"
                >
                  <option value="exterior">Dış Görünüm (Exterior)</option>
                  <option value="interior">İç Görünüm (Interior)</option>
                  <option value="gallery">Galeri</option>
                  <option value="ignored">Gizli</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualIsPrimary}
                  onChange={(e) => setManualIsPrimary(e.target.checked)}
                  className="rounded text-neutral-900 h-3.5 w-3.5"
                />
                <span className="text-[11px] font-bold text-neutral-700">Ana Görsel Yap</span>
              </label>

              <button
                type="submit"
                disabled={!manualUrl.trim()}
                className="bg-neutral-900 text-white font-bold text-xs py-1.5 px-4 rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
              >
                URL Ekle
              </button>
            </div>
          </form>
        </details>
      </div>
    </div>
  );
}
