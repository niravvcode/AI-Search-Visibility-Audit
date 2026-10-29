import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users2,
  Play,
  ArrowUpRight,
  Sparkles,
  Copy,
  Check,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select, Input, Label } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import {
  fetchWebsites,
  analyzeCompetitor,
  fetchCompetitorFindings,
  type Website,
  type CompetitorFinding,
} from "../services/api";

export function CompetitorView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlWebsiteId = searchParams.get("website_id") || "";

  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>(urlWebsiteId);
  const [competitorDomain, setCompetitorDomain] = useState<string>("");
  const [findings, setFindings] = useState<CompetitorFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [copiedPlan, setCopiedPlan] = useState(false);

  useEffect(() => {
    loadWebsites();
  }, []);

  useEffect(() => {
    if (selectedWebsiteId) {
      loadFindings(selectedWebsiteId);
      const site = websites.find((w) => w.id === selectedWebsiteId);
      if (site && site.competitor_domains && site.competitor_domains.length > 0) {
        setCompetitorDomain(site.competitor_domains[0]);
      }
    }
  }, [selectedWebsiteId, websites]);

  async function loadWebsites() {
    try {
      const siteList = await fetchWebsites();
      setWebsites(siteList);
      if (siteList.length > 0) {
        const activeSite = selectedWebsiteId || siteList[0].id;
        setSelectedWebsiteId(activeSite);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadFindings(siteId: string) {
    try {
      const data = await fetchCompetitorFindings(siteId);
      setFindings(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAnalyze() {
    if (!selectedWebsiteId || !competitorDomain) return;
    setAnalyzing(true);
    try {
      const res = await analyzeCompetitor(selectedWebsiteId, competitorDomain);
      setFindings(res.findings);
    } catch (err: any) {
      alert(`Competitor analysis failed: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setAnalyzing(false);
    }
  }

  const copyStrategyBrief = () => {
    if (findings.length === 0) return;
    const content = `### Competitive Content Strategy & Gap Brief\n**Target Competitor:** ${competitorDomain}\n**Total Gaps Identified:** ${findings.length}\n\n` +
      findings
        .map(
          (f, idx) =>
            `#### ${idx + 1}. ${f.question_text || "Query Gap"}\n` +
            `- **Your Score:** ${f.user_site_score.toFixed(0)}/100 | **Competitor Score:** ${f.competitor_score.toFixed(0)}/100\n` +
            `- **Gap Type:** ${f.gap_type.replace(/_/g, " ").toUpperCase()}\n` +
            `- **Observed Facts:** ${f.observed_facts}\n` +
            `- **Derived Findings:** ${f.derived_findings}\n` +
            (f.ai_suggestions ? `- **Action Plan:** ${f.ai_suggestions}\n` : "")
        )
        .join("\n");
    navigator.clipboard.writeText(content);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Gap Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Competitor Content Gap Analyzer</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Compare target question answer-readiness against competitor pages and detect missing subtopics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {findings.length > 0 && (
            <Button
              variant="secondary"
              onClick={copyStrategyBrief}
              className="text-xs flex items-center gap-1.5"
            >
              {copiedPlan ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" /> Copied Strategy Brief!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Strategy Brief
                </>
              )}
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleAnalyze}
            disabled={analyzing || !selectedWebsiteId || !competitorDomain}
            className="flex items-center gap-1.5 text-xs shadow-sm"
          >
            {analyzing ? <LoadingSpinner className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{analyzing ? "Analyzing Content..." : "Analyze Competitor Gaps"}</span>
          </Button>
        </div>
      </div>

      {/* Selector Card */}
      <Card className="p-4 bg-surface border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Your Website</Label>
            <Select
              value={selectedWebsiteId}
              onChange={(e) => {
                setSelectedWebsiteId(e.target.value);
                setSearchParams({ website_id: e.target.value });
              }}
            >
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.domain})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Competitor Domain</Label>
            <Input
              placeholder="e.g. competitor.com"
              value={competitorDomain}
              onChange={(e) => setCompetitorDomain(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Findings List */}
      {loading ? (
        <div className="flex flex-col justify-center items-center p-12 gap-3">
          <LoadingSpinner className="w-8 h-8 text-primary" />
          <span className="text-xs text-muted">Scanning competitor coverage...</span>
        </div>
      ) : findings.length === 0 ? (
        <Card className="p-8 text-center bg-surface border-border">
          <EmptyState
            title="No Competitor Gap Findings Recorded"
            description="Enter a competitor domain above and click 'Analyze Competitor Gaps' to compare content coverage."
            icon={<Users2 className="w-10 h-10 text-primary" />}
            action={
              <Button variant="primary" onClick={handleAnalyze} disabled={analyzing || !competitorDomain}>
                Run Initial Analysis
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">
              Content Gap Findings for <span className="text-primary">{competitorDomain || "Competitor"}</span> ({findings.length})
            </h2>
            <span className="text-xs text-muted font-medium">Fact-based derivation</span>
          </div>

          <div className="space-y-4">
            {findings.map((f) => {
              const diff = Math.round(f.user_site_score - f.competitor_score);
              return (
                <Card key={f.id} className="p-5 bg-surface border-border hover:border-primary/20 transition shadow-sm space-y-3.5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-text">{f.question_text || "Target Question"}</h3>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted">
                          Your Site: <b className="text-text">{f.user_site_score.toFixed(0)}/100</b>
                        </span>
                        <span className="text-border">•</span>
                        <span className="text-muted">
                          Competitor: <b className="text-text">{f.competitor_score.toFixed(0)}/100</b>
                        </span>
                        <span className="text-border">•</span>
                        <span
                          className={`font-semibold flex items-center gap-0.5 ${
                            diff >= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {diff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {diff >= 0 ? `+${diff}` : diff} pts
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          f.gap_type === "unanswered_by_user"
                            ? "danger"
                            : f.gap_type === "competitor_superior"
                            ? "warning"
                            : "info"
                        }
                      >
                        {f.gap_type.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">Effort: {f.estimated_effort}</Badge>
                    </div>
                  </div>

                  {/* 3 Clearly Separated Layers */}
                  <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
                    <div className="p-3 rounded-lg bg-background border border-border">
                      <span className="font-semibold text-text block mb-1">1. Observed Facts:</span>
                      <p className="text-muted leading-relaxed">{f.observed_facts}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-background border border-border">
                      <span className="font-semibold text-text block mb-1">2. Derived Findings:</span>
                      <p className="text-muted leading-relaxed">{f.derived_findings}</p>
                    </div>

                    {f.ai_suggestions && (
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        <span className="font-semibold block mb-1 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> 3. Recommended Action (for human review):
                        </span>
                        <p className="leading-relaxed">{f.ai_suggestions}</p>
                      </div>
                    )}
                  </div>

                  {/* Competitor URLs */}
                  {f.competitor_urls.length > 0 && (
                    <div className="pt-1 text-xs text-muted flex items-center gap-2">
                      <span>Competitor Source:</span>
                      <a
                        href={f.competitor_urls[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-mono truncate"
                      >
                        <span>{f.competitor_urls[0]}</span>
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
