import Icon, { type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white shadow-sm hover:bg-brand-800 active:bg-brand-900 disabled:bg-brand-700/50",
  secondary:
    "border border-line-strong bg-white text-text hover:border-brand-600 hover:bg-brand-50 hover:text-brand-800 disabled:text-text-subtle disabled:hover:border-line-strong disabled:hover:bg-white",
  ghost: "text-text-muted hover:bg-brand-50 hover:text-brand-800 disabled:text-text-subtle",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  loading,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <Icon name={icon} size={size === "lg" ? 20 : 16} />
      )}
      {children}
    </button>
  );
}
