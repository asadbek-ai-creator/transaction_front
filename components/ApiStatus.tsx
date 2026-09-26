"use client";

import { useEffect, useState } from "react";
import { API_BASE, checkHealth } from "@/lib/api";

export default function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let mounted = true;
    checkHealth().then((ok) => {
      if (mounted) setStatus(ok ? "online" : "offline");
    });
    return () => {
      mounted = false;
    };
  }, []);

  const dotColor =
    status === "online" ? "bg-risk-low" : status === "offline" ? "bg-risk-high" : "bg-paper-dim";

  const text =
    status === "online" ? "API подключён" : status === "offline" ? "API недоступен" : "Проверка…";

  return (
    <div className="flex items-center gap-2 rounded-full border border-ink-border px-3 py-1 text-xs text-paper-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{text}</span>
      <span className="hidden font-mono text-paper-dim sm:inline">· {API_BASE}</span>
    </div>
  );
}
