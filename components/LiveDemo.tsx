"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api";
import { featureLabel } from "@/lib/types";
import RiskGauge from "./RiskGauge";

interface DemoEntry {
  timestamp: string;
  masked_card: string;
  amount_som: number;
  tranzaksiya_turi: string;
  ehtimollik: number;
  risk_level: "low" | "medium" | "high";
  n_transactions: number;
  top_features: { name: string; value: number }[];
}

const TYPE_LABEL: Record<string, string> = {
  karta: "Карта",
  bank_otkazmasi: "Банк. перевод",
  naqd: "Наличные",
  xalqaro: "Международная",
};

export default function LiveDemo() {
  const [entry, setEntry] = useState<DemoEntry | null>(null);
  const [feed, setFeed] = useState<DemoEntry[]>([]);
  const lastTimestamp = useRef<string | null>(null);
  // Bumped on reset so a poll already in flight can't repopulate what we just cleared.
  const epoch = useRef(0);

  async function handleReset() {
    try {
      await fetch(`${API_BASE}/demo/reset`, { method: "POST" });
    } catch {
      // backend unreachable — still clear locally so the demo can carry on
    }
    epoch.current += 1;
    setEntry(null);
    setFeed([]);
    lastTimestamp.current = null;
  }

  useEffect(() => {
    let mounted = true;

    async function poll() {
      const polledAt = epoch.current;
      try {
        const res = await fetch(`${API_BASE}/demo/latest`, { cache: "no-store" });
        const data = await res.json();
        if (!mounted || epoch.current !== polledAt || data.empty) return;
        if (data.timestamp !== lastTimestamp.current) {
          lastTimestamp.current = data.timestamp;
          setEntry(data);
          setFeed((prev) => [data, ...prev].slice(0, 8));
        }
      } catch {
        // backend not reachable yet — ignore, keep polling
      }
    }

    poll();
    const id = setInterval(poll, 1500);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-xl border border-ink-border bg-ink-surface p-5 shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-paper">Последний перевод</h3>
          <span className="flex items-center gap-1.5 text-xs text-paper-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-risk-low" />
            ожидание с телефона
          </span>
        </div>

        {!entry ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-sm text-paper-dim">
              Откройте <span className="font-mono text-paper-muted">/phone</span> на телефоне
              и отправьте перевод — оценка появится здесь автоматически.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <RiskGauge probability={entry.ehtimollik} riskLevel={entry.risk_level} />
            <div className="grid w-full grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border border-ink-border bg-ink px-3 py-2">
                <div className="font-mono text-sm text-paper">
                  {entry.amount_som.toLocaleString("ru-RU")} сум
                </div>
                <div className="text-xs text-paper-muted">{TYPE_LABEL[entry.tranzaksiya_turi]}</div>
              </div>
              <div className="rounded-lg border border-ink-border bg-ink px-3 py-2">
                <div className="font-mono text-sm text-paper">{entry.masked_card}</div>
                <div className="text-xs text-paper-muted">{entry.n_transactions} тр. в истории</div>
              </div>
            </div>
            <div className="w-full border-t border-ink-border pt-3">
              <p className="mb-2 text-xs font-medium text-paper-muted">Ключевые признаки</p>
              <ul className="space-y-1.5">
                {entry.top_features.map((f) => (
                  <li key={f.name} className="flex items-center justify-between text-xs">
                    <span className="text-paper-dim">{featureLabel(f.name)}</span>
                    <span className="font-mono text-paper">{f.value.toFixed(3)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-ink-border bg-ink-surface p-5 shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-paper">Лента переводов</h3>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-ink-border px-2.5 py-1 text-xs text-paper-muted transition hover:border-brass hover:text-brass"
          >
            Очистить
          </button>
        </div>
        {feed.length === 0 ? (
          <p className="text-sm text-paper-dim">Пока пусто.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-ink-border">
            <table className="ledger-table w-full text-sm">
              <thead>
                <tr className="border-b border-ink-border bg-ink text-left text-xs text-paper-muted">
                  <th className="px-3 py-2 font-medium">Время</th>
                  <th className="px-3 py-2 font-medium">Карта</th>
                  <th className="px-3 py-2 font-medium">Сумма</th>
                  <th className="px-3 py-2 font-medium">Риск</th>
                </tr>
              </thead>
              <tbody>
                {feed.map((f, i) => (
                  <tr key={f.timestamp + i} className="border-b border-ink-border last:border-0">
                    <td className="px-3 py-1.5 font-mono text-xs text-paper-muted">
                      {new Date(f.timestamp).toLocaleTimeString("ru-RU")}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-xs text-paper">{f.masked_card}</td>
                    <td className="px-3 py-1.5 font-mono text-xs text-paper">
                      {f.amount_som.toLocaleString("ru-RU")}
                    </td>
                    <td className="px-3 py-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          f.risk_level === "high"
                            ? "bg-risk-high/15 text-risk-high"
                            : f.risk_level === "medium"
                            ? "bg-risk-medium/15 text-risk-medium"
                            : "bg-risk-low/15 text-risk-low"
                        }`}
                      >
                        {(f.ehtimollik * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
