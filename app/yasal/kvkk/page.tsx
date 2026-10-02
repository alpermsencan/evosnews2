import Link from "next/link";
import { SITE_DOMAIN, SITE_EMAIL, SITE_LOCATION, SITE_NAME, SITE_PHONE } from "@/lib/site";

export const metadata = {
  title: `KVKK Aydınlatma Metni — ${SITE_NAME}`,
  description: `${SITE_DOMAIN} Kişisel Verilerin Korunması Kanunu (KVKK) aydınlatma ve bilgilendirme metni.`,
};

export default function KvkkPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <nav className="mb-4 text-xs font-bold text-neutral-400">
        <Link href="/" className="hover:text-neutral-900">ANASAYFA</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-600">KVKK</span>
      </nav>

      <article className="prose prose-neutral max-w-none rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black text-neutral-900 sm:text-3xl">KVKK Aydınlatma Metni</h1>
        <p className="text-xs text-neutral-400 mt-1">Son Güncelleme: 2 Ekim 2026</p>
        
        <div className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-neutral-600">
          <p>
            <strong>{SITE_NAME} ({SITE_DOMAIN})</strong> (bundan böyle &quot;{SITE_NAME}&quot; veya &quot;Platform&quot; olarak anılacaktır) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca veri sorumlusu sıfatıyla, kişisel verilerinizin güvenliğine azami önem veriyor ve mahremiyetinizi titizlikle koruyoruz.
          </p>

          <h2 className="text-lg font-bold text-neutral-950 mt-4">1. İşlenen Kişisel Verileriniz</h2>
          <p>
            Üyelik kaydı ve ilan oluşturma aşamasında; adınız, soyadınız, e-posta adresiniz, cep telefonu numaranız, kullanıcı adınız ve ilan vermeniz halinde araç teknik verileri ile şehir/konum bilgileriniz işlenmektedir.
          </p>

          <h2 className="text-lg font-bold text-neutral-950 mt-4">2. Kişisel Verilerin İşlenme Amaçları</h2>
          <p>
            Kişisel verileriniz; üyelik işlemlerinin gerçekleştirilmesi, platform hizmetlerinin sunulması, ilan yayınlama süreçlerinin yönetilmesi, sahte ilanların engellenmesi, kullanıcı güvenliğinin sağlanması ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.
          </p>

          <h2 className="text-lg font-bold text-neutral-950 mt-4">3. Kişisel Verilerin Aktarılması</h2>
          <p>
            Kişisel verileriniz, yasal zorunluluklar haricinde üçüncü şahıslarla paylaşılmamaktadır. Adli makamlar veya yetkili kamu kurum ve kuruluşlarından (Ticaret Bakanlığı vb.) usulüne uygun yasal talepler gelmesi durumunda, kanuni yükümlülükler çerçevesinde aktarım yapılabilmektedir.
          </p>

          <h2 className="text-lg font-bold text-neutral-950 mt-4">4. Haklarınız (KVKK Madde 11)</h2>
          <p>
            Dilediğiniz zaman Platform&apos;a başvurarak; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını ve uygun kullanılıp kullanılmadığını öğrenme, eksik veya yanlış işlenmişse düzeltilmesini isteme ve silinmesini talep etme haklarına sahipsiniz.
          </p>
          <p>
            Başvurularınızı <a href={`mailto:${SITE_EMAIL}`} className="text-sky-600 font-bold underline">{SITE_EMAIL}</a> adresine iletebilir ya da <a href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`} className="font-bold text-neutral-900">{SITE_PHONE}</a> numaralı kurumsal hattımızdan bilgi alabilirsiniz. Merkez / Konum: {SITE_LOCATION}.
          </p>
        </div>
      </article>
    </div>
  );
}
