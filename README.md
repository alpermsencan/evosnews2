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

## API uçları

| Metot | Uç nokta | Açıklama |
|---|---|---|
| GET/POST | `/api/articles` | Liste (kategori, arama, sayfalama, sıralama) / oluşturma |
| GET/PUT/DELETE | `/api/articles/[id]` | Tekil haber |
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
