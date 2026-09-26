"use client";

import { useRef, useState } from "react";
import { ApiError, predictBatchDownload, predictBatchPreview } from "@/lib/api";
import type { BatchPreviewResponse } from "@/lib/types";
import { riskLevelFromProb } from "./RiskGauge";

const RISK_DOT: Record<string, string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};

export default function BatchUpload() {
  const signalsRef = useRef<HTMLInputElement>(null);
  const txRef = useRef<HTMLInputElement>(null);

  const [signalsFile, setSignalsFile] = useState<File | null>(null);
  const [txFile, setTxFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BatchPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScore() {
    if (!signalsFile || !txFile) {
      setError("Загрузите оба файла: сигналы (CSV) и транзакции (CSV/parquet).");
      return;
    }
    setError(null);
    setLoading(true);
    setPreview(null);
    try {
      const res = await predictBatchPreview(signalsFile, txFile, 100);
      setPreview(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось обработать файлы. Проверьте формат и бэкенд.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!signalsFile || !txFile) return;
    setDownloading(true);
    setError(null);
    try {
      const blob = await predictBatchDownload(signalsFile, txFile);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "predictions.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось сформировать файл.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-ink-border bg-ink-surface p-5 shadow-panel">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FilePicker
            label="Файл сигналов"
            hint="signal_id, signal_sanasi (.csv)"
            inputRef={signalsRef}
            accept=".csv"
            file={signalsFile}
            onChange={setSignalsFile}
          />
          <FilePicker
            label="Файл транзакций"
            hint="signal_id, tranzaksiya_vaqti, kirim_chiqim, tranzaksiya_turi, miqdor_indeksi (.csv/.parquet)"
            inputRef={txRef}
            accept=".csv,.parquet"
            file={txFile}
            onChange={setTxFile}
          />
        </div>

        {error && <p className="mt-3 text-sm text-risk-high">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleScore}
            disabled={loading}
            className="rounded-md bg-brass px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-brass-bright disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Считаем оценки…" : "Оценить пакет"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || !signalsFile || !txFile}
            className="rounded-md border border-ink-border px-4 py-2.5 text-sm font-medium text-paper transition hover:border-brass hover:text-brass disabled:cursor-not-allowed disabled:opacity-40"
          >
            {downloading ? "Формируем CSV…" : "Скачать predictions.csv"}
          </button>
        </div>
      </div>

      {preview && (
        <div className="rounded-xl border border-ink-border bg-ink-surface p-5 shadow-panel">
          <div className="mb-4 grid grid-cols-3 gap-3">
            <Metric label="Сигналов оценено" value={preview.n_signals.toLocaleString("ru-RU")} />
            <Metric label="Средняя вероятность" value={`${(preview.mean_probability * 100).toFixed(1)}%`} />
            <Metric label="Высокий риск (≥35%)" value={preview.n_high_risk.toLocaleString("ru-RU")} />
          </div>

          <p className="mb-2 text-xs text-paper-muted">
            Топ-{preview.rows.length} по убыванию вероятности эскалации
          </p>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-ink-border">
            <table className="ledger-table w-full text-sm">
              <thead className="sticky top-0 bg-ink-raised">
                <tr className="border-b border-ink-border text-left text-xs text-paper-muted">
                  <th className="px-3 py-2 font-medium">signal_id</th>
                  <th className="px-3 py-2 font-medium">ehtimollik</th>
                  <th className="px-3 py-2 font-medium">Риск</th>
                  <th className="px-3 py-2 font-medium">Транзакций</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => {
                  const level = riskLevelFromProb(row.ehtimollik);
                  return (
                    <tr key={row.signal_id} className="border-b border-ink-border last:border-0">
                      <td className="px-3 py-1.5 font-mono text-xs text-paper">{row.signal_id}</td>
                      <td className="px-3 py-1.5 font-mono text-xs text-paper">
                        {row.ehtimollik.toFixed(4)}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`inline-block h-2 w-2 rounded-full ${RISK_DOT[level]}`} />
                      </td>
                      <td className="px-3 py-1.5 font-mono text-xs text-paper-muted">{row.n_tx}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-border bg-ink px-3 py-2.5">
      <div className="font-mono text-lg text-paper">{value}</div>
      <div className="text-xs text-paper-muted">{label}</div>
    </div>
  );
}

function FilePicker({
  label,
  hint,
  inputRef,
  accept,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  inputRef: React.RefObject<HTMLInputElement>;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-paper-muted">{label}</label>
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-md border border-dashed border-ink-border bg-ink px-3 py-4 text-left text-sm text-paper-dim transition hover:border-brass"
      >
        {file ? (
          <span className="font-mono text-xs text-paper">{file.name}</span>
        ) : (
          <span>Выбрать файл…</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <p className="mt-1 text-[11px] text-paper-dim">{hint}</p>
    </div>
  );
}
