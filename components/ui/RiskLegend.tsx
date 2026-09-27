import { RISK_CLASSES, RISK_RANGE, RISK_SHORT, type RiskLevel } from "@/lib/risk";

const LEVELS: RiskLevel[] = ["low", "medium", "high"];

export default function RiskLegend({ active }: { active?: RiskLevel }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-text-muted">Как читать оценку</p>
      <div className="grid grid-cols-3 gap-1.5">
        {LEVELS.map((level) => {
          const c = RISK_CLASSES[level];
          const isActive = active === level;
          return (
            <div
              key={level}
              className={`rounded-lg border px-2 py-2 text-center transition ${
                isActive ? `${c.bg} ${c.border} ring-1 ring-inset ring-current ${c.text}` : "border-line bg-white"
              }`}
            >
              <div className={`mx-auto mb-1.5 h-1 w-8 rounded-full ${c.bar}`} />
              <div className={`text-xs font-semibold ${isActive ? c.text : "text-text"}`}>{RISK_SHORT[level]}</div>
              <div className="text-[11px] text-text-subtle">{RISK_RANGE[level]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
