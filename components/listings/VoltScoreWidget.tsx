import { VoltScoreResult } from "@/lib/voltscore";

type Props = {
  score: number;
  breakdown: VoltScoreResult | null;
};

export default function VoltScoreWidget({ score, breakdown }: Props) {
  // If breakdown is missing, we populate standard default values for display matching the image criteria weights
  const defaultCriteria = [
    { label: "Batarya sağlığı", weight: 30, score: 98 },
    { label: "Km / yaş dengesi", weight: 15, score: 95 },
    { label: "Hızlı şarj kullanımı", weight: 15, score: 92 },
    { label: "Garanti süresi", weight: 10, score: 100 },
    { label: "Servis geçmişi", weight: 10, score: 100 },
    { label: "Kaza / değişen", weight: 12, score: 100 },
    { label: "Gerçek menzil uyumu", weight: 8, score: 90 },
  ];

  const displayCriteria = breakdown?.criteria
    ? breakdown.criteria.map((c) => {
        // Map criteria keys to matching localized labels
        let label = c.label;
        let weight = c.weight;
        if (c.key === "battery") { label = "Batarya sağlığı"; weight = 30; }
        else if (c.key === "kmAge") { label = "Km / yaş dengesi"; weight = 15; }
        else if (c.key === "fastCharge") { label = "Hızlı şarj kullanımı"; weight = 15; }
        else if (c.key === "warranty") { label = "Garanti süresi"; weight = 10; }
        else if (c.key === "service") { label = "Servis geçmişi"; weight = 10; }
        else if (c.key === "accident") { label = "Kaza / değişen"; weight = 12; }
        else if (c.key === "rangeMatch") { label = "Gerçek menzil uyumu"; weight = 8; }
        return { label, weight, score: c.score ?? 100 };
      })
    : defaultCriteria;

  // Circle properties
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let gradeLabel = "Çok İyi";
  let gradeColor = "text-emerald-400";
  let ringColor = "stroke-sky-500";
  if (score < 50) {
    gradeLabel = "Zayıf";
    gradeColor = "text-red-400";
    ringColor = "stroke-red-500";
  } else if (score < 75) {
    gradeLabel = "Orta";
    gradeColor = "text-amber-400";
    ringColor = "stroke-amber-500";
  } else if (score < 90) {
    gradeLabel = "İyi";
    gradeColor = "text-teal-400";
    ringColor = "stroke-teal-500";
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-[#091526] p-6 text-white border border-neutral-800 shadow-xl max-w-sm mx-auto w-full">
      {/* Circle Gauge Header */}
      <div className="flex flex-col items-center text-center gap-1.5">
        <div className="relative flex items-center justify-center">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle
              stroke="rgba(255,255,255,0.05)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              className={`${ringColor} transition-all duration-500`}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-black">{score}</span>
            <span className="text-[10px] text-neutral-400 font-bold">/ 100</span>
          </div>
        </div>
        <span className={`text-xs font-black ${gradeColor} tracking-wide uppercase`}>
          {gradeLabel}
        </span>
      </div>

      {/* Criteria Progress Bars */}
      <div className="flex flex-col gap-3.5">
        {displayCriteria.map((c, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300">
              <div className="flex items-center gap-1">
                <span>{c.label}</span>
              </div>
              <span className="text-neutral-400">%{c.weight}</span>
            </div>
            {/* Custom Progress Bar */}
            <div className="relative h-2 w-full bg-neutral-850 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${c.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
