import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "secondary" | "primary";

const variants: Record<BadgeVariant, string> = {
  primary: "bg-primary/10 text-primary border border-primary/20",
  secondary: "bg-surface-hover text-muted border border-border",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning border border-warning/20",
  danger: "bg-danger/10 text-danger border border-danger/20",
  info: "bg-info/10 text-info border border-info/20",
};

const dotColors: Record<BadgeVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-muted",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  icon?: ReactNode;
}

export function Badge({
  variant = "secondary",
  dot = false,
  icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight select-none ${variants[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[variant]}`} />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
