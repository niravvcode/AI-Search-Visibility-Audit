import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({ leftIcon, rightIcon, className = "", ...props }: InputProps) {
  if (leftIcon || rightIcon) {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3 text-muted pointer-events-none flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        <input
          className={`w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary disabled:opacity-50 ${
            leftIcon ? "pl-9" : ""
          } ${rightIcon ? "pr-9" : ""} ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-muted pointer-events-none flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }

  return (
    <input
      className={`w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary disabled:opacity-50 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ className = "", children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
