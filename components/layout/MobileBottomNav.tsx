"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBolt,
  IconCar,
  IconTag,
  IconUser,
} from "@/components/ui/Icons";

function IconNewspaper({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  );
}

const ITEMS = [
  { href: "/kategori/haber-merkezi", label: "Haber", Icon: IconNewspaper },
  { href: "/araclar", label: "Elektrikli Araçlar", Icon: IconCar },
  { href: "/ilanlar", label: "2.El İlanlar", Icon: IconTag },
  { href: "/sarj-agi", label: "Şarj", Icon: IconBolt },
  { href: "/bana-ozel", label: "Bana Özel", Icon: IconUser },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur lg:hidden">
      <ul className="flex items-stretch">
        {ITEMS.map(({ href, label, Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition text-center ${
                  active ? "text-evos font-black" : "text-neutral-500"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="leading-tight truncate max-w-[68px]">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
