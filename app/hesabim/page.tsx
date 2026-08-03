import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import ProfileForm from "@/components/user/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hesap Ayarları" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?devam=/hesabim");

  return (
    <div className="flex flex-col gap-4 px-3 py-4 sm:px-0 sm:pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-black text-neutral-900">Hesap Ayarları</h1>
        <div className="flex gap-3 text-xs font-bold">
          <Link
            href={`/profil/${user.username}`}
            className="text-neutral-500 hover:text-evos"
          >
            PROFİLİMİ GÖR →
          </Link>
          <Link
            href="/hesabim/kaydedilenler"
            className="text-neutral-500 hover:text-evos"
          >
            KAYDEDİLENLER →
          </Link>
        </div>
      </div>

      <ProfileForm
        initial={{
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          city: user.city,
          website: user.website,
          twitter: user.twitter,
        }}
      />
    </div>
  );
}
