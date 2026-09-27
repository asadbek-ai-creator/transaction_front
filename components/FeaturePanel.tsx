"use client";

import { featureLabel, type TopFeature } from "@/lib/types";
import InfoHint from "./ui/InfoHint";

function formatValue(v: number): string {
  if (Math.abs(v) >= 1000) return v.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  return v.toLocaleString("ru-RU", { maximumFractionDigits: 3 });
}

export default function FeaturePanel({ features }: { features: TopFeature[] }) {
  if (!features || features.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-1">
        <p className="text-sm font-semibold text-text">Что повлияло на оценку</p>
        <InfoHint text="Значения признаков этого клиента, которые модель в целом считает самыми важными. Помогают понять, на что смотреть при ручной проверке." />
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
        {features.map((f) => (
          <li key={f.name} className="flex items-center justify-between gap-3 bg-white px-3 py-2 text-sm">
            <span className="text-text-muted">{featureLabel(f.name)}</span>
            <span className="font-mono text-sm font-medium tabular-nums text-text">{formatValue(f.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
