import { RISK_CLASSES, RISK_LABEL, RISK_SHORT, type RiskLevel } from "@/lib/risk";
import Icon from "./Icon";

const ICON = { low: "check", medium: "info", high: "alert" } as const;

export default function RiskBadge({
  level,
  short,
  size = "sm",
}: {
  level: RiskLevel;
  short?: boolean;
  size?: "sm" | "md";
}) {
  const c = RISK_CLASSES[level];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-medium ${c.bg} ${c.text} ${c.border} ${
        size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"
      }`}
    >
      <Icon name={ICON[level]} size={size === "md" ? 15 : 12} strokeWidth={2.5} />
      {short ? RISK_SHORT[level] : RISK_LABEL[level]}
    </span>
  );
}
