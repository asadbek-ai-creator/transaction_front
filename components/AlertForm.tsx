"use client";

import { useState } from "react";
import type { Direction, PredictResponse, TransactionInput, TxType } from "@/lib/types";
import { ApiError, predictSingle } from "@/lib/api";
import FeaturePanel from "./FeaturePanel";
import RiskResult from "./RiskResult";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Field, { inputClass } from "./ui/Field";
import Icon from "./ui/Icon";
import InfoHint from "./ui/InfoHint";

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "kirim", label: "Входящая" },
  { value: "chiqim", label: "Исходящая" },
];

const TYPES: { value: TxType; label: string }[] = [
  { value: "karta", label: "Карта" },
  { value: "bank_otkazmasi", label: "Банковский перевод" },
  { value: "naqd", label: "Наличные" },
  { value: "xalqaro", label: "Международная" },
];

const AMOUNT_INFO =
  "Нормализованная сумма из исходных данных (не в сумах). Обычно от −3 до 3: около 0 — типичная сумма, больше 1,5 — крупная, меньше −1,5 — мелкая.";

function row(
  tranzaksiya_vaqti = "",
  kirim_chiqim: Direction = "kirim",
  tranzaksiya_turi: TxType = "karta",
  miqdor_indeksi = ""
): TransactionInput {
  return { id: crypto.randomUUID(), tranzaksiya_vaqti, kirim_chiqim, tranzaksiya_turi, miqdor_indeksi };
}

function seedRows(): TransactionInput[] {
  return [row("", "kirim", "karta"), row("", "chiqim", "naqd"), row("", "kirim", "bank_otkazmasi")];
}

const EXAMPLE_DATE = "2025-07-11T12:00";

function exampleRows(): TransactionInput[] {
  return [
    row("2025-06-02T10:15", "kirim", "bank_otkazmasi", "0.4"),
    row("2025-06-09T14:40", "chiqim", "karta", "-0.6"),
    row("2025-06-18T23:50", "kirim", "xalqaro", "1.9"),
    row("2025-06-19T01:10", "chiqim", "naqd", "1.7"),
    row("2025-07-01T09:30", "kirim", "karta", "-0.2"),
    row("2025-07-08T02:05", "chiqim", "naqd", "2.1"),
  ];
}

interface RowErrors {
  time?: string;
  amount?: string;
}

function rowErrors(r: TransactionInput, signalDate: string): RowErrors {
  const e: RowErrors = {};
  if (!r.tranzaksiya_vaqti) e.time = "Укажите дату";
  else if (signalDate && r.tranzaksiya_vaqti > signalDate) e.time = "Позже даты оповещения";
  if (r.miqdor_indeksi === "" || Number.isNaN(parseFloat(r.miqdor_indeksi))) e.amount = "Укажите число";
  return e;
}

export default function AlertForm() {
  const [signalId, setSignalId] = useState("SG_MANUAL");
  const [signalDate, setSignalDate] = useState("");
  const [rows, setRows] = useState<TransactionInput[]>(seedRows());
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const dateError = showErrors && !signalDate ? "Укажите дату оповещения" : null;
  const errorsByRow = rows.map((r) => (showErrors ? rowErrors(r, signalDate) : {}));
  const invalidCount =
    (dateError ? 1 : 0) + errorsByRow.reduce((n, e) => n + (e.time ? 1 : 0) + (e.amount ? 1 : 0), 0);

  function updateRow(id: string, patch: Partial<TransactionInput>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, row()]);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function fillExample() {
    setSignalId("SG_EXAMPLE");
    setSignalDate(EXAMPLE_DATE);
    setRows(exampleRows());
    setError(null);
    setShowErrors(false);
  }

  function clearAll() {
    setSignalId("SG_MANUAL");
    setSignalDate("");
    setRows(seedRows());
    setResult(null);
    setError(null);
    setShowErrors(false);
  }

  async function handleSubmit() {
    const hasErrors = !signalDate || rows.some((r) => Object.keys(rowErrors(r, signalDate)).length > 0);
    if (hasErrors) {
      setShowErrors(true);
      setError(null);
      return;
    }
    setShowErrors(false);
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await predictSingle(signalId, signalDate, rows);
      setResult(res);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `Сервер вернул ошибку: ${e.message}`
          : "Не удалось связаться с сервером. Убедитесь, что бэкенд запущен (статус вверху страницы)."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.8fr_1fr]">
      <div className="space-y-6">
        <Card
          step={1}
          title="Данные оповещения"
          subtitle="Какое оповещение проверяем и когда оно было создано."
          action={
            <>
              <Button variant="secondary" size="sm" icon="sparkles" onClick={fillExample}>
                Заполнить пример
              </Button>
              <Button variant="ghost" size="sm" icon="refresh" onClick={clearAll}>
                Очистить
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="signal-id" label="ID оповещения" hint="Необязательно — для вашего удобства">
              <input
                id="signal-id"
                value={signalId}
                onChange={(e) => setSignalId(e.target.value)}
                placeholder="SG_000001"
                className={`${inputClass()} font-mono`}
              />
            </Field>
            <Field
              id="signal-date"
              label="Дата оповещения"
              info="Модель учитывает только транзакции, совершённые до этой даты."
              hint="Когда сработало оповещение"
              error={dateError}
            >
              <input
                id="signal-date"
                type="datetime-local"
                value={signalDate}
                onChange={(e) => setSignalDate(e.target.value)}
                aria-invalid={!!dateError}
                className={inputClass(!!dateError)}
              />
            </Field>
          </div>
        </Card>

        <Card
          step={2}
          title="История транзакций клиента"
          subtitle="Операции клиента до даты оповещения. Чем больше транзакций, тем точнее оценка."
          action={
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">
              Транзакций: {rows.length}
            </span>
          }
        >
          <div className="hidden grid-cols-[minmax(170px,1.3fr)_minmax(120px,0.9fr)_minmax(185px,1.3fr)_minmax(90px,0.8fr)_40px] gap-2 px-1 pb-2 text-xs font-medium text-text-muted md:grid">
            <span>Дата и время</span>
            <span>Направление</span>
            <span>Тип операции</span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              Сумма (индекс) <InfoHint text={AMOUNT_INFO} label="Что такое индекс суммы" />
            </span>
            <span />
          </div>

          <ul className="space-y-3 md:space-y-2">
            {rows.map((r, i) => {
              const e = errorsByRow[i];
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-2 gap-2 rounded-lg border border-line bg-canvas/60 p-3 md:grid-cols-[minmax(170px,1.3fr)_minmax(120px,0.9fr)_minmax(185px,1.3fr)_minmax(90px,0.8fr)_40px] md:items-start md:border-0 md:bg-transparent md:p-0"
                >
                  <div className="col-span-2 flex items-center justify-between md:hidden">
                    <span className="text-xs font-semibold text-text-muted">Транзакция {i + 1}</span>
                  </div>
                  <label className="col-span-2 md:col-span-1">
                    <span className="mb-1 block text-xs text-text-muted md:sr-only">Дата и время</span>
                    <input
                      type="datetime-local"
                      value={r.tranzaksiya_vaqti}
                      max={signalDate || undefined}
                      onChange={(ev) => updateRow(r.id, { tranzaksiya_vaqti: ev.target.value })}
                      aria-invalid={!!e.time}
                      className={inputClass(!!e.time)}
                    />
                    {e.time && <span className="mt-1 block text-xs text-risk-high">{e.time}</span>}
                  </label>
                  <label>
                    <span className="mb-1 block text-xs text-text-muted md:sr-only">Направление</span>
                    <select
                      value={r.kirim_chiqim}
                      onChange={(ev) => updateRow(r.id, { kirim_chiqim: ev.target.value as Direction })}
                      className={inputClass()}
                    >
                      {DIRECTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-xs text-text-muted md:sr-only">Тип операции</span>
                    <select
                      value={r.tranzaksiya_turi}
                      onChange={(ev) => updateRow(r.id, { tranzaksiya_turi: ev.target.value as TxType })}
                      className={inputClass()}
                    >
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-xs text-text-muted md:sr-only">Сумма (индекс)</span>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={r.miqdor_indeksi}
                      onChange={(ev) => updateRow(r.id, { miqdor_indeksi: ev.target.value })}
                      placeholder="0.00"
                      aria-invalid={!!e.amount}
                      className={`${inputClass(!!e.amount)} font-mono`}
                    />
                    {e.amount && <span className="mt-1 block text-xs text-risk-high">{e.amount}</span>}
                  </label>
                  <div className="flex items-end md:items-start">
                    <button
                      type="button"
                      onClick={() => removeRow(r.id)}
                      disabled={rows.length === 1}
                      title={rows.length === 1 ? "Нужна хотя бы одна транзакция" : "Удалить транзакцию"}
                      aria-label={`Удалить транзакцию ${i + 1}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-text-subtle transition hover:bg-risk-high-bg hover:text-risk-high disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-subtle"
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={addRow}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand-300 text-sm font-medium text-brand-800 transition hover:border-brand-600 hover:bg-brand-50"
          >
            <Icon name="plus" size={16} /> Добавить транзакцию
          </button>

          <p className="mt-3 flex items-start gap-1.5 text-xs text-text-subtle md:hidden">
            <Icon name="info" size={14} className="mt-px shrink-0" /> {AMOUNT_INFO}
          </p>

          <div aria-live="polite">
            {showErrors && invalidCount > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-risk-high/25 bg-risk-high-bg px-3 py-2.5 text-sm text-risk-high">
                <Icon name="alert" size={18} className="mt-px shrink-0" />
                <span>
                  Проверьте поля, отмеченные красным ({invalidCount}).
                  Или нажмите «Заполнить пример», чтобы посмотреть, как это работает.
                </span>
              </div>
            )}
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-risk-high/25 bg-risk-high-bg px-3 py-2.5 text-sm text-risk-high">
                <Icon name="alert" size={18} className="mt-px shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <Button size="lg" className="mt-5 w-full" icon="target" loading={loading} onClick={handleSubmit}>
            {loading ? "Оцениваем…" : "Оценить риск эскалации"}
          </Button>
        </Card>
      </div>

      <Card step={3} title="Результат" className="lg:sticky lg:top-20">
        <div aria-live="polite">
          {!result && !loading && (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Icon name="target" size={26} />
              </span>
              <p className="text-sm font-medium text-text">Здесь появится оценка</p>
              <p className="mt-1 max-w-xs text-sm text-text-muted">
                Заполните шаги 1 и 2 и нажмите «Оценить». Вы увидите вероятность эскалации, уровень
                риска и рекомендацию, что делать дальше.
              </p>
            </div>
          )}
          {loading && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
              <p className="text-sm text-text-muted">Считаем признаки и запускаем модель…</p>
            </div>
          )}
          {result && (
            <RiskResult probability={result.ehtimollik} level={result.risk_level}>
              <p className="text-center text-xs text-text-subtle">
                Учтено транзакций: {result.n_transactions}
              </p>
              {result.low_confidence && (
                <div className="flex w-full items-start gap-2 rounded-lg border border-risk-medium/25 bg-risk-medium-bg px-3 py-2.5 text-sm text-risk-medium">
                  <Icon name="alert" size={18} className="mt-px shrink-0" />
                  <span>Мало транзакций — оценка менее надёжна. Добавьте больше операций клиента.</span>
                </div>
              )}
              <FeaturePanel features={result.top_features} />
            </RiskResult>
          )}
        </div>
      </Card>
    </div>
  );
}

