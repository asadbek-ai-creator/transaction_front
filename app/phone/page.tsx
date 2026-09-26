"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type TxType = "karta" | "bank_otkazmasi" | "naqd" | "xalqaro";

const TYPE_OPTIONS: { value: TxType; label: string }[] = [
  { value: "karta", label: "Карта" },
  { value: "bank_otkazmasi", label: "Перевод" },
  { value: "naqd", label: "Наличные" },
  { value: "xalqaro", label: "За рубеж" },
];

function formatSom(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function PhonePage() {
  const [screen, setScreen] = useState<"form" | "sending" | "success" | "error">("form");
  const [cardNumber, setCardNumber] = useState("");
  const [amountRaw, setAmountRaw] = useState("");
  const [txType, setTxType] = useState<TxType>("karta");

  const amountDigits = amountRaw.replace(/\D/g, "");
  const canSubmit = cardNumber.replace(/\D/g, "").length >= 12 && amountDigits.length > 0;

  async function handleSend() {
    if (!canSubmit) return;
    setScreen("sending");
    try {
      const res = await fetch(`${API_BASE}/demo/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_number: cardNumber,
          amount_som: parseFloat(amountDigits),
          tranzaksiya_turi: txType,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setScreen("success");
    } catch {
      setScreen("error");
    }
  }

  function reset() {
    setScreen("form");
    setAmountRaw("");
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#e9edf3] p-6">
      {/* Phone frame */}
      <div className="flex h-[720px] w-[360px] flex-col overflow-hidden rounded-[2.5rem] border-[10px] border-[#1a1a1a] bg-white shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-white px-6 pb-1 pt-3 text-[11px] font-medium text-[#111]">
          <span>9:41</span>
          <span className="flex gap-1">
            <span>●●●</span>
            <span>Wi-Fi</span>
            <span>100%</span>
          </span>
        </div>

        {/* App header */}
        <div className="bg-[#1f5fd1] px-5 pb-5 pt-2 text-white">
          <p className="text-xs text-white/70">TezPay Bank</p>
          <p className="mt-0.5 text-lg font-semibold">Перевод по карте</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {screen === "form" && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#5b6472]">
                  Номер карты получателя
                </label>
                <input
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/[^\d]/g, "").slice(0, 16))}
                  placeholder="8600 1234 5678 9012"
                  className="w-full rounded-xl border border-[#e1e5eb] bg-[#f6f8fb] px-4 py-3 text-base tracking-wide text-[#111] outline-none focus:border-[#1f5fd1]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#5b6472]">Сумма</label>
                <div className="flex items-center rounded-xl border border-[#e1e5eb] bg-[#f6f8fb] px-4 py-3">
                  <input
                    inputMode="numeric"
                    value={amountRaw}
                    onChange={(e) => setAmountRaw(formatSom(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-2xl font-semibold text-[#111] outline-none"
                  />
                  <span className="ml-2 text-lg text-[#5b6472]">сум</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#5b6472]">Тип операции</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTxType(opt.value)}
                      className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                        txType === opt.value
                          ? "border-[#1f5fd1] bg-[#1f5fd1]/10 text-[#1f5fd1]"
                          : "border-[#e1e5eb] text-[#5b6472]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {screen === "sending" && (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e1e5eb] border-t-[#1f5fd1]" />
              <p className="text-sm text-[#5b6472]">Отправка перевода…</p>
            </div>
          )}

          {screen === "success" && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f6ec]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#2f9e6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#111]">Перевод отправлен</p>
                <p className="mt-1 text-sm text-[#5b6472]">{amountRaw} сум успешно переведено</p>
              </div>
              <button
                onClick={reset}
                className="mt-4 rounded-xl bg-[#f6f8fb] px-5 py-2.5 text-sm font-medium text-[#1f5fd1]"
              >
                Новый перевод
              </button>
            </div>
          )}

          {screen === "error" && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-sm text-[#c1443c]">
                Не удалось выполнить перевод. Проверьте соединение с сервером.
              </p>
              <button
                onClick={reset}
                className="rounded-xl bg-[#f6f8fb] px-5 py-2.5 text-sm font-medium text-[#1f5fd1]"
              >
                Назад
              </button>
            </div>
          )}
        </div>

        {/* Bottom action */}
        {screen === "form" && (
          <div className="border-t border-[#eef0f3] p-4">
            <button
              onClick={handleSend}
              disabled={!canSubmit}
              className="w-full rounded-xl bg-[#1f5fd1] py-3.5 text-base font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Отправить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
