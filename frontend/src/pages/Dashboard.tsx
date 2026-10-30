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
  Layers,
  Activity,
  Zap,
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
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <LoadingSpinner className="w-8 h-8 text-primary" />
        <span className="text-xs font-semibold text-muted tracking-wide uppercase">
          Initializing Intelligence Workspace...
        </span>
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Executive Hero Banner & Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 md:p-8 shadow-card">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/25">
                <Sparkles className="w-3.5 h-3.5" /> Intelligence Suite
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/25">
                <Activity className="w-3.5 h-3.5" /> Dual Protocol Verified
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text">
              Platform Overview
            </h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Separated auditing for Website Answer-Readiness and AI Search Visibility across LLM answer engines and search engines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={() => setIsQuickScanOpen(true)}
              className="text-xs flex items-center gap-2 py-2 px-3.5"
            >
              <Search className="w-3.5 h-3.5 text-primary" />
              <span>Quick Scan URL</span>
            </Button>
            <Link to="/websites">
              <Button variant="secondary" className="text-xs flex items-center gap-2 py-2 px-3.5">
                <Globe className="w-3.5 h-3.5 text-secondary" />
                <span>Manage Sites</span>
              </Button>
            </Link>
            <Link to="/audits">
              <Button variant="primary" className="text-xs flex items-center gap-2 py-2 px-4 shadow-sm">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Start New Audit</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Backend Status Bar */}
      {health && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-surface text-xs shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-muted">
            <div className="flex items-center gap-1.5 font-bold text-text">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Backend API {health.version}</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1.5">
              <span>Database:</span>
              <span className="font-bold text-success capitalize">{health.database}</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1 text-success font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CORS Policy Connected</span>
            </div>
          </div>
          <div className="text-[11px] font-medium text-muted">
            Strict Separation: Content Readiness vs Search Observations
          </div>
        </div>
      )}

      {/* Empty State when no websites registered */}
      {websites.length === 0 ? (
        <Card className="p-10 text-center bg-surface border-border">
          <EmptyState
            title="No Websites Configured Yet"
            description="Register your canonical domain and add target user questions to begin auditing answer readiness."
            icon={<Globe className="w-10 h-10 text-primary" />}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2.5">
                <Badge variant="primary" dot>Capability A</Badge>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-text">
                  Website Content Answer-Readiness
                </h2>
              </div>
              <span className="text-xs text-muted font-medium">Deterministic Rule Rubric (0-100)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card hoverable className="p-5 bg-surface border-border">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Registered Sites
                  </span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-text tracking-tight">
                  {websites.length}
                </div>
                <p className="text-xs text-muted mt-1 font-medium">Verified canonical domains</p>
              </Card>

              <Card hoverable className="p-5 bg-surface border-border">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Avg Readiness Score
                  </span>
                  <div className="p-2 rounded-xl bg-success/10 text-success">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-text tracking-tight">
                  {avgReadiness} <span className="text-sm font-normal text-muted">/ 100</span>
                </div>
                <p className="text-xs text-muted mt-1 font-medium">Content completeness across audits</p>
              </Card>

              <Card hoverable className="p-5 bg-surface border-border">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Questions Tracked
                  </span>
                  <div className="p-2 rounded-xl bg-info/10 text-info">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-text tracking-tight">
                  {totalQuestions}
                </div>
                <p className="text-xs text-muted mt-1 font-medium">Target user queries categorized</p>
              </Card>

              <Card hoverable className="p-5 bg-surface border-border">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Total Audits Run
                  </span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-text tracking-tight">
                  {totalAudits}
                </div>
                <p className="text-xs text-muted mt-1 font-medium">
                  {answeredQuestions} questions directly answered
                </p>
              </Card>
            </div>
          </div>

          {/* Capability B: AI Search Visibility Metrics */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2.5">
                <Badge variant="info" dot>Capability B</Badge>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-text">
                  AI Search & Engine Visibility (Provider Observations)
                </h2>
              </div>
              <span className="text-xs text-muted font-medium">Independent Search Observations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card hoverable className="p-5 bg-surface border-border">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Queries Observed
                  </span>
                  <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-text tracking-tight">
                  {totalObservations}
                </div>
                <p className="text-xs text-muted mt-1 font-medium">Recorded via search/AI engines</p>
              </Card>

              <Card hoverable className="p-5 bg-surface border-border">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Brand Mentions
                  </span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-text tracking-tight">
                  {totalBrandMentions}
                </div>
                <p className="text-xs text-muted mt-1 font-medium">Documented in answer texts</p>
              </Card>

              <Card hoverable className="p-5 bg-surface border-border">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Citations Extracted
                  </span>
                  <div className="p-2 rounded-xl bg-accent/10 text-accent">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-text tracking-tight">
                  {totalCitations}
                </div>
                <p className="text-xs text-muted mt-1 font-medium">Direct source references logged</p>
              </Card>

              <Card hoverable className="p-5 bg-surface border-border">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Competitor References
                  </span>
                  <div className="p-2 rounded-xl bg-warning/10 text-warning">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-text tracking-tight">
                  {totalCompetitorMentions}
                </div>
                <p className="text-xs text-muted mt-1 font-medium">Observed in rival query responses</p>
              </Card>
            </div>
          </div>

          {/* Activity Chart & Deep Dive Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <Card className="lg:col-span-2 p-6 bg-surface border-border shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-text">Recent Audit Readiness Scores</h3>
                  <p className="text-xs text-muted mt-0.5">Content completeness score breakdown (0-100)</p>
                </div>
                <Badge variant="primary">Latest Audits</Badge>
              </div>

              {readinessData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={readinessData}>
                      <XAxis
                        dataKey="name"
                        stroke="currentColor"
                        className="text-muted text-xs font-medium"
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="currentColor"
                        className="text-muted text-xs font-medium"
                        tickLine={false}
                      />
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

            <Card className="p-6 bg-surface border-border flex flex-col justify-between shadow-card">
              <div>
                <h3 className="text-base font-bold text-text mb-1">Quick Action Hub</h3>
                <p className="text-xs text-muted mb-5 leading-relaxed">
                  Navigate directly to specific audit capabilities, competitor benchmarks, and reports.
                </p>

                <div className="space-y-2.5">
                  <Link to="/audits" className="block group">
                    <div className="p-3 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-primary/40 transition-all flex items-center justify-between text-xs font-semibold text-text shadow-sm">
                      <span className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <FileCheck2 className="w-4 h-4" />
                        </span>
                        <span>Answer-Readiness Audit</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>

                  <Link to="/visibility" className="block group">
                    <div className="p-3 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-secondary/40 transition-all flex items-center justify-between text-xs font-semibold text-text shadow-sm">
                      <span className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-secondary/10 text-secondary">
                          <Eye className="w-4 h-4" />
                        </span>
                        <span>AI Search Visibility</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-secondary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>

                  <Link to="/competitors" className="block group">
                    <div className="p-3 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-warning/40 transition-all flex items-center justify-between text-xs font-semibold text-text shadow-sm">
                      <span className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-warning/10 text-warning">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <span>Competitor Content Gaps</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-warning group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>

                  <Link to="/reports" className="block group">
                    <div className="p-3 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-info/40 transition-all flex items-center justify-between text-xs font-semibold text-text shadow-sm">
                      <span className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-info/10 text-info">
                          <TrendingUp className="w-4 h-4" />
                        </span>
                        <span>Export CSV &amp; PDF Reports</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-info group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* AI Engine Matrix & Comparison Component */}
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
