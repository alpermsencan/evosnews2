import "server-only";
import { v2 as cloudinary } from "cloudinary";

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "evos";

/** Cloudinary anahtarları .env dosyasında tanımlı mı? */
export const isCloudinaryReady = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryReady) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export type UploadedImage = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

/** Dosyayı Cloudinary'ye yükler, güvenli URL döner */
export async function uploadImage(
  file: File,
  folder = CLOUDINARY_FOLDER
): Promise<UploadedImage> {
  const buffer = Buffer.from(await file.arrayBuffer());

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
 * Reel videosunu Cloudinary'ye yükler. Kapak görseli, videonun ilk karesinin
 * .jpg türevi olarak aynı URL'den servis edilir (ek istek gerekmez).
 */
export async function uploadVideo(
  file: File,
  folder = `${CLOUDINARY_FOLDER}/reels`
): Promise<UploadedVideo> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "video",
          overwrite: false,
          // Dikey formatta makul çözünürlük ve otomatik kalite
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

/** Cloudinary'deki bir görseli siler (sadece bizim yüklediklerimiz) */
export async function destroyImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

/** Cloudinary URL'inden public_id çıkarır; bizim görselimiz değilse null */
export function publicIdFromUrl(url: string): string | null {
  const match = /\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i.exec(url);
  if (!url.includes("res.cloudinary.com") || !match) return null;
  return match[1];
}
