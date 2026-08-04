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
export const TOP_NAV: NavItem[] = [
  { label: "ANASAYFA", href: "/" },
  { label: "AKIŞIM", href: "/akis" },
  { label: "REELS", href: "/reels" },
  { label: "HABER MERKEZİ", href: "/kategori/haber-merkezi" },
  { label: "ARAÇ MERKEZİ", href: "/arac-merkezi" },
  { label: "ARAÇLARI KEŞFET", href: "/araclar" },
  { label: "ŞARJ AĞI", href: "/sarj-agi" },
  { label: "FİYAT ANALİZİ", href: "/fiyat-analizi" },
  { label: "ÖTV REHBERİ", href: "/otv-rehberi" },
  { label: "MARKETPLACE", href: "/marketplace" },
  { label: "DİJİTAL GARAJ", href: "/dijital-garaj" },
  { label: "TOPLULUK", href: "/topluluk" },
  { label: "EVOS PROTECT", href: "/evos-protect" },
  { label: "AI DANIŞMAN", href: "/ai-danisman" },
  { label: "VOICE INTELLIGENCE", href: "/voice-intelligence" },
  { label: "PLATFORM", href: "/platform" },
  { label: "TEKNOLOJİ", href: "/kategori/teknoloji" },
  { label: "DÜNYA", href: "/kategori/dunya" },
];

/** Hamburger menüden açılan sidebar içeriği */
export const SIDEBAR_GROUPS: NavGroup[] = [
  {
    title: "SOSYAL",
    items: [
      {
        label: "Akışım",
        href: "/akis",
        desc: "Takip ettiklerin ve arkadaşlarının paylaşımları",
        badge: "YENİ",
      },
      {
        label: "Reels",
        href: "/reels",
        desc: "Kullanıcılardan kısa dikey videolar",
        badge: "YENİ",
      },
      {
        label: "Arkadaşlarım",
        href: "/arkadaslar",
        desc: "Arkadaşlık istekleri ve kişi önerileri",
      },
      {
        label: "Topluluk",
        href: "/topluluk",
        desc: "Forum başlıkları ve tartışmalar",
      },
    ],
  },
  {
    title: "KEŞFET",
    items: [
      {
        label: "Araçları Keşfet",
        href: "/araclar",
        desc: "20+ elektrikli model, teknik veri ve karşılaştırma",
      },
      {
        label: "Şarj Ağını Göster",
        href: "/sarj-agi",
        desc: "Türkiye genelinde istasyon haritası ve tarifeler",
      },
      {
        label: "Platformu İncele",
        href: "/platform",
        desc: "Evos ekosistemi, API ve iş ortaklıkları",
      },
      {
        label: "AI Danışmanı Anlat",
        href: "/ai-danisman",
        desc: "Yapay zekâ destekli araç ve maliyet danışmanı",
        badge: "YENİ",
      },
    ],
  },
  {
    title: "İÇERİK",
    items: [
      { label: "Haber Merkezi", href: "/kategori/haber-merkezi" },
      { label: "Voice Intelligence", href: "/voice-intelligence", badge: "BETA" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Araç Merkezi", href: "/arac-merkezi" },
      { label: "Teknoloji", href: "/kategori/teknoloji" },
      { label: "Dünya", href: "/kategori/dunya" },
      { label: "Test Sürüşü", href: "/kategori/test-surusu" },
    ],
  },
  {
    title: "HİZMETLER",
    items: [
      { label: "ÖTV Rehberi", href: "/otv-rehberi" },
      { label: "Fiyat Analizi", href: "/fiyat-analizi" },
      { label: "Evos Protect", href: "/evos-protect" },
      { label: "Evos Charge Network", href: "/sarj-agi" },
      { label: "Evos Market", href: "/marketplace" },
      { label: "Dijital Garaj", href: "/dijital-garaj" },
      { label: "Topluluk", href: "/topluluk" },
    ],
  },
];

/** Öne çıkan hızlı erişim kutuları (sidebar üstü) */
export const QUICK_LINKS: NavItem[] = [
  { label: "Akışım", href: "/akis" },
  { label: "Reels", href: "/reels" },
  { label: "Araç Bul", href: "/araclar" },
  { label: "Şarj Bul", href: "/sarj-agi" },
  { label: "ÖTV Hesapla", href: "/otv-rehberi" },
  { label: "İlanlar", href: "/marketplace" },
];

export const FOOTER_GROUPS: NavGroup[] = [
  {
    title: "EVOS GAZETE",
    items: [
      { label: "Haber Merkezi", href: "/kategori/haber-merkezi" },
      { label: "Teknoloji", href: "/kategori/teknoloji" },
      { label: "Dünya", href: "/kategori/dunya" },
      { label: "Test Sürüşü", href: "/kategori/test-surusu" },
      { label: "Fiyat Analizi", href: "/fiyat-analizi" },
    ],
  },
  {
    title: "ÜRÜNLER",
    items: [
      { label: "Evos Charge Network", href: "/sarj-agi" },
      { label: "Evos Market", href: "/marketplace" },
      { label: "Evos Protect", href: "/evos-protect" },
      { label: "Dijital Garaj", href: "/dijital-garaj" },
      { label: "AI Danışman", href: "/ai-danisman" },
      { label: "Voice Intelligence", href: "/voice-intelligence" },
    ],
  },
  {
    title: "ARAÇLAR",
    items: [
      { label: "Araçları Keşfet", href: "/araclar" },
      { label: "Araç Merkezi", href: "/arac-merkezi" },
      { label: "ÖTV Hesaplama", href: "/otv-rehberi" },
      { label: "Platform", href: "/platform" },
    ],
  },
  {
    title: "SOSYAL",
    items: [
      { label: "Akışım", href: "/akis" },
      { label: "Reels", href: "/reels" },
      { label: "Arkadaşlarım", href: "/arkadaslar" },
      { label: "Topluluk", href: "/topluluk" },
    ],
  },
  {
    title: "KURUMSAL",
    items: [
      { label: "Hakkımızda", href: "/platform" },
      { label: "İletişim", href: "/platform#iletisim" },
      { label: "Yönetim Paneli", href: "/admin" },
      { label: "Gizlilik", href: "/platform" },
      { label: "Künye", href: "/platform" },
    ],
  },
];
