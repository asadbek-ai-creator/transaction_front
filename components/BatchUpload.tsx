"use client";

import { useRef, useState } from "react";
import { ApiError, predictBatchDownload, predictBatchPreview } from "@/lib/api";
import type { BatchPreviewResponse } from "@/lib/types";
import { RISK_CLASSES, formatPercent, riskLevelFromProb, type RiskLevel } from "@/lib/risk";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Icon, { type IconName } from "./ui/Icon";
import RiskBadge from "./ui/RiskBadge";

type Filter = "all" | RiskLevel;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "high", label: "Высокий" },
  { id: "medium", label: "Средний" },
  { id: "low", label: "Низкий" },
];

export default function BatchUpload() {
  const [signalsFile, setSignalsFile] = useState<File | null>(null);
  const [txFile, setTxFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BatchPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const ready = !!signalsFile && !!txFile;

  async function handleScore() {
    if (!signalsFile || !txFile) {
      setError("Сначала выберите оба файла: сигналы и транзакции.");
      return;
    }
    setError(null);
    setLoading(true);
    setPreview(null);
    setFilter("all");
    try {
      const res = await predictBatchPreview(signalsFile, txFile, 100);
      setPreview(res);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `Сервер вернул ошибку: ${e.message}. Проверьте названия колонок в файлах.`
          : "Не удалось связаться с сервером. Убедитесь, что бэкенд запущен."
      );
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
      setError(e instanceof ApiError ? `Сервер вернул ошибку: ${e.message}` : "Не удалось сформировать файл.");
    } finally {
      setDownloading(false);
    }
  }

  const rows = preview?.rows ?? [];
  const counts = rows.reduce(
    (acc, r) => {
      acc[riskLevelFromProb(r.ehtimollik)] += 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 } as Record<RiskLevel, number>
  );
  const visible = filter === "all" ? rows : rows.filter((r) => riskLevelFromProb(r.ehtimollik) === filter);

  return (
    <div className="space-y-6">
      <Card
        step={1}
        title="Загрузите два файла"
        subtitle="Список оповещений и транзакции клиентов по этим оповещениям. Связь — по колонке signal_id."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FilePicker
            id="signals-file"
            label="Файл оповещений"
            accept=".csv"
            formats="CSV"
            columns={["signal_id", "signal_sanasi"]}
            example={"signal_id,signal_sanasi\nSG_000001,2025-07-11\nSG_000002,2025-07-12"}
            file={signalsFile}
            onChange={(f) => {
              setSignalsFile(f);
              setError(null);
            }}
          />
          <FilePicker
            id="tx-file"
            label="Файл транзакций"
            accept=".csv,.parquet"
            formats="CSV или Parquet"
            columns={["signal_id", "tranzaksiya_vaqti", "kirim_chiqim", "tranzaksiya_turi", "miqdor_indeksi"]}
            example={
              "signal_id,tranzaksiya_vaqti,kirim_chiqim,tranzaksiya_turi,miqdor_indeksi\nSG_000001,2025-01-01 10:00:00,kirim,karta,0.5\nSG_000001,2025-01-03 22:15:00,chiqim,naqd,1.2"
            }
            file={txFile}
            onChange={(f) => {
              setTxFile(f);
              setError(null);
            }}
          />
        </div>
      </Card>

      <Card step={2} title="Оцените и скачайте результат" subtitle="Предпросмотр покажет 100 самых рискованных оповещений. Полный результат — в CSV.">
        <div className="flex flex-wrap items-center gap-3">
          <Button icon="target" loading={loading} onClick={handleScore} disabled={!ready}>
            {loading ? "Считаем оценки…" : "Оценить оповещения"}
          </Button>
          <Button variant="secondary" icon="download" loading={downloading} onClick={handleDownload} disabled={!ready}>
            {downloading ? "Формируем файл…" : "Скачать predictions.csv"}
          </Button>
          {!ready && (
            <span className="flex items-center gap-1.5 text-sm text-text-subtle">
              <Icon name="info" size={15} /> Кнопки станут активны после выбора обоих файлов
            </span>
          )}
        </div>
        <div aria-live="polite">
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-risk-high/25 bg-risk-high-bg px-3 py-2.5 text-sm text-risk-high">
              <Icon name="alert" size={18} className="mt-px shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </Card>

      {preview && (
        <Card step={3} title="Результаты" subtitle="Оповещения отсортированы от самого рискованного. Начните проверку сверху.">
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric icon="layers" label="Оповещений оценено" value={preview.n_signals.toLocaleString("ru-RU")} />
            <Metric
              icon="chart"
              label="Средняя вероятность эскалации"
              value={formatPercent(preview.mean_probability)}
            />
            <Metric
              icon="alert"
              label="С высоким риском (от 35 %)"
              value={preview.n_high_risk.toLocaleString("ru-RU")}
              hint="Рекомендуется проверить в первую очередь"
              highlight
            />
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-muted">
              Показано {visible.length} из топ-{rows.length}
            </p>
            <div role="group" aria-label="Фильтр по уровню риска" className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => {
                const active = filter === f.id;
                const count = f.id === "all" ? rows.length : counts[f.id];
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(f.id)}
                    className={`h-9 rounded-full border px-3 text-sm font-medium transition ${
                      active
                        ? "border-brand-700 bg-brand-700 text-white"
                        : "border-line-strong bg-white text-text-muted hover:border-brand-500 hover:text-brand-800"
                    }`}
                  >
                    {f.label} <span className={active ? "text-white/80" : "text-text-subtle"}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-h-[28rem] overflow-auto rounded-lg border border-line">
            <table className="ledger-table w-full min-w-[520px] text-sm">
              <thead className="sticky top-0 z-10 bg-canvas">
                <tr className="text-left text-xs text-text-muted">
                  <th className="border-b border-line px-4 py-2.5 font-medium">#</th>
                  <th className="border-b border-line px-4 py-2.5 font-medium">ID оповещения</th>
                  <th className="border-b border-line px-4 py-2.5 font-medium">Вероятность эскалации</th>
                  <th className="border-b border-line px-4 py-2.5 font-medium">Уровень риска</th>
                  <th className="border-b border-line px-4 py-2.5 text-right font-medium">Транзакций</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const level = riskLevelFromProb(r.ehtimollik);
                  return (
                    <tr key={r.signal_id} className="bg-white hover:bg-brand-50/50">
                      <td className="border-b border-line px-4 py-2.5 text-xs text-text-subtle">
                        {rows.indexOf(r) + 1}
                      </td>
                      <td className="border-b border-line px-4 py-2.5 font-mono text-xs text-text">{r.signal_id}</td>
                      <td className="border-b border-line px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-14 font-mono text-sm font-medium text-text">
                            {formatPercent(r.ehtimollik)}
                          </span>
                          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-line">
                            <span
                              className={`block h-full rounded-full ${RISK_CLASSES[level].bar}`}
                              style={{ width: `${Math.min(100, r.ehtimollik * 100)}%` }}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="border-b border-line px-4 py-2.5">
                        <RiskBadge level={level} short />
                      </td>
                      <td className="border-b border-line px-4 py-2.5 text-right font-mono text-xs text-text-muted">
                        {r.n_tx}
                      </td>
                    </tr>
                  );
                })}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-text-subtle">
                      Нет оповещений с таким уровнем риска.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
  highlight,
}: {
  icon: IconName;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 ${
        highlight ? "border-risk-high/25 bg-risk-high-bg" : "border-line bg-canvas/60"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          highlight ? "bg-white text-risk-high" : "bg-white text-brand-700"
        }`}
      >
        <Icon name={icon} size={18} />
      </span>
      <div>
        <div className={`text-2xl font-bold tabular-nums ${highlight ? "text-risk-high" : "text-text"}`}>{value}</div>
        <div className="text-sm text-text-muted">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-text-subtle">{hint}</div>}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function FilePicker({
  id,
  label,
  accept,
  formats,
  columns,
  example,
  file,
  onChange,
}: {
  id: string;
  label: string;
  accept: string;
  formats: string;
  columns: string[];
  example: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onChange(f);
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-text">{label}</p>

      {file ? (
        <div className="flex h-[104px] items-center gap-3 rounded-lg border border-brand-300 bg-brand-50 px-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700">
            <Icon name="file" size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{file.name}</p>
            <p className="flex items-center gap-1 text-xs text-brand-800">
              <Icon name="check" size={13} strokeWidth={2.5} /> Файл выбран · {formatSize(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            aria-label={`Убрать файл ${file.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-subtle hover:bg-white hover:text-risk-high"
          >
            <Icon name="x" size={17} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex h-[104px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-center transition ${
            dragging ? "border-brand-600 bg-brand-50" : "border-line-strong bg-canvas/50 hover:border-brand-500 hover:bg-brand-50/50"
          }`}
        >
          <Icon name="upload" size={22} className="text-brand-700" />
          <span className="text-sm text-text">
            <span className="font-medium text-brand-800 underline underline-offset-2">Выберите файл</span> или
            перетащите сюда
          </span>
          <span className="text-xs text-text-subtle">{formats}</span>
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      <div className="mt-2.5">
        <p className="mb-1 text-xs text-text-muted">Обязательные колонки:</p>
        <div className="flex flex-wrap gap-1">
          {columns.map((c) => (
            <code key={c} className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-text-muted ring-1 ring-inset ring-line">
              {c}
            </code>
          ))}
        </div>
        <details className="group mt-2">
          <summary className="cursor-pointer text-xs font-medium text-brand-800 hover:underline">
            Показать пример файла
          </summary>
          <pre className="mt-1.5 overflow-x-auto rounded-lg bg-text px-3 py-2 font-mono text-[11px] leading-relaxed text-brand-100">
            {example}
          </pre>
        </details>
      </div>
    </div>
  );
}
