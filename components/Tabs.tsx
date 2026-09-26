"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export default function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-ink-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`relative px-4 py-2.5 text-sm font-medium transition ${
              active === tab.id ? "text-paper" : "text-paper-muted hover:text-paper-dim"
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brass" />
            )}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} className={tab.id === active ? "block" : "hidden"}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
