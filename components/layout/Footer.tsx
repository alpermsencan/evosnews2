import Link from "next/link";
import { FOOTER_GROUPS } from "@/lib/nav";
import { IconBolt } from "@/components/ui/Icons";
import NewsletterForm from "@/components/ui/NewsletterForm";

export default function Footer() {
  return (
    <footer className="mt-10 bg-evos-ink text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <div className="flex max-w-sm flex-col gap-4">
            <Link href="/" className="flex items-end gap-1.5">
              <span className="text-3xl font-black leading-none text-sky-400">
                EVOtoPilot
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/60">
              Elektrikli mobilitenin Türkiye&apos;deki yayın merkezi. Haber,
              veri, şarj ağı, ikinci el pazarı ve yapay zekâ destekli araç
              danışmanlığı tek platformda.
            </p>
            <NewsletterForm variant="dark" />
          </div>

          <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-4 lg:max-w-3xl">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <h4 className="text-[11px] font-black tracking-[0.14em] text-sky-400">
                  {group.title}
                </h4>
                <ul className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item.href + item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-white/70 transition hover:text-white"
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

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-white/50 sm:flex-row sm:text-left">
          <span>
            © {new Date().getFullYear()} EVOtoPilot. Tüm hakları saklıdır.
          </span>
          <span>
            Bu sitede yer alan veriler bilgilendirme amaçlıdır, yatırım tavsiyesi
            değildir.
          </span>
        </div>
      </div>
    </footer>
  );
}
