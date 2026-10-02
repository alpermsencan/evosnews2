import Link from "next/link";
import { SITE_DOMAIN, SITE_EMAIL, SITE_LOCATION, SITE_NAME, SITE_PHONE } from "@/lib/site";
import { IconBolt, IconCheck, IconShield } from "@/components/ui/Icons";

export const metadata = {
  title: `Veri ve Gizlilik Politikası — ${SITE_NAME}`,
  description: `${SITE_DOMAIN} Kişisel Verilerin Korunması Kanunu (KVKK) uyumluluğu, veri güvenliği ve gizlilik politikası.`,
};

export default function VeriGizlilikPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-bold text-neutral-400">
        <Link href="/" className="hover:text-neutral-900 transition-colors">
          ANASAYFA
        </Link>
        <span>›</span>
        <span className="text-neutral-900 font-extrabold uppercase">
          VERİ VE GİZLİLİK POLİTİKASI
        </span>
      </nav>

      {/* Header Banner */}
      <header className="mb-8 rounded-3xl bg-gradient-to-br from-neutral-950 via-slate-900 to-neutral-900 p-6 sm:p-8 text-white border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
            <IconShield className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-sky-400">
              YASAL VE KVKK BİLDİRİMİ
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Veri ve Gizlilik Politikası
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-sm sm:text-base text-neutral-300 leading-relaxed">
          {SITE_DOMAIN} olarak kullanıcılarımızın mahremiyetine, kişisel verilerinin korunmasına
          ve 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) ilkelerine azami
          hassasiyet gösteriyoruz.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 pt-4 border-t border-white/10 text-xs text-neutral-400 font-medium">
          <span>Son Güncelleme: 2 Ekim 2026</span>
          <span>•</span>
          <span>Sürüm: 2.4 (KVKK Uyumlu)</span>
          <span>•</span>
          <span>Veri Sorumlusu: {SITE_DOMAIN}</span>
        </div>
      </header>

      {/* Content */}
      <article className="prose prose-neutral max-w-none rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col gap-8 text-sm leading-relaxed text-neutral-700">
          {/* Giriş */}
          <section className="flex flex-col gap-3">
            <p>
              İşbu Veri ve Gizlilik Politikası; <strong>{SITE_NAME}</strong> (bundan böyle &quot;<strong>{SITE_DOMAIN}</strong>&quot; veya &quot;<strong>Platform</strong>&quot; olarak anılacaktır) tarafından sunulan dijital hizmetler, elektrikli araç kataloğu, şarj asistanı, topluluk alanı ve 2. el ilan pazaryeri dahil tüm servislerin kullanımı sırasında elde edilen kişisel verilerin toplanma, işlenme, aktarılma ve saklanma süreçlerini aydınlatmak amacıyla hazırlanmıştır.
            </p>
          </section>

          {/* 1. Veri Sorumlusu */}
          <section className="flex flex-col gap-3 rounded-2xl bg-neutral-50 p-5 border border-neutral-200">
            <h2 className="text-lg font-black text-neutral-950 m-0">1. Veri Sorumlusunun Kimliği</h2>
            <p className="m-0 text-neutral-600">
              6698 sayılı KVKK uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>{SITE_DOMAIN}</strong> tarafından aşağıda belirtilen kapsamda toplanmakta, işlenmekte ve korunmaktadır.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="rounded-xl bg-white p-3 border border-neutral-200">
                <span className="block font-bold text-neutral-400 uppercase text-[10px]">Platform Adı</span>
                <span className="font-black text-neutral-900">{SITE_NAME} ({SITE_DOMAIN})</span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-neutral-200">
                <span className="block font-bold text-neutral-400 uppercase text-[10px]">İletişim E-Posta</span>
                <span className="font-black text-neutral-900">{SITE_EMAIL}</span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-neutral-200">
                <span className="block font-bold text-neutral-400 uppercase text-[10px]">Konum / Merkez</span>
                <span className="font-black text-neutral-900">{SITE_LOCATION}</span>
              </div>
            </div>
          </section>

          {/* 2. İşlenen Kişisel Veri Kategorileri */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-black text-neutral-950">2. İşlenen Kişisel Veri Kategorileri</h2>
            <p>
              Platformumuzda sağlanan hizmetlerin niteliğine bağlı olarak aşağıdaki kişisel veri türleri toplanabilmektedir:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-neutral-600">
              <li>
                <strong>Kimlik ve İletişim Bilgileri:</strong> Üye kaydı oluşturulurken veya ilan verilirken sağlanan ad, soyad, e-posta adresi, cep telefonu numarası.
              </li>
              <li>
                <strong>Kullanıcı ve Güvenlik Verileri:</strong> Şifrelenmiş (tuzlanmış hash yöntemiyle saklanan) parola bilgileri, oturum belirteçleri, IP adresleri, tarayıcı türü, son oturum açma zaman damgaları.
              </li>
              <li>
                <strong>İlan ve Araç Verileri:</strong> Satışa sunulan aracın marka, model, yıl, batarya kapasitesi, şarj özellikleri, kilometre ve ekspertiz/durum beyanları ile araç görselleri.
              </li>
              <li>
                <strong>Etkileşim ve Topluluk Verileri:</strong> Topluluk gönderileri, haber yorumları, oylamalar, kullanıcıların birbirine gönderdiği platform içi mesajlar ve destek talepleri.
              </li>
              <li>
                <strong>Trafik ve Analitik Çerez Verileri:</strong> Sayfa görüntüleme sayıları, ziyaret edilen sayfalar, filtreleme tercihleri ve oturum devamlılığını sağlayan teknik çerezler.
              </li>
            </ul>
          </section>

          {/* 3. Kişisel Verilerin İşlenme Amaçları */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-black text-neutral-950">3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri</h2>
            <p>
              Toplanan kişisel verileriniz, 6698 sayılı Kanun&apos;un 5. ve 6. maddelerinde belirtilen &quot;kanunlarda açıkça öngörülmesi&quot;, &quot;bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması&quot;, &quot;veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi&quot; ve &quot;meşru menfaat&quot; hukuki sebeplerine dayalı olarak:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Kullanıcı üyelik hesabı açılması ve kimlik doğrulaması",
                "İkinci el elektrikli araç ilanlarının yayına alınması ve yönetimi",
                "Alıcı ve satıcı arasındaki platform içi iletişimin güvenle sürdürülmesi",
                "Sahte, yanıltıcı veya suistimal amaçlı ilanların önlenmesi",
                "Şarj asistanı ve menzil hesaplama servislerinin çalıştırılması",
                "Yasal mevzuat (Ticaret Bakanlığı otomotiv ilan düzenlemeleri vb.) gereksinimlerinin karşılanması",
                "Platform güvenliğinin, sunucu bütünlüğünün ve siber savunmanın temini",
                "Kullanıcı destek taleplerinin yanıtlanması ve sorunların giderilmesi",
              ].map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3 border border-neutral-100">
                  <IconCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-xs font-medium text-neutral-700">{reason}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Verilerin Aktarılması */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-black text-neutral-950">4. Kişisel Verilerin Aktarılması</h2>
            <p>
              Kişisel verileriniz üçüncü kişilere <strong>asla satılmaz, kiralanmaz veya ticari amaçla devredilmez</strong>. Verileriniz yalnızca:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-neutral-600">
              <li>
                <strong>Yasal ve Adli Yükümlülükler:</strong> Mahkemeler, savcılıklar veya Ticaret Bakanlığı gibi yetkili kamu kurum ve kuruluşlarının kanunlar çerçevesinde usulüne uygun bağlayıcı talepleri doğrultusunda,
              </li>
              <li>
                <strong>Teknik Altyapı Sağlayıcıları:</strong> Platformun barındırılması ve çalışması için zorunlu olan güvenli sunucu (hosting) ve veri tabanı altyapı hizmeti sağlayıcılarıyla gizlilik sözleşmeleri kapsamında sınırlı olarak paylaşılabilir.
              </li>
            </ul>
          </section>

          {/* 5. Çerez (Cookie) Politikası */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-black text-neutral-950">5. Çerezler (Cookies) ve İzleme Teknolojileri</h2>
            <p>
              {SITE_DOMAIN}, oturumunuzu açık tutmak, güvenlik kontrollerini sağlamak ve sayfa yükleme hızını optimize etmek amacıyla çerezlerden faydalanır. Çerez türlerimiz:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-neutral-200 p-4">
                <span className="block font-black text-xs text-neutral-900 mb-1">Zorunlu Çerezler</span>
                <p className="text-xs text-neutral-500 m-0">
                  Oturum açma, form güvenliği ve CSRF saldırılarını engellemek için vazgeçilmez teknik çerezlerdir.
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-4">
                <span className="block font-black text-xs text-neutral-900 mb-1">İşlevsel Çerezler</span>
                <p className="text-xs text-neutral-500 m-0">
                  Filtreleme tercihlerinizi, harita yakınlaştırma ayarlarınızı ve tema tercihlerinizi hatırlar.
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-4">
                <span className="block font-black text-xs text-neutral-900 mb-1">Analitik Çerezler</span>
                <p className="text-xs text-neutral-500 m-0">
                  Anonimleştirilmiş trafik verilerini analiz ederek sitemizi geliştirmemize yardımcı olur.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Veri Güvenliği Standartları */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-black text-neutral-950">6. Veri Güvenliği ve Koruma Tedbirleri</h2>
            <p>
              Platformumuzda saklanan tüm hassas veriler; endüstri standardı TLS 1.3 / SSL uçtan uca şifreleme, bcrypt/scrypt tuzlanmış parola karma algoritmaları, otomatik yedekleme sistemleri ve yetkisiz erişimleri engelleyen güvenlik duvarları ile korunmaktadır.
            </p>
          </section>

          {/* 7. İlgili Kişinin Hakları */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-black text-neutral-950">7. KVKK Kapsamındaki Haklarınız (Madde 11)</h2>
            <p>
              Kanun&apos;un 11. maddesi gereğince, veri sahibi olarak dilediğiniz zaman <strong>{SITE_DOMAIN}</strong>&apos;e başvurarak:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-neutral-600">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme,</li>
              <li>Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,</li>
              <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde verilerin silinmesini veya yok edilmesini talep etme,</li>
              <li>Düzeltme ve silme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
              <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.</li>
            </ul>
          </section>

          {/* 8. İletişim ve Başvuru */}
          <section className="mt-4 flex flex-col gap-4 rounded-2xl bg-neutral-900 p-6 text-white">
            <div className="flex items-center gap-2">
              <IconBolt className="h-5 w-5 text-sky-400" />
              <h3 className="text-base font-black text-white m-0">8. Başvuru ve İletişim</h3>
            </div>
            <p className="text-xs text-neutral-300 m-0 leading-relaxed">
              KVKK kapsamındaki taleplerinizi, kimliğinizi tevsik edici belgeler ile birlikte resmi iletişim kanallarımız üzerinden iletebilirsiniz. Başvurularınız en geç 30 (otuz) gün içerisinde ücretsiz olarak sonuçlandırılacaktır.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-neutral-300 pt-2 border-t border-white/10">
              <div>
                <span className="text-neutral-500 block uppercase text-[10px]">E-Posta:</span>
                <a href={`mailto:${SITE_EMAIL}`} className="text-sky-400 hover:underline">
                  {SITE_EMAIL}
                </a>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase text-[10px]">Telefon:</span>
                <a href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`} className="text-white hover:underline">
                  {SITE_PHONE}
                </a>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase text-[10px]">Konum / Ülke:</span>
                <span className="text-white">{SITE_LOCATION}</span>
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
