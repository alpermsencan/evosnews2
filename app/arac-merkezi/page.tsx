import { prisma } from "@/lib/prisma";
import { getByCategory } from "@/lib/queries";
import VehicleHubClient from "@/components/vehicles/VehicleHubClient";
import { IconCar } from "@/components/ui/Icons";

export const revalidate = 60;
export const metadata = {
  title: "Araç Merkezi",
  description:
    "Elektrikli araç incelemeleri, test sürüşleri, karşılaştırmalar ve satın alma rehberleri.",
};

export default async function VehicleHubPage() {
  // Fetch all vehicles and article reviews from category 'arac-merkezi'
  const [vehicles, articles] = await Promise.all([
    prisma.vehicle.findMany({
      orderBy: [
        { brand: "asc" },
        { model: "asc" }
      ],
      include: {
        syncImages: true
      }
    }),
    getByCategory("arac-merkezi", 10)
  ]);

  // Calculate deterministic daily vehicle for test drive offset from daily review
  const today = new Date();
  const dayIndex = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));

  const trVarVehicles = vehicles.filter(
    (v) => v.marketStatus === "TR_YAYINDA" || v.marketStatus === "TR_YAKINDA"
  );

  const testDriveVehicle = trVarVehicles.length > 0
    ? trVarVehicles[(dayIndex + 5) % trVarVehicles.length]
    : vehicles[0];

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-teal-700 to-slate-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconCar className="h-7 w-7 text-volt" />
          <h1 className="text-2xl font-black sm:text-4xl">ARAÇ MERKEZİ</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Türkiye pazarındaki elektrikli modeller: segment şampiyonları,
          karşılaştırmalar ve araç haberleri. Teknik veriler katalogdaki
          doğrulanmış kayıtlardan gelir.
        </p>
      </header>

      {/* Render High-Performance Interactive Client Component */}
      <VehicleHubClient 
        vehicles={vehicles as any} 
        articles={articles as any}
        testDriveVehicle={testDriveVehicle as any}
      />
    </div>
  );
}
