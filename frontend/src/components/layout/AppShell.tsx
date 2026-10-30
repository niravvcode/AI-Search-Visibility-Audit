import { NavLink, Outlet, useLocation } from "react-router-dom";
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
  Command,
  Menu,
  X,
  Radio,
} from "lucide-react";
import { useState, useEffect } from "react";
import { applyTheme, getInitialTheme, THEME_STORAGE_KEY, type Theme } from "../../config/theme";
import { Button } from "../ui/Button";
import { QuickUrlAuditModal } from "../websites/QuickUrlAuditModal";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const navSections: { section: string; items: NavItem[] }[] = [
  {
    section: "CORE PLATFORM",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/websites", label: "Websites", icon: Globe },
      { to: "/questions", label: "Questions", icon: HelpCircle },
    ],
  },
  {
    section: "AUDIT PROTOCOLS",
    items: [
      { to: "/audits", label: "Answer Readiness", icon: FileCheck2, badge: "Cap A" },
      { to: "/visibility", label: "AI Search Visibility", icon: Eye, badge: "Cap B" },
      { to: "/competitors", label: "Competitor Gaps", icon: Users2 },
    ],
  },
  {
    section: "EXECUTIVE SUITE",
    items: [
      { to: "/reports", label: "Reports & Exports", icon: FileText },
    ],
  },
];

export function AppShell() {
  const [theme, setTheme] = useState<Theme>(() => {
    const t = getInitialTheme();
    applyTheme(t);
    return t;
  });
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  // Keyboard shortcut: Cmd+K or Ctrl+K triggers Quick Scan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsQuickScanOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Derive active page title
  const currentNav = navSections.flatMap((s) => s.items).find((item) =>
    item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)
  );

  return (
    <div className="flex min-h-screen bg-background text-text transition-colors duration-200">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Modern Desktop & Mobile Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-72 shrink-0 border-r border-border bg-surface flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-elevated" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto p-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 mb-2 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-contrast font-extrabold text-base shadow-sm ring-4 ring-primary/10">
                <span>AS</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-text">AI Search</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    2.0
                  </span>
                </div>
                <span className="text-[11px] text-muted font-medium">Visibility &amp; Audit Engine</span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface-hover"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Scanner Action Trigger */}
          <button
            onClick={() => setIsQuickScanOpen(true)}
            className="w-full mt-2 mb-6 flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-border bg-surface-hover hover:border-primary/40 hover:shadow-sm text-xs font-semibold text-text transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-contrast transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span>Quick URL Scanner</span>
            </div>
            <span className="flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded border border-border bg-surface text-muted">
              <Command className="w-3 h-3" />K
            </span>
          </button>

          {/* Navigation Sections */}
          <nav aria-label="Main" className="flex-1 space-y-6">
            {navSections.map(({ section, items }) => (
              <div key={section} className="space-y-1">
                <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-muted/70">
                  {section}
                </div>
                <div className="space-y-0.5">
                  {items.map(({ to, label, icon: Icon, badge }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === "/"}
                      className={({ isActive }) =>
                        `group relative flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                          isActive
                            ? "bg-primary text-primary-contrast shadow-sm font-bold"
                            : "text-muted hover:text-text hover:bg-surface-hover"
                        }`
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                        <span className="truncate">{label}</span>
                      </div>
                      {badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface text-muted border border-border">
                          {badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer: System Status */}
          <div className="pt-4 mt-auto border-t border-border-subtle">
            <div className="p-3.5 rounded-xl border border-border bg-background space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-text">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  <span>Engine Online</span>
                </div>
                <span className="text-[10px] font-mono text-muted">v1.0.0</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Capability A &amp; B protocols strictly separated with zero mock live data.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main App Content Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-md px-6 transition-colors">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-muted hover:text-text rounded-lg hover:bg-surface-hover"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-muted hidden sm:inline">AI Search Platform</span>
              <span className="text-border hidden sm:inline">/</span>
              <span className="font-bold text-text flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                <span>Console</span>
              </span>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQuickScanOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface hover:bg-surface-hover text-muted hover:text-text transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-primary" />
              <span>Quick URL Scan</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-background">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle Button */}
            <Button
              variant="secondary"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-xl hover:shadow-sm"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Quick URL Scanner Modal */}
      <QuickUrlAuditModal
        isOpen={isQuickScanOpen}
        onClose={() => setIsQuickScanOpen(false)}
      />
    </div>
  );
}
