import { gradeOf, scoreTone } from "@/lib/voltscore";

/**
 * VoltScore rozeti.
 *
 * Puanın yanında KAPSAM da gösterilir: %40 kapsamla çıkan 95 ile %100
 * kapsamla çıkan 95 aynı şey değildir. Kapsamı gizlemek, eksik veriyle
 * hesaplanmış puanı tam bilgiymiş gibi sunmak olurdu.
 */
export default function VoltScoreBadge({
  score,
  coverage,
  size = "sm",
}: {
  score: number | null;
  coverage?: number;
  size?: "sm" | "lg";
}) {
  const tone = scoreTone(score);

  if (score == null) {
    return (
      <span className="rounded bg-neutral-200 px-2 py-1 text-[10px] font-black text-neutral-600">
        PUAN YOK
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className={`flex h-20 w-20 flex-col items-center justify-center rounded-full ${tone.bg} ${tone.text}`}
        >
          <span className="text-2xl font-black leading-none">{score}</span>
          <span className="text-[9px] font-bold opacity-80">/ 100</span>
        </div>
        <span className="text-[11px] font-black text-neutral-700">{gradeOf(score)}</span>
        {coverage != null && coverage < 100 && (
          <span className="text-[10px] text-neutral-400">%{coverage} veri kapsamı</span>
        )}
      </div>
    );
  }

  return (
    <span
      className={`rounded px-2 py-1 text-[10px] font-black ${tone.bg} ${tone.text}`}
      title={
        coverage != null && coverage < 100
          ? `VoltScore ${score}/100 — %${coverage} veri kapsamıyla hesaplandı`
          : `VoltScore ${score}/100`
      }
    >
      VOLTSCORE {score}
    </span>
  );
}
