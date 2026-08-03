import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function GET() {
  return handle(async () => {
    const items = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return { items, total: items.length };
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, city } = await req.json();
    if (!email || !EMAIL_RE.test(email))
      return fail("Geçerli bir e-posta adresi girin");

    const normalized = email.toLowerCase().trim();
    const existing = await prisma.subscriber.findUnique({
      where: { email: normalized },
    });
    if (existing)
      return ok({ message: "Bu e-posta zaten bültene kayıtlı.", already: true });

    await prisma.subscriber.create({
      data: { email: normalized, city: city || null },
    });
    return ok({ message: "Bültene kaydınız alındı. Teşekkürler!" }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Kayıt yapılamadı", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return fail("id zorunludur");
    await prisma.subscriber.delete({ where: { id } });
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
