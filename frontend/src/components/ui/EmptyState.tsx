import type { ReactNode } from "react";
import { FolderSearch } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-border bg-surface/60 transition-all duration-300">
      <div className="mb-4 text-primary p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
        {icon || <FolderSearch className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-bold text-text mb-1 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-muted max-w-md mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
