# Evos Gazete — Elektrikli Araç Haber Platformu

Hürriyet tarzı header + sidebar yapısına sahip, elektrikli araç temalı gazete.
Next.js 16 (App Router) + MongoDB + Prisma + Tailwind CSS v4. Admin paneli dahil.

## Kurulum

```bash
npm install
npm run db:generate     # Prisma client üret
npm run db:push         # MongoDB koleksiyon + indexleri oluştur
npm run db:vehicles     # Araç kataloğunu doğrulanmış verilerle doldur
npm run db:tariffs      # Şarj operatörü tarifelerini aktar
npm run dev

# Kaynak tanımlarını oluştur ve ilk veri çekimini yap (sunucu ayakta iken):
curl "http://localhost:3000/api/cron/setup?key=$CRON_SECRET"
curl "http://localhost:3000/api/cron/daily?key=$CRON_SECRET"
```

**Örnek/seed veri yoktur.** Sitedeki her kayıt ya bir dış kaynaktan otomatik
gelir, ya kullanıcıdan (yorum, gönderi, talep), ya da yönetim panelinden
operatör tarafından girilir. İlk kurulumdaki örnek veriyi temizlemek için:

```bash
npm run db:purge-seed -- --dry   # prova: neyin silineceğini raporlar
npm run db:purge-seed            # temizler
```

`.env` içinde `DATABASE_URL` (MongoDB Atlas) tanımlıdır.

> **`ADMIN_PASSWORD` üretimde ZORUNLUDUR.** Tanımlı değilse `/admin` tamamen
> kapanır ve giriş `503 Yönetim girişi yapılandırılmamış` döner (geliştirmede
> `evos2026` varsayılanına düşer). Vercel'e dağıtırken bu değeri proje
> ayarlarındaki *Environment Variables* bölümüne de eklemeyi unutmayın —
> `.env` dosyası depoya girmez.
Üye oturumları `AUTH_SECRET` ile imzalanır — bu değeri değiştirirseniz açık tüm üye
oturumları düşer.

## Yapı

```
app/
  page.tsx                 Anasayfa (manşet carousel + gündem + servisler + sağ sütun)
  haber/[slug]             Haber detayı (galeri, etiketler, yorumlar)
  kategori/[slug]          Kategori listesi + sayfalama
  ara                      Birleşik arama (haber + araç + istasyon)
  araclar, araclar/[slug]  Araçları Keşfet: filtreler, karşılaştırma tablosu, detay
  arac-merkezi             Araç Merkezi: incelemeler, segment şampiyonları
  sarj-agi                 Şarj ağı: Open Charge Map envanteri, filtre, il dağılımı, rota
  sarj-fiyatlari           Şarj fiyatları: operatör tarife karşılaştırması (AC / DC / ultra)
  ilanlar, ilanlar/[slug]  Pazaryeri: sıfır + ikinci el ilanlar, VoltScore, batarya raporu
  ilanlar/yeni, ilanlarim  Üye ilan verme ve kendi ilanlarını yönetme
  karsilastir              Sıfır katalog modeli + ikinci el ilan aynı tabloda
  batarya-raporu           Batarya raporu nedir, nasıl üretilir
  finansman                Vergi + kredi taksiti + enerji maliyeti hesaplayıcı
  topluluk/[slug]          Model bazlı topluluk (araç slug'ı)
  hakkinda, iletisim, pro  Kurumsal sayfalar ve ticari katman
  otv-rehberi              ÖTV dilimleri + canlı ÖTV/KDV hesaplayıcı
  fiyat-analizi            Katalogdan hesaplanan fiyat/menzil/segment analizi
  ai-danisman              AI Danışman sihirbazı (/api/advisor skorlaması) + sesli asistan
  evos-protect             Batarya güvencesi danışmanlığı + talep formu
  dijital-garaj            Dijital garaj tanıtımı + erken erişim formu
  topluluk                 Topluluk panosu (konu açma, beğeni, anket)
  platform                 Platform modülleri, API dokümanı, iletişim
  admin/*                  Yönetim paneli (aşağıda)
  api/*                    Route handler'lar (aşağıda)
components/
  layout/                  Header, Sidebar (drawer), TickerBar, BreakingBar, Footer, MobileBottomNav
  home/HeroCarousel        Otomatik geçişli, swipe destekli manşet carousel
  news/, vehicles/, stations/, community/, social/, tools/, admin/, ui/
lib/
  prisma.ts                Singleton Prisma client
  queries.ts               Sunucu bileşenleri için doğrudan DB sorguları
  utils.ts                 TL/tarih formatları, slugify, ÖTV hesabı
  nav.ts                   Menü yapıları
prisma/
  schema.prisma            14 model (Article, Category, Author, Comment, Vehicle,
                           ChargeStation, CommunityPost, Ticker, PriceIndex,
                           OtvBracket, Poll, Subscriber, Lead, DataSource, IngestRun)
  vehicles.data.mjs        Araç kataloğu — kaynağı belirtilmiş gerçek veri
  import-vehicles.mjs      Katalogdan veritabanına aktarım (idempotent)
  purge-seed.mjs           İlk kurulumdaki örnek veriyi temizler
lib/ingest/                Dış kaynak adaptörleri, yeniden yazım, arşiv temizliği
middleware.ts              /admin koruması + layout ayrımı için x-pathname header'ı
```

## Üyelik ve sosyal katman

Okuyucular ücretsiz üye olup yorum yapar, beğenir, haber kaydeder, birbirini takip eder
ve bildirim alır. Oturum, `AUTH_SECRET` ile imzalanan JWT'nin `evos_session` adlı
httpOnly cookie'sinde tutulur; şifreler `bcryptjs` ile hash'lenir. Harici bir kimlik
sağlayıcı (Google/Apple) yoktur — kimlik doğrulama e-posta + şifredir.

| Sayfa | İşlev |
|---|---|
| `/kayit` | Ücretsiz üyelik (kullanıcı adı boşsa addan üretilir) |
| `/giris` | E-posta **veya** kullanıcı adı + şifre ile giriş |
| `/profil/[username]` | Herkese açık profil: bio, şehir, sayaçlar, beğendiği haberler, yorum akışı, takip et |
| `/hesabim` | Profil düzenleme (Cloudinary avatar, bio, şehir, link) + şifre değiştirme |
| `/hesabim/kaydedilenler` | Okuma listesi |
| `/bildirimler` | Yanıt / beğeni / takip bildirimleri (açılışta okundu işaretlenir) |

Neler yapılabilir:

- **Yorum ve yanıt** — yorumlar tek seviye yanıt zinciri destekler; üye kendi yorumunu
  siler (yanıtları da gider), yönetici hepsini siler.
- **Beğeni** — hem haber hem yorum için aç/kapat; `ArticleLike` / `CommentLike`
  tablolarında `(hedef, kullanıcı)` unique olduğu için mükerrer beğeni imkânsız.
- **Kaydetme** — haber detayındaki *Kaydet* butonu okuma listesine ekler.
- **Takip** — profilden takip et/bırak, takipçi sayacı anlık güncellenir.
- **Bildirim** — yorumun yanıtlandığında/beğenildiğinde ve biri seni takip ettiğinde
  düşer; header zilinde okunmamış sayısı görünür. Aynı kişinin aynı hedefteki okunmamış
  bildirimi tekrarlanmaz (beğen/geri al gürültüsü engellenir).
- **Moderasyon** — `/admin/uyeler`: rol (üye/editör/admin), askıya alma, silme. Askıya
  alınan üye giriş yapamaz, yorum yazamaz ve profili 404 döner.

Geriye dönük uyumluluk: üyelik öncesi yorumların `userId` alanı boştur; bu yorumlar
`name` alanıyla görünmeye devam eder, yalnızca profil bağlantısı taşımaz. **Yeni yorum
yazmak için giriş zorunludur** (anonim yorum kapalıdır). Bir üye silindiğinde yorumları
anonim olarak korunur.

## Admin paneli

`/admin` (giriş: `/admin/giris`)

| Sayfa | İşlev |
|---|---|
| `/admin` | Gösterge paneli: sayaçlar, en çok okunanlar, kategori dağılımı, son yorum/talepler |
| `/admin/haberler` | Haber listesi, ekleme (`/yeni`), düzenleme (`/[id]`), silme |
| `/admin/kategoriler` | Kategori CRUD (renk, sıra, üst menü) |
| `/admin/yazarlar` | Yazar CRUD |
| `/admin/yorumlar` | Yorum moderasyonu / silme |
| `/admin/araclar` | Araç kataloğu CRUD (tüm teknik alanlar) |
| `/admin/istasyonlar` | Şarj istasyonu CRUD |
| `/admin/tarifeler` | Şarj operatörü tarifeleri (AC / DC / ultra ₺/kWh) |
| `/admin/ilanlar` | İlan moderasyonu + batarya raporu girişi ve doğrulama |
| `/admin/garaj` | Dijital garaj: model bazlı yazılım özellikleri |
| `/admin/topluluk` | Topluluk gönderileri |
| `/admin/gosterge` | Üst veri şeridi + anket sonuçları |
| `/admin/aboneler` | Bülten aboneleri |
| `/admin/talepler` | Form talepleri (lead) |

### Görsel yükleme (Cloudinary)

Görsel alanları (`kapak görseli`, `galeri`, `avatar`, `araç görselleri`) dosya yükler
veya hazır URL kabul eder. Yükleme yapmak zorunlu değildir; URL kutusu düzenlenebilir kalır.
Araç görseli girilmediğinde yerel `/arac-placeholder.svg`, haber görseli bulunamadığında
`/haber-placeholder.svg` kullanılır.

`.env` içine Cloudinary anahtarlarını girin (console.cloudinary.com → Dashboard):

```
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
CLOUDINARY_FOLDER="evos"
```

Yükleme `POST /api/upload` üzerinden sunucu tarafında imzalanır (admin cookie'si zorunlu,
maks. 10 MB, jpeg/png/webp/avif/gif). Görseller 2000px'e sınırlanır, `quality:auto` +
`fetch_format:auto` uygulanır. `next.config.ts` içinde `res.cloudinary.com` zaten tanımlı.

### Zengin metin editörü (react-quill-new)

Haber içeriği `react-quill-new` (Quill 2) ile düzenlenir: başlık, kalın/italik, renk,
liste, hizalama, alıntı, kod bloğu, bağlantı, görsel ve video. Toolbar'daki görsel butonu
base64 gömmek yerine dosyayı Cloudinary'ye yükleyip URL'i metne ekler.

Eski kayıtlar boş satırla ayrılmış düz metindi; `contentToHtml()` (lib/utils.ts) bunları
hem editörde hem yayın tarafında paragraflara çevirir, dolayısıyla **eski haberler
dokunulmadan çalışmaya devam eder**. Yeni içerikler HTML olarak saklanır ve
`/haber/[slug]` sayfasında `.article-body` stilleriyle render edilir.

## Otomatik veri akışı (ingest)

Sitedeki veri her sabah **07:00'de (TRT)** tek bir cron ile tazelenir:
`vercel.json` → `/api/cron/daily` (04:00 UTC). Uç nokta `CRON_SECRET` ile korunur;
sır tanımlı değilse tamamen kapalıdır. Elle tetiklemek için `?key=$CRON_SECRET`.

Günlük çalışma sırayla şunları yapar: kur → (haftada bir) şarj envanteri →
pazar göstergeleri → haber toplama ve yeniden yazım → konu yönlendirmesi →
arşiv temizliği → **tazelik denetimi**. Bayat veri kümesi varsa yanıt **HTTP 207**
döner, böylece Vercel cron kaydında ve dış izlemede görünür.

| Kaynak | Ne getirir | Sıklık |
|---|---|---|
| TCMB `today.xml` | USD / EUR / GBP kuru | Her gün |
| Open Charge Map | Türkiye şarj istasyonu envanteri (ODbL) | Haftada bir |
| Katalog türevi | EV ort. fiyat, ort. menzil, soket/istasyon sayaçları, aylık fiyat endeksi | Her gün |
| RSS beslemeleri | DonanımHaber, ShiftDelete, Webrazzi, Log, Electrek, InsideEVs, electrive, Charged EVs | Her gün |

### Haberde telif güvenliği

Kaynağın metni **hiçbir zaman kopyalanmaz**. Akış iki aşamalıdır:

1. **Toplama** — besleme okunur, yeni başlıklar `DRAFT` olarak kuyruğa yazılır.
   Bu aşamada yalnızca başlık, kısa özet ve kanonik bağlantı tutulur.
2. **Yeniden yazma** — `lib/ingest/rewrite.ts` kaynak sayfayı yalnızca *olgu*
   çıkarımı için okur ve haberi **sıfırdan Türkçe yeniden yazar** (OpenAI).
   Üretilen metin kaynağa fazla benziyorsa (60+ karakterlik ortak cümle)
   reddedilir. Yeniden yazılamayan hiçbir haber yayına çıkmaz — kuyrukta kalır
   ve `/admin/kuyruk` üzerinden editör karar verir.

Yayınlanan her haberde kaynak adı, kanonik bağlantı ve görsel için `imageCredit`
atfı korunur. Yeniden yazım aynı zamanda çeviri yaptığı için İngilizce kaynaklar
da doğrudan Türkçe yayına girer.

`OPENAI_API_KEY` tanımlı değilse yeniden yazım çalışmaz ve haberler `DRAFT`
olarak kuyrukta bekler; kaynağın metni asla yayına düşmez.

Cron'un süre bütçesi dolduğunda kalan taslaklar bir sonraki çalışmaya bırakılır
(`IngestContext.deadline`), böylece iş yarım kalmaz.

### Tazelik denetimi

"Cron çalıştı" ile "veri güncel" aynı şey DEĞİLDİR: bir besleme sessizce boş
dönebilir, bir API anahtarının süresi dolabilir, ya da hiçbir cron'un dokunmadığı
bir küme (araç kataloğu, operatör tarifeleri) aylarca eskiyebilir.

`lib/freshness.ts` her veri kümesine "en son ne zaman tazelendin?" diye sorar ve
eşiği aşanı işaretler. Eşikler cron sıklığından türetilir, tahmin değildir.

| Küme | Eşik | Tazeleme |
|---|---|---|
| Haberler | 36 saat | otomatik (günlük) |
| Döviz kurları | 96 saat | otomatik — TCMB hafta sonu yayın yapmaz, eşik tatili kapsar |
| Şarj istasyonları | 10 gün | otomatik (haftalık) |
| Fiyat endeksi | 36 saat | otomatik (günlük) |
| Şarj tarifeleri | 30 gün | **elle** |
| Araç kataloğu | 45 gün | **elle** |

Rapor iki yerde görünür: `/admin/kaynaklar` sayfasının üstünde tablo olarak ve
`/api/cron/health` ucunda JSON olarak. Bayat küme varsa uç nokta HTTP 207 döner —
UptimeRobot benzeri bir izleyici bu kodu alarm olarak kullanabilir.

### Arşiv temizliği

Aynı cron, 30 günden eski **otomatik** haberleri siler (`lib/ingest/prune.ts`).
Elle girilen haberlere (`ingestedAt` boş) dokunulmaz. Yayına alınamamış
taslaklar 7 gün sonra kuyruktan düşer.

### Kategori yönlendirmesi

Kaynak tanımındaki `categorySlug` bir beslemenin TAMAMI için tek hedef belirler;
bu yüzden Electrek'ten gelen her haber "dunya"da yığılıyor, konu sayfaları
(şarj ağı, araç merkezi, test sürüşü, fiyat analizi) hiç haber görmüyordu.
`lib/ingest/route-category.ts` haberi başlık, spot ve etiketlerindeki konuya
göre doğru kategoriye taşır. Kurallar sıralıdır ve dardan genişe gider
("ötv indirimi" haberi ÖTV'ye gider, fiyat analizine değil). Hiçbir kural
eşleşmezse kaynağın kendi kategorisi korunur — emin olunmayan haber taşınmaz.

Yönlendirme iki kez çalışır: toplama sırasında (başlık çoğu zaman İngilizcedir)
ve yeniden yazımdan sonra (metin artık Türkçedir). Kurallar değiştiğinde arşiv
yeniden dağıtılabilir:

```bash
curl "$SITE_URL/api/cron/recategorize?key=$CRON_SECRET"
```

Bu uç yalnızca otomatik gelen haberlere dokunur; elle girilmiş haberde
editörün seçtiği kategori korunur.

### Şarj tarifeleri

Şarj fiyatı Open Charge Map verisinde YOKTUR — operatörler tarifelerini yalnızca
kendi sitelerinde yayımlar. `OperatorTariff` bu fiyatları operatör bazında,
kademeleriyle (AC ≤22 kW / DC <150 kW / DC ultra ≥150 kW), kaynağıyla ve
doğrulama tarihiyle tutar. Operatörün o kademede hizmeti yoksa alan BOŞ kalır ve
arayüz "—" gösterir; 0 yazmak "ücretsiz şarj" anlamına gelirdi.

İstasyon envanterindeki operatör adları tarife kayıtlarıyla birebir aynı değildir
("ZES" ↔ "ZES (Zorlu)"); `lib/tariffs.ts` parantezli ekleri atıp Türkçe harfleri
katlayarak eşleştirir, tutmayan istisnalar için panelden alias yazılır.
Eşleşme bulunamazsa tarife GÖSTERİLMEZ.

Tarifeler üç yerde görünür: `/sarj-fiyatlari` (tam karşılaştırma tablosu),
`/sarj-agi` operatör özeti ve pazar göstergeleri — anasayfadaki "AC şarj" /
"DC şarj" satırları tarifelerin ORTANCASIDIR (ortalama değil: tek bir yüksek
sabit tarife tipik fiyatı yanıltacak kadar yukarı çekiyor).

### Yeni kaynak eklemek

Haber kaynağı eklemek için kod değişikliği gerekmez: `/admin/kaynaklar`
sayfasından besleme adresi, hedef kategori ve konu filtresi (anahtar kelimeler)
tanımlanır. `!` ile başlayan anahtar kelimeler negatiftir ve eşleşen haberi eler.

### Gerekli ortam değişkenleri

```
CRON_SECRET=""                   # /api/cron/* koruması (zorunlu)
OPENAI_API_KEY=""                # haber yeniden yazımı
OPENAI_MODEL="gpt-4o-mini"
OPENCHARGEMAP_API_KEY=""         # şarj istasyonu envanteri
OPENROUTESERVICE_API_KEY=""      # istasyon rotası + ters geokodlama
NEXT_PUBLIC_SITE_URL=""          # sitemap, RSS, OG etiketleri
```

## API uçları

| Metot | Uç nokta | Açıklama |
|---|---|---|
| GET/POST | `/api/articles` | Liste (kategori, arama, sayfalama, sıralama) / oluşturma |
| GET/PUT/DELETE | `/api/articles/[id]` | Tekil haber |
| POST/DELETE | `/api/upload` | Cloudinary görsel yükleme / silme (admin: her klasör, üye: yalnızca avatar) |
| POST | `/api/account/register`, `/api/account/login`, `/api/account/logout` | Üyelik ve oturum |
| GET | `/api/account/me` | Oturumdaki üye + sayaçlar |
| GET/PUT | `/api/account/profile` | Profil bilgileri ve şifre değişimi |
| GET | `/api/account/bookmarks` | Okuma listesi |
| GET | `/api/users/[username]` | Herkese açık profil özeti |
| POST | `/api/users/[username]/follow` | Takip et / bırak |
| POST | `/api/articles/[id]/like`, `/api/articles/[id]/bookmark` | Haber beğeni / kaydetme |
| GET/PUT | `/api/notifications` | Bildirim listesi / okundu işaretleme |
| GET | `/api/admin/users` | Üye listesi (admin) |
| PUT/DELETE | `/api/admin/users/[id]` | Rol, askıya alma, silme (admin) |
| GET/POST/PUT/DELETE | `/api/categories`, `/api/categories/[id]` | Kategori |
| GET/POST/DELETE | `/api/authors` | Yazar |
| GET/POST/PUT/DELETE | `/api/comments`, `/api/comments/[id]`, `/api/comments/[id]/like` | Yorum |
| GET/POST/PUT/DELETE | `/api/vehicles`, `/api/vehicles/[id]` | Araç kataloğu + filtreler |
| GET/POST/PUT/DELETE | `/api/stations`, `/api/stations/[id]` | Şarj istasyonları |
| GET/POST/PUT/DELETE | `/api/tariffs`, `/api/tariffs/[id]` | Şarj operatörü tarifeleri |
| GET/POST | `/api/listings` | İlan listesi (yayındakiler) / üye ilan verir (PENDING) |
| GET/PUT/DELETE | `/api/listings/[id]` | Tekil ilan (sahibi veya yönetici) |
| POST | `/api/listings/[id]/favorite` | Favoriye ekle / çıkar (üye) |
| POST/PUT | `/api/listings/[id]/battery-report` | Ölçüm kaydı / doğrulama (admin) |
| GET | `/api/compare` | Karşılaştırma sepetindeki kayıtları ortak şemada döndürür |
| GET/POST/DELETE | `/api/garage` | Dijital garaj yazılım özellikleri (admin) |
| GET/POST/PUT/DELETE | `/api/community`, `/api/community/[id]` | Topluluk (POST = beğeni) |
| GET/POST/DELETE | `/api/newsletter` | Bülten kaydı |
| GET/POST/PUT/DELETE | `/api/leads` | İletişim/teklif talebi |
| GET/POST | `/api/poll` | Anket ve oylama |
| GET/POST | `/api/otv` | ÖTV dilimleri / hesaplama |
| GET | `/api/prices` | Aylık fiyat endeksi ve katalogdan türetilen sayaçlar |
| GET | `/api/route-to` | İstasyona gerçek sürüş rotası (OpenRouteService) |
| GET | `/api/cron/[job]` | `daily` \| `news` \| `stations` \| `fx` \| `prices` \| `prune` \| `recategorize` \| `health` \| `revalidate` \| `setup` (CRON_SECRET) |
| GET/PUT | `/api/sources` | Veri kaynağı tanımları (admin) |
| GET/PUT | `/api/moderation` | Moderasyon kuyruğu: yayınla / reddet (admin) |
| POST | `/api/advisor` | Kullanım profiline göre araç önerisi + 5 yıllık maliyet |
| GET | `/api/search` | Birleşik arama |
| GET | `/api/stats` | Admin özet istatistikleri |
| POST/DELETE | `/api/auth` | Admin giriş / çıkış |

## Pazaryeri, VoltScore ve batarya raporu

İlanlar üyeden gelir ve **PENDING** olarak düşer; moderasyondan geçmeden sitede
görünmez. Örnek ilanla doldurulmaz — pazaryeri gerçek satıcı ilan verene kadar
boş açılır ve bunu kullanıcıya açıkça söyler.

### VoltScore (`lib/voltscore.ts`)

0-100 arası güven puanı, yedi kriterin ağırlıklı ortalamasıdır: batarya sağlığı
%30, km/yaş dengesi %15, hızlı şarj kullanımı %15, kaza/değişen %12, garanti %10,
servis geçmişi %10, gerçek menzil uyumu %8.

Tasarımın kritik kararı: **eksik kriter uydurulmaz.** Verisi olmayan kriter
puanlamaya hiç girmez ve ağırlığı kalan kriterlere orantılı dağıtılır. Buna
karşılık `coverage` (veri kapsamı) döndürülür ve arayüzde gösterilir — %40
kapsamla çıkan 95 ile %100 kapsamla çıkan 95 aynı şey değildir. Kapsam %35'in
altındaysa puan hiç üretilmez.

### Batarya raporu (`lib/battery-report.ts`)

Rapora yalnızca ÖLÇÜLEN değerler girilir (SOH, çevrim sayısı, DC şarj oranı, km).
Kalan ömür ve risk seviyesi sunucuda hesaplanır; ne form ne API bu alanları
dışarıdan kabul eder — kabul etseydi her rapora "risk: düşük" yazılırdı.

Kapasite kaybı hızı, araç 2+ yaşındaysa kendi geçmişinden ölçülür, değilse tipik
değere düşülür. Doğrulanmamış rapor VoltScore'a KATILMAZ ve ilanda rozet çıkmaz;
satıcı beyanından farkı yoktur. Ölçüm değiştirilirse doğrulama düşer.

## Karşılaştırma sepeti

Seçim `localStorage`'da tutulur ve sayfalar arasında yaşar (`CompareProvider`).
Sepette katalog aracı ile ikinci el ilan BİR ARADA durabilir — "sıfır mı ikinci
el mi" karşılaştırması bu sepetin asıl sebebidir. `/api/compare` iki türü ortak
bir şemaya indirger; ilanın teknik verisi bağlı olduğu katalog modelinden gelir.

## Harita

Şarj ağı haritası hiçbir dış döşeme (tile) sunucusuna bağlanmaz. Ülke sınırı
Natural Earth 1:50m verisinden (kamu malı) tek seferde üretilip `lib/tr-map.ts`
içinde ~5 KB'lık bir SVG yolu olarak saklanır; istasyonlar aynı izdüşümle
üzerine oturur.

Sebebi: OSM'in genel döşeme sunucusu politikası ticari siteler için erişimin
haber verilmeden kesilebileceğini yazar, ücretli sağlayıcılar yükleme başına
ücretlendirir, ücretsiz katmanların çoğu ticari kullanıma kapalıdır. Bu çözümde
API anahtarı, kota ve sağlayıcı bağımlılığı yoktur.

İşaretler güce göre renklenir ve ızgara tabanlı kümelenir; yakınlaştırma
arttıkça hücre küçülür ve kümeler açılır.

## Veri tazeliği

Sayfa okumaları **önbelleklenmez**; her istek veritabanından tazedir. Bu bilinçli
bir tercihtir: Next'in `revalidateTag` çağrısı önbellek girdisini silmez, *bayat*
işaretler — bayat kopya bir sonraki isteğe olduğu gibi servis edilir ve tazeleme
arka planda yapılır. Sonuç olarak panelden yapılan bir düzenlemeden sonra sayfayı
ilk açan ziyaretçi hâlâ eski içeriği görüyordu. Anında geçersiz kılan `updateTag`
ise yalnızca Server Action içinden çağrılabiliyor.

Sitenin tüm sayfaları zaten istek başına render edildiği (kök layout oturumu
sunucuda okuyor) ve sorgular indeksli olduğu için önbellek kaldırıldığında
kazanç ihmal edilebilir, doğruluk kazancı ise doğrudan görünür.

Tek istisna `getPublishedIndex`: sitemap ve RSS için binlerce kayıt döndürür,
okuyucusu arama motoru tarayıcısıdır ve `TAGS.articles` etiketiyle tazelenir.

Veritabanına HTTP dışından yazan bakım betikleri bu etiketi kendileri
temizleyemez; işleri bitince `/api/cron/revalidate` ucunu çağırırlar
(bkz. `prisma/revalidate.mjs`). Elle tetiklemek için:

```bash
curl "$SITE_URL/api/cron/revalidate?key=$CRON_SECRET"          # tüm etiketler
curl "$SITE_URL/api/cron/revalidate?key=$CRON_SECRET&tags=articles"
```

## Notlar

- Sunucu bileşenleri Prisma'ya doğrudan erişir (araya HTTP katmanı girmez); API uçları
  admin paneli, istemci formları ve dış entegrasyonlar için vardır.
- Tüm sayfalar mobil öncelikli, flexbox/grid tabanlı responsive; `lg` altında alt menü
  çubuğu ve hamburger drawer devreye girer.
- Haber görselleri ingest sırasında kaynağın `og:image` adresinden alınır ve
  `imageCredit` ile kaynağa atıf verilir. Bu yüzden `next.config.ts` içindeki
  `remotePatterns`, https üzerinden gelen tüm host'lara izin verir.
- Doğrulanabilir kaynağı olmayan alanlar (araçta DC şarj gücü, bagaj hacmi,
  garanti, editör puanı; istasyonda tarife ve 7/24 bilgisi) veritabanında BOŞ
  bırakılır ve arayüzde "—" görünür. Bu alanlara varsayılan bir sayı yazmak
  uydurma veri üretmek olurdu; değerler yönetim panelinden doğrulanarak girilir.
