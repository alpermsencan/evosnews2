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
  { label: "2.EL İLANLAR", href: "/ilanlar" },
  { label: "ŞARJ AĞI", href: "/sarj-agi" },
  { label: "ŞARJ FİYATLARI", href: "/sarj-fiyatlari" },
  { label: "HABERLER", href: "/kategori/haber-merkezi" },
  { label: "FİYAT ANALİZİ", href: "/fiyat-analizi" },
  { label: "TOPLULUK", href: "/topluluk" },
  { label: "PLATFORM", href: "/platform" },
];

/** Hamburger menüden açılan sidebar içeriği */
export const SIDEBAR_GROUPS: NavGroup[] = [
  {
    title: "ARAÇLAR & PAZAR",
    items: [
      {
        label: "Araçları Keşfet",
        href: "/araclar",
        desc: "2026 elektrikli modeller, teknik veri ve filtreleme",
      },
      {
        label: "2.EL İLANLAR",
        href: "/ilanlar",
        desc: "Elektrikli araç pazarı, kategori bazlı vitrin",
        badge: "YENİ",
      },
      {
        label: "Fiyat Analiz Endeksi",
        href: "/fiyat-analizi",
        desc: "Elektrikli araç piyasa değerleri ve trendler",
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
    ],
  },
  {
    title: "TOPLULUK & ETKİLEŞİM",
    items: [
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
  { label: "2.EL İLANLAR", href: "/ilanlar" },
  { label: "Şarj Bul", href: "/sarj-agi" },
  { label: "Şarj Fiyatı", href: "/sarj-fiyatlari" },
  { label: "Fiyat Analizi", href: "/fiyat-analizi" },
  { label: "Haberler", href: "/kategori/haber-merkezi" },
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
    title: "ARAÇLAR & İLANLAR",
    items: [
      { label: "Araçları Keşfet", href: "/araclar" },
      { label: "2.EL İLANLAR", href: "/ilanlar" },
      { label: "Araç İncelemeleri", href: "/arac-merkezi" },
      { label: "Topluluk", href: "/topluluk" },
    ],
  },
  {
    title: "ŞARJ & MOBİLİTE",
    items: [
      { label: "EVO Charge Network", href: "/sarj-agi" },
      { label: "Şarj Tarifeleri", href: "/sarj-fiyatlari" },
      { label: "Şarj & Rota Planlama", href: "/sarj-agi/rota" },
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
