export type Direction = "kirim" | "chiqim";
export type TxType = "karta" | "bank_otkazmasi" | "naqd" | "xalqaro";

export interface TransactionInput {
  id: string; // client-side row id, not sent to API
  tranzaksiya_vaqti: string; // ISO datetime-local value
  kirim_chiqim: Direction;
  tranzaksiya_turi: TxType;
  miqdor_indeksi: string; // kept as string while editing, parsed to float on submit
}

export interface TopFeature {
  name: string;
  value: number;
}

export interface PredictResponse {
  signal_id: string;
  ehtimollik: number;
  risk_level: "low" | "medium" | "high";
  n_transactions: number;
  low_confidence: boolean;
  top_features: TopFeature[];
}

export interface BatchRow {
  signal_id: string;
  ehtimollik: number;
  n_tx: number;
}

export interface BatchPreviewResponse {
  n_signals: number;
  mean_probability: number;
  n_high_risk: number;
  rows: BatchRow[];
}

export interface FeatureImportanceRow {
  feature: string;
  importance: number;
}

export const FEATURE_LABELS_RU: Record<string, string> = {
  min_amt: "Минимальная сумма транзакции",
  max_amt: "Максимальная сумма транзакции",
  mean_amt: "Средняя сумма транзакции",
  median_amt: "Медианная сумма",
  sum_amt: "Суммарный объём",
  std_amt: "Разброс сумм (std)",
  skew_amt: "Асимметрия распределения сумм",
  kurt_amt: "Эксцесс распределения сумм",
  cv_amt: "Коэффициент вариации",
  naqd_mean: "Средняя сумма наличных операций",
  naqd_sum: "Сумма наличных операций",
  naqd_share: "Доля наличных операций",
  xalqaro_share: "Доля международных операций",
  xalqaro_sum: "Сумма международных операций",
  bank_otkazmasi_mean: "Средняя сумма банковских переводов",
  bank_otkazmasi_sum: "Сумма банковских переводов",
  karta_mean: "Средняя сумма карточных операций",
  kirim_share: "Доля входящих транзакций",
  net_flow: "Чистый поток (входящие − исходящие)",
  flow_ratio: "Отношение входящих к исходящим",
  n_tx: "Количество транзакций",
  tx_density: "Плотность транзакций",
  gap_std: "Разброс интервалов между транзакциями",
  gap_mean: "Средний интервал между транзакциями",
  night_share: "Доля ночных операций",
  weekend_share: "Доля операций в выходные",
  daily_count_trend: "Тренд ежедневной активности",
  type_entropy: "Энтропия типов операций",
};

export function featureLabel(name: string): string {
  return FEATURE_LABELS_RU[name] ?? name;
}
