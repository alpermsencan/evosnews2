import VehicleSyncDashboard from "@/components/admin/VehicleSyncDashboard";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Araç Senkronizasyonu & Fiyat Monitörü | e-aracım Admin",
};

export default function AdminVehicleSyncPage() {
  return <VehicleSyncDashboard />;
}
