import { Metadata } from "next";
import CategoryPageTemplate from "@/components/listings/CategoryPageTemplate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Elektrikli Otomobil İlanları — 2.EL İLANLAR",
  description: "Türkiye'de satılık 2. el elektrikli otomobil ilanları, batarya raporları ve VoltScore puanları.",
};

type SP = Promise<Record<string, string | undefined>>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  return <CategoryPageTemplate categorySlug="elektrikli-otomobil" searchParams={searchParams} />;
}
