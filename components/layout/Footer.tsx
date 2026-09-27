import Link from "next/link";
import { FOOTER_GROUPS } from "@/lib/nav";
import Logo from "@/components/ui/Logo";
import NewsletterForm from "@/components/ui/NewsletterForm";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#040813] text-white border-t border-white/[0.08]">
      <div className="mx-auto max-w-[1280px] px-4 py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="flex max-w-sm flex-col gap-4">
            <Logo size="lg" showTagline={true} />
            <p className="text-sm leading-relaxed text-slate-400">
              Elektrikli mobilitenin Türkiye&apos;deki yayın ve teknoloji merkezi. Haber,
              doğrulanmış fabrika verileri, canlı şarj ağı haritası, 2.el pazarı ve yapay zekâ destekli araç
              danışmanlığı tek platformda.
            </p>
            <div className="pt-2">
              <NewsletterForm variant="dark" />
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-4 lg:max-w-3xl">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <h4 className="text-[11px] font-black tracking-[0.16em] text-cyan-400 uppercase">
                  {group.title}
                </h4>
                <ul className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item.href + item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate-400 transition hover:text-white hover:underline underline-offset-4"
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

      <div className="border-t border-white/[0.06] bg-[#02050c]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <span>
            © {new Date().getFullYear()} EVOtoPilot. Tüm hakları saklıdır.
          </span>
          <span>
            Veriler resmi üretici katalogları ve bağımsız test protokollerine dayanmaktadır.
          </span>
        </div>
      </div>
    </footer>
  );
}
