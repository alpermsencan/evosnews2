import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/ocpi/2.2.1/credentials
 * OCPI el sıkışması ve yetkilendirme token kaydı.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Token ")) {
      return NextResponse.json(
        { status_code: 2001, status_message: "Missing token", timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }

    const clientToken = authHeader.replace("Token ", "").trim();
    const body = await req.json();

    // CPO token kaydı yapılıyor
    const { token, url, roles } = body;
    if (!token) {
      return NextResponse.json(
        { status_code: 2002, status_message: "Missing credentials token", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    // Gelen token'ı sisteme kaydet
    await prisma.ocpiToken.upsert({
      where: { token: clientToken },
      update: {
        partyId: body.party_id || "UNKNOWN",
        countryCode: body.country_code || "TR",
        isActive: true,
      },
      create: {
        token: clientToken,
        partyId: body.party_id || "UNKNOWN",
        countryCode: body.country_code || "TR",
        role: "CPO",
        isActive: true,
      },
    });

    const serverToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    // Bizim token'ımızı CPO'ya dönüyoruz
    return NextResponse.json({
      status_code: 1000,
      status_message: "Handshake completed successfully",
      timestamp: new Date().toISOString(),
      data: {
        token: serverToken,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://orange-tarsier-725070.hostingersite.com"}/api/ocpi/2.2.1`,
        roles: [
          {
            role: "EMSP",
            business_details: {
              name: "Evos Charging Network",
              website: "https://evotopilot.com"
            },
            party_id: "EVS",
            country_code: "TR"
          }
        ]
      }
    });
  } catch (error) {
    return NextResponse.json(
      { status_code: 3000, status_message: error instanceof Error ? error.message : "Internal error", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
