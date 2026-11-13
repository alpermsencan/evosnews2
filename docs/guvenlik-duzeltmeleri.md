# Güvenlik düzeltmelerini Hostinger'a alma

Bu değişiklik yönetici parolasındaki sabit giriş yollarını, doğrulanmamış sosyal
girişi, yükleme klasöründen dosya okuma açığını ve yönetim API'lerindeki eksik
yetkileri kapatır. Eski yönetici ve üye oturumları yeni token sürümü nedeniyle
geçersiz olur; kullanıcılar yeniden giriş yapar.

## Dağıtımdan önce

Hostinger uygulamasının ortam ayarlarında şu değerleri kontrol edin. Gerçek
değerleri Git'e veya mesajlara yazmayın:

- `AUTH_SECRET`: en az 32 karakterlik, rastgele üretilmiş **yeni** bir değer.
  Önceki kodda dosya okuma riski bulunduğundan eski değeri yeniden kullanmayın.
- `ADMIN_USERNAME`: kullanacağınız yönetici adı. Tanımlanmazsa `admin` kullanılır.
- `ADMIN_PASSWORD`: en az 12 karakterlik, benzersiz ve **yeni** parola. Sabit varsayılan parola
  artık kabul edilmez. Alternatif olarak veritabanındaki etkin `admin` rolündeki
  bir hesap kendi kullanıcı adı/e-posta ve parolasıyla giriş yapabilir.
- `DATABASE_URL`: mevcut MongoDB bağlantısı; eski sürüm aynı açıklara maruz
  kaldıysa veritabanı parolasını da sağlayıcıdan yenileyin.
- `NEXT_PUBLIC_SITE_URL`: gerçek HTTPS site adresi; yeniden derleme gerekir.
- `CRON_SECRET`: haber görevi için yeni, güçlü bir değer. Zamanlayıcıdaki değeri
  de eş zamanlı güncelleyin.

Cloudinary/OpenRouteService gibi mevcut sırları da önceki sürümün canlıda aynı
kodla çalıştığı durumda yenileyin. Kayıtlı OCPI tokenlarını yönetim panelinden
yeniden oluşturun; yeni tokenlar kriptografik rastgele üretilir. Sürüm 2 kaydı
olmayan eski OCPI tokenları kabul edilmez; önceki açık üzerinden kaydedilmiş
tokenlar böylece erişim sağlamaya devam edemez. Veritabanı üzerinden giriş yapan
yönetici hesaplarının eski/kısa parolalarını da yenileyin.

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` isteğe bağlıdır. Yalnızca tarayıcı anahtarı
kullanın; Google Console'da site alan adı ve gereken Maps API'leriyle
sınırlandırın. Tanımlı değilse harita yerine istasyon listesi kullanılabilir.

Sosyal giriş, gerçek OAuth/OIDC sağlayıcı doğrulaması kurulana kadar kapalıdır;
Google/Facebook düğmeleri kaldırılmıştır. E-posta/parola girişi çalışmaya devam
eder. Yeni üyeliklerde en az 12 karakter parola gerekir.

OCPI pull entegrasyonu için operatörden alınmış HTTPS uç noktası ve token
gerekir: `OCPI_ZES_URL`/`OCPI_ZES_TOKEN`, `OCPI_ESARJ_URL`/`OCPI_ESARJ_TOKEN`,
`OCPI_TRUGO_URL`/`OCPI_TRUGO_TOKEN`. Eksik bağlantılar atlanır; üretimde örnek
istasyon üretilmez. Gelen verinin ülke/operatör kapsamı yazmadan önce denetlenir.

Finansman kartlarında tarihli kaynak kanıtı olmayan eski kampanya oranları
gizlenir; resmî banka bağlantıları kalır. Gerçek bir kampanyayı yayımlamak için
`verifiedAt`, `validUntil` ve HTTPS `verificationUrl` alanlarını doğrulanmış
bilgilerle doldurun. Süresi geçmiş kampanya kendiliğinden görünmez olur.

## Derleme ve şema

```sh
npm ci
npm run db:generate
npm run db:push
npm run build
NODE_ENV=production node server.js
```

`db:push`, eklenen `VehicleSyncLog` koleksiyonu/indekslerini hazırlar. Komuta
`--accept-data-loss` veya sıfırlama seçeneği eklemeyin; beklenmedik veri kaybı
uyarısı varsa uygulamadan önce inceleyin. Bu çalışma üretim veritabanında şema
komutu çalıştırmaz.

`build` komutu `.next/static` ve `public` dosyalarını standalone paketine de
kopyalar. Böylece `server.js` ile başlatıldığında JavaScript/CSS/logo dosyaları
eksik kalmaz. Sunucu portunu Hostinger'ın verdiği `PORT` belirler.

Kalıcı yerel görselleriniz varsa `UPLOADS_DIR` ile yalnızca yüklemelere ayrılmış
mutlak klasörü belirtebilirsiniz. Bu klasör uygulama kökü veya sırların tutulduğu
klasör olmamalıdır. Cloudinary yüklemeleri bu ayarı kullanmaz.

## Yayından sonra kontrol

- `/api/health` HTTP 200, `dbConnected: true` dönmeli.
- `/arac-merkezi` açılmalı; `/istasyonlar` `/sarj-agi` adresine yönlenmeli.
- Giriş yapmadan `/api/leads`, `/api/newsletter`, `/api/stats` HTTP 401 dönmeli.
- Yönetici girişi yeni yapılandırılmış bilgilerle çalışmalı; yönetim araç
  senkronizasyon ekranının veri isteği HTTP 200 dönmeli.
- Eski görsel adreslerinin, logo ve `/_next/static/` kaynaklarının açıldığını
  kontrol edin. Harici resimler gerçek kaynak sitelerde ayrıca doğrulanmalı.
- Mobilde üstteki giriş düğmesi ve harita yapılandırılmadığında istasyon listesi
  kullanılabilmeli.

Uygulama içi hız sınırı her Node sürecinde uygulanır. Birden fazla kopya
çalıştırıyorsanız Hostinger/CDN/WAF katmanında da ortak hız sınırı kullanın.
Kod güvenlik başlıklarını ekler; gerçek HTTPS/TLS ve yönlendirme yapılandırması
Hostinger'da ayrıca doğrulanmalıdır.

ÖTV gösterimi ve varsayılan hesaplayıcı `lib/otv.ts` içindeki ortak eşik/oranları
kullanır. Mevzuat değiştiğinde bu dosyayı güncelleyin ve resmî kaynakla doğrulayın.
Kayıtlı bir aracın fiyat kırılımı, o kaydın kendi vergi oranını kullanır.

Katalogda bulunmayan vitrin modelleri için sahte ayrıntı bağlantısı ve yedek
fiyat üretilmez. Satış tablosu marka kataloğuna gider; tanımlı haber kategorileri
boş veritabanında da boş durum sayfası gösterir. Bilinmeyen kategoriler 404 kalır.
Renault adaptöründeki tarihsel yedek fiyatlar veritabanına yazılmaz; canlı fiyat
ayrıştırması doğrulanana kadar bu adaptör yalnızca görselleri günceller.

## Geliştirici kontrolleri

```sh
npm run typecheck
npm test
npm run lint
npm audit --audit-level=low
npm run build
```

Tip kontrolü uygulama, bileşenler, kütüphaneler ve Next.js giriş/config dosyalarını
kapsar. Kök klasördeki eski tek kullanımlık tarama betikleri üretim uygulamasının
derlemesine dahil değildir. CommonJS `.js` araç betikleri için `require` biçimi
korunur. ESLint uyarıları ile hataları birbirinden ayırın; derleme artık tip
hatalarını atlamaz.
