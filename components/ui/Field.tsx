import InfoHint from "./InfoHint";

export const inputClass = (invalid?: boolean) =>
  `h-10 w-full rounded-lg border bg-white px-3 text-sm text-text outline-none transition placeholder:text-text-subtle focus:ring-2 ${
    invalid
      ? "border-risk-high bg-risk-high-bg/50 focus:border-risk-high focus:ring-risk-high/20"
      : "border-line-strong hover:border-brand-500 focus:border-brand-600 focus:ring-brand-500/20"
  }`;

export default function Field({
  id,
  label,
  hint,
  info,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  info?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1">
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
        {info && <InfoHint text={info} label={`Что такое «${label}»`} />}
      </div>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-risk-high">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-text-subtle">{hint}</p>
      )}
    </div>
  );
}
