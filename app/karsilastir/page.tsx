import CompareTable from "@/components/compare/CompareTable";
import { IconChart } from "@/components/ui/Icons";

export const metadata = {
  title: "Karşılaştır",
  description:
    "Sıfır elektrikli modelleri ve ikinci el ilanları aynı tabloda karşılaştırın: menzil, batarya sağlığı, şarj gücü, tüketim ve VoltScore.",
};

export default function ComparePage() {
  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-evos-ink to-slate-800 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconChart className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">KARŞILAŞTIR</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Sıfır katalog modelleriyle ikinci el ilanları aynı satırlarda görün.
          &quot;Sıfır mı alsam, ikinci el mi?&quot; sorusunun cevabı fiyat
          farkında değil, menzil–batarya sağlığı–şarj gücü üçgeninde saklı.
        </p>
      </header>

      <CompareTable />
    </div>
  );
}
