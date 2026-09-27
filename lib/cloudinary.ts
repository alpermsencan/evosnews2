import "server-only";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs/promises";
import path from "node:path";

const cloudinaryUrl = process.env.CLOUDINARY_URL;
let cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
let apiKey = process.env.CLOUDINARY_API_KEY;
let apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
  const match = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/.exec(cloudinaryUrl);
  if (match) {
    apiKey = match[1].replace(/[<>]/g, "");
    apiSecret = match[2].replace(/[<>]/g, "");
    cloudName = match[3].replace(/[<>]/g, "");
  }
}

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "evos";

/** Cloudinary anahtarları .env dosyasında geçerli şekilde tanımlı mı? */
export const isCloudinaryReady = Boolean(
  (cloudName &&
    apiKey &&
    apiSecret &&
    !cloudName.includes("your-") &&
    !apiKey.includes("your-")) ||
    cloudinaryUrl
);

if (isCloudinaryReady) {
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  } else if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl.replace(/[<>]/g, ""),
      secure: true,
    });
  }
}

export type UploadedImage = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

/** Dosyayı Cloudinary'ye veya Cloudinary yoksa yerel sunucu diskine (/public/uploads) yükler */
export async function uploadImage(
  file: File,
  folder = CLOUDINARY_FOLDER
): Promise<UploadedImage> {
  const buffer = Buffer.from(await file.arrayBuffer());

  // Cloudinary yapılandırılmamışsa yerel disk /public/uploads/ klasörüne kaydet
  if (!isCloudinaryReady) {
    const rawExt = path.extname(file.name || "") || ".jpg";
    const ext = rawExt.toLowerCase();
    const safeBase = (path.basename(file.name || "resim", rawExt) || "resim")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${safeBase}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, fileName), buffer);

    return {
      url: `/uploads/${fileName}`,
      publicId: `local-${fileName}`,
      width: 1200,
      height: 800,
      format: ext.replace(".", "") || "jpg",
      bytes: buffer.length,
    };
  }

  const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          overwrite: false,
          // Aşırı büyük görselleri makul boyuta indir, formatı/kaliteyi otomatik seç
          transformation: [
            { width: 2000, height: 2000, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, res) => {
          if (error || !res) return reject(error ?? new Error("Yükleme başarısız"));
          resolve(res as unknown as Record<string, unknown>);
        }
      )
      .end(buffer);
  });

  return {
    url: String(result.secure_url),
    publicId: String(result.public_id),
    width: Number(result.width) || 0,
    height: Number(result.height) || 0,
    format: String(result.format ?? ""),
    bytes: Number(result.bytes) || 0,
  };
}

export type UploadedVideo = {
  url: string;
  posterUrl: string;
  publicId: string;
  durationSec: number;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

/**
 * Reel videosunu Cloudinary'ye veya yerel diske yükler.
 */
export async function uploadVideo(
  file: File,
  folder = `${CLOUDINARY_FOLDER}/reels`
): Promise<UploadedVideo> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!isCloudinaryReady) {
    const rawExt = path.extname(file.name || "") || ".mp4";
    const ext = rawExt.toLowerCase();
    const safeBase = (path.basename(file.name || "video", rawExt) || "video")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${safeBase}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, fileName), buffer);

    const url = `/uploads/${fileName}`;
    return {
      url,
      posterUrl: url,
      publicId: `local-${fileName}`,
      durationSec: 15,
      width: 720,
      height: 1280,
      format: ext.replace(".", "") || "mp4",
      bytes: buffer.length,
    };
  }

  const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "video",
          overwrite: false,
          eager: [
            { width: 720, height: 1280, crop: "limit", quality: "auto" },
          ],
          eager_async: true,
        },
        (error, res) => {
          if (error || !res) return reject(error ?? new Error("Yükleme başarısız"));
          resolve(res as unknown as Record<string, unknown>);
        }
      )
      .end(buffer);
  });

  const url = String(result.secure_url);
  return {
    url,
    posterUrl: posterFromVideoUrl(url),
    publicId: String(result.public_id),
    durationSec: Math.round(Number(result.duration) || 0),
    width: Number(result.width) || 0,
    height: Number(result.height) || 0,
    format: String(result.format ?? ""),
    bytes: Number(result.bytes) || 0,
  };
}

/** Cloudinary video URL'inden ilk kareyi gösteren kapak görseli üretir */
export function posterFromVideoUrl(url: string) {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace(/\.[a-z0-9]+$/i, ".jpg");
}

/** Cloudinary'deki veya yerel diskteki bir görseli siler */
export async function destroyImage(publicId: string) {
  if (publicId.startsWith("local-")) {
    const fileName = publicId.replace(/^local-/, "");
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    try {
      await fs.unlink(filePath);
    } catch {}
    return;
  }
  if (isCloudinaryReady) {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  }
}

/** URL'den public_id çıkarır */
export function publicIdFromUrl(url: string): string | null {
  if (url.startsWith("/uploads/")) {
    return "local-" + url.replace("/uploads/", "");
  }
  const match = /\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i.exec(url);
  if (!url.includes("res.cloudinary.com") || !match) return null;
  return match[1];
}

/** Görseli harici bir URL'den doğrudan Cloudinary'ye yükler */
export async function uploadImageFromUrl(
  imageUrl: string,
  folder = CLOUDINARY_FOLDER
): Promise<UploadedImage> {
  if (!isCloudinaryReady) {
    return {
      url: imageUrl,
      publicId: `remote-${Date.now()}`,
      width: 1200,
      height: 800,
      format: "jpg",
      bytes: 0,
    };
  }

  const { createHash } = await import("node:crypto");
  const hash = createHash("sha1").update(imageUrl).digest("hex");
  const publicId = `kia-img-${hash}`;

  const result = await cloudinary.uploader.upload(imageUrl, {
    folder,
    public_id: publicId,
    resource_type: "image",
    overwrite: false,
    transformation: [
      { width: 2000, height: 2000, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return {
    url: String(result.secure_url),
    publicId: String(result.public_id),
    width: Number(result.width) || 0,
    height: Number(result.height) || 0,
    format: String(result.format ?? ""),
    bytes: Number(result.bytes) || 0,
  };
}
