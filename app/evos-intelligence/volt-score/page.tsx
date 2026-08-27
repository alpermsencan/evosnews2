import Link from "next/link";
import SectionTitle from "@/components/news/SectionTitle";
import VoltScoreWidget from "@/components/listings/VoltScoreWidget";
import { IconBattery, IconShield, IconSparkles } from "@/components/ui/Icons";

export const metadata = {
  title: "VoltScore™ Nedir? — Elektrikli Araç Güven Endeksi",
  description: "Elektrikli araçların batarya sağlığı, kullanım geçmişi ve aşınma oranını hesaplayan yapay zekâ destekli güven puanı.",
};

export default function VoltScorePage() {
  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      {/* Header */}
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-[#0B1E3F] to-slate-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconSparkles className="h-7 w-7 text-sky-400" />
          <h1 className="text-2xl font-black sm:text-4xl">VoltScore™ Nedir?</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          VoltScore, ikinci el bir elektrikli aracın kondisyonunu, batarya yıpranmasını ve geçmiş şarj alışkanlıklarını analiz ederek 0 ile 100 arasında tek bir güven puanına dönüştüren Türkiye'nin ilk elektrikli araç derecelendirme endeksidir.
        </p>
      </header>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Descriptions */}
        <div className="lg:col-span-2 flex flex-col gap-5 bg-white rounded-lg border border-neutral-200 p-5 sm:p-6">
          <h2 className="text-lg font-black text-neutral-900 border-b border-neutral-100 pb-2">
            VoltScore Nasıl Hesaplanır?
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Klasik otomobillerdeki "kilometre" kriteri, elektrikli araçlar için tek başına yeterli bir güven ölçütü değildir. 10.000 km yapmış ancak sürekli yüksek hızlı DC şarjda %100 doldurulmuş bir batarya, 50.000 km yapmış ve AC şarj ile korunmuş bir bataryadan daha fazla yıpranmış olabilir. VoltScore bu karmaşık durumu şu 7 ana parametreyle çözer:
          </p>

          <div className="flex flex-col gap-4 mt-2">
            {[
              {
                title: "🔋 Batarya Sağlığı (SOH) — %30 Ağırlık",
                desc: "Batarya Yönetim Sisteminden (BMS) lisanslı cihazlarla okunan anlık maksimum şarj tutma kapasitesidir. %100 SOH tam puan getirirken, %70 altı kritik aşınma kabul edilir.",
              },
              {
                title: "🛣️ Kilometre / Yaş Dengesi — %15 Ağırlık",
                desc: "Aracın yaşına göre yaptığı kilometre oranıdır. Türkiye ortalaması olan yıllık ~15.000 km baz alınır; bunun altındaki kullanımlar puanı artırır.",
              },
              {
                title: "⚡ Hızlı Şarj (DC) Kullanım Oranı — %15 Ağırlık",
                desc: "Bataryanın yüksek sıcaklıklara maruz kalma sıklığıdır. Sürekli DC hızlı şarj kullanımı hücre yaşlanmasını hızlandırdığı için puanı düşürür, AC şarj kullanımı ise korur.",
              },
              {
                title: "🛡️ Kalan Üretici Garanti Süresi — %10 Ağırlık",
                desc: "Üreticinin batarya ve motor grubu için sunduğu resmi garanti süresinden (genelde 8 yıl / 160.000 km) kalan sürenin oranına göre puanlanır.",
              },
              {
                title: "🔧 Yetkili Servis Geçmişi — %10 Ağırlık",
                desc: "Aracın yazılım güncellemelerinin ve batarya soğutma sıvısı bakımlarının zamanında yapılıp yapılmadığını doğrular.",
              },
              {
                title: "⚠️ Kaza / Değişen Durumu — %12 Ağırlık",
                desc: "Araçta batarya kutusuna (pack) yakın bölgelerden alınan darbeler veya şasi hasarları güvenlik riski oluşturabileceğinden puanı etkiler.",
              },
              {
                title: "📈 Gerçek Menzil ile Uyum Oranı — %8 Ağırlık",
                desc: "Kullanıcıların bildirdiği gerçek sürüş menzili ile fabrika (WLTP) verisi arasındaki uyumdur. Gerçek tüketim sapması değerlendirilir.",
              },
            ].map((item, idx) => (
              <div key={idx} className="rounded-lg bg-neutral-50 p-4 border border-neutral-150">
                <h3 className="text-sm font-black text-neutral-800 mb-1">{item.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Sample Widget */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <VoltScoreWidget score={97} breakdown={null} />

          <div className="rounded-lg border border-neutral-200 bg-white p-5 flex flex-col gap-3">
            <h3 className="text-sm font-black text-neutral-800">Doğrulanmış Rapor Alın</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Aracınızı satarken VoltScore puanınızın ilanınızda görünmesini istiyorsanız, sertifikalı mobil batarya analiz hizmetimizi satın alabilirsiniz.
            </p>
            <Link
              href="/evos-intelligence/batarya-analizi"
              className="mt-2 text-center rounded bg-sky-500 hover:bg-sky-600 text-xs font-black text-white py-3 transition duration-300"
            >
              BATARYA ANALİZİ TALEP ET
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
