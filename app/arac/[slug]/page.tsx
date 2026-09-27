import { redirect } from "next/navigation";

export default async function AracSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/araclar/${slug}`);
}
