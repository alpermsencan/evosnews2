import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  if (!pathSegments || pathSegments.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (pathSegments.some(segment => !/^[a-zA-Z0-9._-]+$/.test(segment) || segment === "." || segment === "..")) {
    return new NextResponse("Not Found", { status: 404 });
  }
  const root = process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(root, ...pathSegments);
  const ext = path.extname(filePath).toLowerCase();
  if (!filePath.startsWith(root + path.sep) || !MIME_TYPES[ext]) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const realRoot = await fs.realpath(root);
    const realFile = await fs.realpath(filePath);
    if (!realFile.startsWith(realRoot + path.sep)) return new NextResponse("Not Found", { status: 404 });
    const stat = await fs.stat(realFile);
    if (!stat.isFile() || stat.size > 80 * 1024 * 1024) return new NextResponse("Not Found", { status: 404 });
    const file = await fs.readFile(realFile);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        ...(ext === ".svg" ? { "Content-Security-Policy": "default-src 'none'; sandbox" } : {}),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Görsel bulunamadı", { status: 404 });
  }
}
