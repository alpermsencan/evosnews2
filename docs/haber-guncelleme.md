# Haber güncelleme sistemi

## Hostinger'da zamanlama

`vercel.json` içindeki cron yalnızca Vercel'de çalışır. Kaynak kayıtlarındaki
`schedule` alanı bilgi amaçlıdır; Hostinger'da kendiliğinden zamanlama oluşturmaz.

Hostinger uygulamasında çalışan bir MongoDB `DATABASE_URL` ve `CRON_SECRET`
tanımlayın. Ücretli yeniden yazım istenirse `OPENAI_API_KEY` de tanımlanabilir.
Yapay zekâ anahtarı olmadan mevcut akış kısa özet ve özgün kaynağa bağlantı
yayımlar. Her iki modda da kaynağın `autoPublish` ayarı kapalıysa kayıt editörün
onayını bekler. Kaynakları ve bu ayarı `/admin/kaynaklar` üzerinden yönetin.

Hostinger'ın zamanlanmış görevlerinde veya kullandığınız dış zamanlayıcıda
`0 */2 * * *` (iki saatte bir) zamanlamasıyla aşağıdaki isteği çalıştırın.
`SITE_URL` sitenin HTTPS adresidir; `CRON_SECRET` uygulamadakiyle aynı olmalıdır.
Bu değişkenleri sunucu/zamanlayıcı ayarlarından sağlayın; sırları Git'e eklemeyin.

```sh
curl --silent --show-error --fail-with-body --max-time 300 \
  --header "Authorization: Bearer ${CRON_SECRET}" \
  "${SITE_URL}/api/cron/news"
```

Uygulamanın ortam değişkenleri zamanlanmış göreve otomatik aktarılmayabilir;
zamanlayıcının da bu iki değişkene eriştiğini kontrol edin. İlk çalışmada kaynak
tanımları oluşturulur; sıfırlama (`setup?reset=1`) gerekmez. Sıfırlama mevcut
kaynak ayarlarını değiştirir ve bazı haberleri silebilir.

Diğer veri kümeleri ve arşiv bakımı için mevcut `/api/cron/daily` görevi ayrı
olarak günde bir çalıştırılabilir. Bu görev haberlerin yanı sıra döviz, istasyon,
fiyat ve arşiv işlemlerini de içerir. `news` isteği yalnızca haber akışını yürütür.

## Sonuçları kontrol etme

- **200:** Kaynaklar hatasız işlendi. Yeni haber olmaması da normaldir.
- **207:** En az bir kaynak/kayıt başarısız oldu; başarılı değişiklikler korunur.
  `sources[].status`, `failed` ve `notes` alanlarını inceleyin. `daily` görevi
  ayrıca veri tazeliği sorunlarında da 207 döner.
- **500:** Haber görevinin bütün kaynakları hata verdi.
- **401:** `CRON_SECRET` eksik veya gönderilen değer eşleşmiyor.

`curl --fail-with-body`, 207'yi hata saymaz. İzleme aracında yalnızca 200'ü tam
başarı olarak değerlendirin. Kaynakların son çalışma ayrıntıları yönetim
panelinde görülür; kısmi hatalar son başarılı çalışma tarihini ilerletmez.

RSS/Atom taraması kaynak başına en fazla 500 kayıt inceler. Konu dışı veya
önceden işlenmiş haberler yeni/değişen haber kotasını tüketmez. Yayındaki ya da
editörün karar verdiği mevcut kayıtların üzerine yazılmaz. Besleme erişilemiyorsa
önceden toplanmış taslaklar yine işlenir. Süre bütçesi bitince kalan işler bir
sonraki çalışmaya bırakılır.

## Geliştirme kontrolü

```sh
npm run test:ingest
npm run build
```

Haber testleri gerçek RSS/Atom işleyicisini, cron yanıtlarını ve çalışma
kayıtlarını denetler; HTTP, model ve veritabanı sınırları taklit edildiğinden
ağ erişimi, canlı veri veya API anahtarı gerekmez.
