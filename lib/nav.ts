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
  { label: "İLANLAR", href: "/ilanlar" },
  { label: "KARŞILAŞTIR", href: "/karsilastir" },
  { label: "ŞARJ AĞI", href: "/sarj-agi" },
  { label: "ŞARJ FİYATLARI", href: "/sarj-fiyatlari" },
  { label: "FİYAT ANALİZİ", href: "/fiyat-analizi" },
  { label: "FİNANSMAN", href: "/finansman" },
  { label: "ÖTV REHBERİ", href: "/otv-rehberi" },
  { label: "DİJİTAL GARAJ", href: "/dijital-garaj" },
  { label: "TOPLULUK", href: "/topluluk" },
  { label: "EVOS PROTECT", href: "/evos-protect" },
  { label: "AI DANIŞMAN", href: "/ai-danisman" },
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
        label: "İlanlar",
        href: "/ilanlar",
        desc: "Sıfır ve ikinci el ilanlar, batarya raporu ve VoltScore ile",
        badge: "YENİ",
      },
      {
        label: "Karşılaştır",
        href: "/karsilastir",
        desc: "Sıfır modelleri ve ikinci el ilanları yan yana inceleyin",
      },
      {
        label: "Şarj Ağını Göster",
        href: "/sarj-agi",
        desc: "Türkiye genelinde istasyon envanteri ve rota",
      },
      {
        label: "Şarj Fiyatları",
        href: "/sarj-fiyatlari",
        desc: "Operatör tarifeleri: AC, DC ve ultra hızlı ₺/kWh karşılaştırması",
        badge: "YENİ",
      },
      {
        label: "Platformu İncele",
        href: "/platform",
        desc: "Evos ekosistemi, API ve iş ortaklıkları",
      },
      {
        label: "AI Danışmanı Anlat",
        href: "/ai-danisman",
        desc: "Yapay zekâ destekli araç danışmanı ve sesli asistan",
        badge: "YENİ",
      },
    ],
  },
  {
    title: "İÇERİK",
    items: [
      { label: "Haber Merkezi", href: "/kategori/haber-merkezi" },
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
      { label: "Şarj Fiyatları", href: "/sarj-fiyatlari" },
      { label: "Batarya Raporu", href: "/batarya-raporu" },
      { label: "Finansman", href: "/finansman" },
      { label: "Fiyat Analizi", href: "/fiyat-analizi" },
      { label: "Evos Protect", href: "/evos-protect" },
      { label: "Evos Charge Network", href: "/sarj-agi" },
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
  { label: "İlanlar", href: "/ilanlar" },
  { label: "Şarj Bul", href: "/sarj-agi" },
  { label: "Şarj Fiyatı", href: "/sarj-fiyatlari" },
  { label: "ÖTV Hesapla", href: "/otv-rehberi" },
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
      { label: "Şarj Fiyatları", href: "/sarj-fiyatlari" },
      { label: "Evos Protect", href: "/evos-protect" },
      { label: "Dijital Garaj", href: "/dijital-garaj" },
      { label: "AI Danışman", href: "/ai-danisman" },
    ],
  },
  {
    title: "ARAÇLAR",
    items: [
      { label: "Araçları Keşfet", href: "/araclar" },
      { label: "İlanlar", href: "/ilanlar" },
      { label: "Karşılaştır", href: "/karsilastir" },
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
      { label: "Hakkımızda", href: "/hakkinda" },
      { label: "İletişim", href: "/iletisim" },
      { label: "Evos Pro", href: "/pro" },
      { label: "Platform", href: "/platform" },
      { label: "Yönetim Paneli", href: "/admin" },
    ],
  },
];
