"use client";

import { useId, useState } from "react";
import Icon from "./Icon";

export default function InfoHint({
  text,
  label = "Пояснение",
  placement = "top",
}: {
  text: string;
  label?: string;
  placement?: "top" | "bottom-end";
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-text-subtle transition hover:text-brand-700"
      >
        <Icon name="info" size={15} />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`absolute z-30 w-64 rounded-lg ${
            placement === "top" ? "bottom-full left-1/2 mb-2 -translate-x-1/2" : "right-0 top-full mt-2"
          }`}
        >
          <span className="block rounded-lg bg-text px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-white shadow-lift">
            {text}
          </span>
        </span>
      )}
    </span>
  );
}
