"use client";

import { useState } from "react";
import type { Direction, PredictResponse, TransactionInput, TxType } from "@/lib/types";
import { ApiError, predictSingle } from "@/lib/api";
import RiskGauge from "./RiskGauge";
import FeaturePanel from "./FeaturePanel";

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "kirim", label: "Входящая" },
  { value: "chiqim", label: "Исходящая" },
];

const TYPES: { value: TxType; label: string }[] = [
  { value: "karta", label: "Карта" },
  { value: "bank_otkazmasi", label: "Банк. перевод" },
  { value: "naqd", label: "Наличные" },
  { value: "xalqaro", label: "Международная" },
];

function emptyRow(direction: Direction = "kirim"): TransactionInput {
  return {
    id: crypto.randomUUID(),
    tranzaksiya_vaqti: "",
    kirim_chiqim: direction,
    tranzaksiya_turi: "karta",
    miqdor_indeksi: "",
  };
}

function seedRows(): TransactionInput[] {
  return [
    { id: crypto.randomUUID(), tranzaksiya_vaqti: "", kirim_chiqim: "kirim", tranzaksiya_turi: "karta", miqdor_indeksi: "" },
    { id: crypto.randomUUID(), tranzaksiya_vaqti: "", kirim_chiqim: "chiqim", tranzaksiya_turi: "naqd", miqdor_indeksi: "" },
    { id: crypto.randomUUID(), tranzaksiya_vaqti: "", kirim_chiqim: "kirim", tranzaksiya_turi: "bank_otkazmasi", miqdor_indeksi: "" },
  ];
}

export default function AlertForm() {
  const [signalId, setSignalId] = useState("SG_MANUAL");
  const [signalDate, setSignalDate] = useState("");
  const [rows, setRows] = useState<TransactionInput[]>(seedRows());
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(id: string, patch: Partial<TransactionInput>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function validate(): string | null {
    if (!signalDate) return "Укажите дату оповещения.";
    if (rows.length === 0) return "Добавьте хотя бы одну транзакцию.";
    for (const r of rows) {
      if (!r.tranzaksiya_vaqti) return "Заполните дату/время у каждой транзакции.";
      if (r.miqdor_indeksi === "" || Number.isNaN(parseFloat(r.miqdor_indeksi)))
        return "Укажите числовую сумму (miqdor_indeksi) у каждой транзакции.";
    }
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await predictSingle(signalId, signalDate, rows);
      setResult(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось получить оценку. Проверьте, что бэкенд запущен.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-xl border border-ink-border bg-ink-surface p-5 shadow-panel">
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-paper-muted">
              ID оповещения
            </label>
            <input
              value={signalId}
              onChange={(e) => setSignalId(e.target.value)}
              placeholder="SG_000001"
              className="w-full rounded-md border border-ink-border bg-ink px-3 py-2 font-mono text-sm text-paper outline-none focus:border-brass"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-paper-muted">
              Дата оповещения
            </label>
            <input
              type="datetime-local"
              value={signalDate}
              onChange={(e) => setSignalDate(e.target.value)}
              className="w-full rounded-md border border-ink-border bg-ink px-3 py-2 font-mono text-sm text-paper outline-none focus:border-brass [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-paper">История транзакций</h3>
          <button
            onClick={addRow}
            className="rounded-md border border-ink-border px-2.5 py-1 text-xs text-paper-muted transition hover:border-brass hover:text-brass"
          >
            + Добавить транзакцию
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-ink-border">
          <table className="ledger-table w-full text-sm">
            <thead>
              <tr className="border-b border-ink-border bg-ink text-left text-xs text-paper-muted">
                <th className="px-3 py-2 font-medium">Дата / время</th>
                <th className="px-3 py-2 font-medium">Направление</th>
                <th className="px-3 py-2 font-medium">Тип</th>
                <th className="px-3 py-2 font-medium">Сумма (индекс)</th>
                <th className="w-8 px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-ink-border last:border-0">
                  <td className="px-3 py-1.5">
                    <input
                      type="datetime-local"
                      value={row.tranzaksiya_vaqti}
                      onChange={(e) => updateRow(row.id, { tranzaksiya_vaqti: e.target.value })}
                      className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 font-mono text-xs text-paper outline-none focus:border-brass [color-scheme:dark]"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={row.kirim_chiqim}
                      onChange={(e) => updateRow(row.id, { kirim_chiqim: e.target.value as Direction })}
                      className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-xs text-paper outline-none focus:border-brass"
                    >
                      {DIRECTIONS.map((d) => (
                        <option key={d.value} value={d.value} className="bg-ink-surface">
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={row.tranzaksiya_turi}
                      onChange={(e) => updateRow(row.id, { tranzaksiya_turi: e.target.value as TxType })}
                      className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-xs text-paper outline-none focus:border-brass"
                    >
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value} className="bg-ink-surface">
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="number"
                      step="0.01"
                      value={row.miqdor_indeksi}
                      onChange={(e) => updateRow(row.id, { miqdor_indeksi: e.target.value })}
                      placeholder="0.00"
                      className="w-24 rounded border border-transparent bg-transparent px-1.5 py-1 font-mono text-xs text-paper outline-none focus:border-brass"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-paper-muted transition hover:text-risk-high"
                      aria-label="Удалить транзакцию"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <p className="mt-3 text-sm text-risk-high">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 w-full rounded-md bg-brass px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-brass-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Оцениваем…" : "Оценить риск эскалации"}
        </button>
      </div>

      <div className="rounded-xl border border-ink-border bg-ink-surface p-5 shadow-panel">
        <h3 className="mb-4 text-sm font-medium text-paper">Результат</h3>
        {!result && !loading && (
          <p className="text-sm text-paper-dim">
            Заполните историю транзакций и нажмите «Оценить», чтобы увидеть вероятность эскалации.
          </p>
        )}
        {loading && <p className="text-sm text-paper-dim">Считаем признаки и запускаем модель…</p>}
        {result && (
          <div className="flex flex-col items-center gap-4">
            <RiskGauge probability={result.ehtimollik} riskLevel={result.risk_level} />
            <div className="w-full text-center text-xs text-paper-muted">
              {result.n_transactions} транзакций в истории
              {result.low_confidence && (
                <span className="ml-1 text-brass">· мало данных, точность ниже обычной</span>
              )}
            </div>
            <FeaturePanel features={result.top_features} />
          </div>
        )}
      </div>
    </div>
  );
}
