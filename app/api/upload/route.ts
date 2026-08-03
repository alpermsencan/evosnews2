import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";
import {
  destroyImage,
  isCloudinaryReady,
  publicIdFromUrl,
  uploadImage,
} from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COOKIE = "evos_admin";
const PASSWORD = process.env.ADMIN_PASSWORD || "evos2026";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

function isAdmin(req: NextRequest) {
  return req.cookies.get(COOKIE)?.value === PASSWORD;
}

/**
 * POST /api/upload — FormData("file" veya "files") ile Cloudinary'ye görsel yükler.
 * Yönetici her klasöre yükleyebilir; üyeler yalnızca kendi avatarlarını (tek dosya).
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
    // Üyeler klasör seçemez, hepsi avatar klasörüne düşer
    const folder = admin
      ? String(form.get("folder") || "") || undefined
      : "evos/avatarlar";

    const raw = [...form.getAll("files"), ...form.getAll("file")];
    const files = raw.filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) return fail("Dosya bulunamadı");
    if (!admin && files.length > 1)
      return fail("Aynı anda tek dosya yükleyebilirsiniz");

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
    return fail(e instanceof Error ? e.message : "Görsel yüklenemedi", 500);
  }
}

/** DELETE /api/upload?url=... — sadece Cloudinary'deki görselleri siler */
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return fail("Yetkisiz işlem", 401);
  if (!isCloudinaryReady) return fail("Cloudinary yapılandırılmamış", 500);

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return fail("url parametresi gerekli");

  const publicId = publicIdFromUrl(url);
  // Cloudinary dışı (mevcut picsum/unsplash) görsellerde silinecek bir şey yok
  if (!publicId) return ok({ success: true, skipped: true });

  try {
    await destroyImage(publicId);
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Görsel silinemedi", 500);
  }
}
