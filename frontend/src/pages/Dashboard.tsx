import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  HelpCircle,
  FileCheck2,
  Eye,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  PlusCircle,
  Sparkles,
  Search,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ScoreGauge } from "../components/ui/ScoreGauge";
import { AiEngineSimulator } from "../components/visibility/AiEngineSimulator";
import { QuickUrlAuditModal } from "../components/websites/QuickUrlAuditModal";
import {
  fetchWebsites,
  fetchQuestions,
  fetchAudits,
  fetchVisibilityJobs,
  fetchHealth,
  type Website,
  type TargetQuestion,
  type AnswerReadinessAudit,
  type VisibilityJob,
  type HealthResponse,
} from "../services/api";
import { CHART_COLOR_VARS } from "../config/theme";

export function Dashboard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [questions, setQuestions] = useState<TargetQuestion[]>([]);
  const [audits, setAudits] = useState<AnswerReadinessAudit[]>([]);
  const [visibilityJobs, setVisibilityJobs] = useState<VisibilityJob[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [w, q, a, v, h] = await Promise.all([
          fetchWebsites().catch(() => []),
          fetchQuestions().catch(() => []),
          fetchAudits().catch(() => []),
          fetchVisibilityJobs().catch(() => []),
          fetchHealth().catch(() => null),
        ]);
        setWebsites(w);
        setQuestions(q);
        setAudits(a);
        setVisibilityJobs(v);
        setHealth(h);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-72 gap-3">
        <LoadingSpinner className="w-8 h-8 text-primary" />
        <span className="text-xs font-medium text-muted">Loading intelligence workspace...</span>
      </div>
    );
  }

  // Capability A metrics
  const totalAudits = audits.length;
  const numAvgReadiness =
    totalAudits > 0
      ? audits.reduce((acc, curr) => acc + curr.overall_score, 0) / totalAudits
      : 0;
  const avgReadiness = numAvgReadiness.toFixed(1);
  const totalQuestions = questions.length;
  const answeredQuestions = audits.reduce((acc, curr) => acc + curr.answered_count, 0);

  // Capability B metrics
  const totalObservations = visibilityJobs.reduce((acc, curr) => acc + curr.total_questions, 0);
  const totalBrandMentions = visibilityJobs.reduce((acc, curr) => acc + curr.brand_mentions_count, 0);
  const totalCitations = visibilityJobs.reduce((acc, curr) => acc + curr.citations_count, 0);
  const totalCompetitorMentions = visibilityJobs.reduce(
    (acc, curr) => acc + curr.competitor_mentions_count,
    0
  );

  const readinessData = audits.slice(0, 6).map((a) => {
    const site = websites.find((w) => w.id === a.website_id);
    return {
      name: site?.name || a.website_id.slice(0, 6),
      score: a.overall_score,
      answered: a.answered_count,
      unanswered: a.unanswered_count,
    };
  });

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3" /> AI Search Visibility 2.0
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Platform Overview</h1>
          <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
            Separated auditing for Website Answer-Readiness and AI Search Visibility.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsQuickScanOpen(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Search className="w-3.5 h-3.5 text-primary" /> Quick Scan URL
          </Button>
          <Link to="/websites">
            <Button variant="secondary" className="flex items-center gap-1.5 text-xs">
              <Globe className="w-3.5 h-3.5" /> Manage Sites
            </Button>
          </Link>
          <Link to="/audits">
            <Button variant="primary" className="flex items-center gap-1.5 text-xs shadow-sm">
              <PlusCircle className="w-3.5 h-3.5" /> Start Audit
            </Button>
          </Link>
        </div>
      </div>

      {/* Backend Status Notice */}
      {health && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-border bg-surface text-xs shadow-sm">
          <div className="flex items-center gap-2 text-muted">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>
              Backend API: <b className="text-text">{health.version}</b>
            </span>
            <span className="text-border">•</span>
            <span>
              Database: <b className="text-success">{health.database.toUpperCase()}</b>
            </span>
            <span className="text-border">•</span>
            <span className="text-success flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> CORS Active
            </span>
          </div>
          <span className="text-muted text-[11px] font-medium">
            Strict Separation: Content Readiness vs Search Observations
          </span>
        </div>
      )}

      {/* Empty State when no websites registered */}
      {websites.length === 0 ? (
        <Card className="p-10 text-center bg-surface border-border">
          <EmptyState
            title="No Websites Configured Yet"
            description="Register your canonical domain and add target user questions to begin auditing answer readiness."
            icon={<Globe className="w-12 h-12 text-primary" />}
            action={
              <Link to="/websites">
                <Button variant="primary" className="mt-2">
                  Add Your First Website
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          {/* Capability A: Answer-Readiness Metrics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="primary">Capability A</Badge>
                <h2 className="text-lg font-bold text-text">Website Content Answer-Readiness</h2>
              </div>
              <span className="text-xs text-muted font-medium">Deterministic Rule Rubric (0-100)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-surface border-border hover:border-primary/30 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Registered Sites
                  </span>
                  <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Globe className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-text tracking-tight">{websites.length}</div>
                <p className="text-xs text-muted mt-1">Verified canonical domains</p>
              </Card>

              <Card className="p-4 bg-surface border-border hover:border-success/30 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Avg Readiness Score
                  </span>
                  <span className="p-1.5 rounded-lg bg-success/10 text-success">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-text tracking-tight">{avgReadiness} / 100</div>
                <p className="text-xs text-muted mt-1">Content completeness across audits</p>
              </Card>

              <Card className="p-4 bg-surface border-border hover:border-info/30 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Questions Tracked
                  </span>
                  <span className="p-1.5 rounded-lg bg-info/10 text-info">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-text tracking-tight">{totalQuestions}</div>
                <p className="text-xs text-muted mt-1">Target queries categorized</p>
              </Card>

              <Card className="p-4 bg-surface border-border hover:border-primary/30 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Total Audits Run
                  </span>
                  <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-text tracking-tight">{totalAudits}</div>
                <p className="text-xs text-muted mt-1">{answeredQuestions} directly answered</p>
              </Card>
            </div>
          </div>

          {/* Capability B: AI Search Visibility Metrics */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="info">Capability B</Badge>
                <h2 className="text-lg font-bold text-text">
                  AI Search & Engine Visibility (Provider Observations)
                </h2>
              </div>
              <span className="text-xs text-muted font-medium">Independent Search Observations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-surface border-border hover:border-secondary/30 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Queries Observed
                  </span>
                  <span className="p-1.5 rounded-lg bg-secondary/10 text-secondary">
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-text tracking-tight">{totalObservations}</div>
                <p className="text-xs text-muted mt-1">Recorded via search/AI engines</p>
              </Card>

              <Card className="p-4 bg-surface border-border hover:border-primary/30 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Brand Mentions
                  </span>
                  <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Building2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-text tracking-tight">{totalBrandMentions}</div>
                <p className="text-xs text-muted mt-1">Extracted from answer texts</p>
              </Card>

              <Card className="p-4 bg-surface border-border hover:border-accent/30 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Citations Extracted
                  </span>
                  <span className="p-1.5 rounded-lg bg-accent/10 text-accent">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-text tracking-tight">{totalCitations}</div>
                <p className="text-xs text-muted mt-1">Direct source references logged</p>
              </Card>

              <Card className="p-4 bg-surface border-border hover:border-warning/30 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Competitor References
                  </span>
                  <span className="p-1.5 rounded-lg bg-warning/10 text-warning">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-text tracking-tight">
                  {totalCompetitorMentions}
                </div>
                <p className="text-xs text-muted mt-1">Observed in rival query responses</p>
              </Card>
            </div>
          </div>

          {/* Activity Chart & Deep Dive Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <Card className="lg:col-span-2 p-5 bg-surface border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text">Recent Audit Readiness Scores</h3>
                <span className="text-xs text-muted">0-100 Content Completeness</span>
              </div>
              {readinessData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={readinessData}>
                      <XAxis dataKey="name" stroke="currentColor" className="text-muted text-xs" />
                      <YAxis domain={[0, 100]} stroke="currentColor" className="text-muted text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-surface)",
                          borderColor: "var(--color-border)",
                          borderRadius: "0.75rem",
                          color: "var(--color-text)",
                          boxShadow: "var(--shadow-card)",
                        }}
                      />
                      <Bar
                        dataKey="score"
                        fill={CHART_COLOR_VARS[0]}
                        radius={[6, 6, 0, 0]}
                        name="Readiness Score"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-muted text-xs gap-2">
                  <FileCheck2 className="w-8 h-8 opacity-40" />
                  <span>Run your first audit to see activity trends</span>
                </div>
              )}
            </Card>

            <Card className="p-5 bg-surface border-border flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-text mb-1">Quick Action Navigation</h3>
                <p className="text-xs text-muted mb-4">
                  Compare content readiness against competitor coverage and external visibility.
                </p>
                <div className="space-y-2">
                  <Link to="/audits" className="block">
                    <div className="p-3 rounded-lg border border-border hover:bg-background hover:border-primary/30 transition flex items-center justify-between text-xs font-semibold text-text">
                      <span className="flex items-center gap-2">
                        <FileCheck2 className="w-3.5 h-3.5 text-primary" /> Run Answer-Readiness Audit
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted" />
                    </div>
                  </Link>
                  <Link to="/visibility" className="block">
                    <div className="p-3 rounded-lg border border-border hover:bg-background hover:border-secondary/30 transition flex items-center justify-between text-xs font-semibold text-text">
                      <span className="flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-secondary" /> Inspect AI Search Visibility
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted" />
                    </div>
                  </Link>
                  <Link to="/competitors" className="block">
                    <div className="p-3 rounded-lg border border-border hover:bg-background hover:border-warning/30 transition flex items-center justify-between text-xs font-semibold text-text">
                      <span className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-warning" /> Content Gap Analyzer
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted" />
                    </div>
                  </Link>
                  <Link to="/reports" className="block">
                    <div className="p-3 rounded-lg border border-border hover:bg-background hover:border-info/30 transition flex items-center justify-between text-xs font-semibold text-text">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-info" /> Export CSV & PDF Reports
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted" />
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* AI Engine Matrix Component */}
          <AiEngineSimulator />
        </>
      )}

      {/* Quick URL Audit Modal */}
      <QuickUrlAuditModal
        isOpen={isQuickScanOpen}
        onClose={() => setIsQuickScanOpen(false)}
      />
    </div>
  );
}
