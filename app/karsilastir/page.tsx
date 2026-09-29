import CompareTable from "@/components/compare/CompareTable";
import { IconChart } from "@/components/ui/Icons";

export const metadata = {
  title: "Araç Karşılaştırma — Sıfır ve 2. El Modelleri Kıyaslayın",
  description:
    "Sıfır elektrikli modelleri ve ikinci el ilanları aynı tabloda karşılaştırın: menzil, batarya sağlığı, şarj gücü, tüketim ve fiyat.",
};

export default function ComparePage() {
  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-neutral-900 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconChart className="h-7 w-7 text-red-500" />
          <h1 className="text-2xl font-black sm:text-4xl">ARAÇ KARŞILAŞTIRMA</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Sıfır katalog modelleriyle ikinci el ilanları aynı satırlarda görün.
          Menzil, batarya kapasitesi, şarj gücü, tüketim ve fiyat farklarını yan yana kıyaslayın.
        </p>
      </header>

      <CompareTable />
    </div>
  );
}
