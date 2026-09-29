import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import MessagesCenter from "@/components/user/MessagesCenter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mesajlarım — EVOtoPilot",
  description: "İkinci el elektrikli araç ilanları ve üyelerle doğrudan mesajlaşma merkezi.",
};

export default async function MemberMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; listing?: string }>;
}) {
  const viewer = await getCurrentUser();
  if (!viewer) {
    redirect("/giris?next=/hesabim/mesajlar");
  }

  const sp = await searchParams;
  const initialOtherUserId = sp.user || null;

  return (
    <div className="flex flex-col gap-4 px-3 py-4 sm:px-0 sm:pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <nav className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400">
            <Link href="/hesabim" className="hover:text-blue-600">
              HESABIM
            </Link>
            <span>›</span>
            <span className="text-neutral-700">MESAJLAR</span>
          </nav>
          <h1 className="text-xl font-black text-neutral-900 mt-1">
            Mesajlarım
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ilanlar"
            className="rounded-xl border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
          >
            İkinci El İlanlar
          </Link>
          <Link
            href="/hesabim"
            className="rounded-xl bg-neutral-100 px-3.5 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-200 transition"
          >
            Hesap Ayarları
          </Link>
        </div>
      </div>

      <MessagesCenter
        currentUserId={viewer.id}
        initialOtherUserId={initialOtherUserId}
      />
    </div>
  );
}
