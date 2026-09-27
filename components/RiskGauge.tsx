"use client";

import { RISK_COLOR, riskLevelFromProb, type RiskLevel } from "@/lib/risk";

export { riskLevelFromProb };

interface RiskGaugeProps {
  probability: number; // 0..1
  riskLevel?: RiskLevel;
  size?: number;
}

export default function RiskGauge({ probability, riskLevel, size = 220 }: RiskGaugeProps) {
  const level = riskLevel ?? riskLevelFromProb(probability);
  const color = RISK_COLOR[level];
  const clamped = Math.max(0, Math.min(1, probability));

  const strokeWidth = 16;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // semicircle from 180deg (left) to 0deg (right), sweeping through the top
  const circumference = Math.PI * r;
  const dashOffset = circumference * (1 - clamped);

  const arcPath = describeArc(cx, cy, r, 180, 0);

  return (
    <div
      className="flex flex-col items-center"
      role="img"
      aria-label={`Вероятность эскалации ${(clamped * 100).toFixed(1)} процента`}
    >
      <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        <path d={arcPath} fill="none" stroke="#e3e9e5" strokeWidth={strokeWidth} strokeLinecap="round" />
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
      <div className="-mt-16 flex flex-col items-center">
        <span className="text-5xl font-bold tabular-nums tracking-tight" style={{ color }}>
          {(clamped * 100).toFixed(1).replace(".", ",")}
          <span className="ml-0.5 text-2xl font-semibold text-text-muted">%</span>
        </span>
        <span className="mt-1 text-xs text-text-subtle">вероятность эскалации</span>
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
