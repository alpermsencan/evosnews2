/** Tarayıcıdan /api/upload üzerinden Cloudinary'ye yükler, secure_url listesi döner */
export async function uploadToCloudinary(
  files: File[],
  folder?: string
): Promise<string[]> {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  if (folder) fd.append("folder", folder);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Görsel yüklenemedi");
  return (data.images as { url: string }[]).map((i) => i.url);
}

/**
 * Üye yüklemeleri. Klasör seçimi yerine "amaç" gönderilir; sunucu
 * amaca göre izinli klasörü ve dosya sınırlarını uygular.
 */
export async function uploadMemberImages(
  files: File[],
  purpose: "avatar" | "post" | "listing" = "post"
): Promise<string[]> {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  fd.append("purpose", purpose);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Görsel yüklenemedi");
  return (data.images as { url: string }[]).map((i) => i.url);
}

export type UploadedVideoResult = {
  url: string;
  posterUrl: string;
  durationSec: number;
  width: number;
  height: number;
};

/** Reel videosu yükler; kapak görseli ve süre sunucudan döner */
export async function uploadMemberVideo(
  file: File
): Promise<UploadedVideoResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", "video");
  fd.append("purpose", "reel");

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Video yüklenemedi");
  return data.video as UploadedVideoResult;
}
