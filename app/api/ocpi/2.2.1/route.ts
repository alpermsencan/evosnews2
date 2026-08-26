import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/ocpi/2.2.1
 * OCPI Handshake - 2.2.1 Sürümü için aktif modül uçlarını listeler.
 */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orange-tarsier-725070.hostingersite.com";

  return NextResponse.json({
    status_code: 1000,
    status_message: "Success",
    timestamp: new Date().toISOString(),
    data: {
      version: "2.2.1",
      endpoints: [
        {
          identifier: "credentials",
          role: "RECEIVER",
          url: `${baseUrl}/api/ocpi/2.2.1/credentials`
        },
        {
          identifier: "locations",
          role: "RECEIVER",
          url: `${baseUrl}/api/ocpi/2.2.1/receiver/locations`
        }
      ]
    }
  });
}
