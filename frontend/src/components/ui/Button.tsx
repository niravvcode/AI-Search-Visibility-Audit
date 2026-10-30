import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "xs" | "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-contrast shadow-sm hover:opacity-95 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border border-primary/20",
  secondary:
    "bg-surface text-text border border-border shadow-sm hover:bg-surface-hover hover:border-border/80 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  danger:
    "bg-danger text-primary-contrast shadow-sm hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border border-danger/20",
  ghost:
    "bg-transparent text-muted hover:text-text hover:bg-surface-hover active:scale-[0.98]",
  outline:
    "bg-transparent text-text border border-border hover:bg-surface-hover hover:border-border/80 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  xs: "px-2.5 py-1 text-xs gap-1 rounded-md",
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2 text-sm gap-2 rounded-lg",
  lg: "px-5 py-2.5 text-base gap-2.5 rounded-xl",
  icon: "p-2 rounded-lg items-center justify-center",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
