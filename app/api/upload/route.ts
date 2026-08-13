import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";
import {
  destroyImage,
  isCloudinaryReady,
  publicIdFromUrl,
  uploadImage,
  uploadVideo,
} from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Reel videoları büyük olabildiği için yükleme süresi uzatılır
export const maxDuration = 60;

const COOKIE = "evos_admin";
const PASSWORD = process.env.ADMIN_PASSWORD || "evos2026";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB (görsel)
const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80 MB (reel)
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const ALLOWED_VIDEO = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
];

/** Üyelerin yükleyebileceği klasörler: amaç -> klasör */
const MEMBER_FOLDERS: Record<string, string> = {
  avatar: "evos/avatarlar",
  post: "evos/gonderiler",
  reel: "evos/reels",
  // Üye kendi ilanının görselini yükler; ilan zaten moderasyondan geçiyor.
  listing: "evos/ilanlar",
};

function isAdmin(req: NextRequest) {
  return req.cookies.get(COOKIE)?.value === PASSWORD;
}

/**
 * POST /api/upload — FormData("file" veya "files") ile Cloudinary'ye yükler.
 * Yönetici her klasöre görsel yükleyebilir; üyeler `purpose` alanına göre
 * avatar / gönderi görseli / reel videosu yükler.
 *
 * Video yüklemek için: FormData'ya type="video" eklenir.
 */
export async function POST(req: NextRequest) {
  const admin = isAdmin(req);
  const member = admin ? null : await getRequestUser(req);
  if (!admin && !member) return fail("Yetkisiz işlem", 401);
  if (!isCloudinaryReady)
    return fail(
      "Cloudinary yapılandırılmamış. .env dosyasına CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ve CLOUDINARY_API_SECRET ekleyin.",
      500
    );

  try {
    const form = await req.formData();
    const isVideo = String(form.get("type") || "") === "video";
    const purpose = String(form.get("purpose") || "avatar");

    // Üyeler serbest klasör seçemez, izinli amaçlardan birine düşerler
    const folder = admin
      ? String(form.get("folder") || "") || undefined
      : MEMBER_FOLDERS[purpose] ?? MEMBER_FOLDERS.avatar;

    const raw = [...form.getAll("files"), ...form.getAll("file")];
    const files = raw.filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) return fail("Dosya bulunamadı");

    if (isVideo) {
      const file = files[0];
      if (files.length > 1) return fail("Aynı anda tek video yükleyebilirsiniz");
      if (!ALLOWED_VIDEO.includes(file.type))
        return fail(`Desteklenmeyen video tipi: ${file.type || "bilinmiyor"}`);
      if (file.size > MAX_VIDEO_BYTES)
        return fail(`"${file.name}" 80 MB sınırını aşıyor`);

      const video = await uploadVideo(file, folder);
      return ok({ video, url: video.url }, 201);
    }

    // Üyeler gönderi görsellerinde en fazla 4 dosya yükleyebilir
    const maxFiles = admin ? 20 : purpose === "post" ? 4 : purpose === "listing" ? 6 : 1;
    if (files.length > maxFiles)
      return fail(`Aynı anda en fazla ${maxFiles} dosya yükleyebilirsiniz`);

    for (const file of files) {
      if (!ALLOWED.includes(file.type))
        return fail(`Desteklenmeyen dosya tipi: ${file.type || "bilinmiyor"}`);
      if (file.size > MAX_BYTES)
        return fail(`"${file.name}" 10 MB sınırını aşıyor`);
    }

    const images = await Promise.all(files.map((f) => uploadImage(f, folder)));

    // Tek dosya yüklendiğinde kolay kullanım için url'i de kökte döneriz
    return ok({ images, url: images[0].url }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Dosya yüklenemedi", 500);
  }
}

/** DELETE /api/upload?url=... — sadece Cloudinary'deki görselleri siler */
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return fail("Yetkisiz işlem", 401);
  if (!isCloudinaryReady) return fail("Cloudinary yapılandırılmamış", 500);

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return fail("url parametresi gerekli");

  const publicId = publicIdFromUrl(url);
  // Cloudinary dışı (kaynak sitesinden gelen) görsellerde silinecek bir şey yok
  if (!publicId) return ok({ success: true, skipped: true });

  try {
    await destroyImage(publicId);
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Görsel silinemedi", 500);
  }
}
