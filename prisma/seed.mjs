/* eslint-disable */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const img = (seed, w = 1200, h = 675) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const CATEGORIES = [
  {
    name: "Haber Merkezi",
    slug: "haber-merkezi",
    color: "#e30613",
    icon: "newspaper",
    description:
      "Elektrikli mobilite dünyasından son dakika gelişmeleri, sektör analizleri ve gündem başlıkları.",
    order: 1,
    isMainNav: true,
    href: "/kategori/haber-merkezi",
  },
  {
    name: "Araç Merkezi",
    slug: "arac-merkezi",
    color: "#0f766e",
    icon: "car",
    description:
      "Elektrikli araç incelemeleri, test sürüşleri, teknik veriler ve karşılaştırmalar.",
    order: 2,
    isMainNav: true,
    href: "/arac-merkezi",
  },
  {
    name: "Şarj Ağı",
    slug: "sarj-agi",
    color: "#15803d",
    icon: "bolt",
    description:
      "Türkiye şarj altyapısı, yeni istasyonlar, operatör tarifeleri ve yol haritaları.",
    order: 3,
    isMainNav: true,
    href: "/sarj-agi",
  },
  {
    name: "Fiyat Analizi",
    slug: "fiyat-analizi",
    color: "#b45309",
    icon: "chart",
    description:
      "Elektrikli araç fiyat endeksi, ikinci el değer kaybı ve maliyet hesapları.",
    order: 4,
    isMainNav: true,
    href: "/fiyat-analizi",
  },
  {
    name: "ÖTV Rehberi",
    slug: "otv-rehberi",
    color: "#7c3aed",
    icon: "receipt",
    description:
      "Elektrikli araçlarda ÖTV matrahları, vergi dilimleri ve güncel mevzuat.",
    order: 5,
    isMainNav: true,
    href: "/otv-rehberi",
  },
  {
    name: "Marketplace",
    slug: "marketplace",
    color: "#be123c",
    icon: "store",
    description:
      "Evos Market ikinci el elektrikli araç ilanları, ekspertiz ve batarya sağlığı raporları.",
    order: 6,
    isMainNav: true,
    href: "/marketplace",
  },
  {
    name: "Dijital Garaj",
    slug: "dijital-garaj",
    color: "#0369a1",
    icon: "garage",
    description:
      "Aracınızın dijital ikizi: bakım takibi, batarya sağlığı, sigorta ve servis geçmişi.",
    order: 7,
    isMainNav: true,
    href: "/dijital-garaj",
  },
  {
    name: "Topluluk",
    slug: "topluluk",
    color: "#c2410c",
    icon: "users",
    description:
      "Evos kullanıcı topluluğu: deneyimler, sorular, yol notları ve kullanıcı testleri.",
    order: 8,
    isMainNav: true,
    href: "/topluluk",
  },
  {
    name: "Evos Protect",
    slug: "evos-protect",
    color: "#1d4ed8",
    icon: "shield",
    description:
      "Batarya garantisi, genişletilmiş sigorta paketleri ve yol yardım hizmetleri.",
    order: 9,
    isMainNav: true,
    href: "/evos-protect",
  },
  {
    name: "AI Danışman",
    slug: "ai-danisman",
    color: "#4f46e5",
    icon: "sparkles",
    description:
      "Yapay zekâ destekli araç seçimi, maliyet simülasyonu ve kişisel mobilite asistanı.",
    order: 10,
    isMainNav: true,
    href: "/ai-danisman",
  },
  {
    name: "Voice Intelligence",
    slug: "voice-intelligence",
    color: "#0891b2",
    icon: "mic",
    description:
      "Sesle çalışan araç asistanı, doğal dil komutları ve çağrı merkezi otomasyonu.",
    order: 11,
    isMainNav: true,
    href: "/voice-intelligence",
  },
  {
    name: "Platform",
    slug: "platform",
    color: "#334155",
    icon: "layers",
    description:
      "Evos platformunun mimarisi, API'leri, iş ortaklıkları ve entegrasyonları.",
    order: 12,
    isMainNav: true,
    href: "/platform",
  },
  {
    name: "Teknoloji",
    slug: "teknoloji",
    color: "#9333ea",
    icon: "cpu",
    description:
      "Batarya kimyaları, katı hâl teknolojisi, yazılım güncellemeleri ve otonom sürüş.",
    order: 13,
    isMainNav: false,
    href: "/kategori/teknoloji",
  },
  {
    name: "Dünya",
    slug: "dunya",
    color: "#0d9488",
    icon: "globe",
    description:
      "Küresel elektrikli araç pazarı, üretim yatırımları ve regülasyon haberleri.",
    order: 14,
    isMainNav: false,
    href: "/kategori/dunya",
  },
  {
    name: "Test Sürüşü",
    slug: "test-surusu",
    color: "#ca8a04",
    icon: "flag",
    description:
      "Evos test ekibinin uzun yol denemeleri, menzil testleri ve kış performansı ölçümleri.",
    order: 15,
    isMainNav: false,
    href: "/kategori/test-surusu",
  },
];

const AUTHORS = [
  {
    name: "Selin Karaca",
    slug: "selin-karaca",
    title: "Otomotiv Editörü",
    bio: "12 yıldır otomotiv sektörünü takip ediyor, 2019'dan bu yana elektrikli mobilite üzerine yazıyor.",
  },
  {
    name: "Emre Doğan",
    slug: "emre-dogan",
    title: "Şarj Altyapısı Muhabiri",
    bio: "Türkiye'deki şarj ağı yatırımlarını ve operatör tarifelerini raporluyor.",
  },
  {
    name: "Deniz Ateş",
    slug: "deniz-ates",
    title: "Ekonomi Editörü",
    bio: "Vergi, ÖTV ve otomotiv fiyatlama modelleri üzerine analizler hazırlıyor.",
  },
  {
    name: "Burak Şen",
    slug: "burak-sen",
    title: "Test Sürücüsü",
    bio: "Uzun yol menzil testleri ve kış performansı ölçümlerinin sorumlusu.",
  },
  {
    name: "Ayça Yıldırım",
    slug: "ayca-yildirim",
    title: "Teknoloji Editörü",
    bio: "Batarya kimyası, yazılım tanımlı araçlar ve otonom sürüş sistemleri.",
  },
  {
    name: "Mert Aksoy",
    slug: "mert-aksoy",
    title: "Veri Analisti",
    bio: "Evos fiyat endeksi ve ikinci el değer kaybı modellerini yönetiyor.",
  },
  {
    name: "Zeynep Uçar",
    slug: "zeynep-ucar",
    title: "Sürdürülebilirlik Muhabiri",
    bio: "Karbon ayak izi, geri dönüşüm ve enerji politikaları üzerine yazıyor.",
  },
  {
    name: "Onur Kaya",
    slug: "onur-kaya",
    title: "Haber Merkezi Şefi",
    bio: "Son dakika akışını yönetiyor, sektör kaynaklarıyla çalışıyor.",
  },
];

const CLOSERS = [
  "Evos Haber Merkezi konuyla ilgili gelişmeleri takip etmeye devam ediyor; yeni veriler geldikçe haber güncellenecek.",
  "Sektör temsilcileri, önümüzdeki çeyrekte açıklanacak resmî verilerin tabloyu daha net ortaya koyacağı görüşünde.",
  "Uzmanlar, kullanıcıların karar vermeden önce toplam sahip olma maliyetini mutlaka hesaplamasını öneriyor.",
  "Konuya ilişkin detaylı analizi Evos Fiyat Analizi bölümünden takip edebilirsiniz.",
  "Evos kullanıcı topluluğunda konuyla ilgili tartışma sürüyor; deneyimlerinizi siz de paylaşabilirsiniz.",
  "Gelişmelerin tüketici fiyatlarına yansımasının birkaç ay içinde görülmesi bekleniyor.",
];

const A = [
  {
    t: "Togg T10F'in menzil rekoru tescillendi: Tek şarjla 623 kilometre",
    c: "haber-merkezi",
    au: 0,
    tags: ["Togg", "Menzil", "Yerli Üretim"],
    hero: true,
    breaking: true,
    s: "Evos test ekibinin İstanbul-İzmir-Antalya hattında gerçekleştirdiği bağımsız menzil testinde Togg T10F uzun menzil versiyonu, tek şarjla 623 kilometre yol yaptı.",
    p: [
      "Test, ortalama 21 derece dış hava sıcaklığında, klima 22 dereceye sabitlenmiş hâlde ve şehirler arası yolda 110 km/s ortalama hızla gerçekleştirildi. Aracın tüketimi 100 kilometrede 14,8 kWh olarak ölçüldü.",
      "Batarya yüzde 100'den yüzde 3 seviyesine indiğinde toplam mesafe 623 kilometreyi gösterdi. Bu değer, üretici tarafından açıklanan WLTP menzilinin yaklaşık yüzde 96'sına denk geliyor ki bu oran segmentte oldukça iyi kabul ediliyor.",
      "Testte dikkat çeken bir diğer nokta, batarya yönetim yazılımının son yüzde 10'luk dilimde güç kısıtlamasını çok kademeli uygulaması oldu. Sürücü, menzilin sonuna doğru ani bir performans düşüşü yaşamıyor.",
    ],
  },
  {
    t: "Türkiye'de elektrikli araç satışları ilk yarıda yüzde 68 arttı",
    c: "haber-merkezi",
    au: 7,
    tags: ["Pazar", "Satış", "İstatistik"],
    hero: true,
    s: "Otomotiv Distribütörleri ve Mobilite Derneği verilerine göre elektrikli araçların toplam otomobil pazarındaki payı yüzde 19,4'e yükseldi.",
    p: [
      "Yılın ilk altı ayında satılan tam elektrikli otomobil sayısı 104 bini aştı. Geçen yılın aynı döneminde bu rakam 62 bin seviyesindeydi.",
      "Pazar payındaki artışın arkasında genişleyen model yelpazesi, ÖTV matrah düzenlemesi ve şarj altyapısındaki hızlı büyüme bulunuyor. Özellikle 1,5 milyon TL altındaki B-SUV segmentinde rekabet sertleşti.",
      "Marka bazında Togg liderliğini korurken, Çinli üreticiler toplamda pazarın üçte birinden fazlasını elinde tutuyor. Avrupalı markalar ise fiyat baskısı nedeniyle kampanya dönemlerini uzatmak zorunda kalıyor.",
    ],
  },
  {
    t: "Evos Charge Network 1.000'inci hızlı şarj soketini devreye aldı",
    c: "sarj-agi",
    au: 1,
    tags: ["Evos Charge", "DC Şarj", "Altyapı"],
    hero: true,
    s: "Ankara Gölbaşı'nda açılan 12 soketli istasyonla birlikte Evos Charge Network'ün Türkiye genelindeki DC soket sayısı 1.000'e ulaştı.",
    p: [
      "Yeni istasyon, 400 kW'a kadar güç verebilen sıvı soğutmalı kablolarla donatıldı. İki araç aynı anda 200'er kW ile şarj olabiliyor.",
      "Ağın 47 ilde 268 lokasyonu bulunuyor. Şirket, yıl sonuna kadar 81 ilin tamamında en az bir yüksek güçlü istasyon hedefliyor.",
      "İstasyonlarda ödeme; Evos uygulaması, temassız kart ve araç içi Plug&Charge protokolüyle yapılabiliyor. Plug&Charge desteği şu an 14 model için aktif.",
    ],
  },
  {
    t: "ÖTV matrah dilimleri güncellendi: Hangi araç hangi orana girdi?",
    c: "otv-rehberi",
    au: 2,
    tags: ["ÖTV", "Vergi", "Mevzuat"],
    hero: true,
    s: "Resmî Gazete'de yayımlanan karara göre elektrikli otomobillerde matrah sınırları yukarı çekildi. Değişiklik özellikle orta segmentte fiyat avantajı yaratıyor.",
    p: [
      "Motor gücü 160 kW'ı geçmeyen ve ÖTV matrahı 1.450.000 TL'yi aşmayan araçlar yüzde 10 oranında vergilendirilmeye devam ediyor.",
      "Aynı motor gücü sınıfında matrahı bu tutarı aşan araçlar yüzde 40 dilimine giriyor. 160 kW üzeri motor gücüne sahip araçlarda ise oran matraha göre yüzde 50 ya da yüzde 60 olarak uygulanıyor.",
      "Düzenlemeden en çok etkilenen grup, listede matrah sınırının hemen üzerinde konumlanan modeller oldu. Bazı markalar donanım paketlerini ayrıştırarak araçları alt dilime taşıdı.",
    ],
  },
  {
    t: "Batarya hücre fiyatları kWh başına 68 dolara geriledi",
    c: "teknoloji",
    au: 4,
    tags: ["Batarya", "LFP", "Maliyet"],
    hero: true,
    s: "Lityum karbonat fiyatlarındaki düşüş ve LFP üretim kapasitesindeki artış, hücre maliyetlerini son beş yılın en düşük seviyesine indirdi.",
    p: [
      "Sektör araştırma kuruluşlarının derlediği verilere göre paket seviyesindeki ortalama maliyet kWh başına 89 dolar, hücre seviyesinde ise 68 dolar seviyesine indi.",
      "LFP kimyası artık küresel üretimin yarısından fazlasını oluşturuyor. Yüksek nikelli NMC hücreler ise premium ve uzun menzilli modellerde tercih edilmeye devam ediyor.",
      "Maliyet düşüşünün tüketici fiyatlarına yansıması genelde 9-12 ay sürüyor. Bu nedenle etkinin asıl olarak gelecek yılın model yılı araçlarında görülmesi bekleniyor.",
    ],
  },
  {
    t: "Kış testi: Sıfırın altında menzil kaybı hangi modelde en az?",
    c: "test-surusu",
    au: 3,
    tags: ["Kış", "Menzil", "Test"],
    s: "Evos test ekibi, eksi 6 derecede 12 elektrikli aracı aynı parkurda sürdü. Isı pompası olan modellerle olmayanlar arasındaki fark çarpıcı.",
    p: [
      "Test parkuru 180 kilometrelik karma bir güzergâhtan oluştu. Araçlar geceyi dışarıda geçirdi ve sabah ön ısıtma yapılmadan yola çıkıldı.",
      "Isı pompası bulunan modellerde ortalama menzil kaybı yüzde 17 seviyesinde kalırken, dirençli ısıtıcı kullanan araçlarda kayıp yüzde 31'e kadar çıktı.",
      "Batarya ön koşullandırma özelliği bulunan araçlar, DC şarjda hedef güce ortalama 6 dakika daha erken ulaştı. Bu da uzun yol toplam süresinde belirgin fark yaratıyor.",
    ],
  },
  {
    t: "Evos AI Danışman, 30 saniyede kişiye özel araç listesi çıkarıyor",
    c: "ai-danisman",
    au: 4,
    tags: ["Yapay Zekâ", "Evos", "Araç Seçimi"],
    s: "Kullanım profili, günlük kilometre, ev şarjı imkânı ve bütçe bilgisine göre çalışan asistan, 220'den fazla model varyantını karşılaştırıyor.",
    p: [
      "Sistem yalnızca fiyat sıralaması yapmıyor; beş yıllık toplam sahip olma maliyetini, tahmini değer kaybını ve şarj alışkanlığına göre gerçek menzil beklentisini de hesaplıyor.",
      "Kullanıcı sorularını doğal dille sorabiliyor. Örneğin 'ailem için 1,8 milyon bütçeyle uzun yol yapabileceğim bir araç' cümlesi doğrudan filtreye dönüştürülüyor.",
      "Danışman, önerdiği her model için gerekçe kartı üretiyor. Böylece kullanıcı, kararın hangi kriterlere dayandığını görebiliyor.",
    ],
  },
  {
    t: "Voice Intelligence: Araç içi sesli asistan artık Türkçe deyimleri anlıyor",
    c: "voice-intelligence",
    au: 4,
    tags: ["Sesli Asistan", "Yazılım", "UX"],
    s: "Yeni dil modeli güncellemesiyle sesli komut başarı oranı yüzde 94'e çıktı. Sistem, bağlamı koruyarak arka arkaya komut alabiliyor.",
    p: [
      "Sürücü 'en yakın hızlı şarj nerede' dedikten sonra 'orada kafe var mı' diye sorabiliyor; sistem önceki soruyu hatırlayarak yanıt veriyor.",
      "Güncelleme ayrıca gürültülü ortamda tanıma başarısını artırıyor. 120 km/s hızda cam açıkken bile komutlar yüksek doğrulukla algılanıyor.",
      "Sistem, şarj planlamasını da sesle yapabiliyor. 'Ankara'ya gidiyorum, iki mola ile planla' komutu doğrudan navigasyona işleniyor.",
    ],
  },
  {
    t: "İkinci el elektrikli araçta değer kaybı ilk kez benzinlinin altına indi",
    c: "fiyat-analizi",
    au: 5,
    tags: ["İkinci El", "Değer Kaybı", "Endeks"],
    s: "Evos Fiyat Endeksi'ne göre üç yaşındaki elektrikli araçlarda ortalama değer kaybı yüzde 34, benzinli muadillerinde ise yüzde 36 seviyesinde.",
    p: [
      "Endeks, 14 bin ilanın aylık takibiyle oluşturuluyor. Batarya sağlığı raporu bulunan araçlar, raporu olmayanlara göre ortalama yüzde 7 daha yüksek fiyattan alıcı buluyor.",
      "Değer kaybındaki iyileşmenin arkasında ikinci el talebindeki artış ve sıfır araç teslim sürelerinin uzaması bulunuyor.",
      "Segment bazında en iyi performansı kompakt SUV'ler gösterdi. Büyük sedanlarda ise kayıp oranı hâlâ yüzde 40'ın üzerinde seyrediyor.",
    ],
  },
  {
    t: "Evos Market'te batarya sağlığı raporu artık zorunlu",
    c: "marketplace",
    au: 7,
    tags: ["Evos Market", "İkinci El", "Batarya"],
    s: "Platformda yayınlanan tüm elektrikli araç ilanlarında, yetkili serviste alınmış batarya sağlık raporu şartı getirildi.",
    p: [
      "Rapor; kalan kapasite yüzdesi, hücre dengesi, hızlı şarj sayısı ve termal yönetim geçmişini içeriyor. İlanda rozet olarak gösteriliyor.",
      "Uygulamanın alıcı güvenini artırması ve fiyatlamada şeffaflık sağlaması bekleniyor. Pilot dönemde raporlu ilanların ortalama satış süresi 11 gün kısaldı.",
      "Raporu bulunmayan mevcut ilanlar için 45 günlük geçiş süresi tanındı. Süre sonunda bu ilanlar pasife alınacak.",
    ],
  },
  {
    t: "Dijital Garaj'a servis geçmişi entegrasyonu geldi",
    c: "dijital-garaj",
    au: 0,
    tags: ["Dijital Garaj", "Servis", "Bakım"],
    s: "Kullanıcılar artık yetkili servis kayıtlarını otomatik olarak dijital garajlarına aktarabiliyor; bakım hatırlatmaları kilometreye göre planlanıyor.",
    p: [
      "Entegrasyon, 9 marka için aktif durumda. Kullanıcı şase numarasını bir kez doğruladıktan sonra tüm geçmiş işlemler listeleniyor.",
      "Sistem, lastik değişimi, fren hidroliği, kabin filtresi ve batarya soğutma sıvısı gibi kalemleri ayrı ayrı takip ediyor.",
      "Aracını satmak isteyen kullanıcılar, dijital garaj kaydını tek tıkla ilan sayfasına aktarabiliyor. Bu da alıcı için doğrulanabilir bir geçmiş anlamına geliyor.",
    ],
  },
  {
    t: "Evos Protect batarya garantisini 10 yıla çıkardı",
    c: "evos-protect",
    au: 6,
    tags: ["Sigorta", "Garanti", "Batarya"],
    s: "Genişletilmiş paket kapsamında batarya kapasitesi yüzde 70'in altına düşen araçlarda modül değişimi ücretsiz karşılanacak.",
    p: [
      "Paket, üretici garantisi bittikten sonra devreye giriyor ve yıllık kapasite ölçümü şartına bağlı çalışıyor.",
      "Kapsama ayrıca şarj ünitesi arızası, kablo hasarı ve yol yardımı sırasında mobil şarj hizmeti de dâhil edildi.",
      "Fiyatlandırma araç değerine ve yıllık kilometreye göre yapılıyor. Ortalama bir C-SUV için yıllık maliyet 8.900 TL seviyesinde.",
    ],
  },
  {
    t: "Avrupa'da 2035 hedefi için ara revizyon tartışması büyüyor",
    c: "dunya",
    au: 6,
    tags: ["Avrupa", "Regülasyon", "2035"],
    s: "Üretici birlikleri, içten yanmalı motor yasağı için öngörülen takvimin esnetilmesini isterken çevre örgütleri karşı çıkıyor.",
    p: [
      "Tartışmanın merkezinde, sentetik yakıtla çalışan araçların istisna kapsamına alınıp alınmayacağı bulunuyor.",
      "Üreticiler, şarj altyapısının bazı üye ülkelerde hedeflerin gerisinde kaldığını savunuyor. Komisyon ise ara hedeflerin korunmasından yana.",
      "Kararın, Avrupa'ya ihracat yapan Türk yan sanayisini de doğrudan etkilemesi bekleniyor.",
    ],
  },
  {
    t: "Şarj tarifelerinde yeni dönem: Kilovatsaat başına fiyatlar güncellendi",
    c: "sarj-agi",
    au: 1,
    tags: ["Tarife", "Fiyat", "Şarj"],
    s: "Operatörlerin ağustos tarifelerine göre AC şarjda ortalama fiyat 7,90 TL/kWh, DC şarjda ise 11,40 TL/kWh seviyesine geldi.",
    p: [
      "Abonelik paketleri kullananlar için birim fiyat DC tarafında 9,60 TL'ye kadar düşebiliyor. Aylık sabit ücret 249 TL'den başlıyor.",
      "Ev şarjı hâlâ en ekonomik seçenek. Gece tarifesiyle kWh maliyeti 2,80 TL seviyesinde kalıyor ki bu 100 kilometre için yaklaşık 47 TL demek.",
      "Karşılaştırma yapıldığında benzinli bir C-SUV'un 100 kilometre maliyeti aynı dönemde 290 TL civarında hesaplanıyor.",
    ],
  },
  {
    t: "Togg T10X ile 5 bin kilometre: Uzun dönem test raporu",
    c: "arac-merkezi",
    au: 3,
    tags: ["Togg", "Uzun Dönem", "İnceleme"],
    s: "Altı ay boyunca test filomuzda yer alan T10X'in tüketim, şarj ve yazılım performansını raporladık.",
    p: [
      "Ortalama tüketim 16,4 kWh/100 km olarak gerçekleşti. Şehir içi kullanımda bu değer 14,1'e kadar iniyor.",
      "Yazılım tarafında dört OTA güncellemesi alındı. Güncellemelerle navigasyon şarj planlaması ve sürüş asistanı davranışı belirgin şekilde iyileşti.",
      "Kabin içi malzeme kalitesi ve sessizlik güçlü yanlar arasında. Bagaj hacmi ise rakiplerine göre bir tık geride kalıyor.",
    ],
  },
  {
    t: "Evos Platform, kurumsal filolar için API'sini açtı",
    c: "platform",
    au: 0,
    tags: ["API", "Filo", "Entegrasyon"],
    s: "Filo yöneticileri artık şarj harcamalarını, araç konumlarını ve batarya durumlarını kendi sistemlerine çekebiliyor.",
    p: [
      "REST tabanlı API, webhook desteğiyle birlikte geliyor. Şarj işlemi tamamlandığında sistemler anlık bildirim alabiliyor.",
      "Raporlama uçları, araç bazlı kWh tüketimi ve maliyet dağılımını CSV olarak dışa aktarmaya izin veriyor.",
      "Pilot programda 14 kurumsal filo yer aldı. Ortalama şarj maliyetinde yüzde 12 tasarruf raporlandı.",
    ],
  },
  {
    t: "Toplulukta tartışma: Ev şarj ünitesi mi, priz şarjı mı?",
    c: "topluluk",
    au: 7,
    tags: ["Topluluk", "Ev Şarjı", "Deneyim"],
    s: "Evos topluluğunda binlerce kullanıcının katıldığı ankette, ev tipi wallbox kullananların memnuniyeti belirgin şekilde yüksek çıktı.",
    p: [
      "Priz şarjı kullananların en büyük şikâyeti süre. 11 kW wallbox ile 6 saatte tamamlanan işlem, normal prizle 22 saati bulabiliyor.",
      "Güvenlik açısından da uzmanlar, sürekli priz şarjını önermiyor. Eski tesisatlarda ısınma riski bulunuyor.",
      "Site yönetimleriyle yaşanan izin süreçleri ise topluluğun en çok tartıştığı ikinci başlık oldu.",
    ],
  },
  {
    t: "Yeni nesil 800 volt mimari şarj süresini yarıya indiriyor",
    c: "teknoloji",
    au: 4,
    tags: ["800V", "Hızlı Şarj", "Mimari"],
    s: "Yüksek voltajlı mimariye geçen modellerde yüzde 10'dan yüzde 80'e şarj süresi 18 dakikanın altına iniyor.",
    p: [
      "800 volt mimari, aynı gücü daha düşük akımla taşıyabildiği için kablo kesitini ve ısı kaybını azaltıyor.",
      "Bu mimarinin yaygınlaşması için istasyon tarafında da yüksek güçlü ünitelerin artması gerekiyor. Türkiye'de 300 kW üzeri soket sayısı bin sınırını yeni aştı.",
      "Maliyet tarafında ise güç elektroniği bileşenleri hâlâ pahalı. Silisyum karbür invertörlerin fiyatı düştükçe teknolojinin orta segmente inmesi bekleniyor.",
    ],
  },
  {
    t: "BYD Seal ile Tesla Model 3 karşı karşıya: Hangisi daha mantıklı?",
    c: "arac-merkezi",
    au: 3,
    tags: ["Karşılaştırma", "BYD", "Tesla"],
    s: "İki popüler sedanı fiyat, menzil, şarj hızı ve toplam maliyet açısından aynı koşullarda test ettik.",
    p: [
      "Menzil testinde Model 3 bir miktar önde tamamladı; ancak Seal'in blade batarya mimarisi ısı yönetiminde avantaj sağladı.",
      "Şarj eğrisi karşılaştırmasında Model 3, yüzde 20-60 aralığında daha yüksek ortalama güç tuttu. Seal ise yüksek doluluk oranlarında daha istikrarlı.",
      "İç mekân malzeme kalitesi ve donanım listesi Seal lehine. Yazılım deneyimi ve şarj ağı entegrasyonunda ise Tesla hâlâ referans noktası.",
    ],
  },
  {
    t: "Şarj istasyonu yatırımlarına yeni teşvik paketi",
    c: "sarj-agi",
    au: 1,
    tags: ["Teşvik", "Yatırım", "Altyapı"],
    s: "Yatırım teşvik kararında yapılan değişiklikle yüksek güçlü şarj istasyonu kurulumlarına ek destek sağlanacak.",
    p: [
      "Destek kapsamına 150 kW ve üzeri DC üniteler, trafo yatırımları ve enerji depolama sistemleri alındı.",
      "Kırsal ve düşük yoğunluklu bölgelerde kurulacak istasyonlarda destek oranı daha yüksek uygulanacak.",
      "Sektör, teşvikin özellikle otoyol dinlenme tesislerindeki soket sıkışıklığını azaltacağını öngörüyor.",
    ],
  },
  {
    t: "Elektrikli araçta sigorta primleri neden farklı hesaplanıyor?",
    c: "evos-protect",
    au: 2,
    tags: ["Sigorta", "Kasko", "Maliyet"],
    s: "Batarya paketi araç değerinin üçte birini oluşturduğu için hasar hesabı geleneksel araçlardan ayrışıyor.",
    p: [
      "Kasko fiyatlamasında en belirleyici kalem, batarya modüllerinin onarılabilirliği. Modüler tasarıma sahip araçlarda prim daha düşük çıkıyor.",
      "Alt takım darbelerinde batarya kasasının hasar görmesi, aracın pert sayılmasına yol açabiliyor. Bu risk primlere yansıyor.",
      "Öte yandan gelişmiş sürücü destek sistemleri hasar sıklığını azalttığı için bazı poliçelerde indirim uygulanıyor.",
    ],
  },
  {
    t: "Hızlı şarjda beklemeyi bitirecek rezervasyon sistemi başlıyor",
    c: "platform",
    au: 1,
    tags: ["Rezervasyon", "Uygulama", "Şarj"],
    s: "Evos uygulaması üzerinden seçilen istasyonda 15 dakikalık soket rezervasyonu yapılabilecek.",
    p: [
      "Rezervasyon ücretsiz; ancak kullanılmayan rezervasyonlarda sembolik bir bekletme bedeli alınacak.",
      "Sistem, yoğun saatlerde alternatif istasyon önerileri de sunuyor. Öneri motoru anlık doluluk verisini kullanıyor.",
      "Pilot uygulama İstanbul, Ankara ve İzmir'deki 40 istasyonda başladı.",
    ],
  },
  {
    t: "Elektrikli araç alırken sorulması gereken 12 kritik soru",
    c: "arac-merkezi",
    au: 0,
    tags: ["Rehber", "Satın Alma", "İpucu"],
    s: "Menzilden şarj hızına, garanti kapsamından yedek parça süresine kadar karar öncesi kontrol listesi.",
    p: [
      "İlk soru her zaman kullanım profili olmalı. Günlük 40 kilometre yapan biriyle haftada bir 500 kilometre yapan birinin ihtiyacı tamamen farklı.",
      "İkinci kritik başlık ev şarjı imkânı. Evde şarj edebilen kullanıcı için gerçek maliyet, edemeyen kullanıcının yarısı kadar olabiliyor.",
      "Garanti kapsamında batarya kapasite eşiğinin kaç yüzde olarak tanımlandığını mutlaka sorun. Sektör standardı yüzde 70.",
    ],
  },
  {
    t: "Otonom sürüş seviyesi 3 için mevzuat çalışması hızlandı",
    c: "teknoloji",
    au: 4,
    tags: ["Otonom", "Mevzuat", "Güvenlik"],
    s: "Belirli koşullarda sürücünün direksiyondan elini çekmesine izin veren sistemler için teknik şartname hazırlanıyor.",
    p: [
      "Taslakta, sistemin çalışabileceği hız aralığı ve yol tipleri net biçimde tanımlanıyor. Devir teslim süresi için de asgari süre belirleniyor.",
      "Kaza durumunda sorumluluğun paylaşımı, çalışmanın en tartışmalı başlığı olmayı sürdürüyor.",
      "Veri kaydedici zorunluluğu getirilmesi ve kayıtların belirli süre saklanması öngörülüyor.",
    ],
  },
  {
    t: "Elektrikli ticari araçlar kargo sektöründe yaygınlaşıyor",
    c: "haber-merkezi",
    au: 7,
    tags: ["Ticari Araç", "Kargo", "Filo"],
    s: "Şehir içi dağıtım filolarında elektrikli van kullanımı bir yılda iki katına çıktı.",
    p: [
      "Dağıtım araçlarının günlük ortalama 90 kilometre yapması, elektrikli modellerin menzilini fazlasıyla yeterli kılıyor.",
      "Depoda gece şarjı yapan filolarda kilometre başına enerji maliyeti dizele göre yüzde 65 daha düşük.",
      "Bakım maliyetlerindeki azalma da toplam tasarrufa katkı sağlıyor; fren balatası ömrü rejeneratif frenleme sayesinde uzuyor.",
    ],
  },
  {
    t: "Fiyat endeksi ağustos: Sıfır araçta ortalama etiket 1,72 milyon TL",
    c: "fiyat-analizi",
    au: 5,
    tags: ["Endeks", "Fiyat", "Pazar"],
    s: "Evos Fiyat Endeksi'ne göre elektrikli otomobillerde ortalama liste fiyatı bir önceki aya göre yüzde 1,2 geriledi.",
    p: [
      "Gerilemede kampanya dönemleri ve stok eritme çalışmaları etkili oldu. Özellikle model yılı geçişinde indirimler derinleşti.",
      "Segment bazında en sert düşüş kompakt hatchback'lerde görüldü. Premium segmentte ise fiyatlar yatay seyretti.",
      "Endeks, 38 marka ve 214 varyantın liste fiyatları üzerinden hesaplanıyor.",
    ],
  },
  {
    t: "Menzil kaygısı azalıyor: Kullanıcıların yüzde 71'i sorun yaşamadığını söylüyor",
    c: "topluluk",
    au: 6,
    tags: ["Anket", "Menzil", "Kullanıcı"],
    s: "Evos topluluğunda 6.400 kullanıcıyla yapılan ankette, uzun yolda planlama yapanların memnuniyeti çok daha yüksek çıktı.",
    p: [
      "Katılımcıların yüzde 71'i son bir yılda menzil kaynaklı ciddi bir sorun yaşamadığını belirtti.",
      "Sorun yaşadığını söyleyenlerin yarısından fazlası, sorunun aracın menzilinden değil istasyon doluluğundan kaynaklandığını ifade etti.",
      "Ankette öne çıkan bir diğer bulgu, kış aylarında ön koşullandırma kullanan sürücülerin belirgin şekilde daha memnun olması.",
    ],
  },
  {
    t: "Yerli batarya hücre fabrikasında üretim başlıyor",
    c: "haber-merkezi",
    au: 0,
    tags: ["Batarya", "Üretim", "Yatırım"],
    s: "Yıllık 20 GWh kapasiteye ulaşması planlanan tesiste ilk hücreler bant üzerinden çıktı.",
    p: [
      "Tesis, LFP kimyasıyla üretim yapacak. İlk etapta yıllık 4 GWh kapasiteyle çalışacak.",
      "Üretimin yerlileşmesi, ithalat maliyetlerini ve lojistik süresini azaltacak. Aynı zamanda yan sanayi için yeni bir ekosistem oluşuyor.",
      "Tesiste doğrudan 1.200 kişinin istihdam edilmesi planlanıyor.",
    ],
  },
  {
    t: "Evos Market'te ilan sayısı 20 bini geçti",
    c: "marketplace",
    au: 5,
    tags: ["Evos Market", "İlan", "İkinci El"],
    s: "Platformdaki aktif elektrikli araç ilanı sayısı bir yılda üç katına çıktı. En çok aranan model listesi güncellendi.",
    p: [
      "Arama hacminde ilk sırayı kompakt SUV'ler alıyor. Fiyat aralığında ise 900 bin - 1,4 milyon TL bandı öne çıkıyor.",
      "İlanların yüzde 62'si bireysel satıcılara, yüzde 38'i galerilere ait.",
      "Ortalama ilan yayında kalma süresi 24 gün olarak ölçüldü.",
    ],
  },
  {
    t: "Şarj kablosu standartları: Type 2, CCS ve NACS ne anlama geliyor?",
    c: "arac-merkezi",
    au: 4,
    tags: ["Rehber", "Soket", "Standart"],
    s: "Soket tipleri, hangi durumda hangisinin kullanılacağı ve adaptör kullanımıyla ilgili merak edilenler.",
    p: [
      "Type 2, Avrupa'da AC şarj için standart. Evdeki wallbox ve şehir içi yavaş şarj noktalarının neredeyse tamamı bu soketi kullanıyor.",
      "CCS ise Type 2 üzerine iki DC pini ekleyerek hızlı şarjı mümkün kılıyor. Türkiye'deki DC istasyonların büyük çoğunluğu CCS.",
      "NACS, Kuzey Amerika'da yaygınlaşan tek gövdeli standart. Avrupa pazarında adaptör dışında bir etkisi bulunmuyor.",
    ],
  },
  {
    t: "Elektrikli araçlarda lastik seçimi menzili yüzde 12 değiştiriyor",
    c: "test-surusu",
    au: 3,
    tags: ["Lastik", "Menzil", "Test"],
    s: "Aynı araçla üç farklı lastik setiyle yapılan testte tüketim farkı beklenenden yüksek çıktı.",
    p: [
      "EV'ye özel geliştirilen düşük yuvarlanma dirençli lastiklerle tüketim 15,2 kWh/100 km ölçüldü.",
      "Standart yaz lastiğiyle bu değer 16,4'e, agresif desenli set ile 17,1'e yükseldi.",
      "Ağırlık farkının yanı sıra lastik yanak sertliği de sonuçlarda belirleyici oldu.",
    ],
  },
  {
    t: "Dijital Garaj'da batarya sağlığı ölçümü ücretsiz oldu",
    c: "dijital-garaj",
    au: 0,
    tags: ["Batarya", "Ölçüm", "Dijital Garaj"],
    s: "Anlaşmalı servislerde yılda bir kez yapılan kapasite ölçümü, platform kullanıcıları için ücretsiz hâle getirildi.",
    p: [
      "Ölçüm sonucu doğrudan dijital garaja işleniyor ve zaman içindeki kapasite eğrisi grafik olarak sunuluyor.",
      "Kullanıcılar bu raporu satış sırasında paylaşabiliyor ya da garanti başvurusunda kanıt olarak kullanabiliyor.",
      "Ölçüm yaklaşık 45 dakika sürüyor ve aracın en az yüzde 80 dolu olması gerekiyor.",
    ],
  },
  {
    t: "Enerji depolamalı şarj istasyonları şebeke yükünü azaltıyor",
    c: "sarj-agi",
    au: 1,
    tags: ["Depolama", "Şebeke", "Yenilenebilir"],
    s: "Batarya destekli istasyonlar, düşük talep saatlerinde depoladıkları enerjiyi yoğun saatlerde kullanıyor.",
    p: [
      "Bu yöntem, trafo kapasitesi yetersiz olan lokasyonlarda yüksek güçlü şarj imkânı sağlıyor.",
      "Güneş paneliyle birlikte kullanıldığında istasyonun şebekeden çektiği enerji belirgin şekilde azalıyor.",
      "Yatırım maliyeti yüksek olsa da elektrik tarifesindeki puant saat farkı geri dönüş süresini kısaltıyor.",
    ],
  },
  {
    t: "Çin'den Avrupa'ya elektrikli araç ihracatında yeni rekor",
    c: "dunya",
    au: 6,
    tags: ["Çin", "İhracat", "Pazar"],
    s: "Gümrük verilerine göre çeyreklik ihracat hacmi 480 bin adede ulaştı; ek vergilere rağmen büyüme sürüyor.",
    p: [
      "Üreticiler, ek vergilerin etkisini azaltmak için Avrupa içinde üretim tesisi yatırımlarına hız verdi.",
      "Macaristan, İspanya ve Türkiye yatırım için öne çıkan lokasyonlar arasında bulunuyor.",
      "Fiyat rekabetinin Avrupalı üreticileri orta segmentte yeni model geliştirmeye zorladığı belirtiliyor.",
    ],
  },
  {
    t: "Elektrikli araç sahiplerinin yüzde 83'ü benzinliye dönmeyi düşünmüyor",
    c: "topluluk",
    au: 7,
    tags: ["Anket", "Memnuniyet", "Kullanıcı"],
    s: "Türkiye genelinde 9.100 elektrikli araç sahibiyle yapılan araştırmada memnuniyet oranı yüksek çıktı.",
    p: [
      "Memnuniyetin en güçlü nedeni işletme maliyeti; ikinci sırada sürüş konforu geliyor.",
      "Dönmeyi düşünenlerin gerekçesi ise uzun yol şarj süresi ve istasyon yoğunluğu.",
      "Katılımcıların yüzde 68'i evinde şarj imkânına sahip olduğunu belirtti.",
    ],
  },
  {
    t: "ÖTV hesaplama rehberi: Etiket fiyatı nasıl oluşuyor?",
    c: "otv-rehberi",
    au: 2,
    tags: ["ÖTV", "KDV", "Hesaplama"],
    s: "Matrah, ÖTV ve KDV kalemlerinin etiket fiyatına nasıl yansıdığını adım adım hesapladık.",
    p: [
      "Etiket fiyatı; ÖTV matrahı, üzerine eklenen ÖTV ve son olarak bu toplam üzerinden hesaplanan KDV'den oluşuyor.",
      "Örnek olarak 1.200.000 TL matrahlı ve yüzde 10 dilimindeki bir araçta ÖTV 120.000 TL, KDV ise 264.000 TL olarak hesaplanıyor.",
      "Aynı aracın yüzde 40 dilimine girmesi hâlinde etiket fiyatı yaklaşık 432 bin TL artıyor. Bu da dilim sınırlarının önemini gösteriyor.",
    ],
  },
  {
    t: "Yeni sürüm: Evos uygulamasında yol planlayıcı yenilendi",
    c: "platform",
    au: 0,
    tags: ["Uygulama", "Navigasyon", "Güncelleme"],
    s: "Planlayıcı artık hava sıcaklığı, rakım ve araç yüküne göre gerçek zamanlı menzil tahmini yapıyor.",
    p: [
      "Rota üzerindeki istasyonların anlık doluluk bilgisi de hesaba katılıyor. Yoğun istasyonlar otomatik olarak eleniyor.",
      "Kullanıcı hedef varış şarj yüzdesini belirleyebiliyor; planlayıcı mola sayısını buna göre optimize ediyor.",
      "Yeni sürümde rota paylaşımı da mümkün. Aynı yolculuğu yapan kullanıcılar planı birbirine gönderebiliyor.",
    ],
  },
  {
    t: "Elektrikli araçlarda bakım maliyeti benzinliye göre yüzde 41 daha düşük",
    c: "fiyat-analizi",
    au: 5,
    tags: ["Bakım", "Maliyet", "Karşılaştırma"],
    s: "Beş yıllık periyotta yapılan hesaplamada, yağ ve filtre kalemlerinin olmaması farkın büyük kısmını oluşturuyor.",
    p: [
      "Elektrikli araçlarda periyodik bakım genelde kabin filtresi, fren kontrolü ve yazılım güncellemesinden oluşuyor.",
      "Fren balatası ömrü, rejeneratif frenleme sayesinde iki katına kadar uzayabiliyor.",
      "Buna karşılık lastik tüketimi ağırlık ve tork nedeniyle bir miktar daha yüksek çıkıyor.",
    ],
  },
  {
    t: "Katı hâl batarya için ilk seri üretim takvimi açıklandı",
    c: "teknoloji",
    au: 4,
    tags: ["Katı Hâl", "Batarya", "Ar-Ge"],
    s: "Üretici, pilot hattın devreye alındığını ve sınırlı sayıda araçta test edileceğini duyurdu.",
    p: [
      "Katı hâl bataryalar, enerji yoğunluğunu artırırken yangın riskini de belirgin ölçüde azaltıyor.",
      "İlk uygulamaların premium segmentte görülmesi bekleniyor. Maliyetin makul seviyeye inmesi için birkaç yıl daha gerekiyor.",
      "Şarj hızı tarafında hedef, yüzde 10-80 aralığını 10 dakikanın altına indirmek.",
    ],
  },
  {
    t: "Voice Intelligence çağrı merkezlerinde de kullanılmaya başlandı",
    c: "voice-intelligence",
    au: 4,
    tags: ["Çağrı Merkezi", "Otomasyon", "Yapay Zekâ"],
    s: "Şarj sorunları ve fatura talepleri için sesli asistan, çağrıların yüzde 46'sını insan operatöre aktarmadan çözüyor.",
    p: [
      "Sistem, kullanıcıyı araç plakasından tanıyıp son şarj işlemlerini otomatik olarak ekrana getiriyor.",
      "Karmaşık talepler operatöre aktarılırken görüşme özeti de birlikte iletiliyor. Böylece ortalama çözüm süresi kısalıyor.",
      "Memnuniyet ölçümlerinde otomatik çözülen çağrıların puanı, insan operatörle çözülenlere yakın çıktı.",
    ],
  },
  {
    t: "İstanbul'da otoparklara şarj ünitesi zorunluluğu",
    c: "sarj-agi",
    au: 1,
    tags: ["İstanbul", "Otopark", "Regülasyon"],
    s: "Yeni yapılacak 50 araçlık ve üzeri kapasiteli otoparklarda belirli oranda şarj ünitesi bulundurulması şartı getirildi.",
    p: [
      "Düzenleme, kapasitenin en az yüzde 5'i için altyapı, yüzde 2'si için aktif ünite şartı içeriyor.",
      "Mevcut otoparklara ise kademeli geçiş süresi tanındı.",
      "Sektör temsilcileri, kararın site ve AVM otoparklarındaki dönüşümü hızlandıracağını değerlendiriyor.",
    ],
  },
  {
    t: "Elektrikli SUV karşılaştırması: 1,5 milyon TL altındaki 6 model",
    c: "arac-merkezi",
    au: 3,
    tags: ["SUV", "Karşılaştırma", "Bütçe"],
    s: "Bütçe segmentinde menzil, donanım ve şarj hızı açısından öne çıkan modelleri sıraladık.",
    p: [
      "Menzil tarafında iki model 450 kilometre sınırını aşarken, diğerleri 350-420 aralığında kalıyor.",
      "DC şarj gücünde ise fark daha belirgin. En hızlı model 150 kW alırken en yavaşı 80 kW'ta kalıyor.",
      "Donanım listesi açısından Çinli markalar açık ara önde; ancak servis ağı yaygınlığında Avrupalı rakipler avantajlı.",
    ],
  },
  {
    t: "Evos Protect yol yardımına mobil şarj aracı eklendi",
    c: "evos-protect",
    au: 6,
    tags: ["Yol Yardım", "Mobil Şarj", "Hizmet"],
    s: "Yolda şarjı biten araçlara 30 kilometre menzil kazandıracak acil şarj hizmeti 12 ilde başladı.",
    p: [
      "Mobil ünite, araca ortalama 20 dakikada yeterli enerjiyi aktarabiliyor.",
      "Hizmet, yıllık iki kullanım hakkıyla paket kapsamında sunuluyor. Ek kullanımlar ücretlendiriliyor.",
      "Şirket, yıl sonuna kadar kapsamı 30 ile çıkarmayı planlıyor.",
    ],
  },
  {
    t: "AI Danışman artık ikinci el ilanları da değerlendiriyor",
    c: "ai-danisman",
    au: 5,
    tags: ["Yapay Zekâ", "İkinci El", "Değerleme"],
    s: "Sistem, ilan fiyatını piyasa verisiyle karşılaştırıp batarya sağlığına göre gerçekçi bir değer aralığı öneriyor.",
    p: [
      "Model; yaş, kilometre, batarya sağlığı, donanım ve bölgesel talebi birlikte değerlendiriyor.",
      "İlan fiyatı piyasa ortalamasının belirgin altındaysa kullanıcı uyarılıyor ve kontrol edilmesi gereken noktalar listeleniyor.",
      "Değerleme sonucu, dijital garajdaki servis geçmişiyle birleştiğinde doğruluk oranı artıyor.",
    ],
  },
  {
    t: "Şarj ağı haritası: Hangi ilde kaç hızlı şarj noktası var?",
    c: "sarj-agi",
    au: 1,
    tags: ["Harita", "İstatistik", "Altyapı"],
    s: "Türkiye genelindeki DC şarj noktalarının il bazlı dağılımını ve kişi başına düşen soket sayısını inceledik.",
    p: [
      "İstanbul, Ankara ve İzmir toplam soketlerin yaklaşık yarısını barındırıyor.",
      "Kişi başına soket oranında ise turizm bölgeleri öne çıkıyor. Muğla ve Antalya sezonluk talebi karşılamak için hızla yatırım aldı.",
      "Doğu ve Güneydoğu Anadolu'da soket yoğunluğu hâlâ ortalamanın altında; yeni teşvik paketinin bu farkı azaltması bekleniyor.",
    ],
  },
  {
    t: "Elektrikli araçta kasko hasar süreçleri nasıl işliyor?",
    c: "evos-protect",
    au: 2,
    tags: ["Kasko", "Hasar", "Rehber"],
    s: "Batarya hasarı şüphesi olan durumlarda izlenmesi gereken adımları ve dikkat edilecek noktaları derledik.",
    p: [
      "Alt takım darbesi sonrası araç kesinlikle kapalı otoparkta bekletilmemeli; termal risk ihtimaline karşı açık alan tercih edilmeli.",
      "Yetkili servis, batarya kasasında deformasyon olup olmadığını özel ekipmanla kontrol ediyor.",
      "Modül değişimi gerekiyorsa sigorta şirketinin onarılabilirlik raporu talep etmesi standart uygulama.",
    ],
  },
  {
    t: "Dijital Garaj'a sigorta poliçesi takibi eklendi",
    c: "dijital-garaj",
    au: 6,
    tags: ["Sigorta", "Poliçe", "Takip"],
    s: "Kullanıcılar kasko ve trafik poliçelerini garaj profiline ekleyerek yenileme hatırlatması alabiliyor.",
    p: [
      "Sistem, poliçe bitiş tarihinden 30 gün önce bildirim gönderiyor ve teklif karşılaştırma bağlantısı sunuyor.",
      "Poliçe belgeleri şifreli olarak saklanıyor ve dilendiğinde PDF olarak indirilebiliyor.",
      "Hasar geçmişi de kayıt altına alınarak yenileme sırasında referans olarak kullanılabiliyor.",
    ],
  },
  {
    t: "Marketplace analizi: En hızlı satılan elektrikli modeller",
    c: "marketplace",
    au: 5,
    tags: ["Analiz", "Satış", "İkinci El"],
    s: "Son üç ayın verilerine göre ilan yayına girdikten sonra en kısa sürede satılan modelleri listeledik.",
    p: [
      "Listenin başında düşük kilometreli kompakt SUV'ler yer alıyor; ortalama satış süresi 9 gün.",
      "Yüksek donanımlı sedanlarda süre 18 güne çıkıyor. Fiyat bandı yükseldikçe alıcı sayısı azalıyor.",
      "Batarya sağlığı raporu bulunan ilanlar, her segmentte ortalamadan daha hızlı satılıyor.",
    ],
  },
  {
    t: "Evos Platform iş ortakları programı büyüyor",
    c: "platform",
    au: 0,
    tags: ["İş Ortaklığı", "Ekosistem", "Platform"],
    s: "Servis, sigorta ve şarj operatörlerinin dâhil olduğu program kapsamındaki ortak sayısı 120'yi geçti.",
    p: [
      "Ortaklar, platform API'si üzerinden kendi hizmetlerini kullanıcıya doğrudan sunabiliyor.",
      "Program kapsamında ortak kampanyalar ve çapraz indirimler de düzenleniyor.",
      "Yeni dönemde yerel servis noktalarının programa katılımı için başvuru süreci sadeleştirildi.",
    ],
  },
];

const VEHICLES = [
  {
    brand: "Togg",
    model: "T10X V2 Uzun Menzil",
    year: 2026,
    segment: "C-SUV",
    bodyType: "SUV",
    price: 1789000,
    otvRate: 10,
    rangeKm: 523,
    batteryKwh: 88.5,
    motorPowerKw: 160,
    motorPowerHp: 218,
    acceleration: 7.6,
    topSpeed: 180,
    dcChargeKw: 180,
    chargeMin: 28,
    consumption: 16.4,
    trunkLiter: 350,
    driveType: "RWD",
    isFeatured: true,
    rating: 4.6,
    pros: ["Yerli üretim ve servis ağı", "Sessiz kabin", "Güçlü OTA desteği"],
    cons: ["Bagaj hacmi rakiplerin gerisinde", "Arka diz mesafesi sınırlı"],
    description:
      "Türkiye'nin yerli elektrikli SUV'u T10X, uzun menzil versiyonuyla günlük kullanım ve şehirler arası yolculuk arasında dengeli bir profil sunuyor.",
  },
  {
    brand: "Togg",
    model: "T10F Uzun Menzil",
    year: 2026,
    segment: "C-Fastback",
    bodyType: "Fastback",
    price: 1849000,
    otvRate: 10,
    rangeKm: 623,
    batteryKwh: 88.5,
    motorPowerKw: 160,
    motorPowerHp: 218,
    acceleration: 7.3,
    topSpeed: 185,
    dcChargeKw: 180,
    chargeMin: 28,
    consumption: 14.8,
    trunkLiter: 465,
    driveType: "RWD",
    isFeatured: true,
    rating: 4.7,
    pros: ["Sınıfının en iyi menzili", "Aerodinamik gövde", "Geniş bagaj"],
    cons: ["Arka cam görüş alanı dar", "Teslimat süresi uzun"],
    description:
      "Fastback gövdeli T10F, düşük sürtünme katsayısı sayesinde aynı bataryayla belirgin şekilde daha uzun menzil sunuyor.",
  },
  {
    brand: "Tesla",
    model: "Model Y Long Range AWD",
    year: 2026,
    segment: "D-SUV",
    bodyType: "SUV",
    price: 2449000,
    otvRate: 50,
    rangeKm: 565,
    batteryKwh: 78.1,
    motorPowerKw: 378,
    motorPowerHp: 514,
    acceleration: 4.8,
    topSpeed: 217,
    dcChargeKw: 250,
    chargeMin: 27,
    consumption: 15.7,
    trunkLiter: 854,
    driveType: "AWD",
    isFeatured: true,
    rating: 4.7,
    pros: ["Supercharger ağı", "Devasa bagaj hacmi", "Yazılım deneyimi"],
    cons: ["Süspansiyon sert", "İç mekân malzeme kalitesi tartışmalı"],
    description:
      "Model Y, geniş iç hacmi ve olgun şarj ağı entegrasyonuyla segmentin referans araçlarından biri olmayı sürdürüyor.",
  },
  {
    brand: "Tesla",
    model: "Model 3 Long Range",
    year: 2026,
    segment: "D-Sedan",
    bodyType: "Sedan",
    price: 2149000,
    otvRate: 50,
    rangeKm: 629,
    batteryKwh: 79,
    motorPowerKw: 366,
    motorPowerHp: 498,
    acceleration: 4.4,
    topSpeed: 201,
    dcChargeKw: 250,
    chargeMin: 25,
    consumption: 13.2,
    trunkLiter: 594,
    driveType: "AWD",
    isFeatured: true,
    rating: 4.6,
    pros: ["Çok düşük tüketim", "Hızlı şarj eğrisi", "Sürüş dinamiği"],
    cons: ["Direksiyon kolu yok", "Arka baş mesafesi kısıtlı"],
    description:
      "Yenilenen Model 3, aerodinamik iyileştirmeler ve daha sessiz kabinle konfor tarafında belirgin ilerleme kaydediyor.",
  },
  {
    brand: "BYD",
    model: "Seal Design AWD",
    year: 2026,
    segment: "D-Sedan",
    bodyType: "Sedan",
    price: 1979000,
    otvRate: 50,
    rangeKm: 520,
    batteryKwh: 82.5,
    motorPowerKw: 390,
    motorPowerHp: 530,
    acceleration: 3.8,
    topSpeed: 180,
    dcChargeKw: 150,
    chargeMin: 32,
    consumption: 16.6,
    trunkLiter: 400,
    driveType: "AWD",
    isFeatured: true,
    rating: 4.5,
    pros: ["Blade batarya güvenliği", "Zengin donanım", "Çok hızlı hızlanma"],
    cons: ["Bagaj açıklığı dar", "Menü yapısı karmaşık"],
    description:
      "Seal, blade batarya mimarisi ve hücreden gövdeye entegrasyonla düşük ağırlık merkezine sahip sportif bir sedan.",
  },
  {
    brand: "BYD",
    model: "Atto 3 Comfort",
    year: 2026,
    segment: "C-SUV",
    bodyType: "SUV",
    price: 1379000,
    otvRate: 10,
    rangeKm: 420,
    batteryKwh: 60.5,
    motorPowerKw: 150,
    motorPowerHp: 204,
    acceleration: 7.3,
    topSpeed: 160,
    dcChargeKw: 88,
    chargeMin: 44,
    consumption: 15.6,
    trunkLiter: 440,
    driveType: "FWD",
    rating: 4.3,
    pros: ["Geniş iç hacim", "Güvenlik donanımı", "Uygun fiyat"],
    cons: ["DC şarj gücü düşük", "İç tasarım fazla iddialı"],
    description:
      "Atto 3, aile kullanımına uygun ölçüleri ve zengin standart donanımıyla giriş segmentinin popüler seçeneklerinden.",
  },
  {
    brand: "BYD",
    model: "Dolphin Design",
    year: 2026,
    segment: "B-Hatchback",
    bodyType: "Hatchback",
    price: 1049000,
    otvRate: 10,
    rangeKm: 427,
    batteryKwh: 60.4,
    motorPowerKw: 150,
    motorPowerHp: 204,
    acceleration: 7,
    topSpeed: 160,
    dcChargeKw: 88,
    chargeMin: 40,
    consumption: 15.9,
    trunkLiter: 345,
    driveType: "FWD",
    rating: 4.2,
    pros: ["Şehir içi çeviklik", "Fiyat/donanım dengesi", "Ferah kabin"],
    cons: ["Yüksek hızda gürültü", "Süspansiyon yumuşak"],
    description:
      "Dolphin, kompakt gövdesine rağmen geniş iç hacim sunan ve şehir kullanımına odaklanan bir hatchback.",
  },
  {
    brand: "MG",
    model: "MG4 Luxury",
    year: 2026,
    segment: "C-Hatchback",
    bodyType: "Hatchback",
    price: 1189000,
    otvRate: 10,
    rangeKm: 435,
    batteryKwh: 64,
    motorPowerKw: 150,
    motorPowerHp: 204,
    acceleration: 7.9,
    topSpeed: 160,
    dcChargeKw: 140,
    chargeMin: 35,
    consumption: 16.1,
    trunkLiter: 363,
    driveType: "RWD",
    rating: 4.4,
    pros: ["Arkadan itiş keyfi", "İyi DC şarj gücü", "Dengeli şasi"],
    cons: ["İç malzeme sade", "Multimedya arayüzü yavaş"],
    description:
      "MG4, arkadan itişli mimarisi ve dengeli ağırlık dağılımıyla sürüş odaklı kullanıcılara hitap ediyor.",
  },
  {
    brand: "MG",
    model: "ZS EV Long Range",
    year: 2026,
    segment: "B-SUV",
    bodyType: "SUV",
    price: 1249000,
    otvRate: 10,
    rangeKm: 440,
    batteryKwh: 72,
    motorPowerKw: 115,
    motorPowerHp: 156,
    acceleration: 8.6,
    topSpeed: 175,
    dcChargeKw: 92,
    chargeMin: 42,
    consumption: 17.2,
    trunkLiter: 448,
    driveType: "FWD",
    rating: 4.1,
    pros: ["Yaygın servis ağı", "Kullanışlı bagaj", "Konforlu süspansiyon"],
    cons: ["Performans mütevazı", "Tüketim yüksek"],
    description:
      "ZS EV, pratik ölçüleri ve makul fiyatıyla aile kullanımına yönelik dengeli bir B-SUV alternatifi.",
  },
  {
    brand: "Hyundai",
    model: "Ioniq 5 Long Range",
    year: 2026,
    segment: "C-SUV",
    bodyType: "SUV",
    price: 2289000,
    otvRate: 50,
    rangeKm: 507,
    batteryKwh: 84,
    motorPowerKw: 168,
    motorPowerHp: 229,
    acceleration: 7.3,
    topSpeed: 185,
    dcChargeKw: 233,
    chargeMin: 18,
    consumption: 16.8,
    trunkLiter: 520,
    driveType: "RWD",
    isFeatured: true,
    rating: 4.6,
    pros: ["800V mimari", "18 dakikada şarj", "Çok geniş iç hacim"],
    cons: ["Fiyat yüksek", "Arka görüş sınırlı"],
    description:
      "800 volt mimarisi sayesinde sınıfının en hızlı şarj olan modellerinden biri olan Ioniq 5, retro-fütüristik tasarımıyla dikkat çekiyor.",
  },
  {
    brand: "Hyundai",
    model: "Kona Electric 65 kWh",
    year: 2026,
    segment: "B-SUV",
    bodyType: "SUV",
    price: 1699000,
    otvRate: 40,
    rangeKm: 454,
    batteryKwh: 65.4,
    motorPowerKw: 160,
    motorPowerHp: 218,
    acceleration: 7.8,
    topSpeed: 172,
    dcChargeKw: 102,
    chargeMin: 41,
    consumption: 14.9,
    trunkLiter: 466,
    driveType: "FWD",
    rating: 4.4,
    pros: ["Verimli tüketim", "Kaliteli iç mekân", "İyi görüş açısı"],
    cons: ["DC şarj gücü orta", "Fiyat/performans tartışmalı"],
    description:
      "Kona Electric, düşük tüketimi ve olgun sürüş karakteriyle şehir ve şehirler arası kullanım arasında iyi bir denge kuruyor.",
  },
  {
    brand: "Kia",
    model: "EV6 GT-Line",
    year: 2026,
    segment: "D-CUV",
    bodyType: "Crossover",
    price: 2549000,
    otvRate: 50,
    rangeKm: 528,
    batteryKwh: 84,
    motorPowerKw: 168,
    motorPowerHp: 229,
    acceleration: 7.3,
    topSpeed: 185,
    dcChargeKw: 258,
    chargeMin: 18,
    consumption: 16.5,
    trunkLiter: 490,
    driveType: "RWD",
    rating: 4.6,
    pros: ["Ultra hızlı şarj", "Sportif tasarım", "Yüksek yol tutuşu"],
    cons: ["Arka baş mesafesi", "Sert süspansiyon"],
    description:
      "EV6, 800V mimarisi ve sportif şasi ayarlarıyla performans arayan kullanıcılar için güçlü bir seçenek.",
  },
  {
    brand: "Volkswagen",
    model: "ID.4 Pro",
    year: 2026,
    segment: "C-SUV",
    bodyType: "SUV",
    price: 2179000,
    otvRate: 50,
    rangeKm: 533,
    batteryKwh: 77,
    motorPowerKw: 210,
    motorPowerHp: 286,
    acceleration: 6.7,
    topSpeed: 180,
    dcChargeKw: 175,
    chargeMin: 28,
    consumption: 16.2,
    trunkLiter: 543,
    driveType: "RWD",
    rating: 4.3,
    pros: ["Yol konforu", "Geniş bagaj", "Sessiz kabin"],
    cons: ["Yazılım arayüzü", "Dokunmatik kontroller"],
    description:
      "ID.4, uzun yol konforu ve kullanışlı iç hacmiyle aile odaklı kullanıcıların tercih listesinde üst sıralarda.",
  },
  {
    brand: "Renault",
    model: "Megane E-Tech EV60",
    year: 2026,
    segment: "C-Hatchback",
    bodyType: "Hatchback",
    price: 1749000,
    otvRate: 40,
    rangeKm: 470,
    batteryKwh: 60,
    motorPowerKw: 160,
    motorPowerHp: 218,
    acceleration: 7.4,
    topSpeed: 160,
    dcChargeKw: 130,
    chargeMin: 32,
    consumption: 13.9,
    trunkLiter: 440,
    driveType: "FWD",
    rating: 4.4,
    pros: ["Çok düşük tüketim", "Kaliteli multimedya", "Kompakt ölçüler"],
    cons: ["Arka diz mesafesi", "Yüksek hızda menzil düşüşü"],
    description:
      "Megane E-Tech, ince batarya paketi sayesinde düşük ağırlığını koruyor ve sınıfının en verimli modellerinden biri olarak öne çıkıyor.",
  },
  {
    brand: "Citroen",
    model: "e-C4 Max",
    year: 2026,
    segment: "C-Crossover",
    bodyType: "Crossover",
    price: 1529000,
    otvRate: 40,
    rangeKm: 420,
    batteryKwh: 54,
    motorPowerKw: 115,
    motorPowerHp: 156,
    acceleration: 9.5,
    topSpeed: 150,
    dcChargeKw: 100,
    chargeMin: 30,
    consumption: 15.1,
    trunkLiter: 380,
    driveType: "FWD",
    rating: 4.1,
    pros: ["Üstün süspansiyon konforu", "Sessiz kabin", "Rahat koltuklar"],
    cons: ["Performans zayıf", "Menzil orta seviye"],
    description:
      "e-C4, hidrolik yastıklı süspansiyonuyla bozuk zeminde sınıfının en konforlu araçlarından biri.",
  },
  {
    brand: "Volvo",
    model: "EX30 Twin Performance",
    year: 2026,
    segment: "B-SUV",
    bodyType: "SUV",
    price: 2049000,
    otvRate: 50,
    rangeKm: 450,
    batteryKwh: 69,
    motorPowerKw: 315,
    motorPowerHp: 428,
    acceleration: 3.6,
    topSpeed: 180,
    dcChargeKw: 153,
    chargeMin: 27,
    consumption: 16.9,
    trunkLiter: 318,
    driveType: "AWD",
    rating: 4.4,
    pros: ["Olağanüstü hızlanma", "Premium malzeme", "Kompakt boyut"],
    cons: ["Küçük bagaj", "Tüm kontroller ekranda"],
    description:
      "EX30, küçük gövdesine sığdırdığı yüksek performans ve premium iç mekânla segmentinde farklı bir konum alıyor.",
  },
  {
    brand: "BMW",
    model: "iX1 xDrive30",
    year: 2026,
    segment: "C-SUV",
    bodyType: "SUV",
    price: 3149000,
    otvRate: 60,
    rangeKm: 440,
    batteryKwh: 66.5,
    motorPowerKw: 230,
    motorPowerHp: 313,
    acceleration: 5.6,
    topSpeed: 180,
    dcChargeKw: 130,
    chargeMin: 29,
    consumption: 17.3,
    trunkLiter: 490,
    driveType: "AWD",
    rating: 4.5,
    pros: ["Premium sürüş hissi", "Kaliteli iç mekân", "Güçlü çekiş"],
    cons: ["Yüksek ÖTV dilimi", "Tüketim yüksek"],
    description:
      "iX1, premium kompakt SUV segmentinde marka deneyimini elektrikli mimariye taşıyan dengeli bir model.",
  },
  {
    brand: "Chery",
    model: "Omoda E5 Premium",
    year: 2026,
    segment: "B-SUV",
    bodyType: "SUV",
    price: 1319000,
    otvRate: 10,
    rangeKm: 430,
    batteryKwh: 61,
    motorPowerKw: 150,
    motorPowerHp: 204,
    acceleration: 7.6,
    topSpeed: 172,
    dcChargeKw: 80,
    chargeMin: 48,
    consumption: 15.8,
    trunkLiter: 380,
    driveType: "FWD",
    rating: 4,
    pros: ["Zengin donanım", "Uygun fiyat", "Geniş ekran"],
    cons: ["DC şarj yavaş", "Marka ikinci el değeri belirsiz"],
    description:
      "Omoda E5, fiyat odaklı alıcılar için yüksek donanım seviyesi sunan giriş segmenti SUV alternatifi.",
  },
  {
    brand: "Skywell",
    model: "ET5 Long Range",
    year: 2026,
    segment: "C-SUV",
    bodyType: "SUV",
    price: 1449000,
    otvRate: 10,
    rangeKm: 452,
    batteryKwh: 86,
    motorPowerKw: 150,
    motorPowerHp: 204,
    acceleration: 9.6,
    topSpeed: 150,
    dcChargeKw: 90,
    chargeMin: 55,
    consumption: 19.4,
    trunkLiter: 467,
    driveType: "FWD",
    rating: 3.9,
    pros: ["Büyük batarya", "Ferah iç mekân", "Fiyat avantajı"],
    cons: ["Yüksek tüketim", "Yavaş hızlanma"],
    description:
      "ET5, büyük batarya kapasitesiyle uzun menzil sunarken tüketim tarafında rakiplerinin gerisinde kalıyor.",
  },
  {
    brand: "Mercedes-Benz",
    model: "EQA 250+",
    year: 2026,
    segment: "C-SUV",
    bodyType: "SUV",
    price: 3049000,
    otvRate: 60,
    rangeKm: 560,
    batteryKwh: 70.5,
    motorPowerKw: 140,
    motorPowerHp: 190,
    acceleration: 8.6,
    topSpeed: 160,
    dcChargeKw: 112,
    chargeMin: 32,
    consumption: 14.8,
    trunkLiter: 340,
    driveType: "FWD",
    rating: 4.3,
    pros: ["Uzun menzil", "Premium kabin", "Sessiz sürüş"],
    cons: ["Performans mütevazı", "Bagaj küçük"],
    description:
      "EQA, premium segmentte verimlilik odaklı bir yaklaşım sunarak uzun menzili makul tüketimle birleştiriyor.",
  },
];

const OPERATORS = [
  "Evos Charge Network",
  "Trugo",
  "ZES",
  "Eşarj",
  "Sharz",
  "Voltrun",
  "Beefull",
  "Astor Şarj",
];

const STATIONS = [
  ["Evos Maslak Hızlı Şarj Merkezi", "Evos Charge Network", "İstanbul", "Sarıyer", "Büyükdere Cad. No:245", 41.1105, 29.0203, 12, 400, 11.4, true],
  ["Evos Ataşehir Plaza", "Evos Charge Network", "İstanbul", "Ataşehir", "Barbaros Mah. Halk Cad. No:8", 40.9905, 29.1275, 8, 300, 11.4, true],
  ["Evos Gölbaşı Süper Hub", "Evos Charge Network", "Ankara", "Gölbaşı", "Ankara-Konya Yolu 18. km", 39.7905, 32.8071, 12, 400, 10.9, true],
  ["Evos Bornova Merkez", "Evos Charge Network", "İzmir", "Bornova", "Kazımdirik Mah. Üniversite Cad.", 38.4622, 27.2183, 6, 180, 11.2, true],
  ["Trugo Bolu Dağı Dinlenme", "Trugo", "Bolu", "Merkez", "TEM Otoyolu 142. km", 40.7355, 31.6061, 8, 300, 11.9, true],
  ["ZES Kartal AVM", "ZES", "İstanbul", "Kartal", "Cevizli Mah. D-100 Yanyol", 40.9082, 29.1889, 6, 180, 12.2, true],
  ["Eşarj Beşiktaş Otopark", "Eşarj", "İstanbul", "Beşiktaş", "Barbaros Bulvarı No:36", 41.0438, 29.0064, 4, 60, 10.6, false],
  ["Sharz Antalya Havalimanı", "Sharz", "Antalya", "Muratpaşa", "Havalimanı Dış Hatlar Otoparkı", 36.9004, 30.7925, 10, 240, 11.7, true],
  ["Voltrun Bodrum Marina", "Voltrun", "Muğla", "Bodrum", "Neyzen Tevfik Cad. Marina", 37.0322, 27.4241, 6, 150, 12.4, true],
  ["Beefull Adana Merkez", "Beefull", "Adana", "Seyhan", "Turhan Cemal Beriker Bulvarı", 37.0016, 35.3213, 4, 120, 11.1, true],
  ["Astor Bursa Nilüfer", "Astor Şarj", "Bursa", "Nilüfer", "Fethiye Mah. İzmir Yolu Cad.", 40.2114, 28.9711, 6, 180, 11.5, true],
  ["Evos Konya Selçuklu", "Evos Charge Network", "Konya", "Selçuklu", "Yeni İstanbul Cad. No:112", 38.0208, 32.5069, 6, 240, 10.8, true],
  ["Trugo Afyon Kavşak", "Trugo", "Afyonkarahisar", "Merkez", "Afyon-Ankara Karayolu 9. km", 38.7638, 30.5401, 8, 300, 11.9, true],
  ["ZES Trabzon Sahil", "ZES", "Trabzon", "Ortahisar", "Devlet Sahil Yolu No:78", 41.0053, 39.7269, 4, 120, 12.2, true],
  ["Evos Gaziantep Şehitkamil", "Evos Charge Network", "Gaziantep", "Şehitkamil", "İbrahimli Mah. 4. Cad.", 37.0765, 37.3781, 6, 180, 10.9, true],
  ["Sharz Samsun Atakum", "Sharz", "Samsun", "Atakum", "Atatürk Bulvarı No:301", 41.3421, 36.2571, 4, 90, 11.7, false],
  ["Voltrun Eskişehir Odunpazarı", "Voltrun", "Eskişehir", "Odunpazarı", "Vişnelik Mah. Üniversite Cad.", 39.7648, 30.5157, 4, 120, 12.4, true],
  ["Evos Kayseri Kocasinan", "Evos Charge Network", "Kayseri", "Kocasinan", "Osman Kavuncu Bulvarı No:220", 38.7333, 35.4667, 6, 180, 10.9, true],
  ["Beefull Denizli Merkezefendi", "Beefull", "Denizli", "Merkezefendi", "Sırakapılar Mah. 1. Sanayi Cad.", 37.7833, 29.0833, 4, 120, 11.1, true],
  ["Trugo Mersin Yenişehir", "Trugo", "Mersin", "Yenişehir", "Gazi Mustafa Kemal Bulvarı", 36.8, 34.6333, 6, 180, 11.9, true],
  ["Eşarj Ankara Çankaya", "Eşarj", "Ankara", "Çankaya", "Tunalı Hilmi Cad. No:64", 39.9042, 32.8597, 4, 60, 10.6, false],
  ["Evos Diyarbakır Kayapınar", "Evos Charge Network", "Diyarbakır", "Kayapınar", "Diclekent Bulvarı No:45", 37.9333, 40.2167, 4, 150, 10.9, true],
  ["Astor Erzurum Yakutiye", "Astor Şarj", "Erzurum", "Yakutiye", "Cumhuriyet Cad. No:12", 39.9043, 41.2679, 4, 120, 11.5, true],
  ["ZES İzmir Konak Sahil", "ZES", "İzmir", "Konak", "Mustafa Kemal Sahil Bulvarı", 38.4192, 27.1287, 6, 150, 12.2, true],
  ["Voltrun Sakarya Adapazarı", "Voltrun", "Sakarya", "Adapazarı", "Sakarya Cad. No:88", 40.7833, 30.4, 4, 120, 12.4, true],
  ["Evos Van İpekyolu", "Evos Charge Network", "Van", "İpekyolu", "Cumhuriyet Cad. No:5", 38.4942, 43.38, 4, 150, 10.9, true],
];

const LISTINGS = [
  ["Togg T10X V1 Uzun Menzil - 2024", "Togg", "T10X", 2024, 28500, 1420000, "İstanbul", "Galeri", "Evos Onaylı Galeri", 96, 523, "Gece Mavisi", true],
  ["Tesla Model 3 SR+ - 2022", "Tesla", "Model 3", 2022, 62000, 1590000, "Ankara", "Sahibinden", "Kemal B.", 92, 491, "Beyaz", false],
  ["BYD Atto 3 Comfort - 2024", "BYD", "Atto 3", 2024, 19000, 1180000, "İzmir", "Galeri", "Ege Elektrikli Motors", 97, 420, "Gri", false],
  ["Tesla Model Y LR AWD - 2023", "Tesla", "Model Y", 2023, 41000, 2050000, "İstanbul", "Galeri", "Evos Onaylı Galeri", 94, 533, "Siyah", true],
  ["MG4 Comfort - 2023", "MG", "MG4", 2023, 34000, 985000, "Bursa", "Sahibinden", "Selim K.", 93, 435, "Kırmızı", false],
  ["Hyundai Ioniq 5 Elite - 2022", "Hyundai", "Ioniq 5", 2022, 58000, 1790000, "Antalya", "Galeri", "Akdeniz Oto", 91, 481, "Mat Gri", false],
  ["Renault Megane E-Tech EV60 - 2023", "Renault", "Megane E-Tech", 2023, 37000, 1345000, "İzmir", "Sahibinden", "Deniz A.", 95, 470, "Mavi", false],
  ["Kia EV6 GT-Line - 2023", "Kia", "EV6", 2023, 29000, 1980000, "İstanbul", "Galeri", "Marmara Elektrikli", 96, 528, "Yeşil", true],
  ["Volkswagen ID.4 Pro - 2022", "Volkswagen", "ID.4", 2022, 71000, 1520000, "Ankara", "Galeri", "Başkent Oto Plaza", 89, 522, "Beyaz", false],
  ["BYD Dolphin Design - 2024", "BYD", "Dolphin", 2024, 12000, 935000, "Kocaeli", "Sahibinden", "Merve T.", 98, 427, "Turkuaz", false],
  ["Citroen e-C4 Shine - 2023", "Citroen", "e-C4", 2023, 44000, 1090000, "Adana", "Galeri", "Çukurova Motors", 92, 357, "Gri", false],
  ["Togg T10F Uzun Menzil - 2025", "Togg", "T10F", 2025, 9000, 1690000, "İstanbul", "Galeri", "Evos Onaylı Galeri", 99, 623, "Bakır", true],
  ["MG ZS EV Luxury - 2022", "MG", "ZS EV", 2022, 68000, 895000, "Konya", "Sahibinden", "Hakan Y.", 88, 440, "Siyah", false],
  ["Volvo EX30 Single Motor - 2024", "Volvo", "EX30", 2024, 16000, 1680000, "İzmir", "Galeri", "Ege Premium", 97, 476, "Yeşil", false],
  ["Hyundai Kona Electric 64 kWh - 2021", "Hyundai", "Kona Electric", 2021, 89000, 1140000, "Bursa", "Sahibinden", "Ahmet S.", 87, 484, "Gümüş", false],
  ["BMW iX1 xDrive30 - 2023", "BMW", "iX1", 2023, 33000, 2490000, "İstanbul", "Galeri", "Boğaziçi Premium", 95, 440, "Beyaz", true],
  ["Chery Omoda E5 Premium - 2024", "Chery", "Omoda E5", 2024, 21000, 1150000, "Gaziantep", "Galeri", "Güneydoğu Oto", 96, 430, "Mavi", false],
  ["Skywell ET5 Comfort - 2023", "Skywell", "ET5", 2023, 47000, 1080000, "Ankara", "Sahibinden", "Onur D.", 90, 452, "Gri", false],
];

const COMMUNITY = [
  ["Kışın ön koşullandırma gerçekten fark yaratıyor mu?", "Sabahları -4 derecede yola çıkıyorum. Ön koşullandırma açıkken DC şarjda 40 kW daha yüksek güç aldığımı fark ettim. Sizin deneyiminiz nasıl?", "Kaan Ergün", "Şarj", 184, 47, true],
  ["Ev şarj ünitesi kurdurdum, maliyetleri paylaşıyorum", "11 kW wallbox + kablo + montaj toplam 34.500 TL tuttu. Elektrik projesi için site yönetiminden onay almak 3 hafta sürdü. Detayları yazıyorum.", "Elif Tuna", "Ev Şarjı", 312, 89, true],
  ["Togg T10F ile İstanbul-Antalya: 1 mola yetti", "Afyon'da 22 dakika şarj ile Antalya'ya vardım. Ortalama tüketim 15,1 kWh. Klima 23 derece sabitti.", "Murat Aslan", "Uzun Yol", 267, 63, false],
  ["İkinci el alırken batarya raporu şart mı?", "Rapor olmayan bir ilana bakıyorum, fiyat cazip. Sizce risk alır mısınız yoksa raporlu olanı mı beklerim?", "Sinem Kara", "İkinci El", 143, 71, false],
  ["Lastik değişimi sonrası tüketim düştü", "EV özel lastiğe geçtim, 100 km tüketimim 16,8'den 15,4'e indi. Fiyat farkı kendini 20 bin km'de amorti ediyor.", "Volkan Er", "Bakım", 98, 24, false],
  ["Site otoparkına şarj ünitesi: Süreç nasıl işliyor?", "Yönetim planı değişikliği gerekiyor mu, kat malikleri kararı şart mı? Deneyimi olan var mı?", "Buse Aydın", "Ev Şarjı", 221, 96, false],
  ["Hızlı şarjda soket bekleme sorunu", "Bayram dönüşü Bolu'da 40 dakika sıra bekledim. Rezervasyon sistemi gelirse çok iyi olur.", "Tolga Yaman", "Şarj", 176, 58, false],
  ["MG4 6 aylık kullanım notlarım", "Arkadan itiş şehir içinde çok keyifli. Multimedya arayüzü yavaş ama güncellemeyle biraz düzeldi.", "Ceren Polat", "İnceleme", 134, 39, false],
  ["Elektrikli araçta kasko fiyatları neden bu kadar farklı?", "Aynı araç için üç şirketten üç farklı fiyat aldım, aradaki fark yüzde 60. Neye göre hesaplıyorlar?", "Serkan Uz", "Sigorta", 152, 44, false],
  ["Dijital Garaj kullananlar: Servis kaydı otomatik geliyor mu?", "Şase doğrulaması yaptım ama son bakım görünmüyor. Aynı sorunu yaşayan var mı?", "Nazlı Demir", "Platform", 87, 31, false],
  ["Uzun yolda hangi şarj uygulamasını kullanıyorsunuz?", "Ben rotayı Evos ile planlıyorum ama doluluk bilgisi için ayrı uygulamaya bakma ihtiyacı duyuyorum.", "Ege Şahin", "Uzun Yol", 119, 52, false],
  ["Batarya sağlığı 3 yılda yüzde 4 düştü, normal mi?", "60 bin km yaptım, çoğunlukla AC şarj kullandım. Sizce bu oran iyi mi?", "Hüseyin Balcı", "Batarya", 203, 68, false],
];

const TICKERS = [
  { label: "EV PAZAR PAYI", value: "19,4", unit: "%", changePct: 2.1, order: 1 },
  { label: "DC ŞARJ", value: "11,40", unit: "₺/kWh", changePct: -0.8, order: 2 },
  { label: "AC ŞARJ", value: "7,90", unit: "₺/kWh", changePct: 0.4, order: 3 },
  { label: "EV ORT. FİYAT", value: "1.720.000", unit: "₺", changePct: -1.2, order: 4 },
  { label: "BATARYA", value: "68", unit: "$/kWh", changePct: -3.4, order: 5 },
  { label: "AKTİF SOKET", value: "24.860", unit: "adet", changePct: 1.9, order: 6 },
  { label: "EV FİLO", value: "312.400", unit: "araç", changePct: 4.2, order: 7 },
  { label: "ORT. MENZİL", value: "486", unit: "km", changePct: 0.9, order: 8 },
];

const PRICE_INDEX = [
  ["Eyl", 1, 1812000, 1465000, 6.9, 10.2, 44.8, 84, 12.1],
  ["Eki", 2, 1798000, 1472000, 7.0, 10.4, 45.3, 82, 12.9],
  ["Kas", 3, 1791000, 1481000, 7.1, 10.6, 45.9, 80, 13.4],
  ["Ara", 4, 1785000, 1490000, 7.2, 10.8, 46.4, 79, 14.6],
  ["Oca", 5, 1776000, 1503000, 7.4, 10.9, 47.1, 77, 15.2],
  ["Şub", 6, 1768000, 1512000, 7.5, 11.0, 47.8, 75, 15.9],
  ["Mar", 7, 1759000, 1524000, 7.6, 11.1, 48.2, 74, 16.4],
  ["Nis", 8, 1748000, 1533000, 7.7, 11.2, 48.9, 72, 17.1],
  ["May", 9, 1741000, 1547000, 7.8, 11.3, 49.4, 71, 17.8],
  ["Haz", 10, 1733000, 1558000, 7.8, 11.3, 49.9, 70, 18.3],
  ["Tem", 11, 1726000, 1566000, 7.9, 11.4, 50.4, 69, 18.9],
  ["Ağu", 12, 1720000, 1574000, 7.9, 11.4, 50.8, 68, 19.4],
];

const OTV_BRACKETS = [
  {
    label: "Motor gücü 160 kW'ı aşmayan / matrah 1.450.000 TL'ye kadar",
    motorMaxKw: 160,
    priceMin: 0,
    priceMax: 1450000,
    rate: 10,
    order: 1,
    note: "Giriş ve orta segment elektrikli araçların büyük çoğunluğu bu dilimde yer alıyor.",
  },
  {
    label: "Motor gücü 160 kW'ı aşmayan / matrah 1.450.000 TL üzeri",
    motorMaxKw: 160,
    priceMin: 1450001,
    priceMax: 999999999,
    rate: 40,
    order: 2,
    note: "Donanım paketi matrahı sınırın üzerine taşıyan modeller bu dilime giriyor.",
  },
  {
    label: "Motor gücü 160 kW üzeri / matrah 2.200.000 TL'ye kadar",
    motorMaxKw: 999,
    priceMin: 0,
    priceMax: 2200000,
    rate: 50,
    order: 3,
    note: "Yüksek performanslı çift motorlu modellerin ana dilimi.",
  },
  {
    label: "Motor gücü 160 kW üzeri / matrah 2.200.000 TL üzeri",
    motorMaxKw: 999,
    priceMin: 2200001,
    priceMax: 999999999,
    rate: 60,
    order: 4,
    note: "Premium ve lüks segment elektrikli araçlar bu dilimde vergilendiriliyor.",
  },
];

const POLLS = [
  {
    question: "Elektrikli araç alırken sizin için en belirleyici kriter ne?",
    slug: "en-belirleyici-kriter",
    options: ["Menzil", "Fiyat", "Şarj hızı", "Marka ve servis ağı"],
    votes: [1842, 2461, 1130, 764],
  },
  {
    question: "Şarj işlemlerinizin çoğunu nerede yapıyorsunuz?",
    slug: "sarj-aliskanligi",
    options: ["Evde", "İş yerinde", "Halka açık DC", "Halka açık AC"],
    votes: [3218, 642, 1471, 389],
  },
];

function slugify(text) {
  const map = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

async function main() {
  console.log("→ Mevcut veriler temizleniyor...");
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.chargeStation.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.ticker.deleteMany();
  await prisma.priceIndex.deleteMany();
  await prisma.otvBracket.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.lead.deleteMany();

  console.log("→ Kategoriler...");
  const catMap = {};
  for (const c of CATEGORIES) {
    const created = await prisma.category.create({ data: c });
    catMap[c.slug] = created.id;
  }

  console.log("→ Yazarlar...");
  const authorIds = [];
  for (let i = 0; i < AUTHORS.length; i++) {
    const a = AUTHORS[i];
    const created = await prisma.author.create({
      data: { ...a, avatar: img(`author-${a.slug}`, 200, 200) },
    });
    authorIds.push(created.id);
  }

  console.log("→ Haberler...");
  const now = Date.now();
  const articleIds = [];
  for (let i = 0; i < A.length; i++) {
    const a = A[i];
    const slug = slugify(a.t);
    const paragraphs = [...a.p, CLOSERS[i % CLOSERS.length]];
    const created = await prisma.article.create({
      data: {
        title: a.t,
        slug,
        spot: a.s,
        content: paragraphs.join("\n\n"),
        image: img(`evos-${slug}`),
        imageCredit: "Evos Görsel Arşivi",
        gallery: [img(`evos-${slug}-g1`), img(`evos-${slug}-g2`)],
        tags: a.tags,
        categoryId: catMap[a.c],
        authorId: authorIds[a.au],
        isFeatured: !!a.hero,
        isHeadline: !!a.hero,
        isBreaking: !!a.breaking,
        isVideo: i % 11 === 0,
        views: 800 + ((i * 977) % 42000),
        readTime: 2 + (i % 6),
        publishedAt: new Date(now - i * 3.4 * 3600 * 1000),
      },
    });
    articleIds.push(created.id);
  }

  console.log("→ Yorumlar...");
  const commentNames = ["Ahmet K.", "Elif T.", "Murat S.", "Zeynep A.", "Can B.", "Derya M."];
  const commentBodies = [
    "Çok net bir analiz olmuş, teşekkürler. Ben de benzer sonuçlar gözlemliyorum.",
    "Şarj altyapısı hızlanmadan bu rakamların daha da artması zor bence.",
    "Kendi aracımda ölçtüğüm değerler burada yazanlara oldukça yakın.",
    "Bu konuda daha detaylı bir karşılaştırma haberi görmek isterim.",
    "Fiyat tarafı hâlâ en büyük engel; vergiler düşmeden pazar daha da açılmaz.",
    "Uzun yolda planlama yapınca menzil kaygısı gerçekten kalmıyor.",
  ];
  const commentData = [];
  for (let i = 0; i < articleIds.length; i++) {
    const count = i % 4;
    for (let j = 0; j < count; j++) {
      commentData.push({
        articleId: articleIds[i],
        name: commentNames[(i + j) % commentNames.length],
        body: commentBodies[(i + j * 2) % commentBodies.length],
        likes: (i * 7 + j * 3) % 40,
        createdAt: new Date(now - (i * 2 + j) * 3600 * 1000),
      });
    }
  }
  await prisma.comment.createMany({ data: commentData });

  console.log("→ Araçlar...");
  for (const v of VEHICLES) {
    const slug = slugify(`${v.brand} ${v.model}`);
    await prisma.vehicle.create({
      data: { ...v, slug, image: img(`car-${slug}`, 1000, 640) },
    });
  }

  console.log("→ Şarj istasyonları...");
  for (const s of STATIONS) {
    const [name, operator, city, district, address, lat, lng, socketCount, maxPowerKw, pricePerKwh, isFast] = s;
    await prisma.chargeStation.create({
      data: {
        name,
        slug: slugify(name),
        operator,
        city,
        district,
        address,
        lat,
        lng,
        socketCount,
        maxPowerKw,
        pricePerKwh,
        isFast,
        socketTypes: isFast ? ["CCS", "Type 2"] : ["Type 2"],
        amenities: ["Kafe", "WC", "Market", "Otopark"].slice(0, 2 + (socketCount % 3)),
        is24h: true,
        status: "aktif",
      },
    });
  }

  console.log("→ Marketplace ilanları...");
  for (const l of LISTINGS) {
    const [title, brand, model, year, km, price, city, sellerType, sellerName, batteryHealth, rangeKm, color, isSponsored] = l;
    const slug = slugify(title);
    await prisma.listing.create({
      data: {
        title,
        slug,
        brand,
        model,
        year,
        km,
        price,
        city,
        image: img(`listing-${slug}`, 900, 600),
        images: [img(`listing-${slug}-1`, 900, 600), img(`listing-${slug}-2`, 900, 600), img(`listing-${slug}-3`, 900, 600)],
        sellerType,
        sellerName,
        batteryHealth,
        rangeKm,
        color,
        isSponsored,
        description: `${year} model ${brand} ${model}. ${km.toLocaleString("tr-TR")} km'de, batarya sağlığı %${batteryHealth}. Evos ekspertiz raporu mevcuttur, tramer kaydı bulunmamaktadır.`,
      },
    });
  }

  console.log("→ Topluluk gönderileri...");
  for (let i = 0; i < COMMUNITY.length; i++) {
    const [title, body, author, topic, likes, replies, isPinned] = COMMUNITY[i];
    await prisma.communityPost.create({
      data: {
        title,
        slug: slugify(title),
        body,
        author,
        avatar: img(`user-${i}`, 120, 120),
        topic,
        likes,
        replies,
        isPinned,
        createdAt: new Date(now - i * 9 * 3600 * 1000),
      },
    });
  }

  console.log("→ Ticker, endeks, ÖTV, anketler...");
  await prisma.ticker.createMany({ data: TICKERS });
  await prisma.priceIndex.createMany({
    data: PRICE_INDEX.map(([month, order, avgEvPrice, avgIcePrice, acChargeCost, dcChargeCost, fuelCost, batteryUsd, evShare]) => ({
      month, order, avgEvPrice, avgIcePrice, acChargeCost, dcChargeCost, fuelCost, batteryUsd, evShare,
    })),
  });
  await prisma.otvBracket.createMany({ data: OTV_BRACKETS });
  await prisma.poll.createMany({ data: POLLS });
  await prisma.subscriber.createMany({
    data: [
      { email: "demo@evos.com.tr", city: "İstanbul" },
      { email: "bulten@evos.com.tr", city: "Ankara" },
    ],
  });

  const counts = {
    kategori: await prisma.category.count(),
    yazar: await prisma.author.count(),
    haber: await prisma.article.count(),
    yorum: await prisma.comment.count(),
    arac: await prisma.vehicle.count(),
    istasyon: await prisma.chargeStation.count(),
    ilan: await prisma.listing.count(),
    topluluk: await prisma.communityPost.count(),
  };
  console.log("✔ Seed tamamlandı:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
