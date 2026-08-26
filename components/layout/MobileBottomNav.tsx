"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBolt,
  IconCar,
  IconHome,
  IconUser,
  IconUsers,
} from "@/components/ui/Icons";
import { useSession } from "@/components/user/SessionProvider";

const ITEMS = [
  { href: "/", label: "Anasayfa", Icon: IconHome },
  { href: "/akis", label: "Akışım", Icon: IconUsers },
  { href: "/ilanlar", label: "İlanlar", Icon: IconCar },
  { href: "/sarj-agi", label: "Şarj Ağı", Icon: IconBolt },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useSession();

  const items = [
    ...ITEMS,
    user
      ? { href: `/profil/${user.username}`, label: "Profilim", Icon: IconUser }
      : { href: "/giris", label: "Giriş", Icon: IconUser },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur lg:hidden">
      <ul className="flex items-stretch">
        {items.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition ${
                  active ? "text-evos" : "text-neutral-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
