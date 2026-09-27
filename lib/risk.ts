export type RiskLevel = "low" | "medium" | "high";

export const RISK_THRESHOLDS = { medium: 0.15, high: 0.35 };

export function riskLevelFromProb(p: number): RiskLevel {
  if (p < RISK_THRESHOLDS.medium) return "low";
  if (p < RISK_THRESHOLDS.high) return "medium";
  return "high";
}

export const RISK_COLOR: Record<RiskLevel, string> = {
  low: "#15803d",
  medium: "#b45309",
  high: "#b91c1c",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Низкий риск",
  medium: "Средний риск",
  high: "Высокий риск",
};

export const RISK_SHORT: Record<RiskLevel, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export const RISK_RANGE: Record<RiskLevel, string> = {
  low: "до 15 %",
  medium: "15–35 %",
  high: "от 35 %",
};

export const RISK_ADVICE: Record<RiskLevel, { title: string; text: string }> = {
  low: {
    title: "Можно закрыть после стандартной проверки",
    text: "Профиль транзакций похож на обычные оповещения, которые не передаются на расследование.",
  },
  medium: {
    title: "Требуется ручная проверка аналитиком",
    text: "Есть признаки, характерные для эскалированных случаев. Просмотрите историю операций клиента.",
  },
  high: {
    title: "Рекомендуется передать на расследование",
    text: "Профиль транзакций сильно похож на случаи, которые ранее передавались на расследование.",
  },
};

export const RISK_CLASSES: Record<RiskLevel, { text: string; bg: string; border: string; bar: string }> = {
  low: { text: "text-risk-low", bg: "bg-risk-low-bg", border: "border-risk-low/25", bar: "bg-risk-low" },
  medium: { text: "text-risk-medium", bg: "bg-risk-medium-bg", border: "border-risk-medium/25", bar: "bg-risk-medium" },
  high: { text: "text-risk-high", bg: "bg-risk-high-bg", border: "border-risk-high/25", bar: "bg-risk-high" },
};

export function formatPercent(p: number, digits = 1): string {
  return `${(p * 100).toFixed(digits).replace(".", ",")} %`;
}
