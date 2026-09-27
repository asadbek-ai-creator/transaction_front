"use client";

import { RISK_ADVICE, RISK_CLASSES, formatPercent, type RiskLevel } from "@/lib/risk";
import RiskGauge from "./RiskGauge";
import Icon from "./ui/Icon";
import RiskBadge from "./ui/RiskBadge";
import RiskLegend from "./ui/RiskLegend";

const ADVICE_ICON = { low: "check", medium: "search", high: "alert" } as const;

export default function RiskResult({
  probability,
  level,
  children,
}: {
  probability: number;
  level: RiskLevel;
  children?: React.ReactNode;
}) {
  const c = RISK_CLASSES[level];
  const advice = RISK_ADVICE[level];

  return (
    <div className="flex flex-col items-center gap-5">
      <RiskGauge probability={probability} riskLevel={level} />
      <RiskBadge level={level} size="md" />
      <p className="text-center text-sm text-text-muted">
        С вероятностью <strong className="text-text">{formatPercent(probability)}</strong> это оповещение
        будет передано на расследование.
      </p>

      <div className={`w-full rounded-lg border p-4 ${c.bg} ${c.border}`}>
        <div className={`flex items-start gap-2.5 ${c.text}`}>
          <Icon name={ADVICE_ICON[level]} size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">Рекомендация</p>
            <p className="text-sm font-semibold">{advice.title}</p>
            <p className="mt-1 text-sm text-text-muted">{advice.text}</p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <RiskLegend active={level} />
      </div>

      {children}
    </div>
  );
}
