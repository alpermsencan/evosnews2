import { Metadata } from "next";
import CategoryPageTemplate from "@/components/listings/CategoryPageTemplate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Elektrikli UTV İlanları — 2.EL İLANLAR",
  description: "Türkiye'de satılık 2. el elektrikli kabinli arazi UTV ilanları.",
};

type SP = Promise<Record<string, string | undefined>>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  return <CategoryPageTemplate categorySlug="elektrikli-utv" searchParams={searchParams} />;
}
