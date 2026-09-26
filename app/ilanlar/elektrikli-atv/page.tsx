import { Metadata } from "next";
import CategoryPageTemplate from "@/components/listings/CategoryPageTemplate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Elektrikli ATV İlanları — 2.EL İLANLAR",
  description: "Türkiye'de satılık 2. el elektrikli arazi ATV ilanları ve fiyatları.",
};

type SP = Promise<Record<string, string | undefined>>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  return <CategoryPageTemplate categorySlug="elektrikli-atv" searchParams={searchParams} />;
}
