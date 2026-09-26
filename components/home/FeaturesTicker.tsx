import Link from "next/link";

const FEATURE_ITEMS = [
  {
    icon: "🔋",
    title: "ŞARJ & ROTA MÜHENDİSLİĞİ",
    description: "Optimum şarj durakları ve maliyet analizi ile yolculuk planlayın.",
    href: "/sarj-agi/rota",
  },
  {
    icon: "🤖",
    title: "AI ARAÇ DANIŞMANI",
    description: "Ses destekli yapay zekâ asistanı ile en ideal aracınızı bulun.",
    href: "/ai-danisman",
  },
  {
    icon: "📍",
    title: "CANLI ŞARJ HARİTASI",
    description: "Türkiye'deki tüm halka açık hızlı şarj noktalarını keşfedin.",
    href: "/sarj-agi",
  },
  {
    icon: "📊",
    title: "ŞARJ TARİFELERİ",
    description: "ZES, Eşarj, Trugo ve diğer tüm operatörlerin güncel AC/DC fiyatları.",
    href: "/sarj-fiyatlari",
  },
  {
    icon: "🚗",
    title: "ARAÇ KATALOĞU",
    description: "Türkiye'de satılan, yakında gelecek ve global tüm EV modelleri.",
    href: "/araclar",
  },
  {
    icon: "📑",
    title: "ÖTV HESAPLAMA REHBERİ",
    description: "Elektrikli araçlara özel güncel ÖTV matrah limitleri ve vergi hesaplayıcı.",
    href: "/otv-rehberi",
  },
  {
    icon: "🛡️",
    title: "EVOS PROTECT GÜVENLİK",
    description: "Batarya sağlığı sertifikalı ikinci el ilanlar ve VoltScore güven endeksi.",
    href: "/evos-protect",
  },
  {
    icon: "💬",
    title: "TOPLULUK & FORUM",
    description: "Elektrikli araç sürücülerinin gerçek deneyimleri ve şarj notları.",
    href: "/topluluk",
  },
];

export default function FeaturesTicker() {
  const doubleItems = [...FEATURE_ITEMS, ...FEATURE_ITEMS];

  return (
    <div className="relative overflow-hidden py-4 rounded-xl bg-slate-900 border border-neutral-800 shadow-2xl my-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ticker-scroll-home {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-ticker-home {
          display: flex;
          width: max-content;
          animation: ticker-scroll-home 40s linear infinite;
        }
        .animate-ticker-home:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="flex items-center">
        {/* Left Side Static Label */}
        <div className="absolute left-0 top-0 bottom-0 z-20 bg-slate-950 px-5 flex flex-col justify-center text-[10px] font-black uppercase tracking-widest text-sky-400 border-r border-neutral-850 rounded-l-xl">
          <span>EVOTOPILOT</span>
          <span className="text-[8px] text-neutral-400 mt-0.5">SERVİSLERİ</span>
        </div>

        {/* Scroll Container */}
        <div className="pl-[160px] w-full flex overflow-hidden select-none">
          <div className="animate-ticker-home flex gap-6 items-center">
            {doubleItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center gap-2 px-3.5 py-2 rounded bg-neutral-850 hover:bg-sky-950 border border-neutral-800 hover:border-sky-500 transition duration-300 shrink-0 text-left group"
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-black tracking-wider text-sky-400 uppercase group-hover:text-sky-300">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-neutral-300 font-medium mt-1 max-w-[260px] truncate">
                    {item.description}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
