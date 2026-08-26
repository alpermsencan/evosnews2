import Link from "next/link";

export const metadata = {
  title: "İlan Yayınlama Kuralları — Evos",
  description: "Evos platformu elektrikli araç ilan verme kuralları ve yasal e-Devlet kimlik doğrulama rehberi.",
};

export default function IlanVermeKurallariPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <nav className="mb-4 text-xs font-bold text-neutral-400">
        <Link href="/" className="hover:text-evos">ANASAYFA</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-600">İLAN VERME KURALLARI</span>
      </nav>

      <article className="prose prose-neutral max-w-none rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black text-neutral-900 sm:text-3xl">Elektrikli Araç İlan Yayınlama Kuralları</h1>
        <p className="text-xs text-neutral-400 mt-1">Son Güncelleme: 26 Ağustos 2026</p>
        
        <div className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-neutral-600">
          <p>
            Evos Elektrikli Araç Pazaryeri, alıcıların araçların gerçek batarya sağlık durumunu, şarj alışkanlıklarını ve gerçek menzil potansiyelini görerek güvenle alışveriş yapabilmesi için tasarlanmıştır. Güvenli bir ekosistem sağlamak amacıyla ilan veren tüm üyeler aşağıdaki kurallara uymakla yükümlüdür:
          </p>

          <h2 className="text-lg font-bold text-neutral-950 mt-4">1. Doğru Bilgi ve VoltScore Beyanları</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>Aracınızın batarya sağlığı, garanti süresi, kaza/hasar ve servis geçmişi bilgilerini yanıltıcı olmayacak şekilde tam ve dürüstçe girmelisiniz.</li>
            <li>Bilmediğiniz veya emin olmadığınız teknik alanları boş bırakınız. Bilgilerin eksik olması ilan verilmesini engellemez, yalnızca VoltScore veri kapsamını etkiler.</li>
          </ul>

          <h2 className="text-lg font-bold text-neutral-950 mt-4">2. Türkiye Ticaret Bakanlığı İlan Yönetmeliği Uyum Bildirimi (e-Devlet)</h2>
          <p>
            Türkiye Cumhuriyeti Ticaret Bakanlığı ilan yönetmelikleri gereğince; ilan sitelerinde otomobil satışı yapan kişilerin kimliklerinin ve ilana konu taşıtın mülkiyet durumunun doğrulanması zorunlu tutulmaktadır. 
          </p>
          <p className="bg-amber-50 border-l-4 border-amber-500 p-3 text-amber-900 text-[13px] rounded">
            <strong>Önemli Yasal Sorumluluk:</strong> İlan veren kullanıcılar, beyan ettikleri T.C. Kimlik ve araç plaka/ruhsat bilgilerinin kendilerine ait olduğunu veya yetkili satıcı olduklarını taahhüt ederler. Sistem üzerinden yapılacak e-Devlet entegrasyonu doğrulamasında başarısız olan veya yetkisiz ilan girişi yapan hesapların ilanları yasal mevzuat gereğince yayına alınmayacaktır.
          </p>

          <h2 className="text-lg font-bold text-neutral-950 mt-4">3. Fiyat ve İlan Görseli Kuralları</h2>
          <p>
            İlan fiyatları güncel ve Türk Lirası cinsinden olmalıdır. İlan görselleri araca ait güncel fotoğraflar olmalı, temsili veya üçüncü şahıslara ait görseller kullanılmamalıdır.
          </p>
        </div>
      </article>
    </div>
  );
}
