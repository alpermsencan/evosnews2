"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBolt,
  IconCar,
  IconHome,
  IconStore,
  IconUsers,
} from "@/components/ui/Icons";

const ITEMS = [
  { href: "/", label: "Anasayfa", Icon: IconHome },
  { href: "/araclar", label: "Araçlar", Icon: IconCar },
  { href: "/sarj-agi", label: "Şarj", Icon: IconBolt },
  { href: "/marketplace", label: "Market", Icon: IconStore },
  { href: "/topluluk", label: "Topluluk", Icon: IconUsers },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur lg:hidden">
      <ul className="flex items-stretch">
        {ITEMS.map(({ href, label, Icon }) => {
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
