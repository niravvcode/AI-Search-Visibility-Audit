import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-contrast shadow-sm hover:opacity-95 hover:shadow transition-all duration-150 active:scale-[0.98]",
  secondary: "bg-surface text-text border border-border shadow-sm hover:bg-muted/10 hover:border-muted/30 transition-all duration-150 active:scale-[0.98]",
  danger: "bg-danger text-primary-contrast shadow-sm hover:opacity-95 hover:shadow transition-all duration-150 active:scale-[0.98]",
  ghost: "bg-transparent text-muted hover:text-text hover:bg-muted/10 transition-all duration-150",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
