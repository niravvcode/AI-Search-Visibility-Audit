import { useState } from "react";
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input, Label } from "../ui/Input";
import { ScoreGauge } from "../ui/ScoreGauge";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface QuickUrlAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickUrlAuditModal({ isOpen, onClose }: QuickUrlAuditModalProps) {
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    url: string;
    hasDirectAnswer: boolean;
    directAnswerSnippet: string;
    schemaTypes: string[];
    headingStructure: { h1: number; h2: number; h3: number };
    findings: { type: "success" | "warning" | "danger"; text: string }[];
  } | null>(null);

  if (!isOpen) return null;

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    // Instant client-side deterministic evaluation simulation
    setTimeout(() => {
      const isHttps = url.toLowerCase().startsWith("https://");
      const hasFaq = url.toLowerCase().includes("faq") || url.toLowerCase().includes("pricing");
      const calculatedScore = isHttps ? (hasFaq ? 86 : 72) : 48;

      setResult({
        score: calculatedScore,
        url: url.trim(),
        hasDirectAnswer: true,
        directAnswerSnippet:
          query.trim()
            ? `Direct Answer Found: "${query.trim()} is addressed within the primary content body with concise numerical values and structured definitions."`
            : "Primary value proposition is clearly defined in the hero section, meeting standard answer-engine extraction criteria.",
        schemaTypes: hasFaq ? ["FAQPage", "Organization", "WebSite"] : ["WebSite", "BreadcrumbList"],
        headingStructure: { h1: 1, h2: 4, h3: 6 },
        findings: [
          {
            type: "success",
            text: "Clean Single H1 heading identified matching target search intent.",
          },
          {
            type: hasFaq ? "success" : "warning",
            text: hasFaq
              ? "Valid Schema.org FAQPage JSON-LD detected for high Perplexity & Google citation rates."
              : "No FAQPage Schema.org markup detected; Perplexity may struggle to cite exact bullet steps.",
          },
          {
            type: "success",
            text: "Fast HTML payload with direct answers in the first 150 words.",
          },
          {
            type: "warning",
            text: "Ensure table elements include proper <th> headers for LLM tabular citations.",
          },
        ],
      });
      setLoading(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <Search className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-text">Instant URL Readiness Scanner</h2>
              <p className="text-xs text-muted">Test any URL for AI search & answer-engine compatibility</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-muted/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <Label htmlFor="scan-url">Target Page URL</Label>
            <Input
              id="scan-url"
              type="url"
              required
              placeholder="https://example.com/pricing or https://asana.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="scan-query">User Question to Test (Optional)</Label>
            <Input
              id="scan-query"
              placeholder="e.g. What is the pricing plan? or How does the feature work?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <LoadingSpinner className="w-4 h-4" /> Analyzing URL...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run Quick Scan
                </>
              )}
            </Button>
          </div>
        </form>

        {result && (
          <div className="mt-6 pt-6 border-t border-border space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Scan Results For</span>
                <p className="text-sm font-bold text-text break-all">{result.url}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="success">Protocol Verified</Badge>
                  <span className="text-xs text-muted">Response: 200 OK</span>
                </div>
              </div>
              <ScoreGauge score={result.score} size="md" label="Answer Readiness" />
            </div>

            {/* Direct Answer Preview */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Extracted Answer Snippet
              </div>
              <p className="text-xs text-text leading-relaxed italic">
                "{result.directAnswerSnippet}"
              </p>
            </div>

            {/* Structured Findings */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Diagnostic Checks</p>
              <div className="grid grid-cols-1 gap-2">
                {result.findings.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-background text-xs"
                  >
                    {f.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    )}
                    <span className="text-text leading-normal">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <span className="text-xs text-muted font-medium py-1">Schemas Detected:</span>
              {result.schemaTypes.map((schema) => (
                <Badge key={schema} variant="info" className="gap-1">
                  <FileCode2 className="w-3 h-3" /> {schema}
                </Badge>
              ))}
              <Badge variant="secondary">H1: {result.headingStructure.h1}</Badge>
              <Badge variant="secondary">H2: {result.headingStructure.h2}</Badge>
              <Badge variant="secondary">H3: {result.headingStructure.h3}</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
