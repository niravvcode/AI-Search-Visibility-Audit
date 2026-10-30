import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  elevated?: boolean;
}

export function Card({
  className = "",
  hoverable = false,
  elevated = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 ${
        hoverable ? "hover:border-border/80 hover:shadow-elevated hover:-translate-y-0.5" : ""
      } ${elevated ? "bg-card-elevated shadow-elevated" : ""} ${className}`}
      {...props}
    />
  );
}
