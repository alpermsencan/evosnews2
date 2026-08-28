"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  IconBolt,
  IconCar,
  IconChart,
  IconClose,
  IconLayers,
  IconMenu,
  IconUsers,
  IconTag,
} from "@/components/ui/Icons";

const NAV = [
  { href: "/admin", label: "Gösterge Paneli", Icon: IconChart },
  { href: "/admin/haberler", label: "Haberler", Icon: IconLayers },
  { href: "/admin/kuyruk", label: "Moderasyon Kuyruğu", Icon: IconLayers },
  { href: "/admin/kaynaklar", label: "Veri Kaynakları", Icon: IconBolt },
  { href: "/admin/kategoriler", label: "Kategoriler", Icon: IconTag },
  { href: "/admin/yazarlar", label: "Yazarlar", Icon: IconUsers },
  { href: "/admin/uyeler", label: "Üyeler", Icon: IconUsers },
  { href: "/admin/yorumlar", label: "Yorumlar", Icon: IconUsers },
  { href: "/admin/gonderiler", label: "Gönderiler & Reels", Icon: IconLayers },
  { href: "/admin/araclar", label: "Araçlar", Icon: IconCar },
  { href: "/admin/arac-senkronizasyon", label: "Araç Senkronizasyonu", Icon: IconBolt },
  { href: "/admin/ilanlar", label: "İlanlar & Batarya Raporu", Icon: IconCar },
  { href: "/admin/garaj", label: "Dijital Garaj", Icon: IconLayers },
  { href: "/admin/istasyonlar", label: "Şarj İstasyonları", Icon: IconBolt },
  { href: "/admin/tarifeler", label: "Şarj Tarifeleri", Icon: IconTag },
  { href: "/admin/ocpi", label: "OCPI Roaming Entegrasyonu", Icon: IconBolt },
  { href: "/admin/topluluk", label: "Topluluk", Icon: IconUsers },
  { href: "/admin/gosterge", label: "Veri Şeridi", Icon: IconChart },
  { href: "/admin/aboneler", label: "Bülten Aboneleri", Icon: IconUsers },
  { href: "/admin/talepler", label: "Talepler", Icon: IconLayers },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Giriş sayfasında kabuk gösterme
  if (pathname === "/admin/giris") return <>{children}</>;

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/giris");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-evos-ink text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <IconBolt className="h-6 w-6 text-evos" />
            <span className="text-lg font-black">
              Evos<span className="text-white/50">Admin</span>
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-white/70 hover:bg-white/10 lg:hidden"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="flex flex-col">
            {NAV.map(({ href, label, Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition ${
                      active
                        ? "border-l-4 border-evos bg-white/10 text-white"
                        : "border-l-4 border-transparent text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-2 border-t border-white/10 p-4">
          <Link
            href="/"
            className="rounded-md bg-white/10 px-4 py-2 text-center text-xs font-bold text-white transition hover:bg-white/20"
          >
            SİTEYİ GÖRÜNTÜLE
          </Link>
          <button
            onClick={logout}
            className="rounded-md bg-evos px-4 py-2 text-xs font-bold text-white transition hover:bg-evos-dark"
          >
            ÇIKIŞ YAP
          </button>
        </div>
      </aside>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* İçerik */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="rounded p-1 text-neutral-600 lg:hidden"
          >
            <IconMenu className="h-6 w-6" />
          </button>
          <h1 className="text-sm font-black tracking-wide text-neutral-800">
            {NAV.find((n) =>
              n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)
            )?.label ?? "Yönetim"}
          </h1>
          <span className="ml-auto text-xs font-semibold text-neutral-400">
            Evos Gazete CMS
          </span>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
