import Link from "next/link";

export const metadata = {
  title: "Üyelik Sözleşmesi — Evos",
  description: "Evos platformu üyelik sözleşmesi, kullanıcı hak ve yükümlülükleri.",
};

export default function UyelikSozlesmesiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <nav className="mb-4 text-xs font-bold text-neutral-400">
        <Link href="/" className="hover:text-evos">ANASAYFA</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-600">ÜYELİK SÖZLEŞMESİ</span>
      </nav>

      <article className="prose prose-neutral max-w-none rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black text-neutral-900 sm:text-3xl">Kullanıcı ve Üyelik Sözleşmesi</h1>
        <p className="text-xs text-neutral-400 mt-1">Son Güncelleme: 26 Ağustos 2026</p>
        
        <div className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-neutral-600">
          <p>
            Bu sözleşme, <strong>Evos Platformu</strong> ile Platform&apos;a üye olan kullanıcı (bundan böyle &quot;Üye&quot; olarak anılacaktır) arasında, Platform&apos;un sunduğu hizmetlerden (yorum yapma, ilan verme, topluluk etkileşimi vb.) yararlanılmasına ilişkin koşulları belirler.
          </p>

          <h2 className="text-lg font-bold text-neutral-950 mt-4">1. Tarafların Hak ve Yükümlülükleri</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>Üye, üye olurken verdiği kişisel ve teknik bilgilerin doğru olduğunu beyan eder. Yanıltıcı bilgilerden doğacak hukuki sorumluluk tamamen Üye&apos;ye aittir.</li>
            <li>Platform&apos;un içeriğinde yer alan yorum, ilan ve gönderilerin telif ve doğruluk sorumluluğu paylaşımı yapan Üye&apos;ye aittir.</li>
            <li>Üye, Platform üzerinde yasalara aykırı, ahlaka mugayir, hakaret içeren veya manipülatif içerik paylaşamaz.</li>
          </ul>

          <h2 className="text-lg font-bold text-neutral-950 mt-4">2. İlan Verme ve Yayınlama Kuralları</h2>
          <p>
            Üye, Platform üzerinde ücretsiz ilan oluşturabilir. İlanların doğruluğu, VoltScore puanlama kriterlerinin dürüstçe doldurulması ve araç üzerindeki mülkiyet haklarının yasal limitsizliği Üye&apos;nin sorumluluğundadır. Evos, sahte veya yanıltıcı bilgi barındıran ilanları herhangi bir açıklama yapmaksızın kaldırma veya askıya alma hakkını saklı tutar.
          </p>

          <h2 className="text-lg font-bold text-neutral-950 mt-4">3. Fesih ve Askıya Alma</h2>
          <p>
            Evos, işbu sözleşme kurallarına veya yasal düzenlemelere aykırılık tespit etmesi halinde, ilgili Üye&apos;nin üyeliğini geçici olarak askıya alabilir veya tek taraflı olarak tamamen sonlandırabilir.
          </p>
        </div>
      </article>
    </div>
  );
}
