import { useState } from "react";
import { Sparkles, CheckCircle2, TrendingUp, Copy, Check } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ScoreGauge } from "../ui/ScoreGauge";

interface OptimizationOption {
  id: string;
  title: string;
  description: string;
  points: number;
  category: "Schema" | "Direct Answer" | "Structure" | "Authority";
}

const OPTIMIZATIONS: OptimizationOption[] = [
  {
    id: "direct_answer",
    title: "Direct Answer in first 80 words",
    description: "Provide a 40-60 word factual summary directly answering the user query above the fold.",
    points: 20,
    category: "Direct Answer",
  },
  {
    id: "schema_jsonld",
    title: "Implement FAQPage or Article Schema.org JSON-LD",
    description: "Structured data allows Perplexity, ChatGPT, and Google to parse entities without hallucination.",
    points: 15,
    category: "Schema",
  },
  {
    id: "heading_structure",
    title: "Strict Single H1 & Logical H2/H3 Hierarchy",
    description: "Eliminate duplicate H1 tags and organize sections into query-intent matching headings.",
    points: 10,
    category: "Structure",
  },
  {
    id: "structured_table",
    title: "Structured Comparison Table / Bullet Steps",
    description: "AI engines cite tabular and bulleted data at a 3.4x higher rate than prose.",
    points: 12,
    category: "Structure",
  },
  {
    id: "freshness_citation",
    title: "Authoritative Statistics & Verified Date Stamps",
    description: "Add dateModified, author credentials, and verifiable numeric data points.",
    points: 8,
    category: "Authority",
  },
];

interface ScoreSimulatorProps {
  currentScore?: number;
}

export function ScoreSimulator({ currentScore = 52 }: ScoreSimulatorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "direct_answer",
    "schema_jsonld",
  ]);
  const [copied, setCopied] = useState(false);

  const toggleOption = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addedPoints = selectedIds.reduce((sum, id) => {
    const opt = OPTIMIZATIONS.find((o) => o.id === id);
    return sum + (opt?.points || 0);
  }, 0);

  const projectedScore = Math.min(100, Math.round(currentScore + addedPoints));
  const estimatedCitationLikelihood = Math.min(
    95,
    Math.round(projectedScore * 0.92)
  );

  const copyPlan = () => {
    const text = selectedIds
      .map((id) => {
        const o = OPTIMIZATIONS.find((opt) => opt.id === id);
        return `- [ ] **${o?.title}** (+${o?.points} pts): ${o?.description}`;
      })
      .join("\n");
    const summary = `### AI Search Readiness Action Plan\n**Baseline Score:** ${currentScore}/100\n**Target Score:** ${projectedScore}/100 (+${addedPoints} pts)\n**Projected Citation Rate:** ~${estimatedCitationLikelihood}%\n\n${text}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 bg-surface border-border">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-text">
              Interactive "What-If" Score Simulator & ROI Calculator
            </h3>
            <Badge variant="primary">Interactive</Badge>
          </div>
          <p className="text-xs text-muted mt-1">
            Toggle technical optimizations to simulate how your Answer-Readiness Score and AI citation likelihood will improve.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={copyPlan}
          className="text-xs flex items-center gap-1.5 shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-success" /> Copied Action Plan!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy Implementation Plan
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Optimizations Checklist */}
        <div className="lg:col-span-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Select Recommended Optimizations:
          </p>
          <div className="space-y-2">
            {OPTIMIZATIONS.map((opt) => {
              const active = selectedIds.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    active
                      ? "bg-primary/5 border-primary/40 shadow-sm"
                      : "bg-background border-border hover:border-muted/40"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition ${
                      active
                        ? "bg-primary border-primary text-primary-contrast"
                        : "border-muted bg-surface"
                    }`}
                  >
                    {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-text">
                        {opt.title}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          active
                            ? "bg-success/10 text-success border border-success/20"
                            : "bg-muted/10 text-muted"
                        }`}
                      >
                        +{opt.points} pts
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Projected Score & Metrics */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-xl bg-background border border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Simulated Outcome
          </p>
          <ScoreGauge score={projectedScore} size="lg" label="Projected Score" />

          <div className="w-full mt-5 space-y-2.5 pt-4 border-t border-border">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">Baseline Score:</span>
              <span className="font-semibold text-text">{currentScore} / 100</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">Total Potential Gain:</span>
              <span className="font-bold text-success flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +{addedPoints} points
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">Estimated AI Citation Rate:</span>
              <span className="font-bold text-primary">~{estimatedCitationLikelihood}%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
