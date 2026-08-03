type Series = {
  label: string;
  color: string;
  values: number[];
};

/** Bağımlılıksız, responsive SVG çizgi grafiği */
export default function LineChart({
  labels,
  series,
  height = 220,
  suffix = "",
}: {
  labels: string[];
  series: Series[];
  height?: number;
  suffix?: string;
}) {
  const W = 720;
  const H = height;
  const padL = 54;
  const padR = 12;
  const padT = 14;
  const padB = 26;

  const all = series.flatMap((s) => s.values);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const lo = min - span * 0.12;
  const hi = max + span * 0.12;

  const x = (i: number) =>
    padL + (i * (W - padL - padR)) / Math.max(1, labels.length - 1);
  const y = (v: number) =>
    padT + ((hi - v) / (hi - lo)) * (H - padT - padB);

  const gridLines = 4;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[520px]"
        role="img"
      >
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const v = lo + ((hi - lo) * i) / gridLines;
          return (
            <g key={i}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y(v)}
                y2={y(v)}
                stroke="#e5e5e5"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={y(v) + 4}
                textAnchor="end"
                fontSize="10"
                fill="#a3a3a3"
                fontWeight="600"
              >
                {v >= 100000
                  ? `${(v / 1000).toFixed(0)}k`
                  : v.toFixed(v < 20 ? 1 : 0)}
                {suffix}
              </text>
            </g>
          );
        })}

        {labels.map((l, i) => (
          <text
            key={l + i}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#a3a3a3"
            fontWeight="600"
          >
            {l}
          </text>
        ))}

        {series.map((s) => {
          const d = s.values
            .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`)
            .join(" ");
          const area = `${d} L ${x(s.values.length - 1)} ${H - padB} L ${x(0)} ${H - padB} Z`;
          return (
            <g key={s.label}>
              <path d={area} fill={s.color} opacity="0.08" />
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={s.color} />
              ))}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 px-2">
        {series.map((s) => (
          <span
            key={s.label}
            className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
