import { Metadata } from "next";
import CategoryPageTemplate from "@/components/listings/CategoryPageTemplate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Elektrikli Kickscooter İlanları — 2.EL İLANLAR",
  description: "Türkiye'de satılık 2. el elektrikli kickscooter ve mikromobilite araç ilanları.",
};

type SP = Promise<Record<string, string | undefined>>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  return <CategoryPageTemplate categorySlug="elektrikli-kickscooter" searchParams={searchParams} />;
}
