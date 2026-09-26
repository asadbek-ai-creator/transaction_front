"use client";

import { featureLabel, type TopFeature } from "@/lib/types";

export default function FeaturePanel({ features }: { features: TopFeature[] }) {
  if (!features || features.length === 0) return null;

  return (
    <div className="w-full border-t border-ink-border pt-4">
      <p className="mb-2 text-xs font-medium text-paper-muted">
        Признаки, повлиявшие на оценку
      </p>
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f.name} className="flex items-center justify-between text-xs">
            <span className="text-paper-dim">{featureLabel(f.name)}</span>
            <span className="font-mono text-paper">{f.value.toFixed(3)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
