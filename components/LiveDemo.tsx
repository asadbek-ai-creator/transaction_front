"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api";
import { formatPercent } from "@/lib/risk";
import FeaturePanel from "./FeaturePanel";
import RiskResult from "./RiskResult";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Icon from "./ui/Icon";
import RiskBadge from "./ui/RiskBadge";

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
  bank_otkazmasi: "Банковский перевод",
  naqd: "Наличные",
  xalqaro: "Международная",
};

const HOW_TO = [
  "Откройте страницу /phone на телефоне (или в новой вкладке)",
  "Введите номер карты, сумму и тип операции, нажмите «Отправить»",
  "Оценка риска появится здесь автоматически через 1–2 секунды",
];

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
    <div className="space-y-6">
      <Card title="Как провести демо">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <ol className="grid flex-1 gap-3 sm:grid-cols-3">
            {HOW_TO.map((t, i) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-text">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
          <a
            href="/phone"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-brand-800"
          >
            <Icon name="phone" size={16} /> Открыть «телефон»
            <Icon name="external" size={14} />
          </a>
        </div>
        <p className="mt-4 text-xs text-text-subtle">
          С реального телефона: откройте <span className="font-mono">http://&lt;IP-компьютера&gt;:3000/phone</span> в
          той же Wi-Fi сети.
        </p>
      </Card>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card
          title="Последний перевод"
          action={
            <span className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
              </span>
              Ожидаем переводы
            </span>
          }
        >
          <div aria-live="polite">
            {!entry ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Icon name="phone" size={26} />
                </span>
                <p className="text-sm font-medium text-text">Пока нет переводов</p>
                <p className="mt-1 max-w-xs text-sm text-text-muted">
                  Отправьте перевод со страницы «телефона» — оценка появится здесь автоматически.
                </p>
              </div>
            ) : (
              <div key={entry.timestamp} className="animate-flash rounded-xl">
                <div className="mb-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
                    <div className="text-xs text-text-muted">Сумма</div>
                    <div className="font-semibold tabular-nums text-text">
                      {entry.amount_som.toLocaleString("ru-RU")} сум
                    </div>
                    <div className="text-xs text-text-subtle">{TYPE_LABEL[entry.tranzaksiya_turi]}</div>
                  </div>
                  <div className="rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
                    <div className="text-xs text-text-muted">Карта получателя</div>
                    <div className="font-mono font-semibold text-text">{entry.masked_card}</div>
                    <div className="text-xs text-text-subtle">{entry.n_transactions} операций в истории</div>
                  </div>
                </div>
                <RiskResult probability={entry.ehtimollik} level={entry.risk_level}>
                  <FeaturePanel features={entry.top_features} />
                </RiskResult>
              </div>
            )}
          </div>
        </Card>

        <Card
          title="Лента переводов"
          subtitle="Последние 8 переводов, новые сверху"
          action={
            <Button variant="secondary" size="sm" icon="trash" onClick={handleReset} disabled={feed.length === 0}>
              Очистить ленту
            </Button>
          }
        >
          {feed.length === 0 ? (
            <p className="rounded-lg bg-canvas px-4 py-8 text-center text-sm text-text-subtle">Пока пусто.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="ledger-table w-full min-w-[420px] text-sm">
                <thead className="bg-canvas">
                  <tr className="text-left text-xs text-text-muted">
                    <th className="border-b border-line px-4 py-2.5 font-medium">Время</th>
                    <th className="border-b border-line px-4 py-2.5 font-medium">Карта</th>
                    <th className="border-b border-line px-4 py-2.5 text-right font-medium">Сумма, сум</th>
                    <th className="border-b border-line px-4 py-2.5 font-medium">Риск</th>
                  </tr>
                </thead>
                <tbody>
                  {feed.map((f, i) => (
                    <tr key={f.timestamp + i} className={i === 0 ? "bg-brand-50/60" : "bg-white"}>
                      <td className="border-b border-line px-4 py-2.5 font-mono text-xs text-text-muted">
                        {new Date(f.timestamp).toLocaleTimeString("ru-RU")}
                      </td>
                      <td className="border-b border-line px-4 py-2.5 font-mono text-xs text-text">{f.masked_card}</td>
                      <td className="border-b border-line px-4 py-2.5 text-right font-mono text-xs text-text">
                        {f.amount_som.toLocaleString("ru-RU")}
                      </td>
                      <td className="border-b border-line px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <RiskBadge level={f.risk_level} short />
                          <span className="text-xs tabular-nums text-text-muted">{formatPercent(f.ehtimollik)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
