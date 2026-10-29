import { NavLink, Outlet } from "react-router-dom";
import {
  Globe,
  HelpCircle,
  LayoutDashboard,
  Moon,
  Sun,
  FileCheck2,
  Eye,
  Users2,
  FileText,
  Search,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { applyTheme, getInitialTheme, THEME_STORAGE_KEY, type Theme } from "../../config/theme";
import { Button } from "../ui/Button";
import { QuickUrlAuditModal } from "../websites/QuickUrlAuditModal";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/websites", label: "Websites", icon: Globe },
  { to: "/questions", label: "Questions", icon: HelpCircle },
  { to: "/audits", label: "Answer Readiness", icon: FileCheck2 },
  { to: "/visibility", label: "AI Search Visibility", icon: Eye },
  { to: "/competitors", label: "Competitor Gaps", icon: Users2 },
  { to: "/reports", label: "Reports & Exports", icon: FileText },
];

export function AppShell() {
  const [theme, setTheme] = useState<Theme>(() => {
    const t = getInitialTheme();
    applyTheme(t);
    return t;
  });
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Sidebar Navigation */}
      <aside className="border-b border-border bg-surface p-4 md:w-64 md:border-b-0 md:border-r flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo & Brand */}
          <div className="mb-6 flex items-center gap-3 px-1">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-contrast font-bold text-sm shadow-sm ring-2 ring-primary/20">
              AS
            </div>
            <div>
              <h1 className="text-sm font-bold text-text leading-tight tracking-tight">AI Search & Engine</h1>
              <p className="text-[11px] font-medium text-muted">Visibility & Audit Suite</p>
            </div>
          </div>

          {/* Quick Scan Action Button in Sidebar */}
          <button
            onClick={() => setIsQuickScanOpen(true)}
            className="w-full mb-4 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Quick URL Scanner
          </button>

          {/* Nav Items */}
          <nav aria-label="Main" className="flex flex-wrap gap-1 md:flex-col">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-contrast shadow-sm font-semibold"
                      : "text-muted hover:text-text hover:bg-muted/10"
                  }`
                }
              >
                <Icon size={16} aria-hidden /> <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Audit Protocol Card */}
        <div className="hidden md:block pt-5 border-t border-border mt-6">
          <div className="p-3.5 rounded-xl bg-background border border-border text-xs text-muted space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-text">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Dual Audit Protocol
            </div>
            <p className="leading-relaxed text-[11px]">
              Capability A (Readiness) & Capability B (Search Observations) strictly separated.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex justify-between items-center border-b border-border bg-surface/90 backdrop-blur-md px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="hidden sm:inline">Engine Active</span>
            </div>
            <span className="hidden sm:inline text-border">|</span>
            <span className="text-xs text-muted font-medium truncate">
              AI Search Visibility & Answer Engine Audit Platform
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsQuickScanOpen(true)}
              className="text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Scan</span>
            </Button>
            <Button
              variant="secondary"
              onClick={toggle}
              aria-label="Toggle theme"
              className="p-2 h-8 w-8 flex items-center justify-center rounded-lg"
            >
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* Instant Quick URL Scanner Modal */}
      <QuickUrlAuditModal
        isOpen={isQuickScanOpen}
        onClose={() => setIsQuickScanOpen(false)}
      />
    </div>
  );
}
