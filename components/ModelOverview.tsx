"use client";

import { useEffect, useState } from "react";
import { getFeatureImportance } from "@/lib/api";
import { featureLabel, type FeatureImportanceRow } from "@/lib/types";

export default function ModelOverview() {
  const [rows, setRows] = useState<FeatureImportanceRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getFeatureImportance(12)
      .then(setRows)
      .catch(() => setError(true));
  }, []);

  const maxImportance = rows?.[0]?.importance ?? 1;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="rounded-xl border border-ink-border bg-ink-surface p-5 shadow-panel">
        <h3 className="mb-4 text-sm font-medium text-paper">Модель</h3>
        <dl className="space-y-3 text-sm">
          <Row term="Алгоритм" def="LightGBM (gradient boosting)" />
          <Row term="Валидация" def="5-fold стратифицированная CV × 5 сидов" />
          <Row term="OOF ROC-AUC" def="0.6277" mono />
          <Row term="Признаков" def="79" mono />
          <Row term="Обучающих сигналов" def="14 000" mono />
        </dl>
        <p className="mt-4 border-t border-ink-border pt-4 text-xs leading-relaxed text-paper-dim">
          Модель обучена на синтетических данных хакатона по мониторингу финансовых транзакций
          (команда IT-Ledi). Полный EDA и пайплайн — в приложенном отчёте и ноутбуке.
        </p>
      </div>

      <div className="rounded-xl border border-ink-border bg-ink-surface p-5 shadow-panel">
        <h3 className="mb-4 text-sm font-medium text-paper">Важность признаков (gain)</h3>
        {error && (
          <p className="text-sm text-paper-dim">Не удалось загрузить — проверьте, что API запущен.</p>
        )}
        {!rows && !error && <p className="text-sm text-paper-dim">Загрузка…</p>}
        {rows && (
          <ul className="space-y-2.5">
            {rows.map((r) => (
              <li key={r.feature}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-paper-dim">{featureLabel(r.feature)}</span>
                  <span className="font-mono text-paper-muted">{r.importance.toFixed(0)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink">
                  <div
                    className="h-full rounded-full bg-brass"
                    style={{ width: `${(r.importance / maxImportance) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({ term, def, mono }: { term: string; def: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-paper-muted">{term}</dt>
      <dd className={mono ? "font-mono text-paper" : "text-paper"}>{def}</dd>
    </div>
  );
}
