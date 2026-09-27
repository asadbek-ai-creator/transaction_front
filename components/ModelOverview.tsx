"use client";

import { useEffect, useState } from "react";
import { getFeatureImportance } from "@/lib/api";
import { featureLabel, type FeatureImportanceRow } from "@/lib/types";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Icon from "./ui/Icon";
import InfoHint from "./ui/InfoHint";

const DOES = [
  "Анализирует историю транзакций клиента до даты оповещения",
  "Сравнивает её с 14 000 оповещений, по которым уже известно решение",
  "Выдаёт вероятность того, что оповещение передадут на расследование",
];

const DOES_NOT = [
  "Не принимает решение за аналитика — это подсказка для приоритизации",
  "Не видит данные о личности клиента, только операции",
];

export default function ModelOverview() {
  const [rows, setRows] = useState<FeatureImportanceRow[] | null>(null);
  const [error, setError] = useState(false);

  function load() {
    setError(false);
    setRows(null);
    getFeatureImportance(12)
      .then(setRows)
      .catch(() => setError(true));
  }

  useEffect(load, []);

  const maxImportance = rows?.[0]?.importance ?? 1;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-6">
        <Card title="Простыми словами">
          <ul className="space-y-2.5">
            {DOES.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-text">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                  <Icon name="check" size={13} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
            {DOES_NOT.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-text-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-canvas text-text-subtle ring-1 ring-inset ring-line">
                  <Icon name="x" size={12} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Характеристики модели">
          <dl className="divide-y divide-line">
            <Row
              term="Алгоритм"
              def="LightGBM"
              info="Градиентный бустинг над деревьями решений — стандартный и надёжный метод для табличных данных."
            />
            <Row
              term="Проверка качества"
              def="5 × 5 кросс-валидация"
              info="Данные 5 раз делятся на 5 частей: модель учится на четырёх и проверяется на пятой. Так оценка качества честная, а не «на знакомых данных»."
            />
            <Row
              term="ROC-AUC"
              def="0,628"
              info="Насколько хорошо модель отличает эскалированные оповещения от остальных. 0,5 — случайное угадывание, 1,0 — идеально. 0,63 — модель заметно полезнее случайного выбора, но не безошибочна."
            />
            <Row term="Признаков" def="79" info="Характеристики, которые модель считает по транзакциям: суммы, доли наличных и международных операций, ночная активность и т. д." />
            <Row term="Обучающих оповещений" def="14 000" />
          </dl>
          <p className="mt-4 rounded-lg bg-canvas px-3 py-2.5 text-xs leading-relaxed text-text-muted">
            Модель обучена на синтетических данных хакатона по мониторингу финансовых транзакций.
            Полный анализ данных и пайплайн — в отчёте и ноутбуке команды IT-Ledi.
          </p>
        </Card>
      </div>

      <Card
        title="Какие признаки важнее всего"
        subtitle="Чем длиннее полоса, тем сильнее признак влияет на решения модели в целом."
      >
        {error && (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-risk-high/25 bg-risk-high-bg p-4 text-sm text-risk-high">
            <span className="flex items-center gap-2">
              <Icon name="alert" size={18} /> Не удалось загрузить данные — проверьте, что сервер запущен.
            </span>
            <Button variant="secondary" size="sm" icon="refresh" onClick={load}>
              Повторить
            </Button>
          </div>
        )}
        {!rows && !error && (
          <ul className="space-y-4" aria-label="Загрузка">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i}>
                <div className="skeleton mb-1.5 h-3 w-1/2 animate-shimmer rounded" />
                <div className="skeleton h-2 animate-shimmer rounded-full" style={{ width: `${100 - i * 9}%` }} />
              </li>
            ))}
          </ul>
        )}
        {rows && (
          <ol className="space-y-3.5">
            {rows.map((r, i) => {
              const share = (r.importance / maxImportance) * 100;
              return (
                <li key={r.feature}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-text">
                      <span className="mr-1.5 inline-block w-5 text-xs text-text-subtle">{i + 1}.</span>
                      {featureLabel(r.feature)}
                    </span>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-text-muted">
                      {Math.round(share)} %
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-brand-50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {rows && (
          <p className="mt-5 text-xs text-text-subtle">
            Процент — важность относительно самого сильного признака (он = 100 %).
          </p>
        )}
      </Card>
    </div>
  );
}

function Row({ term, def, info }: { term: string; def: string; info?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <dt className="flex items-center gap-1 text-text-muted">
        {term}
        {info && <InfoHint text={info} label={`Что такое «${term}»`} />}
      </dt>
      <dd className="font-semibold tabular-nums text-text">{def}</dd>
    </div>
  );
}
