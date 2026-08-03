import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import LeadForm from "@/components/ui/LeadForm";
import { getByCategory } from "@/lib/queries";
import { IconMic, IconCheck } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Voice Intelligence",
  description:
    "Evos Voice Intelligence: araç içi sesli asistan, doğal dil komutları ve çağrı merkezi otomasyonu.",
};

const COMMANDS = [
  { c: "En yakın hızlı şarj istasyonunu bul", r: "Rota üzerinde 12 km ötede 180 kW'lık müsait soket bulundu." },
  { c: "Ankara'ya gidiyorum, iki mola ile planla", r: "Bolu ve Kızılcahamam duraklarıyla rota oluşturuldu, varış şarjı %24." },
  { c: "Bataryayı hızlı şarj için hazırla", r: "Ön koşullandırma başlatıldı, 12 dakikada hedef sıcaklığa ulaşılacak." },
  { c: "Bu ayki şarj harcamam ne kadar?", r: "Ağustos ayında 214 kWh, toplam 1.842 ₺ harcadınız." },
  { c: "Kabini 22 dereceye ayarla ve koltuğu ısıt", r: "Klima 22°C, sürücü koltuk ısıtması 2. kademe." },
  { c: "Son şarj faturamı e-postayla gönder", r: "Fatura kayıtlı adresinize gönderildi." },
];

const CAPABILITIES = [
  { t: "Bağlam koruma", d: "Arka arkaya sorulan soruları önceki komutla ilişkilendirir, tekrar tanımlama gerekmez." },
  { t: "Gürültü toleransı", d: "120 km/s hızda, cam açıkken bile yüksek doğrulukla komut algılar." },
  { t: "Türkçe doğal dil", d: "Günlük konuşma dilini, deyimleri ve kısaltmaları anlar; komut ezberlemeye gerek yoktur." },
  { t: "Çağrı merkezi otomasyonu", d: "Şarj ve fatura taleplerinin %46'sını operatöre aktarmadan sonuçlandırır." },
  { t: "Araç entegrasyonu", d: "Klima, koltuk ısıtma, ön koşullandırma ve navigasyon komutlarını doğrudan araca iletir." },
  { t: "Güvenlik", d: "Ses kayıtları anonimleştirilir, komut geçmişi kullanıcı talebiyle silinebilir." },
];

export default async function VoicePage() {
  const news = await getByCategory("voice-intelligence", 3);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-cyan-600 to-sky-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconMic className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">VOICE INTELLIGENCE</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Sesle çalışan Evos asistanı; şarj planlamasından fatura sorgusuna,
          kabin ayarlarından rota optimizasyonuna kadar aracınızla doğal dilde
          konuşmanızı sağlar.
        </p>
        <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Komut doğruluğu" value="%94" />
          <Stat label="Ortalama yanıt" value="0,8 sn" />
          <Stat label="Desteklenen komut" value="380+" />
          <Stat label="Otomatik çözüm" value="%46" />
        </div>
      </header>

      <section>
        <SectionTitle title="ÖRNEK KOMUTLAR" color="#0891b2" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {COMMANDS.map((c) => (
            <div
              key={c.c}
              className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-white">
                  <IconMic className="h-4 w-4" />
                </span>
                <p className="rounded-lg rounded-tl-none bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-800">
                  &ldquo;{c.c}&rdquo;
                </p>
              </div>
              <div className="flex items-start gap-3 pl-11">
                <p className="rounded-lg rounded-tl-none bg-cyan-50 px-3 py-2 text-sm text-cyan-900">
                  {c.r}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="YETENEKLER" color="#0891b2" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <div
              key={c.t}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5"
            >
              <IconCheck className="h-5 w-5 text-cyan-600" />
              <h3 className="text-[15px] font-black text-neutral-900">{c.t}</h3>
              <p className="text-[13px] leading-relaxed text-neutral-600">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-lg border border-neutral-200 bg-white p-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-black text-neutral-900">
            Kurumsal entegrasyon talebi
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Voice Intelligence&apos;ı filo yönetim sisteminize, çağrı merkezinize
            veya kendi mobil uygulamanıza entegre etmek için ekibimizle
            iletişime geçin. Pilot kurulum ortalama 3 haftada tamamlanıyor.
          </p>
        </div>
        <div className="w-full shrink-0 lg:w-[420px]">
          <LeadForm topic="voice-intelligence" />
        </div>
      </section>

      {news.length > 0 && (
        <section>
          <SectionTitle title="VOICE HABERLERİ" href="/kategori/voice-intelligence" color="#0891b2" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {news.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-lg bg-white/10 px-3 py-2 backdrop-blur">
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
      <span className="text-lg font-black">{value}</span>
    </div>
  );
}
