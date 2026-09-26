import type {
  BatchPreviewResponse,
  FeatureImportanceRow,
  PredictResponse,
  TransactionInput,
} from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseErrorBody(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.detail ?? JSON.stringify(body);
  } catch {
    return res.statusText;
  }
}

export async function predictSingle(
  signalId: string,
  signalDate: string,
  transactions: TransactionInput[]
): Promise<PredictResponse> {
  const payload = {
    signal_id: signalId || "SG_MANUAL",
    signal_sanasi: signalDate,
    transactions: transactions.map((t) => ({
      tranzaksiya_vaqti: t.tranzaksiya_vaqti,
      kirim_chiqim: t.kirim_chiqim,
      tranzaksiya_turi: t.tranzaksiya_turi,
      miqdor_indeksi: parseFloat(t.miqdor_indeksi),
    })),
  };

  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new ApiError(await parseErrorBody(res), res.status);
  }
  return res.json();
}

export async function predictBatchPreview(
  signalsFile: File,
  transactionsFile: File,
  limit = 100
): Promise<BatchPreviewResponse> {
  const form = new FormData();
  form.append("signals_file", signalsFile);
  form.append("transactions_file", transactionsFile);
  form.append("limit", String(limit));

  const res = await fetch(`${API_BASE}/predict/batch/preview`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new ApiError(await parseErrorBody(res), res.status);
  }
  return res.json();
}

export async function predictBatchDownload(
  signalsFile: File,
  transactionsFile: File
): Promise<Blob> {
  const form = new FormData();
  form.append("signals_file", signalsFile);
  form.append("transactions_file", transactionsFile);

  const res = await fetch(`${API_BASE}/predict/batch`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new ApiError(await parseErrorBody(res), res.status);
  }
  return res.blob();
}

export async function getFeatureImportance(
  topN = 15
): Promise<FeatureImportanceRow[]> {
  const res = await fetch(`${API_BASE}/feature-importance?top_n=${topN}`);
  if (!res.ok) {
    throw new ApiError(await parseErrorBody(res), res.status);
  }
  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
