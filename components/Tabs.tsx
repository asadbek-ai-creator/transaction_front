"use client";

import { useRef, useState } from "react";
import Icon, { type IconName } from "./ui/Icon";

interface Tab {
  id: string;
  label: string;
  description: string;
  icon: IconName;
  content: React.ReactNode;
}

export default function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    setActive(tabs[next].id);
    buttons.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Разделы"
        className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
      >
        {tabs.map((tab, i) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`flex min-w-[200px] items-start gap-3 rounded-xl border p-3.5 text-left transition sm:min-w-0 ${
                selected
                  ? "border-brand-600 bg-white shadow-card ring-1 ring-brand-600"
                  : "border-line bg-white/60 hover:border-brand-300 hover:bg-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                  selected ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700"
                }`}
              >
                <Icon name={tab.icon} size={18} />
              </span>
              <span>
                <span className={`block text-sm font-semibold ${selected ? "text-brand-900" : "text-text"}`}>
                  {tab.label}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-text-muted">{tab.description}</span>
              </span>
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== active}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
