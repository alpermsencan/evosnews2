import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = Promise<{
  country_code: string;
  party_id: string;
  location_id: string;
}>;

/**
 * PUT /api/ocpi/2.2.1/receiver/locations/[country_code]/[party_id]/[location_id]
 * CPO'dan gelen istasyon ekleme / güncelleme webhook alıcısı.
 */
export async function PUT(req: NextRequest, ctx: { params: Params }) {
  try {
    // 1. Yetki Doğrulama
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Token ")) {
      return NextResponse.json(
        { status_code: 2001, status_message: "Missing token", timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }
    const tokenStr = authHeader.replace("Token ", "").trim();
    const tokenExists = await prisma.ocpiToken.findFirst({ where: { token: tokenStr, isActive: true, version: 2 } });
    
    if (!tokenExists) {
      return NextResponse.json(
        { status_code: 2001, status_message: "Unauthorized token", timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }

    const { country_code, party_id, location_id } = await ctx.params;
    if (tokenExists.role !== "CPO" || tokenExists.countryCode !== country_code || tokenExists.partyId !== party_id) {
      return NextResponse.json({ status_code: 2001, status_message: "Party mismatch" }, { status: 403 });
    }
    if (!/^[A-Z]{2}$/.test(country_code) || !/^[A-Z0-9]{3}$/.test(party_id) || !/^[a-zA-Z0-9._:-]{1,64}$/.test(location_id)) {
      return NextResponse.json({ status_code: 2002, status_message: "Invalid location identifier" }, { status: 400 });
    }
    const body = await req.json();
    const lat = Number(body.latitude), lng = Number(body.longitude);
    if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180 || !Array.isArray(body.evses ?? []) || (body.evses?.length ?? 0) > 100) {
      return NextResponse.json({ status_code: 2002, status_message: "Invalid location data" }, { status: 400 });
    }

    if (!body.name || !body.latitude || !body.longitude || !body.address) {
      return NextResponse.json(
        { status_code: 2002, status_message: "Invalid location data", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    // 2. OCPI Veri Tabanını Güncelle (Location -> EVSE -> Connector)
    const ocpiLocation = await prisma.ocpiLocation.upsert({
      where: {
        countryCode_partyId_locationId: {
          countryCode: country_code,
          partyId: party_id,
          locationId: location_id,
        },
      },
      update: {
        name: body.name,
        address: body.address,
        city: body.city || "Belirtilmemiş",
        postalCode: body.postal_code || null,
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
      },
      create: {
        countryCode: country_code,
        partyId: party_id,
        locationId: location_id,
        name: body.name,
        address: body.address,
        city: body.city || "Belirtilmemiş",
        postalCode: body.postal_code || null,
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
      },
    });

    // EVSE listesini güncelle
    let totalSockets = 0;
    const socketTypesSet = new Set<string>();
    let maxPower = 0;

    if (Array.isArray(body.evses)) {
      for (const evse of body.evses) {
        if (!evse.uid) continue;
        
        const ocpiEvse = await prisma.ocpiEvse.upsert({
          where: { uid: `${country_code}:${party_id}:${location_id}:${evse.uid}` },
          update: {
            status: evse.status || "AVAILABLE",
            evseId: evse.evse_id || null,
          },
          create: {
            uid: `${country_code}:${party_id}:${location_id}:${evse.uid}`,
            evseId: evse.evse_id || null,
            status: evse.status || "AVAILABLE",
            locationId: ocpiLocation.id,
          },
        });

        // Connector listesini güncelle
        if (Array.isArray(evse.connectors) && evse.connectors.length <= 20) {
          // Önceki konnektörleri silip yenilerini ekleyelim (basitlik için)
          await prisma.ocpiConnector.deleteMany({ where: { evseId: ocpiEvse.id } });

          for (const conn of evse.connectors) {
            await prisma.ocpiConnector.create({
              data: {
                connectorId: conn.id || "1",
                standard: conn.standard || "IEC_62196_T2_COMBO",
                format: conn.format || "CABLE",
                powerType: conn.power_type || "DC",
                voltage: Number(conn.voltage) || 400,
                amperage: Number(conn.amperage) || 125,
                maxPowerKw: conn.max_electric_power != null ? Number(conn.max_electric_power) / 1000 : Number(conn.max_power) || 0,
                evseId: ocpiEvse.id,
              },
            });

            totalSockets++;
            socketTypesSet.add(conn.standard || "CCS2");
            maxPower = Math.max(maxPower, conn.max_electric_power != null ? Number(conn.max_electric_power) / 1000 : Number(conn.max_power) || 0);
          }
        }
      }
    }

    // 3. Mevcut ChargeStation tablosu ile Senkronize Et (Geriye Dönük Harita Uyumu)
    const operatorName = party_id.toUpperCase();
    const existing = await prisma.chargeStation.findFirst({ where: { source: "ocpi", externalId: location_id, operator: operatorName } });
    const stationSlug = existing?.slug || slugify(`${country_code}-${party_id}-${location_id}`);
    await prisma.chargeStation.upsert({
      where: { slug: stationSlug },
      update: {
        name: body.name,
        operator: operatorName,
        city: body.city || "Belirtilmemiş",
        district: body.city || "Belirtilmemiş",
        address: body.address,
        lat: Number(body.latitude),
        lng: Number(body.longitude),
        socketCount: totalSockets || 2,
        socketTypes: Array.from(socketTypesSet),
        isFast: maxPower >= 50,
        maxPowerKw: maxPower || null,
        source: "ocpi",
        externalId: location_id,
        fetchedAt: new Date(),
      },
      create: {
        name: body.name,
        slug: stationSlug,
        operator: operatorName,
        city: body.city || "Belirtilmemiş",
        district: body.city || "Belirtilmemiş",
        address: body.address,
        lat: Number(body.latitude),
        lng: Number(body.longitude),
        socketCount: totalSockets || 2,
        socketTypes: Array.from(socketTypesSet),
        isFast: maxPower >= 50,
        maxPowerKw: maxPower || null,
        source: "ocpi",
        externalId: location_id,
        fetchedAt: new Date(),
      },
    });

    return NextResponse.json({
      status_code: 1000,
      status_message: "Location successfully processed",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status_code: 3000, status_message: "Request failed" },
      { status: 500 }
    );
  }
}
