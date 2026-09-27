"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE, checkHealth } from "@/lib/api";
import InfoHint from "./ui/InfoHint";

type Status = "checking" | "online" | "offline";

const STYLE: Record<Status, { dot: string; text: string; box: string; label: string }> = {
  checking: { dot: "bg-text-subtle animate-pulse", text: "text-text-muted", box: "border-line bg-white", label: "Проверяем сервер…" },
  online: { dot: "bg-brand-600", text: "text-brand-800", box: "border-brand-200 bg-brand-50", label: "Сервер подключён" },
  offline: { dot: "bg-risk-high", text: "text-risk-high", box: "border-risk-high/25 bg-risk-high-bg", label: "Сервер недоступен" },
};

export default function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking");

  const check = useCallback(() => {
    setStatus("checking");
    checkHealth().then((ok) => setStatus(ok ? "online" : "offline"));
  }, []);

  useEffect(() => {
    let mounted = true;
    checkHealth().then((ok) => {
      if (mounted) setStatus(ok ? "online" : "offline");
    });
    return () => {
      mounted = false;
    };
  }, []);

  const s = STYLE[status];

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2">
      <div className={`flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium ${s.box} ${s.text}`}>
        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
        <span>{s.label}</span>
        {status === "offline" && (
          <InfoHint
            label="Как запустить сервер"
            placement="bottom-end"
            text={`Не удаётся связаться с ${API_BASE}. Запустите бэкенд: в папке backend выполните «uvicorn main:app --port 8000» и нажмите «Повторить».`}
          />
        )}
      </div>
      {status === "offline" && (
        <button
          type="button"
          onClick={check}
          className="h-9 rounded-full px-3 text-sm font-medium text-brand-800 hover:bg-brand-50"
        >
          Повторить
        </button>
      )}
    </div>
  );
}
