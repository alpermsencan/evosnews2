import Link from "next/link";
import SectionTitle from "@/components/news/SectionTitle";
import LeadForm from "@/components/ui/LeadForm";
import { IconUsers, IconChevronRight } from "@/components/ui/Icons";

export const metadata = {
  title: "İletişim",
  description:
    "Evos ile iletişime geçin: iş birliği, kurumsal entegrasyon, veri ortaklığı, basın ve içerik talepleri.",
};

const TOPICS = [
  {
    t: "İş birliği ve iş ortaklığı",
    d: "Şarj operatörü, galeri, yetkili bayi veya sigorta iş ortaklığı için.",
  },
  {
    t: "Kurumsal entegrasyon",
    d: "AI Danışman, şarj ağı verisi veya araç kataloğunu kendi sisteminize bağlamak için.",
  },
  {
    t: "Batarya raporu ağı",
    d: "Yetkili servis veya ekspertiz firmasıysanız ölçüm ağına katılmak için.",
  },
  {
    t: "Basın ve içerik",
    d: "Basın talepleri, düzeltme bildirimi ve içerik hakları için.",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-evos-ink to-slate-800 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconUsers className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">İLETİŞİM</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Aşağıdaki formu doldurun; talebiniz konusuna göre ilgili ekibe
          yönlendirilir. Formu göndermek için üyelik gerekmez.
        </p>
      </header>

      <div className="flex flex-col gap-5 lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-3">
          <SectionTitle title="HANGİ KONUDA YAZABİLİRSİNİZ?" color="#0f172a" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TOPICS.map((t) => (
              <div
                key={t.t}
                className="flex flex-col gap-1.5 rounded-lg border border-neutral-200 bg-white p-5"
              >
                <h3 className="text-[15px] font-black text-neutral-900">{t.t}</h3>
                <p className="text-[13px] leading-relaxed text-neutral-600">{t.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-1 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5">
            <h3 className="text-[15px] font-black text-neutral-900">
              Haberde bir yanlış mı gördünüz?
            </h3>
            <p className="text-[13px] leading-relaxed text-neutral-600">
              Haberlerimiz kaynağın metni kopyalanmadan sıfırdan yeniden
              yazılır; bu süreçte bir olgu hatası oluşabilir. Haberin adresini
              ve düzeltme gerektiren kısmı forma yazarsanız inceleyip
              düzeltiriz.
            </p>
            <Link
              href="/hakkinda"
              className="mt-1 flex items-center gap-1 text-[12px] font-bold text-evos hover:underline"
            >
              Veri ilkelerimizi okuyun <IconChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        <aside className="w-full shrink-0 lg:w-[420px]">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-[15px] font-black text-neutral-900">Mesaj gönderin</h2>
            <LeadForm topic="iletisim" />
          </div>
        </aside>
      </div>
    </div>
  );
}
