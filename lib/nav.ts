export type NavItem = {
  label: string;
  href: string;
  desc?: string;
  badge?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

/** Üst yatay menü (Hürriyet'teki ANASAYFA / GÜNDEM / DÜNYA şeridi gibi) */
export type NavItem = {
  label: string;
  href: string;
  desc?: string;
  badge?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

/** Üst yatay menü */
export const TOP_NAV: NavItem[] = [
  { label: "ANASAYFA", href: "/" },
  { label: "ARAÇLARI KEŞFET", href: "/araclar" },
  { label: "KARŞILAŞTIR", href: "/karsilastir" },
  { label: "TASARRUF HESAPLA", href: "/tasarruf-hesapla", badge: "YENİ" },
  { label: "MENZİL SİMÜLATÖRÜ", href: "/araclar#menzil-simulatoru", badge: "YENİ" },
  { label: "ŞARJ AĞI", href: "/sarj-agi" },
  { label: "ŞARJ FİYATLARI", href: "/sarj-fiyatlari" },
  { label: "ÖTV REHBERİ", href: "/otv-rehberi" },
  { label: "2.EL İLANLAR", href: "/ilanlar" },
  { label: "AI DANIŞMAN", href: "/ai-danisman" },
  { label: "HABERLER", href: "/kategori/haber-merkezi" },
  { label: "FİYAT ANALİZİ", href: "/fiyat-analizi" },
  { label: "TOPLULUK", href: "/topluluk" },
  { label: "EVO PROTECT", href: "/evos-protect" },
  { label: "PLATFORM", href: "/platform" },
];

/** Hamburger menüden açılan sidebar içeriği */
export const SIDEBAR_GROUPS: NavGroup[] = [
  {
    title: "ARAÇLAR & HESAPLAYICILAR",
    items: [
      {
        label: "Araçları Keşfet",
        href: "/araclar",
        desc: "2026 elektrikli modeller, teknik veri ve filtreleme",
      },
      {
        label: "Tasarruf Hesaplayıcı",
        href: "/tasarruf-hesapla",
        desc: "Benzin vs. Elektrik: Yıllık net cepte kalan tasarruf",
        badge: "YENİ",
      },
      {
        label: "Gerçek Menzil Simülatörü",
        href: "/araclar#menzil-simulatoru",
        desc: "Sıcaklık, hız ve klimaya göre anlık menzil tahmini",
        badge: "YENİ",
      },
      {
        label: "Karşılaştır",
        href: "/karsilastir",
        desc: "Modelleri ve ikinci el ilanları yan yana inceleyin",
      },
      {
        label: "ÖTV Rehberi & Hesaplayıcı",
        href: "/otv-rehberi",
        desc: "2026 güncel matrah ve ÖTV oranları hesaplama",
      },
      {
        label: "AI Araç Danışmanı",
        href: "/ai-danisman",
        desc: "Yapay zekâ ve sesli asistan destekli araç seçimi",
        badge: "YENİ",
      },
    ],
  },
  {
    title: "ŞARJ & MOBİLİTE",
    items: [
      {
        label: "Şarj Ağı Haritası",
        href: "/sarj-agi",
        desc: "Türkiye geneli istasyonlar, soketler ve rota planlama",
      },
      {
        label: "Şarj Fiyatları & Tarifeler",
        href: "/sarj-fiyatlari",
        desc: "ZES, Trugo, Eşarj ve operatörlerin güncel ₺/kWh tarifeleri",
        badge: "YENİ",
      },
      {
        label: "Fiyat Analiz Endeksi",
        href: "/fiyat-analizi",
        desc: "Elektrikli araç piyasa değerleri ve trendler",
      },
      {
        label: "EVO Protect",
        href: "/evos-protect",
        desc: "10 yıl garantili batarya ve koruma paketleri",
      },
    ],
  },
  {
    title: "PAZAR & TOPLULUK",
    items: [
      {
        label: "İlanlar Pazarı",
        href: "/ilanlar",
        desc: "Sıfır ve ikinci el ilanlar, VoltScore batarya karnesiyle",
        badge: "YENİ",
      },
      {
        label: "Akışım",
        href: "/akis",
        desc: "Takip ettikleriniz ve arkadaş paylaşımları",
      },
      {
        label: "Topluluk Forumu",
        href: "/topluluk",
        desc: "Elektrikli araç sahipleriyle soru-cevap ve tartışmalar",
      },
    ],
  },
  {
    title: "HABER & İÇERİK",
    items: [
      { label: "Haber Merkezi", href: "/kategori/haber-merkezi" },
      { label: "Araç İncelemeleri", href: "/arac-merkezi" },
      { label: "Teknoloji & Batarya", href: "/kategori/teknoloji" },
      { label: "Dünya Gündemi", href: "/kategori/dunya" },
      { label: "Test Sürüşleri", href: "/kategori/test-surusu" },
    ],
  },
];

/** Öne çıkan hızlı erişim kutuları (sidebar üstü) */
export const QUICK_LINKS: NavItem[] = [
  { label: "Araç Bul", href: "/araclar" },
  { label: "Tasarruf Hesabı", href: "/tasarruf-hesapla" },
  { label: "Menzil Simülatörü", href: "/araclar#menzil-simulatoru" },
  { label: "Şarj Bul", href: "/sarj-agi" },
  { label: "Şarj Fiyatı", href: "/sarj-fiyatlari" },
  { label: "ÖTV Hesapla", href: "/otv-rehberi" },
  { label: "AI Danışman", href: "/ai-danisman" },
  { label: "2.EL İLANLAR", href: "/ilanlar" },
];

export const FOOTER_GROUPS: NavGroup[] = [
  {
    title: "EVOTOPILOT İÇERİK",
    items: [
      { label: "Haber Merkezi", href: "/kategori/haber-merkezi" },
      { label: "Teknoloji", href: "/kategori/teknoloji" },
      { label: "Dünya", href: "/kategori/dunya" },
      { label: "Test Sürüşü", href: "/kategori/test-surusu" },
      { label: "Fiyat Analizi", href: "/fiyat-analizi" },
    ],
  },
  {
    title: "AKILLI ARAÇLAR",
    items: [
      { label: "Tasarruf Hesaplayıcı", href: "/tasarruf-hesapla" },
      { label: "Gerçek Menzil Simülatörü", href: "/araclar#menzil-simulatoru" },
      { label: "AI Araç Danışmanı", href: "/ai-danisman" },
      { label: "ÖTV Hesaplama", href: "/otv-rehberi" },
      { label: "Karşılaştırma Motoru", href: "/karsilastir" },
    ],
  },
  {
    title: "ŞARJ & EKOSİSTEM",
    items: [
      { label: "EVO Charge Network", href: "/sarj-agi" },
      { label: "Şarj Tarifeleri", href: "/sarj-fiyatlari" },
      { label: "EVO Protect Batarya Güvencesi", href: "/evos-protect" },
      { label: "2.EL İLANLAR", href: "/ilanlar" },
    ],
  },
  {
    title: "KURUMSAL",
    items: [
      { label: "Hakkımızda", href: "/hakkinda" },
      { label: "İletişim", href: "/iletisim" },
      { label: "EVO Pro", href: "/pro" },
      { label: "Platform API", href: "/platform" },
      { label: "Yönetim Paneli", href: "/admin" },
    ],
  },
];
