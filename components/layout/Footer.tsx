import Link from "next/link";
import { FOOTER_GROUPS } from "@/lib/nav";
import Logo from "@/components/ui/Logo";
import NewsletterForm from "@/components/ui/NewsletterForm";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#08090C] text-white border-t border-neutral-800">
      <div className="mx-auto max-w-[1280px] px-4 py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="flex max-w-sm flex-col gap-4">
            <Logo size="lg" theme="dark" variant="footer" />
            <p className="text-sm leading-relaxed text-neutral-400">
              Türkiye&apos;nin elektrikli araç ve akıllı mobilite platformu.
              Doğrulanmış elektrikli model verileri, canlı şarj ağı haritası, ikinci el pazarı ve uzman rehberliği tek merkezde.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-neutral-400 font-medium">
              <div className="flex items-center gap-2">
                <span className="text-sky-400">E-Posta:</span>
                <a href="mailto:info@e-aracim.com" className="hover:text-white transition">
                  info@e-aracim.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sky-400">Telefon:</span>
                <a href="tel:+905408777728" className="hover:text-white transition">
                  +90 540 877 77 28
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sky-400">Konum:</span>
                <span>İstanbul / Türkiye</span>
              </div>
            </div>
            <div className="pt-2">
              <NewsletterForm variant="dark" />
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-4 lg:max-w-3xl">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <h4 className="text-[11px] font-black tracking-[0.16em] text-sky-400 uppercase">
                  {group.title}
                </h4>
                <ul className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item.href + item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-neutral-400 transition hover:text-white hover:underline underline-offset-4"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-900 bg-[#050608]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-neutral-500 sm:flex-row sm:text-left">
          <span>
            © {new Date().getFullYear()} e-aracim.com. Tüm hakları saklıdır.
          </span>
          <span>
            Veriler resmi üretici katalogları ve bağımsız test protokollerine dayanmaktadır.
          </span>
        </div>
      </div>
    </footer>
  );
}
