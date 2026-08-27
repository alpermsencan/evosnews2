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

export default function TickerBar() {
  // Duplicate items for a seamless loop
  const doubleItems = [...FEATURE_ITEMS, ...FEATURE_ITEMS];

  return (
    <div className="border-b border-neutral-200 bg-neutral-900 text-white overflow-hidden py-2.5 relative">
      {/* CSS style block for keyframe animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ticker-scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-ticker {
          display: flex;
          width: max-content;
          animation: ticker-scroll 35s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="relative w-full flex items-center">
        {/* Badge label for ticker */}
        <div className="absolute left-0 top-0 bottom-0 z-20 bg-neutral-950 px-4 flex items-center text-[10px] font-black uppercase tracking-wider text-sky-400 border-r border-neutral-800 shadow-lg">
          EVOTOPILOT ÖZELLİKLERİ
        </div>

        {/* Rolling track */}
        <div className="pl-[160px] w-full flex overflow-hidden select-none">
          <div className="animate-ticker flex gap-6 items-center">
            {doubleItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center gap-2 px-3 py-1 rounded bg-neutral-800 hover:bg-sky-950 border border-neutral-750 hover:border-sky-500 transition duration-200 shrink-0 text-left group"
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-extrabold tracking-wider text-sky-400 uppercase group-hover:text-sky-300">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-neutral-300 font-medium mt-0.5 max-w-[280px] truncate">
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
