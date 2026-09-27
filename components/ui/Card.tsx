export default function Card({
  step,
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  step?: number;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6 ${className}`}>
      {(title || action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {step !== undefined && (
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">
                {step}
              </span>
            )}
            <div>
              {title && <h2 className="text-base font-semibold text-text">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
