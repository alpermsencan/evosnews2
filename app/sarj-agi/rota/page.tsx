import { prisma } from "@/lib/prisma";
import RouteCalculatorClient from "./RouteCalculatorClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Şarj Rota Hesaplayıcı · Evos",
  description: "Elektrikli aracınızla rota çizin, şarj duraklarınızı ve toplam yakıt/şarj maliyetini hesaplayın.",
};

export default async function RotaPage() {
  // Araç listesini veritabanından çekip istemci bileşenine aktarıyoruz
  const vehicles = await prisma.vehicle.findMany({
    orderBy: [{ brand: "asc" }, { model: "asc" }],
    select: {
      id: true,
      brand: true,
      model: true,
      rangeKm: true,
      batteryKwh: true,
      consumption: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <nav className="mb-6 text-xs font-bold text-neutral-400">
        <Link href="/" className="hover:text-evos">ANASAYFA</Link>
        <span className="mx-2">›</span>
        <Link href="/sarj-agi" className="hover:text-evos">ŞARJ AĞI</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-600">ROTA HESAPLAYICI</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight sm:text-4xl">
          Şarj & Rota Hesaplayıcı
        </h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-2xl">
          Kalkış ve varış noktalarınızı seçin. Aracınızın batarya kapasitesi ve tüketim değerine göre optimum şarj duraklarını ve tahmini yolculuk maliyetini hesaplayalım.
        </p>
      </div>

      <RouteCalculatorClient vehicles={vehicles} />
    </div>
  );
}
