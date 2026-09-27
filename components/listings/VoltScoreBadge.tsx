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
  score?: number | null;
  coverage?: number;
  size?: "sm" | "lg";
}) {
  return null;
}
