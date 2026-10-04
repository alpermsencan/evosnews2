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
  { label: "ŞARJ", href: "/sarj-agi" },
  { label: "HABER MERKEZİ", href: "/kategori/haber-merkezi" },
  { label: "TOPLULUK", href: "/topluluk" },
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
    ],
  },
  {
    title: "ŞARJ & MOBİLİTE",
    items: [
      {
        label: "Şarj Ağı & Tarifeler",
        href: "/sarj-agi",
        desc: "Türkiye geneli istasyonlar, soketler ve operatör tarifeleri",
      },
      {
        label: "Şarj & Rota Planlama",
        href: "/sarj-agi/rota",
        desc: "Elektrikli araç şarj noktalarıyla rota hesaplayıcı",
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
  { label: "Şarj", href: "/sarj-agi" },
  { label: "Haber Merkezi", href: "/kategori/haber-merkezi" },
];

export const FOOTER_GROUPS: NavGroup[] = [
  {
    title: "e-ARACIM İÇERİK",
    items: [
      { label: "Haber Merkezi", href: "/kategori/haber-merkezi" },
      { label: "Teknoloji & Batarya", href: "/kategori/teknoloji" },
      { label: "Dünya Gündemi", href: "/kategori/dunya" },
      { label: "Test Sürüşleri", href: "/kategori/test-surusu" },
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
      { label: "Şarj Ağı & Fiyatları", href: "/sarj-agi" },
      { label: "Şarj & Rota Planlama", href: "/sarj-agi/rota" },
      { label: "En Yakın İstasyonlar", href: "/sarj-agi" },
    ],
  },
  {
    title: "KURUMSAL & YASAL",
    items: [
      { label: "Hakkımızda", href: "/hakkinda" },
      { label: "İletişim", href: "/iletisim" },
      { label: "Veri ve Gizlilik Politikası", href: "/veri-gizlilik" },
      { label: "KVKK Aydınlatma Metni", href: "/yasal/kvkk" },
      { label: "İlan Verme Kuralları", href: "/yasal/ilan-verme-kurallari" },
      { label: "Yönetim Paneli", href: "/admin" },
    ],
  },
];
