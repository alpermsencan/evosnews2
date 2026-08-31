"use client";

import React, { useState, useEffect } from "react";

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
  const [manualUrl, setManualUrl] = useState("");
  const [manualType, setManualType] = useState("gallery");
  const [manualIsPrimary, setManualIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch all images for this vehicle
  const fetchImages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/images`);
      const data = await res.json();
      if (res.ok && data.success) {
        setImages(data.images || []);
      } else {
        setError(data.message || "Görseller yüklenemedi.");
      }
    } catch (err: any) {
      setError(err.message || "Ağ hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [vehicleId]);

  // Set an image as primary
  const handleSetPrimary = async (imageId: string) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, isPrimary: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchImages();
      } else {
        alert(data.message || "Birincil yapma işlemi başarısız.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Toggle active (ignored vs gallery/exterior)
  const handleToggleIgnore = async (img: VehicleImage) => {
    const newType = img.type === "ignored" ? "exterior" : "ignored";
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: img.id, type: newType }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchImages();
      } else {
        alert(data.message || "Güncelleme işlemi başarısız.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete image relation
  const handleDelete = async (imageId: string) => {
    if (!confirm("Bu görsel ilişkisini silmek istediğinize emin misiniz? Fiziksel dosya silinmeyecektir.")) return;
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/images?imageId=${imageId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchImages();
      } else {
        alert(data.message || "Silme işlemi başarısız.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add manual URL
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;

    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: manualUrl.trim(),
          type: manualType,
          isPrimary: manualIsPrimary,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setManualUrl("");
        setManualIsPrimary(false);
        fetchImages();
      } else {
        alert(data.message || "Görsel eklenemedi.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // File Upload to Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("folder", "evos/araclar");

      // 1. Upload to /api/upload
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || "Görsel yüklenemedi.");
      }

      const uploadedUrl = uploadData.url;
      const cloudinaryPublicId = uploadData.images?.[0]?.public_id || "";

      // 2. Link to vehicle in database
      const linkRes = await fetch(`/api/vehicles/${vehicleId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: uploadedUrl,
          cloudinaryPublicId,
          type: "exterior",
          isPrimary: images.length === 0, // make primary if first image
        }),
      });
      const linkData = await linkRes.json();

      if (linkRes.ok && linkData.success) {
        fetchImages();
      } else {
        throw new Error(linkData.message || "Görsel araca bağlanamadı.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      // Reset file input value
      e.target.value = "";
    }
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm mt-6 flex flex-col gap-6">
      
      {/* Header */}
      <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
        <h3 className="text-base font-black text-neutral-800 uppercase tracking-wide">
          📸 Araç Görsellerini Yönet ({images.length})
        </h3>
        <button
          onClick={fetchImages}
          className="text-xs font-black text-teal-700 hover:underline uppercase"
        >
          Tazele
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-150">
          {error}
        </div>
      )}

      {/* Grid of Images */}
      {loading ? (
        <div className="text-center text-xs text-neutral-500 py-8 animate-pulse">
          Görseller yükleniyor...
        </div>
      ) : images.length === 0 ? (
        <div className="text-center text-xs text-neutral-400 py-8 bg-neutral-50 border border-dashed rounded-lg">
          Bu araca bağlı hiç görsel bulunmuyor.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={`group relative rounded-lg border overflow-hidden flex flex-col bg-white transition hover:shadow ${
                img.isPrimary ? "border-amber-500 shadow-sm" : "border-neutral-200"
              }`}
            >
              {/* Image Preview */}
              <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
                <img
                  src={img.url}
                  alt=""
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/arac-placeholder.svg";
                  }}
                />
                
                {/* Badges Overlay */}
                <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                  {img.isPrimary && (
                    <span className="rounded bg-amber-500 text-white px-1 py-0.5 text-[9px] font-black uppercase">
                      ★ ANA
                    </span>
                  )}
                  {img.type === "ignored" && (
                    <span className="rounded bg-neutral-500 text-white px-1 py-0.5 text-[9px] font-black uppercase">
                      GİZLİ
                    </span>
                  )}
                  {img.type !== "ignored" && (
                    <span className="rounded bg-teal-600 text-white px-1 py-0.5 text-[9px] font-black uppercase">
                      {img.type}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-2 border-t border-neutral-100 flex flex-col gap-1.5 mt-auto">
                <div className="flex gap-1.5">
                  {/* Primary Toggle */}
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    disabled={img.isPrimary}
                    className={`flex-1 py-1 text-[10px] font-black uppercase rounded text-center transition ${
                      img.isPrimary
                        ? "bg-amber-100 text-amber-800 cursor-default"
                        : "bg-neutral-100 text-neutral-700 hover:bg-amber-100 hover:text-amber-800"
                    }`}
                  >
                    ANA RESİM
                  </button>

                  {/* Ignore Toggle */}
                  <button
                    onClick={() => handleToggleIgnore(img)}
                    className={`flex-1 py-1 text-[10px] font-black uppercase rounded text-center transition ${
                      img.type === "ignored"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {img.type === "ignored" ? "GÖSTER" : "GİZLE"}
                  </button>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="w-full py-1 text-[10px] font-black uppercase rounded text-center bg-red-50 text-red-700 hover:bg-red-100 transition"
                >
                  İLİŞKİYİ SİL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-neutral-100 pt-5">
        
        {/* Upload form */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wide">
            📤 CLOUDINARY&apos;YE YENİ GÖRSEL YÜKLE
          </h4>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-lg p-5 cursor-pointer hover:border-teal-600 hover:bg-neutral-50 transition min-h-[110px]">
            {uploading ? (
              <span className="text-xs text-neutral-500 font-bold animate-pulse">Görsel yükleniyor...</span>
            ) : (
              <>
                <span className="text-xs font-black text-teal-700 uppercase">DOSYA SEÇİN</span>
                <span className="text-[10px] text-neutral-400 mt-1">PNG, JPG, WEBP (Max 10MB)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Add manual URL form */}
        <form onSubmit={handleAddManual} className="flex flex-col gap-3">
          <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wide">
            🔗 DIŞ GÖRSEL BAĞLANTISI (URL) EKLE
          </h4>
          <div className="flex flex-col gap-2">
            <input
              type="url"
              placeholder="https://example.com/arac.jpg"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-teal-600 bg-white text-neutral-800 w-full"
            />
            
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Tip:</span>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value)}
                  className="rounded border border-neutral-300 px-2 py-1 text-[11px] bg-white text-neutral-800"
                >
                  <option value="exterior">Dış Görünüm (Exterior)</option>
                  <option value="interior">İç Görünüm (Interior)</option>
                  <option value="gallery">Galeri (Gallery)</option>
                  <option value="ignored">Gizli (Ignored)</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualIsPrimary}
                  onChange={(e) => setManualIsPrimary(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                />
                <span className="text-[10px] font-bold text-neutral-500 uppercase">ANA GÖRSEL YAP</span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={!manualUrl.trim()}
              className="mt-1 bg-teal-700 text-white font-black text-xs uppercase py-2 rounded hover:bg-teal-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              GÖRSELİ BAĞLA
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
