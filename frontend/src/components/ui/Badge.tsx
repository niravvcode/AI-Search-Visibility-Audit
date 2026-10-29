import type { HTMLAttributes } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "secondary" | "primary";

const variants: Record<BadgeVariant, string> = {
  primary: "bg-primary/10 text-primary border border-primary/20",
  secondary: "bg-surface text-muted border border-border",
  success: "bg-success/10 text-success border border-success/25",
  warning: "bg-warning/10 text-warning border border-warning/25",
  danger: "bg-danger/10 text-danger border border-danger/25",
  info: "bg-info/10 text-info border border-info/25",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "secondary", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
