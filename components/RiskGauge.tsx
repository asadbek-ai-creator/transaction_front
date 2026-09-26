"use client";

const RISK_COLOR: Record<string, string> = {
  low: "#3f9d6e",
  medium: "#d1a13a",
  high: "#c1443c",
};

const RISK_LABEL_RU: Record<string, string> = {
  low: "Низкий риск",
  medium: "Средний риск",
  high: "Высокий риск",
};

export function riskLevelFromProb(p: number): "low" | "medium" | "high" {
  if (p < 0.15) return "low";
  if (p < 0.35) return "medium";
  return "high";
}

interface RiskGaugeProps {
  probability: number; // 0..1
  riskLevel?: "low" | "medium" | "high";
  size?: number;
}

export default function RiskGauge({
  probability,
  riskLevel,
  size = 220,
}: RiskGaugeProps) {
  const level = riskLevel ?? riskLevelFromProb(probability);
  const color = RISK_COLOR[level];
  const clamped = Math.max(0, Math.min(1, probability));

  const strokeWidth = 14;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // semicircle from 180deg (left) to 0deg (right), sweeping through the top
  const circumference = Math.PI * r;
  const dashOffset = circumference * (1 - clamped);

  const arcPath = describeArc(cx, cy, r, 180, 0);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        {/* Track */}
        <path
          d={arcPath}
          fill="none"
          stroke="#232b36"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          className="gauge-arc"
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={
            {
              "--dash-start": circumference,
              "--dash-end": dashOffset,
              strokeDashoffset: dashOffset,
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="-mt-14 flex flex-col items-center">
        <span className="font-mono text-4xl font-semibold tabular-nums text-paper">
          {(clamped * 100).toFixed(1)}
          <span className="text-lg text-paper-muted">%</span>
        </span>
        <span
          className="mt-1 rounded-full px-3 py-0.5 text-xs font-medium tracking-wide"
          style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}44` }}
        >
          {RISK_LABEL_RU[level]}
        </span>
      </div>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy - r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = startAngle - endAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}
