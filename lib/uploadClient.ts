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
