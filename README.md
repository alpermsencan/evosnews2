# Evos Gazete — Elektrikli Araç Haber Platformu

Hürriyet tarzı header + sidebar yapısına sahip, elektrikli araç temalı gazete.
Next.js 16 (App Router) + MongoDB + Prisma + Tailwind CSS v4. Admin paneli dahil.

## Kurulum

```bash
npm install
npm run db:generate     # Prisma client üret
npm run db:push         # MongoDB koleksiyon + indexleri oluştur
npm run seed            # Örnek veriyi yükle (49 haber, 20 araç, 26 istasyon, 18 ilan...)
npm run dev
```

`.env` içinde `DATABASE_URL` (MongoDB Atlas) tanımlıdır.
Admin şifresi `ADMIN_PASSWORD` env değişkeni ile değiştirilebilir (varsayılan: `evos2026`).
Üye oturumları `AUTH_SECRET` ile imzalanır — bu değeri değiştirirseniz açık tüm üye
oturumları düşer.

## Yapı

```
app/
  page.tsx                 Anasayfa (manşet carousel + gündem + servisler + sağ sütun)
  haber/[slug]             Haber detayı (galeri, etiketler, yorumlar)
  kategori/[slug]          Kategori listesi + sayfalama
  ara                      Birleşik arama (haber + araç + ilan + istasyon)
  araclar, araclar/[slug]  Araçları Keşfet: filtreler, karşılaştırma tablosu, detay
  arac-merkezi             Araç Merkezi: incelemeler, segment şampiyonları
  sarj-agi                 Şarj Ağı / Evos Charge Network: filtre, tarife tablosu, il dağılımı
  marketplace/[slug]       Evos Market: ikinci el ilanları, ekspertiz, satıcıya mesaj
  otv-rehberi              ÖTV dilimleri + canlı ÖTV/KDV hesaplayıcı
  fiyat-analizi            Evos Fiyat Endeksi (SVG grafikler, değer kaybı, maliyet)
  ai-danisman              AI Danışman sihirbazı (/api/advisor skorlaması)
  voice-intelligence       Sesli asistan tanıtımı + kurumsal talep formu
  evos-protect             Sigorta/garanti paketleri + teklif formu
  dijital-garaj            Dijital garaj demo görünümü, araç geçmişi
  topluluk                 Topluluk panosu (konu açma, beğeni, anket)
  platform                 Platform modülleri, API dokümanı, iletişim
  admin/*                  Yönetim paneli (aşağıda)
  api/*                    Route handler'lar (aşağıda)
components/
  layout/                  Header, Sidebar (drawer), TickerBar, BreakingBar, Footer, MobileBottomNav
  home/HeroCarousel        Otomatik geçişli, swipe destekli manşet carousel
  news/, vehicles/, market/, community/, tools/, admin/, ui/
lib/
  prisma.ts                Singleton Prisma client
  queries.ts               Sunucu bileşenleri için doğrudan DB sorguları
  utils.ts                 TL/tarih formatları, slugify, ÖTV hesabı
  nav.ts                   Menü yapıları
prisma/
  schema.prisma            14 model (Article, Category, Author, Comment, Vehicle,
                           ChargeStation, Listing, CommunityPost, Ticker, PriceIndex,
                           OtvBracket, Poll, Subscriber, Lead)
  seed.mjs                 Örnek veri
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
| `/admin/ilanlar` | Market ilanı CRUD |
| `/admin/topluluk` | Topluluk gönderileri |
| `/admin/gosterge` | Üst veri şeridi + anket sonuçları |
| `/admin/aboneler` | Bülten aboneleri |
| `/admin/talepler` | Form talepleri (lead) |

### Görsel yükleme (Cloudinary)

Görsel alanları (`kapak görseli`, `galeri`, `avatar`, `araç/ilan görselleri`) dosya yükler
veya hazır URL kabul eder. **Mevcut kayıtlardaki picsum/unsplash URL'leri olduğu gibi korunur**;
URL kutusu düzenlenebilir kalır, yükleme yapmak zorunlu değildir.

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
| GET/POST/PUT/DELETE | `/api/listings`, `/api/listings/[id]` | Market ilanları |
| GET/POST/PUT/DELETE | `/api/community`, `/api/community/[id]` | Topluluk (POST = beğeni) |
| GET/POST/DELETE | `/api/newsletter` | Bülten kaydı |
| GET/POST/PUT/DELETE | `/api/leads` | İletişim/teklif talebi |
| GET/POST | `/api/poll` | Anket ve oylama |
| GET/POST | `/api/otv` | ÖTV dilimleri / hesaplama |
| GET | `/api/prices` | Fiyat endeksi ve pazar istatistikleri |
| POST | `/api/advisor` | Kullanım profiline göre araç önerisi + 5 yıllık maliyet |
| GET | `/api/search` | Birleşik arama |
| GET | `/api/stats` | Admin özet istatistikleri |
| POST/DELETE | `/api/auth` | Admin giriş / çıkış |

## Notlar

- Sunucu bileşenleri Prisma'ya doğrudan erişir (araya HTTP katmanı girmez); API uçları
  admin paneli, istemci formları ve dış entegrasyonlar için vardır.
- Tüm sayfalar mobil öncelikli, flexbox/grid tabanlı responsive; `lg` altında alt menü
  çubuğu ve hamburger drawer devreye girer.
- Görseller demo amaçlı `picsum.photos` üzerinden gelir. Gerçek görseller için admin
  panelindeki "GÖRSEL URL" alanına kendi adresinizi girmeniz yeterli
  (`next.config.ts` içindeki `remotePatterns` listesine host eklemeyi unutmayın).
