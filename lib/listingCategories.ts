export type ListingCategoryConfig = {
  slug: string;
  name: string;
  title: string;
  icon: string;
  description: string;
};

export const LISTING_CATEGORIES: ListingCategoryConfig[] = [
  {
    slug: "elektrikli-otomobil",
    name: "Elektrikli Otomobil",
    title: "Elektrikli Otomobil",
    icon: "🚗",
    description: "Sedan, hatchback ve şehir içi elektrikli binek otomobil ilanları.",
  },
  {
    slug: "elektrikli-arazi-suv-pickup",
    name: "Elektrikli Arazi- Suv & Pickup",
    title: "Elektrikli Arazi- Suv & Pickup",
    icon: "🚙",
    description: "4x4, SUV, crossover ve pickup elektrikli araç ilanları.",
  },
  {
    slug: "elektrikli-minivan-panelvan",
    name: "Elektrikli Minivan & Panelvan",
    title: "Elektrikli Minivan & Panelvan",
    icon: "🚐",
    description: "Ticari, yolcu taşıma ve minivan elektrikli araç ilanları.",
  },
  {
    slug: "elektrikli-motosiklet",
    name: "Elektrikli Motosiklet",
    title: "Elektrikli Motosiklet",
    icon: "🏍️",
    description: "Şehir içi ve performans odaklı elektrikli motosiklet & scooter modelleri.",
  },
  {
    slug: "elektrikli-atv",
    name: "Elektrikli ATV",
    title: "Elektrikli ATV",
    icon: "🛞",
    description: "Arazi ve eğlence amaçlı dört tekerlekli elektrikli ATV ilanları.",
  },
  {
    slug: "elektrikli-utv",
    name: "Elektrikli UTV",
    title: "Elektrikli UTV",
    icon: "🏎️",
    description: "Kabinli, çift kişilik yan yana oturuşlu elektrikli off-road UTV araçları.",
  },
  {
    slug: "elektrikli-kickscooter",
    name: "Elektrikli Kickscooter",
    title: "Elektrikli Kickscooter",
    icon: "🛴",
    description: "Mikromobilite, katlanabilir ve şehir içi elektrikli scooter ilanları.",
  },
  {
    slug: "elektrikli-hizmet-araclari",
    name: "Elektrikli Hizmet Araçları",
    title: "Elektrikli Hizmet Araçları",
    icon: "🚛",
    description: "Golf arabaları, belediye ve tesis içi elektrikli hizmet araçları.",
  },
];

export function getListingCategory(slug: string): ListingCategoryConfig | undefined {
  return LISTING_CATEGORIES.find((c) => c.slug === slug);
}
